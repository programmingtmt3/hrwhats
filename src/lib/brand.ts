// Single source for the logo. When the SVG version arrives, change it here only.
// Transparent margins trimmed, so the visible logo fills the given height
// (header, footer).
export const LOGO = {
  src: "/images/brand/hrwhats-logo-trimmed.png",
  width: 965,
  height: 789,
  alt: "HRwhats",
} as const;

// Original square file with its transparent margins: used where the design
// relies on that padding (chat avatar in the hero) and as the favicon source.
export const LOGO_SQUARE = {
  src: "/images/brand/hrwhats-logo.png",
  width: 1135,
  height: 1135,
  alt: "HRwhats",
} as const;

// Meta's official logo, used as is (white background, original margins kept): the API
// feature card on both languages, never with "Business Partner" (CLAUDE.md, Brand & design).
export const META_LOGO = {
  src: "/images/brand/meta-logo.jpg",
  width: 1280,
  height: 720,
} as const;
