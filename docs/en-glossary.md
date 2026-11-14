# قاموس المصطلحات الإنجليزية وقواعد الترجمة

مرجع الترجمة الإنجليزية لموقع HRwhats (المرحلة 7 في `CLAUDE.md`). Claude يترجم والمطوّر يراجع.
المصادر: `messages/ar.json` وملفات `content/data/` كما هي في 2026-11-11.

**الحالة (2026-11-11): معتمد من المطوّر**، بقراراته المسجلة في القسم 4. الجداول محدّثة بها. لا نقاط مفتوحة.

## ترتيب العمل (معتمد)

- العربية في الجذر، والإنجليزية تحت `/en/` (نفس الـ slug).
- المرحلة الأولى: الرئيسية ← الباقات ← تواصل معنا ← حظر الواتساب (ومعها الهيدر والفوتر وزر الواتساب العائم وصفحة 404).
- المرحلة الثانية: القطاعات العشر. ثم الصفحات القانونية الثلاث (2026-11-14). لاحقاً: المدونة.

---

## 1. قواعد الأسلوب

### 1.1 نوع الإنجليزية: أمريكية (معتمد 2026-11-11)

- **السبب:** واجهات Meta وWhatsApp ووثائقهما بالإنجليزية الأمريكية (`optimize`, `color`, `checkmark`)، وأغلب منصات SaaS التي يقارن بها القارئ تكتب بها. توحيد مصطلحاتنا مع مصطلحات Meta يقلل الالتباس في التوثيق والقوالب والحظر.
- **البديل:** البريطانية (`optimise`, `colour`, `tick`). شائعة في المراسلات الحكومية السعودية، لكنها تخالف مصطلحات المنصة التي نشرحها.
- **القاعدة:** إملاء أمريكي، وفاصلة أكسفورد (`campaigns, replies, and reports`)، والتاريخ بصيغة `November 11, 2026` إن احتجناه.

### 1.2 النبرة

- مباشرة وواضحة ومهنية، بصيغة المخاطَب `you`، وجمل قصيرة. لا مبالغة تسويقية زائدة عن النص العربي.
- **حالة الأحرف:** sentence case في العناوين والأزرار والقائمة (`Start your free trial`, `Contact us`). الحروف الكبيرة لأسماء العلم وأسماء الميزات فقط (`Lead Finder`, `WhatsApp Business API`).
- اللهجة العامية في النص العربي (`أبغى`، `داتا`، `الواتس`) تُترجم إلى إنجليزية عادية غير رسمية، بلا محاولة لتقليد العامية.
- صيغة الجمع في خطاب صفحات القطاعات (`كيف يخدمكم`) وصيغة المفرد في الرئيسية (`مبيعاتك`) كلتاهما `you`.

### 1.3 المعنى لا الحرف

- نترجم ما تقوله الجملة لقارئ إنجليزي، لا كلماتها. مثال: `الفئات المستهدفة` ← `Industries we serve` وليس `Target groups`؛ `شركاء النجاح` ← `Our partners` وليس `Success partners`.
- يبقى عدد الجمل وترتيب الأفكار قريباً من العربي، حتى تبقى المكوّنات والتصميم كما هي.
- النصوص المقسومة (`before` / `highlight` / `after`) تبقى بنفس المفاتيح، لكن ترتيب الكلمات داخلها يتغير حسب الإنجليزية. يجب أن يبقى الجزء الملوّن (`highlight`) عبارة لها معنى وحدها. يجوز أن يكون `before` أو `after` فارغاً.
- المتغيرات (`{label}`, `{year}`, `{price}`, `{amount}`, `{count}`, `{page}`, `{total}`, `{sector}`, `{done}`) تبقى كما هي، ومكانها في الجملة يتبع الإنجليزية.

### 1.4 لا ميزات ولا وعود جديدة

- لا نضيف ميزة أو رقماً أو وعداً أو صفة غير موجودة في النص العربي، ولا نحذف تحفظاً موجوداً فيه.
- إذا كان المعنى العربي يحتمل وعداً لا تؤكده صفحة حظر الواتساب، تُستعمل الصيغة الدقيقة (4.1)، وتُعرض كل جملة منها على المطوّر بنصها الإنجليزي قبل اعتمادها.
- **لا نذكر أي صفة أو شراكة لـ HRwhats مع Meta** (لا `partner`، لا `BSP`). نكتفي بـ `the official WhatsApp Business API` (قرار 4.4). الاستثناء الوحيد: شارة `Meta Tech Provider` المرسومة بالكود في الرئيسية (4.10).
- إذا لم يكن المعنى واضحاً، نسأل ولا نخمّن (القسم 4.6).

### 1.5 الأرقام والأسعار

- **الأسعار والأعداد من البيانات لا من الترجمة:** أسعار الباقات وحدودها من `packages.json`، و"من N ر.س" من `getStartingMonthlyPrice()`. لا يُكتب رقم سعر في `en.json` أبداً، بل متغير (`{price}`).
- الأرقام الثابتة داخل النص (14 يوماً، 50,000، 24/7، 15%) تُنقل كما هي، ولا يُضاف رقم جديد.
- الأرقام بالأرقام الغربية مع فاصلة الآلاف: `50,000`. علامة الزائد تنتقل إلى ما بعد الرقم: `+50,000 رسالة` ← `50,000+ messages`.
- **الجمع:** الإنجليزية تفرّق بين `1 result` و`2 results`. عند التنفيذ لا نبني الجمع بتركيب نصوص؛ إن احتاج نص إلى المفرد والجمع نضيف مفتاحين أو قاعدة جمع (`Intl.PluralRules`).

### 1.6 العملة

- **معتمد (2026-11-11):** `SAR` قبل الرقم بمسافة: `SAR 150`، `From SAR 150`، `SAR 150 / month`، `Save SAR 300`.
- **السبب:** رمز ISO مفهوم لكل قارئ إنجليزي، ويُكتب هكذا في الفواتير والمواقع السعودية بالإنجليزية، ولا يحتاج إلى خط خاص.
- **البدائل:**
  - `150 SAR`: شائع أيضاً، لكن وضع الرمز قبل الرقم هو المعتاد في الإنجليزية (`$150`).
  - `SR 150`: اختصار محلي قديم، أقل وضوحاً للقارئ من خارج السعودية.
  - رمز الريال الجديد (U+20C1): خط IBM Plex لا يحتويه، ودعمه في الخطوط والأجهزة ما زال محدوداً.
- يُنسَّق عند التنفيذ بدالة واحدة (`format` في `src/lib/i18n.ts`)، لا يدوياً في كل نص.

### 1.7 أسماء العلامات وكتابتها

| الصحيح | الممنوع |
|---|---|
| `HRwhats` | `HRWhats`, `HRWHATS`, `HR Whats`, `Hrwhats` |
| `WhatsApp` | `Whatsapp`, `Whats App`, `WA`, `Whats` |
| `Meta` | `META`, `Facebook` بمعنى الشركة |
| `Google Maps`, `Excel`, `Instagram`, `Facebook`, `X`, `YouTube` | — |

### 1.8 الترقيم

- علامات ترقيم إنجليزية: `,` `?` `;` بدل `،` `؟` `؛`، وعلامات تنصيص `“ ”`.
- الشرطة الطويلة في النص دون مسافات (`one place—no extra tools`). في العناوين (`<title>`) الفواصل حسب القسم 3.
- علامة الحذف `…` في نهاية جملة مقسومة (`لا تفقد رقمك للأبد…`) تُترجم بشرطة أو نقطتين أو تُحذف حسب الجملة الإنجليزية، ولا تُنقل آلياً.

### 1.9 بيانات المجسمات (mockups)

