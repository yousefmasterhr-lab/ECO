# دليل المهارات والأنماط البرمجية المعتمدة (SKILLS.md)
> **المرجع التقني القياسي لمعمارية وأنماط تطوير منظومة ECO ERP**  
> *يحدد هذا الملف الأنماط المعمارية والتصميمية الواجب الالتزام بها عند بناء أو صيانة أي شاشة أو وظيفة في النظام.*

---

## 1. معمارية دوال الحافة السحابية (Cloudflare D1 & Pages Functions)

### 1.1 بنية نقاط النهاية (Endpoints Structure)
- جميع مسارات واجهة البرمجة تقع داخل المجلد الرئاسي `functions/api/`:
  - `functions/api/companies/[[path]].ts`
  - `functions/api/licenses/[[path]].ts`
  - `functions/api/branches/[[path]].ts`
  - `functions/api/departments/[[path]].ts`
  - `functions/api/authorized-persons/[[path]].ts`
- يتم ربط قاعدة بيانات D1 باسم ملزم: `env.DB` (أو `env.TARABOT_DB`).
- استخدام وحدة التهيئة المشتركة `functions/api/_companyDb.ts` لضمان وجود الجداول ومطابقة الأعمدة:
  ```typescript
  export async function ensureCompanySchema(db: D1Database): Promise<void> {
    await db.batch([
      db.prepare("CREATE TABLE IF NOT EXISTS companies (...)"),
      // ...
    ]);
  }
  ```

### 1.2 كاشف مسارات الحافة وتفادي خوادم Node المحلية (`isCloudflareEdgeRoute`)
- في بيئة العميل (`src/utils/exportUtils.ts` أو طبقة الـ API):
  ```typescript
  export function isCloudflareEdgeRoute(url: string): boolean {
    return (
      url.startsWith('/api/companies') ||
      url.startsWith('/api/licenses') ||
      url.startsWith('/api/branches') ||
      url.startsWith('/api/departments') ||
      url.startsWith('/api/authorized-persons')
    );
  }
  ```
- عند استدعاء هذه المسارات، يوجه الطلب مباشرة لدوال Cloudflare Pages دون محاولة البحث عن خادم Express محلي على المنفذ `5000` أو غيره.

### 1.3 نمط التزامن التفاؤلي الذكي (Optimistic In-Memory + Background D1 Sync)
- لقراءة سريعة دون تأخير واجهة المستخدم (Zero-Latency UI):
  1. القراءة الأولية تبدأ من الذاكرة المحلية المخزنة (`InMemory / LocalStorage`).
  2. في نفس اللحظة، يتم إطلاق طلب غير متزامن `fetch('/api/...')` لجلب البيانات المحدثة من Cloudflare D1.
  3. عند وصول البيانات من السحابة، يتم تحديث الذاكرة فوراً وإطلاق حدث عام:
     ```typescript
     window.dispatchEvent(new CustomEvent('eco-companies-updated', { detail: freshData }));
     ```
  4. تتحدث الواجهات ومؤشرات الهيدر تلقائياً وبسلاسة تامة.

---

## 2. محرك سجل التعديلات التفصيلي (Audit Trail Diff Engine)

### 2.1 بنية سجل التغييرات
- كل كيان أو سجل رئيسي يحتوي على مصفوفة `auditLogs`:
  ```typescript
  export interface AuditLogEntry {
    id: string;
    timestamp: string; // ISO 8601
    userId?: string;
    userNameAr: string;
    actionAr: 'إنشاء السجل' | 'تعديل بيانات' | 'تحديث الصلاحيات' | 'أرشفة';
    changes: Array<{
      fieldAr: string;
      oldValue: string;
      newValue: string;
    }>;
    notesAr?: string;
  }
  ```

### 2.2 درج العرض التفاعلي (Drawer Modal)
- يتم استدعاء نافذة سجل التعديلات بواسطة أيقونة التنبيه أو السجل (`History` أو `AlertCircle` أو علامة التعجب `!`).
- يتم سرد التغييرات بالترتيب الزمني العكسي (الأحدث أولاً).
- إبراز الفروق (Diff View):
  - القيمة السابقة: نص محذوف باللون الأحمر `bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400`.
  - القيمة الجديدة: نص مضاف باللون الأخضر `bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400`.
  - اسم المستخدم وتاريخ وساعة التعديل بدقة بالغة.

