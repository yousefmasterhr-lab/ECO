# مواصفات ومخطط الوحدة المعمارية: دليل الحسابات وقيود اليومية ومراكز التكلفة (General Ledger & Accounting Vouchers)
**المرحلة البرمجية:** المرحلة 1 (`Phase 01`)
**التطبيق المصدر:** `APPS ERP Application 2023.exe` (Tarabot ERP)
**قاعدة البيانات المستهدفة:** `MK_Khalil_Db_2026` (SQL Server)
**تاريخ الاستخراج الآلي:** 2026-11-03 22:30:55
---

## 1. النبذة الهندسية والهدف الوظيفي للوحدة
تتولى هذه الوحدة إدارة كافة العمليات والبيانات الخاصة بـ **دليل الحسابات وقيود اليومية ومراكز التكلفة**، وتوفر دورة عمل متكاملة تبدأ من تهيئة الإعدادات والشاشات الثابتة وحتى تنفيذ العمليات اليومية وترحيلها محاسبياً ومخزنياً وفق المعايير المعتمدة في النظام.

تحتوي هذه الوحدة على **10 شاشة نموذج رئيسية** تم تشريحها واستخراج كافة عناصر التحكم، وخطوط أنابيب البيانات، والمعادلات الرياضية، وقواعد التحقق الخاصة بها.

---

## 2. الفهرس التشغيلي لشاشات الوحدة
| # | اسم الشاشة البرمجية (Form Class) | المسمى العربي | المسمى الإنجليزي | الجداول المرتبطة في قاعدة البيانات |
|---|---|---|---|---|
| 1 | `Level1_Form` | **دليل الحسابات - المستوى الأول** | Chart of Accounts - Level 1 | `Level1` |
| 2 | `Level2_Form` | **دليل الحسابات - المستوى الثاني** | Chart of Accounts - Level 2 | `Level2` |
| 3 | `Level3_Form` | **دليل الحسابات - المستوى الثالث** | Chart of Accounts - Level 3 | `Level3` |
| 4 | `Level4_Form` | **دليل الحسابات - المستوى الرابع** | Chart of Accounts - Level 4 | `Level4` |
| 5 | `Level5_Form` | **دليل الحسابات - المستوى الخامس (النهائي)** | Chart of Accounts - Level 5 (Analytical/Leaf) | `Level5` |
| 6 | `Main_Costcenters_Form` | **مراكز التكلفة الرئيسية** | Main Cost Centers | `Main_Costcenters` |
| 7 | `Costcenters_Form` | **مراكز التكلفة الفرعية والتشغيلية** | Sub Cost Centers | `Costcenters` |
| 8 | `Accounts_Analysis_Form` | **الحسابات التحليلية** | Analytical Accounts Directory | `Accounts_Analysis` |
| 9 | `GeneralLedger_Form` | **سندات قيود اليومية العامة** | General Ledger Journal Vouchers | `GeneralLedger_Head, GeneralLedger_Details` |
| 10 | `Journals_Settings_Form` | **إعدادات وتوجيه قيود اليومية** | Journal Accounting Settings | `Journals_Settings` |

---

## 3. التشريح التفصيلي لنماذج الشاشات (Forms Technical Catalog)
### 3.1 شاشة: دليل الحسابات - المستوى الأول (`Level1_Form`)
- **الاسم الإنجليزي:** Chart of Accounts - Level 1
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** تعريف وتصنيف المجموعات المحاسبية الرئيسية (الأصول، الخصوم، حقوق الملكية، الإيرادات، المصروفات)
- **جداول قاعدة البيانات المستهدفة:** `Level1`

#### أ. كتالوج حقول وعناصر التحكم (Field & Control Catalog Table)
| معرف العنصر (Control ID) | التسمية العربية (Label) | نوع عنصر الواجهة | الربط بقاعدة البيانات (DB Binding) | نوع البيانات والقيود (Type & Constraints) | القيمة الافتراضية | المعادلة / السلوك البرمجي |
|---|---|---|---|---|---|---|
| `Search_Option2` | **حقل / زر البحث** | `RadRadioButton` | - | - | - | - |
| `Windows7Theme1` | **Windows7Theme1** | `Windows7Theme` | - | - | - | - |
| `Save` | **زر حفظ السجل** | `RadButton` | - | - | - | - |
| `Delete` | **زر حذف السجل** | `RadButton` | - | - | - | - |
| `F_Exit` | **F_Exit** | `RadButton` | - | - | - | - |
| `Add` | **زر إضافة جديد** | `RadButton` | - | - | - | - |
| `Modify` | **زر تعديل السجل** | `RadButton` | - | - | - | - |
| `Search_Txt` | **حقل / زر البحث** | `RadTextBox` | - | - | - | - |
| `Level1_Name_E` | **اسم الحساب المستوى 1** | `RadTextBox` | `Level1.Level1_Name_E` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `GridView` | **GridView** | `RadGridView` | - | - | - | - |
| `Level1_ID` | **كود الحساب المستوى 1** | `RadTextBox` | `Level1.Level1_ID` | `smallint` (PRIMARY KEY, NOT NULL) | - | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Level1.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Level1.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `Level1_Name_A` | **اسم الحساب المستوى 1** | `RadTextBox` | `Level1.Level1_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `RadLabel1` | **RadLabel1** | `RadLabel` | - | - | - | - |
| `RadLabel2` | **RadLabel2** | `RadLabel` | - | - | - | - |
| `RadLabel5` | **RadLabel5** | `RadLabel` | - | - | - | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Level1.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `RadLabel3` | **RadLabel3** | `RadLabel` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `Parent_ID` | **Parent_ID** | `RadDropDownList` | `Level1.Parent_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel4` | **RadLabel4** | `RadLabel` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `Adap` | **Adap** | `SqlDataAdapter` | - | - | - | - |
| `Adap1` | **Adap1** | `SqlDataAdapter` | - | - | - | - |
| `Adap2` | **Adap2** | `SqlDataAdapter` | - | - | - | - |
| `Permission_Adap` | **Permission_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Delete_Adap` | **زر حذف السجل** | `SqlDataAdapter` | - | - | - | - |
| `Profile_Adap` | **Profile_Adap** | `OleDbDataAdapter` | - | - | - | - |
| `RRS` | **RRS** | `DataSet` | - | - | - | - |
| `RRS1` | **RRS1** | `DataSet` | - | - | - | - |
| `RRS2` | **RRS2** | `DataSet` | - | - | - | - |
| `Permission_RRS` | **Permission_RRS** | `DataSet` | - | - | - | - |
| `Profile_RRS` | **Profile_RRS** | `DataSet` | - | - | - | - |
| `Delete_RRS` | **زر حذف السجل** | `DataSet` | - | - | - | - |
| `Cmd` | **Cmd** | `SqlCommand` | - | - | - | - |
| `Cmd1` | **Cmd1** | `SqlCommand` | - | - | - | - |
| `Cmd01` | **Cmd01** | `SqlCommand` | - | - | - | - |
| `Cmd02` | **Cmd02** | `SqlCommand` | - | - | - | - |
| `Cmd03` | **Cmd03** | `SqlCommand` | - | - | - | - |
| `Cmd04` | **Cmd04** | `SqlCommand` | - | - | - | - |
| `Cmd05` | **Cmd05** | `SqlCommand` | - | - | - | - |
| `Cmd2` | **Cmd2** | `SqlCommand` | - | - | - | - |
| `Cmd3` | **Cmd3** | `SqlCommand` | - | - | - | - |
| `Cmd4` | **Cmd4** | `SqlCommand` | - | - | - | - |
| `Cmd5` | **Cmd5** | `SqlCommand` | - | - | - | - |
| `Balance_Cmd` | **الرصيد / الفارق** | `SqlCommand` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Dt` | **Dt** | `DataTable` | - | - | - | - |
| `Dt_RS` | **Dt_RS** | `DataTable` | - | - | - | - |
| `Dt_RS1` | **Dt_RS1** | `DataTable` | - | - | - | - |
| `Delete_RS` | **زر حذف السجل** | `DataTable` | - | - | - | - |

#### ب. قواعد التحقق والمعادلات الحسابية (Validation & Business Rules)
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إختيـار نـوع الحسـاب 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المسـتوى الأول 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسم المسـتوى الأول 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الأسـم بالأنجليزي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إضافة سجل جديد أثناء عملية التعديل. لأضافة سجل يجب الضغط على الغاء التعديل ثم الضغط على سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إجراء تعديل أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: في حالة الإضافة يجب الضغط على سجل جديد وفي حالة التعديل يجب الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل موجود مسبقاً ولا يمكن حفظه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل غير موجود ولا يمكن تحديثه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء إضافة سجل جديد. للحذف يجب الضغط على الغاء الإضافة ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء تعديل سجل . للحذف يجب الضغط على الغاء التعديل ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد السجل المراد حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل غير موجود ولا يمكن حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء:  لا يمكن حذف السجل لأرتباطه ببيانات في ملف تأسـيس المسـتوى الثاني في الشجرة المحاسـبية  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Level1_ID FROM Level1 Where Parent_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level1 Order By Level1_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users_Table
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Branches Order By Branche_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users Where User_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level1 Where Level1_ID=
```
##### استعلام INSERT على جدول `Level1`:
```sql
Insert Into Level1(Parent_ID,Level1_ID,Level1_Name_A,Level1_Name_E,Entry_ID,Entry_Name,Notice)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level1 Where Level1_ID=
```
##### استعلام UPDATE على جدول `Level1`:
```sql
Update Level1 Set Parent_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level1 Where Level1_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level2 Where Level1_ID=
```
##### استعلام DELETE على جدول `Level1`:
```sql
Delete From Level1 where Level1_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level1 Where Level1_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level1 Where Level1_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level1 Where Level1_Name_A='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level1 Where Level1_Name_E='
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Parent_ID_GotFocus, Parent_ID_KeyDown, Parent_ID_LostFocus, Parent_ID_SelectedIndexChanged, Level1_ID_LostFocus, Level1_Name_A_LostFocus, Level1_Name_E_LostFocus, Notice_LostFocus, Search_Txt_LostFocus, RadLabel4_Click, Dispose, InitializeComponent, get_Search_Option2, set_Search_Option2, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_Level1_Name_E, set_Level1_Name_E, get_GridView, set_GridView, get_Level1_ID, set_Level1_ID, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_Level1_Name_A, set_Level1_Name_A, get_RadLabel1, set_RadLabel1, get_RadLabel2, set_RadLabel2, get_RadLabel5, set_RadLabel5, get_Notice, set_Notice, get_RadLabel3, set_RadLabel3, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_Parent_ID, set_Parent_ID, get_RadLabel4, set_RadLabel4, get_RadPanel4, set_RadPanel4, get_AquaTheme1, set_AquaTheme1, Clear_Record, Clear_Data, Clear_Data1, Fill_Grid, Lock_Control, Enable_Control, Review_Record, Level1_Form_KeyDown, Level1_Form_Load, Level1_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Level1_ID_GotFocus, Level1_ID_KeyPress, Level1_ID_KeyDown, Level1_Name_A_GotFocus, Level1_Name_A_KeyPress, Level1_Name_A_KeyDown, Level1_Name_E_GotFocus, Level1_Name_E_KeyPress, Level1_Name_E_KeyDown, Notice_GotFocus, Notice_KeyPress, Notice_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown
```

---

### 3.2 شاشة: دليل الحسابات - المستوى الثاني (`Level2_Form`)
- **الاسم الإنجليزي:** Chart of Accounts - Level 2
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** تعريف الحسابات الرئيسية العامة المتفرعة من المستوى الأول
- **جداول قاعدة البيانات المستهدفة:** `Level2`

#### أ. كتالوج حقول وعناصر التحكم (Field & Control Catalog Table)
| معرف العنصر (Control ID) | التسمية العربية (Label) | نوع عنصر الواجهة | الربط بقاعدة البيانات (DB Binding) | نوع البيانات والقيود (Type & Constraints) | القيمة الافتراضية | المعادلة / السلوك البرمجي |
|---|---|---|---|---|---|---|
| `Search_Option2` | **حقل / زر البحث** | `RadRadioButton` | - | - | - | - |
| `Windows7Theme1` | **Windows7Theme1** | `Windows7Theme` | - | - | - | - |
| `Save` | **زر حفظ السجل** | `RadButton` | - | - | - | - |
| `Delete` | **زر حذف السجل** | `RadButton` | - | - | - | - |
| `F_Exit` | **F_Exit** | `RadButton` | - | - | - | - |
| `Add` | **زر إضافة جديد** | `RadButton` | - | - | - | - |
| `Modify` | **زر تعديل السجل** | `RadButton` | - | - | - | - |
| `Search_Txt` | **حقل / زر البحث** | `RadTextBox` | - | - | - | - |
| `Level2_Name_E` | **اسم الحساب المستوى 2** | `RadTextBox` | `Level2.Level2_Name_E` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `GridView` | **GridView** | `RadGridView` | - | - | - | - |
| `Level2_ID` | **كود الحساب المستوى 2** | `RadTextBox` | `Level2.Level2_ID` | `smallint` (PRIMARY KEY, NOT NULL) | - | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Level2.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Level2.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `Level2_Name_A` | **اسم الحساب المستوى 2** | `RadTextBox` | `Level2.Level2_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `RadLabel1` | **RadLabel1** | `RadLabel` | - | - | - | - |
| `RadLabel2` | **RadLabel2** | `RadLabel` | - | - | - | - |
| `RadLabel5` | **RadLabel5** | `RadLabel` | - | - | - | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Level2.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `RadLabel3` | **RadLabel3** | `RadLabel` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadLabel4` | **RadLabel4** | `RadLabel` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `Level1_ID` | **كود الحساب المستوى 1** | `RadTextBox` | `Level2.Level1_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `Level1_Gridview` | **Level1_Gridview** | `RadGridView` | - | - | - | - |
| `Level1_Name_A` | **اسم الحساب المستوى 1** | `RadTextBox` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `Adap` | **Adap** | `SqlDataAdapter` | - | - | - | - |
| `Adap1` | **Adap1** | `SqlDataAdapter` | - | - | - | - |
| `Adap2` | **Adap2** | `SqlDataAdapter` | - | - | - | - |
| `Adap3` | **Adap3** | `SqlDataAdapter` | - | - | - | - |
| `Adap4` | **Adap4** | `SqlDataAdapter` | - | - | - | - |
| `Adap5` | **Adap5** | `SqlDataAdapter` | - | - | - | - |
| `Adap6` | **Adap6** | `SqlDataAdapter` | - | - | - | - |
| `Permission_Adap` | **Permission_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Delete_Adap` | **زر حذف السجل** | `SqlDataAdapter` | - | - | - | - |
| `Profile_Adap` | **Profile_Adap** | `OleDbDataAdapter` | - | - | - | - |
| `RRS` | **RRS** | `DataSet` | - | - | - | - |
| `RRS1` | **RRS1** | `DataSet` | - | - | - | - |
| `RRS2` | **RRS2** | `DataSet` | - | - | - | - |
| `RRS3` | **RRS3** | `DataSet` | - | - | - | - |
| `RRS4` | **RRS4** | `DataSet` | - | - | - | - |
| `RRS5` | **RRS5** | `DataSet` | - | - | - | - |
| `RRS6` | **RRS6** | `DataSet` | - | - | - | - |
| `Permission_RRS` | **Permission_RRS** | `DataSet` | - | - | - | - |
| `Profile_RRS` | **Profile_RRS** | `DataSet` | - | - | - | - |
| `Delete_RRS` | **زر حذف السجل** | `DataSet` | - | - | - | - |
| `Cmd` | **Cmd** | `SqlCommand` | - | - | - | - |
| `Cmd1` | **Cmd1** | `SqlCommand` | - | - | - | - |
| `Cmd01` | **Cmd01** | `SqlCommand` | - | - | - | - |
| `Cmd02` | **Cmd02** | `SqlCommand` | - | - | - | - |
| `Cmd03` | **Cmd03** | `SqlCommand` | - | - | - | - |
| `Cmd04` | **Cmd04** | `SqlCommand` | - | - | - | - |
| `Cmd05` | **Cmd05** | `SqlCommand` | - | - | - | - |
| `Cmd2` | **Cmd2** | `SqlCommand` | - | - | - | - |
| `Cmd3` | **Cmd3** | `SqlCommand` | - | - | - | - |
| `Cmd4` | **Cmd4** | `SqlCommand` | - | - | - | - |
| `Cmd5` | **Cmd5** | `SqlCommand` | - | - | - | - |
| `Balance_Cmd` | **الرصيد / الفارق** | `SqlCommand` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Dt_RS` | **Dt_RS** | `DataTable` | - | - | - | - |
| `Dt_RS1` | **Dt_RS1** | `DataTable` | - | - | - | - |
| `Dt_RS2` | **Dt_RS2** | `DataTable` | - | - | - | - |
| `Dt_RS6` | **Dt_RS6** | `DataTable` | - | - | - | - |
| `Delete_RS` | **زر حذف السجل** | `DataTable` | - | - | - | - |
| `Dt` | **Dt** | `DataTable` | - | - | - | - |
| `Dt1` | **Dt1** | `DataTable` | - | - | - | - |

#### ب. قواعد التحقق والمعادلات الحسابية (Validation & Business Rules)
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المسـتوى الأول 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إختيـار اسم المسـتوى الأول 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المسـتوى الثاني 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسم المسـتوى الثاني 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الأسـم بالأنجليزي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إضافة سجل جديد أثناء عملية التعديل. لأضافة سجل يجب الضغط على الغاء التعديل ثم الضغط على سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إجراء تعديل أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: في حالة الإضافة يجب الضغط على سجل جديد وفي حالة التعديل يجب الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل موجود مسبقاً ولا يمكن حفظه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل غير موجود ولا يمكن تحديثه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء إضافة سجل جديد. للحذف يجب الضغط على الغاء الإضافة ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء تعديل سجل . للحذف يجب الضغط على الغاء التعديل ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد السجل المراد حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل غير موجود ولا يمكن حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء:  لا يمكن حذف السجل لأرتباطه ببيانات في ملف تأسـيس المسـتوى الثالث في الشجرة المحاسـبية  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level1 Where Level1_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Level2_ID FROM Level2 Where Level1_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Level2_ID FROM Level2 Where Level1_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Level2_ID FROM Level2 Where Level1_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level2_View Order By Level2_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users_Table
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Branches Order By Branche_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users Where User_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level1 Order By Level1_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level2 Where Level2_ID=
```
##### استعلام INSERT على جدول `Level2`:
```sql
Insert Into Level2(Level1_ID,Level2_ID,Level2_Name_A,Level2_Name_E,Entry_ID,Entry_Name,Notice)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level2 Where Level2_ID=
```
##### استعلام UPDATE على جدول `Level2`:
```sql
Update Level2 Set Level1_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level2 Where Level2_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level3 Where Level2_ID=
```
##### استعلام DELETE على جدول `Level2`:
```sql
Delete From Level2 where Level2_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level2_View Where Level2_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level1 Where Level1_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level2_View Where Level1_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level2_View Where Level2_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level2_View Where Level1_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level2 Where Level2_Name_A='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level2_View Where Level1_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level2 Where Level2_Name_E='
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Notice_GotFocus, Notice_KeyPress, Notice_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Level1_ID_GotFocus, Level1_ID_KeyDown, Level1_ID_KeyPress, Level1_Gridview_CellClick, Level1_Gridview_CellFormatting, Level1_Gridview_KeyDown, Search_Txt_LostFocus, Notice_LostFocus, Level1_ID_LostFocus, Level2_ID_LostFocus, Level2_Name_A_LostFocus, Level2_Name_E_LostFocus, Level1_Name_A_GotFocus, Level1_Name_A_LostFocus, Dispose, InitializeComponent, get_Search_Option2, set_Search_Option2, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_Level2_Name_E, set_Level2_Name_E, get_GridView, set_GridView, get_Level2_ID, set_Level2_ID, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_Level2_Name_A, set_Level2_Name_A, get_RadLabel1, set_RadLabel1, get_RadLabel2, set_RadLabel2, get_RadLabel5, set_RadLabel5, get_Notice, set_Notice, get_RadLabel3, set_RadLabel3, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadLabel4, set_RadLabel4, get_RadPanel4, set_RadPanel4, get_Level1_ID, set_Level1_ID, get_Level1_Gridview, set_Level1_Gridview, get_Level1_Name_A, set_Level1_Name_A, get_AquaTheme1, set_AquaTheme1, Clear_Record, Clear_Data, Fill_Grid, Fill_Level1_Grid, Lock_Control, Enable_Control, Review_Record, Level2_Form_KeyDown, Level2_Form_Load, Level2_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Option2_Click, Search_Option2_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Level2_ID_GotFocus, Level2_ID_KeyPress, Level2_ID_KeyDown, Level2_Name_A_GotFocus, Level2_Name_A_KeyPress, Level2_Name_A_KeyDown, Level2_Name_E_GotFocus, Level2_Name_E_KeyPress, Level2_Name_E_KeyDown
```

