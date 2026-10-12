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
| Styling | Tailwind CSS |
| UI components | shadcn/ui (Radix) |
| Icons | lucide-react |
| Animation | Motion — subtle only (section reveal, hover). No heavy effects |
| Content | MDX + JSON, processed by **Velite** with Zod schemas |
| Images | `next-image-export-optimizer` (build-time optimization) |
| Forms | React Hook Form + Zod (client-side only) |
| Fonts | `next/font/google` — IBM Plex Sans Arabic (Arabic) + IBM Plex Sans (English), weights 400/500/700 only |
| Package manager | npm. Node 24 LTS |

Do not add dependencies outside this list without asking first. (`cn`, `class-variance-authority`, `radix-ui`, `tw-animate-css` and `shadcn` come with shadcn/ui and are part of it.)

The project runs **Next.js 16** — see `AGENTS.md`: read the bundled docs in `node_modules/next/dist/docs/` before using an API you are unsure about.

## Hard constraints: static export

The site is built with `next build` into `out/` and uploaded to `public_html`. There is **no Node server in production**. Therefore:

- No Server Actions, no dynamic Route Handlers, no middleware/proxy, no ISR, no `headers()`/`cookies()`.
- No `redirects()` / `rewrites()` in `next.config.ts` — they do not work in export. Redirects go into a generated `.htaccess` (see below).
- Every dynamic route must implement `generateStaticParams` and set `dynamicParams = false`.
- `next/image` default loader does not work — use the export optimizer's component.
- `app/sitemap.ts` and `app/robots.ts` are allowed (they export as static files).
- Server Components by default; add `"use client"` only where interactivity is needed.

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

- Use **logical properties only**: `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`, `border-s`, `rounded-s`, etc.
- **Never** use `ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`, `right-*`, `text-left`, `text-right` for layout.
- Directional icons (arrows, chevrons) must flip in RTL (`rtl:rotate-180` or locale-aware icon choice).
- Mobile-first. Test every section at 375px width.
- shadcn components are generated with `"rtl": true` (components.json). After adding a new one, check it for physical classes (`left`, `right`, `slide-in-from-left`, …) and convert them (e.g. Sheet uses `side="start" | "end"`).
- Radix direction comes from `DirectionProvider` in `LocaleDocument`.

## Brand & design

**Fonts:** IBM Plex Sans Arabic on Arabic pages (it includes matching Latin glyphs), IBM Plex Sans on English pages. Weights 400, 500, 700 only. Each font lives in its own module (`src/lib/fonts/ar.ts`, `en.ts`) so a page loads only its language's font; CSS picks it via `html:lang(..) { --font-site }`.

**Colors:** white, black and the brand greens. All values are defined **only** as CSS variables in `src/app/globals.css` and exposed to Tailwind via `@theme`. Never write a hex/rgb value in a component.

| Token | Hex | Use |
|---|---|---|
| `brand-100` | `#DDEEE0` | soft surfaces (`secondary`, `accent`) with `brand-900` text |
| `brand-300` | `#66B95D` | decorative only, or background with black text |
| `brand-500` | `#32B159` | decorative only, or background with black text |
| `brand-700` | `#16876B` | focus ring; text only if large (≥ 24px, or ≥ 18.66px bold) |
| `brand-900` | `#076951` | `primary` — buttons, links, headings accent; white text on it |
| `brand-950` | derived | hover state of `primary` |

Any text on a green background must pass **WCAG AA** (4.5:1 normal text). White on `brand-500`/`brand-300`/`brand-700` fails — use `brand-900` for white text. Contrast notes are kept in the comment at the top of `globals.css`.

**Logo:** `public/images/brand/hrwhats-logo.png`, path defined once in `src/lib/brand.ts` (`LOGO`) — an SVG version will replace it there. Always `alt="HRwhats"`; links to the home page. `src/app/favicon.ico`, `icon.png` and `apple-icon.png` are generated from it (regenerate when the SVG arrives).

