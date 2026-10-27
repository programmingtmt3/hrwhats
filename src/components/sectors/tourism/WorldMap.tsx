import type { CSSProperties, ReactNode } from "react";

import styles from "./WorldMap.module.css";

/*
 * Dot-matrix world map behind the hero and the start of the journey section.
 *
 * The dots are ONE static SVG used as a CSS mask (public/images/...; world
 * dots at 55% alpha, Saudi Arabia at 100%), so their color comes from the
 * design tokens. Generated once from Natural Earth 110m (world-atlas@2.0.2):
 * equirectangular, 2° cells, 78°N..58°S → a 180 × 68 grid. The small inline
 * SVG on top (same grid) holds the Riyadh pulse and the flight lines.
 * Geographic, so it is never mirrored in RTL.
 */
const WORLD_DOTS = "/images/sectors/tourism-hospitality/world-dots.svg";
const COLS = 180;
const ROWS = 68;

/** [lon, lat] → grid coordinates (x right/east, y down/south). */
const project = ([lon, lat]: [number, number]) => [(lon + 180) / 2, (78 - lat) / 2] as const;

const RIYADH = project([46.7, 24.7]);

/** Generic destinations on four continents (no labels on the map). */
const DESTINATIONS: [number, number][] = [
  [2.35, 48.85], // Europe
  [139.7, 35.7], // East Asia
  [18.4, -33.9], // Southern Africa
  [-74, 40.7], // North America
];

/** A quadratic arc from Riyadh, bowed sideways to its route and always toward the north. */
function arc(to: readonly [number, number]) {
  const [x1, y1] = RIYADH;
  const [x2, y2] = to;
  const BOW = 0.25;
  let [nx, ny] = [y2 - y1, x1 - x2]; // perpendicular to the route
  if (ny > 0) [nx, ny] = [-nx, -ny];
  const cx = (x1 + x2) / 2 + nx * BOW;
  const cy = (y1 + y2) / 2 + ny * BOW;
  const n = (v: number) => v.toFixed(2);
  return `M${n(x1)} ${n(y1)}Q${n(cx)} ${n(cy)} ${n(x2)} ${n(y2)}`;
}

const FLIGHTS = DESTINATIONS.map((d) => {
  const to = project(d);
  return { to, d: arc(to) };
});

function Map() {
  return (
    <div className={styles.fade} aria-hidden="true">
      <div className={styles.map}>
        <span className={styles.dots} style={{ maskImage: `url(${WORLD_DOTS})` }} />
        <svg className={styles.overlay} viewBox={`0 0 ${COLS} ${ROWS}`} preserveAspectRatio="none">
          <defs>
            {FLIGHTS.map((flight, i) => (
              <mask key={i} id={`tour-flight-${i}`} maskUnits="userSpaceOnUse" x="0" y="0" width={COLS} height={ROWS}>
                <path className={styles.reveal} d={flight.d} pathLength={1} style={{ "--i": i } as CSSProperties} />
              </mask>
            ))}
          </defs>
          {FLIGHTS.map((flight, i) => (
            <g key={i}>
              <path className={styles.route} d={flight.d} mask={`url(#tour-flight-${i})`} />
              <circle className={styles.city} cx={flight.to[0]} cy={flight.to[1]} r=".55" style={{ "--i": i } as CSSProperties} />
            </g>
          ))}
          <circle className={styles.ping} cx={RIYADH[0]} cy={RIYADH[1]} r=".6" />
          <circle className={styles.home} cx={RIYADH[0]} cy={RIYADH[1]} r=".6" />
        </svg>
      </div>
    </div>
  );
}

/** Wraps the sections that sit on the map (hero + the start of the journey). */
export function MapStage({ children }: { children: ReactNode }) {
  return (
    <div className={styles.stage}>
      <Map />
      {children}
    </div>
  );
}