- قاعدة "مثال توضيحي" تبقى كما هي: أسماء عامة، وأماكن بالنوع والمنطقة، ولا أسماء جهات حقيقية.
- **الأسماء السعودية تبقى وتُكتب بالحروف اللاتينية** (لا نستبدلها بـ John أو Sarah): الجمهور والسياق سعوديان. التهجئة الموحدة:
  `Majed`، `Khaled`، `Reem`، `Sara`، `Fahad`، `Abdullah`، `Abdulrahman`، `Salman`، `Rayan`، `Dana`، `Omar`، `Mona`، `Haya`، `Sultan`، `Mohammed`، `Hind`، `Lama`، `Yousef`، `Munirah`، `Turki`، `Ahmed`، `Noura` (`Ms. Noura`)، `Jood`، `Faisal`، `Leen`، `Salma`، `Nouf`، `Saad`، `Amal`، `Lina`، `Badr`، `Yasser`، `Haifa`، `Hala`، `Asma`، `Mazen`، `Saeed`، `Nasser`، `Waleed`، `Sami`، `Salem`، `Adel`.
  الكنى: `Abu` / `Umm` + الاسم (`Abu Faisal`، `Umm Khaled`). الاسم الكامل في المجسم: `Ahmed Ali`.
- الأماكن: `Riyadh, Saudi Arabia`، والأحياء بـ `Al` + الاسم: `Al Narjis`، `Al Olaya`، `Al Malqa`، `Al Yasmin`، `Al Nakheel`.
- النصوص داخل المحادثات تُترجم إلى الإنجليزية (الصفحة كلها إنجليزية)، والإيموجي يبقى.
- التحية `السلام عليكم` / `وعليكم السلام` في محادثة الرئيسية ← `Hi!` (قرار 4.5).

---

## 2. جدول المصطلحات

**العمود "البدائل":** الترجمات الأخرى الممكنة وسبب رفضها. فارغ إذا لم يكن هناك بديل جدّي.

### 2.1 العلامة والمنصة

| العربي | المقترح | البدائل وسبب الاختيار |
|---|---|---|
| HRwhats | **HRwhats** | لا يُترجم ولا يُشكَّل حرفه. |
| منصة | **platform** | — |
| منظومة (واتساب API) | **platform**، و**all-in-one platform** حين يؤكد النص الشمول | `suite`، `ecosystem`: أثقل ولا يضيفان معنى. حين تأتي "منصة" و"منظومة" في جملة واحدة: `all-in-one platform` للثانية. |
| برنامج HRwhats | **HRwhats** (أو `the HRwhats platform`) | `software`/`program`: يوحي ببرنامج يُثبّت. |
| واتساب API (الرسمي) | **the official WhatsApp Business API** | `WhatsApp API` وحده: مفهوم، لكن الاسم الكامل هو ما يبحث عنه الناس ويستعمله Meta. بعد أول ذكر في الفقرة يجوز `the API`. |
| WhatsApp Business Platform (API) | **WhatsApp Business Platform (API)** | يبقى كما كتبه النص العربي (صفحة الحظر)؛ هو الاسم الرسمي الحالي عند Meta. |
| WhatsApp Cloud API | **WhatsApp Cloud API** | كما هو. |
| واتساب أعمال / حلول واتساب أعمال | **WhatsApp Business solutions** | انتبه: لا نخلطه بتطبيق `WhatsApp Business app` (التالي). |
| تطبيق واتساب للأعمال | **the WhatsApp Business app** | التطبيق المجاني على الجوال، وهو غير الـ API. نفرّق بينهما في كل مكان. |
| استعمال الرقم نفسه في المنصة وفي التطبيق | **use the same number in the WhatsApp Business app** (ميزة `Coexistence` عند Meta) | يُصاغ كميزة، بلا مقارنة بمنصات أخرى (قرار 4.6). |
| حساب واتساب للأعمال (في المجسم) | **WhatsApp Business account** | — |
| الإرسال التقليدي / الاستخدام التقليدي | **conventional sending** / **the regular WhatsApp app** | `traditional messaging`: مقبول؛ `manual sending`: يضيّق المعنى. المقصود التطبيق العادي والأدوات غير الرسمية. |
| ميتا / Meta | **Meta** | — |
| شريك Meta / شريك أعمال رسمي لدى Meta | **لا يُترجم كشراكة.** يُكتب مكانه ما يخص القناة: `Official WhatsApp Business API` / `Direct connection to the WhatsApp Cloud API` | قرار 4.4: لا صفة ولا شراكة مع Meta في الإنجليزية. التفاصيل في 4.4. |
| واجهة برمجة التطبيقات (API) | **API** | — |

### 2.2 التوثيق والحظر

| العربي | المقترح | البدائل وسبب الاختيار |
|---|---|---|
| الحظر / حظر الرقم | **ban** / **banned number** | `block`: في واتساب يعني أن مستخدماً حظر رقمك، وهو شيء آخر. `ban` هي كلمة WhatsApp لإيقاف الحساب. |
| تقييد الحساب | **account restriction** / **restricted** | نفرّق بين `restricted` (تقييد مؤقت) و`banned`، كما يفرّق النص العربي. |
| فك الحظر | **unban** / **get your number unbanned** | `unblock`: نفس مشكلة `block`. (اسم المقال العربي `unblocking-whatsapp` لا يتغير.) |
| إجراءات المراجعة | **review request** / **appeal** | WhatsApp يسميها `request a review`. |
| الإبلاغ عن الرسائل | **reports** (`users reporting your messages`) | — |
| حظر الواتساب (اسم الصفحة والقائمة) | **WhatsApp bans** | `WhatsApp Ban`: مقبول. الجمع أطبع كعنوان موضوع. الرابط `/en/whatsapp-ban/` لا يتغير. |
| توثيق (محفظة أعمال ميتا) | **verification** / **Meta business verification** | `documentation`، `authentication`: ليست مصطلح Meta. |
| محفظة أعمال ميتا | **Meta business portfolio** | `Business Manager`: الاسم القديم الذي استبدلته Meta. |
| وثّق رقمك في ميتا / وثّق رقمك الآن | **Verify your business with Meta** / **Verify your business now** | معتمد (4.2): Meta توثّق المنشأة لا الرقم. |
| رقم موثّق ✓ (المجسم) | **Verified business ✓** | معتمد (4.2). |
| موثّقة (مرحلة) | **Verified** | — |
| العلامة الزرقاء | **blue checkmark** (و`Meta Verified` عند الحديث عن الاشتراك) | `blue tick`: بريطاني ودارج، لكن Meta تكتب `blue checkmark`/`verified badge`. |
| شهادة العمل الحر (وثيقة العمل الحر، freelance.sa) | **Freelance Certificate** | الاسم في النسخة الإنجليزية من freelance.sa (`Benefits of the freelance certificate`، `Issue your certificate`؛ تحقق 2026-11-11). الحروف الكبيرة لأنه اسم الوثيقة في جملتنا. `Freelance Document`: يرد في مواقع أخرى، لا في الموقع الرسمي. |
| متطلبات التوثيق | **verification requirements** | — |

### 2.3 الرسائل والحملات

