import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  /** Title split around the gradient-highlighted words. */
  title: { before: string; highlight: string; after: string };
  /** Optional line between the title and the lead (`.sec-subtitle`). */
  subtitle?: ReactNode;
  lead?: string;
  /** Wrap in <Reveal> (default). Set false when a parent already reveals. */
  reveal?: boolean;
  className?: string;
};

/** The design's `.sec-head` block: eyebrow, h2 with a `.grad` highlight, lead. */
export function SectionHeading({ eyebrow, title, subtitle, lead, reveal = true, className }: SectionHeadingProps) {
  const content: ReactNode = (
    <>
      <span className="eyebrow">{eyebrow}</span>
      <h2>
        {title.before}
        <span className="grad">{title.highlight}</span>
        {title.after}
      </h2>
      {subtitle && <p className="sec-subtitle">{subtitle}</p>}
      {lead && <p>{lead}</p>}
    </>
  );

  return reveal ? (
    <Reveal className={cn("sec-head", className)}>{content}</Reveal>
  ) : (
    <div className={cn("sec-head", className)}>{content}</div>
  );
}
