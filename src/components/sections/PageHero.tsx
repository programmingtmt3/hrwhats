import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

import { HeroBackdrop } from "./hero/HeroBackdrop";
import styles from "./PageHero.module.css";

type PageHeroProps = {
  eyebrow: string;
  /** Page title (the page's only h1), split around the gradient words. */
  title: { before: string; highlight: string; after: string };
  lead?: string;
};

/** Hero for inner pages: same backdrop as the home hero, shorter. */
export function PageHero({ eyebrow, title, lead }: PageHeroProps) {
  return (
    <section className={styles.hero}>
      <HeroBackdrop />
      <Reveal className={cn("site-container", styles.inner)}>
        <span className="eyebrow">{eyebrow}</span>
        <h1>
          {title.before}
          <span className="grad">{title.highlight}</span>
          {title.after}
        </h1>
        {lead && <p className={styles.lead}>{lead}</p>}
      </Reveal>
    </section>
  );
}
