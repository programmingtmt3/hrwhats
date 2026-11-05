import { Link2 } from "lucide-react";

import { LegalHelp } from "@/components/legal/LegalHelp";
import styles from "@/components/legal/Legal.module.css";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageGlow } from "@/components/sections/PageGlow";
import { PageHero } from "@/components/sections/PageHero";
import { PageToc } from "@/components/shared/PageToc";
import { format, getDictionary, type Locale } from "@/lib/i18n";
import type { LegalSlug } from "@/lib/navigation";
import { breadcrumbJsonLd } from "@/lib/seo";

/** One template for the three legal pages: hero, sticky table of contents, sections, help box. */
export function LegalPage({ locale, slug }: { locale: Locale; slug: LegalSlug }) {
  const dict = getDictionary(locale);
  const legal = dict.legal;
  const page = legal.pages[slug];
  const toc = page.sections.map(({ id, title }) => ({ id, title }));

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          [dict.nav.home, "/"],
          [page.name, `/${slug}/`],
        ])}
      />
      <PageGlow>
        <PageHero eyebrow={legal.eyebrow} title={page.title} />
        <div className={`site-container ${styles.layout}`}>
          <PageToc items={toc} title={legal.toc.title} label={format(legal.toc.label, { page: page.name })} />
          <div className={styles.body}>
            {page.sections.map((section) => (
              <section key={section.id} id={section.id} className={styles.section}>
                <h2>
                  {section.title}
                  <a
                    href={`#${section.id}`}
                    className={styles.anchor}
                    aria-label={format(legal.sectionLink, { title: section.title })}
                  >
                    <Link2 aria-hidden="true" />
                  </a>
                </h2>
                {section.text.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {"list" in section && section.list && (
                  <ul>
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
            <LegalHelp locale={locale} current={slug} />
          </div>
        </div>
      </PageGlow>
    </>
  );
}
