# CLAUDE.md — hrwhats.com

## Project overview

Rebuild of **hrwhats.com**, the marketing site for HRwhats (a WhatsApp Business API + CRM platform), currently on WordPress. The new site is a **Next.js static site** (static export) deployed to shared cPanel hosting (Spaceship, LiteSpeed).

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
| Content | JSON validated with Zod in `lib/content.ts`; MDX via **Velite** from phase 4 (usage guide + legal pages) |
| Images | `next-image-export-optimizer` (build-time optimization) |
| Forms | React Hook Form + Zod (client-side only) |
| Fonts | `next/font/google` — IBM Plex Sans Arabic (Arabic) + IBM Plex Sans (English), weights 300–700 |
| Package manager | npm. Node 24 LTS |

Do not add dependencies outside this list without asking first. (`cn`, `class-variance-authority`, `radix-ui`, `tw-animate-css` and `shadcn` come with shadcn/ui and are part of it.)

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

- **staging** (Hostinger preview: build locally, upload `out/` to a regular Website — **not** a Node.js Web App, which forces Next.js into standalone server mode and rejects static export; see `docs/deploy-hostinger.md`): `robots.txt` = `Disallow: /`, `noindex, nofollow` on every page (via `getRootMetadata`), **no sitemap**. `ALLOW_TURNSTILE_TEST_KEY=1` is allowed here.
- **production** (the real launch on cPanel): normal indexing. `ALLOW_TURNSTILE_TEST_KEY=1` always fails the build.
- New SEO outputs must respect this: `app/sitemap.ts` (launch phase) must produce nothing in staging, and no page may override `robots` to make staging indexable.
- `npm run build` alone must produce the complete `out/` (hosts run nothing else). Node 24 (`engines` + `.nvmrc`).

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

**Fonts:** IBM Plex Sans Arabic on Arabic pages (it includes matching Latin glyphs), IBM Plex Sans on English pages. Weights 300–700. Each font lives in its own module (`src/lib/fonts/ar.ts`, `en.ts`) so a page loads only its language's font; CSS picks it via `html:lang(..) { --font-site }`.

**Logo:** `public/images/brand/hrwhats-logo-trimmed.png` (transparent margins trimmed), path defined once in `src/lib/brand.ts` (`LOGO`), rendered through `BrandLogo` — an SVG version will replace it there. Heights: header 54px (44px ≤600px), footer 36px. The original padded file stays as `LOGO_SQUARE` (`BrandLogo square`) for the hero chat avatar and as the favicon source. Always `alt="HRwhats"`. `src/app/favicon.ico`, `icon.png` and `apple-icon.png` are generated from it (regenerate when the SVG arrives).

**Header** — exactly as the design: الرئيسية، الباقات، المدونة، دليل الاستخدام (`/hrwhats-guide/`)، تواصل معنا، a "لوحة التحكم" ghost button → `app.hrwhats.com/login` and a "جرب مجاناً" primary button → `app.hrwhats.com/signup`. No dropdowns. Fixed; gets a blurred white background after 10px of scroll. Below 1080px a burger opens the menu as a panel under the header; the "لوحة التحكم" link appears inside that menu (fixed vs. the design, where a rule-order bug hid it). Server part `Header.tsx`, client part `HeaderBar.tsx`, links in `src/lib/navigation.ts`.
- The header is `position: fixed` (`--header-h: 76px`): every page's first section needs its own top padding (the hero uses 160px).

**Footer** and **floating WhatsApp button** — exactly as the design; contact and social data come from `content/data/site.json`.

**Animation:** CSS + IntersectionObserver with the design's exact timings (no Motion library on the home page). Use `<Reveal>` (any HTML tag) or `<RevealLink>` (next/link) from `src/components/motion/`; server components cannot pass a component (e.g. `Link`) as a prop to a client component. Hover effects on `.reveal` elements must use the `translate` property (not `transform`, which the reveal owns). `prefers-reduced-motion` disables animations; `<noscript>` reveals `.reveal` content when JS is off.

**404:** with multiple root layouts, `out/404.html` comes from `src/app/global-not-found.tsx` (experimental `globalNotFound`). It must keep `lang="ar" dir="rtl"` and the Arabic header/footer.

## Content architecture

