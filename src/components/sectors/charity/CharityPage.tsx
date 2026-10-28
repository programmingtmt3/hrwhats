import { JsonLd } from "@/components/seo/JsonLd";
import { getSector, t } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { breadcrumbJsonLd, getPageMetadata, serviceJsonLd } from "@/lib/seo";

import { CharityHero } from "./CharityHero";
import { DonorJourney } from "./DonorJourney";
import { Impact } from "./Impact";
import { Result } from "./Result";
import { Services } from "./Services";

/** Slug + name come from content/data/sectors.json; the route folder must match it. */
const SLUG = "charity";

const sectorPath = () => `/${getSector(SLUG).slug}/`;

/** No page image: inherits the site-wide Open Graph image (launch phase). */
export function charityMetadata(locale: Locale) {
  return getPageMetadata(locale, sectorPath(), getDictionary(locale).sectors.charity.meta);
}

export function CharityPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const page = dict.sectors.charity;
  const name = t(getSector(SLUG).name, locale);
  const path = sectorPath();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          [dict.nav.home, "/"],
          [name, path],
        ])}
      />
      <JsonLd
        data={serviceJsonLd(locale, {
          name: page.service.name,
          description: page.meta.description,
          path,
          audience: name,
        })}
      />
      <CharityHero locale={locale} eyebrow={name} />
      <Services locale={locale} />
      <DonorJourney locale={locale} />
      <Impact locale={locale} />
      <Result locale={locale} />
    </>
  );
}
