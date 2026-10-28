import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { ExampleTag } from "../shared/ExampleTag";
import { FeatureItem } from "../shared/FeatureItem";
import { FlipCards } from "./FlipCards";
import styles from "./Journey.module.css";
import { AutoGuide, CvExtract, Gauges, Memo, OrgChart, RoutingSlip } from "./Visuals";

type Hr = Dictionary["sectors"]["hr"];
type ServiceKey = keyof Hr["journey"]["items"];

/** The employee journey: three stations, services in journey order. */
const STATIONS: ServiceKey[][] = [["recruiting"], ["inquiries", "automation", "requests", "internal"], ["team", "reports"]];

/** Services whose mockup takes the full width under the text. */
const WIDE: ServiceKey[] = ["inquiries"];

function visualFor(key: ServiceKey, page: Hr): ReactNode {
  const { visuals } = page.journey;
  const tag = <ExampleTag>{page.exampleTag}</ExampleTag>;

  switch (key) {
    case "recruiting":
      return <CvExtract data={visuals.cv} exampleTag={tag} />;
    case "inquiries":
      return <FlipCards data={visuals.flip} exampleTag={tag} />;
    case "automation":
      return <AutoGuide data={visuals.guide} exampleTag={tag} />;
    case "requests":
      return <RoutingSlip data={visuals.slip} exampleTag={tag} />;
    case "internal":
      return <Memo data={visuals.memo} exampleTag={tag} />;
    case "team":
      return <OrgChart data={visuals.org} exampleTag={tag} />;
    case "reports":
      return <Gauges data={visuals.gauges} exampleTag={tag} />;
    default:
      return null;
  }
}

/*
 * "How HRwhats serves you" as the employee's journey: each station opens with
 * a sign (أولاً / ثانياً / ثالثاً) pinned to the lanyard ribbon that runs down
 * the section; its services follow, text beside the mockup.
 */
export function Journey({ locale }: { locale: Locale }) {
  const page = getDictionary(locale).sectors.hr;
  const { journey } = page;

  return (
    <section className={styles.section}>
      <div className="site-container">
        <SectionHeading eyebrow={journey.eyebrow} title={journey.title} />
        <div className={styles.journey}>
          {STATIONS.map((keys, s) => {
            const station = journey.stations[s];
            return (
              <div key={station.title} className={styles.station}>
                <Reveal as="header" className={styles.sign}>
                  <span className={styles.ordinal}>{station.label}</span>
                  <span>
                    <h3>{station.title}</h3>
                    <p>{station.text}</p>
                  </span>
                </Reveal>
                {keys.map((key) => (
                  <div key={key} className={cn(styles.row, WIDE.includes(key) && styles.wide)}>
                    <Reveal className={styles.text}>
                      <FeatureItem feature={journey.items[key]} heading="h4" plain />
                    </Reveal>
                    <Reveal className={styles.visual} delay={0.1}>
                      {visualFor(key, page)}
                    </Reveal>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
