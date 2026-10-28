import { ArrowIcon } from "@/components/icons";
import { RevealLink } from "@/components/motion/RevealLink";
import { getSectors, t } from "@/lib/content";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";

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

            return (
              <RevealLink
                key={sector.slug}
                href={localePath(locale, `/${sector.slug}/`)}
                className={styles.card}
                // Stagger per row of five, as in the design.
                delay={(i % 5) * 0.06}
              >
                <SectorMotif slug={slug} cursorName={heading.cursorName} />
                <div className={styles.body}>
                  <h3>{t(sector.name, locale)}</h3>
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
