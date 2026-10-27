import { ArrowIcon, WhatsAppIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { getSite } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { Barcode } from "./Barcode";
import styles from "./LuggageTag.module.css";

/** The page's closing words and call to action on a large luggage tag. */
export function LuggageTag({ locale }: { locale: Locale }) {
  const { closing } = getDictionary(locale).sectors.tourism;
  const site = getSite();

  return (
    <section className={styles.section}>
      <div className="site-container">
        <Reveal className={styles.wrap}>
          {/* The strap, looping through the tag's eyelet. */}
          <svg className={styles.strap} viewBox="0 0 120 160" fill="none" aria-hidden="true">
            <path d="M118 80C80 80 60 30 20 40C-4 46 4 110 30 112C58 114 70 80 118 80" />
          </svg>

          <div className={styles.tag}>
            <span className={styles.eyelet} aria-hidden="true" />
            <div className={styles.body}>
              <h2>{closing.title}</h2>
              <p>{closing.text}</p>
              <p className={styles.highlight}>{closing.highlight}</p>
              <div className={cn("hero-actions", styles.actions)}>
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
            <div className={styles.side} aria-hidden="true">
              <Barcode className={styles.barcode} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
