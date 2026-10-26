import type { CSSProperties } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { ExampleTag } from "./ExampleTag";
import { FeatureItem } from "./FeatureItem";
import styles from "./Impact.module.css";

/** Measure & improve: campaign dashboard mockup + the analytics features. */
export function Impact({ locale }: { locale: Locale }) {
  const { impact, exampleTag } = getDictionary(locale).sectors.charity;
  const { dashboard } = impact;

  return (
    <section>
      <div className={cn("site-container", styles.grid)}>
        <div className={styles.copy}>
          <SectionHeading eyebrow={impact.eyebrow} title={impact.title} className={styles.head} />
          <div className={styles.features}>
            {impact.features.map((feature, i) => (
              <Reveal key={feature.title} delay={0.05 * (i + 1)}>
                <FeatureItem feature={feature} heading="h3" />
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className={styles.dashWrap} delay={0.15}>
          <figure className={styles.dash} aria-label={dashboard.label}>
            <div className={styles.dashHead}>
              <b>{dashboard.title}</b>
              <span>{dashboard.period}</span>
            </div>
            <ul className={styles.kpis}>
              {dashboard.kpis.map((kpi) => (
                <li key={kpi.label}>
                  <b>{kpi.value}</b>
                  <span>{kpi.label}</span>
                </li>
              ))}
            </ul>
            <p className={styles.chartTitle}>{dashboard.chartTitle}</p>
            <ul className={styles.bars}>
              {dashboard.campaigns.map((campaign, i) => (
                <li key={campaign.name}>
                  <span>{campaign.name}</span>
                  <span
                    className={styles.track}
                    style={{ "--p": campaign.value, "--bd": `${0.4 + i * 0.12}s` } as CSSProperties}
                  >
                    <i />
                  </span>
                  <b>{campaign.value}%</b>
                </li>
              ))}
            </ul>
            <figcaption>
              <ExampleTag dark>{exampleTag}</ExampleTag>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
