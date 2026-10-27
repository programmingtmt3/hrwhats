import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

import styles from "./FeatureItem.module.css";

export type Feature = { title: string; text: string; points: string[]; note: string };

/** One feature from the current site: title, text, optional checklist and closing note. */
export function FeatureItem({
  feature,
  heading: Heading = "h4",
  plain,
  inverse,
  inlinePoints,
  className,
}: {
  feature: Feature;
  heading?: "h3" | "h4";
  /** No card: just the text, with a larger title (section-level features). */
  plain?: boolean;
  /** Light text for dark backgrounds. */
  inverse?: boolean;
  /** Checklist in one centered row that wraps (2×2 on phones) instead of a column. */
  inlinePoints?: boolean;
  className?: string;
}) {
  const { title, text, points, note } = feature;

  return (
    <article className={cn(styles.item, plain && styles.plain, inverse && styles.inverse, className)}>
      <Heading>{title}</Heading>
      {text && <p>{text}</p>}
      {points.length > 0 && (
        <ul className={cn(styles.points, inlinePoints && styles.inline)}>
          {points.map((point) => (
            <li key={point}>
              <Check aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>
      )}
      {note && <p>{note}</p>}
    </article>
  );
}
