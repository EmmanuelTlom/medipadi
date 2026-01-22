"use server";

import { ZodError, ZodIssue } from "zod";
import { addDays, addMinutes, endOfDay, format, isBefore } from "date-fns";
import { bookAppointmentSchema, cancelAppointmentSchema, completeAppointmentSchema } from "@/lib/validations/appointment";

import { Auth } from "@vonage/auth";
import { ValidationException } from "@/lib/Exceptions/ValidationException";
import { Vonage } from "@vonage/server-sdk";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { deductCreditsForAppointment } from "@/actions/credits";
import { revalidatePath } from "next/cache";

// Initialize Vonage Video API client
const options = {};
const credentials = new Auth({
  applicationId: process.env.NEXT_PUBLIC_VONAGE_APPLICATION_ID,
  privateKey: process.env.VONAGE_PRIVATE_KEY,
});
const vonage = new Vonage(credentials, options);

/**
 * Book a new appointment with a doctor
 */
export async function bookAppointment (formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Get the patient user
    const patient = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "PATIENT",
      },
    });

    if (!patient) {
      throw new Error("Patient not found");
    }

    // Parse and validate form data
    const rawData = {
      doctorId: formData.get("doctorId"),
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
      description: formData.get("description") || null,
    };

    const validatedData = bookAppointmentSchema.parse(rawData);
    const { doctorId, startTime, endTime, description: patientDescription } = validatedData;

    // Check if the doctor exists and is verified
    const doctor = await db.user.findUnique({
      where: {
        id: doctorId,
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
      },
    });

    if (!doctor) {
      throw new Error("Doctor not found or not verified");
    }

    // Check if the patient has enough credits (2 credits per appointment)
    if (patient.credits < 2) {
      throw new Error("Insufficient credits to book an appointment");
    }

    // Check if the requested time slot is available
    const overlappingAppointment = await db.appointment.findFirst({
      where: {
        doctorId: doctorId,
        status: "SCHEDULED",
        OR: [
          {
            // New appointment starts during an existing appointment
            startTime: {
              lte: startTime,
            },
            endTime: {
              gt: startTime,
            },
          },
          {
            // New appointment ends during an existing appointment
            startTime: {
              lt: endTime,
            },
            endTime: {
              gte: endTime,
            },
          },
          {
            // New appointment completely overlaps an existing appointment
            startTime: {
              gte: startTime,
            },
            endTime: {
              lte: endTime,
            },
          },
        ],
      },
    });

    if (overlappingAppointment) {
      throw new Error("This time slot is already booked");
    }

    // Create a new Vonage Video API session
    const sessionId = await createVideoSession();

    // Deduct credits from patient and add to doctor
    const { success, error } = await deductCreditsForAppointment(
      patient.id,
      doctor.id
    );

    if (!success) {
      throw new Error(error || "Failed to deduct credits");
    }

    // Create the appointment with the video session ID
    const appointment = await db.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        startTime,
        endTime,
        patientDescription,
        status: "SCHEDULED",
        videoSessionId: sessionId, // Store the Vonage session ID
      },
    });

    revalidatePath("/appointments");
    return { success: true, appointment: appointment };
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors = error.errors.reduce((acc, curr) => {
        return Object.assign(acc, { [curr.path[0]]: [curr] });
      }, {} as Record<string, ZodIssue[]>);
      throw new ValidationException(`Validation error`, fieldErrors);
    }

    throw new Error("Failed to book appointment:" + (error as Error).message);
  }
}

/**
 * Generate a Vonage Video API session
 */
async function createVideoSession () {
  try {
    const session = await vonage.video.createSession({ mediaMode: "routed" as any });
    return session.sessionId;
  } catch (error) {
    throw new Error("Failed to create video session: " + (error as Error).message);
  }
}

/**
 * Generate a token for a video session
 * This will be called when either doctor or patient is about to join the call
 */
export async function generateVideoToken (formData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const appointmentId = formData.get("appointmentId");

    if (!appointmentId) {
      throw new Error("Appointment ID is required");
    }

    // Find the appointment and verify the user is part of it
    const appointment = await db.appointment.findUnique({
      where: {
        id: appointmentId,
      },
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    // Verify the user is either the doctor or the patient for this appointment
    if (appointment.doctorId !== user.id && appointment.patientId !== user.id) {
      throw new Error("You are not authorized to join this call");
    }

    // Verify the appointment is scheduled
    if (appointment.status !== "SCHEDULED") {
      throw new Error("This appointment is not currently scheduled");
    }

    // Verify the appointment is within a valid time range (e.g., starting 5 minutes before scheduled time)
    const now = new Date();
    const appointmentTime = new Date(appointment.startTime);
    const timeDifference = (appointmentTime.getTime() - now.getTime()) / (1000 * 60); // difference in minutes

    if (timeDifference > 30) {
      throw new Error(
        "The call will be available 30 minutes before the scheduled time"
      );
    }

    // Generate a token for the video session
    // Token expires 2 hours after the appointment start time
    const appointmentEndTime = new Date(appointment.endTime);
    const expirationTime =
      Math.floor(appointmentEndTime.getTime() / 1000) + 60 * 60; // 1 hour after end time

    // Use user's name and role as connection data
    const connectionData = JSON.stringify({
      name: user.firstName + " " + user.lastName,
      role: user.role,
      userId: user.id,
    });

    // Generate the token with appropriate role and expiration
    const token = vonage.video.generateClientToken(appointment.videoSessionId, {
      role: "publisher", // Both doctor and patient can publish streams
      expireTime: expirationTime,
      data: connectionData,
    });

    // Update the appointment with the token
    await db.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        videoSessionToken: token,
      },
    });

    return {
      success: true,
      videoSessionId: appointment.videoSessionId,
      token: token,
    };
  } catch (error) {
    console.error("Failed to generate video token:", error);
    throw new Error("Failed to generate video token:" + error.message);
  }
}

