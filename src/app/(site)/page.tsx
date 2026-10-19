import { CmsPage, pageMetadata } from "@/components/site/CmsPage";

export const revalidate = 300;

export function generateMetadata() {
  return pageMetadata("home", "/");
}

export default function HomePage() {
  return <CmsPage slug="home" />;
}
