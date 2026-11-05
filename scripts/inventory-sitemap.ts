/**
 * Read-only snapshot of every URL in the current WordPress (Yoast) sitemap.
 *
 *   node scripts/inventory-sitemap.ts
 *
 * Writes scripts/data/wp-sitemap-urls.json — the first of the three URL sources
 * for scripts/test-redirects.ts. The live sitemap disappears on launch day, so
 * this snapshot is the only lasting record of it, including its image URLs.
 *
 * Polite by design: one request at a time, about a second apart, no retries, no
 * credentials. Any redirect, non-200 status or non-XML body stops the run at
 * once, and the data file is written only after the whole inventory succeeds.
 */
import { existsSync, mkdirSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const INDEX_URL = "https://hrwhats.com/sitemap_index.xml";
const ALLOWED_ORIGIN = "https://hrwhats.com";
const USER_AGENT = "HRwhats-URL-Inventory/1.0 (read-only migration audit)";
const TIMEOUT_MS = 30_000;
const DELAY_MS = 1_000;
const MAX_SLUG_BYTES = 255;

const OUTPUT_FILE = join("scripts", "data", "wp-sitemap-urls.json");
const AR_ROUTES_DIR = join("src", "app", "(ar)");

const TYPE_ORDER = ["post", "page", "category", "tag", "author", "other"] as const;
type UrlType = (typeof TYPE_ORDER)[number];

const SITEMAP_TYPES: Record<string, UrlType> = {
  post: "post",
  page: "page",
  category: "category",
  post_tag: "tag",
  author: "author",
};

type SitemapEntry = { loc: string; type: UrlType; lastmod: string | null; urlCount: number };

type UrlEntry = {
  rawLoc: string;
  path: string | null;
  type: UrlType;
  lastmod: string | null;
  sitemap: string;
  images: string[];
};

type Anomaly = { kind: string; detail: string };

/** Ends the run without writing anything; the reason is shown to the developer. */
class StopError extends Error {}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------- fetching

let requestCount = 0;

async function fetchXml(url: string, expectedRoot: "sitemapindex" | "urlset"): Promise<string> {
  if (requestCount > 0) await sleep(DELAY_MS);
  requestCount += 1;

  let response: Response;
  try {
    response = await fetch(url, {
      redirect: "manual",
      headers: { "User-Agent": USER_AGENT, Accept: "application/xml, text/xml" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    throw new StopError(`Request failed for ${url}: ${String(error)}`);
  }

  if (response.status !== 200) {
    const location = response.headers.get("location");
    throw new StopError(
      `HTTP ${response.status} for ${url}${location ? ` → redirects to ${location}` : ""}`,
    );
  }

  const contentType = response.headers.get("content-type") ?? "(none)";
  const body = await response.text();
  const root = rootElement(body);
  if (contentType.toLowerCase().includes("html") || root !== expectedRoot) {
    throw new StopError(
      `Expected <${expectedRoot}> XML from ${url}, got root <${root ?? "?"}> ` +
        `with content-type ${contentType}. Possibly a protection page.`,
    );
  }
  if (!body.includes(`</${expectedRoot}>`)) {
    throw new StopError(`Truncated XML from ${url}: missing </${expectedRoot}>.`);
  }
  return stripComments(body);
}

// ----------------------------------------------------------------- parsing

const stripComments = (xml: string) => xml.replace(/<!--[\s\S]*?-->/g, "");

function rootElement(xml: string): string | null {
  const prolog = stripComments(xml.replace(/^﻿/, ""))
    .replace(/<\?[\s\S]*?\?>/g, "")
    .replace(/<!DOCTYPE[^>]*>/i, "")
    .trimStart();
  return /^<([A-Za-z][\w:.-]*)/.exec(prolog)?.[1]?.toLowerCase() ?? null;
}

let xmlEscapedValues = 0;

/** The value inside a tag: CDATA unwrapped and XML entities resolved. */
function xmlValue(inner: string): string {
  const cdata = /^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/.exec(inner);
  if (cdata) return cdata[1].trim();
  const text = inner.trim();
  const value = text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
  if (value !== text) xmlEscapedValues += 1;
  return value;
}

/** All values of an exact tag name: `loc` never matches `image:loc`. */
function tagValues(block: string, tag: string): string[] {
  const pattern = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "g");
  return Array.from(block.matchAll(pattern), (match) => xmlValue(match[1]));
}

const countOpenTags = (xml: string, tag: string) =>
  (xml.match(new RegExp(`<${tag}[\\s>]`, "g")) ?? []).length;

/** Blocks of a repeating element. Stops if any opening tag was not captured. */
function blocksOf(xml: string, tag: string, source: string): string[] {
  const pattern = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "g");
  const blocks = Array.from(xml.matchAll(pattern), (match) => match[1]);
  const opened = countOpenTags(xml, tag);
  if (blocks.length !== opened) {
    throw new StopError(`${source}: ${opened} <${tag}> opened but ${blocks.length} parsed.`);
  }
  return blocks;
}

function singleLoc(block: string, source: string): string {
  const locs = tagValues(block, "loc");
  if (locs.length !== 1 || !locs[0]) {
    throw new StopError(`${source}: expected one <loc> in a block, found ${locs.length}.`);
  }
  return locs[0];
}

const lastmodOf = (block: string) => tagValues(block, "lastmod")[0] ?? null;

function sitemapType(fileName: string): UrlType {
  const match = /^(.+?)-sitemap\d*\.xml$/.exec(fileName);
  return (match && SITEMAP_TYPES[match[1]]) || "other";
}

// ----------------------------------------------------------------- URL paths

const encodedPathOf = (rawLoc: string) => /^[a-z]+:\/\/[^/?#]*([^?#]*)/i.exec(rawLoc)?.[1] || "/";

/** decodeURIComponent + NFC, or null when the percent-encoding is broken. */
function decodePath(encodedPath: string): string | null {
  try {
    return decodeURIComponent(encodedPath).normalize("NFC");
  } catch {
    return null;
  }
}

function checkUrl(url: UrlEntry, anomalies: Anomaly[]): void {
  const raw = url.rawLoc;
  const add = (kind: string) => anomalies.push({ kind, detail: raw });

  if (!raw.startsWith(`${ALLOWED_ORIGIN}/`)) add("Not on https://hrwhats.com (host or scheme)");
  if (/[?#]/.test(raw)) add("Query string or fragment");
  if (url.path === null) {
    add("Broken percent-encoding");
    return;
  }

  const encodedPath = encodedPathOf(raw);
  if (!encodedPath.endsWith("/")) add("No trailing slash");
  if (url.path.includes("index.php")) add("Contains index.php");
  if (url.lastmod === null) add("Missing lastmod");
  else if (Number.isNaN(Date.parse(url.lastmod))) add("Unparseable lastmod");

  for (const segment of encodedPath.split("/").filter(Boolean)) {
    const decoded = decodePath(segment) ?? "";
    if (decodeURIComponent(segment) !== decoded) add("Slug is not NFC");
    if (/[/?#%\s]/.test(decoded)) add("Slug contains / ? # % or whitespace");
    if (Buffer.byteLength(decoded, "utf8") > MAX_SLUG_BYTES) add("Slug over 255 bytes");
  }
}

// ---------------------------------------------------------- local route list

/** Static routes under app/(ar)/, as URL paths. Dynamic segments are skipped. */
function localRoutes(dir = AR_ROUTES_DIR, urlPath = "/"): string[] {
  const routes = existsSync(join(dir, "page.tsx")) ? [urlPath] : [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith("[")) continue;
    const isGroup = entry.name.startsWith("(");
    routes.push(...localRoutes(join(dir, entry.name), isGroup ? urlPath : `${urlPath}${entry.name}/`));
  }
  return routes;
}

// ------------------------------------------------------------------- summary

const EMOJI = /\p{Extended_Pictographic}/u;
const ARABIC_QUESTION_MARK = "؟";
/** Arabic letters and digits, and ASCII: anything else in a slug deserves a look. */
const EXPECTED_CHARS = /[ء-غف-ي٠-٩\u0000-\u007F]/u;

function unusualChars(path: string): string[] {
  const chars = new Set<string>();
  for (const char of path) {
    if (EXPECTED_CHARS.test(char) || char === ARABIC_QUESTION_MARK || EMOJI.test(char)) continue;
    chars.add(`U+${char.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")}`);
  }
  return [...chars];
}

function heading(title: string): void {
  console.log(`\n=== ${title} ===`);
}

function list(items: string[]): void {
  for (const item of items) console.log(`  ${item}`);
  if (items.length === 0) console.log("  (none)");
}

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) groups.set(key(item), [...(groups.get(key(item)) ?? []), item]);
  return groups;
}

function printSummary(sitemaps: SitemapEntry[], urls: UrlEntry[], anomalies: Anomaly[]): void {
  heading("Sitemaps read");
  list(sitemaps.map((s) => `${s.loc}  [${s.type}]  ${s.urlCount} URLs  lastmod ${s.lastmod ?? "-"}`));
  console.log(`  Requests sent: ${requestCount}`);

  heading("URLs per type");
  for (const type of TYPE_ORDER) {
    const count = urls.filter((u) => u.type === type).length;
    if (count > 0 || type !== "other") console.log(`  ${type}: ${count}`);
  }
  console.log(`  total: ${urls.length}`);

  const nonAscii = urls.filter((u) => u.path !== null && /[^\u0000-\u007F]/.test(u.path));
  const withEmoji = nonAscii.filter((u) => EMOJI.test(u.path!));
  const withQuestionMark = nonAscii.filter((u) => u.path!.includes(ARABIC_QUESTION_MARK));
  const withUnusual = nonAscii.filter((u) => unusualChars(u.path!).length > 0);

  heading(`Non-ASCII URLs: ${nonAscii.length}`);
  list(nonAscii.map((u) => `[${u.type}] ${u.path}`));
  heading(`  of which with emoji: ${withEmoji.length}`);
  list(withEmoji.map((u) => u.path!));
  heading(`  of which with Arabic question mark: ${withQuestionMark.length}`);
  list(withQuestionMark.map((u) => u.path!));
  heading(`  of which with other unusual characters: ${withUnusual.length}`);
  list(withUnusual.map((u) => `${u.path} — ${unusualChars(u.path!).join(" ")}`));

  const routes = localRoutes();
  const pages = urls.filter((u) => u.type === "page");
  const pagePaths = new Set(pages.map((u) => u.path));
  heading("page-sitemap vs src/app/(ar)/");
  const matched = pages.filter((u) => u.path !== null && routes.includes(u.path));
  console.log(`  Same path on the new site: ${matched.length}`);
  list(matched.map((u) => u.path!));
  const missing = pages.filter((u) => u.path === null || !routes.includes(u.path));
  console.log(`  No counterpart on the new site: ${missing.length}`);
  list(missing.map((u) => u.path ?? u.rawLoc));
  const newOnly = routes.filter((route) => !pagePaths.has(route));
  console.log(`  New-site routes not in page-sitemap: ${newOnly.length}`);
  list(newOnly);

  const rawDuplicates = [...groupBy(urls, (u) => u.rawLoc)].filter(([, group]) => group.length > 1);
  const pathDuplicates = [
    ...groupBy(
      urls.filter((u) => u.path !== null),
      (u) => u.path!.replace(/\/$/, ""),
    ),
  ].filter(([, group]) => new Set(group.map((u) => u.rawLoc)).size > 1);
  heading("Duplicates");
  console.log(`  Same raw loc: ${rawDuplicates.length}`);
  list(rawDuplicates.map(([raw, group]) => `${raw} — in ${group.map((u) => u.sitemap).join(", ")}`));
  console.log(`  Same decoded path, different raw loc: ${pathDuplicates.length}`);
  list(pathDuplicates.map(([path, group]) => `${path} — ${group.map((u) => u.rawLoc).join(" | ")}`));

  heading("Anomalies");
  list([...groupBy(anomalies, (a) => a.kind)].map(([kind, group]) => `${kind}: ${group.length}`));
  for (const [kind, group] of groupBy(anomalies, (a) => a.kind)) {
    console.log(`\n  -- ${kind}`);
    list(group.map((a) => a.detail));
  }

  const encoded = urls.map((u) => u.rawLoc).filter((raw) => /%[0-9a-f]{2}/i.test(raw));
  const lowerCase = encoded.filter((raw) => /%[0-9a-f]?[a-f]/.test(raw));
  const upperCase = encoded.filter((raw) => /%[0-9A-F]?[A-F]/.test(raw));
  heading("Encoding notes (not errors)");
  console.log(`  Percent-encoded URLs: ${encoded.length}`);
  console.log(`  With lower-case hex: ${lowerCase.length}`);
  console.log(`  With upper-case hex: ${upperCase.length}`);
  console.log(`  Raw non-ASCII bytes in loc: ${urls.filter((u) => /[^\u0000-\u007F]/.test(u.rawLoc)).length}`);
  console.log(`  Values with XML entities resolved: ${xmlEscapedValues}`);

  const occurrences = urls.flatMap((u) => u.images.map((image) => ({ image, url: u })));
  const noImages = urls.filter((u) => u.images.length === 0);
  const shared = [...groupBy(occurrences, (o) => o.image)]
    .map(([image, group]) => ({ image, pages: new Set(group.map((o) => o.url.rawLoc)) }))
    .filter(({ pages }) => pages.size > 1)
    .sort((a, b) => b.pages.size - a.pages.size);
  heading("Images (recorded as they appear; no decision taken)");
  console.log(`  Total image entries: ${occurrences.length}`);
  console.log(`  Distinct image URLs: ${new Set(occurrences.map((o) => o.image)).size}`);
  console.log(`  URLs without images: ${noImages.length}`);
  for (const type of TYPE_ORDER) {
    const count = noImages.filter((u) => u.type === type).length;
    if (count > 0) console.log(`    ${type}: ${count}`);
  }
  console.log(`  Images used on more than one URL: ${shared.length}`);
  list(shared.map(({ image, pages }) => `${pages.size}x ${image}`));
}

// ---------------------------------------------------------------------- main

async function main(): Promise<void> {
  if (!existsSync(AR_ROUTES_DIR)) {
    throw new StopError(`Run from the project root: ${AR_ROUTES_DIR} not found.`);
  }

  const indexXml = await fetchXml(INDEX_URL, "sitemapindex");
  const seen = new Set<string>();
  const sitemaps: SitemapEntry[] = [];
  const urls: UrlEntry[] = [];
  const anomalies: Anomaly[] = [];

  for (const block of blocksOf(indexXml, "sitemap", INDEX_URL)) {
    const loc = singleLoc(block, INDEX_URL);
    if (!loc.startsWith(`${ALLOWED_ORIGIN}/`)) {
      throw new StopError(`Sub-sitemap outside ${ALLOWED_ORIGIN}, not followed: ${loc}`);
    }
    if (seen.has(loc)) {
      anomalies.push({ kind: "Sub-sitemap listed twice", detail: loc });
      continue;
    }
    seen.add(loc);

    const fileName = loc.slice(loc.lastIndexOf("/") + 1);
    const type = sitemapType(fileName);
    if (type === "other") anomalies.push({ kind: "Unexpected sitemap name", detail: loc });

    const xml = await fetchXml(loc, "urlset");
    const blocks = blocksOf(xml, "url", loc);
    if (blocks.length === 0) anomalies.push({ kind: "Empty sitemap", detail: loc });

    for (const urlBlock of blocks) {
      const rawLoc = singleLoc(urlBlock, loc);
      const images = tagValues(urlBlock, "image:loc");
      if (images.length !== countOpenTags(urlBlock, "image:loc")) {
        throw new StopError(`${loc}: unparsed <image:loc> in the block of ${rawLoc}.`);
      }
      urls.push({
        rawLoc,
        path: decodePath(encodedPathOf(rawLoc)),
        type,
        lastmod: lastmodOf(urlBlock),
        sitemap: fileName,
        images,
      });
    }
    sitemaps.push({ loc, type, lastmod: lastmodOf(block), urlCount: blocks.length });
  }

  const byType = <T extends { type: UrlType }>(a: T, b: T) =>
    TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type);
  sitemaps.sort(byType);
  urls.sort(byType); // Stable: keeps the sitemap's own order within a type.
  for (const url of urls) checkUrl(url, anomalies);

  const snapshot = { source: INDEX_URL, fetchedAt: new Date().toISOString(), sitemaps, urls };
  mkdirSync(dirname(OUTPUT_FILE), { recursive: true });
  const tempFile = `${OUTPUT_FILE}.tmp`;
  writeFileSync(tempFile, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  renameSync(tempFile, OUTPUT_FILE);

  printSummary(sitemaps, urls, anomalies);
  console.log(`\nWritten: ${OUTPUT_FILE.replaceAll("\\", "/")}`);
}

main().catch((error: unknown) => {
  if (error instanceof StopError) {
    console.error(`\nSTOPPED after ${requestCount} request(s). Nothing was written.\n${error.message}`);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});
