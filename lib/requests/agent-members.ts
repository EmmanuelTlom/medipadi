import { PageNumberPaginationMeta } from 'prisma-extension-pagination';
import { alova } from '@/lib/alova';

export interface AgentMember {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    membershipId: string;
    subscriptionEnd: string;
    credits: number;
    lastCreditAllocation?: string;
    createdAt: string;
}

export const getAgentMembers = (params: Record<string, any> = {}) => (
    page?: number,
    limit?: number
) => {
    return alova.Get<{ data: AgentMember[]; meta: PageNumberPaginationMeta<true> }>('/api/agent/members', {
        params: { page, limit, ...params }
    });
}