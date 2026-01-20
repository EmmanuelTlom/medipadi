import { PageNumberPaginationMeta } from 'prisma-extension-pagination';
import { alova } from '@/lib/alova';

export interface Agent {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    walletBalance: number;
    createdAt: string;
}

export const getAgents = (params: Record<string, any> = {}) => (page?: number, limit?: number) => {
    return alova.Get<{ data: Agent[]; meta: PageNumberPaginationMeta<true> }>('/api/admin/agents', {
        params: { page, limit, ...params }
    });
}
