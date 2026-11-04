import {
  ArrowDown,
  BellOff,
  ChartColumn,
  Check,
  Contact,
  Flag,
  LayoutTemplate,
  Megaphone,
  MessagesSquare,
  Repeat,
  Send,
  ShieldAlert,
  UsersRound,
  UserX,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";

import { ArrowIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { NewTabLink } from "@/components/ui/NewTabLink";
import { getSite } from "@/lib/content";
import { format, type Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { Checklist } from "./Checklist";
import styles from "./WhatsappBan.module.css";

type Page = Dictionary["whatsappBan"];
type HelpKey = keyof Page["help"]["items"];

const childStyle = (i: number) => ({ "--i": i }) as CSSProperties;

/** Centered section heading (the design's `.sec-head`). */
function Heading({ title, lead }: { title: string; lead?: string }) {
  return (
    <Reveal className="sec-head">
      <h2>{title}</h2>
      {lead && <p>{lead}</p>}
    </Reveal>
  );
}

/** 1 (after the hero): the problem, the key sentence, and the HRwhats way. */
export function Intro({ text }: { text: Page["intro"] }) {
  return (
    <section className={styles.intro}>
      <Reveal className={cn("site-container", styles.introBody)}>
        <p>{text.text}</p>
        <p className={styles.keyLine}>{text.highlight}</p>
        <p>{text.platform}</p>
      </Reveal>
    </section>
  );
}

// One icon per practice, in the order of the list; all in calm warning badges.
const reasonIcons: LucideIcon[] = [Send, Wrench, UserX, Flag, Repeat, BellOff, ShieldAlert];

/** 2: why a number may be banned — seven practices. */
export function Reasons({ text }: { text: Page["reasons"] }) {
  return (
    <section className={styles.section}>
      <div className="site-container">
        <Heading title={text.title} lead={text.lead} />
        <Reveal as="ul" className={styles.reasons}>
          {text.items.map((item, i) => {
            const Icon = reasonIcons[i] ?? ShieldAlert;
            return (
              <li key={item} className="reveal-child" style={childStyle(i)}>
                <span className={styles.warn}>
                  <Icon aria-hidden="true" />
                </span>
                {item}
              </li>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}

/** 3: the honest answer — the page's most important message. */
export function Honest({ text }: { text: Page["honest"] }) {
  return (
    <section className={styles.section}>
      <div className="site-container">
        <Reveal className={styles.honest}>
          <h2>{text.question}</h2>
          <p className={styles.statement}>{text.statement}</p>
          <p>{text.text}</p>
          <p>
            {text.promise.before}
            <strong className={styles.quote}>{text.promise.quote}</strong>
            {text.promise.after}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * 4: traditional sending vs WhatsApp API. A real table (explicit roles, so the
 * semantics survive the phone layout, where each row becomes a card with both
 * column names as labels — no horizontal scroll).
 */
export function Compare({ text }: { text: Page["compare"] }) {
  return (
    <section className={styles.section}>
      <div className="site-container">
        <Heading title={text.title} />
        <Reveal>
          <table className={styles.compare} role="table">
            <thead role="rowgroup">
              <tr role="row">
                <th role="columnheader" scope="col">
                  {text.traditional}
                </th>
                <th role="columnheader" scope="col">
                  {text.api}
                </th>
              </tr>
            </thead>
            <tbody role="rowgroup">
              {text.rows.map((row) => (
                <tr key={row.api} role="row">
                  <td role="cell" data-label={text.traditional} className={styles.old}>
                    <X aria-hidden="true" />
                    {row.traditional}
                  </td>
                  <td role="cell" data-label={text.api} className={styles.new}>
                    <Check aria-hidden="true" />
                    {row.api}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div>
    </section>
  );
}

const helpIcons: Record<HelpKey, LucideIcon> = {
  api: MessagesSquare,
  campaigns: Megaphone,
  crm: Contact,
  team: UsersRound,
  templates: LayoutTemplate,
  reports: ChartColumn,
};

/** 5: how HRwhats helps — six cards. */
export function Help({ text }: { text: Page["help"] }) {
  const keys = Object.keys(text.items) as HelpKey[];
  return (
    <section className={styles.section}>
      <div className="site-container">
        <Heading title={text.title} lead={text.lead} />
        <Reveal as="ul" className={styles.help}>
          {keys.map((key, i) => {
            const Icon = helpIcons[key];
            const item = text.items[key];
            return (
              <li key={key} className={cn("reveal-child", styles.helpCard)} style={childStyle(i)}>
                <span className={styles.helpIcon}>
                  <Icon aria-hidden="true" />
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}

/** 6: before any campaign — an interactive self-check (nothing is saved or sent). */
export function BeforeCampaign({ text }: { text: Page["checklist"] }) {
  return (
    <section className={styles.section}>
      <div className="site-container">
        <Heading title={text.title} lead={text.lead} />
        <Reveal className={styles.checklistWrap}>
          <Checklist
            items={text.items}
            progress={text.progress}
            progressLabel={text.progressLabel}
            groupLabel={text.title}
          />
          <p className={styles.checkNote}>{text.note}</p>
        </Reveal>
      </div>
    </section>
  );
}

/** 7: a large customer base — six steps joined by arrows (vertical on phones). */
export function Steps({ text }: { text: Page["steps"] }) {
  return (
    <section className={styles.section}>
      <div className="site-container">
        <Heading title={text.title} lead={text.text} />
        <Reveal className={styles.stepsWrap}>
          <p className={styles.best}>{text.best}</p>
          <ol className={styles.steps}>
            {text.items.map((item, i) => (
              <li key={item} className="reveal-child" style={childStyle(i)}>
                <span className={styles.stepNum}>{i + 1}</span>
                <span className={styles.stepText}>{item}</span>
                {i < text.items.length - 1 && (
                  <span className={styles.arrow} aria-hidden="true">
                    <ArrowIcon className={cn("icon-forward", styles.arrowSide)} />
                    <ArrowDown className={styles.arrowDown} />
                  </span>
                )}
              </li>
            ))}
          </ol>
          <p className={styles.stepsAfter}>
            {text.after.before}
            <strong>{text.after.strong}</strong>
            {text.after.after}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/** 8: already banned? — calm, practical guidance. */
export function AlreadyBanned({ text }: { text: Page["banned"] }) {
  return (
    <section className={styles.section}>
      <div className="site-container">
        <Reveal className={styles.banned}>
          <span className={styles.bannedIcon}>
            <ShieldAlert aria-hidden="true" />
          </span>
          <div>
            <h2>{text.question}</h2>
            {text.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** 9: conclusion + call to action (the page's own closing; no site-wide <Cta> after it). */
export function Closing({ text, newTab }: { text: Page["closing"]; newTab: string }) {
  const site = getSite();
  return (
    <section className={styles.closingSection}>
      <div className="site-container">
        <Reveal className={styles.closing}>
          <h2>{text.title}</h2>
          <p>{text.lead}</p>
          <ul className={styles.uses}>
            {text.uses.map((use, i) => (
              <li key={use} className="reveal-child" style={childStyle(i)}>
                {use}
              </li>
            ))}
          </ul>
          <p>{text.after}</p>
          <div className={styles.start}>
            <h3>{text.startTitle}</h3>
            <p>{text.startText}</p>
            <div className="hero-actions">
              <a href={site.appUrls.signup} className="btn btn-primary">
                {text.trial}
              </a>
              <NewTabLink
                href={site.contact.whatsapp.url}
                label={format(newTab, { label: text.consult })}
                className="btn btn-outline-light"
              >
                {text.consult}
              </NewTabLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
