import { SiteImage } from "@/components/ui/SiteImage";
import { LOGO, LOGO_SQUARE } from "@/lib/brand";

type BrandLogoProps = {
  className?: string;
  /** Rendered CSS width, used to pick the right optimized size. */
  sizes: string;
  /** Empty alt for decorative use (e.g. chat avatar next to the name). */
  decorative?: boolean;
  priority?: boolean;
  /** Use the original square file (with transparent margins). */
  square?: boolean;
};

export function BrandLogo({ className, sizes, decorative, priority, square }: BrandLogoProps) {
  const logo = square ? LOGO_SQUARE : LOGO;
  return (
    <SiteImage
      src={logo.src}
      width={logo.width}
      height={logo.height}
      alt={decorative ? "" : logo.alt}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
