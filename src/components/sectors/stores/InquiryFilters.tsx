"use client";

import { useState, type ReactNode } from "react";

import { format } from "@/lib/format";

import styles from "./Visuals.module.css";

type Data = {
  label: string;
  filtersLabel: string;
  filters: string[];
  showing: string;
  /** `filter` = index in `filters` (0 is "all"). */
  messages: { name: string; text: string; filter: number }[];
};

/** 01 — Customer inquiries with working filter chips (toggle buttons, aria-pressed). */
export function InquiryFilters({ data, exampleTag }: { data: Data; exampleTag: ReactNode }) {
  const [active, setActive] = useState(0);
  const shown = data.messages.filter((m) => active === 0 || m.filter === active);

  return (
    <figure className={styles.card} aria-label={data.label}>
      <div className={styles.cardHead}>
        <div role="group" aria-label={data.filtersLabel} className={styles.filters}>
          {data.filters.map((filter, i) => (
            <button
              key={filter}
              type="button"
              aria-pressed={i === active}
              className={styles.filter}
              onClick={() => setActive(i)}
            >
              {filter}
            </button>
          ))}
        </div>
        {exampleTag}
      </div>
      <ul className={styles.inbox}>
        {shown.map((m) => (
          <li key={m.name} className={styles.chat}>
            <span className={styles.avatar} aria-hidden="true">
              {m.name.charAt(0)}
            </span>
            <span className={styles.chatText}>
              <b>{m.name}</b>
              {m.text}
            </span>
            <span className={styles.chatTag}>{data.filters[m.filter]}</span>
          </li>
        ))}
      </ul>
      <p className={styles.showing} aria-live="polite">
        {format(data.showing, { count: shown.length })}
      </p>
    </figure>
  );
}
