import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { getCategory, t, type Post } from "@/lib/content";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";

import styles from "./Post.module.css";

/** Breadcrumb, title and categories (plain text until the category pages exist). */
export function PostHeader({ post, locale }: { post: Post; locale: Locale }) {
  const dict = getDictionary(locale);
  const categories = post.categories.map((slug) => t(getCategory(slug).name, locale));
  const separator = <ChevronLeft className="icon-forward" aria-hidden="true" />;

  return (
    <header className={`site-container ${styles.head}`}>
      <nav aria-label={dict.blog.breadcrumbLabel}>
        <ol className={styles.breadcrumb}>
          <li>
            <Link href={localePath(locale, "/")}>{dict.nav.home}</Link>
            {separator}
          </li>
          <li>
            <Link href={localePath(locale, "/news/")}>{dict.nav.blog}</Link>
            {separator}
          </li>
          <li>{categories[0]}</li>
        </ol>
      </nav>
      <h1>{post.title}</h1>
      <ul className={styles.categories}>
        {categories.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </header>
  );
}
