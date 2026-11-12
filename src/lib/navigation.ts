import type { Site } from "./content";
import { localePath, type Dictionary, type Locale } from "./i18n";
import { hasPage } from "./translations";

export type NavLink = {
  label: string;
  /** Locale-neutral internal path (wrap with localePath) or an absolute external URL. */
  href: string;
  external?: boolean;
  /** External link that opens in a new tab (the usage guide). */
  newTab?: boolean;
  /** External content that exists only in Arabic (the usage guide). */
  arabicOnly?: boolean;
  /** Set by localizeLinks when the target is in another language than the page. */
  hrefLang?: Locale;
};

/**
 * Usage-guide column in the footer. The guide lives on docs.hrwhats.com
 * (`docsUrl` in site.json); until its exact page URLs are known, those entries
 * link to the guide's home. "whatsapp-ban" is a page of this site.
 */
const guideSlugs = [
  "hrwhats-guide",
  "link-account",
  "documentation-requirements-for-meta",
  "whatsapp-ban",
] as const satisfies readonly (keyof Dictionary["footer"]["guideLinks"])[];

/** Legal pages, in display order (footer + "other policies" on each legal page). */
export const legalSlugs = [
  "privacy-policy",
  "terms-of-use",
  "refund-policy",
] as const satisfies readonly (keyof Dictionary["legal"]["pages"])[];

export type LegalSlug = (typeof legalSlugs)[number];

/** Header menu, in display order. */
export function getMainNav(dict: Dictionary, site: Site): NavLink[] {
  return [
    { label: dict.nav.home, href: "/" },
    { label: dict.nav.packages, href: "/packages/" },
    { label: dict.nav.blog, href: "/news/" },
    { label: dict.nav.contact, href: "/contact/" },
    { label: dict.nav.whatsappBan, href: "/whatsapp-ban/" },
    // External (docs.hrwhats.com), so it comes last.
    { label: dict.nav.guide, href: site.docsUrl, external: true, newTab: true, arabicOnly: true },
  ];
}

export function getFooterQuickLinks(dict: Dictionary, site: Site): NavLink[] {
  return [
    { label: dict.nav.home, href: "/" },
    { label: dict.nav.packages, href: "/packages/" },
    { label: dict.nav.blog, href: "/news/" },
    { label: dict.nav.contact, href: "/contact/" },
    { label: dict.nav.dashboard, href: site.appUrls.login, external: true },
  ];
}

export function getFooterGuideLinks(dict: Dictionary, site: Site): NavLink[] {
  return guideSlugs.map((slug) =>
    slug === "whatsapp-ban"
      ? { label: dict.footer.guideLinks[slug], href: `/${slug}/` }
      : {
          label: dict.footer.guideLinks[slug],
          href: site.docsUrl,
          external: true,
          newTab: true,
          arabicOnly: true,
        },
  );
}

export function getLegalLinks(dict: Dictionary): NavLink[] {
  return legalSlugs.map((slug) => ({ label: dict.legal.pages[slug].name, href: `/${slug}/` }));
}

/** One internal link inside a section (a button, a card): same rules as localizeLinks. */
export function localizeLink(locale: Locale, path: string, label: string): NavLink {
  return localizeLinks(locale, [{ label, href: path }])[0];
}

/**
 * Links for a page in `locale`: internal paths get the locale prefix when the page
 * exists in that language; otherwise they point to the Arabic page with hrefLang="ar"
 * (no visible tag: decision 2026-11-12). The Arabic-only usage guide gets hrefLang="ar" too.
 */
export function localizeLinks(locale: Locale, links: NavLink[]): NavLink[] {
  return links.map((link) => {
    if (link.external) {
      return link.arabicOnly && locale !== "ar" ? { ...link, hrefLang: "ar" } : link;
    }
    return hasPage(locale, link.href)
      ? { ...link, href: localePath(locale, link.href) }
      : { ...link, href: localePath("ar", link.href), hrefLang: "ar" };
  });
}
