"use client";

import { useEffect, useRef, useState } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

import { DonorMessages, DonorPhone, type DonorMessage, type PhoneLabels } from "./DonorChat";
import styles from "./DonorJourney.module.css";
import { ExampleTag } from "../shared/ExampleTag";
import { FeatureItem, type Feature } from "../shared/FeatureItem";

type JourneyStepsProps = {
  stages: { title: string; features: Feature[] }[];
  stageLabel: string;
  /** One list of chat messages per stage. */
  messages: DonorMessage[][];
  phoneLabels: PhoneLabels;
  exampleTag: string;
};

const keyed = (messages: DonorMessage[], stage: number) =>
  messages.map((message, i) => ({ key: `${stage}-${i}`, message }));

/*
 * Desktop: the stages scroll past a sticky phone; the stage crossing the middle
 * of the viewport is "active", and the phone shows every message up to it.
 * Small screens: no phone — each stage shows its own messages inline.
 */
export function JourneySteps({ stages, stageLabel, messages, phoneLabels, exampleTag }: JourneyStepsProps) {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.stage));
        }),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    stepRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const shown = messages.slice(0, active + 1).flatMap(keyed);

  return (
    <div className={styles.layout}>
      <ol className={styles.steps}>
        {stages.map((stage, i) => (
          <li
            key={stage.title}
            ref={(el) => {
              stepRefs.current[i] = el;
            }}
            data-stage={i}
            className={cn(styles.step, i <= active && styles.reached, i === active && styles.current)}
          >
            <span className={styles.marker} aria-hidden="true">
              {i + 1}
            </span>
            <Reveal className={styles.stepBody}>
              <span className={styles.stepLabel}>
                {stageLabel} {i + 1}
              </span>
              <h3>{stage.title}</h3>
              <div className={styles.inlineChat} aria-label={phoneLabels.label} role="group">
                <DonorMessages messages={keyed(messages[i] ?? [], i)} readReceipt={phoneLabels.readReceipt} />
                {i === 0 && <ExampleTag className={styles.inlineTag}>{exampleTag}</ExampleTag>}
              </div>
              <div className={styles.features}>
                {stage.features.map((feature) => (
                  <FeatureItem key={feature.title} feature={feature} />
                ))}
              </div>
            </Reveal>
          </li>
        ))}
      </ol>

      <div className={styles.phoneCol}>
        <figure className={styles.sticky} aria-label={phoneLabels.label}>
          <DonorPhone messages={shown} labels={phoneLabels} />
          <figcaption>
            <ExampleTag>{exampleTag}</ExampleTag>
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
