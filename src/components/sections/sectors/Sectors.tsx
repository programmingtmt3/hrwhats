import { ArrowIcon } from "@/components/icons";
import { RevealLink } from "@/components/motion/RevealLink";
import { getSectors, tRequired } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { localizeLink } from "@/lib/navigation";

import { SectionHeading } from "../SectionHeading";
import { SectorMotif, type MotifSlug } from "./SectorMotif";
import styles from "./Sectors.module.css";

export function Sectors({ locale }: { locale: Locale }) {
  const { sectors: heading } = getDictionary(locale).home;

  return (
    <section id="sectors">
      <div className="site-container">
        <SectionHeading eyebrow={heading.eyebrow} title={heading.title} lead={heading.lead} />

        <div className={styles.grid}>
          {getSectors().map((sector, i) => {
            const slug = sector.slug as MotifSlug;
            const tagline = heading.cards[slug];
            // Fails the build when a sector in sectors.json has no card text.
            if (!tagline) throw new Error(`home.sectors.cards["${sector.slug}"] is missing in messages`);
            // An untranslated sector page: the Arabic page, with hrefLang="ar".
            const link = localizeLink(locale, `/${sector.slug}/`, tRequired(sector.name, locale));

            return (
              <RevealLink
                key={sector.slug}
                href={link.href}
                hrefLang={link.hrefLang}
                className={styles.card}
                // Stagger per row of five, as in the design.
                delay={(i % 5) * 0.06}
              >
                <SectorMotif slug={slug} cursorName={heading.cursorName} />
                <div className={styles.body}>
                  <h3>{link.label}</h3>
                  <p>{tagline}</p>
                  <span className={styles.arrow}>
                    <ArrowIcon strokeWidth={2.5} className="icon-forward" />
                  </span>
                </div>
              </RevealLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}