---

### 3.3 شاشة: دليل الحسابات - المستوى الثالث (`Level3_Form`)
- **الاسم الإنجليزي:** Chart of Accounts - Level 3
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** تعريف الحسابات المساعدة المتفرعة من المستوى الثاني
- **جداول قاعدة البيانات المستهدفة:** `Level3`

#### أ. كتالوج حقول وعناصر التحكم (Field & Control Catalog Table)
| معرف العنصر (Control ID) | التسمية العربية (Label) | نوع عنصر الواجهة | الربط بقاعدة البيانات (DB Binding) | نوع البيانات والقيود (Type & Constraints) | القيمة الافتراضية | المعادلة / السلوك البرمجي |
|---|---|---|---|---|---|---|
| `Search_Option2` | **حقل / زر البحث** | `RadRadioButton` | - | - | - | - |
| `Windows7Theme1` | **Windows7Theme1** | `Windows7Theme` | - | - | - | - |
| `Save` | **زر حفظ السجل** | `RadButton` | - | - | - | - |
| `Delete` | **زر حذف السجل** | `RadButton` | - | - | - | - |
| `F_Exit` | **F_Exit** | `RadButton` | - | - | - | - |
| `Add` | **زر إضافة جديد** | `RadButton` | - | - | - | - |
| `Modify` | **زر تعديل السجل** | `RadButton` | - | - | - | - |
| `Search_Txt` | **حقل / زر البحث** | `RadTextBox` | - | - | - | - |
| `Level3_Name_E` | **اسم الحساب المستوى 3** | `RadTextBox` | `Level3.Level3_Name_E` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `GridView` | **GridView** | `RadGridView` | - | - | - | - |
| `Level3_ID` | **كود الحساب المستوى 3** | `RadTextBox` | `Level3.Level3_ID` | `int` (PRIMARY KEY, NOT NULL) | - | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Level3.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Level3.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `Level3_Name_A` | **اسم الحساب المستوى 3** | `RadTextBox` | `Level3.Level3_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `RadLabel1` | **RadLabel1** | `RadLabel` | - | - | - | - |
| `RadLabel2` | **RadLabel2** | `RadLabel` | - | - | - | - |
| `RadLabel5` | **RadLabel5** | `RadLabel` | - | - | - | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Level3.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `RadLabel3` | **RadLabel3** | `RadLabel` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadLabel4` | **RadLabel4** | `RadLabel` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `Level2_ID` | **كود الحساب المستوى 2** | `RadTextBox` | `Level3.Level2_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `Level2_Gridview` | **Level2_Gridview** | `RadGridView` | - | - | - | - |
| `Level2_Name_A` | **اسم الحساب المستوى 2** | `RadTextBox` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `Adap` | **Adap** | `SqlDataAdapter` | - | - | - | - |
| `Adap1` | **Adap1** | `SqlDataAdapter` | - | - | - | - |
| `Adap2` | **Adap2** | `SqlDataAdapter` | - | - | - | - |
| `Adap3` | **Adap3** | `SqlDataAdapter` | - | - | - | - |
| `Adap4` | **Adap4** | `SqlDataAdapter` | - | - | - | - |
| `Adap5` | **Adap5** | `SqlDataAdapter` | - | - | - | - |
| `Adap6` | **Adap6** | `SqlDataAdapter` | - | - | - | - |
| `Permission_Adap` | **Permission_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Delete_Adap` | **زر حذف السجل** | `SqlDataAdapter` | - | - | - | - |
| `Profile_Adap` | **Profile_Adap** | `OleDbDataAdapter` | - | - | - | - |
| `RRS` | **RRS** | `DataSet` | - | - | - | - |
| `RRS1` | **RRS1** | `DataSet` | - | - | - | - |
| `RRS2` | **RRS2** | `DataSet` | - | - | - | - |
| `RRS3` | **RRS3** | `DataSet` | - | - | - | - |
| `RRS4` | **RRS4** | `DataSet` | - | - | - | - |
| `RRS5` | **RRS5** | `DataSet` | - | - | - | - |
| `RRS6` | **RRS6** | `DataSet` | - | - | - | - |
| `Permission_RRS` | **Permission_RRS** | `DataSet` | - | - | - | - |
| `Profile_RRS` | **Profile_RRS** | `DataSet` | - | - | - | - |
| `Delete_RRS` | **زر حذف السجل** | `DataSet` | - | - | - | - |
| `Cmd` | **Cmd** | `SqlCommand` | - | - | - | - |
| `Cmd1` | **Cmd1** | `SqlCommand` | - | - | - | - |
| `Cmd01` | **Cmd01** | `SqlCommand` | - | - | - | - |
| `Cmd02` | **Cmd02** | `SqlCommand` | - | - | - | - |
| `Cmd03` | **Cmd03** | `SqlCommand` | - | - | - | - |
| `Cmd04` | **Cmd04** | `SqlCommand` | - | - | - | - |
| `Cmd05` | **Cmd05** | `SqlCommand` | - | - | - | - |
| `Cmd2` | **Cmd2** | `SqlCommand` | - | - | - | - |
| `Cmd3` | **Cmd3** | `SqlCommand` | - | - | - | - |
| `Cmd4` | **Cmd4** | `SqlCommand` | - | - | - | - |
| `Cmd5` | **Cmd5** | `SqlCommand` | - | - | - | - |
| `Balance_Cmd` | **الرصيد / الفارق** | `SqlCommand` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Dt_RS` | **Dt_RS** | `DataTable` | - | - | - | - |
| `Dt_RS1` | **Dt_RS1** | `DataTable` | - | - | - | - |
| `Dt_RS2` | **Dt_RS2** | `DataTable` | - | - | - | - |
| `Dt_RS6` | **Dt_RS6** | `DataTable` | - | - | - | - |
| `Delete_RS` | **زر حذف السجل** | `DataTable` | - | - | - | - |
| `Dt` | **Dt** | `DataTable` | - | - | - | - |
| `Dt1` | **Dt1** | `DataTable` | - | - | - | - |

#### ب. قواعد التحقق والمعادلات الحسابية (Validation & Business Rules)
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المستوى الثانـي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إختيـار اسم المستوى الثانـي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المسـتوى الثالـث 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسم المسـتوى الثالـث 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الأسـم بالأنجليزي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إضافة سجل جديد أثناء عملية التعديل. لأضافة سجل يجب الضغط على الغاء التعديل ثم الضغط على سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إجراء تعديل أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: في حالة الإضافة يجب الضغط على سجل جديد وفي حالة التعديل يجب الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل موجود مسبقاً ولا يمكن حفظه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل غير موجود ولا يمكن تحديثه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء إضافة سجل جديد. للحذف يجب الضغط على الغاء الإضافة ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء تعديل سجل . للحذف يجب الضغط على الغاء التعديل ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد السجل المراد حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل غير موجود ولا يمكن حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء:  لا يمكن حذف السجل لأرتباطه ببيانات  في ملف تأسـيس المسـتوى الرابـع  في الشجرة المحاسـبية  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level2 Where Level2_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Level3_ID FROM Level3 Where Level2_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Level3_ID FROM Level3 Where Level2_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Level3_ID FROM Level3 Where Level2_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level3_View Order By Level3_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users_Table
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Branches Order By Branche_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users Where User_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level2 Order By Level2_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level3 Where Level3_ID=
```
##### استعلام INSERT على جدول `Level3`:
```sql
Insert Into Level3(Level2_ID,Level3_ID,Level3_Name_A,Level3_Name_E,Entry_ID,Entry_Name,Notice)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level3 Where Level3_ID=
```
##### استعلام UPDATE على جدول `Level3`:
```sql
Update Level3 Set Level2_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level3 Where Level3_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level4 Where Level3_ID=
```
##### استعلام DELETE على جدول `Level3`:
```sql
Delete From Level3 where Level3_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level3_View Where Level3_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level2 Where Level2_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level3_View Where Level2_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level3_View Where Level3_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level3_View Where Level2_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level3 Where Level3_Name_A='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level3_View Where Level2_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level3 Where Level3_Name_E='
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Notice_GotFocus, Notice_KeyPress, Notice_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Level2_ID_GotFocus, Level2_ID_KeyDown, Level2_ID_KeyPress, Level2_Gridview_CellClick, Level2_Gridview_CellFormatting, Level2_Gridview_KeyDown, Search_Txt_LostFocus, Notice_LostFocus, Level2_ID_LostFocus, Level3_ID_LostFocus, Level3_Name_A_LostFocus, Level3_Name_E_LostFocus, Level2_Name_A_GotFocus, Level2_Name_A_LostFocus, Dispose, InitializeComponent, get_Search_Option2, set_Search_Option2, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_Level3_Name_E, set_Level3_Name_E, get_GridView, set_GridView, get_Level3_ID, set_Level3_ID, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_Level3_Name_A, set_Level3_Name_A, get_RadLabel1, set_RadLabel1, get_RadLabel2, set_RadLabel2, get_RadLabel5, set_RadLabel5, get_Notice, set_Notice, get_RadLabel3, set_RadLabel3, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadLabel4, set_RadLabel4, get_RadPanel4, set_RadPanel4, get_Level2_ID, set_Level2_ID, get_Level2_Gridview, set_Level2_Gridview, get_Level2_Name_A, set_Level2_Name_A, get_AquaTheme1, set_AquaTheme1, Clear_Record, Clear_Data, Fill_Grid, Fill_Level2_Grid, Lock_Control, Enable_Control, Review_Record, Level3_Form_KeyDown, Level3_Form_Load, Level3_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Option2_Click, Search_Option2_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Level3_ID_GotFocus, Level3_ID_KeyPress, Level3_ID_KeyDown, Level3_Name_A_GotFocus, Level3_Name_A_KeyPress, Level3_Name_A_KeyDown, Level3_Name_E_GotFocus, Level3_Name_E_KeyPress, Level3_Name_E_KeyDown
```

---

### 3.4 شاشة: دليل الحسابات - المستوى الرابع (`Level4_Form`)
- **الاسم الإنجليزي:** Chart of Accounts - Level 4
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** تعريف الحسابات الفرعية الإجمالية الحاكمة للعمليات
- **جداول قاعدة البيانات المستهدفة:** `Level4`

