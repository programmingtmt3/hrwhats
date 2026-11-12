/**
 * The only content access layer. Pages and components never import files from
 * content/ directly. Every data file is validated with Zod at build time, so a
 * missing or malformed field fails the build.
 */
import { z } from "zod";

import { posts, type Post } from "#site/content";

import categoriesJson from "../../content/data/categories.json";
import clientsJson from "../../content/data/clients.json";
import faqJson from "../../content/data/faq.json";
import packagesJson from "../../content/data/packages.json";
import partnersJson from "../../content/data/partners.json";
import sectorsJson from "../../content/data/sectors.json";
import siteJson from "../../content/data/site.json";
import { isProduction } from "./env";
import type { Locale } from "./i18n";
import { hasOnlyAllowedLinks } from "./inline-links";

/** Bilingual text field. `en` may be empty until the English phase. */
const localized = z.object({ ar: z.string().min(1), en: z.string() });
export type Localized = z.infer<typeof localized>;

/**
 * Pick the text for a locale, falling back to Arabic while `en` is empty. Use it only
 * where Arabic is an acceptable fallback (client/partner logo names); visible text on
 * an English page uses tRequired.
 */
export function t(value: Localized, locale: Locale): string {
  return value[locale] || value.ar;
}

/** Pick the text for a locale; an empty translation fails the build. */
export function tRequired(value: Localized, locale: Locale): string {
  const text = value[locale];
  if (!text) {
    throw new Error(`Missing "${locale}" text for "${value.ar}" in content/data/.`);
  }
  return text;
}

const siteSchema = z.object({
  siteUrl: z.url(),
  name: z.string().min(1),
  appUrls: z.object({ login: z.url(), signup: z.url() }),
  /** Usage guide (another site, built by another team). */
  docsUrl: z.url(),
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
 * Cloudflare's always-pass test key and a `next build` FAILS, so the site never
 * ships with a broken form. `ALLOW_TURNSTILE_TEST_KEY=1` allows the test key in
 * staging builds only; with SITE_ENV=production it always fails the build.
 */
export function getTurnstileSiteKey(): string {
  const allowTestKey = process.env.ALLOW_TURNSTILE_TEST_KEY === "1";
  // Never in a production build, whatever the key.
  if (allowTestKey && isProduction) {
    throw new Error("ALLOW_TURNSTILE_TEST_KEY=1 is not allowed with SITE_ENV=production.");
  }
  if (site.turnstileSiteKey) return site.turnstileSiteKey;
  if (process.env.NODE_ENV !== "production") return TURNSTILE_TEST_SITE_KEY;
  if (allowTestKey) {
    console.warn("⚠ Using the Turnstile TEST key (ALLOW_TURNSTILE_TEST_KEY=1). Staging only — never deploy as production.");
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

const partnerSchema = z.object({
  name: localized,
  logo: logo("partners"),
  /**
   * Locales where this logo is not shown. Meta Business Suite is hidden on English
   * pages: under "Our partners" it would read as a Meta partnership (docs/en-glossary.md 4.10).
   */
  hiddenIn: z.array(z.enum(["ar", "en"])).optional(),
});
export type Partner = z.infer<typeof partnerSchema>;

const partners = z
  .array(partnerSchema)
  .min(1)
  .refine(orderedByLogo, "partners must be listed in logo-number order (01-, 02-, …)")
  .parse(partnersJson);

/** Partners shown on a `locale` page (without those hidden in that locale). */
export function getPartners(locale: Locale): Partner[] {
  return partners.filter((partner) => !partner.hiddenIn?.includes(locale));
}


/** Clean ASCII kebab-case slug, as used in URLs (/charity/). */
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase ASCII kebab-case");

// Sectors: one list feeding the home grid, navigation and (later) sector pages.
const sectorSchema = z.object({
  slug,
  name: localized,
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

/** One sector by slug. Each sector page has its own static route, so a missing slug fails the build. */
export function getSector(slug: string): Sector {
  const sector = sectors.find((s) => s.slug === slug);
  if (!sector) throw new Error(`Sector "${slug}" is not in content/data/sectors.json`);
  return sector;
}

// FAQ: answers may contain `[label](/path/)` links (see lib/inline-links.ts), never raw HTML.
const answerText = z.string().refine(hasOnlyAllowedLinks, "answer: only [label](/internal-path/) or [label](docs:/path/) links, no HTML");
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

/** Lowest monthly WhatsApp plan price ("من N ر.س" in the home trust bar). */
export function getStartingMonthlyPrice(): number {
  return Math.min(...packages.whatsapp.map((plan) => plan.monthly));
}

export function getCurrency() {
  return packages.currency;
}

const categorySchema = z.object({ slug: z.string().min(1), name: localized });
export type Category = z.infer<typeof categorySchema>;

const categories = z.array(categorySchema).parse(categoriesJson);

/** Throws on an unknown slug, so a typo fails the build. */
export function getCategory(slug: string): Category {
  const category = categories.find((item) => item.slug === slug);
  if (!category) throw new Error(`Unknown category "${slug}" in content/data/categories.json`);
  return category;
}

export type { Post };

/** Posts of a locale, newest first. Frontmatter is validated in velite.config.ts. */
export function getPosts(locale: Locale): Post[] {
  return posts
    .filter((post) => post.locale === locale)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** The page receives the slug percent-encoded and generateMetadata receives it decoded. */
export function getPostBySlug(locale: Locale, slug: string): Post | undefined {
  const decoded = decodeURIComponent(slug).normalize("NFC");
  return getPosts(locale).find((post) => post.slug === decoded);
}

/** Every category, in the order of categories.json (the blog's category bar). */
export function getCategories(): Category[] {
  return categories;
}

/** Posts of a locale listed under one category, newest first. */
export function getPostsInCategory(locale: Locale, slug: string): Post[] {
  getCategory(slug);
  return getPosts(locale).filter((post) => post.categories.includes(slug));
}

/** Newest posts sharing a category with this one. */
export function getRelatedPosts(locale: Locale, post: Post, limit = 3): Post[] {
  return getPosts(locale)
    .filter((other) => other.slug !== post.slug)
    .filter((other) => other.categories.some((slug) => post.categories.includes(slug)))
    .slice(0, limit);
}
