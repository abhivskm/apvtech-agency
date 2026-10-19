import { CmsPage, pageMetadata } from "@/components/site/CmsPage";

export const revalidate = 300;

export function generateMetadata() {
  return pageMetadata("terms-and-conditions", "/terms-and-conditions");
}

export default function TermsPage() {
  return <CmsPage slug="terms-and-conditions" />;
}
