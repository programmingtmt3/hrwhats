import { CircleCheck, Droplets, Heart, UserPlus } from "lucide-react";
import type { CSSProperties } from "react";

import { ArrowIcon, WhatsAppIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { getSite } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import styles from "./CharityHero.module.css";
import { ExampleTag } from "../shared/ExampleTag";

// One icon per floating notification, in dictionary order.
const noteIcons = [CircleCheck, Heart, UserPlus];

export function CharityHero({ locale, eyebrow }: { locale: Locale; eyebrow: string }) {
  const { hero, exampleTag } = getDictionary(locale).sectors.charity;
  const { campaign } = hero;
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
          <figure className={styles.card} aria-label={campaign.label}>
            <div className={styles.cardTop}>
              <span className={styles.status}>{campaign.status}</span>
              <ExampleTag>{exampleTag}</ExampleTag>
            </div>
            <div className={styles.poster} aria-hidden="true">
              <Droplets />
            </div>
            <p className={styles.name}>{campaign.name}</p>
            <p className={styles.desc}>{campaign.text}</p>
            <p className={styles.amount}>
              <span>{campaign.raisedLabel}</span> <b>{campaign.raised}</b> <small>{campaign.goal}</small>
            </p>
            <div className={styles.bar} style={{ "--p": campaign.percent } as CSSProperties}>
              <i />
            </div>
            <ul className={styles.stats}>
              {campaign.stats.map((stat) => (
                <li key={stat.label}>
                  <b>{stat.value}</b>
                  <span>{stat.label}</span>
                </li>
              ))}
            </ul>
          </figure>

          <ul className={styles.notes}>
            {hero.notifications.map((note, i) => {
              const Icon = noteIcons[i % noteIcons.length];
              return (
                <li
                  key={note.title}
                  className={cn("reveal-child", styles.note, styles[`n${i + 1}`])}
                  style={{ "--i": i + 2 } as CSSProperties}
                >
                  <span className={styles.ic}>
                    <Icon aria-hidden="true" />
                  </span>
                  <span>
                    {note.title}
                    <small>{note.text}</small>
                  </span>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
