"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

import { useReveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

import styles from "./FloorPlan.module.css";

export type Zone = {
  /** Position and size on the plan, in % (inline-start, top, width, height). */
  box: [number, number, number, number];
  /** Decorative drawing inside the zone. */
  deco: "screen" | "phone" | "kitchen" | "door" | "tables" | "cashier" | "office";
  /** Hotspot position inside the zone, as fractions (inline, block); default centered, lower part. */
  at?: [number, number];
};

type Spot = { place: string; service: string; label: string; zone: Zone };

/*
 * Restaurant floor plan with numbered hotspots. Desktop: each hotspot is a
 * button (aria-expanded + aria-controls) that shows its service in the panel
 * beside the plan; the first one is open by default. A numbered list of the
 * same seven services sits above the panel (same buttons, same ARIA), so every
 * title is visible at first sight; hovering or focusing a list item highlights
 * its hotspot and the other way round. A hint above the plan and one soft
 * pulse on the hotspots when the section is first seen show they are
 * clickable; the hint fades after the first click (the pulse is a CSS
 * animation, so reduced motion keeps only the text).
 * Every panel is in the HTML (the others are hidden with CSS), so all service
 * texts are indexable. Phones: the hotspots become plain numbers, the list and
 * hint are hidden, and every panel is listed below the plan, in the same order.
 */
export function PlanExplorer({
  spots,
  panels,
  planLabel,
  listLabel,
  hint,
}: {
  spots: Spot[];
  panels: ReactNode[];
  planLabel: string;
  listLabel: string;
  hint: string;
}) {
  const [active, setActive] = useState(0);
  const [linked, setLinked] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);
  const [explorerRef, inView] = useReveal<HTMLDivElement>();

  const choose = (i: number) => {
    setTouched(true);
    setActive(i);
  };
  /** Shared props of both controls for service `i` (hotspot and list item). */
  const control = (i: number) => ({
    type: "button" as const,
    "aria-expanded": i === active,
    "aria-controls": `plan-panel-${i}`,
    onClick: () => choose(i),
    onPointerEnter: () => setLinked(i),
    onPointerLeave: () => setLinked(null),
    onFocus: () => setLinked(i),
    onBlur: () => setLinked(null),
  });

  return (
    <div ref={explorerRef} className={styles.explorer}>
      <div className={styles.planCol}>
        {/* Visual hint only: the hotspots are announced as buttons. */}
        <p className={cn(styles.hint, touched && styles.hintGone)} aria-hidden="true">
          {hint}
        </p>
        <div className={cn(styles.plan, inView && !touched && styles.pulse)} role="group" aria-label={planLabel}>
          {spots.map((spot, i) => {
            const [s, t, w, h] = spot.zone.box;
            return (
              <div
                key={spot.place}
                className={cn(
                  styles.zone,
                  styles[spot.zone.deco],
                  i === active && styles.zoneActive,
                  i === linked && styles.zoneLinked,
                )}
                style={{ insetInlineStart: `${s}%`, top: `${t}%`, width: `${w}%`, height: `${h}%` } as CSSProperties}
                aria-hidden="true"
              >
                <span className={styles.zoneName}>{spot.place}</span>
                <span className={styles.deco} />
              </div>
            );
          })}
          {spots.map((spot, i) => {
            const [s, t, w, h] = spot.zone.box;
            const [ax, ay] = spot.zone.at ?? [0.5, 0.64];
            const pos = { insetInlineStart: `${s + w * ax}%`, top: `${t + h * ay}%`, "--i": i } as CSSProperties;
            return (
              <span key={spot.place} className={styles.spotWrap} style={pos}>
                <button
                  {...control(i)}
                  className={cn(styles.spot, i === active && styles.spotActive, i === linked && styles.spotLinked)}
                  aria-label={spot.label}
                >
                  {i + 1}
                </button>
                {/* Phones: the same number, not interactive (the list below shows everything). */}
                <span className={styles.marker} aria-hidden="true">
                  {i + 1}
                </span>
              </span>
            );
          })}
        </div>
      </div>

      <div className={styles.panels}>
        <ol className={styles.services} aria-label={listLabel}>
          {spots.map((spot, i) => (
            <li key={spot.place}>
              <button
                {...control(i)}
                className={cn(styles.service, i === active && styles.serviceActive, i === linked && styles.serviceLinked)}
              >
                <span className={styles.serviceNum} aria-hidden="true">
                  {i + 1}
                </span>
                {spot.service}
              </button>
            </li>
          ))}
        </ol>
        {panels.map((panel, i) => (
          <section key={spots[i].place} id={`plan-panel-${i}`} className={cn(styles.panel, i === active && styles.open)}>
            <p className={styles.panelPlace}>
              <span>{i + 1}</span>
              {spots[i].place}
            </p>
            {panel}
          </section>
        ))}
      </div>
    </div>
  );
}
