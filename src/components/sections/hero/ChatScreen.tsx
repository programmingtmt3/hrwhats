"use client";

import { useEffect, useState, type ReactNode } from "react";

import { SendIcon, VerifiedIcon } from "@/components/icons";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { cn } from "@/lib/utils";

import styles from "./ChatPhone.module.css";

export type ChatMessage = {
  dir: "in" | "out";
  text: string;
  time: string;
  buttons?: string[];
};

type ChatScreenProps = {
  avatar: ReactNode;
  messages: ChatMessage[];
  labels: {
    name: string;
    online: string;
    typing: string;
    inputPlaceholder: string;
    readReceipt: string;
  };
};

type Shown = { key: string; message: ChatMessage };

// Timings from the design script.
const IN_DELAY = 900;
const TYPING_DELAY = 1300;
const AFTER_MESSAGE = 700;
const LOOP_PAUSE = 4000;

export function ChatScreen({ avatar, messages, labels }: ChatScreenProps) {
  const reduced = useReducedMotion();
  const [animated, setAnimated] = useState<Shown[]>([]);
  const [typing, setTyping] = useState(false);

  // Reduced motion: the whole conversation, no typing indicator, no loop.
  const shown = reduced
    ? messages.map((message, i) => ({ key: `static-${i}`, message }))
    : animated;

  useEffect(() => {
    if (reduced) return;

    let cancelled = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = setTimeout(() => {
          timers.delete(id);
          resolve();
        }, ms);
        timers.add(id);
      });

    (async () => {
      for (let loop = 0; !cancelled; loop++) {
        setAnimated([]);
        for (const [i, message] of messages.entries()) {
          if (message.dir === "out") {
            setTyping(true);
            await wait(TYPING_DELAY);
            if (cancelled) return;
            setTyping(false);
          } else {
            await wait(IN_DELAY);
            if (cancelled) return;
          }
          setAnimated((prev) => [...prev, { key: `${loop}-${i}`, message }]);
          await wait(AFTER_MESSAGE);
          if (cancelled) return;
        }
        await wait(LOOP_PAUSE);
      }
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      setTyping(false);
    };
  }, [messages, reduced]);

  return (
    <div className={styles.screen}>
      <div className={styles.chatHead}>
        <div className={styles.av}>{avatar}</div>
        <div>
          <b>
            {labels.name} <VerifiedIcon className={styles.verified} />
          </b>
          <small>{typing ? labels.typing : labels.online}</small>
        </div>
      </div>

      <div className={styles.chatBody}>
        {shown.map(({ key, message }) => (
          <div key={key} className={cn(styles.msg, styles[message.dir])}>
            {message.text}
            {message.buttons && (
              <span className={styles.btns}>
                {message.buttons.map((button) => (
                  <span key={button}>{button}</span>
                ))}
              </span>
            )}
            <time>
              {message.time}
              {message.dir === "out" ? labels.readReceipt : ""}
            </time>
          </div>
        ))}
        {typing && (
          <div className={styles.typing}>
            <i />
            <i />
            <i />
          </div>
        )}
      </div>

      <div className={styles.chatInput}>
        <div>{labels.inputPlaceholder}</div>
        <b>
          <SendIcon />
        </b>
      </div>
    </div>
  );
}
