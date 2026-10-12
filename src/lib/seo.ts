import type { Metadata } from "next";

import { getDictionary, type Locale } from "./i18n";
import { SITE_URL } from "./site";

/** Site-wide defaults set by each root layout. Pages override title/description. */
export function getRootMetadata(locale: Locale): Metadata {
  const dict = getDictionary(locale);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: dict.meta.siteName,
      template: `%s | ${dict.meta.siteName}`,
    },
    description: dict.meta.defaultDescription,
    openGraph: {
      siteName: dict.meta.siteName,
      locale: locale === "ar" ? "ar_SA" : "en_US",
      type: "website",
    },
  };
}
