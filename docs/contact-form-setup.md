# إعداد نموذج التواصل على السيرفر

نموذج صفحة "تواصل معنا" يرسل الرسائل إلى ملف PHP على نفس الاستضافة:
`public_html/api/contact.php`. هذا الملف يُنسخ تلقائياً مع البناء (من `public/api/` إلى `out/api/`).

الملف يتحقق من البيانات، ومن Cloudflare Turnstile، ويحدّ عدد الرسائل لكل IP، ثم يرسل الإيميل عبر SMTP إلى `info@hrwhats.com`.

> **الأسرار لا تدخل الريبو أبداً.** المفاتيح وكلمة مرور الإيميل توضع فقط في ملف على السيرفر **خارج** `public_html`.

**المتطلبات:** PHP 8.0 أو أحدث (تغيّره من cPanel ← Select PHP Version أو MultiPHP Manager)، مع إضافات `curl` و`mbstring` و`openssl`، وهي مفعّلة عادةً.

---

## 1) مفاتيح Cloudflare Turnstile

1. ادخل إلى لوحة Cloudflare، ثم **Turnstile** من القائمة الجانبية، ثم **Add widget**.
2. **Widget name:** HRwhats.
3. **Hostnames:** أضف `hrwhats.com` (و`www.hrwhats.com` إن كان مستخدماً).
4. **Widget mode:** Managed.
5. بعد الإنشاء يظهر مفتاحان:
   - **Site Key** (عام): ضعه في `content/data/site.json` في الحقل `"turnstileSiteKey"`، ثم ابنِ الموقع من جديد.
   - **Secret Key** (سري): لا يوضع في الريبو. يوضع فقط في ملف الإعدادات على السيرفر (الخطوة 3).

ملاحظة: إذا كان `turnstileSiteKey` فارغاً:
- `npm run dev` يعمل بمفتاح الاختبار الرسمي من Cloudflare.
- `npm run build` **يفشل عمداً** برسالة واضحة، حتى لا يُرفع الموقع بنموذج لا يعمل.

## 2) إعدادات SMTP لإيميل info@hrwhats.com

من cPanel: **Email Accounts**، ثم بجانب `info@hrwhats.com` اضغط **Connect Devices**. ستجد:

| الإعداد | القيمة المعتادة |
|---|---|
| Outgoing Server (SMTP) | `mail.hrwhats.com` |
| SMTP Port | `465` (SSL/TLS)، أو `587` (STARTTLS) |
| Username | `info@hrwhats.com` |
| Password | كلمة مرور صندوق البريد |

إذا لم تكن تعرف كلمة المرور، غيّرها من **Email Accounts** ثم **Manage**.

## 3) إنشاء ملف الإعدادات على السيرفر

1. في **File Manager**، افتح المجلد الرئيسي للحساب، أي المجلد الذي **يحتوي** `public_html` (مثلاً `/home/اسم_الحساب/`)، وليس داخل `public_html`.
2. أنشئ ملفاً جديداً باسم: `hrwhats-config.php`.
3. انسخ إليه محتوى `config/hrwhats-config.example.php` من الريبو، واملأ القيم:

```php
<?php
return [
    'TURNSTILE_SECRET' => 'ضع هنا Secret Key من Cloudflare',
    'SMTP_HOST' => 'mail.hrwhats.com',
    'SMTP_PORT' => 465,
    'SMTP_USER' => 'info@hrwhats.com',
    'SMTP_PASS' => 'كلمة مرور الإيميل',
    'SMTP_FROM' => 'info@hrwhats.com',
    'MAIL_TO'   => 'info@hrwhats.com',
];
```

4. لا تضف `MAIL_LOG_FILE` على السيرفر، فهو للاختبار المحلي فقط.
5. اجعل صلاحيات الملف `600` أو `640`: كليك يمين، ثم **Change Permissions**.

بعد الإعداد، سيُنشئ `contact.php` تلقائياً في نفس المجلد الرئيسي، أي خارج `public_html`:
- `hrwhats-contact.log`: سجل الأخطاء وأسباب رفض الرسائل.
- المجلد `hrwhats-contact-ratelimit/`: لتحديد عدد الرسائل لكل IP (5 رسائل كل 10 دقائق).

## 4) الرفع

1. نفّذ `npm run build` بعد إضافة `turnstileSiteKey`.
2. ارفع محتوى `out/` إلى `public_html`، بما فيه المجلد `api/` والملف المخفي `api/_lib/.htaccess`.
   - إذا كان مدير الملفات أو برنامج FTP يخفي الملفات التي تبدأ بنقطة، فعّل إظهارها وتأكد أن `.htaccess` رُفع.

## 5) الاختبار بعد الرفع

1. افتح `https://hrwhats.com/contact/`. يجب أن يظهر مربع التحقق من Cloudflare، وأن يتفعّل زر "إرسال" بعد اكتمال التحقق.
2. أرسل رسالة تجريبية. يجب أن تظهر "تم استلام رسالتك، سنتواصل معك قريباً."، وأن تصل الرسالة إلى `info@hrwhats.com`.
3. اضغط **رد** على الرسالة الواصلة. يجب أن يكون المستلم هو الإيميل الذي كُتب في النموذج (Reply-To).
4. افتح `https://hrwhats.com/api/_lib/PHPMailer.php` في المتصفح. يجب أن يظهر **403 Forbidden**.
5. افتح `https://hrwhats.com/api/contact.php` مباشرة. يجب أن يظهر `{"ok":false,"error":"method_not_allowed"}`.

**إذا ظهرت رسالة الخطأ في النموذج،** افتح `hrwhats-contact.log` في المجلد الرئيسي للحساب. أشهر الأسباب:

| السطر في السجل | السبب والحل |
|---|---|
| `Config file not found` | ملف الإعدادات غير موجود أو في المكان الخطأ (يجب أن يكون بجانب `public_html` لا داخله) |
| `Missing config value: ...` | قيمة ناقصة في ملف الإعدادات |
| `Rejected origin: ...` | الموقع يُفتح من نطاق آخر، مثل `www`. أضفه في `'ALLOWED_ORIGINS' => ['https://hrwhats.com', 'https://www.hrwhats.com']` |
| `Turnstile rejected: ...` | المفتاح السري لا يطابق مفتاح الموقع، أو النطاق غير مضاف في Cloudflare |
| `PHPMailer: SMTP connect() failed` / `Could not authenticate` | خطأ في إعدادات SMTP أو كلمة المرور. جرّب المنفذ 587 مع `'SMTP_SECURE' => 'tls'` |

## الاختبار المحلي (للمطوّر)

يحتاج PHP مثبتاً على الجهاز (XAMPP مثلاً):

1. `ALLOW_TURNSTILE_TEST_KEY=1 npm run build`: بناء محلي بمفتاح الاختبار. **لا تُرفع هذه النسخة.**
2. ضع `out/` داخل مجلد اختبار باسم `public_html`، وضع بجانبه `hrwhats-config.php` فيه:
   - `'TURNSTILE_SECRET' => '1x0000000000000000000000000000000AA'`: مفتاح Cloudflare الاختباري الذي ينجح دائماً.
   - `'ALLOWED_ORIGINS' => ['http://localhost:8099']`.
   - `'MAIL_LOG_FILE' => __DIR__ . '/hrwhats-mail-test.log'`: يكتب الإيميل في ملف بدل إرساله.
3. `php -S localhost:8099 -t public_html`، ثم افتح `http://localhost:8099/contact/`.
