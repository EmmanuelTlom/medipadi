import { NextRequest, NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET (request: NextRequest) {
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
        const [data, meta] = await db.claim.paginate({
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
            where: {
                status: 'PENDING',
                providerId: providerId || provider.id
            }
        })

        const processed = await db.claim.count({
            where: {
                status: { not: 'PENDING' },
                providerId: providerId || provider.id
            }
        })

        const approvedAmount = (await db.claim.aggregate({
            where: {
                providerId: providerId || provider.id,
                status: 'APPROVED'
            },
            _sum: {
                amount: true
            }
        }))._sum.amount || 0;

        return NextResponse.json({ data, meta, pending, processed, approvedAmount });
    } catch (error) {
        console.error("Error fetching claims:", error);
        return NextResponse.json(
            { error: "Failed to fetch claims" },
            { status: 500 }
        );
    }
}
