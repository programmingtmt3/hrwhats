import { BriefcaseBusiness, FileBadge, ShieldCheck, Store, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import { ArrowIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { getDictionary, localePath, type Dictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import styles from "./MetaVerify.module.css";

type StageKey = keyof Dictionary["home"]["why"]["verify"]["stages"];

const stages: { key: StageKey; icon: LucideIcon }[] = [
  { key: "store", icon: Store },
  { key: "certificate", icon: FileBadge },
  { key: "portfolio", icon: BriefcaseBusiness },
  { key: "verified", icon: ShieldCheck },
];

/**
 * "Meta portfolio verification with a freelance certificate" panel under the
 * Why cards (replaces the old bnr-1.png banner). The four stages light up one
 * after another, once: each lit layer is a `.reveal-child`, so it shows at
 * once with reduced motion or JS off.
 */
export function MetaVerify({ locale }: { locale: Locale }) {
  const { verify } = getDictionary(locale).home.why;

  return (
    <Reveal className={styles.panel}>
      <div className={styles.copy}>
        <h3 className={styles.title}>
          {verify.title.before}
          <span className="grad">{verify.title.highlight}</span>
          {verify.title.after}
        </h3>
        <p className={styles.question}>{verify.question}</p>
        <p className={styles.line}>{verify.line}</p>
        <Link href={localePath(locale, "/documentation-requirements-for-meta/")} className="btn btn-primary">
          {verify.cta}
          <ArrowIcon className="icon-forward" />
        </Link>
      </div>

      <ol className={styles.stages} aria-label={verify.stagesLabel}>
        {stages.map(({ key, icon: Icon }, i) => (
          <li
            key={key}
            className={cn(styles.stage, key === "verified" && styles.final)}
            // Stages at --i 0, 2, 4, 6; the arrow after each one at the odd step.
            style={{ "--i": i * 2 } as CSSProperties}
          >
            <span className={styles.ic} aria-hidden="true">
              <Icon />
              <span className={cn(styles.lit, "reveal-child")}>
                <Icon />
              </span>
            </span>
            <span className={styles.label}>{verify.stages[key]}</span>
            {i < stages.length - 1 && (
              <span
                className={cn(styles.arrow, "reveal-child")}
                style={{ "--i": i * 2 + 1 } as CSSProperties}
                aria-hidden="true"
              >
                <ArrowIcon className="icon-forward" strokeWidth={2.5} />
              </span>
            )}
          </li>
        ))}
      </ol>
    </Reveal>
  );
}
