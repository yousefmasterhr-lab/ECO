# دليل المهارات والأنماط البرمجية المعتمدة (SKILLS.md)
> **المرجع التقني القياسي لمعمارية وأنماط تطوير منظومة ECO — منظومة تشغيل وإدارة الشركات (ERP Company Operations)**  
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

### 8.8 نمط التخزين والاسترجاع الدائم لمصفوفة الصلاحيات (Cloudflare D1 RBAC Persistence & Hydration)
1. **جدول `rbac_matrices` المخصص في D1:**
   - جدول مستقل يربط كل مستخدم أو دور بمصفوفة صلاحياته المفصلة:
     ```sql
     CREATE TABLE IF NOT EXISTS rbac_matrices (
       target_type TEXT,
       target_id TEXT,
       permissions_json TEXT,
       updated_by TEXT,
       updated_at TEXT,
       PRIMARY KEY (target_type, target_id)
     );
     ```
   - يدعم عمليات `UPSERT` عبر نقطة النهاية `/api/rbac`.
2. **المزامنة الحية والحقن التلقائي عند بدء التشغيل (Hydration):**
   - استدعاء `Promise.all([d1Client.fetchUsers(), d1Client.fetchRbacMatrices()])` في `AuthContext`.
   - استدعاء `d1Client.fetchRbacMatrices()` في `RBACView` عند التحميل، لضمان عدم ضياع أي تعديلات للصلاحيات عند تحديث الصفحة (F5).
   - إعطاء الصلاحيات المخزنة في D1 الأولوية المطلقة وعدم استبدالها بأي بذور أو قيم افتراضية ثابتة.

### 8.9 معيار الهوية الكهرمانية الفاخرة في النمط الفاتح (Brand Amber Light Mode Identity)
- استبدال أي تعبئة سوداء أو زيتونية داكنة في النمط الفاتح (`bg-[#0D1F17]`, `bg-[#1C291E]`, `bg-slate-900`) بتدرجات الكهرمان الدافئة:
  - **التبويبات النشطة:** `bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-md shadow-amber-500/20 font-bold`.
  - **القطاعات والبطاقات النشطة:** `bg-amber-50/90 border-2 border-amber-500 text-amber-950 shadow-sm ring-2 ring-amber-500/15 font-bold`.
  - **أزرار الحفظ والإجراءات الرئيسية:** `bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-md shadow-amber-500/20 font-bold`.
  - **مبدل الفئات (Segmented Switcher):** `bg-amber-500 text-white shadow-sm font-bold`.
  - **قوائم الاختيار `<select>`:** `bg-white text-slate-900 border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20`.

### 8.10 نمط المعاينة الحية المدمجة للوثائق وملفات الـ PDF عبر روابط الكائنات (Universal Embedded Document & PDF Blob Viewer Pattern)
1. **علاج حظر متصفحات Chromium لسلاسل Base64 PDF:**
   - متصفح Chrome والمتصفحات المبنية عليه تحظر تشغيل سلاسل `data:application/pdf;base64,...` داخل `<iframe>` / `<embed>`.
   - الحل المعياري هو تحويل السلسلة إلى ثنائي `Uint8Array` ثم إنشاء كائن `Blob` واستخراج رابط كائن `URL.createObjectURL(blob)`:
     ```typescript
     const byteCharacters = atob(base64String);
     const byteNumbers = new Uint8Array(byteCharacters.length);
     for (let i = 0; i < byteCharacters.length; i++) {
       byteNumbers[i] = byteCharacters.charCodeAt(i);
     }
     const blob = new Blob([byteNumbers], { type: 'application/pdf' });
     const blobUrl = URL.createObjectURL(blob);
     ```
2. **إدارة دورة حياة الروابط في الذاكرة (Memory Cleanup):**
   - استدعاء `URL.revokeObjectURL(blobUrl)` بشكل إلزامي داخل دالة التنظيف (Cleanup Return) لخطاف `useEffect` عند إغلاق النافذة أو تغيير الملف لمنع أي تسريب للذاكرة في المتصفح.
3. **تصميم نافذة المعاينة الموحدة (`<DocumentPreviewModal />`):**
   - استخدام عرض مريح للعين `max-w-4xl w-full` لضمان وضوح نصوص مستندات A4 الرسمية وأختام التوثيق.
   - تضمين عناصر تحكم علوية: زر "فتح في علامة تبويب جديدة" (`window.open(blobUrl, '_blank')`) وزر "تحميل الملف" المباشر بتدرج الكهرمان الرسمي.
   - تضمين إطار المعاينة التفاعلي لملفات الـ PDF مع خيارات الضبط التلقائي للعرض وشريط الأدوات:
     ```tsx
     <iframe
       src={`${blobUrl}#toolbar=1&navpanes=0&view=FitH`}
       className="w-full h-[68vh] rounded-xl border border-slate-200 dark:border-stone-700 bg-slate-100 dark:bg-stone-900 shadow-inner"
       title="معاينة المستند الرسمي"
     />
     ```
   - توفير عارض صور ضوئية عالي الدقة مع أدوات تكبير وتصغير تفاعلية (`Zoom In`, `Zoom Out`, `Reset 100%`) وتحريك التمرير عند التكبير.

### 8.11 نمط إنفاذ الهوية المؤسسية الكهرمانية والزيتونية الملكية (Official Amber & Royal Olive Brand Palette Enforcement)
1. **استبعاد ألوان الزمرد والأخضر الفاقعة (`emerald-*`, `green-*`):**
   - حظر استخدام اللون الأخضر في الأزرار الرئيسية، أزرار التحميل، هيدرات النوافذ المنبثقة، بطاقات الملفات، وشارات المرفقات.
   - حصر اللون الأخضر في المؤشرات الدلالية المتناهية الصغر فقط (نقطة اتصال الحساب أو حالة المستند الساري).
2. **الأنماط اللونية القياسية:**
   - **الأزرار الرئيسية وأزرار التحميل:**
     `bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-md shadow-amber-500/20 font-bold`.
   - **شارات المرفقات وأيقونات المستندات:**
     `bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30`.
   - **الخلفيات الداكنة الفاخرة:**
     `#07130E` و `#0D1F17` و `#0E1610` مع نصوص عاجية `#F3EFE6`.

### 8.12 محرك الحماية والتحديث القسري وتطهير الكاش التلقائي عند كل إصدار (Automated Force-Logout, Cache-Buster & Auto-Refresh Engine)
1. **ختم البناء التلقائي (`vite.config.ts` & `version.json`):**
   - توليد `BUILD_ID = Date.now().toString()` عند كل عملية بناء وحقنه برمجياً عبر `__APP_BUILD_ID__`.
   - إضافة إضافة (Vite Plugin) تقوم بكتابة ملف `version.json` داخل `public/` و `dist/`:
     ```json
     { "buildId": "1773849...", "deployedAt": "2026-10-18T..." }
     ```
   - منع التخزين المؤقت للملف نهائياً عبر ملف `public/_headers`:
     ```text
     /version.json
       Cache-Control: no-store, no-cache, must-revalidate, max-age=0
     ```
2. **مراقب نبضات النسخة في العميل (`src/services/systemUpdateService.ts`):**
   - فحص النسخة كل 25 ثانية وعند استعادة التركيز بالمتصفح (`visibilitychange` و `focus`).
   - استدعاء `/version.json?t=${Date.now()}` بهيدر `{ cache: 'no-store' }`.
   - مقارنة المعرف مع المخزن في `localStorage.getItem('eco_active_build_id')`.
3. **التنظيف الشامل وإعادة التوجيه (Hard Refresh & Force Logout):**
   - فور اكتشاف إصدار أحدث أو تغير في `security_epoch`:
     1. مسح بيانات الجلسة والمستخدم (`localStorage.removeItem('eco_auth_session')` و `localStorage.removeItem('eco_auth_user')` و `sessionStorage.clear()`).
     2. تفريغ كافة مخازن الكاش بالمتصفح عبر `window.caches`:
        ```typescript
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map(k => caches.delete(k)));
        }
        ```
     3. إلغاء تسجيل كافة Service Workers لضمان عدم تقديم أي Chunk قديم.
     4. إعادة التوجيه الفوري الإجباري:
        ```typescript
        window.location.replace('/login?reason=system_updated');
        ```
     5. استقبال المعلمة في صفحة تسجيل الدخول وعرض شريط تنبيه كهرماني فخم يوضح تحديث المنظومة وضرورة الدخول مجدداً.

### 8.13 معمارية شاشة الترحيب السينمائية ثلاثية الأبعاد بعد تسجيل الدخول (Permanent 3D Cinematic Welcome Splash Architecture)
1. **الدافع المعماري والحل الجذري (Root-Level Execution):**
   - تفادي الفك الفوري للواجهات (Zero-Delay Unmounting) عبر إخراج شاشة الترحيب من مسار الدخول وتركيبها كطبقة سينمائية عليا مستقلة على مستوى جذر التطبيق في `App.tsx` داخل طبقة `fixed inset-0 z-[99999]` تحت تحكم `AnimatePresence`.
