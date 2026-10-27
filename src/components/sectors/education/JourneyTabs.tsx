"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { useReveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

import styles from "./Services.module.css";

export type JourneyTab = { id: string; label: string; panel: ReactNode };

/*
 * WAI-ARIA tabs (automatic activation). Arrow keys follow the visual order, so
 * in RTL ArrowLeft goes to the next tab; Home/End jump to the first/last tab;
 * Tab moves from the active tab into its panel (roving tabindex).
 *
 * Each panel is a `.reveal`: it gets `.in-view` the first time it is shown
 * (the first one when the section scrolls into view), so its mockup animates
 * once and then stays in its final state.
 */
export function JourneyTabs({ tabs, label }: { tabs: JourneyTab[]; label: string }) {
  const [active, setActive] = useState(0);
  const [opened, setOpened] = useState<ReadonlySet<number>>(new Set());
  const [rootRef, inView] = useReveal<HTMLDivElement>();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const userMoved = useRef(false);

  // Mark a panel as opened once it is both active and on screen. Deferred so the
  // panel is painted in its start state first (no transition runs out of `hidden`).
  useEffect(() => {
    if (!inView || opened.has(active)) return;
    const id = setTimeout(() => setOpened((prev) => new Set(prev).add(active)), 40);
    return () => clearTimeout(id);
  }, [inView, active, opened]);

  // Keep the selected tab fully visible inside the (phone) scroll strip.
  useEffect(() => {
    if (!userMoved.current) return;
    tabRefs.current[active]?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [active]);

  const select = (index: number, focus: boolean) => {
    userMoved.current = true;
    setActive(index);
    if (focus) tabRefs.current[index]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = tabs.length - 1;
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const next = rtl ? "ArrowLeft" : "ArrowRight";
    const prev = rtl ? "ArrowRight" : "ArrowLeft";
    let target: number | null = null;
    if (e.key === next) target = active === last ? 0 : active + 1;
    else if (e.key === prev) target = active === 0 ? last : active - 1;
    else if (e.key === "Home") target = 0;
    else if (e.key === "End") target = last;
    if (target === null) return;
    e.preventDefault();
    select(target, true);
  };

  return (
    <div ref={rootRef} className={styles.tabs}>
      <div className={styles.stripWrap}>
        <div role="tablist" aria-label={label} className={styles.strip} onKeyDown={onKeyDown}>
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-controls={`panel-${tab.id}`}
              aria-selected={i === active}
              tabIndex={i === active ? 0 : -1}
              className={styles.tab}
              onClick={() => select(i, false)}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {tabs.map((tab, i) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          tabIndex={0}
          hidden={i !== active}
          className={cn("reveal", opened.has(i) && "in-view", styles.panel)}
        >
          {tab.panel}
        </div>
      ))}
    </div>
  );
}
