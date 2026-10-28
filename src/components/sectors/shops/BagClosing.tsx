import { ArrowIcon, WhatsAppIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { getSite } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";

import styles from "./BagClosing.module.css";

/**
 * Closing + CTA as a kraft shopping bag: the title is printed on the bag and
 * the buttons sit on a gift tag tied to the handle. The bag drops in and
 * settles with a small sway, once. Replaces the site-wide <Cta>.
 */
export function BagClosing({ locale }: { locale: Locale }) {
  const { closing } = getDictionary(locale).sectors.shops;
  const site = getSite();

  return (
    <section className={styles.section}>
      <div className="site-container">
        <Reveal className={styles.scene}>
          <div className={styles.bag}>
            <span className={styles.handles} aria-hidden="true">
              <i />
              <i />
            </span>
            <span className={styles.fold} aria-hidden="true" />
            <h2>
              {closing.title.before}
              <span className={styles.highlight}>{closing.title.highlight}</span>
              {closing.title.after}
            </h2>
            <p>{closing.text}</p>
            <p className={styles.lead}>{closing.highlight}</p>

            {/* Gift tag tied to the handle, holding the buttons. */}
            <div className={styles.giftTag}>
              <span className={styles.tie} aria-hidden="true" />
              <a href={site.appUrls.signup} className="btn btn-primary">
                {closing.primaryCta}
                <ArrowIcon className="icon-forward" />
              </a>
              <a href={site.contact.whatsapp.url} className={styles.sales} target="_blank" rel="noopener">
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
