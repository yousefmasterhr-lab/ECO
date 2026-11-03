# مواصفات ومخطط الوحدة المعمارية: المشتريات والموردين وأوامر التوريد (Purchasing & Accounts Payable)
**المرحلة البرمجية:** المرحلة 4 (`Phase 04`)
**التطبيق المصدر:** `APPS ERP Application 2023.exe` (Tarabot ERP)
**قاعدة البيانات المستهدفة:** `MK_Khalil_Db_2026` (SQL Server)
**تاريخ الاستخراج الآلي:** 2026-11-03 22:30:55
---

## 1. النبذة الهندسية والهدف الوظيفي للوحدة
تتولى هذه الوحدة إدارة كافة العمليات والبيانات الخاصة بـ **المشتريات والموردين وأوامر التوريد**، وتوفر دورة عمل متكاملة تبدأ من تهيئة الإعدادات والشاشات الثابتة وحتى تنفيذ العمليات اليومية وترحيلها محاسبياً ومخزنياً وفق المعايير المعتمدة في النظام.

تحتوي هذه الوحدة على **6 شاشة نموذج رئيسية** تم تشريحها واستخراج كافة عناصر التحكم، وخطوط أنابيب البيانات، والمعادلات الرياضية، وقواعد التحقق الخاصة بها.

---

## 2. الفهرس التشغيلي لشاشات الوحدة
| # | اسم الشاشة البرمجية (Form Class) | المسمى العربي | المسمى الإنجليزي | الجداول المرتبطة في قاعدة البيانات |
|---|---|---|---|---|
| 1 | `Suppliers_Form` | **دليل وبطاقة الموردين** | Vendor & Supplier Catalog | `Suppliers` |
| 2 | `Purchase_Order_Form` | **أوامر الشراء والتوريد** | Purchase Orders | `Purchase_Orders_Head, Purchase_Orders_Details` |
| 3 | `Purchase_Form` | **فاتورة المشتريات المحلية والمخزنية** | Purchase Invoices | `Purchase_Head, Purchase_Details` |
| 4 | `Purchase_Form1` | **فاتورة المشتريات (نمط إضافي / خدمات)** | Purchase Invoices (Auxiliary Pattern) | `Purchase_Head1, Purchase_Details1` |
| 5 | `Purchase_R_Form` | **مردودات المشتريات** | Purchase Returns & Debit Notes | `Purchase_R_Head, Purchase_R_Details` |
| 6 | `Purchase_Settings_Form` | **إعدادات وتوجيه المشتريات** | Purchase Posting Settings | `Purchase_Settings` |

---

## 3. التشريح التفصيلي لنماذج الشاشات (Forms Technical Catalog)
### 3.1 شاشة: دليل وبطاقة الموردين (`Suppliers_Form`)
- **الاسم الإنجليزي:** Vendor & Supplier Catalog
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** تسجيل بيانات الموردين، التصنيف التجاري، شروط السداد، الحساب المالي، والأرصدة الافتتاحية
- **جداول قاعدة البيانات المستهدفة:** `Suppliers`

#### أ. كتالوج حقول وعناصر التحكم (Field & Control Catalog Table)
| معرف العنصر (Control ID) | التسمية العربية (Label) | نوع عنصر الواجهة | الربط بقاعدة البيانات (DB Binding) | نوع البيانات والقيود (Type & Constraints) | القيمة الافتراضية | المعادلة / السلوك البرمجي |
|---|---|---|---|---|---|---|
| `Search_Option2` | **حقل / زر البحث** | `RadRadioButton` | - | - | - | - |
| `Windows7Theme1` | **Windows7Theme1** | `Windows7Theme` | - | - | - | - |
| `Search_Txt` | **حقل / زر البحث** | `RadTextBox` | - | - | - | - |
| `Supplier_Name_E` | **اسم المورد** | `RadTextBox` | `Suppliers.Supplier_Name_E` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `GridView` | **GridView** | `RadGridView` | - | - | - | - |
| `Supplier_ID` | **كود المورد** | `RadTextBox` | `Suppliers.Supplier_ID` | `numeric` (PRIMARY KEY, NOT NULL) | - | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `Supplier_Name_A` | **اسم المورد** | `RadTextBox` | `Suppliers.Supplier_Name_A` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `RadLabel1` | **RadLabel1** | `RadLabel` | - | - | - | - |
| `RadLabel2` | **RadLabel2** | `RadLabel` | - | - | - | - |
| `RadLabel5` | **RadLabel5** | `RadLabel` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadLabel15` | **RadLabel15** | `RadLabel` | - | - | - | - |
| `Address` | **زر إضافة جديد** | `RadTextBox` | `Suppliers.Address` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `RadLabel16` | **RadLabel16** | `RadLabel` | - | - | - | - |
| `C_Email` | **C_Email** | `RadTextBox` | `Suppliers.C_Email` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `RadLabel12` | **RadLabel12** | `RadLabel` | - | - | - | - |
| `Mobile` | **Mobile** | `RadTextBox` | `Suppliers.Mobile` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `RadLabel13` | **RadLabel13** | `RadLabel` | - | - | - | - |
| `Fax` | **Fax** | `RadTextBox` | `Suppliers.Fax` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Tel` | **Tel** | `RadTextBox` | `Suppliers.Tel` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `RadLabel14` | **RadLabel14** | `RadLabel` | - | - | - | - |
| `RadPanel6` | **RadPanel6** | `RadPanel` | - | - | - | - |
| `Supplier_Status` | **Supplier_Status** | `RadDropDownList` | `Suppliers.Supplier_Status` | `smallint` (NOT NULL) | `((0))` | - |
| `RadLabel26` | **RadLabel26** | `RadLabel` | - | - | - | - |
| `Card_No` | **Card_No** | `RadTextBox` | `Suppliers.Card_No` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `RadLabel3` | **RadLabel3** | `RadLabel` | - | - | - | - |
| `Vat_No` | **Vat_No** | `RadTextBox` | `Suppliers.Vat_No` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `RadLabel28` | **RadLabel28** | `RadLabel` | - | - | - | - |
| `Limit_Amount` | **Limit_Amount** | `RadTextBox` | `Suppliers.Limit_Amount` | `float` (NOT NULL) | `((0))` | - |
| `RadLabel10` | **RadLabel10** | `RadLabel` | - | - | - | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Suppliers.Notice` | `nvarchar(150)` (NOT NULL) | `(' ')` | - |
| `RadLabel4` | **RadLabel4** | `RadLabel` | - | - | - | - |
| `Manger_Name` | **Manger_Name** | `RadTextBox` | `Suppliers.Manger_Name` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `RadLabel17` | **RadLabel17** | `RadLabel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Suppliers.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Suppliers.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `Save` | **زر حفظ السجل** | `RadButton` | - | - | - | - |
| `Delete` | **زر حذف السجل** | `RadButton` | - | - | - | - |
| `F_Exit` | **F_Exit** | `RadButton` | - | - | - | - |
| `Add` | **زر إضافة جديد** | `RadButton` | - | - | - | - |
| `Modify` | **زر تعديل السجل** | `RadButton` | - | - | - | - |
| `Area_ID` | **Area_ID** | `RadTextBox` | `Suppliers.Area_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `Area_Name_A` | **Area_Name_A** | `RadTextBox` | - | - | - | - |
| `RadLabel6` | **RadLabel6** | `RadLabel` | - | - | - | - |
| `Areas_GridView` | **Areas_GridView** | `RadGridView` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `Level4_Name_A` | **اسم الحساب المستوى 4** | `RadTextBox` | - | - | - | - |
| `Level4_ID` | **كود الحساب المستوى 4** | `RadTextBox` | `Suppliers.Level4_ID` | `int` (NOT NULL) | `((0))` | - |
| `RadLabel18` | **RadLabel18** | `RadLabel` | - | - | - | - |
| `Level4_Gridview` | **Level4_Gridview** | `RadGridView` | - | - | - | - |
| `Adap` | **Adap** | `SqlDataAdapter` | - | - | - | - |
| `Adap1` | **Adap1** | `SqlDataAdapter` | - | - | - | - |
| `Adap2` | **Adap2** | `SqlDataAdapter` | - | - | - | - |
| `Adap3` | **Adap3** | `SqlDataAdapter` | - | - | - | - |
| `Adap4` | **Adap4** | `SqlDataAdapter` | - | - | - | - |
| `Adap5` | **Adap5** | `SqlDataAdapter` | - | - | - | - |
| `Adap6` | **Adap6** | `SqlDataAdapter` | - | - | - | - |
| `Branche_Adap` | **Branche_Adap** | `SqlDataAdapter` | - | - | - | - |
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
| `Branche_RRS` | **Branche_RRS** | `DataSet` | - | - | - | - |
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
| `Dt2` | **Dt2** | `DataTable` | - | - | - | - |
| `Dt3` | **Dt3** | `DataTable` | - | - | - | - |
| `Dt_RS1` | **Dt_RS1** | `DataTable` | - | - | - | - |

#### ب. قواعد التحقق والمعادلات الحسابية (Validation & Business Rules)
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الحساب الرئيسي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إختيـار اسم الحساب الرئيسي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المـورد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسم المـورد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الأسـم بالأنجليزي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال المنطقـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إضافة سجل جديد أثناء عملية التعديل. لأضافة سجل يجب الضغط على الغاء التعديل ثم الضغط على سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إجراء تعديل أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: في حالة الإضافة يجب الضغط على سجل جديد وفي حالة التعديل يجب الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل موجود مسبقاً ولا يمكن حفظه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل غير موجود ولا يمكن تحديثه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل موجود ولا يمكن حفظه مرة أخرى 
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
Select * FROM Level4_View Where Where Module_Type=
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
Select * From Users_Table
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Branches
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users Where User_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Level4_View Where Module_Type=7 Order By Level4_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Areas Order By Area_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Suppliers Where Supplier_ID=
```
##### استعلام INSERT على جدول `Suppliers`:
```sql
Insert Into Suppliers(Level4_ID,Supplier_ID,Supplier_Name_A,Supplier_Name_E,Supplier_Status,Tel,Fax,Mobile,Manger_Name,C_Email,Card_No,Vat_No,Area_ID,Address,Limit_Amount,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Suppliers`:
```sql
Insert Into Level5(Level4_ID,Level5_ID,Level5_Name_A,Level5_Name_E,Entry_ID,Entry_Name,Notice)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Suppliers Where Supplier_ID=
```
##### استعلام UPDATE على جدول `Suppliers`:
```sql
Update Suppliers Set Level4_ID=
```
##### استعلام UPDATE على جدول `Suppliers`:
```sql
Update Level5 Set Level4_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Suppliers Where Supplier_ID=
```
##### استعلام DELETE على جدول `Suppliers`:
```sql
Delete From Suppliers where Supplier_ID=
```
##### استعلام DELETE على جدول `Suppliers`:
```sql
Delete From Level5 where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Suppliers_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level4_View Where Module_Type=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Areas Where Area_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Suppliers_View Where Supplier_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Suppliers Where Supplier_Name_A='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Suppliers Where Supplier_Name_E='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Areas Where Area_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Suppliers_View Order By Supplier_ID
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Supplier_Name_A_LostFocus, Supplier_Name_E_LostFocus, Limit_Amount_LostFocus, Search_Txt_LostFocus, Level4_ID_GotFocus, Level4_ID_KeyDown, Level4_ID_KeyPress, Level4_Name_A_GotFocus, Level4_Gridview_CellClick, Level4_Gridview_CellFormatting, Level4_Gridview_KeyDown, Level4_Name_A_LostFocus, Level4_ID_LostFocus, Enable_Control, Review_Record, Suppliers_Form_KeyDown, Suppliers_Form_Load, Suppliers_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Option2_Click, Search_Option2_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Supplier_ID_GotFocus, Supplier_ID_KeyPress, Supplier_ID_KeyDown, Supplier_Name_A_GotFocus, Supplier_Name_A_KeyPress, Supplier_Name_A_KeyDown, Supplier_Name_E_GotFocus, Supplier_Name_E_KeyPress, Supplier_Name_E_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Tel_GotFocus, Tel_KeyDown, Tel_KeyPress, Fax_GotFocus, Fax_KeyDown, Fax_KeyPress, Mobile_GotFocus, Mobile_KeyDown, Mobile_KeyPress, C_Email_GotFocus, C_Email_KeyDown, Address_GotFocus, Address_KeyDown, C_Email_KeyPress, Address_KeyPress, Limit_Amount_GotFocus, Limit_Amount_KeyDown, Limit_Amount_KeyPress, Card_No_GotFocus, Card_No_KeyDown, Vat_No_GotFocus, Vat_No_KeyDown, Card_No_KeyPress, Vat_No_KeyPress, Manger_Name_GotFocus, Manger_Name_KeyDown, Manger_Name_KeyPress, Notice_GotFocus, Notice_KeyDown, Notice_KeyPress, Area_ID_GotFocus, Area_ID_KeyDown, Area_ID_KeyPress, Areas_GridView_CellClick, Areas_GridView_CellFormatting, Areas_GridView_KeyDown, Area_ID_LostFocus, Area_Name_A_GotFocus, Area_Name_A_KeyDown, Area_Name_A_LostFocus, Notice_LostFocus, C_Email_LostFocus, Card_No_LostFocus, Vat_No_LostFocus, Address_LostFocus, Tel_LostFocus, Manger_Name_LostFocus, Mobile_LostFocus, Fax_LostFocus, Supplier_ID_LostFocus, Dispose, InitializeComponent, get_Search_Option2, set_Search_Option2, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Search_Txt, set_Search_Txt, get_Supplier_Name_E, set_Supplier_Name_E, get_GridView, set_GridView, get_Supplier_ID, set_Supplier_ID, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_DesertTheme1, set_DesertTheme1, get_Supplier_Name_A, set_Supplier_Name_A, get_RadLabel1, set_RadLabel1, get_RadLabel2, set_RadLabel2, get_RadLabel5, set_RadLabel5, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadLabel15, set_RadLabel15, get_Address, set_Address, get_RadLabel16, set_RadLabel16, get_C_Email, set_C_Email, get_RadLabel12, set_RadLabel12, get_Mobile, set_Mobile, get_RadLabel13, set_RadLabel13, get_Fax, set_Fax, get_Tel, set_Tel, get_RadLabel14, set_RadLabel14, get_RadPanel6, set_RadPanel6, get_Supplier_Status, set_Supplier_Status, get_RadLabel26, set_RadLabel26, get_Card_No, set_Card_No, get_RadLabel3, set_RadLabel3, get_Vat_No, set_Vat_No, get_RadLabel28, set_RadLabel28, get_Limit_Amount, set_Limit_Amount, get_RadLabel10, set_RadLabel10, get_Notice, set_Notice, get_RadLabel4, set_RadLabel4, get_Manger_Name, set_Manger_Name, get_RadLabel17, set_RadLabel17, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Add, set_Add, get_Modify, set_Modify, get_Area_ID, set_Area_ID, get_Area_Name_A, set_Area_Name_A, get_RadLabel6, set_RadLabel6, get_Areas_GridView, set_Areas_GridView, get_RadPanel4, set_RadPanel4, get_Level4_Name_A, set_Level4_Name_A, get_Level4_ID, set_Level4_ID, get_RadLabel18, set_RadLabel18, get_Level4_Gridview, set_Level4_Gridview, Clear_Record, Clear_Data, Fill_Grid, Fill_Level4_Grid, Fill_Areas_Grid, Lock_Control
```

---

### 3.2 شاشة: أوامر الشراء والتوريد (`Purchase_Order_Form`)
- **الاسم الإنجليزي:** Purchase Orders
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** إصدار أوامر التوريد للموردين ومتابعة كميات التوريد والكميات المتبقية
- **جداول قاعدة البيانات المستهدفة:** `Purchase_Orders_Head`, `Purchase_Orders_Details`

