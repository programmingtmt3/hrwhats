import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { format, getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { ExampleTag } from "../shared/ExampleTag";
import { FeatureItem } from "../shared/FeatureItem";
import { AbTest } from "./AbTest";
import styles from "./Artboards.module.css";
import { TeamCursor } from "./TeamCursor";
import { LeadThermometer, AutoReplyMenu, TeamAccounts, UnifiedInbox, WhiteLabelReport } from "./Visuals";

type Advertising = Dictionary["sectors"]["advertising"];
type ServiceKey = keyof Advertising["services"]["items"];

const KEYS: ServiceKey[] = ["clients", "autoReplies", "campaigns", "leads", "team", "reports"];

function visualFor(key: ServiceKey, page: Advertising): ReactNode {
  const { visuals } = page.services;
  const tag = <ExampleTag>{page.exampleTag}</ExampleTag>;

  switch (key) {
    case "clients":
      return <UnifiedInbox data={visuals.inbox} clients={page.clients} exampleTag={tag} />;
    case "autoReplies":
      return <AutoReplyMenu data={visuals.autoReplies} exampleTag={tag} />;
    case "campaigns":
      return <AbTest data={visuals.campaigns} exampleTag={tag} />;
    case "leads":
      return <LeadThermometer data={visuals.leads} exampleTag={tag} />;
    case "team":
      return <TeamAccounts data={visuals.team} clients={page.clients} team={page.team} exampleTag={tag} />;
    case "reports":
      return <WhiteLabelReport data={visuals.reports} client={page.clients[0]} exampleTag={tag} />;
    default:
      return null;
  }
}

/*
 * The six services as artboards on the canvas: two staggered columns linked by
 * prototype connectors (one column on tablets and phones). Each artboard gets a
 * selection frame and a teammate's cursor the first time it is seen.
 */
export function Artboards({ locale }: { locale: Locale }) {
  const page = getDictionary(locale).sectors.advertising;
  const { services, team } = page;

  return (
    <section className={styles.section}>
      <div className="site-container">
        <SectionHeading eyebrow={services.eyebrow} title={services.title} />
        <div className={styles.boards}>
          {KEYS.map((key, i) => (
            <div key={key} className={cn(styles.slot, i % 2 === 1 && styles.offset)}>
              <p className={styles.label} aria-hidden="true">
                {format(services.frameLabel, { n: String(i + 1).padStart(2, "0"), name: services.frames[i] })}
              </p>
              <Reveal className={styles.board}>
                <span className={styles.handles} aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                <TeamCursor name={team[i % team.length]} tone={i % team.length} className={styles.cursor} />
                <div className={styles.stage}>{visualFor(key, page)}</div>
                <div className={styles.inspector}>
                  <FeatureItem feature={services.items[key]} heading="h3" plain />
                </div>
              </Reveal>
              {i < KEYS.length - 1 && (
                <svg
                  className={cn(styles.link, i % 2 === 0 ? styles.toEnd : styles.toStart)}
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M0 4 C 60 4, 40 96, 100 96" pathLength={1} />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
