import { CircleCheck } from "lucide-react";
import type { CSSProperties } from "react";

import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { ExampleTag } from "../shared/ExampleTag";
import styles from "./LeadsBoard.module.css";

type LeadsData = Dictionary["sectors"]["realEstate"]["services"]["visuals"]["leads"];

/*
 * Card moves, by card index in ar.json: column before → after (0 = first
 * column), row inside the column, and the step at which it moves (-1 = never).
 * Moves run back to front so a card never lands on one still in place:
 * the deal closes first, then each card advances, then a new inquiry arrives.
 */
const FLOW = [
  { from: 0, to: 1, row: 0, step: 2 },
  { from: 1, to: 2, row: 0, step: 1 },
  { from: 2, to: 3, row: 0, step: 0 },
  { from: 0, to: 0, row: 0, step: 3, enters: true },
  { from: 3, to: 3, row: 1, step: -1 },
];

const DEAL_COLUMN = 3;

/** Position vars for both layouts: 4 columns in a row, or a 2×2 grid on phones. */
function place(col: number, prefix: string) {
  return {
    [`--${prefix}c`]: col,
    [`--${prefix}x`]: col % 2,
    [`--${prefix}y`]: Math.floor(col / 2),
  };
}

/** 04 — Deal pipeline: cards advance one column once the board is in view. */
export function LeadsBoard({ data, exampleTag }: { data: LeadsData; exampleTag: string }) {
  return (
    <figure className={styles.figure} aria-label={data.label}>
      <div className={styles.board}>
        <ol className={styles.columns}>
          {data.columns.map((column, i) => (
            <li key={column} className={cn(i === DEAL_COLUMN && styles.dealColumn)}>
              <span className={styles.colHead}>{column}</span>
            </li>
          ))}
        </ol>

        <ul className={styles.cards}>
          {data.cards.map((card, i) => {
            const flow = FLOW[i];
            if (!flow) return null;
            const style = {
              ...place(flow.from, "f"),
              ...place(flow.to, "t"),
              "--row": flow.row,
              "--step": Math.max(flow.step, 0),
            } as CSSProperties;
            return (
              <li
                key={card.name}
                style={style}
                className={cn(
                  styles.card,
                  flow.step >= 0 && styles.moves,
                  flow.enters && styles.enters,
                  flow.to === DEAL_COLUMN && styles.closes,
                )}
              >
                <span className={styles.cardTop}>
                  <b>{card.name}</b>
                  <span className={styles.tag}>{card.tag}</span>
                </span>
                <span className={styles.cardText}>{card.text}</span>
                {flow.to === DEAL_COLUMN && (
                  <span className={styles.closed}>
                    <CircleCheck aria-hidden="true" />
                    {data.closed}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <figcaption className={styles.caption}>
        <ExampleTag>{exampleTag}</ExampleTag>
      </figcaption>
    </figure>
  );
}
