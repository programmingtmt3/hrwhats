import { TourismPage, tourismMetadata } from "@/components/sectors/tourism/TourismPage";

export const metadata = tourismMetadata("en");

export default function Page() {
  return <TourismPage locale="en" />;
}