2. **محرك الفضاء والعمق البصري ثلاثي الأبعاد (Canvas 3D Perspective Visual Engine):**
   - محاكاة حركة الفضاء والشهب المتجهة نحو الكاميرا على المحور Z باستخدام مساقط الإسقاط الهندسي المنظوري:
     ```typescript
     const k = focalLength / star.z;
     const px = cx + star.x * k;
     const py = cy + star.y * k;
     ```
   - أرضية معمارية هولوغرافية مائلة بنظام المنظور ثلاثي الأبعاد `transform: perspective(1000px) rotateX(65deg)`.
3. **الحلقات المدارية الجيروسكوبية ثلاثية الأبعاد (3D Gyroscopic Orbital Rings):**
   - 3 حلقات مدارية مركزية تدور بسرعات وزوايا متعاكسة في محاور X و Y و Z مع تأثيرات توهج كهرماني وظلال عميقة حول درع المنظومة الذهبي.
4. **تأكيد الهوية والتخصص الوظيفي وسياق المؤسسة:**
   - استعراض الاسم الكامل للمستخدم (`user.nameAr`) بتيبوغرافيا ذهبية ثلاثية الأبعاد.
   - كبسولة زجاجية تبرز المسمى الوظيفي والتخصص الدقيق (`user.jobTitleAr` / `user.roleLabelAr`) والقسم المؤسسي (`user.departmentAr`) وسياق الشركة النشطة.
   - شريط تقدم ديناميكي يكتمل خلال 3.6 ثانية مع تبديل نصوص الحالة السحابية وزر لتخطي الانتظار والدخول المباشر.
5. **إدارة الحالة والحماية السحابية:**
   - ربط الظهور بـ `sessionStorage.setItem('eco_show_welcome_splash', 'true')` داخل `AuthContext.login()`، والتنظيف عبر `completeWelcomeSplash()`.
   - عزل وحماية الشاشة من مقاطعة كاشف التحديثات `systemUpdateService`.

### 8.14 معمارية محرك الموارد البشرية السحابي (Cloudflare D1 HRMS Engine & Reactive Storage)
1. **المخطط العلائقي المتكامل (Relational Schema):**
   - تمكين 7 جداول مترابطة بمفاتيح خارجية وفهارس تسريع في Cloudflare D1 (`migrations/0005_hr_management.sql`):
     - `hr_employees`: الملف الرئيسي للكوادر والبيانات الشخصية والوظيفية والمالية.
     - `hr_contracts`: العقود وبنود العمل والبدلات وتفاصيل التأمينات.
     - `hr_attendance`: سجلات الحضور والانصراف والورديات وساعات العمل الإضافي.
     - `hr_leaves`: الإجازات الرسمية والسنوية والمرضية وأرصدتها.
     - `hr_loans`: السلف المالية وأقساط السداد وحالات الموافقة.
     - `hr_rewards_penalties`: سجل المكافآت والجزاءات والتحقيقات الإدارية.
     - `hr_payroll_runs`: سجلات مسيرات الرواتب المحتسبة والفترات المالية.
2. **التهيئة الذاتية لقاعدة البيانات (Self-Healing D1 Schema):**
   - استدعاء `ensureHrSchema(db)` عبر `functions/api/_hrDb.ts` باستخدام `db.batch([...])` لتنفيذ تعليمات `CREATE TABLE IF NOT EXISTS` و `CREATE INDEX IF NOT EXISTS` بشكل ذري وتلقائي دون الحاجة لتدخل يدوي.
3. **نقطة النهاية الشاملة (`/api/hr` Pages Functions):**
   - دعم المسارات الموحدة عبر `functions/api/hr/[[path]].ts` لعمليات `GET`, `POST`, `PUT`, `DELETE` ودعم الحفظ الذكي المدمج (`UPSERT`) باستخدام صيغة SQLite D1:
     `INSERT INTO hr_employees (...) VALUES (...) ON CONFLICT(id) DO UPDATE SET ...`
   - تسجيل مسار `api/hr` داخل دالة `isCloudflareEdgeRoute` في `src/services/apiClient.ts` لتفادي خوادم Node المحلية وتوجيه الطلبات مباشرة لشبكة Cloudflare Pages.
4. **مستودع التزامن التفاؤلي (`hrStorage.ts`):**
   - توفير قراءة فورية من الذاكرة المحلية (`hrStorage.getEmployeesSync()`) مع جلب خلفي غير متزامن من Cloudflare D1 (`hrStorage.getEmployees()`).
   - إطلاق حدث عام `eco-hr-updated` عند حدوث أي تعديل أو وصول بيانات سحابية جديدة لتحديث كافة الشاشات والقوائم بشكل تفاعلي.
5. **الربط الحي الشامل وحظر البيانات الوهمية:**
   - استبدال حقول الشركات الثابتة بمصادر البيانات الحية من `companyStorage` وفروع الشركات من `branchStorage`.
   - استخدام مكون `<CreatableSelect />` للأقسام والمسميات الوظيفية لحفظها في تعريفات النظام تلقائياً.
   - عرض حالة فارغة تنفيذية فخمة (Executive Empty State) عندما يكون عدد الموظفين 0 مع تشجيع المستخدم على إضافة أول موظف، وحظر أي كائنات وهمية في الكود.
   - اعتماد هوية الكهرمان المؤسسية (Brand Amber) لجميع الأزرار والتبويبات النشطة، وحظر الأصفار المسبقة في حقول الأجور وإخفاء أسهم الإدخال الرقمية.
   - معاينة ملفات الـ PDF والصور الضوئية للمستندات ومسوغات التعيين عبر `Blob URL` المدمجة داخل `<DocumentPreviewModal />`.






### 8.15 معمارية البنر السينمائي ثلاثي الأبعاد وبطاقات الشركات وشريط البحث الذكي (3D Hero Banner, Company Cards & Smart Search Engine)
1. **كانفاس البنر الترحيبي ثلاثي الأبعاد (Interactive 3D Parallax Canvas):**
   - تصميم كانفاس خفيف الوزن مبني بمصفوفة نقطية وجسيمات طافية مع شبكة معمارية منظوريه متحركة نحو الأفق (Moving Perspective Grid).
   - حلقتان مداريتان ثلاثيتا الأبعاد (3D Perspective Elliptical Rings) تدوران بسرعات وزوايا هندسية متعاكسة مع تفاعل حركة الفأرة (Parallax Offset).
   - تكيف لوني فوري بين النمط النهاري (Champagne Ivory with Amber Wireframes) والنمط الليلي (Obsidian Olive with Luminous Neon Gold).
2. **بطاقات الشركات المصرح بها التفاعلية (Dynamic Authorized Company Cards):**
   - استبدال النصوص المضللة المجردة (`جميع الشركات (1)`) ببطاقات تفاعلية زجاجية ثلاثية الأبعاد تُستخرج حياً من `companyStorage` و Cloudflare D1.
   - إذا كان لدى المستخدم شركة واحدة، تعرض البطاقة اسمها الحقيقي الكامل، كودها/سجلها التجاري، وشارة حالتها النشطة.
   - في حال تعدد الشركات (>1)، تظهر بطاقات الشركات متجاورة مع زر كبسولة `جميع الشركات` لتمكين المستخدم من تصفية أو تبديل سياق العمل بنقرة واحدة.
3. **شريط البحث الفائق الذكي (Supercharged Search Bar & Quick Switcher):**
   - إطار ذهبي كهرماني دوار بنظام تدرج شعاعي يعطي وميضاً انسيابياً (Animated Shimmer Border) ويتحول إلى نيون كهرماني متوهج عند التركيز `isSearchFocused`.
   - محاكاة الآلة الكاتبة في النص الإرشادي (Dynamic Typewriter Placeholder) لتدوير 3 مقترحات بحثية توجيهية دون تشويش.
   - زر اختصار واقعي ثلاثي الأبعاد `⌘ K` بنمط المفتاح الميكانيكي المضغوط.
   - قائمة منسدلة فورية للنتائج (`AnimatePresence`) تتيح الانتقال بضغطة واحدة لأي قسم فرعي أو شركة مسجلة.
4. **تهيئة القائمة الجانبية في حالة الطي الافتراضية (Default Collapsed Sidebar):**
   - بدء حالة الأقسام المفتوحة `expandedCategories` كمصفوفة فارغة `[]` عند تشغيل التطبيق لأول مرة.
   - تطهير الكلمات الإنجليزية غير المبررة مثل `(Mini-Rail)` و `ENTERPRISE`.

