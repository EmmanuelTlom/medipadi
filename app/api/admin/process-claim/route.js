import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { processClaim } from "@/actions/claims";

export async function POST (request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify the user is an admin
        const admin = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!admin || admin.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Only admins can process claims" },
                { status: 403 }
            );
        }

        const { claimId, status, adminNotes } = await request.json();

        if (!claimId || !["APPROVED", "REJECTED"].includes(status)) {
            return NextResponse.json(
                { error: "Invalid claim ID or status" },
                { status: 400 }
            );
        }

        const claim = await processClaim(claimId, status, adminNotes);

        return NextResponse.json({
            success: true,
            claim,
        });
    } catch (error) {
        console.error("Error processing claim:", error);
        return NextResponse.json(
            { error: error.message || "Failed to process claim" },
            { status: 500 }
        );
    }
}
