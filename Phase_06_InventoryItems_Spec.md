# مواصفات ومخطط الوحدة المعمارية: المخازن وبطاقات الأصناف وحركات الصرف والإضافة (Inventory & Items)
**المرحلة البرمجية:** المرحلة 6 (`Phase 06`)
**التطبيق المصدر:** `APPS ERP Application 2023.exe` (Tarabot ERP)
**قاعدة البيانات المستهدفة:** `MK_Khalil_Db_2026` (SQL Server)
**تاريخ الاستخراج الآلي:** 2026-11-03 22:30:55
---

## 1. النبذة الهندسية والهدف الوظيفي للوحدة
تتولى هذه الوحدة إدارة كافة العمليات والبيانات الخاصة بـ **المخازن وبطاقات الأصناف وحركات الصرف والإضافة**، وتوفر دورة عمل متكاملة تبدأ من تهيئة الإعدادات والشاشات الثابتة وحتى تنفيذ العمليات اليومية وترحيلها محاسبياً ومخزنياً وفق المعايير المعتمدة في النظام.

تحتوي هذه الوحدة على **15 شاشة نموذج رئيسية** تم تشريحها واستخراج كافة عناصر التحكم، وخطوط أنابيب البيانات، والمعادلات الرياضية، وقواعد التحقق الخاصة بها.

---

## 2. الفهرس التشغيلي لشاشات الوحدة
| # | اسم الشاشة البرمجية (Form Class) | المسمى العربي | المسمى الإنجليزي | الجداول المرتبطة في قاعدة البيانات |
|---|---|---|---|---|
| 1 | `Inventory_Form` | **دليل المستودعات والمخازن** | Warehouse & Store Directory | `Inventories` |
| 2 | `Items_Types_Form` | **تصنيفات وأنواع الأصناف** | Item Types Directory | `Items_Types` |
| 3 | `Main_Categories_Form` | **المجموعات الرئيسية للأصناف** | Main Item Categories | `Main_Categories` |
| 4 | `Sub_Categories_Form` | **المجموعات الفرعية للأصناف** | Sub Item Categories | `Sub_Categories` |
| 5 | `Units_Form` | **وحدات القياس والتحويل** | Units of Measure (UOM) | `Units` |
| 6 | `Items_Form` | **بطاقة الصنف الشاملة والأسعار والباركود** | Master Item Card & Multi-UOM | `Items, Items_Details` |
| 7 | `Stock_Form` | **أرصدة أول المدة للمخازن** | Beginning Inventory Balances | `Stock_Head, Stock_Details` |
| 8 | `Internal_Issue_Form` | **إذن صرف مخزني داخلي** | Internal Stock Issue Note | `Internal_Issue_Head, Internal_Issue_Details` |
| 9 | `Internal_Delivery_Form` | **إذن إضافة واستلام مخزني داخلي** | Internal Stock Receipt Note | `Internal_Delivery_Head, Internal_Delivery_Details` |
| 10 | `External_Issue_Form` | **إذن صرف خارجي (أمانات / تشغيل لدى الغير)** | External Consignment Issue Note | `External_Issue_Head, External_Issue_Details` |
| 11 | `External_Delivery_Form` | **إذن إضافة / استلام خارجي** | External Consignment Receipt Note | `External_Delivery_Head, External_Delivery_Details` |
| 12 | `Transfer_Form` | **التحويل بين المخازن** | Inter-Warehouse Transfer | `Transfer_Issue_Head, Transfer_Issue_Details, Transfer_Delivery_Head, Transfer_Delivery_Details` |
| 13 | `Stock_Adjustment_Form` | **تسوية جردية للمخزون** | Inventory Stock Adjustment | `Stock_Adjustment_Head, Stock_Adjustment_Details` |
| 14 | `Unpack_Assemble_Form` | **تجميع وتفكيك الأصناف المركبة** | Kit Assembly & Disassembly | `Unpack_Assemble_Head, Unpack_Assemble_Details` |
| 15 | `Stock_Settings_Form` | **إعدادات وتوجيه المخازن** | Inventory Accounting Settings | `Stock_Settings` |

---

## 3. التشريح التفصيلي لنماذج الشاشات (Forms Technical Catalog)
### 3.1 شاشة: دليل المستودعات والمخازن (`Inventory_Form`)
- **الاسم الإنجليزي:** Warehouse & Store Directory
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** تعريف المستودعات، أمناء العهدة، المواقع الجغرافية، وحسابات مراقبة المخزون
- **جداول قاعدة البيانات المستهدفة:** `Inventories`

#### أ. كتالوج حقول وعناصر التحكم (Field & Control Catalog Table)
| معرف العنصر (Control ID) | التسمية العربية (Label) | نوع عنصر الواجهة | الربط بقاعدة البيانات (DB Binding) | نوع البيانات والقيود (Type & Constraints) | القيمة الافتراضية | المعادلة / السلوك البرمجي |
|---|---|---|---|---|---|---|
| `Windows7Theme1` | **Windows7Theme1** | `Windows7Theme` | - | - | - | - |
| `Search_Txt` | **حقل / زر البحث** | `RadTextBox` | - | - | - | - |
| `Inventory_Name_E` | **Inventory_Name_E** | `RadTextBox` | `Inventories.Inventory_Name_E` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `GridView` | **GridView** | `RadGridView` | - | - | - | - |
| `Inventory_ID` | **كود المخزن** | `RadTextBox` | `Inventories.Inventory_ID` | `numeric` (PRIMARY KEY, NOT NULL) | - | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `Inventory_Name_A` | **Inventory_Name_A** | `RadTextBox` | `Inventories.Inventory_Name_A` | `nvarchar(100)` (NOT NULL) | `(' ')` | - |
| `RadLabel1` | **RadLabel1** | `RadLabel` | - | - | - | - |
| `RadLabel2` | **RadLabel2** | `RadLabel` | - | - | - | - |
| `RadLabel5` | **RadLabel5** | `RadLabel` | - | - | - | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Inventories.Notice` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `RadLabel3` | **RadLabel3** | `RadLabel` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadLabel15` | **RadLabel15** | `RadLabel` | - | - | - | - |
| `Address` | **زر إضافة جديد** | `RadTextBox` | `Inventories.Address` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `RadLabel16` | **RadLabel16** | `RadLabel` | - | - | - | - |
| `Manger_Name` | **Manger_Name** | `RadTextBox` | `Inventories.Manger_Name` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `RadLabel12` | **RadLabel12** | `RadLabel` | - | - | - | - |
| `Mobile` | **Mobile** | `RadTextBox` | `Inventories.Mobile` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `RadLabel13` | **RadLabel13** | `RadLabel` | - | - | - | - |
| `Fax` | **Fax** | `RadTextBox` | `Inventories.Fax` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Tel` | **Tel** | `RadTextBox` | `Inventories.Tel` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `RadLabel14` | **RadLabel14** | `RadLabel` | - | - | - | - |
| `RadPanel6` | **RadPanel6** | `RadPanel` | - | - | - | - |
| `Search_Option2` | **حقل / زر البحث** | `RadRadioButton` | - | - | - | - |
| `Save` | **زر حفظ السجل** | `RadButton` | - | - | - | - |
| `Delete` | **زر حذف السجل** | `RadButton` | - | - | - | - |
| `F_Exit` | **F_Exit** | `RadButton` | - | - | - | - |
| `Add` | **زر إضافة جديد** | `RadButton` | - | - | - | - |
| `Modify` | **زر تعديل السجل** | `RadButton` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Inventories.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Inventories.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
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
| `Dt` | **Dt** | `DataTable` | - | - | - | - |
| `Dt1` | **Dt1** | `DataTable` | - | - | - | - |
| `Dt_RS` | **Dt_RS** | `DataTable` | - | - | - | - |
| `Dt_RS1` | **Dt_RS1** | `DataTable` | - | - | - | - |
| `Dt_RS2` | **Dt_RS2** | `DataTable` | - | - | - | - |
| `Dt_RS6` | **Dt_RS6** | `DataTable` | - | - | - | - |
| `Delete_RS` | **زر حذف السجل** | `DataTable` | - | - | - | - |

#### ب. قواعد التحقق والمعادلات الحسابية (Validation & Business Rules)
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المخـزن 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسم المخـزن 
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
Select * FROM Inventories Where Inventory_Name_A='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_Name_E='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Order By Inventory_ID
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
Select * From Level4 Where Module_Type=4  Order By Level4_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Inventory_ID FROM Inventories Order By Inventory_ID Desc
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_ID=
```
##### استعلام INSERT على جدول `Inventories`:
```sql
Insert Into Inventories(Inventory_ID,Inventory_Name_A,Inventory_Name_E,Tel,Fax,Mobile,Manger_Name,Address,Entry_ID,Entry_Name,Notice)Values(
```
##### استعلام INSERT على جدول `Inventories`:
```sql
Insert Into Level5(Level4_ID,Level5_ID,Level5_Name_A,Level5_Name_E,Entry_ID,Entry_Name,Notice)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_ID=
```
##### استعلام UPDATE على جدول `Inventories`:
```sql
Update Inventories Set Inventory_ID=
```
##### استعلام UPDATE على جدول `Inventories`:
```sql
Update Level5 Set Level4_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_ID=
```
##### استعلام DELETE على جدول `Inventories`:
```sql
Delete From Inventories where Inventory_ID=
```
##### استعلام DELETE على جدول `Inventories`:
```sql
Delete From Level5 where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_ID=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Inventory_ID_KeyDown, Inventory_Name_A_GotFocus, Inventory_Name_A_KeyPress, Inventory_Name_A_KeyDown, Inventory_Name_E_GotFocus, Inventory_Name_E_KeyPress, Inventory_Name_E_KeyDown, Notice_GotFocus, Notice_KeyPress, Notice_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Tel_GotFocus, Tel_KeyDown, Tel_KeyPress, Fax_GotFocus, Fax_KeyDown, Fax_KeyPress, Mobile_GotFocus, Mobile_KeyDown, Mobile_KeyPress, Manger_Name_GotFocus, Manger_Name_KeyDown, Address_GotFocus, Address_KeyDown, Manger_Name_KeyPress, Address_KeyPress, Tel_LostFocus, Search_Txt_LostFocus, Notice_LostFocus, Mobile_LostFocus, Manger_Name_LostFocus, Inventory_Name_E_LostFocus, Inventory_Name_A_LostFocus, Inventory_ID_LostFocus, Address_LostFocus, Fax_LostFocus, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Search_Txt, set_Search_Txt, get_Inventory_Name_E, set_Inventory_Name_E, get_GridView, set_GridView, get_Inventory_ID, set_Inventory_ID, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_DesertTheme1, set_DesertTheme1, get_Inventory_Name_A, set_Inventory_Name_A, get_RadLabel1, set_RadLabel1, get_RadLabel2, set_RadLabel2, get_RadLabel5, set_RadLabel5, get_Notice, set_Notice, get_RadLabel3, set_RadLabel3, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadLabel15, set_RadLabel15, get_Address, set_Address, get_RadLabel16, set_RadLabel16, get_Manger_Name, set_Manger_Name, get_RadLabel12, set_RadLabel12, get_Mobile, set_Mobile, get_RadLabel13, set_RadLabel13, get_Fax, set_Fax, get_Tel, set_Tel, get_RadLabel14, set_RadLabel14, get_RadPanel6, set_RadPanel6, get_Search_Option2, set_Search_Option2, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Add, set_Add, get_Modify, set_Modify, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_AquaTheme1, set_AquaTheme1, Clear_Record, Clear_Data, Fill_Grid, Lock_Control, Enable_Control, Review_Record, Inventory_Form_KeyDown, Inventory_Form_Load, Inventory_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Option2_Click, Search_Option2_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Inventory_ID_GotFocus, Inventory_ID_KeyPress
```

---

### 3.2 شاشة: تصنيفات وأنواع الأصناف (`Items_Types_Form`)
- **الاسم الإنجليزي:** Item Types Directory
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** تصنيف الأصناف إلى بضائع مشتراة، مصنعة، مواد خام، أو خدمات غير مخزنية
- **جداول قاعدة البيانات المستهدفة:** `Items_Types`

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
| `Item_Type_Name_E` | **Item_Type_Name_E** | `RadTextBox` | `Items_Types.Item_Type_Name_E` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `GridView` | **GridView** | `RadGridView` | - | - | - | - |
| `Item_Type_ID` | **Item_Type_ID** | `RadTextBox` | `Items_Types.Item_Type_ID` | `smallint` (PRIMARY KEY, NOT NULL) | - | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Items_Types.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Items_Types.Entry_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `Item_Type_Name_A` | **Item_Type_Name_A** | `RadTextBox` | `Items_Types.Item_Type_Name_A` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `RadLabel1` | **RadLabel1** | `RadLabel` | - | - | - | - |
| `RadLabel2` | **RadLabel2** | `RadLabel` | - | - | - | - |
| `RadLabel5` | **RadLabel5** | `RadLabel` | - | - | - | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Items_Types.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `RadLabel3` | **RadLabel3** | `RadLabel` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الرقـم 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الأسـم بالعربـي 
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء:  لا يمكن حذف السجل لأرتباطه ببيانات في ملف تأسـيس الأصنـاف  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Types Order By Item_Type_ID
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
Select top 1 Item_Type_ID FROM Items_Types Order By Item_Type_ID Desc
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Types Where Item_Type_ID=
```
##### استعلام INSERT على جدول `Items_Types`:
```sql
Insert Into Items_Types(Item_Type_ID,Item_Type_Name_A,Item_Type_Name_E,Entry_ID,Entry_Name,Notice)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Types Where Item_Type_ID=
```
##### استعلام UPDATE على جدول `Items_Types`:
```sql
Update Items_Types Set Item_Type_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Types Where Item_Type_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items Where Item_Type_ID=
```
##### استعلام DELETE على جدول `Items_Types`:
```sql
Delete From Items_Types where Item_Type_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Types Where Item_Type_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Types Where Item_Type_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Types Where Item_Type_Name_A='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Types Where Item_Type_Name_E='
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Dispose, InitializeComponent, get_Search_Option2, set_Search_Option2, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_Item_Type_Name_E, set_Item_Type_Name_E, get_GridView, set_GridView, get_Item_Type_ID, set_Item_Type_ID, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_Item_Type_Name_A, set_Item_Type_Name_A, get_RadLabel1, set_RadLabel1, get_RadLabel2, set_RadLabel2, get_RadLabel5, set_RadLabel5, get_Notice, set_Notice, get_RadLabel3, set_RadLabel3, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_AquaTheme1, set_AquaTheme1, Clear_Record, Clear_Data, Fill_Grid, Lock_Control, Enable_Control, Review_Record, Items_Types_Form_KeyDown, Items_Types_Form_Load, Items_Types_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Item_Type_ID_GotFocus, Item_Type_ID_KeyPress, Item_Type_ID_KeyDown, Item_Type_Name_A_GotFocus, Item_Type_Name_A_KeyPress, Item_Type_Name_A_KeyDown, Item_Type_Name_E_GotFocus, Item_Type_Name_E_KeyPress, Item_Type_Name_E_KeyDown, Notice_GotFocus, Notice_KeyPress, Notice_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Item_Type_ID_LostFocus, Item_Type_Name_A_LostFocus, Item_Type_Name_E_LostFocus, Notice_LostFocus, Search_Txt_LostFocus
```

---

### 3.3 شاشة: المجموعات الرئيسية للأصناف (`Main_Categories_Form`)
- **الاسم الإنجليزي:** Main Item Categories
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** تنظيم دليل الأصناف ضمن شجرة المجموعات الرئيسية
- **جداول قاعدة البيانات المستهدفة:** `Main_Categories`

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
| `Main_Category_Name_E` | **Main_Category_Name_E** | `RadTextBox` | `Main_Categories.Main_Category_Name_E` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `GridView` | **GridView** | `RadGridView` | - | - | - | - |
| `Main_Category_ID` | **Main_Category_ID** | `RadTextBox` | `Main_Categories.Main_Category_ID` | `smallint` (PRIMARY KEY, NOT NULL) | - | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Main_Categories.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Main_Categories.Entry_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `Main_Category_Name_A` | **Main_Category_Name_A** | `RadTextBox` | `Main_Categories.Main_Category_Name_A` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `RadLabel1` | **RadLabel1** | `RadLabel` | - | - | - | - |
| `RadLabel2` | **RadLabel2** | `RadLabel` | - | - | - | - |
| `RadLabel5` | **RadLabel5** | `RadLabel` | - | - | - | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Main_Categories.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `RadLabel3` | **RadLabel3** | `RadLabel` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `Category_Type` | **Category_Type** | `RadDropDownList` | `Main_Categories.Category_Type` | `smallint` (NOT NULL) | `((0))` | - |
| `RadLabel4` | **RadLabel4** | `RadLabel` | - | - | - | - |
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الرقـم 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الأسـم بالعربـي 
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء:  لا يمكن حذف السجل لأرتباطه ببيانات في ملف تأسـيس المجموعـات الفرعية للأصنـاف  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Main_Categories Order By Main_Category_ID
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
Select top 1 Main_Category_ID FROM Main_Categories Order By Main_Category_ID Desc
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Main_Categories Where Main_Category_ID=
```
##### استعلام INSERT على جدول `Main_Categories`:
```sql
Insert Into Main_Categories(Main_Category_ID,Main_Category_Name_A,Main_Category_Name_E,Category_Type,Entry_ID,Entry_Name,Notice)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Main_Categories Where Main_Category_ID=
```
##### استعلام UPDATE على جدول `Main_Categories`:
```sql
Update Main_Categories Set Main_Category_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Main_Categories Where Main_Category_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Sub_Categories Where Main_Category_ID=
```
##### استعلام DELETE على جدول `Main_Categories`:
```sql
Delete From Main_Categories where Main_Category_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Main_Categories Where Main_Category_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Main_Categories Where Main_Category_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Main_Categories Where Main_Category_Name_A='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Main_Categories Where Main_Category_Name_E='
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Main_Category_Name_E_LostFocus, Notice_LostFocus, Search_Txt_LostFocus, Category_Type_KeyDown, Category_Type_SelectedIndexChanged, Dispose, InitializeComponent, get_Search_Option2, set_Search_Option2, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_Main_Category_Name_E, set_Main_Category_Name_E, get_GridView, set_GridView, get_Main_Category_ID, set_Main_Category_ID, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_Main_Category_Name_A, set_Main_Category_Name_A, get_RadLabel1, set_RadLabel1, get_RadLabel2, set_RadLabel2, get_RadLabel5, set_RadLabel5, get_Notice, set_Notice, get_RadLabel3, set_RadLabel3, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_AquaTheme1, set_AquaTheme1, get_Category_Type, set_Category_Type, get_RadLabel4, set_RadLabel4, Clear_Record, Clear_Data, Fill_Grid, Lock_Control, Enable_Control, Review_Record, Main_Categories_Form_KeyDown, Main_Categories_Form_Load, Main_Categories_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Main_Category_ID_GotFocus, Main_Category_ID_KeyPress, Main_Category_ID_KeyDown, Main_Category_Name_A_GotFocus, Main_Category_Name_A_KeyPress, Main_Category_Name_A_KeyDown, Main_Category_Name_E_GotFocus, Main_Category_Name_E_KeyPress, Main_Category_Name_E_KeyDown, Notice_GotFocus, Notice_KeyPress, Notice_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Main_Category_ID_LostFocus, Main_Category_Name_A_LostFocus
```

---

