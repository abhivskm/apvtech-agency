import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/auth/guard";
import { PageHeader } from "@/components/admin/ui";
import { env } from "@/lib/env";
import { SeoForm, RedirectsManager } from "./SeoForms";

export const metadata = { title: "SEO & Redirects" };

export default async function SeoSettings() {
  await requirePagePermission("seo.manage");
  const [s, redirects] = await Promise.all([db.siteSettings.findUniqueOrThrow({ where: { id: "singleton" } }), db.redirect.findMany({ orderBy: { createdAt: "desc" } })]);
  const base = s.siteUrl || env.siteUrl;
  return (
    <>
      <PageHeader
        title="SEO & Redirects"
        description="Site-wide search defaults. Each page, service, project and article also has its own SEO fields. Good metadata helps search engines understand your pages; it does not guarantee rankings."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <SeoForm
          initial={{ defaultSeoTitle: s.defaultSeoTitle, defaultSeoDescription: s.defaultSeoDescription, titleTemplate: s.titleTemplate, ogImageId: s.ogImageId, gscVerification: s.gscVerification ?? "" }}
          brandName={s.brandName}
        />
        <div className="space-y-5">
          <section className="a-card p-5 text-sm">
            <h2 className="font-semibold">Search tools</h2>
            <ul className="mt-3 space-y-2 text-zinc-700">
              <li>
                Sitemap:{" "}
                <a href="/sitemap.xml" target="_blank" className="text-blue-700 underline">
                  {base}/sitemap.xml
                </a>{" "}
                — submit this in Google Search Console.
              </li>
              <li>
                Robots:{" "}
                <a href="/robots.txt" target="_blank" className="text-blue-700 underline">
                  {base}/robots.txt
                </a>
              </li>
              <li>Drafts, archived and “noindex” content, admin and API routes are excluded from the sitemap automatically.</li>
            </ul>
          </section>
          <RedirectsManager redirects={redirects.map((r) => ({ id: r.id, fromPath: r.fromPath, toPath: r.toPath, permanent: r.permanent }))} />
        </div>
      </div>
    </>
  );
}
