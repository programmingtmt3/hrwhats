import type { Metadata } from "next";

import { BlogListPage } from "@/components/pages/BlogListPage";
import { getBlogListMetadata, getExtraPageNumbers, parsePage } from "@/lib/blog";

// Pages 2..N only: /news/page/1/ is not built (301 to /news/ at launch).
export const dynamicParams = false;

export function generateStaticParams() {
  return getExtraPageNumbers("ar", {}).map((page) => ({ page }));
}

export async function generateMetadata({ params }: PageProps<"/news/page/[page]">): Promise<Metadata> {
  return getBlogListMetadata("ar", {}, parsePage("ar", {}, (await params).page));
}

export default async function Page({ params }: PageProps<"/news/page/[page]">) {
  return <BlogListPage locale="ar" list={{}} page={parsePage("ar", {}, (await params).page)} />;
}
