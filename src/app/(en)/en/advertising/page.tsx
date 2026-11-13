import { AdvertisingPage, advertisingMetadata } from "@/components/sectors/advertising/AdvertisingPage";

export const metadata = advertisingMetadata("en");

export default function Page() {
  return <AdvertisingPage locale="en" />;
}
