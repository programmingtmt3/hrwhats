# رفع النسخة التجريبية (Staging) على Hostinger

النسخة التجريبية للمراجعة فقط، **وليست نسخة الإطلاق**. الموقع الحالي `hrwhats.com` يبقى على ووردبريس كما هو.

الإطلاق النهائي على **Spaceship Web Hosting (خطة Essential)**: cPanel وLiteSpeed وPHP، بدون Node.js، وهي نفس استضافة موقع ووردبريس الحالي. الفرق بين البيئتين في القسم 6.

## 1) الطريقة الحالية: البناء من GitHub على Hostinger

تطبيق Hostinger مربوط بالمستودع الأساسي `programmingtmt3/hrwhats` (الـ remote المسمّى `origin`)، ويبني الموقع تلقائياً مع كل `push` إلى `main`.

**إعدادات التطبيق في hPanel:**

| الإعداد | القيمة |
|---|---|
| Build command | `npm run build` |
| Output directory | `out` |
| إصدار Node | 24 (محدّد أيضاً في `package.json` → `engines` وفي `.nvmrc`) |
| متغير البيئة `SITE_ENV` | `staging` |

**المستودعات:** `origin` = `programmingtmt3/hrwhats` (الأساسي، ومنه يبني Hostinger). `backup` = `MDMDcode/hrwhats` نسخة احتياطية فقط، ولا يُرفع لها تلقائياً.

**خطوات النشر:**
1. بعد اعتماد التعديلات: `git push`. يرفعها إلى `origin`، فيبدأ Hostinger البناء. تأكد أن `git status` يُظهر أن الفرع مطابق لـ `origin/main`.
2. انتظر انتهاء البناء في hPanel، ثم افتح سجل البناء وتأكد من:
   - سطر `▶ SITE_ENV=staging — NOT indexable ...`
   - وسطر النهاية `✓ Static site written to out/`
3. نفّذ خطوات التحقق في القسم 4.

### لماذا يحتاج المشروع `next.base.ts` و`scripts/build.mjs`؟