### 8.16 معمارية المخطط التحديثي الإلزامي للموديولات السحابية — نموذج الاستقبال والزوار (Mandatory Module Modernization Blueprint: 5-Table D1, Live Context, 3D Canvas Hero & Amber UI)
1. **تطهير البيانات الوهمية بنسبة 100% وحالات العرض الصفرية الأنيقة (Zero Mock Data & Executive Empty States):**
   - حظر أي مصفوفات أو بيانات استاتيكية وهمية.
   - عند غياب السجلات (0 سجل)، تعرض كافة مؤشرات الـ KPI الرقم `0` الحقيقي، وتظهر بطاقة الحالة الصفرية الفخمة المزودة بزر إجراء كهرماني أساسي يبدأ العمل فوراً.
2. **المعمارية السحابية متعددة الجداول على Cloudflare D1 و Pages Functions:**
   - إنشاء الجداول العلائقية آلياً عبر `functions/api/_<module>Db.ts` باستخدام مصفوفات `await db.batch([...])`.
   - توفير نقطة نهاية موحدة `functions/api/<module>/[[path]].ts` تدعم عمليات `GET`, `POST`, `PUT`, `DELETE` ومسارات التجميع الإحصائي السريع `/stats`.
   - إنفاذ الـ `UPSERT` الآمن (`INSERT INTO ... ON CONFLICT(id) DO UPDATE SET ...`) لتفادي فقدان التعديلات.
   - بناء منطق التحقق المانع للتعارضات (مثل منع التداخل الزمني لحجوزات القاعات المشتركة لنفس الفرع).
   - تسجيل المسار في `isCloudflareEdgeRoute` داخل `src/services/apiClient.ts`.
3. **التكامل الحي مع الكيانات المؤسسية (Company, Branch, HR & Dynamic Lookups):**
   - استدعاء الشركات الحقيقية من `companyStorage` والفروع المرتبطة بكل شركة من `branchStorage`.
   - ربط الأطراف المسؤولة (المضيفون، المستلمون، المشرفون) بقوائم العاملين الحقيقية في `hr_employees`.
   - دمج القوائم الذكية القابلة للإضافة الفورية `<CreatableSelect />` لحفظ أي تصنيفات أو قاعات أو شركات شحن مباشرة في جداول التعريفات السحابية.
4. **البنر السينمائي ثلاثي الأبعاد وإحصائيات المرفق الحية (3D Hero Canvas & Live Facility Metrics):**
   - دمج كانفاس تفاعلي في أعلى الموديول يعكس حالة المنشأة بشبكة منظوريه متحركة ثلاثية الأبعاد وجزيئات طافية متكيفة بين النمط الفاتح (Champagne Mesh) والداكن (Obsidian Mesh).
   - شريط مؤشرات فوري (KPI Strip) يعكس الأرقام الدقيقة لحظة بلحظة.
5. **بطاقة التصريح الرقمية ثلاثية الأبعاد (Interactive 3D Digital Access Pass):**
   - توليد رمز استجابة سريعة حقيقي (SVG QR Code عبر مكتبة `qrcode`) مشفر ببيانات التصريح الرسمية والمنشأة والمضيف.
   - نافذة عرض زجاجية فخمة ثلاثية الأبعاد تتيح طباعة التصريح رسمياً بنقرة واحدة عبر `@media print`.
6. **الشريط الأيقوني الموحد ودرج سجل التعديلات والمعاينة الحية (`Blob URL`):**
   - تزويد كل سجل بأزرار أيقونية مصغرة موحدة مع تلميحات بالعربية.
   - درج سجل التعديلات (`! Audit Log`) لعرض مقارنات تفصيلية دقيقة `من -> إلى` مع هوية المعدل والوقت.
   - عارض مدمج للمستندات والبطاقات الشخصية والخطابات عبر كائنات `Blob URL` الحية بنظام تكبير وتصغير وطباعة دون أي روابط وهمية.

### 8.17 معمارية إدارة الهوية والمستخدمين ونظام الأكورديون الفردي (IAM Architecture: Zero-Autofill, Multi-Company Access, Clean Lookups & Single-Accordion)
1. **بروتوكول حظر الملء التلقائي (Anti-Autofill Shield Protocol):**
   - حظر حقن متصفحات Chromium للبريد وكلمات المرور المحفوظة للمدير الجذري (`admin@hrsup.com`) داخل نوافذ إضافة المستخدمين الجدد.
   - تطبيق حزمة ثلاثية:
     1. تهيئة حقول الإدخال بسلاسل فارغة تماماً `""`.
     2. تعيين السمة `autoComplete="new-password"` وأسماء مدخلات فريدة (`eco_new_user_*`).
     3. تطبيق نمط القفل للقراءة حتى التركيز (`readOnly={!unlockedInputs[field]}` -> `onFocus={() => unlock(field)}`).
2. **بطاقات الهوية التنفيذية ثلاثية الأبعاد (3D Glass ID Badge Cards):**
   - هالة رقمية ملونة للأفاتار مع نبض حالة الاتصال النشط (Active/Suspended).
   - عرض نطاق الشركات المصرح بالوصول إليها (شارة `جميع الشركات` أو شارات الشركات المحددة).
   - تطهير الأرقام القومية الوهمية (`29001010100000`) واستبدالها بنص أنيق `غير مسجل`.
   - شريط إجراءات ذهبي موحد: مصفوفة الصلاحيات (RBAC)، إعادة تعيين كلمة المرور السريعة (Quick Reset Key)، سجل التعديلات التدقيقي (!)، تفعيل/تعطيل، تعديل، وحذف.
3. **نطاق الشركات المصرح بها ومقياس قوة كلمة المرور:**
   - تمكين المسؤول من منح صلاحية الوصول إما لجميع الشركات أو لشركات مختارة بدقة (`allowedCompanyIds`).
   - دمج محرك قياس قوة كلمة المرور الحي (Password Strength Meter) وزر التوليد التلقائي للرموز القوية `⚡ توليد تلقائي`.
   - إتاحة الاستيراد السريع بنقرة واحدة من كادر الموظفين (`hr_employees`).
4. **تطهير القوائم المنسدلة `<CreatableSelect />` ومزامنة الأقسام:**
   - عرض العناوين العربية المهنية الصافية فقط (`labelAr`) وتجريدها من الشروحات الإعلانية والأكواد الإنجليزية.
   - مزامنة الأقسام مع الأقسام الفعلية بالهيكل التنظيمي للمنشأة (`departmentStorage.getDepartments()`).
5. **إنفاذ نظام الأكورديون الفردي الحصري (Single-Accordion Sidebar):**
   - توسيع أي موديول في القائمة الجانبية يطوي تلقائياً الموديولات السابقة (`toggleCategoryExpand: prev.includes(catId) ? [] : [catId]`) لمنع تمدد الشاشة وتراكم القوائم.

### 8.18 معمارية محرك التعريفات والقوائم المرنة (Dynamic Configuration Engine: True D1 Persistence, Field-Diff Audit Trail, 3D Luxury Cards & ERP-Wide Sync)
1. **بروتوكول ثبات حالة البيانات ومنع إعادة البذر (True D1 State Persistence):**
   - استخدام جدول رايات التهيئة `system_init_flags` (`configurations_seeded_v5_clean`) لضمان تنفيذ بذر البيانات الافتراضية الأولية لمرة واحدة فقط في تاريخ المنظومة.
   - حظر إعادة استدعاء استعلامات البذر أو استرجاع السجلات عند طلبات `GET /api/configurations`؛ فالحالة الفعلية في D1 بعد حذف أو تعديل أي مسمى تعامل كحقيقة مطلقة غير قابلة للنقض.
2. **عمليات CRUD مطلقة وتصفير القوائم (Unrestricted CRUD & Category Wipe):**
   - إتاحة التعديل والحذف النهائي 100% لكافة المسميات دون قيود برمجية كـ `is_system`.
   - دعم تصفير وتنظيف أي قائمة تصنيف بالكامل (`DELETE /api/configurations?clearCategory=...`) مع نافذة تأكيد مزدوجة.
3. **محرك تتبع الفروق الحقيقية في سجل التعديلات (Real Field-Diff Audit Engine):**
   - مقارنة القيم السابقة بالقيم المدخلة الجديدة وحفظ الفروق المحددة (`diffs: [{ field, from, to }]`) داخل مصفوفة `audit_log_json` مع اسم المستخدم والطابع الزمني.
   - نافذة عرض منبثقة تفاعلية تستعرض الخط الزمني للتعديلات مع إبراز القيمة السابقة مشطوبة والقيمة الجديدة مميزة.
