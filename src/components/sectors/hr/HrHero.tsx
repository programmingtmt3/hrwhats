import { Bot, CalendarDays, CheckCheck, UserRoundCog } from "lucide-react";
import type { CSSProperties } from "react";

import { ArrowIcon, WhatsAppIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { getSite } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { ExampleTag } from "../shared/ExampleTag";
import { EmployeeBadge } from "./EmployeeBadge";
import styles from "./HrHero.module.css";

const order = (i: number) => ({ "--i": i }) as CSSProperties;

export function HrHero({ locale, eyebrow }: { locale: Locale; eyebrow: string }) {
  const { hero, badge, exampleTag } = getDictionary(locale).sectors.hr;
  const { chat } = hero;
  const site = getSite();

  return (
    <section className={styles.hero}>
      <div className={cn("site-container", styles.grid)}>
        <Reveal className={styles.copy}>
          <span className="eyebrow">{eyebrow}</span>
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
            <a href={site.contact.whatsapp.url} className="btn btn-ghost" target="_blank" rel="noopener">
              <WhatsAppIcon />
              {hero.salesCta}
            </a>
          </div>
        </Reveal>

        <Reveal className={styles.visual} delay={0.15}>
          {/* Swings once when first seen, then hangs still. */}
          <EmployeeBadge data={badge} strap className={styles.swing} />

          <figure className={styles.chat} aria-label={chat.label}>
            <div className={styles.chatHead}>
              <span className={styles.chatAvatar} aria-hidden="true">
                <UserRoundCog />
              </span>
              <span>
                <b>{chat.assistant}</b>
                <small>{chat.status}</small>
              </span>
              <ExampleTag className={styles.tag}>{exampleTag}</ExampleTag>
            </div>
            <div className={styles.thread}>
              <p className={cn("reveal-child", styles.bubble, styles.out)} style={order(3)}>
                {chat.message}
                <time>
                  {chat.time}
                  <CheckCheck aria-hidden="true" />
                </time>
              </p>
              <div className={cn("reveal-child", styles.bubble, styles.in)} style={order(5)}>
                <span className={styles.bot}>
                  <Bot aria-hidden="true" />
                  {chat.auto}
                </span>
                {chat.reply}
                <span className={styles.balance}>
                  <CalendarDays aria-hidden="true" />
                  <b>{chat.balance}</b>
                </span>
                <small className={styles.summary}>{chat.summary}</small>
                <span className={styles.submit}>{chat.submit}</span>
                <time>{chat.time}</time>
              </div>
            </div>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
