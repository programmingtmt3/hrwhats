import type { Metadata } from "next";

import { LOGO } from "./brand";
import { getCurrency, getSite, getWhatsappPlans, t } from "./content";
import { isProduction } from "./env";
import { getDictionary, localePath, type Locale } from "./i18n";
import { toPlainText } from "./inline-links";

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
    // Staging builds must never be indexed; every page inherits this.
    ...(isProduction ? {} : { robots: { index: false, follow: false } }),
    openGraph: {
      siteName: dict.meta.siteName,
      locale: locale === "ar" ? "ar_SA" : "en_US",
      type: "website",
    },
  };
}

/** Home page: title/description from the dictionary, mirrored in Open Graph. */
export function getHomeMetadata(locale: Locale): Metadata {
  const dict = getDictionary(locale);
  const url = localePath(locale, "/");

  return {
    title: { absolute: dict.meta.homeTitle },
    description: dict.meta.homeDescription,
    alternates: { canonical: url },
    openGraph: {
      title: dict.meta.homeTitle,
      description: dict.meta.homeDescription,
      url,
      siteName: dict.meta.siteName,
      locale: locale === "ar" ? "ar_SA" : "en_US",
      type: "website",
    },
  };
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

/** JSON-LD: FAQPage. Answers use the same visible text as the page (link labels kept, markup removed). */
export function faqPageJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: toPlainText(answer) },
    })),
  };
}

/** Inner page metadata: absolute title, description, canonical and Open Graph. */
export function getPageMetadata(
  locale: Locale,
  path: string,
  meta: { title: string; description: string },
): Metadata {
  const dict = getDictionary(locale);
  const url = localePath(locale, path);

  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: { canonical: url },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      siteName: dict.meta.siteName,
      locale: locale === "ar" ? "ar_SA" : "en_US",
      type: "website",
    },
  };
}

/** JSON-LD: BreadcrumbList. `items` are [name, locale-neutral path] from the home page down. */
export function breadcrumbJsonLd(locale: Locale, items: [name: string, path: string][]) {
  const base = getSite().siteUrl;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: `${base}${localePath(locale, path)}`,
    })),
  };
}

/** JSON-LD: one Product + monthly Offer per WhatsApp plan. */
export function whatsappPlansJsonLd(locale: Locale) {
  const site = getSite();
  const url = `${site.siteUrl}${localePath(locale, "/packages/")}`;
  const currency = getCurrency();

  return getWhatsappPlans().map((plan) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${site.name} — ${t(plan.name, locale)}`,
    description: t(plan.description, locale),
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "Offer",
      url,
      price: plan.monthly,
      priceCurrency: currency,
      availability: "https://schema.org/InStock",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: plan.monthly,
        priceCurrency: currency,
        unitCode: "MON",
        referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
      },
    },
  }));
}

/** JSON-LD: ContactPage with the organization's contact points. */
export function contactPageJsonLd(locale: Locale, name: string) {
  const site = getSite();
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name,
    url: `${site.siteUrl}${localePath(locale, "/contact/")}`,
    mainEntity: {
      "@type": "Organization",
      name: site.name,
      url: `${site.siteUrl}/`,
      email: site.contact.email,
      telephone: site.contact.phone.display,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: site.contact.whatsapp.display.replace(/\s/g, ""),
        email: site.contact.email,
        contactType: "customer service",
        availableLanguage: ["Arabic"],
      },
    },
  };
}
