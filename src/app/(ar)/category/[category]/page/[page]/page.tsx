import type { Metadata } from "next";

import { BlogListPage } from "@/components/pages/BlogListPage";
import { getBlogListMetadata, getExtraPageNumbers, parsePage } from "@/lib/blog";
import { getCategories } from "@/lib/content";

// Pages 2..N of categories that have them; /category/<slug>/page/1/ is not built.
export const dynamicParams = false;

export function generateStaticParams() {
  return getCategories().flatMap(({ slug }) =>
    getExtraPageNumbers("ar", { category: slug }).map((page) => ({ category: slug, page })),
  );
}

type Props = PageProps<"/category/[category]/page/[page]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, page } = await params;
  return getBlogListMetadata("ar", { category }, parsePage("ar", { category }, page));
}

export default async function Page({ params }: Props) {
  const { category, page } = await params;
  return <BlogListPage locale="ar" list={{ category }} page={parsePage("ar", { category }, page)} />;
}
