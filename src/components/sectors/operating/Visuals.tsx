import { Bot, CalendarClock, Check, FileSignature, Sparkles, Wrench } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { Led, statusTone } from "./Status";
import styles from "./Visuals.module.css";

/*
 * Server-rendered operations mockups. Each animates once when its parent
 * <Reveal> gets `.in-view`; items use `.reveal-child` so they stay visible with
 * JS off and appear at once with reduced motion.
 */

type Visuals = Dictionary["sectors"]["operating"]["services"]["visuals"];

const order = (i: number) => ({ "--i": i }) as CSSProperties;

function Head({ title, exampleTag }: { title?: ReactNode; exampleTag: ReactNode }) {
  return (
    <div className={styles.head}>
      <span className={styles.headTitle}>{title}</span>
      {exampleTag}
    </div>
  );
}

/** 02 — A bot collects the request, then requests ride a sorting belt into their department bins. */
export function IntakeBelt({ data, departments, exampleTag }: { data: Visuals["intake"]; departments: string[]; exampleTag: ReactNode }) {
  return (
    <figure aria-label={data.label}>
      <Head exampleTag={exampleTag} />
      <div className={styles.thread}>
        {data.messages.map((m, i) => (
          <p key={m.text} className={cn("reveal-child", styles.bubble, m.from === "bot" ? styles.in : styles.out)} style={order(i)}>
            {m.from === "bot" && (
              <span className={styles.bot}>
                <Bot aria-hidden="true" />
                {data.auto}
              </span>
            )}
            {m.text}
          </p>
        ))}
      </div>

      <p className={styles.beltTitle}>{data.beltTitle}</p>
      <div className={styles.belt}>
        <ul className={styles.bins}>
          {departments.map((dept, d) => {
            const p = data.parcelDepartments.indexOf(d);
            return (
              <li key={dept} style={{ "--col": d } as CSSProperties}>
                {p >= 0 && (
                  <span className={styles.parcel} style={order(p)} dir="ltr">
                    {data.parcels[p]}
                  </span>
                )}
                <span className={styles.bin}>{dept}</span>
              </li>
            );
          })}
        </ul>
        <span className={styles.rollers} aria-hidden="true" />
      </div>
    </figure>
  );
}

/** 03 — Status updates to the customer; each fills one more segment, the last asks for a rating. */
export function FollowUpUpdates({ data, exampleTag }: { data: Visuals["followUp"]; exampleTag: ReactNode }) {
  const steps = data.updates.length;
  return (
    <figure aria-label={data.label}>
      <Head title={data.sender} exampleTag={exampleTag} />
      <div className={styles.thread}>
        {data.updates.map((u, i) => (
          <div key={u.text} className={cn("reveal-child", styles.bubble, styles.in, styles.update)} style={order(i * 2)}>
            {u.text}
            <span className={styles.segments} aria-label={`${data.progress}: ${i + 1}/${steps}`} role="img">
              {data.updates.map((_, s) => (
                <i key={s} className={cn(s <= i && styles.filled)} />
              ))}
            </span>
            {i === steps - 1 && (
              <span className={styles.ratings}>
                {data.ratings.map((face, r) => (
                  <span key={face} className={cn(r === data.picked && styles.picked)} title={data.ratingLabels[r]}>
                    <span aria-hidden="true">{face}</span>
                    <span className="sr-only">{data.ratingLabels[r]}</span>
                  </span>
                ))}
              </span>
            )}
            <time>{u.time}</time>
          </div>
        ))}
      </div>
    </figure>
  );
}

