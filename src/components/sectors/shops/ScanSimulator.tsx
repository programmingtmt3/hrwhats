"use client";

import { Check, CheckCheck, Contact, RotateCcw, ScanLine } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { SendIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

import { QrArt } from "./QrArt";
import styles from "./ScanSimulator.module.css";

type Data = {
  label: string;
  scan: string;
  scanning: string;
  hint: string;
  shop: string;
  prefilled: string;
  composerLabel: string;
  send: string;
  saved: string;
  listName: string;
  contact: string;
  number: string;
  again: string;
  announceScanning: string;
  announceChat: string;
  announceSaved: string;
};

type Phase = "idle" | "scanning" | "chat" | "saved";

/** How long the scan ring takes to fill. */
const SCAN_MS = 1300;

/** Current step (index in the 4 steps) for each phase. */
const stepOf: Record<Phase, number> = { idle: 0, scanning: 0, chat: 2, saved: 3 };

/*
 * "Press to scan" simulator. A tap, a click, a long press or a held Space/Enter
 * all start the same scan, which then completes on its own (so a quick tap
 * never looks broken). The phone then shows WhatsApp with the ready-made
 * message; "Send" saves the number. Focus follows (send → try again), each
 * phase is announced, and the step list marks the current step. Reduced
 * motion completes the scan at once. Long-press callouts and text selection
 * are disabled on the button.
 */
export function ScanSimulator({ data, steps, stepsLabel }: { data: Data; steps: string[]; stepsLabel: string }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [announcement, setAnnouncement] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const sendRef = useRef<HTMLButtonElement>(null);
  const againRef = useRef<HTMLButtonElement>(null);
  const scanRef = useRef<HTMLButtonElement>(null);
  const focusNext = useRef<"send" | "again" | "scan" | null>(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Move focus after the phase has rendered.
  useEffect(() => {
    const target = focusNext.current;
    focusNext.current = null;
    if (target === "send") sendRef.current?.focus();
    else if (target === "again") againRef.current?.focus();
    else if (target === "scan") scanRef.current?.focus();
  }, [phase]);

  const startScan = () => {
    if (phase !== "idle") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPhase("scanning");
    setAnnouncement(data.announceScanning);
    timer.current = setTimeout(
      () => {
        focusNext.current = "send";
        setPhase("chat");
        setAnnouncement(data.announceChat);
      },
      reduced ? 0 : SCAN_MS,
    );
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      startScan();
    }
  };

  const send = () => {
    focusNext.current = "again";
    setPhase("saved");
    setAnnouncement(data.announceSaved);
  };

  const reset = () => {
    focusNext.current = "scan";
    setPhase("idle");
    setAnnouncement("");
  };

  const current = stepOf[phase];

  return (
    <div className={styles.sim}>
      <ol className={styles.steps} aria-label={stepsLabel}>
        {steps.map((step, i) => (
          <li
            key={step}
            aria-current={i === current ? "step" : undefined}
            className={cn(i < current && styles.done, i === current && styles.current)}
          >
            <span className={styles.num} aria-hidden="true">
              {i < current || (phase === "saved" && i === current) ? <Check /> : i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>

      <figure className={styles.stage} aria-label={data.label}>
        <div className={cn(styles.phone, styles[phase])}>
          <span className={styles.notch} aria-hidden="true" />
          {(phase === "idle" || phase === "scanning") && (
            <div className={styles.camera} aria-hidden="true">
              <span className={styles.frame}>
                <QrArt />
                <i className={styles.scanLine} />
              </span>
            </div>
          )}
          {(phase === "chat" || phase === "saved") && (
            <div className={styles.wa}>
              <p className={styles.waHead}>{data.shop}</p>
              <div className={styles.waBody}>
                {phase === "saved" && (
                  <>
                    <p className={styles.sent}>
                      {data.prefilled}
                      <CheckCheck aria-hidden="true" />
                    </p>
                    <p className={styles.savedCard}>
                      <Contact aria-hidden="true" />
                      <span>
                        <b>{data.saved}</b>
                        <small>
                          {data.contact} · <span dir="ltr">{data.number}</span>
                        </small>
                        <small>{data.listName}</small>
                      </span>
                    </p>
                  </>
                )}
              </div>
              {phase === "chat" && (
                <div className={styles.composer}>
                  <span className={styles.draft}>
                    <span className="sr-only">{data.composerLabel}: </span>
                    {data.prefilled}
                  </span>
                  <button ref={sendRef} type="button" className={styles.send} onClick={send}>
                    <SendIcon className="icon-forward" />
                    <span className="sr-only">{data.send}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.controls}>
          {phase === "saved" ? (
            <button ref={againRef} type="button" className={styles.again} onClick={reset}>
              <RotateCcw aria-hidden="true" />
              {data.again}
            </button>
          ) : (
            <>
              <button
                ref={scanRef}
                type="button"
                className={cn(styles.scan, phase === "scanning" && styles.scanningBtn)}
                disabled={phase === "chat"}
                aria-disabled={phase === "scanning" || undefined}
                onPointerDown={startScan}
                onClick={startScan}
                onKeyDown={onKeyDown}
                onContextMenu={(e) => e.preventDefault()}
              >
                <span className={styles.ring} aria-hidden="true" />
                <ScanLine aria-hidden="true" />
                {phase === "scanning" ? data.scanning : data.scan}
              </button>
              <small className={styles.hint}>{data.hint}</small>
            </>
          )}
        </div>
        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>
      </figure>
    </div>
  );
}
