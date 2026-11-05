"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import styles from "./PageToc.module.css";

type Item = { id: string; title: string };

/*
 * Table of contents for a long page (legal pages, blog posts). Desktop: a sticky side list; the section
 * currently under the header is marked (aria-current="location"). Phones: the
 * same list above the text, collapsed behind a toggle button (aria-expanded),
 * closed again after a link is chosen. Links are plain anchors; the sections'
 * scroll-margin keeps their headings clear of the fixed header.
 */
export function PageToc({ items, title, label }: { items: Item[]; title: string; label: string }) {
  const [active, setActive] = useState(items[0]?.id);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sections = items
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    let frame = 0;

    const update = () => {
      frame = 0;
      const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 76;
      const line = header + 40;
      // At the very bottom the last section is current, even if its heading never reaches the line.
      const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      let current = sections[0];
      for (const el of sections) {
        if (el.getBoundingClientRect().top <= line) current = el;
      }
      if (atEnd) current = sections[sections.length - 1];
      if (current) setActive(current.id);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [items]);

  return (
    <nav className={styles.toc} aria-label={label}>
      <p className={styles.tocTitle}>{title}</p>
      <button
        type="button"
        className={styles.tocToggle}
        aria-expanded={open}
        aria-controls="page-toc-list"
        onClick={() => setOpen((value) => !value)}
      >
        {title}
        <ChevronDown aria-hidden="true" />
      </button>
      <ol id="page-toc-list" className={cn(styles.tocList, open && styles.tocOpen)}>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(item.id === active && styles.tocActive)}
              aria-current={item.id === active ? "location" : undefined}
              onClick={() => setOpen(false)}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
