import type { ReactNode } from "react";

import { DirectionProvider } from "@/components/ui/direction";
import { getDirection, type Locale } from "@/lib/i18n";

import { Footer } from "./Footer";
import { Header } from "./Header";

type LocaleDocumentProps = {
  locale: Locale;
  /** next/font `variable` class name for this locale. */
  fontClassName: string;
  children: ReactNode;
};

/** The full <html> document shared by root layouts and the global 404 page. */
export function LocaleDocument({ locale, fontClassName, children }: LocaleDocumentProps) {
  const dir = getDirection(locale);

  return (
    <html lang={locale} dir={dir} className={fontClassName}>
      <body className="flex min-h-svh flex-col">
        <DirectionProvider dir={dir}>
          <Header locale={locale} />
          <main className="flex-1">{children}</main>
          <Footer locale={locale} />
        </DirectionProvider>
      </body>
    </html>
  );
}
