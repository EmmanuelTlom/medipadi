import { PageNumberPaginationMeta } from 'prisma-extension-pagination';
import { alova } from '@/lib/alova';

export interface WalletTransaction {
    id: string;
    userId: string;
    amount: number;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'MEMBER_REGISTRATION' | 'REFUND';
    description?: string;
    balanceBefore: number;
    balanceAfter: number;
    createdAt: string;
}

export const getWalletTransactions = () => (page: number = 1, limit: number = 10) => {
    return alova.Get<{
        data: WalletTransaction[],
        meta: PageNumberPaginationMeta<true>,
        balance: number
    }>('/api/agent/wallet-transactions', {
        params: { limit, page },
        name: 'get-wallet-transactions',
        hitSource: ['register-member', 'fund-wallet'],
    });
};
