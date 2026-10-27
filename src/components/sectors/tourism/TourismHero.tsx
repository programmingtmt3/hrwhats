import { Nfc, Plane } from "lucide-react";

import { ArrowIcon, WhatsAppIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { getSite } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { ExampleTag } from "../shared/ExampleTag";
import { Barcode } from "./Barcode";
import styles from "./TourismHero.module.css";
import travel from "./Travel.module.css";

export function TourismHero({ locale, eyebrow }: { locale: Locale; eyebrow: string }) {
  const { hero, exampleTag } = getDictionary(locale).sectors.tourism;
  const { ticket } = hero;
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
          {/* Dotted flight path, drawn once; the plane lands at its end. */}
          <div className={styles.flight} aria-hidden="true">
            <svg viewBox="0 0 400 120" fill="none" preserveAspectRatio="none">
              <path d="M8 110C90 20 250 0 392 40" />
            </svg>
            <Plane className={styles.plane} />
          </div>

          {/* Room key card, behind the ticket. */}
          <div className={styles.keyCard} aria-hidden="true">
            <span className={styles.chip} />
            <Nfc />
            <b>{hero.keyCard.room}</b>
          </div>

          <figure className={styles.message} aria-label={ticket.label}>
            <div className={travel.sender}>
              <b>{ticket.sender}</b>
              <span className={travel.auto}>{ticket.autoReply}</span>
              <time>{ticket.time}</time>
            </div>

            <div className={styles.ticket}>
              <div className={styles.main}>
                <p className={styles.heading}>{ticket.heading}</p>
                <dl className={styles.fields}>
                  {ticket.fields.map((field) => (
                    <div key={field.label}>
                      <dt>{field.label}</dt>
                      <dd>{field.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className={styles.stub}>
                <span>{ticket.bookingLabel}</span>
                <b>{ticket.bookingNumber}</b>
                <Barcode className={styles.barcode} />
              </div>
            </div>
            <span className={styles.button}>{ticket.button}</span>
            <figcaption className={styles.tag}>
              <ExampleTag>{exampleTag}</ExampleTag>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
