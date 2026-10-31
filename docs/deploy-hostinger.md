# رفع النسخة التجريبية (Staging) على Hostinger

النسخة التجريبية للمراجعة فقط، **وليست نسخة الإطلاق**. الموقع الحالي `hrwhats.com` يبقى على ووردبريس كما هو.

## 1) الطريقة الحالية: البناء من GitHub على Hostinger

تطبيق Hostinger مربوط بالمستودع `programmingtmt3/hrwhats` (الـ remote المسمّى `hostinger` في مستودعنا المحلي)، ويبني الموقع تلقائياً مع كل `push` إلى `main`.

**إعدادات التطبيق في hPanel:**

| الإعداد | القيمة |
|---|---|
| Build command | `npm run build` |
| Output directory | `out` |
| إصدار Node | 24 (محدّد أيضاً في `package.json` → `engines` وفي `.nvmrc`) |
| متغير البيئة `SITE_ENV` | `staging` |

**الدفع إلى المستودعين معاً:** `origin` مضبوط محلياً ليرفع كل `git push` إلى `MDMDcode/hrwhats` (المستودع الأساسي) وإلى `programmingtmt3/hrwhats` (مستودع Hostinger) في نفس الأمر، حتى لا يفترقا مرة أخرى كما حدث سابقاً. هذا الإعداد في `.git/config` على الجهاز وليس داخل المستودع، فاضبطه مرة واحدة في كل نسخة جديدة:
```bash
git remote set-url --add --push origin https://github.com/MDMDcode/hrwhats.git
git remote set-url --add --push origin https://github.com/programmingtmt3/hrwhats.git
git remote -v   # يجب أن يظهر لـ origin سطر fetch واحد وسطرا push
```

**خطوات النشر:**
1. بعد اعتماد التعديلات: `git push`. يرفعها إلى المستودعين، فيبدأ Hostinger البناء. راجع مخرجات الأمر: إذا رفض أحد المستودعين الدفع، فقد يكون الآخر استلمه. للتأكد أن الاثنين متطابقان: `git fetch hostinger` ثم `git rev-parse main hostinger/main` (يجب أن يظهر نفس الرقم مرتين).
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