---

## 3. نمط شريط الإجراءات بالأيقونات مع التلميحات (Icon-Only Action Bar)

### 3.1 المعيار البصري
- بدلاً من ملء الجداول والبطاقات بأزرار نصية عريضة تسبب تزاحماً بصرياً، يُعتمد شريط أدوات مصغر مكوّن من أزرار أيقونية فقط بمساحة نقر آمنة لا تقل عن `36px` إلى `44px`:
  1. **المعاينة السريعة:** أيقونة العين `<Eye className="w-4 h-4" />` (لون كحلي/أزرق).
  2. **التعديل:** أيقونة القلم `<Edit2 className="w-4 h-4" />` (لون كهرماني/أصفر).
  3. **سجل التعديلات:** أيقونة السجل `<History className="w-4 h-4" />` أو `<AlertCircle className="w-4 h-4" />` (لون سماوي).
  4. **الحذف:** أيقونة السلة `<Trash2 className="w-4 h-4" />` (لون أحمر/وردي).

### 3.2 إمكانية الوصول والتلميحات (Tooltips & A11y)
- كل زر يجب أن يحتوي على:
  - خاصية `title="..."` واضحة باللغة العربية الفصحى.
  - خاصية `aria-label="..."`.
  - كلاسات التفاعل: `transition-transform active:scale-90 hover:shadow-xs cursor-pointer`.

---

## 4. نظام الألوان المزدوج الراقي (Dual-Theme Styling Rules)

### 4.1 النمط الداكن المعتمد (Corporate Dark Olive & Emerald)
- خلفية النظام الأساسية: `dark:bg-[#0A100B]` أو `dark:bg-[#0E1610]`.
- البطاقات والحاويات: `dark:bg-[#121B14]` مع إطارات `dark:border-[#243628]`.
- النصوص الرئيسية: `dark:text-[#F3EFE6]`.
- النصوص الفرعية والإيضاحية: `dark:text-[#8FA392]`.
- الألوان التشديدية: الكهرماني الذهبي `dark:text-amber-400` والزمردي الفاخر `dark:text-emerald-400`.

### 4.2 النمط الفاتح المعتمد (High-Contrast Crisp Slate & Pure White)
- خلفية النظام الأساسية: `bg-slate-50` أو `bg-slate-100`.
- البطاقات والحاويات: `bg-white` مع إطارات ناصعة ومتباينة `border-slate-200` أو `border-slate-300`.
- النصوص الرئيسية: `text-slate-900` (تباين عالي الوضوح).
- النصوص الفرعية: `text-slate-600` أو `text-slate-500`.
- **نظام الألوان الصارم (Strict Color Scheme):**
  - فرض `color-scheme: light !important` على `html:not(.dark)` وكافة عناصر الإدخال لمنع نظام التشغيل والمتصفح من عكس مؤشر الكتابة (I-beam cursor) إلى الأبيض أو تشويه مربعات الاختيار.
  - قصر `color-scheme: dark !important` حصرياً على `html.dark`.
- مؤشر الكتابة: `caret-slate-900`.

---

## 5. معايير الحركة والتفاعل (Framer Motion Standards)

### 5.1 الانتقالات المعتمدة للنوافذ (Modal Transitions)
- جميع النوافذ المنبثقة تُغلف بـ `<AnimatePresence>`:
  ```tsx
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.18, ease: 'easeOut' }}
  >
  ```

### 5.2 القوائم والبطاقات
- استخدام انتقالات مرنة وغير مشتتة (`duration: 0.15` إلى `0.2` ثانية كحد أقصى).
- حظر الحركات المعقدة أو البطيئة التي تعطل تجربة المستخدم في بيئة العمل السريعة.

---

## 6. سلامة حقول الإدخال والتحقق (Input Hygiene & Sanitization)

