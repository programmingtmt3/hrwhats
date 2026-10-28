import localFont from "next/font/local";

// Self-hosted (src/fonts/, OFL): no request to Google Fonts in dev or build.
// IBM Plex Sans Arabic from the official @ibm/plex-sans-arabic 1.1.0 files,
// subset to Arabic + Latin (Plex Arabic's Latin glyphs match IBM Plex Sans, so
// mixed text like "HRwhats" needs no second font). Only the weights the site
// uses (400–700); `800` in CSS renders with 700.
// adjustFontFallback sizes the Arial fallback to Plex's metrics, so the page
// does not jump when the font swaps in.
export const arabicFont = localFont({
  src: [
    { path: "../../fonts/IBMPlexSansArabic-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../fonts/IBMPlexSansArabic-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../fonts/IBMPlexSansArabic-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../fonts/IBMPlexSansArabic-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-arabic",
  display: "swap",
  adjustFontFallback: "Arial",
});
