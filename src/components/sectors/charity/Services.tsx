import { HandCoins } from "lucide-react";
import type { ComponentType, CSSProperties, ReactNode, SVGProps } from "react";

import { BotIcon, InboxIcon, PulseIcon, UsersIcon } from "@/components/icons";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { BentoCard } from "@/components/sections/features/BentoCard";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { ExampleTag } from "../shared/ExampleTag";
import styles from "./Services.module.css";

type ServiceKey = keyof Dictionary["sectors"]["charity"]["services"]["items"];

const layout: { key: ServiceKey; icon: ComponentType<SVGProps<SVGSVGElement>>; className?: string; delay?: number }[] = [
  { key: "beneficiaries", icon: InboxIcon, className: styles.large },
  { key: "team", icon: UsersIcon, delay: 0.05 },
  { key: "donationStores", icon: HandCoins, className: styles.dark, delay: 0.1 },
  { key: "automation", icon: BotIcon, delay: 0.15 },
  { key: "reports", icon: PulseIcon, delay: 0.2 },
];

export function Services({ locale }: { locale: Locale }) {
  const { services, exampleTag } = getDictionary(locale).sectors.charity;
  const { inbox } = services;

  const extras: Partial<Record<ServiceKey, ReactNode>> = {
    beneficiaries: (
      <figure className={styles.inbox} aria-label={inbox.label}>
        <div className={styles.inboxHead}>
          <b>{inbox.title}</b>
          <span>{inbox.count}</span>
        </div>
        <ul>
          {inbox.items.map((item, i) => (
            <li key={item.name} className="reveal-child" style={{ "--i": i } as CSSProperties}>
              <span className={styles.avatar} aria-hidden="true">
                {item.name.charAt(0)}
              </span>
              <span className={styles.msg}>
                <b>{item.name}</b>
                <span>{item.text}</span>
              </span>
              <span className={styles.meta}>
                <time>{item.time}</time>
                <span className={styles.label}>{item.tag}</span>
              </span>
            </li>
          ))}
        </ul>
        <figcaption>
          <ExampleTag>{exampleTag}</ExampleTag>
        </figcaption>
      </figure>
    ),
  };

  return (
    <section>
      <div className="site-container">
        <SectionHeading eyebrow={services.eyebrow} title={services.title} />

        <div className={styles.bento}>
          {layout.map(({ key, icon: Icon, className, delay }) => {
            const item = services.items[key];
            return (
              <BentoCard key={key} delay={delay} className={cn(styles.card, className)}>
                <div className={styles.ic}>
                  <Icon aria-hidden="true" />
                </div>
                <h3>{item.title}</h3>
                {item.text && <p>{item.text}</p>}
                {item.points.length > 0 && (
                  <ul className={styles.chips}>
                    {item.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                )}
                {extras[key]}
              </BentoCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