4. **الهوية البصرية الكهرمانية والترقية ثلاثية الأبعاد (3D Luxury Amber UI):**
   - بنر قيادي ثلاثي الأبعاد مع هالة عمق متحركة و4 عدادات حية من D1 (`إجمالي التعريفات`, `المسميات الوظيفية`, `الأقسام والتخصصات`, `أنواع الوثائق والمقرات`).
   - استبعاد منتقي ألوان قوس قزح والشارات الملونة الشاذة، والالتزام ببالتة الكهرمان والزيتوني الملكي في النمطين الفاتح والداكن.
   - شريط إجراءات أيقوني ذهبي لكل بطاقة: تعديل ✏️، تفعيل/إيقاف ⚡، سجل التعديلات ℹ️، وحذف نهائي 🗑️.
5. **شبكة المزامنة الشاملة عبر المنظومة (ERP-Wide Live Broadcast):**
   - بث حدث المتصفح العالمي `eco-configurations-updated` فور أي عملية تعديل أو إضافة أو حذف لتقوم كافة مكونات `<CreatableSelect />` في موديولات الشركات والموارد البشرية والاستقبال وغيرها بتحديث خياراتها تلقائياً وبشكل فوري.

### 8.19 معمارية سجل العمليات والرقابة السحابية (Audit Log Architecture: 3D Glass Cards, Brand Amber Palette & D1 Cloud Integrity)
1. **توحيد البالتة الكهرمانية والزيتونية الملكية (Brand Amber Palette Standard):**
   - حظر الخلفيات السوداء الفحمية `bg-slate-900` للأزرار النشطة في النمط الفاتح، والاعتماد الحصري على التدرج الكهرماني `from-amber-600 to-amber-500` مع ظل كهرماني وإطار ذهبي.
   - تناغم شارات العمليات والحالة مع ألوان المنظومة دون شارات بنفسجية أو زرقاء شاذة.
2. **البنر السينمائي ثلاثي الأبعاد وإحصائيات الرقابة الحية:**
   - بنر علوي بهالة منظوريه دائرية يعرض مؤشرات لحظية (`إجمالي السجلات المسجلة`, `حركات اليوم النشطة`, `حالة الأمان والنزاهة السحابية`) مع زر تحديث سحابي مباشر من `d1Client.fetchAuditLogs()`.
3. **بطاقات السجلات الزجاجية ثلاثية الأبعاد (3D Glassmorphic Log Cards):**
   - تصميم كل سجل كبطاقة زجاجية 3D بارتفاع حركي خفيف عند التحويم (`hover:-translate-y-0.5`).
   - هالة كهرمانية لأيقونة المستخدم وبيانات المنفذ وعنوان الـ IP وطابع زمني دقيق.
   - نافذة فحص منبثقة زجاجية متكاملة (`Log Inspection Modal`) تتيح معاينة تفاصيل السجل وشهادته المشفرة في سحابة D1.
4. **إنفاذ الأكورديون الفردي الحصري للقائمة الجانبية (Single-Accordion Sidebar):**
   - التأكد الصارم من أن توسيع أي موديول في السايدبار يطوي أي موديول مفتوح سابقاً تلقائياً لمنع تمدد الشاشة وتراكم القوائم.

### 8.20 معمارية التحكم في ترقيات ونشر الحافة السحابية (Cloudflare Edge Deployment Controller Architecture)
1. **توحيد البالتة الكهرمانية والزيتونية الملكية للأزرار (Harmonized Brand Amber Buttons):**
   - حظر درجات الألوان المتنافرة (البرتقالي `bg-amber-600` والأخضر `bg-emerald-600` والأسود `bg-[#1C291E]`).
   - اعتماد التدرج الكهرماني الذهبي الملكي `from-amber-600 to-amber-500` مع ظل كهرماني وإطار ذهبي للأزرار الأساسية (`بدء رفع تحديث جديد` و `بث أمر تحديث فوري`).
   - اعتماد النمط الزجاجي الكهرماني الزيتوني الراقي لزر إنهاء التحديث (`bg-amber-500/15 text-amber-900 border border-amber-500/30`).
2. **البنر السينمائي ثلاثي الأبعاد لحالة شبكة الحافة (3D Edge Hero Banner):**
   - بنر علوي فاخر بعمق منظورِي وهالات دائرية يعكس حالة شبكة الحافة ومؤشرات العقد السحابية المتصلة ووضع التحديث المباشر.
3. **بطاقات الإصدارات الزجاجية ثلاثية الأبعاد (3D Glassmorphic Deployment Cards):**
   - تصميم كل بطاقة إصدار (`إصدار المتصفح الحالي`, `إصدار السيرفر السحابي`, `حالة شاشة التحديث`) بنظام زجاجي ثلاثي الأبعاد بارتفاع وظلال ناعمة عند التحويم (`hover:-translate-y-0.5 hover:shadow-xl hover:border-amber-400/60`).
4. **حلقات التركيز الكهرمانية لمدخلات نصوص ورسائل التحديث:**
   - تطبيق `focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500` على كافة حقول النصوص والدقائق التقديرية.

### 8.21 معمارية إنفاذ الصلاحيات الحية وعزل الشركات المتعددة (Dynamic RBAC & Multi-Company Security Architecture)
1. **استرجاع وحفظ نطاق الصلاحيات والشركات الحقيقي (D1 Profile Persistence):**
   - تمرير `permissions_json` و `allowed_company_ids` وفك تشفيرها في نقاط نهاية المصادقة `login.ts` و `me.ts` وتخزينها في جلسة المستخدم `AuthUser`.
   - منع انتحال صفة مدير النظام: قصر صلاحيات الـ Root Admin حصراً على الحساب الجذري الحقيقي وعدم استبدال بيانات المستخدمين الفعليين (مثل `تغريد عاطف`).
2. **عزل الشركات المتعددة على مستوى الـ Context (Tenant Isolation Layer):**
   - ربط `TenantContext` بـ `useAuth()` لتقييد مصفوفة `companies` بـ `user.allowedCompanyIds`.
   - المستخدم المقيد بشركة واحدة يرى فقط تلك الشركة في الهيدر والبانر وكافة موديولات المنظومة.
### 8.22 معمارية تطهير العناوين وبث التحديثات الحية وتأمين القوائم العلوية (Clean Titles Sanitization, Zero-Refresh Event Mesh & Header Action Security)
1. **دالة التطهير الموحدة `cleanArabicTitle()` (`src/types/rbac.ts`):**
   - تحويل كافة الشرطات السفلية (`_`) إلى مسافات نظيفة.
   - استئصال كافة الوسوم والاختصارات التقنية الدخيلة (`(C-Suite)`, `(CFO)`, `(HRD)`, `(HRMS)`, `(ATS)`, `(CTS)`).
   - استخدام الدالة في تخزين واسترجاع وعرض المسميات في كافة الموديولات (المستخدمين، التعريفات، القوائم المنسدلة).
2. **شبكة بث وتلقي الأحداث الحية دون ريفريش (Zero-Refresh Event Mesh):**
   - بث `eco-data-updated` عند أي تعديل للمستخدمين أو التعريفات أو الشركات أو الفروع أو السجلات.
   - استماع المكونات المشتركة (`EmptyCanvas`, `CreatableSelect`, `ConfigurationView`) للأحداث وتحديث العدادات والخيارات فورياً في الذاكرة دون الحاجة لـ F5/Reload.
3. **خريطة الصلاحيات الشاملة للأقسام الـ 12 (`SUBMODULE_VIEW_PERMISSION_MAP`):**
   - خريطة مركزية لجميع المعرفات الفرعية (Sub-item IDs) عبر كافة الموديولات.
   - تطبيق فلترة حتمية في `SidebarItem.tsx`: حجب أي قسم فرعي غير مصرح، وإخفاء الموديول كلياً إذا كان رصيد عناصره المصرحة 0.
4. **حجب إجراءات الإدارة في القائمة العلوية للمستخدم (Account Dropdown Menu Security):**
   - التحقق الصارم من صلاحية `settings.rbac.edit` أو `settings.view` أو الحساب الجذري قبل عرض زر `إدارة المستخدمين ومصفوفة الصلاحيات` في الهيدر، وحجبه كلياً عن أي مستخدم عادي أو مقيد.

### 8.23 معمارية النافذة الشاملة لمصفوفة صلاحيات الـ 12 موديول (Complete 12-Module RBAC Permissions Modal Architecture)
1. **هيكلية النافذة المنبثقة التفاعلية (`PermissionsManagerModal.tsx` / `UserPermissionsModal.tsx`):**
   - استيعاب كامل موديولات منظومة ECO ERP الـ 12 عبر شريط تنقل يمين متجاوب مع مؤشرات إنجاز وعدّادات مباشرة لكل موديول (`active / total`).
   - جدول مصفوفة الإجراءات الحبيبية لجميع التبويبات الفرعية بأعمدة: `عرض` (👁️)، `إضافة` (➕)، `تعديل` (✏️)، `مرفقات/حالة` (📎)، `السجل (!)` (ℹ️)، و `حذف` (🗑️).
   - إمكانية التحديد الفوري على مستوى السطر (Row Checkbox)، التحديد السريع لكامل القسم (Toggle Module)، أو التحديد/الإلغاء الشامل لكامل المنظومة (Select/Clear All).
