import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { TAGS, type Tag } from "@/lib/content/tags";

/**
 * Refresh public caches after content changes – no redeploy needed.
 * Content is highly interlinked (services appear on industries, projects, home, nav…), so every
 * change invalidates the shared "content" tag plus the specific tags, and re-renders the layout.
 */
export function refresh(...tags: Tag[]) {
  for (const t of new Set<Tag>([TAGS.all, ...tags])) revalidateTag(t);
  revalidatePath("/", "layout");
}
