import { Keyboard, ScanLine } from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { ExampleTag } from "../shared/ExampleTag";
import { QrArt } from "./QrArt";
import styles from "./QrSection.module.css";
import { ScanSimulator } from "./ScanSimulator";

/**
 * The page's signature: a QR code in the shop instead of asking "what's your
 * number?". The four steps with a press-to-scan simulator, the old way vs the
 * scan, and where to put the code.
 */
export function QrSection({ locale }: { locale: Locale }) {
  const page = getDictionary(locale).sectors.shops;
  const { qr } = page;

  return (
    <section className={styles.section}>
      <div className="site-container">
        <SectionHeading eyebrow={qr.eyebrow} title={qr.title} />
        <p className={styles.text}>{qr.text}</p>

        <Reveal className={styles.simWrap}>
          <ExampleTag className={styles.tag}>{page.exampleTag}</ExampleTag>
          <ScanSimulator data={qr.sim} steps={qr.steps} stepsLabel={qr.stepsLabel} />
        </Reveal>

        {/* The old way vs one scan. */}
        <Reveal as="figure" className={styles.compare} aria-label={qr.compare.label}>
          <div className={cn(styles.side, styles.old)}>
            <p className={styles.sideTitle}>
              <Keyboard aria-hidden="true" />
              {qr.compare.oldTitle}
            </p>
            <p className={styles.ask}>{qr.compare.oldAsk}</p>
            {/* A computer: the number typed by hand into a field, with a struck-out typo (drawing). */}
            <span className={styles.computer} aria-hidden="true">
              <span className={styles.monitor}>
                <span className={styles.field}>
                  <small>{qr.compare.fieldLabel}</small>
                  <span className={styles.input} dir="ltr">
                    <span className={styles.typed}>
                      {qr.compare.typed.before}
                      <s>{qr.compare.typed.wrong}</s>
                      {qr.compare.typed.after}
                    </span>
                    <i className={styles.caret} />
                  </span>
                </span>
              </span>
              <span className={styles.stand} />
              <span className={styles.keyboard} />
            </span>
            <p className={styles.note}>{qr.compare.oldNote}</p>
          </div>
          <span className={styles.vs} aria-hidden="true" />
          <div className={cn(styles.side, styles.new)}>
            <p className={styles.sideTitle}>
              <ScanLine aria-hidden="true" />
              {qr.compare.newTitle}
            </p>
            <span className={styles.oneScan} aria-hidden="true">
              <QrArt />
            </span>
            <p className={styles.note}>{qr.compare.newNote}</p>
          </div>
        </Reveal>

        {/* Where to put the code. */}
        <h3 className={styles.placesTitle}>{qr.placesTitle}</h3>
        <ul className={styles.places}>
          {qr.places.map((place, i) => (
            <Reveal as="li" key={place} delay={i * 0.08} className={styles.place}>
              <span className={cn(styles.scene, styles[`scene${i}`])} aria-hidden="true">
                <span className={styles.code}>
                  <QrArt />
                </span>
              </span>
              <b>{place}</b>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
