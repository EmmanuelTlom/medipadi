import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/prisma';

export async function GET (request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify the user is an admin
        const admin = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!admin || admin.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Only admins can view payouts' },
                { status: 403 }
            );
        }

        const [data, meta] = await db.payout.paginate({
            where: {
                status: 'PROCESSING',
            },
            include: {
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        specialty: true,
                        credits: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
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
        console.error('Error fetching pending payouts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch pending payouts' },
            { status: 500 }
        );
    }
}
