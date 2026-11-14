import { LegalPage } from "@/components/pages/LegalPage";
import { getDictionary } from "@/lib/i18n";
import { getPageMetadata } from "@/lib/seo";

export const metadata = getPageMetadata("en", "/privacy-policy/", getDictionary("en").legal.pages["privacy-policy"].meta);

export default function Page() {
  return <LegalPage locale="en" slug="privacy-policy" />;
}
