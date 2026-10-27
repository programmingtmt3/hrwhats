import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { FeatureItem } from "../shared/FeatureItem";
import blueprint from "./Blueprint.module.css";
import { LeadsBoard } from "./LeadsBoard";
import {
  AutoRepliesVisual,
  CampaignVisual,
  FunnelVisual,
  InquiriesVisual,
  TeamVisual,
} from "./ServiceVisuals";
import styles from "./Services.module.css";

type ServiceKey = keyof Dictionary["sectors"]["realEstate"]["services"]["items"];
type Visuals = Dictionary["sectors"]["realEstate"]["services"]["visuals"];

/** Deal order: from the first inquiry to the reports. `anchor` = the index link target. */
const PANELS: { key: ServiceKey; anchor: string; wide?: boolean }[] = [
  { key: "inquiries", anchor: "inquiries" },
  { key: "autoReplies", anchor: "auto-replies" },
  { key: "campaigns", anchor: "campaigns" },
  { key: "leads", anchor: "leads", wide: true },
  { key: "team", anchor: "sales-team" },
  { key: "reports", anchor: "reports" },
];

const pad = (n: number) => String(n).padStart(2, "0");

function visualFor(key: ServiceKey, visuals: Visuals, exampleTag: string): ReactNode {
  switch (key) {
    case "inquiries":
      return <InquiriesVisual data={visuals.inquiries} exampleTag={exampleTag} />;
    case "autoReplies":
      return <AutoRepliesVisual data={visuals.autoReplies} exampleTag={exampleTag} />;
    case "campaigns":
      return <CampaignVisual data={visuals.campaigns} exampleTag={exampleTag} />;
    case "leads":
      return <LeadsBoard data={visuals.leads} exampleTag={exampleTag} />;
    case "team":
      return <TeamVisual data={visuals.team} exampleTag={exampleTag} />;
    case "reports":
      return <FunnelVisual data={visuals.reports} exampleTag={exampleTag} />;
  }
}

/** "How HRwhats serves you": an index of the six stages, then one drawing sheet per stage. */
export function Services({ locale }: { locale: Locale }) {
  const { services, exampleTag } = getDictionary(locale).sectors.realEstate;
  const total = pad(PANELS.length);

  return (
    <section className={cn(blueprint.paper, styles.section)}>
      <div className="site-container">
        <SectionHeading eyebrow={services.eyebrow} title={services.title} />

        <Reveal as="nav" className={styles.index} aria-label={services.indexLabel}>
          <ol>
            {PANELS.map(({ key, anchor }, i) => (
              <li key={key}>
                <a href={`#${anchor}`}>
                  <span>{pad(i + 1)}</span>
                  {services.items[key].title}
                </a>
              </li>
            ))}
          </ol>
        </Reveal>

        <div className={styles.panels}>
          {PANELS.map(({ key, anchor, wide }, i) => (
            <div key={key} id={anchor} className={cn(styles.panel, wide && styles.wide)}>
              <Reveal className={styles.text}>
                <span className={styles.sheetNo}>
                  {services.sheetLabel} {pad(i + 1)} / {total}
                </span>
                <FeatureItem feature={services.items[key]} heading="h3" plain />
              </Reveal>
              <Reveal className={styles.visual} delay={0.1}>
                {visualFor(key, services.visuals, exampleTag)}
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
