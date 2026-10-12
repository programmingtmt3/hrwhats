import type { NextConfig } from "next";

// Static export for shared cPanel hosting — no Node server in production.
// Do not add redirects/rewrites/headers here: they are ignored by `output: 'export'`.
// Redirects are generated into out/.htaccess by scripts/generate-htaccess.ts.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    // Temporary until next-image-export-optimizer is added.
    unoptimized: true,
  },
  experimental: {
    // Multiple root layouts ((ar) and later (en)) have no shared layout to
    // compose a 404 from, so out/404.html comes from app/global-not-found.tsx.
    globalNotFound: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