| العربي | المقترح | البدائل وسبب الاختيار |
|---|---|---|
| حملة / حملات | **campaign(s)** | — |
| الحملات الإعلانية / التسويقية | **marketing campaigns** | `ad campaigns`/`advertising campaigns`: توحي بإعلانات ممولة على Meta، وليست ما تقدمه المنصة. |
| رسائل جماعية / الحملات الجماعية | **bulk messages** في وصف الميتا (كلمة البحث)، و**broadcast campaigns / broadcasts** في نص الصفحة | `mass messaging`: يوحي بالسبام. `broadcast` كلمة WhatsApp نفسها وأقل ارتباطاً بالحظر. |
| رسالة / رسائل | **message(s)** | — |
| قوالب الرسائل | **message templates** | مصطلح Meta الرسمي. |
| الردود الجاهزة | **quick replies** | مصطلح WhatsApp Business نفسه. `canned responses`: صحيح لكن غير مألوف عند مستخدم واتساب. |
| رد آلي | **auto-reply** | — |
| ردود آلية | **automated replies** | `auto-replies`: مقبول في المساحات الضيقة. |
| الشات بوت | **chatbot** | `bot` وحده في المجسمات فقط. |
| الذكاء الاصطناعي / ردود ذكية بالذكاء الاصطناعي | **AI** / **AI-powered replies** | — |
| تدريب النموذج ببياناتك | **train the AI on your own data** | `model` وحدها تبدو تقنية للقارئ العادي. |
| أتمتة | **automation** / **automate** | — |
| رسائل OTP / رموز التحقق | **OTP messages** / **verification codes** | نكتب `OTP` مع شرح في أول ذكر: `OTP (one-time password) messages`. |
| تذكير | **reminder** | — |
| إشعار / إشعارات | **notification(s)** | `alerts`: أقوى من المقصود. |
| تقارير وتحليلات | **reports & analytics** | — |
| معدل التفاعل | **engagement rate** | — |
| أوقات الذروة / مؤشر أوقات الذروة | **peak hours** / **peak-hours indicator** | — |
| نسبة وصول الرسائل | **message delivery rate** | `reach`: معنى تسويقي مختلف. |

### 2.4 العملاء والفريق

| العربي | المقترح | البدائل وسبب الاختيار |
|---|---|---|
| العميل / العملاء | **customer(s)** | `client(s)` فقط في صفحة الوكالات حيث "عملاء الوكالة" شركات. |
| العملاء المحتملين | **leads** | `potential customers`: أطول وأضعف. |
| باحث العملاء المحتملين (الميزة) | **Lead Finder** | اسم ميزة، بحروف كبيرة. |
| سحب داتا من Google Maps | **Business leads from Google Maps** | معتمد (4.6). الميزة تجلب أرقام الشركات من خرائط جوجل حسب النشاط والمنطقة. **لا تُذكر الآلية ولا كلمة `scraping`/`extract`.** |
| سحب العملاء بالباركود | **QR code lead capture** | النص العربي يقول "باركود" لكن المقصود رمز QR (صفحة المحلات تقول QR). `barcode` في الإنجليزية شيء آخر. |
| جهات الاتصال | **contacts** | — |
| المستخدمين (في الباقة) | **users** | `seats`: مصطلح SaaS دقيق لكنه أقل وضوحاً. |
| صندوق وارد واحد / منصة موحدة | **unified inbox** / **one inbox** | — |
| إدارة العملاء CRM | **CRM (customer management)** | — |
| فريق المبيعات | **sales team** | — |
| خدمة العملاء | **customer service** | `customer support`: مرادف؛ نستعمل `service` للقسم و`support` للدعم الفني. |
| دعم متخصص / الدعم الفني | **dedicated support** / **technical support** | — |
| الموظفين / تنظيم موظفيك | **employees** / **organize your team** | في صفحة الموارد البشرية: `employees` دائماً. |
| مدير حسابات / وظّف مدير للمنصة | **dedicated account manager** / **Get a dedicated account manager** | معتمد (4.6). خدمة مدير حسابات يُوظَّف بالساعات ليدير العمليات والسكرتارية والتصاميم. `platform manager`, `hire`: لا. |
| المستفيدين / المتبرعين (القطاع الخيري) | **beneficiaries** / **donors** | — |
| الضيف / النزيل (السياحة) | **guest** | — |
| الطلاب / المتدربين | **students** / **trainees** | — |
| الزبائن (المحلات) | **customers** / **shoppers** | — |
| المنشأة / الشركة | **business** / **company** | `establishment`: حرفي وثقيل. |

### 2.5 الباقات والأسعار

| العربي | المقترح | البدائل وسبب الاختيار |
|---|---|---|
| الباقات (القائمة) | **Pricing** | `Packages`: حرفي ومطابق للرابط، لكن `Pricing` هو ما يبحث عنه زائر مواقع SaaS. الرابط يبقى `/en/packages/`. |
| باقة | **plan** | `package`: نستعمله لباقات التوظيف فقط (خدمة بساعات، لا اشتراك). |
| باقات الواتس | **WhatsApp plans** | "الواتس" عامية. |
| اشتراكات المنصة | **Platform subscriptions** | — |
| باقة الانطلاقة / البرو / البزنس | **Starter / Pro / Business** | الأسماء العربية الثلاثة أصلاً مأخوذة من هذه الكلمات. |
| مدة الاشتراك: شهري / سنوي | **Billing: Monthly / Yearly** | `Annual`: مرادف؛ `Yearly` أقرب لمفتاح `yearly` وأوضح بجانب `Monthly`. |
| ريال / شهر | **SAR / month** | انظر 1.6. |
| وفر {amount} ريال | **Save SAR {amount}** | — |
| الأكثر طلباً | **Most popular** | — |
| لا محدود / متوفر / غير متوفر | **Unlimited / Included / Not included** | `Available / Unavailable`: حرفي؛ `Included` هو المعتاد في جداول الباقات. |
| {count} نتيجة شهرياً | **{count} results / month** | — |
| خدمات إضافية | **Add-on services** | — |
| باقات التوظيف | **Dedicated account manager** (عنوان القسم) | معتمد (4.6). `Hiring packages`: يوحي بالاستقطاب. |
| باقة اليوم الواحد / الأسبوع / الدوام الجزئي / الكامل | **One-day / Weekly / Part-time / Full-time** (+ `package`) | معتمد (4.6). |
| ضريبة القيمة المضافة 15% | **15% VAT** — `Prices exclude 15% VAT.` | — |
| تجربة مجانية (14 يوم / أسبوعين) | **14-day free trial** | نوحّد على `14-day` حتى حين يقول العربي "أسبوعين" (نفس المدة). |
| كاملة المميزات | **full-featured** / **with all features** | — |
| بدون أي التزام | **no commitment** | `no credit card required`: ممنوع، لأنه ادعاء غير موجود في العربي. |

### 2.6 الأزرار والنداءات

| العربي | المقترح | البدائل وسبب الاختيار |
|---|---|---|
| جرب مجاناً (زر الهيدر) | **Try for free** | `Start free trial`: أطول للهيدر؛ `Sign up`: يفقد معنى المجانية. |
| لوحة التحكم (زر الهيدر) | **Dashboard** | `Log in`: أوضح وظيفياً للقارئ الإنجليزي (الرابط صفحة الدخول). أقترح `Dashboard` وفاءً للتصميم، و`Log in` بديل مقبول. |
| تواصل معنا | **Contact us** | `Get in touch`: أنعم، لكن `Contact us` أوضح للقائمة. في زر داخل قسم (`leadFinder.cta`) يجوز `Get in touch`. |
| تحدث مع فريق المبيعات | **Talk to sales** | `Chat with our sales team`: أطول؛ مقبول إذا كان الزر يفتح واتساب ونريد قول ذلك. |
| ابدأ تجربتك المجانية (14 يوم) | **Start your free trial** / **Start your 14-day free trial** | — |
| ابدأ التجربة المجانية (زر المحادثة) | **Start free trial** | — |
| شاهد الباقات | **View pricing** | `See plans`: مقبول. |
| جرب الآن / اشترك الآن | **Try it now** / **Subscribe now** | — |
| وثّق رقمك الآن | **Verify your business now** | معتمد (4.2). |
| اعرف أسباب الحظر | **Learn why numbers get banned** | `Learn the causes of bans`: أثقل. |
| ابدأ التوثيق معنا | **Start verification with us** | — |
| اطلب تجربة HRwhats الآن / احصل على استشارة | **Request an HRwhats trial** / **Get a consultation** | — |
| تواصل عبر واتساب (الزر العائم والنموذج) | **Chat on WhatsApp** | `Contact via WhatsApp`: حرفي. |
| مشاركة عبر واتساب (المدونة) | **Share on WhatsApp** | — |
| العودة للرئيسية | **Back to home** | — |
| إرسال / جارٍ الإرسال... | **Send** / **Sending…** | — |

