# مواصفات ومخطط الوحدة المعمارية: المستخلصات والمشروعات والعقود وبنود الأعمال (Contracting, Extracting & Projects)
**المرحلة البرمجية:** المرحلة 3 (`Phase 03`)
**التطبيق المصدر:** `APPS ERP Application 2023.exe` (Tarabot ERP)
**قاعدة البيانات المستهدفة:** `MK_Khalil_Db_2026` (SQL Server)
**تاريخ الاستخراج الآلي:** 2026-11-03 22:30:55
---

## 1. النبذة الهندسية والهدف الوظيفي للوحدة
تتولى هذه الوحدة إدارة كافة العمليات والبيانات الخاصة بـ **المستخلصات والمشروعات والعقود وبنود الأعمال**، وتوفر دورة عمل متكاملة تبدأ من تهيئة الإعدادات والشاشات الثابتة وحتى تنفيذ العمليات اليومية وترحيلها محاسبياً ومخزنياً وفق المعايير المعتمدة في النظام.

تحتوي هذه الوحدة على **7 شاشة نموذج رئيسية** تم تشريحها واستخراج كافة عناصر التحكم، وخطوط أنابيب البيانات، والمعادلات الرياضية، وقواعد التحقق الخاصة بها.

---

## 2. الفهرس التشغيلي لشاشات الوحدة
| # | اسم الشاشة البرمجية (Form Class) | المسمى العربي | المسمى الإنجليزي | الجداول المرتبطة في قاعدة البيانات |
|---|---|---|---|---|
| 1 | `Contracts_Form` | **عقود مقاولي الباطن** | Subcontractor Contracts | `Contracts_Head, Contracts_Details` |
| 2 | `Contracts_Form_For_Clients` | **عقود المشروعات والعملاء** | Client Project Contracts | `Contracts_Head_For_Clients, Contracts_Details_For_Clients` |
| 3 | `Extracts_Form` | **مستخلصات مقاولي الباطن** | Subcontractor Work Extracts | `Extracts_Head, Extracts_Details` |
| 4 | `Extracts_Form_For_Clients` | **مستخلصات المالك والعملاء** | Client Work Extracts | `Extracts_Head_For_Clients, Extracts_Details_For_Clients` |
| 5 | `Project_Cost_Form` | **تكاليف المشروعات وبنود المقايسة** | Project Costing & BOQ Management | `Projects_Cost_Head, Projects_Cost_Details` |
| 6 | `Project_Cost_Form_By_End` | **إغلاق وتسليم بنود المشروعات** | Project BOQ Item Completion | `Projects_Cost_Details` |
| 7 | `Job_Orders_Form` | **أوامر التشغيل ومراكز العمل** | Work Orders & Job Execution | `Job_Orders` |

---

