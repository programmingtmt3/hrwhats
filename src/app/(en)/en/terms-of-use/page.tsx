import { LegalPage } from "@/components/pages/LegalPage";
import { getDictionary } from "@/lib/i18n";
import { getPageMetadata } from "@/lib/seo";

export const metadata = getPageMetadata("en", "/terms-of-use/", getDictionary("en").legal.pages["terms-of-use"].meta);

export default function Page() {
  return <LegalPage locale="en" slug="terms-of-use" />;
}
