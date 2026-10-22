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
| Content | JSON validated with Zod in `lib/content.ts`; MDX via **Velite** from the sectors phase |
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
├── sectors/ar/*.mdx      ← 10 sector landing pages
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
- **Pages never read content files directly.** All access goes through `src/lib/content.ts` (`getPosts(locale)`, `getPostBySlug(locale, slug)`, `getClients()`, …). This layer is the only thing that changes if we later add a Git-based CMS (Keystatic).

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
- Pages, sectors and posts all live at the **site root** (`/slug/`), served by one `[slug]` route that looks up posts → sectors → pages. The build must **fail if the same slug exists in two collections**.
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
4. **Sectors, usage guide, legal pages** — Velite + MDX setup happens here (schemas, collections), not earlier.
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
