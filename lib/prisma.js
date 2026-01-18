import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'

let prisma, database = globalThis.prisma;
const connectionString = `${process.env.DATABASE_URL}`

if (!database) {
  const adapter = new PrismaPg({ connectionString })
  prisma = new PrismaClient({ adapter })
  database = prisma;

  if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = prisma;
  }
}

export { prisma }
export const db = database

// globalThis.prisma: This global variable ensures that the Prisma client instance is
// reused across hot reloads during development. Without this, each time your application
// reloads, a new instance of the Prisma client would be created, potentially leading
// to connection issues.
