import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/prisma';

export async function GET (_: Request, { params }: { params: { id?: string[] } }) {
    let userId: string | undefined = params.id?.[0] ?? undefined

    try {
        if (!userId) {
            ({ userId } = await auth());
        }

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await db.user.findFirst({
            where: {
                OR: [
                    {
                        clerkUserId: userId,
                    },
                    {
                        id: userId,
                    },
                ],
            },
        })

        return NextResponse.json({ data });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch user profile' },
            { status: 500 }
        );
    }
}
