/**
 * WordPress post inventory for human review, and post conversion. Downloads no images.
 *
 *   node scripts/migrate-wordpress.ts                 fetch posts → scripts/slug-map.json
 *   node scripts/migrate-wordpress.ts --apply-names   no network: apply the reviewed file
 *                                                     names from data/post-file-names.json
 *   node scripts/migrate-wordpress.ts --only <ids>    posts (3420,3356,…) → content/posts/ar/<name>.mdx,
 *                                                     in one request; nothing is written unless all succeed
 *   node scripts/migrate-wordpress.ts --verify <ids>  after `npm run build`: built pages vs WordPress
 *                                                     (text word for word, heading anchors, folder, canonical)
 *
 * Conversion inputs in scripts/data/: post-covers.json (cover + context box),
 * post-descriptions.json, post-heading-fixes.json, machine-note-rules.json, old-slug-targets.json.
 *
 * Polite by design: one request at a time, about a second apart, no retries, no
 * credentials, no redirects followed. slug-map.json is written only after the whole
 * inventory succeeds. Post text is analysed in memory and never saved.
 *
 * HTML is measured with regular expressions: good enough for counts, not for
 * conversion. Gutenberg block comments are normally absent from `content.rendered`
 * and `content.raw` needs a login, so block types are inferred from wp-block-* classes.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkStringify from "remark-stringify";
import { unified } from "unified";

const SITE = "https://hrwhats.com";
const API = `${SITE}/wp-json/wp/v2`;
const USER_AGENT = "HRwhats-Post-Inventory/1.0 (read-only migration audit)";
const TIMEOUT_MS = 30_000;
const DELAY_MS = 1_000;
const PER_PAGE = 100;
const MAX_SLUG_BYTES = 255;
const MAX_FILE_NAME = 60;
const TITLE_PHRASE = "حلول واتس اب اعمال";

const SLUG_MAP_FILE = join("scripts", "slug-map.json");
const NAMES_FILE = join("scripts", "data", "post-file-names.json");
const SNAPSHOT_FILE = join("scripts", "data", "wp-sitemap-urls.json");
const OLD_SLUGS_FILE = join("scripts", "data", "old-slug-targets.json");
const MACHINE_NOTES_FILE = join("scripts", "data", "machine-note-rules.json");
const SECTORS_FILE = join("content", "data", "sectors.json");
const AR_ROUTES_DIR = join("src", "app", "(ar)");

/** Top-level paths the new site uses or plans to use, beyond the route folders. */
const RESERVED_SLUGS = ["news", "category", "en", "api", "images", "_next"];
const INTERNAL_HOSTS = ["hrwhats.com", "www.hrwhats.com"];
const ASCII_NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const USUAL_TAGS = new Set(
  (
    "p br hr h2 h3 h4 h5 h6 ul ol li a strong b em i u span div blockquote img figure figcaption " +
    "table thead tbody tfoot tr th td code pre sub sup mark"
  ).split(" "),
);
const PLUGIN_CLASSES =
  /\b(elementor|vc_|wpb_|et_pb|fl-builder|ez-toc|lwptoc|rank-math|schema-faq|yoast|tablepress|twitter-tweet|instagram-media)/gi;

type Term = { slug: string; name: string };

type InternalLink = {
  path: string;
  cleanPath: string | null;
  query: string | null;
  kind: "page" | "upload";
  inSnapshot: boolean;
  legacyForms: string[];
  noTrailingSlash: boolean;
};

type Post = {
  id: number;
  title: string;
  slug: string;
  link: string;
  date: string;
  modified: string;
  fileName: string | null;
  categories: Term[];
  tags: Term[];
  featuredMediaId: number;
  cover: { url: string; width: number | null; height: number | null; alt: string } | null;
  yoast: {
    title: string | null;
    description: string | null;
    canonical: string | null;
    robots: Record<string, string> | null;
    ogImage: string | null;
  } | null;
  content: {
    words: number;
    images: { count: number; urls: string[] };
    internalLinks: InternalLink[];
    externalLinkCount: number;
    elements: {
      tables: number;
      iframes: number;
      iframeHosts: string[];
      videos: number;
      shortcodes: string[];
      blockClasses: string[];
      blockComments: string[];
      unusualHtml: string[];
      tags: Record<string, number>;
    };
  };
};

type NewsCheck = {
  isPost: boolean;
  pageId: number | null;
  pageStatus: string | null;
  pageForPosts: number | null;
  pageForPostsNote: string;
  conclusion: "archive-page" | "post" | "unresolved";
  evidence: string[];
};

type SlugMap = {
  source: string;
  fetchedAt: string;
  total: number;
  newsCheck: NewsCheck;
  posts: Post[];
};

type ApiTerm = { id: number; slug: string; name: string };
type ApiMedia = {
  id: number;
  source_url: string;
  alt_text?: string;
  media_details?: { width?: number; height?: number };
};
type ApiPost = {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  categories: number[];
  tags: number[];
  featured_media: number;
  yoast_head_json?: {
    title?: string;
    description?: string;
    canonical?: string;
    robots?: Record<string, string>;
    og_image?: { url?: string }[];
  };
};

/** Ends the run without writing anything; the reason is shown to the developer. */
class StopError extends Error {}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------- fetching

let requestCount = 0;

type JsonResponse = { data: unknown; headers: Headers };

/** Any non-200 stops the run. With `optional`, only blocking signals (403, 429, HTML) do. */
async function fetchJson(url: string, optional = false): Promise<JsonResponse | string> {
  if (requestCount > 0) await sleep(DELAY_MS);
  requestCount += 1;

  let response: Response;
  try {
    response = await fetch(url, {
      redirect: "manual",
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    if (optional) return `request failed: ${String(error)}`;
    throw new StopError(`Request failed for ${url}: ${String(error)}`);
  }

  if (response.status !== 200) {
    const location = response.headers.get("location");
    const reason = `HTTP ${response.status} for ${url}${location ? ` → redirects to ${location}` : ""}`;
    if (optional && response.status !== 403 && response.status !== 429) return reason;
    throw new StopError(reason);
  }

  const contentType = response.headers.get("content-type") ?? "(none)";
  if (!contentType.toLowerCase().includes("json")) {
    throw new StopError(`Expected JSON from ${url}, got ${contentType}. Possibly a protection page.`);
  }
  try {
    return { data: JSON.parse(await response.text()), headers: response.headers };
  } catch {
    throw new StopError(`Invalid JSON from ${url}.`);
  }
}

/** Every page of a collection, checked against WordPress's own totals. */
async function fetchCollection<T>(endpoint: string, query: string): Promise<T[]> {
  const items: T[] = [];
  let totalPages = 1;
  let total = 0;
  for (let page = 1; page <= totalPages; page += 1) {
    const url = `${API}/${endpoint}?per_page=${PER_PAGE}&page=${page}&${query}`;
    const { data, headers } = (await fetchJson(url)) as JsonResponse;
    total = Number(headers.get("x-wp-total"));
    totalPages = Number(headers.get("x-wp-totalpages"));
    if (!Array.isArray(data) || !headers.has("x-wp-total") || !Number.isInteger(total)) {
      throw new StopError(`Unexpected collection response from ${url}.`);
    }
    items.push(...(data as T[]));
  }
  if (items.length !== total) {
    throw new StopError(`${endpoint}: X-WP-Total says ${total}, received ${items.length}.`);
  }
  return items;
}

// --------------------------------------------------------------- decoding

const HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  ndash: "–",
  mdash: "—",
  laquo: "«",
  raquo: "»",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
};

function decodeHtml(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, body: string) => {
    if (body[0] === "#") {
      const code = /^#x/i.test(body) ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return code <= 0x10ffff ? String.fromCodePoint(code) : entity;
    }
    return HTML_ENTITIES[body] ?? entity;
  });
}