2. **محرك الصلاحيات والربط المنطقي (`AuthContext.tsx`):**
   - دعم بادئات مفاتيح الصلاحيات المختصرة عبر `prefixMap` وخريطة `SUBMODULE_VIEW_PERMISSION_MAP` لضمان عمل `checkModuleAccess` و `hasPermission` بدقة مطلقة دون استثناءات وهمية أو حظر مسبق لغير الجذر.
   - مزامنة فورية مع قاعدة بيانات Cloudflare D1 عبر `d1Client.updateUserPermissions` مع بث الحدث العام `eco-data-updated`.
3. **التصميم ثلاثي الأبعاد الموحد ببالتة الكهرمان والزيتوني الملكي:**
   - شريط تقدم ديناميكي بالنسبة المئوية، أزرار حفظ وإلغاء كهرمانية فاخرة، هالات تفاعلية عند التحويم، وتوافق تام بين النمطين الفاتح والداكن.

### 8.24 معمارية الحفظ الدائم للتعريفات بدون إعادة حقن (D1 Configurations Persistence Engine & Permanent CRUD Architecture)
1. **منع إعادة الحقن التلقائي للبذور (No Auto-Re-Seeding via `system_init_flags`):**
   - استخدام جدول أعلام التهيئة `system_init_flags` بمفتاح فريد `configurations_seeded_v5_clean`.
   - يتم التحقق من وجود العلم في أول استدعاء فقط، وإذا وجد لا يتم إدراج أو تحديث أي بذور افتراضية في استعلامات `GET /api/configurations`.
   - احترام تعديلات وحذف المستخدمين بشكل دائم وأبدي.
2. **الحذف الحقيقي القطعي (100% Real CRUD without System Lock):**
   - إلغاء القفل البرمجي القديم `is_system === 1` الذي كان يحول الحذف إلى إيقاف مؤقت.
   - دعم الحذف المباشر `DELETE FROM system_configurations WHERE id = ?`.
   - دعم تصفير التصنيف بالكامل `DELETE /api/configurations?clearCategory=...`.
3. **محرك تدقيق التغييرات الفارق (Audit Log Diff Engine):**
   - في معالج `PUT /api/configurations`: مقارنة السجل الحالي مع البيانات المرسلة وتوليد مصفوفة فروق دقيقة `diffs: [{ field, from, to }]`.
   - حفظ سجل التدقيق في عمود `audit_log_json` وعرضه في نافذة تدقيق فاخرة بضغطة واحدة على زر `!`.
4. **الواجهة الفاخرة ثلاثية الأبعاد والتطهير البصري:**
   - بنر قيادة ثلاثي الأبعاد مع عدادات حية من D1.
   - شريط إجراءات ذهبي بالأيقونات فقط (✏️، ⚡، ℹ️، 🗑️) بدون نصوص زائدة أو وسوم تقنية (`SYSTEM`, `SUPER_ADMIN`).
   - استئصال نقاط الألوان الثمانية (Rainbow dots) واعتماد هوية الكهرمان والزيتوني الملكي.

### 8.25 معمارية حوكمة الملف الشخصي والربط الصارم للصلاحيات الحبيبية (Profile Governance & Strict Granular RBAC Enforcement)
1. **قفل البيانات الوظيفية والإدارية في الملف الشخصي (`UserProfileModal.tsx`):**
   - عرض المسمى الوظيفي المعتمد والإدارة كبطاقات مقفلة للقراءة فقط تحمل شارة `معتمد ومحمي` وأيقونة قفل ذهبية.
   - حظر تعديل المسمى أو الإدارة من الملف الشخصي الذاتي، وحصر صلاحية التعديل على مديري النظام عبر شاشة إدارة المستخدمين.
   - قصر التعديل الذاتي على الاسم الكامل القانوني، والبريد الإلكتروني المؤسسي، ورقم الهاتف المحمول.
2. **السلطة الحصرية لمصفوفة الصلاحيات في العرض والتنقل:**
   - منع الالتفاف عبر `allowedModuleIds`: عند وجود `user.permissions`، تكون هي المرجع الحصري الوحيد لمنح أو حجب الموديولات والتبويبات.
   - حجب الموديولات غير المصرح بها بالكامل وتصفير عداداتها الحية على اللوحة الرئيسية والقائمة الجانبية.

### 8.26 معمارية التحديث اللحظي للصلاحيات ومزامنة الجلسات بدون ريفريش (Zero-Refresh Reactive RBAC & Instant UI Re-Gating Architecture)
1. **بروتوكول شبكة الأحداث الحية الموحدة (`eco-permissions-updated` Event Protocol):**
   - تعريف حدث المتصفح الموحد `ECO_PERMISSIONS_UPDATED_EVENT` في `src/types/rbac.ts` مع دالة البث `dispatchPermissionsUpdate`.
   - تمرير حمولة تفصيلية دائمة `{ userId, permissions, user }` لضمان تعرف الجلسة فورياً على التعديلات.
2. **التحديث المتزامن لجلسة المستخدم النشطة (`currentUser` Instant State Dispatch):**
   - تحديث دالتي `setUser` و `setManagedUsers` داخل `AuthContext.tsx` بشكل متزامن لحظي في الذاكرة مع الحفظ في `localStorage` و `sessionStorage`.
   - لا ينتظر تحديث الواجهة طلبات الشبكة أو التخزين السحابي D1، بل ينعكس في نفس جزء الثانية.
3. **إعادة البوابات التلقائية لكافة الموديولات (Automatic UI Re-Gating):**
   - نظراً لاعتماد `hasPermission()` و `checkModuleAccess()` على `user` في `AuthContext`، يؤدي تحديث الحالة إلى إعادة توليد الدوال فورياً.
   - يعاد تصيير (`Re-render`) كافة المكونات التابعة (`Sidebar.tsx`, `SidebarItem.tsx`, `EmptyCanvas.tsx`, `CompaniesModule.tsx`، وحراس المسارات وأزرار الإجراءات) وتُقفل أو تُفتح التبويبات والموديولات في التو واللحظة دون أي إعادة تحميل للصفحة (`Zero Refresh`).
4. **المزامنة العابرة لعلامات التبويب (`BroadcastChannel` Multi-Tab Sync):**
   - إنشاء قناة بث `BroadcastChannel('eco_rbac_channel')` ومستمع لأحداث التخزين `storage` لمزامنة كافة علامات التبويب المفتوحة للمستخدم أو للموظفين في نفس المتصفح دون ريفريش.

### 8.27 معمارية البوابات الصارمة الخالية من التراجع للأدوار والتصفية المطلقة للقائمة واللوحة الرئيسية (Pure RBAC Module Access Gating & Zero-Role Fallback Architecture)
1. **استئصال كافة التراجعات الصلبة للأدوار (Zero Hardcoded Role Fallbacks):**
   - حظر أي حقن لصلاحيات أو موديولات افتراضية للمستخدمين العاديين عند خلو الصلاحيات (`user.permissions || []`).
   - إلغاء الاعتماد على `config.allowedModuleIds.map(m => `${m}.*`)` أو مصفوفات الأدوار، وحصر مصفوفة الصلاحيات الحية كمصدر دستوري أوحد لحقوق المستخدم.
2. **المحرك المركزي لفحص بوابات الموديولات (`hasModuleAccess`):**
   - تعريف ودعم دالة `hasModuleAccess(user, moduleId)` في `src/types/rbac.ts`.
   - تغطية كافة البوادئ للمنظومات الـ 12 بنظاميها المنقط (`comp.`, `hr.`, `ats.`, `fin.`, إلخ) والشُرطي (`comp_`, `hr_`, `ats_`, `fin_`, إلخ) مع المطابقة المباشرة للموديول.
   - تجاوز الوصول فقط للمدير العام الخارق أو وجود صلاحية النجمة البرمجية `*`.
3. **عزل القائمة الجانبية في سطح المكتب والموبايل (`Sidebar.tsx`):**
   - تصفية مصفوفة `categories` بنظام `useMemo` عبر `hasModuleAccess(user, category.id)`.
   - قصر عناصر القائمة المعروضة على الموديولات المصرح بها فعلياً، وحجب باقي الموديولات تماماً من شاشة الموظف.
4. **عزل كروت اللوحة الرئيسية والعداد العلوي (`EmptyCanvas.tsx`):**
   - تصفية كروت الشاشة الرئيسية بدقة متناهية (`visibleCards`) وحساب عدد المنظومات المتصلة بناءً عليها فقط (`visibleCards.length`).
   - ظهور موديول الشركات فقط للمستخدم المقيد مثل تغريد (1 منظومة متصلة بدلاً من 3).
