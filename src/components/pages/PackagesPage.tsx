import { PageHero } from "@/components/sections/PageHero";
import { WhatsappPlans } from "@/components/sections/packages/WhatsappPlans";
import { getDictionary, type Locale } from "@/lib/i18n";

export function PackagesPage({ locale }: { locale: Locale }) {
  const { hero } = getDictionary(locale).packagesPage;

  return (
    <>
      <PageHero eyebrow={hero.eyebrow} title={hero.title} />
      <WhatsappPlans locale={locale} />
    </>
  );
}
