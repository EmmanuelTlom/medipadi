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
                { error: 'Only agents can view their members' },
                { status: 403 }
            );
        }

        const [data, meta] = await db.user.paginate({
            where: {
                role: 'PATIENT',
                agentId: agent.id, // Filter by agent who registered the members
            },
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                membershipId: true,
                subscriptionEnd: true,
                credits: true,
                lastCreditAllocation: true,
                createdAt: true,
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

        return NextResponse.json({ data, meta });
    } catch (error) {
        console.error('Error fetching agent members:', error);
        return NextResponse.json(
            { error: 'Failed to fetch members' },
            { status: 500 }
        );
    }
}
