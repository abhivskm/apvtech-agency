import { PrismaClient } from "@prisma/client";

// Neon's Vercel integration names the direct connection DATABASE_URL_UNPOOLED; the schema's directUrl reads DIRECT_DATABASE_URL.
process.env.DIRECT_DATABASE_URL ??= process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

/**
 * Prisma's defaults (pool of num_cpus*2+1, 10s pool timeout) are too tight for a remote serverless database:
 * the production build pre-renders many pages in parallel, and Neon may need a moment to wake up.
 * Explicit values in DATABASE_URL always win.
 */
function datasourceUrl(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    if (!url.searchParams.has("pool_timeout")) url.searchParams.set("pool_timeout", "60");
    if (!url.searchParams.has("connect_timeout")) url.searchParams.set("connect_timeout", "30");
    if (!url.searchParams.has("connection_limit")) url.searchParams.set("connection_limit", "5");
    return url.toString();
  } catch {
    return raw;
  }
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: datasourceUrl(),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