## 3. التشريح التفصيلي لنماذج الشاشات (Forms Technical Catalog)
### 3.1 شاشة: عقود مقاولي الباطن (`Contracts_Form`)
- **الاسم الإنجليزي:** Subcontractor Contracts
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** إبرام عقود مقاولي الباطن، بنود المقايسة، الكميات التعاقدية، الأسعار، والشروط الجزائية
- **جداول قاعدة البيانات المستهدفة:** `Contracts_Head`, `Contracts_Details`

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
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Contracts_Head.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Contracts_Head.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `RadGridView1` | **RadGridView1** | `RadGridView` | - | - | - | - |
| `Contract_Date` | **Contract_Date** | `RadDateTimePicker` | - | - | - | - |
| `RadLabel15` | **RadLabel15** | `RadLabel` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Label8` | **Label8** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Contract_No` | **رقم العقد** | `RadTextBox` | `Contracts_Head.Contract_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Contracts_Head.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Label10` | **Label10** | `Label` | - | - | - | - |
| `Label11` | **Label11** | `Label` | - | - | - | - |
| `Actual_Qty` | **الكمية** | `RadTextBox` | `Contracts_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Unit_Name` | **الوحدة** | `RadTextBox` | `Contracts_Details.Unit_Name` | `varchar(50)` (NOT NULL) | `('عدد')` | - |
| `Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Contracts_Head.Credit_Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label15` | **Label15** | `Label` | - | - | - | - |
| `Net` | **الصافي المستحق** | `RadTextBox` | `Contracts_Details.Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Price` | **السعر الفردي** | `RadTextBox` | `Contracts_Details.Price` | `float` (NOT NULL) | `((0))` | - |
| `Note_Total` | **الإجمالي** | `RadTextBox` | `Contracts_Head.Note_Total` | `float` (NOT NULL) | `((0))` | `Total = SUM(Details.Net)` |
| `Label28` | **Label28** | `Label` | - | - | - | - |
| `Note_Net_With_Tax_Text` | **ضريبة القيمة المضافة** | `RadTextBox` | - | - | - | `Net = Total - Discount + Tax` |
| `SR` | **SR** | `RadTextBox` | `Contracts_Details.SR` | `int` (PRIMARY KEY, NOT NULL) | - | - |
| `Note_Date_H` | **تاريخ الحركة** | `RadTextBox` | `Contracts_Head.Note_Date_H` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Qty` | **الكمية** | `RadTextBox` | `Contracts_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Units_GridView` | **Units_GridView** | `RadGridView` | - | - | - | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Credit_Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Label7` | **Label7** | `Label` | - | - | - | - |
| `Credit_Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Contracts_Head.Credit_Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Analysis_Name_A` | **اسم الحساب التحليلي** | `RadTextBox` | - | - | - | - |
| `Analysis_ID` | **كود الحساب التحليلي** | `RadTextBox` | `Contracts_Head.Analysis_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label19` | **Label19** | `Label` | - | - | - | - |
| `Label25` | **Label25** | `Label` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `TextBox` | `Contracts_Head.Note_Net_Text` | `nvarchar(250)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `Analysis_GridView` | **Analysis_GridView** | `RadGridView` | - | - | - | - |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `Cost` | **Cost** | `RadTextBox` | - | - | - | - |
| `Label35` | **Label35** | `Label` | - | - | - | - |
| `Costcenters_GridView` | **Costcenters_GridView** | `RadGridView` | - | - | - | - |
| `Costcenter_Name_A` | **اسم مركز التكلفة** | `RadTextBox` | - | - | - | - |
| `Costcenter_ID` | **كود مركز التكلفة** | `RadTextBox` | `Contracts_Head.Costcenter_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label36` | **Label36** | `Label` | - | - | - | - |
| `Note_Actual_Qty` | **الكمية** | `RadTextBox` | `Contracts_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Note_Qty` | **الكمية** | `RadTextBox` | `Contracts_Head.Note_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Label17` | **Label17** | `Label` | - | - | - | - |
| `Label16` | **Label16** | `Label` | - | - | - | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Width0` | **Width0** | `RadTextBox` | - | - | - | - |
| `Length` | **Length** | `RadTextBox` | `Contracts_Details.Length` | `float` (NOT NULL) | `((0))` | - |
| `Contract_End` | **Contract_End** | `RadCheckBox` | `Contracts_Head.Contract_End` | `bit` (NOT NULL) | `((0))` | - |
| `RadTextBox6` | **RadTextBox6** | `RadTextBox` | - | - | - | - |
| `RadTextBox5` | **RadTextBox5** | `RadTextBox` | - | - | - | - |
| `RadTextBox4` | **RadTextBox4** | `RadTextBox` | - | - | - | - |
| `Label18` | **Label18** | `Label` | - | - | - | - |
| `Work_Balance_Per` | **الرصيد / الفارق** | `RadTextBox` | `Contracts_Head.Work_Balance_Per` | `float` (NOT NULL) | `((0))` | `Balance = Previous_Balance + Debit - Credit` |
| `Label12` | **Label12** | `Label` | - | - | - | - |
| `Work_Payments_Per` | **Work_Payments_Per** | `RadTextBox` | `Contracts_Head.Work_Payments_Per` | `float` (NOT NULL) | `((0))` | - |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Work_Insurance_Per` | **Work_Insurance_Per** | `RadTextBox` | `Contracts_Head.Work_Insurance_Per` | `float` (NOT NULL) | `((0))` | - |
| `Work_Balance_ID` | **الرصيد / الفارق** | `RadTextBox` | `Contracts_Head.Work_Balance_ID` | `numeric` (NOT NULL) | `((0))` | `Balance = Previous_Balance + Debit - Credit` |
| `Work_Payments_ID` | **Work_Payments_ID** | `RadTextBox` | `Contracts_Head.Work_Payments_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Work_Insurance_ID` | **Work_Insurance_ID** | `RadTextBox` | `Contracts_Head.Work_Insurance_ID` | `numeric` (NOT NULL) | `((0))` | - |
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الحسـاب 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الحسـاب 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال العـدد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الحسـاب 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الحساب التحليلي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال مركز التكلفة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إضافة سجل جديد أثناء عملية التعديل. لأضافة سجل يجب الضغط على الغاء التعديل ثم الضغط على سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إجراء تعديل أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: في حالة الإضافة يجب الضغط على سجل جديد وفي حالة التعديل يجب الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السند غير موجود ويجب حفظه أولاً  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء إضافة سجل جديد. للحذف يجب الضغط على الغاء الإضافة ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء تعديل سجل . للحذف يجب الضغط على الغاء التعديل ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد السجل المراد حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد العقـد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الإجمالي: Total = SUM(Details.Net) (المعادلة: `Total = SUM(Details.Net)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الصافي تفقيطاً (كتابة بالكلمات): Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Contracts_Head_View Where Contract_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Contracts_Details_View Where Contract_No=
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
Select * FROM Costcenters Where Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Contracts_Head_View Order By Contract_No DESC
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
Select * FROM Units Order By Unit_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Order By Analysis_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters Order By Costcenter_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Contract_No FROM Contracts_Head Order By Contract_No Desc
```
##### استعلام INSERT على جدول `Contracts_Head`:
```sql
Insert Into Contracts_Head(Contract_No,Note_Date,Note_Date_H,Credit_Level5_ID,Analysis_ID,Costcenter_ID,Note_Actual_Qty,Note_Qty,Note_Total,Note_Net_Text,Work_Insurance_ID,Work_Insurance_Per,Work_Balance_ID,Work_Balance_Per,Work_Payments_ID,Work_Payments_Per,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Contracts_Details`:
```sql
Insert Into Contracts_Details(Contract_No,SR,Level5_ID,Unit_Name,Actual_Qty,Length,Width,Qty,Price,Net)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Contracts_Head Where Contract_No=
```
##### استعلام UPDATE على جدول `Contracts_Head`:
```sql
Update Contracts_Head Set Contract_No=
```
##### استعلام DELETE على جدول `Contracts_Details`:
```sql
Delete From Contracts_Details Where Contract_No=
```
##### استعلام INSERT على جدول `Contracts_Details`:
```sql
Insert Into Contracts_Details(Contract_No,SR,Level5_ID,Unit_Name,Actual_Qty,Length,Width,Qty,Price,Net)Values(
```
##### استعلام DELETE على جدول `Contracts_Head`:
```sql
Delete From Contracts_Head where Contract_No=
```
##### استعلام DELETE على جدول `Contracts_Details`:
```sql
Delete From Contracts_Details where Contract_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Contracts_Details_View Where Contract_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Contracts_Details_View Where Contract_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Contracts_Head_View Where Search_Field Like '%
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
Select * FROM Costcenters Where Costcenter_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Work_Balance_Per_KeyDown, Work_Balance_Per_KeyPress, Work_Balance_Per_LostFocus, Price_KeyDown, Contract_No_KeyPress, Contract_No_LostFocus, Notice_LostFocus, Level5_ID_LostFocus, Search_Txt_LostFocus, Note_Date_H_GotFocus, Note_Date_H_KeyDown, Note_Date_H_LostFocus, Actual_Net_GotFocus, Actual_Net_KeyDown, Actual_Net_LostFocus, Price_KeyPress, Price_LostFocus, Level5_Name_A_LostFocus, Note_Actual_Qty_GotFocus, Note_Actual_Qty_KeyDown, Note_Total_GotFocus, Note_Total_KeyDown, Note_Actual_Qty_LostFocus, Note_Total_LostFocus, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, Note_Net_Text_LostFocus, Unit_Name_GotFocus, Unit_Name_KeyDown, Units_GridView_CellClick, Units_GridView_CellFormatting, Units_GridView_KeyDown, Unit_Name_KeyPress, Unit_Name_LostFocus, Note_Date_ValueChanged, Analysis_ID_GotFocus, Analysis_Name_A_GotFocus, Analysis_Name_A_KeyDown, Analysis_Name_A_LostFocus, Analysis_ID_KeyDown, Analysis_ID_KeyPress, Analysis_ID_LostFocus, Analysis_GridView_CellClick, Analysis_GridView_CellFormatting, Credit_Level5_ID_GotFocus, Credit_Level5_Name_A_GotFocus, Credit_Level5_Name_A_KeyDown, Credit_Level5_Name_A_LostFocus, Credit_Level5_ID_KeyDown, Credit_Level5_ID_KeyPress, Credit_Level5_ID_LostFocus, Analysis_GridView_KeyDown, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, Costcenter_ID_GotFocus, Costcenter_Name_A_GotFocus, Costcenter_Name_A_KeyDown, Costcenter_Name_A_LostFocus, Costcenter_ID_KeyDown, Costcenter_ID_KeyPress, Costcenter_ID_LostFocus, Costcenters_GridView_CellClick, Costcenters_GridView_CellFormatting, Costcenters_GridView_KeyDown, Length_GotFocus, Length_KeyDown, Length_KeyPress, Length_LostFocus, Width0_GotFocus, Width0_KeyDown, Width0_KeyPress, Width0_LostFocus, Qty_GotFocus, Qty_KeyDown, Qty_LostFocus, Note_Qty_GotFocus, Note_Qty_KeyDown, Note_Qty_LostFocus, Work_Insurance_Per_GotFocus, Work_Insurance_Per_KeyDown, Work_Insurance_Per_KeyPress, Work_Insurance_Per_LostFocus, Work_Payments_Per_GotFocus, Work_Payments_Per_KeyDown, Work_Payments_Per_KeyPress, Work_Payments_Per_LostFocus, Work_Balance_Per_GotFocus, set_Costcenters_GridView, get_Costcenter_Name_A, set_Costcenter_Name_A, get_Costcenter_ID, set_Costcenter_ID, get_Label36, set_Label36, get_Note_Actual_Qty, set_Note_Actual_Qty, get_Note_Qty, set_Note_Qty, get_Label17, set_Label17, get_Label16, set_Label16, get_Label1, set_Label1, get_Width0, set_Width0, get_Length, set_Length, get_Contract_End, set_Contract_End, get_RadTextBox6, set_RadTextBox6, get_RadTextBox5, set_RadTextBox5, get_RadTextBox4, set_RadTextBox4, get_Label18, set_Label18, get_Work_Balance_Per, set_Work_Balance_Per, get_Label12, set_Label12, get_Work_Payments_Per, set_Work_Payments_Per, get_Label5, set_Label5, get_Work_Insurance_Per, set_Work_Insurance_Per, get_Work_Balance_ID, set_Work_Balance_ID, get_Work_Payments_ID, set_Work_Payments_ID, get_Work_Insurance_ID, set_Work_Insurance_ID, Clear_Record, Clear_Data, Fill_Grid, Fill_Level5_Grid, Fill_Analysis_Grid, Fill_Units_Grid, Fill_Costcenters_Grid, Lock_Control, Enable_Control, Review_Record, Find_Total, Contracts_Form_KeyDown, Contracts_Form_Load, Contracts_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Contract_No_GotFocus, Contract_No_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Notice_GotFocus, Notice_KeyDown, Notice_KeyPress, Note_Date_KeyDown, Note_Date_Opened, RadGridView1_DoubleClick, RadGridView1_KeyDown, Level5_ID_GotFocus, Level5_ID_KeyDown, Level5_ID_KeyPress, Level5_Name_A_GotFocus, Level5_Name_A_KeyDown, Actual_Qty_GotFocus, Actual_Qty_KeyDown, Actual_Qty_KeyPress, Actual_Qty_LostFocus, Price_GotFocus, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadPanel4, set_RadPanel4, get_RadGridView1, set_RadGridView1, get_Contract_Date, set_Contract_Date, get_RadLabel15, set_RadLabel15, get_Label13, set_Label13, get_Label8, set_Label8, get_Label6, set_Label6, get_Contract_No, set_Contract_No, get_Notice, set_Notice, get_Label4, set_Label4, get_Label9, set_Label9, get_Label10, set_Label10, get_Label11, set_Label11, get_Actual_Qty, set_Actual_Qty, get_Unit_Name, set_Unit_Name, get_Level5_Name_A, set_Level5_Name_A, get_Level5_ID, set_Level5_ID, get_Label15, set_Label15, get_Net, set_Net, get_Label14, set_Label14, get_Price, set_Price, get_Note_Total, set_Note_Total, get_Label28, set_Label28, get_Note_Net_With_Tax_Text, set_Note_Net_With_Tax_Text, get_SR, set_SR, get_Note_Date_H, set_Note_Date_H, get_Label2, set_Label2, get_Qty, set_Qty, get_Units_GridView, set_Units_GridView, get_Label3, set_Label3, get_Credit_Level5_Name_A, set_Credit_Level5_Name_A, get_Label7, set_Label7, get_Credit_Level5_ID, set_Credit_Level5_ID, get_Analysis_Name_A, set_Analysis_Name_A, get_Analysis_ID, set_Analysis_ID, get_Label19, set_Label19, get_Label25, set_Label25, get_Note_Net_Text, set_Note_Net_Text, get_Analysis_GridView, set_Analysis_GridView, get_Level5_GridView, set_Level5_GridView, get_AquaTheme1, set_AquaTheme1, get_Cost, set_Cost, get_Label35, set_Label35, get_Costcenters_GridView
```

---

### 3.2 شاشة: عقود المشروعات والعملاء (`Contracts_Form_For_Clients`)
- **الاسم الإنجليزي:** Client Project Contracts
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** تسجيل عقود المشروعات مع المالك / العملاء، جدول الكميات المعتمد، وقيمة المشروع الإجمالية
- **جداول قاعدة البيانات المستهدفة:** `Contracts_Head_For_Clients`, `Contracts_Details_For_Clients`

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
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Contracts_Head_For_Clients.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Contracts_Head_For_Clients.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `RadGridView1` | **RadGridView1** | `RadGridView` | - | - | - | - |
| `Contract_Date` | **Contract_Date** | `RadDateTimePicker` | - | - | - | - |
| `RadLabel15` | **RadLabel15** | `RadLabel` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Label8` | **Label8** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Contract_No` | **رقم العقد** | `RadTextBox` | `Contracts_Head_For_Clients.Contract_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Contracts_Head_For_Clients.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Label10` | **Label10** | `Label` | - | - | - | - |
| `Label11` | **Label11** | `Label` | - | - | - | - |
| `Actual_Qty` | **الكمية** | `RadTextBox` | `Contracts_Head_For_Clients.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Unit_Name` | **الوحدة** | `RadTextBox` | `Contracts_Details_For_Clients.Unit_Name` | `varchar(50)` (NOT NULL) | `('عدد')` | - |
| `Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Contracts_Head_For_Clients.Credit_Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label15` | **Label15** | `Label` | - | - | - | - |
| `Net` | **الصافي المستحق** | `RadTextBox` | `Contracts_Details_For_Clients.Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Price` | **السعر الفردي** | `RadTextBox` | `Contracts_Details_For_Clients.Price` | `float` (NOT NULL) | `((0))` | - |
| `Note_Total` | **الإجمالي** | `RadTextBox` | `Contracts_Head_For_Clients.Note_Total` | `float` (NOT NULL) | `((0))` | `Total = SUM(Details.Net)` |
| `Label28` | **Label28** | `Label` | - | - | - | - |
| `Note_Net_With_Tax_Text` | **ضريبة القيمة المضافة** | `RadTextBox` | - | - | - | `Net = Total - Discount + Tax` |
| `SR` | **SR** | `RadTextBox` | `Contracts_Details_For_Clients.SR` | `int` (PRIMARY KEY, NOT NULL) | - | - |
| `Note_Date_H` | **تاريخ الحركة** | `RadTextBox` | `Contracts_Head_For_Clients.Note_Date_H` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Qty` | **الكمية** | `RadTextBox` | `Contracts_Head_For_Clients.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Units_GridView` | **Units_GridView** | `RadGridView` | - | - | - | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Credit_Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Label7` | **Label7** | `Label` | - | - | - | - |
| `Credit_Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Contracts_Head_For_Clients.Credit_Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Analysis_Name_A` | **اسم الحساب التحليلي** | `RadTextBox` | - | - | - | - |
| `Analysis_ID` | **كود الحساب التحليلي** | `RadTextBox` | `Contracts_Head_For_Clients.Analysis_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label19` | **Label19** | `Label` | - | - | - | - |
| `Label25` | **Label25** | `Label` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `TextBox` | `Contracts_Head_For_Clients.Note_Net_Text` | `nvarchar(250)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `Analysis_GridView` | **Analysis_GridView** | `RadGridView` | - | - | - | - |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `Cost` | **Cost** | `RadTextBox` | - | - | - | - |
| `Label35` | **Label35** | `Label` | - | - | - | - |
| `Costcenters_GridView` | **Costcenters_GridView** | `RadGridView` | - | - | - | - |
| `Costcenter_Name_A` | **اسم مركز التكلفة** | `RadTextBox` | - | - | - | - |
| `Costcenter_ID` | **كود مركز التكلفة** | `RadTextBox` | `Contracts_Head_For_Clients.Costcenter_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label36` | **Label36** | `Label` | - | - | - | - |
| `Note_Actual_Qty` | **الكمية** | `RadTextBox` | `Contracts_Head_For_Clients.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Note_Qty` | **الكمية** | `RadTextBox` | `Contracts_Head_For_Clients.Note_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Label17` | **Label17** | `Label` | - | - | - | - |
| `Label16` | **Label16** | `Label` | - | - | - | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Width0` | **Width0** | `RadTextBox` | - | - | - | - |
| `Length` | **Length** | `RadTextBox` | `Contracts_Details_For_Clients.Length` | `float` (NOT NULL) | `((0))` | - |
| `Contract_End` | **Contract_End** | `RadCheckBox` | `Contracts_Head_For_Clients.Contract_End` | `bit` (NOT NULL) | `((0))` | - |
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الحسـاب 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الحساب التحليلي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال مركز التكلفة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إضافة سجل جديد أثناء عملية التعديل. لأضافة سجل يجب الضغط على الغاء التعديل ثم الضغط على سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إجراء تعديل أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: في حالة الإضافة يجب الضغط على سجل جديد وفي حالة التعديل يجب الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السند غير موجود ويجب حفظه أولاً  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء إضافة سجل جديد. للحذف يجب الضغط على الغاء الإضافة ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء تعديل سجل . للحذف يجب الضغط على الغاء التعديل ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد السجل المراد حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد العقـد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الحسـاب 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الحسـاب 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال العـدد 
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الإجمالي: Total = SUM(Details.Net) (المعادلة: `Total = SUM(Details.Net)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الصافي تفقيطاً (كتابة بالكلمات): Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
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
Select * FROM Costcenters Where Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Contracts_Head_View_For_Clients Order By Contract_No DESC
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
Select * FROM Units Order By Unit_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Order By Analysis_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters Order By Costcenter_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Contract_No FROM Contracts_Head_For_Clients Order By Contract_No Desc
```
##### استعلام INSERT على جدول `Contracts_Head_For_Clients`:
```sql
Insert Into Contracts_Head_For_Clients(Contract_No,Note_Date,Note_Date_H,Credit_Level5_ID,Analysis_ID,Costcenter_ID,Note_Actual_Qty,Note_Qty,Note_Total,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Contracts_Details_For_Clients`:
```sql
Insert Into Contracts_Details_For_Clients(Contract_No,SR,Level5_ID,Unit_Name,Actual_Qty,Length,Width,Qty,Price,Net)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Contracts_Head_For_Clients Where Contract_No=
```
##### استعلام UPDATE على جدول `Contracts_Head_For_Clients`:
```sql
Update Contracts_Head_For_Clients Set Contract_No=
```
##### استعلام DELETE على جدول `Contracts_Details_For_Clients`:
```sql
Delete From Contracts_Details_For_Clients Where Contract_No=
```
##### استعلام INSERT على جدول `Contracts_Details_For_Clients`:
```sql
Insert Into Contracts_Details_For_Clients(Contract_No,SR,Level5_ID,Unit_Name,Actual_Qty,Length,Width,Qty,Price,Net)Values(
```
##### استعلام DELETE على جدول `Contracts_Head_For_Clients`:
```sql
Delete From Contracts_Head_For_Clients where Contract_No=
```
##### استعلام DELETE على جدول `Contracts_Details_For_Clients`:
```sql
Delete From Contracts_Details_For_Clients where Contract_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Contracts_Details_View_For_Clients Where Contract_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Contracts_Details_View_For_Clients Where Contract_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Contracts_Head_View_For_Clients Where Search_Field Like '%
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
Select * FROM Costcenters Where Costcenter_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Contracts_Head_View_For_Clients Where Contract_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Contracts_Details_View_For_Clients Where Contract_No=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Note_Actual_Qty_KeyDown, Note_Total_GotFocus, Note_Total_KeyDown, Note_Actual_Qty_LostFocus, Note_Total_LostFocus, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, Note_Net_Text_LostFocus, Unit_Name_GotFocus, Unit_Name_KeyDown, Units_GridView_CellClick, Units_GridView_CellFormatting, Units_GridView_KeyDown, Unit_Name_KeyPress, Unit_Name_LostFocus, Note_Date_ValueChanged, Analysis_ID_GotFocus, Analysis_Name_A_GotFocus, Analysis_Name_A_KeyDown, Analysis_Name_A_LostFocus, Analysis_ID_KeyDown, Analysis_ID_KeyPress, Analysis_ID_LostFocus, Analysis_GridView_CellClick, Analysis_GridView_CellFormatting, Credit_Level5_ID_GotFocus, Credit_Level5_Name_A_GotFocus, Credit_Level5_Name_A_KeyDown, Credit_Level5_Name_A_LostFocus, Credit_Level5_ID_KeyDown, Credit_Level5_ID_KeyPress, Credit_Level5_ID_LostFocus, Analysis_GridView_KeyDown, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, Costcenter_ID_GotFocus, Costcenter_Name_A_GotFocus, Costcenter_Name_A_KeyDown, Costcenter_Name_A_LostFocus, Costcenter_ID_KeyDown, Costcenter_ID_KeyPress, Costcenter_ID_LostFocus, Costcenters_GridView_CellClick, Costcenters_GridView_CellFormatting, Costcenters_GridView_KeyDown, Length_GotFocus, Length_KeyDown, Length_KeyPress, Length_LostFocus, Width0_GotFocus, Width0_KeyDown, Width0_KeyPress, Width0_LostFocus, Qty_GotFocus, Qty_KeyDown, Qty_LostFocus, Note_Qty_GotFocus, Note_Qty_KeyDown, Note_Qty_LostFocus, set_Costcenters_GridView, get_Costcenter_Name_A, set_Costcenter_Name_A, get_Costcenter_ID, set_Costcenter_ID, get_Label36, set_Label36, get_Note_Actual_Qty, set_Note_Actual_Qty, get_Note_Qty, set_Note_Qty, get_Label17, set_Label17, get_Label16, set_Label16, get_Label1, set_Label1, get_Width0, set_Width0, get_Length, set_Length, get_Contract_End, set_Contract_End, Clear_Record, Clear_Data, Fill_Grid, Fill_Level5_Grid, Fill_Analysis_Grid, Fill_Units_Grid, Fill_Costcenters_Grid, Lock_Control, Enable_Control, Review_Record, Find_Total, Contracts_Form_For_Clients_KeyDown, Contracts_Form_For_Clients_Load, Contracts_Form_For_Clients_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Contract_No_GotFocus, Contract_No_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Notice_GotFocus, Notice_KeyDown, Notice_KeyPress, Note_Date_KeyDown, Note_Date_Opened, RadGridView1_DoubleClick, RadGridView1_KeyDown, Level5_ID_GotFocus, Level5_ID_KeyDown, Level5_ID_KeyPress, Level5_Name_A_GotFocus, Level5_Name_A_KeyDown, Actual_Qty_GotFocus, Actual_Qty_KeyDown, Actual_Qty_KeyPress, Price_GotFocus, Price_KeyDown, Contract_No_KeyPress, Contract_No_LostFocus, Notice_LostFocus, Actual_Qty_LostFocus, Level5_ID_LostFocus, Search_Txt_LostFocus, Note_Date_H_GotFocus, Note_Date_H_KeyDown, Note_Date_H_LostFocus, Actual_Net_GotFocus, Actual_Net_KeyDown, Actual_Net_LostFocus, Price_KeyPress, Price_LostFocus, Level5_Name_A_LostFocus, Note_Actual_Qty_GotFocus, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadPanel4, set_RadPanel4, get_RadGridView1, set_RadGridView1, get_Contract_Date, set_Contract_Date, get_RadLabel15, set_RadLabel15, get_Label13, set_Label13, get_Label8, set_Label8, get_Label6, set_Label6, get_Contract_No, set_Contract_No, get_Notice, set_Notice, get_Label4, set_Label4, get_Label9, set_Label9, get_Label10, set_Label10, get_Label11, set_Label11, get_Actual_Qty, set_Actual_Qty, get_Unit_Name, set_Unit_Name, get_Level5_Name_A, set_Level5_Name_A, get_Level5_ID, set_Level5_ID, get_Label15, set_Label15, get_Net, set_Net, get_Label14, set_Label14, get_Price, set_Price, get_Note_Total, set_Note_Total, get_Label28, set_Label28, get_Note_Net_With_Tax_Text, set_Note_Net_With_Tax_Text, get_SR, set_SR, get_Note_Date_H, set_Note_Date_H, get_Label2, set_Label2, get_Qty, set_Qty, get_Units_GridView, set_Units_GridView, get_Label3, set_Label3, get_Credit_Level5_Name_A, set_Credit_Level5_Name_A, get_Label7, set_Label7, get_Credit_Level5_ID, set_Credit_Level5_ID, get_Analysis_Name_A, set_Analysis_Name_A, get_Analysis_ID, set_Analysis_ID, get_Label19, set_Label19, get_Label25, set_Label25, get_Note_Net_Text, set_Note_Net_Text, get_Analysis_GridView, set_Analysis_GridView, get_Level5_GridView, set_Level5_GridView, get_AquaTheme1, set_AquaTheme1, get_Cost, set_Cost, get_Label35, set_Label35, get_Costcenters_GridView
```

---

### 3.3 شاشة: مستخلصات مقاولي الباطن (`Extracts_Form`)
- **الاسم الإنجليزي:** Subcontractor Work Extracts
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** حساب مستخلصات مقاولي الباطن، الأعمال السابقة والحالية، نسب الإنجاز، الخصومات والاستقطاعات
- **جداول قاعدة البيانات المستهدفة:** `Extracts_Head`, `Extracts_Details`

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
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Extracts_Head.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Extracts_Head.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `RadGridView1` | **RadGridView1** | `RadGridView` | - | - | - | - |
| `RadLabel15` | **RadLabel15** | `RadLabel` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Label8` | **Label8** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Contract_No` | **رقم العقد** | `RadTextBox` | `Extracts_Head.Contract_No` | `int` (NOT NULL) | `((0))` | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Extracts_Head.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Label10` | **Label10** | `Label` | - | - | - | - |
| `Label11` | **Label11** | `Label` | - | - | - | - |
| `Unit_Name` | **الوحدة** | `RadTextBox` | `Extracts_Details.Unit_Name` | `varchar(50)` (NOT NULL) | `('عدد')` | - |
| `Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Extracts_Head.Credit_Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label15` | **Label15** | `Label` | - | - | - | - |
| `Net` | **الصافي المستحق** | `RadTextBox` | `Extracts_Head.Note_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Price` | **السعر الفردي** | `RadTextBox` | `Extracts_Details.Price` | `float` (NOT NULL) | `((0))` | - |
| `Note_Total` | **الإجمالي** | `RadTextBox` | `Extracts_Head.Note_Total` | `float` (NOT NULL) | `((0))` | `Total = SUM(Details.Net)` |
| `Label28` | **Label28** | `Label` | - | - | - | - |
| `Note_Net_With_Tax_Text` | **ضريبة القيمة المضافة** | `RadTextBox` | - | - | - | `Net = Total - Discount + Tax` |
| `SR` | **SR** | `RadTextBox` | `Extracts_Details.SR` | `int` (PRIMARY KEY, NOT NULL) | - | - |
| `Extract_Date_H` | **Extract_Date_H** | `RadTextBox` | `Extracts_Head.Extract_Date_H` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Qty` | **الكمية** | `RadTextBox` | `Extracts_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Units_GridView` | **Units_GridView** | `RadGridView` | - | - | - | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Credit_Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Label7` | **Label7** | `Label` | - | - | - | - |
| `Credit_Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Extracts_Head.Credit_Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Analysis_Name_A` | **اسم الحساب التحليلي** | `RadTextBox` | - | - | - | - |
| `Analysis_ID` | **كود الحساب التحليلي** | `RadTextBox` | `Extracts_Head.Analysis_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label19` | **Label19** | `Label` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `TextBox` | `Extracts_Head.Note_Net_Text` | `nvarchar(250)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `Analysis_GridView` | **Analysis_GridView** | `RadGridView` | - | - | - | - |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `Cost` | **Cost** | `RadTextBox` | - | - | - | - |
| `Label35` | **Label35** | `Label` | - | - | - | - |
| `Costcenters_GridView` | **Costcenters_GridView** | `RadGridView` | - | - | - | - |
| `Costcenter_Name_A` | **اسم مركز التكلفة** | `RadTextBox` | - | - | - | - |
| `Costcenter_ID` | **كود مركز التكلفة** | `RadTextBox` | `Extracts_Head.Costcenter_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label36` | **Label36** | `Label` | - | - | - | - |
| `Note_Qty` | **الكمية** | `RadTextBox` | `Extracts_Head.Note_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Label16` | **Label16** | `Label` | - | - | - | - |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Label12` | **Label12** | `Label` | - | - | - | - |
| `Extract_No` | **رقم المستخلص** | `RadTextBox` | `Extracts_Head.Extract_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `Extract_Date` | **Extract_Date** | `RadDateTimePicker` | `Extracts_Head.Extract_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Contract_Date` | **Contract_Date** | `RadTextBox` | - | - | - | - |
| `Print_Journal` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Journal_No` | **Journal_No** | `RadTextBox` | `Extracts_Head.Journal_No` | `int` (NOT NULL) | `((0))` | - |
| `Label37` | **Label37** | `Label` | - | - | - | - |
| `Vat_Tax_Per` | **ضريبة القيمة المضافة** | `RadTextBox` | `Extracts_Head.Vat_Tax_Per` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label24` | **Label24** | `Label` | - | - | - | - |
| `Vat_Tax_Amount` | **ضريبة القيمة المضافة** | `RadTextBox` | `Extracts_Head.Vat_Tax_Amount` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label21` | **Label21** | `Label` | - | - | - | - |
| `Note_Net_With_Tax` | **ضريبة القيمة المضافة** | `RadTextBox` | `Extracts_Head.Note_Net_With_Tax` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label18` | **Label18** | `Label` | - | - | - | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Description` | **البيان / الشرح** | `RadTextBox` | `Extracts_Details.Description` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Actual_Qty` | **الكمية** | `RadTextBox` | `Extracts_Head.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Contracts_Head_GridView` | **Contracts_Head_GridView** | `RadGridView` | - | - | - | - |
| `RadTextBox6` | **RadTextBox6** | `RadTextBox` | - | - | - | - |
| `RadTextBox5` | **RadTextBox5** | `RadTextBox` | - | - | - | - |
| `RadTextBox4` | **RadTextBox4** | `RadTextBox` | - | - | - | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Work_Balance_Per` | **الرصيد / الفارق** | `RadTextBox` | `Extracts_Head.Work_Balance_Per` | `float` (NOT NULL) | `((0))` | `Balance = Previous_Balance + Debit - Credit` |
| `Label17` | **Label17** | `Label` | - | - | - | - |
| `Work_Payments_Per` | **Work_Payments_Per** | `RadTextBox` | `Extracts_Head.Work_Payments_Per` | `float` (NOT NULL) | `((0))` | - |
| `Label20` | **Label20** | `Label` | - | - | - | - |
| `Work_Insurance_Per` | **Work_Insurance_Per** | `RadTextBox` | `Extracts_Head.Work_Insurance_Per` | `float` (NOT NULL) | `((0))` | - |
| `Work_Balance_Amount` | **الرصيد / الفارق** | `RadTextBox` | `Extracts_Head.Work_Balance_Amount` | `float` (NOT NULL) | `((0))` | `Balance = Previous_Balance + Debit - Credit` |
| `Work_Payments_Amount` | **Work_Payments_Amount** | `RadTextBox` | `Extracts_Head.Work_Payments_Amount` | `float` (NOT NULL) | `((0))` | - |
| `Work_Insurance_Amount` | **Work_Insurance_Amount** | `RadTextBox` | `Extracts_Head.Work_Insurance_Amount` | `float` (NOT NULL) | `((0))` | - |
| `Work_Balance_ID` | **الرصيد / الفارق** | `RadTextBox` | `Extracts_Head.Work_Balance_ID` | `numeric` (NOT NULL) | `((0))` | `Balance = Previous_Balance + Debit - Credit` |
| `Work_Payments_ID` | **Work_Payments_ID** | `RadTextBox` | `Extracts_Head.Work_Payments_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Work_Insurance_ID` | **Work_Insurance_ID** | `RadTextBox` | `Extracts_Head.Work_Insurance_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Completion_Net` | **الصافي المستحق** | `RadTextBox` | `Extracts_Details.Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label25` | **Label25** | `Label` | - | - | - | - |
| `Label23` | **Label23** | `Label` | - | - | - | - |
| `Completion_Rate` | **Completion_Rate** | `RadTextBox` | `Extracts_Details.Completion_Rate` | `float` (NOT NULL) | `((0))` | - |
| `Nonconformities_ID` | **Nonconformities_ID** | `RadTextBox` | `Extracts_Head.Nonconformities_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Nonconformities_Amount` | **Nonconformities_Amount** | `RadTextBox` | `Extracts_Head.Nonconformities_Amount` | `float` (NOT NULL) | `((0))` | - |
| `RadTextBox3` | **RadTextBox3** | `RadTextBox` | - | - | - | - |
| `Label26` | **Label26** | `Label` | - | - | - | - |
| `Nonconformities_Per` | **Nonconformities_Per** | `RadTextBox` | `Extracts_Head.Nonconformities_Per` | `float` (NOT NULL) | `((0))` | - |
| `Note_Net` | **الصافي المستحق** | `RadTextBox` | `Extracts_Head.Note_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label27` | **Label27** | `Label` | - | - | - | - |
| `Total_Qty` | **الكمية** | `RadTextBox` | `Extracts_Details.Qty` | `float` (NOT NULL) | `((0))` | - |
| `Previous_Qty` | **الكمية** | `RadTextBox` | `Extracts_Head.Previous_Qty` | `float` (NOT NULL) | `((0))` | - |
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الحسـاب 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الحسـاب 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الوحدة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال العـدد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الكمية السابقة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال السـعر 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيـد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء إضافة سجل جديد. للحذف يجب الضغط على الغاء الإضافة ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء تعديل سجل . للحذف يجب الضغط على الغاء التعديل ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد السجل المراد حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد العقـد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الحسـاب 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الحسـاب 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال العـدد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إضافة سجل جديد أثناء عملية التعديل. لأضافة سجل يجب الضغط على الغاء التعديل ثم الضغط على سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إجراء تعديل أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: في حالة الإضافة يجب الضغط على سجل جديد وفي حالة التعديل يجب الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السند غير موجود ويجب حفظه أولاً  
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الإجمالي: Total = SUM(Details.Net) (المعادلة: `Total = SUM(Details.Net)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الصافي تفقيطاً (كتابة بالكلمات): Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Tax = (Total - Discount) * (Tax_Rate / 100) (المعادلة: `Tax = (Total - Discount) * (Tax_Rate / 100)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Tax = (Total - Discount) * (Tax_Rate / 100) (المعادلة: `Tax = (Total - Discount) * (Tax_Rate / 100)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters Where Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Extracts_Head_View Where Extract_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Extracts_Details_View Where Extract_No=
```
##### استعلام DELETE على جدول `Extracts_Head`:
```sql
Delete From Extracts_Head where Extract_No=
```
##### استعلام DELETE على جدول `Extracts_Details`:
```sql
Delete From Extracts_Details where Extract_No=
```
##### استعلام DELETE على جدول `Extracts_Head`:
```sql
Delete From Extracts_Journals_Head Where Note_No=
```
##### استعلام DELETE على جدول `Extracts_Head`:
```sql
Delete From Extracts_Journals_Details Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Extracts_Details_View Where Extract_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Extracts_Details_View Where Extract_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Extracts_Head_View Where Search_Field Like '%
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
Select * FROM Contracts_Head_View Where Contract_End=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters Where Costcenter_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Contracts_Details_View Where Contract_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Contracts_Details_View Where Contract_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select Sum(Actual_Qty) AS Previous_Qty0 FROM Extracts_Details_View Where Contract_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Contracts_Items_Balances_View Where Contract_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Contracts_Head_View Where Contract_No=
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
Select * FROM Extracts_Head_View Order By Extract_No DESC
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
Select * From Journals_Settings Where ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Sales_Settings Where ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Units Order By Unit_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Order By Analysis_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Contracts_Head_View Where Contract_End=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters Order By Costcenter_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Extract_No FROM Extracts_Head Order By Extract_No Desc
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM Extracts_Journals_Head Order By Note_No Desc
```
##### استعلام INSERT على جدول `Extracts_Head`:
```sql
Insert Into Extracts_Head(Extract_No,Extract_Date,Extract_Date_H,Contract_No,Credit_Level5_ID,Analysis_ID,Costcenter_ID,Work_Insurance_ID,Work_Insurance_Per,Work_Insurance_Amount,Work_Balance_ID,Work_Balance_Per,Work_Balance_Amount,Work_Payments_ID,Work_Payments_Per,Work_Payments_Amount,Nonconformities_ID,Nonconformities_Per,Nonconformities_Amount,Note_Actual_Qty,Note_Qty,Note_Total,Note_Net,Note_Net_Text,Vat_Tax_Per,Vat_Tax_Amount,Note_Net_With_Tax,Notice,Journal_No,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Extracts_Details`:
```sql
Insert Into Extracts_Details(Extract_No,SR,Level5_ID,Unit_Name,Previous_Qty,Actual_Qty,Qty,Total_Qty,Price,Net,Completion_Rate,Completion_Net,Description)Values(
```
##### استعلام INSERT على جدول `Extracts_Head`:
```sql
Insert Into Extracts_Journals_Head(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Extracts_Head`:
```sql
Insert Into Extracts_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Analysis_ID,CostCenter_ID)Values(
```
##### استعلام INSERT على جدول `Extracts_Head`:
```sql
Insert Into Extracts_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Analysis_ID,CostCenter_ID)Values(
```
##### استعلام INSERT على جدول `Extracts_Head`:
```sql
Insert Into Extracts_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Analysis_ID,CostCenter_ID)Values(
```
##### استعلام INSERT على جدول `Extracts_Head`:
```sql
Insert Into Extracts_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Analysis_ID,CostCenter_ID)Values(
```
##### استعلام INSERT على جدول `Extracts_Head`:
```sql
Insert Into Extracts_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Analysis_ID,CostCenter_ID)Values(
```
##### استعلام INSERT على جدول `Extracts_Head`:
```sql
Insert Into Extracts_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Analysis_ID,CostCenter_ID)Values(
```
##### استعلام INSERT على جدول `Extracts_Head`:
```sql
Insert Into Extracts_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,CostCenter_ID)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Extracts_Head Where Contract_No=
```
##### استعلام UPDATE على جدول `Extracts_Head`:
```sql
Update Extracts_Head Set Extract_Date='
```
##### استعلام DELETE على جدول `Extracts_Details`:
```sql
Delete From Extracts_Details Where Extract_No=
```
##### استعلام INSERT على جدول `Extracts_Details`:
```sql
Insert Into Extracts_Details(Extract_No,SR,Level5_ID,Unit_Name,Previous_Qty,Actual_Qty,Qty,Total_Qty,Price,Net,Completion_Rate,Completion_Net,Description)Values(
```
##### استعلام DELETE على جدول `Extracts_Head`:
```sql
Delete From Extracts_Journals_Head Where Note_No=
```
##### استعلام DELETE على جدول `Extracts_Head`:
```sql
Delete From Extracts_Journals_Details Where Note_No=
```
##### استعلام INSERT على جدول `Extracts_Head`:
```sql
Insert Into Extracts_Journals_Head(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Extracts_Head`:
```sql
Insert Into Extracts_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Analysis_ID,CostCenter_ID)Values(
```
##### استعلام INSERT على جدول `Extracts_Head`:
```sql
Insert Into Extracts_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Analysis_ID,CostCenter_ID)Values(
```
##### استعلام INSERT على جدول `Extracts_Head`:
```sql
Insert Into Extracts_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Analysis_ID,CostCenter_ID)Values(
```
##### استعلام INSERT على جدول `Extracts_Head`:
```sql
Insert Into Extracts_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Analysis_ID,CostCenter_ID)Values(
```
##### استعلام INSERT على جدول `Extracts_Head`:
```sql
Insert Into Extracts_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Analysis_ID,CostCenter_ID)Values(
```
##### استعلام INSERT على جدول `Extracts_Head`:
```sql
Insert Into Extracts_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Analysis_ID,CostCenter_ID)Values(
```
##### استعلام INSERT على جدول `Extracts_Head`:
```sql
Insert Into Extracts_Journals_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,CostCenter_ID)Values(
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Credit_Level5_ID_LostFocus, Analysis_GridView_KeyDown, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, Costcenter_ID_GotFocus, Costcenter_Name_A_GotFocus, Costcenter_Name_A_KeyDown, Costcenter_Name_A_LostFocus, Costcenter_ID_KeyDown, Costcenter_ID_KeyPress, Costcenter_ID_LostFocus, Costcenters_GridView_CellClick, Costcenters_GridView_CellFormatting, Costcenters_GridView_KeyDown, Description_GotFocus, Description_KeyDown, Description_KeyPress, Description_LostFocus, Qty_GotFocus, Qty_KeyDown, Qty_LostFocus, Extract_No_GotFocus, Extract_No_KeyDown, Extract_No_KeyPress, Extract_No_LostFocus, Print_Journal_Click, Print_Journal_KeyDown, Note_Qty_GotFocus, Note_Qty_KeyDown, Note_Qty_LostFocus, Contract_Date_GotFocus, Contract_Date_KeyDown, Contract_Date_LostFocus, Vat_Tax_Per_GotFocus, Vat_Tax_Per_KeyDown, Vat_Tax_Per_KeyPress, Vat_Tax_Per_LostFocus, Vat_Tax_Amount_GotFocus, Vat_Tax_Amount_KeyDown, Vat_Tax_Amount_KeyPress, Vat_Tax_Amount_LostFocus, Note_Net_With_Tax_KeyDown, Work_Insurance_Per_GotFocus, Work_Insurance_Per_KeyDown, Work_Insurance_Per_LostFocus, Work_Payments_Per_GotFocus, Work_Payments_Per_KeyDown, Work_Payments_Per_LostFocus, Work_Balance_Per_GotFocus, Work_Balance_Per_KeyDown, Work_Balance_Per_LostFocus, Nonconformities_Per_GotFocus, Nonconformities_Per_KeyDown, Nonconformities_Per_KeyPress, Nonconformities_Per_LostFocus, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Contract_No_GotFocus, Contract_No_KeyDown, Contracts_Head_GridView_CellClick, Contracts_Head_GridView_CellFormatting, Contracts_Head_GridView_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Notice_GotFocus, Notice_KeyDown, Notice_KeyPress, Extract_Date_KeyDown, Extract_Date_Opened, RadGridView1_DoubleClick, RadGridView1_KeyDown, Level5_ID_GotFocus, Level5_ID_KeyDown, Level5_ID_KeyPress, Level5_Name_A_GotFocus, Level5_Name_A_KeyDown, Actual_Qty_GotFocus, Actual_Qty_KeyDown, Actual_Qty_KeyPress, Actual_Qty_LostFocus, Completion_Rate_GotFocus, Completion_Rate_KeyDown, Completion_Rate_KeyPress, Completion_Rate_LostFocus, Price_GotFocus, Price_KeyDown, Contract_No_KeyPress, Contract_No_LostFocus, Notice_LostFocus, Level5_ID_LostFocus, Search_Txt_LostFocus, Note_Date_H_GotFocus, Note_Date_H_KeyDown, Note_Date_H_LostFocus, Actual_Net_GotFocus, Actual_Net_KeyDown, Actual_Net_LostFocus, Price_KeyPress, Price_LostFocus, Level5_Name_A_LostFocus, Note_Total_GotFocus, Note_Total_KeyDown, Note_Total_LostFocus, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, Note_Net_Text_LostFocus, Unit_Name_GotFocus, Unit_Name_KeyDown, Units_GridView_CellClick, Units_GridView_CellFormatting, Units_GridView_KeyDown, Unit_Name_KeyPress, Unit_Name_LostFocus, Extract_Date_ValueChanged, Analysis_ID_GotFocus, Analysis_Name_A_GotFocus, Analysis_Name_A_KeyDown, Analysis_Name_A_LostFocus, Analysis_ID_KeyDown, Analysis_ID_KeyPress, Analysis_ID_LostFocus, Analysis_GridView_CellClick, Analysis_GridView_CellFormatting, Credit_Level5_ID_GotFocus, Credit_Level5_Name_A_GotFocus, Credit_Level5_Name_A_KeyDown, Credit_Level5_Name_A_LostFocus, Credit_Level5_ID_KeyDown, Credit_Level5_ID_KeyPress, set_Note_Qty, get_Label16, set_Label16, get_Label5, set_Label5, get_Label12, set_Label12, get_Extract_No, set_Extract_No, get_Extract_Date, set_Extract_Date, get_Contract_Date, set_Contract_Date, get_Print_Journal, set_Print_Journal, get_Journal_No, set_Journal_No, get_Label37, set_Label37, get_Vat_Tax_Per, set_Vat_Tax_Per, get_Label24, set_Label24, get_Vat_Tax_Amount, set_Vat_Tax_Amount, get_Label21, set_Label21, get_Note_Net_With_Tax, set_Note_Net_With_Tax, get_Label18, set_Label18, get_Label1, set_Label1, get_Description, set_Description, get_Actual_Qty, set_Actual_Qty, get_Contracts_Head_GridView, set_Contracts_Head_GridView, get_RadTextBox6, set_RadTextBox6, get_RadTextBox5, set_RadTextBox5, get_RadTextBox4, set_RadTextBox4, get_Label4, set_Label4, get_Work_Balance_Per, set_Work_Balance_Per, get_Label17, set_Label17, get_Work_Payments_Per, set_Work_Payments_Per, get_Label20, set_Label20, get_Work_Insurance_Per, set_Work_Insurance_Per, get_Work_Balance_Amount, set_Work_Balance_Amount, get_Work_Payments_Amount, set_Work_Payments_Amount, get_Work_Insurance_Amount, set_Work_Insurance_Amount, get_Work_Balance_ID, set_Work_Balance_ID, get_Work_Payments_ID, set_Work_Payments_ID, get_Work_Insurance_ID, set_Work_Insurance_ID, get_Completion_Net, set_Completion_Net, get_Label25, set_Label25, get_Label23, set_Label23, get_Completion_Rate, set_Completion_Rate, get_Nonconformities_ID, set_Nonconformities_ID, get_Nonconformities_Amount, set_Nonconformities_Amount, get_RadTextBox3, set_RadTextBox3, get_Label26, set_Label26, get_Nonconformities_Per, set_Nonconformities_Per, get_Note_Net, set_Note_Net, get_Label27, set_Label27, get_Total_Qty, set_Total_Qty, get_Previous_Qty, set_Previous_Qty, Clear_Record, Clear_Data, Clear_Data1, Fill_Grid, Fill_Contracts_Head_Grid, Fill_Level5_Grid, Fill_Analysis_Grid, Fill_Units_Grid, Fill_Costcenters_Grid, Lock_Control, Enable_Control, Review_Record, Find_Total, Extracts_Form_KeyDown, Extracts_Form_Load, Extracts_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadPanel4, set_RadPanel4, get_RadGridView1, set_RadGridView1, get_RadLabel15, set_RadLabel15, get_Label13, set_Label13, get_Label8, set_Label8, get_Label6, set_Label6, get_Contract_No, set_Contract_No, get_Notice, set_Notice, get_Label9, set_Label9, get_Label10, set_Label10, get_Label11, set_Label11, get_Unit_Name, set_Unit_Name, get_Level5_Name_A, set_Level5_Name_A, get_Level5_ID, set_Level5_ID, get_Label15, set_Label15, get_Net, set_Net, get_Label14, set_Label14, get_Price, set_Price, get_Note_Total, set_Note_Total, get_Label28, set_Label28, get_Note_Net_With_Tax_Text, set_Note_Net_With_Tax_Text, get_SR, set_SR, get_Extract_Date_H, set_Extract_Date_H, get_Label2, set_Label2, get_Qty, set_Qty, get_Units_GridView, set_Units_GridView, get_Label3, set_Label3, get_Credit_Level5_Name_A, set_Credit_Level5_Name_A, get_Label7, set_Label7, get_Credit_Level5_ID, set_Credit_Level5_ID, get_Analysis_Name_A, set_Analysis_Name_A, get_Analysis_ID, set_Analysis_ID, get_Label19, set_Label19, get_Note_Net_Text, set_Note_Net_Text, get_Analysis_GridView, set_Analysis_GridView, get_Level5_GridView, set_Level5_GridView, get_AquaTheme1, set_AquaTheme1, get_Cost, set_Cost, get_Label35, set_Label35, get_Costcenters_GridView, set_Costcenters_GridView, get_Costcenter_Name_A, set_Costcenter_Name_A, get_Costcenter_ID, set_Costcenter_ID, get_Label36, set_Label36, get_Note_Qty
```

---

### 3.4 شاشة: مستخلصات المالك والعملاء (`Extracts_Form_For_Clients`)
- **الاسم الإنجليزي:** Client Work Extracts
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** إعداد مستخلصات الأعمال المنجزة للعميل، الخصومات التأمينية، الدفعات المقدمة، وصافي المستحق
- **جداول قاعدة البيانات المستهدفة:** `Extracts_Head_For_Clients`, `Extracts_Details_For_Clients`

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
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Extracts_Head_For_Clients.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Extracts_Head_For_Clients.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `RadGridView1` | **RadGridView1** | `RadGridView` | - | - | - | - |
| `RadLabel15` | **RadLabel15** | `RadLabel` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Label8` | **Label8** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Contract_No` | **رقم العقد** | `RadTextBox` | `Extracts_Head_For_Clients.Contract_No` | `int` (NOT NULL) | `((0))` | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Extracts_Head_For_Clients.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Label10` | **Label10** | `Label` | - | - | - | - |
| `Label11` | **Label11** | `Label` | - | - | - | - |
| `Actual_Qty` | **الكمية** | `RadTextBox` | `Extracts_Head_For_Clients.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Unit_Name` | **الوحدة** | `RadTextBox` | `Extracts_Details_For_Clients.Unit_Name` | `varchar(50)` (NOT NULL) | `('عدد')` | - |
| `Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Extracts_Head_For_Clients.Credit_Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label15` | **Label15** | `Label` | - | - | - | - |
| `Net` | **الصافي المستحق** | `RadTextBox` | `Extracts_Head_For_Clients.Note_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Price` | **السعر الفردي** | `RadTextBox` | `Extracts_Details_For_Clients.Price` | `float` (NOT NULL) | `((0))` | - |
| `Note_Total` | **الإجمالي** | `RadTextBox` | `Extracts_Head_For_Clients.Note_Total` | `float` (NOT NULL) | `((0))` | `Total = SUM(Details.Net)` |
| `Label28` | **Label28** | `Label` | - | - | - | - |
| `Note_Net_With_Tax_Text` | **ضريبة القيمة المضافة** | `RadTextBox` | - | - | - | `Net = Total - Discount + Tax` |
| `SR` | **SR** | `RadTextBox` | `Extracts_Details_For_Clients.SR` | `int` (PRIMARY KEY, NOT NULL) | - | - |
| `Extract_Date_H` | **Extract_Date_H** | `RadTextBox` | `Extracts_Head_For_Clients.Extract_Date_H` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Qty` | **الكمية** | `RadTextBox` | `Extracts_Head_For_Clients.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Units_GridView` | **Units_GridView** | `RadGridView` | - | - | - | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Credit_Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Label7` | **Label7** | `Label` | - | - | - | - |
| `Credit_Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Extracts_Head_For_Clients.Credit_Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Analysis_Name_A` | **اسم الحساب التحليلي** | `RadTextBox` | - | - | - | - |
| `Analysis_ID` | **كود الحساب التحليلي** | `RadTextBox` | `Extracts_Head_For_Clients.Analysis_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label19` | **Label19** | `Label` | - | - | - | - |
| `Label25` | **Label25** | `Label` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `TextBox` | `Extracts_Head_For_Clients.Note_Net_Text` | `nvarchar(250)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `Analysis_GridView` | **Analysis_GridView** | `RadGridView` | - | - | - | - |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `Cost` | **Cost** | `RadTextBox` | - | - | - | - |
| `Label35` | **Label35** | `Label` | - | - | - | - |
| `Costcenters_GridView` | **Costcenters_GridView** | `RadGridView` | - | - | - | - |
| `Costcenter_Name_A` | **اسم مركز التكلفة** | `RadTextBox` | - | - | - | - |
| `Costcenter_ID` | **كود مركز التكلفة** | `RadTextBox` | `Extracts_Head_For_Clients.Costcenter_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label36` | **Label36** | `Label` | - | - | - | - |
| `Note_Actual_Qty` | **الكمية** | `RadTextBox` | `Extracts_Head_For_Clients.Note_Actual_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Note_Qty` | **الكمية** | `RadTextBox` | `Extracts_Head_For_Clients.Note_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Label17` | **Label17** | `Label` | - | - | - | - |
| `Label16` | **Label16** | `Label` | - | - | - | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Width0` | **Width0** | `RadTextBox` | - | - | - | - |
| `Length` | **Length** | `RadTextBox` | `Extracts_Details_For_Clients.Length` | `float` (NOT NULL) | `((0))` | - |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Label12` | **Label12** | `Label` | - | - | - | - |
| `Extract_No` | **رقم المستخلص** | `RadTextBox` | `Extracts_Head_For_Clients.Extract_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `Extract_Date` | **Extract_Date** | `RadDateTimePicker` | `Extracts_Head_For_Clients.Extract_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Contract_Date` | **Contract_Date** | `RadTextBox` | - | - | - | - |
| `Print_Journal` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Journal_No` | **Journal_No** | `RadTextBox` | `Extracts_Head_For_Clients.Journal_No` | `int` (NOT NULL) | `((0))` | - |
| `Label37` | **Label37** | `Label` | - | - | - | - |
| `Note_Net_With_Tax` | **ضريبة القيمة المضافة** | `RadTextBox` | `Extracts_Head_For_Clients.Note_Net_With_Tax` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label18` | **Label18** | `Label` | - | - | - | - |
| `Vat_Tax_Per` | **ضريبة القيمة المضافة** | `RadTextBox` | `Extracts_Head_For_Clients.Vat_Tax_Per` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label24` | **Label24** | `Label` | - | - | - | - |
| `Vat_Tax_Amount` | **ضريبة القيمة المضافة** | `RadTextBox` | `Extracts_Head_For_Clients.Vat_Tax_Amount` | `float` (NOT NULL) | `((0))` | `Tax = (Total - Discount) * (Tax_Rate / 100)` |
| `Label21` | **Label21** | `Label` | - | - | - | - |
| `Contracts_Panel` | **Contracts_Panel** | `RadPanel` | - | - | - | - |
| `Contracts_GridView` | **Contracts_GridView** | `RadGridView` | - | - | - | - |
| `Discount_Amount` | **الخصم** | `RadTextBox` | `Extracts_Head_For_Clients.Discount_Amount` | `float` (NOT NULL) | `((0))` | - |
| `Label33` | **Label33** | `Label` | - | - | - | - |
| `Note_Net` | **الصافي المستحق** | `RadTextBox` | `Extracts_Head_For_Clients.Note_Net` | `float` (NOT NULL) | `((0))` | `Net = Total - Discount + Tax` |
| `Label20` | **Label20** | `Label` | - | - | - | - |
| `Button1` | **Button1** | `Button` | - | - | - | - |
| `PictureBox1` | **PictureBox1** | `PictureBox` | - | - | - | - |
| `Label22` | **Label22** | `Label` | - | - | - | - |
| `Vat_No_For_Invoice` | **Vat_No_For_Invoice** | `RadTextBox` | `Extracts_Head_For_Clients.Vat_No_For_Invoice` | `nvarchar(20)` (NOT NULL) | `(' ')` | - |
| `textBox1` | **textBox1** | `RadTextBox` | - | - | - | - |
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الحسـاب 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الحسـاب 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال العـدد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إضافة سجل جديد أثناء عملية التعديل. لأضافة سجل يجب الضغط على الغاء التعديل ثم الضغط على سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إجراء تعديل أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: في حالة الإضافة يجب الضغط على سجل جديد وفي حالة التعديل يجب الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السند غير موجود ويجب حفظه أولاً  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء إضافة سجل جديد. للحذف يجب الضغط على الغاء الإضافة ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء تعديل سجل . للحذف يجب الضغط على الغاء التعديل ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد السجل المراد حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد العقـد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الإجمالي: Total = SUM(Details.Net) (المعادلة: `Total = SUM(Details.Net)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الصافي تفقيطاً (كتابة بالكلمات): Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Tax = (Total - Discount) * (Tax_Rate / 100) (المعادلة: `Tax = (Total - Discount) * (Tax_Rate / 100)`)
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Tax = (Total - Discount) * (Tax_Rate / 100) (المعادلة: `Tax = (Total - Discount) * (Tax_Rate / 100)`)
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Extracts_Head_View_For_Clients Where Extract_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Extracts_Details_View_For_Clients Where Extract_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Contracts_Items_Balances_View_For_Clients Where Contract_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Contracts_Head_View_For_Clients Where Contract_No=
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
Select * FROM Costcenters Where Costcenter_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Extracts_Head_View_For_Clients Order By Extract_No DESC
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
Select * FROM Units Order By Unit_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Order By Analysis_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters Order By Costcenter_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Extract_No FROM Extracts_Head_For_Clients Order By Extract_No Desc
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM GeneralLedger_Head Order By Note_No Desc
```
##### استعلام INSERT على جدول `Extracts_Head_For_Clients`:
```sql
Insert Into Extracts_Head_For_Clients(Extract_No,Extract_Date,Extract_Date_H,Contract_No,Credit_Level5_ID,Analysis_ID,Costcenter_ID,Note_Actual_Qty,Note_Qty,Note_Total,Note_Net_Text,Discount_Amount,Note_Net,Vat_Tax_Per,Vat_Tax_Amount,Note_Net_With_Tax,Notice,Vat_No_For_Invoice,Journal_No,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Extracts_Details_For_Clients`:
```sql
Insert Into Extracts_Details_For_Clients(Extract_No,SR,Level5_ID,Unit_Name,Actual_Qty,Length,Width,Qty,Price,Net,Item_Vat_Amount,Item_Net_With_Vat)Values(
```
##### استعلام INSERT على جدول `Extracts_Head_For_Clients`:
```sql
Insert Into GeneralLedger_Head(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Extracts_Head_For_Clients`:
```sql
Insert Into GeneralLedger_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Analysis_ID,CostCenter_ID)Values(
```
##### استعلام INSERT على جدول `Extracts_Head_For_Clients`:
```sql
Insert Into GeneralLedger_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Analysis_ID,CostCenter_ID)Values(
```
##### استعلام INSERT على جدول `Extracts_Head_For_Clients`:
```sql
Insert Into GeneralLedger_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Analysis_ID,CostCenter_ID)Values(
```
##### استعلام INSERT على جدول `Extracts_Head_For_Clients`:
```sql
Insert Into GeneralLedger_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Analysis_ID,CostCenter_ID)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Extracts_Head_For_Clients Where Contract_No=
```
##### استعلام UPDATE على جدول `Extracts_Head_For_Clients`:
```sql
Update Extracts_Head_For_Clients Set Extract_Date='
```
##### استعلام DELETE على جدول `Extracts_Details_For_Clients`:
```sql
Delete From Extracts_Details_For_Clients Where Extract_No=
```
##### استعلام INSERT على جدول `Extracts_Details_For_Clients`:
```sql
Insert Into Extracts_Details_For_Clients(Extract_No,SR,Level5_ID,Unit_Name,Actual_Qty,Length,Width,Qty,Price,Net,Item_Vat_Amount,Item_Net_With_Vat)Values(
```
##### استعلام DELETE على جدول `Extracts_Head_For_Clients`:
```sql
Delete From GeneralLedger_Head Where Note_No=
```
##### استعلام DELETE على جدول `Extracts_Head_For_Clients`:
```sql
Delete From GeneralLedger_Details Where Note_No=
```
##### استعلام INSERT على جدول `Extracts_Head_For_Clients`:
```sql
Insert Into GeneralLedger_Head(Note_No,Note_Date,Note_Date_H,Description,Note_Debit,Note_Credit,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Extracts_Head_For_Clients`:
```sql
Insert Into GeneralLedger_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Analysis_ID,CostCenter_ID)Values(
```
##### استعلام INSERT على جدول `Extracts_Head_For_Clients`:
```sql
Insert Into GeneralLedger_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Analysis_ID,CostCenter_ID)Values(
```
##### استعلام INSERT على جدول `Extracts_Head_For_Clients`:
```sql
Insert Into GeneralLedger_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Analysis_ID,CostCenter_ID)Values(
```
##### استعلام INSERT على جدول `Extracts_Head_For_Clients`:
```sql
Insert Into GeneralLedger_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Analysis_ID,CostCenter_ID)Values(
```
##### استعلام DELETE على جدول `Extracts_Head_For_Clients`:
```sql
Delete From Extracts_Head_For_Clients where Extract_No=
```
##### استعلام DELETE على جدول `Extracts_Details_For_Clients`:
```sql
Delete From Extracts_Details_For_Clients where Extract_No=
```
##### استعلام DELETE على جدول `Extracts_Head_For_Clients`:
```sql
Delete From GeneralLedger_Head Where Note_No=
```
##### استعلام DELETE على جدول `Extracts_Head_For_Clients`:
```sql
Delete From GeneralLedger_Details Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Extracts_Details_View_For_Clients Where Extract_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Extracts_Details_View_For_Clients Where Extract_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Extracts_Head_View_For_Clients Where Search_Field Like '%
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
Select * FROM Costcenters Where Costcenter_Name_A Like '%
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Width0_GotFocus, Width0_KeyDown, Width0_KeyPress, Width0_LostFocus, Qty_GotFocus, Qty_KeyDown, Qty_LostFocus, Extract_No_GotFocus, Extract_No_KeyDown, Extract_No_KeyPress, Extract_No_LostFocus, Print_Journal_Click, Print_Journal_KeyDown, Note_Qty_GotFocus, Note_Qty_KeyDown, Note_Qty_LostFocus, Contract_Date_GotFocus, Contract_Date_KeyDown, Contract_Date_LostFocus, Vat_Tax_Per_GotFocus, Vat_Tax_Per_KeyDown, Vat_Tax_Per_KeyPress, Vat_Tax_Per_LostFocus, Vat_Tax_Amount_GotFocus, Vat_Tax_Amount_KeyDown, Vat_Tax_Amount_LostFocus, Note_Net_With_Tax_KeyDown, Discount_Amount_GotFocus, Discount_Amount_KeyDown, Discount_Amount_KeyPress, Discount_Amount_LostFocus, Note_Net_GotFocus, Note_Net_KeyDown, Note_Net_LostFocus, Vat_No_For_Invoice_GotFocus, Vat_No_For_Invoice_KeyDown, Vat_No_For_Invoice_KeyPress, Vat_No_For_Invoice_LostFocus, Button1_Click, QrcodeGen, Entry_ID_KeyDown, Entry_Name_KeyDown, Notice_GotFocus, Notice_KeyDown, Notice_KeyPress, Extract_Date_KeyDown, Extract_Date_Opened, RadGridView1_DoubleClick, RadGridView1_KeyDown, Level5_ID_GotFocus, Level5_ID_KeyDown, Level5_ID_KeyPress, Level5_Name_A_GotFocus, Level5_Name_A_KeyDown, Actual_Qty_GotFocus, Actual_Qty_KeyDown, Actual_Qty_KeyPress, Price_GotFocus, Price_KeyDown, Contract_No_KeyPress, Contract_No_LostFocus, Notice_LostFocus, Actual_Qty_LostFocus, Level5_ID_LostFocus, Search_Txt_LostFocus, Note_Date_H_GotFocus, Note_Date_H_KeyDown, Note_Date_H_LostFocus, Actual_Net_GotFocus, Actual_Net_KeyDown, Actual_Net_LostFocus, Price_KeyPress, Price_LostFocus, Level5_Name_A_LostFocus, Note_Actual_Qty_GotFocus, Note_Actual_Qty_KeyDown, Note_Total_GotFocus, Note_Total_KeyDown, Note_Actual_Qty_LostFocus, Note_Total_LostFocus, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, Note_Net_Text_LostFocus, Unit_Name_GotFocus, Unit_Name_KeyDown, Units_GridView_CellClick, Units_GridView_CellFormatting, Units_GridView_KeyDown, Unit_Name_KeyPress, Unit_Name_LostFocus, Extract_Date_ValueChanged, Analysis_ID_GotFocus, Analysis_Name_A_GotFocus, Analysis_Name_A_KeyDown, Analysis_Name_A_LostFocus, Analysis_ID_KeyDown, Analysis_ID_KeyPress, Analysis_ID_LostFocus, Analysis_GridView_CellClick, Analysis_GridView_CellFormatting, Credit_Level5_ID_GotFocus, Credit_Level5_Name_A_GotFocus, Credit_Level5_Name_A_KeyDown, Credit_Level5_Name_A_LostFocus, Credit_Level5_ID_KeyDown, Credit_Level5_ID_KeyPress, Credit_Level5_ID_LostFocus, Analysis_GridView_KeyDown, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, Costcenter_ID_GotFocus, Costcenter_Name_A_GotFocus, Costcenter_Name_A_KeyDown, Costcenter_Name_A_LostFocus, Costcenter_ID_KeyDown, Costcenter_ID_KeyPress, Costcenter_ID_LostFocus, Costcenters_GridView_CellClick, Costcenters_GridView_CellFormatting, Costcenters_GridView_KeyDown, Length_GotFocus, Length_KeyDown, Length_KeyPress, Length_LostFocus, set_Costcenter_Name_A, get_Costcenter_ID, set_Costcenter_ID, get_Label36, set_Label36, get_Note_Actual_Qty, set_Note_Actual_Qty, get_Note_Qty, set_Note_Qty, get_Label17, set_Label17, get_Label16, set_Label16, get_Label1, set_Label1, get_Width0, set_Width0, get_Length, set_Length, get_Label5, set_Label5, get_Label12, set_Label12, get_Extract_No, set_Extract_No, get_Extract_Date, set_Extract_Date, get_Contract_Date, set_Contract_Date, get_Print_Journal, set_Print_Journal, get_Journal_No, set_Journal_No, get_Label37, set_Label37, get_Note_Net_With_Tax, set_Note_Net_With_Tax, get_Label18, set_Label18, get_Vat_Tax_Per, set_Vat_Tax_Per, get_Label24, set_Label24, get_Vat_Tax_Amount, set_Vat_Tax_Amount, get_Label21, set_Label21, get_Contracts_Panel, set_Contracts_Panel, get_Contracts_GridView, set_Contracts_GridView, get_Discount_Amount, set_Discount_Amount, get_Label33, set_Label33, get_Note_Net, set_Note_Net, get_Label20, set_Label20, get_Button1, set_Button1, get_PictureBox1, set_PictureBox1, get_Label22, set_Label22, get_Vat_No_For_Invoice, set_Vat_No_For_Invoice, get_textBox1, set_textBox1, Clear_Record, Clear_Data, Clear_Data1, Fill_Grid, Fill_Level5_Grid, Fill_Analysis_Grid, Fill_Units_Grid, Fill_Costcenters_Grid, Lock_Control, Enable_Control, Review_Record, Find_Total, Extracts_Form_For_Clients_KeyDown, Extracts_Form_For_Clients_Load, Extracts_Form_For_Clients_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Contracts_GridView_CellClick, Contracts_GridView_CellFormatting, Contracts_GridView_KeyDown, Contract_No_GotFocus, Contract_No_KeyDown, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadPanel4, set_RadPanel4, get_RadGridView1, set_RadGridView1, get_RadLabel15, set_RadLabel15, get_Label13, set_Label13, get_Label8, set_Label8, get_Label6, set_Label6, get_Contract_No, set_Contract_No, get_Notice, set_Notice, get_Label4, set_Label4, get_Label9, set_Label9, get_Label10, set_Label10, get_Label11, set_Label11, get_Actual_Qty, set_Actual_Qty, get_Unit_Name, set_Unit_Name, get_Level5_Name_A, set_Level5_Name_A, get_Level5_ID, set_Level5_ID, get_Label15, set_Label15, get_Net, set_Net, get_Label14, set_Label14, get_Price, set_Price, get_Note_Total, set_Note_Total, get_Label28, set_Label28, get_Note_Net_With_Tax_Text, set_Note_Net_With_Tax_Text, get_SR, set_SR, get_Extract_Date_H, set_Extract_Date_H, get_Label2, set_Label2, get_Qty, set_Qty, get_Units_GridView, set_Units_GridView, get_Label3, set_Label3, get_Credit_Level5_Name_A, set_Credit_Level5_Name_A, get_Label7, set_Label7, get_Credit_Level5_ID, set_Credit_Level5_ID, get_Analysis_Name_A, set_Analysis_Name_A, get_Analysis_ID, set_Analysis_ID, get_Label19, set_Label19, get_Label25, set_Label25, get_Note_Net_Text, set_Note_Net_Text, get_Analysis_GridView, set_Analysis_GridView, get_Level5_GridView, set_Level5_GridView, get_AquaTheme1, set_AquaTheme1, get_Cost, set_Cost, get_Label35, set_Label35, get_Costcenters_GridView, set_Costcenters_GridView, get_Costcenter_Name_A
```

---

### 3.5 شاشة: تكاليف المشروعات وبنود المقايسة (`Project_Cost_Form`)
- **الاسم الإنجليزي:** Project Costing & BOQ Management
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** متابعة التكاليف الفعلية والمقدرة للمشروع وربط المواد والعمالة والمعدات ببنود الأعمال
- **جداول قاعدة البيانات المستهدفة:** `Projects_Cost_Head`, `Projects_Cost_Details`

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
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Projects_Cost_Head.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Projects_Cost_Head.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `RadGridView1` | **RadGridView1** | `RadGridView` | - | - | - | - |
| `Note_Date` | **تاريخ الحركة** | `RadDateTimePicker` | `Projects_Cost_Head.Note_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `RadLabel15` | **RadLabel15** | `RadLabel` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Label8` | **Label8** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Note_No` | **رقم الحركة / السند** | `RadTextBox` | `Projects_Cost_Head.Note_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Projects_Cost_Head.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Label10` | **Label10** | `Label` | - | - | - | - |
| `Label11` | **Label11** | `Label` | - | - | - | - |
| `Period` | **Period** | `RadTextBox` | `Projects_Cost_Details.Period` | `float` (NOT NULL) | `((0))` | - |
| `Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Projects_Cost_Head.Credit_Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label15` | **Label15** | `Label` | - | - | - | - |
| `Project_Price` | **السعر الفردي** | `RadTextBox` | `Projects_Cost_Head.Note_Project_Price` | `float` (NOT NULL) | `((0))` | - |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Note_Project_Price` | **السعر الفردي** | `RadTextBox` | `Projects_Cost_Head.Note_Project_Price` | `float` (NOT NULL) | `((0))` | - |
| `Label28` | **Label28** | `Label` | - | - | - | - |
| `Note_Net_With_Tax_Text` | **ضريبة القيمة المضافة** | `RadTextBox` | - | - | - | `Net = Total - Discount + Tax` |
| `SR` | **SR** | `RadTextBox` | `Projects_Cost_Details.SR` | `int` (PRIMARY KEY, NOT NULL) | - | - |
| `Note_Date_H` | **تاريخ الحركة** | `RadTextBox` | `Projects_Cost_Head.Note_Date_H` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Qty` | **الكمية** | `RadTextBox` | `Projects_Cost_Head.Note_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `TextBox` | `Projects_Cost_Head.Note_Net_Text` | `nvarchar(250)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `Cost` | **Cost** | `RadTextBox` | `Projects_Cost_Head.Note_Cost` | `float` (NOT NULL) | `((0))` | - |
| `Label35` | **Label35** | `Label` | - | - | - | - |
| `Costcenters_GridView` | **Costcenters_GridView** | `RadGridView` | - | - | - | - |
| `Costcenter_Name_A` | **اسم مركز التكلفة** | `RadTextBox` | - | - | - | - |
| `Costcenter_ID` | **كود مركز التكلفة** | `RadTextBox` | `Projects_Cost_Head.Costcenter_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label36` | **Label36** | `Label` | - | - | - | - |
| `Note_Qty` | **الكمية** | `RadTextBox` | `Projects_Cost_Head.Note_Qty` | `float` (NOT NULL) | `((0))` | - |
| `Label16` | **Label16** | `Label` | - | - | - | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Note_Cost` | **Note_Cost** | `RadTextBox` | `Projects_Cost_Head.Note_Cost` | `float` (NOT NULL) | `((0))` | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Label7` | **Label7** | `Label` | - | - | - | - |
| `Start_Date` | **Start_Date** | `RadDateTimePicker` | `Projects_Cost_Details.Start_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Add_Transaction` | **زر إضافة جديد** | `RadButton` | - | - | - | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `End_Date` | **End_Date** | `RadDateTimePicker` | `Projects_Cost_Details.End_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الحسـاب 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الحسـاب 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الكمية المبدئية 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال التكلفة المبدئية 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال قيمة الإيراد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال تاريخ البدايـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال المدة الزمنية 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال مركز التكلفة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إضافة سجل جديد أثناء عملية التعديل. لأضافة سجل يجب الضغط على الغاء التعديل ثم الضغط على سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إجراء تعديل أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: في حالة الإضافة يجب الضغط على سجل جديد وفي حالة التعديل يجب الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السند غير موجود ويجب حفظه أولاً  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء إضافة سجل جديد. للحذف يجب الضغط على الغاء الإضافة ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء تعديل سجل . للحذف يجب الضغط على الغاء التعديل ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد السجل المراد حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد العقـد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الصافي تفقيطاً (كتابة بالكلمات): Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Projects_Cost_Head_View Order By Note_No DESC
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
Select * FROM Costcenters Order By Costcenter_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM Projects_Cost_Head Order By Note_No Desc
```
##### استعلام INSERT على جدول `Projects_Cost_Head`:
```sql
Insert Into Projects_Cost_Head(Note_No,Note_Date,Note_Date_H,Costcenter_ID,Note_Qty,Note_Cost,Note_Project_Price,Note_Net_Text,Notice,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Projects_Cost_Details`:
```sql
Insert Into Projects_Cost_Details(Note_No,SR,Level5_ID,Qty,Cost,Project_Price,Period,Start_Date,End_Date)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Projects_Cost_Head Where Note_No=
```
##### استعلام UPDATE على جدول `Projects_Cost_Head`:
```sql
Update Projects_Cost_Head Set Note_No=
```
##### استعلام DELETE على جدول `Projects_Cost_Details`:
```sql
Delete From Projects_Cost_Details Where Note_No=
```
##### استعلام INSERT على جدول `Projects_Cost_Details`:
```sql
Insert Into Projects_Cost_Details(Note_No,SR,Level5_ID,Qty,Cost,Project_Price,Period,Start_Date,End_Date)Values(
```
##### استعلام DELETE على جدول `Projects_Cost_Head`:
```sql
Delete From Projects_Cost_Head where Note_No=
```
##### استعلام DELETE على جدول `Projects_Cost_Details`:
```sql
Delete From Projects_Cost_Details where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Projects_Cost_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Projects_Cost_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Projects_Cost_Head_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters Where Costcenter_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Projects_Cost_Head_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Projects_Cost_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters Where Costcenter_ID=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Qty_KeyPress, Qty_LostFocus, Note_Qty_GotFocus, Note_Qty_KeyDown, Note_Qty_LostFocus, Project_Price_GotFocus, Project_Price_KeyDown, Project_Price_KeyPress, Project_Price_LostFocus, Start_Date_KeyDown, Start_Date_Opened, Start_Date_ValueChanged, Add_Transaction_Click, Add_Transaction_KeyDown, End_Date_KeyDown, set_Label9, get_End_Date, set_End_Date, Clear_Record, Clear_Data, Fill_Grid, Fill_Level5_Grid, Fill_Costcenters_Grid, Lock_Control, Enable_Control, Review_Record, Find_Total, Project_Cost_Form_KeyDown, Project_Cost_Form_Load, Contracts_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Note_No_GotFocus, Note_No_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Notice_GotFocus, Notice_KeyDown, Notice_KeyPress, Note_Date_KeyDown, Note_Date_Opened, RadGridView1_DoubleClick, RadGridView1_KeyDown, Level5_ID_GotFocus, Level5_ID_KeyDown, Level5_ID_KeyPress, Level5_Name_A_GotFocus, Level5_Name_A_KeyDown, Period_GotFocus, Period_KeyDown, Period_KeyPress, Note_No_KeyPress, Note_No_LostFocus, Notice_LostFocus, Period_LostFocus, Level5_ID_LostFocus, Search_Txt_LostFocus, Note_Date_H_GotFocus, Note_Date_H_KeyDown, Note_Date_H_LostFocus, Cost_GotFocus, Cost_KeyDown, Cost_KeyPress, Cost_LostFocus, Level5_Name_A_LostFocus, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, Note_Net_Text_LostFocus, Note_Date_ValueChanged, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, Costcenter_ID_GotFocus, Costcenter_Name_A_GotFocus, Costcenter_Name_A_KeyDown, Costcenter_Name_A_LostFocus, Costcenter_ID_KeyDown, Costcenter_ID_KeyPress, Costcenter_ID_LostFocus, Costcenters_GridView_CellClick, Costcenters_GridView_CellFormatting, Costcenters_GridView_KeyDown, Qty_GotFocus, Qty_KeyDown, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadPanel4, set_RadPanel4, get_RadGridView1, set_RadGridView1, get_Note_Date, set_Note_Date, get_RadLabel15, set_RadLabel15, get_Label13, set_Label13, get_Label8, set_Label8, get_Label6, set_Label6, get_Note_No, set_Note_No, get_Notice, set_Notice, get_Label10, set_Label10, get_Label11, set_Label11, get_Period, set_Period, get_Level5_Name_A, set_Level5_Name_A, get_Level5_ID, set_Level5_ID, get_Label15, set_Label15, get_Project_Price, set_Project_Price, get_Label14, set_Label14, get_Note_Project_Price, set_Note_Project_Price, get_Label28, set_Label28, get_Note_Net_With_Tax_Text, set_Note_Net_With_Tax_Text, get_SR, set_SR, get_Note_Date_H, set_Note_Date_H, get_Label2, set_Label2, get_Qty, set_Qty, get_Label3, set_Label3, get_Note_Net_Text, set_Note_Net_Text, get_Level5_GridView, set_Level5_GridView, get_AquaTheme1, set_AquaTheme1, get_Cost, set_Cost, get_Label35, set_Label35, get_Costcenters_GridView, set_Costcenters_GridView, get_Costcenter_Name_A, set_Costcenter_Name_A, get_Costcenter_ID, set_Costcenter_ID, get_Label36, set_Label36, get_Note_Qty, set_Note_Qty, get_Label16, set_Label16, get_Label1, set_Label1, get_Label5, set_Label5, get_Note_Cost, set_Note_Cost, get_Label4, set_Label4, get_Label7, set_Label7, get_Start_Date, set_Start_Date, get_Add_Transaction, set_Add_Transaction, get_Label9
```

---

### 3.6 شاشة: إغلاق وتسليم بنود المشروعات (`Project_Cost_Form_By_End`)
- **الاسم الإنجليزي:** Project BOQ Item Completion
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** تسجيل تواريخ انتهاء واستلام بنود الأعمال وحساب فترات التأخير والغرامات
- **جداول قاعدة البيانات المستهدفة:** `Projects_Cost_Details`

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
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Projects_Cost_Details.Item_End_Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Projects_Cost_Details.Item_End_Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `RadGridView1` | **RadGridView1** | `RadGridView` | - | - | - | - |
| `Note_Date` | **تاريخ الحركة** | `RadDateTimePicker` | - | - | - | - |
| `RadLabel15` | **RadLabel15** | `RadLabel` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Label8` | **Label8** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Note_No` | **رقم الحركة / السند** | `RadTextBox` | `Projects_Cost_Details.Note_No` | `int` (PRIMARY KEY, NOT NULL) | - | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Projects_Cost_Details.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Label10` | **Label10** | `Label` | - | - | - | - |
| `Label11` | **Label11** | `Label` | - | - | - | - |
| `Period` | **Period** | `RadTextBox` | `Projects_Cost_Details.Period` | `float` (NOT NULL) | `((0))` | - |
| `Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Projects_Cost_Details.Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label15` | **Label15** | `Label` | - | - | - | - |
| `Project_Price` | **السعر الفردي** | `RadTextBox` | `Projects_Cost_Details.Project_Price` | `float` (NOT NULL) | `((0))` | - |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Note_Project_Price` | **السعر الفردي** | `RadTextBox` | `Projects_Cost_Details.Project_Price` | `float` (NOT NULL) | `((0))` | - |
| `Label28` | **Label28** | `Label` | - | - | - | - |
| `Note_Net_With_Tax_Text` | **ضريبة القيمة المضافة** | `RadTextBox` | - | - | - | `Net = Total - Discount + Tax` |
| `SR` | **SR** | `RadTextBox` | `Projects_Cost_Details.SR` | `int` (PRIMARY KEY, NOT NULL) | - | - |
| `Note_Date_H` | **تاريخ الحركة** | `RadTextBox` | - | - | - | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `TextBox` | - | - | - | `Net = Total - Discount + Tax` |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `Cost` | **Cost** | `RadTextBox` | `Projects_Cost_Details.Cost` | `float` (NOT NULL) | `((0))` | - |
| `Label35` | **Label35** | `Label` | - | - | - | - |
| `Costcenters_GridView` | **Costcenters_GridView** | `RadGridView` | - | - | - | - |
| `Costcenter_Name_A` | **اسم مركز التكلفة** | `RadTextBox` | - | - | - | - |
| `Costcenter_ID` | **كود مركز التكلفة** | `RadTextBox` | - | - | - | - |
| `Label36` | **Label36** | `Label` | - | - | - | - |
| `Note_Qty` | **الكمية** | `RadTextBox` | `Projects_Cost_Details.Qty` | `float` (NOT NULL) | `((0))` | - |
| `Label16` | **Label16** | `Label` | - | - | - | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Note_Cost` | **Note_Cost** | `RadTextBox` | `Projects_Cost_Details.Cost` | `float` (NOT NULL) | `((0))` | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Label7` | **Label7** | `Label` | - | - | - | - |
| `Start_Date` | **Start_Date** | `RadDateTimePicker` | `Projects_Cost_Details.Start_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Add_Transaction` | **زر إضافة جديد** | `RadButton` | - | - | - | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Item_End_Date` | **Item_End_Date** | `RadDateTimePicker` | `Projects_Cost_Details.End_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Item_End_Flag` | **حالة الاعتماد / التأكيد** | `RadCheckBox` | `Projects_Cost_Details.Flag` | `bit` (NOT NULL) | `((0))` | - |
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الحسـاب 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الحسـاب 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال التكلفة المبدئية 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال قيمة الإيراد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال تاريخ البدايـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال المدة الزمنية 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب الضغط على إنهـاء لإدراج التعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال مركز التكلفة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إجراء تعديل أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: في حالة الإضافة يجب الضغط على سجل جديد وفي حالة التعديل يجب الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السند غير موجود ويجب حفظه أولاً  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء إضافة سجل جديد. للحذف يجب الضغط على الغاء الإضافة ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء تعديل سجل . للحذف يجب الضغط على الغاء التعديل ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد السجل المراد حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد العقـد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Calculation]** حساب تلقائي لحقل ضريبة القيمة المضافة: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الصافي تفقيطاً (كتابة بالكلمات): Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Projects_Cost_Head_View Order By Note_No DESC
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
Select * FROM Costcenters Order By Costcenter_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Projects_Cost_Head Where Note_No=
```
##### استعلام UPDATE على جدول `Projects_Cost_Details`:
```sql
Update Projects_Cost_Details Set Item_End_Flag='
```
##### استعلام DELETE على جدول `Projects_Cost_Details`:
```sql
Delete From Projects_Cost_Head where Note_No=
```
##### استعلام DELETE على جدول `Projects_Cost_Details`:
```sql
Delete From Projects_Cost_Details where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Projects_Cost_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Projects_Cost_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Projects_Cost_Head_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters Where Costcenter_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Projects_Cost_Head_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Projects_Cost_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters Where Costcenter_ID=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Note_Qty_GotFocus, Note_Qty_KeyDown, Note_Qty_LostFocus, Project_Price_GotFocus, Project_Price_KeyDown, Project_Price_KeyPress, Project_Price_LostFocus, Start_Date_KeyDown, Start_Date_Opened, Start_Date_ValueChanged, Add_Transaction_Click, Add_Transaction_KeyDown, End_Date_KeyDown, Item_End_Date_Opened, set_Item_End_Date, get_Item_End_Flag, set_Item_End_Flag, Clear_Record, Clear_Data, Fill_Grid, Fill_Level5_Grid, Fill_Costcenters_Grid, Lock_Control, Enable_Control, Review_Record, Find_Total, Project_Cost_Form_KeyDown, Project_Cost_Form_Load, Contracts_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Note_No_GotFocus, Note_No_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Notice_GotFocus, Notice_KeyDown, Notice_KeyPress, Note_Date_KeyDown, Note_Date_Opened, RadGridView1_DoubleClick, RadGridView1_KeyDown, Level5_ID_GotFocus, Level5_ID_KeyDown, Level5_ID_KeyPress, Level5_Name_A_GotFocus, Level5_Name_A_KeyDown, Period_GotFocus, Period_KeyDown, Period_KeyPress, Note_No_KeyPress, Note_No_LostFocus, Notice_LostFocus, Period_LostFocus, Level5_ID_LostFocus, Search_Txt_LostFocus, Note_Date_H_GotFocus, Note_Date_H_KeyDown, Note_Date_H_LostFocus, Cost_GotFocus, Cost_KeyDown, Cost_KeyPress, Cost_LostFocus, Level5_Name_A_LostFocus, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, Note_Net_Text_LostFocus, Note_Date_ValueChanged, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, Costcenter_ID_GotFocus, Costcenter_Name_A_GotFocus, Costcenter_Name_A_KeyDown, Costcenter_Name_A_LostFocus, Costcenter_ID_KeyDown, Costcenter_ID_KeyPress, Costcenter_ID_LostFocus, Costcenters_GridView_CellClick, Costcenters_GridView_CellFormatting, Costcenters_GridView_KeyDown, flag_GotFocus, Qty_KeyDown, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_RadPanel4, set_RadPanel4, get_RadGridView1, set_RadGridView1, get_Note_Date, set_Note_Date, get_RadLabel15, set_RadLabel15, get_Label13, set_Label13, get_Label8, set_Label8, get_Label6, set_Label6, get_Note_No, set_Note_No, get_Notice, set_Notice, get_Label10, set_Label10, get_Label11, set_Label11, get_Period, set_Period, get_Level5_Name_A, set_Level5_Name_A, get_Level5_ID, set_Level5_ID, get_Label15, set_Label15, get_Project_Price, set_Project_Price, get_Label14, set_Label14, get_Note_Project_Price, set_Note_Project_Price, get_Label28, set_Label28, get_Note_Net_With_Tax_Text, set_Note_Net_With_Tax_Text, get_SR, set_SR, get_Note_Date_H, set_Note_Date_H, get_Label2, set_Label2, get_Label3, set_Label3, get_Note_Net_Text, set_Note_Net_Text, get_Level5_GridView, set_Level5_GridView, get_AquaTheme1, set_AquaTheme1, get_Cost, set_Cost, get_Label35, set_Label35, get_Costcenters_GridView, set_Costcenters_GridView, get_Costcenter_Name_A, set_Costcenter_Name_A, get_Costcenter_ID, set_Costcenter_ID, get_Label36, set_Label36, get_Note_Qty, set_Note_Qty, get_Label16, set_Label16, get_Label1, set_Label1, get_Label5, set_Label5, get_Note_Cost, set_Note_Cost, get_Label4, set_Label4, get_Label7, set_Label7, get_Start_Date, set_Start_Date, get_Add_Transaction, set_Add_Transaction, get_Label9, set_Label9, get_Item_End_Date
```

---

### 3.7 شاشة: أوامر التشغيل ومراكز العمل (`Job_Orders_Form`)
- **الاسم الإنجليزي:** Work Orders & Job Execution
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** إصدار ومتابعة أوامر التشغيل الميدانية وربطها بالمشروعات والعملاء
- **جداول قاعدة البيانات المستهدفة:** `Job_Orders`

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
| `Job_Order_Name_E` | **Job_Order_Name_E** | `RadTextBox` | `Job_Orders.Job_Order_Name_E` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `GridView` | **GridView** | `RadGridView` | - | - | - | - |
| `Job_Order_No` | **Job_Order_No** | `RadTextBox` | `Job_Orders.Job_Order_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Job_Orders.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Job_Orders.Entry_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `Job_Order_Name_A` | **Job_Order_Name_A** | `RadTextBox` | `Job_Orders.Job_Order_Name_A` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `RadLabel1` | **RadLabel1** | `RadLabel` | - | - | - | - |
| `RadLabel2` | **RadLabel2** | `RadLabel` | - | - | - | - |
| `RadLabel5` | **RadLabel5** | `RadLabel` | - | - | - | - |
| `Notice` | **ملاحظات السجل** | `RadTextBox` | `Job_Orders.Notice` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `RadLabel3` | **RadLabel3** | `RadLabel` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `RadLabel4` | **RadLabel4** | `RadLabel` | - | - | - | - |
| `RadPanel4` | **RadPanel4** | `RadPanel` | - | - | - | - |
| `Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Job_Orders.Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `RadLabel6` | **RadLabel6** | `RadLabel` | - | - | - | - |
| `Job_Order_Date` | **Job_Order_Date** | `RadDateTimePicker` | `Job_Orders.Job_Order_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Delivery_Date` | **Delivery_Date** | `RadDateTimePicker` | `Job_Orders.Delivery_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `RadLabel7` | **RadLabel7** | `RadLabel` | - | - | - | - |
| `Job_Order_Desc` | **Job_Order_Desc** | `RadTextBox` | `Job_Orders.Job_Order_Desc` | `nvarchar(255)` (NOT NULL) | `(' ')` | - |
| `RadLabel9` | **RadLabel9** | `RadLabel` | - | - | - | - |
| `Job_Order_Status` | **Job_Order_Status** | `RadCheckBox` | `Job_Orders.Job_Order_Status` | `bit` (NOT NULL) | `((0))` | - |
| `RadPanel5` | **RadPanel5** | `RadPanel` | - | - | - | - |
| `RadLabel11` | **RadLabel11** | `RadLabel` | - | - | - | - |
| `Sales_Invoice_No` | **Sales_Invoice_No** | `RadTextBox` | `Job_Orders.Sales_Invoice_No` | `int` (NOT NULL) | `((0))` | - |
| `RadLabel10` | **RadLabel10** | `RadLabel` | - | - | - | - |
| `Production_Line_Name_A` | **Production_Line_Name_A** | `RadTextBox` | - | - | - | - |
| `Production_Line_ID` | **Production_Line_ID** | `RadTextBox` | `Job_Orders.Production_Line_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `RadLabel12` | **RadLabel12** | `RadLabel` | - | - | - | - |
| `Level5_Gridview` | **Level5_Gridview** | `RadGridView` | - | - | - | - |
| `Production_Lines_Gridview` | **Production_Lines_Gridview** | `RadGridView` | - | - | - | - |
| `Sales_Invoice_Date` | **Sales_Invoice_Date** | `RadTextBox` | `Job_Orders.Sales_Invoice_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء إضافة سجل جديد. للحذف يجب الضغط على الغاء الإضافة ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الحذف أثناء تعديل سجل . للحذف يجب الضغط على الغاء التعديل ثم الضغط على حذف مرة أخرى 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد السجل المراد حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل غير موجود ولا يمكن حذفه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الرقـم 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الأسـم بالعربـي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال الأسـم بالأنجليزي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إختيار الحسـاب 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إختيار جهـة التشـغيل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إضافة سجل جديد أثناء عملية التعديل. لأضافة سجل يجب الضغط على الغاء التعديل ثم الضغط على سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن إجراء تعديل أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: في حالة الإضافة يجب الضغط على سجل جديد وفي حالة التعديل يجب الضغط على إجراء تعديل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل موجود مسبقاً ولا يمكن حفظه 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: هذا السجل غير موجود ولا يمكن تحديثه 
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Job_Orders Where Job_Order_No=
```
##### استعلام DELETE على جدول `Job_Orders`:
```sql
Delete From Job_Orders where Job_Order_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Job_Orders_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Production_Lines Where Production_Line_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Job_Orders_View Where Job_Order_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Job_Orders Where Job_Order_Name_A='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Job_Orders Where Job_Order_Name_E='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Production_Lines Where Production_Line_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Job_Orders_View Order By Job_Order_No
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
Select * FROM Level5_View Order By Level5_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Production_Lines Order By Production_Line_ID
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Job_Order_No FROM Job_Orders Order By Job_Order_No Desc
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Job_Orders Where Job_Order_No=
```
##### استعلام INSERT على جدول `Job_Orders`:
```sql
Insert Into Job_Orders(Job_Order_No,Job_Order_Date,Job_Order_Date_H,Delivery_Date,Job_Order_Name_A,Job_Order_Name_E,Level5_ID,Production_Line_ID,Job_Order_Desc,Entry_ID,Entry_Name,Notice)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Job_Orders Where Job_Order_No=
```
##### استعلام UPDATE على جدول `Job_Orders`:
```sql
Update Job_Orders Set Job_Order_No=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Delete_Click, Delete_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Job_Order_No_GotFocus, Job_Order_No_KeyPress, Job_Order_No_KeyDown, Job_Order_Name_A_GotFocus, Job_Order_Name_A_KeyPress, Job_Order_Name_A_KeyDown, Job_Order_Name_E_GotFocus, Job_Order_Name_E_KeyPress, Production_Line_Name_E_KeyDown, Notice_GotFocus, Notice_KeyPress, Notice_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Production_Line_Name_E_LostFocus, Notice_LostFocus, Search_Txt_LostFocus, Level5_ID_GotFocus, Level5_ID_KeyDown, Level5_ID_KeyPress, Level5_Name_A_GotFocus, Level5_Gridview_CellClick, Level5_Gridview_CellFormatting, Level5_Gridview_KeyDown, Level5_ID_LostFocus, Level5_Name_A_LostFocus, Production_Line_ID_GotFocus, Production_Line_ID_KeyDown, Production_Line_ID_KeyPress, Production_Line_Name_A_GotFocus, Production_Lines_Gridview_CellClick, Production_Lines_Gridview_CellFormatting, Production_Lines_Gridview_KeyDown, Production_Line_ID_LostFocus, Production_Line_Name_A_LostFocus, Job_Order_Desc_GotFocus, Job_Order_Desc_KeyDown, Job_Order_Desc_KeyPress, Job_Order_Desc_LostFocus, Job_Order_Name_A_LostFocus, Job_Order_No_LostFocus, Job_Order_Date_KeyDown, Job_Order_Date_Opened, Delivery_Date_KeyDown, Delivery_Date_Opened, Sales_Invoice_No_GotFocus, Sales_Invoice_No_KeyDown, Sales_Invoice_Date_GotFocus, Sales_Invoice_Date_KeyDown, Job_Order_Status_KeyDown, Sales_Invoice_No_LostFocus, Sales_Invoice_Date_LostFocus, Dispose, InitializeComponent, get_Search_Option2, set_Search_Option2, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_Job_Order_Name_E, set_Job_Order_Name_E, get_GridView, set_GridView, get_Job_Order_No, set_Job_Order_No, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_RadLabel8, set_RadLabel8, get_DesertTheme1, set_DesertTheme1, get_Job_Order_Name_A, set_Job_Order_Name_A, get_RadLabel1, set_RadLabel1, get_RadLabel2, set_RadLabel2, get_RadLabel5, set_RadLabel5, get_Notice, set_Notice, get_RadLabel3, set_RadLabel3, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_AquaTheme1, set_AquaTheme1, get_RadLabel4, set_RadLabel4, get_RadPanel4, set_RadPanel4, get_Level5_Name_A, set_Level5_Name_A, get_Level5_ID, set_Level5_ID, get_RadLabel6, set_RadLabel6, get_Job_Order_Date, set_Job_Order_Date, get_Delivery_Date, set_Delivery_Date, get_RadLabel7, set_RadLabel7, get_Job_Order_Desc, set_Job_Order_Desc, get_RadLabel9, set_RadLabel9, get_Job_Order_Status, set_Job_Order_Status, get_RadPanel5, set_RadPanel5, get_RadLabel11, set_RadLabel11, get_Sales_Invoice_No, set_Sales_Invoice_No, get_RadLabel10, set_RadLabel10, get_Production_Line_Name_A, set_Production_Line_Name_A, get_Production_Line_ID, set_Production_Line_ID, get_RadLabel12, set_RadLabel12, get_Level5_Gridview, set_Level5_Gridview, get_Production_Lines_Gridview, set_Production_Lines_Gridview, get_Sales_Invoice_Date, set_Sales_Invoice_Date, Clear_Record, Clear_Data, Fill_Grid, Fill_Level5_Grid, Fill_Production_Lines_Grid, Lock_Control, Enable_Control, Review_Record, Job_Orders_Form_KeyDown, Job_Orders_Form_Load, Job_Orders_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown
```

---

