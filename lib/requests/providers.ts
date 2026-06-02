import { PageNumberPaginationMeta } from 'prisma-extension-pagination';
import { alova } from '@/lib/alova';

export interface Provider {
    id: string;
    firstName: string;
    lastName: string;
    name?: string | null;
    email: string;
    phoneNumber?: string | null;
    isActive: boolean;
    suspendedAt?: string | null;
    suspendedReason?: string | null;
    bankAccountName?: string | null;
    bankName?: string | null;
    createdAt: string;
}

export const getProviders = (params: Record<string, any> = {}) => (page?: number, limit?: number) =>
    alova.Get<{ data: Provider[]; meta: PageNumberPaginationMeta<true> }>('/api/admin/providers', {
        params: { page, limit, ...params },
    });
