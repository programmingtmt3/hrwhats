import { cn } from "@/lib/utils";

import styles from "./ProductArt.module.css";

/** A product photo drawn with CSS shapes (decorative): "headphones", "watch" or "backpack". */
export function ProductArt({ id, className }: { id: string; className?: string }) {
  return (
    <span className={cn(styles.art, styles[id], className)} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}
