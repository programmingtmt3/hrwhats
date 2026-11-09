import { CategoryBar } from "@/components/blog/CategoryBar";
import styles from "@/components/blog/BlogList.module.css";
import { Pagination } from "@/components/blog/Pagination";
import { PostCard } from "@/components/blog/PostCard";
import { Cta } from "@/components/sections/cta/Cta";
import { PageGlow } from "@/components/sections/PageGlow";
import { PageHero } from "@/components/sections/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  blogListPath,
  getBlogListName,
  getBlogListPosts,
  getBlogListTexts,
  getPageCount,
  POSTS_PER_PAGE,
  type BlogList,
} from "@/lib/blog";
import { format, getDictionary, type Locale } from "@/lib/i18n";
import { breadcrumbJsonLd } from "@/lib/seo";

/** /news/ and /category/<slug>/, page `page` (1 = the listing's own URL). */
export function BlogListPage({ locale, list, page = 1 }: { locale: Locale; list: BlogList; page?: number }) {
  const dict = getDictionary(locale);
  const all = getBlogListPosts(locale, list);
  const total = getPageCount(all.length);
  const posts = all.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);
  const name = getBlogListName(locale, list);
  const pageOf = page > 1 ? format(dict.blog.list.pageOf, { page, total }) : undefined;

  const crumbs: [string, string][] = [
    [dict.nav.home, "/"],
    [dict.nav.blog, "/news/"],
  ];
  if (list.category) crumbs.push([name, blogListPath(list)]);
  if (pageOf) crumbs.push([pageOf, blogListPath(list, page)]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />
      <PageGlow>
        <PageHero
          eyebrow={[list.category ? dict.nav.blog : undefined, pageOf].filter(Boolean).join(" · ") || undefined}
          title={{ before: "", highlight: name, after: "" }}
          lead={getBlogListTexts(locale, list).description}
        />
        <div className={`site-container ${styles.listing}`}>
          <CategoryBar locale={locale} list={list} page={page} />
          <ul className={styles.grid}>
            {posts.map((post, i) => (
              <li key={post.slug}>
                <PostCard post={post} locale={locale} id={`post-${i + 1}`} />
              </li>
            ))}
          </ul>
          <Pagination locale={locale} list={list} page={page} total={total} />
        </div>
      </PageGlow>
      <Cta locale={locale} />
    </>
  );
}
