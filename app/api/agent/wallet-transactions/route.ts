import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/prisma';

export async function GET (request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify the user is an agent
        const agent = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!agent || agent.role !== 'AGENT') {
            return NextResponse.json(
                { error: 'Only agents can view wallet transactions' },
                { status: 403 }
            );
        }

        const [data, meta] = await db.walletTransaction.paginate({
            where: {
                userId: agent.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
        }).withPages({
            limit: request.nextUrl.searchParams.get("limit")
                ? parseInt(request.nextUrl.searchParams.get("limit") as string, 10)
                : 10,
            page: request.nextUrl.searchParams.get("page")
                ? parseInt(request.nextUrl.searchParams.get("page") as string, 10)
                : 1,
        });

        return NextResponse.json({ data, meta, balance: agent.walletBalance });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch wallet transactions' },
            { status: 500 }
        );
    }
}
