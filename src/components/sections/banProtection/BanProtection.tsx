import { Ban, Store } from "lucide-react";
import Link from "next/link";

import { ArrowIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { NewTabLink } from "@/components/ui/NewTabLink";
import { getSite } from "@/lib/content";
import { format, getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { localizeLink } from "@/lib/navigation";
import { cn } from "@/lib/utils";

import styles from "./BanProtection.module.css";
import { StoryStage } from "./StoryStage";

type PhoneText = Dictionary["home"]["banProtection"]["phone"];

/** Filled shield with a check mark, drawn in code. */
function Shield() {
  return (
    <svg viewBox="0 0 64 72" aria-hidden="true" className={styles.shieldSvg}>
      <path d="M32 3 6 13v20c0 17 11 30 26 36 15-6 26-19 26-36V13L32 3Z" />
      <path d="m20 36 8.5 8.5L45 28" className={styles.check} />
    </svg>
  );
}

/*
 * Phone drawn in code: an account screen (no chat, unlike the hero phone)
 * whose status tells a short story once, timed from when the phone is on
 * screen (StoryStage): a calm red "banned" warning (≈1–3.5s) → a green
 * shield lands (≈3.3s) → the warning goes and the ring turns green (3.8s) →
 * "verified" (4s). Base styles are the final state, so reduced motion (and no
 * JS) shows "verified" straight away. Decorative: one accessible label
 * describes it.
 */
function StatusPhone({ text }: { text: PhoneText }) {
  return (
    <StoryStage className={styles.visual} label={text.label}>
      <span className={styles.shield}>
        <Shield />
      </span>
      <div className={styles.phone}>
        <span className={styles.notch} />
        <div className={styles.screen}>
          <span className={styles.avatar}>
            <Store />
          </span>
          <span className={styles.account}>{text.account}</span>
          <span className={styles.lines}>
            <i />
            <i />
          </span>
          <span className={styles.status}>
            <span className={cn(styles.badge, styles.banned)}>
              <Ban />
              {text.banned}
            </span>
            <span className={cn(styles.badge, styles.verified)}>{text.verified}</span>
          </span>
          <span className={styles.lines}>
            <i />
            <i />
            <i />
          </span>
        </div>
      </div>
    </StoryStage>
  );
}

/** Home: "worried about WhatsApp bans?" — dark panel between the trust bar and the features. */
export function BanProtection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const banPage = localizeLink(locale, "/whatsapp-ban/", dict.home.banProtection.learnMore);
  const text = dict.home.banProtection;
  const { whatsapp } = getSite().contact;

  return (
    <section className={styles.section}>
      <div className="site-container">
        <Reveal className={styles.panel}>
          <div className={styles.copy}>
            <span className="eyebrow">{text.eyebrow}</span>
            <h2>{text.title}</h2>
            <p className={styles.subtitle}>
              {text.subtitle.before}
              <span className="grad">{text.subtitle.highlight}</span>
              {text.subtitle.after}
            </p>
            <p className={styles.description}>{text.description}</p>
            <div className={styles.actions}>
              <NewTabLink
                href={whatsapp.url}
                label={format(dict.nav.newTab, { label: text.cta })}
                className={cn("btn btn-primary", styles.cta)}
              >
                {text.cta}
                <ArrowIcon className="icon-forward" />
              </NewTabLink>
              <Link href={banPage.href} hrefLang={banPage.hrefLang} className={styles.learnMore}>
                {banPage.label}
              </Link>
            </div>
          </div>
          <StatusPhone text={text.phone} />
        </Reveal>
      </div>
    </section>
  );
}
