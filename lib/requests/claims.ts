import { Claim } from "@prisma/client";
import { PageNumberPaginationMeta } from "prisma-extension-pagination";
import { alova } from "@/lib/alova";

type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

type AdminClaimsResponse = {
    data: (Claim & Record<string, any>)[];
    meta: PageNumberPaginationMeta<true>;
    pending: number;
    approved: number;
    rejected: number;
    pendingAmount: number;
    approvedAmount: number;
};

type ProviderClaimsResponse = {
    data: (Claim & Record<string, any>)[];
    meta: PageNumberPaginationMeta<true>;
    pending: number;
    processed: number;
    approvedAmount: number;
};

export const getAdminClaims = (status: ClaimStatus, params: Record<string, any> = {}) => (
    page?: number,
    limit?: number
) => alova.Get<AdminClaimsResponse>('/api/admin/claims', {
    hitSource: ['submit-claim', 'process-claim'],
    params: { page, limit, status, ...params },
});

// Legacy aliases kept for any remaining consumers
export const getPendingClaims  = (params?: Record<string, any>) => getAdminClaims('PENDING',  params ?? {});
export const getProcessedClaims = (params?: Record<string, any>) => getAdminClaims('APPROVED', params ?? {});

export const getProviderClaims = (
    providerId: string,
    status?: ClaimStatus,
    params: Record<string, any> = {}
) => (page?: number, limit?: number) =>
    alova.Get<ProviderClaimsResponse>('/api/provider/claims', {
        hitSource: ['submit-claim'],
        params: { providerId, page, limit, ...(status ? { status } : {}), ...params },
    });