function decodeNfc(encoded: string): string | null {
  try {
    return decodeURIComponent(encoded).normalize("NFC");
  } catch {
    return null;
  }
}

const withSlash = (path: string) => (path.endsWith("/") ? path : `${path}/`);

function urlPath(url: string): string | null {
  try {
    return decodeNfc(new URL(url).pathname);
  } catch {
    return null;
  }
}

// --------------------------------------------------------------- analysis

function attribute(tag: string, name: string): string | null {
  const pattern = new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
  const match = pattern.exec(tag);
  const value = match?.[1] ?? match?.[2] ?? match?.[3];
  return value === undefined ? null : decodeHtml(value).trim();
}

const tagsNamed = (html: string, name: string) =>
  html.match(new RegExp(`<${name}\\b[^>]*>`, "gi")) ?? [];

function classifyLink(
  href: string,
  snapshot: Set<string>,
  postPaths: Map<number, string>,
): { internal: InternalLink } | { external: true } | null {
  if (!href || href.startsWith("#") || /^(mailto|tel|sms|javascript|data):/i.test(href)) return null;

  let url: URL;
  try {
    url = new URL(href, `${SITE}/`);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(url.protocol)) return null;
  if (!INTERNAL_HOSTS.includes(url.hostname.toLowerCase())) return { external: true };

  const path = decodeNfc(url.pathname) ?? url.pathname;
  const legacyForms: string[] = [];
  if (url.protocol === "http:") legacyForms.push("http");
  if (url.hostname.toLowerCase().startsWith("www.")) legacyForms.push("www");
  if (/^\/index\.php(\/|$)/.test(path)) legacyForms.push("index.php");

  let cleanPath: string | null = path.replace(/^\/index\.php(?=\/|$)/, "") || "/";
  const postId = url.searchParams.get("p");
  if (postId !== null) {
    legacyForms.push("?p=ID");
    cleanPath = postPaths.get(Number(postId)) ?? null;
  }

  const kind = path.startsWith("/wp-content/") ? "upload" : "page";
  return {
    internal: {
      path,
      cleanPath,
      query: url.search ? url.search.slice(1) : null,
      kind,
      inSnapshot: cleanPath !== null && snapshot.has(withSlash(cleanPath)),
      legacyForms,
      noTrailingSlash: kind === "page" && !url.pathname.endsWith("/"),
    },
  };
}

function analyzeContent(
  rawHtml: string,
  snapshot: Set<string>,
  postPaths: Map<number, string>,
): Post["content"] {
  const blockComments = new Set<string>();
  for (const match of rawHtml.matchAll(/<!--\s*wp:([\w/-]+)/g)) blockComments.add(match[1]);

  const html = rawHtml.replace(/<!--[\s\S]*?-->/g, "");
  const textHtml = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, " ");
  const visibleHtml = textHtml.replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ");
  const text = decodeHtml(visibleHtml.replace(/<[^>]+>/g, " "));

  const images = new Set<string>();
  for (const tag of tagsNamed(html, "img")) {
    const src =
      attribute(tag, "data-lazy-src") ?? attribute(tag, "data-src") ?? attribute(tag, "src");
    if (src && !src.startsWith("data:")) images.add(src);
  }

  const internalLinks: InternalLink[] = [];
  let externalLinkCount = 0;
  for (const tag of tagsNamed(html, "a")) {
    const link = classifyLink(attribute(tag, "href") ?? "", snapshot, postPaths);
    if (link && "internal" in link) internalLinks.push(link.internal);
    else if (link) externalLinkCount += 1;
  }

  const tags: Record<string, number> = {};
  for (const match of html.matchAll(/<([a-zA-Z][a-zA-Z0-9:-]*)\b/g)) {
    const name = match[1].toLowerCase();
    tags[name] = (tags[name] ?? 0) + 1;
  }

  const classes = Array.from(html.matchAll(/\sclass\s*=\s*(?:"([^"]*)"|'([^']*)')/gi), (match) =>
    match[1] ?? match[2] ?? "",
  ).join(" ");
  const blockClasses = new Set(classes.match(/\bwp-block-[a-z0-9-]+/g) ?? []);

  const unusual = new Set<string>();
  for (const name of Object.keys(tags)) if (!USUAL_TAGS.has(name)) unusual.add(`tag:${name}`);
  for (const match of classes.matchAll(PLUGIN_CLASSES)) unusual.add(`class:${match[1].toLowerCase()}`);
  for (const match of html.matchAll(/<[a-zA-Z][^>]*\s(style|align|dir|color|on[a-z]+)\s*=/g)) {
    unusual.add(`attr:${match[1].toLowerCase()}`);
  }
  if (/[{}]/.test(text)) unusual.add("text:curly-braces");
  if (/<(?![a-zA-Z/!])/.test(visibleHtml)) unusual.add("text:bare-less-than");

  const shortcodes = new Set<string>();
  for (const match of text.matchAll(/\[\/?([a-zA-Z][\w-]*)(?:\s[^\]]*)?\]/g)) shortcodes.add(match[1]);

  const iframes = tagsNamed(html, "iframe");
  const iframeHosts = new Set<string>();
  for (const tag of iframes) {
    try {
      iframeHosts.add(new URL(attribute(tag, "src") ?? "").hostname);
    } catch {
      iframeHosts.add("(unparseable src)");
    }
  }

  return {
    words: (text.match(/[\p{L}\p{N}][^\s]*/gu) ?? []).length,
    images: { count: images.size, urls: [...images] },
    internalLinks,
    externalLinkCount,
    elements: {
      tables: tagsNamed(html, "table").length,
      iframes: iframes.length,
      iframeHosts: [...iframeHosts],
      videos: tagsNamed(html, "video").length,
      shortcodes: [...shortcodes],
      blockClasses: [...blockClasses].sort(),
      blockComments: [...blockComments].sort(),
      unusualHtml: [...unusual].sort(),
      tags,
    },
  };
}

// ------------------------------------------------------------ local inputs

type SnapshotFile = { urls: { path: string | null; type: string }[] };

function readSnapshot(): SnapshotFile["urls"] {
  if (!existsSync(SNAPSHOT_FILE)) throw new StopError(`Missing ${SNAPSHOT_FILE} (phase 1).`);
  return (JSON.parse(readFileSync(SNAPSHOT_FILE, "utf8")) as SnapshotFile).urls;
}

function readSectorSlugs(): string[] {
  const raw = JSON.parse(readFileSync(SECTORS_FILE, "utf8")) as
    | { slug: string }[]
    | { sectors: { slug: string }[] };
  return (Array.isArray(raw) ? raw : raw.sectors).map((sector) => sector.slug);
}

