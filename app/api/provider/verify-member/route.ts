import { NextRequest, NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET (request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const caller = await db.user.findUnique({
            where: { clerkUserId: userId },
            select: { role: true },
        });

        if (!caller || !['PROVIDER', 'ADMIN'].includes(caller.role)) {
            return NextResponse.json(
                { error: "Only providers can verify members" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const membershipId = searchParams.get("membershipId");

        if (!membershipId) {
            return NextResponse.json({ error: "Membership ID is required" }, { status: 400 });
        }

        const member = await db.user.findFirst({
            where: { membershipId, role: "PATIENT" },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                membershipId: true,
                subscriptionEnd: true,
                lastCreditAllocation: true,
                createdAt: true,
                profilePhotoUrl: true,
                plan: { select: { name: true, slug: true, duration: true } },
            },
        });

        if (!member) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        const isActive = !!member.subscriptionEnd && new Date(member.subscriptionEnd) > new Date();

        // 7-day waiting period check
        const subscriptionStart = member.lastCreditAllocation ?? member.createdAt;
        const daysSince = (Date.now() - new Date(subscriptionStart).getTime()) / (1000 * 60 * 60 * 24);
        const inWaitingPeriod = daysSince < 7;
        const waitingDaysLeft = inWaitingPeriod ? Math.ceil(7 - daysSince) : 0;

        // 1-claim-per-month check
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const claimedThisMonth = await db.claim.findFirst({
            where: {
                memberId: member.id,
                status: { not: "REJECTED" },
                createdAt: { gte: monthStart, lt: monthEnd },
            },
            select: { id: true },
        });

        let canClaim = isActive && !inWaitingPeriod && !claimedThisMonth;
        let claimBlockReason: string | null = null;

        if (!isActive) {
            claimBlockReason = "Subscription has expired";
        } else if (inWaitingPeriod) {
            claimBlockReason = `Within 7-day waiting period — ${waitingDaysLeft} day${waitingDaysLeft !== 1 ? 's' : ''} remaining`;
        } else if (claimedThisMonth) {
            claimBlockReason = "Member has already used their claim for this month";
        }

        return NextResponse.json({
            id: member.id,
            name: `${member.firstName} ${member.lastName}`,
            firstName: member.firstName,
            lastName: member.lastName,
            email: member.email,
            phoneNumber: member.phoneNumber,
            membershipId: member.membershipId,
            subscriptionEnd: member.subscriptionEnd,
            profilePhotoUrl: member.profilePhotoUrl,
            planName: member.plan?.name ?? null,
            planSlug: member.plan?.slug ?? null,
            isActive,
            canClaim,
            claimBlockReason,
        });
    } catch (error) {
        console.error("Error verifying member:", error);
        return NextResponse.json({ error: "Failed to verify member" }, { status: 500 });
    }
}
