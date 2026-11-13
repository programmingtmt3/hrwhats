import { StoresPage, storesMetadata } from "@/components/sectors/stores/StoresPage";

export const metadata = storesMetadata("en");

export default function Page() {
  return <StoresPage locale="en" />;
}
