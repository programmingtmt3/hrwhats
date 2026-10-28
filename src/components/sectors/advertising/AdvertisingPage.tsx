import { JsonLd } from "@/components/seo/JsonLd";
import { getSector, t } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { breadcrumbJsonLd, getPageMetadata, serviceJsonLd } from "@/lib/seo";

import { AdvertisingHero } from "./AdvertisingHero";
import { Artboards } from "./Artboards";
import canvas from "./Canvas.module.css";
import { SponsoredPost } from "./SponsoredPost";

/** Slug + name come from content/data/sectors.json; the route folder must match it. */
const SLUG = "advertising";

const sectorPath = () => `/${getSector(SLUG).slug}/`;

/** No page image: inherits the site-wide Open Graph image (launch phase). */
export function advertisingMetadata(locale: Locale) {
  return getPageMetadata(locale, sectorPath(), getDictionary(locale).sectors.advertising.meta);
}

export function AdvertisingPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const page = dict.sectors.advertising;
  const name = t(getSector(SLUG).name, locale);
  const path = sectorPath();

  return (
    <div className={canvas.page}>
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
      <AdvertisingHero locale={locale} eyebrow={name} />
      <Artboards locale={locale} />
      {/* The sponsored post is this page's CTA (replaces the site-wide <Cta>). */}
      <SponsoredPost locale={locale} />
    </div>
  );
}
