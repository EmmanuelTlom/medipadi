import { NextRequest, NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { submitClaim } from "@/actions/claims";

export async function POST (request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify the user is a provider
        const provider = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!provider || provider.role !== "PROVIDER") {
            return NextResponse.json(
                { error: "Only providers can submit claims" },
                { status: 403 }
            );
        }

        const { memberId, amount, description, serviceDate } = await request.json();

        if (!memberId || !amount || amount <= 0) {
            return NextResponse.json(
                { error: "Invalid claim details" },
                { status: 400 }
            );
        }

        const data = await submitClaim(
            provider.id,
            memberId,
            amount,
            description,
            serviceDate
        );

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        return NextResponse.json(
            { error: error.message || "Failed to submit claim" },
            { status: 500 }
        );
    }
}