function routeFolders(): string[] {
  return readdirSync(AR_ROUTES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !/^[[(]/.test(entry.name))
    .map((entry) => entry.name);
}

// ------------------------------------------------------------- file names

/** English slugs are used as they are; all others come from the reviewed names file. */
function applyNames(posts: Post[]): void {
  const names: Record<string, string> = existsSync(NAMES_FILE)
    ? (JSON.parse(readFileSync(NAMES_FILE, "utf8")) as Record<string, string>)
    : {};
  const ids = new Set(posts.map((post) => String(post.id)));
  for (const id of Object.keys(names)) {
    if (!ids.has(id)) throw new StopError(`${NAMES_FILE}: no post with id ${id}.`);
  }

  const used = new Map<string, number>();
  for (const post of posts) {
    const given = names[String(post.id)];
    const automatic = ASCII_NAME.test(post.slug) ? post.slug : null;
    if (automatic && given && given !== automatic) {
      throw new StopError(`Post ${post.id}: its English slug "${automatic}" must be the file name.`);
    }
    if (given && !automatic && (!ASCII_NAME.test(given) || given.length > MAX_FILE_NAME)) {
      throw new StopError(`Post ${post.id}: invalid file name "${given}".`);
    }
    post.fileName = automatic ?? given ?? null;
    if (post.fileName) {
      const other = used.get(post.fileName);
      if (other !== undefined) {
        throw new StopError(`File name "${post.fileName}" used by posts ${other} and ${post.id}.`);
      }
      used.set(post.fileName, post.id);
    }
  }
}

function writeSlugMap(map: SlugMap): void {
  mkdirSync(dirname(SLUG_MAP_FILE), { recursive: true });
  const tempFile = `${SLUG_MAP_FILE}.tmp`;
  writeFileSync(tempFile, `${JSON.stringify(map, null, 2)}\n`, "utf8");
  renameSync(tempFile, SLUG_MAP_FILE);
}

// ------------------------------------------------------------------ summary

const heading = (title: string) => console.log(`\n=== ${title} ===`);

function list(items: string[]): void {
  for (const item of items) console.log(`  ${item}`);
  if (items.length === 0) console.log("  (none)");
}

function tally(items: Iterable<string>): [string, number][] {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

const tallyLines = (items: Iterable<string>) => tally(items).map(([name, count]) => `${count}  ${name}`);

const postLabel = (post: Post) => `#${post.id} /${post.slug}/`;

/** Each internal link once, with the posts that use it. */
function linkLines(entries: { post: Post; link: InternalLink }[]): string[] {
  const groups = new Map<string, Set<number>>();
  for (const { post, link } of entries) {
    const key = link.query ? `${link.path}?${link.query}` : link.path;
    groups.set(key, (groups.get(key) ?? new Set()).add(post.id));
  }
  return [...groups].map(([path, ids]) => `${path}  ← posts ${[...ids].join(", ")}`);
}

function printSummary(map: SlugMap): void {
  const { posts, newsCheck } = map;
  const snapshot = readSnapshot();

  heading("Confirmed posts");
  console.log(`  API (published): ${map.total}`);
  if (requestCount > 0) console.log(`  Requests sent: ${requestCount}`);
  const sitemapPosts = snapshot.filter((url) => url.type === "post").map((url) => url.path);
  const apiPaths = new Set(posts.map((post) => urlPath(post.link)));
  console.log(`  post-sitemap in the snapshot: ${sitemapPosts.length}`);
  console.log("  In the API, not in post-sitemap:");
  list(posts.filter((post) => !sitemapPosts.includes(urlPath(post.link))).map(postLabel));
  console.log("  In post-sitemap, not in the API:");
  list(sitemapPosts.filter((path) => !apiPaths.has(path)).map(String));

  heading("/news/");
  console.log(`  Conclusion: ${newsCheck.conclusion}`);
  console.log(`  page_for_posts: ${newsCheck.pageForPostsNote}`);
  list(newsCheck.evidence);

  heading("Posts per category");
  list(tallyLines(posts.flatMap((post) => post.categories.map((term) => term.slug))));

  heading("Covers");
  const noCover = posts.filter((post) => !post.cover);
  console.log(`  Without a cover: ${noCover.length}`);
  list(noCover.map((post) => `${postLabel(post)}${post.featuredMediaId ? ` (media ${post.featuredMediaId} not returned)` : ""}`));
  const coverUsers = new Map<string, number[]>();
  for (const post of posts) {
    if (post.cover) coverUsers.set(post.cover.url, [...(coverUsers.get(post.cover.url) ?? []), post.id]);
  }
  const shared = [...coverUsers].filter(([, ids]) => ids.length > 1);
  console.log(`  Shared by more than one post: ${shared.length}`);
  list(shared.map(([url, ids]) => `${url}  ← posts ${ids.join(", ")}`));

  heading("Images inside the text");
  const withImages = posts.filter((post) => post.content.images.count > 0);
  console.log(`  Posts with images: ${withImages.length}`);
  console.log(`  Total images: ${posts.reduce((sum, post) => sum + post.content.images.count, 0)}`);

  heading("Words (approximate)");
  const words = posts.map((post) => post.content.words).sort((a, b) => a - b);
  if (words.length > 0) {
    console.log(`  Min ${words[0]}, median ${words[Math.floor(words.length / 2)]}, max ${words[words.length - 1]}`);
  }

  heading(`Yoast titles without "${TITLE_PHRASE}"`);
  list(
    posts
      .filter((post) => !post.yoast?.title?.includes(TITLE_PHRASE))
      .map((post) => `#${post.id} ${post.yoast?.title ?? "(no Yoast title)"}`),
  );
  heading("Posts without yoast_head_json");
  list(posts.filter((post) => !post.yoast).map(postLabel));

  heading("noindex, or a canonical pointing elsewhere");
  const robotsSeen = posts.map((post) => JSON.stringify(post.yoast?.robots ?? null));
  console.log("  Robots values seen:");
  list(tallyLines(robotsSeen));
  console.log("  noindex:");
  list(posts.filter((post) => post.yoast?.robots && post.yoast.robots.index !== "index").map(postLabel));
  console.log("  Canonical differs from the post's URL:");
  list(
    posts
      .filter((post) => post.yoast?.canonical && urlPath(post.yoast.canonical) !== urlPath(post.link))
      .map((post) => `${postLabel(post)} → ${post.yoast?.canonical}`),
  );
  console.log("  Canonical on another host or scheme:");
  list(
    posts
      .filter((post) => post.yoast?.canonical && !post.yoast.canonical.startsWith(`${SITE}/`))
      .map((post) => `${postLabel(post)} → ${post.yoast?.canonical}`),
  );

  const links = posts.flatMap((post) => post.content.internalLinks.map((link) => ({ post, link })));
  const pageLinks = links.filter(({ link }) => link.kind === "page");
  heading("Internal links");
  console.log(`  Total: ${links.length} (pages ${pageLinks.length}, uploads ${links.length - pageLinks.length})`);
  console.log(`  External links: ${posts.reduce((sum, post) => sum + post.content.externalLinkCount, 0)}`);
  console.log("  Page links not in the snapshot:");
  list(linkLines(pageLinks.filter(({ link }) => !link.inSnapshot)));
  console.log("  Links to uploaded files:");
  list(linkLines(links.filter(({ link }) => link.kind === "upload")));

  heading("Internal links in legacy forms");
  for (const form of ["?p=ID", "index.php", "http", "www"]) {
    const matching = links.filter(({ link }) => link.legacyForms.includes(form));
    console.log(`  ${form}: ${matching.length}`);
    list(linkLines(matching));
  }
  const noSlash = links.filter(({ link }) => link.noTrailingSlash);
  console.log(`  No trailing slash: ${noSlash.length}`);
  list(linkLines(noSlash));

  heading("Slug checks");
  const reserved = new Set([...routeFolders(), ...readSectorSlugs(), ...RESERVED_SLUGS]);
  console.log("  Conflicts with a route folder, sectors.json or a reserved path:");
  list(posts.filter((post) => reserved.has(post.slug)).map(postLabel));
  console.log("  Break the slug rules (NFC, / ? # %, whitespace, over 255 bytes):");
  list(
    posts
      .filter(
        (post) =>
          post.slug !== post.slug.normalize("NFC") ||
          /[/?#%\s]/.test(post.slug) ||
          Buffer.byteLength(post.slug, "utf8") > MAX_SLUG_BYTES,
      )
      .map(postLabel),
  );
  console.log("  Slug differs from the path of the post's link:");
  list(posts.filter((post) => urlPath(post.link) !== `/${post.slug}/`).map((post) => `${postLabel(post)} → ${post.link}`));

  heading("Special elements (posts containing each)");
  const elements = posts.map((post) => post.content.elements);
  console.log(`  Tables: ${elements.filter((e) => e.tables > 0).length}`);
  console.log(`  Iframes: ${elements.filter((e) => e.iframes > 0).length} ${JSON.stringify([...new Set(elements.flatMap((e) => e.iframeHosts))])}`);
  console.log(`  Videos: ${elements.filter((e) => e.videos > 0).length}`);
  console.log("  Shortcode candidates (may be template placeholders in the text):");
  list(tallyLines(elements.flatMap((e) => e.shortcodes)));
  console.log("  Block classes (inferred; plain paragraphs leave none):");
  list(tallyLines(elements.flatMap((e) => e.blockClasses)));
  console.log("  Block comments found in the rendered HTML:");
  list(tallyLines(elements.flatMap((e) => e.blockComments)));
  console.log("  Unusual HTML:");
  list(tallyLines(elements.flatMap((e) => e.unusualHtml)));
  console.log("  All tags:");
  list(tallyLines(elements.flatMap((e) => Object.keys(e.tags))));

  heading("File names");
  const missing = posts.filter((post) => !post.fileName);
  console.log(`  Assigned: ${posts.length - missing.length}, waiting for a name: ${missing.length}`);
}

// --------------------------------------------------------------- /news/ check

async function checkNews(posts: ApiPost[]): Promise<NewsCheck> {
  const root = await fetchJson(`${SITE}/wp-json/?_fields=page_for_posts,show_on_front`, true);
  let pageForPosts: number | null = null;
  let pageForPostsNote: string;
  if (typeof root === "string") {
    pageForPostsNote = `unavailable (${root})`;
  } else {
    const value = (root.data as { page_for_posts?: unknown }).page_for_posts;
    pageForPosts = typeof value === "number" ? value : null;
    pageForPostsNote = pageForPosts === null ? "field not returned" : String(pageForPosts);
  }

  const { data } = (await fetchJson(
    `${API}/pages?slug=news&_fields=id,slug,link,status`,
  )) as JsonResponse;
  const page = Array.isArray(data) ? (data[0] as { id: number; status: string } | undefined) : undefined;
  const isPost = posts.some((post) => decodeNfc(post.slug) === "news");

  const evidence = [
    `Among the published posts: ${isPost ? "yes" : "no"}`,
    page ? `Page with the slug "news": id ${page.id}, status ${page.status}` : `No page with the slug "news"`,
  ];
  if (pageForPosts !== null && page) {
    evidence.push(`page_for_posts ${pageForPosts === page.id ? "equals" : "differs from"} that page's id`);
  }

  let conclusion: NewsCheck["conclusion"] = "unresolved";
  if (isPost) conclusion = "post";
  else if (page && (pageForPosts === null || pageForPosts === page.id)) conclusion = "archive-page";

  return {
    isPost,
    pageId: page?.id ?? null,
    pageStatus: page?.status ?? null,
    pageForPosts,
    pageForPostsNote,
    conclusion,
    evidence,
  };
}

// --------------------------------------------------------------------- main

async function fetchInventory(): Promise<SlugMap> {
  // Fail on missing local inputs before sending anything.
  const snapshot = new Set(
    readSnapshot().flatMap((url) => (url.path === null ? [] : [withSlash(url.path)])),
  );
  readSectorSlugs();
  routeFolders();

  const apiPosts = await fetchCollection<ApiPost>(
    "posts",
    "status=publish&orderby=id&order=asc&_fields=id,date,modified,slug,status,link,title,content,categories,tags,featured_media,yoast_head_json",
  );
  const notPublished = apiPosts.filter((post) => post.status !== "publish");
  if (notPublished.length > 0) {
    throw new StopError(`The API returned non-published posts: ${notPublished.map((post) => post.id).join(", ")}.`);
  }

  const toTermMap = (terms: ApiTerm[]) => new Map(terms.map((term) => [term.id, term]));
  const categories = toTermMap(await fetchCollection<ApiTerm>("categories", "_fields=id,slug,name"));
  const tags = toTermMap(await fetchCollection<ApiTerm>("tags", "_fields=id,slug,name"));

  const mediaIds = [...new Set(apiPosts.map((post) => post.featured_media).filter(Boolean))];
  const media = new Map<number, ApiMedia>();
  for (let start = 0; start < mediaIds.length; start += PER_PAGE) {
    const include = mediaIds.slice(start, start + PER_PAGE).join(",");
    const items = await fetchCollection<ApiMedia>(
      "media",
      // WordPress skips media_details when only its sub-fields are requested.
      `include=${include}&_fields=id,source_url,alt_text,media_details`,
    );
    for (const item of items) media.set(item.id, item);
  }

  const newsCheck = await checkNews(apiPosts);

  const toTerms = (ids: number[], source: Map<number, ApiTerm>, postId: number): Term[] =>
    ids.map((id) => {
      const term = source.get(id);
      if (!term) throw new StopError(`Post ${postId} uses unknown term ${id}.`);
      return { slug: decodeNfc(term.slug) ?? term.slug, name: decodeHtml(term.name) };
    });

  const postPaths = new Map(apiPosts.map((post) => [post.id, urlPath(post.link) ?? ""]));

  const posts: Post[] = apiPosts.map((post) => {
    const cover = media.get(post.featured_media);
    const yoast = post.yoast_head_json;
    return {
      id: post.id,
      title: decodeHtml(post.title.rendered),
      slug: decodeNfc(post.slug) ?? post.slug,
      link: post.link,
      date: post.date,
      modified: post.modified,
      fileName: null,
      categories: toTerms(post.categories, categories, post.id),
      tags: toTerms(post.tags, tags, post.id),
      featuredMediaId: post.featured_media,
      cover: cover
        ? {
            url: cover.source_url,
            width: cover.media_details?.width ?? null,
            height: cover.media_details?.height ?? null,
            alt: decodeHtml(cover.alt_text ?? ""),
          }
        : null,
      yoast: yoast
        ? {
            title: yoast.title === undefined ? null : decodeHtml(yoast.title),
            description: yoast.description === undefined ? null : decodeHtml(yoast.description),
            canonical: yoast.canonical ?? null,
            robots: yoast.robots ?? null,
            ogImage: yoast.og_image?.[0]?.url ?? null,
          }
        : null,
      content: analyzeContent(post.content.rendered, snapshot, postPaths),
    };
  });

  return {
    source: `${API}/posts`,
    fetchedAt: new Date().toISOString(),
    total: posts.length,
    newsCheck,
    posts,
  };
}

// ---------------------------------------------------------- HTML → MDX (--only)

/** The site's categories, primary first. A WordPress category outside this list is not built. */
const BUILT_CATEGORIES = ["whatsapp", "marketing", "hrwhats-guide"];
const COVERS_FILE = join("scripts", "data", "post-covers.json");
const DESCRIPTIONS_FILE = join("scripts", "data", "post-descriptions.json");
const HEADING_FIXES_FILE = join("scripts", "data", "post-heading-fixes.json");
const ALLOWED_IN_POSTS = new Set([...USUAL_TAGS, "h1"]);
const POST_FIELDS = "id,slug,status,date_gmt,modified_gmt,title,content,excerpt,yoast_head_json";
const BLOCK_TAGS = new Set(
  "p h1 h2 h3 h4 h5 h6 li ul ol table thead tbody tfoot tr td th blockquote pre br hr figure figcaption div".split(" "),
);

type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

type FullPost = ApiPost & { date_gmt: string; modified_gmt: string; excerpt: { rendered: string } };

type CoverEntry = {
  id: number;
  template: string;
  variant: number;
  sector: string | null;
  context: string | null;
  provisional?: boolean;
};
type DescriptionEntry = { source: "excerpt" | "yoast" | "custom"; text?: string; proposed?: string };
/** `to`: a new level, or "paragraph" = the heading becomes a bold paragraph (same text). */
type HeadingFix = { text: string; from: number; to: number | "paragraph" };

const readJson = <T,>(file: string): T => JSON.parse(readFileSync(file, "utf8")) as T;

const hastText = (node: HastNode): string =>
  node.type === "comment" ? "" : (node.value ?? (node.children ?? []).map(hastText).join(""));

/** Text with a space at every block boundary, so words of adjacent blocks never merge. */
const blockText = (node: HastNode): string => {
  if (node.type === "comment") return "";
  if (node.type === "text") return node.value ?? "";
  const inner = (node.children ?? []).map(blockText).join("");
  return node.tagName && BLOCK_TAGS.has(node.tagName) ? ` ${inner} ` : inner;
};

function walk(node: HastNode, visit: (node: HastNode, parents: HastNode[]) => void, parents: HastNode[] = []): void {
  visit(node, parents);
  for (const child of node.children ?? []) walk(child, visit, [...parents, node]);
}

const parseHtml = (html: string, fragment = true) =>
  unified().use(rehypeParse, { fragment }).parse(html) as unknown as HastNode;

// ------------------------------------------------------------- brand name

/**
 * Every spelling of the brand in post text becomes "HRwhats" (the developer's decision,
 * 2026-11-10). Links, domains and e-mail addresses are never touched: a match glued to
 * "@", ".", "/", "-" or a Latin letter, or followed by ".letter", is part of one.
 */
const BRAND = "HRwhats";
const BRAND_PATTERN = /(?<![A-Za-z0-9_@./-])hr[  ]?whats(?![A-Za-z0-9_-]|\.[A-Za-z])/giu;

type BrandChange = { post: number; before: string; after: string };

function brandText(text: string): string {
  return text.replace(BRAND_PATTERN, BRAND);
}

/** Applies the brand spelling to one string and records each change with its context. */
function brandFix(text: string, post: number, changes: BrandChange[]): string {
  const fixed = brandText(text);
  if (fixed !== text) {
    for (const match of text.matchAll(BRAND_PATTERN)) {
      if (match[0] === BRAND) continue;
      const start = Math.max(0, (match.index ?? 0) - 40);
      const end = (match.index ?? 0) + match[0].length + 40;
      changes.push({ post, before: text.slice(start, end).trim(), after: brandText(text.slice(start, end)).trim() });
    }
  }
  return fixed;
}

function brandTree(tree: HastNode, post: number, changes: BrandChange[]): void {
  walk(tree, (node, parents) => {
    if (node.type !== "text" || !node.value) return;
    if (parents.some((parent) => parent.tagName === "code" || parent.tagName === "pre")) return;
    const fixed = brandText(node.value);
    if (fixed === node.value) return;
    // Logged with the text of the block around it, so a bold «HRWhats» shows its sentence.
    const block = [...parents].reverse().find((parent) => BLOCK_TAGS.has(parent.tagName ?? ""));
    brandFix(block ? hastText(block).replace(/\s+/g, " ") : node.value, post, changes);
    node.value = fixed;
  });
}

// ----------------------------------------------------------- heading levels

type LevelReport = { before: number[]; after: number[]; rule: "A" | "B"; paragraphs: string[] };

const levelOf = (node: HastNode) => Number(node.tagName?.slice(1));

/**
 * Heading levels, approved 2026-11-10. Text and anchors never change.
 * 0. The developer's fixes for single headings (post-heading-fixes.json).
 * A. Levels that never climb back up (old posts: h2 h3 h4 h5 h6 h6 …) are siblings: all h2.
 * B. Otherwise: h1 takes the post's top level; the levels in use are renumbered h2, h3, …;
 *    headings before the first top-level one become h2; none sits more than one level below
 *    the heading before it.
 */
/**
 * Approved "paragraph" fixes: a heading that is an entry error among bold-paragraph siblings
 * becomes a bold paragraph with the same text. Each must match exactly one heading.
 * Returns the WordPress ids of the headings it turned into paragraphs.
 */
function headingsToParagraphs(tree: HastNode, id: number, fixes: HeadingFix[]): string[] {
  const excused: string[] = [];
  for (const fix of fixes) {
    if (fix.to !== "paragraph") continue;
    const matches: HastNode[] = [];
    walk(tree, (node) => {
      if (node.type !== "element" || !/^h[1-6]$/.test(node.tagName ?? "")) return;
      if (levelOf(node) === fix.from && hastText(node).trim() === fix.text) matches.push(node);
    });
    if (matches.length !== 1) {
      throw new StopError(`Post ${id}: heading fix "${fix.text}" (h${fix.from} → paragraph) matched ${matches.length} headings.`);
    }
    const [node] = matches;
    excused.push(String(node.properties?.id ?? "(none)"));
    // Blank text and <br> at the edges mean nothing in a paragraph of its own.
    const isEdge = (child: HastNode) =>
      (child.type === "text" && !/S/.test(child.value ?? "")) || (child.type === "element" && child.tagName === "br");
    const inner = [...(node.children ?? [])];
    while (inner.length > 0 && isEdge(inner[0])) inner.shift();
    while (inner.length > 0 && isEdge(inner[inner.length - 1])) inner.pop();
    const bold = inner.length === 1 && inner[0].type === "element" && ["strong", "b"].includes(inner[0].tagName ?? "");
    node.tagName = "p";
    node.properties = {};
    node.children = bold ? inner : [{ type: "element", tagName: "strong", properties: {}, children: inner }];
  }
  return excused;
}

function fixHeadingLevels(tree: HastNode, id: number, fixes: HeadingFix[]): LevelReport {
  const paragraphs = headingsToParagraphs(tree, id, fixes);
  const headings: HastNode[] = [];
  walk(tree, (node, parents) => {
    if (node.type !== "element" || !/^h[1-6]$/.test(node.tagName ?? "")) return;
    if (parents.length !== 1) throw new StopError(`Post ${id}: a heading inside <${parents.at(-1)?.tagName}>.`);
    headings.push(node);
  });
  const before = headings.map(levelOf);
  const levels = [...before];

  for (const fix of fixes) {
    if (fix.to === "paragraph") continue;
    const matches = headings.flatMap((node, index) =>
      hastText(node).trim() === fix.text && levels[index] === fix.from ? [index] : [],
    );
    if (matches.length !== 1) {
      throw new StopError(`Post ${id}: heading fix "${fix.text}" (h${fix.from}) matched ${matches.length} headings.`);
    }
    levels[matches[0]] = fix.to;
  }

  const neverClimbs = levels.every((level, index) => index === 0 || level >= levels[index - 1]);
  let after: number[];
  if (neverClimbs) {
    after = levels.map(() => 2);
  } else {
    const others = levels.filter((level) => level !== 1);
    const top = others.length > 0 ? Math.min(...others) : 2;
    const lifted = levels.map((level) => (level === 1 ? top : level));
    const ranks = [...new Set(lifted)].sort((a, b) => a - b);
    const renumbered = lifted.map((level) => ranks.indexOf(level) + 2);
    const firstTop = renumbered.indexOf(2);
    after = [];
    renumbered.forEach((level, index) => {
      const capped = index < firstTop ? 2 : Math.min(level, index === 0 ? 2 : after[index - 1] + 1);
      after.push(capped);
    });
  }
  headings.forEach((node, index) => (node.tagName = `h${after[index]}`));
  return { before, after, rule: neverClimbs ? "A" : "B", paragraphs };
}

// ------------------------------------------------------------------ links

/** Relative final URL of an internal link. Anything unknown stops the conversion. */
function finalHref(href: string, snapshot: Set<string>, oldSlugs: Record<string, string>): string {
  if (/^mailto:/i.test(href)) return href; // e-mail links stay as written in every post (approved 2026-11-10)
  const link = classifyLink(href, snapshot, new Map());
  if (!link) throw new StopError(`Unsupported link: ${href}`);
  if ("external" in link) return href;

  const url = new URL(href, `${SITE}/`);
  const path = withSlash(link.internal.cleanPath ?? link.internal.path);
  const target = oldSlugs[path] ?? path;
  if (link.internal.kind !== "page" || !snapshot.has(target) || link.internal.query) {
    throw new StopError(`Internal link needs a decision: ${href}`);
  }
  return `${target}${decodeNfc(url.hash) ?? url.hash}`;
}

// ---------------------------------------------------------- machine notes

type TextReplacement = { post: number; from: string; to: string };

type MachineNoteRules = {
  remove: RegExp[];
  review: RegExp[];
  replace: TextReplacement[];
};

function readMachineNoteRules(): MachineNoteRules {
  const source = readJson<{ remove: string[]; review: string[]; replace: TextReplacement[] }>(MACHINE_NOTES_FILE);
  return {
    remove: source.remove.map((pattern) => new RegExp(pattern, "u")),
    review: source.review.map((pattern) => new RegExp(pattern, "u")),
    replace: source.replace,
  };
}

/** The developer's exact edits to one post's text. A rule that no longer applies stops the run. */
function applyReplacements(tree: HastNode, replacements: TextReplacement[], log: string[]): void {
  const textNodes: HastNode[] = [];
  walk(tree, (node) => {
    if (node.type === "text") textNodes.push(node);
  });
  for (const { from, to } of replacements) {
    const matching = textNodes.filter((node) => node.value?.includes(from));
    if (matching.length !== 1) {
      throw new StopError(`Replacement "${from}" matched ${matching.length} text nodes, expected 1.`);
    }
    matching[0].value = matching[0].value?.replace(from, to);
    log.push(`Replaced: "${from}" → "${to}"`);
  }
}

const matchesAny = (text: string, patterns: RegExp[]) => patterns.some((pattern) => pattern.test(text));

/**
 * The one exception to verbatim text (the developer's decision): a paragraph made only of
 * sentences addressed to machines, such as a note that a table is meant to be quoted by AI
 * engines. Inside a paragraph with other sentences it stops: that needs a person.
 */
function isMachineNote(text: string, rules: MachineNoteRules): boolean {
  if (!matchesAny(text, rules.remove)) return false;
  const others = text
    .trim()
    .split(/(?<=[.!؟])\s+/)
    .filter((sentence) => !matchesAny(sentence, rules.remove));
  if (others.length > 0) throw new StopError(`A machine-directed sentence needs a decision: ${text}`);
  return true;
}

/** Drops machine-note paragraphs at any depth and returns their text. */
function removeMachineNotes(node: HastNode, rules: MachineNoteRules, removed: string[] = []): string[] {
  // Only parents: a text node given `children` is no longer collapsed by rehype-remark.
  if (!node.children) return removed;
  node.children = node.children.filter((child) => {
    if (child.tagName !== "p" || !isMachineNote(hastText(child), rules)) return true;
    removed.push(hastText(child).trim());
    return false;
  });
  for (const child of node.children) removeMachineNotes(child, rules, removed);
  return removed;
}

/** No attributes but link targets, no empty paragraphs. Other text is never touched. */
function cleanHast(node: HastNode, snapshot: Set<string>, oldSlugs: Record<string, string>): void {
  node.children = (node.children ?? []).filter((child) => {
    if (child.type === "comment") return false;
    if (child.tagName !== "p") return true;
    return hastText(child).replace(/[\s ]/g, "") !== "";
  });
  for (const child of node.children) {
    if (child.type !== "element") continue;
    if (!child.tagName || !ALLOWED_IN_POSTS.has(child.tagName)) {
      throw new StopError(`<${child.tagName}> needs a conversion decision (images are not downloaded).`);
    }
    if (child.tagName === "h1") throw new StopError("An h1 survived the heading rule.");
    const href = child.tagName === "a" ? child.properties?.href : undefined;
    child.properties = typeof href === "string" ? { href: finalHref(href, snapshot, oldSlugs) } : {};
    cleanHast(child, snapshot, oldSlugs);
  }
  hoistEdgeBreaks(node);
}

const INLINE_TAGS = new Set(["strong", "b", "em", "i", "u", "span", "mark", "a", "sub", "sup"]);

/**
 * `<strong>text<br></strong>` would become `**text\` + an encoded newline + `**`, which MDX
 * renders as a visible backslash. A <br> at either edge of an inline element (whitespace
 * aside) moves just outside it: same text, same line break.
 */
function hoistEdgeBreaks(node: HastNode): void {
  const isBreak = (child: HastNode) => child.type === "element" && child.tagName === "br";
  const isBlank = (child: HastNode) => child.type === "text" && !/\S/.test(child.value ?? "");
  const result: HastNode[] = [];
  for (const child of node.children ?? []) {
    if (child.type !== "element" || !INLINE_TAGS.has(child.tagName ?? "")) {
      result.push(child);
      continue;
    }
    const inner = [...(child.children ?? [])];
    const before: HastNode[] = [];
    const after: HastNode[] = [];
    while (inner.length > 0 && (isBreak(inner[0]) || isBlank(inner[0]))) {
      const edge = inner.shift() as HastNode;
      if (isBreak(edge)) before.push(edge);
    }
    while (inner.length > 0 && (isBreak(inner[inner.length - 1]) || isBlank(inner[inner.length - 1]))) {
      const edge = inner.pop() as HastNode;
      if (isBreak(edge)) after.unshift(edge);
    }
    if (before.length === 0 && after.length === 0) {
      result.push(child);
      continue;
    }
    child.children = inner;
    result.push(...before, ...(inner.length > 0 ? [child] : []), ...after);
  }
  node.children = result;
}

// ------------------------------------------------------------- descriptions

function excerptText(html: string): string {
  return decodeHtml(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function chooseDescription(post: FullPost, entry: DescriptionEntry | undefined): string {
  if (!entry) throw new StopError(`Post ${post.id} has no entry in ${DESCRIPTIONS_FILE}.`);
  const yoast = post.yoast_head_json?.description;
  if (entry.source === "custom") {
    if (!entry.text) throw new StopError(`Post ${post.id}: a "custom" description needs its text.`);
    return entry.text;
  }
  if (entry.source === "excerpt") {
    const excerpt = excerptText(post.excerpt.rendered);
    if (!excerpt || /\[…\]$|\[&hellip;\]$/.test(excerpt)) {
      throw new StopError(`Post ${post.id}: its excerpt is generated by WordPress, not hand-written.`);
    }
    return excerpt;
  }
  if (!yoast) throw new StopError(`Post ${post.id} has no Yoast description.`);
  return decodeHtml(yoast);
}

// ---------------------------------------------------------------- conversion

type Converted = { id: number; file: string; text: string; log: string[] };

async function convertPost(
  post: FullPost,
  reviewed: Post,
  cover: CoverEntry,
  description: DescriptionEntry | undefined,
  fixes: HeadingFix[],
  shared: { snapshot: Set<string>; oldSlugs: Record<string, string>; rules: MachineNoteRules; brand: BrandChange[] },
): Promise<Converted> {
  const { id } = post;
  const log: string[] = [];
  if (!reviewed.fileName) throw new StopError(`Post ${id} has no reviewed file name in ${SLUG_MAP_FILE}.`);
  if (cover.provisional) throw new StopError(`Post ${id}: its cover in ${COVERS_FILE} is still provisional.`);
  const slug = decodeNfc(post.slug);
  if (post.status !== "publish" || slug !== reviewed.slug) {
    throw new StopError(`Post ${id} changed since the review: status ${post.status}, slug ${slug}.`);
  }
  const seoTitle = post.yoast_head_json?.title;
  if (!seoTitle) throw new StopError(`Post ${id} has no Yoast title.`);

  const tree = parseHtml(post.content.rendered);
  applyReplacements(tree, shared.rules.replace.filter((rule) => rule.post === id), log);
  const removed = removeMachineNotes(tree, shared.rules);
  const levels = fixHeadingLevels(tree, id, fixes);
  brandTree(tree, id, shared.brand);
  cleanHast(tree, shared.snapshot, shared.oldSlugs);

  const left = hastText(tree);
  if (matchesAny(left, shared.rules.remove)) {
    throw new StopError(`Post ${id}: a machine-directed sentence remains outside a paragraph: it needs a decision.`);
  }
  for (const pattern of shared.rules.review) {
    for (const match of left.matchAll(new RegExp(pattern.source, "gu"))) {
      const start = Math.max(0, (match.index ?? 0) - 60);
      log.push(`Review (kept): "${left.slice(start, (match.index ?? 0) + 80).replace(/\s+/g, " ").trim()}"`);
    }
  }

  const processor = unified()
    .use(rehypeRemark)
    .use(remarkGfm, { tablePipeAlign: false })
    .use(remarkMdx)
    .use(remarkStringify, { bullet: "-", rule: "-", listItemIndent: "one" });
  const markdown = processor.stringify((await processor.run(tree as never)) as never);

  const categories = BUILT_CATEGORIES.filter((category) =>
    reviewed.categories.some((term) => term.slug === category),
  );
  const title = brandFix(decodeHtml(post.title.rendered), id, shared.brand);
  const metaDescription = brandFix(chooseDescription(post, description), id, shared.brand);

  // JSON strings are valid YAML, which keeps ":" and "|" in titles safe.
  const quote = (value: string) => JSON.stringify(value);
  const frontmatter = [
    "---",
    `title: ${quote(title)}`,
    `seoTitle: ${quote(decodeHtml(seoTitle).replace(/hrwhats/gi, BRAND))}`,
    `description: ${quote(metaDescription)}`,
    `slug: ${quote(reviewed.slug)}`,
    "legacySlugs: []",
    `date: ${quote(`${post.date_gmt}Z`)}`,
    `updated: ${quote(`${post.modified_gmt}Z`)}`,
    `categories: [${categories.join(", ")}]`,
    "cover:",
    `  template: ${cover.template}`,
    `  variant: ${cover.variant}`,
    ...(cover.sector ? [`  sector: ${cover.sector}`] : []),
    ...(cover.context ? [`context: ${cover.context}`] : []),
    "---",
    "",
    "",
  ].join("\n");

  log.push(`Headings (rule ${levels.rule}):`);
  log.push(`  before: ${levels.before.map((level) => `h${level}`).join(" ") || "(none)"}`);
  log.push(`  after:  ${levels.after.map((level) => `h${level}`).join(" ") || "(none)"}`);
  for (const paragraph of levels.paragraphs) log.push(`  heading → bold paragraph (approved fix): #${paragraph}`);
  log.push(`Description: ${description?.source ?? "?"}${description?.proposed !== undefined && description.source === "yoast" ? " (proposal waiting for approval)" : ""}`);
  log.push(`Machine-directed paragraphs removed: ${removed.length}`);
  for (const text of removed) log.push(`  ${text}`);

  return {
    id,
    file: join("content", "posts", "ar", `${reviewed.fileName}.mdx`),
    text: `${frontmatter}${String(markdown)}`,
    log,
  };
}

/** Parses "3420,3356,…": distinct post ids. */
function parseIds(value: string | undefined): number[] {
  const ids = (value ?? "").split(",").map((part) => Number(part.trim()));
  if (ids.length === 0 || ids.some((id) => !Number.isInteger(id) || id <= 0) || new Set(ids).size !== ids.length) {
    throw new StopError("Expected a comma-separated list of distinct post ids, e.g. 3420,3356");
  }
  return ids;
}

/** All requested posts in one request, each checked present. */
async function fetchPosts(ids: number[], fields: string): Promise<Map<number, FullPost>> {
  const posts = await fetchCollection<FullPost>("posts", `include=${ids.join(",")}&orderby=include&_fields=${fields}`);
  const byId = new Map(posts.map((post) => [post.id, post]));
  const missing = ids.filter((id) => !byId.has(id));
  if (missing.length > 0) throw new StopError(`Not returned by WordPress: ${missing.join(", ")}.`);
  return byId;
}

function readReviewed(ids: number[]): Map<number, Post> {
  const posts = readJson<SlugMap>(SLUG_MAP_FILE).posts;
  const byId = new Map(posts.map((post) => [post.id, post]));
  for (const id of ids) if (!byId.has(id)) throw new StopError(`Post ${id} is not in ${SLUG_MAP_FILE}.`);
  return byId;
}

/** Converts every post in memory first; files are written only if all of them succeed. */
async function writeMdx(ids: number[]): Promise<void> {
  const reviewed = readReviewed(ids);
  const covers = new Map(readJson<{ posts: CoverEntry[] }>(COVERS_FILE).posts.map((entry) => [entry.id, entry]));
  const descriptions = readJson<{ posts: Record<string, DescriptionEntry> }>(DESCRIPTIONS_FILE).posts;
  const headingFixes = readJson<{ posts: Record<string, HeadingFix[]> }>(HEADING_FIXES_FILE).posts;
  for (const id of ids) {
    if (!covers.has(id)) throw new StopError(`Post ${id} has no cover in ${COVERS_FILE}.`);
    if (!descriptions[String(id)]) throw new StopError(`Post ${id} has no entry in ${DESCRIPTIONS_FILE}.`);
  }
  const shared = {
    snapshot: new Set(readSnapshot().flatMap((url) => (url.path === null ? [] : [withSlash(url.path)]))),
    oldSlugs: readJson<Record<string, string>>(OLD_SLUGS_FILE),
    rules: readMachineNoteRules(),
    brand: [] as BrandChange[],
  };

  const posts = await fetchPosts(ids, POST_FIELDS);
  const converted: Converted[] = [];
  for (const id of ids) {
    converted.push(
      await convertPost(
        posts.get(id) as FullPost,
        reviewed.get(id) as Post,
        covers.get(id) as CoverEntry,
        descriptions[String(id)],
        headingFixes[String(id)] ?? [],
        shared,
      ),
    );
  }

  for (const { file, text } of converted) {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(`${file}.tmp`, text, "utf8");
    renameSync(`${file}.tmp`, file);
  }
  for (const { id, file, log } of converted) {
    heading(`#${id} → ${file.replaceAll("\\", "/")}`);
    list(log);
  }
  heading(`Brand spelling → "${BRAND}"`);
  list(shared.brand.map(({ post, before, after }) => `#${post}  «${before}»  →  «${after}»`));
  console.log(`\nWritten: ${converted.length} post(s). Requests sent: ${requestCount}`);
}

// ------------------------------------------------------------------ --verify

const words = (text: string) => brandText(text).split(/\s+/).filter(Boolean);

function findById(node: HastNode, id: string): HastNode | null {
  let found: HastNode | null = null;
  walk(node, (child) => {
    if (!found && child.properties?.id === id) found = child;
  });
  return found;
}

function headingIds(node: HastNode): string[] {
  const ids: string[] = [];
  walk(node, (child) => {
    if (/^h[1-6]$/.test(child.tagName ?? "")) ids.push(String(child.properties?.id ?? "(none)"));
  });
  return ids;
}

/** First point where two word lists part, with a little context from each. */
function firstDifference(source: string[], built: string[]): string | null {
  const length = Math.max(source.length, built.length);
  for (let index = 0; index < length; index += 1) {
    if (source[index] !== built[index]) {
      const around = (list: string[]) => list.slice(Math.max(0, index - 6), index + 8).join(" ");
      return `word ${index + 1} of ${source.length} (built: ${built.length})\n      source: …${around(source)}…\n      built:  …${around(built)}…`;
    }
  }
  return null;
}

/**
 * Checks the built pages against WordPress: the text word for word (approved removals,
 * replacements and the brand spelling aside), every heading anchor, the folder name and
 * one raw-Arabic canonical. Run after `npm run build`.
 */
async function verify(ids: number[]): Promise<void> {
  const reviewed = readReviewed(ids);
  const rules = readMachineNoteRules();
  const headingFixes = readJson<{ posts: Record<string, HeadingFix[]> }>(HEADING_FIXES_FILE).posts;
  const posts = await fetchPosts(ids, "id,slug,content");
  const rows: string[] = [];
  const details: string[] = [];

  for (const id of ids) {
    const { slug } = reviewed.get(id) as Post;
    const file = join("out", slug, "index.html");
    if (!existsSync(file)) {
      rows.push(`#${id}  folder: MISSING (${file})`);
      continue;
    }
    const page = parseHtml(readFileSync(file, "utf8"), false);
    const body = findById(page, "post-body");
    if (!body) throw new StopError(`${file}: no #post-body.`);

    const source = parseHtml((posts.get(id) as FullPost).content.rendered);
    // Approved heading → paragraph fixes: no anchor is expected for them.
    const excused = headingsToParagraphs(source, id, headingFixes[String(id)] ?? []);
    const sourceIds = headingIds(source);
    const replace = rules.replace.filter((rule) => rule.post === id);
    applyReplacements(source, replace, []);
    const removed = removeMachineNotes(source, rules);

    const textDiff = firstDifference(words(blockText(source)), words(blockText(body)));
    const builtIds = headingIds(body);
    const idDiffs = sourceIds.flatMap((sourceId, index) =>
      sourceId === builtIds[index] ? [] : [`${index + 1}: ${sourceId} ≠ ${builtIds[index] ?? "(missing)"}`],
    );
    if (builtIds.length > sourceIds.length) idDiffs.push(`extra built ids: ${builtIds.slice(sourceIds.length).join(", ")}`);

    const canonicals: string[] = [];
    walk(page, (node) => {
      const rel = node.properties?.rel;
      if (node.tagName === "link" && Array.isArray(rel) && rel.includes("canonical")) {
        canonicals.push(String(node.properties?.href));
      }
    });
    const canonicalOk = canonicals.length === 1 && canonicals[0] === `${SITE}/${slug}/`;

    rows.push(
      `#${id}  text: ${textDiff ? "DIFF" : "same"}  ids: ${idDiffs.length ? `DIFF ${idDiffs.length}` : `same ${sourceIds.length}/${sourceIds.length}`}` +
        `${excused.length ? `  excused: ${excused.length}` : ""}  folder: ok  canonical: ${canonicalOk ? "ok" : `WRONG ${JSON.stringify(canonicals)}`}  removed: ${removed.length}  replaced: ${replace.length}`,
    );
    if (textDiff) details.push(`#${id} text: ${textDiff}`);
    for (const diff of idDiffs) details.push(`#${id} id ${diff}`);
    for (const excusedId of excused) details.push(`#${id} excused (approved heading → paragraph): ${excusedId}`);
  }

  heading("Verification");
  list(rows);
  heading("Differences");
  list(details);
  console.log(`\nRequests sent: ${requestCount}`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args[0] === "--only" || args[0] === "--verify") {
    if (args.length !== 2) throw new StopError(`Usage: ${args[0]} <id>[,<id>…]`);
    const ids = parseIds(args[1]);
    await (args[0] === "--only" ? writeMdx(ids) : verify(ids));
    return;
  }
  if (args.length > 1 || (args[0] && args[0] !== "--apply-names")) {
    throw new StopError(
      "Usage: node scripts/migrate-wordpress.ts [--apply-names | --only <ids> | --verify <ids>]",
    );
  }
  if (!existsSync(AR_ROUTES_DIR)) {
    throw new StopError(`Run from the project root: ${AR_ROUTES_DIR} not found.`);
  }

  let map: SlugMap;
  if (args[0]) {
    if (!existsSync(SLUG_MAP_FILE)) throw new StopError(`Run the inventory first: ${SLUG_MAP_FILE} not found.`);
    map = JSON.parse(readFileSync(SLUG_MAP_FILE, "utf8")) as SlugMap;
  } else {
    map = await fetchInventory();
  }

  applyNames(map.posts);
  writeSlugMap(map);
  printSummary(map);
  console.log(`\nWritten: ${SLUG_MAP_FILE.replaceAll("\\", "/")}`);
}

main().catch((error: unknown) => {
  if (error instanceof StopError) {
    console.error(`\nSTOPPED after ${requestCount} request(s). Nothing was written.\n${error.message}`);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});
