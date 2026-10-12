import type { Metadata } from "next";

import { LOGO } from "./brand";
import { getSite } from "./content";
import { getDictionary, localePath, type Locale } from "./i18n";

/** Site-wide defaults set by each root layout. Pages override title/description. */
export function getRootMetadata(locale: Locale): Metadata {
  const dict = getDictionary(locale);
  const site = getSite();

  return {
    metadataBase: new URL(site.siteUrl),
    title: {
      default: dict.meta.homeTitle,
      template: `%s | ${dict.meta.siteName}`,
    },
    description: dict.meta.homeDescription,
    openGraph: {
      siteName: dict.meta.siteName,
      locale: locale === "ar" ? "ar_SA" : "en_US",
      type: "website",
    },
  };
}

/** Home page: title/description are the root defaults; only the canonical is added. */
export function getHomeMetadata(locale: Locale): Metadata {
  return { alternates: { canonical: localePath(locale, "/") } };
}

/** JSON-LD: Organization (site-wide). */
export function organizationJsonLd() {
  const site = getSite();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: `${site.siteUrl}/`,
    logo: `${site.siteUrl}${LOGO.src}`,
    email: site.contact.email,
    telephone: site.contact.phone.display,
    sameAs: site.social.filter((s) => s.platform !== "whatsapp").map((s) => s.url),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: site.contact.whatsapp.display.replace(/\s/g, ""),
      contactType: "customer service",
      availableLanguage: ["Arabic"],
    },
  };
}