### 2.7 "مثال توضيحي"

| العربي | المقترح | البدائل وسبب الاختيار |
|---|---|---|
| مثال توضيحي (`ExampleTag`) | **Illustrative example** | `Example`: قصير لكنه لا يقول إن البيانات غير حقيقية؛ `Sample data`: تقني؛ `Demo`: يوحي بأنه يعمل. |
| مثال توضيحي: … (داخل `aria-label`) | **Illustrative example: …** | — |
| رسم توضيحي: … | **Illustration: …** | — |

### 2.8 القائمة والفوتر وعناصر الواجهة

| العربي | المقترح | ملاحظة |
|---|---|---|
| الرئيسية | **Home** | — |
| الباقات | **Pricing** | انظر 2.5. |
| المدونة | **Blog** | حتى ترجمة المدونة: يربط إلى `/news/` العربية بلا وسم، مع `hrefLang="ar"` (4.7). |
| تواصل معنا | **Contact us** | — |
| حظر الواتساب | **WhatsApp bans** | — |
| دليل الاستخدام | **User guide** | الدليل عربي: `hrefLang="ar"` بلا وسم (4.7). `Help center`/`Docs`: أسماء موقع لا نتحكم فيه. |
| القائمة (زر الجوال) | **Menu** | — |
| {label} (يفتح في تبويب جديد) | **{label} (opens in a new tab)** | — |
| HRwhats الرئيسية (اسم الشعار) | **HRwhats home** | — |
| مبدّل اللغة | النص يكون **العربية** في الصفحات الإنجليزية | — |
| روابط سريعة | **Quick links** | — |
| أدلة المنصة / خطوات ربط الحساب / متطلبات التوثيق | **Platform guides / Connecting your account / Verification requirements** | — |
| © {year} HRwhats — أحد منتجات {الناشر} | **© {year} HRwhats — a product of Tmt3 Maana Agency** | اسم الوكالة معتمد (4.4)، ويُكتب في `site.json` → `publisher.name.en`. |
| الهاتف / البريد الإلكتروني / واتساب / تابعنا | **Phone / Email / WhatsApp / Follow us** | — |
| السياسات / سياسة الخصوصية / شروط الاستخدام / سياسة الاسترجاع | **Policies / Privacy policy / Terms of use / Refund policy** | مترجمة (4.16)؛ روابط الفوتر إلى `/en/…`. |
| متصل الآن / يكتب الآن... / اكتب رسالة | **online / typing… / Type a message** | كما في واجهة واتساب الإنجليزية. |
| مسار التنقل | **Breadcrumb** | — |
| محتويات المقال / محتويات الصفحة | **In this article / On this page** | — |
| الصفحة غير موجودة | **Page not found** | — |
| (اختياري) | **(optional)** | — |

### 2.9 أقسام الرئيسية (العناوين الصغيرة)

| العربي | المقترح |
|---|---|
| المميزات | **Features** |
| لماذا HRwhats؟ | **Why HRwhats?** |
| ميزة جديدة | **New feature** |
| الفئات المستهدفة | **Industries we serve** |
| شركاء النجاح | **Our partners** |
| الأسئلة الشائعة | **FAQ** |
| حماية رقمك | **Protect your number** |
| تجربة مجانية لمدة أسبوعين | **14-day free trial** |

### 2.10 أسماء القطاعات العشرة

المصدر الوحيد للاسم: `sectors.json` (حقل `en`). الرابط يبقى `/en/<slug>/`.

| slug | العربي | المقترح | البدائل وسبب الاختيار |
|---|---|---|---|
| `charity` | القطاع غير الربحي والجمعيات | **Nonprofits & Charities** | `Non-Profit Sector & Associations`: حرفي؛ `associations` بالإنجليزية تعني غالباً النقابات المهنية. الإملاء الأمريكي `nonprofit` بلا شرطة. |
| `real-estate-contracting` | العقارات والمقاولات | **Real Estate & Contracting** | `Real Estate & Construction`: أوضح عالمياً، لكن `contracting` مستعمل في السعودية ومطابق للرابط. |
| `education-training` | التعليم والتدريب | **Education & Training** | — |
| `tourism-hospitality` | السياحة والفندقة | **Tourism & Hospitality** | — |
| `online-stores-systems` | المتاجر الإلكترونية والأنظمة | **Online Stores & Software Systems** | معتمد (4.6): "الأنظمة" = الأنظمة البرمجية عموماً. |
| `advertising` | وكالات التسويق والإعلان | **Marketing & Advertising Agencies** | — |
| `hr` | الموارد البشرية | **Human Resources** | `HR`: يجوز في المساحات الضيقة. |
| `operating-service` | شركات التشغيل والخدمات | **Operations & Service Companies** | معتمد (4.6)، بمعناها العام. |
| `restaurants-cafes` | المطاعم والكافيهات | **Restaurants & Cafes** | `Cafés`: بعلامة؛ الإملاء الأمريكي الشائع بدونها. |
| `shops` | المحلات التجارية | **Retail Shops** | `Shops` وحدها أو `Stores`: تلتبس بـ `Online Stores`. |

ملاحظة: عنوان صفحة المتاجر العربي (`المتاجر والأنظمة الإلكترونية`) يختلف عن اسمها في `sectors.json` (`المتاجر الإلكترونية والأنظمة`)، وعنوان العقارات يضيف "شركات". لا نغيّر العربي؛ الإنجليزية تتبع الاسم في `sectors.json`.

### 2.11 صيغ ثابتة أخرى

| العربي | المقترح |
|---|---|
| متاح 24/7 / يرد على عملائك 24/7 | **available 24/7** |
| من السبت للخميس، 9 صباحاً حتى 5 مساءً | **Saturday to Thursday, 9 AM–5 PM (Saudi time)** (معتمد 4.6) |
| من 14 إلى 28 يوماً | **14 to 28 days** |
| الرياض، السعودية | **Riyadh, Saudi Arabia** |
| منصة سعودية | **a Saudi platform** |
| السلات المتروكة | **abandoned carts** |
| المنيو | **menu** |
| ممول (المنشور في صفحة الوكالات) | **Sponsored** |

---

## 3. صيغة العناوين الإنجليزية (`<title>`)

عبارة "حلول واتس اب اعمال" تخص البحث العربي ولا تنقل حرفياً. الإنجليزية لا تحمل تاريخ ترتيب في Google، فنختار العبارة التي يبحث بها القارئ الإنجليزي: **WhatsApp Business API**.

### الرئيسية

- **مقترح:** `WhatsApp Business API Platform | HRwhats` (41 حرفاً).
- بديل: `HRwhats — WhatsApp Business API Platform for Businesses` (العلامة أولاً، أطول وفيه تكرار).
- بديل: `WhatsApp Business Solutions | HRwhats` (ترجمة "حلول واتس اب اعمال"، لكنها عبارة بحث أضعف).
- مثل العربية: `title` وOpen Graph وTwitter من مفتاح واحد (`meta.homeTitle`).

### الصفحات الداخلية

- **مقترح:** `{name} - WhatsApp Business API | HRwhats`
  - `Pricing - WhatsApp Business API | HRwhats` (42)
  - `Restaurants & Cafes - WhatsApp Business API | HRwhats` (53)
  - الأطول: `Marketing & Advertising Agencies - WhatsApp Business API | HRwhats` (66): يتجاوز نحو 60 حرفاً فيقطع Google آخره (`| HRwhats`). مقبول، أو نختصر الاسم في العنوان فقط.
- **استثناء:** إذا كان الاسم نفسه يحتوي "WhatsApp" (صفحة الحظر) لا نكرّرها: `{name} | HRwhats`.
- بدائل الصيغة كلها:
  - `{name} | HRwhats`: نظيف وقصير، بلا عبارة بحث.
  - `{name} - WhatsApp Business Solutions | HRwhats`: ترجمة حرفية للصيغة العربية، أطول.
