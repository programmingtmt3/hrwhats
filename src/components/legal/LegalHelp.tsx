import Link from "next/link";

import { ChatBubbleIcon, MailIcon, PhoneIcon } from "@/components/icons";
import { getSite } from "@/lib/content";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";
import { getLegalLinks, type LegalSlug } from "@/lib/navigation";

import styles from "./Legal.module.css";

/** End of a legal page: contact channels from site.json + links to the other two policies. */
export function LegalHelp({ locale, current }: { locale: Locale; current: LegalSlug }) {
  const dict = getDictionary(locale);
  const text = dict.legal.help;
  const { contact } = getSite();
  const others = getLegalLinks(dict).filter((link) => link.href !== `/${current}/`);

  return (
    <aside className={styles.help} aria-labelledby="legal-help-title">
      <h2 id="legal-help-title">{text.title}</h2>
      <ul className={styles.channels}>
        <li>
          <PhoneIcon />
          <span>{text.phone}</span>
          <a href={contact.phone.href} dir="ltr">
            {contact.phone.display}
          </a>
        </li>
        <li>
          <MailIcon />
          <span>{text.email}</span>
          <a href={`mailto:${contact.email}`} dir="ltr">
            {contact.email}
          </a>
        </li>
        <li>
          <ChatBubbleIcon />
          <span>{text.whatsapp}</span>
          <a href={contact.whatsapp.url} target="_blank" rel="noopener" dir="ltr">
            {contact.whatsapp.display}
          </a>
        </li>
      </ul>
      <Link href={localePath(locale, "/contact/")} className={styles.contactLink}>
        {text.contactPage}
      </Link>

      <nav className={styles.others} aria-labelledby="legal-others-title">
        <h3 id="legal-others-title">{dict.legal.otherPolicies}</h3>
        <ul>
          {others.map((link) => (
            <li key={link.href}>
              <Link href={localePath(locale, link.href)}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
