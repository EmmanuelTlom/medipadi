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
    if (!userId) throw new Error("Unauthorized");

    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const [
            totalMembers,
            activeMembers,
            expiredMembers,
            newMembersThisMonth,
            newMembersLastMonth,
            totalDoctors,
            verifiedDoctors,
            pendingDoctors,
            totalAppointments,
            completedAppointments,
            cancelledAppointments,
            pendingClaims,
            approvedClaims,
            rejectedClaims,
            approvedClaimsAmount,
            pendingClaimsAmount,
            totalAgents,
            totalProviders,
            agentWalletTotal,
            plans,
        ] = await Promise.all([
            db.user.count({ where: { role: "PATIENT" } }),
            db.user.count({ where: { role: "PATIENT", credits: { gt: 0 } } }),
            db.user.count({ where: { role: "PATIENT", credits: 0 } }),
            db.user.count({ where: { role: "PATIENT", createdAt: { gte: thirtyDaysAgo } } }),
            db.user.count({ where: { role: "PATIENT", createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
            db.user.count({ where: { role: "DOCTOR" } }),
            db.user.count({ where: { role: "DOCTOR", verificationStatus: "VERIFIED" } }),
            db.user.count({ where: { role: "DOCTOR", verificationStatus: "PENDING" } }),
            db.appointment.count(),
            db.appointment.count({ where: { status: "COMPLETED" } }),
            db.appointment.count({ where: { status: "CANCELLED" } }),
            db.claim.count({ where: { status: "PENDING" } }),
            db.claim.count({ where: { status: "APPROVED" } }),
            db.claim.count({ where: { status: "REJECTED" } }),
            db.claim.aggregate({ where: { status: "APPROVED" }, _sum: { amount: true } }),
            db.claim.aggregate({ where: { status: "PENDING" }, _sum: { amount: true } }),
            db.user.count({ where: { role: "AGENT" } }),
            db.user.count({ where: { role: "PROVIDER" } }),
            db.user.aggregate({ where: { role: "AGENT" }, _sum: { walletBalance: true } }),
            db.subscriptionPlan.findMany({ where: { isActive: true }, select: { name: true, id: true } }),
        ]);

        // Members per plan
        const membersPerPlan = await Promise.all(
            plans.map(plan =>
                db.user.count({ where: { role: "PATIENT", planId: plan.id } })
                    .then(count => ({ plan: plan.name, count }))
            )
        );

        // Registrations by agents (top 5)
        const topAgents = await db.user.findMany({
            where: { role: "AGENT" },
            select: {
                firstName: true,
                lastName: true,
                _count: { select: { registeredMembers: true } },
            },
            orderBy: { registeredMembers: { _count: "desc" } },
            take: 5,
        });

        // Recent claims (last 30 days)
        const recentClaimsCount = await db.claim.count({
            where: { createdAt: { gte: thirtyDaysAgo } },
        });

        const memberGrowthPct = newMembersLastMonth > 0
            ? Math.round(((newMembersThisMonth - newMembersLastMonth) / newMembersLastMonth) * 100)
            : newMembersThisMonth > 0 ? 100 : 0;

        return {
            // Members
            totalMembers,
            activeMembers,
            expiredMembers,
            newMembersThisMonth,
            memberGrowthPct,
            // Doctors
            totalDoctors,
            verifiedDoctors,
            pendingDoctors,
            // Appointments
            totalAppointments,
            completedAppointments,
            cancelledAppointments,
            // Claims
            pendingClaims,
            approvedClaims,
            rejectedClaims,
            approvedClaimsAmount: approvedClaimsAmount._sum.amount || 0,
            pendingClaimsAmount: pendingClaimsAmount._sum.amount || 0,
            recentClaimsCount,
            // Agents & Providers
            totalAgents,
            totalProviders,
            agentWalletTotal: agentWalletTotal._sum.walletBalance || 0,
            // Breakdown
            membersPerPlan,
            topAgents: topAgents.map(a => ({
                name: `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim() || 'Agent',
                registrations: a._count.registeredMembers,
            })),
        };
    } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        throw new Error("Failed to fetch dashboard stats");
    }
}
