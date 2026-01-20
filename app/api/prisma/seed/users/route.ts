import { NextRequest, NextResponse } from 'next/server'

import { createClerkUser } from '@/lib/server.utils';

export async function POST (request: NextRequest) {
    try {
        // const users = [];
        const users = await createClerkUser(await request.json())

        return NextResponse.json(
            { message: 'Database seeded successfully', data: users },
            { status: 201 }
        );
    } catch (e: any) {
        return NextResponse.json(
            {
                error: e.errors?.[0].longMessage ?? e.message,
                status: 500,
            },
        );
    }
}