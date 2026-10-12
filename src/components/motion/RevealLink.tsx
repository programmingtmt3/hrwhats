"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { revealProps, useReveal } from "./Reveal";

type RevealLinkProps = {
  href: string;
  className?: string;
  /** Transition delay in seconds (the design's `--d`). */
  delay?: number;
  style?: CSSProperties;
  children: ReactNode;
};

/** A next/link that scroll-reveals like <Reveal>. */
export function RevealLink({ href, className, delay, style, children }: RevealLinkProps) {
  const [ref, inView] = useReveal<HTMLAnchorElement>();

  return (
    <Link ref={ref} href={href} {...revealProps(inView, className, delay, style)}>
      {children}
    </Link>
  );
}
