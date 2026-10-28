import localFont from "next/font/local";

// Used by the English root layout (English phase). Kept in its own module so
// Arabic pages never load it. Self-hosted like ar.ts: IBM Plex Sans from the
// official @ibm/plex-sans 1.1.0 files, subset to Latin, weights 400–700.
export const latinFont = localFont({
  src: [
    { path: "../../fonts/IBMPlexSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../fonts/IBMPlexSans-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../fonts/IBMPlexSans-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../fonts/IBMPlexSans-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-latin",
  display: "swap",
  adjustFontFallback: "Arial",
});
