import ar from "../../messages/ar.json";

export const localeConfig = {
  ar: { dir: "rtl", prefix: "" },
  en: { dir: "ltr", prefix: "/en" },
} as const;

export type Locale = keyof typeof localeConfig;
export type Direction = (typeof localeConfig)[Locale]["dir"];

export const defaultLocale: Locale = "ar";

// Locales that are actually published. Add "en" in the English phase,
// together with messages/en.json.
export const activeLocales: readonly Locale[] = ["ar"];

export function isLocaleActive(locale: Locale): boolean {
  return activeLocales.includes(locale);
}

export function getDirection(locale: Locale): Direction {
  return localeConfig[locale].dir;
}

// The Arabic dictionary is the source of truth for the shape of all dictionaries.
export type Dictionary = typeof ar;

// English phase: add `en` (typed with `satisfies Dictionary` so any missing key
// is a TypeScript error) and change this to a full Record<Locale, Dictionary>.
const dictionaries: Partial<Record<Locale, Dictionary>> = { ar };

export function getDictionary(locale: Locale): Dictionary {
  const dictionary = dictionaries[locale];
  if (!dictionary) {
    throw new Error(`No dictionary for locale "${locale}"`);
  }
  return dictionary;
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

/** Replace `{name}` placeholders in a dictionary string. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