```
content/
├── posts/ar/*.mdx        ← blog posts (later posts/en/)
├── pages/ar/*.mdx        ← usage guide + legal pages
└── data/
    ├── clients.json      ← client names + logos (+ intrinsic width/height)
    ├── partners.json     ← success partners (same shape)
    ├── packages.json     ← pricing packages
    ├── sectors.json      ← slug + name + image — the ONLY source of sector names site-wide (home grid, navigation, sector pages)
    ├── faq.json          ← FAQ items
    └── site.json         ← contact info, social links, app URLs, `trustedCount` (the "+N جهة" number in the home trust bar — set by hand, NOT computed from clients.json)
```

- **File names are ASCII English** (`whatsapp-blue-tick.mdx`). Never Arabic or emoji file names.
- **Client/partner logos:** `public/images/{clients,partners}/NN-short-english-name.ext` (two-digit display order, lowercase, hyphens). The JSON lists them in the same order — Zod fails the build otherwise. **Any new logo must be at most 600px wide** (downscale before committing, keep format and transparency, never upscale) and its `width`/`height` in the JSON must match the file.
- **Banners:** `public/images/banners/` with short ASCII English names (`bnr-1.png`, …). Compress before committing without changing dimensions or visible quality (e.g. palette PNG at quality 100), render with `SiteImage` at the file's real width/height.
- A translation of a post has the **same file name** under the other locale folder.
- Text fields in JSON data are bilingual objects: `{ "ar": "...", "en": "..." }` (`en` may be empty until the English phase).
- Every content type has a Zod schema in `velite.config.ts`. A missing required field must fail the build.
- **Sector pages are custom, one design per sector** — no shared sector template and no sector MDX. Each sector has a static route folder `src/app/(ar)/<slug>/page.tsx` (thin wrapper) and its own sections in `src/components/sectors/<slug>/` (e.g. `charity/`). Shared: tokens, fonts, buttons, `SectionHeading`, header, footer, `Cta`, `Reveal`. The slug and name come from `sectors.json` via `getSector(slug)` (throws if missing); all page text lives in `messages/ar.json` under `sectors.<slug>`. Page-only assets go in `public/images/sectors/<slug>/` (never mixed with the sector card image `public/images/sectors/<slug>.jpg`). **Sector pages use no images from the old WordPress site — not on the page and not as Open Graph images.** Every visual is built in code (or generated, like the tourism world map). Sector pages set no page OG image: they inherit the site-wide one (1200×630, launch phase). The only old-site images kept are the sector card images on the home page.
- **Illustrative data — rule for every sector page.** Mockups built in code (chats, cards, boards, dashboards) use generic example data from `ar.json` and carry a visible "مثال توضيحي" tag (`ExampleTag`). Allowed: generic campaign names, common first names for customers and staff, reasonable prices/areas/amounts, and places described by type + area ("شقة 3 غرف — شمال الرياض"). Never: real company, association or project names, invented project names (they may match real ones), or numbers that look like statistics about the platform. Relative visuals (bars, dots, funnels) carry no figures.
- Shared sector building blocks live in `src/components/sectors/shared/` (`ExampleTag`, `FeatureItem` — `plain` variant for section-level text). A sector page may replace the site-wide `<Cta>` with its own closing panel when its closing text already is the call to action (e.g. real-estate).
- **Pages never read content files directly.** All access goes through `src/lib/content.ts` (`getPosts(locale)`, `getPostBySlug(locale, slug)`, `getClients()`, …). This layer is the only thing that changes if we later add a Git-based CMS (Keystatic).

### Sector page ideas already used

Each sector page must look and behave differently. **Before proposing a new sector page, check this list and reuse none of it; add the new page here when it ships.**

