import { LegalPage } from "@/components/pages/LegalPage";
import { getDictionary } from "@/lib/i18n";
import { getPageMetadata } from "@/lib/seo";

export const metadata = getPageMetadata("ar", "/refund-policy/", getDictionary("ar").legal.pages["refund-policy"].meta);

export default function Page() {
  return <LegalPage locale="ar" slug="refund-policy" />;
}
