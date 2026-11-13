import { CharityPage, charityMetadata } from "@/components/sectors/charity/CharityPage";

export const metadata = charityMetadata("en");

export default function Page() {
  return <CharityPage locale="en" />;
}