- الفاصل ` - ` ثم ` | ` كما في العربية.

### أسماء الصفحات في العنوان

| الصفحة | `{name}` المقترح | العنوان الكامل |
|---|---|---|
| الباقات | Pricing | `Pricing - WhatsApp Business API | HRwhats` |
| تواصل معنا | Contact Us | `Contact Us - WhatsApp Business API | HRwhats` |
| حظر الواتساب | Why WhatsApp Numbers Get Banned | `Why WhatsApp Numbers Get Banned | HRwhats` (معتمد 4.3) |
| القطاعات | الاسم من 2.10 | `Human Resources - WhatsApp Business API | HRwhats` |

- في `<title>` نستعمل title case للاسم (`Contact Us`)، وفي الصفحة نفسها sentence case (`Contact us`).
- المدونة لاحقاً: لا نترجم "الأرشيف" (`واتساب الأرشيف`)؛ هي بقايا Yoast. العنوان الإنجليزي `WhatsApp - Blog | HRwhats` أو ما يُعتمد وقتها.
- `description`: نص إنجليزي جديد بنفس المعنى، حتى 155 حرفاً تقريباً، ويخضع لقرار 4.1 أينما ذكر "بدون حظر".

---

## 4. قرارات المطوّر (2026-11-11)

### 4.1 "بدون حظر" والوعود المشابهة: صيغة دقيقة

- **القرار:** الخيار (ب). الإنجليزية تحفظ الفكرة (الإرسال عبر القناة الرسمية بدل الأدوات التي تسبب الحظر) بلا وعد بعدم الحظر. **العربي لا يتغير.**
- **إجراء إلزامي:** عند ترجمة كل صفحة، تُعرض على المطوّر كل جملة من هذه الجمل بنصها الإنجليزي قبل اعتمادها. الصيغ أدناه منطلق للاقتراح، لا نص معتمد.
- مرفوض: الحرفي (`ban-free`, `without getting banned`, `no bans`) والحذف الكامل لفكرة الحظر.

**المواضع (14):**

| # | المفتاح | النص العربي | منطلق الصيغة الإنجليزية |
|---|---|---|---|
| 1 | `meta.homeDescription` | حملات جماعية بدون حظر | `bulk campaigns through the official WhatsApp Business API, with far lower ban risk than unofficial tools` |
| 2 | `home.hero.lead` | حملات جماعية بدون حظر عبر واتساب API الرسمي | نفس الفكرة |
| 3 | `home.hero.floatCards.campaign.subtitle` | حملة اليوم — بدون حظر | `Today's campaign — official API` |
| 4 | `home.chat.messages[1]` | ترسل حملاتك لآلاف العملاء عبر واتساب API الرسمي بدون حظر | `…through the official WhatsApp Business API—the safe way to message at scale.` |
| 5 | `home.features.cards.campaigns.text` | لتصل إلى آلاف الرسائل دون حظر | `…through the official channel, with lower ban risk.` |
| 6 | `packagesPage.meta.description` | حملات إعلانية ورسائل جماعية بدون حظر | مثل 1 |
| 7 | `packagesPage.whatsapp.lead` | أرسل آلاف الرسائل بدون حظر | مثل 1، بصيغة أقصر |
| 8–14 | `sectors.{charity, realEstate, tourism, stores, advertising, restaurants, shops}.meta.description` | رسائل جماعية بدون حظر | مثل 1 (المرحلة الثانية) |

لا تُحتسب: `whatsappBan.honest.promise.quote` («واتساب بدون حظر نهائيًا») و`honest.question`، فهما نفي للوعد ويُترجمان حرفياً.

**وعود قريبة تخضع للقرار نفسه (وتُعرض بالطريقة نفسها):**

| المفتاح | النص العربي | منطلق الصيغة الإنجليزية |
|---|---|---|
| `home.banProtection.subtitle` | لا تفقد رقمك للأبد… وثّق رقمك في ميتا | `Don't risk losing your number — verify your business with Meta` |
| `home.banProtection.description` | توثيق محفظة أعمال ميتا مرة واحدة، مدى الحياة | `One-time Meta business portfolio verification` (بلا `for life`) |
| `home.features.cards.api.text` | ربط موثوق… يقلل خطر الحظر | دقيق أصلاً: `reduces the risk of bans` |
| صفحات القطاعات | "تضمن رداً فورياً 24/7"، "ضمان عدم تكرار العملاء"، "ضمان جودة الرد وسرعته" | `helps ensure …` (المرحلة الثانية) |

**النصوص المعتمدة في الرئيسية (2026-11-11)** — في `messages/en.json`، ولا تُعدَّل دون المطوّر:

| المفتاح | النص المعتمد |
|---|---|
| `meta.homeDescription` | Official WhatsApp Business API platform in Saudi Arabia: bulk campaigns with far lower ban risk than unofficial tools, AI auto-replies, and sales automation. (صيغة المطوّر، ≤155 حرفاً) |
| `home.hero.lead` | One platform to grow your sales and organize your team and your business: bulk campaigns through the official WhatsApp Business API, with far lower ban risk than unofficial tools, AI-powered automated replies, and complete customer management in one place. |
| `home.hero.floatCards.campaign.subtitle` | Today's campaign — official API |
| `home.chat.messages[1]` | Hi! Welcome to HRwhats 🌿 You can send campaigns to thousands of customers through the official WhatsApp Business API, with far lower ban risk than unofficial tools. |
| `home.features.cards.campaigns.text` | Run your WhatsApp marketing campaigns at the scale of thousands of messages, through the official channel and with lower ban risk. |
| `home.features.cards.api.text` | A reliable WhatsApp connection on Meta's official API that reduces the risk of bans and lets you send broadcast messages securely and professionally. |
| `home.banProtection.subtitle` | Build trust with your customers — **verify your business with Meta** (صيغة المطوّر) |
| `home.banProtection.description` | We handle your Meta business portfolio verification: a one-time step. (بلا `for life`) |

### 4.2 التوثيق: Verify your business

معتمد. Meta توثّق المنشأة لا الرقم: `Verify your business (with Meta)`، `Verify your business now`، `Verified business ✓`.

### 4.3 عنوان صفحة حظر الواتساب

معتمد: `Why WhatsApp Numbers Get Banned | HRwhats`. اسم الصفحة في القائمة والفوتر يبقى `WhatsApp bans`.

### 4.4 الأسماء الرسمية وصفة HRwhats عند Meta

- **اسم الوكالة:** `Tmt3 Maana Agency` (الفوتر، و`site.json` → `publisher.name.en`).
- **صفة HRwhats عند Meta:** الصفة الفعلية **Tech Provider**. في النص الإنجليزي لا تُذكر أي صفة أو شراكة، ونكتفي بـ `the official WhatsApp Business API`. **ممنوع في أي نص إنجليزي:** `Meta Business Partner`، `Meta partner`، `official partner`. الاستثناء الوحيد: الشارة المرسومة بالكود `Meta Tech Provider` في موضعي 4.10. يشمل ذلك:
  - `home.trust.meta.title` (شريك Meta) ← `Meta Tech Provider` مع الختم (معتمد، 4.10).
  - `home.features.cards.api.badge` (شريك أعمال رسمي لدى Meta — اتصال مباشر بواجهة WhatsApp Cloud API) ← `Direct connection to the official WhatsApp Cloud API`.
  - النص البديل `trust.meta.imageAlt` و`features.cards.api.badgeImageAlt`: لا صورة في الإنجليزية (4.10)، فلا يُستعملان فيها.
- أسماء الشركاء والعملاء الآخرين: النص البديل للشعار فقط؛ يبقى العربي حيث لا يوجد اسم رسمي بالإنجليزية (لا نخترع أسماء).

