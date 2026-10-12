"use client";

import type { PointerEvent, ReactNode } from "react";

import { Reveal } from "@/components/motion/Reveal";

/** Spotlight (design script): track the pointer into --mx/--my for the card's ::after gradient. */
function onPointerMove(e: PointerEvent<HTMLElement>) {
  const card = e.currentTarget;
  const r = card.getBoundingClientRect();
  card.style.setProperty("--mx", `${e.clientX - r.left}px`);
  card.style.setProperty("--my", `${e.clientY - r.top}px`);
}

type BentoCardProps = {
  className: string;
  delay?: number;
  children: ReactNode;
};

export function BentoCard({ className, delay, children }: BentoCardProps) {
  return (
    <Reveal as="article" className={className} delay={delay} onPointerMove={onPointerMove}>
      {children}
    </Reveal>
  );
}
