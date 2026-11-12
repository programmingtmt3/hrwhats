import "../../globals.css";

import type { ReactNode } from "react";

import { LocaleDocument } from "@/components/layout/LocaleDocument";
import { latinFont } from "@/lib/fonts/en";
import { getRootMetadata } from "@/lib/seo";

export const metadata = getRootMetadata("en");

/** English root layout (/en/…). Each page here is also listed in src/lib/translations.ts. */
export default function EnglishLayout({ children }: { children: ReactNode }) {
  return (
    <LocaleDocument locale="en" fontClassName={latinFont.variable}>
      {children}
    </LocaleDocument>
  );
}
