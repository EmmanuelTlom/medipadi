"use server";

import { UserRole } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { redirectPath } from "@/lib/requests/users";
import { revalidatePath } from "next/cache";

/**
 * Sets the user's role and related information
 */
export async function setUserRole (formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Find user in our database
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found in database");

  const role = formData.get("role") as UserRole;

  if (!role || !["PATIENT", "DOCTOR", "AGENT", "PROVIDER"].includes(role)) {
    throw new Error("Invalid role selection");
  }

  try {
    // For doctor role - need additional information
    if (role === "DOCTOR") {
      const specialty = formData.get("specialty");
      const experience = parseInt(formData.get("experience") as string, 10);
      const credentialUrl = formData.get("credentialUrl");
      const description = formData.get("description");

      // Validate inputs
      if (!specialty || !experience || !credentialUrl || !description) {
        throw new Error("All fields are required");
      }

      await db.user.update({
        where: {
          clerkUserId: userId,
        },
        data: {
          role: "DOCTOR",
          specialty: specialty as string,
          experience,
          credentialUrl: credentialUrl as string,
          description: description as string,
          verificationStatus: "PENDING",
        },
      });

      const weeklySchedules = [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isActive: true }, // Monday
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isActive: true }, // Tuesday
        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isActive: true }, // Wednesday
        { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isActive: true }, // Thursday
        { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isActive: true }, // Friday
      ];

      for (const schedule of weeklySchedules) {
        await db.weeklyAvailability.upsert({
          where: {
            id: `${user.id}-day-${schedule.dayOfWeek}`,
            doctorId: user.id,
          },
          update: {},
          create: {
            id: `${user.id}-day-${schedule.dayOfWeek}`,
            doctorId: user.id,
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            isActive: schedule.isActive,
          },
        });
      }

      revalidatePath("/");
      return { success: true, redirect: redirectPath(role, user.verificationStatus) };
    } else {
      // For other role - simple update
      await db.user.update({
        where: {
          clerkUserId: userId,
        },
        data: {
          role: role,
        },
      });

      revalidatePath("/");
      return { success: true, redirect: redirectPath(role, user.verificationStatus) };

    }
  } catch (error) {
    console.error("Failed to set user role:", error);
    throw new Error(`Failed to update user profile: ${error.message}`);
  }
}

/**
 * Gets the current user's complete profile information
 */
export async function getCurrentUser () {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  try {
    const user = await db.user.findFirst({
      where: {
        OR: [{ clerkUserId: userId }, { id: userId }],
      },
    });

    return user;
  } catch (error) {
    console.error("Failed to get user information:", error);
    return null;
  }
}