### 3.4 شاشة: المجموعات الفرعية للأصناف (`Sub_Categories_Form`)
- **الاسم الإنجليزي:** Sub Item Categories
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** تقسيم المجموعات الرئيسية إلى مجموعات فرعية دقيقة لتسهيل الجرد والتتبع
- **جداول قاعدة البيانات المستهدفة:** `Sub_Categories`

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
| `Sub_Category_Name_E` | **Sub_Category_Name_E** | `RadTextBox` | `Sub_Categories.Sub_Category_Name_E` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `GridView` | **GridView** | `RadGridView` | - | - | - | - |
| `Sub_Category_ID` | **Sub_Category_ID** | `RadTextBox` | `Sub_Categories.Sub_Category_ID` | `int` (PRIMARY KEY, NOT NULL) | - | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Sub_Categories.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Sub_Categories.Entry_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `Sub_Category_Name_A` | **Sub_Category_Name_A** | `RadTextBox` | `Sub_Categories.Sub_Category_Name_A` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `RadLabel1` | **RadLabel1** | `RadLabel` | - | - | - | - |
| `RadLabel2` | **RadLabel2** | `RadLabel` | - | - | - | - |
| `RadLabel5` | **RadLabel5** | `RadLabel` | - | - | - | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Sub_Categories.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `RadLabel3` | **RadLabel3** | `RadLabel` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadLabel4` | **RadLabel4** | `RadLabel` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `Main_Category_ID` | **Main_Category_ID** | `RadTextBox` | `Sub_Categories.Main_Category_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `Main_Categories_Gridview` | **Main_Categories_Gridview** | `RadGridView` | - | - | - | - |
| `Main_Category_Name_A` | **Main_Category_Name_A** | `RadTextBox` | - | - | - | - |
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المجموعة الرئيسـية 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إختيـار اسم المجموعة الرئيسـية 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المجموعة الفرعيـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسم المجموعة الفرعيـة 
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء:  لا يمكن حذف السجل لأرتباطه ببيانات في ملف تأسـيس الأصنـاف  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Main_Categories Where Main_Category_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Sub_Category_ID FROM Sub_Categories Where Main_Category_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Sub_Category_ID FROM Sub_Categories Where Main_Category_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Sub_Category_ID FROM Sub_Categories Where Main_Category_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Sub_Categories_View Order By Sub_Category_ID
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
Select * FROM Main_Categories Order By Main_Category_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Sub_Categories Where Sub_Category_ID=
```
##### استعلام INSERT على جدول `Sub_Categories`:
```sql
Insert Into Sub_Categories(Main_Category_ID,Sub_Category_ID,Sub_Category_Name_A,Sub_Category_Name_E,Entry_ID,Entry_Name,Notice)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Sub_Categories Where Sub_Category_ID=
```
##### استعلام UPDATE على جدول `Sub_Categories`:
```sql
Update Sub_Categories Set Main_Category_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Sub_Categories Where Sub_Category_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items Where Sub_Category_ID=
```
##### استعلام DELETE على جدول `Sub_Categories`:
```sql
Delete From Sub_Categories where Sub_Category_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Sub_Categories_View Where Sub_Category_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Main_Categories Where Main_Category_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Sub_Categories_View Where Main_Category_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Sub_Categories_View Where Sub_Category_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Sub_Categories_View Where Main_Category_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Sub_Categories Where Sub_Category_Name_A='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Sub_Categories_View Where Main_Category_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Sub_Categories Where Sub_Category_Name_E='
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Notice_GotFocus, Notice_KeyPress, Notice_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Main_Category_ID_GotFocus, Main_Category_ID_KeyDown, Main_Category_ID_KeyPress, Main_Categories_Gridview_CellClick, Main_Categories_Gridview_CellFormatting, Main_Categories_Gridview_KeyDown, Search_Txt_LostFocus, Notice_LostFocus, Main_Category_ID_LostFocus, Sub_Category_ID_LostFocus, Sub_Category_Name_A_LostFocus, Sub_Category_Name_E_LostFocus, Main_Category_Name_A_GotFocus, Main_Category_Name_A_LostFocus, Dispose, InitializeComponent, get_Search_Option2, set_Search_Option2, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_Sub_Category_Name_E, set_Sub_Category_Name_E, get_GridView, set_GridView, get_Sub_Category_ID, set_Sub_Category_ID, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_Sub_Category_Name_A, set_Sub_Category_Name_A, get_RadLabel1, set_RadLabel1, get_RadLabel2, set_RadLabel2, get_RadLabel5, set_RadLabel5, get_Notice, set_Notice, get_RadLabel3, set_RadLabel3, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadLabel4, set_RadLabel4, get_RadPanel4, set_RadPanel4, get_Main_Category_ID, set_Main_Category_ID, get_Main_Categories_Gridview, set_Main_Categories_Gridview, get_Main_Category_Name_A, set_Main_Category_Name_A, get_AquaTheme1, set_AquaTheme1, Clear_Record, Clear_Data, Fill_Grid, Fill_Main_Categories_Grid, Lock_Control, Enable_Control, Review_Record, Sub_Categories_Form_KeyDown, Sub_Categories_Form_Load, Sub_Categories_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Option2_Click, Search_Option2_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Sub_Category_ID_GotFocus, Sub_Category_ID_KeyPress, Sub_Category_ID_KeyDown, Sub_Category_Name_A_GotFocus, Sub_Category_Name_A_KeyPress, Sub_Category_Name_A_KeyDown, Sub_Category_Name_E_GotFocus, Sub_Category_Name_E_KeyPress, Sub_Category_Name_E_KeyDown
```

---

### 3.5 شاشة: وحدات القياس والتحويل (`Units_Form`)
- **الاسم الإنجليزي:** Units of Measure (UOM)
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** تعريف وحدات القياس (قطعة، طن، متر، كرتونة) ومعاملات التحويل بين الوحدات
- **جداول قاعدة البيانات المستهدفة:** `Units`

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
| `Unit_Name_E` | **الوحدة** | `RadTextBox` | `Units.Unit_Name_E` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `GridView` | **GridView** | `RadGridView` | - | - | - | - |
| `Unit_ID` | **الوحدة** | `RadTextBox` | `Units.Unit_ID` | `smallint` (PRIMARY KEY, NOT NULL) | - | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Units.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Units.Entry_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `Unit_Name_A` | **الوحدة** | `RadTextBox` | `Units.Unit_Name_A` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `RadLabel1` | **RadLabel1** | `RadLabel` | - | - | - | - |
| `RadLabel2` | **RadLabel2** | `RadLabel` | - | - | - | - |
| `RadLabel5` | **RadLabel5** | `RadLabel` | - | - | - | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Units.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `RadLabel3` | **RadLabel3** | `RadLabel` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الرقـم 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الأسـم بالعربـي 
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء:  لا يمكن حذف السجل لأرتباطه ببيانات في ملف تأسـيس الأصنـاف  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Units Order By Unit_ID
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
Select top 1 Unit_ID FROM Units Order By Unit_ID Desc
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Units Where Unit_ID=
```
##### استعلام INSERT على جدول `Units`:
```sql
Insert Into Units(Unit_ID,Unit_Name_A,Unit_Name_E,Entry_ID,Entry_Name,Notice)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Units Where Unit_ID=
```
##### استعلام UPDATE على جدول `Units`:
```sql
Update Units Set Unit_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Units Where Unit_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details Where Unit_ID=
```
##### استعلام DELETE على جدول `Units`:
```sql
Delete From Units where Unit_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Units Where Unit_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Units Where Unit_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Units Where Unit_Name_A='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Units Where Unit_Name_E='
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Dispose, InitializeComponent, get_Search_Option2, set_Search_Option2, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_Unit_Name_E, set_Unit_Name_E, get_GridView, set_GridView, get_Unit_ID, set_Unit_ID, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_Unit_Name_A, set_Unit_Name_A, get_RadLabel1, set_RadLabel1, get_RadLabel2, set_RadLabel2, get_RadLabel5, set_RadLabel5, get_Notice, set_Notice, get_RadLabel3, set_RadLabel3, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_AquaTheme1, set_AquaTheme1, Clear_Record, Clear_Data, Fill_Grid, Lock_Control, Enable_Control, Review_Record, Units_Form_KeyDown, Units_Form_Load, Units_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Unit_ID_GotFocus, Unit_ID_KeyPress, Unit_ID_KeyDown, Unit_Name_A_GotFocus, Unit_Name_A_KeyPress, Unit_Name_A_KeyDown, Unit_Name_E_GotFocus, Unit_Name_E_KeyPress, Unit_Name_E_KeyDown, Notice_GotFocus, Notice_KeyPress, Notice_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Unit_ID_LostFocus, Unit_Name_A_LostFocus, Unit_Name_E_LostFocus, Notice_LostFocus, Search_Txt_LostFocus
```

---

