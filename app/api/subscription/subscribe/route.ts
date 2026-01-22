import { initializePaystackPayment } from "@/lib/payments";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/actions/onboarding";
import { verifyPaystackTransaction } from "@/lib/payments";
import { db } from "@/lib/prisma";

export async function POST (request: NextRequest) {
    try {
        const { amount, email, metadata, callback_url } = await request.json();

        const { data } = await initializePaystackPayment({
            amount,
            email,
            metadata,
            callback_url
        });

        return NextResponse.json({ data });
    } catch (error) {
        return NextResponse.json(
            { error: "Unable to initialize subscription: " + error.message },
            { status: 402 }
        );
    }
}

export async function GET (request: NextRequest) {
    try {
        console.log("Verifying subscription...", await request.text());
        const reference = request.nextUrl.searchParams.get("reference")

        const { data, status } = await verifyPaystackTransaction(reference);

        if (!status) {
            return NextResponse.json(
                { error: `Paystack verification failed: ${data.message}` },
                { status: 402 }
            );
        }

        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const plan = await db.subscriptionPlan.findUnique({
            where: { id: String(data.metadata.planId), isActive: true },
        });

        if (!plan) {
            return NextResponse.json(
                {
                    error: "The subscription plan is no longer available or inactive, please choose a different plan and contact support for refund."
                },
                { status: 400 }
            );
        }

        const subscriptionEnd = new Date();
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + plan.duration);

        await db.user.update({
            where: { id: user.id },
            data: {
                planId: plan.id,
                credits: plan.credits,
                subscriptionEnd,
                lastCreditAllocation: new Date(),
            },
        });

        return NextResponse.json({
            data,
            credits: plan.credits,
            subscriptionEnd,
            message: `Subscription successful! You are now subscribed to the ${plan.name} plan.`
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Unable to verify subscription: " + error.message },
            { status: 402 }
        );
    }
}