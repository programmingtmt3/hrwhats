import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { blogListPath, type BlogList } from "@/lib/blog";
import { format, getDictionary, localePath, type Locale } from "@/lib/i18n";

import styles from "./BlogList.module.css";

/**
 * Page links of a listing. Renders nothing for a single page. Arrows are drawn
 * for RTL (previous → right, next → left) and flip in LTR via .icon-forward.
 */
export function Pagination({
  locale,
  list,
  page,
  total,
}: {
  locale: Locale;
  list: BlogList;
  page: number;
  total: number;
}) {
  if (total <= 1) return null;
  const dict = getDictionary(locale).blog.list;
  const href = (n: number) => localePath(locale, blogListPath(list, n));

  return (
    <nav aria-label={dict.paginationLabel} className={styles.pagination}>
      <ul>
        {page > 1 && (
          <li>
            <Link href={href(page - 1)} rel="prev" className={styles.step}>
              <ChevronRight className="icon-forward" aria-hidden="true" />
              <span className={styles.stepText}>{dict.previous}</span>
            </Link>
          </li>
        )}
        {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
          <li key={n}>
            <Link
              href={href(n)}
              className={styles.number}
              aria-current={n === page ? "page" : undefined}
              aria-label={format(dict.page, { page: n })}
            >
              {n}
            </Link>
          </li>
        ))}
        {page < total && (
          <li>
            <Link href={href(page + 1)} rel="next" className={styles.step}>
              <span className={styles.stepText}>{dict.next}</span>
              <ChevronLeft className="icon-forward" aria-hidden="true" />
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
