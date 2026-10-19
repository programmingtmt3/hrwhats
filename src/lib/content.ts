/**
 * The only content access layer. Pages and components never import files from
 * content/ directly. Every data file is validated with Zod at build time, so a
 * missing or malformed field fails the build.
 */
import { z } from "zod";

import clientsJson from "../../content/data/clients.json";
import faqJson from "../../content/data/faq.json";
import packagesJson from "../../content/data/packages.json";
import partnersJson from "../../content/data/partners.json";
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
  /** "+N" in the home trust bar — edited by hand. */
  trustedCount: z.number().int().positive(),
  appUrls: z.object({ login: z.url(), signup: z.url() }),
  /** Contact form endpoint (PHP on the same host). */
  contactEndpoint: z.string().startsWith("/"),
  /** Cloudflare Turnstile site key (public). Empty → see getTurnstileSiteKey(). */
  turnstileSiteKey: z.string(),
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

/** Cloudflare's official test site key: always passes. */
const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";

/**
 * Turnstile site key. While `turnstileSiteKey` in site.json is empty, dev uses
 * Cloudflare's always-pass test key and a production build FAILS, so the site
 * never ships with a broken form. `ALLOW_TURNSTILE_TEST_KEY=1` lets a local
 * production build through (never for a real deploy).
 */
export function getTurnstileSiteKey(): string {
  if (site.turnstileSiteKey) return site.turnstileSiteKey;
  if (process.env.NODE_ENV !== "production") return TURNSTILE_TEST_SITE_KEY;
  if (process.env.ALLOW_TURNSTILE_TEST_KEY === "1") {
    console.warn("⚠ Using the Turnstile TEST key (ALLOW_TURNSTILE_TEST_KEY=1). Do not deploy this build.");
    return TURNSTILE_TEST_SITE_KEY;
  }
  throw new Error(
    "Turnstile site key is missing: set \"turnstileSiteKey\" in content/data/site.json " +
      "(Cloudflare dashboard → Turnstile → your site → Site Key). See docs/contact-form-setup.md.",
  );
}

/** Logo file: `/images/{clients|partners}/NN-ascii-name.ext` + intrinsic size. */
const logo = (folder: string) =>
  z.object({
    src: z.string().regex(new RegExp(`^/images/${folder}/\\d{2}-[a-z0-9-]+\\.(png|jpg|jpeg|webp|svg)$`)),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  });

/** Display order = the two-digit number at the start of each logo file name. */
const orderedByLogo = <T extends { logo: { src: string } }>(list: T[]) =>
  list.every((item, i) => item.logo.src.split("/").pop()!.startsWith(String(i + 1).padStart(2, "0") + "-"));

const clientSchema = z.object({ name: localized, logo: logo("clients") });
export type Client = z.infer<typeof clientSchema>;

const clients = z
  .array(clientSchema)
  .min(1)
  .refine(orderedByLogo, "clients must be listed in logo-number order (01-, 02-, …)")
  .parse(clientsJson);

export function getClients(): Client[] {
  return clients;
}

const partnerSchema = z.object({ name: localized, logo: logo("partners") });
export type Partner = z.infer<typeof partnerSchema>;

const partners = z
  .array(partnerSchema)
  .min(1)
  .refine(orderedByLogo, "partners must be listed in logo-number order (01-, 02-, …)")
  .parse(partnersJson);

export function getPartners(): Partner[] {
  return partners;
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

// Packages. Yearly savings are computed (monthly × 12 − yearly), never written by hand.
const unlimited = z.literal("unlimited");
const whatsappPlanSchema = z
  .object({
    id: slug,
    name: localized,
    description: localized,
    monthly: z.number().positive(),
    yearly: z.number().positive(),
    featured: z.boolean(),
    features: z.object({
      campaigns: z.union([z.number().int().positive(), unlimited]),
      messages: z.union([z.number().int().positive(), unlimited]),
      contacts: z.union([z.number().int().positive(), unlimited]),
      quickReplies: z.union([z.number().int().positive(), unlimited]),
      users: z.union([z.number().int().positive(), unlimited]),
      qrLeads: z.boolean(),
      /** false = not available; a number = results per month. */
      mapsLeads: z.union([z.literal(false), z.number().int().positive()]),
    }),
  })
  .transform((plan) => ({ ...plan, yearlySavings: plan.monthly * 12 - plan.yearly }))
  .refine((plan) => plan.yearlySavings >= 0, {
    message: "yearly price is higher than 12 × monthly (negative savings)",
  });
export type WhatsappPlan = z.infer<typeof whatsappPlanSchema>;
export type WhatsappFeatureKey = keyof WhatsappPlan["features"];

const hiringPlanSchema = z.object({
  id: slug,
  name: localized,
  tagline: localized,
  price: z.number().positive(),
  period: z.enum(["day", "week", "month"]),
  usage: localized,
  hours: localized,
});
export type HiringPlan = z.infer<typeof hiringPlanSchema>;

const packages = z
  .object({
    currency: z.literal("SAR"),
    whatsapp: z.array(whatsappPlanSchema).min(1),
    hiring: z.array(hiringPlanSchema).min(1),
  })
  .refine((p) => p.whatsapp.filter((plan) => plan.featured).length <= 1, "at most one featured plan")
  .parse(packagesJson);

export function getWhatsappPlans(): WhatsappPlan[] {
  return packages.whatsapp;
}

export function getHiringPlans(): HiringPlan[] {
  return packages.hiring;
}

export function getCurrency() {
  return packages.currency;
}
