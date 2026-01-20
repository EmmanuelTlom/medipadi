import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET (request) {
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
                { error: "Only providers can view claims" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const providerId = searchParams.get("providerId");

        // Fetch all claims for this provider
        const claims = await db.claim.findMany({
            where: {
                providerId: providerId || provider.id,
            },
            include: {
                member: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        membershipId: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(claims);
    } catch (error) {
        console.error("Error fetching claims:", error);
        return NextResponse.json(
            { error: "Failed to fetch claims" },
            { status: 500 }
        );
    }
}
