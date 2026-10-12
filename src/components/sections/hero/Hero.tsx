import Link from "next/link";

import { ArrowIcon, BotIcon, CheckIcon, PaperPlaneIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { getSite } from "@/lib/content";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { ChatPhone } from "./ChatPhone";
import styles from "./Hero.module.css";

export function Hero({ locale }: { locale: Locale }) {
  const { hero, chat } = getDictionary(locale).home;
  const site = getSite();

  return (
    <section className={styles.hero}>
      <div className={cn(styles.blob, styles.b1)} />
      <div className={cn(styles.blob, styles.b2)} />

      <div className={cn("site-container", styles.grid)}>
        <Reveal className={styles.copy}>
          <span className="eyebrow">{hero.eyebrow}</span>
          <h1>
            {hero.title.before}
            <span className="grad">{hero.title.highlight}</span>
            {hero.title.after}
          </h1>
          <p className={styles.lead}>{hero.lead}</p>
          <div className="hero-actions">
            <a href={site.appUrls.signup} className="btn btn-primary">
              {hero.primaryCta}
              <ArrowIcon className="icon-forward" />
            </a>
            <Link href={localePath(locale, "/packages/")} className="btn btn-ghost">
              {hero.secondaryCta}
            </Link>
          </div>
          <div className={styles.checks}>
            {hero.checks.map((check) => (
              <span key={check}>
                <CheckIcon />
                {check}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal className={styles.phoneWrap} delay={0.15}>
          <ChatPhone chat={chat} />
          <div className={cn(styles.floatCard, styles.fc1)}>
            <div className={styles.ic}>
              <PaperPlaneIcon />
            </div>
            <div>
              {hero.floatCards.campaign.title}
              <small>{hero.floatCards.campaign.subtitle}</small>
            </div>
          </div>
          <div className={cn(styles.floatCard, styles.fc2)}>
            <div className={styles.ic}>
              <BotIcon />
            </div>
            <div>
              {hero.floatCards.ai.title}
              <small>{hero.floatCards.ai.subtitle}</small>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
