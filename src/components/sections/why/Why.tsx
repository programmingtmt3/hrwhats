import type { ComponentType, SVGProps } from "react";

import { FileCheckIcon, InboxIcon, PulseIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { SiteImage } from "@/components/ui/SiteImage";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { SectionHeading } from "../SectionHeading";
import styles from "./Why.module.css";

const DASHBOARD_IMAGE = { src: "/images/dashboard-preview.png", width: 1928, height: 816 };

type ItemKey = keyof Dictionary["home"]["why"]["items"];

const items: { key: ItemKey; icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { key: "numbers", icon: FileCheckIcon },
  { key: "inbox", icon: InboxIcon },
  { key: "peak", icon: PulseIcon },
];

export function Why({ locale }: { locale: Locale }) {
  const { why } = getDictionary(locale).home;

  return (
    <section className={styles.why} id="why">
      <div className={cn("site-container", styles.grid)}>
        <Reveal>
          <SectionHeading eyebrow={why.eyebrow} title={why.title} lead={why.lead} reveal={false} />
          <div className={styles.list}>
            {items.map(({ key, icon: Icon }) => (
              <div key={key} className={styles.item}>
                <div className={styles.ic}>
                  <Icon />
                </div>
                <div>
                  <h3>{why.items[key].title}</h3>
                  <p>{why.items[key].text}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className={styles.visual} delay={0.15}>
          <SiteImage
            src={DASHBOARD_IMAGE.src}
            width={DASHBOARD_IMAGE.width}
            height={DASHBOARD_IMAGE.height}
            alt={why.imageAlt}
            sizes="(max-width: 900px) 100vw, 570px"
          />
        </Reveal>
      </div>
    </section>
  );
}
