import { PageNumberPaginationMeta } from 'prisma-extension-pagination';
import { alova } from '@/lib/alova';

export interface Agent {
    id: string;
    firstName: string;
    lastName: string;
    name?: string;
    email: string;
    phoneNumber?: string;
    walletBalance: number;
    isActive: boolean;
    suspendedAt?: string | null;
    suspendedReason?: string | null;
    createdAt: string;
    _count?: { registeredMembers: number };
}

export const getAgents = (params: Record<string, any> = {}) => (page?: number, limit?: number) => {
    return alova.Get<{ data: Agent[]; meta: PageNumberPaginationMeta<true> }>('/api/admin/agents', {
        params: { page, limit, ...params }
    });
}
