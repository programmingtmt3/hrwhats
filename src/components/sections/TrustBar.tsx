import { BadgeCheck, Server, Tag } from "lucide-react";
import type { ReactNode } from "react";

import { CalendarCheckIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { getStartingMonthlyPrice } from "@/lib/content";
import { format, getDictionary, type Locale } from "@/lib/i18n";

import styles from "./TrustBar.module.css";

function TrustItem({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
  return (
    <div className={styles.item}>
      <div className={styles.ic}>{icon}</div>
      <div>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
    </div>
  );
}

export function TrustBar({ locale }: { locale: Locale }) {
  const { trust } = getDictionary(locale).home;

  return (
    <section className={styles.trust}>
      <div className="site-container">
        <Reveal className={styles.grid}>
          {/* Code-drawn seal, no Meta logo (docs/en-glossary.md 4.10). */}
          <TrustItem
            icon={<BadgeCheck className={styles.seal} aria-hidden="true" />}
            title={trust.meta.title}
            subtitle={trust.meta.subtitle}
          />
          <TrustItem icon={<Server aria-hidden="true" />} title={trust.hosting.title} subtitle={trust.hosting.subtitle} />
          <TrustItem icon={<CalendarCheckIcon />} title={trust.trial.title} subtitle={trust.trial.subtitle} />
          <TrustItem
            icon={<Tag aria-hidden="true" />}
            title={format(trust.price.title, { price: getStartingMonthlyPrice().toLocaleString("en-US") })}
            subtitle={trust.price.subtitle}
          />
        </Reveal>
      </div>
    </section>
  );
}
