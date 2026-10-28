import { Check } from "lucide-react";
import type { CSSProperties } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { getDictionary, type Locale } from "@/lib/i18n";

import styles from "./ValueMenu.module.css";

/** "Value for restaurants and cafés" as a printed menu: each benefit is a dish, a check in place of the price. */
export function ValueMenu({ locale }: { locale: Locale }) {
  const { values } = getDictionary(locale).sectors.restaurants;

  return (
    <section className={styles.section}>
      <div className="site-container">
        <Reveal className={styles.menu}>
          <p className={styles.tag}>{values.tag}</p>
          <h2>{values.title}</h2>
          <span className={styles.ornament} aria-hidden="true" />
          <p className={styles.intro}>{values.intro}</p>
          <ul>
            {values.items.map((item, i) => (
              <li key={item} className="reveal-child" style={{ "--i": i } as CSSProperties}>
                <span>{item}</span>
                <i aria-hidden="true" />
                <Check aria-hidden="true" />
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
