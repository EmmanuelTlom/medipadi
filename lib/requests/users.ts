import { User } from "@prisma/client";
import { alova } from "../alova";

export const getUser = (id?: string) => () => {
    return alova.Get<{ data: User & Record<string, any>; }>(`/api/user/profile${id ? `/${id}` : ''}`, {
        hitSource: ['register-member']
    });
}


export const redirectPath = (role: string, verificationStatus: string) => {
    if (role === "DOCTOR") {
        return verificationStatus === "VERIFIED"
            ? "/doctor"
            : "/doctor/verification";
    } else if (role === "ADMIN") {
        return "/admin";
    } else if (role === "AGENT") {
        return "/agent";
    } else if (role === "PROVIDER") {
        return "/provider";
    }
    return "/member";
}