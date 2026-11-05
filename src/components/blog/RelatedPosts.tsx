import Link from "next/link";

import { getRelatedPosts, type Post } from "@/lib/content";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";

import { PostCover } from "./covers";
import styles from "./Post.module.css";

/** Renders nothing while the post has no related posts. */
export function RelatedPosts({ post, locale }: { post: Post; locale: Locale }) {
  const related = getRelatedPosts(locale, post);
  if (related.length === 0) return null;

  return (
    <section className={`site-container ${styles.related}`}>
      <h2>{getDictionary(locale).blog.related}</h2>
      <ul>
        {related.map((item) => (
          <li key={item.slug}>
            <Link href={localePath(locale, `/${item.slug}/`)} className={styles.relatedCard}>
              <PostCover cover={item.cover} />
              <span>{item.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
