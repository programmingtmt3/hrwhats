import type { CSSProperties } from "react";

/*
 * Line-drawn skyline of Saudi landmarks (decorative). Every shape stands on
 * y = 160 in its own coordinates and is placed with an x offset. Plain blocks
 * fill the gaps so the skyline stays continuous; the ground line is drawn
 * separately (full width) by the parent.
 */

type Shape = { width: number; d: string };

const LANDMARKS = {
  // Kingdom Centre: two horns around the parabolic opening, sky bridge on top.
  kingdom: {
    width: 60,
    d: "M0 160V78Q1 36 14 6C17 62 43 62 46 6Q59 36 60 78V160M16 18H44M16.5 22H43.5",
  },
  // Al Faisaliah: tapered pyramid, the sphere near the top, spire.
  faisaliah: {
    width: 60,
    d: "M0 160L25 50M60 160L35 50M22 44a8 8 0 1 0 16 0a8 8 0 1 0-16 0M27 37L30 18L33 37M30 18V4M8 128H52M15 98H45M21 72H39",
  },
  // KAFD: a cluster of towers with sharp, slanted crowns.
  kafd: {
    width: 84,
    d: "M0 160V64L16 50L28 58V160M28 58V42L46 12L58 34V160M58 84L74 72L84 80V160M16 50L18 160M46 12L44 160",
  },
  // Jeddah Tower: the tallest, three tapering petals to a sharp tip.
  jeddah: {
    width: 36,
    d: "M0 160C4 100 12 50 18 0C24 50 32 100 36 160M18 160V34M13 50L18 46L23 50",
  },
  // Abraj Al Bait: clock face on the central tower, long spire, shorter side towers.
  clock: {
    width: 120,
    d: "M0 160V122H120V160M8 122V72L14 66L20 72V122M24 122V62L30 56L34 60V122M86 122V60L90 56L96 62V122M100 122V72L106 66L112 72V122M38 122V40H82V122M49 58a11 11 0 1 0 22 0a11 11 0 1 0-22 0M60 58V51M60 58H65M42 40L48 28H72L78 40M54 28L60 6L66 28M60 6V0",
  },
  // Jabal Omar (The Address): two neighboring towers with stepped crowns.
  jabalOmar: {
    width: 58,
    d: "M0 160V64H4V54H8V44H12V36H16V44H20V54H24V64H28V160M30 160V50H34V40H38V30H42V22H46V30H50V40H54V50H58V160",
  },
} satisfies Record<string, Shape>;

type LandmarkKey = keyof typeof LANDMARKS;

// Block widths/heights cycled to fill the gaps between landmarks.
const BLOCK_WIDTHS = [34, 26, 42, 30, 38];
const BLOCK_HEIGHTS = [38, 58, 30, 66, 46, 26, 52];

/** A stepped row of plain buildings from x = from to x = to. */
function blocks(from: number, to: number, seed: number) {
  let d = `M${from} 160`;
  let x = from;
  for (let i = seed; x < to; i++) {
    const w = Math.min(BLOCK_WIDTHS[i % BLOCK_WIDTHS.length], to - x);
    d += `V${160 - BLOCK_HEIGHTS[i % BLOCK_HEIGHTS.length]}H${x + w}`;
    x += w;
  }
  return `${d}V160`;
}

type Item = { landmark: LandmarkKey; x: number } | { blocks: [number, number] };

/** Riyadh landmarks together, Jeddah Tower in the middle, Makkah landmarks together. */
const WIDE: { width: number; items: Item[] } = {
  width: 1600,
  items: [
    { blocks: [0, 140] },
    { landmark: "kingdom", x: 150 },
    { blocks: [215, 255] },
    { landmark: "faisaliah", x: 260 },
    { blocks: [325, 355] },
    { landmark: "kafd", x: 360 },
    { blocks: [455, 780] },
    { landmark: "jeddah", x: 790 },
    { blocks: [835, 1050] },
    { landmark: "clock", x: 1060 },
    { landmark: "jabalOmar", x: 1195 },
    { blocks: [1265, 1600] },
  ],
};

/** Phones: only the four best-known landmarks, at a readable size. */
const NARROW: { width: number; items: Item[] } = {
  width: 520,
  items: [
    { blocks: [0, 30] },
    { landmark: "kingdom", x: 35 },
    { blocks: [100, 120] },
    { landmark: "faisaliah", x: 125 },
    { blocks: [190, 215] },
    { landmark: "jeddah", x: 220 },
    { blocks: [262, 280] },
    { landmark: "clock", x: 285 },
    { blocks: [415, 520] },
  ],
};

function Skyline({ layout, className }: { layout: typeof WIDE; className?: string }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${layout.width} 160`}
      preserveAspectRatio="xMidYMax meet"
      fill="none"
      aria-hidden="true"
    >
      {layout.items.map((item, i) => {
        const style = { "--i": i } as CSSProperties;
        return "landmark" in item ? (
          <path key={i} pathLength={1} style={style} transform={`translate(${item.x} 0)`} d={LANDMARKS[item.landmark].d} />
        ) : (
          <path key={i} pathLength={1} style={style} d={blocks(item.blocks[0], item.blocks[1], i)} />
        );
      })}
    </svg>
  );
}

export function SaudiSkyline({ wideClass, narrowClass }: { wideClass: string; narrowClass: string }) {
  return (
    <>
      <Skyline layout={WIDE} className={wideClass} />
      <Skyline layout={NARROW} className={narrowClass} />
    </>
  );
}