| Page | Visual theme | Signature elements | Interaction / motion |
|---|---|---|---|
| `charity` | Warm cream background, "impact" | Campaign card with a progress bar + floating glass notifications; bento with an inbox mockup; WhatsApp phone; dark campaign dashboard (KPIs + bars); result as 4 animated cards (rows, rising line, growing columns, shrinking vs filling bars) | **Sticky phone** while the donor-journey stages scroll past (timeline with numbered markers); spotlight hover on bento cards |
| `real-estate-contracting` | **Blueprint** grid paper (light + dark), drawing sheets with corner marks | WhatsApp-Web window with a property card + building line drawing; inquiry routing list; WhatsApp list message; campaign composer; **Kanban** pipeline; sales-team dots + bars; **conversion funnel**; dark closing panel with a **Saudi landmarks skyline** | Stage index (anchor links) + **alternating numbered sheets** on a dashed path; Kanban cards slide between columns |
| `education-training` | **Ruled notebook paper** with a margin line | One floating WhatsApp message with a course card; **taped sticky notes**; inquiry folders; self-filling registration form (typing); **monthly calendar**; **attendance sheet**; admission team trays; **report rings**; **graduation certificate** closing with a seal | **WAI-ARIA tabs** (binder-divider tabs; on phones a strip scrolling inside itself); each tab plays its mockup once |
| `tourism-hospitality` | **Dot-matrix world map** (one SVG mask, Saudi Arabia highlighted, pulse on Riyadh, flight lines to 4 continents) behind the hero, then plain; travel objects | **Boarding-pass** booking confirmation + **room key card** + dotted flight path with a plane; drawn room-photo album; booking stamp + arrival reminder; **door hanger** with request statuses; star rating + **postcard with stamp and postmark**; reception **key rack**; **departures (split-flap) board**; **luggage tag** closing with a strap | **Carousel** (scroll-snap track, swipe, prev/next, route stops, arrow keys) with a **suitcase moving along a dotted route**; each slide plays once |
| `online-stores-systems` | **Receipt paper** with zigzag (torn) edges; white hero band with a zigzag bottom | WhatsApp catalog with **CSS-drawn products**; one long **receipt strip** holding the service texts (mockups always on the same side); inquiry inbox; bot suggesting a product; **invoice printing out of a printer slot** with a stamp; dark **abandoned-cart spotlight** (abandoned cart → reminder with a **coupon** → recovered); **before/after comparison**; vertical **shipment tracking**; **activity heatmap** (days × times, shades only); **checkout order-summary** closing | **Interactive mini shop** in the hero (add to cart with a bumping badge, checkout → computed invoice, start over; aria-live); **filter chips** (aria-pressed) on the inbox; **draggable comparison slider** (role="slider": pointer, touch, arrows, Home/End; one-time handle nudge + "drag" hint that fades after the first interaction) |
| `advertising` | **Design-tool canvas** (Figma-like): page-wide **dot grid**, services as **artboards** with frame names, **selection frame + corner handles**, **named teammate cursors**; three example-client colors (`--client-food/-clinic/-shop`, mockups only) | **Agency dashboard** whose chats/campaign/performance bar follow the selected client; **unified inbox** color-coded by client; night-time **numbered menu** auto-reply with a package card ("باقة شهرية", no price); **A/B message versions** with relative engagement bars + winner badge; **lead thermometer** (cold → warm → hot, leads climb to their level) + auto-captured fields; teammate cursors working on **client account cards** + reply-speed bars; **white-label report** with sparklines and a picture-only "تصدير PDF"; **sponsored social post** closing | **Client switcher** (`radiogroup`, RTL arrows, Home/End, roving tabindex; one automatic tour 0→1→2 on first view, stopped by any interaction, skipped with reduced motion; aria-live on user choices); **audience switch** (`role="switch"`) on the A/B test; artboards in **two staggered columns linked by prototype connectors** that draw in; cursors glide in and drift |
| `hr` | **Official workplace tools**; a **lanyard ribbon** runs down the services with **station signs** (wayfinding plates labeled أولاً / ثانياً / ثالثاً) pinned to it | **Employee ID badge on a lanyard** (code-drawn photo initial, decorative code pattern) + HR-assistant chat with a leave balance; services grouped into **3 journey stations** (before joining → daily work → HR management); **CV scanned → candidate card**; night-time **numbered procedure steps**; **routing slip** whose approval boxes get **hand-drawn signatures** (no stamp) then "معتمد"; **official memo with letterhead** + per-department read receipts; **mini org chart** with chats dropping to specialists; **half-circle gauges with needles** (no figures); closing **entrance reader** (badge taps it, LED turns green, "مرحباً بك") | **Flip cards** (FAQ: question front, auto-reply back; card tap or a toggle button with `aria-pressed`; both faces stay in the accessibility tree; constant height; reduced motion swaps without rotating); badge **swings once** on first view; reader sequence plays once |
| `operating-service` | **Operations control room**: services as **work orders on clipboards** (only the dark board behind the paper tilts, alternating; metal clip; "أمر عمل 01" header), **diagonal tape** between sections in brand greens, **status LEDs**, **priority badges** (`--alert` / `--amber`, mockups only) | Hero: WhatsApp report with a **code-drawn map + photo of the fault** that becomes a classified, routed **work order**; bot intake + **sorting conveyor belt** dropping requests into department bins; status updates with a **4-segment progress bar** and an **emoji rating** (no stars); **technician cards with LEDs** and an assignment; **maintenance contract** with periodic-visit track, reminder, renew + extra-service offer; **control-room panels** (LED rows + scrolling wave screens, no figures); closing **power panel** with a big switch | **Sortable request board** (sort buttons with `aria-pressed`; **FLIP** reordering; "by department" adds department headings; aria-live; reduced motion jumps); switch flips + lights + content appear once |
| `restaurants-cafes` | **Inside the restaurant**: cream hero, **kitchen rail** with clipped **order tickets**, rising **steam**, **chalkboard** in a wooden frame (`--chalk`, `--wood`), printed **menu card** with dotted leaders | Hero: WhatsApp **menu with category buttons** and dish ……… price lines, **upsell as a yes/no line inside the order summary**, ticket slides onto the rail (no printing); order screen; night auto-reply sending the menu as a file; tickets with pickup/delivery tags; **steaming plate** + delivery statuses; **loyalty stamp card** (cups; "الكوب السادس علينا"); order split to cashier/kitchen/delivery; **peak-hours day dial** (conic shades, no figures); campaigns as a **quiet-hours offer on the chalkboard** + broadcast; values as a **menu with ✓ instead of prices**; closing **neon "مفتوح الآن" sign** on a brick wall | **Interactive floor plan with hotspots** (7 numbered buttons, `aria-expanded`/`aria-controls`, first open; all panels in the HTML; phones: plain numbers + the full numbered list); neon sign flickers on once |
| `shops` | **Saudi shop front**: striped **awning** in brand greens, **rolling metal shutter**, wooden **shelves**, **kraft price tags** with a hole and string (`--kraft`), decorative **QR codes** (2 finder squares only — not scannable) | Hero: shop front whose shutter rolls up to show stocked shelves + a size/colour availability chat ("احجزه لي"); signature **QR section** ("scan instead of «كم رقم جوالك؟»": 4 steps, the old way (number typed by hand on a computer, with a corrected typo) vs one scan, 3 placements: cashier stand, glass front, shelf tag); services as **price tags beside mockups standing on shelves**: shelf card with size availability dots, product sheet + similar items, **pickup vs delivery** choice with a pickup code, **shop-window sale decals** + broadcast, after-sale follow-up + returning customer, in-store vs WhatsApp sales lanes, **bestsellers as box stacks**; closing **kraft shopping bag** with rope handles and a gift tag holding the buttons | **Press-to-scan simulator** (tap, click, long press or held Space/Enter all start the same scan that completes on its own; WhatsApp opens with the ready message; "Send" → "تم حفظ الرقم تلقائياً ✓"; try again; `aria-current="step"` on the step list; focus follows; aria-live; no long-press callout/selection); shutter rolls up once; bag drops in and sways once |