5. **معايير العناوين وتأمين الترويسة:**
   - تصحيح أي أخطاء إملائية موروثة مثل "موادر" إلى "موارد" تلقائياً عبر `cleanArabicTitle()`.
   - منح حاوية الشعار الفرعي في الترويسة `min-w-[190px] whitespace-nowrap` لمنع أي قص في عبارة `ERP Company Operations`.

### 8.28 معمارية منظومة التأمينات الاجتماعية والاستمارات الرسمية س1/س2/س6 (Social Insurance & Official Forms Engine Architecture)
1. **البنية السحابية العلائقية في Cloudflare D1 (`functions/api/_insuranceDb.ts` & `functions/api/insurance/[[path]].ts`):**
   - إدارة 5 جداول علائقية متكاملة:
     - `ins_operations`: سجل العمليات التأمينية وكشف التكرار التلقائي (`مكرر`).
     - `ins_employees`: السجل التأميني للعاملين، الأجور التأمينية والشاملة، المهن وكود المهنة، والمرفقات الممسوحة ضوئياً.
     - `ins_forms`: أرشيف الاستمارات الرسمية المولدة والمعتمدة (`س1`, `س2`, `س6`) مع بيانات JSON الكاملة ونسخ الاستمارات الموقعة.
     - `ins_remittances`: حوافظ التوريد الشهرية وإيصالات السداد للهيئة القومية للتأمين الاجتماعي.
     - `ins_compliance`: قوائم الفحص الدوري ومؤشرات الامتثال التأميني.
   - تنفيذ إنشاء الجداول والفهارس دفعة واحدة عبر `await db.batch([...])` لتجنب حدود استدعاءات D1، مع دعم الحفظ المفرد والجماعي (`Bulk Import`) وتوليد `audit_log_json` تلقائياً عند كل تعديل.
2. **محرك الاستمارات الرسمية التفاعلي على الورقة مباشرة (`OfficialFormsCenterView.tsx`):**
   - تثبيت أبعاد لوحة الاستمارة على مقاس A4 القياسي (`794px × 1123px`) للوجه الأمامي والظهر مع حظر قوائم الإدخال الرأسية المنفصلة (45 حقل) وجعل الورقة الرسمية نفسها هي ساحة الإدخال المباشر.
   - بناء مكون المربعات الرقمية المقسمة التفاعلية (`InteractiveCaroBoxes`) الذي يرسم خانات مستقلة قابلة للنقر والكتابة واللصق والانتقال التلقائي لكل رقم (الرقم القومي 14 خانة، الرقم التأميني 8/9 خانات، رقم المنشأة، وتواريخ الاشتراك والانتهاء) ومربعات التأشير التفاعلية (`[✓]`).
   - تزويد يمين الاستمارة بـ **لوحة التحكم الذكية (`Smart Right-Hand Control Panel`)** لاختيار `صفة مقدم الطلب` (`صاحب العمل` من بيانات الشركة، `المفوض / الوكيل` من `signatoryStorage`، أو `المؤمن عليه (مستفيد)` من بيانات العامل المختار) واختيار `الفئة` (`1` / `2` / `3`) وإرفاق النسخة الموقعة (`Blob URL`).
   - تزويد أسفل الشاشة بـ **شريط التحكم الزجاجي العائم (`Floating Bottom Glass Dock`)** المزود بقوائم بحث فورية للشركات والموظفين وأزرار التفريغ والمعاينة وضبط الإحداثيات والإرسال المباشر لمركز العمليات والطباعة الرسمية بدقة A4.
3. **الترتيب التشغيلي الذكي والربط مع الموارد البشرية والشركات والـ RBAC (`InsuranceModule.tsx` & `Sidebar.tsx`):**
   - ترتيب الأقسام الفرعية الخمسة ومزامنة روابطها بين السايدبار والموديول:
     1. `لوحة التحليلات والامتثال` (`ins_analytics` — التبويب الافتراضي)
     2. `مركز الاستمارات (س1 / س2 / س6)` (`ins_forms`)
     3. `مركز العمليات التأمينية` (`ins_operations`)
     4. `جداول الموظفين (السجل التأميني)` (`ins_register`)
     5. `وعاء الأجور والاشتراكات` (`ins_wages`)
   - استيراد ومزامنة العاملين بنقرة واحدة من سجل الموارد البشرية (`hrStorage`) مع المطابقة الذكية بالرقم القومي (14 رقماً).
   - حساب الاشتراكات القانونية تلقائياً (حصة العامل `11%`، حصة المنشأة `18.75%`، الإجمالي `29.75%` مع مراعاة الحد الأدنى `2,300 ج.م` والحد الأقصى `14,500 ج.م` القابلين للضبط).

### 8.29 معمارية الهيكل التنظيمي والشجرة الذهنية التفاعلية بتصميم NotebookLM (Interactive Mind-Map Tree & Org Structure Architecture)
1. **شريط الأوامر التنفيذي المزدوج (2-Tier Glassmorphic Command Bar):**
   - تنظيم علوي فسيح يفصل بين ترويسة الشاشة ومؤشرات الحالة الحية (`إجمالي الوحدات الإدارية` | `المستويات الهيكلية`)، وأزرار الانتقال الثنائي بين `البطاقات الذكية` و `الشجرة الذهنية التفاعلية`، وأزرار التأسيس السريع.
   - الطابق الثاني يحتوي على بحث حي مع زر مسح سريع، وشريط كبسولات لاختيار مستوى العمق الهيكلي (`كل المستويات`، `المستوى 1: الإدارة العليا`، `المستوى 2: الإدارات التنفيذية`، `المستوى 3: الأقسام الفرعية`، `المستوى 4: المهام والاختصاصات`) وأزرار فتح/طي كافة الفروع الشجرية.
2. **محرك الشجرة الذهنية التفاعلية الأفقية (`OrgMindMapTree.tsx`):**
   - خوارزمية هندسية لحساب المواقع الرأسية والأفقية للعقد (`X`, `Y`) استناداً إلى عمق الشجرة وحجم الفروع التابعة مع توسيط كل عقدة أباً تلقائياً بين أبنائها.
   - دعم التبديل الفوري لاتجاه الشجرة بين التدفق من اليسار لليمين (LTR) المشابه لـ NotebookLM أو من اليمين لليسار (RTL).
   - رسم خطوط الربط المنحنية التكعيبية عبر مسارات SVG ملساء:
     `d="M startX startY C midX startY, midX endY, endX endY"`
     مع تلوين متدرج طبقي بحسب المستوى (الكهرمان الذهبي L0->L1، البرونزي التركوازي L1->L2، والزمردي L2->L3) وتأثير التوهج (`filter="url(#lineGlow)"`).
   - لوحة سحب وتكبير تفاعلية (Pan & Zoom Canvas) بعجلة الماوس والسحب، مصحوبة بأزرار عائمة أسفل اليسار للتكبير والتصغير وتوسيط الشجرة بالكامل بنقرة واحدة (`Compass`).
   - كروت زجاجية فاخرة (`bg-[#10241A]/95 backdrop-blur-md`) لكل إدارة تحمل الكود التنظيمي، مركز التكلفة، المسمى العربي والإنجليزي، واسم المدير وعدد العاملين، وزر دائري أنيق للطي والتوسيع (`<` / `>`)، وشريط إجراءات ذهبي عائم عند التحويم للإضافة والتعديل والتدقيق والحذف.
3. **الهيكل القياسي المتكامل لشركات المقاولات (4-Level Contracting Enterprise Hierarchy):**
   - قاعدة بيانات مدمجة للهيكل القياسي المعتمد لشركات المقاولات تضم:
     - المستوى 0: المالك والرئيس التنفيذي (Owner & CEO)
     - المستوى 1: 8 إدارات عليا (PMO، المراجعة الداخلية، المستشار القانوني، QHSE، المشروعات الهندسية، الموارد البشرية، المدير المالي CFO، سلاسل الإمداد والمشتريات).
     - المستوى 2 و 3: 25+ قسماً تخصصياً ووحدة عمل (التسعير، الشوب دروينج، حسابات المستخلصات، العقود، والتأمينات الاجتماعية).
   - زر التأسيس الفوري (`⚡ تحميل الهيكل القياسي المتكامل`) ينفذ إدراجاً مجمعاً دفعة واحدة عبر `env.DB.batch(...)` مع الحفظ المحلي الفوري والمزامنة مع Cloudflare D1 دون الحاجة لتحديث الصفحة (`Zero-Refresh Live CRUD`).

