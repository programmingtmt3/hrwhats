import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostPage } from "@/components/pages/PostPage";
import { getPostBySlug, getPosts } from "@/lib/content";
import { getPostMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts("ar").map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const post = getPostBySlug("ar", (await params).slug);
  if (!post) notFound();
  return getPostMetadata("ar", post);
}

export default async function Page({ params }: PageProps<"/[slug]">) {
  return <PostPage locale="ar" slug={(await params).slug} />;
}
