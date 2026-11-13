import ar from "../../messages/ar.json";
import en from "../../messages/en.json";

import type { Locale } from "./locales";

export * from "./locales";
export { activeLocales, isLocaleActive } from "./translations";

// The Arabic dictionary is the source of truth for the shape of all dictionaries.
export type Dictionary = typeof ar;

/**
 * Namespaces of messages/en.json. A page's namespace is added here (and to en.json)
 * when that page is translated; a missing key inside a listed namespace is a
 * TypeScript error.
 */
type EnglishNamespace =
  | "meta"
  | "nav"
  | "footer"
  | "waFloat"
  | "languageSwitcher"
  | "notFound"
  | "home"
  | "packagesPage"
  | "contactPage"
  | "whatsappBan";

/**
 * Sector pages are translated one by one: `sectors` in en.json holds only these
 * (each with the full shape of its Arabic entry). Add a sector's key here when its
 * page is translated.
 */
type EnglishSector = "charity" | "realEstate" | "education";

type EnglishMessages = Pick<Dictionary, EnglishNamespace> & {
  sectors: Pick<Dictionary["sectors"], EnglishSector>;
  /** Names only: the footer links to the Arabic legal pages until they are translated. */
  legal: { pages: { [Slug in keyof Dictionary["legal"]["pages"]]: { name: string } } };
  /** English only: the code-drawn badge that replaces the "Meta Business Partner" image. */
  metaBadge: { name: string; status: string };
};

const english = en satisfies EnglishMessages;

/**
 * The English dictionary, typed as a full Dictionary. Reading a namespace that is
 * not translated yet throws, so an English page that needs one fails the build
 * instead of rendering empty text.
 */
function untranslatedGuard<T extends object>(target: T, source: object, prefix: string): T {
  return new Proxy(target, {
    get(obj, key, receiver) {
      if (typeof key === "string" && key in source && !(key in obj)) {
        throw new Error(
          `messages/en.json has no "${prefix}${key}" yet: translate it before building an English page that uses it.`,
        );
      }
      return Reflect.get(obj, key, receiver);
    },
  });
}

const englishDictionary = untranslatedGuard(
  { ...english, sectors: untranslatedGuard(english.sectors, ar.sectors, "sectors.") },
  ar,
  "",
) as unknown as Dictionary;

const dictionaries: Record<Locale, Dictionary> = { ar, en: englishDictionary };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/**
 * English pages never show the "Meta Business Partner" image (HRwhats is a Meta Tech
 * Provider); they show MetaTechBadge, whose text is this. docs/en-glossary.md 4.10.
 */
export function getMetaBadgeText(): EnglishMessages["metaBadge"] {
  return english.metaBadge;
}

export { format } from "./format";
