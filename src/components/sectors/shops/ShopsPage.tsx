import { JsonLd } from "@/components/seo/JsonLd";
import { getSector, t } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { breadcrumbJsonLd, getPageMetadata, serviceJsonLd } from "@/lib/seo";

import { BagClosing } from "./BagClosing";
import { QrSection } from "./QrSection";
import { Shelves } from "./Shelves";
import { ShopsHero } from "./ShopsHero";

/** Slug + name come from content/data/sectors.json; the route folder must match it. */
const SLUG = "shops";

const sectorPath = () => `/${getSector(SLUG).slug}/`;

/** No page image: inherits the site-wide Open Graph image (launch phase). */
export function shopsMetadata(locale: Locale) {
  return getPageMetadata(locale, sectorPath(), getDictionary(locale).sectors.shops.meta);
}

export function ShopsPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const page = dict.sectors.shops;
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
      <ShopsHero locale={locale} eyebrow={name} />
      <QrSection locale={locale} />
      <Shelves locale={locale} />
      {/* The shopping bag is this page's CTA (replaces the site-wide <Cta>). */}
      <BagClosing locale={locale} />
    </>
  );
}
