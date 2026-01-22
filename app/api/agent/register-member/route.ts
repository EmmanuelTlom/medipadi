import { NextRequest, NextResponse } from "next/server";
import { ZodError, ZodIssue } from "zod";

import { auth } from "@clerk/nextjs/server";
import { createClerkUser } from "@/lib/server.utils";
import crypto from "crypto";
import { db } from "@/lib/prisma";
import { registerMemberSchema } from "@/lib/validations/member";

export async function POST (request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify the user is an agent
        const agent = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!agent || agent.role !== "AGENT") {
            return NextResponse.json(
                { error: "Only agents can register members" },
                { status: 403 }
            );
        }

        // Parse and validate request body with Zod
        const body = await request.json();
        const validatedData = registerMemberSchema.parse(body);

        const {
            firstName,
            lastName,
            email,
            phoneNumber,
            planType,
            subscriptionCost,
        } = validatedData;

        // Fetch the subscription plan from database
        const subscriptionPlan = await db.subscriptionPlan.findUnique({
            where: { slug: planType, isActive: true },
        });

        if (!subscriptionPlan) {
            return NextResponse.json(
                { error: "Invalid or inactive subscription plan" },
                { status: 400 }
            );
        }

        // Verify the cost matches the plan price
        if (subscriptionCost !== subscriptionPlan.price) {
            return NextResponse.json(
                { error: "Subscription cost mismatch" },
                { status: 400 }
            );
        }

        // Check agent wallet balance
        if (agent.walletBalance < subscriptionCost) {
            return NextResponse.json(
                { error: "Insufficient wallet balance" },
                { status: 400 }
            );
        }

        // Generate a secure random password for the new member
        const randomPassword = crypto.randomBytes(12).toString("base64").slice(0, 16);

        // Create user in Clerk using the utility function
        const clerkUser = await createClerkUser({
            emailAddress: [email],
            password: randomPassword,
            firstName,
            lastName,
            // phoneNumber,
            publicMetadata: {
                role: "PATIENT",
            },
        });

        // Generate membership ID
        const membershipId = `MED${Date.now()}${Math.floor(Math.random() * 1000)}`;

        // Calculate subscription end date based on plan duration
        const subscriptionEnd = new Date();
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + subscriptionPlan.duration);

        // Create user in database with initial credits from plan
        const newMember = await db.user.create({
            data: {
                clerkUserId: clerkUser.id,
                email,
                firstName,
                lastName,
                phoneNumber,
                role: "PATIENT",
                membershipId,
                subscriptionEnd,
                credits: subscriptionPlan.credits,
                lastCreditAllocation: new Date(),
                agentId: agent.id,
                planId: subscriptionPlan.id,
            },
        });

        // Record credit allocation transaction
        await db.creditTransaction.create({
            data: {
                userId: newMember.id,
                amount: subscriptionPlan.credits,
                type: "CREDIT_PURCHASE",
                packageId: subscriptionPlan.id,
            },
        });

        // Deduct from agent wallet and record transaction
        const balanceBefore = agent.walletBalance;
        const balanceAfter = balanceBefore - subscriptionCost;

        await db.$transaction([
            db.user.update({
                where: { id: agent.id },
                data: {
                    walletBalance: balanceAfter,
                },
            }),
            db.walletTransaction.create({
                data: {
                    userId: agent.id,
                    amount: -subscriptionCost,
                    type: "MEMBER_REGISTRATION",
                    description: `Member registration for ${firstName} ${lastName} (${planType} plan)`,
                    balanceBefore,
                    balanceAfter,
                },
            }),
        ]);

        // TODO: Send email to member with login credentials (randomPassword)
        // TODO: Send SMS notification

        return NextResponse.json({
            success: true,
            member: {
                id: newMember.id,
                email: newMember.email,
                name: `${newMember.firstName} ${newMember.lastName}`,
                membershipId: newMember.membershipId,
                credits: newMember.credits,
                subscriptionEnd: newMember.subscriptionEnd,
            },
            message: "Member registered successfully. Login credentials have been sent to the member's email.",
        });
    } catch (error) {
        console.error("Error registering member:", error);

        // Handle Zod validation errors
        if (error instanceof ZodError) {
            // the errors propertyis ann object of {key:value} pairs
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

        // Handle specific Clerk errors
        if (error.errors && error.errors[0]?.code === "form_identifier_exists") {
            return NextResponse.json(
                { error: "Email or phone number already exists", },
                { status: 422 }
            );
        }

        return NextResponse.json(
            { error: error.message || "Failed to register member" },
            { status: 400 }
        );
    }
}
