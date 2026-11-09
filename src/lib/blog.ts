/**
 * Blog listings: /news/ and /category/<slug>/, each paginated as WordPress did
 * (/news/page/2/, /category/<slug>/page/2/). Page 1 has no /page/1/ URL.
 */
import type { Metadata } from "next";

import { getCategory, getPosts, getPostsInCategory, t, type Post } from "./content";
import { format, getDictionary, type Dictionary, type Locale } from "./i18n";
import { getPageMetadata } from "./seo";

export const POSTS_PER_PAGE = 9;

/** `undefined` = the whole blog (/news/); otherwise a category slug. */
export type BlogList = { category?: string };

type CategoryKey = keyof Dictionary["blog"]["list"]["categories"];

/** Path of a listing page; page 1 is the listing's own URL. */
export function blogListPath({ category }: BlogList, page = 1): string {
  const base = category ? `/category/${category}/` : "/news/";
  return page > 1 ? `${base}page/${page}/` : base;
}

export function getBlogListPosts(locale: Locale, { category }: BlogList): Post[] {
  return category ? getPostsInCategory(locale, category) : getPosts(locale);
}

export function getPageCount(postCount: number): number {
  return Math.max(1, Math.ceil(postCount / POSTS_PER_PAGE));
}

/** generateStaticParams for the /page/N/ routes: pages 2..N only. */
export function getExtraPageNumbers(locale: Locale, list: BlogList): string[] {
  const count = getPageCount(getBlogListPosts(locale, list).length);
  return Array.from({ length: count - 1 }, (_, i) => String(i + 2));
}

/** The listing's title base and description (ar.json → blog.list). Throws on a category without texts. */
export function getBlogListTexts(locale: Locale, { category }: BlogList) {
  const list = getDictionary(locale).blog.list;
  if (!category) return list.news;
  getCategory(category);
  const texts = list.categories[category as CategoryKey];
  if (!texts) throw new Error(`Missing blog.list.categories["${category}"] in messages/${locale}.json`);
  return texts;
}

/** Display name of the listing: "المدونة" or the category's name (categories.json). */
export function getBlogListName(locale: Locale, { category }: BlogList): string {
  return category ? t(getCategory(category).name, locale) : getDictionary(locale).nav.blog;
}

/** Parse and check a page param ("2".."N"); throws if out of range. */
export function parsePage(locale: Locale, list: BlogList, param: string): number {
  if (!getExtraPageNumbers(locale, list).includes(param)) {
    throw new Error(`Page "${param}" does not exist in ${blogListPath(list)}`);
  }
  return Number(param);
}

/**
 * WordPress (Yoast) title format, brand spelling unified:
 * "تسويق الأرشيف - الصفحة 2 من 4 - حلول واتس اب اعمال | HRwhats".
 */
export function getBlogListMetadata(locale: Locale, list: BlogList, page = 1): Metadata {
  const dict = getDictionary(locale).blog.list;
  const texts = getBlogListTexts(locale, list);
  const total = getPageCount(getBlogListPosts(locale, list).length);
  const pagePart = page > 1 ? ` - ${format(dict.pageOf, { page, total })}` : "";

  return getPageMetadata(locale, blogListPath(list, page), {
    title: `${texts.titleBase}${pagePart}${dict.titleSuffix}`,
    description: texts.description,
  });
}