### 4.5 التحية في محادثة الرئيسية

معتمد: `Hi!` (والرد كذلك بصيغة تحية إنجليزية عادية).

### 4.6 المعاني المحسومة

| المفتاح | القرار |
|---|---|
| `packagesPage.hiring.*`, `home.features.cards.manager` | خدمة مدير حسابات يُوظَّف بالساعات ليدير العمليات والسكرتارية والتصاميم. الترجمة `Dedicated account manager`، والباقات `One-day / Weekly / Part-time / Full-time`. |
| `home.leadFinder.subtitle`, `packages…features.mapsLeads` | ميزة تجلب أرقام الشركات من خرائط جوجل حسب النشاط والمنطقة: `Business leads from Google Maps` (أو `Lead finder`). لا تُذكر الآلية ولا `scraping`. |
| `home.why.verify.*` | `Freelance Certificate` (من النسخة الإنجليزية لـ freelance.sa، تحقق 2026-11-11). |
| `sectors.json` → `online-stores-systems` | `Online Stores & Software Systems` |
| `sectors.json` → `operating-service` | `Operations & Service Companies` |
| `faq[0]` | الرقم المستخدم في المنصة للحملات يعمل أيضاً في تطبيق واتساب للأعمال بشكل طبيعي (ميزة `Coexistence` عند Meta). يُصاغ كميزة، بلا ذكر المنصات المنافسة. |
| `faq[1]` | `(Saudi time)` بعد ساعات الدعم: موافق. |

### 4.7 روابط الإنجليزية إلى محتوى عربي

**قرار 2026-11-12 (يحل محل قرار 2026-11-11 بوسم "(Arabic)"): لا وسم مرئي في أي موضع.**
- الرابط إلى صفحة لم تُترجم بعد يشير إلى النسخة العربية كما هي، **باسمه الإنجليزي وحده** (`Blog`، `Pricing`، `User guide`، أسماء القطاعات…)، ويحمل `hrefLang="ar"` (غير مرئي).
- يشمل ذلك كل المواضع: الهيدر، والفوتر، والأزرار، وبطاقات القطاعات، ورابط الأسئلة الشائعة، والمدونة، والدليل (`docs.hrwhats.com`)، والصفحات القانونية الثلاث.
- حين تُترجم صفحة وتُضاف إلى `englishPaths` يتحول رابطها تلقائياً إلى `/en/…` ويسقط `hrefLang`.
- الروابط إلى العربية تفتح في التبويب نفسه، ما عدا الدليل (خارجي، تبويب جديد كما في العربي).
- لا `hreflang` لصفحة إنجليزية غير موجودة (CLAUDE.md).
- التنفيذ: `localizeLinks()` / `localizeLink()` في `src/lib/navigation.ts`.

### 4.8 نوع الإنجليزية والعملة

معتمدان: الإنجليزية الأمريكية (1.1)، و`SAR 150` (1.6).

### 4.9 تذكير: ما لا تفعله الترجمة

- لا تغيير في أي نص عربي بسبب الترجمة.
- لا رقم ولا سعر مكتوب في `en.json`.
- لا شراكة مع Meta (عدا شارة `Meta Tech Provider` في 4.10)، ولا وعد بعدم الحظر.

### 4.10 شارة Meta في الرئيسية (محسوم للإنجليزية، 2026-11-11)

الرئيسية تعرض الصورة `public/images/brand/meta-business-partner.png` (`META_PARTNER` في `src/lib/brand.ts`) في موضعين: شريط الثقة، وبطاقة "ربط واتساب API الرسمي". نص الصورة حرفياً: `Meta` / `Business Partner`.

**في الإنجليزية:**
- الصورة **لا تُستخدم في أي صفحة إنجليزية**، لأنها تقول "Business Partner" وصفة HRwhats الفعلية **Tech Provider**.
- مكانها في الموضعين: **شارة مرسومة بالكود** من رموز التصميم، نصها `Meta Tech Provider`، **بلا شعار Meta** داخلها.
- لا يُكتب `Meta Business Partner` أو `Meta partner` في أي نص إنجليزي.
- **التنفيذ (معتمد 2026-11-11):** `MetaTechBadge` (`src/components/ui/`)، ختم بعلامة صح (`BadgeCheck`، أخضر) بلا شعار Meta، ونصه من `metaBadge` في `en.json`.
  - **بطاقة الـ API:** صندوق أبيض بارتفاع 44px (مكان الصورة): الختم + `Meta` / `Tech Provider`، وبجانبه `Direct connection to the official WhatsApp Cloud API`.
  - **شريط الثقة:** الختم وحده أيقونةً، والعنوان `Meta Tech Provider`، وتحته `Official WhatsApp Business API` (`home.trust.meta`). هذا يحلّ محل اقتراح `Official API` في 4.4.
  - `trust.meta.imageAlt` و`features.cards.api.badgeImageAlt` فارغان في `en.json` (لا صورة).
- **شعار `Meta Business Suite` في قسم الشركاء: مخفي في الإنجليزية** (معتمد 2026-11-11)، لأن عنوان `Our partners` يجعله ادعاء شراكة. التنفيذ: `"hiddenIn": ["en"]` في `partners.json`، و`getPartners(locale)` يستبعده.

**في العربية (لا تتغير الآن):** الرئيسية العربية تعرض الصورة نفسها ("Meta Business Partner") وعبارة "شريك Meta" (`home.trust.meta.title`)، و"شريك أعمال رسمي لدى Meta" (`home.features.cards.api.badge`)، وشعار `Meta Business Suite` تحت "شركاء النجاح"، بينما الصفة الفعلية Tech Provider. **يُراجع ذلك بقرار من المطوّر قبل الإطلاق** (مسجّل في مهام مرحلة الإطلاق في `CLAUDE.md`).

### 4.11 قرارات الرئيسية الإنجليزية (2026-11-11)

- **أسماء المطاعم في مثال Lead Finder** مترجمة بالمعنى لأنها متخيَّلة: `Sunbula Restaurant`، `Levant House Restaurant`، `Vine Leaves Restaurant`، `Golden Table Restaurant`. الأحياء بالحروف اللاتينية: `Al Narjis`، `Al Olaya`، `Al Malqa`، `Al Yasmin`. (أسماء الأشخاص تبقى بالحروف اللاتينية، 1.9.)
- **جواب Coexistence (`faq[0]`) معتمد:** `Can I also use my number in the WhatsApp Business app?` — `Yes. The number you use on the platform for campaigns also keeps working normally in the WhatsApp Business app, through Meta's Coexistence feature.`
- **أسماء الشعارات العربية** (عملاء وشركاء بلا اسم إنجليزي رسمي) تبقى عربية، وحاويتها تحمل `lang="ar"`.
- **الهيدر الإنجليزي (قياس 2026-11-12، بعد إزالة الوسوم):** القائمة الإنجليزية (600px) تبقى في سطر واحد من 1082px. لذلك يظهر زر القائمة في الإنجليزية حتى **1081px** (العربية حتى 1080px)، والشعار لا يُضغط. يُعاد القياس إذا تغيّرت أسماء القائمة. (`Header.module.css`)

### 4.12 الباقات وتواصل معنا وحظر الواتساب (2026-11-14)

**نصوص الوعود المعتمدة** (في `messages/en.json`، ولا تُعدَّل دون المطوّر):

| المفتاح | النص المعتمد |
|---|---|
| `packagesPage.meta.description` | WhatsApp Business API plans from SAR {price}/month: bulk campaigns with far lower ban risk than unofficial tools, and dedicated account manager plans. (صيغة المطوّر: مدير الحسابات خدمة منفصلة، غير مشمولة في باقات واتساب. `{price}` = أقل سعر شهري من `packages.json`) |
| `packagesPage.whatsapp.lead` | Get powerful capabilities with HRwhats: send thousands of messages through the official WhatsApp Business API, with far lower ban risk than unofficial tools, and enjoy outstanding customer service. |
| `whatsappBan.meta.description` | Why do company WhatsApp numbers get banned? Learn the causes of account restrictions, how the WhatsApp Business API differs, and steps that lower ban risk. |

