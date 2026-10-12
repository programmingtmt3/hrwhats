import Link from "next/link";
import { GlobeIcon } from "lucide-react";

type LanguageSwitcherProps = {
  /** Same page in the other language if it exists, otherwise that language's home. */
  href: string;
  label: string;
  hrefLang: string;
};

export function LanguageSwitcher({ href, label, hrefLang }: LanguageSwitcherProps) {
  return (
    <Link
      href={href}
      hrefLang={hrefLang}
      lang={hrefLang}
      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium hover:bg-muted"
    >
      <GlobeIcon className="size-4" aria-hidden="true" />
      {label}
    </Link>
  );
}
