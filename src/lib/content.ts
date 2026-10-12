/**
 * The only content access layer. Pages and components never import files from
 * content/ directly. Every data file is validated with Zod at build time, so a
 * missing or malformed field fails the build.
 */
import { z } from "zod";

import siteJson from "../../content/data/site.json";
import type { Locale } from "./i18n";

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
