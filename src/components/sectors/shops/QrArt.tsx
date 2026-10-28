import { cn } from "@/lib/utils";

import styles from "./QrArt.module.css";

const SIZE = 21;

/** Deterministic pseudo-random modules (same drawing on every render). */
function modules(): boolean[] {
  let seed = 7;
  const next = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  return Array.from({ length: SIZE * SIZE }, () => next() > 0.52);
}

/** Inside a 7×7 finder square at (fx, fy) or its one-module margin. */
const nearFinder = (x: number, y: number, fx: number, fy: number) => x >= fx - 1 && x <= fx + 7 && y >= fy - 1 && y <= fy + 7;
const CELLS = modules();

/**
 * A decorative QR-like drawing that cannot be scanned: it has only two of the
 * three finder squares a real QR code needs (no bottom-left one), no format
 * information and random modules.
 */
export function QrArt({ className }: { className?: string }) {
  const finders: [number, number][] = [
    [0, 0],
    [SIZE - 7, 0],
  ];
  const rects: string[] = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (finders.some(([fx, fy]) => nearFinder(x, y, fx, fy))) continue;
      if (CELLS[y * SIZE + x]) rects.push(`M${x} ${y}h1v1h-1z`);
    }
  }
  return (
    <svg className={cn(styles.qr, className)} viewBox={`-1 -1 ${SIZE + 2} ${SIZE + 2}`} aria-hidden="true">
      <rect x="-1" y="-1" width={SIZE + 2} height={SIZE + 2} className={styles.paper} />
      <path d={rects.join("")} />
      {finders.map(([fx, fy]) => (
        <g key={fx}>
          <path d={`M${fx} ${fy}h7v7h-7z M${fx + 1} ${fy + 1}v5h5v-5z`} fillRule="evenodd" />
          <rect x={fx + 2} y={fy + 2} width="3" height="3" />
        </g>
      ))}
    </svg>
  );
}
