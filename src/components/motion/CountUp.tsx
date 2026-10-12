"use client";

import { useEffect, useState } from "react";

import { useInView } from "./Reveal";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Counts from 0 to `to` when the parent <Reveal> enters the viewport —
 * same as the design: 1400ms, ease-out cubic. Shows the final value directly
 * when the user prefers reduced motion.
 */
export function CountUp({ to, duration = 1400 }: { to: number; duration?: number }) {
  const inView = useInView();
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;
    let frame = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced, to, duration]);

  return <span>{inView && reduced ? to : value}</span>;
}
