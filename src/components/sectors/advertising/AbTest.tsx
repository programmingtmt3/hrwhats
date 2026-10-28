"use client";

import { Trophy } from "lucide-react";
import { useState, type CSSProperties, type ReactNode } from "react";

import { format } from "@/lib/format";
import { cn } from "@/lib/utils";

import styles from "./AbTest.module.css";

type Data = {
  label: string;
  switchLabel: string;
  audiences: string[];
  announce: string;
  variants: string[];
  engagement: string;
  winner: string;
  /** Per audience: [version A, version B]. */
  messages: string[][];
};

/** Relative engagement per audience and version (bar width only, never a figure). */
const ENGAGEMENT = [
  [0.56, 0.86],
  [0.82, 0.6],
];

/*
 * 03 — A/B campaign test. The switch (role="switch", a native button: click,
 * Space, Enter) moves between the agency's own clients and its clients'
 * customers; both versions, their bars and the winner change, and the change
 * is announced.
 */
export function AbTest({ data, exampleTag }: { data: Data; exampleTag: ReactNode }) {
  const [audience, setAudience] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const on = audience === 1;
  const scores = ENGAGEMENT[audience];
  const winner = scores[0] >= scores[1] ? 0 : 1;

  const toggle = () => {
    const next = on ? 0 : 1;
    setAudience(next);
    setAnnouncement(format(data.announce, { name: data.audiences[next] }));
  };

  return (
    <figure aria-label={data.label}>
      <div className={styles.head}>
        <button type="button" role="switch" aria-checked={on} aria-label={data.switchLabel} className={styles.switch} onClick={toggle}>
          <span className={cn(styles.side, !on && styles.current)} aria-hidden="true">
            {data.audiences[0]}
          </span>
          <span className={styles.track} aria-hidden="true">
            <i />
          </span>
          <span className={cn(styles.side, on && styles.current)} aria-hidden="true">
            {data.audiences[1]}
          </span>
        </button>
        {exampleTag}
      </div>

      <div className={styles.variants}>
        {data.variants.map((variant, i) => (
          <div key={variant} className={cn(styles.variant, i === winner && styles.won)}>
            <span className={styles.variantName}>
              {variant}
              {i === winner && (
                <em className={styles.badge}>
                  <Trophy aria-hidden="true" />
                  {data.winner}
                </em>
              )}
            </span>
            {/* Keyed by audience so the new copy fades in. */}
            <p key={audience} className={styles.message}>
              {data.messages[audience][i]}
            </p>
            <span className={styles.engagement}>
              <small>{data.engagement}</small>
              <span className={styles.bar} aria-hidden="true">
                <i style={{ "--w": scores[i] } as CSSProperties} />
              </span>
            </span>
          </div>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </figure>
  );
}
