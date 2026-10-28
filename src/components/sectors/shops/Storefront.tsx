import { cn } from "@/lib/utils";

import { QrArt } from "./QrArt";
import styles from "./Storefront.module.css";

/** Decorative shelf goods: folded clothes, perfume bottles, boxes. */
export function ShelfGoods({ className }: { className?: string }) {
  return (
    <span className={cn(styles.goods, className)} aria-hidden="true">
      <span className={styles.clothes}>
        <i />
        <i />
        <i />
      </span>
      <span className={styles.bottles}>
        <i />
        <i />
        <i />
      </span>
      <span className={styles.boxes}>
        <i />
        <i />
      </span>
    </span>
  );
}

/**
 * A shop front built in code: striped awning, sign, glass front with shelves
 * inside and a QR sticker; the metal shutter rolls up once when first seen
 * (it starts up with reduced motion or JS off).
 */
export function Storefront({ sign, className }: { sign: string; className?: string }) {
  return (
    <div className={cn(styles.store, className)} aria-hidden="true">
      <span className={styles.signboard}>{sign}</span>
      <span className={styles.awning} />
      <span className={styles.front}>
        <span className={styles.interior}>
          <span className={styles.shelf}>
            <ShelfGoods />
          </span>
          <span className={styles.shelf}>
            <ShelfGoods />
          </span>
        </span>
        <span className={styles.sticker}>
          <QrArt />
        </span>
        <span className={styles.shutter} />
      </span>
      <span className={styles.step} />
    </div>
  );
}
