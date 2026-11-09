import { BlogListPage } from "@/components/pages/BlogListPage";
import { getBlogListMetadata } from "@/lib/blog";

export const metadata = getBlogListMetadata("ar", {});

export default function Page() {
  return <BlogListPage locale="ar" list={{}} />;
}