/** 04 — Field technicians with status lights; a new request is assigned to the available one. */
export function FieldTeam({ data, exampleTag }: { data: Visuals["field"]; exampleTag: ReactNode }) {
  const assignee = data.technicians.findIndex((t) => t.status !== t.after);
  return (
    <figure aria-label={data.label}>
      <Head exampleTag={exampleTag} />
      <p className={styles.newOrder}>
        <Wrench aria-hidden="true" />
        {data.newOrder}
      </p>
      <ul className={styles.techs}>
        {data.technicians.map((t, i) => {
          const changes = i === assignee;
          return (
            <li key={t.name} className={cn(styles.tech, changes && styles.assignee)}>
              <span className={styles.techAvatar} aria-hidden="true">
                {t.name.charAt(0)}
              </span>
              <span className={styles.techInfo}>
                <b>{t.name}</b>
                <small>{t.skill}</small>
              </span>
              {changes ? (
                <span className={styles.statusSwap}>
                  {/* Before the assignment (visual only) → after it. */}
                  <span className={styles.before} aria-hidden="true">
                    <Led tone={statusTone[t.status]} />
                    {data.statuses[t.status]}
                  </span>
                  <span className={styles.after}>
                    <Led tone={statusTone[t.after]} />
                    {data.statuses[t.after]}
                  </span>
                </span>
              ) : (
                <span className={styles.status}>
                  <Led tone={statusTone[t.status]} />
                  {data.statuses[t.status]}
                </span>
              )}
              {changes && (
                <span className={styles.assigned}>
                  <Check aria-hidden="true" />
                  {data.assigned}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </figure>
  );
}

/** 05 — Maintenance contract: periodic visits, a reminder, renewal, and an extra-service offer. */
export function ContractCard({ data, exampleTag }: { data: Visuals["contracts"]; exampleTag: ReactNode }) {
  return (
    <figure aria-label={data.label}>
      <Head exampleTag={exampleTag} />
      <div className={styles.contract}>
        <div className={styles.contractHead}>
          <FileSignature aria-hidden="true" />
          <span>
            <b>{data.title}</b>
            <small>{data.client}</small>
          </span>
        </div>
        <p className={styles.visitsTitle}>{data.visitsTitle}</p>
        <ol className={styles.visits}>
          {data.visits.map((v, i) => (
            <li key={v} className={cn(i < data.done ? styles.done : styles.next)} style={order(i)}>
              <i aria-hidden="true">{i < data.done ? <Check /> : <CalendarClock />}</i>
              {v}
            </li>
          ))}
        </ol>
        <p className={cn("reveal-child", styles.reminder)} style={order(3)}>
          {data.reminder}
        </p>
        <span className={styles.renew}>{data.renew}</span>
      </div>
      <div className={cn("reveal-child", styles.offer)} style={order(5)}>
        <Sparkles aria-hidden="true" />
        <span>
          <small>{data.offerTag}</small>
          <b>{data.offer}</b>
        </span>
        <em>{data.offerCta}</em>
      </div>
    </figure>
  );
}

/** Lit LEDs per panel (out of 5) and wave shapes (periods divide 100, so the scroll loops) — never figures. */
const LIT = [4, 3, 4, 5];
const WAVES = [
  "M0 20 Q 12 6 25 20 T 50 20 T 75 20 T 100 20 T 125 20 T 150 20 T 175 20 T 200 20",
  "M0 22 L 20 22 L 28 8 L 36 30 L 44 22 L 70 22 L 78 8 L 86 30 L 94 22 L 120 22 L 128 8 L 136 30 L 144 22 L 170 22 L 178 8 L 186 30 L 194 22 L 200 22",
  "M0 26 L25 8 L25 26 L50 8 L50 26 L75 8 L75 26 L100 8 L100 26 L125 8 L125 26 L150 8 L150 26 L175 8 L175 26 L200 8",
  "M0 18 C 25 4, 25 4, 50 18 S 75 32, 100 18 S 125 4, 150 18 S 175 32, 200 18",
];

/** 06 — Control-room panels: a row of status lights and a small screen with a live wave. */
export function ControlRoom({ data, exampleTag }: { data: Visuals["reports"]; exampleTag: ReactNode }) {
  return (
    <figure aria-label={data.label}>
      <Head title={data.title} exampleTag={exampleTag} />
      <ul className={styles.panels}>
        {data.panels.map((panel, i) => (
          <li key={panel}>
            <span className={styles.lights} aria-hidden="true">
              {Array.from({ length: 5 }, (_, l) => (
                <Led key={l} tone={l < LIT[i] ? "green" : "off"} />
              ))}
            </span>
            <span className={styles.screen} aria-hidden="true">
              {/* Twice the screen's width; the wave scrolls by half of it, seamlessly. */}
              <svg viewBox="0 0 200 32" preserveAspectRatio="none">
                <path d={WAVES[i % WAVES.length]} style={order(i)} />
              </svg>
            </span>
            <b>{panel}</b>
          </li>
        ))}
      </ul>
    </figure>
  );
}
