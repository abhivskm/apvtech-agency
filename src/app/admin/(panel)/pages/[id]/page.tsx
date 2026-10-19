import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/admin/ui";
import { PageEditor } from "./PageEditor";

export const metadata = { title: "Edit page" };

function toLocalInput(d: Date | null) {
  if (!d) return "";
  return new Date(d.getTime() + 330 * 60_000).toISOString().slice(0, 16);
}

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  const { id } = await params;
  const page = id === "new" ? null : await db.page.findUnique({ where: { id }, include: { sections: { orderBy: { order: "asc" } } } });
  if (id !== "new" && !page) notFound();
  const isHome = page?.slug === "home";
  if (!(isHome ? can(user.role, "homepage.manage") : can(user.role, "pages.manage"))) redirect("/admin?forbidden=1");

  const initial = page
    ? {
        id: page.id, title: page.title, slug: page.slug, status: page.status, publishedAt: toLocalInput(page.publishedAt), seoTitle: page.seoTitle ?? "",
        seoDescription: page.seoDescription ?? "", canonicalUrl: page.canonicalUrl ?? "", noindex: page.noindex, ogImageId: page.ogImageId,
        sections: page.sections.map((s) => ({ id: s.id, key: s.key, type: s.type, visible: s.visible, data: s.data as Record<string, unknown> })),
      }
    : { title: "", slug: "", status: "DRAFT", publishedAt: "", seoTitle: "", seoDescription: "", canonicalUrl: "", noindex: false, ogImageId: null, sections: [] };

  return (
    <>
      <PageHeader
        title={isHome ? "Homepage" : page ? `Edit page: ${page.title}` : "New page"}
        description={
          isHome
            ? "Edit, reorder, hide or add homepage sections. Services, projects, industries, testimonials and insights sections pull published items automatically — manage those in their own areas."
            : page?.isSystem
              ? "This is a core page with a fixed URL. Listing pages show their content between the hero and the remaining sections."
              : "Custom page built from sections."
        }
        back={can(user.role, "pages.manage") ? { href: "/admin/pages", label: "All pages" } : undefined}
      />
      <PageEditor initial={initial} isSystem={page?.isSystem ?? false} isHome={isHome} />
    </>
  );
}
