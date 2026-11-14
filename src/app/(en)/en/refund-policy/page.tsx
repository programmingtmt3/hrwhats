import { LegalPage } from "@/components/pages/LegalPage";
import { getDictionary } from "@/lib/i18n";
import { getPageMetadata } from "@/lib/seo";

export const metadata = getPageMetadata("en", "/refund-policy/", getDictionary("en").legal.pages["refund-policy"].meta);

export default function Page() {
  return <LegalPage locale="en" slug="refund-policy" />;
}
