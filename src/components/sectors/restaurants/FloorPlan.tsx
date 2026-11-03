import type { ReactNode } from "react";

import { SectionHeading } from "@/components/sections/SectionHeading";
import { format, getDictionary, type Dictionary, type Locale } from "@/lib/i18n";

import { ExampleTag } from "../shared/ExampleTag";
import { FeatureItem } from "../shared/FeatureItem";
import styles from "./FloorPlan.module.css";
import { PlanExplorer, type Zone } from "./PlanExplorer";
import { DeliveryStatus, LoyaltyCard, NightReply, OrderScreen, PeakClock, RailTickets, TeamSplit } from "./Visuals";

type Restaurants = Dictionary["sectors"]["restaurants"];
type ServiceKey = keyof Restaurants["items"];

/** Hotspots in plan order: the service each place stands for, and where it is drawn. */
const SPOTS: { key: ServiceKey; zone: Zone }[] = [
  { key: "receive", zone: { box: [21, 50, 21, 50], deco: "screen" } },
  { key: "automation", zone: { box: [0, 50, 21, 25], deco: "phone", at: [0.42, 0.62] } },
  { key: "manage", zone: { box: [0, 0, 42, 50], deco: "kitchen" } },
  { key: "delivery", zone: { box: [0, 75, 21, 25], deco: "door", at: [0.66, 0.6] } },
  { key: "experience", zone: { box: [42, 30, 58, 70], deco: "tables" } },
  { key: "team", zone: { box: [42, 0, 24, 30], deco: "cashier" } },
  { key: "reports", zone: { box: [66, 0, 34, 30], deco: "office" } },
];

function visualFor(key: ServiceKey, page: Restaurants): ReactNode {
  const { visuals, orderTypes } = page;
  const tag = <ExampleTag>{page.exampleTag}</ExampleTag>;
  switch (key) {
    case "receive":
      return <OrderScreen data={visuals.screen} types={orderTypes} exampleTag={tag} />;
    case "automation":
      return <NightReply data={visuals.faq} exampleTag={tag} />;
    case "manage":
      return <RailTickets data={visuals.rail} types={orderTypes} exampleTag={tag} />;
    case "delivery":
      return <DeliveryStatus data={visuals.delivery} exampleTag={tag} />;
    case "experience":
      return <LoyaltyCard data={visuals.loyalty} exampleTag={tag} />;
    case "team":
      return <TeamSplit data={visuals.team} exampleTag={tag} />;
    case "reports":
      return <PeakClock data={visuals.peak} exampleTag={tag} />;
    default:
      return null;
  }
}

/** "How HRwhats serves you" as a tour of the restaurant floor plan (7 services; campaigns have their own section). */
export function FloorPlan({ locale }: { locale: Locale }) {
  const page = getDictionary(locale).sectors.restaurants;
  const { plan, items } = page;

  const spots = SPOTS.map((spot, i) => ({
    place: plan.places[i],
    service: items[spot.key].title,
    label: format(plan.spotLabel, { place: plan.places[i], service: items[spot.key].title }),
    zone: spot.zone,
  }));
  const panels = SPOTS.map((spot) => (
    <div key={spot.key} className={styles.panelBody}>
      <FeatureItem feature={items[spot.key]} heading="h3" plain />
      <div className={styles.panelVisual}>{visualFor(spot.key, page)}</div>
    </div>
  ));

  return (
    <section className={styles.section}>
      <div className="site-container">
        <SectionHeading eyebrow={plan.eyebrow} title={plan.title} />
        <PlanExplorer
          spots={spots}
          panels={panels}
          planLabel={plan.label}
          listLabel={plan.listLabel}
          hint={plan.hint}
        />
      </div>
    </section>
  );
}