1. **الصفر الممنوع:** لا تبدأ أي حقل برقم `0`؛ استخدم `''` كنص افتراضي، مع الاستناد لـ `placeholder`.
2. **إخفاء الأسهم:** يتم تعطيل أسهم الـ Number Spinners عالمياً مع دعم `appearance: textfield`.
3. **مؤشر الفأرة:** فرض `cursor-text` و `caret-color` واضحة على كل الحقول، و `cursor-pointer` على عناصر الاختيار والقوائم.
4. **مربعات الاختيار المخصصة (Custom Checkboxes):**
   - حظر الاعتماد على محرك المتصفح الافتراضي واستخدام `appearance: none`.
   - خلفية بيضاء نقية `#ffffff` مع إطار رمادي `border: 2px solid #cbd5e1` في النمط الفاتح، وخلفية حجرية داكنة في النمط الليلي.
   - عند التأشير: خلفية كهرمانية `#d97706` مع علامة صح بيضاء مرسومة عبر `clip-path`.
5. **تنسيق المبالغ المالية:** عرض المبالغ المالية مع الفواصل الآلافية (مثال: `1,500,000 ج.م`) لسهولة القراءة، وتحويلها إلى أرقام نقية عند الإرسال لقاعدة البيانات.

---

## 7. نمط القائمة التنفيذية للمستخدم وإعدادات الحساب (Executive User Profile Menu)

### 7.1 البنية الهيكلية للقائمة في `Header.tsx`
- **حظر تام** لمحولات الحسابات التجريبية أو شارات المستويات المزيفة.
- يُعرض في أعلى القائمة بطاقة الحساب الرسمية:
  - الاسم الكامل
  - المسمى الوظيفي الفعلي القابل للتخصيص من قاعدة البيانات (مثل `مدير النظام العام / رئيس مجلس الإدارة`)
  - البريد الإلكتروني الرسمي
  - مؤشر الاتصال المباشر (Online Badge)
- **أزرار الإجراءات التنفيذية الأربعة:**
  1. **الملف الشخصي (`UserProfileModal`):** تعديل الاسم، المسمى الوظيفي، البريد الإلكتروني، ورقم الهاتف مع حفظ مباشر في D1.
  2. **الأمان وتغيير كلمة المرور (`ChangePasswordModal`):** كلمة المرور الحالية، الجديدة، وتأكيدها وتحديثها بقاعدة البيانات.
  3. **سجل نشاطي (`UserActivityDrawer`):** درج جانبي يعرض الحركات والتعديلات التي أجراها المستخدم بالوقت والتاريخ.
  4. **إدارة المستخدمين والصلاحيات (`PermissionsManagerModal`):** متاح لمدراء النظام لتعديل مصفوفة صلاحيات أي مستخدم وحفظها في D1.
  5. **تسجيل الخروج:** إنهاء الجلسة والعودة لشاشة الدخول.

---

## 8. نمط مصفوفة الصلاحيات التفصيلية (Granular Action-Level RBAC Pattern)

### 8.1 معيار فحص الصلاحيات ثلاثي المستويات (3-Tier RBAC Enforcement)
1. **مستوى الموديول (Module-Level):** إذا تم سحب جميع صلاحيات الـ `view` الخاصة بكافة التبويبات التابعة للموديول، يتم إخفاء الموديول بالكامل من الشريط الجانبي (`Sidebar.tsx`) ولوحة التحكم.
2. **مستوى التبويب (Tab-Level):** إذا سُحبت صلاحية `companies.<submodule>.view`، يتم إخفاء زر التبويب من شريط التنقل العلوي للموديول، وفي حال عدم امتلاك أي صلاحية عرض، يُعرض كارت الحظر الأمني "غير مصرح بالوصول".
3. **مستوى الإجراء والزر (Action-Level):** إخفاء أو قفل الأزرار بشكل انتقائي ودقيق بواسطة `hasPermission(key)`:
   - إضافة (`.create`)
   - تعديل (`.edit`)
   - حذف (`.delete`)
   - سجل التعديلات التدقيقي (`.view_audit`)
   - المرفقات وتغيير الحالة (`.download` أو `.download_poa` أو `.toggle_status`)

