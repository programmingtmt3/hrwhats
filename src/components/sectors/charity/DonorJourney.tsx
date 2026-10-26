import { SectionHeading } from "@/components/sections/SectionHeading";
import { getDictionary, type Locale } from "@/lib/i18n";

import type { DonorMessage } from "./DonorChat";
import styles from "./DonorJourney.module.css";
import { JourneySteps } from "./JourneySteps";

/** Campaigns & donations, told as the donor's journey (stages + sticky WhatsApp phone). */
export function DonorJourney({ locale }: { locale: Locale }) {
  const { campaigns, exampleTag } = getDictionary(locale).sectors.charity;
  const { messages, ...phoneLabels } = campaigns.phone;

  return (
    <section className={styles.section}>
      <div className="site-container">
        <SectionHeading eyebrow={campaigns.eyebrow} title={campaigns.title} lead={campaigns.lead} />
        <JourneySteps
          stages={campaigns.stages}
          stageLabel={campaigns.stageLabel}
          messages={messages as DonorMessage[][]}
          phoneLabels={phoneLabels}
          exampleTag={exampleTag}
        />
      </div>
    </section>
  );
}
