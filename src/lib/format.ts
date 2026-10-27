/**
 * Replace `{name}` placeholders in a dictionary string. Kept in its own module
 * (no dictionary import) so client components can use it without bundling
 * the messages; `@/lib/i18n` re-exports it.
 */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
