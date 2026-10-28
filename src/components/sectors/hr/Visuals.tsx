import { Bot, Check, CheckCheck, FileText, MoonStar, Paperclip, UserRoundCheck } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import styles from "./Visuals.module.css";

/*
 * Server-rendered workplace mockups. Each animates once when its parent
 * <Reveal> gets `.in-view`; items use `.reveal-child` so they stay visible with
 * JS off and appear at once with reduced motion.
 */

type Visuals = Dictionary["sectors"]["hr"]["journey"]["visuals"];

const order = (i: number) => ({ "--i": i }) as CSSProperties;

function Head({ title, exampleTag }: { title?: ReactNode; exampleTag: ReactNode }) {
  return (
    <div className={styles.head}>
      <span className={styles.headTitle}>{title}</span>
      {exampleTag}
    </div>
  );
}

/** Recruiting — a CV is scanned and its highlighted fields fill a candidate card. */
export function CvExtract({ data, exampleTag }: { data: Visuals["cv"]; exampleTag: ReactNode }) {
  return (
    <figure className={styles.card} aria-label={data.label}>
      <Head
        title={
          <>
            <Paperclip aria-hidden="true" />
            {data.file}
            <small>{data.received}</small>
          </>
        }
        exampleTag={exampleTag}
      />
      <div className={styles.cv}>
        {/* The document (a drawing: its content is repeated in the card). */}
        <div className={styles.doc} aria-hidden="true">
          <span className={styles.scan} />
          <span className={styles.docHead}>
            <i className={styles.docPhoto} />
            <span>
              <mark style={order(0)}>{data.fields[0].value}</mark>
              <mark style={order(1)}>{data.fields[1].value}</mark>
            </span>
          </span>
          <i className={styles.line} />
          <i className={cn(styles.line, styles.short)} />
          <mark style={order(2)}>{data.fields[2].value}</mark>
          <i className={styles.line} />
          <i className={cn(styles.line, styles.short)} />
          <mark style={order(3)}>{data.fields[3].value}</mark>
          <i className={styles.line} />
        </div>

        <div className={styles.candidate}>
          <p className={styles.candidateTitle}>
            <UserRoundCheck aria-hidden="true" />
            {data.cardTitle}
          </p>
          <small className={styles.position}>{data.position}</small>
          <dl>
            {data.fields.map((field, i) => (
              <div key={field.label} className="reveal-child" style={order(i + 2)}>
                <dt>{field.label}</dt>
                <dd>{field.value}</dd>
              </div>
            ))}
          </dl>
          <p className={cn("reveal-child", styles.status)} style={order(7)}>
            <Check aria-hidden="true" />
            {data.status}
          </p>
        </div>
      </div>
    </figure>
  );
}

/** Automation — the assistant answers at night with the right procedure, step by step. */
export function AutoGuide({ data, exampleTag }: { data: Visuals["guide"]; exampleTag: ReactNode }) {
  return (
    <figure className={styles.card} aria-label={data.label}>
      <Head
        title={
          <>
            {data.sender}
            <span className={styles.always}>
              <MoonStar aria-hidden="true" />
              {data.always}
            </span>
          </>
        }
        exampleTag={exampleTag}
      />
      <div className={styles.thread}>
        <p className={cn("reveal-child", styles.bubble, styles.out)} style={order(0)}>
          {data.question}
          <time>
            {data.time}
            <CheckCheck aria-hidden="true" />
          </time>
        </p>
        <div className={cn("reveal-child", styles.bubble, styles.in)} style={order(2)}>
          <span className={styles.bot}>
            <Bot aria-hidden="true" />
            {data.auto}
          </span>
          {data.intro}
          <ol className={styles.steps}>
            {data.steps.map((step, i) => (
              <li key={step} className="reveal-child" style={order(i + 3)}>
                <b>{i + 1}</b>
                {step}
              </li>
            ))}
          </ol>
          <span className={styles.formBtn}>
            <FileText aria-hidden="true" />
            {data.button}
          </span>
          <time>{data.time}</time>
        </div>
      </div>
    </figure>
  );
}

/** Hand-drawn signature strokes (one per approval box after the first). */
const SIGNATURES = [
  "M4 30 C 14 6, 24 6, 20 28 S 38 40, 46 18 S 58 6, 68 26 S 86 32, 96 12",
  "M4 24 C 12 6, 20 36, 30 18 S 46 4, 52 24 C 56 36, 66 8, 74 20 S 88 32, 96 14",
];

