import { Nfc } from "lucide-react";

import { ArrowIcon, WhatsAppIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { getSite } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { EmployeeBadge } from "./EmployeeBadge";
import styles from "./GateWelcome.module.css";

/**
 * Closing + CTA: the employee's badge is tapped on the entrance reader, the
 * light turns green and the screen says "welcome" (once, on first view).
 * Replaces the site-wide <Cta>.
 */
export function GateWelcome({ locale }: { locale: Locale }) {
  const { closing, badge } = getDictionary(locale).sectors.hr;
  const site = getSite();

  return (
    <section className={styles.section}>
      <div className="site-container">
        <div className={styles.panel}>
          <Reveal className={styles.content} delay={0.2}>
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
          </Reveal>

          <Reveal as="figure" className={styles.gate} aria-label={closing.label}>
            <span className={styles.reader}>
              <span className={styles.screen}>
                <b>{closing.welcome}</b>
              </span>
              <Nfc className={styles.nfc} aria-hidden="true" />
              <span className={styles.led} aria-hidden="true" />
            </span>
            <span className={styles.waves} aria-hidden="true">
              <i />
              <i />
            </span>
            <EmployeeBadge data={badge} className={cn(styles.badge)} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
