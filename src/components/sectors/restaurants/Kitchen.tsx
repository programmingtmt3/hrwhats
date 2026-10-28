import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

import styles from "./Kitchen.module.css";

/** An order ticket clipped to the kitchen rail. `type` 0 = delivery, 1 = pickup. */
export function Ticket({
  id,
  type,
  typeLabel,
  items,
  time,
  footer,
  className,
  style,
}: {
  id: string;
  type: number;
  typeLabel: string;
  items: string[];
  time: string;
  footer?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={cn(styles.ticket, className)} style={style}>
      <span className={styles.peg} aria-hidden="true" />
      <p className={styles.ticketHead}>
        <b dir="ltr">{id}</b>
        <span className={cn(styles.type, type === 0 ? styles.delivery : styles.pickup)}>{typeLabel}</span>
      </p>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <small>{time}</small>
      {footer}
    </div>
  );
}

/** The kitchen rail the tickets hang from. */
export function Rail({ label, children, className }: { label?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn(styles.rail, className)}>
      <span className={styles.bar} aria-hidden="true" />
      {label && <small className={styles.railLabel}>{label}</small>}
      <div className={styles.tickets}>{children}</div>
    </div>
  );
}

/** Light steam rising (decorative; with reduced motion it plays once to nothing). */
export function Steam({ className }: { className?: string }) {
  return (
    <span className={cn(styles.steam, className)} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}