**قرارات أخرى:**
- **العنوان الرئيسي (h1) لصفحة الحظر:** `Why WhatsApp numbers get banned` (يطابق عنوان الصفحة؛ العربي "حظر الواتساب"). اسمها في القائمة والفوتر يبقى `WhatsApp bans`.
- **رسالة صفحة الحظر الأساسية** تبقى صريحة: `No method can guarantee 100% that an account won't be restricted.`، و«واتساب بدون حظر نهائيًا» تُترجم حرفياً لأنها نفي للوعد: `“WhatsApp with zero bans, ever”`.
- **الباقات:** أسماء باقات واتساب `Starter` / `Pro` / `Business`؛ وباقات مدير الحسابات تحت عنوان `Dedicated account manager`: `One-day package` / `Weekly package` / `Part-time package` / `Full-time package`. الأسعار تُكتب `SAR 150 / month` والعملة من `packages.json`.
- **نموذج التواصل الإنجليزي:** الرسالة تصل إلى بريد الشركة بعنوان يبدأ بـ `[EN]`، وأول سطر فيها "⚠ أُرسلت من الصفحة الإنجليزية — يُرجى الرد بالإنجليزية" (`contact.php`). الرسائل العربية لا تتغير.

### 4.13 القطاعات، الدفعة الأولى: الجمعيات والعقارات والتعليم (2026-11-14)

**نصوص الوعود المعتمدة** (في `messages/en.json`، ولا تُعدَّل دون المطوّر):

| المفتاح | العربي | النص المعتمد |
|---|---|---|
| `sectors.charity.meta.description` | …رسائل جماعية بدون حظر… | WhatsApp Business API for nonprofits: beneficiary communication, bulk donation campaigns with far lower ban risk than unofficial tools, and reports. |
| `sectors.realEstate.meta.description` | …رسائل جماعية بدون حظر، وتحويل العملاء إلى صفقات | WhatsApp Business API for real estate and contracting: customer inquiries, auto-replies, and bulk campaigns with far lower ban risk than unofficial tools. (بلا "الصفقات" ليبقى ≤155 حرفاً) |
| `sectors.charity.services.items.beneficiaries.text` | ردود … تضمن تجربة احترافية | …with fast, organized replies for a professional, smooth experience. |
| `sectors.realEstate.services.items.inquiries.text` | لضمان سرعة الاستجابة وعدم فقدان أي فرصة | …so you can reply quickly without missing opportunities. |
| `sectors.realEstate.services.items.autoReplies.note` | هذا يضمن رداً فورياً 24/7… | This helps ensure an instant reply 24/7, without constant human intervention. |
| `sectors.realEstate.services.items.team.points[2]` | ضمان عدم تكرار العملاء أو ضياعهم | Help ensure no customer is duplicated or lost |
| `sectors.charity.result.text` + `cards.donations.title` | زيادة واضحة في التبرعات | `help grow donations` (صيغة المطوّر). الجملة: `More organized campaigns and more effective communication that help grow donations—with less manual effort…`؛ البطاقة: `Help grow donations` |
| `sectors.realEstate.hero.badges[1]` | مبيعات أعلى | Higher sales |

**بيانات المجسمات المعتمدة:**
- الأسماء والكنى: انظر 1.9.
- أسماء الحملات (متخيَّلة وعامة، مترجمة بالمعنى): `Clean Water campaign` (سقيا الماء)، `Food Basket`، `Winter Clothing`، `Orphan Sponsorship`، ومبادرة `Winter Clothing initiative`.
- "جزاكم الله خيراً" ← `May God reward you all 🤍`.
- المبالغ تُنقل كما في العربي بصيغة `SAR 850,000` / `SAR 36,450` / `of SAR 50,000`.
- "لوحة 01 / 06" (العقارات) ← `Sheet 01 / 06`.
- التقويم (التعليم): "الإعلان عن دورة جديدة" ← `New course launch` (الكلمة `announcement` لا تتسع في خانة اليوم).

### 4.14 القطاعات، الدفعة الثانية: السياحة والمتاجر والوكالات (2026-11-14)

**نصوص الوعود المعتمدة** (في `messages/en.json`، ولا تُعدَّل دون المطوّر):

| المفتاح | العربي | النص المعتمد |
|---|---|---|
| `sectors.tourism.meta.description` | …حملات موسمية ورسائل جماعية بدون حظر… | WhatsApp Business API for hotels and tourism: booking inquiries, automatic confirmations, and bulk campaigns with far lower ban risk than unofficial tools. |
| `sectors.tourism.journey.items.inquiries.note` | لضمان سرعة الرد وعدم فقدان أي حجز محتمل | …so you can reply quickly without missing potential bookings. |
| `sectors.tourism.journey.visuals.backstage.rows` (مثال) | في ارتفاع / في تحسّن / أكثر كفاءة | Rising / Improving / More efficient |
| `sectors.tourism.closing.text` | حوّل كل استفسار إلى حجز… | Turn every inquiry into a booking and every interaction into a memorable experience… |
| `sectors.stores.meta.description` | …حملات ورسائل جماعية بدون حظر… | WhatsApp Business API for online stores: orders, inquiries, abandoned carts, and bulk campaigns with far lower ban risk than unofficial tools. |
| `sectors.stores.services.items.inquiries.note` | لضمان سرعة الرد وتحسين تجربة العميل | …so you can reply quickly and improve the customer experience. |
| `sectors.stores.services.items.experience.text` | تجربة احترافية تزيد من الولاء | Deliver a professional experience that builds loyalty: |
| `sectors.stores.services.items.campaigns.title` | الحملات التسويقية وزيادة المبيعات | Marketing campaigns and sales growth |
| `sectors.stores.closing.highlight` | وحقق نمواً حقيقياً في مبيعاتك | Start now, and start growing your sales. (صيغة المطوّر، اتساقاً مع `help grow donations` في 4.13) |
| `sectors.{tourism,stores}.hero.lead` | نساعدكم على… وزيادة المبيعات | we help you … and increase sales on WhatsApp |
| `sectors.advertising.meta.description` | …حملات ورسائل جماعية بدون حظر… | WhatsApp Business API for agencies: multi-client management, bulk campaigns with far lower ban risk than unofficial tools, and lead qualification. |
| `sectors.advertising.services.items.team.points[3]` | ضمان جودة الرد وسرعته | Help ensure fast, high-quality replies |
| `sectors.advertising.hero.title` | وحقق نتائج تسويقية أقوى | Manage your clients smartly and achieve stronger marketing results |
| `sectors.advertising.hero.badges[1]` | مبيعات أعلى | Higher sales |
| `sectors.advertising.services.items.leads.points[3]` | زيادة فرص التحويل إلى عملاء فعليين | Improve your chances of turning leads into customers |
| `sectors.advertising.closing.title` | نتائج أقوى لعملائك | Smarter marketing, stronger results for your clients |

**قرارات أخرى:**
- الأسماء الجديدة: انظر 1.9.
- عملاء الوكالة في المثال: `Restaurant` / `Clinic` / `Store`. في صفحة الوكالات `clients` = عملاء الوكالة، و`customers` = عملاؤهم (2.4).
- عنوانا المتاجر والوكالات (66 حرفاً) يبقيان بالصيغة المعتمدة رغم الطول.
- التواريخ في الأمثلة: `Thursday, December 10` / `Sunday, December 13` (مطابقة لأيام 2026).
- الخريطة الحرارية: `Sat … Fri`، والأسبوع يبدأ بالسبت كما في العربي.
- المحاكيات التفاعلية: `Interactive illustrative example: …`.
- عنوان المتاجر: `Turn WhatsApp conversations into sales—simply and smartly`.
- وسم `Illustrative example` لا ينكسر على سطرين في الإنجليزية (`:lang(en)` في `ExampleTag.module.css`).

