import { Megaphone } from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { ExampleTag } from "../shared/ExampleTag";
import { FeatureItem } from "../shared/FeatureItem";
import styles from "./Chalkboard.module.css";

/** Campaigns: a quiet-hours offer on a chalkboard, sent to past customers on WhatsApp. */
export function Chalkboard({ locale }: { locale: Locale }) {
  const page = getDictionary(locale).sectors.restaurants;
  const data = page.visuals.chalk;

  return (
    <section className={styles.section}>
      <div className={cn("site-container", styles.grid)}>
        <Reveal className={styles.text}>
          <FeatureItem feature={page.items.campaigns} heading="h2" plain />
        </Reveal>

        <Reveal as="figure" className={styles.visual} delay={0.1} aria-label={data.label}>
          <div className={styles.board}>
            <ExampleTag dark className={styles.tag}>
              {page.exampleTag}
            </ExampleTag>
            <p className={styles.boardTitle}>{data.board}</p>
            <p className={styles.when}>{data.when}</p>
            <p className={styles.offer}>{data.offer}</p>
            {/* A chalk-drawn cup. */}
            <span className={styles.cup} aria-hidden="true" />
            <span className={styles.chalk} aria-hidden="true" />
          </div>

          <div className={styles.broadcast}>
            <small>
              <Megaphone aria-hidden="true" />
              {data.sentTo}
            </small>
            <p>{data.broadcast}</p>
            <span className={styles.cta}>{data.cta}</span>
            <time>{data.time}</time>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
