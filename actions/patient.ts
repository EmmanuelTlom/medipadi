import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

/**
 * Get all appointments for the authenticated patient
 */
export async function getPatientAppointments () {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "PATIENT",
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new Error("Patient not found");
    }

    const appointments = await db.appointment.findMany({
      where: {
        patientId: user.id,
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            specialty: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
      take: 15,
    });

    return { appointments };
  } catch (error) {
    return { error: "Failed to fetch appointments" };
  }
}
