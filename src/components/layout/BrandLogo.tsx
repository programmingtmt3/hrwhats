import { SiteImage } from "@/components/ui/SiteImage";
import { LOGO } from "@/lib/brand";

type BrandLogoProps = {
  className?: string;
  /** Rendered CSS width, used to pick the right optimized size. */
  sizes: string;
  /** Empty alt for decorative use (e.g. chat avatar next to the name). */
  decorative?: boolean;
  priority?: boolean;
};

export function BrandLogo({ className, sizes, decorative, priority }: BrandLogoProps) {
  return (
    <SiteImage
      src={LOGO.src}
      width={LOGO.width}
      height={LOGO.height}
      alt={decorative ? "" : LOGO.alt}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
