import { Bot, Check, CheckCheck, KeyRound, Megaphone, MessageCircle, SprayCan, Store, Truck } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import styles from "./Visuals.module.css";

/*
 * Server-rendered shop mockups (each stands on a shelf). Items use
 * `.reveal-child` so they appear in order when the shelf is first seen, stay
 * visible with JS off and show at once with reduced motion.
 */

type Visuals = Dictionary["sectors"]["shops"]["services"]["visuals"];

const order = (i: number) => ({ "--i": i }) as CSSProperties;

function Head({ title, exampleTag }: { title?: ReactNode; exampleTag: ReactNode }) {
  return (
    <div className={styles.head}>
      <span className={styles.headTitle}>{title}</span>
      {exampleTag}
    </div>
  );
}

/** Swatch colors, in the order of the dictionary's colors. */
const swatches = [styles.black, styles.olive, styles.white];

/** 1 — Shelf card: sizes with availability dots, colors, and a quick answer. */
export function ShelfCard({ data, price, exampleTag }: { data: Visuals["shelf"]; price: string; exampleTag: ReactNode }) {
  return (
    <figure aria-label={data.label}>
      <Head exampleTag={exampleTag} />
      <div className={styles.shelfCard}>
        <p className={styles.shelfTitle}>
          <b>{data.product}</b>
          <span className={styles.tagPrice}>{price}</span>
        </p>
        <p className={styles.rowLabel}>{data.sizesLabel}</p>
        <ul className={styles.sizes}>
          {data.sizes.map((size, i) => (
            <li key={size} className={cn(!data.available[i] && styles.out)}>
              <b dir="ltr">{size}</b>
              <i aria-hidden="true" />
              {!data.available[i] && <small>{data.soldOut}</small>}
            </li>
          ))}
        </ul>
        <p className={styles.rowLabel}>{data.colorsLabel}</p>
        <ul className={styles.colors}>
          {data.colors.map((color, i) => (
            <li key={color}>
              <i className={swatches[i]} aria-hidden="true" />
              {color}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.thread}>
        <p className={cn("reveal-child", styles.bubble, styles.in)} style={order(1)}>
          {data.question}
        </p>
        <p className={cn("reveal-child", styles.bubble, styles.out)} style={order(3)}>
          {data.answer}
        </p>
      </div>
    </figure>
  );
}

/** 2 — Auto-reply with a product sheet and similar products. */
export function ProductSheet({ data, money, exampleTag }: { data: Visuals["sheet"]; money: (n: number) => string; exampleTag: ReactNode }) {
  return (
    <figure aria-label={data.label}>
      <Head exampleTag={exampleTag} />
      <div className={styles.thread}>
        <p className={cn("reveal-child", styles.bubble, styles.in)} style={order(0)}>
          {data.ask}
          <time>{data.time}</time>
        </p>
        <div className={cn("reveal-child", styles.bubble, styles.out, styles.wide)} style={order(2)}>
          <span className={styles.bot}>
            <Bot aria-hidden="true" />
            {data.auto}
          </span>
          {data.intro}
          <span className={styles.sheet}>
            <span className={styles.bottle} aria-hidden="true">
              <i />
            </span>
            <span>
              <b>{data.product}</b>
              <small>{data.size}</small>
              <b className={styles.green}>{money(data.price)}</b>
            </span>
          </span>
          <small className={styles.similarTitle}>{data.similarTitle}</small>
          <span className={styles.similar}>
            {data.similar.map((s) => (
              <span key={s.name} className={styles.miniTag}>
                <SprayCan aria-hidden="true" />
                {s.name}
                <b>{money(s.price)}</b>
              </span>
            ))}
          </span>
          <time>{data.time}</time>
        </div>
      </div>
    </figure>
  );
}

const optionIcons = [Store, Truck];

/** 3 — Pickup from the branch (chosen) vs delivery, then the confirmation with a pickup code. */
export function PickupOrder({ data, price, exampleTag }: { data: Visuals["orders"]; price: string; exampleTag: ReactNode }) {
  return (
    <figure aria-label={data.label}>
      <Head exampleTag={exampleTag} />
      <p className={styles.item}>
        {data.item}
        <b>{price}</b>
      </p>
      <ul className={styles.options}>
        {data.options.map((option, i) => {
          const Icon = optionIcons[i];
          return (
            <li key={option} className={cn(i === data.picked && styles.picked)}>
              <Icon aria-hidden="true" />
              {option}
              {i === data.picked && <Check className={styles.pickedMark} aria-hidden="true" />}
            </li>
          );
        })}
      </ul>
      <div className={cn("reveal-child", styles.confirm)} style={order(2)}>
        <p>{data.confirm}</p>
        <p className={styles.code}>
          <KeyRound aria-hidden="true" />
          {data.codeLabel}
          <b dir="ltr">{data.code}</b>
        </p>
      </div>
    </figure>
  );
}

/** 4 — Seasonal offer on the shop window, and the same offer as a broadcast. */
export function WindowOffer({ data, exampleTag }: { data: Visuals["window"]; exampleTag: ReactNode }) {
  return (
    <figure aria-label={data.label}>
      <Head exampleTag={exampleTag} />
      <div className={styles.window}>
        <span className={styles.glare} aria-hidden="true" />
        {data.decals.map((decal, i) => (
          <span key={decal} className={cn(styles.decal, i === 1 && styles.decalBig)}>
            {decal}
          </span>
        ))}
      </div>
      <div className={cn("reveal-child", styles.bubble, styles.out, styles.broadcast)} style={order(2)}>
        <small>
          <Megaphone aria-hidden="true" />
          {data.sentTo}
        </small>
        {data.broadcast}
        <time>{data.time}</time>
      </div>
    </figure>
  );
}

/** 5 — After-sale follow-up, then a returning customer welcomed back. */
export function CareFollowUp({ data, exampleTag }: { data: Visuals["care"]; exampleTag: ReactNode }) {
  return (
    <figure aria-label={data.label}>
      <Head exampleTag={exampleTag} />
      <div className={styles.thread}>
        <p className={cn("reveal-child", styles.bubble, styles.out)} style={order(0)}>
          {data.followUp}
          <time>{data.followUpTime}</time>
        </p>
        <p className={cn("reveal-child", styles.bubble, styles.in)} style={order(2)}>
          {data.reply}
          <time>{data.replyTime}</time>
        </p>
        <p className={cn("reveal-child", styles.later)} style={order(3)}>
          {data.later}
        </p>
        <p className={cn("reveal-child", styles.bubble, styles.out)} style={order(4)}>
          {data.welcomeBack}
          <time>
            {data.welcomeTime}
            <CheckCheck aria-hidden="true" />
          </time>
        </p>
      </div>
    </figure>
  );
}

const laneIcons = [Store, MessageCircle];

/** 6 — Sales team inside the shop and on WhatsApp, each with their current conversation. */
export function SalesTeam({ data, exampleTag }: { data: Visuals["team"]; exampleTag: ReactNode }) {
  return (
    <figure aria-label={data.label}>
      <Head exampleTag={exampleTag} />
      <div className={styles.lanes}>
        {data.lanes.map((lane, l) => {
          const Icon = laneIcons[l];
          return (
            <div key={lane.title} className={styles.lane}>
              <p className={styles.laneTitle}>
                <Icon aria-hidden="true" />
                {lane.title}
              </p>
              <ul>
                {lane.staff.map((s, i) => (
                  <li key={s.name} className="reveal-child" style={order(l * 2 + i)}>
                    <span className={styles.avatar} aria-hidden="true">
                      {s.name.charAt(0)}
                    </span>
                    <span>
                      <b>{s.name}</b>
                      <small>{s.task}</small>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </figure>
  );
}

/** 7 — Most requested products as stacks of boxes on a shelf (heights only, no figures). */
export function Bestsellers({ data, exampleTag }: { data: Visuals["bestsellers"]; exampleTag: ReactNode }) {
  return (
    <figure aria-label={data.label}>
      <Head title={data.title} exampleTag={exampleTag} />
      <ul className={styles.stacks}>
        {data.items.map((item, i) => (
          <li key={item}>
            <span className={styles.stack} aria-hidden="true">
              {Array.from({ length: data.levels[i] }, (_, b) => (
                <i key={b} style={order(b)} />
              ))}
            </span>
            <b>{item}</b>
          </li>
        ))}
      </ul>
    </figure>
  );
}
