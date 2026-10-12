import { IBM_Plex_Sans } from "next/font/google";

// Used by the English root layout (English phase). Kept in its own module so
// Arabic pages never load it.
export const latinFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-latin",
  display: "swap",
});
