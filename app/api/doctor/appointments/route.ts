import { NextRequest, NextResponse } from "next/server";
import { ZodError, ZodIssue } from "zod";

import { appointmentQuerySchema } from "@/lib/validations/appointment";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET (request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get the doctor user
        const doctor = await db.user.findUnique({
            where: {
                clerkUserId: userId,
                role: "DOCTOR",
            },
        });

        if (!doctor) {
            return NextResponse.json(
                { error: "Doctor not found" },
                { status: 404 }
            );
        }

        // Parse and validate query parameters
        const { searchParams } = new URL(request.url);
        const queryParams = {
            page: searchParams.get("page") || "1",
            limit: searchParams.get("limit") || "10",
            status: searchParams.get("status") || undefined,
        };

        const validatedParams = appointmentQuerySchema.parse(queryParams);

        // Calculate pagination
        const skip = (validatedParams.page - 1) * validatedParams.limit;

        // Build where clause
        const whereClause: any = {
            doctorId: doctor.id,
        };

        if (validatedParams.status) {
            whereClause.status = validatedParams.status;
        } else {
            // Default to SCHEDULED appointments only
            whereClause.status = "SCHEDULED";
        }

        // Fetch appointments with pagination
        const [appointments, total] = await Promise.all([
            db.appointment.findMany({
                where: whereClause,
                include: {
                    patient: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            imageUrl: true,
                        },
                    },
                },
                orderBy: {
                    startTime: "asc",
                },
                skip,
                take: validatedParams.limit,
            }),
            db.appointment.count({ where: whereClause }),
        ]);

        return NextResponse.json({
            data: appointments,
            meta: {
                total,
                page: validatedParams.page,
                limit: validatedParams.limit,
                totalPages: Math.ceil(total / validatedParams.limit),
            },
        });
    } catch (error) {
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
            { error: "Failed to fetch appointments" },
            { status: 400 }
        );
    }
}
