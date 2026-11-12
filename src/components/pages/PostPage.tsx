import { notFound } from "next/navigation";

import { PostCover } from "@/components/blog/covers";
import { ContextBox, PostShare } from "@/components/blog/PostAside";
import { PostBody } from "@/components/blog/PostBody";
import { PostHeader } from "@/components/blog/PostHeader";
import styles from "@/components/blog/Post.module.css";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { Cta } from "@/components/sections/cta/Cta";
import { PageGlow } from "@/components/sections/PageGlow";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageToc } from "@/components/shared/PageToc";
import { getCategory, getPostBySlug, tRequired } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { articleJsonLd, breadcrumbJsonLd, getPostUrl } from "@/lib/seo";

/** One blog post. `slug` is the route param, percent-encoded by Next. */
export function PostPage({ locale, slug }: { locale: Locale; slug: string }) {
  const post = getPostBySlug(locale, slug);
  if (!post) notFound();

  const dict = getDictionary(locale);
  const url = getPostUrl(post);

  return (
    <>
      {/* Raw Arabic, as WordPress writes it: Next's metadata would percent-encode these. */}
      <link rel="canonical" href={url} />
      <meta property="og:url" content={url} />
      <JsonLd data={articleJsonLd(post)} />
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          [dict.nav.home, "/"],
          [dict.nav.blog, "/news/"],
          [tRequired(getCategory(post.categories[0]).name, locale), `/category/${post.categories[0]}/`],
          [post.title, `/${post.slug}/`],
        ])}
      />
      <PageGlow>
        <PostHeader post={post} locale={locale} />
        <div className="site-container">
          <PostCover cover={post.cover} animated />
        </div>
        <div className={`site-container ${styles.layout}`}>
          <PageToc items={post.toc} title={dict.blog.toc.title} label={dict.blog.toc.label} />
          <div>
            <PostBody code={post.body} locale={locale} />
            <ContextBox post={post} locale={locale} />
            <PostShare title={post.title} url={url} locale={locale} />
          </div>
        </div>
        <RelatedPosts post={post} locale={locale} />
      </PageGlow>
      <Cta locale={locale} />
    </>
  );
}
