/**
 * WordPress post inventory for human review. Writes no MDX and downloads no images.
 *
 *   node scripts/migrate-wordpress.ts                 fetch posts → scripts/slug-map.json
 *   node scripts/migrate-wordpress.ts --apply-names   no network: apply the reviewed file
 *                                                     names from data/post-file-names.json
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

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args[0] && args[0] !== "--apply-names")) {
    throw new StopError("Usage: node scripts/migrate-wordpress.ts [--apply-names]");
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
