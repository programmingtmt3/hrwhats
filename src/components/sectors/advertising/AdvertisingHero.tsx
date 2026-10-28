import { BriefcaseBusiness, TrendingUp, Zap } from "lucide-react";

import { ArrowIcon, WhatsAppIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { getSite } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { ExampleTag } from "../shared/ExampleTag";
import styles from "./AdvertisingHero.module.css";
import { AgencyBoard } from "./AgencyBoard";
import { TeamCursor } from "./TeamCursor";

// One icon per badge, in dictionary order.
const badgeIcons = [Zap, TrendingUp, BriefcaseBusiness];

export function AdvertisingHero({ locale, eyebrow }: { locale: Locale; eyebrow: string }) {
  const { hero, exampleTag, clients, team } = getDictionary(locale).sectors.advertising;
  const site = getSite();

  return (
    <section className={styles.hero}>
      <div className={cn("site-container", styles.grid)}>
        <Reveal className={styles.copy}>
          <span className="eyebrow">{eyebrow}</span>
          <h1>
            {hero.title.before}
            <span className="grad">{hero.title.highlight}</span>
            {hero.title.after}
          </h1>
          <p className={styles.lead}>{hero.lead}</p>
          <div className="hero-actions">
            <a href={site.appUrls.signup} className="btn btn-primary">
              {hero.primaryCta}
              <ArrowIcon className="icon-forward" />
            </a>
            <a href={site.contact.whatsapp.url} className="btn btn-ghost" target="_blank" rel="noopener">
              <WhatsAppIcon />
              {hero.salesCta}
            </a>
          </div>
          <ul className={styles.badges}>
            {hero.badges.map((badge, i) => {
              const Icon = badgeIcons[i % badgeIcons.length];
              return (
                <li key={badge}>
                  <Icon aria-hidden="true" />
                  {badge}
                </li>
              );
            })}
          </ul>
        </Reveal>

        <Reveal className={styles.visual} delay={0.15}>
          <AgencyBoard clients={clients} data={hero.board} exampleTag={<ExampleTag>{exampleTag}</ExampleTag>} />
          {/* Teammates drifting around the board's frame (never over its text). */}
          <TeamCursor name={team[0]} tone={0} className={styles.cursorA} />
          <TeamCursor name={team[1]} tone={1} className={styles.cursorB} />
        </Reveal>
      </div>
    </section>
  );
}