### 8.2 شجرة مفاتيح إدارة الشركات (`ALL_COMPANY_PERMISSIONS`)
- **دليل الشركات:** `companies.directory.view`, `.create`, `.edit`, `.toggle_status`, `.view_docs`, `.view_audit`, `.delete`
- **السجلات والتراخيص:** `companies.licenses.view`, `.create`, `.edit`, `.download`, `.view_audit`, `.delete`
- **الفروع والمواقع:** `companies.branches.view`, `.create`, `.edit`, `.view_audit`, `.delete`
- **الهيكل ومراكز التكلفة:** `companies.org.view`, `.create`, `.edit`, `.view_audit`, `.delete`
- **المفوضون والصلاحيات:** `companies.signatories.view`, `.create`, `.edit`, `.download_poa`, `.view_audit`, `.delete`

### 8.3 تخزين الصلاحيات في Cloudflare D1
- تخزن الصلاحيات في جدول `users` داخل عمود `permissions_json` كنسخة سريعة، بالإضافة إلى جدول فردي `user_permissions (user_id, permission_key, granted_at)` يتيح الاستعلام والفلترة عبر `env.DB.batch`.
- يتمتع السوبر أدمن الرئيسي (`يوسف حجازي`) بصلاحيات كاملة مطلقة تتجاوز كافة عمليات الفحص تلقائياً افتراضياً، مع إمكانية التخصيص والاستثناء الفوري لكافة الحسابات.

### 8.4 المعيار المعتمد لمصفوفة الصلاحيات النظيفة (Clean 12-Module Matrix RBAC Standard)
1. **تغطية شاملة لكافة قطاعات المنظومة الـ 12:**
   - إدارة الشركات (Company Management) — (5 أقسام فرعية، 28 صلاحية تفصيلية)
   - الإدارة العليا والاستراتيجية (C-Suite)
   - الشؤون المالية والخزينة
   - إدارة الموارد البشرية (HRMS)
   - المكتب الفني والمشاريع
   - الصادر والوارد (CTS)
   - الشؤون القانونية
   - التأمينات الاجتماعية
   - استقطاب الكفاءات (ATS)
   - القرارات والتعميمات
   - الاستقبال والزوار
   - الإعدادات والصلاحيات
2. **بنية الجدول المصفوفي (2-Column Interactive Matrix):**
   - **العمود الأيمن:** قائمة القطاعات الـ 12 مطابقة لشريط التنقل، مع شريط تقدم ونسبة الصلاحيات الممنوحة (`28 / 28`).
   - **العمود الأيسر:** جدول مصفوفي دقيق يمثل كل قسم فرعي صفاً واحداً، وأعمدة قياسية للمفاتيح الـ 7: `عرض`، `إضافة`، `تعديل`، `مرفقات`، `حالة`، `تدقيق`، `حذف`، بالإضافة لمفتاح `تحديد الكل` الخاص بالصف.
3. **التخصيص المزدوج:**
   - **تخصيص حسب المستخدم (Per User):** اختيار أي مستخدم مسجل فعلياً من Cloudflare D1 (`managedUsers`) مع عرض اسمه ومسماه الوظيفي وبريده الإلكتروني.
   - **تخصيص حسب الدور الوظيفي (Per Role):** 6 أدوار قيادية بدون شارات L4/L3 مصطنعة.
4. **تطهير الواجهات من حشو المطورين:**
   - حظر تام لعرض أي أكواد خام مثل `Perm_...` أو `f_coa_view` أو شارات `L4/L3`.
   - استبدال التكرار ببانر إرشادي علوي وحيد وأنيق لحسابات الإدارة العليا مع حرية التخصيص والاستثناء.
5. **المزامنة الحية المزدوجة (Live Bi-Directional Wiring):**
   - الحفظ الفوري في Cloudflare D1 (`/api/permissions`) باستخدام `db.batch` و `UPSERT`.
   - بث حدث المتصفح المخصص `eco-permissions-updated` لتطبيق التغييرات لحظياً عبر السايدبار، التبويبات، والأزرار.

