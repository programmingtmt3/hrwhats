import { GraduationCap } from "lucide-react";

import { ArrowIcon, WhatsAppIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { getSite } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import styles from "./Certificate.module.css";

/** Ornament for one corner of the frame; the CSS mirrors it for the others. */
function Corner({ className }: { className: string }) {
  return (
    <svg className={cn(styles.corner, className)} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M4 60V20Q4 4 20 4H60" />
      <path d="M12 60V24Q12 12 24 12H60" />
      <path d="M20 36Q20 20 36 20" />
      <circle cx="28" cy="28" r="3" />
    </svg>
  );
}

/** The page's closing words and call to action as a graduation certificate. */
export function Certificate({ locale }: { locale: Locale }) {
  const { closing } = getDictionary(locale).sectors.education;
  const site = getSite();

  return (
    <section>
      <div className="site-container">
        <Reveal className={styles.certificate}>
          <div className={styles.frame}>
            <Corner className={styles.tl} />
            <Corner className={styles.tr} />
            <Corner className={styles.bl} />
            <Corner className={styles.br} />

            <div className={styles.seal} aria-hidden="true">
              <svg viewBox="0 0 120 120">
                <defs>
                  <path id="seal-text" d="M60 60m-42 0a42 42 0 1 1 84 0a42 42 0 1 1-84 0" />
                </defs>
                <circle cx="60" cy="60" r="56" />
                <circle cx="60" cy="60" r="32" />
                <text>
                  <textPath href="#seal-text">{`${site.name} • `.repeat(3)}</textPath>
                </text>
              </svg>
              <GraduationCap />
            </div>

            <h2>{closing.title}</h2>
            <p>{closing.text}</p>
            <p className={styles.highlight}>{closing.highlight}</p>

            <div className={cn("hero-actions", styles.actions)}>
              <a href={site.appUrls.signup} className="btn btn-primary">
                {closing.primaryCta}
                <ArrowIcon className="icon-forward" />
              </a>
              <a href={site.contact.whatsapp.url} className="btn btn-ghost" target="_blank" rel="noopener">
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
