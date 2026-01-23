import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/prisma';
import { processSubscription, processFundWallet } from '@/lib/payments';

// GET single transaction
export async function GET (
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
            select: { role: true },
        });

        if (user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const transaction = await db.transaction.findUnique({
            where: { id: params.id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        credits: true,
                        walletBalance: true,
                    },
                },
            },
        });

        if (!transaction) {
            return NextResponse.json(
                { error: 'Transaction not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(transaction);
    } catch (error) {
        console.error('Failed to fetch transaction:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transaction' },
            { status: 500 }
        );
    }
}

// PATCH transaction (retry, refund, etc.)
export async function PATCH (
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
            select: { role: true, id: true },
        });

        if (user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { action, notes } = await request.json();

        const transaction = await db.transaction.findUnique({
            where: { id: params.id },
            include: { user: true },
        });

        if (!transaction) {
            return NextResponse.json(
                { error: 'Transaction not found' },
                { status: 404 }
            );
        }

        let updatedTransaction;

        switch (action) {
            case 'retry':
                if (transaction.serviceProvided) {
                    return NextResponse.json(
                        { error: 'Service already provided for this transaction' },
                        { status: 400 }
                    );
                }

                // Retry providing the service
                try {
                    if (transaction.type === 'SUBSCRIPTION') {
                        const metadata = transaction.metadata as any;
                        await processSubscription(
                            metadata.planId,
                            transaction.userId,
                            { amount: transaction.amount * 100 } as any
                        );
                    } else if (transaction.type === 'WALLET_FUNDING') {
                        await processFundWallet(
                            transaction.userId,
                            { amount: transaction.amount * 100 } as any
                        );
                    }

                    updatedTransaction = await db.transaction.update({
                        where: { id: params.id },
                        data: {
                            serviceProvided: true,
                            serviceProvidedAt: new Date(),
                            completedAt: new Date(),
                            status: 'SUCCESS',
                            notes: notes || 'Service provided after manual retry',
                        },
                    });
                } catch (error) {
                    updatedTransaction = await db.transaction.update({
                        where: { id: params.id },
                        data: {
                            webhookAttempts: { increment: 1 },
                            lastWebhookAt: new Date(),
                            webhookError: (error as Error).message,
                            notes: notes || 'Retry failed',
                        },
                    });
                }
                break;

            case 'refund':
                updatedTransaction = await db.transaction.update({
                    where: { id: params.id },
                    data: {
                        status: 'REFUNDED',
                        notes: notes || 'Refunded by admin',
                    },
                });
                break;

            case 'mark_disputed':
                updatedTransaction = await db.transaction.update({
                    where: { id: params.id },
                    data: {
                        status: 'DISPUTED',
                        notes: notes || 'Marked as disputed by admin',
                    },
                });
                break;

            case 'update_notes':
                updatedTransaction = await db.transaction.update({
                    where: { id: params.id },
                    data: { notes },
                });
                break;

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }

        return NextResponse.json(updatedTransaction);
    } catch (error) {
        console.error('Failed to update transaction:', error);
        return NextResponse.json(
            { error: 'Failed to update transaction' },
            { status: 500 }
        );
    }
}
