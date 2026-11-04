"use client";

import { useState } from "react";

import { format } from "@/lib/format";
import { cn } from "@/lib/utils";

import styles from "./WhatsappBan.module.css";

/*
 * Self-check before a campaign: real checkboxes (mouse, touch, Space), a
 * visible "n of 6" counter with a bar, and the same count announced politely
 * after each change. Nothing is saved or sent.
 */
export function Checklist({
  items,
  progress,
  progressLabel,
  groupLabel,
}: {
  items: string[];
  progress: string;
  progressLabel: string;
  groupLabel: string;
}) {
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false));
  const [announcement, setAnnouncement] = useState("");
  const total = items.length;
  const done = checked.filter(Boolean).length;

  const toggle = (index: number) => {
    const next = checked.map((value, i) => (i === index ? !value : value));
    setChecked(next);
    setAnnouncement(format(progressLabel, { done: next.filter(Boolean).length, total }));
  };

  return (
    <div className={styles.checklist}>
      <fieldset>
        <legend className="sr-only">{groupLabel}</legend>
        <ul className={styles.checks}>
          {items.map((item, i) => (
            <li key={item}>
              <label className={cn(styles.check, checked[i] && styles.checked)}>
                <input type="checkbox" checked={checked[i]} onChange={() => toggle(i)} />
                <span>{item}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
      <div className={styles.progress} aria-hidden="true">
        <span className={styles.bar}>
          <span style={{ inlineSize: `${(done / total) * 100}%` }} />
        </span>
        <b>{format(progress, { done, total })}</b>
      </div>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
