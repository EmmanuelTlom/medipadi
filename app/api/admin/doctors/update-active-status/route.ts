import { ZodError, ZodIssue } from 'zod';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { updateDoctorActiveStatus } from '@/actions/admin';
import { updateDoctorActiveStatusSchema } from '@/lib/validations/admin';

export async function POST (request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        // Support both 'isActive' and 'suspend' for backward compatibility
        const validationBody = body.suspend !== undefined
            ? { doctorId: body.doctorId, isActive: !body.suspend }
            : body;
        const { doctorId, isActive } = updateDoctorActiveStatusSchema.parse(validationBody);

        // Create FormData to match the server action signature
        const formData = new FormData();
        formData.append('doctorId', doctorId);
        formData.append('suspend', (!isActive).toString());

        const result = await updateDoctorActiveStatus(formData);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Update doctor active status error:', error);

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
            { error: error.message || 'Failed to update doctor active status' },
            { status: 400 }
        );
    }
}
