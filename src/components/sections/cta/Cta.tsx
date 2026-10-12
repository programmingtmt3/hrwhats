import { Reveal } from "@/components/motion/Reveal";
import { getSite } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";

import styles from "./Cta.module.css";

export function Cta({ locale }: { locale: Locale }) {
  const { cta } = getDictionary(locale).home;
  const site = getSite();

  return (
    <section className={styles.section}>
      <div className="site-container">
        <Reveal className={styles.box}>
          <span className="eyebrow">{cta.eyebrow}</span>
          <h2>{cta.title}</h2>
          <p>{cta.lead}</p>
          <div className="hero-actions">
            <a href={site.appUrls.signup} className="btn btn-primary">
              {cta.primaryCta}
            </a>
            <a
              href={site.contact.whatsapp.url}
              className="btn btn-outline-light"
              target="_blank"
              rel="noopener"
            >
              {cta.salesCta}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