#### أ. كتالوج حقول وعناصر التحكم (Field & Control Catalog Table)
| معرف العنصر (Control ID) | التسمية العربية (Label) | نوع عنصر الواجهة | الربط بقاعدة البيانات (DB Binding) | نوع البيانات والقيود (Type & Constraints) | القيمة الافتراضية | المعادلة / السلوك البرمجي |
|---|---|---|---|---|---|---|
| `Search_Option2` | **حقل / زر البحث** | `RadRadioButton` | - | - | - | - |
| `Windows7Theme1` | **Windows7Theme1** | `Windows7Theme` | - | - | - | - |
| `Search_Option1` | **حقل / زر البحث** | `RadRadioButton` | - | - | - | - |
| `Save` | **زر حفظ السجل** | `RadButton` | - | - | - | - |
| `Delete` | **زر حذف السجل** | `RadButton` | - | - | - | - |
| `F_Exit` | **F_Exit** | `RadButton` | - | - | - | - |
| `Add` | **زر إضافة جديد** | `RadButton` | - | - | - | - |
| `Modify` | **زر تعديل السجل** | `RadButton` | - | - | - | - |
| `Search_Txt` | **حقل / زر البحث** | `RadTextBox` | - | - | - | - |
| `Level4_Name_E` | **اسم الحساب المستوى 4** | `RadTextBox` | `Level4.Level4_Name_E` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `GridView` | **GridView** | `RadGridView` | - | - | - | - |
| `Level4_ID` | **كود الحساب المستوى 4** | `RadTextBox` | `Level4.Level4_ID` | `int` (PRIMARY KEY, NOT NULL) | - | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Level4.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Level4.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `Level4_Name_A` | **اسم الحساب المستوى 4** | `RadTextBox` | `Level4.Level4_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `RadLabel1` | **RadLabel1** | `RadLabel` | - | - | - | - |
| `RadLabel2` | **RadLabel2** | `RadLabel` | - | - | - | - |
| `RadLabel5` | **RadLabel5** | `RadLabel` | - | - | - | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Level4.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `RadLabel3` | **RadLabel3** | `RadLabel` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadLabel4` | **RadLabel4** | `RadLabel` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `Level3_ID` | **كود الحساب المستوى 3** | `RadTextBox` | `Level4.Level3_ID` | `int` (NOT NULL) | `((0))` | - |
| `Level3_Gridview` | **Level3_Gridview** | `RadGridView` | - | - | - | - |
| `RadPanel5` | **RadPanel5** | `RadPanel` | - | - | - | - |
| `RadPanel6` | **RadPanel6** | `RadPanel` | - | - | - | - |
| `RadLabel19` | **RadLabel19** | `RadLabel` | - | - | - | - |
| `Account_Nature` | **Account_Nature** | `RadDropDownList` | `Level4.Account_Nature` | `smallint` (NOT NULL) | `((0))` | - |
| `RadLabel18` | **RadLabel18** | `RadLabel` | - | - | - | - |
| `Module_Type` | **Module_Type** | `RadDropDownList` | `Level4.Module_Type` | `smallint` (NOT NULL) | `((0))` | - |
| `RadLabel16` | **RadLabel16** | `RadLabel` | - | - | - | - |
| `Incom_Type` | **Incom_Type** | `RadDropDownList` | `Level4.Incom_Type` | `smallint` (NOT NULL) | `((0))` | - |
| `RadLabel14` | **RadLabel14** | `RadLabel` | - | - | - | - |
| `Balance_Sheet_Type` | **الرصيد / الفارق** | `RadDropDownList` | `Level4.Balance_Sheet_Type` | `smallint` (NOT NULL) | `((0))` | `Balance = Previous_Balance + Debit - Credit` |
| `RadLabel12` | **RadLabel12** | `RadLabel` | - | - | - | - |
| `Level3_Name_A` | **اسم الحساب المستوى 3** | `RadTextBox` | - | - | - | - |
| `Adap` | **Adap** | `SqlDataAdapter` | - | - | - | - |
| `Adap1` | **Adap1** | `SqlDataAdapter` | - | - | - | - |
| `Adap2` | **Adap2** | `SqlDataAdapter` | - | - | - | - |
| `Adap3` | **Adap3** | `SqlDataAdapter` | - | - | - | - |
| `Adap4` | **Adap4** | `SqlDataAdapter` | - | - | - | - |
| `Adap5` | **Adap5** | `SqlDataAdapter` | - | - | - | - |
| `Adap6` | **Adap6** | `SqlDataAdapter` | - | - | - | - |
| `Permission_Adap` | **Permission_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Delete_Adap` | **زر حذف السجل** | `SqlDataAdapter` | - | - | - | - |
| `Profile_Adap` | **Profile_Adap** | `OleDbDataAdapter` | - | - | - | - |
| `RRS` | **RRS** | `DataSet` | - | - | - | - |
| `RRS1` | **RRS1** | `DataSet` | - | - | - | - |
| `RRS2` | **RRS2** | `DataSet` | - | - | - | - |
| `RRS3` | **RRS3** | `DataSet` | - | - | - | - |
| `RRS4` | **RRS4** | `DataSet` | - | - | - | - |
| `RRS5` | **RRS5** | `DataSet` | - | - | - | - |
| `RRS6` | **RRS6** | `DataSet` | - | - | - | - |
| `Permission_RRS` | **Permission_RRS** | `DataSet` | - | - | - | - |
| `Profile_RRS` | **Profile_RRS** | `DataSet` | - | - | - | - |
| `Delete_RRS` | **زر حذف السجل** | `DataSet` | - | - | - | - |
| `Cmd` | **Cmd** | `SqlCommand` | - | - | - | - |
| `Cmd1` | **Cmd1** | `SqlCommand` | - | - | - | - |
| `Cmd01` | **Cmd01** | `SqlCommand` | - | - | - | - |
| `Cmd02` | **Cmd02** | `SqlCommand` | - | - | - | - |
| `Cmd03` | **Cmd03** | `SqlCommand` | - | - | - | - |
| `Cmd04` | **Cmd04** | `SqlCommand` | - | - | - | - |
| `Cmd05` | **Cmd05** | `SqlCommand` | - | - | - | - |
| `Cmd2` | **Cmd2** | `SqlCommand` | - | - | - | - |
| `Cmd3` | **Cmd3** | `SqlCommand` | - | - | - | - |
| `Cmd4` | **Cmd4** | `SqlCommand` | - | - | - | - |
| `Cmd5` | **Cmd5** | `SqlCommand` | - | - | - | - |
| `Balance_Cmd` | **الرصيد / الفارق** | `SqlCommand` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Dt_RS` | **Dt_RS** | `DataTable` | - | - | - | - |
| `Dt_RS1` | **Dt_RS1** | `DataTable` | - | - | - | - |
| `Dt_RS2` | **Dt_RS2** | `DataTable` | - | - | - | - |
| `Dt_RS6` | **Dt_RS6** | `DataTable` | - | - | - | - |
| `Delete_RS` | **زر حذف السجل** | `DataTable` | - | - | - | - |
| `Dt` | **Dt** | `DataTable` | - | - | - | - |
| `Dt1` | **Dt1** | `DataTable` | - | - | - | - |

#### ب. قواعد التحقق والمعادلات الحسابية (Validation & Business Rules)
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المستوى الثالـث 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إختيـار اسم المستوى الثالـث 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المستوى الرابـع 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسم المستوى الرابـع 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الأسـم بالأنجليزي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إضافة سجل جديد أثناء عملية التعديل. لأضافة سجل يجب الضغط على الغاء التعديل ثم الضغط على سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إجراء تعديل أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: في حالة الإضافة يجب الضغط على سجل جديد وفي حالة التعديل يجب الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل موجود مسبقاً ولا يمكن حفظه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل غير موجود ولا يمكن تحديثه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء إضافة سجل جديد. للحذف يجب الضغط على الغاء الإضافة ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء تعديل سجل . للحذف يجب الضغط على الغاء التعديل ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد السجل المراد حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل غير موجود ولا يمكن حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء:  لا يمكن حذف السجل لأرتباطه ببيانات في ملف تأسـيس المسـتوى الأخير في الشجرة المحاسـبية  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level4_View Where Level3_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level4_View Where Level4_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level3_View Where Level2_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level3_View Where Level3_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level4_View Where Level3_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level4_View Where Level4_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level4_View Where Level3_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level4 Where Level4_Name_A='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level4_View Where Level3_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level4 Where Level4_Name_E='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level3 Where Level3_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Level4_ID FROM Level4 Where Level3_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Level4_ID FROM Level4 Where Level3_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Level4_ID FROM Level4 Where Level3_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level4_View Order By Level3_ID,Level4_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users_Table
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Branches Order By Branche_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users Where User_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level3_View Order By Level3_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level4 Where Level4_ID=
```
##### استعلام INSERT على جدول `Level4`:
```sql
Insert Into Level4(Level3_ID,Level4_ID,Level4_Name_A,Level4_Name_E,Balance_Sheet_Type,Incom_Type,Module_Type,Account_Nature,Entry_ID,Entry_Name,Notice)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level4 Where Level4_ID=
```
##### استعلام UPDATE على جدول `Level4`:
```sql
Update Level4 Set Level3_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level4 Where Level4_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5 Where Level4_ID=
```
##### استعلام DELETE على جدول `Level4`:
```sql
Delete From Level4 where Level4_ID=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
GridView_KeyDown, Search_Option1_Click, Search_Option1_KeyDown, Search_Option2_Click, Search_Option2_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Level4_ID_GotFocus, Level4_ID_KeyPress, Level4_ID_KeyDown, Level4_Name_A_GotFocus, Level4_Name_A_KeyPress, Level4_Name_A_KeyDown, Level4_Name_E_GotFocus, Level4_Name_E_KeyPress, Level4_Name_E_KeyDown, Notice_GotFocus, Notice_KeyPress, Notice_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Level3_ID_GotFocus, Level3_ID_KeyDown, Level3_ID_KeyPress, Level3_Name_A_GotFocus, Level3_Gridview_CellClick, Level3_Gridview_CellFormatting, Level3_Gridview_KeyDown, Balance_Sheet_Type_GotFocus, Balance_Sheet_Type_KeyDown, Incom_Type_GotFocus, Incom_Type_KeyDown, Module_Type_GotFocus, Module_Type_KeyDown, Account_Nature_GotFocus, Account_Nature_KeyDown, Balance_Sheet_Type_LostFocus, Balance_Sheet_Type_SelectedIndexChanged, Incom_Type_LostFocus, Incom_Type_SelectedIndexChanged, Module_Type_LostFocus, Module_Type_SelectedIndexChanged, Account_Nature_LostFocus, Account_Nature_SelectedIndexChanged, Search_Txt_LostFocus, Level3_ID_LostFocus, Level3_Name_A_LostFocus, Level4_ID_LostFocus, Level4_Name_A_LostFocus, Level4_Name_E_LostFocus, Notice_LostFocus, Dispose, InitializeComponent, get_Search_Option2, set_Search_Option2, get_Windows7Theme1, set_Windows7Theme1, get_Search_Option1, set_Search_Option1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_Level4_Name_E, set_Level4_Name_E, get_GridView, set_GridView, get_Level4_ID, set_Level4_ID, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_Level4_Name_A, set_Level4_Name_A, get_RadLabel1, set_RadLabel1, get_RadLabel2, set_RadLabel2, get_RadLabel5, set_RadLabel5, get_Notice, set_Notice, get_RadLabel3, set_RadLabel3, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadLabel4, set_RadLabel4, get_RadPanel4, set_RadPanel4, get_Level3_ID, set_Level3_ID, get_Level3_Gridview, set_Level3_Gridview, get_RadPanel5, set_RadPanel5, get_RadPanel6, set_RadPanel6, get_RadLabel19, set_RadLabel19, get_Account_Nature, set_Account_Nature, get_RadLabel18, set_RadLabel18, get_Module_Type, set_Module_Type, get_RadLabel16, set_RadLabel16, get_Incom_Type, set_Incom_Type, get_RadLabel14, set_RadLabel14, get_Balance_Sheet_Type, set_Balance_Sheet_Type, get_RadLabel12, set_RadLabel12, get_Level3_Name_A, set_Level3_Name_A, Clear_Record, Clear_Data, Clear_Data1, Fill_Grid, Fill_Level3_Grid, Lock_Control, Enable_Control, Review_Record, Level4_Form_KeyDown, Level4_Form_Load, Level4_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting
```

---

### 3.5 شاشة: دليل الحسابات - المستوى الخامس (النهائي) (`Level5_Form`)
- **الاسم الإنجليزي:** Chart of Accounts - Level 5 (Analytical/Leaf)
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** تعريف الحسابات الفرعية والنهائية التي تتم عليها الحركات اليومية والقيود المالية
- **جداول قاعدة البيانات المستهدفة:** `Level5`

#### أ. كتالوج حقول وعناصر التحكم (Field & Control Catalog Table)
| معرف العنصر (Control ID) | التسمية العربية (Label) | نوع عنصر الواجهة | الربط بقاعدة البيانات (DB Binding) | نوع البيانات والقيود (Type & Constraints) | القيمة الافتراضية | المعادلة / السلوك البرمجي |
|---|---|---|---|---|---|---|
| `Search_Option2` | **حقل / زر البحث** | `RadRadioButton` | - | - | - | - |
| `Windows7Theme1` | **Windows7Theme1** | `Windows7Theme` | - | - | - | - |
| `Search_Option1` | **حقل / زر البحث** | `RadRadioButton` | - | - | - | - |
| `Save` | **زر حفظ السجل** | `RadButton` | - | - | - | - |
| `Delete` | **زر حذف السجل** | `RadButton` | - | - | - | - |
| `F_Exit` | **F_Exit** | `RadButton` | - | - | - | - |
| `Add` | **زر إضافة جديد** | `RadButton` | - | - | - | - |
| `Modify` | **زر تعديل السجل** | `RadButton` | - | - | - | - |
| `Search_Txt` | **حقل / زر البحث** | `RadTextBox` | - | - | - | - |
| `Level5_Name_E` | **اسم الحساب الفرعي** | `RadTextBox` | `Level5.Level5_Name_E` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `GridView` | **GridView** | `RadGridView` | - | - | - | - |
| `Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Level5.Level5_ID` | `numeric` (PRIMARY KEY, NOT NULL) | - | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Level5.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Level5.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | `Level5.Level5_Name_A` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `RadLabel1` | **RadLabel1** | `RadLabel` | - | - | - | - |
| `RadLabel2` | **RadLabel2** | `RadLabel` | - | - | - | - |
| `RadLabel5` | **RadLabel5** | `RadLabel` | - | - | - | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Level5.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `RadLabel3` | **RadLabel3** | `RadLabel` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadLabel4` | **RadLabel4** | `RadLabel` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `Level4_ID` | **كود الحساب المستوى 4** | `RadTextBox` | `Level5.Level4_ID` | `int` (NOT NULL) | `((0))` | - |
| `Level4_Gridview` | **Level4_Gridview** | `RadGridView` | - | - | - | - |
| `Level1_Name_A` | **اسم الحساب المستوى 1** | `RadTextBox` | - | - | - | - |
| `Level1_ID` | **كود الحساب المستوى 1** | `RadTextBox` | - | - | - | - |
| `RadLabel14` | **RadLabel14** | `RadLabel` | - | - | - | - |
| `Level2_Name_A` | **اسم الحساب المستوى 2** | `RadTextBox` | - | - | - | - |
| `Level2_ID` | **كود الحساب المستوى 2** | `RadTextBox` | - | - | - | - |
| `RadLabel13` | **RadLabel13** | `RadLabel` | - | - | - | - |
| `Active` | **Active** | `RadCheckBox` | `Level5.Active` | `bit` (NOT NULL) | `((1))` | - |
| `Level4_Name_A` | **اسم الحساب المستوى 4** | `RadTextBox` | - | - | - | - |
| `Level3_ID` | **كود الحساب المستوى 3** | `RadTextBox` | - | - | - | - |
| `Level3_Name_A` | **اسم الحساب المستوى 3** | `RadTextBox` | - | - | - | - |
| `RadLabel6` | **RadLabel6** | `RadLabel` | - | - | - | - |
| `Adap` | **Adap** | `SqlDataAdapter` | - | - | - | - |
| `Adap1` | **Adap1** | `SqlDataAdapter` | - | - | - | - |
| `Adap2` | **Adap2** | `SqlDataAdapter` | - | - | - | - |
| `Adap3` | **Adap3** | `SqlDataAdapter` | - | - | - | - |
| `Adap4` | **Adap4** | `SqlDataAdapter` | - | - | - | - |
| `Adap5` | **Adap5** | `SqlDataAdapter` | - | - | - | - |
| `Adap6` | **Adap6** | `SqlDataAdapter` | - | - | - | - |
| `Permission_Adap` | **Permission_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Delete_Adap` | **زر حذف السجل** | `SqlDataAdapter` | - | - | - | - |
| `Profile_Adap` | **Profile_Adap** | `OleDbDataAdapter` | - | - | - | - |
| `RRS` | **RRS** | `DataSet` | - | - | - | - |
| `RRS1` | **RRS1** | `DataSet` | - | - | - | - |
| `RRS2` | **RRS2** | `DataSet` | - | - | - | - |
| `RRS3` | **RRS3** | `DataSet` | - | - | - | - |
| `RRS4` | **RRS4** | `DataSet` | - | - | - | - |
| `RRS5` | **RRS5** | `DataSet` | - | - | - | - |
| `RRS6` | **RRS6** | `DataSet` | - | - | - | - |
| `Permission_RRS` | **Permission_RRS** | `DataSet` | - | - | - | - |
| `Profile_RRS` | **Profile_RRS** | `DataSet` | - | - | - | - |
| `Delete_RRS` | **زر حذف السجل** | `DataSet` | - | - | - | - |
| `Cmd` | **Cmd** | `SqlCommand` | - | - | - | - |
| `Cmd1` | **Cmd1** | `SqlCommand` | - | - | - | - |
| `Cmd01` | **Cmd01** | `SqlCommand` | - | - | - | - |
| `Cmd02` | **Cmd02** | `SqlCommand` | - | - | - | - |
| `Cmd03` | **Cmd03** | `SqlCommand` | - | - | - | - |
| `Cmd04` | **Cmd04** | `SqlCommand` | - | - | - | - |
| `Cmd05` | **Cmd05** | `SqlCommand` | - | - | - | - |
| `Cmd2` | **Cmd2** | `SqlCommand` | - | - | - | - |
| `Cmd3` | **Cmd3** | `SqlCommand` | - | - | - | - |
| `Cmd4` | **Cmd4** | `SqlCommand` | - | - | - | - |
| `Cmd5` | **Cmd5** | `SqlCommand` | - | - | - | - |
| `Balance_Cmd` | **الرصيد / الفارق** | `SqlCommand` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Dt` | **Dt** | `DataTable` | - | - | - | - |
| `Dt1` | **Dt1** | `DataTable` | - | - | - | - |
| `Dt_RS` | **Dt_RS** | `DataTable` | - | - | - | - |
| `Dt_RS1` | **Dt_RS1** | `DataTable` | - | - | - | - |
| `Dt_RS2` | **Dt_RS2** | `DataTable` | - | - | - | - |
| `Dt_RS6` | **Dt_RS6** | `DataTable` | - | - | - | - |
| `Delete_RS` | **زر حذف السجل** | `DataTable` | - | - | - | - |

