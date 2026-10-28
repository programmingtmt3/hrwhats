import { AdvertisingPage, advertisingMetadata } from "@/components/sectors/advertising/AdvertisingPage";

export const metadata = advertisingMetadata("ar");

export default function Page() {
  return <AdvertisingPage locale="ar" />;
}
