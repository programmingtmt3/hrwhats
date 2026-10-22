# رفع النسخة التجريبية (Staging) على Hostinger

النسخة التجريبية للمراجعة فقط، **وليست نسخة الإطلاق**. الموقع الحالي `hrwhats.com` يبقى على ووردبريس كما هو.

## 1) لماذا لا يصلح تطبيق Node.js من نوع Next.js

إذا كان نوع التطبيق في Hostinger هو **Next.js**، فإن Hostinger يشغّل Next.js دائماً **كخادم**، ولا يقبل الموقع الثابت. من توثيقه ([docs.hostinger.com/node.js/overview-1/next](https://docs.hostinger.com/node.js/overview-1/next)):
- Hostinger يفرض `output: "standalone"`.
- `output: 'export'` يُستبدل ولا يكون له أثر.
- مجلد الناتج المتوقع هو `.next` وليس `out`.
- لاستضافة Next.js كملفات ثابتة: ابنِ محلياً، ثم ارفع `out/` إلى `public_html`.

لذلك ينجح البناء كاملاً، ثم يفشل في آخر خطوة بالرسالة:
`ERROR: Next.js build produced no standalone server or static output`

هذا ليس خطأ في الكود. الكود لا يمكن أن يصلحه، لأن الموقع ثابت عمداً (استضافة cPanel بلا خادم Node). ونوع التطبيق يُكتشف تلقائياً من `package.json`.

## 2) طريقة النشر: موقع عادي (Website) + رفع `out/`

1. على جهازك، ابنِ الموقع:
   ```bash
   # PowerShell
   $env:SITE_ENV="staging"; $env:ALLOW_TURNSTILE_TEST_KEY="1"; npm run build
   ```
   `npm run build` وحده ينفّذ كل الخطوات: `next build --webpack` ثم تحسين الصور (`next-image-export-optimizer`). الناتج مجلد `out/` كامل.
2. في hPanel: أنشئ موقعاً عادياً (Website) على نطاق فرعي تجريبي، **وليس Node.js Web App**.
3. من File Manager: ارفع **محتوى** `out/` إلى `public_html`، وليس المجلد نفسه. أسهل طريقة: اضغط محتواه في ملف zip، ثم ارفعه وفك ضغطه هناك.
4. احذف تطبيق Node.js القديم من hPanel، حتى لا يحاول البناء مع كل `push`.

**ميزة إضافية:** الموقع العادي يشغّل PHP، فيمكن تجربة نموذج التواصل عليه أيضاً (انظر القسم 5).

**ملاحظات:**
- **إصدار Node:** محدّد في `package.json` (`"engines": { "node": ">=24" }`) وفي ملف `.nvmrc`.
- **لماذا Webpack في البناء؟** Turbopack كان يتعطل على Hostinger أثناء معالجة CSS (`TurbopackInternalError` لأن عملية Node الفرعية خرجت قبل الاتصال). البناء النهائي يستخدم Webpack، والتطوير المحلي (`npm run dev`) ما زال يستخدم Turbopack.

## 3) متغيرات البيئة للنسخة التجريبية

اضبطها في الطرفية قبل `npm run build` (كما في الخطوة 1 أعلاه):

| المتغير | القيمة | السبب |
|---|---|---|
| `SITE_ENV` | `staging` | يمنع محركات البحث من فهرسة النسخة التجريبية |
| `ALLOW_TURNSTILE_TEST_KEY` | `1` | يسمح بالبناء بمفتاح Turnstile الاختباري لأن المفتاح الحقيقي لم يُضف بعد |

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
3. تأكد أن مخرجات البناء على جهازك تحتوي سطر `SITE_ENV=staging`.

## 5) نموذج التواصل على النسخة التجريبية

نموذج "تواصل معنا" يرسل إلى `api/contact.php` (PHP). الموقع العادي في Hostinger يشغّل PHP، لكن النموذج يحتاج أيضاً إلى إعداد الخادم في `docs/contact-form-setup.md`، وهو ملف `hrwhats-config.php` خارج `public_html`.

بدون هذا الإعداد:
- الصفحة ومربع التحقق (Turnstile الاختباري) يظهران بشكل طبيعي.
- لكن الضغط على "إرسال" يُظهر رسالة الخطأ، وهذا **متوقع**.

ملاحظة: `contact.php` يقبل فقط الطلبات القادمة من `https://hrwhats.com` (Origin check). لذلك يُختبر الإرسال الفعلي عند الإطلاق.
