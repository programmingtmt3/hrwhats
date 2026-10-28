import { Bike, Bot, Check, ChefHat, Coffee, CookingPot, FileText, MoonStar, PackageCheck, ReceiptText, UserRound } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { Rail, Steam, Ticket } from "./Kitchen";
import styles from "./Visuals.module.css";

/*
 * Server-rendered restaurant mockups, shown in the floor-plan panel (one at a
 * time on desktop, all listed on phones). Motion is CSS only and repeats
 * gently (steam, pulses) or not at all; reduced motion stills it.
 */

type Visuals = Dictionary["sectors"]["restaurants"]["visuals"];

function Head({ title, exampleTag }: { title?: ReactNode; exampleTag: ReactNode }) {
  return (
    <div className={styles.head}>
      <span className={styles.headTitle}>{title}</span>
      {exampleTag}
    </div>
  );
}

/** 1 — Order screen: WhatsApp orders gathered in one place. */
export function OrderScreen({ data, types, exampleTag }: { data: Visuals["screen"]; types: string[]; exampleTag: ReactNode }) {
  return (
    <figure aria-label={data.label}>
      <Head exampleTag={exampleTag} />
      <div className={styles.screen}>
        <p className={styles.screenTitle}>{data.title}</p>
        <ul>
          {data.orders.map((o, i) => (
            <li key={o.id}>
              <b dir="ltr">{o.id}</b>
              <span>
                <b>{o.name}</b>
                <small>{o.items}</small>
              </span>
              <em className={cn(o.type === 0 ? styles.delivery : styles.pickup)}>{types[o.type]}</em>
              {i === 0 && <span className={styles.fresh}>{data.fresh}</span>}
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}

/** 2 — Night-time auto-reply with the menu sent as a file. */
export function NightReply({ data, exampleTag }: { data: Visuals["faq"]; exampleTag: ReactNode }) {
  return (
    <figure aria-label={data.label}>
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
        <p className={cn(styles.bubble, styles.out)}>
          {data.question}
          <time>{data.time}</time>
        </p>
        <div className={cn(styles.bubble, styles.in)}>
          <span className={styles.bot}>
            <Bot aria-hidden="true" />
            {data.auto}
          </span>
          {data.answer}
          <span className={styles.file}>
            <FileText aria-hidden="true" />
            <span>
              <b>{data.menuFile}</b>
              <small>{data.menuMeta}</small>
            </span>
          </span>
          <time>{data.time}</time>
        </div>
      </div>
    </figure>
  );
}

/** 3 — Tickets on the kitchen rail, each with its order type and an automatic confirmation. */
export function RailTickets({ data, types, exampleTag }: { data: Visuals["rail"]; types: string[]; exampleTag: ReactNode }) {
  return (
    <figure aria-label={data.label}>
      <Head exampleTag={exampleTag} />
      <Rail className={styles.rail}>
        {data.tickets.map((t, i) => (
          <Ticket
            key={t.id}
            id={t.id}
            type={t.type}
            typeLabel={types[t.type]}
            items={t.items}
            time={t.time}
            style={{ rotate: `${(i - 1) * 1.5}deg` } as CSSProperties}
          />
        ))}
      </Rail>
      <p className={styles.confirm}>
        <Check aria-hidden="true" />
        {data.confirmed}
        <span>
          <ReceiptText aria-hidden="true" />
          {data.bill}
        </span>
      </p>
    </figure>
  );
}

const statusIcons = [CookingPot, PackageCheck, Bike, Check];

/** 4 — Order status from the kitchen to the door, with a steaming plate. */
export function DeliveryStatus({ data, exampleTag }: { data: Visuals["delivery"]; exampleTag: ReactNode }) {
  return (
    <figure aria-label={data.label}>
      <Head title={data.order} exampleTag={exampleTag} />
      <div className={styles.plateRow}>
        <span className={styles.plate} aria-hidden="true">
          <Steam className={styles.plateSteam} />
          <i />
        </span>
        <ol className={styles.statuses}>
          {data.statuses.map((s, i) => {
            const Icon = statusIcons[i];
            return (
              <li key={s} className={cn(i < data.current && styles.done, i === data.current && styles.current)}>
                <i aria-hidden="true">
                  <Icon />
                </i>
                {s}
              </li>
            );
          })}
        </ol>
      </div>
      <p className={cn(styles.bubble, styles.in, styles.note)}>{data.message}</p>
    </figure>
  );
}

/** 5 — Digital loyalty card (cup stamps) and a follow-up after the visit. */
export function LoyaltyCard({ data, exampleTag }: { data: Visuals["loyalty"]; exampleTag: ReactNode }) {
  return (
    <figure aria-label={data.label}>
      <Head exampleTag={exampleTag} />
      <div className={styles.loyalty}>
        <p className={styles.loyaltyHead}>
          <b>{data.title}</b>
          <span>
            <UserRound aria-hidden="true" />
            {data.customer}
          </span>
        </p>
        <ul className={styles.stamps} aria-hidden="true">
          {Array.from({ length: data.stamps }, (_, i) => (
            <li key={i} className={cn(i < data.filled && styles.stamped, i === data.stamps - 1 && styles.free)}>
              <Coffee />
            </li>
          ))}
        </ul>
        <p className={styles.reward}>{data.reward}</p>
      </div>
      <div className={cn(styles.bubble, styles.in, styles.note)}>
        {data.followUp}
        <span className={styles.replies}>
          {data.replies.map((r) => (
            <span key={r}>{r}</span>
          ))}
        </span>
      </div>
    </figure>
  );
}

const roleIcons = [ReceiptText, ChefHat, Bike];

/** 6 — A new order split into tasks for the cashier, the kitchen and delivery. */
export function TeamSplit({ data, exampleTag }: { data: Visuals["team"]; exampleTag: ReactNode }) {
  return (
    <figure aria-label={data.label}>
      <Head exampleTag={exampleTag} />
      <p className={styles.incoming}>{data.incoming}</p>
      <ul className={styles.roles}>
        {data.roles.map((r, i) => {
          const Icon = roleIcons[i];
          return (
            <li key={r.role}>
              <i aria-hidden="true">
                <Icon />
              </i>
              <b>{r.role}</b>
              <span>{r.person}</span>
              <small>{r.task}</small>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}

/** 7 — Peak hours around a day dial (shades only, no figures). */
export function PeakClock({ data, exampleTag }: { data: Visuals["peak"]; exampleTag: ReactNode }) {
  const share = 360 / data.slots.length;
  return (
    <figure aria-label={data.label}>
      <Head title={data.title} exampleTag={exampleTag} />
      <div className={styles.peak}>
        <span
          className={styles.dial}
          aria-hidden="true"
          style={
            {
              "--l0": data.levels[0],
              "--l1": data.levels[1],
              "--l2": data.levels[2],
              "--l3": data.levels[3],
              "--l4": data.levels[4],
              "--share": `${share}deg`,
            } as CSSProperties
          }
        >
          <i />
        </span>
        <ul className={styles.slots}>
          {data.slots.map((slot, i) => (
            <li key={slot} style={{ "--level": data.levels[i] } as CSSProperties}>
              <span className={styles.swatch} aria-hidden="true" />
              {slot}
              <small>{data.legend[data.levels[i]]}</small>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}
