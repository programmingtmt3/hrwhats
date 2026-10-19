import { Check, Info, X } from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";
import { getSite, getWhatsappPlans, t, type WhatsappFeatureKey, type WhatsappPlan } from "@/lib/content";
import { format, getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { SectionHeading } from "../SectionHeading";
import { BillingSwitch } from "./BillingSwitch";
import styles from "./Packages.module.css";

type Text = Dictionary["packagesPage"]["whatsapp"];

const featureOrder: WhatsappFeatureKey[] = [
  "campaigns",
  "messages",
  "contacts",
  "quickReplies",
  "users",
  "qrLeads",
  "mapsLeads",
];

const number = (n: number) => n.toLocaleString("en-US");

/** Display value for a feature, and whether it is available. */
function featureValue(value: WhatsappPlan["features"][WhatsappFeatureKey], text: Text) {
  if (value === false) return { available: false, label: text.values.unavailable };
  if (value === true) return { available: true, label: text.values.available };
  if (value === "unlimited") return { available: true, label: text.values.unlimited };
  return { available: true, label: number(value) };
}

function PlanCard({ plan, text, locale, signupUrl, delay }: {
  plan: WhatsappPlan;
  text: Text;
  locale: Locale;
  signupUrl: string;
  delay?: number;
}) {
  return (
    <Reveal as="article" className={cn(styles.plan, plan.featured && styles.featured)} delay={delay}>
      {plan.featured && <span className={styles.badge}>{text.featuredBadge}</span>}
      <h3>{t(plan.name, locale)}</h3>
      <p className={styles.desc}>{t(plan.description, locale)}</p>

      <div className={cn(styles.price, styles.monthly)}>
        <b>{number(plan.monthly)}</b>
        <span>{text.perMonth}</span>
      </div>
      <div className={cn(styles.price, styles.yearly)}>
        <b>{number(plan.yearly)}</b>
        <span>{text.perYear}</span>
        {plan.yearlySavings > 0 && (
          <span className={styles.save}>{format(text.save, { amount: number(plan.yearlySavings) })}</span>
        )}
      </div>

      <a href={signupUrl} className={cn("btn", plan.featured ? "btn-primary" : "btn-ghost", styles.planBtn)}>
        {text.cta}
      </a>

      <ul className={styles.features}>
        {featureOrder.map((key) => {
          const raw = plan.features[key];
          const value =
            key === "mapsLeads" && typeof raw === "number"
              ? { available: true, label: format(text.values.perMonthResults, { count: number(raw) }) }
              : featureValue(raw, text);
          return (
            <li key={key} className={cn(!value.available && styles.off)}>
              <span className={styles.mark} aria-hidden="true">
                {value.available ? <Check strokeWidth={3} /> : <X strokeWidth={3} />}
              </span>
              {/* Isolated runs: "Google Maps" + ":" + a number must not merge into one LTR run. */}
              <span>
                <bdi>{text.features[key]}</bdi>: <b><bdi>{value.label}</bdi></b>
              </span>
            </li>
          );
        })}
      </ul>
    </Reveal>
  );
}

export function WhatsappPlans({ locale }: { locale: Locale }) {
  const page = getDictionary(locale).packagesPage;
  const text = page.whatsapp;
  const signupUrl = getSite().appUrls.signup;

  return (
    <section className={styles.section} id="whatsapp-plans">
      <div className="site-container">
        <SectionHeading eyebrow={text.eyebrow} title={text.title} lead={text.lead} />
        <BillingSwitch labels={text.billing}>
          <div className={styles.plans}>
            {getWhatsappPlans().map((plan, i) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                text={text}
                locale={locale}
                signupUrl={signupUrl}
                delay={i * 0.08}
              />
            ))}
          </div>
        </BillingSwitch>
        <p className={styles.note}>
          <Info aria-hidden="true" />
          {page.vatNote}
        </p>
      </div>
    </section>
  );
}
