import { Lock, ShieldCheck } from "lucide-react";

import { WhatsAppIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { getSite } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import styles from "./Checkout.module.css";
import receipt from "./Receipt.module.css";

/** The page's closing words and call to action as a checkout "order summary". */
export function Checkout({ locale }: { locale: Locale }) {
  const { closing } = getDictionary(locale).sectors.stores;
  const site = getSite();

  return (
    <section>
      <div className="site-container">
        <Reveal className={cn(receipt.zigzagTop, receipt.zigzagBottom, styles.summary)}>
          <p className={styles.summaryTitle}>{closing.summaryTitle}</p>
          <p className={styles.item}>
            <span>{closing.item}</span>
            <b>{closing.itemPrice}</b>
          </p>
          <hr className={receipt.rule} />

          <h2>{closing.title}</h2>
          <p>{closing.text}</p>
          <p className={styles.highlight}>{closing.highlight}</p>

          <a href={site.appUrls.signup} className={cn("btn btn-primary", styles.pay)}>
            <Lock aria-hidden="true" />
            {closing.primaryCta}
          </a>
          <p className={styles.safe}>
            <ShieldCheck aria-hidden="true" />
            {closing.noCommitment}
          </p>
          <a href={site.contact.whatsapp.url} className={styles.sales} target="_blank" rel="noopener">
            <WhatsAppIcon />
            {closing.salesCta}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
