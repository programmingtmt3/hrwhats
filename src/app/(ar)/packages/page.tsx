import { PackagesPage } from "@/components/pages/PackagesPage";
import { getPackagesMetadata } from "@/lib/seo";

export const metadata = getPackagesMetadata("ar");

export default function Page() {
  return <PackagesPage locale="ar" />;
}
