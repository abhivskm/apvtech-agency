"use server";

import { db } from "@/lib/db";
import { adminAction } from "@/lib/admin/action";
import { navSaveSchema } from "@/lib/validation/content";
import { logActivity } from "@/lib/audit";
import { refresh } from "@/lib/content/revalidate";
import { TAGS } from "@/lib/content/tags";

/** Replaces all items for one menu location (header or a footer column) in a single transaction. */
export const saveNavigation = adminAction("navigation.manage", async (input: unknown, user) => {
  const { location, items } = navSaveSchema.parse(input);
  await db.$transaction(async (tx) => {
    await tx.navItem.deleteMany({ where: { location } });
    for (const [order, it] of items.entries()) {
      const parent = await tx.navItem.create({ data: { location, label: it.label, href: it.href, visible: it.visible, newTab: it.newTab, order } });
      if (it.children.length) {
        await tx.navItem.createMany({
          data: it.children.map((c, i) => ({ location, label: c.label, href: c.href, visible: c.visible, newTab: c.newTab, order: i, parentId: parent.id })),
        });
      }
    }
  });
  await logActivity(user, "navigation.update", "Navigation", location, `Updated ${location.toLowerCase().replace("_", " ")} menu (${items.length} items)`);
  refresh(TAGS.nav);
  return { ok: true, message: "Menu saved" };
});
