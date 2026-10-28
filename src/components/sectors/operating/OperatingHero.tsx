import { CheckCheck, ClipboardList, MapPin, TriangleAlert, Zap } from "lucide-react";

import { ArrowIcon, WhatsAppIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { getSite } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { ExampleTag } from "../shared/ExampleTag";
import styles from "./OperatingHero.module.css";
import { Led, PriorityBadge } from "./Status";

export function OperatingHero({ locale, eyebrow }: { locale: Locale; eyebrow: string }) {
  const { hero, exampleTag, priorities } = getDictionary(locale).sectors.operating;
  const { chat, order } = hero;
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

        <Reveal as="figure" className={styles.visual} delay={0.15} aria-label={chat.label}>
          {/* The customer's report on WhatsApp: text, shared location, photo of the fault. */}
          <div className={styles.chat}>
            <div className={styles.chatHead}>
              <span className={styles.avatar} aria-hidden="true">
                {chat.customer.charAt(0)}
              </span>
              <b>{chat.customer}</b>
              <ExampleTag className={styles.tag}>{exampleTag}</ExampleTag>
            </div>
            <div className={styles.thread}>
              <div className={styles.bubble}>
                <div className={styles.attachments}>
                  <span className={styles.map} aria-hidden="true">
                    <i className={styles.road} />
                    <i className={cn(styles.road, styles.roadV)} />
                    <i className={cn(styles.road, styles.roadD)} />
                    <MapPin className={styles.pin} />
                  </span>
                  <span className={styles.photo} aria-hidden="true">
                    <span className={styles.unit}>
                      <i />
                      <i />
                      <i />
                    </span>
                    <TriangleAlert className={styles.warn} />
                  </span>
                </div>
                <small className={styles.meta}>
                  <MapPin aria-hidden="true" />
                  {chat.location}: {chat.area} · {chat.photo}
                </small>
                <p>{chat.message}</p>
                <time>
                  {chat.time}
                  <CheckCheck aria-hidden="true" />
                </time>
              </div>
            </div>
          </div>

          {/* …becomes a classified, routed work order (slides out once). */}
          <div className={styles.order}>
            <div className={styles.orderHead}>
              <ClipboardList aria-hidden="true" />
              <b>
                {order.title} <span dir="ltr">{order.number}</span>
              </b>
              <Led tone="red" />
            </div>
            <small className={styles.auto}>
              <Zap aria-hidden="true" />
              {order.auto}
            </small>
            <dl>
              <div>
                <dt>{order.typeLabel}</dt>
                <dd>{order.type}</dd>
              </div>
              <div>
                <dt>{order.priorityLabel}</dt>
                <dd>
                  <PriorityBadge level={0} label={priorities[0]} />
                </dd>
              </div>
              <div>
                <dt>{order.routeLabel}</dt>
                <dd>{order.route}</dd>
              </div>
            </dl>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
