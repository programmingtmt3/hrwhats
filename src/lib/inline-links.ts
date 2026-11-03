/**
 * Minimal inline-link markup for data files: `[label](/internal/path/)`, or
 * `[label](docs:/path/)` for the usage guide (resolved against `docsUrl` in
 * site.json, so the domain is never written in content). Keeps raw HTML out of
 * content. Internal paths are locale-neutral.
 */
export type InlinePart = string | { label: string; href: string };

const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

export function parseInlineLinks(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK)) {
    const index = match.index ?? 0;
    if (index > last) parts.push(text.slice(last, index));
    parts.push({ label: match[1], href: match[2] });
    last = index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/** Visible text only (link labels kept, markup removed) — e.g. for JSON-LD. */
export function toPlainText(text: string): string {
  return text.replace(LINK, "$1");
}

const DOCS = "docs:";

/** The usage-guide path of a `docs:/path/` link, or null for an internal link. */
export function docsPath(href: string): string | null {
  return href.startsWith(DOCS) ? href.slice(DOCS.length) : null;
}

/** Validation: every link is an internal path like `/slug/` or `docs:/slug/`, and there is no raw HTML. */
export function hasOnlyAllowedLinks(text: string): boolean {
  if (/[<>]/.test(text)) return false;
  return [...text.matchAll(LINK)].every(([, , href]) => /^\/([a-z0-9-]+\/)*$/.test(docsPath(href) ?? href));
}
