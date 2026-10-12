import { HomePage } from "@/components/pages/HomePage";
import { getHomeMetadata } from "@/lib/seo";

export const metadata = getHomeMetadata("ar");

export default function Page() {
  return <HomePage locale="ar" />;
}
