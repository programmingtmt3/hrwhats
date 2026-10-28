import { ArrowDown, Clock, HandHeart, TrendingUp } from "lucide-react";
import type { ComponentType, CSSProperties, ReactNode, SVGProps } from "react";

import { ArrowIcon, CalendarCheckIcon, ChatBubbleIcon, WhatsAppIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { getSite } from "@/lib/content";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import styles from "./Result.module.css";

type CardKey = keyof Dictionary["sectors"]["charity"]["result"]["cards"];

/** Relative heights (%) — shapes only, never shown as numbers. */
const COLUMNS = [30, 45, 60, 80, 100];
const CAMPAIGN_ROWS = [92, 74, 58];

const delay = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * The result sentence as four animated cards (relative motion only, no
 * figures), then the two closing buttons: the page's closing section, in place
 * of the site-wide <Cta>.
 */
export function Result({ locale }: { locale: Locale }) {
  const { result } = getDictionary(locale).sectors.charity;
  const { cards } = result;
  const site = getSite();

  const visuals: Record<CardKey, { icon: ComponentType<SVGProps<SVGSVGElement>>; visual: ReactNode }> = {
    organized: {
      icon: CalendarCheckIcon,
      visual: (
        <ul className={styles.rows} aria-hidden="true">
          {CAMPAIGN_ROWS.map((width, i) => (
            <li key={width} style={{ ...delay(i), "--w": width } as CSSProperties}>
              <i />
              <span />
            </li>
          ))}
        </ul>
      ),
    },
    engagement: {
      icon: ChatBubbleIcon,
      visual: (
        <svg className={styles.spark} viewBox="0 0 200 80" preserveAspectRatio="none" aria-hidden="true">
          <path className={styles.sparkArea} d="M0 70 L40 62 L80 58 L120 40 L160 30 L200 8 L200 80 L0 80 Z" />
          <path className={styles.sparkLine} d="M0 70 L40 62 L80 58 L120 40 L160 30 L200 8" pathLength={1} />
        </svg>
      ),
    },
    donations: {
      icon: HandHeart,
      visual: (
        <div className={styles.growth} aria-hidden="true">
          <div className={styles.columns}>
            {COLUMNS.map((height, i) => (
              <i key={height} style={{ ...delay(i), "--h": height } as CSSProperties} />
            ))}
          </div>
          <TrendingUp className={styles.up} />
        </div>
      ),
    },
    effort: {
      icon: Clock,
      visual: (
        <div className={styles.compare}>
          <div className={cn(styles.meter, styles.manual)}>
            <span>
              {cards.effort.manual}
              <ArrowDown aria-hidden="true" />
            </span>
            <b aria-hidden="true">
              <i />
            </b>
          </div>
          <div className={cn(styles.meter, styles.auto)}>
            <span>{cards.effort.automation}</span>
            <b aria-hidden="true">
              <i />
            </b>
          </div>
        </div>
      ),
    },
  };

  return (
    <section className={styles.section}>
      <div className="site-container">
        <Reveal className={styles.copy}>
          <span className={styles.eyebrow}>{result.eyebrow}</span>
          <h2>
            {result.text.before}
            <span className={styles.highlight}>{result.text.highlight}</span>
            {result.text.after}
          </h2>
        </Reveal>

        <div className={styles.cards}>
          {(Object.keys(visuals) as CardKey[]).map((key, i) => {
            const { icon: Icon, visual } = visuals[key];
            return (
              <Reveal key={key} as="article" className={styles.card} delay={0.08 * i}>
                <div className={styles.ic}>
                  <Icon aria-hidden="true" />
                </div>
                <h3>{cards[key].title}</h3>
                <div className={styles.visual}>{visual}</div>
              </Reveal>
            );
          })}
        </div>

        <Reveal className={styles.actions}>
          <a href={site.appUrls.signup} className="btn btn-primary">
            {result.primaryCta}
            <ArrowIcon className="icon-forward" />
          </a>
          <a href={site.contact.whatsapp.url} className="btn btn-outline-light" target="_blank" rel="noopener">
            <WhatsAppIcon />
            {result.salesCta}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
