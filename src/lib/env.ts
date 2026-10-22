/**
 * Build target. SITE_ENV=production only for the real launch; anything else
 * (including unset) builds a staging site that search engines must not index.
 */
export type SiteEnv = "staging" | "production";

function readSiteEnv(): SiteEnv {
  const value = process.env.SITE_ENV?.trim();
  if (!value || value === "staging") return "staging";
  if (value === "production") return "production";
  throw new Error(`Invalid SITE_ENV "${value}" — use "staging" or "production".`);
}

export const SITE_ENV: SiteEnv = readSiteEnv();
export const isProduction = SITE_ENV === "production";
