import { ArrowIcon, WhatsAppIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { getSite } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import styles from "./OpenSign.module.css";

/**
 * Closing + CTA: an "open now" neon sign on a dark brick wall flickers on once
 * when first seen, then the words and buttons appear. Replaces the site-wide <Cta>.
 */
export function OpenSign({ locale }: { locale: Locale }) {
  const { closing } = getDictionary(locale).sectors.restaurants;
  const site = getSite();

  return (
    <section className={styles.section}>
      <div className="site-container">
        <Reveal className={styles.wall}>
          <span className={styles.wire} aria-hidden="true" />
          <p className={styles.sign} aria-hidden="true">
            {closing.sign}
          </p>
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
        </Reveal>
      </div>
    </section>
  );
}
