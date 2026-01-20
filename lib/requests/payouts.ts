import { PageNumberPaginationMeta } from 'prisma-extension-pagination';
import { alova } from '@/lib/alova';

export interface Payout {
    id: string;
    credits: number;
    amount: number;
    platformFee: number;
    netAmount: number;
    paypalEmail: string;
    status: string;
    createdAt: string;
    doctor: {
        id: string;
        name: string;
        email: string;
        firstName: string;
        lastName: string;
        specialty: string;
        credits: number;
    };
}

export const getPendingPayouts = (params: Record<string, any> = {}) => (
    page?: number,
    limit?: number
) => {
    return alova.Get<{ data: (Payout & Record<string, any>)[]; meta: PageNumberPaginationMeta<true> }>('/api/admin/payouts/pending', {
        params: { page, limit, ...params }
    });
}

export const approvePayout = (payoutId: string) =>
    alova.Post('/api/admin/payouts/approve', { payoutId });
