import { Bot, Check, Printer, Truck } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { ProductArt } from "./ProductArt";
import receipt from "./Receipt.module.css";
import styles from "./Visuals.module.css";

/*
 * Server-rendered mockups. Each animates once when its parent <Reveal> gets
 * `.in-view`; items use `.reveal-child` so they stay visible with JS off and
 * appear at once with reduced motion.
 */

type Visuals = Dictionary["sectors"]["stores"]["services"]["visuals"];

const order = (i: number) => ({ "--i": i }) as CSSProperties;

/** 02 — Auto-reply: a question, quick replies, then a matching product. */
export function BotSuggest({ data, price, exampleTag }: { data: Visuals["autoReplies"]; price: string; exampleTag: ReactNode }) {
  return (
    <figure className={cn(styles.card, styles.chatCard)} aria-label={data.label}>
      <div className={styles.cardHead}>
        <span />
        {exampleTag}
      </div>
      <p className={cn("reveal-child", styles.bubble, styles.in)} style={order(0)}>
        {data.customer}
      </p>
      <div className={cn("reveal-child", styles.bubble, styles.out)} style={order(2)}>
        <span className={styles.bot}>
          <Bot aria-hidden="true" />
          {data.auto}
        </span>
        {data.question}
        <span className={styles.options}>
          {data.options.map((option) => (
            <span key={option} className={cn(option === data.answer && styles.picked)}>
              {option}
            </span>
          ))}
        </span>
      </div>
      <p className={cn("reveal-child", styles.bubble, styles.in)} style={order(4)}>
        {data.answer}
      </p>
      <div className={cn("reveal-child", styles.bubble, styles.out)} style={order(6)}>
        <span className={styles.bot}>
          <Bot aria-hidden="true" />
          {data.auto}
        </span>
        {data.suggestion}
        <span className={styles.suggested}>
          <ProductArt id="watch" className={styles.suggestedArt} />
          <span>
            <b>{data.product.name}</b>
            <small>{data.product.detail}</small>
            <b className={styles.price}>{price}</b>
          </span>
        </span>
        <span className={styles.view}>{data.view}</span>
      </div>
    </figure>
  );
}

/** 03 — An invoice printing line by line, then stamped "confirmed". */
export function PrintedInvoice({
  data,
  lines,
  total,
  exampleTag,
}: {
  data: Visuals["orders"];
  lines: { name: string; price: string }[];
  total: string;
  exampleTag: ReactNode;
}) {
  return (
    <figure className={styles.printer} aria-label={data.label}>
      <div className={styles.slot} aria-hidden="true">
        <Printer />
      </div>
      <div className={styles.paperClip}>
        <div className={cn(receipt.zigzagBottom, styles.invoice)}>
          <div className={styles.invoiceHead}>
            <b>{data.title}</b>
            {exampleTag}
          </div>
          <p className={styles.line}>
            <span>{data.orderLabel}</span>
            <bdi>{data.orderNumber}</bdi>
          </p>
          <p className={styles.muted}>{data.customer}</p>
          <hr className={receipt.rule} />
          {lines.map((line, i) => (
            <p key={line.name} className={cn("reveal-child", styles.line)} style={order(4 + i)}>
              <span>{line.name}</span>
              <span>{line.price}</span>
            </p>
          ))}
          <p className={cn("reveal-child", styles.line)} style={order(4 + lines.length)}>
            <span>{data.shipping}</span>
            <span>{data.shippingValue}</span>
          </p>
          <hr className={receipt.rule} />
          <p className={cn("reveal-child", styles.line, styles.total)} style={order(5 + lines.length)}>
            <span>{data.total}</span>
            <span>{total}</span>
          </p>
          <span className={styles.stamp}>{data.stamp}</span>
        </div>
      </div>
    </figure>
  );
}

/** 05 (below the comparison) — Shipment tracking, ticked step by step. */
export function Tracking({ data }: { data: Visuals["experience"] }) {
  return (
    <div className={styles.tracking}>
      <b className={styles.trackingTitle}>
        <Truck aria-hidden="true" />
        <bdi>{data.trackingTitle}</bdi>
      </b>
      <ol>
        {data.tracking.map((step, i) => (
          <li key={step} className="reveal-child" style={order(2 + i * 2)}>
            <span className={styles.tick} aria-hidden="true">
              <Check />
            </span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}

// Visual-only activity levels (0–4) per day (rows) and time of day (columns).
const HEAT = [
  [1, 2, 2, 4, 3],
  [1, 2, 3, 4, 2],
  [0, 1, 2, 3, 2],
  [1, 1, 2, 4, 3],
  [1, 2, 3, 4, 4],
  [2, 3, 3, 4, 4],
  [2, 2, 3, 3, 2],
];

/** 06 — Customer behavior heatmap by day and time of day; shades only, no figures. */
export function Heatmap({ data, exampleTag }: { data: Visuals["reports"]; exampleTag: ReactNode }) {
  return (
    <figure className={styles.card} aria-label={data.label}>
      <div className={styles.cardHead}>
        <b>{data.title}</b>
        {exampleTag}
      </div>
      <div className={styles.heat} style={{ "--cols": data.slots.length } as CSSProperties}>
        <span />
        {data.slots.map((slot) => (
          <span key={slot} className={styles.slotName}>
            {slot}
          </span>
        ))}
        {data.days.map((day, r) => (
          <div key={day} className={styles.heatRow}>
            <span className={styles.day}>{day}</span>
            {data.slots.map((slot, c) => (
              <i key={slot} className={cn("reveal-child", styles[`l${HEAT[r % HEAT.length][c]}`])} style={order(c + r * 0.3)} />
            ))}
          </div>
        ))}
      </div>
      <p className={styles.legend} aria-hidden="true">
        {data.less}
        <span>
          <i className={styles.l0} />
          <i className={styles.l1} />
          <i className={styles.l2} />
          <i className={styles.l3} />
          <i className={styles.l4} />
        </span>
        {data.more}
      </p>
    </figure>
  );
}
