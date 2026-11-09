import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

import { CoverSvg } from "./CoverSvg";
import styles from "./MarketingCover.module.css";

/** v1: a target with concentric rings, an arrow striking its center. */
function Target() {
  return (
    <>
      <circle className={styles.ringOuter} cx="520" cy="225" r="178" />
      <circle className={styles.ringMid} cx="520" cy="225" r="126" />
      <circle className={styles.ringInner} cx="520" cy="225" r="76" />
      <circle className={styles.bull} cx="520" cy="225" r="30" />
      <circle className={styles.impact} cx="520" cy="225" r="30" />
      <g className={styles.arrow}>
        <g transform="translate(520 225) rotate(-27)">
          <line x1="0" y1="0" x2="350" y2="0" />
          <path className={styles.fletch} d="M340 0l36-30h52l-30 30 30 30h-52Z" />
        </g>
      </g>
    </>
  );
}

/* Rising to the right in both directions: rising to the left reads as a decline. */
const COLUMNS = [
  { x: 296, height: 74 },
  { x: 396, height: 116 },
  { x: 496, height: 156 },
  { x: 596, height: 200 },
  { x: 696, height: 246 },
  { x: 796, height: 292 },
];
const BASE_Y = 392;

/** v2: rising columns with a curve above them. */
function Growth() {
  return (
    <>
      <line className={styles.baseline} x1="290" y1={BASE_Y} x2="930" y2={BASE_Y} />
      {COLUMNS.map(({ x, height }, i) => (
        <rect
          key={x}
          className={styles.column}
          x={x}
          y={BASE_Y - height}
          width="68"
          height={height}
          rx="12"
          style={{ "--i": i, fillOpacity: 0.28 + i * 0.14 } as CSSProperties}
        />
      ))}
      <path className={styles.curve} d="M296 270C420 250 500 215 590 160S760 72 860 54" pathLength={100} />
      <circle className={styles.curveEnd} cx="860" cy="54" r="15" />
    </>
  );
}

/** Dots spread on a golden-angle spiral, flattened to the panel's shape. */
const DOTS = Array.from({ length: 44 }, (_, i) => {
  const angle = i * 2.39996;
  const reach = 215 + i * 9; // Outside the ring, at its flattened top and bottom too.
  const x = reach * 1.2 * Math.cos(angle);
  const y = reach * 0.62 * Math.sin(angle);
  return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)), r: Number((13 - i * 0.2).toFixed(1)) };
});
const SETTLED = Array.from({ length: 13 }, (_, i) => {
  const angle = i * 2.39996;
  const reach = 22 * Math.sqrt(i);
  return { x: Number((reach * Math.cos(angle)).toFixed(1)), y: Number((reach * Math.sin(angle)).toFixed(1)) };
});

/** v3: scattered dots gathering toward a ring: an audience being reached. */
function Gathering() {
  return (
    <g transform="translate(600 215)">
      {DOTS.map(({ x, y, r }, i) => (
        <circle
          key={i}
          className={styles.scatter}
          cx={x}
          cy={y}
          r={r}
          style={{ "--dx": `${x * 0.5}px`, "--dy": `${y * 0.5}px`, "--i": i % 8 } as CSSProperties}
        />
      ))}
      <circle className={styles.gatherHalo} r="112" />
      <circle className={styles.gatherRing} r="112" />
      {SETTLED.map(({ x, y }, i) => (
        <circle key={i} className={styles.settled} cx={x} cy={y} r="12" style={{ "--i": i } as CSSProperties} />
      ))}
    </g>
  );
}

/** "Marketing and strategy" cover. Decorative, no text. */
export function MarketingCover({ variant, animated }: { variant: number; animated: boolean }) {
  return (
    <CoverSvg className={cn(animated && styles.animated)}>
      {variant === 2 ? <Growth /> : variant === 3 ? <Gathering /> : <Target />}
    </CoverSvg>
  );
}
