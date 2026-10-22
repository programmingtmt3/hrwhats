import type { NextConfig } from "next";

import { SITE_ENV } from "./src/lib/env";

// Make the build target obvious in every build log (Hostinger, local).
console.log(
  SITE_ENV === "production"
    ? "▶ SITE_ENV=production — indexable site (robots allow, no noindex)"
    : "▶ SITE_ENV=staging — NOT indexable (robots.txt Disallow: /, noindex on every page, no sitemap)",
);

// Static export for shared cPanel hosting — no Node server in production.
// Do not add redirects/rewrites/headers here: they are ignored by `output: 'export'`.
// Redirects are generated into out/.htaccess by scripts/generate-htaccess.ts.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    // next-image-export-optimizer: images are optimized at build time
    // (`next-image-export-optimizer` runs after `next build`).
    loader: "custom",
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  },
  transpilePackages: ["next-image-export-optimizer"],
  env: {
    nextImageExportOptimizer_imageFolderPath: "public/images",
    nextImageExportOptimizer_exportFolderPath: "out",
    nextImageExportOptimizer_quality: "80",
    nextImageExportOptimizer_storePicturesInWEBP: "true",
    nextImageExportOptimizer_exportFolderName: "nextImageExportOptimizer",
    // The design shows no blur placeholders.
    nextImageExportOptimizer_generateAndUseBlurImages: "false",
    nextImageExportOptimizer_remoteImageCacheTTL: "0",
  },
  experimental: {
    // Multiple root layouts ((ar) and later (en)) have no shared layout to
    // compose a 404 from, so out/404.html comes from app/global-not-found.tsx.
    globalNotFound: true,
  },
};

export default nextConfig;