**Header** (`src/components/layout/Header.tsx`), in this order:
1. القطاعات — dropdown with the 10 sectors
2. الباقات
3. دليل الاستخدام — dropdown: متطلبات التوثيق، ربط الحساب، شروحات المنصة، حظر الواتساب
4. المدونة
5. تواصل معنا

On the other side: "تسجيل الدخول" link → `https://app.hrwhats.com/login` and a prominent "جرب مجاناً" button → `https://app.hrwhats.com/signup`. Logo links home. Desktop dropdowns use shadcn `navigation-menu`; on mobile a side `Sheet` where dropdowns become an `Accordion`. Menu structure is defined in `src/lib/navigation.ts`.

**404:** with multiple root layouts, `out/404.html` comes from `src/app/global-not-found.tsx` (experimental `globalNotFound`). It must keep `lang="ar" dir="rtl"` and the Arabic header/footer.

## Content architecture

```
content/
├── posts/ar/*.mdx        ← blog posts (later posts/en/)
├── sectors/ar/*.mdx      ← 10 sector landing pages
├── pages/ar/*.mdx        ← usage guide + legal pages
└── data/
    ├── clients.json      ← client names + logos + optional URL
    ├── partners.json     ← success partners
    ├── packages.json     ← pricing packages
    ├── faq.json          ← FAQ items
    └── site.json         ← contact info, social links, app URLs
```

- **File names are ASCII English** (`whatsapp-blue-tick.mdx`). Never Arabic or emoji file names.
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
│   ├── layout/               ← LocaleDocument, Header, DesktopNav, MobileMenu, Footer, Logo, LanguageSwitcher
│   ├── sections/             ← Hero, Features, Sectors, Clients, Partners, FAQ, CTA
│   ├── pages/                ← shared page components (HomePage, PostPage, …)
│   └── mdx/                  ← components usable inside MDX
├── lib/
│   ├── content.ts            ← the only content access layer
│   ├── i18n.ts               ← locales, getDictionary, localePath, format
│   ├── navigation.ts         ← header/footer menu structure
│   ├── brand.ts              ← LOGO (single source for the logo path)
│   ├── site.ts               ← SITE_URL, APP_URLS (moves to site.json in phase 2)
│   ├── fonts/{ar,en}.ts      ← next/font definitions, one module per language
│   └── seo.ts                ← metadata + JSON-LD helpers
messages/ar.json
content/
public/images/{clients,partners,sectors,posts}/
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

No server in production. The form validates client-side and submits to an external endpoint (to be decided: `app.hrwhats.com` API, a form service, or a prefilled WhatsApp link). Keep the submit logic isolated in one function so the target can be swapped.

## Phases

1. **Foundation** — project setup, Tailwind + shadcn, RTL, fonts, i18n skeleton, Header/Footer.
2. **Home page** — all sections, built section by section. Create only the data files it needs (`clients`, `partners`, `faq`, `site` JSON) and `lib/content.ts` reading them.
3. **Packages + Contact.**
4. **Sectors, usage guide, legal pages** — Velite + MDX setup happens here (schemas, collections), not earlier.
5. **Blog** — listing, pagination, categories, post page, WordPress migration.
6. **SEO + launch** — sitemap, JSON-LD, `.htaccess` generation, redirect tests, deploy.
7. **English** — `messages/en.json`, translated pages, then posts gradually.

## Commands

```bash
npm run dev        # local development
npm run build      # velite + next build → out/ (+ .htaccess)
npm run lint
```

## Working rules for Claude

- For any non-trivial task, **propose a short plan first** and wait for approval.
- Work on **one page at a time**; a long page is built **one section at a time**.
- After each part: **stop**, ask the developer to review it in the browser, and do not move to the next part until they approve.
- Keep components small and focused; extract repeated UI into `sections/` or `ui/`.
- After changes, run `npm run build` to confirm the static export still succeeds.
- Never commit secrets. `.env*`, `node_modules/`, `.next/`, `out/`, `.velite/` must be in `.gitignore`.
- Commit messages: Conventional Commits in English (`feat:`, `fix:`, `chore:`, `content:`).
- When unsure about a product detail (features, pricing, wording), ask — don't invent marketing content.
