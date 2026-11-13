import { RealEstatePage, realEstateMetadata } from "@/components/sectors/real-estate/RealEstatePage";

export const metadata = realEstateMetadata("en");

export default function Page() {
  return <RealEstatePage locale="en" />;
}
