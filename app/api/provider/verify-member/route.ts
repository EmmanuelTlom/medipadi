import { NextRequest, NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET (request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const membershipId = searchParams.get("membershipId");

        if (!membershipId) {
            return NextResponse.json(
                { error: "Membership ID is required" },
                { status: 400 }
            );
        }

        // Find member by membership ID
        const member = await db.user.findFirst({
            where: {
                membershipId,
                role: "PATIENT",
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                membershipId: true,
                subscriptionEnd: true,
            },
        });

        if (!member) {
            return NextResponse.json(
                { error: "Member not found" },
                { status: 404 }
            );
        }

        // Check if subscription is active
        const isActive = member.subscriptionEnd && new Date(member.subscriptionEnd) > new Date();

        return NextResponse.json({
            id: member.id,
            name: `${member.firstName} ${member.lastName}`,
            email: member.email,
            firstName: member.firstName,
            lastName: member.lastName,
            phoneNumber: member.phoneNumber,
            membershipId: member.membershipId,
            subscriptionEnd: member.subscriptionEnd,
            isActive,
        });
    } catch (error) {
        console.error("Error verifying member:", error);
        return NextResponse.json(
            { error: "Failed to verify member" },
            { status: 500 }
        );
    }
}
