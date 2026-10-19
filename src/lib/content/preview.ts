import "server-only";
import { draftMode } from "next/headers";
import { getSessionUser } from "@/lib/auth/session";

/**
 * Preview is allowed only when Next.js draft mode is on AND the request carries a valid admin session.
 * A leaked draft-mode cookie alone never exposes unpublished content.
 */
export async function isPreview(): Promise<boolean> {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return false;
  return Boolean(await getSessionUser());
}

export async function withPreview<T>(slug: string, published: (slug: string) => Promise<T>, preview: (slug: string) => Promise<T>): Promise<T> {
  return (await isPreview()) ? preview(slug) : published(slug);
}
