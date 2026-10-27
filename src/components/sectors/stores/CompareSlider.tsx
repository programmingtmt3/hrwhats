"use client";

import { Check, ChevronsLeftRight } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";

import { useReveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

import styles from "./Visuals.module.css";

type Data = {
  label: string;
  sliderLabel: string;
  dragHint: string;
  before: string;
  after: string;
  messy: string[];
  unread: string;
  organized: { text: string; tag: string }[];
  replied: string;
};

const STEP = 5;
const clamp = (v: number) => Math.min(100, Math.max(0, v));

/** First-view nudge: the handle swings to one side, then the other, and settles back at 50. */
const NUDGE_DELAY = 600;
const NUDGE_DURATION = 1400;
const NUDGE_AMPLITUDE = 12;

/*
 * Before/after comparison. The "before" pane covers the start side up to the
 * handle; `value` = how much of the width (from the start side) shows
 * "before". Drag with mouse or touch (pointer events, horizontal only), or
 * use the arrow keys / Home / End on the handle (role="slider"); moving the
 * handle toward the end side shows more "before", in RTL and LTR alike.
 * Each pane lays its chats out in its own half, so at the resting position
 * both sides show their full content.
 */
export function CompareSlider({ data, exampleTag }: { data: Data; exampleTag: ReactNode }) {
  const [value, setValue] = useState(50);
  const [touched, setTouched] = useState(false);
  const [boxRef, inView] = useReveal<HTMLDivElement>();
  const dragging = useRef(false);
  const frame = useRef(0);

  // Hint the handle is draggable: one swing when first seen, unless the
  // visitor already interacted or prefers reduced motion.
  useEffect(() => {
    if (!inView || touched) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let start = 0;
    const tick = (t: number) => {
      start ||= t;
      const p = (t - start) / NUDGE_DURATION;
      if (p >= 1) {
        setValue(50);
        return;
      }
      setValue(50 + NUDGE_AMPLITUDE * Math.sin(p * 2 * Math.PI));
      frame.current = requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => {
      frame.current = requestAnimationFrame(tick);
    }, NUDGE_DELAY);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame.current);
    };
  }, [inView, touched]);

  /** First interaction: stop the nudge (effect cleanup) and fade the hint out. */
  const interact = () => {
    cancelAnimationFrame(frame.current);
    setTouched(true);
  };

  const fromPointer = (clientX: number) => {
    const box = boxRef.current;
    if (!box) return;
    const r = box.getBoundingClientRect();
    const rtl = getComputedStyle(box).direction === "rtl";
    setValue(clamp(((rtl ? r.right - clientX : clientX - r.left) / r.width) * 100));
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    interact();
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    fromPointer(e.clientX);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) fromPointer(e.clientX);
  };
  const onPointerUp = () => {
    dragging.current = false;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const toEnd = rtl ? "ArrowLeft" : "ArrowRight";
    const toStart = rtl ? "ArrowRight" : "ArrowLeft";
    let next: number | null = null;
    if (e.key === toEnd || e.key === "ArrowUp") next = value + STEP;
    else if (e.key === toStart || e.key === "ArrowDown") next = value - STEP;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = 100;
    if (next === null) return;
    e.preventDefault();
    interact();
    setValue(clamp(next));
  };

  return (
    <figure className={styles.compareCard} aria-label={data.label}>
      <div className={styles.cardHead}>
        <span className={styles.compareLabels}>
          <b>{data.before}</b>
          <b>{data.after}</b>
        </span>
        <span className={styles.compareMeta}>
          {/* Visual hint only: the slider has its own accessible label. */}
          <span className={cn(styles.dragHint, touched && styles.dragHintGone)} aria-hidden="true">
            {data.dragHint}
          </span>
          {exampleTag}
        </span>
      </div>

      <div
        ref={boxRef}
        className={styles.compare}
        style={{ "--v": value } as CSSProperties}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* After: organized, tagged, answered (laid out in the end half). */}
        <ul className={styles.after}>
          {data.organized.map((m) => (
            <li key={m.text}>
              <span>{m.text}</span>
              <em>{m.tag}</em>
              <small>
                <Check aria-hidden="true" />
                {data.replied}
              </small>
            </li>
          ))}
        </ul>
        {/* Before: piled up and unanswered (start half, clipped to the handle). */}
        <ul className={styles.before} aria-hidden={value === 0 ? true : undefined}>
          {data.messy.map((text, i) => (
            <li key={text} style={{ "--i": i } as CSSProperties}>
              <span>{text}</span>
              <small>{data.unread}</small>
            </li>
          ))}
        </ul>

        <div
          role="slider"
          tabIndex={0}
          aria-label={data.sliderLabel}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(value)}
          aria-valuetext={`${data.before} ${Math.round(value)}%`}
          className={styles.handle}
          onKeyDown={onKeyDown}
        >
          <span>
            <ChevronsLeftRight aria-hidden="true" />
          </span>
        </div>
      </div>
    </figure>
  );
}
