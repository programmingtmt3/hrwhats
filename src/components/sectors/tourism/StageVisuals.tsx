import { ArrowUp, BellRing, CalendarClock, ConciergeBell, HelpCircle, Link2, Star, Wrench } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { ExampleTag } from "../shared/ExampleTag";
import styles from "./StageVisuals.module.css";
import travel from "./Travel.module.css";

/*
 * Code-built mockups, one per stage. Start states apply only while a slide is
 * `.tour-armed` and not yet `.tour-played` (see JourneyCarousel), so each
 * plays once; without JS, or with reduced motion, the final state shows.
 */

type Visuals = Dictionary["sectors"]["tourism"]["journey"]["visuals"];

const order = (i: number) => ({ "--i": i }) as CSSProperties;

function Figure({ label, exampleTag, className, children }: { label: string; exampleTag: string; className?: string; children: ReactNode }) {
  return (
    <figure className={cn(styles.figure, className)} aria-label={label}>
      {children}
      <figcaption className={styles.caption}>
        <ExampleTag>{exampleTag}</ExampleTag>
      </figcaption>
    </figure>
  );
}

/** A drawn photo: 0 = sea view, 1 = suite, 2 = pool. */
function Scene({ kind }: { kind: number }) {
  return (
    <span className={cn(styles.scene, styles[`scene${kind + 1}`])} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

/** 1 — Before booking: an album of room photos + quick replies. */
export function BeforeBookingVisual({ data, exampleTag }: { data: Visuals["beforeBooking"]; exampleTag: string }) {
  return (
    <Figure label={data.label} exampleTag={exampleTag} className={styles.chatBg}>
      <div className={styles.bubble}>
        <div className={travel.sender}>
          <b>{data.sender}</b>
        </div>
        <p>{data.text}</p>
        {/* Photos are stacked; each fades in over the previous one, once. */}
        <div className={styles.album}>
          {data.photos.map((photo, i) => (
            <div key={photo} className={styles.photo} style={order(i)}>
              <Scene kind={i} />
              <span className={styles.photoCaption}>{photo}</span>
            </div>
          ))}
        </div>
      </div>
      <ul className={styles.quick}>
        {data.quickReplies.map((reply, i) => (
          <li key={reply} style={order(i)}>
            {reply}
          </li>
        ))}
      </ul>
    </Figure>
  );
}

/** 2 — Booking: the booking link, a confirmation stamp, the arrival reminder. */
export function BookingVisual({ data, exampleTag }: { data: Visuals["booking"]; exampleTag: string }) {
  return (
    <Figure label={data.label} exampleTag={exampleTag} className={styles.chatBg}>
      <div className={cn(styles.bubble, styles.step)} style={order(0)}>
        <p>{data.linkText}</p>
        <span className={styles.link}>
          <Link2 aria-hidden="true" />
          <span>
            <b>{data.linkTitle}</b>
            <small>{data.linkSub}</small>
          </span>
        </span>
        <span className={styles.stamp}>{data.stamp}</span>
      </div>
      <div className={cn(styles.bubble, styles.step, styles.reminder)} style={order(2)}>
        <b className={styles.reminderTitle}>
          <CalendarClock aria-hidden="true" />
          {data.reminderTitle}
        </b>
        <p>{data.reminderText}</p>
        <span className={styles.countdown}>{data.countdown}</span>
      </div>
    </Figure>
  );
}

const REQUEST_ICONS = [ConciergeBell, Wrench, HelpCircle];

/** 3 — During the stay: a door hanger listing room requests and their status. */
export function StayVisual({ data, exampleTag }: { data: Visuals["stay"]; exampleTag: string }) {
  const lastStatus = data.statuses.length - 1;
  return (
    <Figure label={data.label} exampleTag={exampleTag}>
      <p className={styles.sent}>
        <BellRing aria-hidden="true" />
        {data.sent}
      </p>
      <div className={styles.hanger}>
        <b className={styles.hangerTitle}>{data.title}</b>
        <ul>
          {data.requests.map((request, i) => {
            const Icon = REQUEST_ICONS[i % REQUEST_ICONS.length];
            return (
              <li key={request.type}>
                <Icon aria-hidden="true" />
                <span className={styles.request}>
                  <b>{request.type}</b>
                  <small>{request.text}</small>
                </span>
                {/* Status steps cross-fade in place; the last one stays. */}
                <span className={styles.status}>
                  {data.statuses.map((status, s) => (
                    <em
                      key={status}
                      className={cn(s === lastStatus && styles.final)}
                      aria-hidden={s === lastStatus ? undefined : true}
                      style={order(i * 0.4 + s)}
                    >
                      {status}
                    </em>
                  ))}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </Figure>
  );
}

/** 4 — After the stay: star rating, then a postcard with a seasonal offer. */
export function AfterStayVisual({ data, exampleTag }: { data: Visuals["afterStay"]; exampleTag: string }) {
  return (
    <Figure label={data.label} exampleTag={exampleTag}>
      <div className={styles.rating}>
        <b>{data.ratingTitle}</b>
        <span className={styles.stars} aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} style={order(i)} />
          ))}
        </span>
        <span className={styles.ratingReply}>{data.ratingReply}</span>
      </div>
      <div className={styles.postcard}>
        <div className={styles.postText}>
          <b>{data.greeting}</b>
          <p className={styles.offer}>{data.offer}</p>
          <p>{data.package}</p>
        </div>
        <div className={styles.postSide}>
          <span className={styles.postStamp} aria-hidden="true">
            <Scene kind={0} />
          </span>
          <span className={styles.postmark} aria-hidden="true" />
          <span className={styles.address}>{data.to}</span>
        </div>
      </div>
    </Figure>
  );
}

/** 5 — Backstage: the reception key rack (who handles which chat) + a departures-style report board. */
export function BackstageVisual({ data, exampleTag }: { data: Visuals["backstage"]; exampleTag: string }) {
  const perMember = data.staff[0]?.chats.length ?? 0;
  return (
    <Figure label={data.label} exampleTag={exampleTag}>
      <div className={styles.backstage}>
        <div className={styles.rack}>
          <b className={styles.rackTitle}>{data.rackTitle}</b>
          <div className={styles.slots}>
            {data.staff.map((member, m) => (
              <div key={member.name} className={styles.slotCol}>
                <span className={styles.hook}>{member.name}</span>
                <ul>
                  {member.chats.map((chat, c) => (
                    // Dealt in turn: one tag per member, then the next round.
                    <li key={chat} style={order(c * data.staff.length + m)}>
                      {chat}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.board}>
          <b className={styles.boardTitle}>{data.boardTitle}</b>
          <ul>
            {data.rows.map((row, i) => (
              <li key={row.label}>
                <span>{row.label}</span>
                <span className={styles.flap} style={order(i + perMember)}>
                  <ArrowUp aria-hidden="true" />
                  {row.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Figure>
  );
}
