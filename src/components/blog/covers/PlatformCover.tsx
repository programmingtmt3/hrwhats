import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

import { CoverSvg } from "./CoverSvg";
import styles from "./PlatformCover.module.css";

const SEAL_POINTS = Array.from({ length: 24 }, (_, i) => {
  const angle = (i * Math.PI) / 12;
  const radius = i % 2 === 0 ? 70 : 58;
  return `${(800 + radius * Math.cos(angle)).toFixed(1)},${(104 + radius * Math.sin(angle)).toFixed(1)}`;
}).join(" ");

/** v1: two blocks joined by a link with data pulses crossing it. */
function BlockLink() {
  return (
    <>
      <g className={styles.rails}>
        <line x1="430" y1="195" x2="770" y2="195" />
        <line x1="430" y1="235" x2="770" y2="235" />
      </g>
      <g className={styles.pulses}>
        {[510, 600, 690].map((x, i) => (
          <circle key={x} cx={x} cy={195} r="11" style={{ "--i": i } as CSSProperties} />
        ))}
        {[555, 645].map((x, i) => (
          <circle key={x} className={styles.back} cx={x} cy={235} r="11" style={{ "--i": i } as CSSProperties} />
        ))}
      </g>
      <rect className={styles.block} x="240" y="115" width="190" height="200" rx="30" />
      {[150, 197, 244].map((y) => (
        <g key={y} className={styles.server}>
          <rect x="268" y={y} width="134" height="36" rx="10" />
          <circle cx="288" cy={y + 18} r="6" />
          <line x1="316" y1={y + 18} x2="384" y2={y + 18} />
        </g>
      ))}
      <rect className={styles.blockOn} x="770" y="115" width="190" height="200" rx="30" />
      <path
        className={styles.chat}
        d="M820 165h90a16 16 0 0 1 16 16v54a16 16 0 0 1-16 16h-8l14 22-36-22h-60a16 16 0 0 1-16-16v-54a16 16 0 0 1 16-16Z"
      />
    </>
  );
}

/** Points on an ellipse around the hub. */
const orbitPoint = (rx: number, ry: number, degrees: number) => {
  const a = (degrees * Math.PI) / 180;
  return { cx: Number((rx * Math.cos(a)).toFixed(1)), cy: Number((ry * Math.sin(a)).toFixed(1)) };
};
const ORBITS = [
  { rx: 340, ry: 118, tilt: -10, points: [20, 165, 285], turn: styles.spin },
  { rx: 215, ry: 165, tilt: 14, points: [75, 205, 320], turn: styles.spinBack },
];

/** v2: a hub with connection points circling it. */
function Hub() {
  return (
    <>
      {ORBITS.map(({ rx, ry, tilt, points, turn }) => (
        <g key={rx} transform={`translate(600 215) rotate(${tilt})`}>
          <ellipse className={styles.orbit} rx={rx} ry={ry} />
          <g className={turn}>
            {points.map((degrees) => (
              <g key={degrees}>
                <circle className={styles.node} {...orbitPoint(rx, ry, degrees)} r="19" />
                <circle className={styles.nodeCore} {...orbitPoint(rx, ry, degrees)} r="7" />
              </g>
            ))}
          </g>
        </g>
      ))}
      <circle className={styles.hubHalo} cx="600" cy="215" r="88" />
      <circle className={styles.hub} cx="600" cy="215" r="60" />
      <circle className={styles.hubMark} cx="600" cy="215" r="22" />
    </>
  );
}

/** v3: a message bubble carrying a verified seal (the blue tick post). */
function VerifiedBubble() {
  return (
    <>
      <g className={styles.lightBubble}>
        <path d="M424 92h352a44 44 0 0 1 44 44v152a44 44 0 0 1-44 44h-6l40 40-90-40H424a44 44 0 0 1-44-44V136a44 44 0 0 1 44-44Z" />
        <line x1="436" y1="170" x2="720" y2="170" />
        <line x1="436" y1="222" x2="764" y2="222" />
        <line x1="560" y1="274" x2="764" y2="274" />
      </g>
      <g className={styles.seal}>
        <polygon points={SEAL_POINTS} />
        <path d="M772 104l20 21 37-42" />
      </g>
    </>
  );
}

/** v4: a message bubble carrying a keyhole, its contents hidden (the chat lock post). */
function LockedBubble() {
  return (
    <>
      <path
        className={styles.greenBubble}
        d="M424 70h352a44 44 0 0 1 44 44v180a44 44 0 0 1-44 44H470l-90 42 34-44a44 44 0 0 1-34-42V114a44 44 0 0 1 44-44Z"
      />
      <g className={styles.hidden}>
        {[438, 482, 526, 674, 718, 762].map((x) => (
          <circle key={x} cx={x} cy="204" r="13" />
        ))}
      </g>
      <g className={styles.keyhole}>
        <circle cx="600" cy="170" r="42" />
        <path d="M584 190h32l16 88h-64Z" />
      </g>
    </>
  );
}

/** "API and WhatsApp features" cover. Decorative, no text. */
export function PlatformCover({ variant, animated }: { variant: number; animated: boolean }) {
  return (
    <CoverSvg className={cn(animated && styles.animated)}>
      {variant === 2 ? <Hub /> : variant === 3 ? <VerifiedBubble /> : variant === 4 ? <LockedBubble /> : <BlockLink />}
    </CoverSvg>
  );
}
