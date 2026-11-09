import { SectorMotif, type MotifSlug } from "@/components/sections/sectors/SectorMotif";
import motifStyles from "@/components/sections/sectors/SectorMotif.module.css";
import { cn } from "@/lib/utils";

import styles from "./SectorCover.module.css";

/** Healthcare has no sector page: a calendar carrying a medical cross (appointments). */
function HealthcareMotif() {
  return (
    <div className={cn(styles.own, styles.healthcare)}>
      <svg viewBox="0 0 220 128" focusable="false">
        <rect className={styles.paper} x="52" y="12" width="116" height="104" rx="11" />
        <path className={styles.calendarHead} d="M52 40V23a11 11 0 0 1 11-11h94a11 11 0 0 1 11 11v17Z" />
        <path className={styles.calendarRings} d="M82 6v14M138 6v14" />
        {[52, 74, 96].flatMap((y) =>
          [66, 92, 118, 144].map((x) => (
            <rect
              key={`${x}-${y}`}
              className={x === 92 && y === 74 ? styles.dayOn : styles.day}
              x={x - 8}
              y={y - 6}
              width="16"
              height="13"
              rx="3"
            />
          )),
        )}
        <circle className={styles.crossBadge} cx="164" cy="100" r="22" />
        <path className={styles.cross} d="M164 89v22M153 100h22" />
      </svg>
    </div>
  );
}

/** Legal has no sector page: a balance scale. */
function LegalMotif() {
  return (
    <div className={cn(styles.own, styles.legal)}>
      <svg viewBox="0 0 220 128" focusable="false">
        <path className={styles.scaleBase} d="M84 118h52l-6-11H90Z" />
        <path className={styles.scaleLine} d="M110 107V20M58 30h104" />
        <circle className={styles.scalePin} cx="110" cy="20" r="6" />
        <path className={styles.scaleCord} d="M58 30 38 72M58 30l20 42M162 30l-20 42M162 30l20 42" />
        <path className={styles.scalePan} d="M34 72h48a24 24 0 0 1-48 0ZM138 72h48a24 24 0 0 1-48 0Z" />
      </svg>
    </div>
  );
}

function CoverMotif({ sector }: { sector?: string }) {
  if (!sector) throw new Error('A "sector" cover needs cover.sector');
  if (sector === "healthcare") return <HealthcareMotif />;
  if (sector === "legal") return <LegalMotif />;
  return <SectorMotif slug={sector as MotifSlug} cursorName="" className={motifStyles.enlarged} />;
}

/*
 * "Use in a sector" cover: the sector's own motif, enlarged. Variant 1 sets it in
 * a window on the dark panel (many motif pieces are translucent dark and would
 * vanish on it); variant 2 fills the whole cover. Decorative, no text.
 */
export function SectorCover({ variant, animated, sector }: { variant: number; animated: boolean; sector?: string }) {
  return (
    <div className={cn(styles.cover, variant === 2 ? styles.full : styles.panel, animated && styles.animated)} aria-hidden="true">
      <div className={styles.box}>
        <CoverMotif sector={sector} />
      </div>
    </div>
  );
}
