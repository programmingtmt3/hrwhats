import { cn } from "@/lib/utils";

import styles from "./Status.module.css";

const priorityTones = [styles.urgent, styles.medium, styles.normal];

/** Priority badge: 0 = urgent, 1 = medium, 2 = normal. */
export function PriorityBadge({ level, label, className }: { level: number; label: string; className?: string }) {
  return <span className={cn(styles.priority, priorityTones[level], className)}>{label}</span>;
}

/** Status light. Tones: "green" (available/done), "amber" (on the way/in progress), "red" (urgent), "off". */
export type LedTone = "green" | "amber" | "red" | "off";

export function Led({ tone, className }: { tone: LedTone; className?: string }) {
  return <i className={cn(styles.led, styles[tone], className)} aria-hidden="true" />;
}

/** Technician status index → light tone (available, on the way, in progress, off duty). */
export const statusTone: LedTone[] = ["green", "amber", "amber", "off"];

/** Diagonal brand-green tape between sections (operating sites' warning tape, in brand colors). */
export function Tape() {
  return <div className={styles.tape} aria-hidden="true" />;
}
