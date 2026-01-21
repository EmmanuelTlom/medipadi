import { Claim } from "@prisma/client";
import { PageNumberPaginationMeta } from "prisma-extension-pagination";
import { alova } from "@/lib/alova";

export const getPendingClaims = (params: Record<string, any> = {}) => (
    page?: number,
    limit?: number
) => {
    return alova.Get<{
        data: (Claim & Record<string, any>)[];
        meta: PageNumberPaginationMeta<true>
        pending: number;
        processed: number;
    }>('/api/admin/claims', {
        hitSource: ['submit-claim'],
        params: { page, limit, status: 'PENDING', ...params }
    })
}

export const getProcessedClaims = (params: Record<string, any> = {}) => (
    page?: number,
    limit?: number
) => {
    return alova.Get<{
        data: (Claim & Record<string, any>)[];
        meta: PageNumberPaginationMeta<true>
        pending: number;
        processed: number;
    }>('/api/admin/claims', {
        hitSource: ['submit-claim'],
        params: {
            page, limit, status: 'PROCESSED', ...params,
        }
    })
}

export const getProviderClaims = (providerId: string, params: Record<string, any> = {}) => (
    page?: number,
    limit?: number
) => {
    return alova.Get<{
        data: (Claim & Record<string, any>)[];
        meta: PageNumberPaginationMeta<true>
        pending: number;
        processed: number;
        approvedAmount: number;
    }>('/api/provider/claims', {
        hitSource: ['submit-claim'],
        params: {
            providerId,
            page,
            limit,
            ...params
        },
    })
}