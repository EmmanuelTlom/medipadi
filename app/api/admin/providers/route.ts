import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const admin = await db.user.findUnique({ where: { clerkUserId: userId } });
        if (!admin || admin.role !== 'ADMIN')
            return NextResponse.json({ error: 'Only admins can view providers' }, { status: 403 });

        const [data, meta] = await db.user.paginate({
            where: { role: 'PROVIDER' },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                name: true,
                email: true,
                phoneNumber: true,
                isActive: true,
                suspendedAt: true,
                suspendedReason: true,
                createdAt: true,
                bankAccountName: true,
                bankName: true,
            },
            orderBy: { createdAt: 'desc' },
        }).withPages({
            includePageCount: true,
            limit: parseInt(request.nextUrl.searchParams.get('limit') ?? '20', 10),
            page:  parseInt(request.nextUrl.searchParams.get('page')  ?? '1',  10),
        });

        return NextResponse.json({ data, meta });
    } catch (error) {
        console.error('Error fetching providers:', error);
        return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 });
    }
}
