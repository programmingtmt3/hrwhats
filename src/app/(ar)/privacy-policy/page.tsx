import { LegalPage } from "@/components/pages/LegalPage";
import { getDictionary } from "@/lib/i18n";
import { getPageMetadata } from "@/lib/seo";

export const metadata = getPageMetadata("ar", "/privacy-policy/", getDictionary("ar").legal.pages["privacy-policy"].meta);

export default function Page() {
  return <LegalPage locale="ar" slug="privacy-policy" />;
}
