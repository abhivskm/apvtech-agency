import { CmsPage, pageMetadata } from "@/components/site/CmsPage";

export const revalidate = 300;

export function generateMetadata() {
  return pageMetadata("about", "/about");
}

export default function AboutPage() {
  return <CmsPage slug="about" />;
}
