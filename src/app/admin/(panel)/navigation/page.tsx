import type { NavLocation } from "@prisma/client";
import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/auth/guard";
import { PageHeader } from "@/components/admin/ui";
import { NavEditor } from "./NavEditor";

export const metadata = { title: "Navigation" };

const LOCATIONS: { key: NavLocation; label: string; help: string; nested: boolean }[] = [
  { key: "HEADER", label: "Main navigation", help: "Top menu. Items with children show a dropdown on desktop and a sub-list on mobile.", nested: true },
  { key: "FOOTER_SERVICES", label: "Footer — Services column", help: "", nested: false },
  { key: "FOOTER_INDUSTRIES", label: "Footer — Industries column", help: "", nested: false },
  { key: "FOOTER_COMPANY", label: "Footer — Studio column", help: "", nested: false },
  { key: "FOOTER_LEGAL", label: "Footer — Legal links", help: "", nested: false },
];

export default async function NavigationAdmin({ searchParams }: { searchParams: Promise<{ menu?: string }> }) {
  await requirePagePermission("navigation.manage");
  const { menu } = await searchParams;
  const loc = LOCATIONS.find((l) => l.key === menu) ?? LOCATIONS[0];
  const [items, pages, services, industries] = await Promise.all([
    db.navItem.findMany({ where: { location: loc.key, parentId: null }, orderBy: { order: "asc" }, include: { children: { orderBy: { order: "asc" } } } }),
    db.page.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, title: true } }),
    db.service.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, title: true }, orderBy: { order: "asc" } }),
    db.industry.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, title: true }, orderBy: { order: "asc" } }),
  ]);
  const suggestions = [
    ...pages.map((p) => ({ label: p.title, href: p.slug === "home" ? "/" : `/${p.slug}` })),
    ...services.map((s) => ({ label: s.title, href: `/services/${s.slug}` })),
    ...industries.map((i) => ({ label: i.title, href: `/industries/${i.slug}` })),
  ];
  return (
    <>
      <PageHeader title="Navigation" description="Edit the header menu and footer link columns. Allowed destinations: site paths (/about), https:// links, mailto: and tel:." />
      <nav className="mb-4 flex flex-wrap gap-1" aria-label="Menus">
        {LOCATIONS.map((l) => (
          <a key={l.key} href={`/admin/navigation?menu=${l.key}`} aria-current={l.key === loc.key ? "page" : undefined} className={`a-btn a-btn-sm ${l.key === loc.key ? "a-btn-primary" : "a-btn-secondary"}`}>
            {l.label}
          </a>
        ))}
      </nav>
      <NavEditor
        key={loc.key}
        location={loc.key}
        title={loc.label}
        help={loc.help}
        nested={loc.nested}
        suggestions={suggestions}
        initial={items.map((i) => ({
          id: i.id,
          label: i.label,
          href: i.href,
          visible: i.visible,
          newTab: i.newTab,
          children: i.children.map((c) => ({ id: c.id, label: c.label, href: c.href, visible: c.visible, newTab: c.newTab })),
        }))}
      />
    </>
  );
}
