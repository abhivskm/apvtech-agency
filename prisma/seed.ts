/**
 * Development / first-run seed.
 *
 * SAFE BY DEFAULT: records are only created when missing. Existing content (edited in the admin)
 * is never overwritten. Set SEED_FORCE=true to reset seeded records to their original content
 * (development only — refused when NODE_ENV=production).
 *
 * No admin user is created here. Use `npm run create-admin`.
 */
import { PrismaClient, type NavLocation, type Prisma } from "@prisma/client";
import { MEDIA, mediaUrl } from "./seed-data/media";
import { SERVICES } from "./seed-data/services";
import { ARTICLES, ARTICLE_CATEGORIES, INDUSTRIES, PROJECTS, PROJECT_CATEGORIES } from "./seed-data/content";
import { GENERAL_FAQS, PAGES } from "./seed-data/pages";
import { mid } from "./seed-data/ids";

const db = new PrismaClient();
const FORCE = process.env.SEED_FORCE === "true";
if (FORCE && process.env.NODE_ENV === "production") {
  throw new Error("SEED_FORCE is not allowed in production.");
}

const DEFAULT_COLORS = {
  background: "#0A0A0A",
  surface: "#141414",
  elevated: "#1B1B1B",
  text: "#F4F4EF",
  muted: "#A4A49D",
  accent: "#C8F169",
};

let created = 0;
let skipped = 0;

async function ensure<T>(exists: () => Promise<unknown>, create: () => Promise<T>, update?: () => Promise<unknown>) {
  const found = await exists();
  if (found && !(FORCE && update)) {
    skipped++;
    return null;
  }
  if (found && FORCE && update) {
    await update();
    return null;
  }
  created++;
  return create();
}

async function seedSettings() {
  await ensure(
    () => db.siteSettings.findUnique({ where: { id: "singleton" } }),
    () =>
      db.siteSettings.create({
        data: {
          id: "singleton",
          brandName: "FORM & SIGNAL",
          brandShortName: "F&S",
          tagline: "One partner. Every digital touchpoint.",
          supportingMessage:
            "From websites and search visibility to social content, product photography, and digital campaigns, we bring everything your brand needs to grow online under one roof.",
          colors: DEFAULT_COLORS,
          // Contact details intentionally left empty – never publish fictional details.
          serviceAreas: "India",
          footerText: "A connected digital studio for ambitious businesses across India.",
          copyrightText: "© {year} {brand}. All rights reserved.",
          defaultSeoTitle: "FORM & SIGNAL — Websites, SEO, content & digital growth",
          defaultSeoDescription:
            "One partner for every digital touchpoint: websites, e-commerce, SEO and Google presence, social media, photography, video, ads and automation for businesses across India.",
          titleTemplate: "%s | {brand}",
          ogImageId: mid("web-ui-screens"),
        },
      }),
  );
}

async function seedMedia() {
  for (const m of MEDIA) {
    const data = {
      kind: "IMAGE" as const,
      url: mediaUrl(m.photo),
      filename: `${m.key}.jpg`,
      mime: "image/jpeg",
      width: m.width,
      height: m.height,
      alt: m.alt,
      credit: "Unsplash (Unsplash License)",
      caption: "Temporary stock image — replace with your own work",
    };
    await ensure(
      () => db.mediaAsset.findUnique({ where: { id: mid(m.key) } }),
      () => db.mediaAsset.create({ data: { id: mid(m.key), ...data } }),
      () => db.mediaAsset.update({ where: { id: mid(m.key) }, data }),
    );
  }
}

