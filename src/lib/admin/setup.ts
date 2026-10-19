import "server-only";
import { db } from "@/lib/db";

/** True when the one-time browser setup is available: no users exist and SETUP_TOKEN is configured. */
export async function setupAvailable() {
  return (process.env.SETUP_TOKEN ?? "").length >= 24 && (await db.user.count()) === 0;
}