### 3.6 شاشة: بطاقة الصنف الشاملة والأسعار والباركود (`Items_Form`)
- **الاسم الإنجليزي:** Master Item Card & Multi-UOM
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** تعريف بطاقة الصنف، الباركودات، الأسعار المتعددة، حد الطلب، متوسط التكلفة، والوحدات
- **جداول قاعدة البيانات المستهدفة:** `Items`, `Items_Details`

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
| `Item_Name_E` | **اسم الصنف** | `RadTextBox` | `Items.Item_Name_E` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `GridView` | **GridView** | `RadGridView` | - | - | - | - |
| `Item_ID` | **كود الصنف** | `RadTextBox` | `Items.Item_ID` | `numeric` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Items.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Items.Entry_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `Item_Name_A` | **اسم الصنف** | `RadTextBox` | `Items.Item_Name_A` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `RadLabel1` | **RadLabel1** | `RadLabel` | - | - | - | - |
| `RadLabel2` | **RadLabel2** | `RadLabel` | - | - | - | - |
| `RadLabel5` | **RadLabel5** | `RadLabel` | - | - | - | - |
| `Item_Description` | **البيان / الشرح** | `RadTextBox` | `Items.Item_Description` | `nvarchar(500)` (NOT NULL) | `(' ')` | - |
| `RadLabel3` | **RadLabel3** | `RadLabel` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadLabel4` | **RadLabel4** | `RadLabel` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `Sub_Category_ID` | **Sub_Category_ID** | `RadTextBox` | `Items.Sub_Category_ID` | `int` (NOT NULL) | `((0))` | - |
| `Sub_Categories_Gridview` | **Sub_Categories_Gridview** | `RadGridView` | - | - | - | - |
| `Sub_Category_Name_A` | **Sub_Category_Name_A** | `RadTextBox` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `Factory_No` | **Factory_No** | `RadTextBox` | `Items.Factory_No` | `numeric` (NOT NULL) | `((0))` | - |
| `RadLabel6` | **RadLabel6** | `RadLabel` | - | - | - | - |
| `Item_Sort` | **Item_Sort** | `RadTextBox` | `Items.Item_Sort` | `nvarchar(10)` (NOT NULL) | `((0))` | - |
| `RadLabel7` | **RadLabel7** | `RadLabel` | - | - | - | - |
| `RadPanel5` | **RadPanel5** | `RadPanel` | - | - | - | - |
| `Item_Type_Name_A` | **Item_Type_Name_A** | `RadTextBox` | - | - | - | - |
| `Item_Type_ID` | **Item_Type_ID** | `RadTextBox` | `Items.Item_Type_ID` | `smallint` (NOT NULL) | - | - |
| `RadLabel10` | **RadLabel10** | `RadLabel` | - | - | - | - |
| `Adjustment_GridView` | **Adjustment_GridView** | `RadGridView` | - | - | - | - |
| `Request_Limit` | **Request_Limit** | `RadTextBox` | `Items.Request_Limit` | `float` (NOT NULL) | `((0))` | - |
| `RadLabel11` | **RadLabel11** | `RadLabel` | - | - | - | - |
| `Request_Qty` | **الكمية** | `RadTextBox` | `Items.Request_Qty` | `float` (NOT NULL) | `((0))` | - |
| `RadLabel12` | **RadLabel12** | `RadLabel` | - | - | - | - |
| `Default_Unit_Name` | **الوحدة** | `RadTextBox` | - | - | - | - |
| `Default_Unit_ID` | **الوحدة** | `RadTextBox` | `Items.Default_Unit_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `RadLabel13` | **RadLabel13** | `RadLabel` | - | - | - | - |
| `RadLabel9` | **RadLabel9** | `RadLabel` | - | - | - | - |
| `RadLabel14` | **RadLabel14** | `RadLabel` | - | - | - | - |
| `RadLabel15` | **RadLabel15** | `RadLabel` | - | - | - | - |
| `RadLabel16` | **RadLabel16** | `RadLabel` | - | - | - | - |
| `Unit_Name_A` | **الوحدة** | `RadTextBox` | - | - | - | - |
| `Unit_Exchang` | **Unit_Exchang** | `RadTextBox` | `Items_Details.Unit_Exchang` | `float` (NOT NULL) | `((1))` | - |
| `Retail_Price` | **السعر الفردي** | `RadTextBox` | `Items_Details.Retail_Price` | `float` (NOT NULL) | `((0))` | - |
| `Wholesale_Price` | **السعر الفردي** | `RadTextBox` | `Items_Details.Wholesale_Price` | `float` (NOT NULL) | `((0))` | - |
| `RadPanel6` | **RadPanel6** | `RadPanel` | - | - | - | - |
| `Average_Cost` | **Average_Cost** | `RadTextBox` | `Items.Average_Cost` | `float` (NOT NULL) | `((0))` | - |
| `RadLabel19` | **RadLabel19** | `RadLabel` | - | - | - | - |
| `Last_Cost` | **Last_Cost** | `RadTextBox` | `Items.Last_Cost` | `float` (NOT NULL) | `((0))` | - |
| `RadLabel18` | **RadLabel18** | `RadLabel` | - | - | - | - |
| `First_Cost` | **First_Cost** | `RadTextBox` | `Items.First_Cost` | `float` (NOT NULL) | `((0))` | - |
| `RadLabel17` | **RadLabel17** | `RadLabel` | - | - | - | - |
| `Photo` | **Photo** | `PictureBox` | - | - | - | - |
| `Photo_Path` | **Photo_Path** | `TextBox` | - | - | - | - |
| `Photo_Path_Brows` | **Photo_Path_Brows** | `RadButton` | - | - | - | - |
| `Print` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Active` | **Active** | `RadCheckBox` | `Items.Active` | `bit` (NOT NULL) | `((1))` | - |
| `Vat_Per` | **Vat_Per** | `RadTextBox` | `Items.Vat_Per` | `float` (NOT NULL) | `((0))` | - |
| `RadLabel20` | **RadLabel20** | `RadLabel` | - | - | - | - |
| `RadLabel21` | **RadLabel21** | `RadLabel` | - | - | - | - |
| `Visible_By_Stock` | **Visible_By_Stock** | `RadCheckBox` | `Items.Visible_By_Stock` | `bit` (NOT NULL) | `((1))` | - |
| `Unit_ID` | **الوحدة** | `RadTextBox` | `Items.Default_Unit_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `Units_GridView` | **Units_GridView** | `RadGridView` | - | - | - | - |
| `Items_Types_GridView` | **Items_Types_GridView** | `RadGridView` | - | - | - | - |
| `Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Items.Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `RadLabel22` | **RadLabel22** | `RadLabel` | - | - | - | - |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `Adap` | **Adap** | `SqlDataAdapter` | - | - | - | - |
| `Adap1` | **Adap1** | `SqlDataAdapter` | - | - | - | - |
| `Adap2` | **Adap2** | `SqlDataAdapter` | - | - | - | - |
| `Adap3` | **Adap3** | `SqlDataAdapter` | - | - | - | - |
| `Adap4` | **Adap4** | `SqlDataAdapter` | - | - | - | - |
| `Adap5` | **Adap5** | `SqlDataAdapter` | - | - | - | - |
| `Adap6` | **Adap6** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D_V` | **Adap_D_V** | `SqlDataAdapter` | - | - | - | - |
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
| `RRS_D_V` | **RRS_D_V** | `DataSet` | - | - | - | - |
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الوحـدة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الوحـدة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال سـعر التجزئـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال سـعر الجملة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المجموعة الفرعية 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إختيـار اسم المجموعة الفرعية 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الأسـم بالأنجليزي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال فئـة الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال فئـة الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال فئـة الحسـاب 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الحسـاب 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال وحدة الصرف الإفتراضية 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال وحدة الصرف الإفتراضية 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إضافة سجل جديد أثناء عملية التعديل. لأضافة سجل يجب الضغط على الغاء التعديل ثم الضغط على سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إجراء تعديل أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: في حالة الإضافة يجب الضغط على سجل جديد وفي حالة التعديل يجب الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل موجود مسبقاً ولا يمكن حفظه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل غير موجود ولا يمكن تحديثه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء إضافة سجل جديد. للحذف يجب الضغط على الغاء الإضافة ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء تعديل سجل . للحذف يجب الضغط على الغاء التعديل ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد السجل المراد حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل غير موجود ولا يمكن حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء:  لا يمكن حذف السجل لأرتباطه بحركة الفواتير  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items Where Sub_Category_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items Where Factory_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Types Where Item_Type_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Units Where Unit_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Units Where Unit_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Where Incom_Type >
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_View Order By Item_ID
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
Select * FROM Sub_Categories_View Order By Sub_Category_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Types Order By Item_Type_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Units Order By Unit_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Incom_Type >
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items Where Item_ID=
```
##### استعلام INSERT على جدول `Items`:
```sql
Insert Into Items(Sub_Category_ID,Item_ID,Factory_No,Item_Sort,Item_Name_A,Item_Name_E,Item_Description,Item_Type_ID,Level5_ID,Request_Limit,Request_Qty,Vat_Per,Default_Unit_ID,Visible_By_Stock,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Items`:
```sql
Insert Into Items_Details(Item_ID,SR,Unit_ID,Unit_Exchang,Retail_Price,Wholesale_Price)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items Where Item_ID=
```
##### استعلام UPDATE على جدول `Items`:
```sql
Update Items Set Sub_Category_ID=
```
##### استعلام DELETE على جدول `Items`:
```sql
Delete From Items_Details where Item_ID=
```
##### استعلام INSERT على جدول `Items`:
```sql
Insert Into Items_Details(Item_ID,SR,Unit_ID,Unit_Exchang,Retail_Price,Wholesale_Price)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Union Where Item_ID=
```
##### استعلام DELETE على جدول `Items`:
```sql
Delete From Items where Item_ID=
```
##### استعلام DELETE على جدول `Items`:
```sql
Delete From Items_Details where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Sub_Categories_View Where Sub_Category_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Types Where Item_Type_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Units Where Unit_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Incom_Type >
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items Where Sub_Category_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Items_Details_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items Where Sub_Category_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items Where Item_Name_A='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items Where Sub_Category_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items Where Item_Name_E='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Sub_Categories_View Where Sub_Category_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Item_ID FROM Items Where Sub_Category_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Item_ID FROM Items Where Sub_Category_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Item_ID FROM Items Where Sub_Category_ID=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Factory_No_GotFocus, Factory_No_KeyPress, Factory_No_KeyDown, Factory_No_LostFocus, Item_Sort_GotFocus, Item_Sort_KeyPress, Item_Sort_KeyDown, Item_Sort_LostFocus, Item_Type_ID_GotFocus, Item_Type_ID_KeyDown, Item_Type_ID_KeyPress, Item_Type_ID_LostFocus, Item_Type_Name_A_GotFocus, Item_Type_Name_A_KeyDown, Item_Type_Name_A_LostFocus, Items_Types_GridView_CellClick, Items_Types_GridView_CellFormatting, Items_Types_GridView_KeyDown, Request_Limit_GotFocus, Request_Limit_KeyDown, Request_Limit_KeyPress, Request_Limit_LostFocus, Request_Qty_GotFocus, Request_Qty_KeyDown, Request_Qty_KeyPress, Request_Qty_LostFocus, Vat_Per_GotFocus, Vat_Per_KeyDown, Vat_Per_KeyPress, Vat_Per_LostFocus, Default_Unit_ID_GotFocus, Default_Unit_ID_KeyDown, Default_Unit_ID_KeyPress, Default_Unit_ID_LostFocus, Default_Unit_Name_GotFocus, Default_Unit_Name_KeyDown, Default_Unit_Name_LostFocus, Units_GridView_CellClick, Units_GridView_CellFormatting, Units_GridView_KeyDown, Unit_ID_GotFocus, Unit_ID_KeyDown, Unit_ID_KeyPress, Unit_ID_LostFocus, Unit_Name_A_GotFocus, Unit_Name_A_KeyDown, Unit_Name_A_LostFocus, Unit_Exchang_GotFocus, Unit_Exchang_KeyDown, Unit_Exchang_KeyPress, Unit_Exchang_LostFocus, Retail_Price_GotFocus, Retail_Price_KeyDown, Retail_Price_KeyPress, Retail_Price_LostFocus, Wholesale_Price_GotFocus, Wholesale_Price_KeyDown, Wholesale_Price_KeyPress, Wholesale_Price_LostFocus, Adjustment_GridView_KeyDown, Level5_ID_GotFocus, Level5_ID_KeyDown, Level5_ID_KeyPress, Level5_ID_LostFocus, Level5_Name_A_GotFocus, Level5_Name_A_KeyDown, Level5_Name_A_LostFocus, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, set_RadLabel18, get_First_Cost, set_First_Cost, get_RadLabel17, set_RadLabel17, get_Photo, set_Photo, get_Photo_Path, set_Photo_Path, get_Photo_Path_Brows, set_Photo_Path_Brows, get_Print, set_Print, get_Active, set_Active, get_Vat_Per, set_Vat_Per, get_RadLabel20, set_RadLabel20, get_RadLabel21, set_RadLabel21, get_Visible_By_Stock, set_Visible_By_Stock, get_Unit_ID, set_Unit_ID, get_Units_GridView, set_Units_GridView, get_Items_Types_GridView, set_Items_Types_GridView, get_Level5_ID, set_Level5_ID, get_Level5_Name_A, set_Level5_Name_A, get_RadLabel22, set_RadLabel22, get_Level5_GridView, set_Level5_GridView, Clear_Record, Clear_Data, Fill_Grid, Fill_Sub_Categories_Grid, Fill_Items_Types_Grid, Fill_Units_Grid, Fill_Level5_Grid, Lock_Control, Enable_Control, Review_Record, Items_Form_KeyDown, Items_Form_Load, Items_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Option2_Click, Search_Option2_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Item_ID_GotFocus, Item_ID_KeyPress, Item_ID_KeyDown, Item_Name_A_GotFocus, Item_Name_A_KeyPress, Item_Name_A_KeyDown, Item_Name_E_GotFocus, Item_Name_E_KeyPress, Item_Name_E_KeyDown, Item_Description_GotFocus, Item_Description_KeyPress, Item_Description_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Sub_Category_ID_GotFocus, Sub_Category_ID_KeyDown, Sub_Category_ID_KeyPress, Sub_Categories_Gridview_CellClick, Sub_Categories_View_Gridview_CellFormatting, Sub_Categories_Gridview_KeyDown, Search_Txt_LostFocus, Item_Description_LostFocus, Sub_Category_ID_LostFocus, Item_ID_LostFocus, Item_Name_A_LostFocus, Item_Name_E_LostFocus, Sub_Category_Name_A_GotFocus, Sub_Category_Name_A_LostFocus, Dispose, InitializeComponent, get_Search_Option2, set_Search_Option2, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_Item_Name_E, set_Item_Name_E, get_GridView, set_GridView, get_Item_ID, set_Item_ID, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_Item_Name_A, set_Item_Name_A, get_RadLabel1, set_RadLabel1, get_RadLabel2, set_RadLabel2, get_RadLabel5, set_RadLabel5, get_Item_Description, set_Item_Description, get_RadLabel3, set_RadLabel3, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadLabel4, set_RadLabel4, get_RadPanel4, set_RadPanel4, get_Sub_Category_ID, set_Sub_Category_ID, get_Sub_Categories_Gridview, set_Sub_Categories_Gridview, get_Sub_Category_Name_A, set_Sub_Category_Name_A, get_AquaTheme1, set_AquaTheme1, get_Factory_No, set_Factory_No, get_RadLabel6, set_RadLabel6, get_Item_Sort, set_Item_Sort, get_RadLabel7, set_RadLabel7, get_RadPanel5, set_RadPanel5, get_Item_Type_Name_A, set_Item_Type_Name_A, get_Item_Type_ID, set_Item_Type_ID, get_RadLabel10, set_RadLabel10, get_Adjustment_GridView, set_Adjustment_GridView, get_Request_Limit, set_Request_Limit, get_RadLabel11, set_RadLabel11, get_Request_Qty, set_Request_Qty, get_RadLabel12, set_RadLabel12, get_Default_Unit_Name, set_Default_Unit_Name, get_Default_Unit_ID, set_Default_Unit_ID, get_RadLabel13, set_RadLabel13, get_RadLabel9, set_RadLabel9, get_RadLabel14, set_RadLabel14, get_RadLabel15, set_RadLabel15, get_RadLabel16, set_RadLabel16, get_Unit_Name_A, set_Unit_Name_A, get_Unit_Exchang, set_Unit_Exchang, get_Retail_Price, set_Retail_Price, get_Wholesale_Price, set_Wholesale_Price, get_RadPanel6, set_RadPanel6, get_Average_Cost, set_Average_Cost, get_RadLabel19, set_RadLabel19, get_Last_Cost, set_Last_Cost, get_RadLabel18
```

---

### 3.7 شاشة: أرصدة أول المدة للمخازن (`Stock_Form`)
- **الاسم الإنجليزي:** Beginning Inventory Balances
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** إدخال وتوثيق كميات وتكاليف أرصدة البضاعة في بداية الدورة المحاسبية لكل مخزن
- **جداول قاعدة البيانات المستهدفة:** `Stock_Head`, `Stock_Details`

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
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Stock_Head.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Stock_Head.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `RadGridView1` | **RadGridView1** | `RadGridView` | - | - | - | - |
| `Note_Date` | **تاريخ الحركة** | `RadDateTimePicker` | `Stock_Head.Note_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Items_GridView` | **Items_GridView** | `RadGridView` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `RadLabel15` | **RadLabel15** | `RadLabel` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Label8` | **Label8** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Note_No` | **رقم الحركة / السند** | `RadTextBox` | `Stock_Head.Note_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Stock_Head.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Label10` | **Label10** | `Label` | - | - | - | - |
| `Label11` | **Label11** | `Label` | - | - | - | - |
| `Actual_Qty` | **الكمية** | `RadTextBox` | `Stock_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Unit_Name` | **الوحدة** | `RadTextBox` | - | - | - | - |
| `Item_Name_A` | **اسم الصنف** | `RadTextBox` | - | - | - | - |
| `Item_ID` | **كود الصنف** | `RadTextBox` | `Stock_Details.Item_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label15` | **Label15** | `Label` | - | - | - | - |
| `Net` | **الصافي المستحق** | `RadTextBox` | `Stock_Head.Note_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Actual_Price` | **السعر الفردي** | `RadTextBox` | `Stock_Details.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Label16` | **Label16** | `Label` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `RadTextBox` | `Stock_Head.Note_Net_Text` | `nvarchar(200)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `Label26` | **Label26** | `Label` | - | - | - | - |
| `Note_Total` | **الإجمالي** | `RadTextBox` | `Stock_Head.Note_Total` | `float` (NOT NULL) | `((0))` | `Total = SUM(Details.Net)` |
| `Label28` | **Label28** | `Label` | - | - | - | - |
| `Note_Actual_Qty` | **الكمية** | `RadTextBox` | `Stock_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Note_Net_With_Tax_Text` | **ضريبة القيمة المضافة** | `RadTextBox` | - | - | - | `Net = Total - Discount + Tax` |
| `SR` | **SR** | `RadTextBox` | `Stock_Details.SR` | `int` (PRIMARY KEY, NOT NULL) | - | - |
| `Inventory_Name_A` | **Inventory_Name_A** | `RadTextBox` | - | - | - | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Inventory_ID` | **كود المخزن** | `RadTextBox` | `Stock_Head.Inventory_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Unit_ID` | **الوحدة** | `RadTextBox` | `Stock_Details.Unit_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `Note_Date_H` | **تاريخ الحركة** | `RadTextBox` | `Stock_Head.Note_Date_H` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Qty` | **الكمية** | `RadTextBox` | `Stock_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Price` | **السعر الفردي** | `RadTextBox` | `Stock_Details.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Units_GridView` | **Units_GridView** | `RadGridView` | - | - | - | - |
| `Inventories_GridView` | **Inventories_GridView** | `RadGridView` | - | - | - | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Unit_Exchang` | **Unit_Exchang** | `RadTextBox` | `Stock_Details.Unit_Exchang` | `float` (NOT NULL) | `((1))` | - |
| `Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Stock_Head.Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label19` | **Label19** | `Label` | - | - | - | - |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `Acc_Adap_H` | **Acc_Adap_H** | `SqlDataAdapter` | - | - | - | - |
| `Acc_Adap_D` | **Acc_Adap_D** | `SqlDataAdapter` | - | - | - | - |
| `Adap_H` | **Adap_H** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D` | **Adap_D** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D_V` | **Adap_D_V** | `SqlDataAdapter` | - | - | - | - |
| `Adap` | **Adap** | `SqlDataAdapter` | - | - | - | - |
| `Adap1` | **Adap1** | `SqlDataAdapter` | - | - | - | - |
| `Adap1_1` | **Adap1_1** | `SqlDataAdapter` | - | - | - | - |
| `Adap2` | **Adap2** | `SqlDataAdapter` | - | - | - | - |
| `Adap2_1` | **Adap2_1** | `SqlDataAdapter` | - | - | - | - |
| `Adap3` | **Adap3** | `SqlDataAdapter` | - | - | - | - |
| `Adap3_1` | **Adap3_1** | `SqlDataAdapter` | - | - | - | - |
| `Adap3_2` | **Adap3_2** | `SqlDataAdapter` | - | - | - | - |
| `Adap4` | **Adap4** | `SqlDataAdapter` | - | - | - | - |
| `Adap5` | **Adap5** | `SqlDataAdapter` | - | - | - | - |
| `Adap6` | **Adap6** | `SqlDataAdapter` | - | - | - | - |
| `Adap7` | **Adap7** | `SqlDataAdapter` | - | - | - | - |
| `Adap8` | **Adap8** | `SqlDataAdapter` | - | - | - | - |
| `Adap_Print` | **زر طباعة التقرير / السند** | `SqlDataAdapter` | - | - | - | - |
| `Balance_Adap` | **الرصيد / الفارق** | `SqlDataAdapter` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Branche_Adap` | **Branche_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Permission_Adap` | **Permission_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Delete_Adap` | **زر حذف السجل** | `SqlDataAdapter` | - | - | - | - |
| `Setting_Adap` | **Setting_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Link_Adap` | **Link_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Profile_Adap` | **Profile_Adap** | `OleDbDataAdapter` | - | - | - | - |
| `Acc_RRS_H` | **Acc_RRS_H** | `DataSet` | - | - | - | - |
| `Acc_RRS_D` | **Acc_RRS_D** | `DataSet` | - | - | - | - |
| `RRS_H` | **RRS_H** | `DataSet` | - | - | - | - |
| `RRS_D` | **RRS_D** | `DataSet` | - | - | - | - |
| `RRS_D_V` | **RRS_D_V** | `DataSet` | - | - | - | - |
| `RRS` | **RRS** | `DataSet` | - | - | - | - |
| `RRS1` | **RRS1** | `DataSet` | - | - | - | - |
| `RRS1_1` | **RRS1_1** | `DataSet` | - | - | - | - |
| `RRS2` | **RRS2** | `DataSet` | - | - | - | - |
| `RRS2_1` | **RRS2_1** | `DataSet` | - | - | - | - |
| `RRS3` | **RRS3** | `DataSet` | - | - | - | - |
| `RRS3_1` | **RRS3_1** | `DataSet` | - | - | - | - |
| `RRS3_2` | **RRS3_2** | `DataSet` | - | - | - | - |
| `RRS4` | **RRS4** | `DataSet` | - | - | - | - |
| `RRS5` | **RRS5** | `DataSet` | - | - | - | - |
| `RRS6` | **RRS6** | `DataSet` | - | - | - | - |
| `RRS7` | **RRS7** | `DataSet` | - | - | - | - |
| `RRS8` | **RRS8** | `DataSet` | - | - | - | - |
| `RRS_Print` | **زر طباعة التقرير / السند** | `DataSet` | - | - | - | - |
| `Balance_RRS` | **الرصيد / الفارق** | `DataSet` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Branche_RRS` | **Branche_RRS** | `DataSet` | - | - | - | - |
| `Permission_RRS` | **Permission_RRS** | `DataSet` | - | - | - | - |
| `Profile_RRS` | **Profile_RRS** | `DataSet` | - | - | - | - |
| `Delete_RRS` | **زر حذف السجل** | `DataSet` | - | - | - | - |
| `Setting_RRS` | **Setting_RRS** | `DataSet` | - | - | - | - |
| `Link_RRS` | **Link_RRS** | `DataSet` | - | - | - | - |
| `Cmd` | **Cmd** | `SqlCommand` | - | - | - | - |
| `Cmd1` | **Cmd1** | `SqlCommand` | - | - | - | - |
| `Cmd01` | **Cmd01** | `SqlCommand` | - | - | - | - |
| `Cmd02` | **Cmd02** | `SqlCommand` | - | - | - | - |
| `Cmd03` | **Cmd03** | `SqlCommand` | - | - | - | - |
| `Cmd2` | **Cmd2** | `SqlCommand` | - | - | - | - |
| `Cmd3` | **Cmd3** | `SqlCommand` | - | - | - | - |
| `Cmd4` | **Cmd4** | `SqlCommand` | - | - | - | - |
| `Cmd5` | **Cmd5** | `SqlCommand` | - | - | - | - |
| `Cmd6` | **Cmd6** | `SqlCommand` | - | - | - | - |
| `Cmd06` | **Cmd06** | `SqlCommand` | - | - | - | - |
| `Balance_Cmd` | **الرصيد / الفارق** | `SqlCommand` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Dt` | **Dt** | `DataTable` | - | - | - | - |
| `Dt_D` | **Dt_D** | `DataTable` | - | - | - | - |
| `Dt1` | **Dt1** | `DataTable` | - | - | - | - |
| `Dt2` | **Dt2** | `DataTable` | - | - | - | - |
| `Dt3` | **Dt3** | `DataTable` | - | - | - | - |
| `Dt3_1` | **Dt3_1** | `DataTable` | - | - | - | - |
| `Dt4` | **Dt4** | `DataTable` | - | - | - | - |
| `Dt5` | **Dt5** | `DataTable` | - | - | - | - |
| `Dt6` | **Dt6** | `DataTable` | - | - | - | - |
| `Setting_Dt` | **Setting_Dt** | `DataTable` | - | - | - | - |
| `Link_Dt` | **Link_Dt** | `DataTable` | - | - | - | - |

#### ب. قواعد التحقق والمعادلات الحسابية (Validation & Business Rules)
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال وحدة الصرف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الكميـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المخزن 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الحساب التحليلي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إضافة سجل جديد أثناء عملية التعديل. لأضافة سجل يجب الضغط على الغاء التعديل ثم الضغط على سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إجراء تعديل أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: في حالة الإضافة يجب الضغط على سجل جديد وفي حالة التعديل يجب الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السند غير موجود ويجب حفظه أولاً  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء إضافة سجل جديد. للحذف يجب الضغط على الغاء الإضافة ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء تعديل سجل . للحذف يجب الضغط على الغاء التعديل ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد السجل المراد حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد الفاتورة المطلوب  
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
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الصافي تفقيطاً (كتابة بالكلمات): Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الإجمالي: Total = SUM(Details.Net) (المعادلة: `Total = SUM(Details.Net)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
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
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Stock_Head_View Order By Note_No DESC
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
Select * From Stock_Settings Where ID=
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
Select * FROM Level5_View Order By Level5_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM Stock_Head Order By Note_No Desc
```
##### استعلام INSERT على جدول `Stock_Head`:
```sql
Insert Into Stock_Head(Note_No,Note_Date,Note_Date_H,Inventory_ID,Level5_ID,Note_Actual_Qty,Note_Total,Note_Net,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Stock_Details`:
```sql
Insert Into Stock_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Net)Values(
```
##### استعلام UPDATE على جدول `Stock_Head`:
```sql
Update Items Set First_Cost=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Stock_Head Where Note_No=
```
##### استعلام UPDATE على جدول `Stock_Head`:
```sql
Update Stock_Head Set Note_No=
```
##### استعلام DELETE على جدول `Stock_Details`:
```sql
Delete From Stock_Details Where Note_No=
```
##### استعلام INSERT على جدول `Stock_Details`:
```sql
Insert Into Stock_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Net)Values(
```
##### استعلام DELETE على جدول `Stock_Head`:
```sql
Delete From Stock_Head where Note_No=
```
##### استعلام DELETE على جدول `Stock_Details`:
```sql
Delete From Stock_Details where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select  * From Stock_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Stock_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Stock_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Stock_Head_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_Name_A Like '%
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
Select * FROM Level5_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Stock_Head_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Stock_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_ID=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Actual_Price_KeyPress, Actual_Price_LostFocus, Item_Name_A_LostFocus, Note_Actual_Qty_GotFocus, Note_Actual_Qty_KeyDown, Note_Total_GotFocus, Note_Total_KeyDown, Note_Actual_Qty_LostFocus, Note_Total_LostFocus, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, Note_Net_Text_LostFocus, Unit_ID_GotFocus, Unit_ID_KeyDown, Unit_Name_GotFocus, Unit_Name_KeyDown, Units_GridView_CellClick, Units_GridView_CellFormatting, Units_GridView_KeyDown, Unit_ID_LostFocus, Unit_Name_LostFocus, Note_Date_ValueChanged, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, Level5_ID_GotFocus, Level5_ID_KeyDown, Level5_ID_KeyPress, Level5_ID_LostFocus, Level5_Name_A_GotFocus, Level5_Name_A_KeyDown, Level5_Name_A_LostFocus, set_Unit_Exchang, get_Level5_Name_A, set_Level5_Name_A, get_Level5_ID, set_Level5_ID, get_Label19, set_Label19, get_Level5_GridView, set_Level5_GridView, Clear_Record, Clear_Data, Fill_Grid, Fill_Inventories_Grid, Fill_Level5_Grid, Fill_Items_Grid, Fill_Units_Grid, Lock_Control, Enable_Control, Review_Record, Find_Total, Stock_Form_KeyDown, Stock_Form_Load, Stock_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Note_No_GotFocus, Note_No_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Notice_GotFocus, Notice_KeyDown, Notice_KeyPress, Note_Date_KeyDown, Note_Date_Opened, RadGridView1_DoubleClick, RadGridView1_KeyDown, Item_ID_GotFocus, Item_ID_KeyDown, Item_ID_KeyPress, Item_Name_A_GotFocus, Item_Name_A_KeyDown, Items_GridView_CellClick, Items_GridView_CellFormatting, Items_GridView_KeyDown, Actual_Qty_GotFocus, Actual_Qty_KeyDown, Actual_Qty_KeyPress, Actual_Price_GotFocus, Actual_Price_KeyDown, Note_No_KeyPress, Note_No_LostFocus, Notice_LostFocus, Qty_LostFocus, Item_ID_LostFocus, Search_Txt_LostFocus, Inventory_ID_GotFocus, Inventory_ID_KeyDown, Inventory_ID_KeyPress, Inventory_Name_A_GotFocus, Inventory_Name_A_KeyDown, Inventories_GridView_CellClick, Inventories_GridView_CellFormatting, Inventories_GridView_KeyDown, Inventory_ID_LostFocus, Inventory_Name_A_LostFocus, Note_Date_H_GotFocus, Note_Date_H_KeyDown, Note_Date_H_LostFocus, Net_GotFocus, Net_KeyDown, Net_LostFocus, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadPanel4, set_RadPanel4, get_RadGridView1, set_RadGridView1, get_Note_Date, set_Note_Date, get_Items_GridView, set_Items_GridView, get_AquaTheme1, set_AquaTheme1, get_RadLabel15, set_RadLabel15, get_Label13, set_Label13, get_Label8, set_Label8, get_Label6, set_Label6, get_Note_No, set_Note_No, get_Notice, set_Notice, get_Label4, set_Label4, get_Label9, set_Label9, get_Label10, set_Label10, get_Label11, set_Label11, get_Actual_Qty, set_Actual_Qty, get_Unit_Name, set_Unit_Name, get_Item_Name_A, set_Item_Name_A, get_Item_ID, set_Item_ID, get_Label15, set_Label15, get_Net, set_Net, get_Label14, set_Label14, get_Actual_Price, set_Actual_Price, get_Label16, set_Label16, get_Note_Net_Text, set_Note_Net_Text, get_Label26, set_Label26, get_Note_Total, set_Note_Total, get_Label28, set_Label28, get_Note_Actual_Qty, set_Note_Actual_Qty, get_Note_Net_With_Tax_Text, set_Note_Net_With_Tax_Text, get_SR, set_SR, get_Inventory_Name_A, set_Inventory_Name_A, get_Label1, set_Label1, get_Inventory_ID, set_Inventory_ID, get_Unit_ID, set_Unit_ID, get_Note_Date_H, set_Note_Date_H, get_Label2, set_Label2, get_Qty, set_Qty, get_Price, set_Price, get_Units_GridView, set_Units_GridView, get_Inventories_GridView, set_Inventories_GridView, get_Label3, set_Label3, get_Unit_Exchang
```

---

### 3.8 شاشة: إذن صرف مخزني داخلي (`Internal_Issue_Form`)
- **الاسم الإنجليزي:** Internal Stock Issue Note
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** صرف أصناف وخامات من المستودع لأقسام التشغيل، المشروعات، أو مراكز التكلفة
- **جداول قاعدة البيانات المستهدفة:** `Internal_Issue_Head`, `Internal_Issue_Details`

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
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Internal_Issue_Head.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Internal_Issue_Head.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `RadGridView1` | **RadGridView1** | `RadGridView` | - | - | - | - |
| `Note_Date` | **تاريخ الحركة** | `RadDateTimePicker` | `Internal_Issue_Head.Note_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Items_GridView` | **Items_GridView** | `RadGridView` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `RadLabel15` | **RadLabel15** | `RadLabel` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Label8` | **Label8** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Note_No` | **رقم الحركة / السند** | `RadTextBox` | `Internal_Issue_Head.Note_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Internal_Issue_Head.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Label10` | **Label10** | `Label` | - | - | - | - |
| `Label11` | **Label11** | `Label` | - | - | - | - |
| `Actual_Qty` | **الكمية** | `RadTextBox` | `Internal_Issue_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Unit_Name` | **الوحدة** | `RadTextBox` | - | - | - | - |
| `Item_Name_A` | **اسم الصنف** | `RadTextBox` | - | - | - | - |
| `Item_ID` | **كود الصنف** | `RadTextBox` | `Internal_Issue_Details.Item_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label15` | **Label15** | `Label` | - | - | - | - |
| `Net` | **الصافي المستحق** | `RadTextBox` | `Internal_Issue_Head.Note_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Actual_Price` | **السعر الفردي** | `RadTextBox` | `Internal_Issue_Details.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Label16` | **Label16** | `Label` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `RadTextBox` | `Internal_Issue_Head.Note_Net_Text` | `nvarchar(200)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `Label26` | **Label26** | `Label` | - | - | - | - |
| `Note_Total` | **الإجمالي** | `RadTextBox` | `Internal_Issue_Head.Note_Total` | `float` (NOT NULL) | `((0))` | `Total = SUM(Details.Net)` |
| `Label28` | **Label28** | `Label` | - | - | - | - |
| `Note_Actual_Qty` | **الكمية** | `RadTextBox` | `Internal_Issue_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Note_Net_With_Tax_Text` | **ضريبة القيمة المضافة** | `RadTextBox` | - | - | - | `Net = Total - Discount + Tax` |
| `SR` | **SR** | `RadTextBox` | `Internal_Issue_Details.SR` | `int` (PRIMARY KEY, NOT NULL) | - | - |
| `Inventory_Name_A` | **Inventory_Name_A** | `RadTextBox` | - | - | - | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Inventory_ID` | **كود المخزن** | `RadTextBox` | `Internal_Issue_Head.Inventory_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Unit_ID` | **الوحدة** | `RadTextBox` | `Internal_Issue_Details.Unit_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `Note_Date_H` | **تاريخ الحركة** | `RadTextBox` | `Internal_Issue_Head.Note_Date_H` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Qty` | **الكمية** | `RadTextBox` | `Internal_Issue_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Price` | **السعر الفردي** | `RadTextBox` | `Internal_Issue_Details.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Units_GridView` | **Units_GridView** | `RadGridView` | - | - | - | - |
| `Inventories_GridView` | **Inventories_GridView** | `RadGridView` | - | - | - | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Unit_Exchang` | **Unit_Exchang** | `RadTextBox` | `Internal_Issue_Details.Unit_Exchang` | `float` (NOT NULL) | `((1))` | - |
| `Print_Journal` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Costcenter_Name_A` | **اسم مركز التكلفة** | `RadTextBox` | - | - | - | - |
| `Costcenter_ID` | **كود مركز التكلفة** | `RadTextBox` | `Internal_Issue_Head.Costcenter_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label36` | **Label36** | `Label` | - | - | - | - |
| `Analysis_Name_A` | **اسم الحساب التحليلي** | `RadTextBox` | - | - | - | - |
| `Analysis_ID` | **كود الحساب التحليلي** | `RadTextBox` | `Internal_Issue_Head.Analysis_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label19` | **Label19** | `Label` | - | - | - | - |
| `Analysis_GridView` | **Analysis_GridView** | `RadGridView` | - | - | - | - |
| `Costcenters_GridView` | **Costcenters_GridView** | `RadGridView` | - | - | - | - |
| `Acc_Adap_H` | **Acc_Adap_H** | `SqlDataAdapter` | - | - | - | - |
| `Acc_Adap_D` | **Acc_Adap_D** | `SqlDataAdapter` | - | - | - | - |
| `Adap_H` | **Adap_H** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D` | **Adap_D** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D_V` | **Adap_D_V** | `SqlDataAdapter` | - | - | - | - |
| `Adap` | **Adap** | `SqlDataAdapter` | - | - | - | - |
| `Adap1` | **Adap1** | `SqlDataAdapter` | - | - | - | - |
| `Adap1_1` | **Adap1_1** | `SqlDataAdapter` | - | - | - | - |
| `Adap2` | **Adap2** | `SqlDataAdapter` | - | - | - | - |
| `Adap2_1` | **Adap2_1** | `SqlDataAdapter` | - | - | - | - |
| `Adap3` | **Adap3** | `SqlDataAdapter` | - | - | - | - |
| `Adap3_1` | **Adap3_1** | `SqlDataAdapter` | - | - | - | - |
| `Adap3_2` | **Adap3_2** | `SqlDataAdapter` | - | - | - | - |
| `Adap4` | **Adap4** | `SqlDataAdapter` | - | - | - | - |
| `Adap5` | **Adap5** | `SqlDataAdapter` | - | - | - | - |
| `Adap6` | **Adap6** | `SqlDataAdapter` | - | - | - | - |
| `Adap7` | **Adap7** | `SqlDataAdapter` | - | - | - | - |
| `Adap8` | **Adap8** | `SqlDataAdapter` | - | - | - | - |
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
| `RRS1_1` | **RRS1_1** | `DataSet` | - | - | - | - |
| `RRS2` | **RRS2** | `DataSet` | - | - | - | - |
| `RRS2_1` | **RRS2_1** | `DataSet` | - | - | - | - |
| `RRS3` | **RRS3** | `DataSet` | - | - | - | - |
| `RRS3_1` | **RRS3_1** | `DataSet` | - | - | - | - |
| `RRS3_2` | **RRS3_2** | `DataSet` | - | - | - | - |
| `RRS4` | **RRS4** | `DataSet` | - | - | - | - |
| `RRS5` | **RRS5** | `DataSet` | - | - | - | - |
| `RRS6` | **RRS6** | `DataSet` | - | - | - | - |
| `RRS7` | **RRS7** | `DataSet` | - | - | - | - |
| `RRS8` | **RRS8** | `DataSet` | - | - | - | - |
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
| `Balance_Cmd` | **الرصيد / الفارق** | `SqlCommand` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Dt` | **Dt** | `DataTable` | - | - | - | - |
| `Dt_D` | **Dt_D** | `DataTable` | - | - | - | - |
| `Dt1` | **Dt1** | `DataTable` | - | - | - | - |
| `Dt2` | **Dt2** | `DataTable` | - | - | - | - |
| `Dt3` | **Dt3** | `DataTable` | - | - | - | - |
| `Dt3_1` | **Dt3_1** | `DataTable` | - | - | - | - |
| `Dt4` | **Dt4** | `DataTable` | - | - | - | - |
| `Dt5` | **Dt5** | `DataTable` | - | - | - | - |
| `Dt6` | **Dt6** | `DataTable` | - | - | - | - |
| `Setting_Dt` | **Setting_Dt** | `DataTable` | - | - | - | - |
| `Link_Dt` | **Link_Dt** | `DataTable` | - | - | - | - |

#### ب. قواعد التحقق والمعادلات الحسابية (Validation & Business Rules)
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال وحدة الصرف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الكميـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيـد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المخزن 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم مركز التكلفة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الحساب التحليلي 
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
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الصافي تفقيطاً (كتابة بالكلمات): Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الإجمالي: Total = SUM(Details.Net) (المعادلة: `Total = SUM(Details.Net)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Balance_For_Search Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Details_View Where Item_ID=
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
Select * FROM Internal_Issue_Head_View Order By Note_No DESC
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
Select * From Stock_Settings Where ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Journals_Settings Where ID=
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
Select * FROM Costcenters_View Order By Costcenter_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Order By Analysis_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM Internal_Issue_Head Order By Note_No Desc
```
##### استعلام INSERT على جدول `Internal_Issue_Head`:
```sql
Insert Into Internal_Issue_Head(Note_No,Note_Date,Note_Date_H,Inventory_ID,Costcenter_ID,Analysis_ID,Note_Actual_Qty,Note_Total,Note_Net,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Internal_Issue_Details`:
```sql
Insert Into Internal_Issue_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Net)Values(
```
##### استعلام INSERT على جدول `Internal_Issue_Head`:
```sql
Insert Into Internal_Issue_Journals_Head(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Internal_Issue_Head`:
```sql
Insert Into Internal_Issue_Journals_Details(Note_No,SR,Level5_ID,Costcenter_ID,Analysis_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Internal_Issue_Head`:
```sql
Insert Into Internal_Issue_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Internal_Issue_Head Where Note_No=
```
##### استعلام UPDATE على جدول `Internal_Issue_Head`:
```sql
Update Internal_Issue_Head Set Note_No=
```
##### استعلام DELETE على جدول `Internal_Issue_Details`:
```sql
Delete From Internal_Issue_Details Where Note_No=
```
##### استعلام INSERT على جدول `Internal_Issue_Details`:
```sql
Insert Into Internal_Issue_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Net)Values(
```
##### استعلام DELETE على جدول `Internal_Issue_Head`:
```sql
Delete From Internal_Issue_Journals_Head Where Note_No=
```
##### استعلام DELETE على جدول `Internal_Issue_Head`:
```sql
Delete From Internal_Issue_Journals_Details Where Note_No=
```
##### استعلام INSERT على جدول `Internal_Issue_Head`:
```sql
Insert Into Internal_Issue_Journals_Head(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Internal_Issue_Head`:
```sql
Insert Into Internal_Issue_Journals_Details(Note_No,SR,Level5_ID,Costcenter_ID,Analysis_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Internal_Issue_Head`:
```sql
Insert Into Internal_Issue_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام DELETE على جدول `Internal_Issue_Head`:
```sql
Delete From Internal_Issue_Head where Note_No=
```
##### استعلام DELETE على جدول `Internal_Issue_Details`:
```sql
Delete From Internal_Issue_Details where Note_No=
```
##### استعلام DELETE على جدول `Internal_Issue_Head`:
```sql
Delete From Internal_Issue_Journals_Head Where Note_No=
```
##### استعلام DELETE على جدول `Internal_Issue_Head`:
```sql
Delete From Internal_Issue_Journals_Details Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Internal_Issue_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Internal_Issue_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Internal_Issue_Head_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_Name_A Like '%
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
Select * FROM Costcenters_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Balance_For_Search Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Internal_Issue_Head_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Internal_Issue_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_ID=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Inventory_ID_LostFocus, Inventory_Name_A_LostFocus, Note_Date_H_GotFocus, Note_Date_H_KeyDown, Note_Date_H_LostFocus, Net_GotFocus, Net_KeyDown, Net_LostFocus, Actual_Price_KeyPress, Actual_Price_LostFocus, Item_Name_A_LostFocus, Note_Actual_Qty_GotFocus, Note_Actual_Qty_KeyDown, Note_Total_GotFocus, Note_Total_KeyDown, Note_Actual_Qty_LostFocus, Note_Total_LostFocus, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, Note_Net_Text_LostFocus, Unit_ID_GotFocus, Unit_ID_KeyDown, Unit_Name_GotFocus, Unit_Name_KeyDown, Units_GridView_CellClick, Units_GridView_CellFormatting, Units_GridView_KeyDown, Unit_ID_LostFocus, Unit_Name_LostFocus, Note_Date_ValueChanged, Print_Journal_Click, Print_Journal_KeyDown, Costcenter_ID_GotFocus, Costcenter_ID_KeyDown, Costcenter_ID_KeyPress, Analysis_ID_GotFocus, Analysis_ID_KeyDown, Analysis_ID_KeyPress, Analysis_GridView_CellClick, Analysis_GridView_CellFormatting, Analysis_GridView_KeyDown, Costcenters_GridView_CellClick, Costcenters_GridView_CellFormatting, Costcenters_GridView_KeyDown, Costcenter_Name_A_GotFocus, Analysis_Name_A_GotFocus, Analysis_Name_A_KeyDown, Costcenter_Name_A_KeyDown, Costcenter_ID_LostFocus, Costcenter_Name_A_LostFocus, Analysis_ID_LostFocus, Analysis_Name_A_LostFocus, set_Unit_Exchang, get_Print_Journal, set_Print_Journal, get_Costcenter_Name_A, set_Costcenter_Name_A, get_Costcenter_ID, set_Costcenter_ID, get_Label36, set_Label36, get_Analysis_Name_A, set_Analysis_Name_A, get_Analysis_ID, set_Analysis_ID, get_Label19, set_Label19, get_Analysis_GridView, set_Analysis_GridView, get_Costcenters_GridView, set_Costcenters_GridView, Clear_Record, Clear_Data, Fill_Grid, Fill_Inventories_Grid, Fill_Items_Grid, Fill_Units_Grid, Fill_Analysis_Grid, Fill_Costcenters_Grid, Lock_Control, Enable_Control, Review_Record, Find_Total, Internal_Issue_Form_KeyDown, Internal_Issue_Form_Load, Internal_Issue_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Note_No_GotFocus, Note_No_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Notice_GotFocus, Notice_KeyDown, Notice_KeyPress, Note_Date_KeyDown, Note_Date_Opened, RadGridView1_DoubleClick, RadGridView1_KeyDown, Item_ID_GotFocus, Item_ID_KeyDown, Item_ID_KeyPress, Item_Name_A_GotFocus, Item_Name_A_KeyDown, Items_GridView_CellClick, Items_GridView_CellFormatting, Items_GridView_KeyDown, Actual_Qty_GotFocus, Actual_Qty_KeyDown, Actual_Qty_KeyPress, Actual_Price_GotFocus, Actual_Price_KeyDown, Note_No_KeyPress, Note_No_LostFocus, Notice_LostFocus, Qty_LostFocus, Item_ID_LostFocus, Search_Txt_LostFocus, Inventory_ID_GotFocus, Inventory_ID_KeyDown, Inventory_ID_KeyPress, Inventory_Name_A_GotFocus, Inventory_Name_A_KeyDown, Inventories_GridView_CellClick, Inventories_GridView_CellFormatting, Inventories_GridView_KeyDown, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadPanel4, set_RadPanel4, get_RadGridView1, set_RadGridView1, get_Note_Date, set_Note_Date, get_Items_GridView, set_Items_GridView, get_AquaTheme1, set_AquaTheme1, get_RadLabel15, set_RadLabel15, get_Label13, set_Label13, get_Label8, set_Label8, get_Label6, set_Label6, get_Note_No, set_Note_No, get_Notice, set_Notice, get_Label4, set_Label4, get_Label9, set_Label9, get_Label10, set_Label10, get_Label11, set_Label11, get_Actual_Qty, set_Actual_Qty, get_Unit_Name, set_Unit_Name, get_Item_Name_A, set_Item_Name_A, get_Item_ID, set_Item_ID, get_Label15, set_Label15, get_Net, set_Net, get_Label14, set_Label14, get_Actual_Price, set_Actual_Price, get_Label16, set_Label16, get_Note_Net_Text, set_Note_Net_Text, get_Label26, set_Label26, get_Note_Total, set_Note_Total, get_Label28, set_Label28, get_Note_Actual_Qty, set_Note_Actual_Qty, get_Note_Net_With_Tax_Text, set_Note_Net_With_Tax_Text, get_SR, set_SR, get_Inventory_Name_A, set_Inventory_Name_A, get_Label1, set_Label1, get_Inventory_ID, set_Inventory_ID, get_Unit_ID, set_Unit_ID, get_Note_Date_H, set_Note_Date_H, get_Label2, set_Label2, get_Qty, set_Qty, get_Price, set_Price, get_Units_GridView, set_Units_GridView, get_Inventories_GridView, set_Inventories_GridView, get_Label3, set_Label3, get_Unit_Exchang
```

---

### 3.9 شاشة: إذن إضافة واستلام مخزني داخلي (`Internal_Delivery_Form`)
- **الاسم الإنجليزي:** Internal Stock Receipt Note
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** إضافة أصناف مرتجعة من التشغيل أو مشتريات محلية للمستودع
- **جداول قاعدة البيانات المستهدفة:** `Internal_Delivery_Head`, `Internal_Delivery_Details`

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
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Internal_Delivery_Head.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Internal_Delivery_Head.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `RadGridView1` | **RadGridView1** | `RadGridView` | - | - | - | - |
| `Note_Date` | **تاريخ الحركة** | `RadDateTimePicker` | `Internal_Delivery_Head.Note_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Items_GridView` | **Items_GridView** | `RadGridView` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `RadLabel15` | **RadLabel15** | `RadLabel` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Label8` | **Label8** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Note_No` | **رقم الحركة / السند** | `RadTextBox` | `Internal_Delivery_Head.Note_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Internal_Delivery_Head.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Label10` | **Label10** | `Label` | - | - | - | - |
| `Label11` | **Label11** | `Label` | - | - | - | - |
| `Actual_Qty` | **الكمية** | `RadTextBox` | `Internal_Delivery_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Unit_Name` | **الوحدة** | `RadTextBox` | - | - | - | - |
| `Item_Name_A` | **اسم الصنف** | `RadTextBox` | - | - | - | - |
| `Item_ID` | **كود الصنف** | `RadTextBox` | `Internal_Delivery_Details.Item_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label15` | **Label15** | `Label` | - | - | - | - |
| `Net` | **الصافي المستحق** | `RadTextBox` | `Internal_Delivery_Head.Note_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Actual_Price` | **السعر الفردي** | `RadTextBox` | `Internal_Delivery_Details.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Label16` | **Label16** | `Label` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `RadTextBox` | `Internal_Delivery_Head.Note_Net_Text` | `nvarchar(200)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `Label26` | **Label26** | `Label` | - | - | - | - |
| `Note_Total` | **الإجمالي** | `RadTextBox` | `Internal_Delivery_Head.Note_Total` | `float` (NOT NULL) | `((0))` | `Total = SUM(Details.Net)` |
| `Label28` | **Label28** | `Label` | - | - | - | - |
| `Note_Actual_Qty` | **الكمية** | `RadTextBox` | `Internal_Delivery_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Note_Net_With_Tax_Text` | **ضريبة القيمة المضافة** | `RadTextBox` | - | - | - | `Net = Total - Discount + Tax` |
| `SR` | **SR** | `RadTextBox` | `Internal_Delivery_Details.SR` | `int` (PRIMARY KEY, NOT NULL) | - | - |
| `Inventory_Name_A` | **Inventory_Name_A** | `RadTextBox` | - | - | - | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Inventory_ID` | **كود المخزن** | `RadTextBox` | `Internal_Delivery_Head.Inventory_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Unit_ID` | **الوحدة** | `RadTextBox` | `Internal_Delivery_Details.Unit_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `Note_Date_H` | **تاريخ الحركة** | `RadTextBox` | `Internal_Delivery_Head.Note_Date_H` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Qty` | **الكمية** | `RadTextBox` | `Internal_Delivery_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Price` | **السعر الفردي** | `RadTextBox` | `Internal_Delivery_Details.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Units_GridView` | **Units_GridView** | `RadGridView` | - | - | - | - |
| `Inventories_GridView` | **Inventories_GridView** | `RadGridView` | - | - | - | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Unit_Exchang` | **Unit_Exchang** | `RadTextBox` | `Internal_Delivery_Details.Unit_Exchang` | `float` (NOT NULL) | `((1))` | - |
| `Print_Journal` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Costcenter_Name_A` | **اسم مركز التكلفة** | `RadTextBox` | - | - | - | - |
| `Costcenter_ID` | **كود مركز التكلفة** | `RadTextBox` | `Internal_Delivery_Head.Costcenter_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label36` | **Label36** | `Label` | - | - | - | - |
| `Analysis_Name_A` | **اسم الحساب التحليلي** | `RadTextBox` | - | - | - | - |
| `Analysis_ID` | **كود الحساب التحليلي** | `RadTextBox` | `Internal_Delivery_Head.Analysis_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label19` | **Label19** | `Label` | - | - | - | - |
| `Analysis_GridView` | **Analysis_GridView** | `RadGridView` | - | - | - | - |
| `Costcenters_GridView` | **Costcenters_GridView** | `RadGridView` | - | - | - | - |
| `Acc_Adap_H` | **Acc_Adap_H** | `SqlDataAdapter` | - | - | - | - |
| `Acc_Adap_D` | **Acc_Adap_D** | `SqlDataAdapter` | - | - | - | - |
| `Adap_H` | **Adap_H** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D` | **Adap_D** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D_V` | **Adap_D_V** | `SqlDataAdapter` | - | - | - | - |
| `Adap` | **Adap** | `SqlDataAdapter` | - | - | - | - |
| `Adap1` | **Adap1** | `SqlDataAdapter` | - | - | - | - |
| `Adap1_1` | **Adap1_1** | `SqlDataAdapter` | - | - | - | - |
| `Adap2` | **Adap2** | `SqlDataAdapter` | - | - | - | - |
| `Adap2_1` | **Adap2_1** | `SqlDataAdapter` | - | - | - | - |
| `Adap3` | **Adap3** | `SqlDataAdapter` | - | - | - | - |
| `Adap3_1` | **Adap3_1** | `SqlDataAdapter` | - | - | - | - |
| `Adap3_2` | **Adap3_2** | `SqlDataAdapter` | - | - | - | - |
| `Adap4` | **Adap4** | `SqlDataAdapter` | - | - | - | - |
| `Adap5` | **Adap5** | `SqlDataAdapter` | - | - | - | - |
| `Adap6` | **Adap6** | `SqlDataAdapter` | - | - | - | - |
| `Adap7` | **Adap7** | `SqlDataAdapter` | - | - | - | - |
| `Adap8` | **Adap8** | `SqlDataAdapter` | - | - | - | - |
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
| `RRS1_1` | **RRS1_1** | `DataSet` | - | - | - | - |
| `RRS2` | **RRS2** | `DataSet` | - | - | - | - |
| `RRS2_1` | **RRS2_1** | `DataSet` | - | - | - | - |
| `RRS3` | **RRS3** | `DataSet` | - | - | - | - |
| `RRS3_1` | **RRS3_1** | `DataSet` | - | - | - | - |
| `RRS3_2` | **RRS3_2** | `DataSet` | - | - | - | - |
| `RRS4` | **RRS4** | `DataSet` | - | - | - | - |
| `RRS5` | **RRS5** | `DataSet` | - | - | - | - |
| `RRS6` | **RRS6** | `DataSet` | - | - | - | - |
| `RRS7` | **RRS7** | `DataSet` | - | - | - | - |
| `RRS8` | **RRS8** | `DataSet` | - | - | - | - |
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
| `Balance_Cmd` | **الرصيد / الفارق** | `SqlCommand` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Dt` | **Dt** | `DataTable` | - | - | - | - |
| `Dt_D` | **Dt_D** | `DataTable` | - | - | - | - |
| `Dt1` | **Dt1** | `DataTable` | - | - | - | - |
| `Dt2` | **Dt2** | `DataTable` | - | - | - | - |
| `Dt3` | **Dt3** | `DataTable` | - | - | - | - |
| `Dt3_1` | **Dt3_1** | `DataTable` | - | - | - | - |
| `Dt4` | **Dt4** | `DataTable` | - | - | - | - |
| `Dt5` | **Dt5** | `DataTable` | - | - | - | - |
| `Dt6` | **Dt6** | `DataTable` | - | - | - | - |
| `Setting_Dt` | **Setting_Dt** | `DataTable` | - | - | - | - |
| `Link_Dt` | **Link_Dt** | `DataTable` | - | - | - | - |

#### ب. قواعد التحقق والمعادلات الحسابية (Validation & Business Rules)
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال وحدة الصرف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الكميـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيـد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المخزن 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم مركز التكلفة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الحساب التحليلي 
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
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الصافي تفقيطاً (كتابة بالكلمات): Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الإجمالي: Total = SUM(Details.Net) (المعادلة: `Total = SUM(Details.Net)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
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
Select * FROM Costcenters_View Where Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Where Analysis_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Internal_Delivery_Head_View Order By Note_No DESC
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
Select * From Stock_Settings Where ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Journals_Settings Where ID=
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
Select * FROM Costcenters_View Order By Costcenter_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Order By Analysis_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM Internal_Delivery_Head Order By Note_No Desc
```
##### استعلام INSERT على جدول `Internal_Delivery_Head`:
```sql
Insert Into Internal_Delivery_Head(Note_No,Note_Date,Note_Date_H,Inventory_ID,Costcenter_ID,Analysis_ID,Note_Actual_Qty,Note_Total,Note_Net,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Internal_Delivery_Details`:
```sql
Insert Into Internal_Delivery_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Net)Values(
```
##### استعلام INSERT على جدول `Internal_Delivery_Head`:
```sql
Insert Into Internal_Delivery_Journals_Head(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Internal_Delivery_Head`:
```sql
Insert Into Internal_Delivery_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Internal_Delivery_Head`:
```sql
Insert Into Internal_Delivery_Journals_Details(Note_No,SR,Level5_ID,Costcenter_ID,Analysis_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Internal_Delivery_Head Where Note_No=
```
##### استعلام UPDATE على جدول `Internal_Delivery_Head`:
```sql
Update Internal_Delivery_Head Set Note_No=
```
##### استعلام DELETE على جدول `Internal_Delivery_Details`:
```sql
Delete From Internal_Delivery_Details Where Note_No=
```
##### استعلام INSERT على جدول `Internal_Delivery_Details`:
```sql
Insert Into Internal_Delivery_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Net)Values(
```
##### استعلام DELETE على جدول `Internal_Delivery_Head`:
```sql
Delete From Internal_Delivery_Journals_Head Where Note_No=
```
##### استعلام DELETE على جدول `Internal_Delivery_Head`:
```sql
Delete From Internal_Delivery_Journals_Details Where Note_No=
```
##### استعلام INSERT على جدول `Internal_Delivery_Head`:
```sql
Insert Into Internal_Delivery_Journals_Head(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Internal_Delivery_Head`:
```sql
Insert Into Internal_Delivery_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Internal_Delivery_Head`:
```sql
Insert Into Internal_Delivery_Journals_Details(Note_No,SR,Level5_ID,Costcenter_ID,Analysis_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام DELETE على جدول `Internal_Delivery_Head`:
```sql
Delete From Internal_Delivery_Head where Note_No=
```
##### استعلام DELETE على جدول `Internal_Delivery_Details`:
```sql
Delete From Internal_Delivery_Details where Note_No=
```
##### استعلام DELETE على جدول `Internal_Delivery_Head`:
```sql
Delete From Internal_Delivery_Journals_Head Where Note_No=
```
##### استعلام DELETE على جدول `Internal_Delivery_Head`:
```sql
Delete From Internal_Delivery_Journals_Details Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Internal_Delivery_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Internal_Delivery_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Internal_Delivery_Head_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_Name_A Like '%
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
Select * FROM Costcenters_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Internal_Delivery_Head_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Internal_Delivery_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_ID=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Inventory_ID_LostFocus, Inventory_Name_A_LostFocus, Note_Date_H_GotFocus, Note_Date_H_KeyDown, Note_Date_H_LostFocus, Net_GotFocus, Net_KeyDown, Net_LostFocus, Actual_Price_KeyPress, Actual_Price_LostFocus, Item_Name_A_LostFocus, Note_Actual_Qty_GotFocus, Note_Actual_Qty_KeyDown, Note_Total_GotFocus, Note_Total_KeyDown, Note_Actual_Qty_LostFocus, Note_Total_LostFocus, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, Note_Net_Text_LostFocus, Unit_ID_GotFocus, Unit_ID_KeyDown, Unit_Name_GotFocus, Unit_Name_KeyDown, Units_GridView_CellClick, Units_GridView_CellFormatting, Units_GridView_KeyDown, Unit_ID_LostFocus, Unit_Name_LostFocus, Note_Date_ValueChanged, Print_Journal_Click, Print_Journal_KeyDown, Costcenter_ID_GotFocus, Costcenter_ID_KeyDown, Costcenter_ID_KeyPress, Analysis_ID_GotFocus, Analysis_ID_KeyDown, Analysis_ID_KeyPress, Analysis_GridView_CellClick, Analysis_GridView_CellFormatting, Analysis_GridView_KeyDown, Costcenters_GridView_CellClick, Costcenters_GridView_CellFormatting, Costcenters_GridView_KeyDown, Costcenter_Name_A_GotFocus, Analysis_Name_A_GotFocus, Analysis_Name_A_KeyDown, Costcenter_Name_A_KeyDown, Costcenter_ID_LostFocus, Costcenter_Name_A_LostFocus, Analysis_ID_LostFocus, Analysis_Name_A_LostFocus, set_Unit_Exchang, get_Print_Journal, set_Print_Journal, get_Costcenter_Name_A, set_Costcenter_Name_A, get_Costcenter_ID, set_Costcenter_ID, get_Label36, set_Label36, get_Analysis_Name_A, set_Analysis_Name_A, get_Analysis_ID, set_Analysis_ID, get_Label19, set_Label19, get_Analysis_GridView, set_Analysis_GridView, get_Costcenters_GridView, set_Costcenters_GridView, Clear_Record, Clear_Data, Fill_Grid, Fill_Inventories_Grid, Fill_Items_Grid, Fill_Units_Grid, Fill_Analysis_Grid, Fill_Costcenters_Grid, Lock_Control, Enable_Control, Review_Record, Find_Total, Internal_Delivery_Form_KeyDown, Internal_Delivery_Form_Load, Internal_Delivery_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Note_No_GotFocus, Note_No_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Notice_GotFocus, Notice_KeyDown, Notice_KeyPress, Note_Date_KeyDown, Note_Date_Opened, RadGridView1_DoubleClick, RadGridView1_KeyDown, Item_ID_GotFocus, Item_ID_KeyDown, Item_ID_KeyPress, Item_Name_A_GotFocus, Item_Name_A_KeyDown, Items_GridView_CellClick, Items_GridView_CellFormatting, Items_GridView_KeyDown, Actual_Qty_GotFocus, Actual_Qty_KeyDown, Actual_Qty_KeyPress, Actual_Price_GotFocus, Actual_Price_KeyDown, Note_No_KeyPress, Note_No_LostFocus, Notice_LostFocus, Qty_LostFocus, Item_ID_LostFocus, Search_Txt_LostFocus, Inventory_ID_GotFocus, Inventory_ID_KeyDown, Inventory_ID_KeyPress, Inventory_Name_A_GotFocus, Inventory_Name_A_KeyDown, Inventories_GridView_CellClick, Inventories_GridView_CellFormatting, Inventories_GridView_KeyDown, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadPanel4, set_RadPanel4, get_RadGridView1, set_RadGridView1, get_Note_Date, set_Note_Date, get_Items_GridView, set_Items_GridView, get_AquaTheme1, set_AquaTheme1, get_RadLabel15, set_RadLabel15, get_Label13, set_Label13, get_Label8, set_Label8, get_Label6, set_Label6, get_Note_No, set_Note_No, get_Notice, set_Notice, get_Label4, set_Label4, get_Label9, set_Label9, get_Label10, set_Label10, get_Label11, set_Label11, get_Actual_Qty, set_Actual_Qty, get_Unit_Name, set_Unit_Name, get_Item_Name_A, set_Item_Name_A, get_Item_ID, set_Item_ID, get_Label15, set_Label15, get_Net, set_Net, get_Label14, set_Label14, get_Actual_Price, set_Actual_Price, get_Label16, set_Label16, get_Note_Net_Text, set_Note_Net_Text, get_Label26, set_Label26, get_Note_Total, set_Note_Total, get_Label28, set_Label28, get_Note_Actual_Qty, set_Note_Actual_Qty, get_Note_Net_With_Tax_Text, set_Note_Net_With_Tax_Text, get_SR, set_SR, get_Inventory_Name_A, set_Inventory_Name_A, get_Label1, set_Label1, get_Inventory_ID, set_Inventory_ID, get_Unit_ID, set_Unit_ID, get_Note_Date_H, set_Note_Date_H, get_Label2, set_Label2, get_Qty, set_Qty, get_Price, set_Price, get_Units_GridView, set_Units_GridView, get_Inventories_GridView, set_Inventories_GridView, get_Label3, set_Label3, get_Unit_Exchang
```

---

### 3.10 شاشة: إذن صرف خارجي (أمانات / تشغيل لدى الغير) (`External_Issue_Form`)
- **الاسم الإنجليزي:** External Consignment Issue Note
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** صرف بضاعة وخامات لمقاولين أو موردين للتشغيل الخارجي كعهدة مؤقتة
- **جداول قاعدة البيانات المستهدفة:** `External_Issue_Head`, `External_Issue_Details`

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
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `External_Issue_Head.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `External_Issue_Head.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `RadGridView1` | **RadGridView1** | `RadGridView` | - | - | - | - |
| `Note_Date` | **تاريخ الحركة** | `RadDateTimePicker` | `External_Issue_Head.Note_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Items_GridView` | **Items_GridView** | `RadGridView` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `RadLabel15` | **RadLabel15** | `RadLabel` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Label8` | **Label8** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Note_No` | **رقم الحركة / السند** | `RadTextBox` | `External_Issue_Head.Note_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `External_Issue_Head.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Label10` | **Label10** | `Label` | - | - | - | - |
| `Label11` | **Label11** | `Label` | - | - | - | - |
| `Actual_Qty` | **الكمية** | `RadTextBox` | `External_Issue_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Unit_Name` | **الوحدة** | `RadTextBox` | - | - | - | - |
| `Item_Name_A` | **اسم الصنف** | `RadTextBox` | - | - | - | - |
| `Item_ID` | **كود الصنف** | `RadTextBox` | `External_Issue_Details.Item_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label15` | **Label15** | `Label` | - | - | - | - |
| `Net` | **الصافي المستحق** | `RadTextBox` | `External_Issue_Head.Note_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Actual_Price` | **السعر الفردي** | `RadTextBox` | `External_Issue_Details.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Label16` | **Label16** | `Label` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `RadTextBox` | `External_Issue_Head.Note_Net_Text` | `nvarchar(200)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `Label26` | **Label26** | `Label` | - | - | - | - |
| `Note_Total` | **الإجمالي** | `RadTextBox` | `External_Issue_Head.Note_Total` | `float` (NOT NULL) | `((0))` | `Total = SUM(Details.Net)` |
| `Label28` | **Label28** | `Label` | - | - | - | - |
| `Note_Actual_Qty` | **الكمية** | `RadTextBox` | `External_Issue_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Note_Net_With_Tax_Text` | **ضريبة القيمة المضافة** | `RadTextBox` | - | - | - | `Net = Total - Discount + Tax` |
| `SR` | **SR** | `RadTextBox` | `External_Issue_Details.SR` | `int` (PRIMARY KEY, NOT NULL) | - | - |
| `Inventory_Name_A` | **Inventory_Name_A** | `RadTextBox` | - | - | - | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Inventory_ID` | **كود المخزن** | `RadTextBox` | `External_Issue_Head.Inventory_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Unit_ID` | **الوحدة** | `RadTextBox` | `External_Issue_Details.Unit_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `Note_Date_H` | **تاريخ الحركة** | `RadTextBox` | `External_Issue_Head.Note_Date_H` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Qty` | **الكمية** | `RadTextBox` | `External_Issue_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Price` | **السعر الفردي** | `RadTextBox` | `External_Issue_Details.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Units_GridView` | **Units_GridView** | `RadGridView` | - | - | - | - |
| `Inventories_GridView` | **Inventories_GridView** | `RadGridView` | - | - | - | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Unit_Exchang` | **Unit_Exchang** | `RadTextBox` | `External_Issue_Details.Unit_Exchang` | `float` (NOT NULL) | `((1))` | - |
| `Costcenter_Name_A` | **اسم مركز التكلفة** | `RadTextBox` | - | - | - | - |
| `Costcenter_ID` | **كود مركز التكلفة** | `RadTextBox` | `External_Issue_Head.Costcenter_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label36` | **Label36** | `Label` | - | - | - | - |
| `Analysis_Name_A` | **اسم الحساب التحليلي** | `RadTextBox` | - | - | - | - |
| `Analysis_ID` | **كود الحساب التحليلي** | `RadTextBox` | `External_Issue_Head.Analysis_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label19` | **Label19** | `Label` | - | - | - | - |
| `Analysis_GridView` | **Analysis_GridView** | `RadGridView` | - | - | - | - |
| `Costcenters_GridView` | **Costcenters_GridView** | `RadGridView` | - | - | - | - |
| `Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `External_Issue_Head.Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `Acc_Adap_H` | **Acc_Adap_H** | `SqlDataAdapter` | - | - | - | - |
| `Acc_Adap_D` | **Acc_Adap_D** | `SqlDataAdapter` | - | - | - | - |
| `Adap_H` | **Adap_H** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D` | **Adap_D** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D_V` | **Adap_D_V** | `SqlDataAdapter` | - | - | - | - |
| `Adap` | **Adap** | `SqlDataAdapter` | - | - | - | - |
| `Adap1` | **Adap1** | `SqlDataAdapter` | - | - | - | - |
| `Adap1_1` | **Adap1_1** | `SqlDataAdapter` | - | - | - | - |
| `Adap2` | **Adap2** | `SqlDataAdapter` | - | - | - | - |
| `Adap2_1` | **Adap2_1** | `SqlDataAdapter` | - | - | - | - |
| `Adap3` | **Adap3** | `SqlDataAdapter` | - | - | - | - |
| `Adap3_1` | **Adap3_1** | `SqlDataAdapter` | - | - | - | - |
| `Adap3_2` | **Adap3_2** | `SqlDataAdapter` | - | - | - | - |
| `Adap4` | **Adap4** | `SqlDataAdapter` | - | - | - | - |
| `Adap5` | **Adap5** | `SqlDataAdapter` | - | - | - | - |
| `Adap6` | **Adap6** | `SqlDataAdapter` | - | - | - | - |
| `Adap7` | **Adap7** | `SqlDataAdapter` | - | - | - | - |
| `Adap8` | **Adap8** | `SqlDataAdapter` | - | - | - | - |
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
| `RRS1_1` | **RRS1_1** | `DataSet` | - | - | - | - |
| `RRS2` | **RRS2** | `DataSet` | - | - | - | - |
| `RRS2_1` | **RRS2_1** | `DataSet` | - | - | - | - |
| `RRS3` | **RRS3** | `DataSet` | - | - | - | - |
| `RRS3_1` | **RRS3_1** | `DataSet` | - | - | - | - |
| `RRS3_2` | **RRS3_2** | `DataSet` | - | - | - | - |
| `RRS4` | **RRS4** | `DataSet` | - | - | - | - |
| `RRS5` | **RRS5** | `DataSet` | - | - | - | - |
| `RRS6` | **RRS6** | `DataSet` | - | - | - | - |
| `RRS7` | **RRS7** | `DataSet` | - | - | - | - |
| `RRS8` | **RRS8** | `DataSet` | - | - | - | - |
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
| `Cmd07` | **Cmd07** | `SqlCommand` | - | - | - | - |
| `Cmd2` | **Cmd2** | `SqlCommand` | - | - | - | - |
| `Cmd3` | **Cmd3** | `SqlCommand` | - | - | - | - |
| `Cmd4` | **Cmd4** | `SqlCommand` | - | - | - | - |
| `Cmd5` | **Cmd5** | `SqlCommand` | - | - | - | - |
| `Cmd6` | **Cmd6** | `SqlCommand` | - | - | - | - |
| `Cmd7` | **Cmd7** | `SqlCommand` | - | - | - | - |
| `Balance_Cmd` | **الرصيد / الفارق** | `SqlCommand` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Dt` | **Dt** | `DataTable` | - | - | - | - |
| `Dt_D` | **Dt_D** | `DataTable` | - | - | - | - |
| `Dt1` | **Dt1** | `DataTable` | - | - | - | - |
| `Dt2` | **Dt2** | `DataTable` | - | - | - | - |
| `Dt3` | **Dt3** | `DataTable` | - | - | - | - |
| `Dt3_1` | **Dt3_1** | `DataTable` | - | - | - | - |
| `Dt4` | **Dt4** | `DataTable` | - | - | - | - |
| `Dt5` | **Dt5** | `DataTable` | - | - | - | - |
| `Dt6` | **Dt6** | `DataTable` | - | - | - | - |
| `Setting_Dt` | **Setting_Dt** | `DataTable` | - | - | - | - |
| `Link_Dt` | **Link_Dt** | `DataTable` | - | - | - | - |

#### ب. قواعد التحقق والمعادلات الحسابية (Validation & Business Rules)
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال وحدة الصرف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الكميـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المخزن 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم مركز التكلفة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الحساب التحليلي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الحساب 
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
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الصافي تفقيطاً (كتابة بالكلمات): Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الإجمالي: Total = SUM(Details.Net) (المعادلة: `Total = SUM(Details.Net)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
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
Select * FROM External_Issue_Head_View Order By Note_No DESC
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
Select * From Stock_Settings Where ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Journals_Settings Where ID=
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
Select * FROM Costcenters_View Order By Costcenter_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Order By Analysis_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Order By Level5_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM External_Issue_Head Order By Note_No Desc
```
##### استعلام INSERT على جدول `External_Issue_Head`:
```sql
Insert Into External_Issue_Head(Note_No,Note_Date,Note_Date_H,Inventory_ID,Costcenter_ID,Analysis_ID,Level5_ID,Note_Actual_Qty,Note_Total,Note_Net,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `External_Issue_Details`:
```sql
Insert Into External_Issue_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Net)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM External_Issue_Head Where Note_No=
```
##### استعلام UPDATE على جدول `External_Issue_Head`:
```sql
Update External_Issue_Head Set Note_No=
```
##### استعلام DELETE على جدول `External_Issue_Details`:
```sql
Delete From External_Issue_Details Where Note_No=
```
##### استعلام INSERT على جدول `External_Issue_Details`:
```sql
Insert Into External_Issue_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Net)Values(
```
##### استعلام DELETE على جدول `External_Issue_Head`:
```sql
Delete From External_Issue_Head where Note_No=
```
##### استعلام DELETE على جدول `External_Issue_Details`:
```sql
Delete From External_Issue_Details where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From External_Issue_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From External_Issue_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM External_Issue_Head_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_Name_A Like '%
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
Select * FROM Costcenters_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM External_Issue_Head_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From External_Issue_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_ID=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Inventory_Name_A_GotFocus, Inventory_Name_A_KeyDown, Inventories_GridView_CellClick, Inventories_GridView_CellFormatting, Inventories_GridView_KeyDown, Inventory_ID_LostFocus, Inventory_Name_A_LostFocus, Note_Date_H_GotFocus, Note_Date_H_KeyDown, Note_Date_H_LostFocus, Net_GotFocus, Net_KeyDown, Net_LostFocus, Actual_Price_KeyPress, Actual_Price_LostFocus, Item_Name_A_LostFocus, Note_Actual_Qty_GotFocus, Note_Actual_Qty_KeyDown, Note_Total_GotFocus, Note_Total_KeyDown, Note_Actual_Qty_LostFocus, Note_Total_LostFocus, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, Note_Net_Text_LostFocus, Unit_ID_GotFocus, Unit_ID_KeyDown, Unit_Name_GotFocus, Unit_Name_KeyDown, Units_GridView_CellClick, Units_GridView_CellFormatting, Units_GridView_KeyDown, Unit_ID_LostFocus, Unit_Name_LostFocus, Note_Date_ValueChanged, Costcenter_ID_GotFocus, Costcenter_ID_KeyDown, Costcenter_ID_KeyPress, Analysis_ID_GotFocus, Analysis_ID_KeyDown, Analysis_ID_KeyPress, Analysis_GridView_CellClick, Analysis_GridView_CellFormatting, Analysis_GridView_KeyDown, Costcenters_GridView_CellClick, Costcenters_GridView_CellFormatting, Costcenters_GridView_KeyDown, Costcenter_Name_A_GotFocus, Analysis_Name_A_GotFocus, Analysis_Name_A_KeyDown, Costcenter_Name_A_KeyDown, Costcenter_ID_LostFocus, Costcenter_Name_A_LostFocus, Analysis_ID_LostFocus, Analysis_Name_A_LostFocus, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, Level5_ID_GotFocus, Level5_ID_KeyDown, Level5_ID_KeyPress, Level5_ID_LostFocus, Level5_Name_A_GotFocus, Level5_Name_A_KeyDown, Level5_Name_A_LostFocus, set_Unit_Exchang, get_Costcenter_Name_A, set_Costcenter_Name_A, get_Costcenter_ID, set_Costcenter_ID, get_Label36, set_Label36, get_Analysis_Name_A, set_Analysis_Name_A, get_Analysis_ID, set_Analysis_ID, get_Label19, set_Label19, get_Analysis_GridView, set_Analysis_GridView, get_Costcenters_GridView, set_Costcenters_GridView, get_Level5_Name_A, set_Level5_Name_A, get_Level5_ID, set_Level5_ID, get_Label5, set_Label5, get_Level5_GridView, set_Level5_GridView, Clear_Record, Clear_Data, Fill_Grid, Fill_Inventories_Grid, Fill_Items_Grid, Fill_Units_Grid, Fill_Level5_Grid, Fill_Analysis_Grid, Fill_Costcenters_Grid, Lock_Control, Enable_Control, Review_Record, Find_Total, External_Issue_Form_KeyDown, External_Issue_Form_Load, External_Issue_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Note_No_GotFocus, Note_No_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Notice_GotFocus, Notice_KeyDown, Notice_KeyPress, Note_Date_KeyDown, Note_Date_Opened, RadGridView1_DoubleClick, RadGridView1_KeyDown, Item_ID_GotFocus, Item_ID_KeyDown, Item_ID_KeyPress, Item_Name_A_GotFocus, Item_Name_A_KeyDown, Items_GridView_CellClick, Items_GridView_CellFormatting, Items_GridView_KeyDown, Actual_Qty_GotFocus, Actual_Qty_KeyDown, Actual_Qty_KeyPress, Actual_Price_GotFocus, Actual_Price_KeyDown, Note_No_KeyPress, Note_No_LostFocus, Notice_LostFocus, Qty_LostFocus, Item_ID_LostFocus, Search_Txt_LostFocus, Inventory_ID_GotFocus, Inventory_ID_KeyDown, Inventory_ID_KeyPress, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadPanel4, set_RadPanel4, get_RadGridView1, set_RadGridView1, get_Note_Date, set_Note_Date, get_Items_GridView, set_Items_GridView, get_AquaTheme1, set_AquaTheme1, get_RadLabel15, set_RadLabel15, get_Label13, set_Label13, get_Label8, set_Label8, get_Label6, set_Label6, get_Note_No, set_Note_No, get_Notice, set_Notice, get_Label4, set_Label4, get_Label9, set_Label9, get_Label10, set_Label10, get_Label11, set_Label11, get_Actual_Qty, set_Actual_Qty, get_Unit_Name, set_Unit_Name, get_Item_Name_A, set_Item_Name_A, get_Item_ID, set_Item_ID, get_Label15, set_Label15, get_Net, set_Net, get_Label14, set_Label14, get_Actual_Price, set_Actual_Price, get_Label16, set_Label16, get_Note_Net_Text, set_Note_Net_Text, get_Label26, set_Label26, get_Note_Total, set_Note_Total, get_Label28, set_Label28, get_Note_Actual_Qty, set_Note_Actual_Qty, get_Note_Net_With_Tax_Text, set_Note_Net_With_Tax_Text, get_SR, set_SR, get_Inventory_Name_A, set_Inventory_Name_A, get_Label1, set_Label1, get_Inventory_ID, set_Inventory_ID, get_Unit_ID, set_Unit_ID, get_Note_Date_H, set_Note_Date_H, get_Label2, set_Label2, get_Qty, set_Qty, get_Price, set_Price, get_Units_GridView, set_Units_GridView, get_Inventories_GridView, set_Inventories_GridView, get_Label3, set_Label3, get_Unit_Exchang
```

---

### 3.11 شاشة: إذن إضافة / استلام خارجي (`External_Delivery_Form`)
- **الاسم الإنجليزي:** External Consignment Receipt Note
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** استلام بضائع تم تشغيلها خارجياً أو استرداد أمانات مخزنية
- **جداول قاعدة البيانات المستهدفة:** `External_Delivery_Head`, `External_Delivery_Details`

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
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `External_Delivery_Head.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `External_Delivery_Head.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `RadGridView1` | **RadGridView1** | `RadGridView` | - | - | - | - |
| `Note_Date` | **تاريخ الحركة** | `RadDateTimePicker` | `External_Delivery_Head.Note_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Items_GridView` | **Items_GridView** | `RadGridView` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `RadLabel15` | **RadLabel15** | `RadLabel` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Label8` | **Label8** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Note_No` | **رقم الحركة / السند** | `RadTextBox` | `External_Delivery_Head.Note_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `External_Delivery_Head.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Label10` | **Label10** | `Label` | - | - | - | - |
| `Label11` | **Label11** | `Label` | - | - | - | - |
| `Actual_Qty` | **الكمية** | `RadTextBox` | `External_Delivery_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Unit_Name` | **الوحدة** | `RadTextBox` | - | - | - | - |
| `Item_Name_A` | **اسم الصنف** | `RadTextBox` | - | - | - | - |
| `Item_ID` | **كود الصنف** | `RadTextBox` | `External_Delivery_Details.Item_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label15` | **Label15** | `Label` | - | - | - | - |
| `Net` | **الصافي المستحق** | `RadTextBox` | `External_Delivery_Head.Note_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Actual_Price` | **السعر الفردي** | `RadTextBox` | `External_Delivery_Details.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Label16` | **Label16** | `Label` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `RadTextBox` | `External_Delivery_Head.Note_Net_Text` | `nvarchar(200)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `Label26` | **Label26** | `Label` | - | - | - | - |
| `Note_Total` | **الإجمالي** | `RadTextBox` | `External_Delivery_Head.Note_Total` | `float` (NOT NULL) | `((0))` | `Total = SUM(Details.Net)` |
| `Label28` | **Label28** | `Label` | - | - | - | - |
| `Note_Actual_Qty` | **الكمية** | `RadTextBox` | `External_Delivery_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Note_Net_With_Tax_Text` | **ضريبة القيمة المضافة** | `RadTextBox` | - | - | - | `Net = Total - Discount + Tax` |
| `SR` | **SR** | `RadTextBox` | `External_Delivery_Details.SR` | `int` (PRIMARY KEY, NOT NULL) | - | - |
| `Inventory_Name_A` | **Inventory_Name_A** | `RadTextBox` | - | - | - | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Inventory_ID` | **كود المخزن** | `RadTextBox` | `External_Delivery_Head.Inventory_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Unit_ID` | **الوحدة** | `RadTextBox` | `External_Delivery_Details.Unit_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `Note_Date_H` | **تاريخ الحركة** | `RadTextBox` | `External_Delivery_Head.Note_Date_H` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Qty` | **الكمية** | `RadTextBox` | `External_Delivery_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Price` | **السعر الفردي** | `RadTextBox` | `External_Delivery_Details.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Units_GridView` | **Units_GridView** | `RadGridView` | - | - | - | - |
| `Inventories_GridView` | **Inventories_GridView** | `RadGridView` | - | - | - | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Unit_Exchang` | **Unit_Exchang** | `RadTextBox` | `External_Delivery_Details.Unit_Exchang` | `float` (NOT NULL) | `((1))` | - |
| `Print_Journal` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Costcenter_Name_A` | **اسم مركز التكلفة** | `RadTextBox` | - | - | - | - |
| `Costcenter_ID` | **كود مركز التكلفة** | `RadTextBox` | `External_Delivery_Head.Costcenter_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label36` | **Label36** | `Label` | - | - | - | - |
| `Analysis_Name_A` | **اسم الحساب التحليلي** | `RadTextBox` | - | - | - | - |
| `Analysis_ID` | **كود الحساب التحليلي** | `RadTextBox` | `External_Delivery_Head.Analysis_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label19` | **Label19** | `Label` | - | - | - | - |
| `Analysis_GridView` | **Analysis_GridView** | `RadGridView` | - | - | - | - |
| `Costcenters_GridView` | **Costcenters_GridView** | `RadGridView` | - | - | - | - |
| `Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `External_Delivery_Head.Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `Acc_Adap_H` | **Acc_Adap_H** | `SqlDataAdapter` | - | - | - | - |
| `Acc_Adap_D` | **Acc_Adap_D** | `SqlDataAdapter` | - | - | - | - |
| `Adap_H` | **Adap_H** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D` | **Adap_D** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D_V` | **Adap_D_V** | `SqlDataAdapter` | - | - | - | - |
| `Adap` | **Adap** | `SqlDataAdapter` | - | - | - | - |
| `Adap1` | **Adap1** | `SqlDataAdapter` | - | - | - | - |
| `Adap1_1` | **Adap1_1** | `SqlDataAdapter` | - | - | - | - |
| `Adap2` | **Adap2** | `SqlDataAdapter` | - | - | - | - |
| `Adap2_1` | **Adap2_1** | `SqlDataAdapter` | - | - | - | - |
| `Adap3` | **Adap3** | `SqlDataAdapter` | - | - | - | - |
| `Adap3_1` | **Adap3_1** | `SqlDataAdapter` | - | - | - | - |
| `Adap3_2` | **Adap3_2** | `SqlDataAdapter` | - | - | - | - |
| `Adap4` | **Adap4** | `SqlDataAdapter` | - | - | - | - |
| `Adap5` | **Adap5** | `SqlDataAdapter` | - | - | - | - |
| `Adap6` | **Adap6** | `SqlDataAdapter` | - | - | - | - |
| `Adap7` | **Adap7** | `SqlDataAdapter` | - | - | - | - |
| `Adap8` | **Adap8** | `SqlDataAdapter` | - | - | - | - |
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
| `RRS1_1` | **RRS1_1** | `DataSet` | - | - | - | - |
| `RRS2` | **RRS2** | `DataSet` | - | - | - | - |
| `RRS2_1` | **RRS2_1** | `DataSet` | - | - | - | - |
| `RRS3` | **RRS3** | `DataSet` | - | - | - | - |
| `RRS3_1` | **RRS3_1** | `DataSet` | - | - | - | - |
| `RRS3_2` | **RRS3_2** | `DataSet` | - | - | - | - |
| `RRS4` | **RRS4** | `DataSet` | - | - | - | - |
| `RRS5` | **RRS5** | `DataSet` | - | - | - | - |
| `RRS6` | **RRS6** | `DataSet` | - | - | - | - |
| `RRS7` | **RRS7** | `DataSet` | - | - | - | - |
| `RRS8` | **RRS8** | `DataSet` | - | - | - | - |
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
| `Cmd07` | **Cmd07** | `SqlCommand` | - | - | - | - |
| `Cmd2` | **Cmd2** | `SqlCommand` | - | - | - | - |
| `Cmd3` | **Cmd3** | `SqlCommand` | - | - | - | - |
| `Cmd4` | **Cmd4** | `SqlCommand` | - | - | - | - |
| `Cmd5` | **Cmd5** | `SqlCommand` | - | - | - | - |
| `Cmd6` | **Cmd6** | `SqlCommand` | - | - | - | - |
| `Cmd7` | **Cmd7** | `SqlCommand` | - | - | - | - |
| `Balance_Cmd` | **الرصيد / الفارق** | `SqlCommand` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Dt` | **Dt** | `DataTable` | - | - | - | - |
| `Dt_D` | **Dt_D** | `DataTable` | - | - | - | - |
| `Dt1` | **Dt1** | `DataTable` | - | - | - | - |
| `Dt2` | **Dt2** | `DataTable` | - | - | - | - |
| `Dt3` | **Dt3** | `DataTable` | - | - | - | - |
| `Dt3_1` | **Dt3_1** | `DataTable` | - | - | - | - |
| `Dt4` | **Dt4** | `DataTable` | - | - | - | - |
| `Dt5` | **Dt5** | `DataTable` | - | - | - | - |
| `Dt6` | **Dt6** | `DataTable` | - | - | - | - |
| `Setting_Dt` | **Setting_Dt** | `DataTable` | - | - | - | - |
| `Link_Dt` | **Link_Dt** | `DataTable` | - | - | - | - |

#### ب. قواعد التحقق والمعادلات الحسابية (Validation & Business Rules)
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال وحدة الصرف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الكميـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيـد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المخزن 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم مركز التكلفة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الحساب التحليلي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الحساب 
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
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الصافي تفقيطاً (كتابة بالكلمات): Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الإجمالي: Total = SUM(Details.Net) (المعادلة: `Total = SUM(Details.Net)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
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
Select * FROM External_Delivery_Head_View Order By Note_No DESC
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
Select * From Stock_Settings Where ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Journals_Settings Where ID=
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
Select * FROM Costcenters_View Order By Costcenter_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Order By Analysis_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Order By Level5_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM External_Delivery_Head Order By Note_No Desc
```
##### استعلام INSERT على جدول `External_Delivery_Head`:
```sql
Insert Into External_Delivery_Head(Note_No,Note_Date,Note_Date_H,Inventory_ID,Costcenter_ID,Analysis_ID,Level5_ID,Note_Actual_Qty,Note_Total,Note_Net,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `External_Delivery_Details`:
```sql
Insert Into External_Delivery_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Net)Values(
```
##### استعلام INSERT على جدول `External_Delivery_Head`:
```sql
Insert Into External_Delivery_Journals_Head(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `External_Delivery_Head`:
```sql
Insert Into External_Delivery_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `External_Delivery_Head`:
```sql
Insert Into External_Delivery_Journals_Details(Note_No,SR,Level5_ID,Costcenter_ID,Analysis_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM External_Delivery_Head Where Note_No=
```
##### استعلام UPDATE على جدول `External_Delivery_Head`:
```sql
Update External_Delivery_Head Set Note_No=
```
##### استعلام DELETE على جدول `External_Delivery_Details`:
```sql
Delete From External_Delivery_Details Where Note_No=
```
##### استعلام INSERT على جدول `External_Delivery_Details`:
```sql
Insert Into External_Delivery_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Net)Values(
```
##### استعلام DELETE على جدول `External_Delivery_Head`:
```sql
Delete From External_Delivery_Journals_Head Where Note_No=
```
##### استعلام DELETE على جدول `External_Delivery_Head`:
```sql
Delete From External_Delivery_Journals_Details Where Note_No=
```
##### استعلام INSERT على جدول `External_Delivery_Head`:
```sql
Insert Into External_Delivery_Journals_Head(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `External_Delivery_Head`:
```sql
Insert Into External_Delivery_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `External_Delivery_Head`:
```sql
Insert Into External_Delivery_Journals_Details(Note_No,SR,Level5_ID,Costcenter_ID,Analysis_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام DELETE على جدول `External_Delivery_Head`:
```sql
Delete From External_Delivery_Head where Note_No=
```
##### استعلام DELETE على جدول `External_Delivery_Details`:
```sql
Delete From External_Delivery_Details where Note_No=
```
##### استعلام DELETE على جدول `External_Delivery_Head`:
```sql
Delete From External_Delivery_Journals_Head Where Note_No=
```
##### استعلام DELETE على جدول `External_Delivery_Head`:
```sql
Delete From External_Delivery_Journals_Details Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From External_Delivery_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From External_Delivery_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM External_Delivery_Head_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_Name_A Like '%
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
Select * FROM Costcenters_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM External_Delivery_Head_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From External_Delivery_Details_View Where Note_No=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Inventory_ID_KeyPress, Inventory_Name_A_GotFocus, Inventory_Name_A_KeyDown, Inventories_GridView_CellClick, Inventories_GridView_CellFormatting, Inventories_GridView_KeyDown, Inventory_ID_LostFocus, Inventory_Name_A_LostFocus, Note_Date_H_GotFocus, Note_Date_H_KeyDown, Note_Date_H_LostFocus, Net_GotFocus, Net_KeyDown, Net_LostFocus, Actual_Price_KeyPress, Actual_Price_LostFocus, Item_Name_A_LostFocus, Note_Actual_Qty_GotFocus, Note_Actual_Qty_KeyDown, Note_Total_GotFocus, Note_Total_KeyDown, Note_Actual_Qty_LostFocus, Note_Total_LostFocus, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, Note_Net_Text_LostFocus, Unit_ID_GotFocus, Unit_ID_KeyDown, Unit_Name_GotFocus, Unit_Name_KeyDown, Units_GridView_CellClick, Units_GridView_CellFormatting, Units_GridView_KeyDown, Unit_ID_LostFocus, Unit_Name_LostFocus, Note_Date_ValueChanged, Print_Journal_Click, Print_Journal_KeyDown, Costcenter_ID_GotFocus, Costcenter_ID_KeyDown, Costcenter_ID_KeyPress, Analysis_ID_GotFocus, Analysis_ID_KeyDown, Analysis_ID_KeyPress, Analysis_GridView_CellClick, Analysis_GridView_CellFormatting, Analysis_GridView_KeyDown, Costcenters_GridView_CellClick, Costcenters_GridView_CellFormatting, Costcenters_GridView_KeyDown, Costcenter_Name_A_GotFocus, Analysis_Name_A_GotFocus, Analysis_Name_A_KeyDown, Costcenter_Name_A_KeyDown, Costcenter_ID_LostFocus, Costcenter_Name_A_LostFocus, Analysis_ID_LostFocus, Analysis_Name_A_LostFocus, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, Level5_ID_GotFocus, Level5_ID_KeyDown, Level5_ID_KeyPress, Level5_ID_LostFocus, Level5_Name_A_GotFocus, Level5_Name_A_KeyDown, Level5_Name_A_LostFocus, set_Unit_Exchang, get_Print_Journal, set_Print_Journal, get_Costcenter_Name_A, set_Costcenter_Name_A, get_Costcenter_ID, set_Costcenter_ID, get_Label36, set_Label36, get_Analysis_Name_A, set_Analysis_Name_A, get_Analysis_ID, set_Analysis_ID, get_Label19, set_Label19, get_Analysis_GridView, set_Analysis_GridView, get_Costcenters_GridView, set_Costcenters_GridView, get_Level5_Name_A, set_Level5_Name_A, get_Level5_ID, set_Level5_ID, get_Label5, set_Label5, get_Level5_GridView, set_Level5_GridView, Clear_Record, Clear_Data, Fill_Grid, Fill_Inventories_Grid, Fill_Items_Grid, Fill_Units_Grid, Fill_Analysis_Grid, Fill_Level5_Grid, Fill_Costcenters_Grid, Lock_Control, Enable_Control, Review_Record, Find_Total, External_Delivery_Form_KeyDown, External_Delivery_Form_Load, External_Delivery_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Note_No_GotFocus, Note_No_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Notice_GotFocus, Notice_KeyDown, Notice_KeyPress, Note_Date_KeyDown, Note_Date_Opened, RadGridView1_DoubleClick, RadGridView1_KeyDown, Item_ID_GotFocus, Item_ID_KeyDown, Item_ID_KeyPress, Item_Name_A_GotFocus, Item_Name_A_KeyDown, Items_GridView_CellClick, Items_GridView_CellFormatting, Items_GridView_KeyDown, Actual_Qty_GotFocus, Actual_Qty_KeyDown, Actual_Qty_KeyPress, Actual_Price_GotFocus, Actual_Price_KeyDown, Note_No_KeyPress, Note_No_LostFocus, Notice_LostFocus, Qty_LostFocus, Item_ID_LostFocus, Search_Txt_LostFocus, Inventory_ID_GotFocus, Inventory_ID_KeyDown, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadPanel4, set_RadPanel4, get_RadGridView1, set_RadGridView1, get_Note_Date, set_Note_Date, get_Items_GridView, set_Items_GridView, get_AquaTheme1, set_AquaTheme1, get_RadLabel15, set_RadLabel15, get_Label13, set_Label13, get_Label8, set_Label8, get_Label6, set_Label6, get_Note_No, set_Note_No, get_Notice, set_Notice, get_Label4, set_Label4, get_Label9, set_Label9, get_Label10, set_Label10, get_Label11, set_Label11, get_Actual_Qty, set_Actual_Qty, get_Unit_Name, set_Unit_Name, get_Item_Name_A, set_Item_Name_A, get_Item_ID, set_Item_ID, get_Label15, set_Label15, get_Net, set_Net, get_Label14, set_Label14, get_Actual_Price, set_Actual_Price, get_Label16, set_Label16, get_Note_Net_Text, set_Note_Net_Text, get_Label26, set_Label26, get_Note_Total, set_Note_Total, get_Label28, set_Label28, get_Note_Actual_Qty, set_Note_Actual_Qty, get_Note_Net_With_Tax_Text, set_Note_Net_With_Tax_Text, get_SR, set_SR, get_Inventory_Name_A, set_Inventory_Name_A, get_Label1, set_Label1, get_Inventory_ID, set_Inventory_ID, get_Unit_ID, set_Unit_ID, get_Note_Date_H, set_Note_Date_H, get_Label2, set_Label2, get_Qty, set_Qty, get_Price, set_Price, get_Units_GridView, set_Units_GridView, get_Inventories_GridView, set_Inventories_GridView, get_Label3, set_Label3, get_Unit_Exchang
```

---

### 3.12 شاشة: التحويل بين المخازن (`Transfer_Form`)
- **الاسم الإنجليزي:** Inter-Warehouse Transfer
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** نقل البضائع والأصناف من مستودع مصدر إلى مستودع مقصد وتأكيد الاستلام
- **جداول قاعدة البيانات المستهدفة:** `Transfer_Issue_Head`, `Transfer_Issue_Details`, `Transfer_Delivery_Head`, `Transfer_Delivery_Details`

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
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Transfer_Issue_Head.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Transfer_Issue_Head.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `RadGridView1` | **RadGridView1** | `RadGridView` | - | - | - | - |
| `Note_Date` | **تاريخ الحركة** | `RadDateTimePicker` | `Transfer_Issue_Head.Note_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Items_GridView` | **Items_GridView** | `RadGridView` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `RadLabel15` | **RadLabel15** | `RadLabel` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Label8` | **Label8** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Note_No` | **رقم الحركة / السند** | `RadTextBox` | `Transfer_Issue_Head.Note_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Transfer_Issue_Head.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Label10` | **Label10** | `Label` | - | - | - | - |
| `Label11` | **Label11** | `Label` | - | - | - | - |
| `Actual_Qty` | **الكمية** | `RadTextBox` | `Transfer_Issue_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Unit_Name` | **الوحدة** | `RadTextBox` | - | - | - | - |
| `Item_Name_A` | **اسم الصنف** | `RadTextBox` | - | - | - | - |
| `Item_ID` | **كود الصنف** | `RadTextBox` | `Transfer_Issue_Details.Item_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label15` | **Label15** | `Label` | - | - | - | - |
| `Net` | **الصافي المستحق** | `RadTextBox` | `Transfer_Issue_Head.Note_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Actual_Price` | **السعر الفردي** | `RadTextBox` | `Transfer_Issue_Details.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Label16` | **Label16** | `Label` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `RadTextBox` | `Transfer_Issue_Head.Note_Net_Text` | `nvarchar(200)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `Label26` | **Label26** | `Label` | - | - | - | - |
| `Note_Total` | **الإجمالي** | `RadTextBox` | `Transfer_Issue_Head.Note_Total` | `float` (NOT NULL) | `((0))` | `Total = SUM(Details.Net)` |
| `Label28` | **Label28** | `Label` | - | - | - | - |
| `Note_Actual_Qty` | **الكمية** | `RadTextBox` | `Transfer_Issue_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Note_Net_With_Tax_Text` | **ضريبة القيمة المضافة** | `RadTextBox` | - | - | - | `Net = Total - Discount + Tax` |
| `SR` | **SR** | `RadTextBox` | `Transfer_Issue_Details.SR` | `int` (PRIMARY KEY, NOT NULL) | - | - |
| `Inventory_Name_A` | **Inventory_Name_A** | `RadTextBox` | - | - | - | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Inventory_ID` | **كود المخزن** | `RadTextBox` | `Transfer_Issue_Head.Inventory_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Unit_ID` | **الوحدة** | `RadTextBox` | `Transfer_Issue_Details.Unit_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `Note_Date_H` | **تاريخ الحركة** | `RadTextBox` | `Transfer_Issue_Head.Note_Date_H` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Qty` | **الكمية** | `RadTextBox` | `Transfer_Issue_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Price` | **السعر الفردي** | `RadTextBox` | `Transfer_Issue_Details.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Units_GridView` | **Units_GridView** | `RadGridView` | - | - | - | - |
| `Inventories_GridView` | **Inventories_GridView** | `RadGridView` | - | - | - | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Unit_Exchang` | **Unit_Exchang** | `RadTextBox` | `Transfer_Issue_Details.Unit_Exchang` | `float` (NOT NULL) | `((1))` | - |
| `Inventory_Name_A1` | **Inventory_Name_A1** | `RadTextBox` | - | - | - | - |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Inventory_ID1` | **كود المخزن** | `RadTextBox` | `Transfer_Issue_Head.Inventory_ID1` | `numeric` (NOT NULL) | `((0))` | - |
| `Print_Journal` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Acc_Adap_H` | **Acc_Adap_H** | `SqlDataAdapter` | - | - | - | - |
| `Acc_Adap_D` | **Acc_Adap_D** | `SqlDataAdapter` | - | - | - | - |
| `Adap_H` | **Adap_H** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D` | **Adap_D** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D_V` | **Adap_D_V** | `SqlDataAdapter` | - | - | - | - |
| `Adap` | **Adap** | `SqlDataAdapter` | - | - | - | - |
| `Adap1` | **Adap1** | `SqlDataAdapter` | - | - | - | - |
| `Adap1_1` | **Adap1_1** | `SqlDataAdapter` | - | - | - | - |
| `Adap2` | **Adap2** | `SqlDataAdapter` | - | - | - | - |
| `Adap2_1` | **Adap2_1** | `SqlDataAdapter` | - | - | - | - |
| `Adap3` | **Adap3** | `SqlDataAdapter` | - | - | - | - |
| `Adap3_1` | **Adap3_1** | `SqlDataAdapter` | - | - | - | - |
| `Adap3_2` | **Adap3_2** | `SqlDataAdapter` | - | - | - | - |
| `Adap4` | **Adap4** | `SqlDataAdapter` | - | - | - | - |
| `Adap5` | **Adap5** | `SqlDataAdapter` | - | - | - | - |
| `Adap6` | **Adap6** | `SqlDataAdapter` | - | - | - | - |
| `Adap7` | **Adap7** | `SqlDataAdapter` | - | - | - | - |
| `Adap8` | **Adap8** | `SqlDataAdapter` | - | - | - | - |
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
| `RRS1_1` | **RRS1_1** | `DataSet` | - | - | - | - |
| `RRS2` | **RRS2** | `DataSet` | - | - | - | - |
| `RRS2_1` | **RRS2_1** | `DataSet` | - | - | - | - |
| `RRS3` | **RRS3** | `DataSet` | - | - | - | - |
| `RRS3_1` | **RRS3_1** | `DataSet` | - | - | - | - |
| `RRS3_2` | **RRS3_2** | `DataSet` | - | - | - | - |
| `RRS4` | **RRS4** | `DataSet` | - | - | - | - |
| `RRS5` | **RRS5** | `DataSet` | - | - | - | - |
| `RRS6` | **RRS6** | `DataSet` | - | - | - | - |
| `RRS7` | **RRS7** | `DataSet` | - | - | - | - |
| `RRS8` | **RRS8** | `DataSet` | - | - | - | - |
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
| `Cmd2` | **Cmd2** | `SqlCommand` | - | - | - | - |
| `Cmd3` | **Cmd3** | `SqlCommand` | - | - | - | - |
| `Cmd4` | **Cmd4** | `SqlCommand` | - | - | - | - |
| `Cmd5` | **Cmd5** | `SqlCommand` | - | - | - | - |
| `Balance_Cmd` | **الرصيد / الفارق** | `SqlCommand` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Dt` | **Dt** | `DataTable` | - | - | - | - |
| `Dt_D` | **Dt_D** | `DataTable` | - | - | - | - |
| `Dt1` | **Dt1** | `DataTable` | - | - | - | - |
| `Dt2` | **Dt2** | `DataTable` | - | - | - | - |
| `Dt3` | **Dt3** | `DataTable` | - | - | - | - |
| `Dt3_1` | **Dt3_1** | `DataTable` | - | - | - | - |
| `Dt4` | **Dt4** | `DataTable` | - | - | - | - |
| `Dt5` | **Dt5** | `DataTable` | - | - | - | - |
| `Dt6` | **Dt6** | `DataTable` | - | - | - | - |
| `Setting_Dt` | **Setting_Dt** | `DataTable` | - | - | - | - |
| `Link_Dt` | **Link_Dt** | `DataTable` | - | - | - | - |

#### ب. قواعد التحقق والمعادلات الحسابية (Validation & Business Rules)
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيـد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المخزن 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المخزن المحول له 
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال وحدة الصرف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الكميـة 
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الصافي تفقيطاً (كتابة بالكلمات): Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الإجمالي: Total = SUM(Details.Net) (المعادلة: `Total = SUM(Details.Net)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
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
Select * FROM Inventories Where Inventory_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Transfer_Head_View Order By Note_No DESC
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
Select * From Stock_Settings Where ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Journals_Settings Where ID=
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
Select top 1 Note_No FROM Transfer_Issue_Head Order By Note_No Desc
```
##### استعلام INSERT على جدول `Transfer_Issue_Head`:
```sql
Insert Into Transfer_Issue_Head(Note_No,Note_Date,Note_Date_H,Inventory_ID,Inventory_ID1,Note_Actual_Qty,Note_Total,Note_Net,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Transfer_Delivery_Head`:
```sql
Insert Into Transfer_Delivery_Head(Note_No,Note_Date,Note_Date_H,Inventory_ID,Inventory_ID1,Note_Actual_Qty,Note_Total,Note_Net,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Transfer_Issue_Details`:
```sql
Insert Into Transfer_Issue_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Net)Values(
```
##### استعلام INSERT على جدول `Transfer_Delivery_Details`:
```sql
Insert Into Transfer_Delivery_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Net)Values(
```
##### استعلام INSERT على جدول `Transfer_Issue_Head`:
```sql
Insert Into Transfer_Journals_Head(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Transfer_Issue_Head`:
```sql
Insert Into Transfer_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Transfer_Issue_Head`:
```sql
Insert Into Transfer_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Transfer_Issue_Head Where Note_No=
```
##### استعلام UPDATE على جدول `Transfer_Issue_Head`:
```sql
Update Transfer_Issue_Head Set Note_No=
```
##### استعلام UPDATE على جدول `Transfer_Delivery_Head`:
```sql
Update Transfer_Delivery_Head Set Note_No=
```
##### استعلام DELETE على جدول `Transfer_Issue_Details`:
```sql
Delete From Transfer_Issue_Details Where Note_No=
```
##### استعلام DELETE على جدول `Transfer_Delivery_Details`:
```sql
Delete From Transfer_Delivery_Details Where Note_No=
```
##### استعلام INSERT على جدول `Transfer_Issue_Details`:
```sql
Insert Into Transfer_Issue_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Net)Values(
```
##### استعلام INSERT على جدول `Transfer_Delivery_Details`:
```sql
Insert Into Transfer_Delivery_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Net)Values(
```
##### استعلام DELETE على جدول `Transfer_Issue_Head`:
```sql
Delete From Transfer_Journals_Head Where Note_No=
```
##### استعلام DELETE على جدول `Transfer_Issue_Head`:
```sql
Delete From Transfer_Journals_Details Where Note_No=
```
##### استعلام INSERT على جدول `Transfer_Issue_Head`:
```sql
Insert Into Transfer_Journals_Head(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Transfer_Issue_Head`:
```sql
Insert Into Transfer_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Transfer_Issue_Head`:
```sql
Insert Into Transfer_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام DELETE على جدول `Transfer_Issue_Head`:
```sql
Delete From Transfer_Issue_Head where Note_No=
```
##### استعلام DELETE على جدول `Transfer_Delivery_Head`:
```sql
Delete From Transfer_Delivery_Head where Note_No=
```
##### استعلام DELETE على جدول `Transfer_Issue_Details`:
```sql
Delete From Transfer_Issue_Details Where Note_No=
```
##### استعلام DELETE على جدول `Transfer_Delivery_Details`:
```sql
Delete From Transfer_Delivery_Details Where Note_No=
```
##### استعلام DELETE على جدول `Transfer_Issue_Head`:
```sql
Delete From Transfer_Journals_Head Where Note_No=
```
##### استعلام DELETE على جدول `Transfer_Issue_Head`:
```sql
Delete From Transfer_Journals_Details Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Transfer_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Transfer_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Transfer_Head_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_Name_A Like '%
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
Select * FROM Transfer_Head_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Transfer_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_ID=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Actual_Price_LostFocus, Item_Name_A_LostFocus, Note_Actual_Qty_GotFocus, Note_Actual_Qty_KeyDown, Note_Total_GotFocus, Note_Total_KeyDown, Note_Actual_Qty_LostFocus, Note_Total_LostFocus, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, Note_Net_Text_LostFocus, Unit_ID_GotFocus, Unit_ID_KeyDown, Unit_Name_GotFocus, Unit_Name_KeyDown, Units_GridView_CellClick, Units_GridView_CellFormatting, Units_GridView_KeyDown, Unit_ID_LostFocus, Unit_Name_LostFocus, Note_Date_ValueChanged, Inventory_ID1_GotFocus, Inventory_ID1_KeyDown, Inventory_ID1_KeyPress, Inventory_Name_A1_GotFocus, Inventory_Name_A1_KeyDown, Inventory_ID1_LostFocus, Inventory_Name_A1_LostFocus, Print_Journal_Click, Print_Journal_KeyDown, set_Unit_Exchang, get_Inventory_Name_A1, set_Inventory_Name_A1, get_Label5, set_Label5, get_Inventory_ID1, set_Inventory_ID1, get_Print_Journal, set_Print_Journal, Clear_Record, Clear_Data, Fill_Grid, Fill_Inventories_Grid, Fill_Items_Grid, Fill_Units_Grid, Lock_Control, Enable_Control, Review_Record, Find_Total, Transfer_Form_KeyDown, Transfer_Form_Load, Transfer_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Note_No_GotFocus, Note_No_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Notice_GotFocus, Notice_KeyDown, Notice_KeyPress, Note_Date_KeyDown, Note_Date_Opened, RadGridView1_DoubleClick, RadGridView1_KeyDown, Item_ID_GotFocus, Item_ID_KeyDown, Item_ID_KeyPress, Item_Name_A_GotFocus, Item_Name_A_KeyDown, Items_GridView_CellClick, Items_GridView_CellFormatting, Items_GridView_KeyDown, Actual_Qty_GotFocus, Actual_Qty_KeyDown, Actual_Qty_KeyPress, Actual_Price_GotFocus, Actual_Price_KeyDown, Note_No_KeyPress, Note_No_LostFocus, Notice_LostFocus, Qty_LostFocus, Item_ID_LostFocus, Search_Txt_LostFocus, Inventory_ID_GotFocus, Inventory_ID_KeyDown, Inventory_ID_KeyPress, Inventory_Name_A_GotFocus, Inventory_Name_A_KeyDown, Inventories_GridView_CellClick, Inventories_GridView_CellFormatting, Inventories_GridView_KeyDown, Inventory_ID_LostFocus, Inventory_Name_A_LostFocus, Note_Date_H_GotFocus, Note_Date_H_KeyDown, Note_Date_H_LostFocus, Net_GotFocus, Net_KeyDown, Net_LostFocus, Actual_Price_KeyPress, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadPanel4, set_RadPanel4, get_RadGridView1, set_RadGridView1, get_Note_Date, set_Note_Date, get_Items_GridView, set_Items_GridView, get_AquaTheme1, set_AquaTheme1, get_RadLabel15, set_RadLabel15, get_Label13, set_Label13, get_Label8, set_Label8, get_Label6, set_Label6, get_Note_No, set_Note_No, get_Notice, set_Notice, get_Label4, set_Label4, get_Label9, set_Label9, get_Label10, set_Label10, get_Label11, set_Label11, get_Actual_Qty, set_Actual_Qty, get_Unit_Name, set_Unit_Name, get_Item_Name_A, set_Item_Name_A, get_Item_ID, set_Item_ID, get_Label15, set_Label15, get_Net, set_Net, get_Label14, set_Label14, get_Actual_Price, set_Actual_Price, get_Label16, set_Label16, get_Note_Net_Text, set_Note_Net_Text, get_Label26, set_Label26, get_Note_Total, set_Note_Total, get_Label28, set_Label28, get_Note_Actual_Qty, set_Note_Actual_Qty, get_Note_Net_With_Tax_Text, set_Note_Net_With_Tax_Text, get_SR, set_SR, get_Inventory_Name_A, set_Inventory_Name_A, get_Label1, set_Label1, get_Inventory_ID, set_Inventory_ID, get_Unit_ID, set_Unit_ID, get_Note_Date_H, set_Note_Date_H, get_Label2, set_Label2, get_Qty, set_Qty, get_Price, set_Price, get_Units_GridView, set_Units_GridView, get_Inventories_GridView, set_Inventories_GridView, get_Label3, set_Label3, get_Unit_Exchang
```

---

### 3.13 شاشة: تسوية جردية للمخزون (`Stock_Adjustment_Form`)
- **الاسم الإنجليزي:** Inventory Stock Adjustment
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** إثبات نتائج الجرد الفعلي للمخازن وتسوية فروق العجز بالصرف وفروق الزيادة بالإضافة
- **جداول قاعدة البيانات المستهدفة:** `Stock_Adjustment_Head`, `Stock_Adjustment_Details`

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
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Stock_Adjustment_Head.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Stock_Adjustment_Head.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `RadGridView1` | **RadGridView1** | `RadGridView` | - | - | - | - |
| `Note_Date` | **تاريخ الحركة** | `RadDateTimePicker` | `Stock_Adjustment_Head.Note_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Items_GridView` | **Items_GridView** | `RadGridView` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `RadLabel15` | **RadLabel15** | `RadLabel` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Label8` | **Label8** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Note_No` | **رقم الحركة / السند** | `RadTextBox` | `Stock_Adjustment_Head.Note_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Stock_Adjustment_Head.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Label10` | **Label10** | `Label` | - | - | - | - |
| `Label11` | **Label11** | `Label` | - | - | - | - |
| `Actual_Qty` | **الكمية** | `RadTextBox` | `Stock_Adjustment_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Unit_Name` | **الوحدة** | `RadTextBox` | - | - | - | - |
| `Item_Name_A` | **اسم الصنف** | `RadTextBox` | - | - | - | - |
| `Item_ID` | **كود الصنف** | `RadTextBox` | `Stock_Adjustment_Details.Item_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label15` | **Label15** | `Label` | - | - | - | - |
| `Net` | **الصافي المستحق** | `RadTextBox` | `Stock_Adjustment_Head.Note_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Actual_Price` | **السعر الفردي** | `RadTextBox` | `Stock_Adjustment_Details.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Label16` | **Label16** | `Label` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `RadTextBox` | `Stock_Adjustment_Head.Note_Net_Text` | `nvarchar(200)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `Label26` | **Label26** | `Label` | - | - | - | - |
| `Note_Total` | **الإجمالي** | `RadTextBox` | `Stock_Adjustment_Head.Note_Total` | `float` (NOT NULL) | `((0))` | `Total = SUM(Details.Net)` |
| `Label28` | **Label28** | `Label` | - | - | - | - |
| `Note_Actual_Qty` | **الكمية** | `RadTextBox` | `Stock_Adjustment_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Note_Net_With_Tax_Text` | **ضريبة القيمة المضافة** | `RadTextBox` | - | - | - | `Net = Total - Discount + Tax` |
| `SR` | **SR** | `RadTextBox` | `Stock_Adjustment_Details.SR` | `int` (PRIMARY KEY, NOT NULL) | - | - |
| `Inventory_Name_A` | **Inventory_Name_A** | `RadTextBox` | - | - | - | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Inventory_ID` | **كود المخزن** | `RadTextBox` | `Stock_Adjustment_Head.Inventory_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Unit_ID` | **الوحدة** | `RadTextBox` | `Stock_Adjustment_Details.Unit_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `Note_Date_H` | **تاريخ الحركة** | `RadTextBox` | `Stock_Adjustment_Head.Note_Date_H` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Qty` | **الكمية** | `RadTextBox` | `Stock_Adjustment_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Price` | **السعر الفردي** | `RadTextBox` | `Stock_Adjustment_Details.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Inventories_GridView` | **Inventories_GridView** | `RadGridView` | - | - | - | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Unit_Exchang` | **Unit_Exchang** | `RadTextBox` | `Stock_Adjustment_Details.Unit_Exchang` | `float` (NOT NULL) | `((1))` | - |
| `Prog_Balance` | **الرصيد / الفارق** | `RadTextBox` | `Stock_Adjustment_Details.Prog_Balance` | `float` (NOT NULL) | `((0))` | `Balance = Previous_Balance + Debit - Credit` |
| `Actual_Balance` | **الرصيد / الفارق** | `RadTextBox` | `Stock_Adjustment_Details.Actual_Balance` | `float` (NOT NULL) | `((0))` | `Balance = Previous_Balance + Debit - Credit` |
| `Print_Journal` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Acc_Adap_H` | **Acc_Adap_H** | `SqlDataAdapter` | - | - | - | - |
| `Acc_Adap_D` | **Acc_Adap_D** | `SqlDataAdapter` | - | - | - | - |
| `Adap_H` | **Adap_H** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D` | **Adap_D** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D_V` | **Adap_D_V** | `SqlDataAdapter` | - | - | - | - |
| `Adap` | **Adap** | `SqlDataAdapter` | - | - | - | - |
| `Adap1` | **Adap1** | `SqlDataAdapter` | - | - | - | - |
| `Adap1_1` | **Adap1_1** | `SqlDataAdapter` | - | - | - | - |
| `Adap2` | **Adap2** | `SqlDataAdapter` | - | - | - | - |
| `Adap2_1` | **Adap2_1** | `SqlDataAdapter` | - | - | - | - |
| `Adap3` | **Adap3** | `SqlDataAdapter` | - | - | - | - |
| `Adap3_1` | **Adap3_1** | `SqlDataAdapter` | - | - | - | - |
| `Adap3_2` | **Adap3_2** | `SqlDataAdapter` | - | - | - | - |
| `Adap4` | **Adap4** | `SqlDataAdapter` | - | - | - | - |
| `Adap5` | **Adap5** | `SqlDataAdapter` | - | - | - | - |
| `Adap6` | **Adap6** | `SqlDataAdapter` | - | - | - | - |
| `Adap7` | **Adap7** | `SqlDataAdapter` | - | - | - | - |
| `Adap8` | **Adap8** | `SqlDataAdapter` | - | - | - | - |
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
| `RRS1_1` | **RRS1_1** | `DataSet` | - | - | - | - |
| `RRS2` | **RRS2** | `DataSet` | - | - | - | - |
| `RRS2_1` | **RRS2_1** | `DataSet` | - | - | - | - |
| `RRS3` | **RRS3** | `DataSet` | - | - | - | - |
| `RRS3_1` | **RRS3_1** | `DataSet` | - | - | - | - |
| `RRS3_2` | **RRS3_2** | `DataSet` | - | - | - | - |
| `RRS4` | **RRS4** | `DataSet` | - | - | - | - |
| `RRS5` | **RRS5** | `DataSet` | - | - | - | - |
| `RRS6` | **RRS6** | `DataSet` | - | - | - | - |
| `RRS7` | **RRS7** | `DataSet` | - | - | - | - |
| `RRS8` | **RRS8** | `DataSet` | - | - | - | - |
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
| `Cmd2` | **Cmd2** | `SqlCommand` | - | - | - | - |
| `Cmd3` | **Cmd3** | `SqlCommand` | - | - | - | - |
| `Cmd4` | **Cmd4** | `SqlCommand` | - | - | - | - |
| `Cmd5` | **Cmd5** | `SqlCommand` | - | - | - | - |
| `Balance_Cmd` | **الرصيد / الفارق** | `SqlCommand` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Dt` | **Dt** | `DataTable` | - | - | - | - |
| `Dt_D` | **Dt_D** | `DataTable` | - | - | - | - |
| `Dt1` | **Dt1** | `DataTable` | - | - | - | - |
| `Dt2` | **Dt2** | `DataTable` | - | - | - | - |
| `Dt3` | **Dt3** | `DataTable` | - | - | - | - |
| `Dt3_1` | **Dt3_1** | `DataTable` | - | - | - | - |
| `Dt4` | **Dt4** | `DataTable` | - | - | - | - |
| `Dt5` | **Dt5** | `DataTable` | - | - | - | - |
| `Dt6` | **Dt6** | `DataTable` | - | - | - | - |
| `Setting_Dt` | **Setting_Dt** | `DataTable` | - | - | - | - |
| `Link_Dt` | **Link_Dt** | `DataTable` | - | - | - | - |

#### ب. قواعد التحقق والمعادلات الحسابية (Validation & Business Rules)
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال وحدة الصرف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الكميـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الرصيد الدفتـري 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الرصيد الفعلي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال التسـوية 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المخزن 
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيـد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الصافي تفقيطاً (كتابة بالكلمات): Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الإجمالي: Total = SUM(Details.Net) (المعادلة: `Total = SUM(Details.Net)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Stock_Adjustment_Head_View Order By Note_No DESC
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
Select * From Stock_Settings Where ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Journals_Settings Where ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Order By Inventory_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Balance_For_Search Order By Item_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM Stock_Adjustment_Head Order By Note_No Desc
```
##### استعلام INSERT على جدول `Stock_Adjustment_Head`:
```sql
Insert Into Stock_Adjustment_Head(Note_No,Note_Date,Note_Date_H,Inventory_ID,Note_Actual_Qty,Note_Total,Note_Net,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Stock_Adjustment_Details`:
```sql
Insert Into Stock_Adjustment_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Prog_Balance,Actual_Balance,Actual_Qty,Qty,Actual_Price,Price,Net)Values(
```
##### استعلام INSERT على جدول `Stock_Adjustment_Head`:
```sql
Insert Into Stock_Adjustment_Journals_Head(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Stock_Adjustment_Head`:
```sql
Insert Into Stock_Adjustment_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Stock_Adjustment_Head`:
```sql
Insert Into Stock_Adjustment_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام INSERT على جدول `Stock_Adjustment_Head`:
```sql
Insert Into Stock_Adjustment_Journals_Head(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Stock_Adjustment_Head`:
```sql
Insert Into Stock_Adjustment_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Stock_Adjustment_Head`:
```sql
Insert Into Stock_Adjustment_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Stock_Adjustment_Head Where Note_No=
```
##### استعلام UPDATE على جدول `Stock_Adjustment_Head`:
```sql
Update Stock_Adjustment_Head Set Note_No=
```
##### استعلام DELETE على جدول `Stock_Adjustment_Details`:
```sql
Delete From Stock_Adjustment_Details Where Note_No=
```
##### استعلام INSERT على جدول `Stock_Adjustment_Details`:
```sql
Insert Into Stock_Adjustment_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Prog_Balance,Actual_Balance,Actual_Qty,Qty,Actual_Price,Price,Net)Values(
```
##### استعلام DELETE على جدول `Stock_Adjustment_Head`:
```sql
Delete From Stock_Adjustment_Journals_Head Where Note_No=
```
##### استعلام DELETE على جدول `Stock_Adjustment_Head`:
```sql
Delete From Stock_Adjustment_Journals_Details Where Note_No=
```
##### استعلام INSERT على جدول `Stock_Adjustment_Head`:
```sql
Insert Into Stock_Adjustment_Journals_Head(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Stock_Adjustment_Head`:
```sql
Insert Into Stock_Adjustment_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Stock_Adjustment_Head`:
```sql
Insert Into Stock_Adjustment_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام INSERT على جدول `Stock_Adjustment_Head`:
```sql
Insert Into Stock_Adjustment_Journals_Head(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Stock_Adjustment_Head`:
```sql
Insert Into Stock_Adjustment_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit)Values(
```
##### استعلام INSERT على جدول `Stock_Adjustment_Head`:
```sql
Insert Into Stock_Adjustment_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit)Values(
```
##### استعلام DELETE على جدول `Stock_Adjustment_Head`:
```sql
Delete From Stock_Adjustment_Head where Note_No=
```
##### استعلام DELETE على جدول `Stock_Adjustment_Details`:
```sql
Delete From Stock_Adjustment_Details where Note_No=
```
##### استعلام DELETE على جدول `Stock_Adjustment_Head`:
```sql
Delete From Stock_Adjustment_Journals_Head Where Note_No=
```
##### استعلام DELETE على جدول `Stock_Adjustment_Head`:
```sql
Delete From Stock_Adjustment_Journals_Details Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Stock_Adjustment_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Stock_Adjustment_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Stock_Adjustment_Head_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Balance_For_Search Where Inventory_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_Balance_For_Search Where Inventory_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Items_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Stock_Adjustment_Head_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Stock_Adjustment_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_ID=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Note_Total_GotFocus, Note_Total_KeyDown, Note_Actual_Qty_LostFocus, Note_Total_LostFocus, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, Note_Net_Text_LostFocus, Unit_ID_GotFocus, Unit_ID_KeyDown, Unit_Name_GotFocus, Unit_Name_KeyDown, Unit_ID_LostFocus, Unit_Name_LostFocus, Note_Date_ValueChanged, Actual_Balance_GotFocus, Actual_Balance_KeyDown, Actual_Balance_KeyPress, Actual_Balance_LostFocus, set_Prog_Balance, get_Actual_Balance, set_Actual_Balance, get_Print_Journal, set_Print_Journal, Clear_Record, Clear_Data, Fill_Grid, Fill_Inventories_Grid, Fill_Items_Grid, Lock_Control, Enable_Control, Review_Record, Find_Total, Stock_Adjustment_Form_KeyDown, Stock_Adjustment_Form_Load, Stock_Adjustment_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, Print_Journal_Click, Print_Journal_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Note_No_GotFocus, Note_No_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Notice_GotFocus, Notice_KeyDown, Notice_KeyPress, Note_Date_KeyDown, Note_Date_Opened, RadGridView1_DoubleClick, RadGridView1_KeyDown, Item_ID_GotFocus, Item_ID_KeyDown, Item_ID_KeyPress, Item_Name_A_GotFocus, Item_Name_A_KeyDown, Items_GridView_CellClick, Items_GridView_CellFormatting, Items_GridView_KeyDown, Actual_Qty_GotFocus, Actual_Qty_KeyDown, Actual_Price_GotFocus, Actual_Price_KeyDown, Note_No_KeyPress, Note_No_LostFocus, Notice_LostFocus, Qty_LostFocus, Item_ID_LostFocus, Search_Txt_LostFocus, Inventory_ID_GotFocus, Inventory_ID_KeyDown, Inventory_ID_KeyPress, Inventory_Name_A_GotFocus, Inventory_Name_A_KeyDown, Inventories_GridView_CellClick, Inventories_GridView_CellFormatting, Inventories_GridView_KeyDown, Inventory_ID_LostFocus, Inventory_Name_A_LostFocus, Note_Date_H_GotFocus, Note_Date_H_KeyDown, Note_Date_H_LostFocus, Net_GotFocus, Net_KeyDown, Net_LostFocus, Actual_Price_LostFocus, Item_Name_A_LostFocus, Note_Actual_Qty_GotFocus, Note_Actual_Qty_KeyDown, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadPanel4, set_RadPanel4, get_RadGridView1, set_RadGridView1, get_Note_Date, set_Note_Date, get_Items_GridView, set_Items_GridView, get_AquaTheme1, set_AquaTheme1, get_RadLabel15, set_RadLabel15, get_Label13, set_Label13, get_Label8, set_Label8, get_Label6, set_Label6, get_Note_No, set_Note_No, get_Notice, set_Notice, get_Label4, set_Label4, get_Label9, set_Label9, get_Label10, set_Label10, get_Label11, set_Label11, get_Actual_Qty, set_Actual_Qty, get_Unit_Name, set_Unit_Name, get_Item_Name_A, set_Item_Name_A, get_Item_ID, set_Item_ID, get_Label15, set_Label15, get_Net, set_Net, get_Label14, set_Label14, get_Actual_Price, set_Actual_Price, get_Label16, set_Label16, get_Note_Net_Text, set_Note_Net_Text, get_Label26, set_Label26, get_Note_Total, set_Note_Total, get_Label28, set_Label28, get_Note_Actual_Qty, set_Note_Actual_Qty, get_Note_Net_With_Tax_Text, set_Note_Net_With_Tax_Text, get_SR, set_SR, get_Inventory_Name_A, set_Inventory_Name_A, get_Label1, set_Label1, get_Inventory_ID, set_Inventory_ID, get_Unit_ID, set_Unit_ID, get_Note_Date_H, set_Note_Date_H, get_Label2, set_Label2, get_Qty, set_Qty, get_Price, set_Price, get_Inventories_GridView, set_Inventories_GridView, get_Label3, set_Label3, get_Unit_Exchang, set_Unit_Exchang, get_Prog_Balance
```

---

### 3.14 شاشة: تجميع وتفكيك الأصناف المركبة (`Unpack_Assemble_Form`)
- **الاسم الإنجليزي:** Kit Assembly & Disassembly
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** تكوين منتجات جديدة بتجميع خامات وأصناف متعددة، أو تفكيك حزم إلى مكوناتها الأصلية
- **جداول قاعدة البيانات المستهدفة:** `Unpack_Assemble_Head`, `Unpack_Assemble_Details`

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
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Unpack_Assemble_Head.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Unpack_Assemble_Head.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `RadGridView1` | **RadGridView1** | `RadGridView` | - | - | - | - |
| `Note_Date` | **تاريخ الحركة** | `RadDateTimePicker` | `Unpack_Assemble_Head.Note_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Items_GridView` | **Items_GridView** | `RadGridView` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `RadLabel15` | **RadLabel15** | `RadLabel` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Label8` | **Label8** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Note_No` | **رقم الحركة / السند** | `RadTextBox` | `Unpack_Assemble_Head.Note_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Unpack_Assemble_Head.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Label10` | **Label10** | `Label` | - | - | - | - |
| `Label11` | **Label11** | `Label` | - | - | - | - |
| `Actual_Qty` | **الكمية** | `RadTextBox` | `Unpack_Assemble_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Unit_Name` | **الوحدة** | `RadTextBox` | - | - | - | - |
| `Item_Name_A` | **اسم الصنف** | `RadTextBox` | - | - | - | - |
| `Item_ID` | **كود الصنف** | `RadTextBox` | `Unpack_Assemble_Details.Item_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label15` | **Label15** | `Label` | - | - | - | - |
| `Net` | **الصافي المستحق** | `RadTextBox` | `Unpack_Assemble_Head.Note_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Actual_Price` | **السعر الفردي** | `RadTextBox` | `Unpack_Assemble_Details.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Label16` | **Label16** | `Label` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `RadTextBox` | `Unpack_Assemble_Head.Note_Net_Text` | `nvarchar(200)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `Label26` | **Label26** | `Label` | - | - | - | - |
| `Note_Total` | **الإجمالي** | `RadTextBox` | `Unpack_Assemble_Head.Note_Total` | `float` (NOT NULL) | `((0))` | `Total = SUM(Details.Net)` |
| `Label28` | **Label28** | `Label` | - | - | - | - |
| `Note_Actual_Qty` | **الكمية** | `RadTextBox` | `Unpack_Assemble_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Note_Net_With_Tax_Text` | **ضريبة القيمة المضافة** | `RadTextBox` | - | - | - | `Net = Total - Discount + Tax` |
| `SR` | **SR** | `RadTextBox` | `Unpack_Assemble_Details.SR` | `int` (PRIMARY KEY, NOT NULL) | - | - |
| `Inventory_Name_A` | **Inventory_Name_A** | `RadTextBox` | - | - | - | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Inventory_ID` | **كود المخزن** | `RadTextBox` | `Unpack_Assemble_Head.Inventory_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Unit_ID` | **الوحدة** | `RadTextBox` | `Unpack_Assemble_Details.Unit_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `Note_Date_H` | **تاريخ الحركة** | `RadTextBox` | `Unpack_Assemble_Head.Note_Date_H` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Qty` | **الكمية** | `RadTextBox` | `Unpack_Assemble_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Price` | **السعر الفردي** | `RadTextBox` | `Unpack_Assemble_Details.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Units_GridView` | **Units_GridView** | `RadGridView` | - | - | - | - |
| `Inventories_GridView` | **Inventories_GridView** | `RadGridView` | - | - | - | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Unit_Exchang` | **Unit_Exchang** | `RadTextBox` | `Unpack_Assemble_Details.Unit_Exchang` | `float` (NOT NULL) | `((1))` | - |
| `Issue_Unit_Exchang` | **Issue_Unit_Exchang** | `RadTextBox` | `Unpack_Assemble_Details.Unit_Exchang` | `float` (NOT NULL) | `((1))` | - |
| `Issue_Qty` | **الكمية** | `RadTextBox` | `Unpack_Assemble_Details.Qty` | `float` (NOT NULL) | `((0))` | - |
| `Issue_Unit_ID` | **الوحدة** | `RadTextBox` | `Unpack_Assemble_Details.Unit_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `Issue_Price` | **السعر الفردي** | `RadTextBox` | `Unpack_Assemble_Details.Price` | `float` (NOT NULL) | `((0))` | - |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Issue_Net` | **الصافي المستحق** | `RadTextBox` | `Unpack_Assemble_Details.Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label7` | **Label7** | `Label` | - | - | - | - |
| `Issue_Actual_Price` | **السعر الفردي** | `RadTextBox` | `Unpack_Assemble_Details.Actual_Price` | `float` (NOT NULL) | `((0))` | - |
| `Label12` | **Label12** | `Label` | - | - | - | - |
| `Label17` | **Label17** | `Label` | - | - | - | - |
| `Label18` | **Label18** | `Label` | - | - | - | - |
| `Label19` | **Label19** | `Label` | - | - | - | - |
| `Issue_Actual_Qty` | **الكمية** | `RadTextBox` | `Unpack_Assemble_Details.Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Issue_Unit_Name` | **الوحدة** | `RadTextBox` | - | - | - | - |
| `Issue_Item_Name_A` | **اسم الصنف** | `RadTextBox` | - | - | - | - |
| `Issue_Item_ID` | **كود الصنف** | `RadTextBox` | `Unpack_Assemble_Details.Item_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Acc_Adap_H` | **Acc_Adap_H** | `SqlDataAdapter` | - | - | - | - |
| `Acc_Adap_D` | **Acc_Adap_D** | `SqlDataAdapter` | - | - | - | - |
| `Adap_H` | **Adap_H** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D` | **Adap_D** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D_V` | **Adap_D_V** | `SqlDataAdapter` | - | - | - | - |
| `Adap` | **Adap** | `SqlDataAdapter` | - | - | - | - |
| `Adap1` | **Adap1** | `SqlDataAdapter` | - | - | - | - |
| `Adap1_1` | **Adap1_1** | `SqlDataAdapter` | - | - | - | - |
| `Adap2` | **Adap2** | `SqlDataAdapter` | - | - | - | - |
| `Adap2_1` | **Adap2_1** | `SqlDataAdapter` | - | - | - | - |
| `Adap3` | **Adap3** | `SqlDataAdapter` | - | - | - | - |
| `Adap3_1` | **Adap3_1** | `SqlDataAdapter` | - | - | - | - |
| `Adap3_2` | **Adap3_2** | `SqlDataAdapter` | - | - | - | - |
| `Adap4` | **Adap4** | `SqlDataAdapter` | - | - | - | - |
| `Adap5` | **Adap5** | `SqlDataAdapter` | - | - | - | - |
| `Adap6` | **Adap6** | `SqlDataAdapter` | - | - | - | - |
| `Adap7` | **Adap7** | `SqlDataAdapter` | - | - | - | - |
| `Adap8` | **Adap8** | `SqlDataAdapter` | - | - | - | - |
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
| `RRS1_1` | **RRS1_1** | `DataSet` | - | - | - | - |
| `RRS2` | **RRS2** | `DataSet` | - | - | - | - |
| `RRS2_1` | **RRS2_1** | `DataSet` | - | - | - | - |
| `RRS3` | **RRS3** | `DataSet` | - | - | - | - |
| `RRS3_1` | **RRS3_1** | `DataSet` | - | - | - | - |
| `RRS3_2` | **RRS3_2** | `DataSet` | - | - | - | - |
| `RRS4` | **RRS4** | `DataSet` | - | - | - | - |
| `RRS5` | **RRS5** | `DataSet` | - | - | - | - |
| `RRS6` | **RRS6** | `DataSet` | - | - | - | - |
| `RRS7` | **RRS7** | `DataSet` | - | - | - | - |
| `RRS8` | **RRS8** | `DataSet` | - | - | - | - |
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
| `Cmd2` | **Cmd2** | `SqlCommand` | - | - | - | - |
| `Cmd3` | **Cmd3** | `SqlCommand` | - | - | - | - |
| `Cmd4` | **Cmd4** | `SqlCommand` | - | - | - | - |
| `Cmd5` | **Cmd5** | `SqlCommand` | - | - | - | - |
| `Balance_Cmd` | **الرصيد / الفارق** | `SqlCommand` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Dt` | **Dt** | `DataTable` | - | - | - | - |
| `Dt_D` | **Dt_D** | `DataTable` | - | - | - | - |
| `Dt1` | **Dt1** | `DataTable` | - | - | - | - |
| `Dt2` | **Dt2** | `DataTable` | - | - | - | - |
| `Dt3` | **Dt3** | `DataTable` | - | - | - | - |
| `Dt3_1` | **Dt3_1** | `DataTable` | - | - | - | - |
| `Dt4` | **Dt4** | `DataTable` | - | - | - | - |
| `Dt5` | **Dt5** | `DataTable` | - | - | - | - |
| `Dt6` | **Dt6** | `DataTable` | - | - | - | - |
| `Setting_Dt` | **Setting_Dt** | `DataTable` | - | - | - | - |
| `Link_Dt` | **Link_Dt** | `DataTable` | - | - | - | - |

#### ب. قواعد التحقق والمعادلات الحسابية (Validation & Business Rules)
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال وحدة الصرف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الكميـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيـد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال وحدة الصرف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الكميـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال السـعر 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الصنـف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال وحدة الصرف 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الكميـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال السـعر 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم المخزن 
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
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الصافي تفقيطاً (كتابة بالكلمات): Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الإجمالي: Total = SUM(Details.Net) (المعادلة: `Total = SUM(Details.Net)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
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
Select * FROM Items_View Where Item_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Unpack_Assemble_Head_View Order By Note_No DESC
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
Select * From Stock_Settings Where ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Journals_Settings Where ID=
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
Select top 1 Note_No FROM Unpack_Assemble_Head Order By Note_No Desc
```
##### استعلام INSERT على جدول `Unpack_Assemble_Head`:
```sql
Insert Into Unpack_Assemble_Head(Note_No,Note_Date,Note_Date_H,Inventory_ID,Note_Actual_Qty,Note_Total,Note_Net,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Unpack_Assemble_Details`:
```sql
Insert Into Unpack_Assemble_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Net)Values(
```
##### استعلام INSERT على جدول `Unpack_Assemble_Details`:
```sql
Insert Into Unpack_Assemble_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Net)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Unpack_Assemble_Head Where Note_No=
```
##### استعلام UPDATE على جدول `Unpack_Assemble_Head`:
```sql
Update Unpack_Assemble_Head Set Note_No=
```
##### استعلام DELETE على جدول `Unpack_Assemble_Details`:
```sql
Delete From Unpack_Assemble_Details Where Note_No=
```
##### استعلام INSERT على جدول `Unpack_Assemble_Details`:
```sql
Insert Into Unpack_Assemble_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Net)Values(
```
##### استعلام INSERT على جدول `Unpack_Assemble_Details`:
```sql
Insert Into Unpack_Assemble_Details(Note_No,SR,Item_ID,Unit_ID,Unit_Exchang,Actual_Qty,Qty,Actual_Price,Price,Net)Values(
```
##### استعلام DELETE على جدول `Unpack_Assemble_Head`:
```sql
Delete From Unpack_Assemble_Head where Note_No=
```
##### استعلام DELETE على جدول `Unpack_Assemble_Details`:
```sql
Delete From Unpack_Assemble_Details where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Unpack_Assemble_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Unpack_Assemble_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Unpack_Assemble_Head_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_Name_A Like '%
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
Select * FROM Unpack_Assemble_Head_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Unpack_Assemble_Details_View Where Note_No=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Inventory_ID_KeyDown, Inventory_ID_KeyPress, Inventory_Name_A_GotFocus, Inventory_Name_A_KeyDown, Inventories_GridView_CellClick, Inventories_GridView_CellFormatting, Inventories_GridView_KeyDown, Inventory_ID_LostFocus, Inventory_Name_A_LostFocus, Note_Date_H_GotFocus, Note_Date_H_KeyDown, Note_Date_H_LostFocus, Net_GotFocus, Net_KeyDown, Net_LostFocus, Actual_Price_KeyPress, Actual_Price_LostFocus, Item_Name_A_LostFocus, Note_Actual_Qty_GotFocus, Note_Actual_Qty_KeyDown, Note_Total_GotFocus, Note_Total_KeyDown, Note_Actual_Qty_LostFocus, Note_Total_LostFocus, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, Note_Net_Text_LostFocus, Unit_ID_GotFocus, Unit_ID_KeyDown, Unit_Name_GotFocus, Unit_Name_KeyDown, Units_GridView_CellClick, Units_GridView_CellFormatting, Units_GridView_KeyDown, Unit_ID_LostFocus, Unit_Name_LostFocus, Note_Date_ValueChanged, Print_Journal_Click, Print_Journal_KeyDown, Issue_Item_ID_GotFocus, Issue_Item_ID_KeyDown, Issue_Item_ID_KeyPress, Issue_Item_ID_LostFocus, Issue_Item_Name_A_GotFocus, Issue_Item_Name_A_KeyDown, Issue_Item_Name_A_LostFocus, Issue_Actual_Qty_GotFocus, Issue_Actual_Qty_KeyDown, Issue_Actual_Qty_KeyPress, Issue_Actual_Price_GotFocus, Issue_Actual_Price_KeyDown, Issue_Actual_Price_KeyPress, Issue_Actual_Price_LostFocus, Issue_Net_GotFocus, Issue_Net_KeyDown, Issue_Net_LostFocus, Issue_Unit_Name_GotFocus, Issue_Unit_Name_KeyDown, Issue_Unit_Name_LostFocus, set_Unit_Exchang, get_Issue_Unit_Exchang, set_Issue_Unit_Exchang, get_Issue_Qty, set_Issue_Qty, get_Issue_Unit_ID, set_Issue_Unit_ID, get_Issue_Price, set_Issue_Price, get_Label5, set_Label5, get_Issue_Net, set_Issue_Net, get_Label7, set_Label7, get_Issue_Actual_Price, set_Issue_Actual_Price, get_Label12, set_Label12, get_Label17, set_Label17, get_Label18, set_Label18, get_Label19, set_Label19, get_Issue_Actual_Qty, set_Issue_Actual_Qty, get_Issue_Unit_Name, set_Issue_Unit_Name, get_Issue_Item_Name_A, set_Issue_Item_Name_A, get_Issue_Item_ID, set_Issue_Item_ID, Clear_Record, Clear_Data, Fill_Grid, Fill_Inventories_Grid, Fill_Items_Grid, Fill_Units_Grid, Lock_Control, Enable_Control, Review_Record, Find_Total, Unpack_Assemble_Form_KeyDown, Unpack_Assemble_Form_Load, Unpack_Assemble_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Note_No_GotFocus, Note_No_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Notice_GotFocus, Notice_KeyDown, Notice_KeyPress, Note_Date_KeyDown, Note_Date_Opened, RadGridView1_DoubleClick, RadGridView1_KeyDown, Item_ID_GotFocus, Item_ID_KeyDown, Item_ID_KeyPress, Item_Name_A_GotFocus, Item_Name_A_KeyDown, Items_GridView_CellClick, Items_GridView_CellFormatting, Items_GridView_KeyDown, Actual_Qty_GotFocus, Actual_Qty_KeyDown, Actual_Qty_KeyPress, Actual_Price_GotFocus, Actual_Price_KeyDown, Note_No_KeyPress, Note_No_LostFocus, Notice_LostFocus, Qty_LostFocus, Item_ID_LostFocus, Search_Txt_LostFocus, Inventory_ID_GotFocus, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadPanel4, set_RadPanel4, get_RadGridView1, set_RadGridView1, get_Note_Date, set_Note_Date, get_Items_GridView, set_Items_GridView, get_AquaTheme1, set_AquaTheme1, get_RadLabel15, set_RadLabel15, get_Label13, set_Label13, get_Label8, set_Label8, get_Label6, set_Label6, get_Note_No, set_Note_No, get_Notice, set_Notice, get_Label4, set_Label4, get_Label9, set_Label9, get_Label10, set_Label10, get_Label11, set_Label11, get_Actual_Qty, set_Actual_Qty, get_Unit_Name, set_Unit_Name, get_Item_Name_A, set_Item_Name_A, get_Item_ID, set_Item_ID, get_Label15, set_Label15, get_Net, set_Net, get_Label14, set_Label14, get_Actual_Price, set_Actual_Price, get_Label16, set_Label16, get_Note_Net_Text, set_Note_Net_Text, get_Label26, set_Label26, get_Note_Total, set_Note_Total, get_Label28, set_Label28, get_Note_Actual_Qty, set_Note_Actual_Qty, get_Note_Net_With_Tax_Text, set_Note_Net_With_Tax_Text, get_SR, set_SR, get_Inventory_Name_A, set_Inventory_Name_A, get_Label1, set_Label1, get_Inventory_ID, set_Inventory_ID, get_Unit_ID, set_Unit_ID, get_Note_Date_H, set_Note_Date_H, get_Label2, set_Label2, get_Qty, set_Qty, get_Price, set_Price, get_Units_GridView, set_Units_GridView, get_Inventories_GridView, set_Inventories_GridView, get_Label3, set_Label3, get_Unit_Exchang
```

---

### 3.15 شاشة: إعدادات وتوجيه المخازن (`Stock_Settings_Form`)
- **الاسم الإنجليزي:** Inventory Accounting Settings
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** تهيئة حسابات بضاعة أول المدة، بضاعة آخر المدة، فروق الجرد، وأرباح وخسائر المخزون
- **جداول قاعدة البيانات المستهدفة:** `Stock_Settings`

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
| `RadPanel16` | **RadPanel16** | `RadPanel` | - | - | - | - |
| `Inventories_GridView` | **Inventories_GridView** | `RadGridView` | - | - | - | - |
| `Inventory_Name_A` | **Inventory_Name_A** | `RadTextBox` | `Stock_Settings.Inventory_Name_A` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `Label15` | **Label15** | `Label` | - | - | - | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Inventory_ID` | **كود المخزن** | `RadTextBox` | `Stock_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Stock_Settings.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Stock_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | - | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `Products_Cost_Option` | **Products_Cost_Option** | `RadDropDownList` | `Stock_Settings.Products_Cost_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Decimals_Option` | **Decimals_Option** | `RadDropDownList` | `Stock_Settings.Decimals_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Stock_Adjustment_Name_A` | **Stock_Adjustment_Name_A** | `RadTextBox` | `Stock_Settings.Stock_Adjustment_Name_A` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `Stock_Adjustment_ID` | **Stock_Adjustment_ID** | `RadTextBox` | `Stock_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | - | - |
| `Label35` | **Label35** | `Label` | - | - | - | - |
| `Stock_Adjustment_Link_Option` | **Stock_Adjustment_Link_Option** | `RadCheckBox` | `Stock_Settings.Stock_Adjustment_Link_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `Depricitaion_Name_A` | **Depricitaion_Name_A** | `RadTextBox` | `Stock_Settings.Depricitaion_Name_A` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `Depricitaion_ID` | **Depricitaion_ID** | `RadTextBox` | `Stock_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | - | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Depricitaion_Link_Option` | **Depricitaion_Link_Option** | `RadCheckBox` | `Stock_Settings.Depricitaion_Link_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Offers_Name_A` | **Offers_Name_A** | `RadTextBox` | `Stock_Settings.Offers_Name_A` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `Offers_ID` | **Offers_ID** | `RadTextBox` | `Stock_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | - | - |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Offers_Link_Option` | **Offers_Link_Option** | `RadCheckBox` | `Stock_Settings.Offers_Link_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `Internal_Issue_Name_A` | **Internal_Issue_Name_A** | `RadTextBox` | `Stock_Settings.Internal_Issue_Name_A` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `Internal_Issue_ID` | **Internal_Issue_ID** | `RadTextBox` | `Stock_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Internal_Issue_Link_Option` | **Internal_Issue_Link_Option** | `RadCheckBox` | `Stock_Settings.Internal_Issue_Link_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `RadPanel7` | **RadPanel7** | `RadPanel` | - | - | - | - |
| `Accounts_Search_Option` | **حقل / زر البحث** | `RadCheckBox` | `Stock_Settings.Accounts_Search_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Costcenters_Option` | **Costcenters_Option** | `RadCheckBox` | `Stock_Settings.Costcenters_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Analysis_Option` | **Analysis_Option** | `RadCheckBox` | `Stock_Settings.Analysis_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `RadPanel8` | **RadPanel8** | `RadPanel` | - | - | - | - |
| `Transfer_Link_Option` | **Transfer_Link_Option** | `RadCheckBox` | `Stock_Settings.Transfer_Link_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `Items_Price_Option` | **السعر الفردي** | `RadCheckBox` | `Stock_Settings.Items_Price_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Search_By_Balance` | **الرصيد / الفارق** | `RadCheckBox` | `Stock_Settings.Search_By_Balance` | `smallint` (NOT NULL) | `((0))` | `Balance = Previous_Balance + Debit - Credit` |
| `External_Delivery_Name_A` | **External_Delivery_Name_A** | `RadTextBox` | `Stock_Settings.External_Delivery_Name_A` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `External_Delivery_ID` | **External_Delivery_ID** | `RadTextBox` | `Stock_Settings.ID` | `smallint` (PRIMARY KEY, NOT NULL) | - | - |
| `Label7` | **Label7** | `Label` | - | - | - | - |
| `Label19` | **Label19** | `Label` | - | - | - | - |
| `Cost_Option` | **Cost_Option** | `RadDropDownList` | `Stock_Settings.Products_Cost_Option` | `smallint` (NOT NULL) | `((0))` | - |
| `Issue_Without_Balance_Option` | **الرصيد / الفارق** | `RadCheckBox` | `Stock_Settings.Issue_Without_Balance_Option` | `smallint` (NOT NULL) | `((0))` | `Balance = Previous_Balance + Debit - Credit` |
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
| `Cmd2` | **Cmd2** | `SqlCommand` | - | - | - | - |
| `Cmd3` | **Cmd3** | `SqlCommand` | - | - | - | - |
| `Cmd4` | **Cmd4** | `SqlCommand` | - | - | - | - |
| `Cmd5` | **Cmd5** | `SqlCommand` | - | - | - | - |
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال المخـزن 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: في حالة الإضافة والتعديل يجب الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل موجود ولا يمكن حفظه مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
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
Select * FROM Stock_Settings Where ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Order By Level5_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Order By Inventory_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Users Where User_ID=
```
##### استعلام UPDATE على جدول `Stock_Settings`:
```sql
Update Stock_Settings Set Inventory_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Inventories Where Inventory_ID=
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
Clear_Record, Lock_Settings_Control, Enable_Settings_Control, Review_Settings_Record, Stock_Settings_Form_Load, Stock_Settings_Form_Resize, Modify_Click, Save_Click, F_Exit_Click, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Inventories_GridView_CellClick, Inventories_GridView_CellFormatting, Inventories_GridView_KeyDown, Search_Txt_LostFocus, Inventory_ID_GotFocus, Inventory_Name_A_GotFocus, Inventory_ID_KeyPress, Inventory_Name_A_LostFocus, Inventory_ID_LostFocus, Stock_Adjustment_ID_GotFocus, Stock_Adjustment_ID_KeyPress, Stock_Adjustment_ID_LostFocus, Stock_Adjustment_Name_A_GotFocus, Stock_Adjustment_Name_A_LostFocus, Depricitaion_ID_GotFocus, Depricitaion_ID_KeyPress, Depricitaion_ID_LostFocus, Depricitaion_Name_A_GotFocus, Depricitaion_Name_A_LostFocus, Offers_ID_GotFocus, Offers_ID_KeyPress, Offers_ID_LostFocus, Offers_Name_A_GotFocus, Offers_Name_A_LostFocus, Internal_Issue_ID_GotFocus, Internal_Issue_ID_KeyPress, Internal_Issue_ID_LostFocus, Internal_Issue_Name_A_GotFocus, Internal_Issue_Name_A_LostFocus, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, External_Delivery_ID_GotFocus, External_Delivery_ID_KeyPress, External_Delivery_ID_LostFocus, External_Delivery_Name_A_GotFocus, External_Delivery_Name_A_LostFocus, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_DesertTheme1, set_DesertTheme1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadPanel6, set_RadPanel6, get_Modify, set_Modify, get_Save, set_Save, get_F_Exit, set_F_Exit, get_Settings_Panel, set_Settings_Panel, get_RadPanel5, set_RadPanel5, get_Search_Txt, set_Search_Txt, get_RadPanel16, set_RadPanel16, get_Inventories_GridView, set_Inventories_GridView, get_Inventory_Name_A, set_Inventory_Name_A, get_Label15, set_Label15, get_Label2, set_Label2, get_Inventory_ID, set_Inventory_ID, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_Label4, set_Label4, get_Label3, set_Label3, get_AquaTheme1, set_AquaTheme1, get_Products_Cost_Option, set_Products_Cost_Option, get_Decimals_Option, set_Decimals_Option, get_RadPanel1, set_RadPanel1, get_Stock_Adjustment_Name_A, set_Stock_Adjustment_Name_A, get_Stock_Adjustment_ID, set_Stock_Adjustment_ID, get_Label35, set_Label35, get_Stock_Adjustment_Link_Option, set_Stock_Adjustment_Link_Option, get_RadPanel2, set_RadPanel2, get_Depricitaion_Name_A, set_Depricitaion_Name_A, get_Depricitaion_ID, set_Depricitaion_ID, get_Label1, set_Label1, get_Depricitaion_Link_Option, set_Depricitaion_Link_Option, get_RadPanel3, set_RadPanel3, get_Offers_Name_A, set_Offers_Name_A, get_Offers_ID, set_Offers_ID, get_Label5, set_Label5, get_Offers_Link_Option, set_Offers_Link_Option, get_RadPanel4, set_RadPanel4, get_Internal_Issue_Name_A, set_Internal_Issue_Name_A, get_Internal_Issue_ID, set_Internal_Issue_ID, get_Label6, set_Label6, get_Internal_Issue_Link_Option, set_Internal_Issue_Link_Option, get_RadPanel7, set_RadPanel7, get_Accounts_Search_Option, set_Accounts_Search_Option, get_Costcenters_Option, set_Costcenters_Option, get_Analysis_Option, set_Analysis_Option, get_RadPanel8, set_RadPanel8, get_Transfer_Link_Option, set_Transfer_Link_Option, get_Level5_GridView, set_Level5_GridView, get_Items_Price_Option, set_Items_Price_Option, get_Search_By_Balance, set_Search_By_Balance, get_External_Delivery_Name_A, set_External_Delivery_Name_A, get_External_Delivery_ID, set_External_Delivery_ID, get_Label7, set_Label7, get_Label19, set_Label19, get_Cost_Option, set_Cost_Option, get_Issue_Without_Balance_Option, set_Issue_Without_Balance_Option, Fill_Level5_Grid, Fill_Inventories_Grid
```

---