/**
 * Get doctor by ID
 */
export async function getDoctorById (doctorId) {
  try {
    const doctor = await db.user.findUnique({
      where: {
        id: doctorId,
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
      },
    });

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    return { doctor };
  } catch (error) {
    console.error("Failed to fetch doctor:", error);
    throw new Error("Failed to fetch doctor details");
  }
}

/**
 * Get available time slots for booking for the next 7 days
 */
export async function getAvailableTimeSlots (doctorId: string) {
  try {
    // Validate doctor existence and verification
    const doctor = await db.user.findUnique({
      where: {
        id: doctorId,
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
      },
    });

    if (!doctor) {
      throw new Error("Doctor not found or not verified");
    }

    // Fetch weekly availability schedule
    const weeklyAvailability = await db.weeklyAvailability.findMany({
      where: {
        doctorId: doctor.id,
        isActive: true,
      },
      orderBy: {
        dayOfWeek: "asc",
      },
    });

    // If no availability is set, return empty slots instead of throwing error
    if (!weeklyAvailability || weeklyAvailability.length === 0) {
      return { days: [] };
    }

    // Get the next 7 days
    const now = new Date();
    const days = Array.from({ length: 7 }, (_, i) => addDays(now, i));

    // Fetch existing appointments for the doctor over the next 7 days
    const lastDay = endOfDay(days[6]);
    const existingAppointments = await db.appointment.findMany({
      where: {
        doctorId: doctor.id,
        status: "SCHEDULED",
        startTime: {
          lte: lastDay,
        },
      },
    });

    const availableSlotsByDay = {};

    // For each of the next 7 days, generate available slots
    for (const day of days) {
      const dayString = format(day, "yyyy-MM-dd");
      const dayOfWeek = day.getDay(); // 0=Sunday, 1=Monday, etc.
      availableSlotsByDay[dayString] = [];

      // Find availability for this day of week
      const dayAvailability = weeklyAvailability.find(
        (avail) => avail.dayOfWeek === dayOfWeek
      );

      if (!dayAvailability) {
        continue; // No availability set for this day
      }

      // Parse time strings (HH:mm format)
      const [startHour, startMin] = dayAvailability.startTime.split(":").map(Number);
      const [endHour, endMin] = dayAvailability.endTime.split(":").map(Number);

      // Create start and end times for this specific day
      const availabilityStart = new Date(day);
      availabilityStart.setHours(startHour, startMin, 0, 0);

      const availabilityEnd = new Date(day);
      availabilityEnd.setHours(endHour, endMin, 0, 0);

      let current = new Date(availabilityStart);
      const end = new Date(availabilityEnd);

      while (
        isBefore(addMinutes(current, 30), end) ||
        +addMinutes(current, 30) === +end
      ) {
        const next = addMinutes(current, 30);

        // Skip past slots
        if (isBefore(current, now)) {
          current = next;
          continue;
        }

        const overlaps = existingAppointments.some((appointment) => {
          const aStart = new Date(appointment.startTime);
          const aEnd = new Date(appointment.endTime);

          return (
            (current >= aStart && current < aEnd) ||
            (next > aStart && next <= aEnd) ||
            (current <= aStart && next >= aEnd)
          );
        });

        if (!overlaps) {
          availableSlotsByDay[dayString].push({
            startTime: current.toISOString(),
            endTime: next.toISOString(),
            formatted: `${format(current, "h:mm a")} - ${format(
              next,
              "h:mm a"
            )}`,
            day: format(current, "EEEE, MMMM d"),
          });
        }

        current = next;
      }
    }

    // Convert to array of slots grouped by day for easier consumption by the UI
    const result = Object.entries(availableSlotsByDay).map(([date, slots]) => ({
      date,
      displayDate:
        (slots as any[]).length > 0
          ? (slots as any[])[0].day
          : format(new Date(date), "EEEE, MMMM d"),
      slots,
    }));

    return { days: result };
  } catch (error) {
    console.error("Failed to fetch available slots:", error);
    throw new Error("Failed to fetch available time slots: " + error.message);
  }
}
