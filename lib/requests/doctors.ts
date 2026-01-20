import { PageNumberPaginationMeta } from 'prisma-extension-pagination';
import { alova } from '@/lib/alova';
import { User } from '@prisma/client';

export const getPendingDoctors = (params: Record<string, any> = {}) => (
    page?: number,
    limit?: number
) => {
    return alova.Get<{
        data: (User & Record<string, any>)[];
        meta: PageNumberPaginationMeta<true>
    }>('/api/admin/doctors/pending', {
        params: { page, limit, ...params }
    });
}

export const getVerifiedDoctors = (params: Record<string, any> = {}) => (
    page?: number,
    limit?: number
) => {
    return alova.Get<{
        data: (User & Record<string, any>)[];
        meta: PageNumberPaginationMeta<true>
    }>('/api/admin/doctors/verified', {
        params: { page, limit, ...params }
    });
}

export const updateDoctorStatus = (doctorId: string, status: 'VERIFIED' | 'REJECTED') =>
    alova.Post('/api/admin/doctors/update-status', { doctorId, status });

export const updateDoctorActiveStatus = (doctorId: string, suspend: boolean) =>
    alova.Post('/api/admin/doctors/update-active-status', { doctorId, suspend });
