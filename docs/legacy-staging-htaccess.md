# ملف .htaccess القديم على معاينة Hostinger

وُجد في `public_html/.htaccess` على المعاينة `newhr.tmt3.sa` (Hostinger) يوم 2026-11-10. **ليس من هذا المستودع ولا يولّده البناء**: نشر Hostinger من GitHub يرفع ملفات `out/` ولا يحذف الملفات القديمة في `public_html`، فبقي هذا الملف من عمل سابق.

كان السطر 9 يحوّل كل صفحات ترقيم المدونة `/news/page/N/` إلى `/news/` (301)، فتعطّل الترقيم على المعاينة فقط. عطّله المطوّر يدوياً بـ `#` على الخادم في 2026-11-10.

> **هذه القواعد مرشّحات لملف `.htaccess` النهائي، وليست قرارات معتمدة.** تُراجع واحدة واحدة عند كتابة `scripts/generate-htaccess.ts` في مرحلة الإطلاق (CLAUDE.md → Phases 6)، ثم تُختبر على نطاق تجريبي في Spaceship.

## نص الملف كما وُجد (قبل تعطيل السطر 9)

```apache
# Permanent redirects for old WordPress URLs (Apache / LiteSpeed).
RewriteEngine On

RewriteRule ^index\.php/?$ / [R=301,L]
RewriteRule ^index\.php/(.+?)/?$ /$1/ [R=301,L]
RewriteRule ^old/?$ / [R=301,L]
RewriteRule ^account-verification-on-meta/?$ /documentation-requirements-for-meta/ [R=301,L]
RewriteRule ^author/ /news/ [R=301,L]
RewriteRule ^news/page/[0-9]+/?$ /news/ [R=301,L]
RewriteRule ^feed/?$ /news/ [R=302,L]
RewriteRule ^ar/?$ / [R=301,L]
RewriteRule ^ar/(.+?)/?$ /$1/ [R=301,L]

# Add the trailing slash WordPress used, for paths that are folders in the export.
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME}/ -d
RewriteRule ^(.*[^/])$ /$1/ [R=301,L]

ErrorDocument 404 /404.html
```

## القواعد مقابل قرارات CLAUDE.md

«في خريطة ووردبريس» = موجود في `scripts/data/wp-sitemap-urls.json` (أي مفهرس غالباً).

| # | القاعدة | الحكم | ملاحظات |
|---|---|---|---|
| 4–5 | `/index.php` و`/index.php/…` → الرابط النظيف (301) | **يطابق** | CLAUDE.md: «`/index.php/…` → the clean URL». يجب اختبار الروابط العربية خلفه (مرمّزة). |
| 6 | `/old/` → `/` (301) | **بلا قرار** | `/old/` صفحة في خريطة ووردبريس. التحويل إلى الرئيسية يخالف مبدأ «لا تحويل جماعي إلى الرئيسية» إن كانت لها روابط خارجية؛ يُقرَّر الهدف من بيانات Search Console والروابط الخلفية. |
| 7 | `/account-verification-on-meta/` → `/documentation-requirements-for-meta/` (301) | **يتعارض** | الصفحة في خريطة ووردبريس. لكن الهدف نفسه سيُحوَّل عند الإطلاق إلى صفحته في docs.hrwhats.com، فتنشأ سلسلة تحويلين. الصحيح: تحويل واحد مباشر إلى الهدف النهائي بعد أن يرسل المطوّر روابط الدليل. |
| 8 | `/author/…` → `/news/` (301) | **بلا قرار** | CLAUDE.md يذكر `/author/…` ضمن صفحات ووردبريس الجانبية التي يجب معالجتها، دون هدف محدد. في الخريطة: `/author/admin2/` و`/author/hrwhats/`. القاعدة تطابق أي مسار يبدأ بـ `author/` (بلا `$`)، بما فيه `/author/x/page/2/`. |
| 9 | `/news/page/N/` → `/news/` (301) | **يتعارض** | صفحات الترقيم `/news/page/2..5/` مبنية ويجب أن ترجع 200. المعتمد فقط: `/news/page/1/` → `/news/` و`/category/<slug>/page/1/` → `/category/<slug>/`. هذا السطر سبب عطل الترقيم على المعاينة. |
| 10 | `/feed/` → `/news/` (**302**) | **بلا قرار + يتعارض في النوع** | `/feed/` مذكور ضمن ما يجب معالجته، دون هدف. كل التحويلات في CLAUDE.md دائمة (301)؛ 302 لا ينقل قيمة الرابط. لا يعالج خلاصات المقالات والتصنيفات (`/<slug>/feed/`، `/category/…/feed/`). |
| 11–12 | `/ar/` و`/ar/…` → بلا البادئة (301) | **بلا قرار** | العربية بلا بادئة في الموقع الجديد، فالقاعدة منطقية، لكن لا قرار بها ولا يظهر `/ar/` في خريطة ووردبريس. يُقرَّر إن ظهر في Search Console أو الروابط الخلفية. |
| 15–17 | إضافة `/` الأخيرة للمجلدات الموجودة (301) | **يطابق** | CLAUDE.md: «A URL without the trailing `/` → the same URL with it». يجب اختبار `-d` مع أسماء المجلدات العربية والإيموجي على Spaceship. المسار غير الموجود بلا شرطة يرجع 404 مباشرة (مقبول). |
| 19 | `ErrorDocument 404 /404.html` | **يطابق** | معتمد في CLAUDE.md. |

## ما يطلبه CLAUDE.md وليس في الملف

- `www` → بلا `www`، و`http` → `https`.
- `/tag/…`، و`?p=ID`، وصفحات المرفقات، وصور `/wp-content/uploads/…` (تُقرَّر من البيانات).
- `/category/tutorials/` → `/category/whatsapp/` (301، مع مراجعة الهدف).
- `/news/page/1/` و`/category/<slug>/page/1/` → الصفحة الأولى (301).
- تحويلات الروابط القديمة للمقالات من قاعدة بيانات ووردبريس (`_wp_old_slug`، وRedirection، وYoast Premium)، مثل `/فك-حظر-الواتساب/` → `/unblocking-whatsapp/`.
- تحويلات صفحات الدليل القديمة (`/documentation-requirements-for-meta/`، `/link-account/`، `/hrwhats-guide/`) إلى docs.hrwhats.com، بعد وصول الروابط الدقيقة.
- ويجب ألا يمس الملف النهائي `/api/contact.php`. (لا قاعدة هنا تمسه.)