Closing sections: charity uses the site-wide `<Cta>`; the others use their own closing panel instead (dark blueprint panel, certificate, luggage tag, checkout summary, sponsored post, entrance reader, power panel, neon sign, shopping bag).

Post frontmatter (minimum):

```yaml
---
title: طريقة الحصول على العلامة الزرقاء في الواتساب
description: ...
slug: whatsapp-blue-tick
legacySlugs: []          # old WordPress slugs (decoded), used to generate 301s
date: 2026-09-20
categories: [whatsapp]
cover: /images/posts/whatsapp-blue-tick.jpg
---
```

## URLs and SEO

The current site ranks on Google. **Protecting existing traffic is the top priority.**

- **All new slugs are clean English.** Old Arabic/emoji slugs go into `legacySlugs` and are 301-redirected.
- Pages, sectors and posts all live at the **site root** (`/slug/`). Posts and MDX pages are served by one `[slug]` route (posts → pages); sectors have their own static route folders. The build must **fail if the same slug exists twice** — the check (blog phase) must cover posts, MDX pages, every slug in `sectors.json` and every static route folder under `app/(ar)/` (`packages`, `contact`, `news`, sector folders, …).
- Blog index: `/news/`, pagination: `/news/page/2/`, categories: `/category/{whatsapp|marketing|hrwhats-guide}/`.
- Old `/index.php/...` URLs redirect to the clean URL.
- **Redirects:** a build script generates `out/.htaccess` from all `legacySlugs` (+ the `/index.php/` rule + `ErrorDocument 404 /404.html`). Arabic legacy slugs must be matched correctly in their percent-encoded form — this must be verified by the redirect test script, not assumed.
- **Redirect test script** (`scripts/test-redirects.ts`): takes every URL from the old WordPress sitemap and checks it returns 301 to a working page. Must pass 100% before launch.
- Every page: unique `title` + `description` via the Metadata API, canonical URL with trailing slash, Open Graph image.
- JSON-LD: `Organization` (site-wide), `FAQPage` (FAQ sections), `Article` (posts), `BreadcrumbList`.
- Internal links between posts must point to the **new** URLs directly (no redirect hops).

