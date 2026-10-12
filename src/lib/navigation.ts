import type { Site } from "./content";
import type { Dictionary } from "./i18n";

export type NavLink = {
  label: string;
  /** Locale-neutral internal path (wrap with localePath) or an absolute external URL. */
  href: string;
  external?: boolean;
};

const guideSlugs = [
  "hrwhats-guide",
  "link-account",
  "documentation-requirements-for-meta",
  "whatsapp-ban",
] as const satisfies readonly (keyof Dictionary["footer"]["guideLinks"])[];

const legalSlugs = [
  "privacy-policy",
  "terms-of-use",
  "refund-policy",
] as const satisfies readonly (keyof Dictionary["footer"]["legalLinks"])[];

/** Header menu, in display order. */
export function getMainNav(dict: Dictionary): NavLink[] {
  return [
    { label: dict.nav.home, href: "/" },
    { label: dict.nav.packages, href: "/packages/" },
    { label: dict.nav.blog, href: "/news/" },
    { label: dict.nav.guide, href: "/hrwhats-guide/" },
    { label: dict.nav.contact, href: "/contact/" },
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

export function getFooterGuideLinks(dict: Dictionary): NavLink[] {
  return guideSlugs.map((slug) => ({ label: dict.footer.guideLinks[slug], href: `/${slug}/` }));
}

export function getLegalLinks(dict: Dictionary): NavLink[] {
  return legalSlugs.map((slug) => ({ label: dict.footer.legalLinks[slug], href: `/${slug}/` }));
}
