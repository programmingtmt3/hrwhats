import type { Metadata } from "next";

import { LOGO } from "./brand";
import { getCurrency, getSite, getStartingMonthlyPrice, getWhatsappPlans, tRequired, type Post } from "./content";
import { isProduction } from "./env";
import { format, getDictionary, localePath, type Locale } from "./i18n";
import { toPlainText } from "./inline-links";
import { hasPage } from "./translations";

/**
 * hreflang alternates (ar, en, x-default → Arabic), only for pages that exist in English
 * (src/lib/translations.ts). Arabic-only pages get none.
 */
function languageAlternates(path: string): { languages?: Record<string, string> } {
  if (!hasPage("en", path)) return {};
  const ar = localePath("ar", path);
  return { languages: { ar, en: localePath("en", path), "x-default": ar } };
}

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
  const path = "/";
  const url = localePath(locale, path);

  return {
    title: { absolute: dict.meta.homeTitle },
    description: dict.meta.homeDescription,
    alternates: { canonical: url, ...languageAlternates(path) },
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

type OgImage = { url: string; width: number; height: number; alt: string };

/** Inner page metadata: absolute title, description, canonical and Open Graph (optional page image). */
export function getPageMetadata(
  locale: Locale,
  path: string,
  meta: { title: string; description: string },
  image?: OgImage,
): Metadata {
  const dict = getDictionary(locale);
  const url = localePath(locale, path);

  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: { canonical: url, ...languageAlternates(path) },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      siteName: dict.meta.siteName,
      locale: locale === "ar" ? "ar_SA" : "en_US",
      type: "website",
      ...(image && { images: [image] }),
    },
  };
}

/**
 * Packages page metadata. `{price}` in the description (English) is the lowest monthly
 * WhatsApp plan from packages.json, never typed in a translation.
 */
export function getPackagesMetadata(locale: Locale): Metadata {
  const meta = getDictionary(locale).packagesPage.meta;
  const price = getStartingMonthlyPrice().toLocaleString("en-US");
  return getPageMetadata(locale, "/packages/", { ...meta, description: format(meta.description, { price }) });
}

/** JSON-LD: Service offered by the organization to one audience (sector pages). */
export function serviceJsonLd(
  locale: Locale,
  service: { name: string; description: string; path: string; audience: string },
) {
  const site = getSite();
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    url: `${site.siteUrl}${localePath(locale, service.path)}`,
    provider: { "@type": "Organization", name: site.name, url: `${site.siteUrl}/` },
    audience: { "@type": "Audience", audienceType: service.audience },
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
    name: `${site.name} — ${tRequired(plan.name, locale)}`,
    description: tRequired(plan.description, locale),
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

/** A post's final URL in raw Arabic, exactly as WordPress writes it (canonical, og:url, JSON-LD). */
export function getPostUrl(post: Post): string {
  return `${getSite().siteUrl}/${post.slug}/`;
}

/**
 * Post metadata. No alternates.canonical and no openGraph.url: Next would percent-encode
 * them, so the post page renders both tags itself with the raw Arabic URL.
 */
export function getPostMetadata(locale: Locale, post: Post): Metadata {
  return {
    title: { absolute: post.seoTitle },
    description: post.description,
    openGraph: {
      title: post.seoTitle,
      description: post.description,
      siteName: getDictionary(locale).meta.siteName,
      locale: locale === "ar" ? "ar_SA" : "en_US",
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated,
    },
  };
}

/** JSON-LD: Article. The organization is both author and publisher. */
export function articleJsonLd(post: Post) {
  const site = getSite();
  const organization = {
    "@type": "Organization",
    name: site.name,
    url: `${site.siteUrl}/`,
    logo: `${site.siteUrl}${LOGO.src}`,
  };
  const url = getPostUrl(post);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: url,
    datePublished: post.date,
    dateModified: post.updated,
    author: organization,
    publisher: organization,
  };
}
