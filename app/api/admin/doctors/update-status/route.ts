import { ZodError, ZodIssue } from 'zod';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { updateDoctorStatus } from '@/actions/admin';
import { updateDoctorStatusSchema } from '@/lib/validations/admin';

export async function POST (request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { doctorId, status } = updateDoctorStatusSchema.parse(body);

        // Create FormData to match the server action signature
        const formData = new FormData();
        formData.append('doctorId', doctorId);
        formData.append('status', status);

        const result = await updateDoctorStatus(formData);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Update doctor status error:', error);

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
            { error: error.message || 'Failed to update doctor status' },
            { status: 400 }
        );
    }
}
