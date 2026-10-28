"use client";

import { ArrowDownWideNarrow, Clock, Layers } from "lucide-react";
import { Fragment, useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { useReveal } from "@/components/motion/Reveal";
import { format } from "@/lib/format";
import { cn } from "@/lib/utils";

import styles from "./SortBoard.module.css";
import { PriorityBadge } from "./Status";

type Ticket = {
  id: string;
  title: string;
  kind: string;
  department: number;
  priority: number;
  age: string;
  /** Minutes since the request came in (sorting only, never shown). */
  minutes: number;
};

type Data = {
  label: string;
  sortLabel: string;
  /** Visual hint next to the example tag; fades after the first click. */
  hint: string;
  sorts: string[];
  announce: string;
  tickets: Ticket[];
};

const sortIcons = [ArrowDownWideNarrow, Clock, Layers];
const DEPT_MODE = 2;

const sorters: ((a: Ticket, b: Ticket) => number)[] = [
  (a, b) => a.priority - b.priority || a.minutes - b.minutes,
  (a, b) => a.minutes - b.minutes,
  (a, b) => a.department - b.department || a.priority - b.priority || a.minutes - b.minutes,
];

/*
 * Request board with three sort buttons (aria-pressed; one active at a time).
 * Rows glide to their new places (FLIP: measure → reorder → invert → play);
 * "by department" adds a heading per department. The new order is announced.
 * With reduced motion the rows simply jump to their new places.
 * A hint ("tap to sort") and one soft pulse on the buttons when the board is
 * first seen show they are clickable; both stop after the first click (the
 * pulse is a CSS animation, so reduced motion keeps only the text).
 */
export function SortBoard({
  data,
  departments,
  priorities,
  exampleTag,
}: {
  data: Data;
  departments: string[];
  priorities: string[];
  exampleTag: ReactNode;
}) {
  const [mode, setMode] = useState(1);
  const [announcement, setAnnouncement] = useState("");
  const [touched, setTouched] = useState(false);
  const [boardRef, inView] = useReveal<HTMLElement>();
  const rows = useRef(new Map<string, HTMLElement>());
  const before = useRef(new Map<string, DOMRect>());

  const sorted = [...data.tickets].sort(sorters[mode]);

  const choose = (next: number) => {
    setTouched(true);
    if (next === mode) return;
    // First: remember where every row is now.
    before.current = new Map([...rows.current].map(([key, el]) => [key, el.getBoundingClientRect()]));
    setMode(next);
    setAnnouncement(format(data.announce, { name: data.sorts[next] }));
  };

  // Last + Invert + Play, before the browser paints the new order.
  useLayoutEffect(() => {
    const first = before.current;
    if (first.size === 0) return;
    before.current = new Map();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    rows.current.forEach((el, key) => {
      const last = el.getBoundingClientRect();
      const was = first.get(key);
      if (!was) {
        el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, easing: "ease-out" });
        return;
      }
      const dx = was.left - last.left;
      const dy = was.top - last.top;
      if (!dx && !dy) return;
      el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }], {
        duration: 550,
        easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      });
    });
  }, [mode]);

  const register = (key: string) => (el: HTMLElement | null) => {
    if (el) rows.current.set(key, el);
    else rows.current.delete(key);
  };

  return (
    <figure ref={boardRef} className={styles.board} aria-label={data.label}>
      <div className={styles.head}>
        <div
          role="group"
          aria-label={data.sortLabel}
          className={cn(styles.sorts, inView && !touched && styles.pulse)}
        >
          {data.sorts.map((sort, i) => {
            const Icon = sortIcons[i];
            return (
              <button key={sort} type="button" aria-pressed={i === mode} className={styles.sort} onClick={() => choose(i)}>
                <Icon aria-hidden="true" />
                {sort}
              </button>
            );
          })}
        </div>
        <span className={styles.meta}>
          {/* Visual hint only: the buttons are announced as toggle buttons. */}
          <span className={cn(styles.hint, touched && styles.hintGone)} aria-hidden="true">
            {data.hint}
          </span>
          {exampleTag}
        </span>
      </div>

      <ul className={styles.list}>
        {sorted.map((t, i) => {
          const heading = mode === DEPT_MODE && (i === 0 || sorted[i - 1].department !== t.department);
          return (
            <Fragment key={t.id}>
              {heading && (
                <li ref={register(`dept-${t.department}`)} className={styles.dept} aria-hidden="true">
                  {departments[t.department]}
                </li>
              )}
              <li ref={register(t.id)} className={styles.ticket}>
                <span className={styles.id} dir="ltr">
                  {t.id}
                </span>
                <span className={styles.main}>
                  <b>{t.title}</b>
                  <small>
                    {t.kind} · {departments[t.department]} · {t.age}
                  </small>
                </span>
                <PriorityBadge level={t.priority} label={priorities[t.priority]} />
              </li>
            </Fragment>
          );
        })}
      </ul>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </figure>
  );
}
