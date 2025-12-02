// This file is a workaround to help TypeScript recognize Prisma types
// Run: cd server && npx prisma generate

import { PrismaClient } from "@prisma/client";

declare global {
    var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = prisma;
}
