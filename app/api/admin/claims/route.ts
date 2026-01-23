import { NextRequest, NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET (request: NextRequest) {
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
                { error: "Only admins can view all claims" },
                { status: 403 }
            );
        }

        // Fetch all claims with member and provider details
        const [data, meta] = await db.claim.paginate({
            where: request.nextUrl.searchParams.get("status") === 'PENDING'
                ? { status: 'PENDING' }
                : { status: { not: 'PENDING' } },
            include: {
                member: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        membershipId: true,
                    },
                },
                provider: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
            orderBy: [
                { status: "asc" } as const,
                { createdAt: "desc" } as const,
            ],
        }).withPages({
            includePageCount: true,
            limit: request.nextUrl.searchParams.get("limit")
                ? parseInt(request.nextUrl.searchParams.get("limit") as string, 10)
                : 20,
            page: request.nextUrl.searchParams.get("page")
                ? parseInt(request.nextUrl.searchParams.get("page") as string, 10)
                : 1,
        });

        const pending = await db.claim.count({
            where: { status: 'PENDING' }
        })

        const pendingAmount = (await db.claim.aggregate({
            _sum: {
                amount: true,
            },
            where: { status: 'PENDING' }
        }))._sum.amount || 0;

        const processed = await db.claim.count({
            where: { status: { not: 'PENDING' } }
        })

        return NextResponse.json({ data, meta, pending, processed, pendingAmount });
    } catch (error) {
        console.error("Error fetching all claims:", error);
        return NextResponse.json(
            { error: "Failed to fetch claims" },
            { status: 500 }
        );
    }
}
