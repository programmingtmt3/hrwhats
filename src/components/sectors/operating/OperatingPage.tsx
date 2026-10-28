import { JsonLd } from "@/components/seo/JsonLd";
import { getSector, t } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { breadcrumbJsonLd, getPageMetadata, serviceJsonLd } from "@/lib/seo";

import { Clipboards } from "./Clipboards";
import { OperatingHero } from "./OperatingHero";
import { PowerPanel } from "./PowerPanel";
import { Tape } from "./Status";

/** Slug + name come from content/data/sectors.json; the route folder must match it. */
const SLUG = "operating-service";

const sectorPath = () => `/${getSector(SLUG).slug}/`;

/** No page image: inherits the site-wide Open Graph image (launch phase). */
export function operatingMetadata(locale: Locale) {
  return getPageMetadata(locale, sectorPath(), getDictionary(locale).sectors.operating.meta);
}

export function OperatingPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const page = dict.sectors.operating;
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
      <OperatingHero locale={locale} eyebrow={name} />
      <Tape />
      <Clipboards locale={locale} />
      <Tape />
      {/* The control panel is this page's CTA (replaces the site-wide <Cta>). */}
      <PowerPanel locale={locale} />
    </>
  );
}
