# مواصفات ومخطط الوحدة المعمارية: المبيعات والعملاء والفواتير والتحصيل (Sales & Receivables)
**المرحلة البرمجية:** المرحلة 5 (`Phase 05`)
**التطبيق المصدر:** `APPS ERP Application 2023.exe` (Tarabot ERP)
**قاعدة البيانات المستهدفة:** `MK_Khalil_Db_2026` (SQL Server)
**تاريخ الاستخراج الآلي:** 2026-11-03 22:30:55
---

## 1. النبذة الهندسية والهدف الوظيفي للوحدة
تتولى هذه الوحدة إدارة كافة العمليات والبيانات الخاصة بـ **المبيعات والعملاء والفواتير والتحصيل**، وتوفر دورة عمل متكاملة تبدأ من تهيئة الإعدادات والشاشات الثابتة وحتى تنفيذ العمليات اليومية وترحيلها محاسبياً ومخزنياً وفق المعايير المعتمدة في النظام.

تحتوي هذه الوحدة على **8 شاشة نموذج رئيسية** تم تشريحها واستخراج كافة عناصر التحكم، وخطوط أنابيب البيانات، والمعادلات الرياضية، وقواعد التحقق الخاصة بها.

---

## 2. الفهرس التشغيلي لشاشات الوحدة
| # | اسم الشاشة البرمجية (Form Class) | المسمى العربي | المسمى الإنجليزي | الجداول المرتبطة في قاعدة البيانات |
|---|---|---|---|---|
| 1 | `Clients_Form` | **دليل وبطاقة العملاء** | Customer & Client Catalog | `Clients` |
| 2 | `SalesMen_Form` | **مندوبي المبيعات والتحصيل** | Sales Representatives | `SalesMen` |
| 3 | `OfferPrice_Form` | **عروض الأسعار للعملاء** | Sales Quotations & Price Offers | `OfferPrice_Head, OfferPrice_Details` |
| 4 | `Sales_Form` | **فواتير المبيعات التجارية ونقاط البيع** | Sales Invoices & E-Invoicing | `Sales_Head, Sales_Details` |
| 5 | `Sales_Form1` | **فاتورة مبيعات نمط (2) - مبيعات الجملة** | Sales Invoices Pattern 2 (Wholesale) | `Sales_Head1, Sales_Details1` |
| 6 | `Sales_Form2` | **فاتورة مبيعات نمط (3) - نقاط الكاشير والفروع** | Sales Invoices Pattern 3 (POS / Retail) | `Sales_Head2, Sales_Details2` |
| 7 | `Sales_R_Form` | **مردودات المبيعات** | Sales Returns & Credit Notes | `Sales_R_Head, Sales_R_Details` |
| 8 | `Sales_Settings_Form` | **إعدادات وتوجيه المبيعات** | Sales Accounting Settings | `Sales_Settings` |

---

## 3. التشريح التفصيلي لنماذج الشاشات (Forms Technical Catalog)
### 3.1 شاشة: دليل وبطاقة العملاء (`Clients_Form`)
- **الاسم الإنجليزي:** Customer & Client Catalog
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** تسجيل بيانات العملاء، الحدود الائتمانية، فترات السماح، الرقم الضريبي، والحساب المالي
- **جداول قاعدة البيانات المستهدفة:** `Clients`

