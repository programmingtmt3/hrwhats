import { JsonLd } from "@/components/seo/JsonLd";
import { getSector, tRequired } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { breadcrumbJsonLd, getPageMetadata, serviceJsonLd } from "@/lib/seo";

import { Certificate } from "./Certificate";
import { EducationHero } from "./EducationHero";
import { Services } from "./Services";

/** Slug + name come from content/data/sectors.json; the route folder must match it. */
const SLUG = "education-training";

const sectorPath = () => `/${getSector(SLUG).slug}/`;

/** No page image: inherits the site-wide Open Graph image (launch phase). */
export function educationMetadata(locale: Locale) {
  return getPageMetadata(locale, sectorPath(), getDictionary(locale).sectors.education.meta);
}

export function EducationPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const page = dict.sectors.education;
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
      <EducationHero locale={locale} eyebrow={name} />
      <Services locale={locale} />
      {/* The certificate is this page's CTA (replaces the site-wide <Cta>). */}
      <Certificate locale={locale} />
    </>
  );
}
