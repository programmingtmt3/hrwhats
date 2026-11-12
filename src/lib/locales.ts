/**
 * Locales and URL prefixes. No dictionary import, so client components can use it
 * without bundling the messages; `@/lib/i18n` re-exports everything here.
 */
export const localeConfig = {
  ar: { dir: "rtl", prefix: "" },
  en: { dir: "ltr", prefix: "/en" },
} as const;

export type Locale = keyof typeof localeConfig;
export type Direction = (typeof localeConfig)[Locale]["dir"];

export const defaultLocale: Locale = "ar";

export function getDirection(locale: Locale): Direction {
  return localeConfig[locale].dir;
}

/**
 * Build an internal URL for a locale. Always returns a trailing slash.
 * localePath("ar", "/packages") → "/packages/"
 * localePath("en", "/packages") → "/en/packages/"
 */
export function localePath(locale: Locale, path: string = "/"): string {
  const clean = path.replace(/^\/+|\/+$/g, "");
  const prefix = localeConfig[locale].prefix;
  return clean ? `${prefix}/${clean}/` : `${prefix}/`;
}

/** Locale-neutral form of a path: leading and trailing slash ("/packages/", "/"). */
export function neutralPath(path: string): string {
  return localePath(defaultLocale, path);
}
