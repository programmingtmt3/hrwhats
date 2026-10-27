import { StoresPage, storesMetadata } from "@/components/sectors/stores/StoresPage";

export const metadata = storesMetadata("ar");

export default function Page() {
  return <StoresPage locale="ar" />;
}
