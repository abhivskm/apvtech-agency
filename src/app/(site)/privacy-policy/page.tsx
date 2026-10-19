import { CmsPage, pageMetadata } from "@/components/site/CmsPage";

export const revalidate = 300;

export function generateMetadata() {
  return pageMetadata("privacy-policy", "/privacy-policy");
}

export default function PrivacyPage() {
  return <CmsPage slug="privacy-policy" />;
}