#### أ. كتالوج حقول وعناصر التحكم (Field & Control Catalog Table)
| معرف العنصر (Control ID) | التسمية العربية (Label) | نوع عنصر الواجهة | الربط بقاعدة البيانات (DB Binding) | نوع البيانات والقيود (Type & Constraints) | القيمة الافتراضية | المعادلة / السلوك البرمجي |
|---|---|---|---|---|---|---|
| `Search_Option2` | **حقل / زر البحث** | `RadRadioButton` | - | - | - | - |
| `Windows7Theme1` | **Windows7Theme1** | `Windows7Theme` | - | - | - | - |
| `Search_Txt` | **حقل / زر البحث** | `RadTextBox` | - | - | - | - |
| `Client_Name_E` | **اسم العميل** | `RadTextBox` | `Clients.Client_Name_E` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `GridView` | **GridView** | `RadGridView` | - | - | - | - |
| `Client_ID` | **كود العميل** | `RadTextBox` | `Clients.CLient_ID` | `numeric` (PRIMARY KEY, NOT NULL) | - | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `Client_Name_A` | **اسم العميل** | `RadTextBox` | `Clients.Client_Name_A` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `RadLabel1` | **RadLabel1** | `RadLabel` | - | - | - | - |
| `RadLabel2` | **RadLabel2** | `RadLabel` | - | - | - | - |
| `RadLabel5` | **RadLabel5** | `RadLabel` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadLabel15` | **RadLabel15** | `RadLabel` | - | - | - | - |
| `Address` | **زر إضافة جديد** | `RadTextBox` | `Clients.Address` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `RadLabel16` | **RadLabel16** | `RadLabel` | - | - | - | - |
| `C_Email` | **C_Email** | `RadTextBox` | `Clients.C_Email` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `RadLabel12` | **RadLabel12** | `RadLabel` | - | - | - | - |
| `Mobile` | **Mobile** | `RadTextBox` | `Clients.Mobile` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `RadLabel13` | **RadLabel13** | `RadLabel` | - | - | - | - |
| `Fax` | **Fax** | `RadTextBox` | `Clients.Fax` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Tel` | **Tel** | `RadTextBox` | `Clients.Tel` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `RadLabel14` | **RadLabel14** | `RadLabel` | - | - | - | - |
| `RadPanel6` | **RadPanel6** | `RadPanel` | - | - | - | - |
| `Client_Status` | **Client_Status** | `RadDropDownList` | `Clients.Client_Status` | `smallint` (NOT NULL) | `((0))` | - |
| `RadLabel26` | **RadLabel26** | `RadLabel` | - | - | - | - |
| `Card_No` | **Card_No** | `RadTextBox` | `Clients.Card_No` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `RadLabel3` | **RadLabel3** | `RadLabel` | - | - | - | - |
| `Vat_No` | **Vat_No** | `RadTextBox` | `Clients.Vat_No` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `RadLabel28` | **RadLabel28** | `RadLabel` | - | - | - | - |
| `SalesMen_GridView` | **SalesMen_GridView** | `RadGridView` | - | - | - | - |
| `SalesMan_ID` | **كود المندوب** | `RadTextBox` | `Clients.SalesMan_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `SalesMan_Name_A` | **اسم المندوب** | `RadTextBox` | - | - | - | - |
| `RadLabel27` | **RadLabel27** | `RadLabel` | - | - | - | - |
| `Limit_Amount` | **Limit_Amount** | `RadTextBox` | `Clients.Limit_Amount` | `float` (NOT NULL) | `((0))` | - |
| `RadLabel10` | **RadLabel10** | `RadLabel` | - | - | - | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Clients.Notice` | `nvarchar(150)` (NOT NULL) | `(' ')` | - |
| `RadLabel4` | **RadLabel4** | `RadLabel` | - | - | - | - |
| `Manger_Name` | **Manger_Name** | `RadTextBox` | `Clients.Manger_Name` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `RadLabel17` | **RadLabel17** | `RadLabel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Clients.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Clients.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `Save` | **زر حفظ السجل** | `RadButton` | - | - | - | - |
| `Delete` | **زر حذف السجل** | `RadButton` | - | - | - | - |
| `F_Exit` | **F_Exit** | `RadButton` | - | - | - | - |
| `Add` | **زر إضافة جديد** | `RadButton` | - | - | - | - |
| `Modify` | **زر تعديل السجل** | `RadButton` | - | - | - | - |
| `Area_ID` | **Area_ID** | `RadTextBox` | `Clients.Area_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `Area_Name_A` | **Area_Name_A** | `RadTextBox` | - | - | - | - |
| `RadLabel6` | **RadLabel6** | `RadLabel` | - | - | - | - |
| `Areas_GridView` | **Areas_GridView** | `RadGridView` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `Level4_Name_A` | **اسم الحساب المستوى 4** | `RadTextBox` | - | - | - | - |
| `Level4_ID` | **كود الحساب المستوى 4** | `RadTextBox` | `Clients.Level4_ID` | `int` (NOT NULL) | `((0))` | - |
| `RadLabel18` | **RadLabel18** | `RadLabel` | - | - | - | - |
| `Level4_Gridview` | **Level4_Gridview** | `RadGridView` | - | - | - | - |
| `RadLabel7` | **RadLabel7** | `RadLabel` | - | - | - | - |
| `Client_Price_Option` | **السعر الفردي** | `RadDropDownList` | `Clients.Client_Price_Option` | `smallint` (NOT NULL) | `((0))` | - |
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم العميـل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسم العميـل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الأسـم بالأنجليزي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال مندوب المبيعـات 
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
Select * FROM Level4_View Where Module_Type=
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
Select * FROM Clients_View Order By Client_ID
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
Select * From Level4_View Where Module_Type=5 Order By Level4_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM SalesMen Order By SalesMan_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Areas Order By Area_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Clients Where Client_ID=
```
##### استعلام INSERT على جدول `Clients`:
```sql
Insert Into Clients(Level4_ID,Client_ID,Client_Name_A,Client_Name_E,Client_Status,SalesMan_ID,Tel,Fax,Mobile,Manger_Name,C_Email,Card_No,Vat_No,Area_ID,Address,Limit_Amount,Client_Price_Option,Client_Price_Option_Name,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Clients`:
```sql
Insert Into Level5(Level4_ID,Level5_ID,Level5_Name_A,Level5_Name_E,Entry_ID,Entry_Name,Notice)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Clients Where Client_ID=
```
##### استعلام UPDATE على جدول `Clients`:
```sql
Update Clients Set Level4_ID=
```
##### استعلام UPDATE على جدول `Clients`:
```sql
Update Level5 Set Level4_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Clients Where Client_ID=
```
##### استعلام DELETE على جدول `Clients`:
```sql
Delete From Clients where Client_ID=
```
##### استعلام DELETE على جدول `Clients`:
```sql
Delete From Level5 where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Clients_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level4_View Where Module_Type=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM SalesMen Where SalesMan_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Areas Where Area_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Clients_View Where Client_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Clients Where Client_Name_A='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Clients Where Client_Name_E='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM SalesMen Where SalesMan_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Areas Where Area_ID=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Areas_GridView_CellClick, Areas_GridView_CellFormatting, Areas_GridView_KeyDown, Area_ID_LostFocus, Area_Name_A_GotFocus, Area_Name_A_KeyDown, Area_Name_A_LostFocus, Notice_LostFocus, C_Email_LostFocus, Card_No_LostFocus, Vat_No_LostFocus, Address_LostFocus, Tel_LostFocus, Manger_Name_LostFocus, Mobile_LostFocus, Fax_LostFocus, Client_ID_LostFocus, Client_Name_A_LostFocus, Client_Name_E_LostFocus, Limit_Amount_LostFocus, SalesMan_ID_LostFocus, SalesMan_Name_A_LostFocus, Search_Txt_LostFocus, Level4_ID_GotFocus, Level4_ID_KeyDown, Level4_ID_KeyPress, Level4_Name_A_GotFocus, Level4_Gridview_CellClick, Level4_Gridview_CellFormatting, Level4_Gridview_KeyDown, Level4_Name_A_LostFocus, Level4_ID_LostFocus, Client_Price_Option_GotFocus, Client_Price_Option_KeyDown, Client_Price_Option_KeyPress, Client_Price_Option_LostFocus, Client_Price_Option_SelectedIndexChanged, set_RadLabel7, get_Client_Price_Option, set_Client_Price_Option, Clear_Record, Clear_Data, Fill_Grid, Fill_Level4_Grid, Fill_SalesMen_Grid, Fill_Areas_Grid, Lock_Control, Enable_Control, Review_Record, Clients_Form_KeyDown, Clients_Form_Load, Clients_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Option2_Click, Search_Option2_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Client_ID_GotFocus, Client_ID_KeyPress, Client_ID_KeyDown, Client_Name_A_GotFocus, Client_Name_A_KeyPress, Client_Name_A_KeyDown, Client_Name_E_GotFocus, Client_Name_E_KeyPress, Client_Name_E_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Tel_GotFocus, Tel_KeyDown, Tel_KeyPress, Fax_GotFocus, Fax_KeyDown, Fax_KeyPress, Mobile_GotFocus, Mobile_KeyDown, Mobile_KeyPress, C_Email_GotFocus, C_Email_KeyDown, Address_GotFocus, Address_KeyDown, C_Email_KeyPress, Address_KeyPress, SalesMan_Name_A_GotFocus, SalesMan_Name_A_KeyDown, Limit_Amount_GotFocus, Limit_Amount_KeyDown, Limit_Amount_KeyPress, SalesMan_ID_GotFocus, SalesMan_ID_KeyDown, Card_No_GotFocus, Card_No_KeyDown, Vat_No_GotFocus, Vat_No_KeyDown, SalesMan_ID_KeyPress, SalesMen_GridView_CellClick, SalesMen_GridView_CellFormatting, SalesMen_GridView_KeyDown, Card_No_KeyPress, Vat_No_KeyPress, Manger_Name_GotFocus, Manger_Name_KeyDown, Manger_Name_KeyPress, Notice_GotFocus, Notice_KeyDown, Notice_KeyPress, Area_ID_GotFocus, Area_ID_KeyDown, Area_ID_KeyPress, Dispose, InitializeComponent, get_Search_Option2, set_Search_Option2, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Search_Txt, set_Search_Txt, get_Client_Name_E, set_Client_Name_E, get_GridView, set_GridView, get_Client_ID, set_Client_ID, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_DesertTheme1, set_DesertTheme1, get_Client_Name_A, set_Client_Name_A, get_RadLabel1, set_RadLabel1, get_RadLabel2, set_RadLabel2, get_RadLabel5, set_RadLabel5, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadLabel15, set_RadLabel15, get_Address, set_Address, get_RadLabel16, set_RadLabel16, get_C_Email, set_C_Email, get_RadLabel12, set_RadLabel12, get_Mobile, set_Mobile, get_RadLabel13, set_RadLabel13, get_Fax, set_Fax, get_Tel, set_Tel, get_RadLabel14, set_RadLabel14, get_RadPanel6, set_RadPanel6, get_Client_Status, set_Client_Status, get_RadLabel26, set_RadLabel26, get_Card_No, set_Card_No, get_RadLabel3, set_RadLabel3, get_Vat_No, set_Vat_No, get_RadLabel28, set_RadLabel28, get_SalesMen_GridView, set_SalesMen_GridView, get_SalesMan_ID, set_SalesMan_ID, get_SalesMan_Name_A, set_SalesMan_Name_A, get_RadLabel27, set_RadLabel27, get_Limit_Amount, set_Limit_Amount, get_RadLabel10, set_RadLabel10, get_Notice, set_Notice, get_RadLabel4, set_RadLabel4, get_Manger_Name, set_Manger_Name, get_RadLabel17, set_RadLabel17, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Add, set_Add, get_Modify, set_Modify, get_Area_ID, set_Area_ID, get_Area_Name_A, set_Area_Name_A, get_RadLabel6, set_RadLabel6, get_Areas_GridView, set_Areas_GridView, get_RadPanel4, set_RadPanel4, get_Level4_Name_A, set_Level4_Name_A, get_Level4_ID, set_Level4_ID, get_RadLabel18, set_RadLabel18, get_Level4_Gridview, set_Level4_Gridview, get_RadLabel7
```

---

### 3.2 شاشة: مندوبي المبيعات والتحصيل (`SalesMen_Form`)
- **الاسم الإنجليزي:** Sales Representatives
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** إدارة بيانات مناديب المبيعات وعمولات البيع والتحصيل والمناطق الجغرافية
- **جداول قاعدة البيانات المستهدفة:** `SalesMen`

#### أ. كتالوج حقول وعناصر التحكم (Field & Control Catalog Table)
| معرف العنصر (Control ID) | التسمية العربية (Label) | نوع عنصر الواجهة | الربط بقاعدة البيانات (DB Binding) | نوع البيانات والقيود (Type & Constraints) | القيمة الافتراضية | المعادلة / السلوك البرمجي |
|---|---|---|---|---|---|---|
| `Search_Option2` | **حقل / زر البحث** | `RadRadioButton` | - | - | - | - |
| `Windows7Theme1` | **Windows7Theme1** | `Windows7Theme` | - | - | - | - |
| `Search_Txt` | **حقل / زر البحث** | `RadTextBox` | - | - | - | - |
| `SalesMan_Name_E` | **اسم المندوب** | `RadTextBox` | `SalesMen.SalesMan_Name_E` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `GridView` | **GridView** | `RadGridView` | - | - | - | - |
| `SalesMan_ID` | **كود المندوب** | `RadTextBox` | `SalesMen.SalesMan_ID` | `numeric` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `SalesMan_Name_A` | **اسم المندوب** | `RadTextBox` | `SalesMen.SalesMan_Name_A` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `RadLabel1` | **RadLabel1** | `RadLabel` | - | - | - | - |
| `RadLabel2` | **RadLabel2** | `RadLabel` | - | - | - | - |
| `RadLabel5` | **RadLabel5** | `RadLabel` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadLabel15` | **RadLabel15** | `RadLabel` | - | - | - | - |
| `Address` | **زر إضافة جديد** | `RadTextBox` | `SalesMen.Address` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `RadLabel16` | **RadLabel16** | `RadLabel` | - | - | - | - |
| `C_Email` | **C_Email** | `RadTextBox` | `SalesMen.C_Email` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `RadLabel12` | **RadLabel12** | `RadLabel` | - | - | - | - |
| `Mobile` | **Mobile** | `RadTextBox` | `SalesMen.Mobile` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `RadLabel13` | **RadLabel13** | `RadLabel` | - | - | - | - |
| `Fax` | **Fax** | `RadTextBox` | `SalesMen.Fax` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Tel` | **Tel** | `RadTextBox` | `SalesMen.Tel` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `RadLabel14` | **RadLabel14** | `RadLabel` | - | - | - | - |
| `RadPanel6` | **RadPanel6** | `RadPanel` | - | - | - | - |
| `Sales_Area` | **Sales_Area** | `RadTextBox` | `SalesMen.Sales_Area` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `RadLabel20` | **RadLabel20** | `RadLabel` | - | - | - | - |
| `SalesMan_Status` | **SalesMan_Status** | `RadDropDownList` | `SalesMen.SalesMan_Status` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel26` | **RadLabel26** | `RadLabel` | - | - | - | - |
| `RadLabel30` | **RadLabel30** | `RadLabel` | - | - | - | - |
| `RadLabel29` | **RadLabel29** | `RadLabel` | - | - | - | - |
| `Card_ID` | **Card_ID** | `RadTextBox` | `SalesMen.Card_ID` | `nvarchar(20)` (NOT NULL) | `(' ')` | - |
| `RadLabel3` | **RadLabel3** | `RadLabel` | - | - | - | - |
| `Pass_ID` | **Pass_ID** | `RadTextBox` | `SalesMen.Pass_ID` | `nvarchar(20)` (NOT NULL) | `(' ')` | - |
| `RadLabel28` | **RadLabel28** | `RadLabel` | - | - | - | - |
| `Pass_To_Date` | **Pass_To_Date** | `RadDateTimePicker` | `SalesMen.Pass_To_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Card_To_Date` | **Card_To_Date** | `RadDateTimePicker` | `SalesMen.Card_To_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `RadPanel13` | **RadPanel13** | `RadPanel` | - | - | - | - |
| `Target1_Amount` | **Target1_Amount** | `RadTextBox` | `SalesMen.Target1_Amount` | `float` (NOT NULL) | `((0))` | - |
| `RadLabel10` | **RadLabel10** | `RadLabel` | - | - | - | - |
| `Target1_Per` | **Target1_Per** | `RadTextBox` | `SalesMen.Target1_Per` | `float` (NOT NULL) | `((0))` | - |
| `RadLabel11` | **RadLabel11** | `RadLabel` | - | - | - | - |
| `RadTextBox11` | **RadTextBox11** | `RadTextBox` | - | - | - | - |
| `RadTextBox12` | **RadTextBox12** | `RadTextBox` | - | - | - | - |
| `RadLabel17` | **RadLabel17** | `RadLabel` | - | - | - | - |
| `Target2_Per` | **Target2_Per** | `RadTextBox` | `SalesMen.Target2_Per` | `float` (NOT NULL) | `((0))` | - |
| `Target2_Amount` | **Target2_Amount** | `RadTextBox` | `SalesMen.Target2_Amount` | `float` (NOT NULL) | `((0))` | - |
| `RadLabel18` | **RadLabel18** | `RadLabel` | - | - | - | - |
| `Per_By_Receivable_Option` | **Per_By_Receivable_Option** | `RadCheckBox` | `SalesMen.Per_By_Receivable_Option` | `bit` (NOT NULL) | `((0))` | - |
| `Per_By_Sales_Option` | **Per_By_Sales_Option** | `RadCheckBox` | `SalesMen.Per_By_Sales_Option` | `bit` (NOT NULL) | `((0))` | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Save` | **زر حفظ السجل** | `RadButton` | - | - | - | - |
| `Delete` | **زر حذف السجل** | `RadButton` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `SalesMen.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `F_Exit` | **F_Exit** | `RadButton` | - | - | - | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `SalesMen.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `Add` | **زر إضافة جديد** | `RadButton` | - | - | - | - |
| `Modify` | **زر تعديل السجل** | `RadButton` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `Main_Costcenter_Name_A` | **اسم مركز التكلفة** | `RadTextBox` | - | - | - | - |
| `Main_Costcenter_ID` | **كود مركز التكلفة** | `RadTextBox` | `SalesMen.Main_Costcenter_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `RadLabel4` | **RadLabel4** | `RadLabel` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `Main_Costcenters_Gridview` | **Main_Costcenters_Gridview** | `RadGridView` | - | - | - | - |
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
| `Dt2` | **Dt2** | `DataTable` | - | - | - | - |
| `Dt3` | **Dt3** | `DataTable` | - | - | - | - |
| `Dt_RS` | **Dt_RS** | `DataTable` | - | - | - | - |
| `Dt_RS1` | **Dt_RS1** | `DataTable` | - | - | - | - |
| `Dt_RS2` | **Dt_RS2** | `DataTable` | - | - | - | - |
| `Dt_RS3` | **Dt_RS3** | `DataTable` | - | - | - | - |
| `Dt_RS6` | **Dt_RS6** | `DataTable` | - | - | - | - |
| `Delete_RS` | **زر حذف السجل** | `DataTable` | - | - | - | - |

#### ب. قواعد التحقق والمعادلات الحسابية (Validation & Business Rules)
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم مركز التكلفة الرئيسي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسم مركز التكلفة الرئيسي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم مندوب البيـع 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسم مندوب البيـع 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الأسـم بالأنجليزي 
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
Select * FROM Main_Costcenters Where Parent_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 SalesMan_ID FROM SalesMen Where Main_Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 SalesMan_ID FROM SalesMen Where Main_Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 SalesMan_ID FROM SalesMen Where Main_Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM SalesMen_View Order By SalesMan_ID
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
Select * FROM Main_Costcenters Where Parent_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM SalesMen Where SalesMan_ID=
```
##### استعلام INSERT على جدول `SalesMen`:
```sql
Insert Into SalesMen(Main_Costcenter_ID,SalesMan_ID,SalesMan_Name_A,SalesMan_Name_E,SalesMan_Status,Tel,Fax,Mobile,C_Email,Address,Card_ID,Card_To_Date,Pass_ID,Pass_To_Date,Per_By_Sales_Option,Per_By_Receivable_Option,Target1_Amount,Target2_Amount,Target1_Per,Target2_Per,Sales_Area,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `SalesMen`:
```sql
Insert Into Costcenters(Main_Costcenter_ID,Costcenter_ID,Costcenter_Name_A,Costcenter_Name_E,Entry_ID,Entry_Name)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM SalesMen Where SalesMan_ID=
```
##### استعلام UPDATE على جدول `SalesMen`:
```sql
Update SalesMen Set Main_Costcenter_ID=
```
##### استعلام UPDATE على جدول `SalesMen`:
```sql
Update Costcenters Set Main_Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM SalesMen Where SalesMan_ID=
```
##### استعلام DELETE على جدول `SalesMen`:
```sql
Delete From SalesMen where SalesMan_ID=
```
##### استعلام DELETE على جدول `SalesMen`:
```sql
Delete From Costcenters where Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM SalesMen_View Where SalesMan_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Main_Costcenters Where Parent_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM SalesMen_View Where Main_Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM SalesMen_View Where SalesMan_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM SalesMen_View Where Main_Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM SalesMen Where SalesMan_Name_A='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM SalesMen_View Where Main_Costcenter_ID=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Pass_ID_GotFocus, Pass_ID_KeyDown, Card_ID_KeyPress, Pass_ID_KeyPress, Pass_ID_LostFocus, Sales_Area_LostFocus, SalesMan_ID_LostFocus, SalesMan_Name_A_LostFocus, SalesMan_Name_E_LostFocus, Search_Txt_LostFocus, Target1_Amount_LostFocus, Target1_Per_LostFocus, Target2_Amount_LostFocus, Target2_Per_LostFocus, Tel_LostFocus, Address_LostFocus, Card_ID_LostFocus, Fax_LostFocus, Mobile_LostFocus, C_Email_LostFocus, Main_Costcenter_ID_GotFocus, Main_Costcenter_ID_KeyDown, Main_Costcenter_ID_KeyPress, Main_Costcenters_Gridview_CellClick, Main_Costcenters_Gridview_CellFormatting, Main_Costcenters_Gridview_KeyDown, Main_Costcenter_ID_LostFocus, set_RadPanel4, get_Main_Costcenter_Name_A, set_Main_Costcenter_Name_A, get_Main_Costcenter_ID, set_Main_Costcenter_ID, get_RadLabel4, set_RadLabel4, get_AquaTheme1, set_AquaTheme1, get_Main_Costcenters_Gridview, set_Main_Costcenters_Gridview, Clear_Record, Clear_Data, Fill_Main_Costcenters_Grid, Fill_Grid, Lock_Control, Enable_Control, Review_Record, SalesMen_Form_KeyDown, SalesMen_Form_Load, SalesMen_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Option2_Click, Search_Option2_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, SalesMan_ID_GotFocus, SalesMan_ID_KeyPress, SalesMan_ID_KeyDown, SalesMan_Name_A_GotFocus, SalesMan_Name_A_KeyPress, SalesMan_Name_A_KeyDown, SalesMan_Name_E_GotFocus, SalesMan_Name_E_KeyPress, SalesMan_Name_E_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Tel_GotFocus, Tel_KeyDown, Tel_KeyPress, Fax_GotFocus, Fax_KeyDown, Fax_KeyPress, Mobile_GotFocus, Mobile_KeyDown, Mobile_KeyPress, C_Email_GotFocus, C_Email_KeyDown, Address_GotFocus, Address_KeyDown, C_Email_KeyPress, Address_KeyPress, Target1_Amount_GotFocus, Target1_Amount_KeyDown, Target1_Amount_KeyPress, Target2_Amount_GotFocus, Target2_Amount_KeyDown, Target2_Amount_KeyPress, Target1_Per_GotFocus, Target1_Per_KeyDown, Target1_Per_KeyPress, Target2_Per_GotFocus, Target2_Per_KeyDown, Target2_Per_KeyPress, Sales_Area_GotFocus, Sales_Area_KeyDown, Sales_Area_KeyPress, Card_To_Date_KeyDown, Card_To_Date_Opened, Card_To_Date_ValueChanged, Pass_To_Date_KeyDown, Pass_To_Date_Opened, Pass_To_Date_ValueChanged, Card_ID_GotFocus, Card_ID_KeyDown, Dispose, InitializeComponent, get_Search_Option2, set_Search_Option2, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Search_Txt, set_Search_Txt, get_SalesMan_Name_E, set_SalesMan_Name_E, get_GridView, set_GridView, get_SalesMan_ID, set_SalesMan_ID, get_RadPanel2, set_RadPanel2, get_DesertTheme1, set_DesertTheme1, get_SalesMan_Name_A, set_SalesMan_Name_A, get_RadLabel1, set_RadLabel1, get_RadLabel2, set_RadLabel2, get_RadLabel5, set_RadLabel5, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadLabel15, set_RadLabel15, get_Address, set_Address, get_RadLabel16, set_RadLabel16, get_C_Email, set_C_Email, get_RadLabel12, set_RadLabel12, get_Mobile, set_Mobile, get_RadLabel13, set_RadLabel13, get_Fax, set_Fax, get_Tel, set_Tel, get_RadLabel14, set_RadLabel14, get_RadPanel6, set_RadPanel6, get_Sales_Area, set_Sales_Area, get_RadLabel20, set_RadLabel20, get_SalesMan_Status, set_SalesMan_Status, get_RadLabel26, set_RadLabel26, get_RadLabel30, set_RadLabel30, get_RadLabel29, set_RadLabel29, get_Card_ID, set_Card_ID, get_RadLabel3, set_RadLabel3, get_Pass_ID, set_Pass_ID, get_RadLabel28, set_RadLabel28, get_Pass_To_Date, set_Pass_To_Date, get_Card_To_Date, set_Card_To_Date, get_RadPanel13, set_RadPanel13, get_Target1_Amount, set_Target1_Amount, get_RadLabel10, set_RadLabel10, get_Target1_Per, set_Target1_Per, get_RadLabel11, set_RadLabel11, get_RadTextBox11, set_RadTextBox11, get_RadTextBox12, set_RadTextBox12, get_RadLabel17, set_RadLabel17, get_Target2_Per, set_Target2_Per, get_Target2_Amount, set_Target2_Amount, get_RadLabel18, set_RadLabel18, get_Per_By_Receivable_Option, set_Per_By_Receivable_Option, get_Per_By_Sales_Option, set_Per_By_Sales_Option, get_RadPanel3, set_RadPanel3, get_Save, set_Save, get_Delete, set_Delete, get_Entry_Name, set_Entry_Name, get_F_Exit, set_F_Exit, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_Add, set_Add, get_Modify, set_Modify, get_RadPanel4
```

---

### 3.3 شاشة: عروض الأسعار للعملاء (`OfferPrice_Form`)
- **الاسم الإنجليزي:** Sales Quotations & Price Offers
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** إعداد وتقديم عروض الأسعار والمواصفات الفنية للعملاء ومتابعة صلاحية العرض
- **جداول قاعدة البيانات المستهدفة:** `OfferPrice_Head`, `OfferPrice_Details`

#### أ. كتالوج حقول وعناصر التحكم (Field & Control Catalog Table)
| معرف العنصر (Control ID) | التسمية العربية (Label) | نوع عنصر الواجهة | الربط بقاعدة البيانات (DB Binding) | نوع البيانات والقيود (Type & Constraints) | القيمة الافتراضية | المعادلة / السلوك البرمجي |
|---|---|---|---|---|---|---|
| `Windows7Theme1` | **Windows7Theme1** | `Windows7Theme` | - | - | - | - |
| `Save` | **زر حفظ السجل** | `RadButton` | - | - | - | - |
| `Delete` | **زر حذف السجل** | `RadButton` | - | - | - | - |
| `F_Exit` | **F_Exit** | `RadButton` | - | - | - | - |
| `Add` | **زر إضافة جديد** | `RadButton` | - | - | - | - |
| `Modify` | **زر تعديل السجل** | `RadButton` | - | - | - | - |
| `Search_Txt` | **حقل / زر البحث** | `RadTextBox` | - | - | - | - |
| `GridView` | **GridView** | `RadGridView` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `OfferPrice_Head.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `OfferPrice_Head.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `RadGridView1` | **RadGridView1** | `RadGridView` | - | - | - | - |
| `Note_Date` | **تاريخ الحركة** | `RadDateTimePicker` | `OfferPrice_Head.Note_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Items_GridView` | **Items_GridView** | `RadGridView` | - | - | - | - |
| `RadLabel15` | **RadLabel15** | `RadLabel` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Label8` | **Label8** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Note_No` | **رقم الحركة / السند** | `RadTextBox` | `OfferPrice_Head.Note_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `OfferPrice_Head.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Label10` | **Label10** | `Label` | - | - | - | - |
| `Label11` | **Label11** | `Label` | - | - | - | - |
| `Actual_Qty` | **الكمية** | `RadTextBox` | `OfferPrice_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Unit_Name` | **الوحدة** | `RadTextBox` | - | - | - | - |
| `Item_Name_A` | **اسم الصنف** | `RadTextBox` | - | - | - | - |
| `Item_ID` | **كود الصنف** | `RadTextBox` | `OfferPrice_Details.Item_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label15` | **Label15** | `Label` | - | - | - | - |
| `Actual_Net` | **الصافي المستحق** | `RadTextBox` | `OfferPrice_Details.Actual_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Actual_Price` | **السعر الفردي** | `RadTextBox` | `OfferPrice_Details.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Label26` | **Label26** | `Label` | - | - | - | - |
| `Note_Total` | **الإجمالي** | `RadTextBox` | `OfferPrice_Head.Note_Total` | `float` (NOT NULL) | `((0))` | `Total = SUM(Details.Net)` |
| `Label28` | **Label28** | `Label` | - | - | - | - |
| `Note_Actual_Qty` | **الكمية** | `RadTextBox` | `OfferPrice_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Note_Net_With_Tax_Text` | **ضريبة القيمة المضافة** | `RadTextBox` | - | - | - | `Net = Total - Discount + Tax` |
| `SR` | **SR** | `RadTextBox` | `OfferPrice_Details.SR` | `int` (PRIMARY KEY, NOT NULL) | - | - |
| `Inventory_Name_A` | **Inventory_Name_A** | `RadTextBox` | - | - | - | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Inventory_ID` | **كود المخزن** | `RadTextBox` | `OfferPrice_Head.Inventory_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Unit_ID` | **الوحدة** | `RadTextBox` | `OfferPrice_Details.Unit_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `Note_Date_H` | **تاريخ الحركة** | `RadTextBox` | `OfferPrice_Head.Note_Date_H` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Qty` | **الكمية** | `RadTextBox` | `OfferPrice_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Price` | **السعر الفردي** | `RadTextBox` | `OfferPrice_Details.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Units_GridView` | **Units_GridView** | `RadGridView` | - | - | - | - |
| `Inventories_GridView` | **Inventories_GridView** | `RadGridView` | - | - | - | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Unit_Exchang` | **Unit_Exchang** | `RadTextBox` | `OfferPrice_Head.Exchang` | `float` (NOT NULL) | `((1))` | - |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Issue_No` | **Issue_No** | `RadTextBox` | `OfferPrice_Head.Issue_No` | `nvarchar(50)` (NOT NULL) | `('-')` | - |
| `Client_Name_A` | **اسم العميل** | `RadTextBox` | - | - | - | - |
| `Label7` | **Label7** | `Label` | - | - | - | - |
| `Client_ID` | **كود العميل** | `RadTextBox` | `OfferPrice_Head.Client_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label12` | **Label12** | `Label` | - | - | - | - |
| `Note_Type` | **Note_Type** | `RadDropDownList` | `OfferPrice_Head.Note_Type` | `smallint` (NOT NULL) | `((0))` | - |
| `Currency_Name_A` | **اسم العملة** | `RadTextBox` | - | - | - | - |
| `Exchang` | **Exchang** | `RadTextBox` | `OfferPrice_Head.Exchang` | `float` (NOT NULL) | `((1))` | - |
| `Label17` | **Label17** | `Label` | - | - | - | - |
| `Label27` | **Label27** | `Label` | - | - | - | - |
| `Currency_ID` | **كود العملة** | `RadTextBox` | `OfferPrice_Head.Currency_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `Analysis_Name_A` | **اسم الحساب التحليلي** | `RadTextBox` | - | - | - | - |
| `Analysis_ID` | **كود الحساب التحليلي** | `RadTextBox` | `OfferPrice_Head.Analysis_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label19` | **Label19** | `Label` | - | - | - | - |
| `Note_Net_With_Tax` | **ضريبة القيمة المضافة** | `RadTextBox` | `OfferPrice_Head.Note_Net_With_Tax` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label16` | **Label16** | `Label` | - | - | - | - |
| `Note_Actual_Total` | **الإجمالي** | `RadTextBox` | `OfferPrice_Head.Note_Actual_Total` | `float` (NOT NULL) | `((0))` | `Total = SUM(Details.Net)` |
| `Label25` | **Label25** | `Label` | - | - | - | - |
| `Vat_Tax_Per` | **ضريبة القيمة المضافة** | `RadTextBox` | `OfferPrice_Head.Vat_Tax_Per` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label24` | **Label24** | `Label` | - | - | - | - |
| `Note_Tax` | **ضريبة القيمة المضافة** | `RadTextBox` | `OfferPrice_Head.Note_Tax` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label23` | **Label23** | `Label` | - | - | - | - |
| `D_Tax_Per` | **ضريبة القيمة المضافة** | `RadTextBox` | `OfferPrice_Head.D_Tax_Per` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label22` | **Label22** | `Label` | - | - | - | - |
| `Label20` | **Label20** | `Label` | - | - | - | - |
| `Vat_Tax_Amount` | **ضريبة القيمة المضافة** | `RadTextBox` | `OfferPrice_Head.Vat_Tax_Amount` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label21` | **Label21** | `Label` | - | - | - | - |
| `D_Tax_Amount` | **ضريبة القيمة المضافة** | `RadTextBox` | `OfferPrice_Head.D_Tax_Amount` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Debit_Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Debit_Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `OfferPrice_Head.Debit_Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label30` | **Label30** | `Label` | - | - | - | - |
| `Sales_Order` | **Sales_Order** | `RadTextBox` | `OfferPrice_Head.Sales_Order` | `nvarchar(50)` (NOT NULL) | `('-')` | - |
| `Label31` | **Label31** | `Label` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `TextBox` | `OfferPrice_Head.Note_Net_Text` | `nvarchar(250)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `Analysis_GridView` | **Analysis_GridView** | `RadGridView` | - | - | - | - |
| `Currency_GridView` | **Currency_GridView** | `RadGridView` | - | - | - | - |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `Note_Discount_After_Tax` | **الخصم** | `RadTextBox` | `OfferPrice_Head.Note_Discount_After_Tax` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Net` | **الصافي المستحق** | `RadTextBox` | `OfferPrice_Head.Note_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Cost` | **Cost** | `RadTextBox` | `OfferPrice_Details.Cost` | `float` (NOT NULL) | `((0))` | - |
| `Note_Discount` | **الخصم** | `RadTextBox` | `OfferPrice_Head.Note_Discount` | `float` (NOT NULL) | `((0))` | - |
| `Label34` | **Label34** | `Label` | - | - | - | - |
| `Discount_Amount` | **الخصم** | `RadTextBox` | `OfferPrice_Head.Discount_Amount` | `float` (NOT NULL) | `((0))` | - |
| `Label33` | **Label33** | `Label` | - | - | - | - |
| `Discount_Per` | **الخصم** | `RadTextBox` | `OfferPrice_Head.Discount_Per` | `float` (NOT NULL) | `((0))` | - |
| `Label29` | **Label29** | `Label` | - | - | - | - |
| `Label32` | **Label32** | `Label` | - | - | - | - |
| `Discount_Per_Amount` | **الخصم** | `RadTextBox` | `OfferPrice_Head.Discount_Per_Amount` | `float` (NOT NULL) | `((0))` | - |
| `Note_Net` | **الصافي المستحق** | `RadTextBox` | `OfferPrice_Head.Note_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label35` | **Label35** | `Label` | - | - | - | - |
| `Print_Journal` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Label37` | **Label37** | `Label` | - | - | - | - |
| `Sales_No` | **Sales_No** | `RadTextBox` | `OfferPrice_Head.Sales_No` | `int` (NOT NULL) | `((0))` | - |
| `Cost_Net` | **الصافي المستحق** | `RadTextBox` | `OfferPrice_Details.Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `SalesMen_GridView` | **SalesMen_GridView** | `RadGridView` | - | - | - | - |
| `SalesMan_Name_A` | **اسم المندوب** | `RadTextBox` | - | - | - | - |
| `SalesMan_ID` | **كود المندوب** | `RadTextBox` | `OfferPrice_Head.SalesMan_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label36` | **Label36** | `Label` | - | - | - | - |
| `Note_Cost` | **Note_Cost** | `TextBox` | `OfferPrice_Details.Cost` | `float` (NOT NULL) | `((0))` | - |
| `Print1` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Print` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
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
| `Cmd002` | **Cmd002** | `SqlCommand` | - | - | - | - |
| `Cmd03` | **Cmd03** | `SqlCommand` | - | - | - | - |
| `Cmd003` | **Cmd003** | `SqlCommand` | - | - | - | - |
| `Cmd04` | **Cmd04** | `SqlCommand` | - | - | - | - |
| `Cmd05` | **Cmd05** | `SqlCommand` | - | - | - | - |
| `Cmd06` | **Cmd06** | `SqlCommand` | - | - | - | - |
| `Cmd07` | **Cmd07** | `SqlCommand` | - | - | - | - |
| `Cmd08` | **Cmd08** | `SqlCommand` | - | - | - | - |
| `Cmd09` | **Cmd09** | `SqlCommand` | - | - | - | - |
| `Cmd2` | **Cmd2** | `SqlCommand` | - | - | - | - |
| `Cmd3` | **Cmd3** | `SqlCommand` | - | - | - | - |
| `Cmd4` | **Cmd4** | `SqlCommand` | - | - | - | - |
| `Cmd5` | **Cmd5** | `SqlCommand` | - | - | - | - |
| `Cmd6` | **Cmd6** | `SqlCommand` | - | - | - | - |
| `Cmd7` | **Cmd7** | `SqlCommand` | - | - | - | - |
| `Cmd8` | **Cmd8** | `SqlCommand` | - | - | - | - |
| `Cmd9` | **Cmd9** | `SqlCommand` | - | - | - | - |
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد الفاتـورة المطلوبة  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم العُملـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المخزن 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم العميــل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم القيد المحاسـبي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إضافة سجل جديد أثناء عملية التعديل. لأضافة سجل يجب الضغط على الغاء التعديل ثم الضغط على سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إجراء تعديل أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: في حالة الإضافة يجب الضغط على سجل جديد وفي حالة التعديل يجب الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السند غير موجود ويجب حفظه أولاً  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء إضافة سجل جديد. للحذف يجب الضغط على الغاء الإضافة ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء تعديل سجل . للحذف يجب الضغط على الغاء التعديل ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد السجل المراد حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد الفاتـورة المطلوبة  
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال وحدة الصرف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الكميـة 
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
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Clients Where Client_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Clients Where Client_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM SalesMen Where SalesMan_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
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
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Clients Where Client_ID=
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
Select * From Sales_Settings Where ID=
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
Select * FROM SalesMen Order By SalesMan_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM OfferPrice_Head Order By Note_No Desc
```
##### استعلام SELECT على جدول ``:
```sql
Select Sum(Debit)-Sum(Credit) AS Client_Balance FROM TransMaster_Union Where Level5_ID=
```
##### استعلام INSERT على جدول `OfferPrice_Head`:
```sql
Insert Into OfferPrice_Head(Note_No,Note_Date,Note_Date_H,Note_Type,Currency_ID,Exchang,Inventory_ID,Client_ID,Cash_Client_Name,Previous_Balance,Issue_No,Sales_Order,Analysis_ID,SalesMan_ID,Discount_Per,Discount_Per_Amount,Discount_Amount,Note_Discount,D_Tax_Per,D_Tax_Amount,Vat_Tax_Per,Vat_Tax_Amount,Note_Tax,Note_Discount_After_Tax,Note_Actual_Qty,Note_Actual_Total,Note_Total,Note_Net,Note_Net_With_Tax,Note_Net_Text,Sales_No,Debit_Level5_ID,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `OfferPrice_Details`:
```sql
Insert Into OfferPrice_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Cost,Cost_Net,Actual_Net,Net)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM OfferPrice_Head Where Note_No=
```
##### استعلام UPDATE على جدول `OfferPrice_Head`:
```sql
Update OfferPrice_Head Set Note_No=
```
##### استعلام DELETE على جدول `OfferPrice_Details`:
```sql
Delete From OfferPrice_Details Where Note_No=
```
##### استعلام INSERT على جدول `OfferPrice_Details`:
```sql
Insert Into OfferPrice_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Cost,Cost_Net,Actual_Net,Net)Values(
```
##### استعلام DELETE على جدول `OfferPrice_Head`:
```sql
Delete From OfferPrice_Head where Note_No=
```
##### استعلام DELETE على جدول `OfferPrice_Details`:
```sql
Delete From OfferPrice_Details where Note_No=
```
##### استعلام DELETE على جدول `OfferPrice_Head`:
```sql
Delete From Sales_Journals_Head Where Note_No=
```
##### استعلام DELETE على جدول `OfferPrice_Head`:
```sql
Delete From Sales_Journals_Details Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From OfferPrice_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From OfferPrice_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM OfferPrice_Head_View Where Search_Field Like '%
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
Select * FROM Accounts_Analysis_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Currencies Where Currency_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM SalesMen Where SalesMan_Name_A Like '%
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
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM OfferPrice_Head_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From OfferPrice_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM OfferPrice_Head_View Order By Note_No DESC
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Currency_Name_A_GotFocus, Currency_Name_A_LostFocus, Currency_ID_LostFocus, Note_Type_SelectedIndexChanged, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, Note_Discount_After_Tax_GotFocus, Note_Discount_After_Tax_KeyDown, Note_Discount_After_Tax_KeyPress, Note_Discount_After_Tax_LostFocus, SalesMan_ID_GotFocus, SalesMan_Name_A_GotFocus, SalesMan_Name_A_KeyDown, SalesMan_Name_A_LostFocus, SalesMan_ID_KeyDown, SalesMan_ID_KeyPress, SalesMan_ID_LostFocus, SalesMen_GridView_CellClick, SalesMen_GridView_CellFormatting, SalesMen_GridView_KeyDown, Discount_Per_GotFocus, Discount_Per_KeyDown, Discount_Per_KeyPress, Discount_Per_LostFocus, Discount_Per_Amount_GotFocus, Discount_Per_Amount_KeyDown, Discount_Per_Amount_LostFocus, Discount_Amount_GotFocus, Discount_Amount_KeyDown, Discount_Amount_KeyPress, Discount_Amount_LostFocus, Print_Journal_Click, Print_Journal_KeyDown, Print1_Click, Print1_KeyDown, Note_Net_Text_KeyDown, Note_Net_Text_LostFocus, Unit_ID_GotFocus, Unit_ID_KeyDown, Unit_Name_GotFocus, Unit_Name_KeyDown, Units_GridView_CellClick, Units_GridView_CellFormatting, Units_GridView_KeyDown, Unit_ID_LostFocus, Unit_Name_LostFocus, Note_Date_ValueChanged, Analysis_ID_GotFocus, Analysis_Name_A_GotFocus, Analysis_Name_A_KeyDown, Analysis_Name_A_LostFocus, Analysis_ID_KeyDown, Analysis_ID_KeyPress, Analysis_ID_LostFocus, Currency_Name_A_KeyDown, Exchang_GotFocus, Exchang_KeyDown, Exchang_KeyPress, Exchang_LostFocus, Analysis_GridView_CellClick, Analysis_GridView_CellFormatting, Sales_Order_GotFocus, Sales_Order_KeyDown, Sales_Order_KeyPress, Sales_Order_LostFocus, Client_ID_GotFocus, Client_Name_A_GotFocus, Client_Name_A_KeyDown, Client_Name_A_KeyPress, Client_Name_A_LostFocus, Client_ID_KeyDown, Client_ID_KeyPress, Client_ID_LostFocus, Issue_No_GotFocus, Issue_No_KeyDown, Issue_No_KeyPress, Issue_No_LostFocus, Debit_Level5_ID_GotFocus, Debit_Level5_Name_A_GotFocus, Debit_Level5_Name_A_KeyDown, Debit_Level5_Name_A_LostFocus, Debit_Level5_ID_KeyDown, Debit_Level5_ID_KeyPress, Debit_Level5_ID_LostFocus, D_Tax_Per_GotFocus, D_Tax_Per_KeyDown, D_Tax_Per_KeyPress, D_Tax_Per_LostFocus, D_Tax_Amount_GotFocus, D_Tax_Amount_KeyDown, D_Tax_Amount_KeyPress, D_Tax_Amount_LostFocus, Vat_Tax_Per_GotFocus, Vat_Tax_Per_KeyDown, Vat_Tax_Per_KeyPress, Vat_Tax_Per_LostFocus, Vat_Tax_Amount_GotFocus, Vat_Tax_Amount_KeyDown, Vat_Tax_Amount_KeyPress, Vat_Tax_Amount_LostFocus, Note_Tax_GotFocus, Note_Tax_KeyDown, Note_Tax_LostFocus, Note_Actual_Total_GotFocus, Note_Actual_Total_KeyDown, Note_Actual_Total_LostFocus, Note_Net_With_Tax_GotFocus, Note_Net_With_Tax_KeyDown, Note_Net_With_Tax_LostFocus, Note_Type_GotFocus, Note_Type_KeyDown, Note_Type_KeyPress, Note_Type_LostFocus, Analysis_GridView_KeyDown, Currency_GridView_CellClick, Currency_GridView_CellFormatting, Currency_GridView_KeyDown, Currency_ID_GotFocus, Currency_ID_KeyDown, Currency_ID_KeyPress, Fill_Items_Grid, Fill_Units_Grid, Fill_SalesMen_Grid, Lock_Control, Enable_Control, Review_Record, Find_Total, OfferPrice_Form_KeyDown, OfferPrice_Form_Load, OfferPrice_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Note_No_GotFocus, Note_No_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Notice_GotFocus, Notice_KeyDown, Notice_KeyPress, Note_Date_KeyDown, Note_Date_Opened, RadGridView1_DoubleClick, RadGridView1_KeyDown, Item_ID_GotFocus, Item_ID_KeyDown, Item_ID_KeyPress, Item_Name_A_GotFocus, Item_Name_A_KeyDown, Items_GridView_CellClick, Items_GridView_CellFormatting, Items_GridView_KeyDown, Actual_Qty_GotFocus, Actual_Qty_KeyDown, Actual_Qty_KeyPress, Actual_Price_GotFocus, Actual_Price_KeyDown, Note_No_KeyPress, Note_No_LostFocus, Notice_LostFocus, Qty_LostFocus, Item_ID_LostFocus, Search_Txt_LostFocus, Inventory_ID_GotFocus, Inventory_ID_KeyDown, Inventory_ID_KeyPress, Inventory_Name_A_GotFocus, Inventory_Name_A_KeyDown, Inventories_GridView_CellClick, Inventories_GridView_CellFormatting, Inventories_GridView_KeyDown, Inventory_ID_LostFocus, Inventory_Name_A_LostFocus, Note_Date_H_GotFocus, Note_Date_H_KeyDown, Note_Date_H_LostFocus, Actual_Net_GotFocus, Actual_Net_KeyDown, Actual_Net_LostFocus, Actual_Price_KeyPress, Actual_Price_LostFocus, Item_Name_A_LostFocus, Note_Actual_Qty_GotFocus, Note_Actual_Qty_KeyDown, Note_Total_GotFocus, Note_Total_KeyDown, Note_Actual_Qty_LostFocus, Note_Total_LostFocus, Note_Net_Text_GotFocus, set_Client_ID, get_Label12, set_Label12, get_Note_Type, set_Note_Type, get_Currency_Name_A, set_Currency_Name_A, get_Exchang, set_Exchang, get_Label17, set_Label17, get_Label27, set_Label27, get_Currency_ID, set_Currency_ID, get_Analysis_Name_A, set_Analysis_Name_A, get_Analysis_ID, set_Analysis_ID, get_Label19, set_Label19, get_Note_Net_With_Tax, set_Note_Net_With_Tax, get_Label16, set_Label16, get_Note_Actual_Total, set_Note_Actual_Total, get_Label25, set_Label25, get_Vat_Tax_Per, set_Vat_Tax_Per, get_Label24, set_Label24, get_Note_Tax, set_Note_Tax, get_Label23, set_Label23, get_D_Tax_Per, set_D_Tax_Per, get_Label22, set_Label22, get_Label20, set_Label20, get_Vat_Tax_Amount, set_Vat_Tax_Amount, get_Label21, set_Label21, get_D_Tax_Amount, set_D_Tax_Amount, get_Debit_Level5_Name_A, set_Debit_Level5_Name_A, get_Debit_Level5_ID, set_Debit_Level5_ID, get_Label30, set_Label30, get_Sales_Order, set_Sales_Order, get_Label31, set_Label31, get_Note_Net_Text, set_Note_Net_Text, get_Analysis_GridView, set_Analysis_GridView, get_Currency_GridView, set_Currency_GridView, get_Level5_GridView, set_Level5_GridView, get_AquaTheme1, set_AquaTheme1, get_Note_Discount_After_Tax, set_Note_Discount_After_Tax, get_Net, set_Net, get_Cost, set_Cost, get_Note_Discount, set_Note_Discount, get_Label34, set_Label34, get_Discount_Amount, set_Discount_Amount, get_Label33, set_Label33, get_Discount_Per, set_Discount_Per, get_Label29, set_Label29, get_Label32, set_Label32, get_Discount_Per_Amount, set_Discount_Per_Amount, get_Note_Net, set_Note_Net, get_Label35, set_Label35, get_Print_Journal, set_Print_Journal, get_Label37, set_Label37, get_Sales_No, set_Sales_No, get_Cost_Net, set_Cost_Net, get_SalesMen_GridView, set_SalesMen_GridView, get_SalesMan_Name_A, set_SalesMan_Name_A, get_SalesMan_ID, set_SalesMan_ID, get_Label36, set_Label36, get_Note_Cost, set_Note_Cost, get_Print1, set_Print1, get_Print, set_Print, Clear_Record, Clear_Data, Fill_Grid, Fill_Level5_Grid, Fill_Analysis_Grid, Fill_Currencies_Grid, Fill_Inventories_Grid, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadPanel4, set_RadPanel4, get_RadGridView1, set_RadGridView1, get_Note_Date, set_Note_Date, get_Items_GridView, set_Items_GridView, get_RadLabel15, set_RadLabel15, get_Label13, set_Label13, get_Label8, set_Label8, get_Label6, set_Label6, get_Note_No, set_Note_No, get_Notice, set_Notice, get_Label4, set_Label4, get_Label9, set_Label9, get_Label10, set_Label10, get_Label11, set_Label11, get_Actual_Qty, set_Actual_Qty, get_Unit_Name, set_Unit_Name, get_Item_Name_A, set_Item_Name_A, get_Item_ID, set_Item_ID, get_Label15, set_Label15, get_Actual_Net, set_Actual_Net, get_Label14, set_Label14, get_Actual_Price, set_Actual_Price, get_Label26, set_Label26, get_Note_Total, set_Note_Total, get_Label28, set_Label28, get_Note_Actual_Qty, set_Note_Actual_Qty, get_Note_Net_With_Tax_Text, set_Note_Net_With_Tax_Text, get_SR, set_SR, get_Inventory_Name_A, set_Inventory_Name_A, get_Label1, set_Label1, get_Inventory_ID, set_Inventory_ID, get_Unit_ID, set_Unit_ID, get_Note_Date_H, set_Note_Date_H, get_Label2, set_Label2, get_Qty, set_Qty, get_Price, set_Price, get_Units_GridView, set_Units_GridView, get_Inventories_GridView, set_Inventories_GridView, get_Label3, set_Label3, get_Unit_Exchang, set_Unit_Exchang, get_Label5, set_Label5, get_Issue_No, set_Issue_No, get_Client_Name_A, set_Client_Name_A, get_Label7, set_Label7, get_Client_ID
```

---

### 3.4 شاشة: فواتير المبيعات التجارية ونقاط البيع (`Sales_Form`)
- **الاسم الإنجليزي:** Sales Invoices & E-Invoicing
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** إصدار فواتير المبيعات، حساب الخصومات والضرائب، الفوترة الإلكترونية، وطرق السداد (نقدي/آجل/شيك)
- **جداول قاعدة البيانات المستهدفة:** `Sales_Head`, `Sales_Details`

#### أ. كتالوج حقول وعناصر التحكم (Field & Control Catalog Table)
| معرف العنصر (Control ID) | التسمية العربية (Label) | نوع عنصر الواجهة | الربط بقاعدة البيانات (DB Binding) | نوع البيانات والقيود (Type & Constraints) | القيمة الافتراضية | المعادلة / السلوك البرمجي |
|---|---|---|---|---|---|---|
| `Windows7Theme1` | **Windows7Theme1** | `Windows7Theme` | - | - | - | - |
| `Save` | **زر حفظ السجل** | `RadButton` | - | - | - | - |
| `Delete` | **زر حذف السجل** | `RadButton` | - | - | - | - |
| `F_Exit` | **F_Exit** | `RadButton` | - | - | - | - |
| `Add` | **زر إضافة جديد** | `RadButton` | - | - | - | - |
| `Modify` | **زر تعديل السجل** | `RadButton` | - | - | - | - |
| `Search_Txt` | **حقل / زر البحث** | `RadTextBox` | - | - | - | - |
| `GridView` | **GridView** | `RadGridView` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Sales_Head.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Sales_Head.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `RadGridView1` | **RadGridView1** | `RadGridView` | - | - | - | - |
| `Note_Date` | **تاريخ الحركة** | `RadDateTimePicker` | `Sales_Head.Note_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Items_GridView` | **Items_GridView** | `RadGridView` | - | - | - | - |
| `RadLabel15` | **RadLabel15** | `RadLabel` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Label8` | **Label8** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Note_No` | **رقم الحركة / السند** | `RadTextBox` | `Sales_Head.Note_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Sales_Head.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Label10` | **Label10** | `Label` | - | - | - | - |
| `Label11` | **Label11** | `Label` | - | - | - | - |
| `Actual_Qty` | **الكمية** | `RadTextBox` | `Sales_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Unit_Name` | **الوحدة** | `RadTextBox` | - | - | - | - |
| `Item_Name_A` | **اسم الصنف** | `RadTextBox` | - | - | - | - |
| `Item_ID` | **كود الصنف** | `RadTextBox` | `Sales_Details.Item_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label15` | **Label15** | `Label` | - | - | - | - |
| `Actual_Net` | **الصافي المستحق** | `RadTextBox` | `Sales_Details.Actual_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Actual_Price` | **السعر الفردي** | `RadTextBox` | `Sales_Details.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Label26` | **Label26** | `Label` | - | - | - | - |
| `Note_Total` | **الإجمالي** | `RadTextBox` | `Sales_Head.Note_Total` | `float` (NOT NULL) | `((0))` | `Total = SUM(Details.Net)` |
| `Label28` | **Label28** | `Label` | - | - | - | - |
| `Note_Actual_Qty` | **الكمية** | `RadTextBox` | `Sales_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Note_Net_With_Tax_Text` | **ضريبة القيمة المضافة** | `RadTextBox` | - | - | - | `Net = Total - Discount + Tax` |
| `SR` | **SR** | `RadTextBox` | `Sales_Details.SR` | `int` (PRIMARY KEY, NOT NULL) | - | - |
| `Inventory_Name_A` | **Inventory_Name_A** | `RadTextBox` | - | - | - | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Inventory_ID` | **كود المخزن** | `RadTextBox` | `Sales_Head.Inventory_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Unit_ID` | **الوحدة** | `RadTextBox` | `Sales_Details.Unit_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `Note_Date_H` | **تاريخ الحركة** | `RadTextBox` | `Sales_Head.Note_Date_H` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Qty` | **الكمية** | `RadTextBox` | `Sales_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Price` | **السعر الفردي** | `RadTextBox` | `Sales_Details.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Units_GridView` | **Units_GridView** | `RadGridView` | - | - | - | - |
| `Inventories_GridView` | **Inventories_GridView** | `RadGridView` | - | - | - | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Unit_Exchang` | **Unit_Exchang** | `RadTextBox` | `Sales_Head.Exchang` | `float` (NOT NULL) | `((1))` | - |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Issue_No` | **Issue_No** | `RadTextBox` | `Sales_Head.Issue_No` | `nvarchar(50)` (NOT NULL) | `('-')` | - |
| `Client_Name_A` | **اسم العميل** | `RadTextBox` | - | - | - | - |
| `Label7` | **Label7** | `Label` | - | - | - | - |
| `Client_ID` | **كود العميل** | `RadTextBox` | `Sales_Head.Client_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label12` | **Label12** | `Label` | - | - | - | - |
| `Note_Type` | **Note_Type** | `RadDropDownList` | `Sales_Head.Note_Type` | `smallint` (NOT NULL) | `((0))` | - |
| `Currency_Name_A` | **اسم العملة** | `RadTextBox` | - | - | - | - |
| `Exchang` | **Exchang** | `RadTextBox` | `Sales_Head.Exchang` | `float` (NOT NULL) | `((1))` | - |
| `Label17` | **Label17** | `Label` | - | - | - | - |
| `Label27` | **Label27** | `Label` | - | - | - | - |
| `Currency_ID` | **كود العملة** | `RadTextBox` | `Sales_Head.Currency_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `Analysis_Name_A` | **اسم الحساب التحليلي** | `RadTextBox` | - | - | - | - |
| `Analysis_ID` | **كود الحساب التحليلي** | `RadTextBox` | `Sales_Head.Analysis_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label19` | **Label19** | `Label` | - | - | - | - |
| `Note_Net_With_Tax` | **ضريبة القيمة المضافة** | `RadTextBox` | `Sales_Head.Note_Net_With_Tax` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label16` | **Label16** | `Label` | - | - | - | - |
| `Note_Actual_Total` | **الإجمالي** | `RadTextBox` | `Sales_Head.Note_Actual_Total` | `float` (NOT NULL) | `((0))` | `Total = SUM(Details.Net)` |
| `Label25` | **Label25** | `Label` | - | - | - | - |
| `Vat_Tax_Per` | **ضريبة القيمة المضافة** | `RadTextBox` | `Sales_Head.Vat_Tax_Per` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label24` | **Label24** | `Label` | - | - | - | - |
| `Note_Tax` | **ضريبة القيمة المضافة** | `RadTextBox` | `Sales_Head.Note_Tax` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label23` | **Label23** | `Label` | - | - | - | - |
| `D_Tax_Per` | **ضريبة القيمة المضافة** | `RadTextBox` | `Sales_Head.D_Tax_Per` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label22` | **Label22** | `Label` | - | - | - | - |
| `Label20` | **Label20** | `Label` | - | - | - | - |
| `Vat_Tax_Amount` | **ضريبة القيمة المضافة** | `RadTextBox` | `Sales_Head.Vat_Tax_Amount` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label21` | **Label21** | `Label` | - | - | - | - |
| `D_Tax_Amount` | **ضريبة القيمة المضافة** | `RadTextBox` | `Sales_Head.D_Tax_Amount` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Debit_Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Debit_Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Sales_Head.Debit_Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label30` | **Label30** | `Label` | - | - | - | - |
| `Sales_Order` | **Sales_Order** | `RadTextBox` | `Sales_Head.Sales_Order` | `nvarchar(50)` (NOT NULL) | `('-')` | - |
| `Label31` | **Label31** | `Label` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `TextBox` | `Sales_Head.Note_Net_Text` | `nvarchar(250)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `Analysis_GridView` | **Analysis_GridView** | `RadGridView` | - | - | - | - |
| `Currency_GridView` | **Currency_GridView** | `RadGridView` | - | - | - | - |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `Note_Discount_After_Tax` | **الخصم** | `RadTextBox` | `Sales_Head.Note_Discount_After_Tax` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Net` | **الصافي المستحق** | `RadTextBox` | `Sales_Head.Note_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Cost` | **Cost** | `RadTextBox` | `Sales_Details.Cost` | `float` (NOT NULL) | `((0))` | - |
| `Note_Discount` | **الخصم** | `RadTextBox` | `Sales_Head.Note_Discount` | `float` (NOT NULL) | `((0))` | - |
| `Label34` | **Label34** | `Label` | - | - | - | - |
| `Discount_Amount` | **الخصم** | `RadTextBox` | `Sales_Head.Discount_Amount` | `float` (NOT NULL) | `((0))` | - |
| `Label33` | **Label33** | `Label` | - | - | - | - |
| `Discount_Per` | **الخصم** | `RadTextBox` | `Sales_Head.Discount_Per` | `float` (NOT NULL) | `((0))` | - |
| `Label29` | **Label29** | `Label` | - | - | - | - |
| `Label32` | **Label32** | `Label` | - | - | - | - |
| `Discount_Per_Amount` | **الخصم** | `RadTextBox` | `Sales_Head.Discount_Per_Amount` | `float` (NOT NULL) | `((0))` | - |
| `Note_Net` | **الصافي المستحق** | `RadTextBox` | `Sales_Head.Note_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label35` | **Label35** | `Label` | - | - | - | - |
| `Print_Journal` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Label37` | **Label37** | `Label` | - | - | - | - |
| `Journal_No` | **Journal_No** | `RadTextBox` | `Sales_Head.Journal_No` | `int` (NOT NULL) | `((0))` | - |
| `Cost_Net` | **الصافي المستحق** | `RadTextBox` | `Sales_Details.Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `SalesMen_GridView` | **SalesMen_GridView** | `RadGridView` | - | - | - | - |
| `SalesMan_Name_A` | **اسم المندوب** | `RadTextBox` | - | - | - | - |
| `SalesMan_ID` | **كود المندوب** | `RadTextBox` | `Sales_Head.SalesMan_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label36` | **Label36** | `Label` | - | - | - | - |
| `Note_Cost` | **Note_Cost** | `TextBox` | `Sales_Details.Cost` | `float` (NOT NULL) | `((0))` | - |
| `Print1` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Print` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Previous_Balance0` | **الرصيد / الفارق** | `RadTextBox` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Label18` | **Label18** | `Label` | - | - | - | - |
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
| `Cmd002` | **Cmd002** | `SqlCommand` | - | - | - | - |
| `Cmd03` | **Cmd03** | `SqlCommand` | - | - | - | - |
| `Cmd003` | **Cmd003** | `SqlCommand` | - | - | - | - |
| `Cmd04` | **Cmd04** | `SqlCommand` | - | - | - | - |
| `Cmd05` | **Cmd05** | `SqlCommand` | - | - | - | - |
| `Cmd06` | **Cmd06** | `SqlCommand` | - | - | - | - |
| `Cmd07` | **Cmd07** | `SqlCommand` | - | - | - | - |
| `Cmd08` | **Cmd08** | `SqlCommand` | - | - | - | - |
| `Cmd09` | **Cmd09** | `SqlCommand` | - | - | - | - |
| `Cmd2` | **Cmd2** | `SqlCommand` | - | - | - | - |
| `Cmd3` | **Cmd3** | `SqlCommand` | - | - | - | - |
| `Cmd4` | **Cmd4** | `SqlCommand` | - | - | - | - |
| `Cmd5` | **Cmd5** | `SqlCommand` | - | - | - | - |
| `Cmd6` | **Cmd6** | `SqlCommand` | - | - | - | - |
| `Cmd7` | **Cmd7** | `SqlCommand` | - | - | - | - |
| `Cmd8` | **Cmd8** | `SqlCommand` | - | - | - | - |
| `Cmd9` | **Cmd9** | `SqlCommand` | - | - | - | - |
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد الفاتـورة المطلوبة  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم العُملـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المخزن 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم العميــل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم القيد المحاسـبي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إضافة سجل جديد أثناء عملية التعديل. لأضافة سجل يجب الضغط على الغاء التعديل ثم الضغط على سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إجراء تعديل أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: في حالة الإضافة يجب الضغط على سجل جديد وفي حالة التعديل يجب الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السند غير موجود ويجب حفظه أولاً  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء إضافة سجل جديد. للحذف يجب الضغط على الغاء الإضافة ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء تعديل سجل . للحذف يجب الضغط على الغاء التعديل ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد السجل المراد حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد الفاتـورة المطلوبة  
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال وحدة الصرف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الكميـة 
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
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
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
Select * FROM Clients Where Client_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select Sum(Debit)-Sum(Credit) AS Client_Balance FROM TransMaster_Union Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Clients Where Client_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Clients Where Client_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select Sum(Debit)-Sum(Credit) AS Client_Balance FROM TransMaster_Union Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Clients Where Client_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM SalesMen Where SalesMan_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
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
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select Sum(Debit)-Sum(Credit) AS Client_Balance FROM TransMaster_Union Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Clients Where Client_ID=
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
Select * From Users Where User_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Branches
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Sales_Settings Where ID=
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
Select * FROM SalesMen Order By SalesMan_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM Sales_Head Order By Note_No Desc
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM Sales_Journals_Head Order By Note_No Desc
```
##### استعلام INSERT على جدول `Sales_Head`:
```sql
Insert Into Sales_Head(Note_No,Note_Date,Note_Date_H,Note_Type,Currency_ID,Exchang,Inventory_ID,Client_ID,Cash_Client_Name,Previous_Balance,Issue_No,Sales_Order,Analysis_ID,SalesMan_ID,Discount_Per,Discount_Per_Amount,Discount_Amount,Note_Discount,D_Tax_Per,D_Tax_Amount,Vat_Tax_Per,Vat_Tax_Amount,Note_Tax,Note_Discount_After_Tax,Note_Actual_Qty,Note_Actual_Total,Note_Total,Note_Net,Note_Net_With_Tax,Note_Net_Text,Journal_No,Debit_Level5_ID,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Sales_Details`:
```sql
Insert Into Sales_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Cost,Cost_Net,Actual_Net,Net)Values(
```
##### استعلام INSERT على جدول `Sales_Head`:
```sql
Insert Into Sales_Journals_Head(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Sales_Head`:
```sql
Insert Into Sales_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Costcenter_ID,Analyse1)Values(
```
##### استعلام INSERT على جدول `Sales_Head`:
```sql
Insert Into Sales_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Sales_Head`:
```sql
Insert Into Sales_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام INSERT على جدول `Sales_Head`:
```sql
Insert Into Sales_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Analysis_ID)Values(
```
##### استعلام INSERT على جدول `Sales_Head`:
```sql
Insert Into Sales_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Sales_Head`:
```sql
Insert Into Sales_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Sales_Head Where Note_No=
```
##### استعلام UPDATE على جدول `Sales_Head`:
```sql
Update Sales_Head Set Note_No=
```
##### استعلام DELETE على جدول `Sales_Details`:
```sql
Delete From Sales_Details Where Note_No=
```
##### استعلام INSERT على جدول `Sales_Details`:
```sql
Insert Into Sales_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Cost,Cost_Net,Actual_Net,Net)Values(
```
##### استعلام DELETE على جدول `Sales_Head`:
```sql
Delete From Sales_Journals_Head Where Note_No=
```
##### استعلام DELETE على جدول `Sales_Head`:
```sql
Delete From Sales_Journals_Details Where Note_No=
```
##### استعلام INSERT على جدول `Sales_Head`:
```sql
Insert Into Sales_Journals_Head(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Sales_Head`:
```sql
Insert Into Sales_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Costcenter_ID,Analyse1)Values(
```
##### استعلام INSERT على جدول `Sales_Head`:
```sql
Insert Into Sales_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Sales_Head`:
```sql
Insert Into Sales_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام INSERT على جدول `Sales_Head`:
```sql
Insert Into Sales_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Analysis_ID)Values(
```
##### استعلام INSERT على جدول `Sales_Head`:
```sql
Insert Into Sales_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Sales_Head`:
```sql
Insert Into Sales_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام DELETE على جدول `Sales_Head`:
```sql
Delete From Sales_Head where Note_No=
```
##### استعلام DELETE على جدول `Sales_Details`:
```sql
Delete From Sales_Details where Note_No=
```
##### استعلام DELETE على جدول `Sales_Head`:
```sql
Delete From Sales_Journals_Head Where Note_No=
```
##### استعلام DELETE على جدول `Sales_Head`:
```sql
Delete From Sales_Journals_Details Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Sales_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Sales_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Sales_Head_View Where Search_Field Like '%
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
Select * FROM Accounts_Analysis_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Currencies Where Currency_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM SalesMen Where SalesMan_Name_A Like '%
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
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Balance_For_Search Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Sales_Head_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Sales_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Balance_For_Search Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Sales_Head_View Order By Note_No DESC
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Currency_ID_GotFocus, Currency_ID_KeyDown, Currency_ID_KeyPress, Currency_Name_A_GotFocus, Currency_Name_A_LostFocus, Currency_ID_LostFocus, Note_Type_SelectedIndexChanged, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, Note_Discount_After_Tax_GotFocus, Note_Discount_After_Tax_KeyDown, Note_Discount_After_Tax_KeyPress, Note_Discount_After_Tax_LostFocus, SalesMan_ID_GotFocus, SalesMan_Name_A_GotFocus, SalesMan_Name_A_KeyDown, SalesMan_Name_A_LostFocus, SalesMan_ID_KeyDown, SalesMan_ID_KeyPress, SalesMan_ID_LostFocus, SalesMen_GridView_CellClick, SalesMen_GridView_CellFormatting, SalesMen_GridView_KeyDown, Discount_Per_GotFocus, Discount_Per_KeyDown, Discount_Per_KeyPress, Discount_Per_LostFocus, Discount_Per_Amount_GotFocus, Discount_Per_Amount_KeyDown, Discount_Per_Amount_LostFocus, Discount_Amount_GotFocus, Discount_Amount_KeyDown, Discount_Amount_KeyPress, Discount_Amount_LostFocus, Print_Journal_Click, Print_Journal_KeyDown, Print1_Click, Print1_KeyDown, Note_Actual_Qty_LostFocus, Note_Total_LostFocus, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, Note_Net_Text_LostFocus, Unit_ID_GotFocus, Unit_ID_KeyDown, Unit_Name_GotFocus, Unit_Name_KeyDown, Units_GridView_CellClick, Units_GridView_CellFormatting, Units_GridView_KeyDown, Unit_ID_LostFocus, Unit_Name_LostFocus, Note_Date_ValueChanged, Analysis_ID_GotFocus, Analysis_Name_A_GotFocus, Analysis_Name_A_KeyDown, Analysis_Name_A_LostFocus, Analysis_ID_KeyDown, Analysis_ID_KeyPress, Analysis_ID_LostFocus, Currency_Name_A_KeyDown, Exchang_GotFocus, Exchang_KeyDown, Exchang_KeyPress, Exchang_LostFocus, Analysis_GridView_CellClick, Analysis_GridView_CellFormatting, Sales_Order_GotFocus, Sales_Order_KeyDown, Sales_Order_KeyPress, Sales_Order_LostFocus, Client_ID_GotFocus, Client_Name_A_GotFocus, Client_Name_A_KeyDown, Client_Name_A_KeyPress, Client_Name_A_LostFocus, Client_ID_KeyDown, Client_ID_KeyPress, Client_ID_LostFocus, Issue_No_GotFocus, Issue_No_KeyDown, Issue_No_KeyPress, Issue_No_LostFocus, Debit_Level5_ID_GotFocus, Debit_Level5_Name_A_GotFocus, Debit_Level5_Name_A_KeyDown, Debit_Level5_Name_A_LostFocus, Debit_Level5_ID_KeyDown, Debit_Level5_ID_KeyPress, Debit_Level5_ID_LostFocus, D_Tax_Per_GotFocus, D_Tax_Per_KeyDown, D_Tax_Per_KeyPress, D_Tax_Per_LostFocus, D_Tax_Amount_GotFocus, D_Tax_Amount_KeyDown, D_Tax_Amount_KeyPress, D_Tax_Amount_LostFocus, Vat_Tax_Per_GotFocus, Vat_Tax_Per_KeyDown, Vat_Tax_Per_KeyPress, Vat_Tax_Per_LostFocus, Vat_Tax_Amount_GotFocus, Vat_Tax_Amount_KeyDown, Vat_Tax_Amount_KeyPress, Vat_Tax_Amount_LostFocus, Note_Tax_GotFocus, Note_Tax_KeyDown, Note_Tax_LostFocus, Note_Actual_Total_GotFocus, Note_Actual_Total_KeyDown, Note_Actual_Total_LostFocus, Note_Net_With_Tax_GotFocus, Note_Net_With_Tax_KeyDown, Note_Net_With_Tax_LostFocus, Note_Type_GotFocus, Note_Type_KeyDown, Note_Type_KeyPress, Note_Type_LostFocus, Analysis_GridView_KeyDown, Currency_GridView_CellClick, Currency_GridView_CellFormatting, Currency_GridView_KeyDown, Fill_Analysis_Grid, Fill_Currencies_Grid, Fill_Inventories_Grid, Fill_Items_Grid, Fill_Units_Grid, Fill_SalesMen_Grid, Lock_Control, Enable_Control, Review_Record, Find_Total, Sales_Form_KeyDown, Sales_Form_Load, Sales_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Note_No_GotFocus, Note_No_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Notice_GotFocus, Notice_KeyDown, Notice_KeyPress, Note_Date_KeyDown, Note_Date_Opened, RadGridView1_DoubleClick, RadGridView1_KeyDown, Item_ID_GotFocus, Item_ID_KeyDown, Item_ID_KeyPress, Item_Name_A_GotFocus, Item_Name_A_KeyDown, Items_GridView_CellClick, Items_GridView_CellFormatting, Items_GridView_KeyDown, Actual_Qty_GotFocus, Actual_Qty_KeyDown, Actual_Qty_KeyPress, Actual_Price_GotFocus, Actual_Price_KeyDown, Note_No_KeyPress, Note_No_LostFocus, Notice_LostFocus, Qty_LostFocus, Item_ID_LostFocus, Search_Txt_LostFocus, Inventory_ID_GotFocus, Inventory_ID_KeyDown, Inventory_ID_KeyPress, Inventory_Name_A_GotFocus, Inventory_Name_A_KeyDown, Inventories_GridView_CellClick, Inventories_GridView_CellFormatting, Inventories_GridView_KeyDown, Inventory_ID_LostFocus, Inventory_Name_A_LostFocus, Note_Date_H_GotFocus, Note_Date_H_KeyDown, Note_Date_H_LostFocus, Actual_Net_GotFocus, Actual_Net_KeyDown, Actual_Net_LostFocus, Actual_Price_KeyPress, Actual_Price_LostFocus, Item_Name_A_LostFocus, Note_Actual_Qty_GotFocus, Note_Actual_Qty_KeyDown, Note_Total_GotFocus, Note_Total_KeyDown, set_Client_ID, get_Label12, set_Label12, get_Note_Type, set_Note_Type, get_Currency_Name_A, set_Currency_Name_A, get_Exchang, set_Exchang, get_Label17, set_Label17, get_Label27, set_Label27, get_Currency_ID, set_Currency_ID, get_Analysis_Name_A, set_Analysis_Name_A, get_Analysis_ID, set_Analysis_ID, get_Label19, set_Label19, get_Note_Net_With_Tax, set_Note_Net_With_Tax, get_Label16, set_Label16, get_Note_Actual_Total, set_Note_Actual_Total, get_Label25, set_Label25, get_Vat_Tax_Per, set_Vat_Tax_Per, get_Label24, set_Label24, get_Note_Tax, set_Note_Tax, get_Label23, set_Label23, get_D_Tax_Per, set_D_Tax_Per, get_Label22, set_Label22, get_Label20, set_Label20, get_Vat_Tax_Amount, set_Vat_Tax_Amount, get_Label21, set_Label21, get_D_Tax_Amount, set_D_Tax_Amount, get_Debit_Level5_Name_A, set_Debit_Level5_Name_A, get_Debit_Level5_ID, set_Debit_Level5_ID, get_Label30, set_Label30, get_Sales_Order, set_Sales_Order, get_Label31, set_Label31, get_Note_Net_Text, set_Note_Net_Text, get_Analysis_GridView, set_Analysis_GridView, get_Currency_GridView, set_Currency_GridView, get_Level5_GridView, set_Level5_GridView, get_AquaTheme1, set_AquaTheme1, get_Note_Discount_After_Tax, set_Note_Discount_After_Tax, get_Net, set_Net, get_Cost, set_Cost, get_Note_Discount, set_Note_Discount, get_Label34, set_Label34, get_Discount_Amount, set_Discount_Amount, get_Label33, set_Label33, get_Discount_Per, set_Discount_Per, get_Label29, set_Label29, get_Label32, set_Label32, get_Discount_Per_Amount, set_Discount_Per_Amount, get_Note_Net, set_Note_Net, get_Label35, set_Label35, get_Print_Journal, set_Print_Journal, get_Label37, set_Label37, get_Journal_No, set_Journal_No, get_Cost_Net, set_Cost_Net, get_SalesMen_GridView, set_SalesMen_GridView, get_SalesMan_Name_A, set_SalesMan_Name_A, get_SalesMan_ID, set_SalesMan_ID, get_Label36, set_Label36, get_Note_Cost, set_Note_Cost, get_Print1, set_Print1, get_Print, set_Print, get_Previous_Balance0, set_Previous_Balance0, get_Label18, set_Label18, Clear_Record, Clear_Data, Fill_Grid, Fill_Level5_Grid, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadPanel4, set_RadPanel4, get_RadGridView1, set_RadGridView1, get_Note_Date, set_Note_Date, get_Items_GridView, set_Items_GridView, get_RadLabel15, set_RadLabel15, get_Label13, set_Label13, get_Label8, set_Label8, get_Label6, set_Label6, get_Note_No, set_Note_No, get_Notice, set_Notice, get_Label4, set_Label4, get_Label9, set_Label9, get_Label10, set_Label10, get_Label11, set_Label11, get_Actual_Qty, set_Actual_Qty, get_Unit_Name, set_Unit_Name, get_Item_Name_A, set_Item_Name_A, get_Item_ID, set_Item_ID, get_Label15, set_Label15, get_Actual_Net, set_Actual_Net, get_Label14, set_Label14, get_Actual_Price, set_Actual_Price, get_Label26, set_Label26, get_Note_Total, set_Note_Total, get_Label28, set_Label28, get_Note_Actual_Qty, set_Note_Actual_Qty, get_Note_Net_With_Tax_Text, set_Note_Net_With_Tax_Text, get_SR, set_SR, get_Inventory_Name_A, set_Inventory_Name_A, get_Label1, set_Label1, get_Inventory_ID, set_Inventory_ID, get_Unit_ID, set_Unit_ID, get_Note_Date_H, set_Note_Date_H, get_Label2, set_Label2, get_Qty, set_Qty, get_Price, set_Price, get_Units_GridView, set_Units_GridView, get_Inventories_GridView, set_Inventories_GridView, get_Label3, set_Label3, get_Unit_Exchang, set_Unit_Exchang, get_Label5, set_Label5, get_Issue_No, set_Issue_No, get_Client_Name_A, set_Client_Name_A, get_Label7, set_Label7, get_Client_ID
```

---

### 3.5 شاشة: فاتورة مبيعات نمط (2) - مبيعات الجملة (`Sales_Form1`)
- **الاسم الإنجليزي:** Sales Invoices Pattern 2 (Wholesale)
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** إصدار فواتير مبيعات الجملة والتوزيع مع تحديد الأسعار الخاصة وحسابات التكلفة
- **جداول قاعدة البيانات المستهدفة:** `Sales_Head1`, `Sales_Details1`

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
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Sales_Head1.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Sales_Head1.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `RadGridView1` | **RadGridView1** | `RadGridView` | - | - | - | - |
| `Note_Date` | **تاريخ الحركة** | `RadDateTimePicker` | `Sales_Head1.Note_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Items_GridView` | **Items_GridView** | `RadGridView` | - | - | - | - |
| `RadLabel15` | **RadLabel15** | `RadLabel` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Label8` | **Label8** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Note_No` | **رقم الحركة / السند** | `RadTextBox` | `Sales_Head1.Note_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Sales_Head1.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Label10` | **Label10** | `Label` | - | - | - | - |
| `Label11` | **Label11** | `Label` | - | - | - | - |
| `Actual_Qty` | **الكمية** | `RadTextBox` | `Sales_Head1.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Unit_Name` | **الوحدة** | `RadTextBox` | - | - | - | - |
| `Item_Name_A` | **اسم الصنف** | `RadTextBox` | - | - | - | - |
| `Item_ID` | **كود الصنف** | `RadTextBox` | `Sales_Details1.Item_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label15` | **Label15** | `Label` | - | - | - | - |
| `Actual_Net` | **الصافي المستحق** | `RadTextBox` | `Sales_Details1.Actual_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Actual_Price` | **السعر الفردي** | `RadTextBox` | `Sales_Details1.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Label26` | **Label26** | `Label` | - | - | - | - |
| `Note_Total` | **الإجمالي** | `RadTextBox` | `Sales_Head1.Note_Total` | `float` (NOT NULL) | `((0))` | `Total = SUM(Details.Net)` |
| `Label28` | **Label28** | `Label` | - | - | - | - |
| `Note_Actual_Qty` | **الكمية** | `RadTextBox` | `Sales_Head1.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Note_Net_With_Tax_Text` | **ضريبة القيمة المضافة** | `RadTextBox` | - | - | - | `Net = Total - Discount + Tax` |
| `SR` | **SR** | `RadTextBox` | `Sales_Details1.SR` | `int` (PRIMARY KEY, NOT NULL) | - | - |
| `Inventory_Name_A` | **Inventory_Name_A** | `RadTextBox` | - | - | - | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Inventory_ID` | **كود المخزن** | `RadTextBox` | `Sales_Head1.Inventory_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Unit_ID` | **الوحدة** | `RadTextBox` | `Sales_Details1.Unit_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `Note_Date_H` | **تاريخ الحركة** | `RadTextBox` | `Sales_Head1.Note_Date_H` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Qty` | **الكمية** | `RadTextBox` | `Sales_Head1.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Price` | **السعر الفردي** | `RadTextBox` | `Sales_Details1.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Units_GridView` | **Units_GridView** | `RadGridView` | - | - | - | - |
| `Inventories_GridView` | **Inventories_GridView** | `RadGridView` | - | - | - | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Unit_Exchang` | **Unit_Exchang** | `RadTextBox` | `Sales_Head1.Exchang` | `float` (NOT NULL) | `((1))` | - |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Issue_No` | **Issue_No** | `RadTextBox` | `Sales_Head1.Issue_No` | `nvarchar(50)` (NOT NULL) | `('-')` | - |
| `Client_Name_A` | **اسم العميل** | `RadTextBox` | - | - | - | - |
| `Label7` | **Label7** | `Label` | - | - | - | - |
| `Client_ID` | **كود العميل** | `RadTextBox` | `Sales_Head1.Client_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label12` | **Label12** | `Label` | - | - | - | - |
| `Note_Type` | **Note_Type** | `RadDropDownList` | `Sales_Head1.Note_Type` | `smallint` (NOT NULL) | `((0))` | - |
| `Currency_Name_A` | **اسم العملة** | `RadTextBox` | - | - | - | - |
| `Exchang` | **Exchang** | `RadTextBox` | `Sales_Head1.Exchang` | `float` (NOT NULL) | `((1))` | - |
| `Label17` | **Label17** | `Label` | - | - | - | - |
| `Label27` | **Label27** | `Label` | - | - | - | - |
| `Currency_ID` | **كود العملة** | `RadTextBox` | `Sales_Head1.Currency_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `Analysis_Name_A` | **اسم الحساب التحليلي** | `RadTextBox` | - | - | - | - |
| `Analysis_ID` | **كود الحساب التحليلي** | `RadTextBox` | `Sales_Head1.Analysis_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label19` | **Label19** | `Label` | - | - | - | - |
| `Note_Net_With_Tax` | **ضريبة القيمة المضافة** | `RadTextBox` | `Sales_Head1.Note_Net_With_Tax` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label16` | **Label16** | `Label` | - | - | - | - |
| `Note_Actual_Total` | **الإجمالي** | `RadTextBox` | `Sales_Head1.Note_Actual_Total` | `float` (NOT NULL) | `((0))` | `Total = SUM(Details.Net)` |
| `Label25` | **Label25** | `Label` | - | - | - | - |
| `Vat_Tax_Per` | **ضريبة القيمة المضافة** | `RadTextBox` | `Sales_Head1.Vat_Tax_Per` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label24` | **Label24** | `Label` | - | - | - | - |
| `Note_Tax` | **ضريبة القيمة المضافة** | `RadTextBox` | `Sales_Head1.Note_Tax` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label23` | **Label23** | `Label` | - | - | - | - |
| `D_Tax_Per` | **ضريبة القيمة المضافة** | `RadTextBox` | `Sales_Head1.D_Tax_Per` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label22` | **Label22** | `Label` | - | - | - | - |
| `Label20` | **Label20** | `Label` | - | - | - | - |
| `Vat_Tax_Amount` | **ضريبة القيمة المضافة** | `RadTextBox` | `Sales_Head1.Vat_Tax_Amount` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label21` | **Label21** | `Label` | - | - | - | - |
| `D_Tax_Amount` | **ضريبة القيمة المضافة** | `RadTextBox` | `Sales_Head1.D_Tax_Amount` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Debit_Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Debit_Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Sales_Head1.Debit_Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label30` | **Label30** | `Label` | - | - | - | - |
| `Sales_Order` | **Sales_Order** | `RadTextBox` | `Sales_Head1.Sales_Order` | `nvarchar(50)` (NOT NULL) | `('-')` | - |
| `Label31` | **Label31** | `Label` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `TextBox` | `Sales_Head1.Note_Net_Text` | `nvarchar(250)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `Analysis_GridView` | **Analysis_GridView** | `RadGridView` | - | - | - | - |
| `Currency_GridView` | **Currency_GridView** | `RadGridView` | - | - | - | - |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `Note_Discount_After_Tax` | **الخصم** | `RadTextBox` | `Sales_Head1.Note_Discount_After_Tax` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Net` | **الصافي المستحق** | `RadTextBox` | `Sales_Head1.Note_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Cost` | **Cost** | `RadTextBox` | `Sales_Details1.Cost` | `float` (NOT NULL) | `((0))` | - |
| `Note_Discount` | **الخصم** | `RadTextBox` | `Sales_Head1.Note_Discount` | `float` (NOT NULL) | `((0))` | - |
| `Label34` | **Label34** | `Label` | - | - | - | - |
| `Discount_Amount` | **الخصم** | `RadTextBox` | `Sales_Head1.Discount_Amount` | `float` (NOT NULL) | `((0))` | - |
| `Label33` | **Label33** | `Label` | - | - | - | - |
| `Discount_Per` | **الخصم** | `RadTextBox` | `Sales_Head1.Discount_Per` | `float` (NOT NULL) | `((0))` | - |
| `Label29` | **Label29** | `Label` | - | - | - | - |
| `Label32` | **Label32** | `Label` | - | - | - | - |
| `Discount_Per_Amount` | **الخصم** | `RadTextBox` | `Sales_Head1.Discount_Per_Amount` | `float` (NOT NULL) | `((0))` | - |
| `Note_Net` | **الصافي المستحق** | `RadTextBox` | `Sales_Head1.Note_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label35` | **Label35** | `Label` | - | - | - | - |
| `Print_Journal` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Label37` | **Label37** | `Label` | - | - | - | - |
| `Journal_No` | **Journal_No** | `RadTextBox` | `Sales_Head1.Journal_No` | `int` (NOT NULL) | `((0))` | - |
| `Cost_Net` | **الصافي المستحق** | `RadTextBox` | `Sales_Details1.Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `SalesMen_GridView` | **SalesMen_GridView** | `RadGridView` | - | - | - | - |
| `SalesMan_Name_A` | **اسم المندوب** | `RadTextBox` | - | - | - | - |
| `SalesMan_ID` | **كود المندوب** | `RadTextBox` | `Sales_Head1.SalesMan_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label36` | **Label36** | `Label` | - | - | - | - |
| `Note_Cost` | **Note_Cost** | `TextBox` | `Sales_Details1.Cost` | `float` (NOT NULL) | `((0))` | - |
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
| `Cmd002` | **Cmd002** | `SqlCommand` | - | - | - | - |
| `Cmd03` | **Cmd03** | `SqlCommand` | - | - | - | - |
| `Cmd003` | **Cmd003** | `SqlCommand` | - | - | - | - |
| `Cmd04` | **Cmd04** | `SqlCommand` | - | - | - | - |
| `Cmd05` | **Cmd05** | `SqlCommand` | - | - | - | - |
| `Cmd06` | **Cmd06** | `SqlCommand` | - | - | - | - |
| `Cmd07` | **Cmd07** | `SqlCommand` | - | - | - | - |
| `Cmd08` | **Cmd08** | `SqlCommand` | - | - | - | - |
| `Cmd09` | **Cmd09** | `SqlCommand` | - | - | - | - |
| `Cmd2` | **Cmd2** | `SqlCommand` | - | - | - | - |
| `Cmd3` | **Cmd3** | `SqlCommand` | - | - | - | - |
| `Cmd4` | **Cmd4** | `SqlCommand` | - | - | - | - |
| `Cmd5` | **Cmd5** | `SqlCommand` | - | - | - | - |
| `Cmd6` | **Cmd6** | `SqlCommand` | - | - | - | - |
| `Cmd7` | **Cmd7** | `SqlCommand` | - | - | - | - |
| `Cmd8` | **Cmd8** | `SqlCommand` | - | - | - | - |
| `Cmd9` | **Cmd9** | `SqlCommand` | - | - | - | - |
| `Balance_Cmd` | **الرصيد / الفارق** | `SqlCommand` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Dt` | **Dt** | `DataTable` | - | - | - | - |
| `Dt_D` | **Dt_D** | `DataTable` | - | - | - | - |
| `Setting_Dt` | **Setting_Dt** | `DataTable` | - | - | - | - |
| `Link_Dt` | **Link_Dt** | `DataTable` | - | - | - | - |

#### ب. قواعد التحقق والمعادلات الحسابية (Validation & Business Rules)
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيـد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم العُملـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المخزن 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم العميــل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم القيد المحاسـبي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إضافة سجل جديد أثناء عملية التعديل. لأضافة سجل يجب الضغط على الغاء التعديل ثم الضغط على سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إجراء تعديل أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: في حالة الإضافة يجب الضغط على سجل جديد وفي حالة التعديل يجب الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السند غير موجود ويجب حفظه أولاً  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء إضافة سجل جديد. للحذف يجب الضغط على الغاء الإضافة ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء تعديل سجل . للحذف يجب الضغط على الغاء التعديل ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد السجل المراد حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد الفاتـورة المطلوبة  
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال وحدة الصرف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الكميـة 
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
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Clients Where Client_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Clients Where Client_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM SalesMen Where SalesMan_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
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
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Clients Where Client_ID=
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
Select * From Sales_Settings1 Where ID=
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
Select * FROM SalesMen Order By SalesMan_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM Sales_Head1 Order By Note_No Desc
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM Sales_Journals_Head1 Order By Note_No Desc
```
##### استعلام INSERT على جدول `Sales_Head1`:
```sql
Insert Into Sales_Head1(Note_No,Note_Date,Note_Date_H,Note_Type,Currency_ID,Exchang,Inventory_ID,Client_ID,Cash_Client_Name,Issue_No,Sales_Order,Analysis_ID,SalesMan_ID,Discount_Per,Discount_Per_Amount,Discount_Amount,Note_Discount,D_Tax_Per,D_Tax_Amount,Vat_Tax_Per,Vat_Tax_Amount,Note_Tax,Note_Discount_After_Tax,Note_Actual_Qty,Note_Actual_Total,Note_Total,Note_Net,Note_Net_With_Tax,Note_Net_Text,Journal_No,Debit_Level5_ID,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Sales_Details1`:
```sql
Insert Into Sales_Details1(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Cost,Cost_Net,Actual_Net,Net)Values(
```
##### استعلام INSERT على جدول `Sales_Head1`:
```sql
Insert Into Sales_Journals_Head1(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Sales_Head1`:
```sql
Insert Into Sales_Journals_Details1(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Costcenter_ID,Analysis_ID,Analyse1)Values(
```
##### استعلام INSERT على جدول `Sales_Head1`:
```sql
Insert Into Sales_Journals_Details1(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Sales_Head1`:
```sql
Insert Into Sales_Journals_Details1(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام INSERT على جدول `Sales_Head1`:
```sql
Insert Into Sales_Journals_Details1(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام INSERT على جدول `Sales_Head1`:
```sql
Insert Into Sales_Journals_Details1(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Sales_Head1`:
```sql
Insert Into Sales_Journals_Details1(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Sales_Head1 Where Note_No=
```
##### استعلام UPDATE على جدول `Sales_Head1`:
```sql
Update Sales_Head1 Set Note_No=
```
##### استعلام DELETE على جدول `Sales_Details1`:
```sql
Delete From Sales_Details1 Where Note_No=
```
##### استعلام INSERT على جدول `Sales_Details1`:
```sql
Insert Into Sales_Details1(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Cost,Cost_Net,Actual_Net,Net)Values(
```
##### استعلام DELETE على جدول `Sales_Head1`:
```sql
Delete From Sales_Journals_Head1 Where Note_No=
```
##### استعلام DELETE على جدول `Sales_Head1`:
```sql
Delete From Sales_Journals_Details1 Where Note_No=
```
##### استعلام INSERT على جدول `Sales_Head1`:
```sql
Insert Into Sales_Journals_Head1(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Sales_Head1`:
```sql
Insert Into Sales_Journals_Details1(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Costcenter_ID,Analysis_ID,Analyse1)Values(
```
##### استعلام INSERT على جدول `Sales_Head1`:
```sql
Insert Into Sales_Journals_Details1(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Sales_Head1`:
```sql
Insert Into Sales_Journals_Details1(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام INSERT على جدول `Sales_Head1`:
```sql
Insert Into Sales_Journals_Details1(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام INSERT على جدول `Sales_Head1`:
```sql
Insert Into Sales_Journals_Details1(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Sales_Head1`:
```sql
Insert Into Sales_Journals_Details1(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام DELETE على جدول `Sales_Head1`:
```sql
Delete From Sales_Head1 where Note_No=
```
##### استعلام DELETE على جدول `Sales_Details1`:
```sql
Delete From Sales_Details1 where Note_No=
```
##### استعلام DELETE على جدول `Sales_Head1`:
```sql
Delete From Sales_Journals_Head1 Where Note_No=
```
##### استعلام DELETE على جدول `Sales_Head1`:
```sql
Delete From Sales_Journals_Details1 Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Sales_Details_View1 Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Sales_Details_View1 Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Sales_Head_View1 Where Search_Field Like '%
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
Select * FROM Accounts_Analysis_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Currencies Where Currency_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM SalesMen Where SalesMan_Name_A Like '%
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
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Balance_For_Search Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Sales_Head_View1 Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Sales_Details_View1 Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Balance_For_Search Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Sales_Head_View1 Order By Note_No DESC
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Currency_Name_A_LostFocus, Currency_ID_LostFocus, Note_Type_SelectedIndexChanged, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, Note_Discount_After_Tax_GotFocus, Note_Discount_After_Tax_KeyDown, Note_Discount_After_Tax_KeyPress, Note_Discount_After_Tax_LostFocus, SalesMan_ID_GotFocus, SalesMan_Name_A_GotFocus, SalesMan_Name_A_KeyDown, SalesMan_Name_A_LostFocus, SalesMan_ID_KeyDown, SalesMan_ID_KeyPress, SalesMan_ID_LostFocus, SalesMen_GridView_CellClick, SalesMen_GridView_CellFormatting, SalesMen_GridView_KeyDown, Discount_Per_GotFocus, Discount_Per_KeyDown, Discount_Per_KeyPress, Discount_Per_LostFocus, Discount_Per_Amount_GotFocus, Discount_Per_Amount_KeyDown, Discount_Per_Amount_LostFocus, Discount_Amount_GotFocus, Discount_Amount_KeyDown, Discount_Amount_KeyPress, Discount_Amount_LostFocus, Print_Journal_Click, Print_Journal_KeyDown, Note_Net_Text_LostFocus, Unit_ID_GotFocus, Unit_ID_KeyDown, Unit_Name_GotFocus, Unit_Name_KeyDown, Units_GridView_CellClick, Units_GridView_CellFormatting, Units_GridView_KeyDown, Unit_ID_LostFocus, Unit_Name_LostFocus, Note_Date_ValueChanged, Analysis_ID_GotFocus, Analysis_Name_A_GotFocus, Analysis_Name_A_KeyDown, Analysis_Name_A_LostFocus, Analysis_ID_KeyDown, Analysis_ID_KeyPress, Analysis_ID_LostFocus, Currency_Name_A_KeyDown, Exchang_GotFocus, Exchang_KeyDown, Exchang_KeyPress, Exchang_LostFocus, Analysis_GridView_CellClick, Analysis_GridView_CellFormatting, Sales_Order_GotFocus, Sales_Order_KeyDown, Sales_Order_KeyPress, Sales_Order_LostFocus, Client_ID_GotFocus, Client_Name_A_GotFocus, Client_Name_A_KeyDown, Client_Name_A_KeyPress, Client_Name_A_LostFocus, Client_ID_KeyDown, Client_ID_KeyPress, Client_ID_LostFocus, Issue_No_GotFocus, Issue_No_KeyDown, Issue_No_KeyPress, Issue_No_LostFocus, Debit_Level5_ID_GotFocus, Debit_Level5_Name_A_GotFocus, Debit_Level5_Name_A_KeyDown, Debit_Level5_Name_A_LostFocus, Debit_Level5_ID_KeyDown, Debit_Level5_ID_KeyPress, Debit_Level5_ID_LostFocus, D_Tax_Per_GotFocus, D_Tax_Per_KeyDown, D_Tax_Per_KeyPress, D_Tax_Per_LostFocus, D_Tax_Amount_GotFocus, D_Tax_Amount_KeyDown, D_Tax_Amount_KeyPress, D_Tax_Amount_LostFocus, Vat_Tax_Per_GotFocus, Vat_Tax_Per_KeyDown, Vat_Tax_Per_KeyPress, Vat_Tax_Per_LostFocus, Vat_Tax_Amount_GotFocus, Vat_Tax_Amount_KeyDown, Vat_Tax_Amount_KeyPress, Vat_Tax_Amount_LostFocus, Note_Tax_GotFocus, Note_Tax_KeyDown, Note_Tax_LostFocus, Note_Actual_Total_GotFocus, Note_Actual_Total_KeyDown, Note_Actual_Total_LostFocus, Note_Net_With_Tax_GotFocus, Note_Net_With_Tax_KeyDown, Note_Net_With_Tax_LostFocus, Note_Type_GotFocus, Note_Type_KeyDown, Note_Type_KeyPress, Note_Type_LostFocus, Analysis_GridView_KeyDown, Currency_GridView_CellClick, Currency_GridView_CellFormatting, Currency_GridView_KeyDown, Currency_ID_GotFocus, Currency_ID_KeyDown, Currency_ID_KeyPress, Currency_Name_A_GotFocus, Fill_Units_Grid, Fill_SalesMen_Grid, Lock_Control, Enable_Control, Review_Record, Find_Total, Sales_Form1_KeyDown, Sales_Form1_Load, Sales_Form1_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Note_No_GotFocus, Note_No_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Notice_GotFocus, Notice_KeyDown, Notice_KeyPress, Note_Date_KeyDown, Note_Date_Opened, RadGridView1_DoubleClick, RadGridView1_KeyDown, Item_ID_GotFocus, Item_ID_KeyDown, Item_ID_KeyPress, Item_Name_A_GotFocus, Item_Name_A_KeyDown, Items_GridView_CellClick, Items_GridView_CellFormatting, Items_GridView_KeyDown, Actual_Qty_GotFocus, Actual_Qty_KeyDown, Actual_Qty_KeyPress, Actual_Price_GotFocus, Actual_Price_KeyDown, Note_No_KeyPress, Note_No_LostFocus, Notice_LostFocus, Qty_LostFocus, Item_ID_LostFocus, Search_Txt_LostFocus, Inventory_ID_GotFocus, Inventory_ID_KeyDown, Inventory_ID_KeyPress, Inventory_Name_A_GotFocus, Inventory_Name_A_KeyDown, Inventories_GridView_CellClick, Inventories_GridView_CellFormatting, Inventories_GridView_KeyDown, Inventory_ID_LostFocus, Inventory_Name_A_LostFocus, Note_Date_H_GotFocus, Note_Date_H_KeyDown, Note_Date_H_LostFocus, Actual_Net_GotFocus, Actual_Net_KeyDown, Actual_Net_LostFocus, Actual_Price_KeyPress, Actual_Price_LostFocus, Item_Name_A_LostFocus, Note_Actual_Qty_GotFocus, Note_Actual_Qty_KeyDown, Note_Total_GotFocus, Note_Total_KeyDown, Note_Actual_Qty_LostFocus, Note_Total_LostFocus, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, set_Label7, get_Client_ID, set_Client_ID, get_Label12, set_Label12, get_Note_Type, set_Note_Type, get_Currency_Name_A, set_Currency_Name_A, get_Exchang, set_Exchang, get_Label17, set_Label17, get_Label27, set_Label27, get_Currency_ID, set_Currency_ID, get_Analysis_Name_A, set_Analysis_Name_A, get_Analysis_ID, set_Analysis_ID, get_Label19, set_Label19, get_Note_Net_With_Tax, set_Note_Net_With_Tax, get_Label16, set_Label16, get_Note_Actual_Total, set_Note_Actual_Total, get_Label25, set_Label25, get_Vat_Tax_Per, set_Vat_Tax_Per, get_Label24, set_Label24, get_Note_Tax, set_Note_Tax, get_Label23, set_Label23, get_D_Tax_Per, set_D_Tax_Per, get_Label22, set_Label22, get_Label20, set_Label20, get_Vat_Tax_Amount, set_Vat_Tax_Amount, get_Label21, set_Label21, get_D_Tax_Amount, set_D_Tax_Amount, get_Debit_Level5_Name_A, set_Debit_Level5_Name_A, get_Debit_Level5_ID, set_Debit_Level5_ID, get_Label30, set_Label30, get_Sales_Order, set_Sales_Order, get_Label31, set_Label31, get_Note_Net_Text, set_Note_Net_Text, get_Analysis_GridView, set_Analysis_GridView, get_Currency_GridView, set_Currency_GridView, get_Level5_GridView, set_Level5_GridView, get_AquaTheme1, set_AquaTheme1, get_Note_Discount_After_Tax, set_Note_Discount_After_Tax, get_Net, set_Net, get_Cost, set_Cost, get_Note_Discount, set_Note_Discount, get_Label34, set_Label34, get_Discount_Amount, set_Discount_Amount, get_Label33, set_Label33, get_Discount_Per, set_Discount_Per, get_Label29, set_Label29, get_Label32, set_Label32, get_Discount_Per_Amount, set_Discount_Per_Amount, get_Note_Net, set_Note_Net, get_Label35, set_Label35, get_Print_Journal, set_Print_Journal, get_Label37, set_Label37, get_Journal_No, set_Journal_No, get_Cost_Net, set_Cost_Net, get_SalesMen_GridView, set_SalesMen_GridView, get_SalesMan_Name_A, set_SalesMan_Name_A, get_SalesMan_ID, set_SalesMan_ID, get_Label36, set_Label36, get_Note_Cost, set_Note_Cost, Clear_Record, Clear_Data, Fill_Grid, Fill_Level5_Grid, Fill_Analysis_Grid, Fill_Currencies_Grid, Fill_Inventories_Grid, Fill_Items_Grid, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadPanel4, set_RadPanel4, get_RadGridView1, set_RadGridView1, get_Note_Date, set_Note_Date, get_Items_GridView, set_Items_GridView, get_RadLabel15, set_RadLabel15, get_Label13, set_Label13, get_Label8, set_Label8, get_Label6, set_Label6, get_Note_No, set_Note_No, get_Notice, set_Notice, get_Label4, set_Label4, get_Label9, set_Label9, get_Label10, set_Label10, get_Label11, set_Label11, get_Actual_Qty, set_Actual_Qty, get_Unit_Name, set_Unit_Name, get_Item_Name_A, set_Item_Name_A, get_Item_ID, set_Item_ID, get_Label15, set_Label15, get_Actual_Net, set_Actual_Net, get_Label14, set_Label14, get_Actual_Price, set_Actual_Price, get_Label26, set_Label26, get_Note_Total, set_Note_Total, get_Label28, set_Label28, get_Note_Actual_Qty, set_Note_Actual_Qty, get_Note_Net_With_Tax_Text, set_Note_Net_With_Tax_Text, get_SR, set_SR, get_Inventory_Name_A, set_Inventory_Name_A, get_Label1, set_Label1, get_Inventory_ID, set_Inventory_ID, get_Unit_ID, set_Unit_ID, get_Note_Date_H, set_Note_Date_H, get_Label2, set_Label2, get_Qty, set_Qty, get_Price, set_Price, get_Units_GridView, set_Units_GridView, get_Inventories_GridView, set_Inventories_GridView, get_Label3, set_Label3, get_Unit_Exchang, set_Unit_Exchang, get_Label5, set_Label5, get_Issue_No, set_Issue_No, get_Client_Name_A, set_Client_Name_A, get_Label7
```

---

### 3.6 شاشة: فاتورة مبيعات نمط (3) - نقاط الكاشير والفروع (`Sales_Form2`)
- **الاسم الإنجليزي:** Sales Invoices Pattern 3 (POS / Retail)
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** واجهة البيع السريع ونقاط البيع والفروع مع دعم الباركود المباشر وطباعة الإيصالات
- **جداول قاعدة البيانات المستهدفة:** `Sales_Head2`, `Sales_Details2`

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
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Sales_Head2.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Sales_Head2.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `RadGridView1` | **RadGridView1** | `RadGridView` | - | - | - | - |
| `Note_Date` | **تاريخ الحركة** | `RadDateTimePicker` | `Sales_Head2.Note_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Items_GridView` | **Items_GridView** | `RadGridView` | - | - | - | - |
| `RadLabel15` | **RadLabel15** | `RadLabel` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Label8` | **Label8** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Note_No` | **رقم الحركة / السند** | `RadTextBox` | `Sales_Head2.Note_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Sales_Head2.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Label10` | **Label10** | `Label` | - | - | - | - |
| `Label11` | **Label11** | `Label` | - | - | - | - |
| `Actual_Qty` | **الكمية** | `RadTextBox` | `Sales_Head2.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Unit_Name` | **الوحدة** | `RadTextBox` | - | - | - | - |
| `Item_Name_A` | **اسم الصنف** | `RadTextBox` | - | - | - | - |
| `Item_ID` | **كود الصنف** | `RadTextBox` | `Sales_Details2.Item_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label15` | **Label15** | `Label` | - | - | - | - |
| `Actual_Net` | **الصافي المستحق** | `RadTextBox` | `Sales_Details2.Actual_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Actual_Price` | **السعر الفردي** | `RadTextBox` | `Sales_Details2.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Label26` | **Label26** | `Label` | - | - | - | - |
| `Note_Total` | **الإجمالي** | `RadTextBox` | `Sales_Head2.Note_Total` | `float` (NOT NULL) | `((0))` | `Total = SUM(Details.Net)` |
| `Label28` | **Label28** | `Label` | - | - | - | - |
| `Note_Actual_Qty` | **الكمية** | `RadTextBox` | `Sales_Head2.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Note_Net_With_Tax_Text` | **ضريبة القيمة المضافة** | `RadTextBox` | - | - | - | `Net = Total - Discount + Tax` |
| `SR` | **SR** | `RadTextBox` | `Sales_Details2.SR` | `int` (PRIMARY KEY, NOT NULL) | - | - |
| `Inventory_Name_A` | **Inventory_Name_A** | `RadTextBox` | - | - | - | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Inventory_ID` | **كود المخزن** | `RadTextBox` | `Sales_Head2.Inventory_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Unit_ID` | **الوحدة** | `RadTextBox` | `Sales_Details2.Unit_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `Note_Date_H` | **تاريخ الحركة** | `RadTextBox` | `Sales_Head2.Note_Date_H` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Qty` | **الكمية** | `RadTextBox` | `Sales_Head2.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Price` | **السعر الفردي** | `RadTextBox` | `Sales_Details2.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Units_GridView` | **Units_GridView** | `RadGridView` | - | - | - | - |
| `Inventories_GridView` | **Inventories_GridView** | `RadGridView` | - | - | - | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Unit_Exchang` | **Unit_Exchang** | `RadTextBox` | `Sales_Head2.Exchang` | `float` (NOT NULL) | `((1))` | - |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Issue_No` | **Issue_No** | `RadTextBox` | `Sales_Head2.Issue_No` | `nvarchar(50)` (NOT NULL) | `('-')` | - |
| `Client_Name_A` | **اسم العميل** | `RadTextBox` | - | - | - | - |
| `Label7` | **Label7** | `Label` | - | - | - | - |
| `Client_ID` | **كود العميل** | `RadTextBox` | `Sales_Head2.Client_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label12` | **Label12** | `Label` | - | - | - | - |
| `Note_Type` | **Note_Type** | `RadDropDownList` | `Sales_Head2.Note_Type` | `smallint` (NOT NULL) | `((0))` | - |
| `Currency_Name_A` | **اسم العملة** | `RadTextBox` | - | - | - | - |
| `Exchang` | **Exchang** | `RadTextBox` | `Sales_Head2.Exchang` | `float` (NOT NULL) | `((1))` | - |
| `Label17` | **Label17** | `Label` | - | - | - | - |
| `Label27` | **Label27** | `Label` | - | - | - | - |
| `Currency_ID` | **كود العملة** | `RadTextBox` | `Sales_Head2.Currency_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `Analysis_Name_A` | **اسم الحساب التحليلي** | `RadTextBox` | - | - | - | - |
| `Analysis_ID` | **كود الحساب التحليلي** | `RadTextBox` | `Sales_Head2.Analysis_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label19` | **Label19** | `Label` | - | - | - | - |
| `Note_Net_With_Tax` | **ضريبة القيمة المضافة** | `RadTextBox` | `Sales_Head2.Note_Net_With_Tax` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label16` | **Label16** | `Label` | - | - | - | - |
| `Note_Actual_Total` | **الإجمالي** | `RadTextBox` | `Sales_Head2.Note_Actual_Total` | `float` (NOT NULL) | `((0))` | `Total = SUM(Details.Net)` |
| `Label25` | **Label25** | `Label` | - | - | - | - |
| `Vat_Tax_Per` | **ضريبة القيمة المضافة** | `RadTextBox` | `Sales_Head2.Vat_Tax_Per` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label24` | **Label24** | `Label` | - | - | - | - |
| `Note_Tax` | **ضريبة القيمة المضافة** | `RadTextBox` | `Sales_Head2.Note_Tax` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label23` | **Label23** | `Label` | - | - | - | - |
| `D_Tax_Per` | **ضريبة القيمة المضافة** | `RadTextBox` | `Sales_Head2.D_Tax_Per` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label22` | **Label22** | `Label` | - | - | - | - |
| `Label20` | **Label20** | `Label` | - | - | - | - |
| `Vat_Tax_Amount` | **ضريبة القيمة المضافة** | `RadTextBox` | `Sales_Head2.Vat_Tax_Amount` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label21` | **Label21** | `Label` | - | - | - | - |
| `D_Tax_Amount` | **ضريبة القيمة المضافة** | `RadTextBox` | `Sales_Head2.D_Tax_Amount` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Debit_Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Debit_Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Sales_Head2.Debit_Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label30` | **Label30** | `Label` | - | - | - | - |
| `Sales_Order` | **Sales_Order** | `RadTextBox` | `Sales_Head2.Sales_Order` | `nvarchar(50)` (NOT NULL) | `('-')` | - |
| `Label31` | **Label31** | `Label` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `TextBox` | `Sales_Head2.Note_Net_Text` | `nvarchar(250)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `Analysis_GridView` | **Analysis_GridView** | `RadGridView` | - | - | - | - |
| `Currency_GridView` | **Currency_GridView** | `RadGridView` | - | - | - | - |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `Note_Discount_After_Tax` | **الخصم** | `RadTextBox` | `Sales_Head2.Note_Discount_After_Tax` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Net` | **الصافي المستحق** | `RadTextBox` | `Sales_Head2.Note_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Cost` | **Cost** | `RadTextBox` | `Sales_Details2.Cost` | `float` (NOT NULL) | `((0))` | - |
| `Note_Discount` | **الخصم** | `RadTextBox` | `Sales_Head2.Note_Discount` | `float` (NOT NULL) | `((0))` | - |
| `Label34` | **Label34** | `Label` | - | - | - | - |
| `Discount_Amount` | **الخصم** | `RadTextBox` | `Sales_Head2.Discount_Amount` | `float` (NOT NULL) | `((0))` | - |
| `Label33` | **Label33** | `Label` | - | - | - | - |
| `Label32` | **Label32** | `Label` | - | - | - | - |
| `Discount_Per_Amount` | **الخصم** | `RadTextBox` | `Sales_Head2.Discount_Per_Amount` | `float` (NOT NULL) | `((0))` | - |
| `Note_Net` | **الصافي المستحق** | `RadTextBox` | `Sales_Head2.Note_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label35` | **Label35** | `Label` | - | - | - | - |
| `Print_Journal` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Label37` | **Label37** | `Label` | - | - | - | - |
| `Journal_No` | **Journal_No** | `RadTextBox` | `Sales_Head2.Journal_No` | `int` (NOT NULL) | `((0))` | - |
| `Cost_Net` | **الصافي المستحق** | `RadTextBox` | `Sales_Details2.Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `SalesMen_GridView` | **SalesMen_GridView** | `RadGridView` | - | - | - | - |
| `SalesMan_Name_A` | **اسم المندوب** | `RadTextBox` | - | - | - | - |
| `SalesMan_ID` | **كود المندوب** | `RadTextBox` | `Sales_Head2.SalesMan_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label36` | **Label36** | `Label` | - | - | - | - |
| `Note_Cost` | **Note_Cost** | `TextBox` | `Sales_Details2.Cost` | `float` (NOT NULL) | `((0))` | - |
| `Label38` | **Label38** | `Label` | - | - | - | - |
| `Actual_Total` | **الإجمالي** | `RadTextBox` | `Sales_Head2.Note_Actual_Total` | `float` (NOT NULL) | `((0))` | - |
| `Item_Discount_Per_Amount` | **الخصم** | `RadTextBox` | `Sales_Head2.Discount_Per_Amount` | `float` (NOT NULL) | `((0))` | - |
| `Item_Discount_Per` | **الخصم** | `RadTextBox` | `Sales_Head2.Discount_Per` | `float` (NOT NULL) | `((0))` | - |
| `Label18` | **Label18** | `Label` | - | - | - | - |
| `Total` | **الإجمالي** | `RadTextBox` | `Sales_Head2.Note_Actual_Total` | `float` (NOT NULL) | `((0))` | - |
| `Receivable_No` | **Receivable_No** | `RadTextBox` | `Sales_Head2.Receivable_No` | `int` (NOT NULL) | `((0))` | - |
| `Label46` | **Label46** | `Label` | - | - | - | - |
| `Payed` | **Payed** | `RadTextBox` | `Sales_Head2.Payed` | `float` (NOT NULL) | `((0))` | - |
| `Balance` | **الرصيد / الفارق** | `RadTextBox` | `Sales_Head2.Previous_Balance` | `float` (NOT NULL) | `((0))` | `Balance = Previous_Balance + Debit - Credit` |
| `Label45` | **Label45** | `Label` | - | - | - | - |
| `Label44` | **Label44** | `Label` | - | - | - | - |
| `Label29` | **Label29** | `Label` | - | - | - | - |
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
| `Cmd001` | **Cmd001** | `SqlCommand` | - | - | - | - |
| `Cmd02` | **Cmd02** | `SqlCommand` | - | - | - | - |
| `Cmd002` | **Cmd002** | `SqlCommand` | - | - | - | - |
| `Cmd03` | **Cmd03** | `SqlCommand` | - | - | - | - |
| `Cmd003` | **Cmd003** | `SqlCommand` | - | - | - | - |
| `Cmd04` | **Cmd04** | `SqlCommand` | - | - | - | - |
| `Cmd05` | **Cmd05** | `SqlCommand` | - | - | - | - |
| `Cmd06` | **Cmd06** | `SqlCommand` | - | - | - | - |
| `Cmd07` | **Cmd07** | `SqlCommand` | - | - | - | - |
| `Cmd08` | **Cmd08** | `SqlCommand` | - | - | - | - |
| `Cmd09` | **Cmd09** | `SqlCommand` | - | - | - | - |
| `Cmd2` | **Cmd2** | `SqlCommand` | - | - | - | - |
| `Cmd3` | **Cmd3** | `SqlCommand` | - | - | - | - |
| `Cmd4` | **Cmd4** | `SqlCommand` | - | - | - | - |
| `Cmd5` | **Cmd5** | `SqlCommand` | - | - | - | - |
| `Cmd6` | **Cmd6** | `SqlCommand` | - | - | - | - |
| `Cmd7` | **Cmd7** | `SqlCommand` | - | - | - | - |
| `Cmd8` | **Cmd8** | `SqlCommand` | - | - | - | - |
| `Cmd9` | **Cmd9** | `SqlCommand` | - | - | - | - |
| `Balance_Cmd` | **الرصيد / الفارق** | `SqlCommand` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Dt` | **Dt** | `DataTable` | - | - | - | - |
| `Dt_D` | **Dt_D** | `DataTable` | - | - | - | - |
| `Setting_Dt` | **Setting_Dt** | `DataTable` | - | - | - | - |
| `Link_Dt` | **Link_Dt** | `DataTable` | - | - | - | - |

#### ب. قواعد التحقق والمعادلات الحسابية (Validation & Business Rules)
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيـد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال وحدة الصرف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الكميـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم العُملـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المخزن 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم العميــل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم القيد المحاسـبي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إضافة سجل جديد أثناء عملية التعديل. لأضافة سجل يجب الضغط على الغاء التعديل ثم الضغط على سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إجراء تعديل أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: في حالة الإضافة يجب الضغط على سجل جديد وفي حالة التعديل يجب الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السند غير موجود ويجب حفظه أولاً  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء إضافة سجل جديد. للحذف يجب الضغط على الغاء الإضافة ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء تعديل سجل . للحذف يجب الضغط على الغاء التعديل ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد السجل المراد حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد الفاتـورة المطلوبة  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
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
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
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
Select * FROM Clients Where Client_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Clients Where Client_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM SalesMen Where SalesMan_ID=
```
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
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Clients Where Client_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Sales_Head_View2 Order By Note_No DESC
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
Select * From Sales_Settings2 Where ID=
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
Select * FROM SalesMen Order By SalesMan_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM Sales_Head2 Order By Note_No Desc
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM Sales_Journals_Head2 Order By Note_No Desc
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM Receivable_Head Order By Note_No Desc
```
##### استعلام INSERT على جدول `Sales_Head2`:
```sql
Insert Into Sales_Head2(Note_No,Note_Date,Note_Date_H,Note_Type,Currency_ID,Exchang,Inventory_ID,Client_ID,Cash_Client_Name,Issue_No,Sales_Order,Analysis_ID,SalesMan_ID,Discount_Per_Amount,Discount_Amount,Note_Discount,D_Tax_Per,D_Tax_Amount,Vat_Tax_Per,Vat_Tax_Amount,Note_Tax,Note_Discount_After_Tax,Note_Actual_Qty,Note_Actual_Total,Note_Total,Note_Net,Note_Net_With_Tax,Note_Net_Text,Journal_No,Debit_Level5_ID,Payed,Balance,Receivable_No,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Sales_Details2`:
```sql
Insert Into Sales_Details2(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Actual_Total,Total,Item_Discount_Per,Item_Discount_Per_Amount,Cost,Cost_Net,Actual_Net,Net)Values(
```
##### استعلام INSERT على جدول `Sales_Head2`:
```sql
Insert Into Sales_Journals_Head2(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Sales_Head2`:
```sql
Insert Into Sales_Journals_Details2(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Sales_Head2`:
```sql
Insert Into Sales_Journals_Details2(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Sales_Head2`:
```sql
Insert Into Sales_Journals_Details2(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام INSERT على جدول `Sales_Head2`:
```sql
Insert Into Sales_Journals_Details2(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Analysis_ID,Costcenter_ID,Analyse1)Values(
```
##### استعلام INSERT على جدول `Sales_Head2`:
```sql
Insert Into Sales_Journals_Details2(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Sales_Head2`:
```sql
Insert Into Sales_Journals_Details2(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام INSERT على جدول `Sales_Head2`:
```sql
Insert Into Receivable_Head(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Sales_Head2`:
```sql
Insert Into Receivable_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Sales_Head2`:
```sql
Insert Into Receivable_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Sales_Head2 Where Note_No=
```
##### استعلام UPDATE على جدول `Sales_Head2`:
```sql
Update Sales_Head2 Set Note_No=
```
##### استعلام DELETE على جدول `Sales_Details2`:
```sql
Delete From Sales_Details2 Where Note_No=
```
##### استعلام INSERT على جدول `Sales_Details2`:
```sql
Insert Into Sales_Details2(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Actual_Total,Total,Item_Discount_Per,Item_Discount_Per_Amount,Cost,Cost_Net,Actual_Net,Net)Values(
```
##### استعلام DELETE على جدول `Sales_Head2`:
```sql
Delete From Sales_Journals_Head2 Where Note_No=
```
##### استعلام DELETE على جدول `Sales_Head2`:
```sql
Delete From Sales_Journals_Details2 Where Note_No=
```
##### استعلام INSERT على جدول `Sales_Head2`:
```sql
Insert Into Sales_Journals_Head2(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Sales_Head2`:
```sql
Insert Into Sales_Journals_Details2(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Sales_Head2`:
```sql
Insert Into Sales_Journals_Details2(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Sales_Head2`:
```sql
Insert Into Sales_Journals_Details2(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام INSERT على جدول `Sales_Head2`:
```sql
Insert Into Sales_Journals_Details2(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Analysis_ID,Costcenter_ID,Analyse1)Values(
```
##### استعلام INSERT على جدول `Sales_Head2`:
```sql
Insert Into Sales_Journals_Details2(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Sales_Head2`:
```sql
Insert Into Sales_Journals_Details2(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام UPDATE على جدول `Sales_Head2`:
```sql
Update Receivable_Head Set Note_No=
```
##### استعلام DELETE على جدول `Sales_Head2`:
```sql
Delete From Receivable_Details Where Note_No=
```
##### استعلام INSERT على جدول `Sales_Head2`:
```sql
Insert Into Receivable_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Sales_Head2`:
```sql
Insert Into Receivable_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام DELETE على جدول `Sales_Head2`:
```sql
Delete From Sales_Head2 where Note_No=
```
##### استعلام DELETE على جدول `Sales_Details2`:
```sql
Delete From Sales_Details2 where Note_No=
```
##### استعلام DELETE على جدول `Sales_Head2`:
```sql
Delete From Sales_Journals_Head2 Where Note_No=
```
##### استعلام DELETE على جدول `Sales_Head2`:
```sql
Delete From Sales_Journals_Details2 Where Note_No=
```
##### استعلام DELETE على جدول `Sales_Head2`:
```sql
Delete From Receivable_Head Where Note_No=
```
##### استعلام DELETE على جدول `Sales_Head2`:
```sql
Delete From Receivable_Details Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Sales_Details_View2 Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Sales_Details_View2 Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Sales_Head_View2 Where Search_Field Like '%
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
Select * FROM Accounts_Analysis_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Currencies Where Currency_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM SalesMen Where SalesMan_Name_A Like '%
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
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Sales_Head_View2 Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Sales_Details_View2 Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_ID=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Note_Net_With_Tax_KeyDown, Note_Net_With_Tax_LostFocus, Note_Type_GotFocus, Note_Type_KeyDown, Note_Type_KeyPress, Note_Type_LostFocus, Analysis_GridView_KeyDown, Currency_GridView_CellClick, Currency_GridView_CellFormatting, Currency_GridView_KeyDown, Currency_ID_GotFocus, Currency_ID_KeyDown, Currency_ID_KeyPress, Currency_Name_A_GotFocus, Currency_Name_A_LostFocus, Currency_ID_LostFocus, Note_Type_SelectedIndexChanged, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, Note_Discount_After_Tax_GotFocus, Note_Discount_After_Tax_KeyDown, Note_Discount_After_Tax_KeyPress, Note_Discount_After_Tax_LostFocus, SalesMan_ID_GotFocus, SalesMan_Name_A_GotFocus, SalesMan_Name_A_KeyDown, SalesMan_Name_A_LostFocus, SalesMan_ID_KeyDown, SalesMan_ID_KeyPress, SalesMan_ID_LostFocus, SalesMen_GridView_CellClick, SalesMen_GridView_CellFormatting, SalesMen_GridView_KeyDown, Item_Discount_Per_Amount_GotFocus, Item_Discount_Per_Amount_KeyDown, Item_Discount_Per_Amount_LostFocus, Discount_Per_Amount_GotFocus, Discount_Per_Amount_KeyDown, Discount_Per_Amount_LostFocus, Discount_Amount_GotFocus, Discount_Amount_KeyDown, Discount_Amount_KeyPress, Discount_Amount_LostFocus, Print_Journal_Click, Print_Journal_KeyDown, Item_Discount_Per_GotFocus, Item_Discount_Per_KeyDown, Item_Discount_Per_KeyPress, Item_Discount_Per_LostFocus, Payed_GotFocus, Payed_KeyDown, Payed_KeyPress, Payed_LostFocus, Balance_GotFocus, Balance_KeyDown, Balance_LostFocus, Qty_GotFocus, Qty_KeyDown, Qty_KeyPress, Qty_LostFocus1, Actual_Net_GotFocus, Actual_Net_KeyDown, Actual_Net_LostFocus, Actual_Price_KeyPress, Actual_Price_LostFocus, Item_Name_A_LostFocus, Note_Actual_Qty_GotFocus, Note_Actual_Qty_KeyDown, Note_Total_GotFocus, Note_Total_KeyDown, Note_Actual_Qty_LostFocus, Note_Total_LostFocus, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, Note_Net_Text_LostFocus, Unit_ID_GotFocus, Unit_ID_KeyDown, Unit_Name_GotFocus, Unit_Name_KeyDown, Units_GridView_CellClick, Units_GridView_CellFormatting, Units_GridView_KeyDown, Unit_ID_LostFocus, Unit_Name_LostFocus, Note_Date_ValueChanged, Analysis_ID_GotFocus, Analysis_Name_A_GotFocus, Analysis_Name_A_KeyDown, Analysis_Name_A_LostFocus, Analysis_ID_KeyDown, Analysis_ID_KeyPress, Analysis_ID_LostFocus, Currency_Name_A_KeyDown, Exchang_GotFocus, Exchang_KeyDown, Exchang_KeyPress, Exchang_LostFocus, Analysis_GridView_CellClick, Analysis_GridView_CellFormatting, Sales_Order_GotFocus, Sales_Order_KeyDown, Sales_Order_KeyPress, Sales_Order_LostFocus, Client_ID_GotFocus, Client_Name_A_GotFocus, Client_Name_A_KeyDown, Client_Name_A_KeyPress, Client_Name_A_LostFocus, Client_ID_KeyDown, Client_ID_KeyPress, Client_ID_LostFocus, Issue_No_GotFocus, Issue_No_KeyDown, Issue_No_KeyPress, Issue_No_LostFocus, Debit_Level5_ID_GotFocus, Debit_Level5_Name_A_GotFocus, Debit_Level5_Name_A_KeyDown, Debit_Level5_Name_A_LostFocus, Debit_Level5_ID_KeyDown, Debit_Level5_ID_KeyPress, Debit_Level5_ID_LostFocus, D_Tax_Per_GotFocus, D_Tax_Per_KeyDown, D_Tax_Per_KeyPress, D_Tax_Per_LostFocus, D_Tax_Amount_GotFocus, D_Tax_Amount_KeyDown, D_Tax_Amount_KeyPress, D_Tax_Amount_LostFocus, Vat_Tax_Per_GotFocus, Vat_Tax_Per_KeyDown, Vat_Tax_Per_KeyPress, Vat_Tax_Per_LostFocus, Vat_Tax_Amount_GotFocus, Vat_Tax_Amount_KeyDown, Vat_Tax_Amount_KeyPress, Vat_Tax_Amount_LostFocus, Note_Tax_GotFocus, Note_Tax_KeyDown, Note_Tax_LostFocus, Note_Actual_Total_GotFocus, Note_Actual_Total_KeyDown, Note_Actual_Total_LostFocus, Note_Net_With_Tax_GotFocus, set_Payed, get_Balance, set_Balance, get_Label45, set_Label45, get_Label44, set_Label44, get_Label29, set_Label29, Clear_Record, Clear_Data, Fill_Grid, Fill_Level5_Grid, Fill_Analysis_Grid, Fill_Currencies_Grid, Fill_Inventories_Grid, Fill_Items_Grid, Fill_Units_Grid, Fill_SalesMen_Grid, Lock_Control, Enable_Control, Review_Record, Find_Total, Sales_Form2_KeyDown, Sales_Form2_Load, Sales_Form2_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Note_No_GotFocus, Note_No_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Notice_GotFocus, Notice_KeyDown, Notice_KeyPress, Note_Date_KeyDown, Note_Date_Opened, RadGridView1_DoubleClick, RadGridView1_KeyDown, Item_ID_GotFocus, Item_ID_KeyDown, Item_ID_KeyPress, Item_Name_A_GotFocus, Item_Name_A_KeyDown, Items_GridView_CellClick, Items_GridView_CellFormatting, Items_GridView_KeyDown, Actual_Qty_GotFocus, Actual_Qty_KeyDown, Actual_Qty_KeyPress, Actual_Price_GotFocus, Actual_Price_KeyDown, Note_No_KeyPress, Note_No_LostFocus, Notice_LostFocus, Qty_LostFocus, Item_ID_LostFocus, Search_Txt_LostFocus, Inventory_ID_GotFocus, Inventory_ID_KeyDown, Inventory_ID_KeyPress, Inventory_Name_A_GotFocus, Inventory_Name_A_KeyDown, Inventories_GridView_CellClick, Inventories_GridView_CellFormatting, Inventories_GridView_KeyDown, Inventory_ID_LostFocus, Inventory_Name_A_LostFocus, Note_Date_H_GotFocus, Note_Date_H_KeyDown, Note_Date_H_LostFocus, set_Label7, get_Client_ID, set_Client_ID, get_Label12, set_Label12, get_Note_Type, set_Note_Type, get_Currency_Name_A, set_Currency_Name_A, get_Exchang, set_Exchang, get_Label17, set_Label17, get_Label27, set_Label27, get_Currency_ID, set_Currency_ID, get_Analysis_Name_A, set_Analysis_Name_A, get_Analysis_ID, set_Analysis_ID, get_Label19, set_Label19, get_Note_Net_With_Tax, set_Note_Net_With_Tax, get_Label16, set_Label16, get_Note_Actual_Total, set_Note_Actual_Total, get_Label25, set_Label25, get_Vat_Tax_Per, set_Vat_Tax_Per, get_Label24, set_Label24, get_Note_Tax, set_Note_Tax, get_Label23, set_Label23, get_D_Tax_Per, set_D_Tax_Per, get_Label22, set_Label22, get_Label20, set_Label20, get_Vat_Tax_Amount, set_Vat_Tax_Amount, get_Label21, set_Label21, get_D_Tax_Amount, set_D_Tax_Amount, get_Debit_Level5_Name_A, set_Debit_Level5_Name_A, get_Debit_Level5_ID, set_Debit_Level5_ID, get_Label30, set_Label30, get_Sales_Order, set_Sales_Order, get_Label31, set_Label31, get_Note_Net_Text, set_Note_Net_Text, get_Analysis_GridView, set_Analysis_GridView, get_Currency_GridView, set_Currency_GridView, get_Level5_GridView, set_Level5_GridView, get_AquaTheme1, set_AquaTheme1, get_Note_Discount_After_Tax, set_Note_Discount_After_Tax, get_Net, set_Net, get_Cost, set_Cost, get_Note_Discount, set_Note_Discount, get_Label34, set_Label34, get_Discount_Amount, set_Discount_Amount, get_Label33, set_Label33, get_Label32, set_Label32, get_Discount_Per_Amount, set_Discount_Per_Amount, get_Note_Net, set_Note_Net, get_Label35, set_Label35, get_Print_Journal, set_Print_Journal, get_Label37, set_Label37, get_Journal_No, set_Journal_No, get_Cost_Net, set_Cost_Net, get_SalesMen_GridView, set_SalesMen_GridView, get_SalesMan_Name_A, set_SalesMan_Name_A, get_SalesMan_ID, set_SalesMan_ID, get_Label36, set_Label36, get_Note_Cost, set_Note_Cost, get_Label38, set_Label38, get_Actual_Total, set_Actual_Total, get_Item_Discount_Per_Amount, set_Item_Discount_Per_Amount, get_Item_Discount_Per, set_Item_Discount_Per, get_Label18, set_Label18, get_Total, set_Total, get_Receivable_No, set_Receivable_No, get_Label46, set_Label46, get_Payed, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadPanel4, set_RadPanel4, get_RadGridView1, set_RadGridView1, get_Note_Date, set_Note_Date, get_Items_GridView, set_Items_GridView, get_RadLabel15, set_RadLabel15, get_Label13, set_Label13, get_Label8, set_Label8, get_Label6, set_Label6, get_Note_No, set_Note_No, get_Notice, set_Notice, get_Label4, set_Label4, get_Label9, set_Label9, get_Label10, set_Label10, get_Label11, set_Label11, get_Actual_Qty, set_Actual_Qty, get_Unit_Name, set_Unit_Name, get_Item_Name_A, set_Item_Name_A, get_Item_ID, set_Item_ID, get_Label15, set_Label15, get_Actual_Net, set_Actual_Net, get_Label14, set_Label14, get_Actual_Price, set_Actual_Price, get_Label26, set_Label26, get_Note_Total, set_Note_Total, get_Label28, set_Label28, get_Note_Actual_Qty, set_Note_Actual_Qty, get_Note_Net_With_Tax_Text, set_Note_Net_With_Tax_Text, get_SR, set_SR, get_Inventory_Name_A, set_Inventory_Name_A, get_Label1, set_Label1, get_Inventory_ID, set_Inventory_ID, get_Unit_ID, set_Unit_ID, get_Note_Date_H, set_Note_Date_H, get_Label2, set_Label2, get_Qty, set_Qty, get_Price, set_Price, get_Units_GridView, set_Units_GridView, get_Inventories_GridView, set_Inventories_GridView, get_Label3, set_Label3, get_Unit_Exchang, set_Unit_Exchang, get_Label5, set_Label5, get_Issue_No, set_Issue_No, get_Client_Name_A, set_Client_Name_A, get_Label7
```

---

### 3.7 شاشة: مردودات المبيعات (`Sales_R_Form`)
- **الاسم الإنجليزي:** Sales Returns & Credit Notes
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** إثبات بضائع المبيعات المرتدة من العملاء وإصدار إشعارات الإضافة والرد للمخزن
- **جداول قاعدة البيانات المستهدفة:** `Sales_R_Head`, `Sales_R_Details`

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
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Sales_R_Head.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Sales_R_Head.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `RadGridView1` | **RadGridView1** | `RadGridView` | - | - | - | - |
| `Note_Date` | **تاريخ الحركة** | `RadDateTimePicker` | `Sales_R_Head.Note_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Items_GridView` | **Items_GridView** | `RadGridView` | - | - | - | - |
| `RadLabel15` | **RadLabel15** | `RadLabel` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Label8` | **Label8** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Note_No` | **رقم الحركة / السند** | `RadTextBox` | `Sales_R_Head.Note_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Sales_R_Head.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Label10` | **Label10** | `Label` | - | - | - | - |
| `Label11` | **Label11** | `Label` | - | - | - | - |
| `Actual_Qty` | **الكمية** | `RadTextBox` | `Sales_R_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Unit_Name` | **الوحدة** | `RadTextBox` | - | - | - | - |
| `Item_Name_A` | **اسم الصنف** | `RadTextBox` | - | - | - | - |
| `Item_ID` | **كود الصنف** | `RadTextBox` | `Sales_R_Details.Item_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label15` | **Label15** | `Label` | - | - | - | - |
| `Actual_Net` | **الصافي المستحق** | `RadTextBox` | `Sales_R_Details.Actual_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Actual_Price` | **السعر الفردي** | `RadTextBox` | `Sales_R_Details.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Label26` | **Label26** | `Label` | - | - | - | - |
| `Note_Total` | **الإجمالي** | `RadTextBox` | `Sales_R_Head.Note_Total` | `float` (NOT NULL) | `((0))` | `Total = SUM(Details.Net)` |
| `Label28` | **Label28** | `Label` | - | - | - | - |
| `Note_Actual_Qty` | **الكمية** | `RadTextBox` | `Sales_R_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Note_Net_With_Tax_Text` | **ضريبة القيمة المضافة** | `RadTextBox` | - | - | - | `Net = Total - Discount + Tax` |
| `SR` | **SR** | `RadTextBox` | `Sales_R_Details.SR` | `int` (PRIMARY KEY, NOT NULL) | - | - |
| `Inventory_Name_A` | **Inventory_Name_A** | `RadTextBox` | - | - | - | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Inventory_ID` | **كود المخزن** | `RadTextBox` | `Sales_R_Head.Inventory_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Unit_ID` | **الوحدة** | `RadTextBox` | `Sales_R_Details.Unit_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `Note_Date_H` | **تاريخ الحركة** | `RadTextBox` | `Sales_R_Head.Note_Date_H` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Qty` | **الكمية** | `RadTextBox` | `Sales_R_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Price` | **السعر الفردي** | `RadTextBox` | `Sales_R_Details.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Units_GridView` | **Units_GridView** | `RadGridView` | - | - | - | - |
| `Inventories_GridView` | **Inventories_GridView** | `RadGridView` | - | - | - | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Unit_Exchang` | **Unit_Exchang** | `RadTextBox` | `Sales_R_Head.Exchang` | `float` (NOT NULL) | `((1))` | - |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Issue_No` | **Issue_No** | `RadTextBox` | `Sales_R_Head.Issue_No` | `nvarchar(50)` (NOT NULL) | `('-')` | - |
| `Client_Name_A` | **اسم العميل** | `RadTextBox` | - | - | - | - |
| `Label7` | **Label7** | `Label` | - | - | - | - |
| `Client_ID` | **كود العميل** | `RadTextBox` | `Sales_R_Head.Client_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label12` | **Label12** | `Label` | - | - | - | - |
| `Note_Type` | **Note_Type** | `RadDropDownList` | `Sales_R_Head.Note_Type` | `smallint` (NOT NULL) | `((0))` | - |
| `Currency_Name_A` | **اسم العملة** | `RadTextBox` | - | - | - | - |
| `Exchang` | **Exchang** | `RadTextBox` | `Sales_R_Head.Exchang` | `float` (NOT NULL) | `((1))` | - |
| `Label17` | **Label17** | `Label` | - | - | - | - |
| `Label27` | **Label27** | `Label` | - | - | - | - |
| `Currency_ID` | **كود العملة** | `RadTextBox` | `Sales_R_Head.Currency_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `Analysis_Name_A` | **اسم الحساب التحليلي** | `RadTextBox` | - | - | - | - |
| `Analysis_ID` | **كود الحساب التحليلي** | `RadTextBox` | `Sales_R_Head.Analysis_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label19` | **Label19** | `Label` | - | - | - | - |
| `Note_Net_With_Tax` | **ضريبة القيمة المضافة** | `RadTextBox` | `Sales_R_Head.Note_Net_With_Tax` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label16` | **Label16** | `Label` | - | - | - | - |
| `Note_Actual_Total` | **الإجمالي** | `RadTextBox` | `Sales_R_Head.Note_Actual_Total` | `float` (NOT NULL) | `((0))` | `Total = SUM(Details.Net)` |
| `Label25` | **Label25** | `Label` | - | - | - | - |
| `Vat_Tax_Per` | **ضريبة القيمة المضافة** | `RadTextBox` | `Sales_R_Head.Vat_Tax_Per` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label24` | **Label24** | `Label` | - | - | - | - |
| `Note_Tax` | **ضريبة القيمة المضافة** | `RadTextBox` | `Sales_R_Head.Note_Tax` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label23` | **Label23** | `Label` | - | - | - | - |
| `D_Tax_Per` | **ضريبة القيمة المضافة** | `RadTextBox` | `Sales_R_Head.D_Tax_Per` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label22` | **Label22** | `Label` | - | - | - | - |
| `Label20` | **Label20** | `Label` | - | - | - | - |
| `Vat_Tax_Amount` | **ضريبة القيمة المضافة** | `RadTextBox` | `Sales_R_Head.Vat_Tax_Amount` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label21` | **Label21** | `Label` | - | - | - | - |
| `D_Tax_Amount` | **ضريبة القيمة المضافة** | `RadTextBox` | `Sales_R_Head.D_Tax_Amount` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Credit_Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Credit_Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Sales_R_Head.Credit_Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label30` | **Label30** | `Label` | - | - | - | - |
| `Sales_Order` | **Sales_Order** | `RadTextBox` | `Sales_R_Head.Sales_Order` | `nvarchar(50)` (NOT NULL) | `('-')` | - |
| `Label31` | **Label31** | `Label` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `TextBox` | `Sales_R_Head.Note_Net_Text` | `nvarchar(250)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `Analysis_GridView` | **Analysis_GridView** | `RadGridView` | - | - | - | - |
| `Currency_GridView` | **Currency_GridView** | `RadGridView` | - | - | - | - |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `Note_Discount_After_Tax` | **الخصم** | `RadTextBox` | `Sales_R_Head.Note_Discount_After_Tax` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Net` | **الصافي المستحق** | `RadTextBox` | `Sales_R_Head.Note_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Cost` | **Cost** | `RadTextBox` | `Sales_R_Details.Cost` | `float` (NOT NULL) | `((0))` | - |
| `Note_Discount` | **الخصم** | `RadTextBox` | `Sales_R_Head.Note_Discount` | `float` (NOT NULL) | `((0))` | - |
| `Label34` | **Label34** | `Label` | - | - | - | - |
| `Discount_Amount` | **الخصم** | `RadTextBox` | `Sales_R_Head.Discount_Amount` | `float` (NOT NULL) | `((0))` | - |
| `Label33` | **Label33** | `Label` | - | - | - | - |
| `Discount_Per` | **الخصم** | `RadTextBox` | `Sales_R_Head.Discount_Per` | `float` (NOT NULL) | `((0))` | - |
| `Label29` | **Label29** | `Label` | - | - | - | - |
| `Label32` | **Label32** | `Label` | - | - | - | - |
| `Discount_Per_Amount` | **الخصم** | `RadTextBox` | `Sales_R_Head.Discount_Per_Amount` | `float` (NOT NULL) | `((0))` | - |
| `Note_Net` | **الصافي المستحق** | `RadTextBox` | `Sales_R_Head.Note_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label35` | **Label35** | `Label` | - | - | - | - |
| `SalesMan_Name_A` | **اسم المندوب** | `RadTextBox` | - | - | - | - |
| `SalesMan_ID` | **كود المندوب** | `RadTextBox` | `Sales_R_Head.SalesMan_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label36` | **Label36** | `Label` | - | - | - | - |
| `SalesMen_GridView` | **SalesMen_GridView** | `RadGridView` | - | - | - | - |
| `Print_Journal` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Label37` | **Label37** | `Label` | - | - | - | - |
| `Journal_No` | **Journal_No** | `RadTextBox` | `Sales_R_Head.Journal_No` | `int` (NOT NULL) | `((0))` | - |
| `Cost_Net` | **الصافي المستحق** | `RadTextBox` | `Sales_R_Details.Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Note_Cost` | **Note_Cost** | `TextBox` | `Sales_R_Details.Cost` | `float` (NOT NULL) | `((0))` | - |
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
| `Cmd002` | **Cmd002** | `SqlCommand` | - | - | - | - |
| `Cmd03` | **Cmd03** | `SqlCommand` | - | - | - | - |
| `Cmd003` | **Cmd003** | `SqlCommand` | - | - | - | - |
| `Cmd04` | **Cmd04** | `SqlCommand` | - | - | - | - |
| `Cmd05` | **Cmd05** | `SqlCommand` | - | - | - | - |
| `Cmd06` | **Cmd06** | `SqlCommand` | - | - | - | - |
| `Cmd07` | **Cmd07** | `SqlCommand` | - | - | - | - |
| `Cmd08` | **Cmd08** | `SqlCommand` | - | - | - | - |
| `Cmd09` | **Cmd09** | `SqlCommand` | - | - | - | - |
| `Cmd2` | **Cmd2** | `SqlCommand` | - | - | - | - |
| `Cmd3` | **Cmd3** | `SqlCommand` | - | - | - | - |
| `Cmd4` | **Cmd4** | `SqlCommand` | - | - | - | - |
| `Cmd5` | **Cmd5** | `SqlCommand` | - | - | - | - |
| `Cmd6` | **Cmd6** | `SqlCommand` | - | - | - | - |
| `Cmd7` | **Cmd7** | `SqlCommand` | - | - | - | - |
| `Cmd8` | **Cmd8** | `SqlCommand` | - | - | - | - |
| `Cmd9` | **Cmd9** | `SqlCommand` | - | - | - | - |
| `Balance_Cmd` | **الرصيد / الفارق** | `SqlCommand` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Dt` | **Dt** | `DataTable` | - | - | - | - |
| `Dt_D` | **Dt_D** | `DataTable` | - | - | - | - |
| `Setting_Dt` | **Setting_Dt** | `DataTable` | - | - | - | - |
| `Link_Dt` | **Link_Dt** | `DataTable` | - | - | - | - |

#### ب. قواعد التحقق والمعادلات الحسابية (Validation & Business Rules)
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيـد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم العُملـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المخزن 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم العميــل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم القيد المحاسـبي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إضافة سجل جديد أثناء عملية التعديل. لأضافة سجل يجب الضغط على الغاء التعديل ثم الضغط على سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إجراء تعديل أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: في حالة الإضافة يجب الضغط على سجل جديد وفي حالة التعديل يجب الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السند غير موجود ويجب حفظه أولاً  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء إضافة سجل جديد. للحذف يجب الضغط على الغاء الإضافة ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء تعديل سجل . للحذف يجب الضغط على الغاء التعديل ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد السجل المراد حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد الفاتـورة المطلوبة  
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال وحدة الصرف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الكميـة 
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
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Clients Where Client_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Clients Where Client_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM SalesMen Where SalesMan_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
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
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Clients Where Client_ID=
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
Select * From Sales_Settings Where ID=
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
Select * FROM SalesMen Order By SalesMan_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM Sales_R_Head Order By Note_No Desc
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM Sales_R_Journals_Head Order By Note_No Desc
```
##### استعلام INSERT على جدول `Sales_R_Head`:
```sql
Insert Into Sales_R_Head(Note_No,Note_Date,Note_Date_H,Note_Type,Currency_ID,Exchang,Inventory_ID,Client_ID,Cash_Client_Name,Issue_No,Sales_Order,Analysis_ID,SalesMan_ID,Discount_Per,Discount_Per_Amount,Discount_Amount,Note_Discount,D_Tax_Per,D_Tax_Amount,Vat_Tax_Per,Vat_Tax_Amount,Note_Tax,Note_Discount_After_Tax,Note_Actual_Qty,Note_Actual_Total,Note_Total,Note_Net,Note_Net_With_Tax,Note_Net_Text,Journal_No,Debit_Level5_ID,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Sales_R_Details`:
```sql
Insert Into Sales_R_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Cost,Cost_Net,Actual_Net,Net)Values(
```
##### استعلام INSERT على جدول `Sales_R_Head`:
```sql
Insert Into Sales_R_Journals_Head(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Sales_R_Head`:
```sql
Insert Into Sales_R_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Sales_R_Head`:
```sql
Insert Into Sales_R_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Sales_R_Head`:
```sql
Insert Into Sales_R_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام INSERT على جدول `Sales_R_Head`:
```sql
Insert Into Sales_R_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Analysis_ID,Costcenter_ID,Analyse1)Values(
```
##### استعلام INSERT على جدول `Sales_R_Head`:
```sql
Insert Into Sales_R_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Sales_R_Head`:
```sql
Insert Into Sales_R_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Sales_R_Head Where Note_No=
```
##### استعلام UPDATE على جدول `Sales_R_Head`:
```sql
Update Sales_R_Head Set Note_No=
```
##### استعلام DELETE على جدول `Sales_R_Details`:
```sql
Delete From Sales_R_Details Where Note_No=
```
##### استعلام INSERT على جدول `Sales_R_Details`:
```sql
Insert Into Sales_R_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Cost,Cost_Net,Actual_Net,Net)Values(
```
##### استعلام DELETE على جدول `Sales_R_Head`:
```sql
Delete From Sales_R_Journals_Head Where Note_No=
```
##### استعلام DELETE على جدول `Sales_R_Head`:
```sql
Delete From Sales_R_Journals_Details Where Note_No=
```
##### استعلام INSERT على جدول `Sales_R_Head`:
```sql
Insert Into Sales_R_Journals_Head(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Sales_R_Head`:
```sql
Insert Into Sales_R_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Sales_R_Head`:
```sql
Insert Into Sales_R_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Sales_R_Head`:
```sql
Insert Into Sales_R_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام INSERT على جدول `Sales_R_Head`:
```sql
Insert Into Sales_R_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Analysis_ID,Costcenter_ID,Analyse1)Values(
```
##### استعلام INSERT على جدول `Sales_R_Head`:
```sql
Insert Into Sales_R_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Sales_R_Head`:
```sql
Insert Into Sales_R_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام DELETE على جدول `Sales_R_Head`:
```sql
Delete From Sales_R_Head where Note_No=
```
##### استعلام DELETE على جدول `Sales_R_Details`:
```sql
Delete From Sales_R_Details where Note_No=
```
##### استعلام DELETE على جدول `Sales_R_Head`:
```sql
Delete From Sales_R_Journals_Head Where Note_No=
```
##### استعلام DELETE على جدول `Sales_R_Head`:
```sql
Delete From Sales_R_Journals_Details Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Sales_R_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Sales_R_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Sales_R_Head_View Where Search_Field Like '%
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
Select * FROM Accounts_Analysis_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Currencies Where Currency_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM SalesMen Where SalesMan_Name_A Like '%
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
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Sales_R_Head_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Sales_R_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Sales_R_Head_View Order By Note_No DESC
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Currency_Name_A_LostFocus, Currency_ID_LostFocus, Note_Type_SelectedIndexChanged, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, Note_Discount_After_Tax_GotFocus, Note_Discount_After_Tax_KeyDown, Note_Discount_After_Tax_KeyPress, Note_Discount_After_Tax_LostFocus, SalesMan_ID_GotFocus, SalesMan_Name_A_GotFocus, SalesMan_Name_A_KeyDown, SalesMan_Name_A_LostFocus, SalesMan_ID_KeyDown, SalesMan_ID_KeyPress, SalesMan_ID_LostFocus, SalesMen_GridView_CellClick, SalesMen_GridView_CellFormatting, SalesMen_GridView_KeyDown, Discount_Per_GotFocus, Discount_Per_KeyDown, Discount_Per_KeyPress, Discount_Per_LostFocus, Discount_Per_Amount_GotFocus, Discount_Per_Amount_KeyDown, Discount_Per_Amount_LostFocus, Discount_Amount_GotFocus, Discount_Amount_KeyDown, Discount_Amount_KeyPress, Discount_Amount_LostFocus, Print_Journal_Click, Print_Journal_KeyDown, Note_Net_Text_LostFocus, Unit_ID_GotFocus, Unit_ID_KeyDown, Unit_Name_GotFocus, Unit_Name_KeyDown, Units_GridView_CellClick, Units_GridView_CellFormatting, Units_GridView_KeyDown, Unit_ID_LostFocus, Unit_Name_LostFocus, Note_Date_ValueChanged, Analysis_ID_GotFocus, Analysis_Name_A_GotFocus, Analysis_Name_A_KeyDown, Analysis_Name_A_LostFocus, Analysis_ID_KeyDown, Analysis_ID_KeyPress, Analysis_ID_LostFocus, Currency_Name_A_KeyDown, Exchang_GotFocus, Exchang_KeyDown, Exchang_KeyPress, Exchang_LostFocus, Analysis_GridView_CellClick, Analysis_GridView_CellFormatting, Sales_Order_GotFocus, Sales_Order_KeyDown, Sales_Order_KeyPress, Sales_Order_LostFocus, Client_ID_GotFocus, Client_Name_A_GotFocus, Client_Name_A_KeyDown, Client_Name_A_KeyPress, Client_Name_A_LostFocus, Client_ID_KeyDown, Client_ID_KeyPress, Client_ID_LostFocus, Issue_No_GotFocus, Issue_No_KeyDown, Issue_No_KeyPress, Issue_No_LostFocus, Debit_Level5_ID_GotFocus, Debit_Level5_Name_A_GotFocus, Debit_Level5_Name_A_KeyDown, Debit_Level5_Name_A_LostFocus, Debit_Level5_ID_KeyDown, Debit_Level5_ID_KeyPress, Debit_Level5_ID_LostFocus, D_Tax_Per_GotFocus, D_Tax_Per_KeyDown, D_Tax_Per_KeyPress, D_Tax_Per_LostFocus, D_Tax_Amount_GotFocus, D_Tax_Amount_KeyDown, D_Tax_Amount_KeyPress, D_Tax_Amount_LostFocus, Vat_Tax_Per_GotFocus, Vat_Tax_Per_KeyDown, Vat_Tax_Per_KeyPress, Vat_Tax_Per_LostFocus, Vat_Tax_Amount_GotFocus, Vat_Tax_Amount_KeyDown, Vat_Tax_Amount_KeyPress, Vat_Tax_Amount_LostFocus, Note_Tax_GotFocus, Note_Tax_KeyDown, Note_Tax_LostFocus, Note_Actual_Total_GotFocus, Note_Actual_Total_KeyDown, Note_Actual_Total_LostFocus, Note_Net_With_Tax_GotFocus, Note_Net_With_Tax_KeyDown, Note_Net_With_Tax_LostFocus, Note_Type_GotFocus, Note_Type_KeyDown, Note_Type_KeyPress, Note_Type_LostFocus, Analysis_GridView_KeyDown, Currency_GridView_CellClick, Currency_GridView_CellFormatting, Currency_GridView_KeyDown, Currency_ID_GotFocus, Currency_ID_KeyDown, Currency_ID_KeyPress, Currency_Name_A_GotFocus, Fill_Units_Grid, Fill_SalesMen_Grid, Lock_Control, Enable_Control, Review_Record, Find_Total, Sales_R_Form_KeyDown, Sales_R_Form_Load, Sales_R_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Note_No_GotFocus, Note_No_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Notice_GotFocus, Notice_KeyDown, Notice_KeyPress, Note_Date_KeyDown, Note_Date_Opened, RadGridView1_DoubleClick, RadGridView1_KeyDown, Item_ID_GotFocus, Item_ID_KeyDown, Item_ID_KeyPress, Item_Name_A_GotFocus, Item_Name_A_KeyDown, Items_GridView_CellClick, Items_GridView_CellFormatting, Items_GridView_KeyDown, Actual_Qty_GotFocus, Actual_Qty_KeyDown, Actual_Qty_KeyPress, Actual_Price_GotFocus, Actual_Price_KeyDown, Note_No_KeyPress, Note_No_LostFocus, Notice_LostFocus, Qty_LostFocus, Item_ID_LostFocus, Search_Txt_LostFocus, Inventory_ID_GotFocus, Inventory_ID_KeyDown, Inventory_ID_KeyPress, Inventory_Name_A_GotFocus, Inventory_Name_A_KeyDown, Inventories_GridView_CellClick, Inventories_GridView_CellFormatting, Inventories_GridView_KeyDown, Inventory_ID_LostFocus, Inventory_Name_A_LostFocus, Note_Date_H_GotFocus, Note_Date_H_KeyDown, Note_Date_H_LostFocus, Actual_Net_GotFocus, Actual_Net_KeyDown, Actual_Net_LostFocus, Actual_Price_KeyPress, Actual_Price_LostFocus, Item_Name_A_LostFocus, Note_Actual_Qty_GotFocus, Note_Actual_Qty_KeyDown, Note_Total_GotFocus, Note_Total_KeyDown, Note_Actual_Qty_LostFocus, Note_Total_LostFocus, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, set_Label7, get_Client_ID, set_Client_ID, get_Label12, set_Label12, get_Note_Type, set_Note_Type, get_Currency_Name_A, set_Currency_Name_A, get_Exchang, set_Exchang, get_Label17, set_Label17, get_Label27, set_Label27, get_Currency_ID, set_Currency_ID, get_Analysis_Name_A, set_Analysis_Name_A, get_Analysis_ID, set_Analysis_ID, get_Label19, set_Label19, get_Note_Net_With_Tax, set_Note_Net_With_Tax, get_Label16, set_Label16, get_Note_Actual_Total, set_Note_Actual_Total, get_Label25, set_Label25, get_Vat_Tax_Per, set_Vat_Tax_Per, get_Label24, set_Label24, get_Note_Tax, set_Note_Tax, get_Label23, set_Label23, get_D_Tax_Per, set_D_Tax_Per, get_Label22, set_Label22, get_Label20, set_Label20, get_Vat_Tax_Amount, set_Vat_Tax_Amount, get_Label21, set_Label21, get_D_Tax_Amount, set_D_Tax_Amount, get_Credit_Level5_Name_A, set_Credit_Level5_Name_A, get_Credit_Level5_ID, set_Credit_Level5_ID, get_Label30, set_Label30, get_Sales_Order, set_Sales_Order, get_Label31, set_Label31, get_Note_Net_Text, set_Note_Net_Text, get_Analysis_GridView, set_Analysis_GridView, get_Currency_GridView, set_Currency_GridView, get_Level5_GridView, set_Level5_GridView, get_AquaTheme1, set_AquaTheme1, get_Note_Discount_After_Tax, set_Note_Discount_After_Tax, get_Net, set_Net, get_Cost, set_Cost, get_Note_Discount, set_Note_Discount, get_Label34, set_Label34, get_Discount_Amount, set_Discount_Amount, get_Label33, set_Label33, get_Discount_Per, set_Discount_Per, get_Label29, set_Label29, get_Label32, set_Label32, get_Discount_Per_Amount, set_Discount_Per_Amount, get_Note_Net, set_Note_Net, get_Label35, set_Label35, get_SalesMan_Name_A, set_SalesMan_Name_A, get_SalesMan_ID, set_SalesMan_ID, get_Label36, set_Label36, get_SalesMen_GridView, set_SalesMen_GridView, get_Print_Journal, set_Print_Journal, get_Label37, set_Label37, get_Journal_No, set_Journal_No, get_Cost_Net, set_Cost_Net, get_Note_Cost, set_Note_Cost, Clear_Record, Clear_Data, Fill_Grid, Fill_Level5_Grid, Fill_Analysis_Grid, Fill_Currencies_Grid, Fill_Inventories_Grid, Fill_Items_Grid, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadPanel4, set_RadPanel4, get_RadGridView1, set_RadGridView1, get_Note_Date, set_Note_Date, get_Items_GridView, set_Items_GridView, get_RadLabel15, set_RadLabel15, get_Label13, set_Label13, get_Label8, set_Label8, get_Label6, set_Label6, get_Note_No, set_Note_No, get_Notice, set_Notice, get_Label4, set_Label4, get_Label9, set_Label9, get_Label10, set_Label10, get_Label11, set_Label11, get_Actual_Qty, set_Actual_Qty, get_Unit_Name, set_Unit_Name, get_Item_Name_A, set_Item_Name_A, get_Item_ID, set_Item_ID, get_Label15, set_Label15, get_Actual_Net, set_Actual_Net, get_Label14, set_Label14, get_Actual_Price, set_Actual_Price, get_Label26, set_Label26, get_Note_Total, set_Note_Total, get_Label28, set_Label28, get_Note_Actual_Qty, set_Note_Actual_Qty, get_Note_Net_With_Tax_Text, set_Note_Net_With_Tax_Text, get_SR, set_SR, get_Inventory_Name_A, set_Inventory_Name_A, get_Label1, set_Label1, get_Inventory_ID, set_Inventory_ID, get_Unit_ID, set_Unit_ID, get_Note_Date_H, set_Note_Date_H, get_Label2, set_Label2, get_Qty, set_Qty, get_Price, set_Price, get_Units_GridView, set_Units_GridView, get_Inventories_GridView, set_Inventories_GridView, get_Label3, set_Label3, get_Unit_Exchang, set_Unit_Exchang, get_Label5, set_Label5, get_Issue_No, set_Issue_No, get_Client_Name_A, set_Client_Name_A, get_Label7
```

---

### 3.8 شاشة: إعدادات وتوجيه المبيعات (`Sales_Settings_Form`)
- **الاسم الإنجليزي:** Sales Accounting Settings
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** تهيئة حسابات المبيعات، ضريبة القيمة المضافة المحصلة، الخصم المسموح به، وتوجيه اليومية
- **جداول قاعدة البيانات المستهدفة:** `Sales_Settings`

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
| `D_Tax_Registery_Option` | **ضريبة القيمة المضافة** | `RadCheckBox` | `Sales_Settings.D_Tax_Registery_Option` | `smallint` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Label16` | **Label16** | `Label` | - | - | - | - |
| `D_Tax_Per` | **ضريبة القيمة المضافة** | `RadTextBox` | `Sales_Settings.D_Tax_Per` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Debit_Treasury_ID` | **المبلغ مدين** | `RadTextBox` | `Sales_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Debit_D_Tax_ID` | **المبلغ مدين** | `RadTextBox` | `Sales_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Credit_D_Tax_ID` | **المبلغ دائن** | `RadTextBox` | `Sales_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Debit_Vat_ID` | **المبلغ مدين** | `RadTextBox` | `Sales_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Label39` | **Label39** | `Label` | - | - | - | - |
| `Label28` | **Label28** | `Label` | - | - | - | - |
| `Label34` | **Label34** | `Label` | - | - | - | - |
| `Label35` | **Label35** | `Label` | - | - | - | - |
| `Sales_R_Link_Option` | **Sales_R_Link_Option** | `RadCheckBox` | `Sales_Settings.Sales_R_Link_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Debit_Treasury_Name_A` | **المبلغ مدين** | `RadTextBox` | `Sales_Settings.Debit_Treasury_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Debit_D_Tax_Name_A` | **المبلغ مدين** | `RadTextBox` | `Sales_Settings.Debit_D_Tax_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Credit_D_Tax_Name_A` | **المبلغ دائن** | `RadTextBox` | `Sales_Settings.Credit_D_Tax_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Debit_Vat_Name_A` | **المبلغ مدين** | `RadTextBox` | `Sales_Settings.Debit_Vat_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Currency_Name_A` | **اسم العملة** | `RadTextBox` | `Sales_Settings.Currency_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Costcenter_Name_A` | **اسم مركز التكلفة** | `RadTextBox` | `Sales_Settings.Costcenter_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Cash_Client_Name_A` | **اسم العميل** | `RadTextBox` | `Sales_Settings.Cash_Client_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Analysis_Name_A` | **اسم الحساب التحليلي** | `RadTextBox` | `Sales_Settings.Analysis_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Currency_ID` | **كود العملة** | `RadTextBox` | `Sales_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Costcenter_ID` | **كود مركز التكلفة** | `RadTextBox` | `Sales_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Cash_Client_ID` | **كود العميل** | `RadTextBox` | `Sales_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Analysis_ID` | **كود الحساب التحليلي** | `RadTextBox` | `Sales_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Label43` | **Label43** | `Label` | - | - | - | - |
| `Label41` | **Label41** | `Label` | - | - | - | - |
| `Label42` | **Label42** | `Label` | - | - | - | - |
| `Label37` | **Label37** | `Label` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `Credit_Treasury_Name_A` | **المبلغ دائن** | `RadTextBox` | `Sales_Settings.Credit_Treasury_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Credit_Treasury_ID` | **المبلغ دائن** | `RadTextBox` | `Sales_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Label7` | **Label7** | `Label` | - | - | - | - |
| `Credit_Vat_Name_A` | **المبلغ دائن** | `RadTextBox` | `Sales_Settings.Credit_Vat_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Credit_Vat_ID` | **المبلغ دائن** | `RadTextBox` | `Sales_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Label32` | **Label32** | `Label` | - | - | - | - |
| `RadPanel8` | **RadPanel8** | `RadPanel` | - | - | - | - |
| `Currency_Option` | **Currency_Option** | `RadCheckBox` | `Sales_Settings.Currency_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Search_By_Balance_Option` | **الرصيد / الفارق** | `RadCheckBox` | `Sales_Settings.Search_By_Balance_Option` | `smallint` (NOT NULL) | `((0))` | `Balance = Previous_Balance + Debit - Credit` |
| `Note_Type` | **Note_Type** | `RadDropDownList` | - | - | - | - |
| `Decimals_Option` | **Decimals_Option** | `RadDropDownList` | `Sales_Settings.Decimals_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Sales_Settings.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Sales_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Label8` | **Label8** | `Label` | - | - | - | - |
| `Inventory_Name_A` | **Inventory_Name_A** | `RadTextBox` | `Sales_Settings.Inventory_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Label10` | **Label10** | `Label` | - | - | - | - |
| `Inventory_ID` | **كود المخزن** | `RadTextBox` | `Sales_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Vat_Per` | **Vat_Per** | `RadTextBox` | `Sales_Settings.Vat_Per` | `float` (NOT NULL) | `((0))` | - |
| `Vat_Registery_Option` | **Vat_Registery_Option** | `RadCheckBox` | `Sales_Settings.Vat_Registery_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Costcenters_Option` | **Costcenters_Option** | `RadCheckBox` | `Sales_Settings.Costcenters_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Analysis_Option` | **Analysis_Option** | `RadCheckBox` | `Sales_Settings.Analysis_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Tax_Edit_Option` | **ضريبة القيمة المضافة** | `RadCheckBox` | `Sales_Settings.Tax_Edit_Option` | `smallint` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Accounts_Search_Option` | **حقل / زر البحث** | `RadCheckBox` | `Sales_Settings.Accounts_Search_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Sales_Link_Option` | **Sales_Link_Option** | `RadCheckBox` | `Sales_Settings.Sales_Link_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Costcenters_GridView` | **Costcenters_GridView** | `RadGridView` | - | - | - | - |
| `Analysis_GridView` | **Analysis_GridView** | `RadGridView` | - | - | - | - |
| `Currency_GridView` | **Currency_GridView** | `RadGridView` | - | - | - | - |
| `Inventories_GridView` | **Inventories_GridView** | `RadGridView` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `Discount_After_Tax_Option` | **الخصم** | `RadCheckBox` | `Sales_Settings.Discount_After_Tax_Option` | `smallint` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Discount_Option` | **الخصم** | `RadCheckBox` | `Sales_Settings.Discount_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `SalesMen_Option` | **SalesMen_Option** | `RadCheckBox` | `Sales_Settings.SalesMen_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Cost_Name_A` | **Cost_Name_A** | `RadTextBox` | `Sales_Settings.Cost_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Cost_ID` | **Cost_ID** | `RadTextBox` | `Sales_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Cost_Link_Option` | **Cost_Link_Option** | `RadCheckBox` | `Sales_Settings.Cost_Link_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `SalesMan_Name_A` | **اسم المندوب** | `RadTextBox` | `Sales_Settings.SalesMan_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `SalesMan_ID` | **كود المندوب** | `RadTextBox` | `Sales_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Credit_Revenue_ID` | **المبلغ دائن** | `RadTextBox` | `Sales_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Credit_Revenue_Name_A` | **المبلغ دائن** | `RadTextBox` | `Sales_Settings.Credit_Revenue_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `RadPanel9` | **RadPanel9** | `RadPanel` | - | - | - | - |
| `Label12` | **Label12** | `Label` | - | - | - | - |
| `RadPanel7` | **RadPanel7** | `RadPanel` | - | - | - | - |
| `Label11` | **Label11** | `Label` | - | - | - | - |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `RadPanel11` | **RadPanel11** | `RadPanel` | - | - | - | - |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `RadPanel10` | **RadPanel10** | `RadPanel` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Debit_Revenue_Name_A` | **المبلغ مدين** | `RadTextBox` | `Sales_Settings.Debit_Revenue_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `Debit_Revenue_ID` | **المبلغ مدين** | `RadTextBox` | `Sales_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | `((1))` | - |
| `Label15` | **Label15** | `Label` | - | - | - | - |
| `SalesMen_GridView` | **SalesMen_GridView** | `RadGridView` | - | - | - | - |
| `RadPanel13` | **RadPanel13** | `RadPanel` | - | - | - | - |
| `Price_Option` | **السعر الفردي** | `RadDropDownList` | `Sales_Settings.Price_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Label18` | **Label18** | `Label` | - | - | - | - |
| `RadPanel12` | **RadPanel12** | `RadPanel` | - | - | - | - |
| `Journals_Post_Type` | **Journals_Post_Type** | `RadDropDownList` | `Sales_Settings.Journals_Post_Type` | `smallint` (NOT NULL) | `((0))` | - |
| `Label17` | **Label17** | `Label` | - | - | - | - |
| `Note_Type_Option` | **Note_Type_Option** | `RadCheckBox` | `Sales_Settings.Note_Type_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `RadPanel14` | **RadPanel14** | `RadPanel` | - | - | - | - |
| `Cost_Option` | **Cost_Option** | `RadDropDownList` | `Sales_Settings.Cost_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Label19` | **Label19** | `Label` | - | - | - | - |
| `Clients_Limit_Option` | **Clients_Limit_Option** | `RadCheckBox` | `Sales_Settings.Clients_Limit_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Suppliers_Limit_Option` | **Suppliers_Limit_Option** | `RadCheckBox` | `Sales_Settings.Suppliers_Limit_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Note_Cost_Option` | **Note_Cost_Option** | `RadCheckBox` | `Sales_Settings.Cost_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Search_By_Enter` | **حقل / زر البحث** | `RadCheckBox` | `Sales_Settings.Search_By_Enter` | `smallint` (NOT NULL) | `((0))` | - |
| `Client_Balance_Option` | **الرصيد / الفارق** | `RadCheckBox` | `Sales_Settings.Client_Balance_Option` | `smallint` (NOT NULL) | `((0))` | `Balance = Previous_Balance + Debit - Credit` |
| `Sales_Without_Balance_Option` | **الرصيد / الفارق** | `RadCheckBox` | `Sales_Settings.Sales_Without_Balance_Option` | `smallint` (NOT NULL) | `((0))` | `Balance = Previous_Balance + Debit - Credit` |
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
| `Cmd7` | **Cmd7** | `SqlCommand` | - | - | - | - |
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم مندوب البيـع 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المستخدم الحالي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال حسـاب القيمة المضافة - مدين 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال حسـاب الإيـرادات - مدين 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال حسـاب الخزينـة - دائـن 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال حسـاب ضريبة الخصم والإضافة - دائـن 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال حسـاب ضريبة الخصم والإضافة - مدين 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال حسـاب الخزينـة - مديـن 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال حسـاب القيمـة المضافة - دائـن 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال حسـاب الإيـرادات - دائـن 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال حسـاب تكلفـة المبيعـات 
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
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM SalesMen Where SalesMan_ID=
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
Select * FROM Sales_Settings Where ID=
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
Select * FROM SalesMen Order By SalesMan_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users Where User_ID=
```
##### استعلام UPDATE على جدول `Sales_Settings`:
```sql
Update Sales_Settings Set Inventory_ID=
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
Select * FROM SalesMen Where SalesMan_Name_A Like '%
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

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Currency_GridView_CellFormatting, Currency_GridView_KeyDown, Vat_Per_GotFocus, Vat_Per_KeyPress, Vat_Per_LostFocus, D_Tax_Per_GotFocus, D_Tax_Per_KeyPress, D_Tax_Per_LostFocus, SalesMan_ID_GotFocus, SalesMan_ID_KeyPress, SalesMan_ID_LostFocus, SalesMan_Name_A_GotFocus, SalesMan_Name_A_LostFocus, Credit_Revenue_ID_GotFocus, Credit_Revenue_ID_KeyPress, Credit_Revenue_ID_LostFocus, Credit_Revenue_Name_A_GotFocus, Credit_Revenue_Name_A_LostFocus, Debit_Revenue_ID_GotFocus, Debit_Revenue_ID_KeyPress, Debit_Revenue_ID_LostFocus, Debit_Revenue_Name_A_GotFocus, Debit_Revenue_Name_A_LostFocus, Cost_ID_GotFocus, Cost_ID_KeyPress, Cost_ID_LostFocus, Cost_Name_A_GotFocus, Cost_Name_A_LostFocus, Lock_Settings_Control, Enable_Settings_Control, Review_Settings_Record, Sales_Settings_Form_Load, Sales_Settings_Form_Resize, Modify_Click, Save_Click, F_Exit_Click, Search_Option2_Click, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, Search_Txt_LostFocus, Debit_Vat_ID_GotFocus, Debit_Vat_ID_KeyPress, Debit_Vat_ID_LostFocus, Debit_Vat_Name_A_GotFocus, Debit_Vat_Name_A_LostFocus, Credit_D_Tax_ID_GotFocus, Credit_D_Tax_ID_KeyPress, Credit_D_Tax_ID_LostFocus, Credit_D_Tax_Name_A_GotFocus, Credit_D_Tax_Name_A_LostFocus, Debit_D_Tax_ID_GotFocus, Debit_D_Tax_ID_KeyPress, Debit_D_Tax_ID_LostFocus, Debit_D_Tax_Name_A_GotFocus, Debit_D_Tax_Name_A_LostFocus, Credit_Vat_ID_GotFocus, Credit_Vat_ID_KeyPress, Credit_Vat_ID_LostFocus, Credit_Vat_Name_A_GotFocus, Credit_Vat_Name_A_LostFocus, Debit_Treasury_ID_GotFocus, Debit_Treasury_ID_KeyPress, Debit_Treasury_ID_LostFocus, Debit_Treasury_Name_A_GotFocus, Debit_Treasury_Name_A_LostFocus, Credit_Treasury_ID_GotFocus, Credit_Treasury_ID_KeyPress, Credit_Treasury_ID_LostFocus, Credit_Treasury_Name_A_GotFocus, Credit_Treasury_Name_A_LostFocus, Analysis_ID_GotFocus, Analysis_ID_KeyPress, Analysis_ID_LostFocus, Analysis_Name_A_GotFocus, Analysis_Name_A_LostFocus, Cash_Client_ID_GotFocus, Cash_Client_ID_KeyPress, Cash_Client_ID_LostFocus, Cash_Client_Name_A_GotFocus, Cash_Client_Name_A_LostFocus, Currency_ID_GotFocus, Currency_ID_KeyPress, Currency_ID_LostFocus, Currency_Name_A_GotFocus, Currency_Name_A_LostFocus, Costcenter_ID_GotFocus, Costcenter_ID_KeyPress, Costcenter_ID_LostFocus, Costcenter_Name_A_GotFocus, Costcenter_Name_A_LostFocus, Inventory_ID_GotFocus, Inventory_ID_KeyPress, Inventory_ID_LostFocus, Inventory_Name_A_GotFocus, Inventory_Name_A_LostFocus, Entry_ID_GotFocus, Entry_ID_LostFocus, Entry_Name_GotFocus, Entry_Name_LostFocus, Inventories_GridView_CellClick, Inventories_GridView_CellFormatting, Inventories_GridView_KeyDown, Analysis_GridView_CellClick, Analysis_GridView_CellFormatting, Analysis_GridView_KeyDown, Costcenters_GridView_CellClick, Costcenters_GridView_CellFormatting, Costcenters_GridView_KeyDown, Currency_GridView_CellClick, set_Inventory_Name_A, get_Label9, set_Label9, get_Label10, set_Label10, get_Inventory_ID, set_Inventory_ID, get_Label2, set_Label2, get_Label3, set_Label3, get_Vat_Per, set_Vat_Per, get_Vat_Registery_Option, set_Vat_Registery_Option, get_Costcenters_Option, set_Costcenters_Option, get_Analysis_Option, set_Analysis_Option, get_Tax_Edit_Option, set_Tax_Edit_Option, get_Accounts_Search_Option, set_Accounts_Search_Option, get_Sales_Link_Option, set_Sales_Link_Option, get_Costcenters_GridView, set_Costcenters_GridView, get_Analysis_GridView, set_Analysis_GridView, get_Currency_GridView, set_Currency_GridView, get_Inventories_GridView, set_Inventories_GridView, get_AquaTheme1, set_AquaTheme1, get_Discount_After_Tax_Option, set_Discount_After_Tax_Option, get_Discount_Option, set_Discount_Option, get_SalesMen_Option, set_SalesMen_Option, get_RadPanel3, set_RadPanel3, get_Cost_Name_A, set_Cost_Name_A, get_Cost_ID, set_Cost_ID, get_Cost_Link_Option, set_Cost_Link_Option, get_SalesMan_Name_A, set_SalesMan_Name_A, get_SalesMan_ID, set_SalesMan_ID, get_Label4, set_Label4, get_Credit_Revenue_ID, set_Credit_Revenue_ID, get_Credit_Revenue_Name_A, set_Credit_Revenue_Name_A, get_RadPanel9, set_RadPanel9, get_Label12, set_Label12, get_RadPanel7, set_RadPanel7, get_Label11, set_Label11, get_Label5, set_Label5, get_RadPanel11, set_RadPanel11, get_Label14, set_Label14, get_RadPanel10, set_RadPanel10, get_Label13, set_Label13, get_Debit_Revenue_Name_A, set_Debit_Revenue_Name_A, get_Debit_Revenue_ID, set_Debit_Revenue_ID, get_Label15, set_Label15, get_SalesMen_GridView, set_SalesMen_GridView, get_RadPanel13, set_RadPanel13, get_Price_Option, set_Price_Option, get_Label18, set_Label18, get_RadPanel12, set_RadPanel12, get_Journals_Post_Type, set_Journals_Post_Type, get_Label17, set_Label17, get_Note_Type_Option, set_Note_Type_Option, get_RadPanel14, set_RadPanel14, get_Cost_Option, set_Cost_Option, get_Label19, set_Label19, get_Clients_Limit_Option, set_Clients_Limit_Option, get_Suppliers_Limit_Option, set_Suppliers_Limit_Option, get_Note_Cost_Option, set_Note_Cost_Option, get_Search_By_Enter, set_Search_By_Enter, get_Client_Balance_Option, set_Client_Balance_Option, get_Sales_Without_Balance_Option, set_Sales_Without_Balance_Option, Fill_Level5_Grid, Fill_Analysis_Grid, Fill_Costcenters_Grid, Fill_Currencies_Grid, Fill_Inventories_Grid, Fill_Salesmen_Grid, Clear_Record, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_DesertTheme1, set_DesertTheme1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadPanel6, set_RadPanel6, get_Modify, set_Modify, get_Save, set_Save, get_F_Exit, set_F_Exit, get_Settings_Panel, set_Settings_Panel, get_RadPanel5, set_RadPanel5, get_Search_Txt, set_Search_Txt, get_Search_Option2, set_Search_Option2, get_D_Tax_Registery_Option, set_D_Tax_Registery_Option, get_Level5_GridView, set_Level5_GridView, get_RadPanel2, set_RadPanel2, get_Label1, set_Label1, get_Label16, set_Label16, get_D_Tax_Per, set_D_Tax_Per, get_RadPanel1, set_RadPanel1, get_Debit_Treasury_ID, set_Debit_Treasury_ID, get_Debit_D_Tax_ID, set_Debit_D_Tax_ID, get_Credit_D_Tax_ID, set_Credit_D_Tax_ID, get_Debit_Vat_ID, set_Debit_Vat_ID, get_Label39, set_Label39, get_Label28, set_Label28, get_Label34, set_Label34, get_Label35, set_Label35, get_Sales_R_Link_Option, set_Sales_R_Link_Option, get_Debit_Treasury_Name_A, set_Debit_Treasury_Name_A, get_Debit_D_Tax_Name_A, set_Debit_D_Tax_Name_A, get_Credit_D_Tax_Name_A, set_Credit_D_Tax_Name_A, get_Debit_Vat_Name_A, set_Debit_Vat_Name_A, get_Currency_Name_A, set_Currency_Name_A, get_Costcenter_Name_A, set_Costcenter_Name_A, get_Cash_Client_Name_A, set_Cash_Client_Name_A, get_Analysis_Name_A, set_Analysis_Name_A, get_Currency_ID, set_Currency_ID, get_Costcenter_ID, set_Costcenter_ID, get_Cash_Client_ID, set_Cash_Client_ID, get_Analysis_ID, set_Analysis_ID, get_Label43, set_Label43, get_Label41, set_Label41, get_Label42, set_Label42, get_Label37, set_Label37, get_RadPanel4, set_RadPanel4, get_Credit_Treasury_Name_A, set_Credit_Treasury_Name_A, get_Credit_Treasury_ID, set_Credit_Treasury_ID, get_Label7, set_Label7, get_Credit_Vat_Name_A, set_Credit_Vat_Name_A, get_Credit_Vat_ID, set_Credit_Vat_ID, get_Label32, set_Label32, get_RadPanel8, set_RadPanel8, get_Currency_Option, set_Currency_Option, get_Search_By_Balance_Option, set_Search_By_Balance_Option, get_Note_Type, set_Note_Type, get_Decimals_Option, set_Decimals_Option, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_Label6, set_Label6, get_Label8, set_Label8, get_Inventory_Name_A
```

---

