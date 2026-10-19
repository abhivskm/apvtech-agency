import "server-only";
import { db } from "@/lib/db";

/** Counts every place a media asset is referenced (relations + page-section JSON). */
export async function mediaUsage(id: string) {
  const [settings, pagesOg, servicesHero, servicesOg, projectsCover, projectsOg, gallery, industries, articlesCover, articlesOg, testimonials, sections] =
    await Promise.all([
      db.siteSettings.count({ where: { OR: [{ logoId: id }, { faviconId: id }, { ogImageId: id }] } }),
      db.page.count({ where: { ogImageId: id } }),
      db.service.count({ where: { heroMediaId: id } }),
      db.service.count({ where: { ogImageId: id } }),
      db.project.count({ where: { coverId: id } }),
      db.project.count({ where: { ogImageId: id } }),
      db.projectMedia.count({ where: { mediaId: id } }),
      db.industry.count({ where: { heroMediaId: id } }),
      db.article.count({ where: { coverId: id } }),
      db.article.count({ where: { ogImageId: id } }),
      db.testimonial.count({ where: { photoId: id } }),
      db.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*)::bigint AS count FROM "PageSection" WHERE data::text LIKE ${"%" + id + "%"}`,
    ]);
  const breakdown = {
    "Site settings": settings,
    "Page social images": pagesOg,
    "Page sections": Number(sections[0]?.count ?? 0),
    "Service images": servicesHero + servicesOg,
    "Project covers & social": projectsCover + projectsOg,
    "Project galleries": gallery,
    Industries: industries,
    Articles: articlesCover + articlesOg,
    Testimonials: testimonials,
  };
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  return { total, breakdown };
}

/** Rich-text bodies may embed image URLs directly. */
export async function mediaUrlInRichText(url: string) {
  const [a, s, i, p] = await Promise.all([
    db.article.count({ where: { body: { contains: url } } }),
    db.service.count({ where: { body: { contains: url } } }),
    db.industry.count({ where: { body: { contains: url } } }),
    db.project.count({ where: { description: { contains: url } } }),
  ]);
  return a + s + i + p;
}
