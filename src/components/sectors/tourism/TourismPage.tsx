import { JsonLd } from "@/components/seo/JsonLd";
import { getSector, tRequired } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { breadcrumbJsonLd, getPageMetadata, serviceJsonLd } from "@/lib/seo";

import { Journey } from "./Journey";
import { LuggageTag } from "./LuggageTag";
import { TourismHero } from "./TourismHero";
import { MapStage } from "./WorldMap";

/** Slug + name come from content/data/sectors.json; the route folder must match it. */
const SLUG = "tourism-hospitality";

const sectorPath = () => `/${getSector(SLUG).slug}/`;

/** No page image: inherits the site-wide Open Graph image (launch phase). */
export function tourismMetadata(locale: Locale) {
  return getPageMetadata(locale, sectorPath(), getDictionary(locale).sectors.tourism.meta);
}

export function TourismPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const page = dict.sectors.tourism;
  const name = tRequired(getSector(SLUG).name, locale);
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
      {/* One world map behind the hero and the start of the journey, then it fades out. */}
      <MapStage>
        <TourismHero locale={locale} eyebrow={name} />
        <Journey locale={locale} />
      </MapStage>
      {/* The luggage tag is this page's CTA (replaces the site-wide <Cta>). */}
      <LuggageTag locale={locale} />
    </>
  );
}
