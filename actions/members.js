"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

/**
 * Get all members
 */
export async function getAllMembers () {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    try {
        const members = await db.user.findMany({
            where: {
                role: "PATIENT",
            },
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                credits: true,
                createdAt: true,
                lastCreditAllocation: true,
            },
        });

        return { members };
    } catch (error) {
        console.error("Failed to fetch members:", error);
        throw new Error("Failed to fetch members");
    }
}

/**
 * Get all agents
 */
export async function getAllAgents () {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    try {
        const agents = await db.user.findMany({
            where: {
                role: "AGENT",
            },
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                walletBalance: true,
                createdAt: true,
            },
        });

        return { agents };
    } catch (error) {
        console.error("Failed to fetch agents:", error);
        throw new Error("Failed to fetch agents");
    }
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats () {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    try {
        const [
            totalMembers,
            activeMembers,
            totalDoctors,
            verifiedDoctors,
            totalAppointments,
            completedAppointments,
            pendingClaims,
        ] = await Promise.all([
            db.user.count({ where: { role: "PATIENT" } }),
            db.user.count({
                where: { role: "PATIENT", credits: { gt: 0 } },
            }),
            db.user.count({ where: { role: "DOCTOR" } }),
            db.user.count({
                where: { role: "DOCTOR", verificationStatus: "VERIFIED" },
            }),
            db.appointment.count(),
            db.appointment.count({ where: { status: "COMPLETED" } }),
            db.claim?.count({ where: { status: "PENDING" } }) || 0,
        ]);

        return {
            totalMembers,
            activeMembers,
            totalDoctors,
            verifiedDoctors,
            totalAppointments,
            completedAppointments,
            pendingClaims,
        };
    } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        throw new Error("Failed to fetch dashboard stats");
    }
}
