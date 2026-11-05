import Link from "next/link";

import { WhatsAppIcon } from "@/components/icons";
import { NewTabLink } from "@/components/ui/NewTabLink";
import { format, getDictionary, localePath, type Locale } from "@/lib/i18n";

import styles from "./Post.module.css";

/** Points a reader of a ban article to the page explaining the causes. */
export function BanContextBox({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <aside className={styles.contextBox}>
      <div>
        <h2>{dict.blog.banContext.title}</h2>
        <p>{dict.blog.banContext.text}</p>
      </div>
      <Link href={localePath(locale, "/whatsapp-ban/")} className="btn btn-ghost btn-sm">
        {dict.home.banProtection.learnMore}
      </Link>
    </aside>
  );
}

/** Shares the post through WhatsApp: its title and final URL, nothing else. */
export function PostShare({ title, url, locale }: { title: string; url: string; locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <NewTabLink
      href={`https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`}
      label={format(dict.nav.newTab, { label: dict.blog.share })}
      className={`btn btn-ghost btn-sm ${styles.share}`}
    >
      <WhatsAppIcon aria-hidden="true" />
      {dict.blog.share}
    </NewTabLink>
  );
}
