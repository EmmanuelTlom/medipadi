import { ZodError, ZodIssue } from 'zod';

import { NextResponse } from 'next/server';
import { approvePayout } from '@/actions/admin';
import { approvePayoutSchema } from '@/lib/validations/admin';
import { auth } from '@clerk/nextjs/server';

export async function POST (request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { payoutId } = approvePayoutSchema.parse(body);

        // Create FormData to match the server action signature
        const formData = new FormData();
        formData.append('payoutId', payoutId);

        const result = await approvePayout(formData);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Approve payout error:', error);

        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    errors: error.errors.reduce((acc, curr) => {
                        return Object.assign(acc, { [curr.path[0]]: [curr] });
                    }, {} as Record<string, ZodIssue[]>),
                },
                { status: 422 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Failed to approve payout' },
            { status: 400 }
        );
    }
}