### 4.15 القطاعات، الدفعة الأخيرة: الموارد البشرية والتشغيل والمطاعم والمحلات (2026-11-14)

**نصوص الوعود المعتمدة** (في `messages/en.json`، ولا تُعدَّل دون المطوّر):

| المفتاح | العربي | النص المعتمد |
|---|---|---|
| `sectors.hr.journey.items.inquiries.note` | لضمان سرعة الرد ودقة الخدمة | With organized conversations, so you can reply quickly and accurately. |
| `sectors.hr.hero.title` | …وكفاءة تشغيل أعلى | Manage employee communication on WhatsApp smartly and run more efficiently |
| `sectors.hr.closing.title` | موارد بشرية أكثر كفاءة… وموظفون أكثر رضا | More efficient HR, happier employees |
| `sectors.hr.closing.highlight` | وحقق بيئة عمل أكثر كفاءة وسلاسة | Start now, and start building a more efficient, smoother workplace. |
| `sectors.operating.services.items.requests.note` | تنظيم كامل يضمن عدم فقدان أي طلب | Fully organized, to help ensure no request gets lost and every one is handled quickly. |
| `sectors.operating.closing.title` | تشغيل ذكي… بلا طلب ضائع | Smart operations, no lost requests |
| `sectors.operating.closing.highlight` | وحقق كفاءة تشغيل أعلى ورضا عملاء أكبر | Start now, and start improving your operational efficiency and customer satisfaction. |
| `sectors.operating.hero.title` | تشغيل أكثر كفاءة… وتواصل أسرع | More efficient operations, faster communication with your customers on WhatsApp |
| `sectors.restaurants.meta.description` | …ورسائل جماعية بدون حظر… | WhatsApp Business API for restaurants and cafes: orders and menus, delivery updates, and bulk offers with far lower ban risk than unofficial tools. |
| `sectors.restaurants.values.items[0]` | زيادة عدد الطلبات والمبيعات | Grow your orders and sales |
| `sectors.restaurants.closing.text` | …وعميلك أكثر رضا | Make ordering easier, communication faster, and customers happier… |
| `sectors.restaurants.closing.highlight` | ارتقِ بتجربة مطعمك إلى مستوى جديد | Start now, and take your restaurant experience to a new level. |
| `sectors.shops.meta.description` | …عروض موسمية ورسائل جماعية بدون حظر | WhatsApp Business API for retail shops: QR code lead capture, pickup or delivery, and bulk campaigns with far lower ban risk than unofficial tools. |
| `sectors.shops.hero.title` | وزِد مبيعاتك بذكاء | Bring your customers closer on WhatsApp and grow your sales smartly |
| `sectors.shops.closing.highlight` | وارتقِ بمبيعاتك إلى مستوى أعلى | Start now, and take your sales further. |
| `sectors.{restaurants,shops}.services.items.campaigns.title` / `hero.lead` | وزيادة المبيعات | `Marketing campaigns and sales growth` / `…and increase sales on WhatsApp` (كما في 4.14) |

**قرارات أخرى:**
- الأسماء الجديدة والمكان `Al Nakheel`: انظر 1.9.
- **أسماء الأطباق والمنتجات في الأمثلة تُترجم بالمعنى لا بالنقل الحرفي** (أصناف عامة): `Beef burger`، `Grilled chicken`، `Pasta Alfredo`، `Fries`، `Iced latte`، `Orange juice`، `Luxury oud perfume`، `White musk perfume`، `Oud oil`.
- لافتات محطات الموارد البشرية: `First` / `Second` / `Third`؛ وعنوان قسمها `How does HRwhats serve you?` بعلامة استفهام كما في العربي.
- التشغيل: الأقسام `AC` / `Electrical` / `Plumbing`، والأولويات `Urgent` / `Medium` / `Normal`. عنوان الصفحة (64 حرفاً) يبقى بالصيغة المعتمدة.
- أوقات الذروة: `Morning` / `Lunch` / `Afternoon` / `Dinner` / `Late night`، والمفتاح `Quiet` / `Medium` / `Peak`.
- لافتة النيون: `Open now`.

### 4.16 الصفحات القانونية (معتمد 2026-11-14)

- **المبدأ (قرار المطوّر):** الترجمة تعكس العربي كما هو، ولا تحل غموضه ولا تقوّيه ولا تضعفه. لا تلخيص ولا إعادة صياغة ولا إضافة ولا حذف. نفس الأقسام والمعرّفات (`id`) والترتيب وعدد الفقرات والبنود. النص العربي هو الأصل ولا يتغير بسبب الترجمة.
- **الأسماء والعناوين:** `Privacy policy` / `Terms of use` / `Refund policy` (sentence case في الصفحة والفوتر)، والعناوين `{Name} | HRwhats` بـ title case بلا عبارة بحث: `Privacy Policy | HRwhats`، `Terms of Use | HRwhats`، `Refund Policy | HRwhats`.
- **بند اللغة المرجعية:** ملاحظة تحت عنوان الصفحات الإنجليزية الثلاث (`legal.translationNote`، الإنجليزية فقط، ليست قسماً): “This English version is provided for convenience. The Arabic version is the original; if there is any difference or inconsistency between the two versions, the Arabic version prevails.”
- **صندوق المساعدة (نص واجهة):** عنوانه لكل صفحة (`legal.pages.<slug>.helpTitle`): “this policy” / «هذه السياسة» في الخصوصية والاسترجاع، و“these terms” / «هذه الشروط» في الشروط.
- **لا أسماء أنظمة ولا جهات ولا كيان قانوني** في النص العربي، فلا شيء منها في الإنجليزي.

**الصيغ المعتمدة للعبارات المحتملة** (كلها تُبقي غموض العربي أو قوته كما هو):

| العربي | المعتمد | المرفوض ولماذا |
|---|---|---|
| الأنظمة / الأنظمة والقوانين / الأنظمة المعمول بها | `laws` / `laws and regulations` / `applicable laws` | `regulations` وحدها: قد تُفهم لوائح أدنى من النظام |
| مع الالتزام بالحفاظ على سرية البيانات | `with a commitment to maintaining the confidentiality of the data` | تحديد الملتزم (المزودون أو HRwhats): العربي لا يحدده |
| رسائل جماعية غير مرغوب فيها | `unwanted bulk messages` | `unsolicited`: أضيق من العربي |
| الحالات التي تقرها المنصة | `cases approved by the platform` | `recognized`: يوحي بقائمة محددة سلفاً |
| وفق آلية الدفع المستخدمة | `in accordance with the payment method used` | `to the original payment method`: يضيف التزاماً |
| يحق للمنصة تقديم أحد الحلول | `is entitled to offer` | `will offer`: يحوّل الحق التزاماً |
| نعمل على تطبيق إجراءات | `We work to implement` | `We implement`: أقوى من العربي |
| المستخدم / العميل / المشترك | `the user` / `the customer` / `subscribers` (ضمير الغائب، استثناء من `you` في 1.2) | `you`: يوحّد أطرافاً فرّق بينها العربي |
| فترة مناسبة | `reasonable period` | `appropriate`: أبعد عن المعيار القانوني |
| الموافقات اللازمة | `the necessary consent` | — |

- **غموض العربي ونواقصه** (نطاق السياسة على `app.hrwhats.com`، وموضع "أو إذا كان ذلك مطلوبًا"، و"متى كان ذلك ممكنًا"، وسن الأطفال، وتعدد أسماء الطرف، وغياب تاريخ النفاذ والقانون الحاكم وجهة الاختصاص والكيان القانوني): لا تغيير في النصين. تُعرض على محامٍ قبل الإطلاق (CLAUDE.md، المرحلة 6).
