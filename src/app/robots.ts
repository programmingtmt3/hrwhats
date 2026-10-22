import type { MetadataRoute } from "next";

import { isProduction } from "@/lib/env";

// Required by `output: "export"`: emit out/robots.txt at build time.
export const dynamic = "force-static";

// Staging: block everything. Production: allow all. (The sitemap line is added
// with app/sitemap.ts in the launch phase — production only.)
export default function robots(): MetadataRoute.Robots {
  return isProduction
    ? { rules: { userAgent: "*", allow: "/" } }
    : { rules: { userAgent: "*", disallow: "/" } };
}
