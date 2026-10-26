import { CharityPage, charityMetadata } from "@/components/sectors/charity/CharityPage";

export const metadata = charityMetadata("ar");

export default function Page() {
  return <CharityPage locale="ar" />;
}
