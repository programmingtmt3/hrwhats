import Link from "next/link";
import { GlobeIcon } from "lucide-react";
import type { MouseEventHandler } from "react";

import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  /** Same page in the other language if it exists, otherwise that language's home. */
  href: string;
  /** The other language's name, written in that language ("English", "العربية"). */
  label: string;
  hrefLang: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export function LanguageSwitcher({ href, label, hrefLang, className, onClick }: LanguageSwitcherProps) {
  return (
    <Link
      href={href}
      hrefLang={hrefLang}
      lang={hrefLang}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium hover:bg-muted",
        className,
      )}
    >
      <GlobeIcon className="size-4" aria-hidden="true" />
      {label}
    </Link>
  );
}
