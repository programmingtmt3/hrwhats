"use client";

import { Bot, RotateCw, UserRound } from "lucide-react";
import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import styles from "./FlipCards.module.css";

type Data = {
  hint: string;
  show: string;
  questionLabel: string;
  answerLabel: string;
  cards: { topic: string; question: string; answer: string }[];
};

/*
 * Employee FAQ as flip cards. Front: the employee's question as sent on
 * WhatsApp; back: the automatic reply. Clicking/tapping a card or its
 * "show reply" toggle button (aria-pressed, keyboard) flips it. Both faces stay
 * in the accessibility tree and share one grid cell, so the card never changes
 * height. With reduced motion the faces swap without rotating.
 */
export function FlipCards({ data, exampleTag }: { data: Data; exampleTag: ReactNode }) {
  const [flipped, setFlipped] = useState<boolean[]>(() => data.cards.map(() => false));
  const toggle = (i: number) => setFlipped((f) => f.map((v, j) => (j === i ? !v : v)));

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <p className={styles.hint}>{data.hint}</p>
        {exampleTag}
      </div>
      <ul className={styles.cards}>
        {data.cards.map((card, i) => (
          <li key={card.topic} className={cn(styles.card, flipped[i] && styles.flipped)}>
            {/* Pointer convenience; the button below is the keyboard control. */}
            <div className={styles.inner} onClick={() => toggle(i)}>
              <div className={cn(styles.face, styles.front)}>
                <span className={styles.topic}>{card.topic}</span>
                <span className={styles.who}>
                  <UserRound aria-hidden="true" />
                  {data.questionLabel}
                </span>
                <p className={cn(styles.bubble, styles.question)}>{card.question}</p>
              </div>
              <div className={cn(styles.face, styles.back)}>
                <span className={styles.topic}>{card.topic}</span>
                <span className={styles.who}>
                  <Bot aria-hidden="true" />
                  {data.answerLabel}
                </span>
                <p className={cn(styles.bubble, styles.answer)}>{card.answer}</p>
              </div>
            </div>
            <button type="button" aria-pressed={flipped[i]} className={styles.toggle} onClick={() => toggle(i)}>
              <RotateCw aria-hidden="true" />
              {data.show}
              <span className="sr-only"> — {card.topic}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
