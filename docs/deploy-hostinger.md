# رفع النسخة التجريبية (Staging) على Hostinger

النسخة التجريبية للمراجعة فقط، **وليست نسخة الإطلاق**. الموقع الحالي `hrwhats.com` يبقى على ووردبريس كما هو.

يعمل النشر عبر **Node.js Web Apps** في Hostinger مع ربط GitHub:
- كل `push` إلى الفرع `main` يبني الموقع وينشره تلقائياً.
- Hostinger ينفّذ `npm install` ثم `npm run build`، ويعرض محتوى مجلد `out/` كملفات ثابتة.

## 1) إعدادات التطبيق في Hostinger

| الإعداد | القيمة |
|---|---|
| نوع التطبيق (Framework) | `next` (Next.js) |
| المستودع والفرع | `MDMDcode/hrwhats` ← `main` |
| أمر البناء (Build command) | `npm run build` |
| مجلد الناتج (Output directory) | `out` |
| إصدار Node.js | `24` |

- **إصدار Node:** محدّد أيضاً في `package.json` (`"engines": { "node": ">=24" }`) وفي ملف `.nvmrc`.
- **أمر البناء:** `npm run build` وحده ينفّذ كل الخطوات: `next build` ثم تحسين الصور (`next-image-export-optimizer`). الناتج مجلد `out/` كامل، ولا يلزم أي أمر آخر.

## 2) متغيرات البيئة للنسخة التجريبية

أضفها في إعدادات التطبيق في Hostinger (Environment variables):

| المتغير | القيمة | السبب |
|---|---|---|
| `SITE_ENV` | `staging` | يمنع محركات البحث من فهرسة النسخة التجريبية |
| `ALLOW_TURNSTILE_TEST_KEY` | `1` | يسمح بالبناء بمفتاح Turnstile الاختباري لأن المفتاح الحقيقي لم يُضف بعد |

### ماذا يفعل `SITE_ENV=staging`؟

- `robots.txt` يمنع كل شيء: `Disallow: /`.
- كل صفحة فيها `<meta name="robots" content="noindex, nofollow">`.
- لا يُولَّد sitemap.
- سجل البناء (Build log) يطبع في أوله سطراً واضحاً:
  `▶ SITE_ENV=staging — NOT indexable ...`

**ملاحظات مهمة:**
- إذا لم يُضبط `SITE_ENV` أصلاً، يُعتبر **staging** تلقائياً (الافتراضي الآمن).
- أي قيمة غير `staging` أو `production` تُفشل البناء.
- `SITE_ENV=production` للإطلاق فقط. ومعه يفشل البناء إذا كان `ALLOW_TURNSTILE_TEST_KEY=1` مضبوطاً، حتى لا تُطلق نسخة بمفتاح اختبار.

## 3) التحقق بعد النشر

1. افتح `https://<رابط-النسخة-التجريبية>/robots.txt`. يجب أن يظهر:
   ```
   User-Agent: *
   Disallow: /
   ```
2. افتح أي صفحة، ثم "عرض مصدر الصفحة" (Ctrl+U)، وابحث عن `noindex`. يجب أن تجد `noindex, nofollow`.
3. افتح سجل البناء في Hostinger وتأكد من وجود سطر `SITE_ENV=staging`.

## 4) تنبيه: نموذج التواصل لا يعمل على هذه النسخة

نموذج "تواصل معنا" يرسل إلى `api/contact.php`، وهو ملف **PHP**. تطبيقات Node.js Web Apps تعرض الملفات الثابتة فقط ولا تشغّل PHP، لذلك:
- الصفحة ومربع التحقق (Turnstile الاختباري) يظهران بشكل طبيعي.
- لكن الضغط على "إرسال" سيُظهر رسالة الخطأ، وهذا **متوقع** على هذه النسخة.

يُختبر النموذج فعلياً عند الإطلاق على استضافة cPanel (التي تدعم PHP)، باتباع `docs/contact-form-setup.md`.
