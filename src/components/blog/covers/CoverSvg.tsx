import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import styles from "./PostCover.module.css";

/**
 * The 1200×430 drawing surface of a cover. Phones crop it to 16:9, which keeps
 * x 218–982 visible, so each drawing keeps its main shapes inside that range.
 */
export function CoverSvg({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg
      className={cn(styles.svg, className)}
      viewBox="0 0 1200 430"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}
