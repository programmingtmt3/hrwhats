import { TrendingUp, UserCheck, Zap } from "lucide-react";

import { ArrowIcon, WhatsAppIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { getSite } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import blueprint from "./Blueprint.module.css";
import { PropertyChat, type ChatMessage } from "./PropertyChat";
import styles from "./RealEstateHero.module.css";

// One icon per badge, in dictionary order.
const badgeIcons = [Zap, TrendingUp, UserCheck];

export function RealEstateHero({ locale, eyebrow }: { locale: Locale; eyebrow: string }) {
  const { hero, exampleTag } = getDictionary(locale).sectors.realEstate;
  const { messages, ...chatLabels } = hero.chat;
  const site = getSite();

  return (
    <section className={cn(blueprint.paper, styles.hero)}>
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
          <PropertyChat messages={messages as ChatMessage[]} labels={chatLabels} exampleTag={exampleTag} />
        </Reveal>
      </div>
    </section>
  );
}
