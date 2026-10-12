/**
 * The only content access layer. Pages and components never import files from
 * content/ directly. Every data file is validated with Zod at build time, so a
 * missing or malformed field fails the build.
 */
import { z } from "zod";

import clientsJson from "../../content/data/clients.json";
import faqJson from "../../content/data/faq.json";
import sectorsJson from "../../content/data/sectors.json";
import siteJson from "../../content/data/site.json";
import type { Locale } from "./i18n";
import { hasOnlyInternalLinks } from "./inline-links";

/** Bilingual text field. `en` may be empty until the English phase. */
const localized = z.object({ ar: z.string().min(1), en: z.string() });
export type Localized = z.infer<typeof localized>;

/** Pick the text for a locale, falling back to Arabic while `en` is empty. */
export function t(value: Localized, locale: Locale): string {
  return value[locale] || value.ar;
}

const siteSchema = z.object({
  siteUrl: z.url(),
  name: z.string().min(1),
  appUrls: z.object({ login: z.url(), signup: z.url() }),
  contact: z.object({
    phone: z.object({ display: z.string().min(1), href: z.string().startsWith("tel:") }),
    email: z.email(),
    whatsapp: z.object({ display: z.string().min(1), url: z.url() }),
  }),
  social: z.array(
    z.object({
      platform: z.enum(["instagram", "x", "youtube", "whatsapp"]),
      label: z.string().min(1),
      url: z.url(),
    }),
  ),
  publisher: z.object({ name: localized, url: z.url() }),
});

export type Site = z.infer<typeof siteSchema>;
export type SocialPlatform = Site["social"][number]["platform"];

const site = siteSchema.parse(siteJson);

export function getSite(): Site {
  return site;
}

// Logos are added (and made required) when the clients section is built.
const clientSchema = z.object({ name: localized });
export type Client = z.infer<typeof clientSchema>;

const clients = z.array(clientSchema).min(1).parse(clientsJson);

export function getClients(): Client[] {
  return clients;
}

/** Shown as "+N" in the trust bar: the client count rounded down to a multiple of 10. */
export function getClientCountRounded(): number {
  return Math.floor(clients.length / 10) * 10;
}

/** Clean ASCII kebab-case slug, as used in URLs (/charity/). */
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase ASCII kebab-case");

// Sectors: one list feeding the home grid, navigation and (later) sector pages.
const sectorSchema = z.object({
  slug,
  name: localized,
  image: z.string().regex(/^\/images\/sectors\/[a-z0-9-]+\.(jpg|png|webp)$/),
});
export type Sector = z.infer<typeof sectorSchema>;

const sectors = z
  .array(sectorSchema)
  .min(1)
  .refine((list) => new Set(list.map((s) => s.slug)).size === list.length, "duplicate sector slug")
  .parse(sectorsJson);

export function getSectors(): Sector[] {
  return sectors;
}

// FAQ: answers may contain `[label](/path/)` links (see lib/inline-links.ts), never raw HTML.
const answerText = z.string().refine(hasOnlyInternalLinks, "answer: only [label](/internal-path/) links, no HTML");
const faqSchema = z.object({
  question: localized,
  answer: z.object({ ar: answerText.pipe(z.string().min(1)), en: answerText }),
});
export type FaqItem = z.infer<typeof faqSchema>;

const faq = z.array(faqSchema).min(1).parse(faqJson);

export function getFaq(): FaqItem[] {
  return faq;
}
