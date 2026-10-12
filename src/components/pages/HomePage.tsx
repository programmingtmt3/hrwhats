import { Cta } from "@/components/sections/cta/Cta";
import { Faq } from "@/components/sections/faq/Faq";
import { Features } from "@/components/sections/features/Features";
import { Hero } from "@/components/sections/hero/Hero";
import { Sectors } from "@/components/sections/sectors/Sectors";
import { TrustBar } from "@/components/sections/TrustBar";
import { Why } from "@/components/sections/why/Why";
import type { Locale } from "@/lib/i18n";

export function HomePage({ locale }: { locale: Locale }) {
  return (
    <>
      <Hero locale={locale} />
      <TrustBar locale={locale} />
      <Features locale={locale} />
      <Why locale={locale} />
      <Sectors locale={locale} />
      <Faq locale={locale} />
      <Cta locale={locale} />
    </>
  );
}
