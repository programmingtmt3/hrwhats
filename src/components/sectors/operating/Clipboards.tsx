import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { format, getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { ExampleTag } from "../shared/ExampleTag";
import { FeatureItem } from "../shared/FeatureItem";
import styles from "./Clipboards.module.css";
import { SortBoard } from "./SortBoard";
import { ContractCard, ControlRoom, FieldTeam, FollowUpUpdates, IntakeBelt } from "./Visuals";

type Operating = Dictionary["sectors"]["operating"];
type ServiceKey = keyof Operating["services"]["items"];

const KEYS: ServiceKey[] = ["requests", "intake", "followUp", "field", "contracts", "reports"];

function visualFor(key: ServiceKey, page: Operating): ReactNode {
  const { visuals } = page.services;
  const tag = <ExampleTag>{page.exampleTag}</ExampleTag>;

  switch (key) {
    case "requests":
      return <SortBoard data={visuals.board} departments={page.departments} priorities={page.priorities} exampleTag={tag} />;
    case "intake":
      return <IntakeBelt data={visuals.intake} departments={page.departments} exampleTag={tag} />;
    case "followUp":
      return <FollowUpUpdates data={visuals.followUp} exampleTag={tag} />;
    case "field":
      return <FieldTeam data={visuals.field} exampleTag={tag} />;
    case "contracts":
      return <ContractCard data={visuals.contracts} exampleTag={tag} />;
    case "reports":
      return <ControlRoom data={visuals.reports} exampleTag={tag} />;
    default:
      return null;
  }
}

/*
 * The six services as work orders on clipboards, stacked full width. Only the
 * board behind the paper tilts (alternating sides); the paper with the text and
 * the mockup stays straight, so nothing is harder to read.
 */
export function Clipboards({ locale }: { locale: Locale }) {
  const page = getDictionary(locale).sectors.operating;
  const { services } = page;

  return (
    <section className={styles.section}>
      <div className="site-container">
        <SectionHeading eyebrow={services.eyebrow} title={services.title} />
        <div className={styles.stack}>
          {KEYS.map((key, i) => (
            <Reveal key={key} className={cn(styles.clipboard, i % 2 === 1 && styles.tiltOther)}>
              <span className={styles.clip} aria-hidden="true" />
              <div className={styles.paper}>
                <p className={styles.orderNo}>{format(services.orderLabel, { n: String(i + 1).padStart(2, "0") })}</p>
                <div className={styles.body}>
                  <div className={styles.text}>
                    <FeatureItem feature={services.items[key]} heading="h3" plain />
                  </div>
                  <div className={styles.visual}>{visualFor(key, page)}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
