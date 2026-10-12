import type { ReactNode } from "react";

import { JsonLd } from "@/components/seo/JsonLd";
import { getDirection, type Locale } from "@/lib/i18n";
import { organizationJsonLd } from "@/lib/seo";

import { Footer } from "./Footer";
import { Header } from "./Header";
import { WhatsAppFloat } from "./WhatsAppFloat";

type LocaleDocumentProps = {
  locale: Locale;
  /** next/font `variable` class name for this locale. */
  fontClassName: string;
  children: ReactNode;
};

/** The full <html> document shared by root layouts and the global 404 page. */
export function LocaleDocument({ locale, fontClassName, children }: LocaleDocumentProps) {
  return (
    <html lang={locale} dir={getDirection(locale)} className={fontClassName}>
      <body>
        {/* Without JS, scroll-reveal elements would stay invisible. */}
        <noscript>
          <style>{".reveal{opacity:1;transform:none}"}</style>
        </noscript>
        <JsonLd data={organizationJsonLd()} />
        <Header locale={locale} />
        <main>{children}</main>
        <Footer locale={locale} />
        <WhatsAppFloat locale={locale} />
      </body>
    </html>
  );
}
