import type { ReactNode } from "react";

import { SectionHeading } from "@/components/sections/SectionHeading";
import { format, getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { FeatureItem } from "../shared/FeatureItem";
import styles from "./Journey.module.css";
import { JourneyCarousel } from "./JourneyCarousel";
import { AfterStayVisual, BackstageVisual, BeforeBookingVisual, BookingVisual, StayVisual } from "./StageVisuals";

type Journey = Dictionary["sectors"]["tourism"]["journey"];
type StageKey = keyof Journey["stages"];
type ServiceKey = keyof Journey["items"];

/** The stay, stage by stage, with the services that belong to each stage. */
const STAGES: { key: StageKey; id: string; services: ServiceKey[] }[] = [
  { key: "beforeBooking", id: "before-booking", services: ["inquiries", "autoReplies"] },
  { key: "booking", id: "booking", services: ["bookings"] },
  { key: "stay", id: "stay", services: ["guestExperience"] },
  { key: "afterStay", id: "after-stay", services: ["campaigns"] },
  { key: "backstage", id: "backstage", services: ["team", "reports"] },
];

function visualFor(key: StageKey, journey: Journey, exampleTag: string): ReactNode {
  const { visuals } = journey;
  switch (key) {
    case "beforeBooking":
      return <BeforeBookingVisual data={visuals.beforeBooking} exampleTag={exampleTag} />;
    case "booking":
      return <BookingVisual data={visuals.booking} exampleTag={exampleTag} />;
    case "stay":
      return <StayVisual data={visuals.stay} exampleTag={exampleTag} />;
    case "afterStay":
      return <AfterStayVisual data={visuals.afterStay} exampleTag={exampleTag} />;
    case "backstage":
      return <BackstageVisual data={visuals.backstage} exampleTag={exampleTag} />;
  }
}

export function Journey({ locale }: { locale: Locale }) {
  const { journey, exampleTag } = getDictionary(locale).sectors.tourism;
  const total = STAGES.length;

  const stages = STAGES.map(({ key, id, services }, i) => {
    const name = journey.stages[key];
    return {
      id,
      name,
      slideLabel: format(journey.slideLabel, { n: i + 1, total, name }),
      goToLabel: format(journey.goTo, { name }),
      slide: (
        <div className={cn(styles.slideGrid, services.length > 1 && styles.double)}>
          <div className={styles.text}>
            <span className={styles.stageName}>{name}</span>
            {services.map((service) => (
              <FeatureItem key={service} feature={journey.items[service]} heading="h3" plain />
            ))}
          </div>
          <div className={styles.visual}>{visualFor(key, journey, exampleTag)}</div>
        </div>
      ),
    };
  });

  return (
    <section>
      <div className="site-container">
        <SectionHeading eyebrow={journey.eyebrow} title={journey.title} />
        <JourneyCarousel
          stages={stages}
          labels={{
            carousel: journey.carouselLabel,
            slideRole: journey.slideRole,
            prev: journey.prev,
            next: journey.next,
          }}
        />
      </div>
    </section>
  );
}
