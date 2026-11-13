import { ContactPage } from "@/components/pages/ContactPage";
import { getDictionary } from "@/lib/i18n";
import { getPageMetadata } from "@/lib/seo";

export const metadata = getPageMetadata("en", "/contact/", getDictionary("en").contactPage.meta);

export default function Page() {
  return <ContactPage locale="en" />;
}
