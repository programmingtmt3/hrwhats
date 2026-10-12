import type { Dictionary } from "./i18n";

// Slugs double as dictionary keys, so a missing label is a TypeScript error.
// Sector slugs will come from the sectors content collection once it exists.
export const sectorSlugs = [
  "charity",
  "real-estate-contracting",
  "education-training",
  "tourism-hospitality",
  "online-stores-systems",
  "advertising",
  "hr",
  "operating-service",
  "restaurants-cafes",
  "shops",
] as const satisfies readonly (keyof Dictionary["sectors"])[];

export const guideSlugs = [
  "documentation-requirements-for-meta",
  "link-account",
  "hrwhats-guide",
  "whatsapp-ban",
] as const satisfies readonly (keyof Dictionary["guide"])[];

export const legalSlugs = [
  "privacy-policy",
  "terms-of-use",
  "refund-policy",
] as const satisfies readonly (keyof Dictionary["legal"])[];

export type NavLink = { label: string; path: string };
export type NavItem = NavLink | { label: string; children: NavLink[] };

/** Main navigation, in display order. Paths are locale-neutral; wrap with localePath(). */
export function getMainNav(dict: Dictionary): NavItem[] {
  return [
    {
      label: dict.nav.sectors,
      children: sectorSlugs.map((slug) => ({ label: dict.sectors[slug], path: `/${slug}/` })),
    },
    { label: dict.nav.packages, path: "/packages/" },
    {
      label: dict.nav.guide,
      children: guideSlugs.map((slug) => ({ label: dict.guide[slug], path: `/${slug}/` })),
    },
    { label: dict.nav.blog, path: "/news/" },
    { label: dict.nav.contact, path: "/contact/" },
  ];
}

export function getLegalLinks(dict: Dictionary): NavLink[] {
  return legalSlugs.map((slug) => ({ label: dict.legal[slug], path: `/${slug}/` }));
}