### 8.30 معمارية الضبط الجراحي للهيكل التنظيمي: محدد العرض الثلاثي، محرك التطهير الذاتي، وضع المسودة للمعاينة، والتوافق اللوني التام (Org Structure Surgical Refinement: 3-Way Switcher, Deduplication Engine, Draft/Confirm Mode & Complete Light/Dark Harmony)
1. **محدد العرض الثلاثي التنفيذي (3-Way Segmented View Switcher):**
   - تقديم خيارات العرض الثلاثة جنباً إلى جنب في شريط علوي أنيق دون استبعاد أي نمط:
     1. 📇 **البطاقات الذكية (`cards`)**: بطاقات شبكية تفصيلية للإدارات، مراكز التكلفة، والمسؤوليات.
     2. 🏛️ **الشكل الهرمي (`hierarchy`)**: الهرم الرأسي الكلاسيكي مع مسارات الربط الهندسية للأبناء (`OrgTreeNode`).
     3. 🧠 **الشجرة الذهنية التفاعلية (`mindmap`)**: الشجرة الأفقية المفتوحة بتصميم NotebookLM ولوحة السحب والتوسيط.
   - حذف شريط البحث النصي الفائض لتوفير رحابة بصرية وتنظيف شريط الأوامر.
2. **محرك التطهير الذاتي والتفرد (Deduplication Engine):**
   - منع تكرار العقد برمجياً وتجميعها عبر المفتاح المركب `(companyId + '::' + nameAr)`.
   - الاحتفاظ بالسجل الأكمل واختياره معيارياً ثم حذف السجلات المكررة دفعة واحدة من التخزين المحلي وقاعدة بيانات Cloudflare D1 عبر `DELETE ... WHERE id = ?`.
   - إعادة توجيه كافة التبعيات (`parentId`) آلياً إلى المعرف المعياري الصامد لمنع أي انقطاع في شجرة التبعية.
3. **وضع المسودة والمعاينة المؤقتة (Draft / Confirm Template Mode):**
   - عند النقر على `⚡ تحميل الهيكل القياسي`، يتم توليد مسودة حية دقيقة تتكون من **34 وحدة تشغيلية معتمدة** في الذاكرة الحية (`isDraft: true`) دون كتابتها في قاعدة البيانات.
   - إظهار بنر كهرماني فاخر في أعلى الشاشة يوضح حالة المسودة ويوفر زرين واضحين:
     - 💾 `اعتماد وحفظ الهيكل في المنظومة`: ينفذ مسح التكرارات وتثبيت الهيكل عبر `POST /api/departments` مع `resetHierarchy: true`.
     - ✖️ `إلغاء المسودة`: تفريغ المسودة والعودة الفورية للحالة السابقة دون أي أثر جانبي.
   - المعادلة المعتمدة لـ 34 وحدة:
     $$1 \text{ (CEO)} + 4 \text{ (PMO)} + 4 \text{ (Audit)} + 4 \text{ (Legal)} + 3 \text{ (QHSE)} + 6 \text{ (Eng)} + 5 \text{ (HR)} + 3 \text{ (CFO)} + 4 \text{ (SCM)} = 34 \text{ وحدة}$$
4. **التوافق اللوني التام للنمطين الفاتح والداكن (Light & Dark Theme Perfection):**
   - دعم كامل للنمط الفاتح بأرضية عاجية دافئة (`bg-[#FAF7F0]`) وشبكة نقاط كهرمانية هادئة وكروت ناصعة (`bg-white/95 border-amber-500/25 text-slate-900 shadow-md`).
   - خطوط ربط ملونة بدرجات البرونز والكهرمان والأخضر الداكن (`#b45309`, `#0f766e`, `#059669`) متناغمة مع النمطين.
   - ضبط أبعاد كروت الشجرة الذهنية على `260px` عرضاً و `82px` ارتفاعاً مع مسافة رأسية مريحة (`UNIT_H = 108`) لمنع أي تداخل بين الفروع المتجاورة.

### 8.31 معمارية التوسيط التلقائي للشجرة الذهنية، التحكم الأيقوني العائم، وقائمة المستويات الزجاجية (Mind Map UX Mastery: Auto-Pan Centering on Expand, Icon-Only Floating Dock & Luxury Level Dropdown Architecture)
1. **التوسيط التلقائي السلس عند فتح الفروع (Smart Auto-Centering on Expand via Ease-Out Cubic):**
   - عند توسيع أي فرع (`isCollapsed: true -> false`) في `OrgMindMapTree.tsx`، يتم استدعاء دالة `handleToggleNode(nodeId)`.
   - يتم حساب نقطة المنتصف الهندسية $(X_c, Y_c)$ للكتلة الشجرية المفتوحة المكونة من العقدة الأب وأبنائها الجدد مع مراعاة اتجاه التدفق (LTR أو RTL) وإضافة إزاحة توجيهية (Bias Offset $\pm 70\text{px}$) نحو اتجاه التوسع.
   - تشغيل محرك تحريك سلس للكانفاس `animatePanTo(targetX, targetY, 450)` باستخدام `requestAnimationFrame` ودالة تسارع تكعيبية مخففة (Ease-out Cubic Interpolation: $1 - (1 - t)^3$).
   - ربط كروت العقد ومسارات التوصيل المنحنية بانتقال سلس `transition-all duration-500 ease-out` لانسياب حركة الشجرة عند إعادة تموضع الفروع.
2. **شريط التحكم الزجاجي العائم الدائري بالأيقونات فقط (Icon-Only Floating Glass Dock):**
   - التخلص التام من الأزرار النصية لـ `[فتح الكل]` و `[طي الكل]` من شريط الأدوات العلوي لتوفير مساحة رأسية نظيفة.
   - نقل الإجرائين إلى شريط التحكم العائم الزجاجي السفلي (`mindmap-controls`) كأيقونات دائرية فاخرة (`UnfoldHorizontal` و `FoldHorizontal`) بحجم `w-8 h-8 rounded-full` مع تلميح عائم عند التحويم ونمط زجاجي بيضاوي كامل (`rounded-full px-3 py-1.5 shadow-2xl`).
3. **القائمة المنسدلة الزجاجية الفاخرة لفلترة المستويات (`LevelFilterDropdown`):**
   - استبدال صف الأزرار الخمسة العريض بقائمة منسدلة فاخرة مضغوطة (`h-9`) بجانب محدد الشركات في الطابق الثاني.
   - زر التفعيل يعرض اسم المستوى المختار، نقطة بلون كهرماني نابض، وسهم chevron دوار.
   - لوحة الخيارات منبثقة بتأثيرات Framer Motion وتحتوي على المستويات الـ 5 مع أيقوناتها وعناوينها الفرعية وشارة التأشير النشط (`✓`) مع إغلاق تلقائي عند النقر خارجها.

### 8.33 معمارية استقطاب الكفاءات والتحويل اللحظي للموارد البشرية والتأمينات ومحرك الأتمتة (ATS & Core HR/Insurance Unified Architecture & Global Automation Engine)
1. **المعمارية الخماسية لمنظومة استقطاب الكفاءات (`src/components/modules/ats/`):**
   - **`ATSAnalyticsTab.tsx` (لوحة مؤشرات التوظيف):**
     - قياس معدلات الأداء الرئيسية: متوسط زمن التعيين (Time-to-Hire)، تكلفة التعيين (Cost-per-Hire)، نسبة قبول العروض، والتعيينات المعتمدة.
     - قمع التحويل التوظيفي التفاعلي (Recruitment Funnel) مع حساب نسب الانتقال بين المراحل ومتوسط أيام البقاء.
     - تحليل قنوات الاستقطاب ومقارنة أداء مسؤولي التوظيف.
     - التصدير التفاعلي السلس إلى Excel عبر `exceljs` مع إطلاق احتفال الـ Confetti.
   - **`ATSJobsTab.tsx` (إدارة الشواغر والوظائف):**
     - إدارة دورة حياة الشواغر: مسودة، منشور، مكتمل، مؤرشف.
     - إنشاء شواغر جديدة بربط فوري مع الشركات المتعددة (`company_id`)، الإدارات، نطاقات الرواتب، والمهارات المطلوبة.
   - **`ATSPipelineTab.tsx` (مسار التوظيف والكانبان التفاعلي):**
     - لوحة كانبان تفاعلية بـ 8 مراحل عبر HTML5 Native Drag & Drop فائق السرعة والانسيابية.
     - بطاقات مرشحين ذكية تعرض نسب المطابقة الذكية الملونة وسنوات الخبرة والتقييم بالنجوم.
     - درج تفصيلي للمرشح مع فحص السيرة الذاتية المستخرجة، الملاحظات الداخلية، والإجراءات السريعة.
   - **`ATSCandidatesTab.tsx` (قاعدة بيانات المرشحين والمواهب):**
     - جدول شامل لجميع المتقدمين مع فلاتر المراحل والبحث المتعدد.
     - بطاقة تفصيلية لفحص المؤهلات ووسائل التواصل وسجل التحركات.
   - **`ATSOffersTab.tsx` (عروض العمل وتعيين الموظف):**
     - صياغة خطابات عروض العمل الرسمية بتفاصيل الحزمة المالية المصرية (أساسي، سكن، انتقال، بدلات).
     - محاكاة التوقيع الرقمي للمرشح عبر كانفاس الرسم التفاعلي المباشر.
     - قائمة مسوغات التعيين (Preboarding Checklist) المعتمدة.