## Page inventory (Arabic, phase 1)

| Type | Slugs |
|---|---|
| Main | `/`, `/packages/`, `/contact/`, `/news/` |
| Sectors | `charity`, `real-estate-contracting`, `education-training`, `tourism-hospitality`, `online-stores-systems`, `advertising`, `hr`, `operating-service`, `restaurants-cafes`, `shops` |
| Usage guide | `documentation-requirements-for-meta`, `link-account`, `hrwhats-guide`, `whatsapp-ban` |
| Legal | `privacy-policy`, `terms-of-use`, `refund-policy` |
| Blog | ~50 posts migrated from WordPress |

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
├── components/
│   ├── ui/                   ← shadcn components
│   ├── layout/               ← LocaleDocument, Header(+Bar), Footer, WhatsAppFloat, BrandLogo, LanguageSwitcher
│   ├── icons/                ← design SVG icons
│   ├── seo/                  ← JsonLd
│   ├── sectors/<slug>/       ← one folder per sector page (custom design); shared/ for common blocks
│   ├── sections/             ← Hero, Features, Sectors, Clients, Partners, FAQ, CTA
│   ├── pages/                ← shared page components (HomePage, PostPage, …)
│   └── mdx/                  ← components usable inside MDX
├── lib/
│   ├── content.ts            ← the only content access layer (Zod-validated)
│   ├── i18n.ts               ← locales, getDictionary, localePath, format
│   ├── env.ts                ← SITE_ENV (staging | production)
│   ├── navigation.ts         ← header/footer menu structure
│   ├── brand.ts              ← LOGO (single source for the logo path)
│   ├── fonts/{ar,en}.ts      ← next/font definitions, one module per language
│   └── seo.ts                ← metadata + JSON-LD helpers
messages/ar.json
content/
public/images/{brand,banners,clients,partners,sectors,posts}/
public/api/
├── contact.php               ← contact form endpoint (PHP on the host)
└── _lib/                     ← PHPMailer 7.1.1 (+ .htaccess deny all)
config/hrwhats-config.example.php ← template for ~/hrwhats-config.php (no secrets)
docs/contact-form-setup.md    ← server setup guide (Arabic)
docs/deploy-hostinger.md      ← staging deploy on Hostinger (Arabic)
scripts/
├── migrate-wordpress.ts      ← pulls posts from WP REST API → MDX
├── generate-htaccess.ts
└── test-redirects.ts
```

## WordPress migration

- **Do not modify the live WordPress site.** It stays untouched until launch day.
- `scripts/migrate-wordpress.ts` reads `https://hrwhats.com/wp-json/wp/v2/posts` (with categories and featured images), decodes slugs, and produces `scripts/slug-map.json` (`title`, `oldSlug`, `newSlug`) for **human review** before any MDX is written.
- After review, the script writes MDX files with `slug` = new slug and `legacySlugs` = old slug, downloads images to `public/images/posts/`, and rewrites internal links to new URLs.

## Contact form

The static site has no Node server, so the contact form posts to **PHP on the same cPanel host**: `public/api/contact.php` → copied by the build to `out/api/contact.php` → `public_html/api/contact.php`. Setup steps for the server: `docs/contact-form-setup.md`.

