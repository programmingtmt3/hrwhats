import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import styles from "./PageGlow.module.css";

/**
 * Soft green glow behind a whole inner page (packages, contact): the hero's
 * two blobs at the top, plus two fainter ones further down, all fading into
 * the page background — no box, no edge. Wrap the page's sections, starting
 * with <PageHero>. The home hero keeps its own <HeroBackdrop>.
 */
export function PageGlow({ children }: { children: ReactNode }) {
  return (
    <div className={styles.stage}>
      <div className={cn(styles.blob, styles.top)} aria-hidden="true" />
      <div className={cn(styles.blob, styles.heroEnd)} aria-hidden="true" />
      <div className={cn(styles.blob, styles.middle)} aria-hidden="true" />
      <div className={cn(styles.blob, styles.lower)} aria-hidden="true" />
      {children}
    </div>
  );
}
