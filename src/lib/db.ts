import { PrismaClient } from "@prisma/client";

// Neon's Vercel integration names the direct connection DATABASE_URL_UNPOOLED; the schema's directUrl reads DIRECT_DATABASE_URL.
process.env.DIRECT_DATABASE_URL ??= process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
