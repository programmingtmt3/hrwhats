import { JsonLd } from "@/components/seo/JsonLd";
import { Cta } from "@/components/sections/cta/Cta";
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

/** Open Graph only — never shown on the page (its baked-in text repeats the hero). */
const OG_IMAGE = { url: "/images/sectors/charity/hero.jpg", width: 770, height: 580 };

const sectorPath = () => `/${getSector(SLUG).slug}/`;

export function charityMetadata(locale: Locale) {
  const { meta } = getDictionary(locale).sectors.charity;
  return getPageMetadata(locale, sectorPath(), meta, { ...OG_IMAGE, alt: meta.ogImageAlt });
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
      <Cta locale={locale} />
    </>
  );
}
