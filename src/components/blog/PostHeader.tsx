import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { blogListPath } from "@/lib/blog";
import { getCategory, t, type Post } from "@/lib/content";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";

import styles from "./Post.module.css";

/** Breadcrumb, title and categories; the categories link to their listing pages. */
export function PostHeader({ post, locale }: { post: Post; locale: Locale }) {
  const dict = getDictionary(locale);
  const categories = post.categories.map((slug) => ({
    name: t(getCategory(slug).name, locale),
    href: localePath(locale, blogListPath({ category: slug })),
  }));
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
          <li>
            <Link href={categories[0].href}>{categories[0].name}</Link>
          </li>
        </ol>
      </nav>
      <h1>{post.title}</h1>
      <ul className={styles.categories}>
        {categories.map((category) => (
          <li key={category.href}>
            <Link href={category.href}>{category.name}</Link>
          </li>
        ))}
      </ul>
    </header>
  );
}
