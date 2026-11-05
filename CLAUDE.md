# CLAUDE.md — hrwhats.com

## Project overview

Rebuild of **hrwhats.com**, the marketing site for HRwhats (a WhatsApp Business API + CRM platform), currently on WordPress. The new site is a **Next.js static site** (static export) deployed to **Spaceship Web Hosting, Essential plan** (cPanel, LiteSpeed, PHP — no Node.js needed) — the same hosting the current WordPress site runs on. Hostinger is for the staging preview only (see Hosting).

- The product app lives at `app.hrwhats.com` (signup/login). It is **out of scope** — this repo only links to it.
- Primary language: **Arabic (RTL)**. English will be added in a later phase — the architecture must support it from day one.
- The developer communicates in Arabic. **Reply to the user in Arabic**; code, comments, commit messages and file names stay in English.

## Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript (strict) |
| Output | `output: 'export'`, `trailingSlash: true` |
| Styling | Tailwind CSS (via PostCSS) + CSS Modules for design-ported section styles (see Brand & design) |
| UI components | shadcn/ui (Radix) |
| Icons | Design SVGs in `src/components/icons/`; lucide-react for anything new |
| Animation | CSS + IntersectionObserver (as in the design). Motion only if a later page needs it — subtle only |
| Content | JSON validated with Zod in `lib/content.ts`; MDX via **Velite** (blog posts, schema in `velite.config.ts`) |
| Images | `next-image-export-optimizer` (build-time optimization) |
| Forms | React Hook Form + Zod (client-side only) |
| Fonts | `next/font/local`, self-hosted woff2 in `src/fonts/` (OFL) — IBM Plex Sans Arabic (Arabic) + IBM Plex Sans (English), weights 400–700. No Google Fonts requests in dev or build |
| Package manager | npm. Node 24 LTS (npm 11). Install with `npm ci`; change `package-lock.json` only through `npm install <pkg>` on Node 24 — a lockfile rewritten by an older npm drops the `libc` fields (glibc/musl binaries for `sharp`, `lightningcss`) and optional packages |

