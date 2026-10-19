"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import styles from "./Packages.module.css";

type Billing = "monthly" | "yearly";

type BillingSwitchProps = {
  labels: { label: string; monthly: string; yearly: string };
  /** Server-rendered cards containing both prices; CSS shows the active one. */
  children: ReactNode;
};

/** Monthly/yearly toggle. Only flips `data-billing`; both prices stay in the HTML. */
export function BillingSwitch({ labels, children }: BillingSwitchProps) {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <div className={styles.billingRoot} data-billing={billing}>
      <div className={styles.switchWrap}>
        <div className={styles.switch} role="group" aria-label={labels.label}>
          {(["monthly", "yearly"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={billing === value}
              className={cn(styles.switchBtn, billing === value && styles.switchActive)}
              onClick={() => setBilling(value)}
            >
              {labels[value]}
            </button>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}