### 8.5 دقة الواجهات وثنائية الاتجاه (RTL Precision & Toggle Switch Architecture)
1. **معيار مفاتيح التبديل الحتمية المقاومة للـ RTL (Deterministic Flexbox Toggles):**
   - حظر تام لاستخدام `translate-x` لتحريك دوائر مفاتيح التبديل داخل عناصر `overflow-hidden` أو الحاويات الكبسولية في الواجهات المعربة.
   - الاعتماد الحصري على محاذاة Flexbox (`justify-start` عند الإلغاء و `justify-end` عند التفعيل) مع خاصية `layout` من Framer Motion:
     ```tsx
     <button
       type="button"
       role="switch"
       aria-checked={checked}
       onClick={onChange}
       className={`w-11 h-6 rounded-full p-0.5 flex items-center transition-colors duration-200 cursor-pointer ${
         checked
           ? 'bg-emerald-600 dark:bg-emerald-500 justify-end'
           : 'bg-slate-200 dark:bg-stone-700 justify-start'
       }`}
     >
       <motion.span
         layout
         transition={{ type: 'spring', stiffness: 500, damping: 35 }}
         className="w-5 h-5 rounded-full bg-white shadow-md block pointer-events-none"
       />
     </button>
     ```
2. **منع التزييف في خلايا الصلاحيات غير المطبقة (Non-Applicable Permissions):**
   - عدم رسم مفاتيح تبديل وهمية للإجراءات غير المعرفة في الموديول الفرعي، واستبدالها برمز شرطة أنيق ومحايد (`—`).
   - احتساب العداد الإجمالي ونسب الصلاحيات `X / Y` بناءً على الصلاحيات الحقيقية المطبقة فقط.
3. **تطهير معلمات الرابط عند التنقل بين الموديولات (URL Query Sanitization):**
   - عند تبديل القطاع أو الموديول الرئيسي عبر `NavigationContext`، يجب تنظيف المعلمات العالقة (مثل `?tab=statement&accountId=...`) باستخدام:
     ```typescript
     if (typeof window !== 'undefined' && window.location.search) {
       window.history.replaceState({}, '', window.location.pathname);
     }
     ```
4. **منع اقتطاع النصوص في حقول القوائم المنسدلة RTL:**
   - تطبيق حشوة آمنة `pl-10 pr-4 py-2 min-w-[320px]` مع وضع أيقونة السهم في `left-3` لمنع اقتطاع أول حرف من الأسماء أو الإيميلات.

### 8.6 نمط محرك التعريفات والقوائم المرنة ومكون `<CreatableSelect />` السحابي
1. **التعريفات المفتوحة وحفظها في Cloudflare D1:**
   - إدارة خمسة تصنيفات مفتوحة في جدول `system_configurations` عبر `/api/configurations`:
     - الأدوار والمسميات الوظيفية (`roles`)
     - الأقسام والإدارات والتخصصات (`departments`)
     - أنواع الوثائق والتراخيص (`doc_types`)
     - أنواع المقرات والمواقع (`branch_types`)
     - صفات التفويض والتوكيلات (`signatory_titles`)
2. **بنية مكون `<CreatableSelect />` القابل للإضافة الفورية:**
   - يدعم البحث السريع والفلترة الفورية مع إمكانية إضافة أي نص جديد غير موجود فوراً بزر:
     `+ إضافة "[النص]" وحفظه في التعريفات فوراً`.
   - يقوم المكون بحفظ العنصر عبر `d1Client.createConfiguration` وتحديث القائمة النشطة واختياره مباشرة في النموذج دون إعادة ضبطه أو إغلاق النافذة.

### 8.7 معيار تثبيت مؤشر الفأرة الداكن (Guaranteed SVG Dark I-Beam Cursor Pattern)
- تفادياً لمشاكل انعكاس الألوان في محركات المتصفحات وأنظمة التشغيل، يُلزم النظام باستخدام Data-URI SVG لمؤشر الكتابة في `src/index.css`:
  ```css
  html:not(.dark) input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="button"]):not([type="submit"]),
  html:not(.dark) textarea,
  html:not(.dark) [contenteditable="true"] {
    cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='24' viewBox='0 0 16 24'><path d='M5 2h6M8 2v20M5 22h6' stroke='%230f172a' stroke-width='2.2' stroke-linecap='round'/></svg>") 8 12, text !important;
    background-color: #ffffff !important;
    color: #0f172a !important;
    caret-color: #d97706 !important;
  }
  ```


