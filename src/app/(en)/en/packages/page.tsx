import { PackagesPage } from "@/components/pages/PackagesPage";
import { getPackagesMetadata } from "@/lib/seo";

export const metadata = getPackagesMetadata("en");

export default function Page() {
  return <PackagesPage locale="en" />;
}
