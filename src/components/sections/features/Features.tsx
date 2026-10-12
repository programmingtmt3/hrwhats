import ExportedImage from "next-image-export-optimizer";
import type { ComponentType, ReactNode, SVGProps } from "react";

import {
  BotIcon,
  BriefcaseIcon,
  CodeIcon,
  LayoutIcon,
  LockIcon,
  MegaphoneIcon,
  TrendIcon,
  UserPlusIcon,
} from "@/components/icons";
import { META_PARTNER } from "@/lib/brand";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { SectionHeading } from "../SectionHeading";
import { BentoCard } from "./BentoCard";
import styles from "./Features.module.css";

type CardKey = keyof Dictionary["home"]["features"]["cards"];

type CardLayout = {
  key: CardKey;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  dark?: boolean;
  span2?: boolean;
  row2?: boolean;
  /** Reveal delay in seconds, as in the design. */
  delay?: number;
};

// Order, sizes and delays from the design.
const layout: CardLayout[] = [
  { key: "api", icon: CodeIcon, dark: true, span2: true, row2: true },
  { key: "automation", icon: TrendIcon, span2: true, delay: 0.05 },
  { key: "ai", icon: BotIcon, delay: 0.1 },
  { key: "otp", icon: LockIcon, delay: 0.15 },
  { key: "campaigns", icon: MegaphoneIcon, dark: true, span2: true },
  { key: "leads", icon: UserPlusIcon, delay: 0.05 },
  { key: "manager", icon: BriefcaseIcon, delay: 0.1 },
  { key: "crm", icon: LayoutIcon, span2: true, delay: 0.15 },
];

// Campaign card bars: height (%) and transition delay (s), from the design.
const bars = [
  [35, 0],
  [55, 0.1],
  [45, 0.2],
  [70, 0.3],
  [60, 0.4],
  [85, 0.5],
  [100, 0.6],
] as const;

export function Features({ locale }: { locale: Locale }) {
  const { features } = getDictionary(locale).home;
  const { api } = features.cards;

  const extras: Partial<Record<CardKey, ReactNode>> = {
    api: (
      <>
        <div className={styles.apiBadge}>
          <ExportedImage
            src={META_PARTNER.src}
            width={META_PARTNER.width}
            height={META_PARTNER.height}
            alt={api.badgeImageAlt}
            sizes="130px"
          />
          <span>{api.badge}</span>
        </div>
        <span className={styles.tag}>{api.tag}</span>
      </>
    ),
    campaigns: (
      <div className={styles.miniBars} aria-hidden="true">
        {bars.map(([height, delay]) => (
          <i
            key={height}
            style={{ height: `${height}%`, transitionDelay: delay ? `${delay}s` : undefined }}
          />
        ))}
      </div>
    ),
  };

  return (
    <section id="features">
      <div className="site-container">
        <SectionHeading eyebrow={features.eyebrow} title={features.title} lead={features.lead} />

        <div className={styles.bento}>
          {layout.map(({ key, icon: Icon, dark, span2, row2, delay }) => {
            const card = features.cards[key];
            return (
              <BentoCard
                key={key}
                delay={delay}
                className={cn(
                  styles.card,
                  dark && styles.dark,
                  span2 && styles.span2,
                  row2 && styles.row2,
                )}
              >
                <div className={styles.ic}>
                  <Icon />
                </div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
                {extras[key]}
              </BentoCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
