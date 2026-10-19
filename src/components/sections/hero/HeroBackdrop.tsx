import { cn } from "@/lib/utils";

import styles from "./HeroBackdrop.module.css";

/** Grid + blobs behind a hero. Render as the first child of a relative, overflow-hidden section. */
export function HeroBackdrop() {
  return (
    <>
      <div className={styles.gridBg} aria-hidden="true" />
      <div className={cn(styles.blob, styles.b1)} aria-hidden="true" />
      <div className={cn(styles.blob, styles.b2)} aria-hidden="true" />
    </>
  );
}
