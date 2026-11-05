import { cn } from "@/lib/utils";

import styles from "./BanProtectionCover.module.css";

/** Faint message bubbles behind the lock: x, y, width, height, sender side. */
const BUBBLES: [number, number, number, number, "in" | "out"][] = [
  [60, 44, 190, 58, "in"],
  [132, 132, 130, 46, "out"],
  [38, 216, 170, 54, "out"],
  [148, 306, 208, 62, "in"],
  [290, 42, 118, 44, "out"],
  [800, 40, 150, 48, "in"],
  [980, 86, 176, 58, "out"],
  [852, 180, 128, 46, "out"],
  [1012, 232, 150, 52, "in"],
  [836, 318, 200, 60, "in"],
  [1066, 346, 96, 42, "out"],
];

const CENTER_X = 600;
const CENTER_Y = 215;
const RING = 136;

function Bubble({ x, y, width, height, side }: { x: number; y: number; width: number; height: number; side: "in" | "out" }) {
  const tail =
    side === "in"
      ? `M${x + 14} ${y + height - 2} l-16 14 l30 -12 Z`
      : `M${x + width - 14} ${y + height - 2} l16 14 l-30 -12 Z`;
  return (
    <>
      <rect x={x} y={y} width={width} height={height} rx="16" />
      <path d={tail} />
    </>
  );
}

/*
 * "Ban and protection" cover: a padlock inside a ring, drawn in code. It plays
 * once: the lock starts red inside a broken ring, its shackle lifts, the ring
 * closes green. Base styles are the final state, so reduced motion (and small
 * cards, with `animated` off) show the open lock directly. Decorative, no text.
 */
export function BanProtectionCover({ variant, animated }: { variant: number; animated: boolean }) {
  return (
    <svg
      className={cn(styles.cover, animated && styles.animated)}
      viewBox="0 0 1200 430"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <g className={styles.bubbles} transform={variant % 2 === 0 ? "matrix(-1 0 0 1 1200 0)" : undefined}>
        {BUBBLES.map(([x, y, width, height, side]) => (
          <Bubble key={`${x}-${y}`} x={x} y={y} width={width} height={height} side={side} />
        ))}
      </g>

      <circle className={styles.halo} cx={CENTER_X} cy={CENTER_Y} r={RING + 42} />
      <circle className={styles.ringAlert} cx={CENTER_X} cy={CENTER_Y} r={RING} />
      <circle
        className={styles.ringDone}
        cx={CENTER_X}
        cy={CENTER_Y}
        r={RING}
        pathLength={100}
        transform={`rotate(-90 ${CENTER_X} ${CENTER_Y})`}
      />

      <g className={styles.sparks}>
        <circle cx={CENTER_X - RING} cy={CENTER_Y} r="7" />
        <circle cx={CENTER_X + RING} cy={CENTER_Y} r="7" />
        <circle cx={CENTER_X} cy={CENTER_Y - RING} r="7" />
        <circle cx={CENTER_X} cy={CENTER_Y + RING} r="7" />
      </g>

      <path className={styles.shackle} d="M565 200V165a35 35 0 0 1 70 0v35" />
      <rect className={styles.body} x="540" y="195" width="120" height="96" rx="18" />
      <circle className={styles.keyhole} cx={CENTER_X} cy="233" r="12" />
      <rect className={styles.keyhole} x="594" y="236" width="12" height="28" rx="4" />
    </svg>
  );
}
