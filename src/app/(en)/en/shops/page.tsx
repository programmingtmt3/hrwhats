import { ShopsPage, shopsMetadata } from "@/components/sectors/shops/ShopsPage";

export const metadata = shopsMetadata("en");

export default function Page() {
  return <ShopsPage locale="en" />;
}
