import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

import { CoverSvg } from "./CoverSvg";
import styles from "./WhatsappMessagesCover.module.css";

const ROWS = [75, 145, 215, 285, 355];

/** v1: one large bubble branches into rows of read ticks: one message, many readers. */
function Broadcast() {
  return (
    <>
      <g className={styles.branches}>
        {ROWS.map((y) => (
          <path key={y} d={`M650 215C590 215 575 ${y} 505 ${y}`} pathLength={100} />
        ))}
      </g>
      {ROWS.map((y, i) => (
        <g key={y} className={styles.row} style={{ "--i": i } as CSSProperties}>
          <rect x="255" y={y - 23} width="250" height="46" rx="23" />
          <line x1="285" y1={y} x2="415" y2={y} />
          <path d={`M440 ${y + 1}l7 8 14-17M456 ${y + 1}l7 8 14-17`} />
        </g>
      ))}
      <g className={styles.bubble}>
        <path d="M686 110h238a36 36 0 0 1 36 36v138a36 36 0 0 1-36 36h-4l34 34-74-34H686a36 36 0 0 1-36-36V146a36 36 0 0 1 36-36Z" />
        <line x1="700" y1="165" x2="910" y2="165" />
        <line x1="700" y1="215" x2="910" y2="215" />
        <line x1="780" y1="265" x2="910" y2="265" />
      </g>
    </>
  );
}

function TemplateCard({ x, y, tilt, className }: { x: number; y: number; tilt: number; className?: string }) {
  return (
    <g transform={`rotate(${tilt} ${x + 150} ${y + 115})`} className={className}>
      <rect className={styles.card} x={x} y={y} width="300" height="230" rx="26" />
      <rect className={styles.cardHead} x={x + 26} y={y + 26} width="248" height="58" rx="14" />
      <line className={styles.cardLine} x1={x + 28} y1={y + 118} x2={x + 272} y2={y + 118} />
      <line className={styles.cardLine} x1={x + 90} y1={y + 150} x2={x + 272} y2={y + 150} />
      <rect className={styles.cardButton} x={x + 28} y={y + 176} width="244" height="32" rx="16" />
    </g>
  );
}

/** v2: a stack of blank template cards, one of them drawn out of the stack. */
function TemplateStack() {
  return (
    <>
      <TemplateCard x={262} y={92} tilt={-9} />
      <TemplateCard x={276} y={96} tilt={-3} />
      <TemplateCard x={292} y={100} tilt={3} />
      <g className={styles.pulled}>
        <TemplateCard x={636} y={92} tilt={4} className={styles.picked} />
      </g>
    </>
  );
}

/** "Messages and templates" cover. Decorative, no text. */
export function WhatsappMessagesCover({ variant, animated }: { variant: number; animated: boolean }) {
  return (
    <CoverSvg className={cn(animated && styles.animated)}>
      {variant === 2 ? <TemplateStack /> : <Broadcast />}
    </CoverSvg>
  );
}
