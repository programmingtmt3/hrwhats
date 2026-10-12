import { ArrowIcon } from "@/components/icons";
import { RevealLink } from "@/components/motion/RevealLink";
import { SiteImage } from "@/components/ui/SiteImage";
import { getSectors, t } from "@/lib/content";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";

import { SectionHeading } from "../SectionHeading";
import styles from "./Sectors.module.css";

export function Sectors({ locale }: { locale: Locale }) {
  const { sectors: heading } = getDictionary(locale).home;

  return (
    <section id="sectors">
      <div className="site-container">
        <SectionHeading eyebrow={heading.eyebrow} title={heading.title} lead={heading.lead} />

        <div className={styles.grid}>
          {getSectors().map((sector, i) => {
            const name = t(sector.name, locale);
            return (
              <RevealLink
                key={sector.slug}
                href={localePath(locale, `/${sector.slug}/`)}
                className={styles.sector}
                // Stagger per row of five, as in the design.
                delay={(i % 5) * 0.06}
              >
                <SiteImage
                  src={sector.image}
                  alt={name}
                  fill
                  sizes="(max-width: 600px) 50vw, (max-width: 1080px) 33vw, 240px"
                />
                <div className={styles.lbl}>
                  <h3>{name}</h3>
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
