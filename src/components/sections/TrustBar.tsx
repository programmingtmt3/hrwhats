import type { ReactNode } from "react";

import { CalendarCheckIcon, HeadsetIcon, UsersIcon } from "@/components/icons";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { SiteImage } from "@/components/ui/SiteImage";
import { META_PARTNER } from "@/lib/brand";
import { getClientCountRounded } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";

import styles from "./TrustBar.module.css";

function TrustItem({ icon, title, subtitle }: { icon: ReactNode; title: ReactNode; subtitle: string }) {
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
              <SiteImage
                src={META_PARTNER.src}
                width={META_PARTNER.width}
                height={META_PARTNER.height}
                alt={trust.meta.imageAlt}
                sizes="40px"
              />
            }
            title={trust.meta.title}
            subtitle={trust.meta.subtitle}
          />
          <TrustItem icon={<HeadsetIcon />} title={trust.support.title} subtitle={trust.support.subtitle} />
          <TrustItem icon={<CalendarCheckIcon />} title={trust.trial.title} subtitle={trust.trial.subtitle} />
          <TrustItem
            icon={<UsersIcon />}
            title={
              <>
                {trust.clients.prefix}
                <CountUp to={getClientCountRounded()} />
                {trust.clients.suffix}
              </>
            }
            subtitle={trust.clients.subtitle}
          />
        </Reveal>
      </div>
    </section>
  );
}
