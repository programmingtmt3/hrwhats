import { Bot, Check, CheckCheck, FileDown, Megaphone, MoonStar, Thermometer } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import { format, type Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { clientClass, TeamCursor } from "./TeamCursor";
import styles from "./Visuals.module.css";

/*
 * Server-rendered artboard mockups. Each animates once when its artboard
 * (<Reveal>) gets `.in-view`; items use `.reveal-child` so they stay visible
 * with JS off and appear at once with reduced motion.
 */

type Visuals = Dictionary["sectors"]["advertising"]["services"]["visuals"];

const order = (i: number) => ({ "--i": i }) as CSSProperties;

function Head({ title, exampleTag }: { title?: ReactNode; exampleTag: ReactNode }) {
  return (
    <div className={styles.head}>
      <span className={styles.headTitle}>{title}</span>
      {exampleTag}
    </div>
  );
}

/** 01 — One inbox for every client: each chat carries its client's color and name. */
export function UnifiedInbox({ data, clients, exampleTag }: { data: Visuals["inbox"]; clients: string[]; exampleTag: ReactNode }) {
  return (
    <figure aria-label={data.label}>
      <Head title={data.title} exampleTag={exampleTag} />
      <ul className={styles.legend} aria-hidden="true">
        {clients.map((client, i) => (
          <li key={client} className={clientClass(i)}>
            <i />
            {client}
          </li>
        ))}
      </ul>
      <ul className={styles.inbox}>
        {data.messages.map((m, i) => (
          <li key={m.name} className={cn("reveal-child", styles.chat, clientClass(m.client))} style={order(i)}>
            <span className={styles.avatar} aria-hidden="true">
              {m.name.charAt(0)}
            </span>
            <span className={styles.chatText}>
              <b>{m.name}</b>
              {m.text}
            </span>
            <span className={styles.chatTags}>
              <em>{clients[m.client]}</em>
              <small>{m.kind}</small>
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/** 02 — Auto-reply at night: a numbered services menu, the customer's choice, a package card. */
export function AutoReplyMenu({ data, exampleTag }: { data: Visuals["autoReplies"]; exampleTag: ReactNode }) {
  const bot = (
    <span className={styles.bot}>
      <Bot aria-hidden="true" />
      {data.auto}
    </span>
  );
  return (
    <figure aria-label={data.label}>
      <Head
        title={
          <>
            <span className={styles.sender}>{data.sender}</span>
            <span className={styles.always}>
              <MoonStar aria-hidden="true" />
              {data.always}
            </span>
          </>
        }
        exampleTag={exampleTag}
      />
      <div className={styles.thread}>
        <p className={cn("reveal-child", styles.bubble, styles.in)} style={order(0)}>
          {data.customer}
          <time>{data.customerTime}</time>
        </p>
        <div className={cn("reveal-child", styles.bubble, styles.out)} style={order(2)}>
          {bot}
          {data.menu}
          <ol className={styles.menu}>
            {data.options.map((option, i) => (
              <li key={option}>
                <b>{i + 1}</b>
                {option}
              </li>
            ))}
          </ol>
          <time>
            {data.botTime}
            <CheckCheck aria-hidden="true" />
          </time>
        </div>
        <p className={cn("reveal-child", styles.bubble, styles.in, styles.digit)} style={order(4)}>
          {data.answer}
          <time>{data.customerTime}</time>
        </p>
        <div className={cn("reveal-child", styles.bubble, styles.out)} style={order(6)}>
          {bot}
          {data.reply}
          <span className={styles.package}>
            <Megaphone aria-hidden="true" />
            <span>
              <b>{data.package.name}</b>
              <small>{data.package.detail}</small>
              <em>{data.package.period}</em>
            </span>
          </span>
          <span className={styles.contact}>{data.contact}</span>
          <time>
            {data.botTime}
            <CheckCheck aria-hidden="true" />
          </time>
        </div>
      </div>
    </figure>
  );
}

/** 04 — Lead temperature: the mercury rises and each lead climbs to its level. */
export function LeadThermometer({ data, exampleTag }: { data: Visuals["leads"]; exampleTag: ReactNode }) {
  const top = data.levels.length - 1;
  return (
    <figure aria-label={data.label}>
      <Head exampleTag={exampleTag} />
      <div className={styles.leads}>
        <div className={styles.gauge}>
          <span className={styles.tube} aria-hidden="true">
            <i />
          </span>
          <Thermometer className={styles.gaugeIcon} aria-hidden="true" />
          <ol className={styles.levels}>
            {[...data.levels].reverse().map((level, r) => {
              const index = top - r;
              const lead = data.leads.find((l) => l.level === index);
              return (
                <li key={level} className={styles[`level${index}`]}>
                  <span className={styles.levelName}>{level}</span>
                  {lead && (
                    <span className={styles.lead} style={{ "--climb": index } as CSSProperties}>
                      <b>{lead.name}</b>
                      <small>{lead.interest}</small>
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        <div className={styles.capture}>
          <p className={styles.captureTitle}>{data.captureTitle}</p>
          <dl>
            {data.fields.map((field, i) => (
              <div key={field.label} className="reveal-child" style={order(i + 2)}>
                <dt>{field.label}</dt>
                <dd>
                  {field.value}
                  <Check aria-hidden="true" />
                </dd>
              </div>
            ))}
          </dl>
          <p className={cn("reveal-child", styles.followUp)} style={order(6)}>
            {data.followUp}
          </p>
        </div>
      </div>
    </figure>
  );
}

/** Relative reply speed per teammate (bar width only). */
const SPEED = [0.9, 0.78, 0.84];

/** 05 — Teammates' cursors working on different client accounts + relative reply speed. */
export function TeamAccounts({
  data,
  clients,
  team,
  exampleTag,
}: {
  data: Visuals["team"];
  clients: string[];
  team: string[];
  exampleTag: ReactNode;
}) {
  return (
    <figure aria-label={data.label}>
      <Head title={<span className={styles.multi}>{data.badge}</span>} exampleTag={exampleTag} />
      <ul className={styles.accounts}>
        {clients.map((client, i) => (
          <li key={client} className={cn(styles.account, clientClass(i))}>
            <span className={styles.accountHead}>
              <i aria-hidden="true">{client.charAt(0)}</i>
              {client}
            </span>
            <span className={styles.skeleton} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <small>{format(data.owner, { name: team[i] })}</small>
            <TeamCursor name={team[i]} tone={i} className={cn(styles.workCursor, styles[`work${i}`])} />
          </li>
        ))}
      </ul>
      <p className={styles.speedTitle}>{data.speedTitle}</p>
      <ul className={styles.speed}>
        {team.slice(0, 3).map((name, i) => (
          <li key={name}>
            <span>{name}</span>
            <span className={styles.bar} aria-hidden="true">
              <i style={{ "--w": SPEED[i] } as CSSProperties} />
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/** Sparkline shapes (relative only, no figures), in a 100×32 box. */
const SPARKS = [
  "0,26 14,22 28,24 42,16 56,18 70,10 84,12 100,4",
  "0,20 14,24 28,16 42,18 56,12 70,14 84,8 100,6",
  "0,28 14,26 28,20 42,22 56,14 70,12 84,6 100,8",
  "0,22 14,18 28,20 42,12 56,14 70,8 84,10 100,3",
];

/** 06 — White-label monthly report under the client's name, with a (non-interactive) PDF export. */
export function WhiteLabelReport({ data, client, exampleTag }: { data: Visuals["reports"]; client: string; exampleTag: ReactNode }) {
  return (
    <figure aria-label={data.label} className={clientClass(0)}>
      <Head exampleTag={exampleTag} />
      <div className={styles.report}>
        <div className={styles.reportHead}>
          <span className={styles.logo} aria-hidden="true">
            {client.charAt(0)}
          </span>
          <span>
            <b>{data.title}</b>
            <small>
              {client} · {data.preparedBy}
            </small>
          </span>
        </div>
        <ul className={styles.sparks}>
          {data.cards.map((card, i) => (
            <li key={card}>
              <small>{card}</small>
              <svg viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
                <polyline points={SPARKS[i % SPARKS.length]} pathLength={1} style={order(i)} />
              </svg>
            </li>
          ))}
        </ul>
        <span className={styles.export}>
          <FileDown aria-hidden="true" />
          {data.export}
        </span>
      </div>
    </figure>
  );
}
