import Link from "next/link";

import { WhatsAppIcon } from "@/components/icons";
import { NewTabLink } from "@/components/ui/NewTabLink";
import { getSector, tRequired, type Post } from "@/lib/content";
import { format, getDictionary, localePath, type Locale } from "@/lib/i18n";

import styles from "./Post.module.css";

type BoxText = { title: string; text: string; button: string; href: string };

function contextText(post: Post, locale: Locale): BoxText | null {
  const dict = getDictionary(locale);
  const texts = dict.blog.context;
  switch (post.context) {
    case "unblock":
    case "avoid":
      return { ...texts[post.context], button: dict.home.banProtection.learnMore, href: "/whatsapp-ban/" };
    case "sector": {
      // velite.config.ts guarantees a sector with its own page here.
      const sector = getSector(post.cover.sector ?? "");
      const name = tRequired(sector.name, locale);
      const titles: Record<string, string> = texts.sector.titleBySector;
      return {
        title: titles[sector.slug] ?? format(texts.sector.title, { sector: name }),
        text: texts.sector.text,
        button: format(texts.sector.button, { sector: name }),
        href: `/${sector.slug}/`,
      };
    }
    default:
      return null;
  }
}

/** Points the reader to the page this post leads to: the ban page or a sector page. */
export function ContextBox({ post, locale }: { post: Post; locale: Locale }) {
  const box = contextText(post, locale);
  if (!box) return null;
  return (
    <aside className={styles.contextBox}>
      <div>
        <h2>{box.title}</h2>
        <p>{box.text}</p>
      </div>
      <Link href={localePath(locale, box.href)} className="btn btn-ghost btn-sm">
        {box.button}
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
