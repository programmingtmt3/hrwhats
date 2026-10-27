import { JsonLd } from "@/components/seo/JsonLd";
import { getSector, t } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { breadcrumbJsonLd, getPageMetadata, serviceJsonLd } from "@/lib/seo";

import { Closing } from "./Closing";
import { RealEstateHero } from "./RealEstateHero";
import { Services } from "./Services";

/** Slug + name come from content/data/sectors.json; the route folder must match it. */
const SLUG = "real-estate-contracting";

const sectorPath = () => `/${getSector(SLUG).slug}/`;

/** No page image: inherits the site-wide Open Graph image (launch phase). */
export function realEstateMetadata(locale: Locale) {
  return getPageMetadata(locale, sectorPath(), getDictionary(locale).sectors.realEstate.meta);
}

export function RealEstatePage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const page = dict.sectors.realEstate;
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
      <RealEstateHero locale={locale} eyebrow={name} />
      <Services locale={locale} />
      {/* The closing panel is this page's CTA (replaces the site-wide <Cta>). */}
      <Closing locale={locale} />
    </>
  );
}
