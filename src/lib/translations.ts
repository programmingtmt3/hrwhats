import { localeConfig, localePath, neutralPath, type Locale } from "./locales";

/**
 * Pages that have an English version, as locale-neutral paths ("/", "/packages/").
 * The only list of translated pages: it drives the language switcher, hreflang,
 * links from English pages (Arabic-only targets keep their Arabic URL, hrefLang="ar") and
 * whether English is published at all. Add a page here in the same change as its
 * route under src/app/(en)/en/ — the build fails if the two differ (velite.config.ts).
 * No dictionary import: client components use this module.
 */
export const englishPaths: readonly string[] = [
  "/",
  "/packages/",
  "/contact/",
  "/whatsapp-ban/",
  "/charity/",
  "/real-estate-contracting/",
  "/education-training/",
  "/tourism-hospitality/",
  "/online-stores-systems/",
  "/advertising/",
  "/hr/",
  "/operating-service/",
  "/restaurants-cafes/",
  "/shops/",
  "/privacy-policy/",
  "/terms-of-use/",
  "/refund-policy/",
];

/** English is published once at least one English page exists. */
export const activeLocales: readonly Locale[] = englishPaths.length ? ["ar", "en"] : ["ar"];

export function isLocaleActive(locale: Locale): boolean {
  return activeLocales.includes(locale);
}

/** Does this page exist in `locale`? Every page exists in Arabic. */
export function hasPage(locale: Locale, path: string): boolean {
  return locale === "ar" || englishPaths.includes(neutralPath(path));
}

/** Strip the locale prefix from a URL path: "/en/packages/" → "/packages/". */
export function stripLocale(locale: Locale, pathname: string): string {
  const prefix = localeConfig[locale].prefix;
  const rest = prefix && (pathname === prefix || pathname.startsWith(`${prefix}/`))
    ? pathname.slice(prefix.length)
    : pathname;
  return neutralPath(rest);
}

/** Language switcher target: the same page in `to` if it exists, otherwise that language's home. */
export function counterpartHref(from: Locale, to: Locale, pathname: string): string {
  const path = stripLocale(from, pathname);
  return hasPage(to, path) ? localePath(to, path) : localePath(to, "/");
}
