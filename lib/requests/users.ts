import { User } from "@prisma/client";
import { alova } from "../alova";

export const getUser = (id?: string) => () => {
    return alova.Get<{ data: User & Record<string, any>; }>(`/api/user/profile${id ? `/${id}` : ''}`, {
        hitSource: ['register-member']
    });
}