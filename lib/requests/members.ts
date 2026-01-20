import { PageNumberPaginationMeta } from 'prisma-extension-pagination';
import { alova } from '@/lib/alova';

export interface Member {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    credits: number;
    lastCreditAllocation?: string;
    createdAt: string;
}

export const getMembers = (params: Record<string, any> = {}) => (
    page?: number,
    limit?: number
) => {
    return alova.Get<{ data: Member[]; meta: PageNumberPaginationMeta<true> }>('/api/admin/members', {
        params: { page, limit, ...params }
    });
}
