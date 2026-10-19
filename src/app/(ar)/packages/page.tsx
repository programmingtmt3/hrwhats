import { PackagesPage } from "@/components/pages/PackagesPage";
import { getDictionary } from "@/lib/i18n";
import { getPageMetadata } from "@/lib/seo";

export const metadata = getPageMetadata("ar", "/packages/", getDictionary("ar").packagesPage.meta);

export default function Page() {
  return <PackagesPage locale="ar" />;
}
