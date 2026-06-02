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

        const statusParam = request.nextUrl.searchParams.get("status");
        const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
        const statusFilter = statusParam && validStatuses.includes(statusParam)
            ? { status: statusParam as any }
            : {};

        const [data, meta] = await db.claim.paginate({
            where: statusFilter,
            include: {
                member: {
                    select: { id: true, firstName: true, lastName: true, email: true, membershipId: true },
                },
                provider: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
            },
            orderBy: { createdAt: "desc" },
        }).withPages({
            includePageCount: true,
            limit: parseInt(request.nextUrl.searchParams.get("limit") ?? '20', 10),
            page:  parseInt(request.nextUrl.searchParams.get("page")  ?? '1',  10),
        });

        const [pending, approved, rejected, pendingAmount, approvedAmount] = await Promise.all([
            db.claim.count({ where: { status: 'PENDING' } }),
            db.claim.count({ where: { status: 'APPROVED' } }),
            db.claim.count({ where: { status: 'REJECTED' } }),
            db.claim.aggregate({ where: { status: 'PENDING' },  _sum: { amount: true } }),
            db.claim.aggregate({ where: { status: 'APPROVED' }, _sum: { amount: true } }),
        ]);

        return NextResponse.json({
            data, meta,
            pending, approved, rejected,
            pendingAmount:  pendingAmount._sum.amount  ?? 0,
            approvedAmount: approvedAmount._sum.amount ?? 0,
        });
    } catch (error) {
        console.error("Error fetching all claims:", error);
        return NextResponse.json(
            { error: "Failed to fetch claims" },
            { status: 500 }
        );
    }
}
