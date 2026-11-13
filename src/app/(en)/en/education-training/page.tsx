import { EducationPage, educationMetadata } from "@/components/sectors/education/EducationPage";

export const metadata = educationMetadata("en");

export default function Page() {
  return <EducationPage locale="en" />;
}
