import { JsonLd } from "@/components/seo/JsonLd";
import { getSector, t } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { breadcrumbJsonLd, getPageMetadata, serviceJsonLd } from "@/lib/seo";

import { Chalkboard } from "./Chalkboard";
import { FloorPlan } from "./FloorPlan";
import { OpenSign } from "./OpenSign";
import { RestaurantsHero } from "./RestaurantsHero";
import { ValueMenu } from "./ValueMenu";

/** Slug + name come from content/data/sectors.json; the route folder must match it. */
const SLUG = "restaurants-cafes";

const sectorPath = () => `/${getSector(SLUG).slug}/`;

/** No page image: inherits the site-wide Open Graph image (launch phase). */
export function restaurantsMetadata(locale: Locale) {
  return getPageMetadata(locale, sectorPath(), getDictionary(locale).sectors.restaurants.meta);
}

export function RestaurantsPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const page = dict.sectors.restaurants;
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
      <RestaurantsHero locale={locale} eyebrow={name} />
      <FloorPlan locale={locale} />
      <Chalkboard locale={locale} />
      <ValueMenu locale={locale} />
      {/* The neon sign is this page's CTA (replaces the site-wide <Cta>). */}
      <OpenSign locale={locale} />
    </>
  );
}
