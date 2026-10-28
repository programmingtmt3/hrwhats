import { Bot, CheckCheck } from "lucide-react";
import type { CSSProperties } from "react";

import { ArrowIcon, WhatsAppIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { getSite } from "@/lib/content";
import { format, getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { ExampleTag } from "../shared/ExampleTag";
import { Rail, Ticket } from "./Kitchen";
import styles from "./RestaurantsHero.module.css";

const order = (i: number) => ({ "--i": i }) as CSSProperties;

export function RestaurantsHero({ locale, eyebrow }: { locale: Locale; eyebrow: string }) {
  const { hero, exampleTag, price, orderTypes } = getDictionary(locale).sectors.restaurants;
  const { chat, ticket } = hero;
  const site = getSite();
  const money = (amount: number) => format(price, { amount: amount.toLocaleString("en-US") });
  const main = chat.dishes[0];

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

        <Reveal as="figure" className={styles.visual} delay={0.15} aria-label={chat.label}>
          {/* The order ends up as a ticket clipped to the kitchen rail (slides in once). */}
          <Rail label={ticket.rail} className={styles.rail}>
            <Ticket
              id={ticket.number}
              type={ticket.type}
              typeLabel={orderTypes[ticket.type]}
              items={[main.name, chat.upsellItem]}
              time={ticket.time}
              className={styles.ticket}
            />
          </Rail>

          <div className={styles.chat}>
            <div className={styles.chatHead}>
              <b>{chat.restaurant}</b>
              <small>{chat.status}</small>
              <ExampleTag className={styles.tag}>{exampleTag}</ExampleTag>
            </div>
            <div className={styles.thread}>
              <div className={cn("reveal-child", styles.bubble, styles.in)} style={order(1)}>
                <span className={styles.bot}>
                  <Bot aria-hidden="true" />
                  {chat.auto}
                </span>
                {chat.greeting}
                <span className={styles.categories}>
                  {chat.categories.map((c, i) => (
                    <span key={c} className={cn(i === chat.picked && styles.picked)}>
                      {c}
                    </span>
                  ))}
                </span>
                <ul className={styles.menu}>
                  {chat.dishes.map((d) => (
                    <li key={d.name}>
                      <span>{d.name}</span>
                      <i aria-hidden="true" />
                      <b>{money(d.price)}</b>
                    </li>
                  ))}
                </ul>
              </div>
              <p className={cn("reveal-child", styles.bubble, styles.out)} style={order(3)}>
                {chat.customer}
                <time>
                  {chat.time}
                  <CheckCheck aria-hidden="true" />
                </time>
              </p>
              <div className={cn("reveal-child", styles.bubble, styles.in)} style={order(5)}>
                <b className={styles.summaryTitle}>{chat.summaryTitle}</b>
                <span className={styles.line}>
                  <span>{main.name}</span>
                  <b>{money(main.price)}</b>
                </span>
                {/* Upselling: a yes/no line inside the summary; "yes" is chosen. */}
                <span className={styles.upsell}>
                  <span>
                    {chat.upsell} <b>+{money(chat.upsellPrice)}</b>
                  </span>
                  <span className={styles.choices}>
                    <span className={styles.yes}>{chat.yes}</span>
                    <span>{chat.no}</span>
                  </span>
                </span>
                <span className={cn(styles.line, styles.total)}>
                  <span>{chat.total}</span>
                  <b>{money(main.price + chat.upsellPrice)}</b>
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
