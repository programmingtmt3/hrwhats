// Tailwind v4 through PostCSS — used by both Turbopack (`npm run dev`) and
// Webpack (`npm run build`). Replaces the old `turbopack.rules` loader, which
// crashed on Hostinger (Turbopack could not start its loader subprocess).
//
// Production (Webpack) also gets Next's own default prefixing step: a custom
// PostCSS config turns Next's default off, and without it CSS Modules lose
// -webkit- prefixes (backdrop-filter, mask-image) for older Safari. Same
// options as Next's built-in default. Dev (Turbopack) prefixes with
// Lightning CSS itself, so it is not added there.
const isProductionBuild = process.env.NODE_ENV === "production";

const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    ...(isProductionBuild && {
      "next/dist/compiled/postcss-preset-env": {
        autoprefixer: { flexbox: "no-2009" },
        stage: 3,
        features: { "custom-properties": false },
      },
    }),
  },
};

export default config;
