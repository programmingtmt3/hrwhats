import { CalendarCheck, MapPin } from "lucide-react";
import type { CSSProperties } from "react";

import { SendIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

import { ExampleTag } from "../shared/ExampleTag";
import { BuildingSketch } from "./BuildingSketch";
import styles from "./PropertyChat.module.css";

/** A message in the hero chat (illustrative content from ar.json). */
export type ChatMessage =
  | { kind: "text"; dir: "in" | "out"; auto?: boolean; text: string; time: string }
  | {
      kind: "property";
      dir: "out";
      auto?: boolean;
      title: string;
      location: string;
      price: string;
      specs: string[];
      button: string;
      time: string;
    };

type ChatLabels = {
  label: string;
  contact: string;
  status: string;
  tag: string;
  autoReply: string;
  inputPlaceholder: string;
  readReceipt: string;
};

/*
 * WhatsApp-Web style conversation as the real-estate company sees it in the
 * platform. Messages appear one after another once, when the parent <Reveal>
 * enters the viewport (`.reveal-child`: visible with JS off or reduced motion).
 */
export function PropertyChat({
  messages,
  labels,
  exampleTag,
}: {
  messages: ChatMessage[];
  labels: ChatLabels;
  exampleTag: string;
}) {
  return (
    <figure className={styles.window} aria-label={labels.label}>
      <div className={styles.titleBar} aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className={styles.head}>
        <span className={styles.avatar} aria-hidden="true">
          {labels.contact.charAt(0)}
        </span>
        <span className={styles.who}>
          <b>{labels.contact}</b>
          <small>{labels.status}</small>
        </span>
        <span className={styles.tag}>{labels.tag}</span>
      </div>

      <div className={styles.body}>
        {messages.map((message, i) => (
          <div
            key={i}
            className={cn("reveal-child", styles.msg, styles[message.dir], message.kind === "property" && styles.rich)}
            style={{ "--i": i } as CSSProperties}
          >
            {message.auto && <span className={styles.auto}>{labels.autoReply}</span>}
            {message.kind === "property" ? (
              <>
                <span className={styles.sketch}>
                  <BuildingSketch />
                </span>
                <b className={styles.title}>{message.title}</b>
                <span className={styles.location}>
                  <MapPin aria-hidden="true" />
                  {message.location}
                </span>
                <b className={styles.price}>{message.price}</b>
                <span className={styles.specs}>
                  {message.specs.map((spec) => (
                    <span key={spec}>{spec}</span>
                  ))}
                </span>
                <span className={styles.button}>
                  <CalendarCheck aria-hidden="true" />
                  {message.button}
                </span>
              </>
            ) : (
              message.text
            )}
            <time>
              {message.time}
              {message.dir === "out" ? labels.readReceipt : ""}
            </time>
          </div>
        ))}
      </div>

      <div className={styles.input}>
        <span>{labels.inputPlaceholder}</span>
        <b aria-hidden="true">
          <SendIcon className="icon-forward" />
        </b>
      </div>
      <figcaption className={styles.caption}>
        <ExampleTag>{exampleTag}</ExampleTag>
      </figcaption>
    </figure>
  );
}
