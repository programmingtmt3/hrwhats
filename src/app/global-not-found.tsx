import "./globals.css";

import type { Metadata } from "next";

import { LocaleDocument } from "@/components/layout/LocaleDocument";
import { NotFoundPage } from "@/components/pages/NotFoundPage";
import { arabicFont } from "@/lib/fonts/ar";
import { getDictionary } from "@/lib/i18n";
import { getRootMetadata } from "@/lib/seo";

// Exported as out/404.html and served for every unknown URL (ErrorDocument in
// .htaccess), so it uses the default locale.
export const metadata: Metadata = {
  ...getRootMetadata("ar"),
  title: getDictionary("ar").notFound.title,
};

export default function GlobalNotFound() {
  return (
    <LocaleDocument locale="ar" fontClassName={arabicFont.variable}>
      <NotFoundPage locale="ar" />
    </LocaleDocument>
  );
}
