import { readFileSync, readdirSync } from "node:fs";
import { basename } from "node:path";

import { defineCollection, defineConfig, s } from "velite";

const COVER_TEMPLATES = ["ban-protection", "whatsapp-messages", "platform", "chatbot-ai", "marketing", "sector"] as const;
/** How many variants each cover template draws. */
const COVER_VARIANTS: Record<(typeof COVER_TEMPLATES)[number], number> = {
  "ban-protection": 2,
  "whatsapp-messages": 2,
  platform: 4,
  "chatbot-ai": 3,
  marketing: 3,
  sector: 2,
};
/** Motifs drawn for covers only: these have no sector page and no home card. */
const COVER_ONLY_SECTORS = ["healthcare", "legal"];
/** The context box under a post's text (texts in messages/ar.json → blog.context). */
const POST_CONTEXTS = ["unblock", "avoid", "sector"] as const;
const MAX_SLUG_BYTES = 255;
const ASCII_FILE_NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;
/** Static routes that are planned but have no folder yet. */
const PLANNED_ROUTES = ["news", "category"];

const readSlugs = (file: string) =>
  (JSON.parse(readFileSync(file, "utf8")) as { slug: string }[]).map((item) => item.slug);

const categorySlugs = readSlugs("content/data/categories.json") as [string, ...string[]];
const sectorSlugs = readSlugs("content/data/sectors.json");
const coverSectors = [...sectorSlugs, ...COVER_ONLY_SECTORS] as [string, ...string[]];

type AstNode = {
  type: string;
  tagName?: string;
  depth?: number;
  value?: string;
  properties?: Record<string, unknown>;
  children?: AstNode[];
};

const nodeText = (node: AstNode): string =>
  node.value ?? (node.children ?? []).map(nodeText).join("");

/** Readable anchors, the way WordPress wrote them: letters and digits joined with hyphens. */
function createHeadingIds() {
  const used = new Map<string, number>();
  return (text: string) => {
    const base = text
      .normalize("NFC")
      .replace(/[ً-ْ]/g, "-") // WordPress turns each haraka into a hyphen (جدًا → جد-ا)
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .trim()
      .replace(/[\s-]+/g, "-")
      .replace(/^-|-$/g, ""); // a haraka at either end leaves no hyphen there (نهائياً → نهائيا)
    const count = (used.get(base) ?? 0) + 1;
    used.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  };
}

/** Gives every heading in the page its anchor. The table of contents derives the same ids. */
function rehypeHeadingIds() {
  return (tree: AstNode) => {
    const nextId = createHeadingIds();
    for (const node of tree.children ?? []) {
      if (node.tagName && /^h[1-6]$/.test(node.tagName)) {
        node.properties = { ...node.properties, id: nextId(nodeText(node)) };
      }
    }
  };
}

const posts = defineCollection({
  name: "Post",
  pattern: "posts/*/*.mdx",
  schema: s
    .object({
      title: s.string().min(1),
      seoTitle: s.string().min(1),
      description: s.string().min(1),
      slug: s.string().min(1),
      legacySlugs: s.array(s.string()),
      date: s.isodate(),
      updated: s.isodate(),
      categories: s.array(s.enum(categorySlugs)).min(1),
      cover: s
        .object({
          template: s.enum(COVER_TEMPLATES),
          variant: s.number().int().min(1).default(1),
          sector: s.enum(coverSectors).optional(),
        })
        .superRefine((cover, ctx) => {
          const problem = (message: string) => ctx.addIssue({ code: "custom", message });
          if (cover.template === "sector" && !cover.sector) problem('A "sector" cover needs cover.sector');
          if (cover.template !== "sector" && cover.sector) problem('cover.sector belongs only to a "sector" cover');
          if (cover.variant > COVER_VARIANTS[cover.template]) {
            problem(`The "${cover.template}" cover has no variant ${cover.variant}`);
          }
        }),
      context: s.enum(POST_CONTEXTS).optional(),
      body: s.mdx(),
    })
    .superRefine((post, ctx) => {
      // The sector box links to the sector's page, so only sectors that have one qualify.
      if (post.context === "sector" && !sectorSlugs.includes(post.cover.sector ?? "")) {
        ctx.addIssue({ code: "custom", message: 'context "sector" needs a cover.sector that has a sector page' });
      }
    })
    .transform((data, { meta }) => {
      const nextId = createHeadingIds();
      const toc: { id: string; title: string }[] = [];
      for (const node of (meta.mdast?.children ?? []) as AstNode[]) {
        if (node.type !== "heading") continue;
        const title = nodeText(node);
        const id = nextId(title);
        if (node.depth === 2) toc.push({ id, title: title.trim() });
      }
      const path = meta.path.replace(/\\/g, "/");
      return {
        ...data,
        locale: /\/posts\/(ar|en)\//.exec(path)?.[1] as "ar" | "en",
        fileName: basename(path, ".mdx"),
        toc,
      };
    }),
});

export default defineConfig({
  root: "content",
  output: { data: ".velite", assets: ".velite/static", base: "/static/", clean: true },
  collections: { posts },
  mdx: { rehypePlugins: [rehypeHeadingIds] },
  /** Pages, sectors and posts share the site root, so a post's slug must be free and valid. */
  prepare({ posts: all }) {
    const routeFolders = readdirSync("src/app/(ar)", { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !/^[[(]/.test(entry.name))
      .map((entry) => entry.name);
    const reserved = new Set([...routeFolders, ...readSlugs("content/data/sectors.json"), ...PLANNED_ROUTES]);

    const problems: string[] = [];
    const seen = new Map<string, string>();
    for (const post of all) {
      const owner = `${post.locale}/${post.fileName}.mdx`;
      if (!post.locale) problems.push(`${post.fileName}.mdx: not under a locale folder`);
      if (!ASCII_FILE_NAME.test(post.fileName)) problems.push(`${owner}: the file name must be ASCII English`);
      if (post.slug !== post.slug.normalize("NFC")) problems.push(`${owner}: slug is not NFC`);
      if (/[/?#%\s]/.test(post.slug)) problems.push(`${owner}: slug contains / ? # % or whitespace`);
      if (Buffer.byteLength(post.slug, "utf8") > MAX_SLUG_BYTES) problems.push(`${owner}: slug is over 255 bytes`);

      if (post.locale !== "ar") continue; // Other locales live under their own prefix.
      if (reserved.has(post.slug)) problems.push(`${owner}: slug "${post.slug}" is taken by a page or sector`);
      const other = seen.get(post.slug);
      if (other) problems.push(`${owner}: slug "${post.slug}" is already used by ${other}`);
      seen.set(post.slug, owner);
    }
    if (problems.length > 0) {
      throw new Error(`Invalid posts:\n  ${problems.join("\n  ")}`);
    }
  },
});
