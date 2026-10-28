"use client";

import { Megaphone } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";

import { useReveal } from "@/components/motion/Reveal";
import { format } from "@/lib/format";
import { cn } from "@/lib/utils";

import styles from "./AgencyBoard.module.css";
import { clientClass } from "./TeamCursor";

type Data = {
  label: string;
  title: string;
  switchLabel: string;
  announce: string;
  chatsTitle: string;
  campaignTitle: string;
  performance: string;
  accounts: { chats: { name: string; text: string }[]; campaign: string; status: string }[];
};

/** Relative campaign performance per client (bar width only, never shown as a number). */
const LEVELS = [0.68, 0.52, 0.84];
/** First view: show each client once (0 → 1 → 2), then stop. */
const AUTO_STEP = 2200;

/*
 * Agency dashboard with a client switcher (radiogroup: arrow keys follow the
 * reading direction, Home/End, roving tabindex). Choosing a client swaps the
 * chats, the campaign card and the performance bar at once. The automatic
 * tour runs once when the board first enters the viewport, stops at the
 * visitor's first interaction, and is skipped with reduced motion. Only the
 * visitor's own choices are announced (the tour would interrupt readers).
 */
export function AgencyBoard({ clients, data, exampleTag }: { clients: string[]; data: Data; exampleTag: ReactNode }) {
  const [active, setActive] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [touched, setTouched] = useState(false);
  const [rootRef, inView] = useReveal<HTMLDivElement>();
  const radios = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!inView || touched) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timers = [1, 2].map((i) => setTimeout(() => setActive(i), AUTO_STEP * i));
    return () => timers.forEach(clearTimeout);
  }, [inView, touched]);

  const choose = (i: number, focus = false) => {
    setTouched(true);
    setActive(i);
    setAnnouncement(format(data.announce, { name: clients[i] }));
    if (focus) radios.current[i]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const last = clients.length - 1;
    const next = rtl ? "ArrowLeft" : "ArrowRight";
    const prev = rtl ? "ArrowRight" : "ArrowLeft";
    let i: number | null = null;
    if (e.key === next || e.key === "ArrowDown") i = active === last ? 0 : active + 1;
    else if (e.key === prev || e.key === "ArrowUp") i = active === 0 ? last : active - 1;
    else if (e.key === "Home") i = 0;
    else if (e.key === "End") i = last;
    if (i === null) return;
    e.preventDefault();
    choose(i, true);
  };

  const account = data.accounts[active];

  return (
    <div ref={rootRef} className={cn(styles.board, clientClass(active))}>
      <figure aria-label={data.label}>
        <div className={styles.top}>
          <span className={styles.dots} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <b>{data.title}</b>
          {exampleTag}
        </div>

        <div
          role="radiogroup"
          aria-label={data.switchLabel}
          className={styles.switcher}
          onKeyDown={onKeyDown}
          onPointerDown={() => setTouched(true)}
          onFocus={() => setTouched(true)}
        >
          {clients.map((client, i) => (
            <button
              key={client}
              ref={(el) => {
                radios.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={i === active}
              tabIndex={i === active ? 0 : -1}
              className={cn(styles.client, clientClass(i))}
              onClick={() => choose(i)}
            >
              <span className={styles.avatar} aria-hidden="true">
                {client.charAt(0)}
              </span>
              {client}
            </button>
          ))}
        </div>

        {/* Keyed by client so the panel fades in again on every switch. */}
        <div key={active} className={styles.panel}>
          <p className={styles.panelTitle}>{data.chatsTitle}</p>
          <ul className={styles.chats}>
            {account.chats.map((chat, i) => (
              <li key={chat.name} style={{ "--i": i } as CSSProperties}>
                <span className={styles.chatAvatar} aria-hidden="true">
                  {chat.name.charAt(0)}
                </span>
                <span>
                  <b>{chat.name}</b>
                  {chat.text}
                </span>
              </li>
            ))}
          </ul>

          <div className={styles.campaign}>
            <Megaphone aria-hidden="true" />
            <span>
              <small>{data.campaignTitle}</small>
              <b>{account.campaign}</b>
            </span>
            <em>{account.status}</em>
          </div>
          <div className={styles.meter}>
            <small>{data.performance}</small>
            <span style={{ "--level": LEVELS[active] } as CSSProperties} aria-hidden="true">
              <i />
            </span>
          </div>
        </div>
      </figure>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