async function seedServices() {
  const now = new Date();
  for (const [i, s] of SERVICES.entries()) {
    const data = {
      slug: s.slug,
      title: s.title,
      category: s.category,
      shortDescription: s.shortDescription,
      featuredLabel: s.featuredLabel ?? null,
      heroHeadline: s.heroHeadline,
      heroText: s.heroText,
      heroMediaId: mid(s.media),
      body: s.body,
      problems: s.problems,
      benefits: s.benefits,
      deliverables: s.deliverables,
      process: s.process,
      order: i,
      status: "PUBLISHED" as const,
      publishedAt: now,
      ctaLabel: "Discuss this service",
      ctaHref: "/contact",
    };
    const made = await ensure(
      () => db.service.findUnique({ where: { slug: s.slug } }),
      () => db.service.create({ data }),
      () => db.service.update({ where: { slug: s.slug }, data }),
    );
    if (made) {
      for (const [j, f] of s.faqs.entries()) {
        await db.faq.create({ data: { question: f.q, answer: f.a, group: "service", serviceId: made.id, status: "PUBLISHED", order: j } });
      }
    }
  }
  // Related services (only add missing links)
  for (const s of SERVICES) {
    const from = await db.service.findUnique({ where: { slug: s.slug } });
    if (!from) continue;
    for (const r of s.related) {
      const to = await db.service.findUnique({ where: { slug: r } });
      if (to) {
        await db.serviceRelation.upsert({ where: { fromId_toId: { fromId: from.id, toId: to.id } }, create: { fromId: from.id, toId: to.id }, update: {} });
      }
    }
  }
}

async function seedIndustries() {
  const now = new Date();
  for (const [i, ind] of INDUSTRIES.entries()) {
    const data = {
      slug: ind.slug,
      title: ind.title,
      shortTitle: ind.shortTitle,
      intro: ind.intro,
      needs: ind.needs,
      body: ind.body,
      heroMediaId: mid(ind.media),
      order: i,
      status: "PUBLISHED" as const,
      publishedAt: now,
    };
    const made = await ensure(
      () => db.industry.findUnique({ where: { slug: ind.slug } }),
      () => db.industry.create({ data }),
      () => db.industry.update({ where: { slug: ind.slug }, data }),
    );
    if (made) {
      const services = await db.service.findMany({ where: { slug: { in: ind.services } } });
      await db.industryService.createMany({ data: services.map((s) => ({ industryId: made.id, serviceId: s.id })), skipDuplicates: true });
    }
  }
}

async function seedProjects() {
  for (const [i, c] of PROJECT_CATEGORIES.entries()) {
    await db.projectCategory.upsert({ where: { slug: c.slug }, create: { ...c, order: i }, update: {} });
  }
  const now = new Date();
  for (const [i, p] of PROJECTS.entries()) {
    const industry = await db.industry.findUnique({ where: { slug: p.industry } });
    const data = {
      slug: p.slug,
      title: p.title,
      isConcept: true,
      summary: p.summary,
      description: `<p>${p.summary}</p>`,
      challenge: p.challenge,
      solution: p.solution,
      outcome: p.outcome,
      coverId: mid(p.cover),
      industryId: industry?.id ?? null,
      featured: p.featured,
      order: i,
      status: "PUBLISHED" as const,
      publishedAt: now,
    };
    const made = await ensure(
      () => db.project.findUnique({ where: { slug: p.slug } }),
      () => db.project.create({ data }),
      () => db.project.update({ where: { slug: p.slug }, data }),
    );
    if (made) {
      await db.projectMedia.createMany({ data: p.gallery.map((g, j) => ({ projectId: made.id, mediaId: mid(g), order: j })) });
      const cats = await db.projectCategory.findMany({ where: { slug: { in: p.categories } } });
      await db.projectCategoryLink.createMany({ data: cats.map((c) => ({ projectId: made.id, categoryId: c.id })) });
      const svcs = await db.service.findMany({ where: { slug: { in: p.services } } });
      await db.projectService.createMany({ data: svcs.map((s) => ({ projectId: made.id, serviceId: s.id })) });
    }
  }
}

