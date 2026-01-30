'use server';

import { DedicatedAccountData } from 'paystack-sdk/dist/dedicated/interface';
import { auth } from '@clerk/nextjs/server';
import { createVirtualAccount } from '@/lib/payments';
import { db } from '@/lib/prisma';

/**
 * Request a Paystack virtual account for the authenticated member
 */
export async function requestVirtualAccount () {
    const { userId } = await auth();

    if (!userId) {
        throw new Error('Unauthorized. Please sign in.');
    }

    try {
        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                name: true,
                role: true,
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

        // Only members (patients) can request virtual accounts
        if (user.role !== 'PATIENT') {
            throw new Error('Only members can request virtual accounts.');
        }

        if (!user.email) {
            throw new Error('Email is required to create a virtual account.');
        }

        // Check if user already has an active virtual account
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
        const lastName =
            user.lastName || user.name?.split(' ').slice(1).join(' ') || '';

        const { data, message, success } = (await createVirtualAccount(
            user.id,
            user.email,
            firstName,
            lastName
        )) as {
            data: DedicatedAccountData,
            success: boolean,
            message: string
        };

        if (!success) {
            throw new Error('Failed to create virtual account:' + message);
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
            message: message,
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
export async function getVirtualAccount () {
    const { userId } = await auth();

    if (!userId) {
        throw new Error('Unauthorized. Please sign in.');
    }

    try {
        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId,
            },
            select: {
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

        if (!user.virtualAccountActive || !user.virtualAccountNumber) {
            return {
                success: false,
                hasAccount: false,
                data: null,
                message: 'No virtual account found. Create one first.',
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
