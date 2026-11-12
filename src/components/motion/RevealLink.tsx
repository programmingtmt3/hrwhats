"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { revealProps, useReveal } from "./Reveal";

type RevealLinkProps = {
  href: string;
  /** Language of the target when it differs from the page (an Arabic-only page). */
  hrefLang?: string;
  className?: string;
  /** Transition delay in seconds (the design's `--d`). */
  delay?: number;
  style?: CSSProperties;
  children: ReactNode;
};

/** A next/link that scroll-reveals like <Reveal>. */
export function RevealLink({ href, hrefLang, className, delay, style, children }: RevealLinkProps) {
  const [ref, inView] = useReveal<HTMLAnchorElement>();

  return (
    <Link ref={ref} href={href} hrefLang={hrefLang} {...revealProps(inView, className, delay, style)}>
      {children}
    </Link>
  );
}
