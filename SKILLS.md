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
- أزرار وصناديق التأشير: خلفية بيضاء نقية مع إطار محدد `bg-white border-2 border-slate-300 text-amber-600`.
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
2. **إخفاء الأسهم:** يتم تعطيل أسهم الـ Number Spinners عالمياً.
3. **مؤشر الفأرة:** فرض `cursor-text` و `caret-color` واضحة على كل الحقول، و `cursor-pointer` على عناصر الاختيار والقوائم.
4. **تنسيق المبالغ المالية:** عرض المبالغ المالية مع الفواصل الآلافية (مثال: `1,500,000 ج.م`) لسهولة القراءة، وتحويلها إلى أرقام نقية عند الإرسال لقاعدة البيانات.
