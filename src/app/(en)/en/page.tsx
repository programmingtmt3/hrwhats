import { HomePage } from "@/components/pages/HomePage";
import { getHomeMetadata } from "@/lib/seo";

export const metadata = getHomeMetadata("en");

export default function Page() {
  return <HomePage locale="en" />;
}
