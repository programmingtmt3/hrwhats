import type { CSSProperties, ReactNode } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { FeatureItem } from "../shared/FeatureItem";
import { JourneyTabs } from "./JourneyTabs";
import notebook from "./Notebook.module.css";
import styles from "./Services.module.css";
import {
  AttendanceVisual,
  AutoFormVisual,
  CalendarVisual,
  FoldersVisual,
  RingsVisual,
  TeamVisual,
} from "./TabVisuals";

type ServiceKey = keyof Dictionary["sectors"]["education"]["services"]["items"];
type Visuals = Dictionary["sectors"]["education"]["services"]["visuals"];

/** The student's journey, in tab order. `id` is used for the tab/panel ids. */
const TABS: { key: ServiceKey; id: string }[] = [
  { key: "inquiries", id: "inquiries" },
  { key: "registration", id: "registration" },
  { key: "campaigns", id: "campaigns" },
  { key: "followUp", id: "follow-up" },
  { key: "team", id: "admission-team" },
  { key: "reports", id: "reports" },
];

function visualFor(key: ServiceKey, visuals: Visuals, exampleTag: string): ReactNode {
  switch (key) {
    case "inquiries":
      return <FoldersVisual data={visuals.inquiries} exampleTag={exampleTag} />;
    case "registration":
      return <AutoFormVisual data={visuals.registration} exampleTag={exampleTag} />;
    case "campaigns":
      return <CalendarVisual data={visuals.campaigns} exampleTag={exampleTag} />;
    case "followUp":
      return <AttendanceVisual data={visuals.followUp} exampleTag={exampleTag} />;
    case "team":
      return <TeamVisual data={visuals.team} exampleTag={exampleTag} />;
    case "reports":
      return <RingsVisual data={visuals.reports} exampleTag={exampleTag} />;
  }
}

/** "How HRwhats serves you": the six services as tabs along the student's journey. */
export function Services({ locale }: { locale: Locale }) {
  const { services, exampleTag } = getDictionary(locale).sectors.education;

  const tabs = TABS.map(({ key, id }) => ({
    id,
    label: services.items[key].tab,
    panel: (
      <div className={styles.panelGrid}>
        <div className={cn("reveal-child", styles.text)}>
          <FeatureItem feature={services.items[key]} heading="h3" plain />
        </div>
        <div className={cn("reveal-child", styles.visual)} style={{ "--i": 1 } as CSSProperties}>
          {visualFor(key, services.visuals, exampleTag)}
        </div>
      </div>
    ),
  }));

  return (
    <section className={notebook.ruled}>
      <div className="site-container">
        <SectionHeading eyebrow={services.eyebrow} title={services.title} />
        <Reveal className={styles.binder}>
          <JourneyTabs tabs={tabs} label={services.tabsLabel} />
        </Reveal>
      </div>
    </section>
  );
}
