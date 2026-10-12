import "../globals.css";

import { LocaleDocument } from "@/components/layout/LocaleDocument";
import { arabicFont } from "@/lib/fonts/ar";
import { getRootMetadata } from "@/lib/seo";

export const metadata = getRootMetadata("ar");

export default function ArabicLayout({ children }: LayoutProps<"/">) {
  return (
    <LocaleDocument locale="ar" fontClassName={arabicFont.variable}>
      {children}
    </LocaleDocument>
  );
}
