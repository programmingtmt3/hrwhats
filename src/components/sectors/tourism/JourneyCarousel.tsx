"use client";

import { Briefcase } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { ArrowIcon } from "@/components/icons";
import { useReveal } from "@/components/motion/Reveal";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { cn } from "@/lib/utils";

import styles from "./Journey.module.css";

export type JourneyStage = {
  id: string;
  name: string;
  /** "2 من 5: الحجز" — the slide's accessible name. */
  slideLabel: string;
  /** "الانتقال إلى مرحلة: الحجز" — the route stop's accessible name. */
  goToLabel: string;
  slide: ReactNode;
};

type Labels = { carousel: string; slideRole: string; prev: string; next: string };

const noop = () => () => {};

/*
 * Carousel of the stay's stages. The track scrolls sideways inside itself
 * (scroll-snap, touch swipe); the active stage follows the scroll position, so
 * the suitcase on the route moves the same way whether you swipe, press
 * prev/next, pick a stop, or use the arrow keys (mirrored in RTL), Home/End.
 *
 * Slides get `tour-armed` on the client (start state of their mockups) and
 * `tour-played` the first time they are shown, so every mockup plays once.
 * Without JS no slide is armed and the mockups show their final state.
 */
export function JourneyCarousel({ stages, labels }: { stages: JourneyStage[]; labels: Labels }) {
  const [active, setActive] = useState(0);
  const [played, setPlayed] = useState<ReadonlySet<number>>(new Set());
  const [announcement, setAnnouncement] = useState("");
  const [rootRef, inView] = useReveal<HTMLDivElement>();
  const trackRef = useRef<HTMLDivElement>(null);
  const armed = useSyncExternalStore(noop, () => true, () => false);
  const reduced = useReducedMotion();
  const last = stages.length - 1;

  useEffect(() => {
    if (!inView || played.has(active)) return;
    const id = setTimeout(() => setPlayed((prev) => new Set(prev).add(active)), 60);
    return () => clearTimeout(id);
  }, [inView, active, played]);

  // Active stage = the slide that fills most of the track.
  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const index = Math.round(Math.abs(track.scrollLeft) / track.clientWidth);
    setActive(Math.min(Math.max(index, 0), last));
  };

  const goTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const target = Math.min(Math.max(index, 0), last);
    // RTL tracks scroll toward negative scrollLeft.
    const sign = getComputedStyle(track).direction === "rtl" ? -1 : 1;
    track.scrollTo({ left: sign * target * track.clientWidth, behavior: reduced ? "auto" : "smooth" });
    setAnnouncement(stages[target].slideLabel);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    let target: number | null = null;
    if (e.key === (rtl ? "ArrowLeft" : "ArrowRight")) target = active + 1;
    else if (e.key === (rtl ? "ArrowRight" : "ArrowLeft")) target = active - 1;
    else if (e.key === "Home") target = 0;
    else if (e.key === "End") target = last;
    if (target === null) return;
    e.preventDefault();
    goTo(target);
  };

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={labels.carousel}
      className={styles.carousel}
      onKeyDown={onKeyDown}
    >
      {/* The route: a dotted line with one stop per stage; the suitcase sits on the active stop. */}
      <div className={styles.route} style={{ "--active": active, "--stops": stages.length } as CSSProperties}>
        <span className={styles.line} aria-hidden="true" />
        <span className={styles.bag} aria-hidden="true">
          <Briefcase />
        </span>
        <ol>
          {stages.map((stage, i) => (
            <li key={stage.id}>
              <button
                type="button"
                className={cn(styles.stop, i === active && styles.current)}
                aria-label={stage.goToLabel}
                aria-current={i === active ? "step" : undefined}
                onClick={() => goTo(i)}
              >
                <i aria-hidden="true">{i + 1}</i>
                <span aria-hidden="true">{stage.name}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div ref={trackRef} className={styles.track} onScroll={onScroll} tabIndex={0} aria-label={labels.carousel}>
        {stages.map((stage, i) => (
          <div
            key={stage.id}
            id={`stage-${stage.id}`}
            role="group"
            aria-roledescription={labels.slideRole}
            aria-label={stage.slideLabel}
            className={cn(styles.slide, armed && "tour-armed", played.has(i) && "tour-played")}
          >
            {stage.slide}
          </div>
        ))}
      </div>

      <div className={styles.controls}>
        <button type="button" className={styles.arrow} onClick={() => goTo(active - 1)} disabled={active === 0} aria-label={labels.prev}>
          {/* Points back: the forward arrow, mirrored. */}
          <ArrowIcon className={cn("icon-forward", styles.back)} />
        </button>
        <span className={styles.count} aria-hidden="true">
          {active + 1} / {stages.length}
        </span>
        <button type="button" className={styles.arrow} onClick={() => goTo(active + 1)} disabled={active === last} aria-label={labels.next}>
          <ArrowIcon className="icon-forward" />
        </button>
      </div>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
