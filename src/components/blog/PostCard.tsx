import Link from "next/link";

import { getCategory, t, type Post } from "@/lib/content";
import { localePath, type Locale } from "@/lib/i18n";

import styles from "./BlogList.module.css";
import { PostCover } from "./covers";

/**
 * One post in a listing: the whole card is a single link. Its accessible name
 * is the title; the category and description are its description. No date and
 * no reading time (see CLAUDE.md).
 */
export function PostCard({ post, locale, id }: { post: Post; locale: Locale; id: string }) {
  const category = t(getCategory(post.categories[0]).name, locale);

  return (
    <Link
      href={localePath(locale, `/${post.slug}/`)}
      className={styles.card}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-category ${id}-text`}
    >
      <PostCover cover={post.cover} className={styles.cover} />
      <div className={styles.cardBody}>
        <span id={`${id}-category`} className={styles.cardCategory}>
          {category}
        </span>
        <h2 id={`${id}-title`} className={styles.cardTitle}>
          {post.title}
        </h2>
        <p id={`${id}-text`} className={styles.cardText}>
          {post.description}
        </p>
      </div>
    </Link>
  );
}
