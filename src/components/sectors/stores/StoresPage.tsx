import { JsonLd } from "@/components/seo/JsonLd";
import { getSector, tRequired } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { breadcrumbJsonLd, getPageMetadata, serviceJsonLd } from "@/lib/seo";

import { Checkout } from "./Checkout";
import { Services } from "./Services";
import { StoresHero } from "./StoresHero";

/** Slug + name come from content/data/sectors.json; the route folder must match it. */
const SLUG = "online-stores-systems";

const sectorPath = () => `/${getSector(SLUG).slug}/`;

/** No page image: inherits the site-wide Open Graph image (launch phase). */
export function storesMetadata(locale: Locale) {
  return getPageMetadata(locale, sectorPath(), getDictionary(locale).sectors.stores.meta);
}

export function StoresPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const page = dict.sectors.stores;
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
      <StoresHero locale={locale} eyebrow={name} />
      <Services locale={locale} />
      {/* The order summary is this page's CTA (replaces the site-wide <Cta>). */}
      <Checkout locale={locale} />
    </>
  );
}
