'use server';

import { DedicatedAccountData } from 'paystack-sdk/dist/dedicated/interface';
import { auth } from '@clerk/nextjs/server';
import { createVirtualAccount, processVirtualAccountPayment } from '@/lib/payments';
import { db } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Request a Paystack virtual account for the authenticated member.
 * Optionally accepts a phone number to save before creating the account.
 */
export async function requestVirtualAccount(phoneOverride?: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error('Unauthorized. Please sign in.');
    }

    try {
        // If a phone was provided, persist it first so it's available below
        if (phoneOverride?.trim()) {
            await db.user.update({
                where: { clerkUserId: userId },
                data: { phoneNumber: phoneOverride.trim() },
            });
        }

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                name: true,
                role: true,
                phoneNumber: true,
                virtualAccountNumber: true,
                virtualAccountBank: true,
                virtualAccountName: true,
                paystackCustomerId: true,
                virtualAccountActive: true,
                virtualAccountCreatedAt: true,
            },
        });

        if (!user) {
            throw new Error('User not found');
        }

        if (user.role !== 'PATIENT') {
            throw new Error('Only members can request virtual accounts.');
        }

        if (!user.email) {
            throw new Error('Email is required to create a virtual account.');
        }

        if (!user.phoneNumber) {
            throw new Error('Phone number is required to create a virtual account. Please add your phone number first.');
        }

        // Return early if account already exists
        if (user.virtualAccountActive && user.virtualAccountNumber) {
            return {
                success: true,
                alreadyExists: true,
                data: {
                    accountNumber: user.virtualAccountNumber,
                    bankName: user.virtualAccountBank,
                    accountName: user.virtualAccountName,
                    customerCode: user.paystackCustomerId,
                    createdAt: user.virtualAccountCreatedAt,
                },
                message: 'You already have an active virtual account.',
            };
        }

        const firstName = user.firstName || user.name?.split(' ')[0] || 'Member';
        const lastName = user.lastName || user.name?.split(' ').slice(1).join(' ') || '';

        const { data, message, success } = (await createVirtualAccount(
            user.id,
            user.email,
            firstName,
            lastName,
            user.phoneNumber
        )) as {
            data: DedicatedAccountData;
            success: boolean;
            message: string;
        };

        if (!success) {
            throw new Error('Failed to create virtual account: ' + message);
        }

        return {
            success,
            alreadyExists: false,
            data: {
                accountNumber: data.account_number,
                bankName: (data as any).bank_name || data.bank?.name,
                accountName: data.account_name,
                customerCode: (data as any).customer_code || data.customer?.customer_code,
            },
            message,
        };
    } catch (error) {
        throw new Error(
            'Failed to request virtual account: ' + (error as Error).message
        );
    }
}

/**
 * Get the virtual account details for the authenticated member
 */
export async function getVirtualAccount() {
    const { userId } = await auth();

    if (!userId) {
        throw new Error('Unauthorized. Please sign in.');
    }

    try {
        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
            select: {
                virtualAccountNumber: true,
                virtualAccountBank: true,
                virtualAccountName: true,
                paystackCustomerId: true,
                virtualAccountActive: true,
                virtualAccountCreatedAt: true,
            },
        });

        if (!user) throw new Error('User not found');

        if (!user.virtualAccountActive || !user.virtualAccountNumber) {
            return {
                success: false,
                hasAccount: false,
                data: null,
                message: 'No virtual account found.',
            };
        }

        return {
            success: true,
            hasAccount: true,
            data: {
                accountNumber: user.virtualAccountNumber,
                bankName: user.virtualAccountBank,
                accountName: user.virtualAccountName,
                customerCode: user.paystackCustomerId,
                createdAt: user.virtualAccountCreatedAt,
            },
            message: 'Virtual account retrieved successfully.',
        };
    } catch (error) {
        throw new Error(
            'Failed to get virtual account: ' + (error as Error).message
        );
    }
}

/**
 * Manually poll Paystack for unprocessed payments on the user's virtual account.
 * Useful when webhooks can't reach the server (e.g. local development).
 */
export async function checkPendingPayments() {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
        select: { id: true, paystackCustomerId: true },
    });

    if (!user?.paystackCustomerId) {
        return { processed: 0, message: 'No virtual account found.' };
    }

    const res = await fetch(
        `https://api.paystack.co/transaction?customer=${user.paystackCustomerId}&status=success&perPage=20`,
        {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        },
    );

    const data = await res.json();
    if (!data.status) return { processed: 0, message: 'Unable to reach Paystack.' };

    let processed = 0;
    for (const txn of data.data ?? []) {
        if (txn.channel !== 'dedicated_nuban') continue;

        const existing = await db.transaction.findUnique({
            where: { reference: txn.reference },
        });
        if (existing?.serviceProvided) continue;

        try {
            await processVirtualAccountPayment(user.id, txn.amount, txn.reference);
            processed++;
        } catch (err) {
            console.error('checkPendingPayments: failed to process', txn.reference, err);
        }
    }

    if (processed > 0) revalidatePath('/member');

    return {
        processed,
        message: processed > 0
            ? `${processed} payment${processed > 1 ? 's' : ''} applied to your wallet.`
            : 'No new payments found.',
    };
}
