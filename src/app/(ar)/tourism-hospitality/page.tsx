import { TourismPage, tourismMetadata } from "@/components/sectors/tourism/TourismPage";

export const metadata = tourismMetadata("ar");

export default function Page() {
  return <TourismPage locale="ar" />;
}
