import type { CSSProperties } from "react";

import { ArrowIcon, WhatsAppIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { getSite } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import styles from "./PowerPanel.module.css";

const LIGHTS = 6;

/**
 * Closing + CTA as a control panel: the words on the inline-start side, the
 * switch and lights on the inline-end side (above the words on phones). The
 * switch flips on once when first seen, the lights turn green one by one, then
 * the words and buttons appear. Replaces the site-wide <Cta>.
 */
export function PowerPanel({ locale }: { locale: Locale }) {
  const { closing } = getDictionary(locale).sectors.operating;
  const site = getSite();

  return (
    <section className={styles.section}>
      <div className="site-container">
        <Reveal className={styles.panel}>
          <span className={styles.screws} aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>

          {/* reveal-child: hidden only while waiting, so it still shows with JS off. */}
          <div className={cn("reveal-child", styles.content)}>
            <h2>
              {closing.title.before}
              <span className={styles.highlight}>{closing.title.highlight}</span>
              {closing.title.after}
            </h2>
            <p>{closing.text}</p>
            <p className={styles.lead}>{closing.highlight}</p>
            <div className={styles.actions}>
              <a href={site.appUrls.signup} className="btn btn-primary">
                {closing.primaryCta}
                <ArrowIcon className="icon-forward" />
              </a>
              <a href={site.contact.whatsapp.url} className="btn btn-outline-light" target="_blank" rel="noopener">
                <WhatsAppIcon />
                {closing.salesCta}
              </a>
            </div>
          </div>

          <div className={styles.controls} aria-hidden="true">
            <span className={styles.switch}>
              <small className={styles.onLabel}>{closing.on}</small>
              <span className={styles.slot}>
                <i className={styles.lever} />
              </span>
              <small className={styles.offLabel}>{closing.off}</small>
            </span>
            <span className={styles.lights}>
              {Array.from({ length: LIGHTS }, (_, i) => (
                <i key={i} style={{ "--i": i } as CSSProperties} />
              ))}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
