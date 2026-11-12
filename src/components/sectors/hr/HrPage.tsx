import { JsonLd } from "@/components/seo/JsonLd";
import { getSector, tRequired } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { breadcrumbJsonLd, getPageMetadata, serviceJsonLd } from "@/lib/seo";

import { GateWelcome } from "./GateWelcome";
import { HrHero } from "./HrHero";
import { Journey } from "./Journey";

/** Slug + name come from content/data/sectors.json; the route folder must match it. */
const SLUG = "hr";

const sectorPath = () => `/${getSector(SLUG).slug}/`;

/** No page image: inherits the site-wide Open Graph image (launch phase). */
export function hrMetadata(locale: Locale) {
  return getPageMetadata(locale, sectorPath(), getDictionary(locale).sectors.hr.meta);
}

export function HrPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const page = dict.sectors.hr;
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
      <HrHero locale={locale} eyebrow={name} />
      <Journey locale={locale} />
      {/* The entrance reader is this page's CTA (replaces the site-wide <Cta>). */}
      <GateWelcome locale={locale} />
    </>
  );
}
