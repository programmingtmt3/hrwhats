import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

import canvas from "./Canvas.module.css";

const tones = [canvas.tone0, canvas.tone1, canvas.tone2, canvas.tone3];

/** A teammate's named cursor on the canvas (decorative). `tone` = index in the team list. */
export function TeamCursor({
  name,
  tone,
  className,
  style,
}: {
  name: string;
  tone: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={cn(canvas.cursor, tones[tone % tones.length], className)} style={style} aria-hidden="true">
      <svg viewBox="0 0 16 20">
        <path d="M1.5 1.5v15l4-3.6 2.7 6 2.6-1.1-2.6-5.9h5.6z" />
      </svg>
      <b>{name}</b>
    </span>
  );
}

const clients = [canvas.client0, canvas.client1, canvas.client2];

/** Class that sets --c / --c-rgb to an example client's color. */
export const clientClass = (i: number) => clients[i % clients.length];