async function seedArticles() {
  for (const c of ARTICLE_CATEGORIES) {
    await db.articleCategory.upsert({ where: { slug: c.slug }, create: c, update: {} });
  }
  const base = Date.now();
  for (const [i, a] of ARTICLES.entries()) {
    const category = await db.articleCategory.findUnique({ where: { slug: a.category } });
    const data = {
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      body: a.body,
      coverId: mid(a.cover),
      authorName: "Studio team",
      categoryId: category?.id ?? null,
      readingMinutes: a.minutes,
      status: "PUBLISHED" as const,
      publishedAt: new Date(base - i * 5 * 24 * 3600_000),
    };
    const made = await ensure(
      () => db.article.findUnique({ where: { slug: a.slug } }),
      () => db.article.create({ data }),
      () => db.article.update({ where: { slug: a.slug }, data }),
    );
    if (made) {
      for (const t of a.tags) {
        const slug = t.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const tag = await db.tag.upsert({ where: { slug }, create: { slug, name: t }, update: {} });
        await db.articleTag.create({ data: { articleId: made.id, tagId: tag.id } });
      }
    }
  }
}

async function seedPages() {
  const now = new Date();
  for (const p of PAGES) {
    const existing = await db.page.findUnique({ where: { slug: p.slug } });
    if (existing && !FORCE) {
      skipped++;
      continue;
    }
    if (existing && FORCE) await db.page.delete({ where: { id: existing.id } });
    created++;
    await db.page.create({
      data: {
        slug: p.slug,
        title: p.title,
        isSystem: true,
        status: "PUBLISHED",
        publishedAt: now,
        seoTitle: p.seoTitle ?? null,
        seoDescription: p.seoDescription,
        sections: {
          create: p.sections.map((s, i) => ({
            key: s.key,
            type: s.type,
            order: i,
            visible: s.visible ?? true,
            data: s.data as Prisma.InputJsonValue,
          })),
        },
      },
    });
  }
  if ((await db.faq.count({ where: { group: "general" } })) === 0) {
    await db.faq.createMany({
      data: GENERAL_FAQS.map((f, i) => ({ question: f.q, answer: f.a, group: "general", status: "PUBLISHED" as const, order: i })),
    });
  }
}

async function seedNavigation() {
  if ((await db.navItem.count()) > 0 && !FORCE) {
    skipped++;
    return;
  }
  if (FORCE) await db.navItem.deleteMany();
  const add = (location: NavLocation, items: [string, string][]) =>
    db.navItem.createMany({ data: items.map(([label, href], order) => ({ location, label, href, order })) });

  // Header with a services dropdown
  const services = await db.navItem.create({ data: { location: "HEADER", label: "Services", href: "/services", order: 0 } });
  await db.navItem.createMany({
    data: SERVICES.map((s, i) => ({ location: "HEADER" as const, label: s.title, href: `/services/${s.slug}`, order: i, parentId: services.id })),
  });
  await db.navItem.createMany({
    data: [
      ["Work", "/work"],
      ["Industries", "/industries"],
      ["About", "/about"],
      ["Insights", "/insights"],
      ["Contact", "/contact"],
    ].map(([label, href], i) => ({ location: "HEADER" as const, label, href, order: i + 1 })),
  });
  await add("FOOTER_SERVICES", SERVICES.map((s) => [s.title, `/services/${s.slug}`]));
  await add("FOOTER_INDUSTRIES", INDUSTRIES.map((i) => [i.shortTitle || i.title, `/industries/${i.slug}`]));
  await add("FOOTER_COMPANY", [
    ["Work", "/work"],
    ["About", "/about"],
    ["Insights", "/insights"],
    ["Contact", "/contact"],
  ]);
  await add("FOOTER_LEGAL", [
    ["Privacy policy", "/privacy-policy"],
    ["Terms and conditions", "/terms-and-conditions"],
  ]);
  created++;
}

async function main() {
  // Used by the deploy build: seed a brand-new database once, never touch one that already has content.
  if (process.env.SEED_ONLY_IF_EMPTY === "true" && (await db.siteSettings.count()) > 0) {
    console.log("Database already initialised — skipping seed.");
    return;
  }
  console.log(FORCE ? "Seeding (FORCE: resetting seeded records)…" : "Seeding (create-missing only)…");
  await seedMedia();
  await seedSettings();
  await seedServices();
  await seedIndustries();
  await seedProjects();
  await seedArticles();
  await seedPages();
  await seedNavigation();
  console.log(`Done. Created ${created}, left ${skipped} existing record(s) untouched.`);
  console.log("No admin user is created by the seed. Run: npm run create-admin");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
