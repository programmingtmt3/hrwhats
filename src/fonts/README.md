# Fonts

Self-hosted through `next/font/local` (`src/lib/fonts/ar.ts`, `en.ts`).
Licensed under the SIL Open Font License 1.1 — see `OFL.txt`.

| Files | Source | Subset |
|---|---|---|
| `IBMPlexSansArabic-{Regular,Medium,SemiBold,Bold}.woff2` | `@ibm/plex-sans-arabic` 1.1.0 (`fonts/complete/woff2`) | Arabic + Latin |
| `IBMPlexSans-{Regular,Medium,SemiBold,Bold}.woff2` | `@ibm/plex-sans` 1.1.0 (`fonts/complete/woff2`) | Latin |

Subset with fontTools `pyftsubset … --layout-features='*' --flavor=woff2` to the
same ranges Google Fonts serves for these families:

- Latin: `U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD`
- Arabic: `U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0897-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC`

Weights: only 400–700 are used on the site. To add one, subset the same way and
add it to the font module.
