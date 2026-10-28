"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

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

type Spot = { place: string; label: string; zone: Zone };

/*
 * Restaurant floor plan with numbered hotspots. Desktop: each hotspot is a
 * button (aria-expanded + aria-controls) that shows its service in the panel
 * beside the plan; the first one is open by default. Every panel is in the
 * HTML (the others are hidden with CSS), so all service texts are indexable.
 * Phones: the hotspots become plain numbers and every panel is listed below
 * the plan, in the same order.
 */
export function PlanExplorer({
  spots,
  panels,
  planLabel,
  hint,
}: {
  spots: Spot[];
  panels: ReactNode[];
  planLabel: string;
  hint: string;
}) {
  const [active, setActive] = useState(0);

  return (
    <div className={styles.explorer}>
      <div className={styles.planCol}>
        <p className={styles.hint}>{hint}</p>
        <div className={styles.plan} role="group" aria-label={planLabel}>
          {spots.map((spot, i) => {
            const [s, t, w, h] = spot.zone.box;
            return (
              <div
                key={spot.place}
                className={cn(styles.zone, styles[spot.zone.deco], i === active && styles.zoneActive)}
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
            const pos = { insetInlineStart: `${s + w * ax}%`, top: `${t + h * ay}%` } as CSSProperties;
            return (
              <span key={spot.place} className={styles.spotWrap} style={pos}>
                <button
                  type="button"
                  className={cn(styles.spot, i === active && styles.spotActive)}
                  aria-expanded={i === active}
                  aria-controls={`plan-panel-${i}`}
                  aria-label={spot.label}
                  onClick={() => setActive(i)}
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
