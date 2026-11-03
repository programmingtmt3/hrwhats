"use client";

import { useEffect, useRef, type ReactNode } from "react";

/*
 * Starts the phone story when half of the phone is on screen (its own trigger:
 * the panel's reveal fires while the phone may still be below the fold).
 * data-story="ready" holds every animation on its first frame, "play" runs
 * them once. No attribute (no JS, or reduced motion) leaves the final state
 * on screen. The attribute is not rendered by React, so it is set directly.
 */
export function StoryStage({ className, label, children }: { className: string; label: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.dataset.story = "ready";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.story = "play";
        io.disconnect();
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} role="img" aria-label={label}>
      {children}
    </div>
  );
}