Do not add dependencies outside this list without asking first. (`cn`, `class-variance-authority`, `radix-ui`, `tw-animate-css` and `shadcn` come with shadcn/ui and are part of it. The post converter's `unified`, `rehype-parse`, `rehype-remark`, `remark-gfm`, `remark-mdx`, `remark-stringify` are dev dependencies for `scripts/migrate-wordpress.ts` only.)

The project runs **Next.js 16** — see `AGENTS.md`: read the bundled docs in `node_modules/next/dist/docs/` before using an API you are unsure about.

## Hard constraints: static export

The site is built with `next build` into `out/` and uploaded to `public_html`. There is **no Node server in production**. Therefore:

- No Server Actions, no dynamic Route Handlers, no middleware/proxy, no ISR, no `headers()`/`cookies()`.
- No `redirects()` / `rewrites()` in `next.config.ts` — they do not work in export. Redirects go into a generated `.htaccess` (see below).
- Every dynamic route must implement `generateStaticParams` and set `dynamicParams = false`.
- `next/image` default loader does not work — always use `SiteImage` (`src/components/ui/SiteImage.tsx`), which wraps the export optimizer's `ExportedImage` with `placeholder="empty"` (otherwise a blurred placeholder shows behind transparent PNGs).
- `app/sitemap.ts` and `app/robots.ts` are allowed (they export as static files).
- Server-side behavior that cannot be static (the contact form) runs as **PHP on the same host** (`public/api/`), never as Next.js API routes.
- Server Components by default; add `"use client"` only where interactivity is needed.

## Build environments (staging vs production)

`SITE_ENV` (read in `src/lib/env.ts`) selects the build target: `staging` (default when unset — the safe choice) or `production`; any other value fails the build. `next.config.ts` prints the target at the top of every build log.

- **staging** (Hostinger preview, built **from GitHub on Hostinger**: the app is connected to `origin` (`programmingtmt3/hrwhats`), Build command `npm run build`, Output directory `out`, env `SITE_ENV=staging`; every push to `main` rebuilds it. Fallback: build locally and upload `out/` to a regular Website. See `docs/deploy-hostinger.md`): `robots.txt` = `Disallow: /`, `noindex, nofollow` on every page (via `getRootMetadata`), **no sitemap**. `ALLOW_TURNSTILE_TEST_KEY=1` is allowed here.
- **production** (the real launch on Spaceship, built locally and uploaded — see Hosting): normal indexing. `ALLOW_TURNSTILE_TEST_KEY=1` always fails the build.
- New SEO outputs must respect this: `app/sitemap.ts` (launch phase) must produce nothing in staging, and no page may override `robots` to make staging indexable.
- `npm run build` alone must produce the complete `out/` (hosts run nothing else). Node 24 (`engines` + `.nvmrc`).
- `npm run build` runs `scripts/build.mjs`. Hostinger's Next.js preset renames `next.config.*` and writes its own config without `output: 'export'` (out/ then holds only images). So the real config lives in **`next.base.ts`** (edit it there); `next.config.ts` only re-exports it, and the script restores it, deletes any other `next.config.*` and drops `NEXT_PRIVATE_STANDALONE/OUTPUT` before building, then fails if `out/index.html` is missing.

## Hosting: staging (Hostinger) vs production (Spaceship)

| | Staging | Production |
|---|---|---|
| Host | Hostinger (preview only, never the launch) | **Spaceship Web Hosting, Essential plan** — cPanel, LiteSpeed, PHP, no Node.js. Same hosting as today's WordPress site |
| Build | Hostinger builds from GitHub (`origin`) on every push | `SITE_ENV=production npm run build` locally, then upload the **contents** of `out/` to `public_html` |
| Redirects | not tested here | `out/.htaccess` (LiteSpeed reads Apache `.htaccess`) |
| Contact form | page loads, but sending fails by design (Origin check allows only `https://hrwhats.com`) | `public_html/api/contact.php` + `~/hrwhats-config.php` |
| Indexing | blocked (robots + noindex) | normal |

**Only testable on Spaceship** (Hostinger differs in server, upload path and domain): the `.htaccess` redirects (`/index.php/…`, `ErrorDocument 404`, later 301s), the PHP contact form end to end (PHP version, SMTP, the config file outside `public_html`, Origin = the real domain), and Arabic/emoji post URLs served from the UTF-8 folder names **after the upload** (FTP/zip can mangle them — see Arabic slugs). Do these on a Spaceship subdomain before launch (approved 2026-11-03; set it up in the launch phase), never by changing the live WordPress site.

## Internationalization (i18n)

| Language | URL | `<html>` |
|---|---|---|
| Arabic (default) | `/charity/` — no prefix | `lang="ar" dir="rtl"` |
| English (later phase) | `/en/charity/` | `lang="en" dir="ltr"` |

- Two root layouts via route groups: `app/(ar)/layout.tsx` and `app/(en)/en/layout.tsx`.
- Route files are **thin wrappers** (2–3 lines) that render a shared page component with a `locale` prop. All real logic lives in `src/components`.
- **No hardcoded UI strings in components.** Every UI string goes in `messages/ar.json` (later `messages/en.json`), loaded with a typed `getDictionary(locale)`. Missing keys must be a TypeScript error.
- No automatic redirect based on browser language. A language switcher in the header links to the same page in the other language if it exists, otherwise to that language's home.
- `hreflang` alternates (`ar`, `en`, `x-default` → Arabic) only for pages that actually have a translation.

## Styling rules (RTL-safe)

- Use **logical properties only**: `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`, `border-s`, `rounded-s` in Tailwind; `inset-inline-*`, `margin-inline-*`, `border-inline-*`, `text-align: start|end` in CSS.
- **Never** use `ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`, `right-*`, `text-left`, `text-right` (or `left`/`right` in CSS) for layout. Exceptions: centering (`left:50%; translateX(-50%)`) and decorative background positions copied from the design.
- Directional icons (arrows) are drawn for RTL and flipped in LTR with the `.icon-forward` class. Direction-dependent transforms (e.g. a hover nudge, the logo marquee) use `:dir(ltr)` overrides.
- Mobile-first. Test every section at 375px width.
- shadcn components are generated with `"rtl": true` (components.json). After adding a new one, check it for physical classes (`left`, `right`, `slide-in-from-left`, …) and convert them.

## Brand & design

**The design reference is `design/index.html`** (committed as a reference; excluded from lint via `eslint.config.mjs`, and never imported, so it is not part of the build). The home page, header, footer and floating WhatsApp button must match it exactly — design, colors, copy and animations. New pages reuse its tokens and primitives.

**How design CSS is implemented:**
- Tokens (colors, radii, shadows, easing) → CSS variables in `src/app/globals.css`, exposed to Tailwind via `@theme`, with shadcn variables mapped onto them.
- Shared primitives from the design (`.site-container`, `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-sm`, `.btn-outline-light`, `.eyebrow`, `.sec-head`, `.grad`, `.reveal`) → `@layer components` in `globals.css`. (The design's `.container` is renamed `.site-container` because Tailwind v4 has its own `container` utility.)
- Section-specific CSS → a CSS Module next to the component (`Hero.module.css`, …), copied from the design with logical properties. This keeps pseudo-elements, masks and gradients pixel-identical. Tailwind utilities are fine for simple layout in new pages.
- **Never write a property together with its `-webkit-` version** (`backdrop-filter` + `-webkit-backdrop-filter`, `mask-image` + `-webkit-mask-image`, …). Write the unprefixed property only; the CSS minifier (lightningcss) adds the prefix. Writing both made it keep only the `-webkit-` one, which Chrome ignores (the header lost its blur).
- **Bundlers:** `npm run dev` uses Turbopack; **`npm run build` uses Webpack** (`next build --webpack`). Turbopack builds crashed on Hostinger (it could not start its CSS-loader subprocess). Tailwind runs through **PostCSS** (`postcss.config.mjs`, `@tailwindcss/postcss`) for both — no `turbopack.rules` in `next.config.ts`. CSS Modules keep their scoping (Tailwind's PostCSS plugin skips files without Tailwind directives), so `@apply` is still not available inside them — write plain CSS with `var(--token)`.
- **Prefixing:** dev (Turbopack) prefixes with Lightning CSS; the production build runs Next's bundled `postcss-preset-env` (same options as Next's default, which a custom PostCSS config disables). Targets come from `browserslist` in `package.json` (= Next's defaults: chrome/edge/firefox 111, safari 16.4). Keep writing unprefixed properties only.
- Icons are the design's inline SVGs, copied verbatim into `src/components/icons/` (not lucide), so they render identically.

**Colors** (from the design). All values are defined **only** in `globals.css`; components and CSS modules use `var(--token)` or Tailwind classes, never hex/rgb literals. Translucent variants use the `--*-rgb` channels: `rgb(var(--wa-rgb) / .1)`.

| Token | Hex | Role |
|---|---|---|
| `--deep` | `#062A20` | footer, darkest surfaces |
| `--dark` | `#0B3D2E` | dark cards, icons bg, ghost-button text |
| `--green` | `#128C4A` | accent text, links, focus ring |
| `--wa` | `#25D366` | primary buttons (text `--on-wa` `#03251A`) |
| `--neon` | `#3CFF9A` | highlights on dark backgrounds |
| `--bg` | `#F7FAF8` | page background |
| `--surface` | `#FFFFFF` | cards |
| `--ink` | `#0D1F18` | body text |
| `--muted` | `#5B6B64` | secondary **text** (shadcn: `text-muted-foreground`; `bg-muted` maps to `--bg`) |
| `--line` | `#E3ECE7` | borders |

Supporting colors used by the design (WhatsApp mockup, gradients) are also variables in `globals.css`. Radii `--r-sm/--r/--r-lg`, shadows `--shadow-sm/--shadow/--shadow-lg`, easing `--ease`.

**Fonts:** IBM Plex Sans Arabic on Arabic pages (it includes matching Latin glyphs), IBM Plex Sans on English pages. **Self-hosted** with `next/font/local`: woff2 files in `src/fonts/` from the official `@ibm/plex-sans-arabic` / `@ibm/plex-sans` packages, subset to Arabic + Latin / Latin (ranges and steps in `src/fonts/README.md`, license `src/fonts/OFL.txt`). Weights **400–700 only** — the ones the site uses (`font-weight: 800` renders with 700); adding a weight means subsetting its file the same way. `display: swap` + `adjustFontFallback: "Arial"` (the fallback is sized to Plex's metrics, so nothing jumps when the font loads). Each font lives in its own module (`src/lib/fonts/ar.ts`, `en.ts`) so a page loads only its language's font; CSS picks it via `html:lang(..) { --font-site }`.
- **The site font is set in one place only** (`src/fonts/` + `src/lib/fonts/` + `--font-site`/`--font-sans` in `globals.css`). No page, section or component may set `font-family` to anything but `inherit` (form controls), or redefine `--font-sans`/`--font-site`/`--font-arabic`, or add `@font-face`. Never load a font from Google Fonts or another CDN. A decorative face (e.g. chalk lettering) would need approval first and must be scoped to its own element.

**Logo:** `public/images/brand/hrwhats-logo-trimmed.png` (transparent margins trimmed), path defined once in `src/lib/brand.ts` (`LOGO`), rendered through `BrandLogo` — an SVG version will replace it there. Heights: header 54px (44px ≤600px), footer 36px. The original padded file stays as `LOGO_SQUARE` (`BrandLogo square`) for the hero chat avatar and as the favicon source. Always `alt="HRwhats"`. `src/app/favicon.ico`, `icon.png` and `apple-icon.png` are generated from it (regenerate when the SVG arrives).

**Header** — exactly as the design: الرئيسية، الباقات، المدونة، تواصل معنا، حظر الواتساب (`/whatsapp-ban/`)، دليل الاستخدام (last because it is external: `docsUrl`, new tab, small `ArrowUpLeft` icon on the same line, never marked as the current page — see Usage guide)، a "لوحة التحكم" ghost button → `app.hrwhats.com/login` and a "جرب مجاناً" primary button → `app.hrwhats.com/signup`. No dropdowns. Fixed; gets a blurred white background after 10px of scroll. Below 1080px a burger opens the menu as a panel under the header; the "لوحة التحكم" link appears inside that menu (fixed vs. the design, where a rule-order bug hid it). Server part `Header.tsx`, client part `HeaderBar.tsx`, links in `src/lib/navigation.ts`.
- The header is `position: fixed` (`--header-h: 76px`): every page's first section needs its own top padding (the hero uses 160px).

**Footer** and **floating WhatsApp button** — exactly as the design; contact and social data come from `content/data/site.json`.

**Animation:** CSS + IntersectionObserver with the design's exact timings (no Motion library on the home page). Use `<Reveal>` (any HTML tag) or `<RevealLink>` (next/link) from `src/components/motion/`; server components cannot pass a component (e.g. `Link`) as a prop to a client component. Hover effects on `.reveal` elements must use the `translate` property (not `transform`, which the reveal owns). `prefers-reduced-motion` disables animations; `<noscript>` reveals `.reveal` content when JS is off.

**404:** with multiple root layouts, `out/404.html` comes from `src/app/global-not-found.tsx` (experimental `globalNotFound`). It must keep `lang="ar" dir="rtl"` and the Arabic header/footer.

## Content architecture

```
content/
├── posts/ar/*.mdx        ← blog posts (later posts/en/)
└── data/
    ├── clients.json      ← client names + logos (+ intrinsic width/height)
    ├── partners.json     ← success partners (same shape)
    ├── packages.json     ← pricing packages (the home trust bar's "من N ر.س" = lowest monthly WhatsApp plan, via `getStartingMonthlyPrice()` — never typed by hand)
    ├── sectors.json      ← slug + name — the ONLY source of sector names site-wide (home grid, navigation, sector pages)
    ├── categories.json   ← blog categories (slug + name); a post's category must be listed here
    ├── faq.json          ← FAQ items
    └── site.json         ← contact info, social links, app URLs, `docsUrl` (usage guide)
```

- **File names are ASCII English** (`whatsapp-blue-tick.mdx`). Never Arabic or emoji file names — even when the post's `slug` (inside the file) is Arabic.
- **Client/partner logos:** `public/images/{clients,partners}/NN-short-english-name.ext` (two-digit display order, lowercase, hyphens). The JSON lists them in the same order — Zod fails the build otherwise. **Any new logo must be at most 600px wide** (downscale before committing, keep format and transparency, never upscale) and its `width`/`height` in the JSON must match the file.
- **No image banners.** Promotional panels are built in code from the design tokens (e.g. the Meta verification panel under "لماذا HRwhats": `src/components/sections/why/MetaVerify.tsx`) — never a picture of text.
- **Home additions beyond the design:** the ban-protection panel (`src/components/sections/banProtection/`) between the trust bar and the features — dark panel, copy + one sales-WhatsApp button (new tab), and a code-drawn phone whose status plays once: red "banned" warning (`--alert-light` on dark) → green shield lands → "رقم موثّق ✓" (base styles = final state, so reduced motion / no JS show it directly). Keep it distinct from `MetaVerify` (light, horizontal stages) and the hero phone (chat).
- A translation of a post has the **same file name** under the other locale folder.
- Text fields in JSON data are bilingual objects: `{ "ar": "...", "en": "..." }` (`en` may be empty until the English phase).
- **Legal pages** (`privacy-policy`, `terms-of-use`, `refund-policy`) share **one template**, `LegalPage` (`src/components/pages/LegalPage.tsx` + `src/components/legal/`): `PageHero` (eyebrow "السياسات"), a sticky side table of contents marking the current section (`PageToc`, shared with blog posts; phones: a collapsible list above the text), sections with English anchor ids and a direct-link button, and a closing help box (contact channels from `site.json` + the other two policies). No marketing CTA. Their text lives in `messages/ar.json` under `legal.pages.<slug>` (`name`, `title`, `meta`, `sections[]` of `id`, `title`, `text[]`, optional `list[]`) — copied verbatim from WordPress (only HRWhats → HRwhats and small punctuation fixes); never add or reword legal text without the developer. `legal.pages.<slug>.name` is the only source of each page's name (footer included); the second page is "شروط الاستخدام" (never "سياسة الاستخدام"). Static routes `src/app/(ar)/<slug>/page.tsx`, no MDX.
- Every content type has a Zod schema in `velite.config.ts`. A missing required field must fail the build.
- **Sector pages are custom, one design per sector** — no shared sector template and no sector MDX. Each sector has a static route folder `src/app/(ar)/<slug>/page.tsx` (thin wrapper) and its own sections in `src/components/sectors/<slug>/` (e.g. `charity/`). Shared: tokens, fonts, buttons, `SectionHeading`, header, footer, `Reveal`. The slug and name come from `sectors.json` via `getSector(slug)` (throws if missing); all page text lives in `messages/ar.json` under `sectors.<slug>`. Page-only assets go in `public/images/sectors/<slug>/`. **Sector pages use no images from the old WordPress site — not on the page and not as Open Graph images.** Every visual is built in code (or generated, like the tourism world map). Sector pages set no page OG image: they inherit the site-wide one (1200×630, launch phase). The home sector cards use no images either: each card (`src/components/sections/sectors/`) has a small code-drawn motif from its page's theme (`SectorMotif`) and a short line from `home.sectors.cards.<slug>` in `ar.json` (a missing line fails the build). **A new sector page needs its card motif and line too.**
- **Illustrative data — rule for every sector page.** Mockups built in code (chats, cards, boards, dashboards) use generic example data from `ar.json` and carry a visible "مثال توضيحي" tag (`ExampleTag`). Allowed: generic campaign names, common first names for customers and staff, reasonable prices/areas/amounts, and places described by type + area ("شقة 3 غرف — شمال الرياض"). Never: real company, association or project names, invented project names (they may match real ones), or numbers that look like statistics about the platform. Relative visuals (bars, dots, funnels) carry no figures.
- Shared sector building blocks live in `src/components/sectors/shared/` (`ExampleTag`, `FeatureItem` — `plain` variant for section-level text). Sector pages do not use the site-wide `<Cta>`: each page's last section is its closing and carries the two buttons (signup + sales WhatsApp, from `site.json`).
- **Pages never read content files directly.** All access goes through `src/lib/content.ts` (`getPosts(locale)`, `getPostBySlug(locale, slug)`, `getClients()`, …). This layer is the only thing that changes if we later add a Git-based CMS (Keystatic).

### Sector page ideas already used

Each sector page must look and behave differently. **Before proposing a new sector page, check this list and reuse none of it; add the new page here when it ships.**

| Page | Visual theme | Signature elements | Interaction / motion |
|---|---|---|---|
| `charity` | Warm cream background, "impact" | Campaign card with a progress bar + floating glass notifications; bento with an inbox mockup; WhatsApp phone; dark campaign dashboard (KPIs + bars); result as 4 animated cards (rows, rising line, growing columns, shrinking vs filling bars) + the closing buttons under them | **Sticky phone** while the donor-journey stages scroll past (timeline with numbered markers); spotlight hover on bento cards |
| `real-estate-contracting` | **Blueprint** grid paper (light + dark), drawing sheets with corner marks | WhatsApp-Web window with a property card + building line drawing; inquiry routing list; WhatsApp list message; campaign composer; **Kanban** pipeline; sales-team dots + bars; **conversion funnel**; dark closing panel with a **Saudi landmarks skyline** | Stage index (anchor links) + **alternating numbered sheets** on a dashed path; Kanban cards slide between columns |
| `education-training` | **Ruled notebook paper** with a margin line | One floating WhatsApp message with a course card; **taped sticky notes**; inquiry folders; self-filling registration form (typing); **monthly calendar**; **attendance sheet**; admission team trays; **report rings**; **graduation certificate** closing with a seal | **WAI-ARIA tabs** (binder-divider tabs; on phones a strip scrolling inside itself); each tab plays its mockup once |
| `tourism-hospitality` | **Dot-matrix world map** (one SVG mask, full width, rotated so 46°E is the center — Americas left, East Asia/Australia right — Saudi Arabia highlighted, pulse on Riyadh, flight lines to 4 continents) behind the hero, then plain; travel objects | **Boarding-pass** booking confirmation + **room key card** + dotted flight path with a plane; drawn room-photo album; booking stamp + arrival reminder; **door hanger** with request statuses; star rating + **postcard with stamp and postmark**; reception **key rack**; **departures (split-flap) board**; **luggage tag** closing with a strap | **Carousel** (scroll-snap track, swipe, prev/next, route stops, arrow keys) with a **suitcase moving along a dotted route**; each slide plays once |
| `online-stores-systems` | **Receipt paper** with zigzag (torn) edges; white hero band with a zigzag bottom | WhatsApp catalog with **CSS-drawn products**; one long **receipt strip** holding the service texts (mockups always on the same side); inquiry inbox; bot suggesting a product; **invoice printing out of a printer slot** with a stamp; dark **abandoned-cart spotlight** (abandoned cart → reminder with a **coupon** → recovered); **before/after comparison**; vertical **shipment tracking**; **activity heatmap** (days × times, shades only); **checkout order-summary** closing | **Interactive mini shop** in the hero (add to cart with a bumping badge, checkout → computed invoice, start over; aria-live); **filter chips** (aria-pressed) on the inbox; **draggable comparison slider** (role="slider": pointer, touch, arrows, Home/End; one-time handle nudge + "drag" hint that fades after the first interaction) |
| `advertising` | **Design-tool canvas** (Figma-like): page-wide **dot grid**, services as **artboards** with frame names, **selection frame + corner handles**, **named teammate cursors**; three example-client colors (`--client-food/-clinic/-shop`, mockups only) | **Agency dashboard** whose chats/campaign/performance bar follow the selected client; **unified inbox** color-coded by client; night-time **numbered menu** auto-reply with a package card ("باقة شهرية", no price); **A/B message versions** with relative engagement bars + winner badge; **lead thermometer** (cold → warm → hot, leads climb to their level) + auto-captured fields; teammate cursors working on **client account cards** + reply-speed bars; **white-label report** with sparklines and a picture-only "تصدير PDF"; **sponsored social post** closing | **Client switcher** (`radiogroup`, RTL arrows, Home/End, roving tabindex; one automatic tour 0→1→2 on first view, stopped by any interaction, skipped with reduced motion; aria-live on user choices); **audience switch** (`role="switch"`) on the A/B test; artboards in **two staggered columns linked by prototype connectors** that draw in; cursors glide in and drift |
| `hr` | **Official workplace tools**; a **lanyard ribbon** runs down the services with **station signs** (wayfinding plates labeled أولاً / ثانياً / ثالثاً) pinned to it | **Employee ID badge on a lanyard** (code-drawn photo initial, decorative code pattern) + HR-assistant chat with a leave balance; services grouped into **3 journey stations** (before joining → daily work → HR management); **CV scanned → candidate card**; night-time **numbered procedure steps**; **routing slip** whose approval boxes get **hand-drawn signatures** (no stamp) then "معتمد"; **official memo with letterhead** + per-department read receipts; **mini org chart** with chats dropping to specialists; **half-circle gauges with needles** (no figures); closing **entrance reader** (badge taps it, LED turns green, "مرحباً بك") | **Flip cards** (FAQ: question front, auto-reply back; card tap or a toggle button with `aria-pressed`; both faces stay in the accessibility tree; constant height; reduced motion swaps without rotating); badge **swings once** on first view; reader sequence plays once |
| `operating-service` | **Operations control room**: services as **work orders on clipboards** (only the dark board behind the paper tilts, alternating; metal clip; "أمر عمل 01" header), **diagonal tape** between sections in brand greens, **status LEDs**, **priority badges** (`--alert` / `--amber`, mockups only) | Hero: WhatsApp report with a **code-drawn map + photo of the fault** that becomes a classified, routed **work order**; bot intake + **sorting conveyor belt** dropping requests into department bins; status updates with a **4-segment progress bar** and an **emoji rating** (no stars); **technician cards with LEDs** and an assignment; **maintenance contract** with periodic-visit track, reminder, renew + extra-service offer; **control-room panels** (LED rows + scrolling wave screens, no figures); closing **power panel** with a big switch | **Sortable request board** (sort buttons with `aria-pressed`; "tap to sort" hint + one pulse on first view, both gone after the first click; **FLIP** reordering; "by department" adds department headings; aria-live; reduced motion jumps); switch flips + lights + content appear once |
| `restaurants-cafes` | **Inside the restaurant**: cream hero, **kitchen rail** with clipped **order tickets**, rising **steam**, **chalkboard** in a wooden frame (`--chalk`, `--wood`), printed **menu card** with dotted leaders | Hero: WhatsApp **menu with category buttons** and dish ……… price lines, **upsell as a yes/no line inside the order summary**, ticket slides onto the rail (no printing); order screen; night auto-reply sending the menu as a file; tickets with pickup/delivery tags; **steaming plate** + delivery statuses; **loyalty stamp card** (cups; "الكوب السادس علينا"); order split to cashier/kitchen/delivery; **peak-hours day dial** (conic shades, no figures); campaigns as a **quiet-hours offer on the chalkboard** + broadcast; values as a **menu with ✓ instead of prices**; closing **neon "مفتوح الآن" sign** on a brick wall | **Interactive floor plan with hotspots** (7 numbered buttons, `aria-expanded`/`aria-controls`, first open; all panels in the HTML; desktop: a numbered **service list** above the panel with the same buttons/ARIA, hover/focus on a list item highlights its hotspot and vice versa; "tap any point" hint that fades after the first click + one pulse per hotspot on first view; phones: plain numbers + the full numbered list); neon sign flickers on once |
| `shops` | **Saudi shop front**: striped **awning** in brand greens, **rolling metal shutter**, wooden **shelves**, **kraft price tags** with a hole and string (`--kraft`), decorative **QR codes** (2 finder squares only — not scannable) | Hero: shop front whose shutter rolls up to show stocked shelves + a size/colour availability chat ("احجزه لي"); signature **QR section** ("scan instead of «كم رقم جوالك؟»": 4 steps, the old way (number typed by hand on a computer, with a corrected typo) vs one scan, 3 placements: cashier stand, glass front, shelf tag); services as **price tags beside mockups standing on shelves**: shelf card with size availability dots, product sheet + similar items, **pickup vs delivery** choice with a pickup code, **shop-window sale decals** + broadcast, after-sale follow-up + returning customer, in-store vs WhatsApp sales lanes, **bestsellers as box stacks**; closing **kraft shopping bag** with rope handles and a gift tag holding the buttons | **Press-to-scan simulator** (tap, click, long press or held Space/Enter all start the same scan that completes on its own; WhatsApp opens with the ready message; "Send" → "تم حفظ الرقم تلقائياً ✓"; try again; `aria-current="step"` on the step list; focus follows; aria-live; no long-press callout/selection); shutter rolls up once; bag drops in and sways once |

Closing sections: no sector page uses the site-wide `<Cta>`. Each ends with its own closing: the dark result section with the two buttons under its cards (charity), dark blueprint panel, certificate, luggage tag, checkout summary, sponsored post, entrance reader, power panel, neon sign, shopping bag.

Post frontmatter (minimum):

```yaml
---
# file: content/posts/ar/whatsapp-marketing-messages.mdx  (ASCII English file name)
title: رسائل واتساب تسويقية جاهزة للعملاء مع أمثلة
description: ...
seoTitle: رسائل واتساب تسويقية جاهزة للعملاء مع أمثلة - حلول واتس اب اعمال | HRwhats   # Yoast's title, verbatim except the brand spelling
slug: رسائل-واتساب-تسويقية-جاهزة-للعملاء-مع   # the WordPress slug, decoded, character for character
legacySlugs: []          # empty at launch; only for a later rename (decoded old slugs → 301s)
date: "2026-09-20T10:00:00Z"     # WordPress date_gmt
updated: "2026-09-21T10:00:00Z"  # WordPress modified_gmt
categories: [whatsapp]   # the first is the primary one (breadcrumb); must be in categories.json
cover:
  template: ban-protection   # code-drawn; one of COVER_TEMPLATES in velite.config.ts
  variant: 1                 # optional
---
```

### Blog post page

`src/app/(ar)/[slug]/page.tsx` (thin wrapper) → `src/components/pages/PostPage.tsx` + `src/components/blog/`: breadcrumb (home → blog → primary category), title, categories (plain text until the category pages exist), code-drawn cover, table of contents + text, context box, WhatsApp share, related posts, site-wide `<Cta>`. Text in `messages/ar.json` → `blog`.
- **No dates are shown on a post page, neither published nor updated (decision 2026-11-05).** `date` and `updated` stay in the frontmatter and feed JSON-LD (`datePublished`, `dateModified`) and the order of posts.
- **No reading time on posts (decision 2026-11-05):** not on the page, not in `ar.json`, and not computed anywhere.
- **Covers are code-drawn, never images, and carry no text.** One template per kind of post, registered in `src/components/blog/covers/index.tsx` and listed in `COVER_TEMPLATES` (`velite.config.ts`). Built so far: `ban-protection` (a padlock in a ring: red → the shackle lifts and the ring closes green, once; base styles = final state). New templates must differ from the home ban-protection panel and `MetaVerify`.
- The ban context box (link to `/whatsapp-ban/`) appears on posts with the `ban-protection` cover.
- Related posts: up to 3 sharing a category, newest first; the section disappears when there are none.
- Heading anchors are generated from the heading text the way WordPress wrote them (checked: 16 of 16 on the pilot post), so old links to a section keep working. The table of contents lists `h2` only.
- JSON-LD: `Article` (author and publisher: Organization) + `BreadcrumbList`. No page-specific Open Graph image.

## URLs and SEO

The current site ranks on Google. **Protecting existing traffic is the top priority.**

- **Post URLs stay exactly as they are on WordPress at launch** (decision 2026-11-03): the Arabic slugs — some with emoji (`📌-…`) or `؟` — are kept character for character. No English post slugs and no post 301s now. Renaming them to English with 301s (via `legacySlugs`) may come later, after the site is stable — only on request.
- New pages (packages, contact, sectors, legal) keep their clean English slugs.
- Pages, sectors and posts all live at the **site root** (`/slug/`). Posts are served by one `[slug]` route; sectors have their own static route folders. The build must **fail if the same slug exists twice** — the check (`prepare` in `velite.config.ts`) covers posts, every slug in `sectors.json` and every static route folder under `app/(ar)/` (`packages`, `contact`, sector folders, …), plus `news` and `category` until they have folders. It also fails if a slug is not NFC, contains `/ ? # %` or whitespace, or is over 255 bytes in UTF-8 (the Linux folder-name limit).
- Blog index: `/news/`, pagination: `/news/page/2/`, categories: `/category/{whatsapp|marketing|hrwhats-guide}/`. The WordPress category `tutorials` (one post) is **not built**: `/category/tutorials/` → 301 to `/category/whatsapp/` in the generated `.htaccess` at launch (review the target against the Search Console data).
- Old `/index.php/...` URLs redirect to the clean URL.
- **Redirects:** a build script generates `out/.htaccess` (`ErrorDocument 404 /404.html`, the URL forms below, plus 301s from `legacySlugs` once any exist). Arabic slugs in rules must be matched correctly in their percent-encoded form — verified by the test script, not assumed.
- **WordPress old-slug redirects:** WordPress redirects a post's old slugs by itself, and those redirects disappear at launch. They must be extracted in the launch phase (see Phases), kept as 301s in `.htaccess` and added to the URL test's sources. Confirmed example (checked by hand in the browser): `/فك-حظر-الواتساب/` → `/unblocking-whatsapp/`, an old slug of post 3356, which also links to it; it must stay a 301 after launch.
- **URL forms the `.htaccess` must handle and the test script must check:**
  - `www` → no `www` and `http` → `https`, so there is one final URL: `https://hrwhats.com/…/`.
  - A URL without the trailing `/` → the same URL with it.
  - `/index.php/…` → the clean URL.
  - WordPress side pages: `/feed/`, `/tag/…`, `/author/…`, `?p=ID`, attachment pages.
  - `/wp-content/uploads/…` images that external links target or that appear in image search (decided in the launch phase, from the data).
- **URL test script** (`scripts/test-redirects.ts`): takes every URL from **three sources** — the current sitemap (read from the committed snapshot `scripts/data/wp-sitemap-urls.json`, not the live sitemap, which disappears at launch), the Search Console export of indexed pages, and the list of backlink targets (see Search Console and backlinks) — plus the WordPress old-slug redirects once extracted, and checks it on the new site: **200 at the same URL** (posts, kept pages) or **301 to a working page** (anything that moved). Must pass 100% **on Spaceship** before launch.
- **Titles of pages indexed on the current site keep the phrase "حلول واتس اب اعمال"** (the search phrase they rank for): inner pages `[name] - حلول واتس اب اعمال | HRwhats`, home `حلول واتس اب اعمال | HRwhats — منظومة واتساب API للأعمال` (`meta.homeTitle`; title, Open Graph and Twitter all come from it). **Do not change the title of an important page before its Search Console data has been reviewed with the developer.**
- Every page: unique `title` + `description` via the Metadata API, canonical URL with trailing slash, Open Graph image.
- JSON-LD: `Organization` (site-wide), `FAQPage` (FAQ sections), `Article` (posts), `BreadcrumbList`.
- Internal links between posts point to the final URL directly (no redirect hops): at launch that is the same Arabic URL, written relative (`/slug/`). When converting to MDX, a link that points to an old slug is written with the final URL directly (e.g. `/فك-حظر-الواتساب/` → `/unblocking-whatsapp/`).

### Search Console and backlinks

- **Google Search Console** is verified for `hrwhats.com` as a **Domain property** through a DNS TXT record in Spaceship. **Never delete this record.**
- The current sitemap, `https://hrwhats.com/sitemap_index.xml` (Yoast), has been submitted to it.
- The current site's ranking rests mainly on **backlinks**. The developer will collect their list (Search Console Links, tools like Ahrefs) before launch.
- Every URL a backlink targets must return **200 at the same URL or 301 to the closest replacement page**. No mass redirects to the home page.
- On any targeted page, never remove the content that the links' anchor text refers to.

### Arabic slugs in the static export (tested 2026-11-03, Next 16.4.0)

A temporary `[slug]` route with real WordPress slugs (plain Arabic, `📌-…`, `…؟`) showed:
- `out/` folder names are **readable UTF-8** (`out/📌-فوائد-…/index.html`), not percent-encoded. `؟` (U+061F) is not the ASCII `?`, so it is a safe path character.
- The page component receives `params.slug` **percent-encoded** (`%D8%B1…`), while `generateMetadata` receives it decoded. Always `decodeURIComponent` before looking a post up (in `getPostBySlug`).
- **`npm run dev` returns 500 for every non-ASCII slug** while `output: "export"` is on (the dev server compares the decoded `generateStaticParams` path with the encoded request path). The build is not affected. Fixed in `next.base.ts`: `output: process.env.NODE_ENV === "development" ? undefined : "export"` — dev serves both `%d8…` and `%D8…` with 200, unknown slugs 404.
- Next writes the canonical/`og:url` percent-encoded in upper case (`https://hrwhats.com/%D8%B1…/`); WordPress writes raw Arabic (`https://hrwhats.com/رسائل-…/`). **Decision (2026-11-03): post canonicals are written in raw Arabic, exactly as WordPress writes them** (`https://hrwhats.com/رسائل-واتساب-تسويقية-جاهزة-للعملاء-مع/`). The post page renders `<link rel="canonical" href={rawUrl} />` and `<meta property="og:url" content={rawUrl} />` (React hoists them into `<head>`), and its metadata sets **no** `alternates.canonical` or `openGraph.url` — never both.
- Browsers always send the path percent-encoded (typing Arabic in the address bar is encoded by the browser); servers may reject raw UTF-8 bytes on the wire, which is not a real-world case.
- **Upload risk:** the folder names must reach the server as UTF-8. FTP: use a client in UTF-8 mode (FileZilla: Site Manager → Charset → Force UTF-8). Zip: create it with 7-Zip (`7z a -tzip -mcu=on site.zip .\out\*`) so names are stored as UTF-8 — a zip without the UTF-8 flag gets mangled names when cPanel extracts it. After every upload, open each test post URL on the server.

## Page inventory (Arabic, phase 1)

| Type | Slugs |
|---|---|
| Main | `/`, `/packages/`, `/contact/`, `/news/`, `/whatsapp-ban/` (indexed on WordPress: URL, canonical and title kept) |
| Sectors | `charity`, `real-estate-contracting`, `education-training`, `tourism-hospitality`, `online-stores-systems`, `advertising`, `hr`, `operating-service`, `restaurants-cafes`, `shops` |
| Legal | `privacy-policy`, `terms-of-use`, `refund-policy` |
| Blog | 38 posts migrated from WordPress |

### Usage guide: docs.hrwhats.com (decision 2026-11-03)

The usage guide is a separate site built by another team: **https://docs.hrwhats.com/**. Its URL lives **only** in `site.json` → `docsUrl`; never write the domain in components or content. Do not build guide pages in this project.
- Every link to the guide opens in a new tab through `NewTabLink` (`src/components/ui/NewTabLink.tsx`: `target="_blank"`, `rel="noopener noreferrer"`, accessible name from `nav.newTab` = "{label} (يفتح في تبويب جديد)").
- Links today: header "دليل الاستخدام" (desktop + mobile menu, with an `ArrowUpLeft` `.icon-forward` icon), the footer "دليل الاستخدام" column (the four page names kept: `footer.guideLinks`; "حظر الواتساب" in it is the internal `/whatsapp-ban/` page, same tab), the "ابدأ التوثيق معنا" button (`MetaVerify.tsx`) and the FAQ answer's `[متطلبات التوثيق](docs:/)` link (`faq.json`). Data files link to the guide with `docs:/path/`, resolved against `docsUrl` (`docsPath()` in `inline-links.ts`).
- **Temporary:** they all point to the guide's home until the developer sends the exact page URLs; then each gets its own path (`navigation.ts` `getFooterGuideLinks`, `MetaVerify.tsx`, the FAQ's `docs:/…/`).
- `/whatsapp-ban/` is **not** part of the guide: it is a page of this site (see WhatsApp ban page) and keeps its URL — no 301.
- The old WordPress guide URLs (`/documentation-requirements-for-meta/`, `/link-account/`, `/hrwhats-guide/`) get 301s in the launch phase (see Phases). The blog category `/category/hrwhats-guide/` is a blog category, not part of this.

### WhatsApp ban page (`/whatsapp-ban/`)

Indexed on WordPress, so the URL, canonical and title (`حظر الواتساب - حلول واتس اب اعمال | HRwhats`) are kept. Text in `messages/ar.json` → `whatsappBan`, verbatim from the WordPress page (only HRWHATS → HRwhats); components in `src/components/whatsapp-ban/` (`Sections.tsx`, client `Checklist.tsx`, one CSS module), page `src/components/pages/WhatsappBanPage.tsx`. No images. Sections: hero + intro with the key sentence, seven reasons (calm amber badges), the honest answer "no 100% guarantee" (dark panel — the page's key message), comparison table (real table; cards on phones), six help cards, a self-check of real checkboxes with an "n من 6" counter (aria-live; nothing saved or sent), six steps joined by arrows (vertical on phones), "already banned?", and a dark closing with the use chips and two buttons (signup + sales WhatsApp) — no site-wide `<Cta>`. JSON-LD: BreadcrumbList + FAQPage for the two questions (same visible text). The home ban-protection panel links to it ("اعرف أسباب الحظر"). This page says plainly that nothing guarantees 100%.
- **Decision (2026-11-04, by the developer):** the existing "بدون حظر" wording elsewhere on the site stays as it is. Do not change it, and do not suggest changing it, unless the developer asks.

External links: signup `https://app.hrwhats.com/signup`, login `https://app.hrwhats.com/login`.

## Project structure

```
src/
├── app/
│   ├── (ar)/                 ← Arabic routes (root URLs)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── [slug]/page.tsx
│   │   ├── packages/ contact/ news/ category/
│   │   ├── charity/ …         ← one static folder per sector (slug from sectors.json)
│   │   └── not-found.tsx
│   ├── (en)/en/              ← English routes (English phase only — no files before then)
│   ├── global-not-found.tsx  ← builds out/404.html (Arabic)
│   ├── favicon.ico icon.png apple-icon.png
│   ├── sitemap.ts
│   └── robots.ts
├── fonts/                    ← self-hosted IBM Plex woff2 + OFL.txt + README.md (subsetting steps)
├── components/
│   ├── ui/                   ← shadcn components
│   ├── layout/               ← LocaleDocument, Header(+Bar), Footer, WhatsAppFloat, BrandLogo, LanguageSwitcher
│   ├── icons/                ← design SVG icons
│   ├── seo/                  ← JsonLd
│   ├── sectors/<slug>/       ← one folder per sector page (custom design); shared/ for common blocks
│   ├── blog/                 ← post page parts; covers/ holds the code-drawn cover templates
│   ├── shared/               ← PageToc (table of contents: legal pages + blog posts)
│   ├── legal/                ← LegalPage parts: help box
│   ├── sections/             ← Hero, Features, Sectors, Clients, Partners, FAQ, CTA
│   ├── pages/                ← shared page components (HomePage, LegalPage, PostPage, …)
│   └── mdx/                  ← components usable inside MDX
├── lib/
│   ├── content.ts            ← the only content access layer (Zod-validated)
│   ├── i18n.ts               ← locales, getDictionary, localePath, format
│   ├── env.ts                ← SITE_ENV (staging | production)
│   ├── navigation.ts         ← header/footer menu structure
│   ├── brand.ts              ← LOGO (single source for the logo path)
│   ├── fonts/{ar,en}.ts      ← next/font/local definitions, one module per language
│   └── seo.ts                ← metadata + JSON-LD helpers
messages/ar.json
content/
public/images/{brand,clients,partners,sectors,posts}/
public/api/
├── contact.php               ← contact form endpoint (PHP on the host)
└── _lib/                     ← PHPMailer 7.1.1 (+ .htaccess deny all)
config/hrwhats-config.example.php ← template for ~/hrwhats-config.php (no secrets)
docs/contact-form-setup.md    ← server setup guide (Arabic)
docs/deploy-hostinger.md      ← staging deploy on Hostinger: GitHub build + why next.base.ts/build.mjs (Arabic)
scripts/
├── build.mjs                 ← `npm run build` (restores next.config.ts, see Build environments; runs `velite build --strict` first)
├── dev.mjs                   ← `npm run dev` (Velite watching content/ + next dev)
├── inventory-sitemap.ts      ← read-only snapshot of the Yoast sitemap (URLs + image URLs) → data/wp-sitemap-urls.json
├── migrate-wordpress.ts      ← pulls posts from WP REST API → MDX (Arabic slugs kept)
├── data/post-file-names.json ← reviewed MDX file names (post id → name), applied by `migrate-wordpress.ts --apply-names`
├── data/old-slug-targets.json ← old slug → current URL, used when converting internal links to their final URL
├── data/machine-note-rules.json ← sentences addressed to machines: removed or flagged when converting a post
├── generate-htaccess.ts
└── test-redirects.ts         ← every old URL: 200 in place or 301 to a working page
```

## WordPress migration

- **Do not modify the live WordPress site.** It stays untouched until launch day.
- `scripts/migrate-wordpress.ts` reads `https://hrwhats.com/wp-json/wp/v2/posts` (with categories and featured images), decodes slugs (`decodeURIComponent`, NFC), and produces `scripts/slug-map.json` (`title`, `slug` = the decoded WordPress slug, `fileName` = proposed ASCII English MDX file name) for **human review of the file names** before any MDX is written. The slug itself is not edited.
- **Conversion, one post at a time:** `node scripts/migrate-wordpress.ts --only <id>` (the post needs a cover in `POST_COVERS`). Text stays verbatim, with one exception: **machine-directed sentences are removed (the developer's decision, 2026-11-05)**, such as a note that a table is meant to be quoted by AI engines. Rules live in `scripts/data/machine-note-rules.json`: `remove` drops a paragraph made only of such sentences and the run lists each one with its post, stopping if one sits among other sentences or outside a paragraph; `replace` applies the developer's exact edit to one named post (`💡 نصيحة GEO:` → `💡 نصيحة:` in 3511, decision 2026-11-05) and stops if it no longer matches; `review` only prints matches for a person to judge, including any mention of GEO in other posts, which is never removed automatically. None of these count as a difference when comparing a post with its source. `h1` → `h2`; attributes and empty paragraphs go; tables, code and quotes stay; internal links become relative final URLs. Anything it cannot decide (an image, an unknown tag, an internal link outside the sitemap snapshot) stops it. No image is downloaded.
- **Post descriptions when converting the remaining posts (decision 2026-11-05).** 36 of the 38 posts share one identical Yoast description, so:
  - Posts with the shared description and a hand-written excerpt (30): `description` = the excerpt verbatim, cleaned of HTML.
  - 1648 and 1772 (among those 30, with doubtful excerpts): show them to the developer at conversion, before using them.
  - The six with only an auto-generated excerpt (1912, 3329, 3336, 3338, 3343, 3346): propose a description from each post's own text; the developer approves it before it is written.
  - 3356 and 3511: keep the current Yoast description verbatim.
- After review, the script writes `content/posts/ar/<fileName>.mdx` with `slug` = the WordPress slug verbatim and `legacySlugs: []`, downloads images to `public/images/posts/` (ASCII names), and rewrites internal links from absolute `https://hrwhats.com/…` to the same relative path.

## Contact form

The static site has no Node server, so the contact form posts to **PHP on the same cPanel host**: `public/api/contact.php` → copied by the build to `out/api/contact.php` → `public_html/api/contact.php`. Setup steps for the server: `docs/contact-form-setup.md`.

- **Client:** `src/components/contact/` — `ContactForm` (React Hook Form + Zod, Arabic errors, honeypot `website` field), `Turnstile` (loads Cloudflare's script only when the form scrolls into view; contact page only). Delivery is isolated in `src/lib/contact-submit.ts` (`submitContact`) — the only place to change if the target changes. Endpoint: `contactEndpoint` in `site.json`.
- **Turnstile site key:** `turnstileSiteKey` in `site.json` (public). Empty → `next dev` uses Cloudflare's always-pass test key; **`next build` fails** with a clear message. `ALLOW_TURNSTILE_TEST_KEY=1` allows a local test build only — never deploy it.
- **Server (`contact.php`):** POST + JSON only, Origin check (`ALLOWED_ORIGINS` in `~/hrwhats-config.php`; default `https://hrwhats.com` only — implemented, so the form can run on the Spaceship test domain before launch), server-side validation (limits shared with `CONTACT_LIMITS`), honeypot → fake success, rate limit 5 / 10 min per IP, Turnstile `siteverify`, SMTP via PHPMailer (`public/api/_lib/`, blocked by its own `.htaccess`). Always answers `{ ok }` JSON; `display_errors` off; errors logged to `~/hrwhats-contact.log` (outside the web root). Needs PHP ≥ 8.0.
- **Config:** `~/hrwhats-config.php` = `dirname(__DIR__, 2) . '/hrwhats-config.php'`, i.e. the account home directory **next to** `public_html`, never inside it. Template: `config/hrwhats-config.example.php` (not published). Missing file → generic error to the visitor, reason in the log.
- **The generated `.htaccess` (launch phase) must not rewrite or block `/api/contact.php`.**

## Phases

1. **Foundation** — project setup, Tailwind + shadcn, RTL, fonts, i18n skeleton, Header/Footer.
2. **Home page** — all sections, built section by section. Create only the data files it needs (`clients`, `partners`, `faq`, `site` JSON) and `lib/content.ts` reading them.
3. **Packages + Contact.**
4. **Sectors + legal pages** — sectors are custom pages, one at a time (see Content architecture); legal pages share the `LegalPage` template (JSON text, no MDX). The usage guide is not built here (docs.hrwhats.com, see Usage guide).
5. **Blog** — Velite + MDX setup, listing, pagination, categories, post page, WordPress migration.
6. **SEO + launch** — sitemap, JSON-LD, `.htaccess` generation, URL tests on a Spaceship subdomain, deploy to Spaceship.
   - **Before any change:** a full WordPress backup (files + database), kept off the server.
   - Add the test domain to `ALLOWED_ORIGINS` in the server's `~/hrwhats-config.php` while testing the contact form there (`contact.php` already reads it); remove it afterwards.
   - Add the test domain and `newhr.tmt3.sa` to the Hostnames list of the Turnstile key in Cloudflare.
   - WordPress old-slug redirects: extract them from the database backup, from three sources: `_wp_old_slug` in `wp_postmeta`, the Redirection plugin's tables if present, and Yoast Premium redirects if present. Add them as 301s in the generated `.htaccess` and to the URL test's sources (see URLs and SEO).
   - Tracking tools: check the old site for Google Analytics, Google Tag Manager and Meta Pixel, and put the same IDs in the new site (after the developer approves).
   - 301s from the old usage-guide URLs (`/documentation-requirements-for-meta/`, `/link-account/`, `/hrwhats-guide/` — not `/whatsapp-ban/`, which stays a page here) to their pages on docs.hrwhats.com, in the generated `.htaccess` — **only after the developer sends the exact page URLs** (until then they would all go to the guide's home); the URL test must then expect these 301s. Update the site's guide links to the exact URLs at the same time (see Usage guide).
   - Site-wide Open Graph image, 1200×630 (deferred from the packages page). Wire it into `getRootMetadata` so every page inherits it.
   - **After launch:** submit the new sitemap in Search Console and check the most important pages with URL Inspection.
   - **After launch:** protect the staging copy `newhr.tmt3.sa` (a password, or a redirect to the main site).
   - **After launch:** weekly Search Console checks for the first two months; new 404 pages get redirects right away.
7. **English** — `messages/en.json`, translated pages, then posts gradually.

## Commands

```bash
npm run dev        # local development: scripts/dev.mjs (Velite watch + next dev)
npm run build      # scripts/build.mjs: velite build --strict + next build --webpack + image optimizer → out/ (later: .htaccess)
                   # SITE_ENV=staging (default) | production
                   # fails while site.json turnstileSiteKey is empty, unless
                   # ALLOW_TURNSTILE_TEST_KEY=1 (staging only — fails with SITE_ENV=production)
npm run lint
```

## Next.js version

- **Next.js is pinned to 16.4.2** (+ `eslint-config-next` 16.4.2, exact versions). **No upgrade unless the developer explicitly asks. Do not suggest upgrades or remind about them.** Decision by the developer (2026-11-04): the site is a static export and Next.js does not run in production, so server vulnerabilities do not affect it.
- **The built-in security check is off by the developer's decision:** `experimental.agentUpgrade: false` in `next.base.ts`. Builds no longer stop with `SecurityFatalError` inside AI agents. Never run `next upgrade --agent=…`.
- Do not run `npm audit fix`.

## Working rules for Claude

- For any non-trivial task, **propose a short plan first** and wait for approval.
- Work on **one page at a time**. A new page is built **complete in one go** (all its sections plus its header/footer/home links, SEO and CLAUDE.md updates), then the developer reviews it in the browser (decision 2026-11-03).
- After each page or change: **stop**, ask the developer to review it in the browser, and do not move on until they approve.
- **Do not send screenshots for review.** The developer reviews the site in the browser themselves. (Automated checks — builds, measurements, contrast — are still fine; report their results as text.)
- Keep components small and focused; extract repeated UI into `sections/` or `ui/`.
- After changes, run `npm run build` to confirm the static export still succeeds.
- **Secrets never enter the repository** — no API keys, SMTP passwords or Turnstile secret keys in code, JSON, docs or examples. Server secrets live only in `~/hrwhats-config.php` on the host (outside `public_html`); the repo holds an empty example. `.env*`, `hrwhats-config.php`, `node_modules/`, `.next/`, `out/`, `.velite/` must be in `.gitignore`.
- Commit messages: Conventional Commits in English (`feat:`, `fix:`, `chore:`, `content:`).
- **Repositories:** `origin` = `github.com/programmingtmt3/hrwhats` — the main repo, connected to the Hostinger staging build. `backup` = `github.com/MDMDcode/hrwhats` — a backup copy, **never pushed to automatically**; push to it only when the developer asks.
- After every **approved** commit, `git push` (to `origin`) immediately, then confirm `git status` shows the branch up to date with `origin/main`.
- When unsure about a product detail (features, pricing, wording), ask — don't invent marketing content.