/** Requests — a routing slip: each approval box is signed in turn, then "approved". */
export function RoutingSlip({ data, exampleTag }: { data: Visuals["slip"]; exampleTag: ReactNode }) {
  return (
    <figure className={cn(styles.card, styles.paper)} aria-label={data.label}>
      <Head
        title={
          <>
            {data.title}
            <small dir="ltr">{data.number}</small>
          </>
        }
        exampleTag={exampleTag}
      />
      <dl className={styles.slipFields}>
        {data.fields.map((field) => (
          <div key={field.label}>
            <dt>{field.label}</dt>
            <dd>{field.value}</dd>
          </div>
        ))}
      </dl>
      <ol className={styles.boxes}>
        {data.steps.map((step, i) => (
          <li key={step.title} style={order(i)}>
            <b>{step.title}</b>
            <span className={styles.sign} aria-hidden="true">
              {i === 0 ? (
                <Check className={styles.tick} />
              ) : (
                <svg viewBox="0 0 100 40" preserveAspectRatio="none">
                  <path d={SIGNATURES[(i - 1) % SIGNATURES.length]} pathLength={1} />
                </svg>
              )}
            </span>
            <small>{step.by}</small>
          </li>
        ))}
      </ol>
      <p className={styles.approved}>
        <span>{data.approved}</span>
        {data.done}
      </p>
    </figure>
  );
}

/** Internal communication — an official memo sent on WhatsApp; read receipts turn blue. */
export function Memo({ data, exampleTag }: { data: Visuals["memo"]; exampleTag: ReactNode }) {
  return (
    <figure className={styles.card} aria-label={data.label}>
      <Head exampleTag={exampleTag} />
      <div className={styles.memo}>
        <div className={styles.letterhead}>
          <span className={styles.orgMark} aria-hidden="true">
            {data.org.charAt(0)}
          </span>
          <span>
            <b>{data.org}</b>
            <small>{data.dept}</small>
          </span>
          <span className={styles.memoMeta}>
            <small>{data.number}</small>
            <small>{data.date}</small>
          </span>
        </div>
        <p className={styles.memoKind}>{data.kind}</p>
        <p className={styles.subject}>{data.subject}</p>
        <p className={styles.body}>{data.body}</p>
        <p className={styles.memoSign}>{data.sign}</p>
      </div>
      <p className={styles.recipientsTitle}>{data.recipientsTitle}</p>
      <ul className={styles.recipients}>
        {data.recipients.map((r, i) => (
          <li key={r.name} className={cn(r.read && styles.read)} style={order(i)}>
            {r.name}
            <span>
              <CheckCheck aria-hidden="true" />
              {r.read ? data.read : data.delivered}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/** Team — a small org chart; incoming chats drop down the lines to the right specialist. */
export function OrgChart({ data, exampleTag }: { data: Visuals["org"]; exampleTag: ReactNode }) {
  return (
    <figure className={styles.card} aria-label={data.label}>
      <Head exampleTag={exampleTag} />
      <div className={styles.org}>
        <div className={cn(styles.node, styles.manager)}>
          <span className={styles.nodeAvatar} aria-hidden="true">
            {data.manager.name.charAt(0)}
          </span>
          <b>{data.manager.name}</b>
          <small>{data.manager.role}</small>
        </div>
        <ul className={styles.members}>
          {data.members.map((m, i) => (
            <li key={m.name} style={order(i)}>
              <span className={styles.drop}>{m.topic}</span>
              <div className={styles.node}>
                <span className={styles.nodeAvatar} aria-hidden="true">
                  {m.name.charAt(0)}
                </span>
                <b>{m.name}</b>
                <small>{m.role}</small>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}

/** Relative levels for the gauges (needle angle only, never a figure). */
const LEVELS = [0.78, 0.66, 0.84];

/** Reports — three half-circle gauges with needles, no figures. */
export function Gauges({ data, exampleTag }: { data: Visuals["gauges"]; exampleTag: ReactNode }) {
  return (
    <figure className={styles.card} aria-label={data.label}>
      <Head title={data.title} exampleTag={exampleTag} />
      <ul className={styles.gauges}>
        {data.items.map((item, i) => (
          <li key={item} style={{ "--level": LEVELS[i % LEVELS.length], "--i": i } as CSSProperties}>
            <svg viewBox="0 0 120 68" aria-hidden="true">
              <path className={styles.track} d="M10 60 A 50 50 0 0 1 110 60" />
              <path className={styles.fill} d="M10 60 A 50 50 0 0 1 110 60" pathLength={1} />
              <g className={styles.needle}>
                <line x1="60" y1="60" x2="60" y2="20" />
                <circle cx="60" cy="60" r="5" />
              </g>
            </svg>
            <span className={styles.scale} aria-hidden="true">
              <small>{data.low}</small>
              <small>{data.high}</small>
            </span>
            <b>{item}</b>
          </li>
        ))}
      </ul>
    </figure>
  );
}
