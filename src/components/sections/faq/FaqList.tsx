"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";

import { PlusIcon } from "@/components/icons";
import { revealProps, useReveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

import styles from "./Faq.module.css";

export type FaqEntry = { question: string; answer: ReactNode };

// From the design script: close animation length before removing [open].
const CLOSE_DELAY = 380;

type FaqItemProps = {
  entry: FaqEntry;
  index: number;
  open: boolean;
  shown: boolean;
  onToggle: (index: number) => void;
};

function FaqItem({ entry, index, open, shown, onToggle }: FaqItemProps) {
  const [ref, inView] = useReveal<HTMLDetailsElement>();

  const onClick = (e: MouseEvent) => {
    e.preventDefault();
    onToggle(index);
  };

  return (
    <details
      ref={ref}
      open={open}
      {...revealProps(inView, cn(styles.faq, shown && styles.show), index * 0.05 || undefined)}
    >
      <summary onClick={onClick}>
        {entry.question}
        <span className={styles.pm}>
          <PlusIcon />
        </span>
      </summary>
      <div className={styles.ans}>
        <div>
          <p>{entry.answer}</p>
        </div>
      </div>
    </details>
  );
}

/**
 * Smooth accordion, one open at a time — same as the design script:
 * opening sets [open] then adds `.show` on the next frame (grid-rows 0fr→1fr);
 * closing removes `.show` and drops [open] after 380ms.
 */
export function FaqList({ entries }: { entries: FaqEntry[] }) {
  const [open, setOpen] = useState<number[]>([]);
  const [shown, setShown] = useState<number | null>(null);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const frame = useRef(0);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      cancelAnimationFrame(frame.current);
    };
  }, []);

  const close = (index: number) => {
    setShown((current) => (current === index ? null : current));
    const id = setTimeout(() => {
      timers.current.delete(id);
      setOpen((list) => list.filter((i) => i !== index));
    }, CLOSE_DELAY);
    timers.current.add(id);
  };

  const toggle = (index: number) => {
    const opening = !open.includes(index);
    open.filter((i) => i !== index).forEach(close);
    if (opening) {
      setOpen((list) => [...list, index]);
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => setShown(index));
    } else {
      close(index);
    }
  };

  return (
    <div className={styles.list}>
      {entries.map((entry, i) => (
        <FaqItem
          key={entry.question}
          entry={entry}
          index={i}
          open={open.includes(i)}
          shown={shown === i}
          onToggle={toggle}
        />
      ))}
    </div>
  );
}
