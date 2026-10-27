import { Check, Clock, List, Send } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { ExampleTag } from "../shared/ExampleTag";
import blueprint from "./Blueprint.module.css";
import styles from "./ServiceVisuals.module.css";

/*
 * Code-built mockups for the service sheets. Every animation runs once, when
 * the parent <Reveal> gets `.in-view`; items use `.reveal-child` so they stay
 * visible with JS off and appear at once with reduced motion.
 */

type Visuals = Dictionary["sectors"]["realEstate"]["services"]["visuals"];

const order = (i: number) => ({ "--i": i }) as CSSProperties;

function Sheet({ label, title, exampleTag, children }: { label: string; title: string; exampleTag: string; children: ReactNode }) {
  return (
    <figure className={blueprint.sheet} aria-label={label}>
      <div className={blueprint.sheetHead}>
        <b>{title}</b>
        <ExampleTag>{exampleTag}</ExampleTag>
      </div>
      {children}
    </figure>
  );
}

/** 01 — Inquiries sorted by type and assigned to a salesperson. */
export function InquiriesVisual({ data, exampleTag }: { data: Visuals["inquiries"]; exampleTag: string }) {
  return (
    <Sheet label={data.label} title={data.title} exampleTag={exampleTag}>
      <ul className={styles.inquiries}>
        {data.items.map((item, i) => (
          <li key={item.name} className="reveal-child" style={order(i)}>
            <span className={styles.lane}>{item.lane}</span>
            <span className={styles.who}>
              <b>{item.name}</b>
              <span>{item.text}</span>
            </span>
            <span className={styles.agent}>
              <small>{data.assignedTo}</small>
              <i aria-hidden="true">{item.agent.charAt(0)}</i>
              {item.agent}
            </span>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}

/** 02 — WhatsApp list message: the automated menu. */
export function AutoRepliesVisual({ data, exampleTag }: { data: Visuals["autoReplies"]; exampleTag: string }) {
  return (
    <figure className={styles.listChat} aria-label={data.label}>
      <div className={styles.listTop}>
        <span className={styles.always}>
          <Clock aria-hidden="true" />
          {data.badge}
        </span>
        <ExampleTag>{exampleTag}</ExampleTag>
      </div>
      <div className={styles.bubble}>
        {data.greeting}
        <span className={styles.menuButton}>
          <List aria-hidden="true" />
          {data.menuButton}
        </span>
      </div>
      <div className={styles.menu}>
        <b className={styles.menuTitle}>{data.menuTitle}</b>
        <ul>
          {data.options.map((option, i) => (
            <li key={option.title} className="reveal-child" style={order(i + 1)}>
              <span>
                <b>{option.title}</b>
                <small>{option.text}</small>
              </span>
              <i aria-hidden="true" />
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}

/** 03 — Campaign composer: audiences, personalized message, send. No counts. */
export function CampaignVisual({ data, exampleTag }: { data: Visuals["campaigns"]; exampleTag: string }) {
  return (
    <Sheet label={data.label} title={data.title} exampleTag={exampleTag}>
      <p className={styles.fieldLabel}>{data.audienceLabel}</p>
      <ul className={styles.audiences}>
        {data.audiences.map((audience, i) => (
          // The first two audiences end up selected.
          <li key={audience} className={cn(i < 2 && styles.selected)} style={order(i)}>
            <Check aria-hidden="true" />
            {audience}
          </li>
        ))}
      </ul>
      <p className={styles.fieldLabel}>{data.messageLabel}</p>
      <p className={styles.message}>
        {data.message.before}
        <span className={styles.variable}>{data.message.variable}</span>
        {data.message.after}
      </p>
      <span className={styles.send}>
        <Send aria-hidden="true" />
        {data.send}
      </span>
    </Sheet>
  );
}

// Visual-only values (dots = open conversations, bar = relative performance); never shown as numbers.
const TEAM_LOAD = [
  { dots: 4, bar: 86 },
  { dots: 3, bar: 72 },
  { dots: 5, bar: 94 },
  { dots: 2, bar: 60 },
];

/** 05 — Sales team: status, open conversations and relative performance. */
export function TeamVisual({ data, exampleTag }: { data: Visuals["team"]; exampleTag: string }) {
  return (
    <Sheet label={data.label} title={data.title} exampleTag={exampleTag}>
      <div className={cn(styles.teamRow, styles.teamHead)} aria-hidden="true">
        <span />
        <span>{data.conversations}</span>
        <span>{data.performance}</span>
      </div>
      <ul>
        {data.agents.map((agent, i) => {
          const load = TEAM_LOAD[i % TEAM_LOAD.length];
          return (
            <li key={agent.name} className={styles.teamRow}>
              <span className={styles.member}>
                <i aria-hidden="true">{agent.name.charAt(0)}</i>
                <span>
                  <b>{agent.name}</b>
                  <small className={cn(agent.online ? styles.online : styles.busy)}>{agent.status}</small>
                </span>
              </span>
              <span className={styles.dots} aria-hidden="true">
                {Array.from({ length: load.dots }, (_, d) => (
                  <i key={d} style={order(i + d)} />
                ))}
              </span>
              <span className={styles.perf} aria-hidden="true">
                <i style={{ ...order(i), "--w": load.bar } as CSSProperties} />
              </span>
            </li>
          );
        })}
      </ul>
    </Sheet>
  );
}

/** 06 — Conversion funnel: layers narrow from inquiries to deals. No figures. */
export function FunnelVisual({ data, exampleTag }: { data: Visuals["reports"]; exampleTag: string }) {
  return (
    <Sheet label={data.label} title={data.title} exampleTag={exampleTag}>
      <ol className={styles.funnel}>
        {data.stages.map((stage, i) => (
          <li key={stage} style={{ ...order(i), "--w": 100 - i * 20 } as CSSProperties}>
            <span>{stage}</span>
          </li>
        ))}
      </ol>
    </Sheet>
  );
}
