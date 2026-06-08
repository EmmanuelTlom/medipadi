import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const member = await db.user.findUnique({
            where: { clerkUserId: userId },
            select: { id: true, role: true, profilePhotoUrl: true, membershipId: true, location: true },
        });

        if (!member || member.role !== 'PATIENT') {
            return NextResponse.json({ error: 'Not a member account' }, { status: 403 });
        }

        const { profilePhotoUrl, location } = await request.json();

        const updateData: Record<string, string> = {};

        // Photo can only be set once — changes require admin
        if (profilePhotoUrl && !member.profilePhotoUrl) {
            updateData.profilePhotoUrl = profilePhotoUrl;
        }

        if (location) {
            updateData.location = location;

            // Upgrade membership ID to location-based format
            const locCode = location.trim().slice(0, 3).replace(/[^a-zA-Z]/g, '').toUpperCase().padEnd(3, 'X');
            const locCount = await db.user.count({ where: { location, role: 'PATIENT' } });
            updateData.membershipId = `MED-${locCode}${String(locCount + 1).padStart(3, '0')}`;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ message: 'Nothing to update' });
        }

        await db.user.update({
            where: { id: member.id },
            data: updateData,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Identity update error:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
