import { LegalPage } from "@/components/pages/LegalPage";
import { getDictionary } from "@/lib/i18n";
import { getPageMetadata } from "@/lib/seo";

export const metadata = getPageMetadata("ar", "/terms-of-use/", getDictionary("ar").legal.pages["terms-of-use"].meta);

export default function Page() {
  return <LegalPage locale="ar" slug="terms-of-use" />;
}
