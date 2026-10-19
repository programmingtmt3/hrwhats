import type { ComponentType, SVGProps } from "react";

import { FileCheckIcon, InboxIcon, PulseIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n";

import { SectionHeading } from "../SectionHeading";
import styles from "./Why.module.css";

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
      <div className="site-container">
        <SectionHeading eyebrow={why.eyebrow} title={why.title} lead={why.lead} />
        <Reveal className={styles.list}>
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
        </Reveal>
      </div>
    </section>
  );
}
