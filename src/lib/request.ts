import { headers } from "next/headers";
import { hmac } from "@/lib/crypto";

export async function clientIp(): Promise<string> {
  const h = await headers();
  // On Vercel, x-vercel-forwarded-for / x-real-ip are set by the platform and can't be spoofed by the client.
  // Self-hosted deployments must run behind a proxy that overwrites x-forwarded-for (see README → Docker).
  const trusted = h.get("x-vercel-forwarded-for") ?? h.get("x-real-ip");
  const fwd = h.get("x-forwarded-for");
  return (trusted?.split(",")[0] ?? fwd?.split(",")[0] ?? "unknown").trim();
}

export async function clientIpHash(): Promise<string> {
  return hmac(await clientIp());
}

export async function userAgent(): Promise<string> {
  return ((await headers()).get("user-agent") ?? "").slice(0, 300);
}
