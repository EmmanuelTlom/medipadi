'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

async function getProviderUser() {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');
    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user || user.role !== 'PROVIDER') throw new Error('Only providers can perform this action');
    return user;
}

/**
 * Fetch list of Nigerian banks from Paystack.
 */
export async function getNigerianBanks() {
    const res = await fetch('https://api.paystack.co/bank?country=nigeria&perPage=100', {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
        cache: 'no-store',
    });
    const data = await res.json();
    if (!data.status) throw new Error('Could not fetch bank list');
    return (data.data as { name: string; code: string }[]).map(b => ({ name: b.name, code: b.code }));
}

/**
 * Verify a bank account number via Paystack and return the account name.
 */
export async function verifyBankAccount(accountNumber: string, bankCode: string) {
    const res = await fetch(
        `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
        {
            headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
            cache: 'no-store',
        },
    );
    const data = await res.json();
    if (!data.status) throw new Error(data.message || 'Could not verify account');
    return { accountName: data.data.account_name as string };
}

/**
 * Save provider bank details and create/update the Paystack transfer recipient.
 */
export async function saveProviderBankDetails({
    accountNumber,
    accountName,
    bankCode,
    bankName,
}: {
    accountNumber: string;
    accountName: string;
    bankCode: string;
    bankName: string;
}) {
    const provider = await getProviderUser();

    // Create or update Paystack transfer recipient
    let recipientCode = provider.paystackRecipientCode ?? null;

    try {
        const recipientRes = await fetch('https://api.paystack.co/transferrecipient', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'nuban',
                name: accountName,
                account_number: accountNumber,
                bank_code: bankCode,
                currency: 'NGN',
            }),
        });
        const recipientData = await recipientRes.json();
        if (recipientData.status) {
            recipientCode = recipientData.data.recipient_code;
        }
    } catch (err) {
        console.error('Failed to create Paystack recipient:', err);
        // Non-fatal — save bank details even if recipient creation fails
    }

    await db.user.update({
        where: { id: provider.id },
        data: {
            bankAccountNumber: accountNumber,
            bankAccountName: accountName,
            bankCode,
            bankName,
            ...(recipientCode ? { paystackRecipientCode: recipientCode } : {}),
        },
    });

    revalidatePath('/provider');
    return { success: true };
}

/**
 * Get provider earnings summary.
 */
export async function getProviderEarnings() {
    const provider = await getProviderUser();

    const [totalApproved, totalPaid, pendingPayout, totalRejected, recentClaims] = await Promise.all([
        // Total approved claim amounts
        db.claim.aggregate({
            where: { providerId: provider.id, status: 'APPROVED' },
            _sum: { amount: true },
            _count: true,
        }),
        // Total already-processed payouts
        db.payout.aggregate({
            where: { doctorId: provider.id, status: 'PROCESSED' },
            _sum: { netAmount: true },
            _count: true,
        }),
        // Outstanding (approved but not yet disbursed)
        db.payout.aggregate({
            where: { doctorId: provider.id, status: 'PROCESSING' },
            _sum: { netAmount: true },
            _count: true,
        }),
        // Rejected claims count
        db.claim.count({ where: { providerId: provider.id, status: 'REJECTED' } }),
        // Recent 5 claims
        db.claim.findMany({
            where: { providerId: provider.id },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: { id: true, amount: true, status: true, createdAt: true, description: true },
        }),
    ]);

    return {
        totalApprovedAmount: totalApproved._sum.amount ?? 0,
        totalApprovedCount: totalApproved._count,
        totalPaidAmount: totalPaid._sum.netAmount ?? 0,
        totalPaidCount: totalPaid._count,
        pendingPayoutAmount: pendingPayout._sum.netAmount ?? 0,
        pendingPayoutCount: pendingPayout._count,
        totalRejected,
        recentClaims,
        bankDetails: provider.bankAccountNumber
            ? {
                accountNumber: provider.bankAccountNumber,
                accountName: provider.bankAccountName,
                bankName: provider.bankName,
                recipientReady: !!provider.paystackRecipientCode,
            }
            : null,
    };
}