إعداد Next.js الجاهز في Hostinger يشغّل Next.js كخادم، ولا يقبل الموقع الثابت. من توثيقه ([docs.hostinger.com/node.js/overview-1/next](https://docs.hostinger.com/node.js/overview-1/next)):
- يغيّر اسم `next.config.*` ويكتب إعداداً من عنده **بدون** `output: "export"`، فلا يحتوي `out/` إلا على الصور.
- قد يضبط متغيرات مثل `NEXT_PRIVATE_STANDALONE` لفرض وضع الخادم.

لذلك:
- **الإعداد الحقيقي في `next.base.ts`.** عدّل الإعدادات هناك فقط.
- `next.config.ts` سطر واحد يعيد تصدير `next.base.ts`. لا تعدّله.
- `npm run build` يشغّل `scripts/build.mjs`، الذي:
  1. يعيد `next.config.ts` إن استبدله Hostinger (ويكتب في السجل `▶ next.config.ts was replaced ...`).
  2. يحذف أي `next.config.js/.mjs/.cjs` آخر، لأن Next.js يفضّله على `.ts`.
  3. يتجاهل متغيرات `NEXT_PRIVATE_STANDALONE` و`NEXT_PRIVATE_OUTPUT*`.
  4. يبني بـ `next build --webpack`، ويفشل برسالة واضحة إذا لم يُنتج `out/index.html`.
  5. يشغّل `next-image-export-optimizer` لتحسين الصور.

**لماذا Webpack في البناء؟** Turbopack كان يتعطل على Hostinger أثناء معالجة CSS (`TurbopackInternalError` لأن عملية Node الفرعية خرجت قبل الاتصال). البناء النهائي يستخدم Webpack، والتطوير المحلي (`npm run dev`) ما زال يستخدم Turbopack.

## 2) بديل: البناء على جهازك ورفع `out/`

إذا تعطل البناء على Hostinger:
1. على جهازك:
   ```bash
   # PowerShell
   $env:SITE_ENV="staging"; npm run build
   ```
   الناتج مجلد `out/` كامل.
2. في hPanel: موقع عادي (Website) على نطاق فرعي تجريبي.
3. من File Manager: ارفع **محتوى** `out/` إلى `public_html`، وليس المجلد نفسه. أسهل طريقة: اضغط محتواه في ملف zip، ثم ارفعه وفك ضغطه هناك.

## 3) متغيرات البيئة للنسخة التجريبية

| المتغير | القيمة | السبب |
|---|---|---|
| `SITE_ENV` | `staging` | يمنع محركات البحث من فهرسة النسخة التجريبية |
| `ALLOW_TURNSTILE_TEST_KEY` | لا تضبطه | غير مطلوب: مفتاح Turnstile الحقيقي موجود في `site.json`. يلزم فقط إذا كان `turnstileSiteKey` فارغاً، ولا يُقبل أبداً مع `SITE_ENV=production` |

### ماذا يفعل `SITE_ENV=staging`؟

- `robots.txt` يمنع كل شيء: `Disallow: /`.
- كل صفحة فيها `<meta name="robots" content="noindex, nofollow">`.
- لا يُولَّد sitemap.
- مخرجات البناء تطبع في أولها سطراً واضحاً:
  `▶ SITE_ENV=staging — NOT indexable ...`

**ملاحظات مهمة:**
- إذا لم يُضبط `SITE_ENV` أصلاً، يُعتبر **staging** تلقائياً (الافتراضي الآمن).
- أي قيمة غير `staging` أو `production` تُفشل البناء.
- `SITE_ENV=production` للإطلاق فقط. ومعه يفشل البناء إذا كان `ALLOW_TURNSTILE_TEST_KEY=1` مضبوطاً، حتى لا تُطلق نسخة بمفتاح اختبار.

## 4) التحقق بعد النشر

1. افتح `https://<رابط-النسخة-التجريبية>/robots.txt`. يجب أن يظهر:
   ```
   User-Agent: *
   Disallow: /
   ```
2. افتح أي صفحة، ثم "عرض مصدر الصفحة" (Ctrl+U)، وابحث عن `noindex`. يجب أن تجد `noindex, nofollow`.
3. تأكد أن سجل البناء يحتوي سطر `SITE_ENV=staging` وسطر `✓ Static site written to out/`.

## 5) نموذج التواصل على النسخة التجريبية

نموذج "تواصل معنا" يرسل إلى `api/contact.php` (PHP)، ويحتاج إلى إعداد الخادم في `docs/contact-form-setup.md`، وهو ملف `hrwhats-config.php` خارج `public_html`.

- **مربع التحقق (Turnstile):** المفتاح الحقيقي يعمل فقط على النطاقات المضافة له في لوحة Cloudflare Turnstile. لكي يظهر على النسخة التجريبية، أضف نطاقها الفرعي إلى قائمة النطاقات (Hostname Management) للمفتاح، وإلا يظهر المربع بخطأ.
- **الإرسال:** `contact.php` يقبل فقط الطلبات القادمة من `https://hrwhats.com` (Origin check). لذلك الضغط على "إرسال" في النسخة التجريبية يُظهر رسالة الخطأ، وهذا **متوقع**. يُختبر الإرسال الفعلي عند الإطلاق.

## 6) الفرق بين Hostinger (التجريبية) وSpaceship (النهائية)

| | Hostinger — تجريبية | Spaceship — نهائية |
|---|---|---|
| الغرض | مراجعة التصميم والمحتوى فقط | الإطلاق الحقيقي على `hrwhats.com` |
| البناء | Hostinger يبني من GitHub مع كل `push` | على جهازك: `$env:SITE_ENV="production"; npm run build`، ثم رفع **محتوى** `out/` إلى `public_html` |
| السيرفر | غير مهم للاختبار | LiteSpeed (يقرأ `.htaccess` مثل Apache)، وPHP |
| التحويلات (`.htaccess`) | لا تُختبر هنا | تعمل هنا |
| نموذج التواصل | الصفحة تعمل، والإرسال يفشل عمداً (Origin) | `api/contact.php` + `~/hrwhats-config.php` خارج `public_html` |
| الفهرسة | ممنوعة | طبيعية |

**ما لا يمكن اختباره إلا على Spaceship** (على نطاق فرعي هناك قبل الإطلاق، دون لمس موقع ووردبريس الحالي):
1. **التحويلات:** قواعد `.htaccess` (`/index.php/…`، `ErrorDocument 404`، وأي 301 لاحقاً).
2. **PHP ونموذج التواصل:** إصدار PHP (8.0 أو أحدث)، وSMTP، وموقع ملف الإعداد، وفحص Origin بالنطاق الحقيقي.
3. **الروابط العربية:** أن مجلدات المقالات (عربية وفيها إيموجي و`؟`) وصلت للسيرفر بأسمائها الصحيحة بعد الرفع، وأن كل رابط يفتح.

### رفع المجلدات ذات الأسماء العربية

`out/` يحتوي مجلدات بأسماء عربية مقروءة (مثل `📌-فوائد-…`). إذا تغيّر ترميز الأسماء أثناء الرفع، تعطي الصفحة 404:
- **FTP:** في FileZilla: Site Manager → Charset → **Force UTF-8**.
- **zip عبر File Manager:** أنشئ الملف بـ 7-Zip مع خيار UTF-8:
  ```powershell
  7z a -tzip -mcu=on site.zip .\out\*
  ```
  ملف zip بدون علامة UTF-8 قد تظهر أسماؤه مشوّهة بعد فك الضغط في cPanel.
- بعد كل رفع: افتح عدة روابط مقالات عربية (منها رابط فيه إيموجي ورابط فيه `؟`) وتأكد أنها تفتح.
