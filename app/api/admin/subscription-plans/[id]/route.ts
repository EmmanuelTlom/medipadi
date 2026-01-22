import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/prisma';

// UPDATE subscription plan
export async function PUT (
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
            select: { role: true },
        });

        if (user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { name, slug, description, price, credits, duration, isActive } = body;

        // Check if plan exists
        const existingPlan = await db.subscriptionPlan.findUnique({
            where: { id: params.id },
        });

        if (!existingPlan) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        // If slug is being changed, check if new slug already exists
        if (slug !== existingPlan.slug) {
            const slugExists = await db.subscriptionPlan.findUnique({
                where: { slug },
            });

            if (slugExists) {
                return NextResponse.json(
                    { error: 'Plan with this slug already exists' },
                    { status: 400 }
                );
            }
        }

        const updatedPlan = await db.subscriptionPlan.update({
            where: { id: params.id },
            data: {
                name,
                slug,
                description,
                price,
                credits,
                duration,
                isActive,
            },
        });

        return NextResponse.json(updatedPlan);
    } catch (error) {
        console.error('Failed to update subscription plan:', error);
        return NextResponse.json(
            { error: 'Failed to update subscription plan' },
            { status: 500 }
        );
    }
}

// DELETE subscription plan
export async function DELETE (
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
            select: { role: true },
        });

        if (user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Check if plan exists
        const plan = await db.subscriptionPlan.findUnique({
            where: { id: params.id },
        });

        if (!plan) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        // Check if any users are using this plan
        const usersWithPlan = await db.user.count({
            where: { planId: params.id },
        });

        if (usersWithPlan > 0) {
            return NextResponse.json(
                {
                    error: `Cannot delete plan. ${usersWithPlan} user(s) are currently subscribed to this plan.`,
                },
                { status: 400 }
            );
        }

        await db.subscriptionPlan.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete subscription plan:', error);
        return NextResponse.json(
            { error: 'Failed to delete subscription plan' },
            { status: 500 }
        );
    }
}
