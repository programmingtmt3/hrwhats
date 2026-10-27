import { cn } from "@/lib/utils";

import styles from "./Barcode.module.css";

/** Decorative barcode (bar widths are a fixed pattern, not data). */
const BARS = [2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 4, 1, 2, 1, 1, 3, 1, 2];

export function Barcode({ className }: { className?: string }) {
  return (
    <span className={cn(styles.barcode, className)} aria-hidden="true">
      {BARS.map((width, i) => (
        <i key={i} style={{ flexGrow: width }} />
      ))}
    </span>
  );
}
