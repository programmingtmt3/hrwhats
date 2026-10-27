import { ArrowIcon, WhatsAppIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { getSite } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import blueprint from "./Blueprint.module.css";
import styles from "./Closing.module.css";
import { SaudiSkyline } from "./SaudiSkyline";

/** The page's closing words and call to action in one dark blueprint panel. */
export function Closing({ locale }: { locale: Locale }) {
  const { closing } = getDictionary(locale).sectors.realEstate;
  const site = getSite();

  return (
    <section>
      <div className="site-container">
        <Reveal className={cn(blueprint.darkPaper, styles.box)}>
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

          {/* Saudi landmarks skyline, drawn once when the panel is in view. */}
          <div className={styles.skyline} aria-hidden="true">
            <SaudiSkyline wideClass={styles.wide} narrowClass={styles.narrow} />
            <span className={styles.ground} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
