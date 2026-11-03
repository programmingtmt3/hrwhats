import type { AnchorHTMLAttributes } from "react";

type NewTabLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** Accessible name, including the "opens in a new tab" note (`nav.newTab` in the dictionary). */
  label: string;
};

/** External link that opens in a new tab (the usage guide on docs.hrwhats.com). */
export function NewTabLink({ label, ...props }: NewTabLinkProps) {
  return <a target="_blank" rel="noopener noreferrer" aria-label={label} {...props} />;
}
