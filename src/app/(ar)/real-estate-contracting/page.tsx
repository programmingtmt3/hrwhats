import { RealEstatePage, realEstateMetadata } from "@/components/sectors/real-estate/RealEstatePage";

export const metadata = realEstateMetadata("ar");

export default function Page() {
  return <RealEstatePage locale="ar" />;
}
