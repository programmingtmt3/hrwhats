import { CircleCheck, Clock, Scissors, ShoppingCart } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import { ArrowIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { FeatureItem, type Feature } from "../shared/FeatureItem";
import styles from "./CartRecovery.module.css";

type Data = Dictionary["sectors"]["stores"]["services"]["visuals"]["campaigns"];

const order = (i: number) => ({ "--i": i }) as CSSProperties;

/** Spotlight (breaks the receipt): abandoned cart → reminder with a coupon → cart recovered. */
export function CartRecovery({ feature, data, exampleTag }: { feature: Feature; data: Data; exampleTag: ReactNode }) {
  return (
    <div className={styles.band}>
      <div className="site-container">
        <Reveal className={styles.head}>
          <span className="eyebrow">{data.eyebrow}</span>
          <FeatureItem feature={feature} heading="h3" plain inverse inlinePoints />
        </Reveal>

        <Reveal as="figure" className={styles.flow} aria-label={data.label}>
          <div className={styles.tag}>{exampleTag}</div>
          <ol className={styles.steps}>
            {/* 1. Abandoned cart */}
            <li className={cn("reveal-child", styles.step)} style={order(0)}>
              <span className={styles.stepName}>{data.steps[0]}</span>
              <div className={cn(styles.cartCard, styles.abandoned)}>
                <ShoppingCart className={styles.cartIcon} aria-hidden="true" />
                <ul>
                  {data.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <small>
                  <Clock aria-hidden="true" />
                  {data.abandoned}
                </small>
              </div>
            </li>

            <li className={cn("reveal-child", styles.arrow)} style={order(2)} aria-hidden="true">
              <ArrowIcon className="icon-forward" />
            </li>

            {/* 2. Reminder with a coupon */}
            <li className={cn("reveal-child", styles.step)} style={order(3)}>
              <span className={styles.stepName}>{data.steps[1]}</span>
              <div className={styles.reminder}>
                <p>{data.reminder}</p>
                <span className={styles.coupon}>
                  <Scissors aria-hidden="true" />
                  <small>{data.codeLabel}</small>
                  <b dir="ltr">{data.code}</b>
                </span>
                <span className={styles.complete}>{data.complete}</span>
              </div>
            </li>

            <li className={cn("reveal-child", styles.arrow)} style={order(5)} aria-hidden="true">
              <ArrowIcon className="icon-forward" />
            </li>

            {/* 3. Recovered */}
            <li className={cn("reveal-child", styles.step)} style={order(6)}>
              <span className={styles.stepName}>{data.steps[2]}</span>
              <div className={cn(styles.cartCard, styles.recovered)}>
                <CircleCheck className={styles.cartIcon} aria-hidden="true" />
                <b>{data.recovered}</b>
                <small>{data.recoveredText}</small>
              </div>
            </li>
          </ol>
        </Reveal>
      </div>
    </div>
  );
}
