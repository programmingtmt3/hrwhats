import { Check, Folder, Inbox, Megaphone, MessageCircle, Minus, Send, UsersRound, FileText } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { ExampleTag } from "../shared/ExampleTag";
import notebook from "./Notebook.module.css";
import styles from "./TabVisuals.module.css";

/*
 * Code-built mockups, one per tab. Each runs once, when its tab panel first
 * gets `.in-view` (see JourneyTabs). Items use `.reveal-child` so they stay
 * visible with JS off and appear at once with reduced motion.
 */

type Visuals = Dictionary["sectors"]["education"]["services"]["visuals"];

const order = (i: number) => ({ "--i": i }) as CSSProperties;

function Paper({ label, title, exampleTag, children }: { label: string; title?: string; exampleTag: string; children: ReactNode }) {
  return (
    <figure className={notebook.paper} aria-label={label}>
      <div className={notebook.paperHead}>
        <b>{title}</b>
        <ExampleTag>{exampleTag}</ExampleTag>
      </div>
      {children}
    </figure>
  );
}

/** 01 — Inquiries filed into three folders. */
export function FoldersVisual({ data, exampleTag }: { data: Visuals["inquiries"]; exampleTag: string }) {
  let n = 0;
  return (
    <Paper label={data.label} exampleTag={exampleTag}>
      <div className={styles.folders}>
        {data.folders.map((folder) => (
          <div key={folder.name} className={styles.folder}>
            <span className={styles.folderTab}>
              <Folder aria-hidden="true" />
              {folder.name}
            </span>
            <ul>
              {folder.messages.map((message) => (
                <li key={message.name} className="reveal-child" style={order(n++)}>
                  <b>{message.name}</b>
                  {message.text}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Paper>
  );
}

/** 02 — The registration form fills itself from the chat. */
export function AutoFormVisual({ data, exampleTag }: { data: Visuals["registration"]; exampleTag: string }) {
  return (
    <Paper label={data.label} exampleTag={exampleTag}>
      <div className={styles.autoForm}>
        <div className={styles.miniChat}>
          {data.chat.map((message, i) => (
            <p key={i} className={cn("reveal-child", styles.bubble, message.dir === "in" ? styles.in : styles.out)} style={order(i)}>
              {message.text}
            </p>
          ))}
        </div>
        <div className={styles.form}>
          <b className={styles.formTitle}>{data.formTitle}</b>
          {data.fields.map((field, i) => (
            <div key={field.label} className={styles.field}>
              <span>{field.label}</span>
              <span className={styles.input}>
                <span className={styles.value} style={order(i)}>
                  {field.value}
                </span>
              </span>
            </div>
          ))}
          <span className={cn("reveal-child", styles.done)} style={order(20)}>
            {data.done}
          </span>
        </div>
      </div>
    </Paper>
  );
}

// November 2026 starts on a Sunday (first column) and has 30 days.
const MONTH_DAYS = 30;
const FIRST_WEEKDAY = 0;

/** 03 — Campaign calendar: campaigns show up as appointments. */
export function CalendarVisual({ data, exampleTag }: { data: Visuals["campaigns"]; exampleTag: string }) {
  const cells = Array.from({ length: 35 }, (_, i) => i - FIRST_WEEKDAY + 1);
  const eventOn = (day: number) => data.events.findIndex((event) => event.day === day);

  return (
    <Paper label={data.label} title={data.month} exampleTag={exampleTag}>
      <div className={styles.calendar}>
        {data.weekdays.map((weekday) => (
          <span key={weekday} className={styles.weekday}>
            {weekday}
          </span>
        ))}
        {cells.map((day, i) => {
          const valid = day >= 1 && day <= MONTH_DAYS;
          const event = valid ? eventOn(day) : -1;
          return (
            <span key={i} className={cn(styles.day, !valid && styles.empty)}>
              {valid && <small>{day}</small>}
              {event >= 0 && (
                <span className={cn("reveal-child", styles.event, styles[`e${event + 1}`])} style={order(event)}>
                  {data.events[event].title}
                </span>
              )}
            </span>
          );
        })}
      </div>
      <ul className={styles.legend}>
        {data.events.map((event, i) => (
          <li key={event.day} className={styles[`e${i + 1}`]}>
            {event.title}
          </li>
        ))}
      </ul>
    </Paper>
  );
}

// Visual-only attendance pattern (1 = present, 0 = absent).
const ATTENDANCE = [
  [1, 1, 1, 1],
  [1, 1, 0, 1],
  [1, 1, 1, 1],
  [1, 0, 1, 1],
];

/** 04 — Automatic follow-up messages + an attendance sheet ticking itself. */
export function AttendanceVisual({ data, exampleTag }: { data: Visuals["followUp"]; exampleTag: string }) {
  const sessions = ATTENDANCE[0].length;
  return (
    <Paper label={data.label} title={data.sheetTitle} exampleTag={exampleTag}>
      <p className={styles.sentTitle}>{data.sentTitle}</p>
      <ul className={styles.sent}>
        {data.sent.map((item, i) => (
          <li key={item} className="reveal-child" style={order(i)}>
            <Send aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
      <table className={styles.sheet}>
        <thead>
          <tr>
            <th scope="col" />
            {Array.from({ length: sessions }, (_, s) => (
              <th key={s} scope="col">
                {data.sessionLabel} {s + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.students.map((student, r) => (
            <tr key={student}>
              <th scope="row">{student}</th>
              {ATTENDANCE[r % ATTENDANCE.length].map((present, s) => (
                <td key={s}>
                  <span className={cn("reveal-child", styles.mark, !present && styles.absent)} style={order(3 + s * 2 + r * 0.5)}>
                    {present ? <Check aria-hidden="true" /> : <Minus aria-hidden="true" />}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Paper>
  );
}

/** 05 — Incoming conversations dealt to the admission team in turn. */
export function TeamVisual({ data, exampleTag }: { data: Visuals["team"]; exampleTag: string }) {
  return (
    <Paper label={data.label} exampleTag={exampleTag}>
      <div className={styles.incoming} aria-hidden="true">
        <Inbox />
      </div>
      <div className={styles.members}>
        {data.members.map((member, m) => (
          <div key={member} className={styles.member}>
            <span className={styles.memberHead}>
              <i aria-hidden="true">{member.charAt(0)}</i>
              {member}
            </span>
            <ul>
              {data.incoming
                .map((chat, i) => ({ chat, i }))
                .filter(({ i }) => i % data.members.length === m)
                .map(({ chat, i }) => (
                  <li key={chat} className="reveal-child" style={order(i)}>
                    {chat}
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
      <div className={styles.speed}>
        <span>{data.speed}</span>
        <b aria-hidden="true">
          <i />
        </b>
      </div>
    </Paper>
  );
}

// Visual-only ring fill (percent of the circle); never shown as a number.
const RING_FILL = [78, 64, 86, 72];
const RING_ICONS = [FileText, Megaphone, MessageCircle, UsersRound];

/** 06 — Report indicators as rings, no figures. */
export function RingsVisual({ data, exampleTag }: { data: Visuals["reports"]; exampleTag: string }) {
  return (
    <Paper label={data.label} title={data.title} exampleTag={exampleTag}>
      <ul className={styles.rings}>
        {data.rings.map((ring, i) => {
          const Icon = RING_ICONS[i % RING_ICONS.length];
          return (
            <li key={ring}>
              <span className={styles.ring} style={{ ...order(i), "--fill": RING_FILL[i % RING_FILL.length] } as CSSProperties}>
                <svg viewBox="0 0 80 80" aria-hidden="true">
                  <circle cx="40" cy="40" r="32" pathLength={100} />
                  <circle cx="40" cy="40" r="32" pathLength={100} />
                </svg>
                <Icon aria-hidden="true" />
              </span>
              {ring}
            </li>
          );
        })}
      </ul>
    </Paper>
  );
}
