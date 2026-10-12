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
| Fonts | `next/font` — Arabic font (IBM Plex Sans Arabic or Tajawal) + a Latin font for English |
| Package manager | npm. Node 20+ |

Do not add dependencies outside this list without asking first.

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
│   ├── (en)/en/              ← English routes (later phase, same shape)
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── ui/                   ← shadcn components
│   ├── layout/               ← Header, Footer, MobileMenu, LanguageSwitcher
│   ├── sections/             ← Hero, Features, Sectors, Clients, Partners, FAQ, CTA
│   ├── pages/                ← shared page components (HomePage, PostPage, …)
│   └── mdx/                  ← components usable inside MDX
├── lib/
│   ├── content.ts            ← the only content access layer
│   ├── i18n.ts               ← locales, getDictionary, path helpers
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
2. **Content layer** — Velite schemas, data JSON files, `lib/content.ts`.
3. **Home page** — all sections.
4. **Packages + Contact.**
5. **Sectors, usage guide, legal pages.**
6. **Blog** — listing, pagination, categories, post page, WordPress migration.
7. **SEO + launch** — sitemap, JSON-LD, `.htaccess` generation, redirect tests, deploy.
8. **English** — `messages/en.json`, translated pages, then posts gradually.

## Commands

```bash
npm run dev        # local development
npm run build      # velite + next build → out/ (+ .htaccess)
npm run lint
```

## Working rules for Claude

- For any non-trivial task, **propose a short plan first** and wait for approval.
- Keep components small and focused; extract repeated UI into `sections/` or `ui/`.
- After changes, run `npm run build` to confirm the static export still succeeds.
- Never commit secrets. `.env*`, `node_modules/`, `.next/`, `out/`, `.velite/` must be in `.gitignore`.
- Commit messages: Conventional Commits in English (`feat:`, `fix:`, `chore:`, `content:`).
- When unsure about a product detail (features, pricing, wording), ask — don't invent marketing content.
