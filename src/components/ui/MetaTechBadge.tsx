import { BadgeCheck } from "lucide-react";

import { getMetaBadgeText } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import styles from "./MetaTechBadge.module.css";

/**
 * "Meta Tech Provider" badge, drawn in code (no Meta logo). Used on English pages in
 * place of the "Meta Business Partner" image (docs/en-glossary.md 4.10).
 * `seal`: the icon only, for a slot whose text already names the status (trust bar).
 */
export function MetaTechBadge({ seal, className }: { seal?: boolean; className?: string }) {
  if (seal) return <BadgeCheck className={cn(styles.seal, className)} aria-hidden="true" />;

  const { name, status } = getMetaBadgeText();
  return (
    <span className={cn(styles.badge, className)}>
      <BadgeCheck className={styles.icon} aria-hidden="true" />
      <span className={styles.text}>
        <b>{name}</b> <span>{status}</span>
      </span>
    </span>
  );
}
