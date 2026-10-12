import { Hero } from "@/components/sections/hero/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import type { Locale } from "@/lib/i18n";

export function HomePage({ locale }: { locale: Locale }) {
  return (
    <>
      <Hero locale={locale} />
      <TrustBar locale={locale} />
    </>
  );
}
