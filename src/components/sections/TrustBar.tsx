import { Tag } from "lucide-react";
import type { ReactNode } from "react";

import { CalendarCheckIcon, HeadsetIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { MetaTechBadge } from "@/components/ui/MetaTechBadge";
import { SiteImage } from "@/components/ui/SiteImage";
import { META_PARTNER } from "@/lib/brand";
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
          <TrustItem
            icon={
              // English never shows the "Meta Business Partner" image (docs/en-glossary.md 4.10).
              locale === "ar" ? (
                <SiteImage
                  src={META_PARTNER.src}
                  width={META_PARTNER.width}
                  height={META_PARTNER.height}
                  alt={trust.meta.imageAlt}
                  sizes="40px"
                />
              ) : (
                <MetaTechBadge seal />
              )
            }
            title={trust.meta.title}
            subtitle={trust.meta.subtitle}
          />
          <TrustItem icon={<HeadsetIcon />} title={trust.support.title} subtitle={trust.support.subtitle} />
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
