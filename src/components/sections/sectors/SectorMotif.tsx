import { Plane } from "lucide-react";

import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import styles from "./SectorMotif.module.css";

export type MotifSlug = keyof Dictionary["home"]["sectors"]["cards"];

/*
 * A small, quiet visual from each sector page's own theme (see "Sector page
 * ideas" in CLAUDE.md), drawn in code. Decorative only. Each one has a single
 * hover movement, driven by the card's :hover in SectorMotif.module.css.
 */
function Motif({ slug, cursorName }: { slug: MotifSlug; cursorName: string }) {
  switch (slug) {
    // Warm cream + a campaign card with a progress bar.
    case "charity":
      return (
        <span className={styles.campaign}>
          <i className={styles.bar} />
          <i className={cn(styles.bar, styles.short)} />
          <i className={styles.track}>
            <b />
          </i>
        </span>
      );

    // Blueprint grid with corner marks + a line drawing of two buildings.
    case "real-estate-contracting":
      return (
        <>
          <i className={cn(styles.mark, styles.markStart)} />
          <i className={cn(styles.mark, styles.markEnd)} />
          <svg className={styles.building} viewBox="0 0 120 80" fill="none">
            <path d="M14 78V30h34v48M48 78V12h40v66M88 78V40h22v38M4 78h112" />
            <path d="M22 40h6M34 40h6M22 52h6M34 52h6M22 64h6M34 64h6M56 22h8M72 22h8M56 36h8M72 36h8M56 50h8M72 50h8M62 78V64h12v14M95 50h8M95 62h8" />
          </svg>
        </>
      );

    // Ruled notebook paper with a margin line + a taped sticky note.
    case "education-training":
      return (
        <span className={styles.note}>
          <i />
          <i />
          <i />
        </span>
      );

    // Dotted flight path + a ticket with a perforated stub.
    case "tourism-hospitality":
      return (
        <>
          <svg className={styles.route} viewBox="0 0 200 60" fill="none" preserveAspectRatio="none">
            <path d="M8 52C60 4 140 4 192 40" />
          </svg>
          <span className={styles.ticket}>
            <span className={styles.ticketMain}>
              <i />
              <i />
            </span>
            <span className={styles.stub}>
              <Plane />
            </span>
          </span>
        </>
      );

    // A receipt strip with a torn zigzag edge.
    case "online-stores-systems":
      return (
        <span className={styles.receipt}>
          <i />
          <i />
          <i />
          <i className={styles.total} />
        </span>
      );

    // Dot-grid canvas, a selected frame with handles and a teammate cursor.
    case "advertising":
      return (
        <>
          <span className={styles.frame}>
            <i />
            <i />
            <b />
            <b />
            <b />
            <b />
          </span>
          <span className={styles.cursor}>
            <svg viewBox="0 0 16 16">
              <path d="M2 1l11 6-5 1.5L6 14z" />
            </svg>
            <em>{cursorName}</em>
          </span>
        </>
      );

    // A lanyard ribbon holding an ID badge.
    case "hr":
      return (
        <span className={styles.lanyard}>
          <i className={styles.ribbon} />
          <span className={styles.badge}>
            <i className={styles.photo} />
            <i />
            <i className={styles.short} />
          </span>
        </span>
      );

    // Diagonal tape in brand greens + a small panel of status lights.
    case "operating-service":
      return (
        <>
          <i className={styles.tape} />
          <span className={styles.leds}>
            <i />
            <i />
            <i />
          </span>
        </>
      );

    // A chalkboard in a wooden frame with a steaming cup drawn in chalk.
    case "restaurants-cafes":
      return (
        <span className={styles.board}>
          <svg viewBox="0 0 80 56" fill="none">
            <path className={styles.steam} d="M30 20c-4-5 4-8 0-14M40 20c-4-5 4-8 0-14M50 20c-4-5 4-8 0-14" />
            <path d="M22 26h36v8a14 14 0 0 1-14 14h-8a14 14 0 0 1-14-14zM58 29h4a5 5 0 0 1 0 10h-5M16 52h48" />
          </svg>
        </span>
      );

    // A striped shop awning with a scalloped edge over a shelf.
    case "shops":
      return (
        <>
          <i className={styles.awning} />
          <span className={styles.shelf}>
            <i />
            <i />
            <i />
          </span>
        </>
      );
  }
}

export function SectorMotif({
  slug,
  cursorName,
  className,
}: {
  slug: MotifSlug;
  cursorName: string;
  className?: string;
}) {
  return (
    <div className={cn(styles.motif, styles[slug], className)} aria-hidden="true">
      <Motif slug={slug} cursorName={cursorName} />
    </div>
  );
}
