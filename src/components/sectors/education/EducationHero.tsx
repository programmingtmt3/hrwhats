import { BookOpen, CalendarDays, CheckCheck, MapPin, UserRound } from "lucide-react";
import type { CSSProperties } from "react";

import { ArrowIcon, WhatsAppIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { getSite } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { ExampleTag } from "../shared/ExampleTag";
import styles from "./EducationHero.module.css";
import notebook from "./Notebook.module.css";

// One icon per course detail line, in dictionary order.
const detailIcons = [CalendarDays, UserRound, MapPin];

export function EducationHero({ locale, eyebrow }: { locale: Locale; eyebrow: string }) {
  const { hero, exampleTag } = getDictionary(locale).sectors.education;
  const { message } = hero;
  const site = getSite();

  return (
    <section className={cn(notebook.ruled, styles.hero)}>
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
          {/* One WhatsApp message on its own: no phone, no window. */}
          <figure className={styles.message} aria-label={message.label}>
            <span className={styles.sender}>{message.sender}</span>
            <p>{message.text}</p>
            <div className={styles.course}>
              <span className={styles.cover} aria-hidden="true">
                <BookOpen />
              </span>
              <b>{message.course}</b>
              <ul>
                {message.details.map((detail, i) => {
                  const Icon = detailIcons[i % detailIcons.length];
                  return (
                    <li key={detail}>
                      <Icon aria-hidden="true" />
                      {detail}
                    </li>
                  );
                })}
              </ul>
            </div>
            <time>
              {message.time}
              <CheckCheck aria-hidden="true" />
            </time>
            <span className={styles.button}>{message.button}</span>
            <figcaption className={styles.tag}>
              <ExampleTag>{exampleTag}</ExampleTag>
            </figcaption>
          </figure>

          <ul className={styles.notes}>
            {hero.notes.map((note, i) => (
              <li
                key={note}
                className={cn("reveal-child", styles.note, styles[`n${i + 1}`])}
                style={{ "--i": i + 2 } as CSSProperties}
              >
                {note}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
