import { auth, clerkClient } from '@clerk/nextjs/server';

import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

// GET all subscription plans (including inactive)
export async function GET () {
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

        const plans = await db.subscriptionPlan.findMany({
            orderBy: { duration: 'asc' },
        });

        return NextResponse.json(plans);
    } catch (error) {
        console.error('Failed to fetch subscription plans:', error);
        return NextResponse.json(
            { error: 'Failed to fetch subscription plans' },
            { status: 500 }
        );
    }
}

// CREATE new subscription plan
export async function POST (request: Request) {
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

        // Validate required fields
        if (!name || !slug || !description || price === undefined || !credits || !duration) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if slug already exists
        const existingPlan = await db.subscriptionPlan.findUnique({
            where: { slug },
        });

        if (existingPlan) {
            return NextResponse.json(
                { error: 'Plan with this slug already exists' },
                { status: 400 }
            );
        }

        const plan = await db.subscriptionPlan.create({
            data: {
                name,
                slug,
                description,
                price,
                credits,
                duration,
                isActive: isActive ?? true,
            },
        });

        return NextResponse.json(plan, { status: 201 });
    } catch (error) {
        console.error('Failed to create subscription plan:', error);
        return NextResponse.json(
            { error: 'Failed to create subscription plan' },
            { status: 500 }
        );
    }
}
