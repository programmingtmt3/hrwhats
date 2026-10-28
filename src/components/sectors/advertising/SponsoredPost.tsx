import { Globe, MessageCircle, Share2, ThumbsUp } from "lucide-react";

import { ArrowIcon, WhatsAppIcon } from "@/components/icons";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Reveal } from "@/components/motion/Reveal";
import { getSite } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import styles from "./SponsoredPost.module.css";

const actionIcons = [ThumbsUp, MessageCircle, Share2];

/**
 * The page's closing words and call to action as a sponsored post on a
 * generic social feed (no real platform's look). Replaces the site-wide <Cta>.
 */
export function SponsoredPost({ locale }: { locale: Locale }) {
  const { closing } = getDictionary(locale).sectors.advertising;
  const site = getSite();

  return (
    <section className={styles.section}>
      <div className="site-container">
        <Reveal as="article" className={styles.post}>
          <header className={styles.author}>
            <span className={styles.avatar}>
              <BrandLogo square decorative sizes="44px" />
            </span>
            <span>
              <b>{closing.brand}</b>
              <small>
                {closing.sponsored}
                <Globe aria-hidden="true" />
              </small>
            </span>
          </header>
          <p className={styles.text}>{closing.text}</p>

          {/* The ad's "creative", built in code. */}
          <div className={styles.creative}>
            <span className={cn(styles.shape, styles.shapeA)} aria-hidden="true" />
            <span className={cn(styles.shape, styles.shapeB)} aria-hidden="true" />
            <h2>
              {closing.title.before}
              <span className={styles.highlight}>{closing.title.highlight}</span>
              {closing.title.after}
            </h2>
          </div>

          <div className={styles.adBar}>
            <span className={styles.adText}>
              <small dir="ltr">{closing.domain}</small>
              <b>{closing.highlight}</b>
            </span>
            <a href={site.appUrls.signup} className="btn btn-primary">
              {closing.primaryCta}
              <ArrowIcon className="icon-forward" />
            </a>
          </div>

          {/* Pictures of the feed's buttons: not interactive, no counts. */}
          <ul className={styles.actions} aria-hidden="true">
            {closing.actions.map((action, i) => {
              const Icon = actionIcons[i % actionIcons.length];
              return (
                <li key={action}>
                  <Icon />
                  {action}
                </li>
              );
            })}
          </ul>
        </Reveal>

        <a href={site.contact.whatsapp.url} className={styles.sales} target="_blank" rel="noopener">
          <WhatsAppIcon />
          {closing.salesCta}
        </a>
      </div>
    </section>
  );
}