- **Client:** `src/components/contact/` — `ContactForm` (React Hook Form + Zod, Arabic errors, honeypot `website` field), `Turnstile` (loads Cloudflare's script only when the form scrolls into view; contact page only). Delivery is isolated in `src/lib/contact-submit.ts` (`submitContact`) — the only place to change if the target changes. Endpoint: `contactEndpoint` in `site.json`.
- **Turnstile site key:** `turnstileSiteKey` in `site.json` (public). Empty → `next dev` uses Cloudflare's always-pass test key; **`next build` fails** with a clear message. `ALLOW_TURNSTILE_TEST_KEY=1` allows a local test build only — never deploy it.
- **Server (`contact.php`):** POST + JSON only, Origin check (`https://hrwhats.com`), server-side validation (limits shared with `CONTACT_LIMITS`), honeypot → fake success, rate limit 5 / 10 min per IP, Turnstile `siteverify`, SMTP via PHPMailer (`public/api/_lib/`, blocked by its own `.htaccess`). Always answers `{ ok }` JSON; `display_errors` off; errors logged to `~/hrwhats-contact.log` (outside the web root). Needs PHP ≥ 8.0.
- **Config:** `~/hrwhats-config.php` = `dirname(__DIR__, 2) . '/hrwhats-config.php'`, i.e. the account home directory **next to** `public_html`, never inside it. Template: `config/hrwhats-config.example.php` (not published). Missing file → generic error to the visitor, reason in the log.
- **The generated `.htaccess` (launch phase) must not rewrite or block `/api/contact.php`.**

## Phases

1. **Foundation** — project setup, Tailwind + shadcn, RTL, fonts, i18n skeleton, Header/Footer.
2. **Home page** — all sections, built section by section. Create only the data files it needs (`clients`, `partners`, `faq`, `site` JSON) and `lib/content.ts` reading them.
3. **Packages + Contact.**
4. **Sectors, usage guide, legal pages** — sectors are custom pages, one at a time (see Content architecture). Velite + MDX setup (usage guide + legal) happens here, not earlier.
5. **Blog** — listing, pagination, categories, post page, WordPress migration.
6. **SEO + launch** — sitemap, JSON-LD, `.htaccess` generation, redirect tests, deploy.
   - Site-wide Open Graph image, 1200×630 (deferred from the packages page). Wire it into `getRootMetadata` so every page inherits it.
7. **English** — `messages/en.json`, translated pages, then posts gradually.

## Commands

```bash
npm run dev        # local development
npm run build      # next build --webpack + image optimizer → out/ (later: velite, .htaccess)
                   # SITE_ENV=staging (default) | production
                   # fails while site.json turnstileSiteKey is empty, unless
                   # ALLOW_TURNSTILE_TEST_KEY=1 (staging only — fails with SITE_ENV=production)
npm run lint
```

## Next.js security upgrades

- **Due 2026-10-28: upgrade Next.js 16.4.0 → 16.4.1** (patch only; it fixes GHSA-673q-mjm6-r5xr, GHSA-2464-fhr4-w9xw and GHSA-p3m5-59mp-jv5r). Waiting until then so the release is at least two weeks old. The site is not affected meanwhile: all three need a running Next.js server (`use cache`, the `/_next/image` API, Server Actions), and the static export has none; `sharp` is already 0.35.5 (the fixed version). Steps: `npm ci`, staging build, check every page, separate `chore:` commit, push.
- Upgrade policy: latest patch of the current minor (16.4.x), released at least two weeks ago — never a new major/minor without asking.
- **"Build fails the first time, passes on retry" is intended Next.js behavior, only inside AI agents.** Next.js defaults to `experimental.agentUpgrade: "security"`: each build checks npm advisories, and when the installed version is affected and an AI agent is detected (env such as `CLAUDECODE`, `AI_AGENT`), it stops with a `SecurityFatalError` and writes a retry receipt in `.next/cache/next-agentic-upgrade-retries/` valid for 5 minutes, so the same command passes on retry. In CI (GitHub Actions, Hostinger) or a non-interactive shell it never stops the build; in a human terminal it shows a prompt. **Do not disable `agentUpgrade`** — the warning is useful. Never run the `next upgrade --agent=…` command it suggests without the developer's approval.

## Working rules for Claude

- For any non-trivial task, **propose a short plan first** and wait for approval.
- Work on **one page at a time**; a long page is built **one section at a time**.
- After each part: **stop**, ask the developer to review it in the browser, and do not move to the next part until they approve.
- **Do not send screenshots for review.** The developer reviews the site in the browser themselves. (Automated checks — builds, measurements, contrast — are still fine; report their results as text.)
- Keep components small and focused; extract repeated UI into `sections/` or `ui/`.
- After changes, run `npm run build` to confirm the static export still succeeds.
- **Secrets never enter the repository** — no API keys, SMTP passwords or Turnstile secret keys in code, JSON, docs or examples. Server secrets live only in `~/hrwhats-config.php` on the host (outside `public_html`); the repo holds an empty example. `.env*`, `hrwhats-config.php`, `node_modules/`, `.next/`, `out/`, `.velite/` must be in `.gitignore`.
- Commit messages: Conventional Commits in English (`feat:`, `fix:`, `chore:`, `content:`).
- After every **approved** commit, `git push` to `origin` immediately, then confirm `git status` shows the branch up to date with `origin/main`.
- When unsure about a product detail (features, pricing, wording), ask — don't invent marketing content.
