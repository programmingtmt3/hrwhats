import { OperatingPage, operatingMetadata } from "@/components/sectors/operating/OperatingPage";

export const metadata = operatingMetadata("en");

export default function Page() {
  return <OperatingPage locale="en" />;
}
