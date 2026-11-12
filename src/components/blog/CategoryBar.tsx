import Link from "next/link";

import { blogListPath, type BlogList } from "@/lib/blog";
import { getCategories, tRequired } from "@/lib/content";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";

import styles from "./BlogList.module.css";

/**
 * "All posts" + every category, as real links. The current listing is marked
 * with aria-current: "page" on its first page, "true" on its later pages
 * (the link then leads to page 1, not to the page being read).
 */
export function CategoryBar({ locale, list, page }: { locale: Locale; list: BlogList; page: number }) {
  const dict = getDictionary(locale).blog.list;
  const items: { key: string; label: string; list: BlogList }[] = [
    { key: "news", label: dict.allPosts, list: {} },
    ...getCategories().map((category) => ({
      key: category.slug,
      label: tRequired(category.name, locale),
      list: { category: category.slug },
    })),
  ];

  return (
    <nav aria-label={dict.categoriesLabel} className={styles.categoryBar}>
      <ul>
        {items.map((item) => {
          const current = item.list.category === list.category;
          return (
            <li key={item.key}>
              <Link
                href={localePath(locale, blogListPath(item.list))}
                aria-current={current ? (page === 1 ? "page" : "true") : undefined}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
