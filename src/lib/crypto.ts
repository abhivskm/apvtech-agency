import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Keyed hash for values we must correlate but never store raw (IP addresses). */
export function hmac(value: string, secret = process.env.APP_SECRET ?? ""): string {
  return createHmac("sha256", secret || "dev-only-secret").update(value).digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** Short signature for public URLs we generate ourselves (e.g. social share images), so others can't forge them. */
export function signParams(...parts: string[]): string {
  return hmac(`og|${parts.join("|")}`).slice(0, 16);
}