#### ب. قواعد التحقق والمعادلات الحسابية (Validation & Business Rules)
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المسـتوى الرابـع 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إختيـار اسم المسـتوى الرابـع 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المستوى الخامـس 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسم المستوى الخامـس 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الأسـم بالأنجليزي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إضافة سجل جديد أثناء عملية التعديل. لأضافة سجل يجب الضغط على الغاء التعديل ثم الضغط على سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إجراء تعديل أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: في حالة الإضافة يجب الضغط على سجل جديد وفي حالة التعديل يجب الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل موجود مسبقاً ولا يمكن حفظه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل غير موجود ولا يمكن تحديثه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء إضافة سجل جديد. للحذف يجب الضغط على الغاء الإضافة ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء تعديل سجل . للحذف يجب الضغط على الغاء التعديل ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد السجل المراد حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل غير موجود ولا يمكن حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء:  لا يمكن حذف السجل لأرتباطه ببيانات في حركة القيود  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level4_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level4_View Where Level3_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level4_View Where Level4_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5 Where Level5_Name_A='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5 Where Level5_Name_E='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level4_View Where Level4_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Level5_ID FROM Level5 Where Level4_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Level5_ID FROM Level5 Where Level4_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Level5_ID FROM Level5 Where Level4_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Order By Level5_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users_Table
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Branches Order By Branche_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users Where User_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level4_View Order By Level4_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5 Where Level5_ID=
```
##### استعلام INSERT على جدول `Level5`:
```sql
Insert Into Level5(Level4_ID,Level5_ID,Level5_Name_A,Level5_Name_E,Active,Entry_ID,Entry_Name,Notice)Values(
```
##### استعلام INSERT على جدول `Level5`:
```sql
Insert Into Inventories(Level4_ID,Inventory_ID,Inventory_Name_A,Inventory_Name_E,Entry_ID,Entry_Name,Notice)Values(
```
##### استعلام INSERT على جدول `Level5`:
```sql
Insert Into Clients(Level4_ID,Client_ID,Client_Name_A,Client_Name_E,Entry_ID,Entry_Name,Notice)Values(
```
##### استعلام INSERT على جدول `Level5`:
```sql
Insert Into Suppliers(Level4_ID,Supplier_ID,Supplier_Name_A,Supplier_Name_E,Entry_ID,Entry_Name,Notice)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5 Where Level5_ID=
```
##### استعلام UPDATE على جدول `Level5`:
```sql
Update Level5 Set Level4_ID=
```
##### استعلام UPDATE على جدول `Level5`:
```sql
Update Inventories Set Level4_ID=
```
##### استعلام UPDATE على جدول `Level5`:
```sql
Update Clients Set Level4_ID=
```
##### استعلام UPDATE على جدول `Level5`:
```sql
Update Suppliers Set Level4_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5 Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM TransMaster_Union Where Level5_ID=
```
##### استعلام DELETE على جدول `Level5`:
```sql
Delete From Level5 where Level5_ID=
```
##### استعلام DELETE على جدول `Level5`:
```sql
Delete From Inventories where Inventory_ID=
```
##### استعلام DELETE على جدول `Level5`:
```sql
Delete From Clients where Client_ID=
```
##### استعلام DELETE على جدول `Level5`:
```sql
Delete From Suppliers where Supplier_ID=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Search_Option1_Click, Search_Option1_KeyDown, Search_Option2_Click, Search_Option2_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Level5_ID_GotFocus, Level5_ID_KeyPress, Level5_ID_KeyDown, Level5_Name_A_GotFocus, Level5_Name_A_KeyPress, Level5_Name_A_KeyDown, Level5_Name_E_GotFocus, Level5_Name_E_KeyPress, Level5_Name_E_KeyDown, Notice_GotFocus, Notice_KeyPress, Notice_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Level4_ID_GotFocus, Level4_ID_KeyDown, Level4_ID_KeyPress, Level4_Name_A_GotFocus, Level4_Gridview_CellClick, Level4_Gridview_CellFormatting, Level4_Gridview_KeyDown, Active_KeyDown, Level1_ID_GotFocus, Level1_ID_KeyDown, Level1_Name_A_GotFocus, Level1_Name_A_KeyDown, Level2_ID_GotFocus, Level2_ID_KeyDown, Level2_Name_A_GotFocus, Level2_Name_A_KeyDown, Level3_ID_GotFocus, Level3_ID_KeyDown, Level3_Name_A_GotFocus, Level3_Name_A_KeyDown, Search_Txt_LostFocus, Level1_ID_LostFocus, Level1_Name_A_LostFocus, Level2_ID_LostFocus, Level2_Name_A_LostFocus, Level3_ID_LostFocus, Level3_Name_A_LostFocus, Level4_ID_LostFocus, Level4_Name_A_LostFocus, Level5_ID_LostFocus, Level5_Name_A_LostFocus, Level5_Name_E_LostFocus, Notice_LostFocus, Dispose, InitializeComponent, get_Search_Option2, set_Search_Option2, get_Windows7Theme1, set_Windows7Theme1, get_Search_Option1, set_Search_Option1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_Level5_Name_E, set_Level5_Name_E, get_GridView, set_GridView, get_Level5_ID, set_Level5_ID, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_Level5_Name_A, set_Level5_Name_A, get_RadLabel1, set_RadLabel1, get_RadLabel2, set_RadLabel2, get_RadLabel5, set_RadLabel5, get_Notice, set_Notice, get_RadLabel3, set_RadLabel3, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadLabel4, set_RadLabel4, get_RadPanel4, set_RadPanel4, get_Level4_ID, set_Level4_ID, get_Level4_Gridview, set_Level4_Gridview, get_Level1_Name_A, set_Level1_Name_A, get_Level1_ID, set_Level1_ID, get_RadLabel14, set_RadLabel14, get_Level2_Name_A, set_Level2_Name_A, get_Level2_ID, set_Level2_ID, get_RadLabel13, set_RadLabel13, get_Active, set_Active, get_Level4_Name_A, set_Level4_Name_A, get_Level3_ID, set_Level3_ID, get_Level3_Name_A, set_Level3_Name_A, get_RadLabel6, set_RadLabel6, Clear_Record, Clear_Data0, Clear_Data, Clear_Data1, Fill_Grid, Fill_Level4_Grid, Lock_Control, Enable_Control, Review_Record, Level5_Form_KeyDown, Level5_Form_Load, Level5_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown
```

---

### 3.6 شاشة: مراكز التكلفة الرئيسية (`Main_Costcenters_Form`)
- **الاسم الإنجليزي:** Main Cost Centers
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** هيكلة وتصنيف مراكز التكلفة والمشروعات على المستوى التجميعي العام
- **جداول قاعدة البيانات المستهدفة:** `Main_Costcenters`

#### أ. كتالوج حقول وعناصر التحكم (Field & Control Catalog Table)
| معرف العنصر (Control ID) | التسمية العربية (Label) | نوع عنصر الواجهة | الربط بقاعدة البيانات (DB Binding) | نوع البيانات والقيود (Type & Constraints) | القيمة الافتراضية | المعادلة / السلوك البرمجي |
|---|---|---|---|---|---|---|
| `Search_Option2` | **حقل / زر البحث** | `RadRadioButton` | - | - | - | - |
| `Windows7Theme1` | **Windows7Theme1** | `Windows7Theme` | - | - | - | - |
| `Save` | **زر حفظ السجل** | `RadButton` | - | - | - | - |
| `Delete` | **زر حذف السجل** | `RadButton` | - | - | - | - |
| `F_Exit` | **F_Exit** | `RadButton` | - | - | - | - |
| `Add` | **زر إضافة جديد** | `RadButton` | - | - | - | - |
| `Modify` | **زر تعديل السجل** | `RadButton` | - | - | - | - |
| `Search_Txt` | **حقل / زر البحث** | `RadTextBox` | - | - | - | - |
| `Main_Costcenter_Name_E` | **اسم مركز التكلفة** | `RadTextBox` | `Main_Costcenters.Main_Costcenter_Name_E` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `GridView` | **GridView** | `RadGridView` | - | - | - | - |
| `Main_Costcenter_ID` | **كود مركز التكلفة** | `RadTextBox` | `Main_Costcenters.Main_Costcenter_ID` | `smallint` (PRIMARY KEY, NOT NULL) | - | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Main_Costcenters.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Main_Costcenters.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `Main_Costcenter_Name_A` | **اسم مركز التكلفة** | `RadTextBox` | `Main_Costcenters.Main_Costcenter_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `RadLabel1` | **RadLabel1** | `RadLabel` | - | - | - | - |
| `RadLabel2` | **RadLabel2** | `RadLabel` | - | - | - | - |
| `RadLabel5` | **RadLabel5** | `RadLabel` | - | - | - | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Main_Costcenters.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `RadLabel3` | **RadLabel3** | `RadLabel` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `Parent_ID` | **Parent_ID** | `RadDropDownList` | `Main_Costcenters.Parent_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `RadLabel4` | **RadLabel4** | `RadLabel` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `Adap` | **Adap** | `SqlDataAdapter` | - | - | - | - |
| `Adap1` | **Adap1** | `SqlDataAdapter` | - | - | - | - |
| `Adap2` | **Adap2** | `SqlDataAdapter` | - | - | - | - |
| `Permission_Adap` | **Permission_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Delete_Adap` | **زر حذف السجل** | `SqlDataAdapter` | - | - | - | - |
| `Profile_Adap` | **Profile_Adap** | `OleDbDataAdapter` | - | - | - | - |
| `RRS` | **RRS** | `DataSet` | - | - | - | - |
| `RRS1` | **RRS1** | `DataSet` | - | - | - | - |
| `RRS2` | **RRS2** | `DataSet` | - | - | - | - |
| `Permission_RRS` | **Permission_RRS** | `DataSet` | - | - | - | - |
| `Profile_RRS` | **Profile_RRS** | `DataSet` | - | - | - | - |
| `Delete_RRS` | **زر حذف السجل** | `DataSet` | - | - | - | - |
| `Cmd` | **Cmd** | `SqlCommand` | - | - | - | - |
| `Cmd1` | **Cmd1** | `SqlCommand` | - | - | - | - |
| `Cmd01` | **Cmd01** | `SqlCommand` | - | - | - | - |
| `Cmd02` | **Cmd02** | `SqlCommand` | - | - | - | - |
| `Cmd03` | **Cmd03** | `SqlCommand` | - | - | - | - |
| `Cmd04` | **Cmd04** | `SqlCommand` | - | - | - | - |
| `Cmd05` | **Cmd05** | `SqlCommand` | - | - | - | - |
| `Cmd2` | **Cmd2** | `SqlCommand` | - | - | - | - |
| `Cmd3` | **Cmd3** | `SqlCommand` | - | - | - | - |
| `Cmd4` | **Cmd4** | `SqlCommand` | - | - | - | - |
| `Cmd5` | **Cmd5** | `SqlCommand` | - | - | - | - |
| `Balance_Cmd` | **الرصيد / الفارق** | `SqlCommand` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Dt` | **Dt** | `DataTable` | - | - | - | - |
| `Dt_RS` | **Dt_RS** | `DataTable` | - | - | - | - |
| `Dt_RS1` | **Dt_RS1** | `DataTable` | - | - | - | - |
| `Delete_RS` | **زر حذف السجل** | `DataTable` | - | - | - | - |

#### ب. قواعد التحقق والمعادلات الحسابية (Validation & Business Rules)
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إختيـار نـوع مركز التكلفـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم مركز التكلفـة الرئيسـي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسم مركز التكلفـة الرئيسـي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الأسـم بالأنجليزي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إضافة سجل جديد أثناء عملية التعديل. لأضافة سجل يجب الضغط على الغاء التعديل ثم الضغط على سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إجراء تعديل أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: في حالة الإضافة يجب الضغط على سجل جديد وفي حالة التعديل يجب الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل موجود مسبقاً ولا يمكن حفظه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل غير موجود ولا يمكن تحديثه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء إضافة سجل جديد. للحذف يجب الضغط على الغاء الإضافة ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء تعديل سجل . للحذف يجب الضغط على الغاء التعديل ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد السجل المراد حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل غير موجود ولا يمكن حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء:  لا يمكن حذف السجل لأرتباطه ببيانات في ملف تأسـيس مراكز التكلفة في الشجرة المحاسـبية  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Main_Costcenter_ID FROM Main_Costcenters Where Parent_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Main_Costcenters Order By Main_Costcenter_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users_Table
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Branches Order By Branche_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users Where User_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Main_Costcenters Where Main_Costcenter_ID=
```
##### استعلام INSERT على جدول `Main_Costcenters`:
```sql
Insert Into Main_Costcenters(Parent_ID,Main_Costcenter_ID,Main_Costcenter_Name_A,Main_Costcenter_Name_E,Entry_ID,Entry_Name,Notice)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Main_Costcenters Where Main_Costcenter_ID=
```
##### استعلام UPDATE على جدول `Main_Costcenters`:
```sql
Update Main_Costcenters Set Parent_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Main_Costcenters Where Main_Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters Where Main_Costcenter_ID=
```
##### استعلام DELETE على جدول `Main_Costcenters`:
```sql
Delete From Main_Costcenters where Main_Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Main_Costcenters Where Main_Costcenter_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Main_Costcenters Where Main_Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Main_Costcenters Where Main_Costcenter_Name_A='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Main_Costcenters Where Main_Costcenter_Name_E='
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Parent_ID_GotFocus, Parent_ID_KeyDown, Parent_ID_LostFocus, Parent_ID_SelectedIndexChanged, Main_Costcenter_ID_LostFocus, Main_Costcenter_Name_A_LostFocus, Main_Costcenter_Name_E_LostFocus, Notice_LostFocus, Search_Txt_LostFocus, RadLabel4_Click, Dispose, InitializeComponent, get_Search_Option2, set_Search_Option2, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_Main_Costcenter_Name_E, set_Main_Costcenter_Name_E, get_GridView, set_GridView, get_Main_Costcenter_ID, set_Main_Costcenter_ID, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_Main_Costcenter_Name_A, set_Main_Costcenter_Name_A, get_RadLabel1, set_RadLabel1, get_RadLabel2, set_RadLabel2, get_RadLabel5, set_RadLabel5, get_Notice, set_Notice, get_RadLabel3, set_RadLabel3, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_Parent_ID, set_Parent_ID, get_RadLabel4, set_RadLabel4, get_RadPanel4, set_RadPanel4, get_AquaTheme1, set_AquaTheme1, Clear_Record, Clear_Data, Clear_Data1, Fill_Grid, Lock_Control, Enable_Control, Review_Record, Main_Costcenters_Form_KeyDown, Main_Costcenters_Form_Load, Main_Costcenters_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Main_Costcenter_ID_GotFocus, Main_Costcenter_ID_KeyPress, Main_Costcenter_ID_KeyDown, Main_Costcenter_Name_A_GotFocus, Main_Costcenter_Name_A_KeyPress, Main_Costcenter_Name_A_KeyDown, Main_Costcenter_Name_E_GotFocus, Main_Costcenter_Name_E_KeyPress, Main_Costcenter_Name_E_KeyDown, Notice_GotFocus, Notice_KeyPress, Notice_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown
```

---

### 3.7 شاشة: مراكز التكلفة الفرعية والتشغيلية (`Costcenters_Form`)
- **الاسم الإنجليزي:** Sub Cost Centers
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** تعريف مراكز التكلفة الفرعية والربط مع الحسابات والمشروعات لتوزيع النفقات والإيرادات
- **جداول قاعدة البيانات المستهدفة:** `Costcenters`

#### أ. كتالوج حقول وعناصر التحكم (Field & Control Catalog Table)
| معرف العنصر (Control ID) | التسمية العربية (Label) | نوع عنصر الواجهة | الربط بقاعدة البيانات (DB Binding) | نوع البيانات والقيود (Type & Constraints) | القيمة الافتراضية | المعادلة / السلوك البرمجي |
|---|---|---|---|---|---|---|
| `Search_Option2` | **حقل / زر البحث** | `RadRadioButton` | - | - | - | - |
| `Windows7Theme1` | **Windows7Theme1** | `Windows7Theme` | - | - | - | - |
| `Save` | **زر حفظ السجل** | `RadButton` | - | - | - | - |
| `Delete` | **زر حذف السجل** | `RadButton` | - | - | - | - |
| `F_Exit` | **F_Exit** | `RadButton` | - | - | - | - |
| `Add` | **زر إضافة جديد** | `RadButton` | - | - | - | - |
| `Modify` | **زر تعديل السجل** | `RadButton` | - | - | - | - |
| `Search_Txt` | **حقل / زر البحث** | `RadTextBox` | - | - | - | - |
| `Costcenter_Name_E` | **اسم مركز التكلفة** | `RadTextBox` | `Costcenters.Costcenter_Name_E` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `GridView` | **GridView** | `RadGridView` | - | - | - | - |
| `Costcenter_ID` | **كود مركز التكلفة** | `RadTextBox` | `Costcenters.Main_Costcenter_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Costcenters.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Costcenters.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `Costcenter_Name_A` | **اسم مركز التكلفة** | `RadTextBox` | `Costcenters.Costcenter_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `RadLabel1` | **RadLabel1** | `RadLabel` | - | - | - | - |
| `RadLabel2` | **RadLabel2** | `RadLabel` | - | - | - | - |
| `RadLabel5` | **RadLabel5** | `RadLabel` | - | - | - | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Costcenters.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `RadLabel3` | **RadLabel3** | `RadLabel` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadLabel4` | **RadLabel4** | `RadLabel` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `Main_Costcenter_ID` | **كود مركز التكلفة** | `RadTextBox` | `Costcenters.Main_Costcenter_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `Main_Costcenters_Gridview` | **Main_Costcenters_Gridview** | `RadGridView` | - | - | - | - |
| `Main_Costcenter_Name_A` | **اسم مركز التكلفة** | `RadTextBox` | `Costcenters.Costcenter_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `Adap` | **Adap** | `SqlDataAdapter` | - | - | - | - |
| `Adap1` | **Adap1** | `SqlDataAdapter` | - | - | - | - |
| `Adap2` | **Adap2** | `SqlDataAdapter` | - | - | - | - |
| `Adap3` | **Adap3** | `SqlDataAdapter` | - | - | - | - |
| `Adap4` | **Adap4** | `SqlDataAdapter` | - | - | - | - |
| `Adap5` | **Adap5** | `SqlDataAdapter` | - | - | - | - |
| `Adap6` | **Adap6** | `SqlDataAdapter` | - | - | - | - |
| `Permission_Adap` | **Permission_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Delete_Adap` | **زر حذف السجل** | `SqlDataAdapter` | - | - | - | - |
| `Profile_Adap` | **Profile_Adap** | `OleDbDataAdapter` | - | - | - | - |
| `RRS` | **RRS** | `DataSet` | - | - | - | - |
| `RRS1` | **RRS1** | `DataSet` | - | - | - | - |
| `RRS2` | **RRS2** | `DataSet` | - | - | - | - |
| `RRS3` | **RRS3** | `DataSet` | - | - | - | - |
| `RRS4` | **RRS4** | `DataSet` | - | - | - | - |
| `RRS5` | **RRS5** | `DataSet` | - | - | - | - |
| `RRS6` | **RRS6** | `DataSet` | - | - | - | - |
| `Permission_RRS` | **Permission_RRS** | `DataSet` | - | - | - | - |
| `Profile_RRS` | **Profile_RRS** | `DataSet` | - | - | - | - |
| `Delete_RRS` | **زر حذف السجل** | `DataSet` | - | - | - | - |
| `Cmd` | **Cmd** | `SqlCommand` | - | - | - | - |
| `Cmd1` | **Cmd1** | `SqlCommand` | - | - | - | - |
| `Cmd01` | **Cmd01** | `SqlCommand` | - | - | - | - |
| `Cmd02` | **Cmd02** | `SqlCommand` | - | - | - | - |
| `Cmd03` | **Cmd03** | `SqlCommand` | - | - | - | - |
| `Cmd04` | **Cmd04** | `SqlCommand` | - | - | - | - |
| `Cmd05` | **Cmd05** | `SqlCommand` | - | - | - | - |
| `Cmd2` | **Cmd2** | `SqlCommand` | - | - | - | - |
| `Cmd3` | **Cmd3** | `SqlCommand` | - | - | - | - |
| `Cmd4` | **Cmd4** | `SqlCommand` | - | - | - | - |
| `Cmd5` | **Cmd5** | `SqlCommand` | - | - | - | - |
| `Balance_Cmd` | **الرصيد / الفارق** | `SqlCommand` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Dt_RS` | **Dt_RS** | `DataTable` | - | - | - | - |
| `Dt_RS1` | **Dt_RS1** | `DataTable` | - | - | - | - |
| `Dt_RS2` | **Dt_RS2** | `DataTable` | - | - | - | - |
| `Dt_RS6` | **Dt_RS6** | `DataTable` | - | - | - | - |
| `Delete_RS` | **زر حذف السجل** | `DataTable` | - | - | - | - |
| `Dt` | **Dt** | `DataTable` | - | - | - | - |
| `Dt1` | **Dt1** | `DataTable` | - | - | - | - |

#### ب. قواعد التحقق والمعادلات الحسابية (Validation & Business Rules)
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المسـتوى الأول 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إختيـار اسم المسـتوى الأول 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المسـتوى الثاني 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسم المسـتوى الثاني 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الأسـم بالأنجليزي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إضافة سجل جديد أثناء عملية التعديل. لأضافة سجل يجب الضغط على الغاء التعديل ثم الضغط على سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إجراء تعديل أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: في حالة الإضافة يجب الضغط على سجل جديد وفي حالة التعديل يجب الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل موجود مسبقاً ولا يمكن حفظه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل غير موجود ولا يمكن تحديثه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء إضافة سجل جديد. للحذف يجب الضغط على الغاء الإضافة ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء تعديل سجل . للحذف يجب الضغط على الغاء التعديل ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد السجل المراد حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل غير موجود ولا يمكن حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Main_Costcenters Where Main_Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Costcenter_ID FROM Costcenters Where Main_Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Costcenter_ID FROM Costcenters Where Main_Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Costcenter_ID FROM Costcenters Where Main_Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters_View Order By Costcenter_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users_Table
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Branches Order By Branche_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users Where User_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Main_Costcenters Order By Main_Costcenter_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters Where Costcenter_ID=
```
##### استعلام INSERT على جدول `Costcenters`:
```sql
Insert Into Costcenters(Main_Costcenter_ID,Costcenter_ID,Costcenter_Name_A,Costcenter_Name_E,Entry_ID,Entry_Name,Notice)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters Where Costcenter_ID=
```
##### استعلام UPDATE على جدول `Costcenters`:
```sql
Update Costcenters Set Main_Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters Where Costcenter_ID=
```
##### استعلام DELETE على جدول `Costcenters`:
```sql
Delete From Costcenters where Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters_View Where Costcenter_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Main_Costcenters Where Main_Costcenter_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters_View Where Main_Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters_View Where Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters_View Where Main_Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters Where Costcenter_Name_A='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters_View Where Main_Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters Where Costcenter_Name_E='
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Notice_GotFocus, Notice_KeyPress, Notice_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Main_Costcenter_ID_GotFocus, Main_Costcenter_ID_KeyDown, Main_Costcenter_ID_KeyPress, Main_Costcenters_Gridview_CellClick, Main_Costcenters_Gridview_CellFormatting, Main_Costcenters_Gridview_KeyDown, Search_Txt_LostFocus, Notice_LostFocus, Main_Costcenter_ID_LostFocus, Costcenter_ID_LostFocus, Costcenter_Name_A_LostFocus, Costcenter_Name_E_LostFocus, Main_Costcenter_Name_A_GotFocus, Main_Costcenter_Name_A_LostFocus, Dispose, InitializeComponent, get_Search_Option2, set_Search_Option2, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_Costcenter_Name_E, set_Costcenter_Name_E, get_GridView, set_GridView, get_Costcenter_ID, set_Costcenter_ID, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_Costcenter_Name_A, set_Costcenter_Name_A, get_RadLabel1, set_RadLabel1, get_RadLabel2, set_RadLabel2, get_RadLabel5, set_RadLabel5, get_Notice, set_Notice, get_RadLabel3, set_RadLabel3, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadLabel4, set_RadLabel4, get_RadPanel4, set_RadPanel4, get_Main_Costcenter_ID, set_Main_Costcenter_ID, get_Main_Costcenters_Gridview, set_Main_Costcenters_Gridview, get_Main_Costcenter_Name_A, set_Main_Costcenter_Name_A, get_AquaTheme1, set_AquaTheme1, Clear_Record, Clear_Data, Fill_Grid, Fill_Main_Costcenters_Grid, Lock_Control, Enable_Control, Review_Record, Costcenters_Form_KeyDown, Costcenters_Form_Load, Costcenters_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Option2_Click, Search_Option2_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Costcenter_ID_GotFocus, Costcenter_ID_KeyPress, Costcenter_ID_KeyDown, Costcenter_Name_A_GotFocus, Costcenter_Name_A_KeyPress, Costcenter_Name_A_KeyDown, Costcenter_Name_E_GotFocus, Costcenter_Name_E_KeyPress, Costcenter_Name_E_KeyDown
```

---

### 3.8 شاشة: الحسابات التحليلية (`Accounts_Analysis_Form`)
- **الاسم الإنجليزي:** Analytical Accounts Directory
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** إدارة وتصنيف الحسابات التحليلية للمشروعات والأنشطة والتحليلات الخاصة
- **جداول قاعدة البيانات المستهدفة:** `Accounts_Analysis`

#### أ. كتالوج حقول وعناصر التحكم (Field & Control Catalog Table)
| معرف العنصر (Control ID) | التسمية العربية (Label) | نوع عنصر الواجهة | الربط بقاعدة البيانات (DB Binding) | نوع البيانات والقيود (Type & Constraints) | القيمة الافتراضية | المعادلة / السلوك البرمجي |
|---|---|---|---|---|---|---|
| `Search_Option2` | **حقل / زر البحث** | `RadRadioButton` | - | - | - | - |
| `Windows7Theme1` | **Windows7Theme1** | `Windows7Theme` | - | - | - | - |
| `Search_Option1` | **حقل / زر البحث** | `RadRadioButton` | - | - | - | - |
| `Save` | **زر حفظ السجل** | `RadButton` | - | - | - | - |
| `Delete` | **زر حذف السجل** | `RadButton` | - | - | - | - |
| `F_Exit` | **F_Exit** | `RadButton` | - | - | - | - |
| `Add` | **زر إضافة جديد** | `RadButton` | - | - | - | - |
| `Modify` | **زر تعديل السجل** | `RadButton` | - | - | - | - |
| `Search_Txt` | **حقل / زر البحث** | `RadTextBox` | - | - | - | - |
| `Analysis_Name_E` | **اسم الحساب التحليلي** | `RadTextBox` | `Accounts_Analysis.Analysis_Name_E` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `GridView` | **GridView** | `RadGridView` | - | - | - | - |
| `Analysis_ID` | **كود الحساب التحليلي** | `RadTextBox` | `Accounts_Analysis.Analysis_ID` | `numeric` (PRIMARY KEY, NOT NULL) | - | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Accounts_Analysis.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Accounts_Analysis.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `Analysis_Name_A` | **اسم الحساب التحليلي** | `RadTextBox` | `Accounts_Analysis.Analysis_Name_A` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `RadLabel1` | **RadLabel1** | `RadLabel` | - | - | - | - |
| `RadLabel2` | **RadLabel2** | `RadLabel` | - | - | - | - |
| `RadLabel5` | **RadLabel5** | `RadLabel` | - | - | - | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Accounts_Analysis.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `RadLabel3` | **RadLabel3** | `RadLabel` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadLabel4` | **RadLabel4** | `RadLabel` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `Level4_ID` | **كود الحساب المستوى 4** | `RadTextBox` | `Accounts_Analysis.Level4_ID` | `int` (NOT NULL) | `((0))` | - |
| `Level4_Gridview` | **Level4_Gridview** | `RadGridView` | - | - | - | - |
| `Level1_Name_A` | **اسم الحساب المستوى 1** | `RadTextBox` | - | - | - | - |
| `Level1_ID` | **كود الحساب المستوى 1** | `RadTextBox` | - | - | - | - |
| `RadLabel14` | **RadLabel14** | `RadLabel` | - | - | - | - |
| `Level2_Name_A` | **اسم الحساب المستوى 2** | `RadTextBox` | - | - | - | - |
| `Level2_ID` | **كود الحساب المستوى 2** | `RadTextBox` | - | - | - | - |
| `RadLabel13` | **RadLabel13** | `RadLabel` | - | - | - | - |
| `Active` | **Active** | `RadCheckBox` | `Accounts_Analysis.Active` | `bit` (NOT NULL) | `((1))` | - |
| `Level4_Name_A` | **اسم الحساب المستوى 4** | `RadTextBox` | - | - | - | - |
| `Level3_ID` | **كود الحساب المستوى 3** | `RadTextBox` | - | - | - | - |
| `Level3_Name_A` | **اسم الحساب المستوى 3** | `RadTextBox` | - | - | - | - |
| `RadLabel6` | **RadLabel6** | `RadLabel` | - | - | - | - |
| `Adap` | **Adap** | `SqlDataAdapter` | - | - | - | - |
| `Adap1` | **Adap1** | `SqlDataAdapter` | - | - | - | - |
| `Adap2` | **Adap2** | `SqlDataAdapter` | - | - | - | - |
| `Adap3` | **Adap3** | `SqlDataAdapter` | - | - | - | - |
| `Adap4` | **Adap4** | `SqlDataAdapter` | - | - | - | - |
| `Adap5` | **Adap5** | `SqlDataAdapter` | - | - | - | - |
| `Adap6` | **Adap6** | `SqlDataAdapter` | - | - | - | - |
| `Permission_Adap` | **Permission_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Delete_Adap` | **زر حذف السجل** | `SqlDataAdapter` | - | - | - | - |
| `Profile_Adap` | **Profile_Adap** | `OleDbDataAdapter` | - | - | - | - |
| `RRS` | **RRS** | `DataSet` | - | - | - | - |
| `RRS1` | **RRS1** | `DataSet` | - | - | - | - |
| `RRS2` | **RRS2** | `DataSet` | - | - | - | - |
| `RRS3` | **RRS3** | `DataSet` | - | - | - | - |
| `RRS4` | **RRS4** | `DataSet` | - | - | - | - |
| `RRS5` | **RRS5** | `DataSet` | - | - | - | - |
| `RRS6` | **RRS6** | `DataSet` | - | - | - | - |
| `Permission_RRS` | **Permission_RRS** | `DataSet` | - | - | - | - |
| `Profile_RRS` | **Profile_RRS** | `DataSet` | - | - | - | - |
| `Delete_RRS` | **زر حذف السجل** | `DataSet` | - | - | - | - |
| `Cmd` | **Cmd** | `SqlCommand` | - | - | - | - |
| `Cmd1` | **Cmd1** | `SqlCommand` | - | - | - | - |
| `Cmd01` | **Cmd01** | `SqlCommand` | - | - | - | - |
| `Cmd02` | **Cmd02** | `SqlCommand` | - | - | - | - |
| `Cmd03` | **Cmd03** | `SqlCommand` | - | - | - | - |
| `Cmd04` | **Cmd04** | `SqlCommand` | - | - | - | - |
| `Cmd05` | **Cmd05** | `SqlCommand` | - | - | - | - |
| `Cmd2` | **Cmd2** | `SqlCommand` | - | - | - | - |
| `Cmd3` | **Cmd3** | `SqlCommand` | - | - | - | - |
| `Cmd4` | **Cmd4** | `SqlCommand` | - | - | - | - |
| `Cmd5` | **Cmd5** | `SqlCommand` | - | - | - | - |
| `Balance_Cmd` | **الرصيد / الفارق** | `SqlCommand` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Dt` | **Dt** | `DataTable` | - | - | - | - |
| `Dt1` | **Dt1** | `DataTable` | - | - | - | - |
| `Dt_RS` | **Dt_RS** | `DataTable` | - | - | - | - |
| `Dt_RS1` | **Dt_RS1** | `DataTable` | - | - | - | - |
| `Dt_RS2` | **Dt_RS2** | `DataTable` | - | - | - | - |
| `Dt_RS6` | **Dt_RS6** | `DataTable` | - | - | - | - |
| `Delete_RS` | **زر حذف السجل** | `DataTable` | - | - | - | - |

#### ب. قواعد التحقق والمعادلات الحسابية (Validation & Business Rules)
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المسـتوى الرابـع 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إختيـار اسم المسـتوى الرابـع 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المستوى الخامـس 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسم المستوى الخامـس 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الأسـم بالأنجليزي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إضافة سجل جديد أثناء عملية التعديل. لأضافة سجل يجب الضغط على الغاء التعديل ثم الضغط على سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إجراء تعديل أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: في حالة الإضافة يجب الضغط على سجل جديد وفي حالة التعديل يجب الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل موجود مسبقاً ولا يمكن حفظه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل غير موجود ولا يمكن تحديثه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء إضافة سجل جديد. للحذف يجب الضغط على الغاء الإضافة ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء تعديل سجل . للحذف يجب الضغط على الغاء التعديل ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد السجل المراد حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل غير موجود ولا يمكن حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Where Level4_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Where Analysis_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level4_View Where Level3_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level4_View Where Level4_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Where Analysis_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Where Analysis_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Where Analysis_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis Where Analysis_Name_A='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Where Analysis_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis Where Analysis_Name_E='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level4_View Where Level4_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Analysis_ID FROM Accounts_Analysis Where Level4_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Analysis_ID FROM Accounts_Analysis Where Level4_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Analysis_ID FROM Accounts_Analysis Where Level4_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Order By Analysis_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users_Table
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Branches Order By Branche_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users Where User_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level4_View Order By Level4_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis Where Analysis_ID=
```
##### استعلام INSERT على جدول `Accounts_Analysis`:
```sql
Insert Into Accounts_Analysis(Level4_ID,Analysis_ID,Analysis_Name_A,Analysis_Name_E,Active,Entry_ID,Entry_Name,Notice)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis Where Analysis_ID=
```
##### استعلام UPDATE على جدول `Accounts_Analysis`:
```sql
Update Accounts_Analysis Set Level4_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis Where Analysis_ID=
```
##### استعلام DELETE على جدول `Accounts_Analysis`:
```sql
Delete From Accounts_Analysis where Analysis_ID=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Search_Option1_Click, Search_Option1_KeyDown, Search_Option2_Click, Search_Option2_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Analysis_ID_GotFocus, Analysis_ID_KeyPress, Analysis_ID_KeyDown, Analysis_Name_A_GotFocus, Analysis_Name_A_KeyPress, Analysis_Name_A_KeyDown, Analysis_Name_E_GotFocus, Analysis_Name_E_KeyPress, Analysis_Name_E_KeyDown, Notice_GotFocus, Notice_KeyPress, Notice_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Level4_ID_GotFocus, Level4_ID_KeyDown, Level4_ID_KeyPress, Level4_Name_A_GotFocus, Level4_Gridview_CellClick, Level4_Gridview_CellFormatting, Level4_Gridview_KeyDown, Active_KeyDown, Level1_ID_GotFocus, Level1_ID_KeyDown, Level1_Name_A_GotFocus, Level1_Name_A_KeyDown, Level2_ID_GotFocus, Level2_ID_KeyDown, Level2_Name_A_GotFocus, Level2_Name_A_KeyDown, Level3_ID_GotFocus, Level3_ID_KeyDown, Level3_Name_A_GotFocus, Level3_Name_A_KeyDown, Search_Txt_LostFocus, Level1_ID_LostFocus, Level1_Name_A_LostFocus, Level2_ID_LostFocus, Level2_Name_A_LostFocus, Level3_ID_LostFocus, Level3_Name_A_LostFocus, Level4_ID_LostFocus, Level4_Name_A_LostFocus, Analysis_ID_LostFocus, Analysis_Name_A_LostFocus, Analysis_Name_E_LostFocus, Notice_LostFocus, Dispose, InitializeComponent, get_Search_Option2, set_Search_Option2, get_Windows7Theme1, set_Windows7Theme1, get_Search_Option1, set_Search_Option1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_Analysis_Name_E, set_Analysis_Name_E, get_GridView, set_GridView, get_Analysis_ID, set_Analysis_ID, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_Analysis_Name_A, set_Analysis_Name_A, get_RadLabel1, set_RadLabel1, get_RadLabel2, set_RadLabel2, get_RadLabel5, set_RadLabel5, get_Notice, set_Notice, get_RadLabel3, set_RadLabel3, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadLabel4, set_RadLabel4, get_RadPanel4, set_RadPanel4, get_Level4_ID, set_Level4_ID, get_Level4_Gridview, set_Level4_Gridview, get_Level1_Name_A, set_Level1_Name_A, get_Level1_ID, set_Level1_ID, get_RadLabel14, set_RadLabel14, get_Level2_Name_A, set_Level2_Name_A, get_Level2_ID, set_Level2_ID, get_RadLabel13, set_RadLabel13, get_Active, set_Active, get_Level4_Name_A, set_Level4_Name_A, get_Level3_ID, set_Level3_ID, get_Level3_Name_A, set_Level3_Name_A, get_RadLabel6, set_RadLabel6, Clear_Record, Clear_Data0, Clear_Data, Clear_Data1, Fill_Grid, Fill_Level4_Grid, Lock_Control, Enable_Control, Review_Record, Accounts_Analysis_Form_KeyDown, Accounts_Analysis_Form_Load, Accounts_Analysis_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown
```

---

### 3.9 شاشة: سندات قيود اليومية العامة (`GeneralLedger_Form`)
- **الاسم الإنجليزي:** General Ledger Journal Vouchers
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** تسجيل وترحيل قيود اليومية العامة، تفاصيل سطور القيد، فحص التوازن المحاسبي، والمطابقة
- **جداول قاعدة البيانات المستهدفة:** `GeneralLedger_Head`, `GeneralLedger_Details`

#### أ. كتالوج حقول وعناصر التحكم (Field & Control Catalog Table)
| معرف العنصر (Control ID) | التسمية العربية (Label) | نوع عنصر الواجهة | الربط بقاعدة البيانات (DB Binding) | نوع البيانات والقيود (Type & Constraints) | القيمة الافتراضية | المعادلة / السلوك البرمجي |
|---|---|---|---|---|---|---|
| `Windows7Theme1` | **Windows7Theme1** | `Windows7Theme` | - | - | - | - |
| `Search_Option1` | **حقل / زر البحث** | `RadRadioButton` | - | - | - | - |
| `Save` | **زر حفظ السجل** | `RadButton` | - | - | - | - |
| `Delete` | **زر حذف السجل** | `RadButton` | - | - | - | - |
| `F_Exit` | **F_Exit** | `RadButton` | - | - | - | - |
| `Print` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Add` | **زر إضافة جديد** | `RadButton` | - | - | - | - |
| `Modify` | **زر تعديل السجل** | `RadButton` | - | - | - | - |
| `Search_Txt` | **حقل / زر البحث** | `RadTextBox` | - | - | - | - |
| `GridView` | **GridView** | `RadGridView` | - | - | - | - |
| `Note_No` | **رقم الحركة / السند** | `RadTextBox` | `GeneralLedger_Head.Note_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `GeneralLedger_Head.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `GeneralLedger_Head.Entry_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `Note_Date` | **تاريخ الحركة** | `RadDateTimePicker` | `GeneralLedger_Head.Note_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Note_SR` | **مسلسل السطر** | `RadTextBox` | `GeneralLedger_Details.SR` | `smallint` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `Transaction_Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `GeneralLedger_Details.Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `RadTextBox` | `GeneralLedger_Head.Note_Net_Text` | `nvarchar(300)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `RadPanel7` | **RadPanel7** | `RadPanel` | - | - | - | - |
| `Note_Description` | **البيان / الشرح** | `RadTextBox` | `GeneralLedger_Head.Description` | `nvarchar(300)` (NOT NULL) | `(' ')` | - |
| `Transaction_Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Label19` | **Label19** | `Label` | - | - | - | - |
| `Add_Transaction` | **زر إضافة جديد** | `RadButton` | - | - | - | - |
| `Transaction_Debit` | **المبلغ مدين** | `RadTextBox` | `GeneralLedger_Details.Debit` | `float` (NOT NULL) | `((0))` | - |
| `Transaction_Description` | **البيان / الشرح** | `RadTextBox` | `GeneralLedger_Head.Description` | `nvarchar(300)` (NOT NULL) | `(' ')` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `Note_Debit` | **المبلغ مدين** | `RadTextBox` | `GeneralLedger_Head.Note_Debit` | `float` (NOT NULL) | `((0))` | - |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Label7` | **Label7** | `Label` | - | - | - | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Label15` | **Label15** | `Label` | - | - | - | - |
| `Label16` | **Label16** | `Label` | - | - | - | - |
| `Label17` | **Label17** | `Label` | - | - | - | - |
| `Label20` | **Label20** | `Label` | - | - | - | - |
| `Transaction_Costcenter_Name_A` | **اسم مركز التكلفة** | `RadTextBox` | - | - | - | - |
| `Transaction_Costcenter_ID` | **كود مركز التكلفة** | `RadTextBox` | `GeneralLedger_Details.Costcenter_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Transaction_Analyse1` | **Transaction_Analyse1** | `RadTextBox` | `GeneralLedger_Details.Analyse1` | `nvarchar(200)` (NOT NULL) | `((0))` | - |
| `Costcenters_GridView` | **Costcenters_GridView** | `RadGridView` | - | - | - | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Transaction_Credit` | **المبلغ دائن** | `RadTextBox` | `GeneralLedger_Details.Credit` | `float` (NOT NULL) | `((0))` | - |
| `Note_Credit` | **المبلغ دائن** | `RadTextBox` | `GeneralLedger_Head.Note_Credit` | `float` (NOT NULL) | `((0))` | - |
| `Note_Balance` | **الرصيد / الفارق** | `Label` | - | - | - | `ABS(Note_Debit - Note_Credit) == 0 [Debit/Credit Equality Constraint]` |
| `Transaction_Analyse2` | **Transaction_Analyse2** | `RadTextBox` | `GeneralLedger_Details.Analyse2` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Transaction_Analysis_Name_A` | **اسم الحساب التحليلي** | `RadTextBox` | - | - | - | - |
| `Transaction_Analysis_ID` | **كود الحساب التحليلي** | `RadTextBox` | `GeneralLedger_Details.Analysis_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label12` | **Label12** | `Label` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Transaction_Actual_Credit` | **المبلغ دائن** | `RadTextBox` | `GeneralLedger_Details.Actual_Credit` | `float` (NOT NULL) | `((0))` | - |
| `Transaction_Actual_Debit` | **المبلغ مدين** | `RadTextBox` | `GeneralLedger_Details.Actual_Debit` | `float` (NOT NULL) | `((0))` | - |
| `Transaction_Currency_Name_A` | **اسم العملة** | `RadTextBox` | - | - | - | - |
| `Transaction_Exchange` | **سعر الصرف** | `RadTextBox` | `GeneralLedger_Details.Exchange` | `float` (NOT NULL) | `((1))` | - |
| `Label10` | **Label10** | `Label` | - | - | - | - |
| `Label11` | **Label11** | `Label` | - | - | - | - |
| `Transaction_Currency_ID` | **كود العملة** | `RadTextBox` | `GeneralLedger_Details.Currency_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `Adjustment_GridView` | **Adjustment_GridView** | `RadGridView` | - | - | - | - |
| `Analysis_GridView` | **Analysis_GridView** | `RadGridView` | - | - | - | - |
| `Currency_GridView` | **Currency_GridView** | `RadGridView` | - | - | - | - |
| `RadButton3` | **RadButton3** | `RadButton` | - | - | - | - |
| `RadButton1` | **RadButton1** | `RadButton` | - | - | - | - |
| `RadButton2` | **RadButton2** | `RadButton` | - | - | - | - |
| `Label8` | **Label8** | `Label` | - | - | - | - |
| `Flag` | **حالة الاعتماد / التأكيد** | `RadCheckBox` | `GeneralLedger_Head.Flag` | `bit` (NOT NULL) | `((0))` | - |
| `Balance_Adap` | **الرصيد / الفارق** | `SqlDataAdapter` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Adap_Print` | **زر طباعة التقرير / السند** | `SqlDataAdapter` | - | - | - | - |
| `Adap_H` | **Adap_H** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D` | **Adap_D** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D_V` | **Adap_D_V** | `SqlDataAdapter` | - | - | - | - |
| `Adap` | **Adap** | `SqlDataAdapter` | - | - | - | - |
| `Adap1` | **Adap1** | `SqlDataAdapter` | - | - | - | - |
| `Adap2` | **Adap2** | `SqlDataAdapter` | - | - | - | - |
| `Adap2_1` | **Adap2_1** | `SqlDataAdapter` | - | - | - | - |
| `Adap2_2` | **Adap2_2** | `SqlDataAdapter` | - | - | - | - |
| `Adap2_3` | **Adap2_3** | `SqlDataAdapter` | - | - | - | - |
| `Adap3` | **Adap3** | `SqlDataAdapter` | - | - | - | - |
| `Adap3_1` | **Adap3_1** | `SqlDataAdapter` | - | - | - | - |
| `Adap4` | **Adap4** | `SqlDataAdapter` | - | - | - | - |
| `Adap5` | **Adap5** | `SqlDataAdapter` | - | - | - | - |
| `Adap6` | **Adap6** | `SqlDataAdapter` | - | - | - | - |
| `Permission_Adap` | **Permission_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Delete_Adap` | **زر حذف السجل** | `SqlDataAdapter` | - | - | - | - |
| `Setting_Adap` | **Setting_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Setting_Adap1` | **Setting_Adap1** | `SqlDataAdapter` | - | - | - | - |
| `Link_Adap` | **Link_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Profile_Adap` | **Profile_Adap** | `OleDbDataAdapter` | - | - | - | - |
| `Balance_RRS` | **الرصيد / الفارق** | `DataSet` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `RRS_Print` | **زر طباعة التقرير / السند** | `DataSet` | - | - | - | - |
| `RRS_H` | **RRS_H** | `DataSet` | - | - | - | - |
| `RRS_D` | **RRS_D** | `DataSet` | - | - | - | - |
| `RRS_D_V` | **RRS_D_V** | `DataSet` | - | - | - | - |
| `RRS` | **RRS** | `DataSet` | - | - | - | - |
| `RRS1` | **RRS1** | `DataSet` | - | - | - | - |
| `RRS2` | **RRS2** | `DataSet` | - | - | - | - |
| `RRS2_1` | **RRS2_1** | `DataSet` | - | - | - | - |
| `RRS2_2` | **RRS2_2** | `DataSet` | - | - | - | - |
| `RRS2_3` | **RRS2_3** | `DataSet` | - | - | - | - |
| `RRS3` | **RRS3** | `DataSet` | - | - | - | - |
| `RRS3_1` | **RRS3_1** | `DataSet` | - | - | - | - |
| `RRS4` | **RRS4** | `DataSet` | - | - | - | - |
| `RRS5` | **RRS5** | `DataSet` | - | - | - | - |
| `RRS6` | **RRS6** | `DataSet` | - | - | - | - |
| `Permission_RRS` | **Permission_RRS** | `DataSet` | - | - | - | - |
| `Profile_RRS` | **Profile_RRS** | `DataSet` | - | - | - | - |
| `Delete_RRS` | **زر حذف السجل** | `DataSet` | - | - | - | - |
| `Setting_RRS` | **Setting_RRS** | `DataSet` | - | - | - | - |
| `Setting_RRS1` | **Setting_RRS1** | `DataSet` | - | - | - | - |
| `Link_RRS` | **Link_RRS** | `DataSet` | - | - | - | - |
| `Cmd` | **Cmd** | `SqlCommand` | - | - | - | - |
| `Cmd1` | **Cmd1** | `SqlCommand` | - | - | - | - |
| `Cmd01` | **Cmd01** | `SqlCommand` | - | - | - | - |
| `Cmd001` | **Cmd001** | `SqlCommand` | - | - | - | - |
| `Cmd02` | **Cmd02** | `SqlCommand` | - | - | - | - |
| `Cmd03` | **Cmd03** | `SqlCommand` | - | - | - | - |
| `Cmd04` | **Cmd04** | `SqlCommand` | - | - | - | - |
| `Cmd05` | **Cmd05** | `SqlCommand` | - | - | - | - |
| `Cmd06` | **Cmd06** | `SqlCommand` | - | - | - | - |
| `Cmd2` | **Cmd2** | `SqlCommand` | - | - | - | - |
| `Cmd3` | **Cmd3** | `SqlCommand` | - | - | - | - |
| `Cmd4` | **Cmd4** | `SqlCommand` | - | - | - | - |
| `Cmd5` | **Cmd5** | `SqlCommand` | - | - | - | - |
| `Cmd6` | **Cmd6** | `SqlCommand` | - | - | - | - |
| `Balance_Cmd` | **الرصيد / الفارق** | `SqlCommand` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Dt` | **Dt** | `DataTable` | - | - | - | - |
| `Dt_D` | **Dt_D** | `DataTable` | - | - | - | - |
| `Clean_D` | **Clean_D** | `DataTable` | - | - | - | - |
| `Dt1` | **Dt1** | `DataTable` | - | - | - | - |
| `Dt2` | **Dt2** | `DataTable` | - | - | - | - |
| `Dt3` | **Dt3** | `DataTable` | - | - | - | - |
| `Dt4` | **Dt4** | `DataTable` | - | - | - | - |
| `Dt5` | **Dt5** | `DataTable` | - | - | - | - |
| `Dt6` | **Dt6** | `DataTable` | - | - | - | - |
| `Dt_RS` | **Dt_RS** | `DataTable` | - | - | - | - |
| `Dt_RS1` | **Dt_RS1** | `DataTable` | - | - | - | - |
| `Dt_RS2` | **Dt_RS2** | `DataTable` | - | - | - | - |
| `Dt_RS3` | **Dt_RS3** | `DataTable` | - | - | - | - |
| `Dt_RS6` | **Dt_RS6** | `DataTable` | - | - | - | - |
| `Delete_RS` | **زر حذف السجل** | `DataTable` | - | - | - | - |
| `Setting_Dt` | **Setting_Dt** | `DataTable` | - | - | - | - |
| `Link_Dt` | **Link_Dt** | `DataTable` | - | - | - | - |

#### ب. قواعد التحقق والمعادلات الحسابية (Validation & Business Rules)
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إضافة سجل جديد أثناء عملية التعديل. لأضافة سجل يجب الضغط على الغاء التعديل ثم الضغط على سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إجراء تعديل أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: في حالة الإضافة يجب الضغط على سجل جديد وفي حالة التعديل يجب الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السند غير موجود ويجب حفظه أولاً  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء إضافة سجل جديد. للحذف يجب الضغط على الغاء الإضافة ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء تعديل سجل . للحذف يجب الضغط على الغاء التعديل ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد السجل المراد حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل غير موجود ولا يمكن حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيـد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الحساب 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الحساب 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم التحليل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسم التحليل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم مركز التكلفة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسم مركز التكلفة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال قيمة بأي حقل من مدين أو دائن 
- **[Calculation]** حساب تلقائي لحقل الصافي تفقيطاً (كتابة بالكلمات): Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: ABS(Note_Debit - Note_Credit) == 0 [Debit/Credit Equality Constraint] (المعادلة: `ABS(Note_Debit - Note_Credit) == 0 [Debit/Credit Equality Constraint]`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM GeneralLedger_Head_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select SR,Level5_ID,Level5_Name_A,Description,Currency_ID,Currency_Name_A,Exchange,Actual_Debit,Debit,Actual_Credit,Credit,Analysis_ID,Analysis_Name_A,Costcenter_ID,Costcenter_Name_A,Analyse1,Analyse2,Flag FROM GeneralLedger_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters_View Where Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Currencies Where Currency_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Where Analysis_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM GeneralLedger_Head_View Order By Note_No DESC
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users_Table
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Branches Order By Branche_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users Where User_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Journals_Settings Where ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Sales_Settings Where ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Order By Level5_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters_View Order By Costcenter_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Order By Analysis_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Currencies Order By Currency_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM GeneralLedger_Head Order By Note_No Desc
```
##### استعلام INSERT على جدول `GeneralLedger_Head`:
```sql
Insert Into GeneralLedger_Head(Note_No,Note_Date,Description,Note_Debit,Note_Credit,Note_Net_Text,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `GeneralLedger_Details`:
```sql
Insert Into GeneralLedger_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Actual_Credit,Credit,Analysis_ID,Costcenter_ID,Analyse1,Analyse2,Flag)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM GeneralLedger_Head Where Note_No=
```
##### استعلام UPDATE على جدول `GeneralLedger_Head`:
```sql
Update GeneralLedger_Head Set Note_No=
```
##### استعلام DELETE على جدول `GeneralLedger_Details`:
```sql
Delete From GeneralLedger_Details Where Note_No=
```
##### استعلام INSERT على جدول `GeneralLedger_Details`:
```sql
Insert Into GeneralLedger_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Actual_Credit,Credit,Analysis_ID,Costcenter_ID,Analyse1,Analyse2,Flag)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM GeneralLedger_Head Where Note_No=
```
##### استعلام DELETE على جدول `GeneralLedger_Head`:
```sql
Delete From GeneralLedger_Head where Note_No=
```
##### استعلام DELETE على جدول `GeneralLedger_Details`:
```sql
Delete From GeneralLedger_Details where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select SR,Level5_ID,Level5_Name_A,Description,Currency_ID,Currency_Name_A,Exchange,Actual_Debit,Debit,Actual_Credit,Credit,Analysis_ID,Analysis_Name_A,Costcenter_ID,Costcenter_Name_A,Analyse1,Analyse2,Flag FROM GeneralLedger_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select SR,Level5_ID,Level5_Name_A,Description,Currency_ID,Currency_Name_A,Exchange,Actual_Debit,Debit,Actual_Credit,Credit,Analysis_ID,Analysis_Name_A,Costcenter_ID,Costcenter_Name_A,Analyse1,Analyse2,Flag FROM GeneralLedger_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM GeneralLedger_Head_View Where Note_Date Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters_View Where Costcenter_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Currencies Where Currency_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Transaction_Actual_Debit_KeyPress1, Transaction_Description_GotFocus, Transaction_Description_KeyDown, Transaction_Description_KeyPress, Search_Txt_LostFocus, Note_No_KeyPress, Note_No_LostFocus, Note_Net_Text_LostFocus, Transaction_Level5_Name_A_LostFocus, Transaction_Level5_ID_LostFocus, Transaction_Description_LostFocus, Transaction_Actual_Debit_LostFocus, Note_Description_LostFocus, Note_Debit_GotFocus, Note_Debit_KeyDown, Transaction_Costcenter_ID_GotFocus, Transaction_Costcenter_Name_A_GotFocus, Transaction_Costcenter_Name_A_KeyDown, Transaction_Costcenter_Name_A_LostFocus, Transaction_Costcenter_ID_KeyDown, Transaction_Costcenter_ID_KeyPress, Transaction_Costcenter_ID_LostFocus, Transaction_Analyse2_GotFocus1, Transaction_Analyse2_KeyPress, Transaction_Analyse1_LostFocus, Costcenters_GridView_CellClick, Costcenters_GridView_CellFormatting, Costcenters_GridView_KeyDown, Note_Debit_LostFocus, Transaction_Actual_Credit_LostFocus, Transaction_Analyse2_LostFocus, Transaction_Currency_ID_GotFocus, Transaction_Currency_Name_A_GotFocus, Transaction_Currency_Name_A_KeyDown, Transaction_Currency_Name_A_LostFocus, Transaction_Currency_ID_KeyDown, Transaction_Currency_ID_KeyPress, Transaction_Currency_ID_LostFocus, Currency_GridView_CellClick, Currency_GridView_CellFormatting, Currency_GridView_KeyDown, Transaction_Exchange_GotFocus, Transaction_Exchange_KeyDown, Transaction_Exchange_KeyPress, Transaction_Exchange_LostFocus, Transaction_Credit_KeyDown, Transaction_Debit_KeyDown, Transaction_Analysis_ID_GotFocus, Transaction_Analysis_Name_A_GotFocus, Transaction_Analysis_Name_A_KeyDown, Transaction_Analysis_Name_A_LostFocus, Transaction_Analysis_ID_KeyDown, Transaction_Analysis_ID_KeyPress, Transaction_Analysis_ID_LostFocus, Analysis_GridView_CellClick, Analysis_GridView_CellFormatting, Analysis_GridView_KeyDown, Adjustment_GridView_DoubleClick, Adjustment_GridView_KeyDown, RadButton2_Click, RadButton1_Click, RadButton3_Click, set_Transaction_Currency_Name_A, get_Transaction_Exchange, set_Transaction_Exchange, get_Label10, set_Label10, get_Label11, set_Label11, get_Transaction_Currency_ID, set_Transaction_Currency_ID, get_Adjustment_GridView, set_Adjustment_GridView, get_Analysis_GridView, set_Analysis_GridView, get_Currency_GridView, set_Currency_GridView, get_RadButton3, set_RadButton3, get_RadButton1, set_RadButton1, get_RadButton2, set_RadButton2, get_Label8, set_Label8, get_Flag, set_Flag, Clear_Record, Clear_Data, Fill_Grid, Fill_Level5_Grid, Fill_Analysis_Grid, Fill_Costcenters_Grid, Fill_Currencies_Grid, Lock_Control, Enable_Control, Review_Record, Find_Total, GeneralLedger_Form_KeyDown, GeneralLedger_Form_Load, GeneralLedger_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Option1_Click, Search_Option1_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Note_No_GotFocus, Note_No_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Note_Date_GotFocus, Note_Date_KeyDown, Note_Date_KeyPress, Note_Date_Opened, Note_Date_ValueChanged, Transaction_Level5_ID_GotFocus, Transaction_Level5_ID_KeyDown, Transaction_Level5_ID_KeyPress, Transaction_Level5_Name_A_GotFocus, Transaction_Level5_Name_A_KeyDown, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, Transaction_Actual_Credit_GotFocus, Transaction_Actual_Credit_KeyDown, Transaction_Actual_Credit_KeyPress, Flag_KeyDown, Note_Description_KeyPress, Transaction_Analyse1_GotFocus, Transaction_Analyse1_KeyDown, Transaction_Analyse1_KeyPress, Transaction_Analyse2_KeyDown, Note_Description_GotFocus, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, Add_Transaction_Click, Add_Transaction_KeyDown, Transaction_Actual_Debit_GotFocus, Transaction_Actual_Debit_KeyDown1, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_Search_Option1, set_Search_Option1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_Note_No, set_Note_No, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_Note_Date, set_Note_Date, get_Note_SR, set_Note_SR, get_Transaction_Level5_ID, set_Transaction_Level5_ID, get_Level5_GridView, set_Level5_GridView, get_Note_Net_Text, set_Note_Net_Text, get_AquaTheme1, set_AquaTheme1, get_RadPanel7, set_RadPanel7, get_Note_Description, set_Note_Description, get_Transaction_Level5_Name_A, set_Transaction_Level5_Name_A, get_Label19, set_Label19, get_Add_Transaction, set_Add_Transaction, get_Transaction_Debit, set_Transaction_Debit, get_Transaction_Description, set_Transaction_Description, get_RadLabel8, set_RadLabel8, get_Note_Debit, set_Note_Debit, get_Label5, set_Label5, get_Label6, set_Label6, get_Label7, set_Label7, get_Label1, set_Label1, get_Label2, set_Label2, get_Label9, set_Label9, get_Label14, set_Label14, get_Label15, set_Label15, get_Label16, set_Label16, get_Label17, set_Label17, get_Label20, set_Label20, get_Transaction_Costcenter_Name_A, set_Transaction_Costcenter_Name_A, get_Transaction_Costcenter_ID, set_Transaction_Costcenter_ID, get_Transaction_Analyse1, set_Transaction_Analyse1, get_Costcenters_GridView, set_Costcenters_GridView, get_Label3, set_Label3, get_Transaction_Credit, set_Transaction_Credit, get_Note_Credit, set_Note_Credit, get_Note_Balance, set_Note_Balance, get_Transaction_Analyse2, set_Transaction_Analyse2, get_Transaction_Analysis_Name_A, set_Transaction_Analysis_Name_A, get_Transaction_Analysis_ID, set_Transaction_Analysis_ID, get_Label12, set_Label12, get_Label13, set_Label13, get_Transaction_Actual_Credit, set_Transaction_Actual_Credit, get_Transaction_Actual_Debit, set_Transaction_Actual_Debit, get_Transaction_Currency_Name_A
```

---

### 3.10 شاشة: إعدادات وتوجيه قيود اليومية (`Journals_Settings_Form`)
- **الاسم الإنجليزي:** Journal Accounting Settings
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** تهيئة دفاتر اليومية التلقائية وحسابات الإقفال وفروق العملة والترحيل الآلي
- **جداول قاعدة البيانات المستهدفة:** `Journals_Settings`

#### أ. كتالوج حقول وعناصر التحكم (Field & Control Catalog Table)
| معرف العنصر (Control ID) | التسمية العربية (Label) | نوع عنصر الواجهة | الربط بقاعدة البيانات (DB Binding) | نوع البيانات والقيود (Type & Constraints) | القيمة الافتراضية | المعادلة / السلوك البرمجي |
|---|---|---|---|---|---|---|
| `Windows7Theme1` | **Windows7Theme1** | `Windows7Theme` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadPanel6` | **RadPanel6** | `RadPanel` | - | - | - | - |
| `Modify` | **زر تعديل السجل** | `RadButton` | - | - | - | - |
| `Save` | **زر حفظ السجل** | `RadButton` | - | - | - | - |
| `F_Exit` | **F_Exit** | `RadButton` | - | - | - | - |
| `Settings_Panel` | **Settings_Panel** | `RadPanel` | - | - | - | - |
| `RadPanel5` | **RadPanel5** | `RadPanel` | - | - | - | - |
| `Search_Txt` | **حقل / زر البحث** | `RadTextBox` | - | - | - | - |
| `Search_Option2` | **حقل / زر البحث** | `RadRadioButton` | - | - | - | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `Currency_Name_A` | **اسم العملة** | `RadTextBox` | `Journals_Settings.Currency_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Costcenter_Name_A` | **اسم مركز التكلفة** | `RadTextBox` | `Journals_Settings.Costcenter_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Analysis_Name_A` | **اسم الحساب التحليلي** | `RadTextBox` | `Journals_Settings.Analysis_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Currency_ID` | **كود العملة** | `RadTextBox` | `Journals_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Costcenter_ID` | **كود مركز التكلفة** | `RadTextBox` | `Journals_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Analysis_ID` | **كود الحساب التحليلي** | `RadTextBox` | `Journals_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Label43` | **Label43** | `Label` | - | - | - | - |
| `Label41` | **Label41** | `Label` | - | - | - | - |
| `Label37` | **Label37** | `Label` | - | - | - | - |
| `RadPanel8` | **RadPanel8** | `RadPanel` | - | - | - | - |
| `Currency_Option` | **Currency_Option** | `RadCheckBox` | `Journals_Settings.Currency_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Print_Type` | **زر طباعة التقرير / السند** | `RadDropDownList` | `Journals_Settings.Print_Type` | `smallint` (NOT NULL) | `((0))` | - |
| `Decimals_Option` | **Decimals_Option** | `RadDropDownList` | `Journals_Settings.Decimals_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Journals_Settings.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Journals_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Label8` | **Label8** | `Label` | - | - | - | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Costcenters_Option` | **Costcenters_Option** | `RadCheckBox` | `Journals_Settings.Costcenters_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Analysis_Option` | **Analysis_Option** | `RadCheckBox` | `Journals_Settings.Analysis_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Costcenters_GridView` | **Costcenters_GridView** | `RadGridView` | - | - | - | - |
| `Analysis_GridView` | **Analysis_GridView** | `RadGridView` | - | - | - | - |
| `Currency_GridView` | **Currency_GridView** | `RadGridView` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Payable_Name_A` | **Payable_Name_A** | `RadTextBox` | `Journals_Settings.Payable_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Payable_ID` | **Payable_ID** | `RadTextBox` | `Journals_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Cheuqe_Issue_Name_A` | **Cheuqe_Issue_Name_A** | `RadTextBox` | `Journals_Settings.Cheuqe_Issue_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Cheuqe_Issue_ID` | **Cheuqe_Issue_ID** | `RadTextBox` | `Journals_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Cheuqes_Issue_Link_Option` | **Cheuqes_Issue_Link_Option** | `RadCheckBox` | `Journals_Settings.Cheuqes_Issue_Link_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Receivable_Name_A` | **Receivable_Name_A** | `RadTextBox` | `Journals_Settings.Receivable_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Receivable_ID` | **Receivable_ID** | `RadTextBox` | `Journals_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Label7` | **Label7** | `Label` | - | - | - | - |
| `Cheuqe_Delivery_Name_A` | **Cheuqe_Delivery_Name_A** | `RadTextBox` | `Journals_Settings.Cheuqe_Delivery_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Cheuqe_Delivery_ID` | **Cheuqe_Delivery_ID** | `RadTextBox` | `Journals_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Label35` | **Label35** | `Label` | - | - | - | - |
| `Cheuqes_Delivery_Link_Option` | **Cheuqes_Delivery_Link_Option** | `RadCheckBox` | `Journals_Settings.Cheuqes_Delivery_Link_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `Cheuqes_Alert` | **Cheuqes_Alert** | `RadCheckBox` | `Journals_Settings.Cheuqes_Alert` | `smallint` (NOT NULL) | `((0))` | - |
| `Cheuqe_Cycle` | **Cheuqe_Cycle** | `RadCheckBox` | `Journals_Settings.Cheuqe_Cycle` | `smallint` (NOT NULL) | `((0))` | - |
| `Cheuqes_Alert_Period` | **Cheuqes_Alert_Period** | `RadTextBox` | `Journals_Settings.Cheuqes_Alert_Period` | `smallint` (NOT NULL) | `((0))` | - |
| `RadPanel7` | **RadPanel7** | `RadPanel` | - | - | - | - |
| `Cheuqes_Alert_Period1` | **Cheuqes_Alert_Period1** | `RadTextBox` | `Journals_Settings.Cheuqes_Alert_Period1` | `smallint` (NOT NULL) | `((0))` | - |
| `Cheuqes_Alert1` | **Cheuqes_Alert1** | `RadCheckBox` | `Journals_Settings.Cheuqes_Alert1` | `smallint` (NOT NULL) | `((0))` | - |
| `Cheuqe_Cycle1` | **Cheuqe_Cycle1** | `RadCheckBox` | `Journals_Settings.Cheuqe_Cycle1` | `smallint` (NOT NULL) | `((0))` | - |
| `RadPanel9` | **RadPanel9** | `RadPanel` | - | - | - | - |
| `Payable_Name_A1` | **Payable_Name_A1** | `RadTextBox` | `Journals_Settings.Payable_Name_A1` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Payable_ID1` | **Payable_ID1** | `RadTextBox` | `Journals_Settings.Payable_ID1` | `numeric` (NOT NULL) | `((0))` | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Cheuqe_Issue_Name_A1` | **Cheuqe_Issue_Name_A1** | `RadTextBox` | `Journals_Settings.Cheuqe_Issue_Name_A1` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Cheuqe_Issue_ID1` | **Cheuqe_Issue_ID1** | `RadTextBox` | `Journals_Settings.Cheuqe_Issue_ID1` | `numeric` (NOT NULL) | `((0))` | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Cheuqes_Issue_Link_Option1` | **Cheuqes_Issue_Link_Option1** | `RadCheckBox` | `Journals_Settings.Cheuqes_Issue_Link_Option1` | `smallint` (NOT NULL) | `((0))` | - |
| `RadPanel10` | **RadPanel10** | `RadPanel` | - | - | - | - |
| `Receivable_Name_A1` | **Receivable_Name_A1** | `RadTextBox` | `Journals_Settings.Receivable_Name_A1` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Receivable_ID1` | **Receivable_ID1** | `RadTextBox` | `Journals_Settings.Receivable_ID1` | `numeric` (NOT NULL) | `((0))` | - |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Cheuqe_Delivery_Name_A1` | **Cheuqe_Delivery_Name_A1** | `RadTextBox` | `Journals_Settings.Cheuqe_Delivery_Name_A1` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Cheuqe_Delivery_ID1` | **Cheuqe_Delivery_ID1** | `RadTextBox` | `Journals_Settings.Cheuqe_Delivery_ID1` | `numeric` (NOT NULL) | `((0))` | - |
| `Label10` | **Label10** | `Label` | - | - | - | - |
| `Cheuqes_Delivery_Link_Option1` | **Cheuqes_Delivery_Link_Option1** | `RadCheckBox` | `Journals_Settings.Cheuqes_Delivery_Link_Option1` | `smallint` (NOT NULL) | `((0))` | - |
| `Currency_Flag` | **حالة الاعتماد / التأكيد** | `RadDropDownList` | `Journals_Settings.Currency_Flag` | `smallint` (NOT NULL) | `((0))` | - |
| `Label21` | **Label21** | `Label` | - | - | - | - |
| `Work_Insurance_Name_A` | **Work_Insurance_Name_A** | `RadTextBox` | `Journals_Settings.Work_Insurance_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Work_Insurance_ID` | **Work_Insurance_ID** | `RadTextBox` | `Journals_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Label11` | **Label11** | `Label` | - | - | - | - |
| `Work_Balance_Name_A` | **الرصيد / الفارق** | `RadTextBox` | `Journals_Settings.Work_Balance_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | `Balance = Previous_Balance + Debit - Credit` |
| `Work_Balance_ID` | **الرصيد / الفارق** | `RadTextBox` | `Journals_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | `Balance = Previous_Balance + Debit - Credit` |
| `Label12` | **Label12** | `Label` | - | - | - | - |
| `Work_Payments_Name_A` | **Work_Payments_Name_A** | `RadTextBox` | `Journals_Settings.Work_Payments_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Work_Payments_ID` | **Work_Payments_ID** | `RadTextBox` | `Journals_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Nonconformities_Name_A` | **Nonconformities_Name_A** | `RadTextBox` | `Journals_Settings.Nonconformities_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Nonconformities_ID` | **Nonconformities_ID** | `RadTextBox` | `Journals_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Adap` | **Adap** | `SqlDataAdapter` | - | - | - | - |
| `Adap1` | **Adap1** | `SqlDataAdapter` | - | - | - | - |
| `Adap2` | **Adap2** | `SqlDataAdapter` | - | - | - | - |
| `Adap3` | **Adap3** | `SqlDataAdapter` | - | - | - | - |
| `Adap4` | **Adap4** | `SqlDataAdapter` | - | - | - | - |
| `Permission_Adap` | **Permission_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Delete_Adap` | **زر حذف السجل** | `SqlDataAdapter` | - | - | - | - |
| `Profile_Adap` | **Profile_Adap** | `OleDbDataAdapter` | - | - | - | - |
| `RRS` | **RRS** | `DataSet` | - | - | - | - |
| `RRS1` | **RRS1** | `DataSet` | - | - | - | - |
| `RRS2` | **RRS2** | `DataSet` | - | - | - | - |
| `RRS3` | **RRS3** | `DataSet` | - | - | - | - |
| `RRS4` | **RRS4** | `DataSet` | - | - | - | - |
| `Permission_RRS` | **Permission_RRS** | `DataSet` | - | - | - | - |
| `Profile_RRS` | **Profile_RRS** | `DataSet` | - | - | - | - |
| `Delete_RRS` | **زر حذف السجل** | `DataSet` | - | - | - | - |
| `Cmd` | **Cmd** | `SqlCommand` | - | - | - | - |
| `Cmd1` | **Cmd1** | `SqlCommand` | - | - | - | - |
| `Cmd01` | **Cmd01** | `SqlCommand` | - | - | - | - |
| `Cmd02` | **Cmd02** | `SqlCommand` | - | - | - | - |
| `Cmd03` | **Cmd03** | `SqlCommand` | - | - | - | - |
| `Cmd04` | **Cmd04** | `SqlCommand` | - | - | - | - |
| `Cmd05` | **Cmd05** | `SqlCommand` | - | - | - | - |
| `Cmd06` | **Cmd06** | `SqlCommand` | - | - | - | - |
| `Cmd2` | **Cmd2** | `SqlCommand` | - | - | - | - |
| `Cmd3` | **Cmd3** | `SqlCommand` | - | - | - | - |
| `Cmd4` | **Cmd4** | `SqlCommand` | - | - | - | - |
| `Cmd5` | **Cmd5** | `SqlCommand` | - | - | - | - |
| `Cmd6` | **Cmd6** | `SqlCommand` | - | - | - | - |
| `Balance_Cmd` | **الرصيد / الفارق** | `SqlCommand` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Dt` | **Dt** | `DataTable` | - | - | - | - |
| `Dt1` | **Dt1** | `DataTable` | - | - | - | - |
| `Dt2` | **Dt2** | `DataTable` | - | - | - | - |
| `Dt3` | **Dt3** | `DataTable` | - | - | - | - |
| `Dt4` | **Dt4** | `DataTable` | - | - | - | - |
| `Dt_RS` | **Dt_RS** | `DataTable` | - | - | - | - |
| `Dt_RS1` | **Dt_RS1** | `DataTable` | - | - | - | - |
| `Dt_RS2` | **Dt_RS2** | `DataTable` | - | - | - | - |
| `Dt_RS6` | **Dt_RS6** | `DataTable` | - | - | - | - |

#### ب. قواعد التحقق والمعادلات الحسابية (Validation & Business Rules)
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الحساب التحليلي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم مركز التكلفة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم العملـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المستخدم الحالي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم تأمين الأعمال 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم مستحقات محتجزة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم دفعات مقدمة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم أعمال غير مطابقة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: في حالة الإضافة والتعديل يجب الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل موجود ولا يمكن حفظه مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users_Table
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Branches Order By Branche_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Journals_Settings Where ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Order By Level5_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters_View Order By Costcenter_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Order By Analysis_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Currencies Order By Currency_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users Where User_ID=
```
##### استعلام UPDATE على جدول `Journals_Settings`:
```sql
Update Journals_Settings Set Analysis_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters_View Where Costcenter_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Where Analysis_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Currencies Where Currency_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Where Analysis_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Currencies Where Currency_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters_View Where Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Level5_GridView_KeyDown, Cheuqes_Alert_PeriodGotFocus, Cheuqes_Alert_Period1_KeyPress, Cheuqes_Alert_Period1_LostFocus, Work_Insurance_ID_GotFocus, Work_Insurance_ID_KeyPress, Work_Insurance_ID_LostFocus, Work_Insurance_Name_A_GotFocus, Work_Insurance_Name_A_LostFocus, Work_Balance_ID_GotFocus, Work_Balance_ID_KeyPress, Work_Balance_ID_LostFocus, Work_Balance_Name_A_GotFocus, Work_Balance_Name_A_LostFocus, Work_Payments_ID_GotFocus, Work_Payments_ID_KeyPress, Work_Payments_ID_LostFocus, Work_Payments_Name_A_GotFocus, Work_Payments_Name_A_LostFocus, Nonconformities_ID_GotFocus, Nonconformities_ID_KeyPress, Nonconformities_ID_LostFocus, Nonconformities_Name_A_GotFocus, Nonconformities_Name_A_LostFocus, Enable_Settings_Control, Review_Settings_Record, Journals_Settings_Form_Load, Journals_Settings_Form_Resize, Modify_Click, Save_Click, F_Exit_Click, Search_Option2_Click, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_LostFocus, Analysis_ID_GotFocus, Analysis_ID_KeyPress, Analysis_ID_LostFocus, Analysis_Name_A_GotFocus, Analysis_Name_A_LostFocus, Currency_ID_GotFocus, Currency_ID_KeyPress, Currency_ID_LostFocus, Currency_Name_A_GotFocus, Currency_Name_A_LostFocus, Costcenter_ID_GotFocus, Costcenter_ID_KeyPress, Costcenter_ID_LostFocus, Costcenter_Name_A_GotFocus, Costcenter_Name_A_LostFocus, Entry_ID_GotFocus, Entry_ID_LostFocus, Entry_Name_GotFocus, Entry_Name_LostFocus, Analysis_GridView_CellClick, Analysis_GridView_CellFormatting, Analysis_GridView_KeyDown, Costcenters_GridView_CellClick, Costcenters_GridView_CellFormatting, Costcenters_GridView_KeyDown, Currency_GridView_CellClick, Currency_GridView_CellFormatting, Currency_GridView_KeyDown, Cheuqe_Delivery_ID_GotFocus, Cheuqe_Delivery_ID_KeyPress, Cheuqe_Delivery_ID_LostFocus, Cheuqe_Delivery_Name_A_GotFocus, Cheuqe_Delivery_Name_A_LostFocus, Receivable_ID_GotFocus, Receivable_ID_KeyPress, Receivable_ID_LostFocus, Receivable_Name_A_GotFocus, Receivable_Name_A_LostFocus, Cheuqe_Issue_ID_GotFocus, Cheuqe_Issue_ID_KeyPress, Cheuqe_Issue_ID_LostFocus, Cheuqe_Issue_Name_A_GotFocus, Cheuqe_Issue_Name_A_LostFocus, Payable_ID_GotFocus, Payable_ID_KeyPress, Payable_ID_LostFocus, Payable_Name_A_GotFocus, Payable_Name_A_LostFocus, Cheuqes_Alert_Period_GotFocus, Cheuqes_Alert_Period_KeyPress, Cheuqes_Alert_Period_LostFocus, Cheuqe_Delivery_ID1_GotFocus, Cheuqe_Delivery_ID1_KeyPress, Cheuqe_Delivery_ID1_LostFocus, Cheuqe_Delivery_Name_A1_GotFocus, Cheuqe_Delivery_Name_A1_LostFocus, Receivable_ID1_GotFocus, Receivable_ID1_KeyPress, Receivable_ID1_LostFocus, Receivable_Name_A1_GotFocus, Receivable_Name_A1_LostFocus, Cheuqe_Issue_ID1_GotFocus, Cheuqe_Issue_ID1_KeyPress, Cheuqe_Issue_ID1_LostFocus, Cheuqe_Issue_Name_A1_GotFocus, Cheuqe_Issue_Name_A1_LostFocus, Payable_ID1_GotFocus, Payable_ID1_KeyPress, Payable_ID1_LostFocus, Payable_Name_A1_GotFocus, Payable_Name_A1_LostFocus, Level5_GridView_CellClick, Level5_GridView_CellFormatting, set_Analysis_Option, get_Costcenters_GridView, set_Costcenters_GridView, get_Analysis_GridView, set_Analysis_GridView, get_Currency_GridView, set_Currency_GridView, get_AquaTheme1, set_AquaTheme1, get_RadPanel3, set_RadPanel3, get_Payable_Name_A, set_Payable_Name_A, get_Payable_ID, set_Payable_ID, get_Label1, set_Label1, get_Cheuqe_Issue_Name_A, set_Cheuqe_Issue_Name_A, get_Cheuqe_Issue_ID, set_Cheuqe_Issue_ID, get_Label2, set_Label2, get_Cheuqes_Issue_Link_Option, set_Cheuqes_Issue_Link_Option, get_RadPanel1, set_RadPanel1, get_Receivable_Name_A, set_Receivable_Name_A, get_Receivable_ID, set_Receivable_ID, get_Label7, set_Label7, get_Cheuqe_Delivery_Name_A, set_Cheuqe_Delivery_Name_A, get_Cheuqe_Delivery_ID, set_Cheuqe_Delivery_ID, get_Label35, set_Label35, get_Cheuqes_Delivery_Link_Option, set_Cheuqes_Delivery_Link_Option, get_Level5_GridView, set_Level5_GridView, get_RadPanel4, set_RadPanel4, get_Cheuqes_Alert, set_Cheuqes_Alert, get_Cheuqe_Cycle, set_Cheuqe_Cycle, get_Cheuqes_Alert_Period, set_Cheuqes_Alert_Period, get_RadPanel7, set_RadPanel7, get_Cheuqes_Alert_Period1, set_Cheuqes_Alert_Period1, get_Cheuqes_Alert1, set_Cheuqes_Alert1, get_Cheuqe_Cycle1, set_Cheuqe_Cycle1, get_RadPanel9, set_RadPanel9, get_Payable_Name_A1, set_Payable_Name_A1, get_Payable_ID1, set_Payable_ID1, get_Label3, set_Label3, get_Cheuqe_Issue_Name_A1, set_Cheuqe_Issue_Name_A1, get_Cheuqe_Issue_ID1, set_Cheuqe_Issue_ID1, get_Label4, set_Label4, get_Cheuqes_Issue_Link_Option1, set_Cheuqes_Issue_Link_Option1, get_RadPanel10, set_RadPanel10, get_Receivable_Name_A1, set_Receivable_Name_A1, get_Receivable_ID1, set_Receivable_ID1, get_Label5, set_Label5, get_Cheuqe_Delivery_Name_A1, set_Cheuqe_Delivery_Name_A1, get_Cheuqe_Delivery_ID1, set_Cheuqe_Delivery_ID1, get_Label10, set_Label10, get_Cheuqes_Delivery_Link_Option1, set_Cheuqes_Delivery_Link_Option1, get_Currency_Flag, set_Currency_Flag, get_Label21, set_Label21, get_Work_Insurance_Name_A, set_Work_Insurance_Name_A, get_Work_Insurance_ID, set_Work_Insurance_ID, get_Label11, set_Label11, get_Work_Balance_Name_A, set_Work_Balance_Name_A, get_Work_Balance_ID, set_Work_Balance_ID, get_Label12, set_Label12, get_Work_Payments_Name_A, set_Work_Payments_Name_A, get_Work_Payments_ID, set_Work_Payments_ID, get_Label13, set_Label13, get_Nonconformities_Name_A, set_Nonconformities_Name_A, get_Nonconformities_ID, set_Nonconformities_ID, get_Label14, set_Label14, Fill_Level5_Grid, Fill_Analysis_Grid, Fill_Costcenters_Grid, Fill_Currencies_Grid, Clear_Record, Lock_Settings_Control, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_DesertTheme1, set_DesertTheme1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadPanel6, set_RadPanel6, get_Modify, set_Modify, get_Save, set_Save, get_F_Exit, set_F_Exit, get_Settings_Panel, set_Settings_Panel, get_RadPanel5, set_RadPanel5, get_Search_Txt, set_Search_Txt, get_Search_Option2, set_Search_Option2, get_RadPanel2, set_RadPanel2, get_Currency_Name_A, set_Currency_Name_A, get_Costcenter_Name_A, set_Costcenter_Name_A, get_Analysis_Name_A, set_Analysis_Name_A, get_Currency_ID, set_Currency_ID, get_Costcenter_ID, set_Costcenter_ID, get_Analysis_ID, set_Analysis_ID, get_Label43, set_Label43, get_Label41, set_Label41, get_Label37, set_Label37, get_RadPanel8, set_RadPanel8, get_Currency_Option, set_Currency_Option, get_Print_Type, set_Print_Type, get_Decimals_Option, set_Decimals_Option, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_Label6, set_Label6, get_Label8, set_Label8, get_Label9, set_Label9, get_Costcenters_Option, set_Costcenters_Option, get_Analysis_Option
```

---

