import { CheckCheck, MapPin, Shirt } from "lucide-react";
import type { CSSProperties } from "react";

import { ArrowIcon, WhatsAppIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { getSite } from "@/lib/content";
import { format, getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { ExampleTag } from "../shared/ExampleTag";
import styles from "./ShopsHero.module.css";
import { Storefront } from "./Storefront";

const order = (i: number) => ({ "--i": i }) as CSSProperties;

export function ShopsHero({ locale, eyebrow }: { locale: Locale; eyebrow: string }) {
  const { hero, exampleTag, price } = getDictionary(locale).sectors.shops;
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
          <figure className={styles.storeWrap} aria-label={hero.store.label}>
            <Storefront sign={hero.store.sign} />
          </figure>

          <figure className={styles.chat} aria-label={chat.label}>
            <div className={styles.chatHead}>
              <b>{chat.sender}</b>
              <ExampleTag className={styles.tag}>{exampleTag}</ExampleTag>
            </div>
            <div className={styles.thread}>
              <p className={cn("reveal-child", styles.bubble, styles.in)} style={order(4)}>
                {chat.customer}
                <time>{chat.time}</time>
              </p>
              <div className={cn("reveal-child", styles.bubble, styles.out)} style={order(6)}>
                <b className={styles.available}>{chat.reply}</b>
                <span className={styles.product}>
                  <Shirt aria-hidden="true" />
                  <span>
                    <b>{chat.product}</b>
                    <small>
                      {chat.colorLabel}: {chat.color} · {chat.sizeLabel}: {chat.size}
                    </small>
                    <b className={styles.price}>{format(price, { amount: chat.price })}</b>
                  </span>
                </span>
                <small className={styles.branch}>
                  <MapPin aria-hidden="true" />
                  {chat.branch}
                </small>
                <span className={styles.reserve}>{chat.reserve}</span>
                <time>
                  {chat.time}
                  <CheckCheck aria-hidden="true" />
                </time>
              </div>
            </div>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
