import type { Metadata } from "next";

import { BlogListPage } from "@/components/pages/BlogListPage";
import { getBlogListMetadata } from "@/lib/blog";
import { getCategories } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCategories().map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: PageProps<"/category/[category]">): Promise<Metadata> {
  return getBlogListMetadata("ar", { category: (await params).category });
}

export default async function Page({ params }: PageProps<"/category/[category]">) {
  return <BlogListPage locale="ar" list={{ category: (await params).category }} />;
}
