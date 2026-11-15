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
  | "whatsappBan"
  | "sectors"
  | "legal";

type EnglishMessages = Pick<Dictionary, EnglishNamespace> & {
  /** English only: under the title of each English legal page (the Arabic text prevails). */
  legal: { translationNote: string };
};

const english = en satisfies EnglishMessages;

/**
 * The English dictionary, typed as a full Dictionary. Reading a namespace that is
 * not translated yet throws, so an English page that needs one fails the build
 * instead of rendering empty text.
 */
const englishDictionary = new Proxy(english, {
  get(target, key, receiver) {
    if (typeof key === "string" && key in ar && !(key in target)) {
      throw new Error(
        `messages/en.json has no "${key}" yet: translate it before building an English page that uses it.`,
      );
    }
    return Reflect.get(target, key, receiver);
  },
}) as unknown as Dictionary;

const dictionaries: Record<Locale, Dictionary> = { ar, en: englishDictionary };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/**
 * Shown under the title of the English legal pages only: the Arabic version is the
 * original and prevails (docs/en-glossary.md 4.16). Arabic pages have no such note.
 */
export function getLegalTranslationNote(locale: Locale): string | undefined {
  return locale === "en" ? english.legal.translationNote : undefined;
}

export { format } from "./format";
