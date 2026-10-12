/**
 * Minimal inline-link markup for data files: `[label](/internal/path/)`.
 * Keeps raw HTML out of content. Paths are locale-neutral and internal only.
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

/** Validation: every link is an internal path like `/slug/`, and there is no raw HTML. */
export function hasOnlyInternalLinks(text: string): boolean {
  if (/[<>]/.test(text)) return false;
  return [...text.matchAll(LINK)].every(([, , href]) => /^\/([a-z0-9-]+\/)*$/.test(href));
}
