import { IBM_Plex_Sans_Arabic } from "next/font/google";

// Includes the Latin subset: Plex Arabic ships Latin glyphs matching IBM Plex Sans,
// so mixed text ("HRwhats") on Arabic pages needs no second font.
export const arabicFont = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-arabic",
  display: "swap",
});
