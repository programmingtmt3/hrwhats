import type { ComponentType, SVGProps } from "react";
import { FileDown, MapPin, Search, Target } from "lucide-react";

import { WhatsAppIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { getSite } from "@/lib/content";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { SectionHeading } from "../SectionHeading";
import styles from "./LeadFinder.module.css";
import { LeadFinderMock } from "./LeadFinderMock";

type FeatureKey = keyof Dictionary["home"]["leadFinder"]["features"];

const features: { key: FeatureKey; icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { key: "city", icon: MapPin },
  { key: "activity", icon: Search },
  { key: "export", icon: FileDown },
  { key: "campaigns", icon: Target },
];

/** New section (not in the design reference): Google Maps lead finder. */
export function LeadFinder({ locale }: { locale: Locale }) {
  const { leadFinder } = getDictionary(locale).home;

  return (
    <section className={styles.section} id="lead-finder">
      <div className={styles.glow} />
      <div className={cn("site-container", styles.grid)}>
        <Reveal className={styles.copy}>
          <SectionHeading
            eyebrow={leadFinder.eyebrow}
            title={leadFinder.title}
            subtitle={
              <>
                {leadFinder.subtitle.before}
                {/* Isolated LTR run so the brand and the parentheses stay in place. */}
                <bdi dir="ltr">{leadFinder.subtitle.brand}</bdi>
                {leadFinder.subtitle.after}
              </>
            }
            lead={leadFinder.lead}
            reveal={false}
          />
          <ul className={styles.features}>
            {features.map(({ key, icon: Icon }) => (
              <li key={key} className={styles.feature}>
                <span className={styles.ic}>
                  <Icon aria-hidden="true" />
                </span>
                {leadFinder.features[key]}
              </li>
            ))}
          </ul>
          <div className={styles.actions}>
            {/* Paid-plans feature: talk to sales on WhatsApp (same link as the CTA section). */}
            <a
              href={getSite().contact.whatsapp.url}
              className="btn btn-primary"
              target="_blank"
              rel="noopener"
            >
              <WhatsAppIcon />
              {leadFinder.cta}
            </a>
          </div>
        </Reveal>

        <Reveal className={styles.mockCol} delay={0.15}>
          <LeadFinderMock mock={leadFinder.mock} />
        </Reveal>
      </div>
    </section>
  );
}
