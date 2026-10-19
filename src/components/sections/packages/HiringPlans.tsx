import { Clock, Info } from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";
import { getHiringPlans, getSite, t } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { SectionHeading } from "../SectionHeading";
import styles from "./Packages.module.css";

export function HiringPlans({ locale }: { locale: Locale }) {
  const page = getDictionary(locale).packagesPage;
  const text = page.hiring;
  // Subscription and payment happen inside the dashboard.
  const signupUrl = getSite().appUrls.signup;

  return (
    <section className={cn(styles.section, styles.hiring)} id="hiring-plans">
      <div className="site-container">
        <SectionHeading eyebrow={text.eyebrow} title={text.title} lead={text.lead} />
        <div className={styles.hirePlans}>
          {getHiringPlans().map((plan, i) => (
            <Reveal key={plan.id} as="article" className={styles.plan} delay={i * 0.06}>
              <h3>{t(plan.name, locale)}</h3>
              <p className={styles.tagline}>{t(plan.tagline, locale)}</p>
              <div className={styles.price}>
                <b>{plan.price.toLocaleString("en-US")}</b>
                <span>{text.per[plan.period]}</span>
              </div>
              <p className={styles.usage}>
                <Clock aria-hidden="true" />
                <span>
                  <bdi>{t(plan.usage, locale)}</bdi>: <b><bdi>{t(plan.hours, locale)}</bdi></b>
                </span>
              </p>
              <a href={signupUrl} className={cn("btn btn-ghost", styles.planBtn, styles.pushDown)}>
                {text.cta}
              </a>
            </Reveal>
          ))}
        </div>
        <p className={styles.note}>
          <Info aria-hidden="true" />
          {page.vatNote}
        </p>
      </div>
    </section>
  );
}
