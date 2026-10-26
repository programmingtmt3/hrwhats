import { CircleCheck, Droplets, Heart } from "lucide-react";
import type { CSSProperties } from "react";

import { SendIcon, VerifiedIcon } from "@/components/icons";
import phone from "@/components/sections/hero/ChatPhone.module.css";
import { cn } from "@/lib/utils";

import styles from "./DonorChat.module.css";

/** A message in the donor's WhatsApp chat (illustrative content from ar.json). */
export type DonorMessage =
  | { kind: "poster"; title: string; text: string; time: string }
  | { kind: "text"; text: string; button?: string; time: string }
  | { kind: "receipt"; title: string; rows: string[][]; time: string }
  | { kind: "update"; title: string; text: string; progress: number; time: string }
  | { kind: "reply"; text: string; time: string };

export type PhoneLabels = {
  label: string;
  name: string;
  status: string;
  inputPlaceholder: string;
  readReceipt: string;
};

function MessageContent({ message }: { message: DonorMessage }) {
  switch (message.kind) {
    case "poster":
      return (
        <>
          <span className={styles.poster} aria-hidden="true">
            <Droplets />
          </span>
          <b className={styles.title}>{message.title}</b>
          {message.text}
        </>
      );
    case "text":
    case "reply":
      return (
        <>
          {message.text}
          {message.kind === "text" && message.button && (
            <span className={phone.btns}>
              <span>{message.button}</span>
            </span>
          )}
        </>
      );
    case "receipt":
      return (
        <>
          <b className={cn(styles.title, styles.ok)}>
            <CircleCheck aria-hidden="true" />
            {message.title}
          </b>
          <dl className={styles.rows}>
            {message.rows.map(([term, value]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </>
      );
    case "update":
      return (
        <>
          <b className={styles.title}>{message.title}</b>
          {message.text}
          <span className={styles.progress} style={{ "--p": message.progress } as CSSProperties}>
            <i />
          </span>
        </>
      );
  }
}

/** Bubbles only (used inside the phone and, on small screens, inline under each stage). */
export function DonorMessages({ messages, readReceipt }: { messages: { key: string; message: DonorMessage }[]; readReceipt: string }) {
  return messages.map(({ key, message }) => {
    const out = message.kind === "reply";
    return (
      <div key={key} className={cn(phone.msg, out ? phone.out : phone.in, styles.msg)}>
        <MessageContent message={message} />
        <time>
          {message.time}
          {out ? readReceipt : ""}
        </time>
      </div>
    );
  });
}

/** The WhatsApp phone shell from the home hero, with the association as the sender. */
export function DonorPhone({
  messages,
  labels,
}: {
  messages: { key: string; message: DonorMessage }[];
  labels: PhoneLabels;
}) {
  return (
    <div className={cn(phone.phone, styles.phone)}>
      <div className={phone.screen}>
        <div className={phone.chatHead}>
          <div className={cn(phone.av, styles.av)}>
            <Heart aria-hidden="true" />
          </div>
          <div>
            <b>
              {labels.name} <VerifiedIcon className={phone.verified} />
            </b>
            <small>{labels.status}</small>
          </div>
        </div>
        <div className={phone.chatBody}>
          <DonorMessages messages={messages} readReceipt={labels.readReceipt} />
        </div>
        <div className={phone.chatInput}>
          <div>{labels.inputPlaceholder}</div>
          <b>
            <SendIcon />
          </b>
        </div>
      </div>
    </div>
  );
}