#### أ. كتالوج حقول وعناصر التحكم (Field & Control Catalog Table)
| معرف العنصر (Control ID) | التسمية العربية (Label) | نوع عنصر الواجهة | الربط بقاعدة البيانات (DB Binding) | نوع البيانات والقيود (Type & Constraints) | القيمة الافتراضية | المعادلة / السلوك البرمجي |
|---|---|---|---|---|---|---|
| `Windows7Theme1` | **Windows7Theme1** | `Windows7Theme` | - | - | - | - |
| `Save` | **زر حفظ السجل** | `RadButton` | - | - | - | - |
| `Delete` | **زر حذف السجل** | `RadButton` | - | - | - | - |
| `F_Exit` | **F_Exit** | `RadButton` | - | - | - | - |
| `Print` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Add` | **زر إضافة جديد** | `RadButton` | - | - | - | - |
| `Modify` | **زر تعديل السجل** | `RadButton` | - | - | - | - |
| `Search_Txt` | **حقل / زر البحث** | `RadTextBox` | - | - | - | - |
| `GridView` | **GridView** | `RadGridView` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Purchase_Orders_Head.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Purchase_Orders_Head.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `RadGridView1` | **RadGridView1** | `RadGridView` | - | - | - | - |
| `Note_Date` | **تاريخ الحركة** | `RadDateTimePicker` | `Purchase_Orders_Head.Note_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Items_GridView` | **Items_GridView** | `RadGridView` | - | - | - | - |
| `RadLabel15` | **RadLabel15** | `RadLabel` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Label8` | **Label8** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Note_No` | **رقم الحركة / السند** | `RadTextBox` | `Purchase_Orders_Head.Note_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Purchase_Orders_Head.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Label10` | **Label10** | `Label` | - | - | - | - |
| `Label11` | **Label11** | `Label` | - | - | - | - |
| `Actual_Qty` | **الكمية** | `RadTextBox` | `Purchase_Orders_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Unit_Name` | **الوحدة** | `RadTextBox` | - | - | - | - |
| `Item_Name_A` | **اسم الصنف** | `RadTextBox` | - | - | - | - |
| `Item_ID` | **كود الصنف** | `RadTextBox` | `Purchase_Orders_Details.Item_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label28` | **Label28** | `Label` | - | - | - | - |
| `Note_Actual_Qty` | **الكمية** | `RadTextBox` | `Purchase_Orders_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Note_Net_With_Tax_Text` | **ضريبة القيمة المضافة** | `RadTextBox` | - | - | - | `Net = Total - Discount + Tax` |
| `SR` | **SR** | `RadTextBox` | `Purchase_Orders_Details.SR` | `int` (PRIMARY KEY, NOT NULL) | - | - |
| `Unit_ID` | **الوحدة** | `RadTextBox` | `Purchase_Orders_Details.Unit_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `Note_Date_H` | **تاريخ الحركة** | `RadTextBox` | `Purchase_Orders_Head.Note_Date_H` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Qty` | **الكمية** | `RadTextBox` | `Purchase_Orders_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Units_GridView` | **Units_GridView** | `RadGridView` | - | - | - | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Unit_Exchang` | **Unit_Exchang** | `RadTextBox` | `Purchase_Orders_Head.Exchang` | `float` (NOT NULL) | `((1))` | - |
| `Analysis_Name_A` | **اسم الحساب التحليلي** | `RadTextBox` | - | - | - | - |
| `Analysis_ID` | **كود الحساب التحليلي** | `RadTextBox` | `Purchase_Orders_Head.Analysis_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label19` | **Label19** | `Label` | - | - | - | - |
| `Costcenter_Name_A` | **اسم مركز التكلفة** | `RadTextBox` | - | - | - | - |
| `Costcenter_ID` | **كود مركز التكلفة** | `RadTextBox` | `Purchase_Orders_Head.Costcenter_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label18` | **Label18** | `Label` | - | - | - | - |
| `Analysis_GridView` | **Analysis_GridView** | `RadGridView` | - | - | - | - |
| `Costcenters_GridView` | **Costcenters_GridView** | `RadGridView` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `Label29` | **Label29** | `Label` | - | - | - | - |
| `Purchase_Note_No` | **رقم الحركة / السند** | `RadTextBox` | `Purchase_Orders_Head.Note_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `Item_Desc` | **Item_Desc** | `RadTextBox` | `Purchase_Orders_Details.Item_Desc` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Label15` | **Label15** | `Label` | - | - | - | - |
| `Actual_Net` | **الصافي المستحق** | `RadTextBox` | `Purchase_Orders_Details.Actual_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Net` | **الصافي المستحق** | `RadTextBox` | `Purchase_Orders_Head.Note_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Actual_Price` | **السعر الفردي** | `RadTextBox` | `Purchase_Orders_Details.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Price` | **السعر الفردي** | `RadTextBox` | `Purchase_Orders_Details.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Note_Total` | **الإجمالي** | `RadTextBox` | `Purchase_Orders_Head.Note_Total` | `float` (NOT NULL) | `((0))` | `Total = SUM(Details.Net)` |
| `Label35` | **Label35** | `Label` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `TextBox` | `Purchase_Orders_Head.Note_Net_Text` | `nvarchar(250)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `Note_Net` | **الصافي المستحق** | `RadTextBox` | `Purchase_Orders_Head.Note_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Note_Qty` | **الكمية** | `RadTextBox` | `Purchase_Orders_Head.Note_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Acc_Adap_H` | **Acc_Adap_H** | `SqlDataAdapter` | - | - | - | - |
| `Acc_Adap_D` | **Acc_Adap_D** | `SqlDataAdapter` | - | - | - | - |
| `Adap_H` | **Adap_H** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D` | **Adap_D** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D_V` | **Adap_D_V** | `SqlDataAdapter` | - | - | - | - |
| `Adap` | **Adap** | `SqlDataAdapter` | - | - | - | - |
| `Adap1` | **Adap1** | `SqlDataAdapter` | - | - | - | - |
| `Adap_Print` | **زر طباعة التقرير / السند** | `SqlDataAdapter` | - | - | - | - |
| `Balance_Adap` | **الرصيد / الفارق** | `SqlDataAdapter` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Branche_Adap` | **Branche_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Permission_Adap` | **Permission_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Delete_Adap` | **زر حذف السجل** | `SqlDataAdapter` | - | - | - | - |
| `Setting_Adap` | **Setting_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Setting_Adap1` | **Setting_Adap1** | `SqlDataAdapter` | - | - | - | - |
| `Link_Adap` | **Link_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Profile_Adap` | **Profile_Adap** | `OleDbDataAdapter` | - | - | - | - |
| `Acc_RRS_H` | **Acc_RRS_H** | `DataSet` | - | - | - | - |
| `Acc_RRS_D` | **Acc_RRS_D** | `DataSet` | - | - | - | - |
| `RRS_H` | **RRS_H** | `DataSet` | - | - | - | - |
| `RRS_D` | **RRS_D** | `DataSet` | - | - | - | - |
| `RRS_D_V` | **RRS_D_V** | `DataSet` | - | - | - | - |
| `RRS` | **RRS** | `DataSet` | - | - | - | - |
| `RRS1` | **RRS1** | `DataSet` | - | - | - | - |
| `RRS_Print` | **زر طباعة التقرير / السند** | `DataSet` | - | - | - | - |
| `Balance_RRS` | **الرصيد / الفارق** | `DataSet` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Branche_RRS` | **Branche_RRS** | `DataSet` | - | - | - | - |
| `Permission_RRS` | **Permission_RRS** | `DataSet` | - | - | - | - |
| `Profile_RRS` | **Profile_RRS** | `DataSet` | - | - | - | - |
| `Delete_RRS` | **زر حذف السجل** | `DataSet` | - | - | - | - |
| `Setting_RRS` | **Setting_RRS** | `DataSet` | - | - | - | - |
| `Setting_RRS1` | **Setting_RRS1** | `DataSet` | - | - | - | - |
| `Link_RRS` | **Link_RRS** | `DataSet` | - | - | - | - |
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
| `Cmd7` | **Cmd7** | `SqlCommand` | - | - | - | - |
| `Cmd8` | **Cmd8** | `SqlCommand` | - | - | - | - |
| `Balance_Cmd` | **الرصيد / الفارق** | `SqlCommand` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Dt` | **Dt** | `DataTable` | - | - | - | - |
| `Dt_D` | **Dt_D** | `DataTable` | - | - | - | - |
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد السـند المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال وحدة الصرف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الكميـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال السـعر 
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الإجمالي: Total = SUM(Details.Net) (المعادلة: `Total = SUM(Details.Net)`)
- **[Calculation]** حساب تلقائي لحقل الصافي تفقيطاً (كتابة بالكلمات): Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Where Analysis_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters_View Where Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Purchase_Orders_Head_View Order By Note_No DESC
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users_Table
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users Where User_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Branches
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Purchase_Settings Where ID=
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
Select * FROM Items_View Order By Item_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM Purchase_Orders_Head Order By Note_No Desc
```
##### استعلام INSERT على جدول `Purchase_Orders_Head`:
```sql
Insert Into Purchase_Orders_Head(Note_No,Note_Date,Note_Date_H,Analysis_ID,Costcenter_ID,Note_Actual_Qty,Note_Qty,Note_Total,Note_Net,Notice,Note_Net_Text,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Purchase_Orders_Details`:
```sql
Insert Into Purchase_Orders_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Actual_Net,Net,Item_Desc)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Purchase_Orders_Head Where Note_No=
```
##### استعلام UPDATE على جدول `Purchase_Orders_Head`:
```sql
Update Purchase_Orders_Head Set Note_No=
```
##### استعلام DELETE على جدول `Purchase_Orders_Details`:
```sql
Delete From Purchase_Orders_Details Where Note_No=
```
##### استعلام INSERT على جدول `Purchase_Orders_Details`:
```sql
Insert Into Purchase_Orders_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Actual_Net,Net,Item_Desc)Values(
```
##### استعلام DELETE على جدول `Purchase_Orders_Head`:
```sql
Delete From Purchase_Orders_Head where Note_No=
```
##### استعلام DELETE على جدول `Purchase_Orders_Details`:
```sql
Delete From Purchase_Orders_Details where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Purchase_Orders_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Purchase_Orders_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Purchase_Orders_Head_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Purchase_Orders_Head_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Purchase_Orders_Details_View Where Note_No=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Unit_ID_GotFocus, Unit_ID_KeyDown, Unit_Name_GotFocus, Unit_Name_KeyDown, Units_GridView_CellClick, Units_GridView_CellFormatting, Units_GridView_KeyDown, Unit_ID_LostFocus, Unit_Name_LostFocus, Note_Date_ValueChanged, Costcenter_ID_GotFocus, Costcenter_Name_A_GotFocus, Costcenter_Name_A_KeyDown, Costcenter_Name_A_LostFocus, Costcenter_ID_KeyDown, Analysis_ID_GotFocus, Analysis_Name_A_GotFocus, Analysis_Name_A_KeyDown, Analysis_Name_A_LostFocus, Analysis_ID_KeyDown, Analysis_ID_KeyPress, Analysis_ID_LostFocus, Analysis_GridView_CellClick, Analysis_GridView_CellFormatting, Analysis_GridView_KeyDown, Costcenters_GridView_CellClick, Costcenters_GridView_CellFormatting, Costcenters_GridView_KeyDown, Costcenter_ID_KeyPress, Costcenter_ID_LostFocus, Actual_Price_GotFocus, Actual_Price_KeyDown, Actual_Price_KeyPress, Actual_Price_LostFocus, Actual_Net_GotFocus, Actual_Net_KeyDown, Actual_Net_LostFocus, set_Actual_Net, get_Net, set_Net, get_Label14, set_Label14, get_Actual_Price, set_Actual_Price, get_Price, set_Price, get_Note_Total, set_Note_Total, get_Label35, set_Label35, get_Note_Net_Text, set_Note_Net_Text, get_Note_Net, set_Note_Net, get_Note_Qty, set_Note_Qty, Clear_Record, Clear_Data, Fill_Grid, Fill_Analysis_Grid, Fill_Costcenters_Grid, Fill_Items_Grid, Fill_Units_Grid, Lock_Control, Enable_Control, Review_Record, Find_Total, Purchase_Order_Form_KeyDown, Purchase_Order_Form_Load, Purchase_Order_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Notice_GotFocus, Notice_KeyDown, Notice_KeyPress, Note_Date_KeyDown, Note_Date_Opened, RadGridView1_DoubleClick, RadGridView1_KeyDown, Item_ID_GotFocus, Item_ID_KeyDown, Item_ID_KeyPress, Item_Name_A_GotFocus, Item_Name_A_KeyDown, Item_Name_A_LostFocus, Items_GridView_CellClick, Items_GridView_CellFormatting, Items_GridView_KeyDown, Actual_Qty_GotFocus, Actual_Qty_KeyDown, Actual_Qty_KeyPress, Note_No_GotFocus, Note_No_KeyDown, Note_No_KeyPress, Note_No_LostFocus, Notice_LostFocus, Qty_LostFocus, Item_ID_LostFocus, Search_Txt_LostFocus, Note_Date_H_GotFocus, Note_Date_H_KeyDown, Note_Date_H_LostFocus, Item_Desc_GotFocus, Item_Desc_KeyDown, Item_Desc_KeyPress, Item_Desc_LostFocus, Note_Actual_Qty_GotFocus, Note_Actual_Qty_KeyDown, Note_Actual_Qty_LostFocus, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadPanel4, set_RadPanel4, get_RadGridView1, set_RadGridView1, get_Note_Date, set_Note_Date, get_Items_GridView, set_Items_GridView, get_RadLabel15, set_RadLabel15, get_Label13, set_Label13, get_Label8, set_Label8, get_Label6, set_Label6, get_Note_No, set_Note_No, get_Notice, set_Notice, get_Label4, set_Label4, get_Label9, set_Label9, get_Label10, set_Label10, get_Label11, set_Label11, get_Actual_Qty, set_Actual_Qty, get_Unit_Name, set_Unit_Name, get_Item_Name_A, set_Item_Name_A, get_Item_ID, set_Item_ID, get_Label28, set_Label28, get_Note_Actual_Qty, set_Note_Actual_Qty, get_Note_Net_With_Tax_Text, set_Note_Net_With_Tax_Text, get_SR, set_SR, get_Unit_ID, set_Unit_ID, get_Note_Date_H, set_Note_Date_H, get_Label2, set_Label2, get_Qty, set_Qty, get_Units_GridView, set_Units_GridView, get_Label3, set_Label3, get_Unit_Exchang, set_Unit_Exchang, get_Analysis_Name_A, set_Analysis_Name_A, get_Analysis_ID, set_Analysis_ID, get_Label19, set_Label19, get_Costcenter_Name_A, set_Costcenter_Name_A, get_Costcenter_ID, set_Costcenter_ID, get_Label18, set_Label18, get_Analysis_GridView, set_Analysis_GridView, get_Costcenters_GridView, set_Costcenters_GridView, get_AquaTheme1, set_AquaTheme1, get_Label29, set_Label29, get_Purchase_Note_No, set_Purchase_Note_No, get_Item_Desc, set_Item_Desc, get_Label5, set_Label5, get_Label15, set_Label15, get_Actual_Net
```

---

### 3.3 شاشة: فاتورة المشتريات المحلية والمخزنية (`Purchase_Form`)
- **الاسم الإنجليزي:** Purchase Invoices
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** تسجيل فواتير المشتريات، الخصومات التجارية والنقدية، ضريبة القيمة المضافة، والترحيل المخزني والمالي
- **جداول قاعدة البيانات المستهدفة:** `Purchase_Head`, `Purchase_Details`

#### أ. كتالوج حقول وعناصر التحكم (Field & Control Catalog Table)
| معرف العنصر (Control ID) | التسمية العربية (Label) | نوع عنصر الواجهة | الربط بقاعدة البيانات (DB Binding) | نوع البيانات والقيود (Type & Constraints) | القيمة الافتراضية | المعادلة / السلوك البرمجي |
|---|---|---|---|---|---|---|
| `Windows7Theme1` | **Windows7Theme1** | `Windows7Theme` | - | - | - | - |
| `Save` | **زر حفظ السجل** | `RadButton` | - | - | - | - |
| `Delete` | **زر حذف السجل** | `RadButton` | - | - | - | - |
| `F_Exit` | **F_Exit** | `RadButton` | - | - | - | - |
| `Print` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Add` | **زر إضافة جديد** | `RadButton` | - | - | - | - |
| `Modify` | **زر تعديل السجل** | `RadButton` | - | - | - | - |
| `Search_Txt` | **حقل / زر البحث** | `RadTextBox` | - | - | - | - |
| `GridView` | **GridView** | `RadGridView` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Purchase_Head.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Purchase_Head.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `RadGridView1` | **RadGridView1** | `RadGridView` | - | - | - | - |
| `Note_Date` | **تاريخ الحركة** | `RadDateTimePicker` | `Purchase_Head.Note_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Items_GridView` | **Items_GridView** | `RadGridView` | - | - | - | - |
| `RadLabel15` | **RadLabel15** | `RadLabel` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Label8` | **Label8** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Note_No` | **رقم الحركة / السند** | `RadTextBox` | `Purchase_Head.Note_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Purchase_Head.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Label10` | **Label10** | `Label` | - | - | - | - |
| `Label11` | **Label11** | `Label` | - | - | - | - |
| `Actual_Qty` | **الكمية** | `RadTextBox` | `Purchase_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Unit_Name` | **الوحدة** | `RadTextBox` | - | - | - | - |
| `Item_Name_A` | **اسم الصنف** | `RadTextBox` | - | - | - | - |
| `Item_ID` | **كود الصنف** | `RadTextBox` | `Purchase_Details.Item_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label15` | **Label15** | `Label` | - | - | - | - |
| `Actual_Net` | **الصافي المستحق** | `RadTextBox` | `Purchase_Details.Actual_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Actual_Price` | **السعر الفردي** | `RadTextBox` | `Purchase_Details.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Label26` | **Label26** | `Label` | - | - | - | - |
| `Note_Total` | **الإجمالي** | `RadTextBox` | `Purchase_Head.Note_Total` | `float` (NOT NULL) | `((0))` | `Total = SUM(Details.Net)` |
| `Label28` | **Label28** | `Label` | - | - | - | - |
| `Note_Actual_Qty` | **الكمية** | `RadTextBox` | `Purchase_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Note_Net_With_Tax_Text` | **ضريبة القيمة المضافة** | `RadTextBox` | - | - | - | `Net = Total - Discount + Tax` |
| `SR` | **SR** | `RadTextBox` | `Purchase_Details.SR` | `int` (PRIMARY KEY, NOT NULL) | - | - |
| `Inventory_Name_A` | **Inventory_Name_A** | `RadTextBox` | - | - | - | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Inventory_ID` | **كود المخزن** | `RadTextBox` | `Purchase_Head.Inventory_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Unit_ID` | **الوحدة** | `RadTextBox` | `Purchase_Details.Unit_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `Note_Date_H` | **تاريخ الحركة** | `RadTextBox` | `Purchase_Head.Note_Date_H` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Qty` | **الكمية** | `RadTextBox` | `Purchase_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Price` | **السعر الفردي** | `RadTextBox` | `Purchase_Details.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Units_GridView` | **Units_GridView** | `RadGridView` | - | - | - | - |
| `Inventories_GridView` | **Inventories_GridView** | `RadGridView` | - | - | - | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Unit_Exchang` | **Unit_Exchang** | `RadTextBox` | `Purchase_Head.Exchang` | `float` (NOT NULL) | `((1))` | - |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Supplier_Invoices` | **Supplier_Invoices** | `RadTextBox` | `Purchase_Head.Supplier_Invoices` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Supplier_Name_A` | **اسم المورد** | `RadTextBox` | - | - | - | - |
| `Label7` | **Label7** | `Label` | - | - | - | - |
| `Supplier_ID` | **كود المورد** | `RadTextBox` | `Purchase_Head.Supplier_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label12` | **Label12** | `Label` | - | - | - | - |
| `Note_Type` | **Note_Type** | `RadDropDownList` | `Purchase_Head.Note_Type` | `smallint` (NOT NULL) | `((0))` | - |
| `Currency_Name_A` | **اسم العملة** | `RadTextBox` | - | - | - | - |
| `Exchang` | **Exchang** | `RadTextBox` | `Purchase_Head.Exchang` | `float` (NOT NULL) | `((1))` | - |
| `Label17` | **Label17** | `Label` | - | - | - | - |
| `Label27` | **Label27** | `Label` | - | - | - | - |
| `Currency_ID` | **كود العملة** | `RadTextBox` | `Purchase_Head.Currency_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `Analysis_Name_A` | **اسم الحساب التحليلي** | `RadTextBox` | - | - | - | - |
| `Analysis_ID` | **كود الحساب التحليلي** | `RadTextBox` | `Purchase_Head.Analysis_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label19` | **Label19** | `Label` | - | - | - | - |
| `Costcenter_Name_A` | **اسم مركز التكلفة** | `RadTextBox` | - | - | - | - |
| `Costcenter_ID` | **كود مركز التكلفة** | `RadTextBox` | `Purchase_Head.Costcenter_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label18` | **Label18** | `Label` | - | - | - | - |
| `Note_Net_With_Tax` | **ضريبة القيمة المضافة** | `RadTextBox` | `Purchase_Head.Note_Net_With_Tax` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label16` | **Label16** | `Label` | - | - | - | - |
| `Note_Actual_Total` | **الإجمالي** | `RadTextBox` | `Purchase_Head.Note_Actual_Total` | `float` (NOT NULL) | `((0))` | `Total = SUM(Details.Net)` |
| `Label25` | **Label25** | `Label` | - | - | - | - |
| `Vat_Tax_Per` | **ضريبة القيمة المضافة** | `RadTextBox` | `Purchase_Head.Vat_Tax_Per` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label24` | **Label24** | `Label` | - | - | - | - |
| `Note_Tax` | **ضريبة القيمة المضافة** | `RadTextBox` | `Purchase_Head.Note_Tax` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label23` | **Label23** | `Label` | - | - | - | - |
| `D_Tax_Per` | **ضريبة القيمة المضافة** | `RadTextBox` | `Purchase_Head.D_Tax_Per` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label22` | **Label22** | `Label` | - | - | - | - |
| `Label20` | **Label20** | `Label` | - | - | - | - |
| `Vat_Tax_Amount` | **ضريبة القيمة المضافة** | `RadTextBox` | `Purchase_Head.Vat_Tax_Amount` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label21` | **Label21** | `Label` | - | - | - | - |
| `D_Tax_Amount` | **ضريبة القيمة المضافة** | `RadTextBox` | `Purchase_Head.D_Tax_Amount` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Credit_Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Credit_Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Purchase_Head.Credit_Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label30` | **Label30** | `Label` | - | - | - | - |
| `Purchase_Order` | **Purchase_Order** | `RadTextBox` | `Purchase_Head.Purchase_Order` | `nvarchar(20)` (NOT NULL) | `((0))` | - |
| `Label31` | **Label31** | `Label` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `TextBox` | `Purchase_Head.Note_Net_Text` | `nvarchar(250)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `Analysis_GridView` | **Analysis_GridView** | `RadGridView` | - | - | - | - |
| `Currency_GridView` | **Currency_GridView** | `RadGridView` | - | - | - | - |
| `Costcenters_GridView` | **Costcenters_GridView** | `RadGridView` | - | - | - | - |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `Note_Discount_After_Tax` | **الخصم** | `RadTextBox` | `Purchase_Head.Note_Discount_After_Tax` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Net` | **الصافي المستحق** | `RadTextBox` | `Purchase_Head.Note_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Cost` | **Cost** | `RadTextBox` | `Purchase_Details.Cost` | `float` (NOT NULL) | `((0))` | - |
| `Label29` | **Label29** | `Label` | - | - | - | - |
| `Journal_No` | **Journal_No** | `RadTextBox` | `Purchase_Head.Journal_No` | `int` (NOT NULL) | `((0))` | - |
| `Print_Journal` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Previous_Balance0` | **الرصيد / الفارق** | `RadTextBox` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Label32` | **Label32** | `Label` | - | - | - | - |
| `Discount_Amount` | **الخصم** | `RadTextBox` | `Purchase_Head.Discount_Amount` | `float` (NOT NULL) | `((0))` | - |
| `Label33` | **Label33** | `Label` | - | - | - | - |
| `Note_Net` | **الصافي المستحق** | `RadTextBox` | `Purchase_Head.Note_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label35` | **Label35** | `Label` | - | - | - | - |
| `Acc_Adap_H` | **Acc_Adap_H** | `SqlDataAdapter` | - | - | - | - |
| `Acc_Adap_D` | **Acc_Adap_D** | `SqlDataAdapter` | - | - | - | - |
| `Adap_H` | **Adap_H** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D` | **Adap_D** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D_V` | **Adap_D_V** | `SqlDataAdapter` | - | - | - | - |
| `Adap` | **Adap** | `SqlDataAdapter` | - | - | - | - |
| `Adap1` | **Adap1** | `SqlDataAdapter` | - | - | - | - |
| `Adap_Print` | **زر طباعة التقرير / السند** | `SqlDataAdapter` | - | - | - | - |
| `Balance_Adap` | **الرصيد / الفارق** | `SqlDataAdapter` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Branche_Adap` | **Branche_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Permission_Adap` | **Permission_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Delete_Adap` | **زر حذف السجل** | `SqlDataAdapter` | - | - | - | - |
| `Setting_Adap` | **Setting_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Setting_Adap1` | **Setting_Adap1** | `SqlDataAdapter` | - | - | - | - |
| `Link_Adap` | **Link_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Profile_Adap` | **Profile_Adap** | `OleDbDataAdapter` | - | - | - | - |
| `Acc_RRS_H` | **Acc_RRS_H** | `DataSet` | - | - | - | - |
| `Acc_RRS_D` | **Acc_RRS_D** | `DataSet` | - | - | - | - |
| `RRS_H` | **RRS_H** | `DataSet` | - | - | - | - |
| `RRS_D` | **RRS_D** | `DataSet` | - | - | - | - |
| `RRS_D_V` | **RRS_D_V** | `DataSet` | - | - | - | - |
| `RRS` | **RRS** | `DataSet` | - | - | - | - |
| `RRS1` | **RRS1** | `DataSet` | - | - | - | - |
| `RRS_Print` | **زر طباعة التقرير / السند** | `DataSet` | - | - | - | - |
| `Balance_RRS` | **الرصيد / الفارق** | `DataSet` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Branche_RRS` | **Branche_RRS** | `DataSet` | - | - | - | - |
| `Permission_RRS` | **Permission_RRS** | `DataSet` | - | - | - | - |
| `Profile_RRS` | **Profile_RRS** | `DataSet` | - | - | - | - |
| `Delete_RRS` | **زر حذف السجل** | `DataSet` | - | - | - | - |
| `Setting_RRS` | **Setting_RRS** | `DataSet` | - | - | - | - |
| `Setting_RRS1` | **Setting_RRS1** | `DataSet` | - | - | - | - |
| `Link_RRS` | **Link_RRS** | `DataSet` | - | - | - | - |
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
| `Cmd7` | **Cmd7** | `SqlCommand` | - | - | - | - |
| `Cmd8` | **Cmd8** | `SqlCommand` | - | - | - | - |
| `Balance_Cmd` | **الرصيد / الفارق** | `SqlCommand` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Dt` | **Dt** | `DataTable` | - | - | - | - |
| `Dt_D` | **Dt_D** | `DataTable` | - | - | - | - |
| `Setting_Dt` | **Setting_Dt** | `DataTable` | - | - | - | - |
| `Link_Dt` | **Link_Dt** | `DataTable` | - | - | - | - |

#### ب. قواعد التحقق والمعادلات الحسابية (Validation & Business Rules)
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيـد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إضافة سجل جديد أثناء عملية التعديل. لأضافة سجل يجب الضغط على الغاء التعديل ثم الضغط على سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إجراء تعديل أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: في حالة الإضافة يجب الضغط على سجل جديد وفي حالة التعديل يجب الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السند غير موجود ويجب حفظه أولاً  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء إضافة سجل جديد. للحذف يجب الضغط على الغاء الإضافة ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء تعديل سجل . للحذف يجب الضغط على الغاء التعديل ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد السجل المراد حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد السـند المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال وحدة الصرف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الكميـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم العُملـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المخزن 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المورد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم القيد المحاسـبي 
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الإجمالي: Total = SUM(Details.Net) (المعادلة: `Total = SUM(Details.Net)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الإجمالي: Total = SUM(Details.Net) (المعادلة: `Total = SUM(Details.Net)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Tax = (Total - Discount) * (Tax_Rate / 100) (المعادلة: `Tax = (Total - Discount) * (Tax_Rate / 100)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Tax = (Total - Discount) * (Tax_Rate / 100) (المعادلة: `Tax = (Total - Discount) * (Tax_Rate / 100)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Tax = (Total - Discount) * (Tax_Rate / 100) (المعادلة: `Tax = (Total - Discount) * (Tax_Rate / 100)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Tax = (Total - Discount) * (Tax_Rate / 100) (المعادلة: `Tax = (Total - Discount) * (Tax_Rate / 100)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Tax = (Total - Discount) * (Tax_Rate / 100) (المعادلة: `Tax = (Total - Discount) * (Tax_Rate / 100)`)
- **[Calculation]** حساب تلقائي لحقل الصافي تفقيطاً (كتابة بالكلمات): Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الخصم: Tax = (Total - Discount) * (Tax_Rate / 100) (المعادلة: `Tax = (Total - Discount) * (Tax_Rate / 100)`)
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Currencies Where Currency_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select Sum(Credit)-Sum(Debit) AS Supplier_Balance FROM TransMaster_Union Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select Sum(Credit)-Sum(Debit) AS Supplier_Balance FROM TransMaster_Union Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters_View Where Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Where Analysis_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select Sum(Credit)-Sum(Debit) AS Supplier_Balance FROM TransMaster_Union Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM Purchase_Head Order By Note_No Desc
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM Purchase_Journals_Head Order By Note_No Desc
```
##### استعلام INSERT على جدول `Purchase_Head`:
```sql
Insert Into Purchase_Head(Note_No,Note_Date,Note_Date_H,Note_Type,Currency_ID,Exchang,Inventory_ID,Supplier_ID,Cash_Supplier_Name,Previous_Balance,Supplier_Invoices,Purchase_Order,Analysis_ID,Costcenter_ID,Discount_Amount,D_Tax_Per,D_Tax_Amount,Vat_Tax_Per,Vat_Tax_Amount,Note_Tax,Note_Discount_After_Tax,Note_Actual_Qty,Note_Actual_Total,Note_Total,Note_Net,Note_Net_With_Tax,Note_Net_Text,Journal_No,Credit_Level5_ID,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Purchase_Details`:
```sql
Insert Into Purchase_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Cost,Actual_Net,Net)Values(
```
##### استعلام UPDATE على جدول `Purchase_Head`:
```sql
Update Items Set Last_Cost=
```
##### استعلام INSERT على جدول `Purchase_Head`:
```sql
Insert Into Purchase_Journals_Head(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Purchase_Head`:
```sql
Insert Into Purchase_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Actual_Credit,Credit,Analysis_ID,Costcenter_ID,Analyse1)Values(
```
##### استعلام INSERT على جدول `Purchase_Head`:
```sql
Insert Into Purchase_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Purchase_Head`:
```sql
Insert Into Purchase_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام INSERT على جدول `Purchase_Head`:
```sql
Insert Into Purchase_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Costcenter_ID)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Purchase_Head Where Note_No=
```
##### استعلام UPDATE على جدول `Purchase_Head`:
```sql
Update Purchase_Head Set Note_No=
```
##### استعلام DELETE على جدول `Purchase_Details`:
```sql
Delete From Purchase_Details Where Note_No=
```
##### استعلام INSERT على جدول `Purchase_Details`:
```sql
Insert Into Purchase_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Cost,Actual_Net,Net)Values(
```
##### استعلام UPDATE على جدول `Purchase_Head`:
```sql
Update Items Set Last_Cost=
```
##### استعلام DELETE على جدول `Purchase_Head`:
```sql
Delete From Purchase_Journals_Head Where Note_No=
```
##### استعلام DELETE على جدول `Purchase_Head`:
```sql
Delete From Purchase_Journals_Details Where Note_No=
```
##### استعلام INSERT على جدول `Purchase_Head`:
```sql
Insert Into Purchase_Journals_Head(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Purchase_Head`:
```sql
Insert Into Purchase_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Actual_Credit,Credit,Analysis_ID,Costcenter_ID,Analyse1)Values(
```
##### استعلام INSERT على جدول `Purchase_Head`:
```sql
Insert Into Purchase_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Purchase_Head`:
```sql
Insert Into Purchase_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام INSERT على جدول `Purchase_Head`:
```sql
Insert Into Purchase_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Costcenter_ID)Values(
```
##### استعلام DELETE على جدول `Purchase_Head`:
```sql
Delete From Purchase_Head where Note_No=
```
##### استعلام DELETE على جدول `Purchase_Details`:
```sql
Delete From Purchase_Details where Note_No=
```
##### استعلام DELETE على جدول `Purchase_Head`:
```sql
Delete From Purchase_Journals_Head Where Note_No=
```
##### استعلام DELETE على جدول `Purchase_Head`:
```sql
Delete From Purchase_Journals_Details Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Purchase_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Purchase_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Purchase_Head_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Currencies Where Currency_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Balance_For_Search Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Purchase_Head_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Purchase_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Purchase_Head_View Order By Note_No DESC
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users_Table
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users Where User_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Branches
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Purchase_Settings Where ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Journals_Settings Where ID=
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
Select * FROM Inventories Order By Inventory_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_View Order By Item_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Balance_For_Search Order By Item_ID ASC
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Currency_ID_KeyPress, Currency_Name_A_GotFocus, Currency_Name_A_LostFocus, Currency_ID_LostFocus, Note_Type_SelectedIndexChanged, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, Note_Discount_After_Tax_GotFocus, Note_Discount_After_Tax_KeyDown, Note_Discount_After_Tax_KeyPress, Note_Discount_After_Tax_LostFocus, Print_Journal_Click, Print_Journal_KeyDown, Discount_Amount_GotFocus, Discount_Amount_KeyDown, Discount_Amount_KeyPress, Discount_Amount_LostFocus, Note_Net_GotFocus, Note_Net_KeyDown, Note_Net_LostFocus, Unit_ID_LostFocus, Unit_Name_LostFocus, Note_Date_ValueChanged, Costcenter_ID_GotFocus, Costcenter_Name_A_GotFocus, Costcenter_Name_A_KeyDown, Costcenter_Name_A_LostFocus, Costcenter_ID_KeyDown, Costcenter_ID_KeyPress, Costcenter_ID_LostFocus, Analysis_ID_GotFocus, Analysis_Name_A_GotFocus, Analysis_Name_A_KeyDown, Analysis_Name_A_LostFocus, Analysis_ID_KeyDown, Analysis_ID_KeyPress, Analysis_ID_LostFocus, Currency_Name_A_KeyDown, Exchang_GotFocus, Exchang_KeyDown, Exchang_KeyPress, Exchang_LostFocus, Analysis_GridView_CellClick, Analysis_GridView_CellFormatting, Purchase_Order_GotFocus, Purchase_Order_KeyDown, Purchase_Order_KeyPress, Purchase_Order_LostFocus, Supplier_ID_GotFocus, Supplier_Name_A_GotFocus, Supplier_Name_A_KeyDown, Supplier_Name_A_KeyPress, Supplier_Name_A_LostFocus, Supplier_ID_KeyDown, Supplier_ID_KeyPress, Supplier_ID_LostFocus, Supplier_Invoices_GotFocus, Supplier_Invoices_KeyDown, Supplier_Invoices_KeyPress, Supplier_Invoices_LostFocus, Credit_Level5_ID_GotFocus, Credit_Level5_Name_A_GotFocus, Credit_Level5_Name_A_KeyDown, Credit_Level5_Name_A_LostFocus, Credit_Level5_ID_KeyDown, Credit_Level5_ID_KeyPress, Credit_Level5_ID_LostFocus, D_Tax_Per_GotFocus, D_Tax_Per_KeyDown, D_Tax_Per_KeyPress, D_Tax_Per_LostFocus, D_Tax_Amount_GotFocus, D_Tax_Amount_KeyDown, D_Tax_Amount_KeyPress, D_Tax_Amount_LostFocus, Vat_Tax_Per_GotFocus, Vat_Tax_Per_KeyDown, Vat_Tax_Per_KeyPress, Vat_Tax_Per_LostFocus, Vat_Tax_Amount_GotFocus, Vat_Tax_Amount_KeyDown, Vat_Tax_Amount_KeyPress, Vat_Tax_Amount_LostFocus, Note_Tax_GotFocus, Note_Tax_KeyDown, Note_Tax_LostFocus, Note_Actual_Total_GotFocus, Note_Actual_Total_KeyDown, Note_Actual_Total_LostFocus, Note_Net_With_Tax_GotFocus, Note_Net_With_Tax_KeyDown, Note_Net_With_Tax_LostFocus, Note_Type_GotFocus, Note_Type_KeyDown, Note_Type_KeyPress, Note_Type_LostFocus, Analysis_GridView_KeyDown, Costcenters_GridView_CellClick, Costcenters_GridView_CellFormatting, Costcenters_GridView_KeyDown, Currency_GridView_CellClick, Currency_GridView_CellFormatting, Currency_GridView_KeyDown, Currency_ID_GotFocus, Currency_ID_KeyDown, Purchase_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Note_No_GotFocus, Note_No_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Notice_GotFocus, Notice_KeyDown, Notice_KeyPress, Note_Date_KeyDown, Note_Date_Opened, RadGridView1_DoubleClick, RadGridView1_KeyDown, Item_ID_GotFocus, Item_ID_KeyDown, Item_ID_KeyPress, Item_Name_A_GotFocus, Item_Name_A_KeyDown, Items_GridView_CellClick, Items_GridView_CellFormatting, Items_GridView_KeyDown, Actual_Qty_GotFocus, Actual_Qty_KeyDown, Actual_Qty_KeyPress, Note_No_KeyPress, Note_No_LostFocus, Notice_LostFocus, Qty_LostFocus, Item_ID_LostFocus, Search_Txt_LostFocus, Inventory_ID_GotFocus, Inventory_ID_KeyDown, Inventory_ID_KeyPress, Inventory_Name_A_GotFocus, Inventory_Name_A_KeyDown, Inventories_GridView_CellClick, Inventories_GridView_CellFormatting, Inventories_GridView_KeyDown, Inventory_ID_LostFocus, Inventory_Name_A_LostFocus, Note_Date_H_GotFocus, Note_Date_H_KeyDown, Note_Date_H_LostFocus, Actual_Net_GotFocus, Actual_Net_KeyDown, Actual_Net_LostFocus, Actual_Price_GotFocus, Actual_Price_KeyDown, Actual_Price_KeyPress, Actual_Price_LostFocus, Item_Name_A_LostFocus, Note_Actual_Qty_GotFocus, Note_Actual_Qty_KeyDown, Note_Total_GotFocus, Note_Total_KeyDown, Note_Actual_Qty_LostFocus, Note_Total_LostFocus, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, Note_Net_Text_LostFocus, Unit_ID_GotFocus, Unit_ID_KeyDown, Unit_Name_GotFocus, Unit_Name_KeyDown, Units_GridView_CellClick, Units_GridView_CellFormatting, Units_GridView_KeyDown, set_Label7, get_Supplier_ID, set_Supplier_ID, get_Label12, set_Label12, get_Note_Type, set_Note_Type, get_Currency_Name_A, set_Currency_Name_A, get_Exchang, set_Exchang, get_Label17, set_Label17, get_Label27, set_Label27, get_Currency_ID, set_Currency_ID, get_Analysis_Name_A, set_Analysis_Name_A, get_Analysis_ID, set_Analysis_ID, get_Label19, set_Label19, get_Costcenter_Name_A, set_Costcenter_Name_A, get_Costcenter_ID, set_Costcenter_ID, get_Label18, set_Label18, get_Note_Net_With_Tax, set_Note_Net_With_Tax, get_Label16, set_Label16, get_Note_Actual_Total, set_Note_Actual_Total, get_Label25, set_Label25, get_Vat_Tax_Per, set_Vat_Tax_Per, get_Label24, set_Label24, get_Note_Tax, set_Note_Tax, get_Label23, set_Label23, get_D_Tax_Per, set_D_Tax_Per, get_Label22, set_Label22, get_Label20, set_Label20, get_Vat_Tax_Amount, set_Vat_Tax_Amount, get_Label21, set_Label21, get_D_Tax_Amount, set_D_Tax_Amount, get_Credit_Level5_Name_A, set_Credit_Level5_Name_A, get_Credit_Level5_ID, set_Credit_Level5_ID, get_Label30, set_Label30, get_Purchase_Order, set_Purchase_Order, get_Label31, set_Label31, get_Note_Net_Text, set_Note_Net_Text, get_Analysis_GridView, set_Analysis_GridView, get_Currency_GridView, set_Currency_GridView, get_Costcenters_GridView, set_Costcenters_GridView, get_Level5_GridView, set_Level5_GridView, get_AquaTheme1, set_AquaTheme1, get_Note_Discount_After_Tax, set_Note_Discount_After_Tax, get_Net, set_Net, get_Cost, set_Cost, get_Label29, set_Label29, get_Journal_No, set_Journal_No, get_Print_Journal, set_Print_Journal, get_Previous_Balance0, set_Previous_Balance0, get_Label32, set_Label32, get_Discount_Amount, set_Discount_Amount, get_Label33, set_Label33, get_Note_Net, set_Note_Net, get_Label35, set_Label35, Clear_Record, Clear_Data, Fill_Grid, Fill_Level5_Grid, Fill_Analysis_Grid, Fill_Costcenters_Grid, Fill_Currencies_Grid, Fill_Inventories_Grid, Fill_Items_Grid, Fill_Units_Grid, Lock_Control, Enable_Control, Review_Record, Find_Total, Purchase_Form_KeyDown, Purchase_Form_Load, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadPanel4, set_RadPanel4, get_RadGridView1, set_RadGridView1, get_Note_Date, set_Note_Date, get_Items_GridView, set_Items_GridView, get_RadLabel15, set_RadLabel15, get_Label13, set_Label13, get_Label8, set_Label8, get_Label6, set_Label6, get_Note_No, set_Note_No, get_Notice, set_Notice, get_Label4, set_Label4, get_Label9, set_Label9, get_Label10, set_Label10, get_Label11, set_Label11, get_Actual_Qty, set_Actual_Qty, get_Unit_Name, set_Unit_Name, get_Item_Name_A, set_Item_Name_A, get_Item_ID, set_Item_ID, get_Label15, set_Label15, get_Actual_Net, set_Actual_Net, get_Label14, set_Label14, get_Actual_Price, set_Actual_Price, get_Label26, set_Label26, get_Note_Total, set_Note_Total, get_Label28, set_Label28, get_Note_Actual_Qty, set_Note_Actual_Qty, get_Note_Net_With_Tax_Text, set_Note_Net_With_Tax_Text, get_SR, set_SR, get_Inventory_Name_A, set_Inventory_Name_A, get_Label1, set_Label1, get_Inventory_ID, set_Inventory_ID, get_Unit_ID, set_Unit_ID, get_Note_Date_H, set_Note_Date_H, get_Label2, set_Label2, get_Qty, set_Qty, get_Price, set_Price, get_Units_GridView, set_Units_GridView, get_Inventories_GridView, set_Inventories_GridView, get_Label3, set_Label3, get_Unit_Exchang, set_Unit_Exchang, get_Label5, set_Label5, get_Supplier_Invoices, set_Supplier_Invoices, get_Supplier_Name_A, set_Supplier_Name_A, get_Label7
```

---

### 3.4 شاشة: فاتورة المشتريات (نمط إضافي / خدمات) (`Purchase_Form1`)
- **الاسم الإنجليزي:** Purchase Invoices (Auxiliary Pattern)
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** تسجيل مشتريات الخدمات والمصروفات الرأسمالية والمشتريات المباشرة
- **جداول قاعدة البيانات المستهدفة:** `Purchase_Head1`, `Purchase_Details1`

#### أ. كتالوج حقول وعناصر التحكم (Field & Control Catalog Table)
| معرف العنصر (Control ID) | التسمية العربية (Label) | نوع عنصر الواجهة | الربط بقاعدة البيانات (DB Binding) | نوع البيانات والقيود (Type & Constraints) | القيمة الافتراضية | المعادلة / السلوك البرمجي |
|---|---|---|---|---|---|---|
| `Windows7Theme1` | **Windows7Theme1** | `Windows7Theme` | - | - | - | - |
| `Save` | **زر حفظ السجل** | `RadButton` | - | - | - | - |
| `Delete` | **زر حذف السجل** | `RadButton` | - | - | - | - |
| `F_Exit` | **F_Exit** | `RadButton` | - | - | - | - |
| `Print` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Add` | **زر إضافة جديد** | `RadButton` | - | - | - | - |
| `Modify` | **زر تعديل السجل** | `RadButton` | - | - | - | - |
| `Search_Txt` | **حقل / زر البحث** | `RadTextBox` | - | - | - | - |
| `GridView` | **GridView** | `RadGridView` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Purchase_Head1.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Purchase_Head1.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `RadGridView1` | **RadGridView1** | `RadGridView` | - | - | - | - |
| `Note_Date` | **تاريخ الحركة** | `RadDateTimePicker` | `Purchase_Head1.Note_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Items_GridView` | **Items_GridView** | `RadGridView` | - | - | - | - |
| `RadLabel15` | **RadLabel15** | `RadLabel` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Label8` | **Label8** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Note_No` | **رقم الحركة / السند** | `RadTextBox` | `Purchase_Head1.Note_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Purchase_Head1.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Label10` | **Label10** | `Label` | - | - | - | - |
| `Label11` | **Label11** | `Label` | - | - | - | - |
| `Actual_Qty` | **الكمية** | `RadTextBox` | `Purchase_Head1.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Unit_Name` | **الوحدة** | `RadTextBox` | - | - | - | - |
| `Item_Name_A` | **اسم الصنف** | `RadTextBox` | - | - | - | - |
| `Item_ID` | **كود الصنف** | `RadTextBox` | `Purchase_Details1.Item_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label15` | **Label15** | `Label` | - | - | - | - |
| `Actual_Net` | **الصافي المستحق** | `RadTextBox` | `Purchase_Details1.Actual_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Actual_Price` | **السعر الفردي** | `RadTextBox` | `Purchase_Details1.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Note_Total` | **الإجمالي** | `RadTextBox` | `Purchase_Head1.Note_Total` | `float` (NOT NULL) | `((0))` | `Total = SUM(Details.Net)` |
| `Label28` | **Label28** | `Label` | - | - | - | - |
| `Note_Actual_Qty` | **الكمية** | `RadTextBox` | `Purchase_Head1.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Note_Net_With_Tax_Text` | **ضريبة القيمة المضافة** | `RadTextBox` | - | - | - | `Net = Total - Discount + Tax` |
| `SR` | **SR** | `RadTextBox` | `Purchase_Details1.SR` | `int` (PRIMARY KEY, NOT NULL) | - | - |
| `Inventory_Name_A` | **Inventory_Name_A** | `RadTextBox` | - | - | - | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Inventory_ID` | **كود المخزن** | `RadTextBox` | `Purchase_Head1.Inventory_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Unit_ID` | **الوحدة** | `RadTextBox` | `Purchase_Details1.Unit_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `Note_Date_H` | **تاريخ الحركة** | `RadTextBox` | `Purchase_Head1.Note_Date_H` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Qty` | **الكمية** | `RadTextBox` | `Purchase_Head1.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Price` | **السعر الفردي** | `RadTextBox` | `Purchase_Details1.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Units_GridView` | **Units_GridView** | `RadGridView` | - | - | - | - |
| `Inventories_GridView` | **Inventories_GridView** | `RadGridView` | - | - | - | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Unit_Exchang` | **Unit_Exchang** | `RadTextBox` | `Purchase_Head1.Exchang` | `float` (NOT NULL) | `((1))` | - |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Supplier_Invoices` | **Supplier_Invoices** | `RadTextBox` | `Purchase_Head1.Supplier_Invoices` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Supplier_Name_A` | **اسم المورد** | `RadTextBox` | - | - | - | - |
| `Label7` | **Label7** | `Label` | - | - | - | - |
| `Supplier_ID` | **كود المورد** | `RadTextBox` | `Purchase_Head1.Supplier_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label12` | **Label12** | `Label` | - | - | - | - |
| `Note_Type` | **Note_Type** | `RadDropDownList` | `Purchase_Head1.Note_Type` | `smallint` (NOT NULL) | `((0))` | - |
| `Currency_Name_A` | **اسم العملة** | `RadTextBox` | - | - | - | - |
| `Exchang` | **Exchang** | `RadTextBox` | `Purchase_Head1.Exchang` | `float` (NOT NULL) | `((1))` | - |
| `Label17` | **Label17** | `Label` | - | - | - | - |
| `Label27` | **Label27** | `Label` | - | - | - | - |
| `Currency_ID` | **كود العملة** | `RadTextBox` | `Purchase_Head1.Currency_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `Analysis_Name_A` | **اسم الحساب التحليلي** | `RadTextBox` | - | - | - | - |
| `Analysis_ID` | **كود الحساب التحليلي** | `RadTextBox` | `Purchase_Head1.Analysis_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label19` | **Label19** | `Label` | - | - | - | - |
| `Costcenter_Name_A` | **اسم مركز التكلفة** | `RadTextBox` | - | - | - | - |
| `Costcenter_ID` | **كود مركز التكلفة** | `RadTextBox` | `Purchase_Head1.Costcenter_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label18` | **Label18** | `Label` | - | - | - | - |
| `Note_Net_With_Tax` | **ضريبة القيمة المضافة** | `RadTextBox` | `Purchase_Head1.Note_Net_With_Tax` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label16` | **Label16** | `Label` | - | - | - | - |
| `Note_Actual_Total` | **الإجمالي** | `RadTextBox` | `Purchase_Head1.Note_Actual_Total` | `float` (NOT NULL) | `((0))` | `Total = SUM(Details.Net)` |
| `Label25` | **Label25** | `Label` | - | - | - | - |
| `Vat_Tax_Per` | **ضريبة القيمة المضافة** | `RadTextBox` | `Purchase_Head1.Vat_Tax_Per` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label24` | **Label24** | `Label` | - | - | - | - |
| `Note_Tax` | **ضريبة القيمة المضافة** | `RadTextBox` | `Purchase_Head1.Note_Tax` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label23` | **Label23** | `Label` | - | - | - | - |
| `D_Tax_Per` | **ضريبة القيمة المضافة** | `RadTextBox` | `Purchase_Head1.D_Tax_Per` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label22` | **Label22** | `Label` | - | - | - | - |
| `Label20` | **Label20** | `Label` | - | - | - | - |
| `Vat_Tax_Amount` | **ضريبة القيمة المضافة** | `RadTextBox` | `Purchase_Head1.Vat_Tax_Amount` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label21` | **Label21** | `Label` | - | - | - | - |
| `D_Tax_Amount` | **ضريبة القيمة المضافة** | `RadTextBox` | `Purchase_Head1.D_Tax_Amount` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Credit_Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Credit_Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Purchase_Head1.Credit_Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label30` | **Label30** | `Label` | - | - | - | - |
| `Purchase_Order` | **Purchase_Order** | `RadTextBox` | `Purchase_Head1.Purchase_Order` | `nvarchar(20)` (NOT NULL) | `((0))` | - |
| `Label31` | **Label31** | `Label` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `TextBox` | `Purchase_Head1.Note_Net_Text` | `nvarchar(250)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `Analysis_GridView` | **Analysis_GridView** | `RadGridView` | - | - | - | - |
| `Currency_GridView` | **Currency_GridView** | `RadGridView` | - | - | - | - |
| `Costcenters_GridView` | **Costcenters_GridView** | `RadGridView` | - | - | - | - |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `Net` | **الصافي المستحق** | `RadTextBox` | `Purchase_Head1.Note_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Cost` | **Cost** | `RadTextBox` | `Purchase_Details1.Cost` | `float` (NOT NULL) | `((0))` | - |
| `Label29` | **Label29** | `Label` | - | - | - | - |
| `Journal_No` | **Journal_No** | `RadTextBox` | `Purchase_Head1.Journal_No` | `int` (NOT NULL) | `((0))` | - |
| `Print_Journal` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Purchase_Head1.Debit_Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Note_Net` | **الصافي المستحق** | `RadTextBox` | `Purchase_Head1.Note_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label35` | **Label35** | `Label` | - | - | - | - |
| `Acc_Adap_H` | **Acc_Adap_H** | `SqlDataAdapter` | - | - | - | - |
| `Acc_Adap_D` | **Acc_Adap_D** | `SqlDataAdapter` | - | - | - | - |
| `Adap_H` | **Adap_H** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D` | **Adap_D** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D_V` | **Adap_D_V** | `SqlDataAdapter` | - | - | - | - |
| `Adap` | **Adap** | `SqlDataAdapter` | - | - | - | - |
| `Adap1` | **Adap1** | `SqlDataAdapter` | - | - | - | - |
| `Adap_Print` | **زر طباعة التقرير / السند** | `SqlDataAdapter` | - | - | - | - |
| `Balance_Adap` | **الرصيد / الفارق** | `SqlDataAdapter` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Branche_Adap` | **Branche_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Permission_Adap` | **Permission_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Delete_Adap` | **زر حذف السجل** | `SqlDataAdapter` | - | - | - | - |
| `Setting_Adap` | **Setting_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Setting_Adap1` | **Setting_Adap1** | `SqlDataAdapter` | - | - | - | - |
| `Link_Adap` | **Link_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Profile_Adap` | **Profile_Adap** | `OleDbDataAdapter` | - | - | - | - |
| `Acc_RRS_H` | **Acc_RRS_H** | `DataSet` | - | - | - | - |
| `Acc_RRS_D` | **Acc_RRS_D** | `DataSet` | - | - | - | - |
| `RRS_H` | **RRS_H** | `DataSet` | - | - | - | - |
| `RRS_D` | **RRS_D** | `DataSet` | - | - | - | - |
| `RRS_D_V` | **RRS_D_V** | `DataSet` | - | - | - | - |
| `RRS` | **RRS** | `DataSet` | - | - | - | - |
| `RRS1` | **RRS1** | `DataSet` | - | - | - | - |
| `RRS_Print` | **زر طباعة التقرير / السند** | `DataSet` | - | - | - | - |
| `Balance_RRS` | **الرصيد / الفارق** | `DataSet` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Branche_RRS` | **Branche_RRS** | `DataSet` | - | - | - | - |
| `Permission_RRS` | **Permission_RRS** | `DataSet` | - | - | - | - |
| `Profile_RRS` | **Profile_RRS** | `DataSet` | - | - | - | - |
| `Delete_RRS` | **زر حذف السجل** | `DataSet` | - | - | - | - |
| `Setting_RRS` | **Setting_RRS** | `DataSet` | - | - | - | - |
| `Setting_RRS1` | **Setting_RRS1** | `DataSet` | - | - | - | - |
| `Link_RRS` | **Link_RRS** | `DataSet` | - | - | - | - |
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
| `Cmd7` | **Cmd7** | `SqlCommand` | - | - | - | - |
| `Cmd8` | **Cmd8** | `SqlCommand` | - | - | - | - |
| `Balance_Cmd` | **الرصيد / الفارق** | `SqlCommand` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Dt` | **Dt** | `DataTable` | - | - | - | - |
| `Dt_D` | **Dt_D** | `DataTable` | - | - | - | - |
| `Setting_Dt` | **Setting_Dt** | `DataTable` | - | - | - | - |
| `Link_Dt` | **Link_Dt** | `DataTable` | - | - | - | - |

#### ب. قواعد التحقق والمعادلات الحسابية (Validation & Business Rules)
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيـد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء إضافة سجل جديد. للحذف يجب الضغط على الغاء الإضافة ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء تعديل سجل . للحذف يجب الضغط على الغاء التعديل ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد السجل المراد حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد السـند المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال وحدة الصرف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الكميـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم العُملـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المخزن 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المورد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم القيد المحاسـبي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إضافة سجل جديد أثناء عملية التعديل. لأضافة سجل يجب الضغط على الغاء التعديل ثم الضغط على سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إجراء تعديل أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: في حالة الإضافة يجب الضغط على سجل جديد وفي حالة التعديل يجب الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السند غير موجود ويجب حفظه أولاً  
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الإجمالي: Total = SUM(Details.Net) (المعادلة: `Total = SUM(Details.Net)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الإجمالي: Total = SUM(Details.Net) (المعادلة: `Total = SUM(Details.Net)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Tax = (Total - Discount) * (Tax_Rate / 100) (المعادلة: `Tax = (Total - Discount) * (Tax_Rate / 100)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Tax = (Total - Discount) * (Tax_Rate / 100) (المعادلة: `Tax = (Total - Discount) * (Tax_Rate / 100)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Tax = (Total - Discount) * (Tax_Rate / 100) (المعادلة: `Tax = (Total - Discount) * (Tax_Rate / 100)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Tax = (Total - Discount) * (Tax_Rate / 100) (المعادلة: `Tax = (Total - Discount) * (Tax_Rate / 100)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Tax = (Total - Discount) * (Tax_Rate / 100) (المعادلة: `Tax = (Total - Discount) * (Tax_Rate / 100)`)
- **[Calculation]** حساب تلقائي لحقل الصافي تفقيطاً (كتابة بالكلمات): Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters_View Where Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Where Analysis_ID=
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
Select * FROM Currencies Where Currency_ID=
```
##### استعلام DELETE على جدول `Purchase_Head1`:
```sql
Delete From Purchase_Head1 where Note_No=
```
##### استعلام DELETE على جدول `Purchase_Details1`:
```sql
Delete From Purchase_Details1 where Note_No=
```
##### استعلام DELETE على جدول `Purchase_Head1`:
```sql
Delete From Purchase_Journals_Head1 Where Note_No=
```
##### استعلام DELETE على جدول `Purchase_Head1`:
```sql
Delete From Purchase_Journals_Details1 Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Purchase_Details_View1 Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Purchase_Details_View1 Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Purchase_Head_View1 Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Currencies Where Currency_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Balance_For_Search Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Purchase_Head_View1 Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Purchase_Details_View1 Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Purchase_Head_View1 Order By Note_No DESC
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users_Table
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users Where User_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Branches
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Purchase_Settings Where ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Journals_Settings Where ID=
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
Select * FROM Inventories Order By Inventory_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_View Order By Item_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Balance_For_Search Order By Item_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM Purchase_Head1 Order By Note_No Desc
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM Purchase_Journals_Head1 Order By Note_No Desc
```
##### استعلام INSERT على جدول `Purchase_Head1`:
```sql
Insert Into Purchase_Head1(Note_No,Note_Date,Note_Date_H,Note_Type,Currency_ID,Exchang,Inventory_ID,Supplier_ID,Cash_Supplier_Name,Supplier_Invoices,Purchase_Order,Analysis_ID,Costcenter_ID,D_Tax_Per,D_Tax_Amount,Vat_Tax_Per,Vat_Tax_Amount,Note_Tax,Note_Actual_Qty,Note_Actual_Total,Note_Total,Note_Net,Note_Net_With_Tax,Note_Net_Text,Journal_No,Credit_Level5_ID,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Purchase_Details1`:
```sql
Insert Into Purchase_Details1(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Cost,Actual_Net,Net,Level5_ID)Values(
```
##### استعلام UPDATE على جدول `Purchase_Head1`:
```sql
Update Items Set Last_Cost=
```
##### استعلام INSERT على جدول `Purchase_Head1`:
```sql
Insert Into Purchase_Journals_Head1(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Purchase_Head1`:
```sql
Insert Into Purchase_Journals_Details1(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Actual_Credit,Credit,Costcenter_ID,Analyse1)Values(
```
##### استعلام INSERT على جدول `Purchase_Head1`:
```sql
Insert Into Purchase_Journals_Details1(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Purchase_Head1`:
```sql
Insert Into Purchase_Journals_Details1(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام INSERT على جدول `Purchase_Head1`:
```sql
Insert Into Purchase_Journals_Details1(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Costcenter_ID,Analysis_ID)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Purchase_Head1 Where Note_No=
```
##### استعلام UPDATE على جدول `Purchase_Head1`:
```sql
Update Purchase_Head1 Set Note_No=
```
##### استعلام DELETE على جدول `Purchase_Details1`:
```sql
Delete From Purchase_Details1 Where Note_No=
```
##### استعلام INSERT على جدول `Purchase_Details1`:
```sql
Insert Into Purchase_Details1(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Cost,Actual_Net,Net,Level5_ID)Values(
```
##### استعلام DELETE على جدول `Purchase_Head1`:
```sql
Delete From Purchase_Journals_Head1 Where Note_No=
```
##### استعلام DELETE على جدول `Purchase_Head1`:
```sql
Delete From Purchase_Journals_Details1 Where Note_No=
```
##### استعلام INSERT على جدول `Purchase_Head1`:
```sql
Insert Into Purchase_Journals_Head1(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Purchase_Head1`:
```sql
Insert Into Purchase_Journals_Details1(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Actual_Credit,Credit,Costcenter_ID,Analyse1)Values(
```
##### استعلام INSERT على جدول `Purchase_Head1`:
```sql
Insert Into Purchase_Journals_Details1(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Purchase_Head1`:
```sql
Insert Into Purchase_Journals_Details1(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام INSERT على جدول `Purchase_Head1`:
```sql
Insert Into Purchase_Journals_Details1(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Costcenter_ID,Analysis_ID)Values(
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Note_Type_SelectedIndexChanged, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, Print_Journal_Click, Print_Journal_KeyDown, Costcenter_ID_KeyDown, Costcenter_ID_KeyPress, Costcenter_ID_LostFocus, Analysis_ID_GotFocus, Analysis_Name_A_GotFocus, Analysis_Name_A_KeyDown, Analysis_Name_A_LostFocus, Analysis_ID_KeyDown, Analysis_ID_KeyPress, Analysis_ID_LostFocus, Currency_Name_A_KeyDown, Exchang_GotFocus, Exchang_KeyDown, Exchang_KeyPress, Exchang_LostFocus, Analysis_GridView_CellClick, Analysis_GridView_CellFormatting, Purchase_Order_GotFocus, Purchase_Order_KeyDown, Purchase_Order_KeyPress, Purchase_Order_LostFocus, Supplier_ID_GotFocus, Supplier_Name_A_GotFocus, Supplier_Name_A_KeyDown, Supplier_Name_A_KeyPress, Supplier_Name_A_LostFocus, Supplier_ID_KeyDown, Supplier_ID_KeyPress, Supplier_ID_LostFocus, Supplier_Invoices_GotFocus, Supplier_Invoices_KeyDown, Supplier_Invoices_KeyPress, Supplier_Invoices_LostFocus, Credit_Level5_ID_GotFocus, Credit_Level5_Name_A_GotFocus, Credit_Level5_Name_A_KeyDown, Credit_Level5_Name_A_LostFocus, Credit_Level5_ID_KeyDown, Credit_Level5_ID_KeyPress, Credit_Level5_ID_LostFocus, D_Tax_Per_GotFocus, D_Tax_Per_KeyDown, D_Tax_Per_KeyPress, D_Tax_Per_LostFocus, D_Tax_Amount_GotFocus, D_Tax_Amount_KeyDown, D_Tax_Amount_KeyPress, D_Tax_Amount_LostFocus, Vat_Tax_Per_GotFocus, Vat_Tax_Per_KeyDown, Vat_Tax_Per_KeyPress, Vat_Tax_Per_LostFocus, Vat_Tax_Amount_GotFocus, Vat_Tax_Amount_KeyDown, Vat_Tax_Amount_KeyPress, Vat_Tax_Amount_LostFocus, Note_Tax_GotFocus, Note_Tax_KeyDown, Note_Tax_LostFocus, Note_Actual_Total_GotFocus, Note_Actual_Total_KeyDown, Note_Actual_Total_LostFocus, Note_Net_GotFocus, Note_Net_KeyDown, Note_Net_LostFocus, Note_Net_With_Tax_GotFocus, Note_Net_With_Tax_KeyDown, Note_Net_With_Tax_LostFocus, Note_Type_GotFocus, Note_Type_KeyDown, Note_Type_KeyPress, Note_Type_LostFocus, Analysis_GridView_KeyDown, Costcenters_GridView_CellClick, Costcenters_GridView_CellFormatting, Costcenters_GridView_KeyDown, Currency_GridView_CellClick, Currency_GridView_CellFormatting, Currency_GridView_KeyDown, Currency_ID_GotFocus, Currency_ID_KeyDown, Currency_ID_KeyPress, Currency_Name_A_GotFocus, Currency_Name_A_LostFocus, Currency_ID_LostFocus, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Note_No_GotFocus, Note_No_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Notice_GotFocus, Notice_KeyDown, Notice_KeyPress, Note_Date_KeyDown, Note_Date_Opened, RadGridView1_DoubleClick, RadGridView1_KeyDown, Item_ID_GotFocus, Item_ID_KeyDown, Item_ID_KeyPress, Item_Name_A_GotFocus, Item_Name_A_KeyDown, Items_GridView_CellClick, Items_GridView_CellFormatting, Items_GridView_KeyDown, Actual_Qty_GotFocus, Actual_Qty_KeyDown, Actual_Qty_KeyPress, Actual_Price_GotFocus, Actual_Price_KeyDown, Note_No_KeyPress, Note_No_LostFocus, Notice_LostFocus, Qty_LostFocus, Item_ID_LostFocus, Search_Txt_LostFocus, Inventory_ID_GotFocus, Inventory_ID_KeyDown, Inventory_ID_KeyPress, Inventory_Name_A_GotFocus, Inventory_Name_A_KeyDown, Inventories_GridView_CellClick, Inventories_GridView_CellFormatting, Inventories_GridView_KeyDown, Inventory_ID_LostFocus, Inventory_Name_A_LostFocus, Note_Date_H_GotFocus, Note_Date_H_KeyDown, Note_Date_H_LostFocus, Actual_Net_GotFocus, Actual_Net_KeyDown, Actual_Net_LostFocus, Actual_Price_KeyPress, Actual_Price_LostFocus, Item_Name_A_LostFocus, Note_Actual_Qty_GotFocus, Note_Actual_Qty_KeyDown, Note_Total_GotFocus, Note_Total_KeyDown, Note_Actual_Qty_LostFocus, Note_Total_LostFocus, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, Note_Net_Text_LostFocus, Unit_ID_GotFocus, Unit_ID_KeyDown, Unit_Name_GotFocus, Unit_Name_KeyDown, Units_GridView_CellClick, Units_GridView_CellFormatting, Units_GridView_KeyDown, Unit_ID_LostFocus, Unit_Name_LostFocus, Note_Date_ValueChanged, Costcenter_ID_GotFocus, Costcenter_Name_A_GotFocus, Costcenter_Name_A_KeyDown, Costcenter_Name_A_LostFocus, set_Supplier_ID, get_Label12, set_Label12, get_Note_Type, set_Note_Type, get_Currency_Name_A, set_Currency_Name_A, get_Exchang, set_Exchang, get_Label17, set_Label17, get_Label27, set_Label27, get_Currency_ID, set_Currency_ID, get_Analysis_Name_A, set_Analysis_Name_A, get_Analysis_ID, set_Analysis_ID, get_Label19, set_Label19, get_Costcenter_Name_A, set_Costcenter_Name_A, get_Costcenter_ID, set_Costcenter_ID, get_Label18, set_Label18, get_Note_Net_With_Tax, set_Note_Net_With_Tax, get_Label16, set_Label16, get_Note_Actual_Total, set_Note_Actual_Total, get_Label25, set_Label25, get_Vat_Tax_Per, set_Vat_Tax_Per, get_Label24, set_Label24, get_Note_Tax, set_Note_Tax, get_Label23, set_Label23, get_D_Tax_Per, set_D_Tax_Per, get_Label22, set_Label22, get_Label20, set_Label20, get_Vat_Tax_Amount, set_Vat_Tax_Amount, get_Label21, set_Label21, get_D_Tax_Amount, set_D_Tax_Amount, get_Credit_Level5_Name_A, set_Credit_Level5_Name_A, get_Credit_Level5_ID, set_Credit_Level5_ID, get_Label30, set_Label30, get_Purchase_Order, set_Purchase_Order, get_Label31, set_Label31, get_Note_Net_Text, set_Note_Net_Text, get_Analysis_GridView, set_Analysis_GridView, get_Currency_GridView, set_Currency_GridView, get_Costcenters_GridView, set_Costcenters_GridView, get_Level5_GridView, set_Level5_GridView, get_AquaTheme1, set_AquaTheme1, get_Net, set_Net, get_Cost, set_Cost, get_Label29, set_Label29, get_Journal_No, set_Journal_No, get_Print_Journal, set_Print_Journal, get_Level5_ID, set_Level5_ID, get_Note_Net, set_Note_Net, get_Label35, set_Label35, Clear_Record, Clear_Data, Fill_Grid, Fill_Level5_Grid, Fill_Analysis_Grid, Fill_Costcenters_Grid, Fill_Currencies_Grid, Fill_Inventories_Grid, Fill_Items_Grid, Fill_Units_Grid, Lock_Control, Enable_Control, Review_Record, Find_Total, Purchase_Form1_KeyDown, Purchase_Form1_Load, Purchase_Form1_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadPanel4, set_RadPanel4, get_RadGridView1, set_RadGridView1, get_Note_Date, set_Note_Date, get_Items_GridView, set_Items_GridView, get_RadLabel15, set_RadLabel15, get_Label13, set_Label13, get_Label8, set_Label8, get_Label6, set_Label6, get_Note_No, set_Note_No, get_Notice, set_Notice, get_Label4, set_Label4, get_Label9, set_Label9, get_Label10, set_Label10, get_Label11, set_Label11, get_Actual_Qty, set_Actual_Qty, get_Unit_Name, set_Unit_Name, get_Item_Name_A, set_Item_Name_A, get_Item_ID, set_Item_ID, get_Label15, set_Label15, get_Actual_Net, set_Actual_Net, get_Label14, set_Label14, get_Actual_Price, set_Actual_Price, get_Note_Total, set_Note_Total, get_Label28, set_Label28, get_Note_Actual_Qty, set_Note_Actual_Qty, get_Note_Net_With_Tax_Text, set_Note_Net_With_Tax_Text, get_SR, set_SR, get_Inventory_Name_A, set_Inventory_Name_A, get_Label1, set_Label1, get_Inventory_ID, set_Inventory_ID, get_Unit_ID, set_Unit_ID, get_Note_Date_H, set_Note_Date_H, get_Label2, set_Label2, get_Qty, set_Qty, get_Price, set_Price, get_Units_GridView, set_Units_GridView, get_Inventories_GridView, set_Inventories_GridView, get_Label3, set_Label3, get_Unit_Exchang, set_Unit_Exchang, get_Label5, set_Label5, get_Supplier_Invoices, set_Supplier_Invoices, get_Supplier_Name_A, set_Supplier_Name_A, get_Label7, set_Label7, get_Supplier_ID
```

---

### 3.5 شاشة: مردودات المشتريات (`Purchase_R_Form`)
- **الاسم الإنجليزي:** Purchase Returns & Debit Notes
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** تسجيل بضائع المشتريات المرتدة إلى الموردين وإصدار إشعارات الخصم الدائنة
- **جداول قاعدة البيانات المستهدفة:** `Purchase_R_Head`, `Purchase_R_Details`

#### أ. كتالوج حقول وعناصر التحكم (Field & Control Catalog Table)
| معرف العنصر (Control ID) | التسمية العربية (Label) | نوع عنصر الواجهة | الربط بقاعدة البيانات (DB Binding) | نوع البيانات والقيود (Type & Constraints) | القيمة الافتراضية | المعادلة / السلوك البرمجي |
|---|---|---|---|---|---|---|
| `Windows7Theme1` | **Windows7Theme1** | `Windows7Theme` | - | - | - | - |
| `Save` | **زر حفظ السجل** | `RadButton` | - | - | - | - |
| `Delete` | **زر حذف السجل** | `RadButton` | - | - | - | - |
| `F_Exit` | **F_Exit** | `RadButton` | - | - | - | - |
| `Print` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Add` | **زر إضافة جديد** | `RadButton` | - | - | - | - |
| `Modify` | **زر تعديل السجل** | `RadButton` | - | - | - | - |
| `Search_Txt` | **حقل / زر البحث** | `RadTextBox` | - | - | - | - |
| `GridView` | **GridView** | `RadGridView` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Purchase_R_Head.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Purchase_R_Head.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `RadGridView1` | **RadGridView1** | `RadGridView` | - | - | - | - |
| `Note_Date` | **تاريخ الحركة** | `RadDateTimePicker` | `Purchase_R_Head.Note_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Items_GridView` | **Items_GridView** | `RadGridView` | - | - | - | - |
| `RadLabel15` | **RadLabel15** | `RadLabel` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Label8` | **Label8** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Note_No` | **رقم الحركة / السند** | `RadTextBox` | `Purchase_R_Head.Note_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Purchase_R_Head.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Label10` | **Label10** | `Label` | - | - | - | - |
| `Label11` | **Label11** | `Label` | - | - | - | - |
| `Actual_Qty` | **الكمية** | `RadTextBox` | `Purchase_R_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Unit_Name` | **الوحدة** | `RadTextBox` | - | - | - | - |
| `Item_Name_A` | **اسم الصنف** | `RadTextBox` | - | - | - | - |
| `Item_ID` | **كود الصنف** | `RadTextBox` | `Purchase_R_Details.Item_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label15` | **Label15** | `Label` | - | - | - | - |
| `Actual_Net` | **الصافي المستحق** | `RadTextBox` | `Purchase_R_Details.Actual_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Actual_Price` | **السعر الفردي** | `RadTextBox` | `Purchase_R_Details.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Label26` | **Label26** | `Label` | - | - | - | - |
| `Note_Total` | **الإجمالي** | `RadTextBox` | `Purchase_R_Head.Note_Total` | `float` (NOT NULL) | `((0))` | `Total = SUM(Details.Net)` |
| `Label28` | **Label28** | `Label` | - | - | - | - |
| `Note_Actual_Qty` | **الكمية** | `RadTextBox` | `Purchase_R_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Note_Net_With_Tax_Text` | **ضريبة القيمة المضافة** | `RadTextBox` | - | - | - | `Net = Total - Discount + Tax` |
| `SR` | **SR** | `RadTextBox` | `Purchase_R_Details.SR` | `int` (PRIMARY KEY, NOT NULL) | - | - |
| `Inventory_Name_A` | **Inventory_Name_A** | `RadTextBox` | - | - | - | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Inventory_ID` | **كود المخزن** | `RadTextBox` | `Purchase_R_Head.Inventory_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Unit_ID` | **الوحدة** | `RadTextBox` | `Purchase_R_Details.Unit_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `Note_Date_H` | **تاريخ الحركة** | `RadTextBox` | `Purchase_R_Head.Note_Date_H` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Qty` | **الكمية** | `RadTextBox` | `Purchase_R_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Price` | **السعر الفردي** | `RadTextBox` | `Purchase_R_Details.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Units_GridView` | **Units_GridView** | `RadGridView` | - | - | - | - |
| `Inventories_GridView` | **Inventories_GridView** | `RadGridView` | - | - | - | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Unit_Exchang` | **Unit_Exchang** | `RadTextBox` | `Purchase_R_Head.Exchang` | `float` (NOT NULL) | `((1))` | - |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Supplier_Invoices` | **Supplier_Invoices** | `RadTextBox` | `Purchase_R_Head.Supplier_Invoices` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Supplier_Name_A` | **اسم المورد** | `RadTextBox` | - | - | - | - |
| `Label7` | **Label7** | `Label` | - | - | - | - |
| `Supplier_ID` | **كود المورد** | `RadTextBox` | `Purchase_R_Head.Supplier_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label12` | **Label12** | `Label` | - | - | - | - |
| `Note_Type` | **Note_Type** | `RadDropDownList` | `Purchase_R_Head.Note_Type` | `smallint` (NOT NULL) | `((0))` | - |
| `Currency_Name_A` | **اسم العملة** | `RadTextBox` | - | - | - | - |
| `Exchang` | **Exchang** | `RadTextBox` | `Purchase_R_Head.Exchang` | `float` (NOT NULL) | `((1))` | - |
| `Label17` | **Label17** | `Label` | - | - | - | - |
| `Label27` | **Label27** | `Label` | - | - | - | - |
| `Currency_ID` | **كود العملة** | `RadTextBox` | `Purchase_R_Head.Currency_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `Analysis_Name_A` | **اسم الحساب التحليلي** | `RadTextBox` | - | - | - | - |
| `Analysis_ID` | **كود الحساب التحليلي** | `RadTextBox` | `Purchase_R_Head.Analysis_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label19` | **Label19** | `Label` | - | - | - | - |
| `Costcenter_Name_A` | **اسم مركز التكلفة** | `RadTextBox` | - | - | - | - |
| `Costcenter_ID` | **كود مركز التكلفة** | `RadTextBox` | `Purchase_R_Head.Costcenter_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label18` | **Label18** | `Label` | - | - | - | - |
| `Note_Net_With_Tax` | **ضريبة القيمة المضافة** | `RadTextBox` | `Purchase_R_Head.Note_Net_With_Tax` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label16` | **Label16** | `Label` | - | - | - | - |
| `Note_Actual_Total` | **الإجمالي** | `RadTextBox` | `Purchase_R_Head.Note_Actual_Total` | `float` (NOT NULL) | `((0))` | `Total = SUM(Details.Net)` |
| `Label25` | **Label25** | `Label` | - | - | - | - |
| `Vat_Tax_Per` | **ضريبة القيمة المضافة** | `RadTextBox` | `Purchase_R_Head.Vat_Tax_Per` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label24` | **Label24** | `Label` | - | - | - | - |
| `Note_Tax` | **ضريبة القيمة المضافة** | `RadTextBox` | `Purchase_R_Head.Note_Tax` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label23` | **Label23** | `Label` | - | - | - | - |
| `D_Tax_Per` | **ضريبة القيمة المضافة** | `RadTextBox` | `Purchase_R_Head.D_Tax_Per` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label22` | **Label22** | `Label` | - | - | - | - |
| `Label20` | **Label20** | `Label` | - | - | - | - |
| `Vat_Tax_Amount` | **ضريبة القيمة المضافة** | `RadTextBox` | `Purchase_R_Head.Vat_Tax_Amount` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label21` | **Label21** | `Label` | - | - | - | - |
| `D_Tax_Amount` | **ضريبة القيمة المضافة** | `RadTextBox` | `Purchase_R_Head.D_Tax_Amount` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Debit_Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Debit_Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Purchase_R_Head.Debit_Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label30` | **Label30** | `Label` | - | - | - | - |
| `Purchase_Order` | **Purchase_Order** | `RadTextBox` | `Purchase_R_Head.Purchase_Order` | `nvarchar(20)` (NOT NULL) | `((0))` | - |
| `Label31` | **Label31** | `Label` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `TextBox` | `Purchase_R_Head.Note_Net_Text` | `nvarchar(250)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `Analysis_GridView` | **Analysis_GridView** | `RadGridView` | - | - | - | - |
| `Currency_GridView` | **Currency_GridView** | `RadGridView` | - | - | - | - |
| `Costcenters_GridView` | **Costcenters_GridView** | `RadGridView` | - | - | - | - |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `Note_Discount_After_Tax` | **الخصم** | `RadTextBox` | `Purchase_R_Head.Note_Discount_After_Tax` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Net` | **الصافي المستحق** | `RadTextBox` | `Purchase_R_Head.Note_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Cost` | **Cost** | `RadTextBox` | `Purchase_R_Details.Cost` | `float` (NOT NULL) | `((0))` | - |
| `Print_Journal` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Label29` | **Label29** | `Label` | - | - | - | - |
| `Journal_No` | **Journal_No** | `RadTextBox` | `Purchase_R_Head.Journal_No` | `int` (NOT NULL) | `((0))` | - |
| `Acc_Adap_H` | **Acc_Adap_H** | `SqlDataAdapter` | - | - | - | - |
| `Acc_Adap_D` | **Acc_Adap_D** | `SqlDataAdapter` | - | - | - | - |
| `Adap_H` | **Adap_H** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D` | **Adap_D** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D_V` | **Adap_D_V** | `SqlDataAdapter` | - | - | - | - |
| `Adap` | **Adap** | `SqlDataAdapter` | - | - | - | - |
| `Adap1` | **Adap1** | `SqlDataAdapter` | - | - | - | - |
| `Adap_Print` | **زر طباعة التقرير / السند** | `SqlDataAdapter` | - | - | - | - |
| `Balance_Adap` | **الرصيد / الفارق** | `SqlDataAdapter` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Branche_Adap` | **Branche_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Permission_Adap` | **Permission_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Delete_Adap` | **زر حذف السجل** | `SqlDataAdapter` | - | - | - | - |
| `Setting_Adap` | **Setting_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Setting_Adap1` | **Setting_Adap1** | `SqlDataAdapter` | - | - | - | - |
| `Link_Adap` | **Link_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Profile_Adap` | **Profile_Adap** | `OleDbDataAdapter` | - | - | - | - |
| `Acc_RRS_H` | **Acc_RRS_H** | `DataSet` | - | - | - | - |
| `Acc_RRS_D` | **Acc_RRS_D** | `DataSet` | - | - | - | - |
| `RRS_H` | **RRS_H** | `DataSet` | - | - | - | - |
| `RRS_D` | **RRS_D** | `DataSet` | - | - | - | - |
| `RRS_D_V` | **RRS_D_V** | `DataSet` | - | - | - | - |
| `RRS` | **RRS** | `DataSet` | - | - | - | - |
| `RRS1` | **RRS1** | `DataSet` | - | - | - | - |
| `RRS_Print` | **زر طباعة التقرير / السند** | `DataSet` | - | - | - | - |
| `Balance_RRS` | **الرصيد / الفارق** | `DataSet` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Branche_RRS` | **Branche_RRS** | `DataSet` | - | - | - | - |
| `Permission_RRS` | **Permission_RRS** | `DataSet` | - | - | - | - |
| `Profile_RRS` | **Profile_RRS** | `DataSet` | - | - | - | - |
| `Delete_RRS` | **زر حذف السجل** | `DataSet` | - | - | - | - |
| `Setting_RRS` | **Setting_RRS** | `DataSet` | - | - | - | - |
| `Setting_RRS1` | **Setting_RRS1** | `DataSet` | - | - | - | - |
| `Link_RRS` | **Link_RRS** | `DataSet` | - | - | - | - |
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
| `Cmd7` | **Cmd7** | `SqlCommand` | - | - | - | - |
| `Cmd8` | **Cmd8** | `SqlCommand` | - | - | - | - |
| `Balance_Cmd` | **الرصيد / الفارق** | `SqlCommand` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Dt` | **Dt** | `DataTable` | - | - | - | - |
| `Dt_D` | **Dt_D** | `DataTable` | - | - | - | - |
| `Setting_Dt` | **Setting_Dt** | `DataTable` | - | - | - | - |
| `Link_Dt` | **Link_Dt** | `DataTable` | - | - | - | - |

#### ب. قواعد التحقق والمعادلات الحسابية (Validation & Business Rules)
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيـد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد السـند المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال وحدة الصرف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الكميـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم العُملـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المخزن 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المورد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم القيد المحاسـبي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إضافة سجل جديد أثناء عملية التعديل. لأضافة سجل يجب الضغط على الغاء التعديل ثم الضغط على سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إجراء تعديل أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: في حالة الإضافة يجب الضغط على سجل جديد وفي حالة التعديل يجب الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السند غير موجود ويجب حفظه أولاً  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء إضافة سجل جديد. للحذف يجب الضغط على الغاء الإضافة ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء تعديل سجل . للحذف يجب الضغط على الغاء التعديل ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد السجل المراد حذفه 
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الإجمالي: Total = SUM(Details.Net) (المعادلة: `Total = SUM(Details.Net)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الإجمالي: Total = SUM(Details.Net) (المعادلة: `Total = SUM(Details.Net)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Tax = (Total - Discount) * (Tax_Rate / 100) (المعادلة: `Tax = (Total - Discount) * (Tax_Rate / 100)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Tax = (Total - Discount) * (Tax_Rate / 100) (المعادلة: `Tax = (Total - Discount) * (Tax_Rate / 100)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Tax = (Total - Discount) * (Tax_Rate / 100) (المعادلة: `Tax = (Total - Discount) * (Tax_Rate / 100)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Tax = (Total - Discount) * (Tax_Rate / 100) (المعادلة: `Tax = (Total - Discount) * (Tax_Rate / 100)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Tax = (Total - Discount) * (Tax_Rate / 100) (المعادلة: `Tax = (Total - Discount) * (Tax_Rate / 100)`)
- **[Calculation]** حساب تلقائي لحقل الصافي تفقيطاً (كتابة بالكلمات): Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الخصم: Tax = (Total - Discount) * (Tax_Rate / 100) (المعادلة: `Tax = (Total - Discount) * (Tax_Rate / 100)`)
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters_View Where Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Where Analysis_ID=
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
Select * FROM Currencies Where Currency_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Purchase_R_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Purchase_R_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Purchase_R_Head_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Currencies Where Currency_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Balance_For_Search Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Purchase_R_Head_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Purchase_R_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Purchase_R_Head_View Order By Note_No DESC
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users_Table
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users Where User_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Branches
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Purchase_Settings Where ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Journals_Settings Where ID=
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
Select * FROM Inventories Order By Inventory_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_View Order By Item_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Balance_For_Search Order By Item_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM Purchase_R_Head Order By Note_No Desc
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM Purchase_Journals_Head Order By Note_No Desc
```
##### استعلام INSERT على جدول `Purchase_R_Head`:
```sql
Insert Into Purchase_R_Head(Note_No,Note_Date,Note_Date_H,Note_Type,Currency_ID,Exchang,Inventory_ID,Supplier_ID,Cash_Supplier_Name,Supplier_Invoices,Purchase_Order,Analysis_ID,Costcenter_ID,D_Tax_Per,D_Tax_Amount,Vat_Tax_Per,Vat_Tax_Amount,Note_Tax,Note_Discount_After_Tax,Note_Actual_Qty,Note_Actual_Total,Note_Total,Note_Net,Note_Net_With_Tax,Note_Net_Text,Journal_No,debit_Level5_ID,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Purchase_R_Details`:
```sql
Insert Into Purchase_R_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Actual_Net,Net)Values(
```
##### استعلام INSERT على جدول `Purchase_R_Head`:
```sql
Insert Into Purchase_Journals_Head(Note_No,Note_Type_ID,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Purchase_R_Head`:
```sql
Insert Into Purchase_R_Journals_Head(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Purchase_R_Head`:
```sql
Insert Into Purchase_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Purchase_R_Head`:
```sql
Insert Into Purchase_R_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Purchase_R_Head`:
```sql
Insert Into Purchase_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Purchase_R_Head`:
```sql
Insert Into Purchase_R_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Purchase_R_Head`:
```sql
Insert Into Purchase_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام INSERT على جدول `Purchase_R_Head`:
```sql
Insert Into Purchase_R_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام INSERT على جدول `Purchase_R_Head`:
```sql
Insert Into Purchase_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Actual_Credit,Credit,Analysis_ID,Costcenter_ID,Analyse1)Values(
```
##### استعلام INSERT على جدول `Purchase_R_Head`:
```sql
Insert Into Purchase_R_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Actual_Credit,Credit,Analysis_ID,Costcenter_ID,Analyse1)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Purchase_R_Head Where Note_No=
```
##### استعلام UPDATE على جدول `Purchase_R_Head`:
```sql
Update Purchase_R_Head Set Note_No=
```
##### استعلام DELETE على جدول `Purchase_R_Details`:
```sql
Delete From Purchase_R_Details Where Note_No=
```
##### استعلام INSERT على جدول `Purchase_R_Details`:
```sql
Insert Into Purchase_R_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Actual_Net,Net)Values(
```
##### استعلام DELETE على جدول `Purchase_R_Head`:
```sql
Delete From Purchase_Journals_Head Where Note_No=
```
##### استعلام DELETE على جدول `Purchase_R_Head`:
```sql
Delete From Purchase_Journals_Details Where Note_No=
```
##### استعلام DELETE على جدول `Purchase_R_Head`:
```sql
Delete From Purchase_R_Journals_Head Where Note_No=
```
##### استعلام DELETE على جدول `Purchase_R_Head`:
```sql
Delete From Purchase_R_Journals_Details Where Note_No=
```
##### استعلام INSERT على جدول `Purchase_R_Head`:
```sql
Insert Into Purchase_Journals_Head(Note_No,Note_Type_ID,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Purchase_R_Head`:
```sql
Insert Into Purchase_R_Journals_Head(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Purchase_R_Head`:
```sql
Insert Into Purchase_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Purchase_R_Head`:
```sql
Insert Into Purchase_R_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Purchase_R_Head`:
```sql
Insert Into Purchase_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Purchase_R_Head`:
```sql
Insert Into Purchase_R_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Purchase_R_Head`:
```sql
Insert Into Purchase_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام INSERT على جدول `Purchase_R_Head`:
```sql
Insert Into Purchase_R_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام INSERT على جدول `Purchase_R_Head`:
```sql
Insert Into Purchase_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Actual_Credit,Credit,Analysis_ID,Costcenter_ID,Analyse1)Values(
```
##### استعلام INSERT على جدول `Purchase_R_Head`:
```sql
Insert Into Purchase_R_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Actual_Credit,Credit,Analysis_ID,Costcenter_ID,Analyse1)Values(
```
##### استعلام DELETE على جدول `Purchase_R_Head`:
```sql
Delete From Purchase_R_Head where Note_No=
```
##### استعلام DELETE على جدول `Purchase_R_Details`:
```sql
Delete From Purchase_R_Details where Note_No=
```
##### استعلام DELETE على جدول `Purchase_R_Head`:
```sql
Delete From Purchase_Journals_Head Where Note_No=
```
##### استعلام DELETE على جدول `Purchase_R_Head`:
```sql
Delete From Purchase_Journals_Details Where Note_No=
```
##### استعلام DELETE على جدول `Purchase_R_Head`:
```sql
Delete From Purchase_R_Journals_Head Where Note_No=
```
##### استعلام DELETE على جدول `Purchase_R_Head`:
```sql
Delete From Purchase_R_Journals_Details Where Note_No=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Note_Discount_After_Tax_GotFocus, Note_Discount_After_Tax_KeyDown, Note_Discount_After_Tax_KeyPress, Note_Discount_After_Tax_LostFocus, Print_Journal_Click, Print_Journal_KeyDown, Costcenter_ID_KeyPress, Costcenter_ID_LostFocus, Analysis_ID_GotFocus, Analysis_Name_A_GotFocus, Analysis_Name_A_KeyDown, Analysis_Name_A_LostFocus, Analysis_ID_KeyDown, Analysis_ID_KeyPress, Analysis_ID_LostFocus, Currency_Name_A_KeyDown, Exchang_GotFocus, Exchang_KeyDown, Exchang_KeyPress, Exchang_LostFocus, Analysis_GridView_CellClick, Analysis_GridView_CellFormatting, Purchase_Order_GotFocus, Purchase_Order_KeyDown, Purchase_Order_KeyPress, Purchase_Order_LostFocus, Supplier_ID_GotFocus, Supplier_Name_A_GotFocus, Supplier_Name_A_KeyDown, Supplier_Name_A_KeyPress, Supplier_Name_A_LostFocus, Supplier_ID_KeyDown, Supplier_ID_KeyPress, Supplier_ID_LostFocus, Supplier_Invoices_GotFocus, Supplier_Invoices_KeyDown, Supplier_Invoices_KeyPress, Supplier_Invoices_LostFocus, Debit_Level5_ID_GotFocus, Debit_Level5_Name_A_GotFocus, Debit_Level5_Name_A_KeyDown, Debit_Level5_Name_A_LostFocus, Debit_Level5_ID_KeyDown, Debit_Level5_ID_KeyPress, Debit_Level5_ID_LostFocus, D_Tax_Per_GotFocus, D_Tax_Per_KeyDown, D_Tax_Per_KeyPress, D_Tax_Per_LostFocus, D_Tax_Amount_GotFocus, D_Tax_Amount_KeyDown, D_Tax_Amount_KeyPress, D_Tax_Amount_LostFocus, Vat_Tax_Per_GotFocus, Vat_Tax_Per_KeyDown, Vat_Tax_Per_KeyPress, Vat_Tax_Per_LostFocus, Vat_Tax_Amount_GotFocus, Vat_Tax_Amount_KeyDown, Vat_Tax_Amount_KeyPress, Vat_Tax_Amount_LostFocus, Note_Tax_GotFocus, Note_Tax_KeyDown, Note_Tax_LostFocus, Note_Actual_Total_GotFocus, Note_Actual_Total_KeyDown, Note_Actual_Total_LostFocus, Note_Net_With_Tax_GotFocus, Note_Net_With_Tax_KeyDown, Note_Net_With_Tax_LostFocus, Note_Type_GotFocus, Note_Type_KeyDown, Note_Type_KeyPress, Note_Type_LostFocus, Analysis_GridView_KeyDown, Costcenters_GridView_CellClick, Costcenters_GridView_CellFormatting, Costcenters_GridView_KeyDown, Currency_GridView_CellClick, Currency_GridView_CellFormatting, Currency_GridView_KeyDown, Currency_ID_GotFocus, Currency_ID_KeyDown, Currency_ID_KeyPress, Currency_Name_A_GotFocus, Currency_Name_A_LostFocus, Currency_ID_LostFocus, Note_Type_SelectedIndexChanged, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Note_No_GotFocus, Note_No_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Notice_GotFocus, Notice_KeyDown, Notice_KeyPress, Note_Date_KeyDown, Note_Date_Opened, RadGridView1_DoubleClick, RadGridView1_KeyDown, Item_ID_GotFocus, Item_ID_KeyDown, Item_ID_KeyPress, Item_Name_A_GotFocus, Item_Name_A_KeyDown, Items_GridView_CellClick, Items_GridView_CellFormatting, Items_GridView_KeyDown, Actual_Qty_GotFocus, Actual_Qty_KeyDown, Actual_Qty_KeyPress, Actual_Price_GotFocus, Actual_Price_KeyDown, Note_No_KeyPress, Note_No_LostFocus, Notice_LostFocus, Qty_LostFocus, Item_ID_LostFocus, Search_Txt_LostFocus, Inventory_ID_GotFocus, Inventory_ID_KeyDown, Inventory_ID_KeyPress, Inventory_Name_A_GotFocus, Inventory_Name_A_KeyDown, Inventories_GridView_CellClick, Inventories_GridView_CellFormatting, Inventories_GridView_KeyDown, Inventory_ID_LostFocus, Inventory_Name_A_LostFocus, Note_Date_H_GotFocus, Note_Date_H_KeyDown, Note_Date_H_LostFocus, Actual_Net_GotFocus, Actual_Net_KeyDown, Actual_Net_LostFocus, Actual_Price_KeyPress, Actual_Price_LostFocus, Item_Name_A_LostFocus, Note_Actual_Qty_GotFocus, Note_Actual_Qty_KeyDown, Note_Total_GotFocus, Note_Total_KeyDown, Note_Actual_Qty_LostFocus, Note_Total_LostFocus, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, Note_Net_Text_LostFocus, Unit_ID_GotFocus, Unit_ID_KeyDown, Unit_Name_GotFocus, Unit_Name_KeyDown, Units_GridView_CellClick, Units_GridView_CellFormatting, Units_GridView_KeyDown, Unit_ID_LostFocus, Unit_Name_LostFocus, Note_Date_ValueChanged, Costcenter_ID_GotFocus, Costcenter_Name_A_GotFocus, Costcenter_Name_A_KeyDown, Costcenter_Name_A_LostFocus, Costcenter_ID_KeyDown, set_Label7, get_Supplier_ID, set_Supplier_ID, get_Label12, set_Label12, get_Note_Type, set_Note_Type, get_Currency_Name_A, set_Currency_Name_A, get_Exchang, set_Exchang, get_Label17, set_Label17, get_Label27, set_Label27, get_Currency_ID, set_Currency_ID, get_Analysis_Name_A, set_Analysis_Name_A, get_Analysis_ID, set_Analysis_ID, get_Label19, set_Label19, get_Costcenter_Name_A, set_Costcenter_Name_A, get_Costcenter_ID, set_Costcenter_ID, get_Label18, set_Label18, get_Note_Net_With_Tax, set_Note_Net_With_Tax, get_Label16, set_Label16, get_Note_Actual_Total, set_Note_Actual_Total, get_Label25, set_Label25, get_Vat_Tax_Per, set_Vat_Tax_Per, get_Label24, set_Label24, get_Note_Tax, set_Note_Tax, get_Label23, set_Label23, get_D_Tax_Per, set_D_Tax_Per, get_Label22, set_Label22, get_Label20, set_Label20, get_Vat_Tax_Amount, set_Vat_Tax_Amount, get_Label21, set_Label21, get_D_Tax_Amount, set_D_Tax_Amount, get_Debit_Level5_Name_A, set_Debit_Level5_Name_A, get_Debit_Level5_ID, set_Debit_Level5_ID, get_Label30, set_Label30, get_Purchase_Order, set_Purchase_Order, get_Label31, set_Label31, get_Note_Net_Text, set_Note_Net_Text, get_Analysis_GridView, set_Analysis_GridView, get_Currency_GridView, set_Currency_GridView, get_Costcenters_GridView, set_Costcenters_GridView, get_Level5_GridView, set_Level5_GridView, get_AquaTheme1, set_AquaTheme1, get_Note_Discount_After_Tax, set_Note_Discount_After_Tax, get_Net, set_Net, get_Cost, set_Cost, get_Print_Journal, set_Print_Journal, get_Label29, set_Label29, get_Journal_No, set_Journal_No, Clear_Record, Clear_Data, Fill_Grid, Fill_Level5_Grid, Fill_Analysis_Grid, Fill_Costcenters_Grid, Fill_Currencies_Grid, Fill_Inventories_Grid, Fill_Items_Grid, Fill_Units_Grid, Lock_Control, Enable_Control, Review_Record, Find_Total, Purchase_R_Form_KeyDown, Purchase_R_Form_Load, Purchase_R_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadPanel4, set_RadPanel4, get_RadGridView1, set_RadGridView1, get_Note_Date, set_Note_Date, get_Items_GridView, set_Items_GridView, get_RadLabel15, set_RadLabel15, get_Label13, set_Label13, get_Label8, set_Label8, get_Label6, set_Label6, get_Note_No, set_Note_No, get_Notice, set_Notice, get_Label4, set_Label4, get_Label9, set_Label9, get_Label10, set_Label10, get_Label11, set_Label11, get_Actual_Qty, set_Actual_Qty, get_Unit_Name, set_Unit_Name, get_Item_Name_A, set_Item_Name_A, get_Item_ID, set_Item_ID, get_Label15, set_Label15, get_Actual_Net, set_Actual_Net, get_Label14, set_Label14, get_Actual_Price, set_Actual_Price, get_Label26, set_Label26, get_Note_Total, set_Note_Total, get_Label28, set_Label28, get_Note_Actual_Qty, set_Note_Actual_Qty, get_Note_Net_With_Tax_Text, set_Note_Net_With_Tax_Text, get_SR, set_SR, get_Inventory_Name_A, set_Inventory_Name_A, get_Label1, set_Label1, get_Inventory_ID, set_Inventory_ID, get_Unit_ID, set_Unit_ID, get_Note_Date_H, set_Note_Date_H, get_Label2, set_Label2, get_Qty, set_Qty, get_Price, set_Price, get_Units_GridView, set_Units_GridView, get_Inventories_GridView, set_Inventories_GridView, get_Label3, set_Label3, get_Unit_Exchang, set_Unit_Exchang, get_Label5, set_Label5, get_Supplier_Invoices, set_Supplier_Invoices, get_Supplier_Name_A, set_Supplier_Name_A, get_Label7
```

---

### 3.6 شاشة: إعدادات وتوجيه المشتريات (`Purchase_Settings_Form`)
- **الاسم الإنجليزي:** Purchase Posting Settings
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** تهيئة الحسابات الوسيطة للمشتريات، ضريبة المشتريات، الخصم المكتسب، وحسابات الموردين
- **جداول قاعدة البيانات المستهدفة:** `Purchase_Settings`

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
| `D_Tax_Registery_Option` | **ضريبة القيمة المضافة** | `RadCheckBox` | `Purchase_Settings.D_Tax_Registery_Option` | `smallint` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Label16` | **Label16** | `Label` | - | - | - | - |
| `D_Tax_Per` | **ضريبة القيمة المضافة** | `RadTextBox` | `Purchase_Settings.D_Tax_Per` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Debit_Treasury_ID` | **المبلغ مدين** | `RadTextBox` | `Purchase_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Debit_D_Tax_ID` | **المبلغ مدين** | `RadTextBox` | `Purchase_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Credit_D_Tax_ID` | **المبلغ دائن** | `RadTextBox` | `Purchase_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Debit_Vat_ID` | **المبلغ مدين** | `RadTextBox` | `Purchase_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Label39` | **Label39** | `Label` | - | - | - | - |
| `Label28` | **Label28** | `Label` | - | - | - | - |
| `Label34` | **Label34** | `Label` | - | - | - | - |
| `Label35` | **Label35** | `Label` | - | - | - | - |
| `Purchase_Link_Option` | **Purchase_Link_Option** | `RadCheckBox` | `Purchase_Settings.Purchase_Link_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Debit_Treasury_Name_A` | **المبلغ مدين** | `RadTextBox` | `Purchase_Settings.Debit_Treasury_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Debit_D_Tax_Name_A` | **المبلغ مدين** | `RadTextBox` | `Purchase_Settings.Debit_D_Tax_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Credit_D_Tax_Name_A` | **المبلغ دائن** | `RadTextBox` | `Purchase_Settings.Credit_D_Tax_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Debit_Vat_Name_A` | **المبلغ مدين** | `RadTextBox` | `Purchase_Settings.Debit_Vat_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Currency_Name_A` | **اسم العملة** | `RadTextBox` | `Purchase_Settings.Currency_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Costcenter_Name_A` | **اسم مركز التكلفة** | `RadTextBox` | `Purchase_Settings.Costcenter_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Cash_Supplier_Name_A` | **اسم المورد** | `RadTextBox` | `Purchase_Settings.Cash_Supplier_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Analysis_Name_A` | **اسم الحساب التحليلي** | `RadTextBox` | `Purchase_Settings.Analysis_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Currency_ID` | **كود العملة** | `RadTextBox` | `Purchase_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Costcenter_ID` | **كود مركز التكلفة** | `RadTextBox` | `Purchase_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Cash_Supplier_ID` | **كود المورد** | `RadTextBox` | `Purchase_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Analysis_ID` | **كود الحساب التحليلي** | `RadTextBox` | `Purchase_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Label43` | **Label43** | `Label` | - | - | - | - |
| `Label41` | **Label41** | `Label` | - | - | - | - |
| `Label42` | **Label42** | `Label` | - | - | - | - |
| `Label37` | **Label37** | `Label` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `Credit_Treasury_Name_A` | **المبلغ دائن** | `RadTextBox` | `Purchase_Settings.Credit_Treasury_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Credit_Treasury_ID` | **المبلغ دائن** | `RadTextBox` | `Purchase_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Label7` | **Label7** | `Label` | - | - | - | - |
| `Credit_Vat_Name_A` | **المبلغ دائن** | `RadTextBox` | `Purchase_Settings.Credit_Vat_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Credit_Vat_ID` | **المبلغ دائن** | `RadTextBox` | `Purchase_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Label32` | **Label32** | `Label` | - | - | - | - |
| `RadPanel8` | **RadPanel8** | `RadPanel` | - | - | - | - |
| `Currency_Option` | **Currency_Option** | `RadCheckBox` | `Purchase_Settings.Currency_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Search_By_Balance_Option` | **الرصيد / الفارق** | `RadCheckBox` | `Purchase_Settings.Search_By_Balance_Option` | `smallint` (NOT NULL) | `((0))` | `Balance = Previous_Balance + Debit - Credit` |
| `Note_Type` | **Note_Type** | `RadDropDownList` | - | - | - | - |
| `Decimals_Option` | **Decimals_Option** | `RadDropDownList` | `Purchase_Settings.Decimals_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Purchase_Settings.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Purchase_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Label8` | **Label8** | `Label` | - | - | - | - |
| `Inventory_Name_A` | **Inventory_Name_A** | `RadTextBox` | `Purchase_Settings.Inventory_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Label10` | **Label10** | `Label` | - | - | - | - |
| `Inventory_ID` | **كود المخزن** | `RadTextBox` | `Purchase_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Vat_Per` | **Vat_Per** | `RadTextBox` | `Purchase_Settings.Vat_Per` | `float` (NOT NULL) | `((0))` | - |
| `Vat_Registery_Option` | **Vat_Registery_Option** | `RadCheckBox` | `Purchase_Settings.Vat_Registery_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Costcenters_Option` | **Costcenters_Option** | `RadCheckBox` | `Purchase_Settings.Costcenters_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Analysis_Option` | **Analysis_Option** | `RadCheckBox` | `Purchase_Settings.Analysis_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Tax_Edit_Option` | **ضريبة القيمة المضافة** | `RadCheckBox` | `Purchase_Settings.Tax_Edit_Option` | `smallint` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Accounts_Search_Option` | **حقل / زر البحث** | `RadCheckBox` | `Purchase_Settings.Accounts_Search_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Purchase_R_Link_Option` | **Purchase_R_Link_Option** | `RadCheckBox` | `Purchase_Settings.Purchase_R_Link_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Costcenters_GridView` | **Costcenters_GridView** | `RadGridView` | - | - | - | - |
| `Analysis_GridView` | **Analysis_GridView** | `RadGridView` | - | - | - | - |
| `Currency_GridView` | **Currency_GridView** | `RadGridView` | - | - | - | - |
| `Inventories_GridView` | **Inventories_GridView** | `RadGridView` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `Discount_After_Tax_Option` | **الخصم** | `RadCheckBox` | `Purchase_Settings.Discount_After_Tax_Option` | `smallint` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Journals_Post_Type` | **Journals_Post_Type** | `RadDropDownList` | `Purchase_Settings.Journals_Post_Type` | `smallint` (NOT NULL) | `((0))` | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Last_Price_Option` | **السعر الفردي** | `RadCheckBox` | `Purchase_Settings.Last_Price_Option` | `smallint` (NOT NULL) | `((0))` | - |
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المخزن 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المورد النقدي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الحساب التحليلي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم مركز التكلفة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم العملـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المستخدم الحالي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال حسـاب القيمة المضافة - مدين 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال حسـاب الخزينـة - دائـن 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال حسـاب ضريبة الخصم والإضافة - دائـن 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال حسـاب ضريبة الخصم والإضافة - مدين 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال حسـاب الخزينـة - مديـن 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال حسـاب القيمـة المضافة - دائـن 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: في حالة الإضافة والتعديل يجب الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل موجود ولا يمكن حفظه مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Tax = (Total - Discount) * (Tax_Rate / 100) (المعادلة: `Tax = (Total - Discount) * (Tax_Rate / 100)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Tax = (Total - Discount) * (Tax_Rate / 100) (المعادلة: `Tax = (Total - Discount) * (Tax_Rate / 100)`)
- **[Calculation]** حساب تلقائي لحقل المبلغ مدين: Tax = (Total - Discount) * (Tax_Rate / 100) (المعادلة: `Tax = (Total - Discount) * (Tax_Rate / 100)`)
- **[Calculation]** حساب تلقائي لحقل المبلغ دائن: Tax = (Total - Discount) * (Tax_Rate / 100) (المعادلة: `Tax = (Total - Discount) * (Tax_Rate / 100)`)
- **[Calculation]** حساب تلقائي لحقل المبلغ مدين: Tax = (Total - Discount) * (Tax_Rate / 100) (المعادلة: `Tax = (Total - Discount) * (Tax_Rate / 100)`)
- **[Calculation]** حساب تلقائي لحقل المبلغ دائن: Tax = (Total - Discount) * (Tax_Rate / 100) (المعادلة: `Tax = (Total - Discount) * (Tax_Rate / 100)`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Tax = (Total - Discount) * (Tax_Rate / 100) (المعادلة: `Tax = (Total - Discount) * (Tax_Rate / 100)`)
- **[Calculation]** حساب تلقائي لحقل الخصم: Tax = (Total - Discount) * (Tax_Rate / 100) (المعادلة: `Tax = (Total - Discount) * (Tax_Rate / 100)`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
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
Select * FROM Inventories Where Inventory_ID=
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
Select * FROM Purchase_Settings Where ID=
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
Select * FROM Inventories Order By Inventory_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users Where User_ID=
```
##### استعلام UPDATE على جدول `Purchase_Settings`:
```sql
Update Purchase_Settings Set Inventory_ID=
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
Select * FROM Inventories Where Inventory_Name_A Like '%
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
Select * FROM Accounts_Analysis_View Where Analysis_ID=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Analysis_Name_A_GotFocus, Analysis_Name_A_LostFocus, Cash_Supplier_ID_GotFocus, Cash_Supplier_ID_KeyPress, Cash_Supplier_ID_LostFocus, Cash_Supplier_Name_A_GotFocus, Cash_Supplier_Name_A_LostFocus, Currency_ID_GotFocus, Currency_ID_KeyPress, Currency_ID_LostFocus, Currency_Name_A_GotFocus, Currency_Name_A_LostFocus, Costcenter_ID_GotFocus, Costcenter_ID_KeyPress, Costcenter_ID_LostFocus, Costcenter_Name_A_GotFocus, Costcenter_Name_A_LostFocus, Inventory_ID_GotFocus, Inventory_ID_KeyPress, Inventory_ID_LostFocus, Inventory_Name_A_GotFocus, Inventory_Name_A_LostFocus, Entry_ID_GotFocus, Entry_ID_LostFocus, Entry_Name_GotFocus, Entry_Name_LostFocus, Inventories_GridView_CellClick, Inventories_GridView_CellFormatting, Inventories_GridView_KeyDown, Analysis_GridView_CellClick, Analysis_GridView_CellFormatting, Analysis_GridView_KeyDown, Costcenters_GridView_CellClick, Costcenters_GridView_CellFormatting, Costcenters_GridView_KeyDown, Currency_GridView_CellClick, Currency_GridView_CellFormatting, Currency_GridView_KeyDown, Vat_Per_GotFocus, Vat_Per_KeyPress, Vat_Per_LostFocus, D_Tax_Per_GotFocus, D_Tax_Per_KeyPress, D_Tax_Per_LostFocus, set_Inventory_Name_A, get_Label9, set_Label9, get_Label10, set_Label10, get_Inventory_ID, set_Inventory_ID, get_Label2, set_Label2, get_Label3, set_Label3, get_Vat_Per, set_Vat_Per, get_Vat_Registery_Option, set_Vat_Registery_Option, get_Costcenters_Option, set_Costcenters_Option, get_Analysis_Option, set_Analysis_Option, get_Tax_Edit_Option, set_Tax_Edit_Option, get_Accounts_Search_Option, set_Accounts_Search_Option, get_Purchase_R_Link_Option, set_Purchase_R_Link_Option, get_Costcenters_GridView, set_Costcenters_GridView, get_Analysis_GridView, set_Analysis_GridView, get_Currency_GridView, set_Currency_GridView, get_Inventories_GridView, set_Inventories_GridView, get_AquaTheme1, set_AquaTheme1, get_Discount_After_Tax_Option, set_Discount_After_Tax_Option, get_Journals_Post_Type, set_Journals_Post_Type, get_RadPanel3, set_RadPanel3, get_Label5, set_Label5, get_Last_Price_Option, set_Last_Price_Option, Fill_Level5_Grid, Fill_Analysis_Grid, Fill_Costcenters_Grid, Fill_Currencies_Grid, Fill_Inventories_Grid, Clear_Record, Lock_Settings_Control, Enable_Settings_Control, Review_Settings_Record, Purchase_Settings_Form_Load, Purchase_Settings_Form_Resize, Modify_Click, Save_Click, F_Exit_Click, Search_Option2_Click, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, Search_Txt_LostFocus, Debit_Vat_ID_GotFocus, Debit_Vat_ID_KeyPress, Debit_Vat_ID_LostFocus, Debit_Vat_Name_A_GotFocus, Debit_Vat_Name_A_LostFocus, Credit_D_Tax_ID_GotFocus, Credit_D_Tax_ID_KeyPress, Credit_D_Tax_ID_LostFocus, Credit_D_Tax_Name_A_GotFocus, Credit_D_Tax_Name_A_LostFocus, Debit_D_Tax_ID_GotFocus, Debit_D_Tax_ID_KeyPress, Debit_D_Tax_ID_LostFocus, Debit_D_Tax_Name_A_GotFocus, Debit_D_Tax_Name_A_LostFocus, Credit_Vat_ID_GotFocus, Credit_Vat_ID_KeyPress, Credit_Vat_ID_LostFocus, Credit_Vat_Name_A_GotFocus, Credit_Vat_Name_A_LostFocus, Debit_Treasury_ID_GotFocus, Debit_Treasury_ID_KeyPress, Debit_Treasury_ID_LostFocus, Debit_Treasury_Name_A_GotFocus, Debit_Treasury_Name_A_LostFocus, Credit_Treasury_ID_GotFocus, Credit_Treasury_ID_KeyPress, Credit_Treasury_ID_LostFocus, Credit_Treasury_Name_A_GotFocus, Credit_Treasury_Name_A_LostFocus, Analysis_ID_GotFocus, Analysis_ID_KeyPress, Analysis_ID_LostFocus, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_DesertTheme1, set_DesertTheme1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadPanel6, set_RadPanel6, get_Modify, set_Modify, get_Save, set_Save, get_F_Exit, set_F_Exit, get_Settings_Panel, set_Settings_Panel, get_RadPanel5, set_RadPanel5, get_Search_Txt, set_Search_Txt, get_Search_Option2, set_Search_Option2, get_D_Tax_Registery_Option, set_D_Tax_Registery_Option, get_Level5_GridView, set_Level5_GridView, get_RadPanel2, set_RadPanel2, get_Label1, set_Label1, get_Label16, set_Label16, get_D_Tax_Per, set_D_Tax_Per, get_RadPanel1, set_RadPanel1, get_Debit_Treasury_ID, set_Debit_Treasury_ID, get_Debit_D_Tax_ID, set_Debit_D_Tax_ID, get_Credit_D_Tax_ID, set_Credit_D_Tax_ID, get_Debit_Vat_ID, set_Debit_Vat_ID, get_Label39, set_Label39, get_Label28, set_Label28, get_Label34, set_Label34, get_Label35, set_Label35, get_Purchase_Link_Option, set_Purchase_Link_Option, get_Debit_Treasury_Name_A, set_Debit_Treasury_Name_A, get_Debit_D_Tax_Name_A, set_Debit_D_Tax_Name_A, get_Credit_D_Tax_Name_A, set_Credit_D_Tax_Name_A, get_Debit_Vat_Name_A, set_Debit_Vat_Name_A, get_Currency_Name_A, set_Currency_Name_A, get_Costcenter_Name_A, set_Costcenter_Name_A, get_Cash_Supplier_Name_A, set_Cash_Supplier_Name_A, get_Analysis_Name_A, set_Analysis_Name_A, get_Currency_ID, set_Currency_ID, get_Costcenter_ID, set_Costcenter_ID, get_Cash_Supplier_ID, set_Cash_Supplier_ID, get_Analysis_ID, set_Analysis_ID, get_Label43, set_Label43, get_Label41, set_Label41, get_Label42, set_Label42, get_Label37, set_Label37, get_RadPanel4, set_RadPanel4, get_Credit_Treasury_Name_A, set_Credit_Treasury_Name_A, get_Credit_Treasury_ID, set_Credit_Treasury_ID, get_Label7, set_Label7, get_Credit_Vat_Name_A, set_Credit_Vat_Name_A, get_Credit_Vat_ID, set_Credit_Vat_ID, get_Label32, set_Label32, get_RadPanel8, set_RadPanel8, get_Currency_Option, set_Currency_Option, get_Search_By_Balance_Option, set_Search_By_Balance_Option, get_Note_Type, set_Note_Type, get_Decimals_Option, set_Decimals_Option, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_Label6, set_Label6, get_Label8, set_Label8, get_Inventory_Name_A
```

---

