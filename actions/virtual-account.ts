'use server';

import { DedicatedAccountData } from 'paystack-sdk/dist/dedicated/interface';
import { auth } from '@clerk/nextjs/server';
import { createVirtualAccount, processVirtualAccountPayment } from '@/lib/payments';
import { db } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Diagnostic: shows DB state and raw Paystack API response.
 * Remove after debugging.
 */
export async function debugVirtualAccountState() {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
        select: { id: true, email: true, virtualAccountNumber: true, paystackCustomerId: true, walletBalance: true },
    });

    if (!user) throw new Error('User not found');

    const customerParam = user.paystackCustomerId ? `&customer=${user.paystackCustomerId}` : '';
    const res = await fetch(
        `https://api.paystack.co/transaction?status=success&perPage=20${customerParam}`,
        {
            headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
            cache: 'no-store',
        },
    );
    const data = await res.json();

    // Also try WITHOUT customer filter to detect key mismatch issues
    const resAll = await fetch(
        `https://api.paystack.co/transaction?status=success&perPage=20`,
        {
            headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
            cache: 'no-store',
        },
    );
    const dataAll = await resAll.json();

    const mapTxn = (t: any) => ({
        reference: t.reference,
        amount: t.amount,
        channel: t.channel,
        customer_code: t.customer?.customer_code,
        auth_account_number: t.authorization?.account_number,
        receiver_bank_account_number: t.authorization?.receiver_bank_account_number,
        dedicated_account_number: t.dedicated_account?.account_number,
    });

    const txns = (data.data ?? []).map(mapTxn);
    const txnsAll = (dataAll.data ?? []).map(mapTxn);

    return {
        db: {
            walletBalance: user.walletBalance,
            virtualAccountNumber: user.virtualAccountNumber,
            paystackCustomerId: user.paystackCustomerId,
            email: user.email,
        },
        with_customer_filter: { status: data.status, total: txns.length, transactions: txns },
        without_customer_filter: { status: dataAll.status, total: txnsAll.length, transactions: txnsAll },
    };
}

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
 *
 * Matching strategy (Paystack transaction list API differences from webhook events):
 * - `dedicated_account` object is NOT included in list responses (only in webhooks)
 * - `authorization.account_number` = sender's masked account (NOT the receiver NUBAN)
 * - `authorization.receiver_bank_account_number` = the dedicated NUBAN that received the funds
 * - `customer.customer_code` = Paystack customer who owns the dedicated account
 */
export async function checkPendingPayments() {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
        select: { id: true, virtualAccountNumber: true, paystackCustomerId: true, email: true },
    });

    if (!user?.virtualAccountNumber) {
        return { processed: 0, message: 'No virtual account found. Create one first.' };
    }

    // Auto-recover paystackCustomerId if it was never saved or got wiped
    let paystackCustomerId = user.paystackCustomerId;
    if (!paystackCustomerId && user.email) {
        const custRes = await fetch(
            `https://api.paystack.co/customer?email=${encodeURIComponent(user.email)}`,
            {
                headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
                cache: 'no-store',
            },
        );
        const custData = await custRes.json();
        if (custData.status && custData.data?.length > 0) {
            paystackCustomerId = custData.data[0].customer_code;
            await db.user.update({
                where: { id: user.id },
                data: { paystackCustomerId },
            });
        }
    }

    // Paystack DVA receipts don't always appear when filtering by customer.
    // Fetch both with and without the customer filter, deduplicate by reference.
    const fetchTxns = async (extraParam: string) => {
        const r = await fetch(
            `https://api.paystack.co/transaction?status=success&perPage=50${extraParam}`,
            {
                headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
                cache: 'no-store',
            },
        );
        const d = await r.json();
        return d.status ? (d.data ?? []) : [];
    };

    const [withCustomer, withoutCustomer] = await Promise.all([
        paystackCustomerId ? fetchTxns(`&customer=${paystackCustomerId}`) : Promise.resolve([]),
        fetchTxns(''),
    ]);

    // Deduplicate by reference
    const seen = new Set<string>();
    const allTxns = [...withCustomer, ...withoutCustomer].filter((t: any) => {
        if (seen.has(t.reference)) return false;
        seen.add(t.reference);
        return true;
    });

    const mine = allTxns.filter(
        (txn: any) =>
            txn.channel === 'dedicated_nuban' &&
            (
                txn.authorization?.receiver_bank_account_number === user.virtualAccountNumber ||
                txn.dedicated_account?.account_number === user.virtualAccountNumber ||
                (paystackCustomerId && txn.customer?.customer_code === paystackCustomerId)
            ),
    );

    if (mine.length === 0) {
        return {
            processed: 0,
            message: 'No transfers found for your account yet. Wait a moment after sending and try again.',
        };
    }

    let processed = 0;
    for (const txn of mine) {
        const existing = await db.transaction.findUnique({
            where: { reference: txn.reference },
        });
        if (existing?.serviceProvided) continue;

        try {
            await processVirtualAccountPayment(user.id, txn.amount, txn.reference);
            processed++;
        } catch (err) {
            console.error('checkPendingPayments failed for', txn.reference, err);
        }
    }

    if (processed > 0) revalidatePath('/member');

    return {
        processed,
        message:
            processed > 0
                ? `${processed} payment${processed > 1 ? 's' : ''} applied to your wallet!`
                : 'All transfers are already processed.',
    };
}
