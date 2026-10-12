import Image from "next/image";
import Link from "next/link";

import { LOGO } from "@/lib/brand";
import { localePath, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type LogoProps = {
  locale: Locale;
  className?: string;
  priority?: boolean;
};

export function Logo({ locale, className, priority }: LogoProps) {
  return (
    <Link href={localePath(locale, "/")} className={cn("inline-flex shrink-0", className)}>
      <Image
        src={LOGO.src}
        width={LOGO.width}
        height={LOGO.height}
        alt={LOGO.alt}
        priority={priority}
        className="size-full object-contain"
      />
    </Link>
  );
}