2. **الزر الذهبي الثلاثي الأبعاد للتحويل اللحظي بنقرة واحدة (`1-Click Core HR & Insurance Conversion`):**
   - استدعاء `atsStorage.syncCandidateToCoreHR(offerId)` عند اعتماد العرض:
     - إنشاء وتخزين سجل موظف معتمد في `hrStorage.saveEmployee(hrEmp)` مع توليد الكود الوظيفي `ECO-YYYY-XXX`.
     - إنشاء وتخزين سجل تأميني مطابق في `insuranceStorage.saveEmployee(insEmp)` لمركز العمليات واستمارة س1.
     - تحديث العرض إلى `synced_to_core_hr` والمرشح إلى `hired`.
     - بث الأحداث اللحظية `eco-hr-updated` و `eco-insurance-updated` و `eco-ats-updated` لتحديث شاشات المنظومة فوراً دون إعادة تحميل الصفحة (Zero-Refresh).
3. **محرك الأتمتة وسير العمل الذكي في الإعدادات (`AutomationEngineView.tsx`):**
   - واجهة بصرية مرنة لإدارة قواعد الأتمتة عبر مختلف قطاعات المنظومة (ATS, HR, Companies, Insurance).
   - نموذج بناء القواعد: المحفز (Trigger) -> الشروط (Conditions) -> الإجراءات (Actions).
   - محاكي تشغيل واختبار فوري وسجل تدقيق رقابي لحظي في Cloudflare D1.

4. **بوابة التوظيف العامة ومولد روابط التتبع الذكية (`PublicCareersPortal.tsx` & `ATSPortalTab.tsx`):**
   - **مسار عام بدون جدار تسجيل الدخول (`/careers` أو `?portal=careers`):**
     - في `AppContent`، كشف فوري لمسار بوابة التوظيف وتقديم واجهة التقديم العامة المتكاملة بدون أي تحويل لـ `/login`.
     - دعم كامل لتبديل اللغة (عربي / English) والنمطين (نهاري / ليلي).
     - معالجة طلبات المتقدمين مع رقم مرجعي رسمي `APP-YYYY-XXXXXX` واحتفال الـ Confetti.
     - مزامنة فورية إلى `atsStorage.saveCandidate` وبث الحدث `eco-ats-updated`.
   - **التبويب السادس في المنظومة (`ATSPortalTab.tsx`):**
     - مولد روابط ذكية (UTM Link Generator) بدعم 8 قنوات: LinkedIn, Indeed, Bayt.com, X/Twitter, Meta, WhatsApp, Referrals, Direct.
     - معاينة تفاعلية حية بإطارين (سطح المكتب والهاتف الذكي).
     - إحصائيات فورية لمعدلات تدفق المتقدمين حسب القناة التسويقية.
   - **نظام زجاج العاج الفاخر في الترويسة العلوية (`Header.tsx`):**
     - خلفية: `bg-[#FFFDF9]/90 dark:bg-[#07130E]/90 backdrop-blur-xl`.
     - حدود كهرمانية ذهبية: `border-amber-200/50 dark:border-amber-500/20`.
     - نصوص وأيقونات عالية الوضوح: `text-slate-900` في النهاري و `text-stone-100` في الليلي.













5. **معمارية منظومة إدارة المراسلات والمشاريع الهندسية (PCMS / CTS Architecture & D1 Engine):**
   - **المحرك الذري للترقيم التسلسلي المقفل (`reserveAtomicOfficialSerial`):**
     - نقطة نهاية مركزية ذرية `POST /api/cts/counters/reserve` داخل Cloudflare D1 مع حماية المعاملات ضد التزامن (`BEGIN IMMEDIATE`).
     - توليد الرقم الرسمي فقط عند الاعتماد النهائي: `[Project_Code]-[Originator]-[Recipient]-[Doc_Type]-[Year]-[Serial]` (مثل: `1233-CON-CTR-LTR-26-0045`).
     - استخدام أرقام المسودات المؤقتة أثناء التحرير والتدقيق (`DRAFT-XXXX`).
   - **درع منع التكرار الاستباقي للوارد (`Inbound Anti-Duplicate Shield`):**
     - في `InboundEntryModal.tsx`، فحص ثلاثي فوري متزامن لحظة كتابة الرقم الإشاري: تطابق `(project_ref + external_ref_no + sender_entity)`.
     - عرض بطاقة تحذيرية حمراء مشعة برقم المعاملة السابقة وتاريخ استلامها وقفل زر الحفظ لحماية السجل الرسمي من الازدواجية.
   - **محرك الشجرة التفاعلية لدورة المراسلات (`CorrespondenceCycleVisualizer.tsx`):**
     - تتبع مرئي لعلاقات `parent_doc_id` لبناء شجرة زمنية لمراحل الخطاب والردود والمرفقات.
     - توليد وطباعة رمز الباركود الرقمي المعتمد QR عبر `DocumentQRCode.tsx`.
     - تصدير سجل المراسلات الشامل بصيغة Excel ملونة ومنسقة عبر `excelExport.ts`.
   - **التبويبات التشغيلية الخمسة المتخصصة في `CTSModule.tsx`:**
     - 📊 `cts_overview`: لوحة المؤشرات وحساب سرعة الرد ومتوسط زمن الإغلاق.
     - 📜 `cts_correspondences`: سجل المراسلات العام الموحد مع محرك الفلترة المتعددة والبحث الشامل وتصدير Excel.
     - 📥 `cts_inbound`: منصة قيد واستلام المكاتبات الواردة مع فحص التكرار والمرفقات الممسوحة ضوئياً.
     - 📤 `cts_outbound`: إعداد واعتماد الخطابات الصادرة ومسودات الرد ومراسم الاعتماد التسلسلي الذري.
     - 🛡️ `cts_audit`: سجل التدقيق والامتثال الأمني غير القابل للتعديل مع تفاصيل التغييرات ومقارنة القيم.

6. **إعادة التوطين المعماري لدليل المشاريع للمكتب الفني والنقاء التام من البيانات الوهمية (Technical Office Directory & Zero-Mock Standard):**
   - **التوطين المعماري لدليل المشاريع والجهات والشركاء (`eng_projects`):**
     - نقل «دليل المشاريع الهندسية والجهات والشركاء» ليصبح السجل الهندسي المركزي تحت إدارة المكتب الفني (`EngineeringModule.tsx` التبويب `eng_projects`) عبر المكون المتكامل `CTSProjectsTab.tsx`.
     - ربطه مع النوافذ التفاعلية الأربع (`ProjectFormModal`, `EntityFormModal`, `ProjectDetailsModal`, `ProjectTimelineModal`, `DocumentDossierModal`).
     - تستعلم منظومة الصادر والوارد (CTS) مباشرة وديناميكياً عن المشاريع والجهات النشطة من هذا السجل المشترك عبر `ctsStorage.getProjects()` و `ctsStorage.getEntities()`.
   - **معيار النقاء التام من البيانات الوهمية (Zero-Mock Data Purity):**
     - إفراغ كافة المصفوفات التجريبية الافتراضية في `src/services/ctsSeedData.ts` وتعيينها كمصفوفات فارغة قطعية (`[]`).
     - تعديل `ctsStorage.ts` ليعيد دائماً مصفوفات فارغة افتراضياً ما لم تكن هناك سجلات حقيقية محملة من D1 أو منشأة يدوياً من المستخدم.
     - تفعيل آلية التطهير التلقائي لمرة واحدة (`eco_cts_zero_mock_v1`) في التخزين المحلي لمتصفح المستخدم لإزالة أي سجلات تجريبية سابقة.
   - **رحابة الشريط العلوي وتناغم الألوان الفاخر (Spacious Header Command Bar):**
     - إزالة شريط البحث وأيقونات البحث تماماً من `Header.tsx` لتحرير مساحة واسعة ورحبة غير مزدحمة في شريط الأوامر العلوي، مع الإبقاء على استدعاء لوحة الأوامر الشاملة (Command Palette) للمحترفين عبر اختصار `Ctrl + K`.
     - توحيد درجات الألوان: زجاج العاج الدافئ (`#FFFDF9`) مع حدود الشمبانيا الذهبية (`border-amber-200/60`) ونصوص `text-slate-900` في النمط النهاري، وزجاج السج والزيتوني الملكي (`#07130E` و `#0D1F17`) مع حدود كهرمانية براندية (`border-amber-500/30`) ونصوص `text-stone-100` في النمط الليلي.
