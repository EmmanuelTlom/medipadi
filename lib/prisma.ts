import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import { pagination } from "prisma-extension-pagination";

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })
    .$extends(pagination())
// .$extends({
//     result: {
//         user: {
//             fullName: {
//                 needs: { firstName: true, lastName: true },
//                 compute (user) {
//                     return `${user.firstName} ${user.lastName}`
//                 }
//             }
//         }
//     }
// })

export { prisma }
export const db = prisma