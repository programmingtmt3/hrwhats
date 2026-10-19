import { JsonLd } from "@/components/seo/JsonLd";
import { Cta } from "@/components/sections/cta/Cta";
import { PageHero } from "@/components/sections/PageHero";
import { HiringPlans } from "@/components/sections/packages/HiringPlans";
import { WhatsappPlans } from "@/components/sections/packages/WhatsappPlans";
import { getDictionary, type Locale } from "@/lib/i18n";
import { breadcrumbJsonLd, whatsappPlansJsonLd } from "@/lib/seo";

export function PackagesPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { hero } = dict.packagesPage;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          [dict.nav.home, "/"],
          [dict.nav.packages, "/packages/"],
        ])}
      />
      {whatsappPlansJsonLd(locale).map((product) => (
        <JsonLd key={product.name} data={product} />
      ))}
      <PageHero eyebrow={hero.eyebrow} title={hero.title} />
      <WhatsappPlans locale={locale} />
      <HiringPlans locale={locale} />
      <Cta locale={locale} />
    </>
  );
}
