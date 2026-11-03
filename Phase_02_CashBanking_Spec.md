# مواصفات ومخطط الوحدة المعمارية: الخزائن والبنوك والشيكات وحركات النقدية (Cash, Banking & Cheques)
**المرحلة البرمجية:** المرحلة 2 (`Phase 02`)
**التطبيق المصدر:** `APPS ERP Application 2023.exe` (Tarabot ERP)
**قاعدة البيانات المستهدفة:** `MK_Khalil_Db_2026` (SQL Server)
**تاريخ الاستخراج الآلي:** 2026-11-03 22:30:55
---

## 1. النبذة الهندسية والهدف الوظيفي للوحدة
تتولى هذه الوحدة إدارة كافة العمليات والبيانات الخاصة بـ **الخزائن والبنوك والشيكات وحركات النقدية**، وتوفر دورة عمل متكاملة تبدأ من تهيئة الإعدادات والشاشات الثابتة وحتى تنفيذ العمليات اليومية وترحيلها محاسبياً ومخزنياً وفق المعايير المعتمدة في النظام.

تحتوي هذه الوحدة على **9 شاشة نموذج رئيسية** تم تشريحها واستخراج كافة عناصر التحكم، وخطوط أنابيب البيانات، والمعادلات الرياضية، وقواعد التحقق الخاصة بها.

---

## 2. الفهرس التشغيلي لشاشات الوحدة
| # | اسم الشاشة البرمجية (Form Class) | المسمى العربي | المسمى الإنجليزي | الجداول المرتبطة في قاعدة البيانات |
|---|---|---|---|---|
| 1 | `Payable_Form` | **سندات صرف النقدية والخزائن** | Cash & Bank Payment Vouchers | `Payable_Head, Payable_Details` |
| 2 | `Receivable_Form` | **سندات قبض النقدية والخزائن** | Cash & Bank Receipt Vouchers | `Receivable_Head, Receivable_Details` |
| 3 | `Banks_Transfer_Issue_Form` | **التحويلات البنكية الصادرة** | Outgoing Bank Transfers | `Banks_Transfers_Issue_Head, Banks_Transfers_Issue_Details` |
| 4 | `Banks_Transfer_Delivery_Form` | **التحويلات البنكية الواردة** | Incoming Bank Transfers | `Banks_Transfers_Delivery_Head, Banks_Transfers_Delivery_Details` |
| 5 | `Cheque_Issue_Form` | **الشيكات الصادرة (أوراق دفع)** | Outgoing Cheques (Notes Payable) | `Cheques_Issue_Head, Cheques_Issue_Details` |
| 6 | `Cheque_Delivery_Form` | **الشيكات الواردة (أوراق قبض)** | Incoming Cheques (Notes Receivable) | `Cheques_Delivery_Head, Cheques_Delivery_Details` |
| 7 | `Cheques_Receipt_Form` | **حافظة تحصيل وصرف أوراق القبض** | Cheques Deposit & Collection | `Cheques_Receipt_Head, Cheques_Receipt_Details` |
| 8 | `Cheques_Issue_Receipt_Form` | **حافظة صرف أوراق الدفع المسحوبة** | Issued Cheques Clearance | `Cheques_Issue_Receipt_Head, Cheques_Issue_Receipt_Details` |
| 9 | `Cheques_Transaction_Form` | **حركات ومتابعة حالة الشيكات** | Cheque Status & Lifecycle Tracking | `Cheques_Transaction_Head, Cheques_Transaction_Details` |

---

## 3. التشريح التفصيلي لنماذج الشاشات (Forms Technical Catalog)
### 3.1 شاشة: سندات صرف النقدية والخزائن (`Payable_Form`)
- **الاسم الإنجليزي:** Cash & Bank Payment Vouchers
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** إصدار وتوثيق سندات صرف النقدية من الخزائن أو الحسابات البنكية للموردين والمصروفات
- **جداول قاعدة البيانات المستهدفة:** `Payable_Head`, `Payable_Details`

#### أ. كتالوج حقول وعناصر التحكم (Field & Control Catalog Table)
| معرف العنصر (Control ID) | التسمية العربية (Label) | نوع عنصر الواجهة | الربط بقاعدة البيانات (DB Binding) | نوع البيانات والقيود (Type & Constraints) | القيمة الافتراضية | المعادلة / السلوك البرمجي |
|---|---|---|---|---|---|---|
| `Search_Option1` | **حقل / زر البحث** | `RadRadioButton` | - | - | - | - |
| `Windows7Theme1` | **Windows7Theme1** | `Windows7Theme` | - | - | - | - |
| `Save` | **زر حفظ السجل** | `RadButton` | - | - | - | - |
| `Delete` | **زر حذف السجل** | `RadButton` | - | - | - | - |
| `F_Exit` | **F_Exit** | `RadButton` | - | - | - | - |
| `Print` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Add` | **زر إضافة جديد** | `RadButton` | - | - | - | - |
| `Modify` | **زر تعديل السجل** | `RadButton` | - | - | - | - |
| `Search_Txt` | **حقل / زر البحث** | `RadTextBox` | - | - | - | - |
| `GridView` | **GridView** | `RadGridView` | - | - | - | - |
| `Note_No` | **رقم الحركة / السند** | `RadTextBox` | `Payable_Head.Note_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Payable_Head.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Payable_Head.Entry_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `Note_Date` | **تاريخ الحركة** | `RadDateTimePicker` | `Payable_Head.Note_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Actual_Credit_Amount` | **المبلغ دائن** | `RadTextBox` | `Payable_Head.Amount` | `float` (NOT NULL) | `((0))` | - |
| `Debit_Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Payable_Details.Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `RadTextBox` | `Payable_Head.Note_Net_Text` | `nvarchar(300)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `RadPanel7` | **RadPanel7** | `RadPanel` | - | - | - | - |
| `Credit_Description` | **المبلغ دائن** | `RadTextBox` | `Payable_Head.Description` | `nvarchar(300)` (NOT NULL) | `(' ')` | - |
| `Credit_Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Payable_Details.Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Debit_Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Credit_Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Account_Balance` | **الرصيد / الفارق** | `RadTextBox` | `Payable_Head.Account_Balance` | `float` (NOT NULL) | `((0))` | `Balance = Previous_Balance + Debit - Credit` |
| `Label19` | **Label19** | `Label` | - | - | - | - |
| `Add_Transaction` | **زر إضافة جديد** | `RadButton` | - | - | - | - |
| `Transaction_Actual_Debit` | **المبلغ مدين** | `RadTextBox` | `Payable_Details.Actual_Debit` | `float` (NOT NULL) | `((0))` | - |
| `Debit_Description` | **المبلغ مدين** | `RadTextBox` | `Payable_Head.Description` | `nvarchar(300)` (NOT NULL) | `(' ')` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `Debit_Amount` | **المبلغ مدين** | `RadTextBox` | `Payable_Head.Amount` | `float` (NOT NULL) | `((0))` | - |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Label7` | **Label7** | `Label` | - | - | - | - |
| `Credit_Analyse1` | **المبلغ دائن** | `RadTextBox` | `Payable_Details.Analyse1` | `nvarchar(200)` (NOT NULL) | `((0))` | - |
| `Label18` | **Label18** | `Label` | - | - | - | - |
| `Label21` | **Label21** | `Label` | - | - | - | - |
| `Label22` | **Label22** | `Label` | - | - | - | - |
| `Label23` | **Label23** | `Label` | - | - | - | - |
| `Label24` | **Label24** | `Label` | - | - | - | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Label15` | **Label15** | `Label` | - | - | - | - |
| `Label17` | **Label17** | `Label` | - | - | - | - |
| `Label20` | **Label20** | `Label` | - | - | - | - |
| `Costcenter_Name_A` | **اسم مركز التكلفة** | `RadTextBox` | - | - | - | - |
| `Costcenter_ID` | **كود مركز التكلفة** | `RadTextBox` | `Payable_Details.Costcenter_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Debit_Analyse1` | **المبلغ مدين** | `RadTextBox` | `Payable_Details.Analyse1` | `nvarchar(200)` (NOT NULL) | `((0))` | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Previous_Balance` | **الرصيد / الفارق** | `Label` | `Payable_Head.Previous_Balance` | `float` (NOT NULL) | `((0))` | `Balance = Previous_Balance + Debit - Credit` |
| `Costcenters_GridView` | **Costcenters_GridView** | `RadGridView` | - | - | - | - |
| `Debit_Analyse2` | **المبلغ مدين** | `RadTextBox` | `Payable_Details.Analyse2` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Credit_Analyse2` | **المبلغ دائن** | `RadTextBox` | `Payable_Details.Analyse2` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Currency_Name_A` | **اسم العملة** | `RadTextBox` | - | - | - | - |
| `Exchange` | **سعر الصرف** | `RadTextBox` | `Payable_Details.Exchange` | `float` (NOT NULL) | `((1))` | - |
| `Label10` | **Label10** | `Label` | - | - | - | - |
| `Label11` | **Label11** | `Label` | - | - | - | - |
| `Currency_ID` | **كود العملة** | `RadTextBox` | `Payable_Details.Currency_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Credit_Amount` | **المبلغ دائن** | `RadTextBox` | `Payable_Head.Amount` | `float` (NOT NULL) | `((0))` | - |
| `Debit_Currency_Name_A` | **اسم العملة** | `RadTextBox` | - | - | - | - |
| `Debit_Exchange` | **سعر الصرف** | `RadTextBox` | `Payable_Details.Exchange` | `float` (NOT NULL) | `((1))` | - |
| `Label26` | **Label26** | `Label` | - | - | - | - |
| `Label27` | **Label27** | `Label` | - | - | - | - |
| `Debit_Currency_ID` | **كود العملة** | `RadTextBox` | `Payable_Details.Currency_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `Label25` | **Label25** | `Label` | - | - | - | - |
| `Transaction_Debit` | **المبلغ مدين** | `RadTextBox` | `Payable_Details.Debit` | `float` (NOT NULL) | `((0))` | - |
| `Analysis_Name_A` | **اسم الحساب التحليلي** | `RadTextBox` | - | - | - | - |
| `Analysis_ID` | **كود الحساب التحليلي** | `RadTextBox` | `Payable_Details.Analysis_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label12` | **Label12** | `Label` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Adjustment_GridView` | **Adjustment_GridView** | `RadGridView` | - | - | - | - |
| `Currency_GridView` | **Currency_GridView** | `RadGridView` | - | - | - | - |
| `Analysis_GridView` | **Analysis_GridView** | `RadGridView` | - | - | - | - |
| `Level4_GridView` | **Level4_GridView** | `RadGridView` | - | - | - | - |
| `Print_Journal` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `RadButton1` | **RadButton1** | `RadButton` | - | - | - | - |
| `RadButton2` | **RadButton2** | `RadButton` | - | - | - | - |
| `Label8` | **Label8** | `Label` | - | - | - | - |
| `Flag` | **حالة الاعتماد / التأكيد** | `RadCheckBox` | `Payable_Head.Flag` | `bit` (NOT NULL) | `((0))` | - |
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الحساب 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الحساب 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال دائـن 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الحسـاب التحليلـي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسم الحسـاب التحليلـي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم مركز التكلفة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسم مركز التكلفة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم العُملـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم النقديــة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال المبلـغ 
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لطباعة سـند صرف نقدية لحساب واحد يجب إدراج حركة واحدة فقط في السـند  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Calculation]** حساب تلقائي لحقل الصافي تفقيطاً (كتابة بالكلمات): Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
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
Select * FROM Currencies Where Currency_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Module_Type=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Module_Type=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Payable_Head_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Payable_Details_View Where Note_No=
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
Select * FROM Payable_Head_View Order By Note_No DESC
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
Select top 1 Note_No FROM Payable_Head Order By Note_No Desc
```
##### استعلام INSERT على جدول `Payable_Head`:
```sql
Insert Into Payable_Head(Note_No,Note_Date,Description,Note_Debit,Note_Credit,Note_Net_Text,Previous_Balance,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Payable_Details`:
```sql
Insert Into Payable_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Analysis_ID,Costcenter_ID,Analyse1,Analyse2,Flag)Values(
```
##### استعلام INSERT على جدول `Payable_Details`:
```sql
Insert Into Payable_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Analyse1,Analyse2)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Payable_Head Where Note_No=
```
##### استعلام UPDATE على جدول `Payable_Head`:
```sql
Update Payable_Head Set Note_No=
```
##### استعلام DELETE على جدول `Payable_Details`:
```sql
Delete From Payable_Details Where Note_No=
```
##### استعلام INSERT على جدول `Payable_Details`:
```sql
Insert Into Payable_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Analysis_ID,Costcenter_ID,Analyse1,Analyse2,Flag)Values(
```
##### استعلام INSERT على جدول `Payable_Details`:
```sql
Insert Into Payable_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Analyse1,Analyse2)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Payable_Head Where Note_No=
```
##### استعلام DELETE على جدول `Payable_Head`:
```sql
Delete From Payable_Head where Note_No=
```
##### استعلام DELETE على جدول `Payable_Details`:
```sql
Delete From Payable_Details where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Payable_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Payable_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Payable_Head_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Module_Type>
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
Select * FROM Level5_View Where Level5_ID=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Analysis_GridView_KeyDown, Analysis_ID_GotFocus, Analysis_Name_A_GotFocus, Analysis_Name_A_KeyDown, Analysis_Name_A_LostFocus, Analysis_ID_KeyDown, Analysis_ID_KeyPress, Analysis_ID_LostFocus, Debit_Currency_ID_GotFocus, Debit_Currency_Name_A_GotFocus, Debit_Currency_Name_A_KeyDown, Debit_Currency_Name_A_LostFocus, Debit_Currency_ID_KeyDown, Debit_Currency_ID_KeyPress, Debit_Currency_ID_LostFocus, Debit_Exchange_GotFocus, Debit_Exchange_KeyDown, Debit_Exchange_KeyPress, Debit_Exchange_LostFocus, Flag_KeyDown, Adjustment_GridView_DoubleClick, Adjustment_GridView_KeyDown, Print_Journal_Click, Print_Journal_KeyDown, RadButton2_Click, RadButton1_Click, Debit_Level5_Name_A_KeyDown, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, Credit_Amount_GotFocus, Credit_Amount_KeyDown, Credit_Amount_KeyPress, Credit_Description_KeyPress, Credit_Level5_ID_GotFocus, Credit_Level5_ID_KeyDown, Debit_Analyse1_GotFocus, Debit_Analyse1_KeyDown, Debit_Analyse1_KeyPress, Debit_Analyse2_GotFocus, Debit_Analyse2_KeyDown, Description_GotFocus, Description_KeyDown, Credit_Level5_Name_A_GotFocus, Credit_Level5_Name_A_KeyDown, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, Account_Balance_GotFocus, Note_Balance_KeyDown, Credit_Level5_ID_KeyPress, Add_Transaction_Click, Add_Transaction_KeyDown, Transaction_Credit_GotFocus, Transaction_Credit_KeyDown1, Transaction_Credit_KeyPress1, Credit_Description_GotFocus, Credit_Description_KeyDown, Debit_Description_KeyPress, Search_Txt_LostFocus, Note_No_KeyPress, Note_No_LostFocus, Note_Net_Text_LostFocus, Credit_Level5_Name_A_LostFocus, Credit_Level5_ID_LostFocus, Credit_Analyse1_GotFocus, Credit_Analyse1_KeyDown, Credit_Analyse1_KeyPress, Credit_Analyse1_LostFocus, Debit_Level5_Name_A_LostFocus, Debit_Level5_ID_LostFocus, Debit_Description_LostFocus, Amount_LostFocus, Account_Balance_LostFocus, Transaction_Debit_LostFocus, Description_LostFocus, Credit_Analyse2_GotFocus, Credit_Analyse2_KeyDown, Debit_Amount_GotFocus, Debit_Amount_KeyDown, Costcenter_ID_GotFocus, Costcenter_Name_A_GotFocus, Costcenter_Name_A_KeyDown, Costcenter_Name_A_LostFocus, Costcenter_ID_KeyDown, Costcenter_ID_KeyPress, Costcenter_ID_LostFocus, Debit_Analyse1_LostFocus, Costcenters_GridView_CellClick, Costcenters_GridView_CellFormatting, Costcenters_GridView_KeyDown, Debit_Amount_LostFocus, Debit_Analyse2_KeyPress, Debit_Analyse2_LostFocus, Credit_Analyse2_KeyPress, Credit_Analyse2_LostFocus, Currency_ID_GotFocus, Currency_Name_A_GotFocus, Currency_Name_A_KeyDown, Currency_Name_A_LostFocus, Currency_ID_KeyDown, Currency_ID_KeyPress, Currency_ID_LostFocus, Currency_GridView_CellClick, Currency_GridView_CellFormatting, Currency_GridView_KeyDown, Exchange_GotFocus, Exchange_KeyDown, Exchange_KeyPress, Exchange_LostFocus, Analysis_GridView_CellClick, Analysis_GridView_CellFormatting, set_Credit_Analyse2, get_Currency_Name_A, set_Currency_Name_A, get_Exchange, set_Exchange, get_Label10, set_Label10, get_Label11, set_Label11, get_Currency_ID, set_Currency_ID, get_Label4, set_Label4, get_Credit_Amount, set_Credit_Amount, get_Debit_Currency_Name_A, set_Debit_Currency_Name_A, get_Debit_Exchange, set_Debit_Exchange, get_Label26, set_Label26, get_Label27, set_Label27, get_Debit_Currency_ID, set_Debit_Currency_ID, get_Label25, set_Label25, get_Transaction_Debit, set_Transaction_Debit, get_Analysis_Name_A, set_Analysis_Name_A, get_Analysis_ID, set_Analysis_ID, get_Label12, set_Label12, get_Label13, set_Label13, get_Adjustment_GridView, set_Adjustment_GridView, get_Currency_GridView, set_Currency_GridView, get_Analysis_GridView, set_Analysis_GridView, get_Level4_GridView, set_Level4_GridView, get_Print_Journal, set_Print_Journal, get_RadButton1, set_RadButton1, get_RadButton2, set_RadButton2, get_Label8, set_Label8, get_Flag, set_Flag, Clear_Record, Clear_Data, Fill_Grid, Fill_Level5_Grid, Fill_Costcenters_Grid, Fill_Analysis_Grid, Fill_Currencies_Grid, Lock_Control, Enable_Control, Review_Record, Find_Total, Payable_Form_KeyDown, Payable_Form_Load, Payable_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Option2_Click, Search_Option2_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Note_No_GotFocus, Note_No_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Note_Date_GotFocus, Note_Date_KeyDown, Note_Date_KeyPress, Note_Date_Opened, Note_Date_ValueChanged, Debit_Level5_ID_GotFocus, Debit_Level5_ID_KeyDown, Debit_Level5_ID_KeyPress, Debit_Level5_Name_A_GotFocus, Dispose, InitializeComponent, get_Search_Option1, set_Search_Option1, get_Windows7Theme1, set_Windows7Theme1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_Note_No, set_Note_No, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_Note_Date, set_Note_Date, get_Actual_Credit_Amount, set_Actual_Credit_Amount, get_Debit_Level5_ID, set_Debit_Level5_ID, get_Level5_GridView, set_Level5_GridView, get_Note_Net_Text, set_Note_Net_Text, get_AquaTheme1, set_AquaTheme1, get_RadPanel7, set_RadPanel7, get_Credit_Description, set_Credit_Description, get_Credit_Level5_ID, set_Credit_Level5_ID, get_Debit_Level5_Name_A, set_Debit_Level5_Name_A, get_Credit_Level5_Name_A, set_Credit_Level5_Name_A, get_Account_Balance, set_Account_Balance, get_Label19, set_Label19, get_Add_Transaction, set_Add_Transaction, get_Transaction_Actual_Debit, set_Transaction_Actual_Debit, get_Debit_Description, set_Debit_Description, get_RadLabel8, set_RadLabel8, get_Debit_Amount, set_Debit_Amount, get_Label5, set_Label5, get_Label6, set_Label6, get_Label7, set_Label7, get_Credit_Analyse1, set_Credit_Analyse1, get_Label18, set_Label18, get_Label21, set_Label21, get_Label22, set_Label22, get_Label23, set_Label23, get_Label24, set_Label24, get_Label1, set_Label1, get_Label2, set_Label2, get_Label9, set_Label9, get_Label14, set_Label14, get_Label15, set_Label15, get_Label17, set_Label17, get_Label20, set_Label20, get_Costcenter_Name_A, set_Costcenter_Name_A, get_Costcenter_ID, set_Costcenter_ID, get_Debit_Analyse1, set_Debit_Analyse1, get_Label3, set_Label3, get_Previous_Balance, set_Previous_Balance, get_Costcenters_GridView, set_Costcenters_GridView, get_Debit_Analyse2, set_Debit_Analyse2, get_Credit_Analyse2
```

---

### 3.2 شاشة: سندات قبض النقدية والخزائن (`Receivable_Form`)
- **الاسم الإنجليزي:** Cash & Bank Receipt Vouchers
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** إصدار سندات استلام وقبض النقدية من العملاء والإيرادات المتنوعة وتوجيهها محاسبياً
- **جداول قاعدة البيانات المستهدفة:** `Receivable_Head`, `Receivable_Details`

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
| `Note_No` | **رقم الحركة / السند** | `RadTextBox` | `Receivable_Head.Note_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Receivable_Head.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Receivable_Head.Entry_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `Note_Date` | **تاريخ الحركة** | `RadDateTimePicker` | `Receivable_Head.Note_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Actual_Debit_Amount` | **المبلغ مدين** | `RadTextBox` | `Receivable_Head.Amount` | `float` (NOT NULL) | `((0))` | - |
| `Credit_Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Receivable_Details.Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `RadTextBox` | `Receivable_Head.Note_Net_Text` | `nvarchar(300)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `RadPanel7` | **RadPanel7** | `RadPanel` | - | - | - | - |
| `Debit_Description` | **المبلغ مدين** | `RadTextBox` | `Receivable_Head.Description` | `nvarchar(300)` (NOT NULL) | `(' ')` | - |
| `Debit_Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Receivable_Details.Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Credit_Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Debit_Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Adjustment_GridView` | **Adjustment_GridView** | `RadGridView` | - | - | - | - |
| `Account_Balance` | **الرصيد / الفارق** | `RadTextBox` | `Receivable_Head.Account_Balance` | `float` (NOT NULL) | `((0))` | `Balance = Previous_Balance + Debit - Credit` |
| `Label19` | **Label19** | `Label` | - | - | - | - |
| `Add_Transaction` | **زر إضافة جديد** | `RadButton` | - | - | - | - |
| `Transaction_Actual_Credit` | **المبلغ دائن** | `RadTextBox` | `Receivable_Details.Actual_Credit` | `float` (NOT NULL) | `((0))` | - |
| `Credit_Description` | **المبلغ دائن** | `RadTextBox` | `Receivable_Head.Description` | `nvarchar(300)` (NOT NULL) | `(' ')` | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `Credit_Amount` | **المبلغ دائن** | `RadTextBox` | `Receivable_Head.Amount` | `float` (NOT NULL) | `((0))` | - |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Label7` | **Label7** | `Label` | - | - | - | - |
| `Debit_Analyse1` | **المبلغ مدين** | `RadTextBox` | `Receivable_Details.Analyse1` | `nvarchar(200)` (NOT NULL) | `((0))` | - |
| `Label18` | **Label18** | `Label` | - | - | - | - |
| `Label21` | **Label21** | `Label` | - | - | - | - |
| `Label22` | **Label22** | `Label` | - | - | - | - |
| `Label23` | **Label23** | `Label` | - | - | - | - |
| `Label24` | **Label24** | `Label` | - | - | - | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Label15` | **Label15** | `Label` | - | - | - | - |
| `Label16` | **Label16** | `Label` | - | - | - | - |
| `Label20` | **Label20** | `Label` | - | - | - | - |
| `Costcenter_Name_A` | **اسم مركز التكلفة** | `RadTextBox` | - | - | - | - |
| `Costcenter_ID` | **كود مركز التكلفة** | `RadTextBox` | `Receivable_Details.Costcenter_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Credit_Analyse1` | **المبلغ دائن** | `RadTextBox` | `Receivable_Details.Analyse1` | `nvarchar(200)` (NOT NULL) | `((0))` | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Costcenters_GridView` | **Costcenters_GridView** | `RadGridView` | - | - | - | - |
| `Credit_Analyse2` | **المبلغ دائن** | `RadTextBox` | `Receivable_Details.Analyse2` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Debit_Analyse2` | **المبلغ مدين** | `RadTextBox` | `Receivable_Details.Analyse2` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Label25` | **Label25** | `Label` | - | - | - | - |
| `Transaction_Credit` | **المبلغ دائن** | `RadTextBox` | `Receivable_Details.Credit` | `float` (NOT NULL) | `((0))` | - |
| `Analysis_Name_A` | **اسم الحساب التحليلي** | `RadTextBox` | - | - | - | - |
| `Analysis_ID` | **كود الحساب التحليلي** | `RadTextBox` | `Receivable_Details.Analysis_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label12` | **Label12** | `Label` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Debit_Amount` | **المبلغ مدين** | `RadTextBox` | `Receivable_Head.Amount` | `float` (NOT NULL) | `((0))` | - |
| `Exchange` | **سعر الصرف** | `RadTextBox` | `Receivable_Details.Exchange` | `float` (NOT NULL) | `((1))` | - |
| `Label10` | **Label10** | `Label` | - | - | - | - |
| `Label11` | **Label11** | `Label` | - | - | - | - |
| `Currency_ID` | **كود العملة** | `RadTextBox` | `Receivable_Details.Currency_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `Currency_Name_A` | **اسم العملة** | `RadTextBox` | - | - | - | - |
| `Currency_GridView` | **Currency_GridView** | `RadGridView` | - | - | - | - |
| `Analysis_GridView` | **Analysis_GridView** | `RadGridView` | - | - | - | - |
| `Debit_Level4_ID` | **كود الحساب المستوى 4** | `RadTextBox` | - | - | - | - |
| `Credit_Currency_Name_A` | **اسم العملة** | `RadTextBox` | - | - | - | - |
| `Credit_Exchange` | **سعر الصرف** | `RadTextBox` | `Receivable_Details.Exchange` | `float` (NOT NULL) | `((1))` | - |
| `Label26` | **Label26** | `Label` | - | - | - | - |
| `Label27` | **Label27** | `Label` | - | - | - | - |
| `Credit_Currency_ID` | **كود العملة** | `RadTextBox` | `Receivable_Details.Currency_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `Previous_Balance` | **الرصيد / الفارق** | `Label` | `Receivable_Head.Previous_Balance` | `float` (NOT NULL) | `((0))` | `Balance = Previous_Balance + Debit - Credit` |
| `Print_Journal` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `RadButton1` | **RadButton1** | `RadButton` | - | - | - | - |
| `RadButton2` | **RadButton2** | `RadButton` | - | - | - | - |
| `Adjustment_GridView1` | **Adjustment_GridView1** | `RadGridView` | - | - | - | - |
| `Add_Payments` | **زر إضافة جديد** | `RadButton` | - | - | - | - |
| `Credit_Amount1` | **المبلغ دائن** | `RadTextBox` | - | - | - | - |
| `CLient_Name1` | **CLient_Name1** | `Label` | - | - | - | - |
| `Balance_Adap` | **الرصيد / الفارق** | `SqlDataAdapter` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Adap_Print` | **زر طباعة التقرير / السند** | `SqlDataAdapter` | - | - | - | - |
| `Adap_H` | **Adap_H** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D` | **Adap_D** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D_V` | **Adap_D_V** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D_V1` | **Adap_D_V1** | `SqlDataAdapter` | - | - | - | - |
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
| `RRS_D_V1` | **RRS_D_V1** | `DataSet` | - | - | - | - |
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الحساب 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسـم الحساب 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال مديـن 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الحسـاب التحليلـي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسم الحسـاب التحليلـي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم مركز التكلفة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال اسم مركز التكلفة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم العُملـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم النقديــة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال المبلـغ 
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لطباعة سـند إسـتلام نقدية لحساب واحد يجب إدراج حركة واحدة فقط في السـند  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Calculation]** حساب تلقائي لحقل الصافي تفقيطاً (كتابة بالكلمات): Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
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
Select * FROM Currencies Where Currency_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Sales_By_Payments_View Where Client_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Module_Type>
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Module_Type>
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Receivable_Head_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Receivable_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Sales_Payment Where Note_No=
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
Select * FROM Receivable_Head_View Order By Note_No DESC
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
Select top 1 Note_No FROM Receivable_Head Order By Note_No Desc
```
##### استعلام INSERT على جدول `Receivable_Head`:
```sql
Insert Into Receivable_Head(Note_No,Note_Date,Description,Note_Debit,Note_Credit,Note_Net_Text,Previous_Balance,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Receivable_Details`:
```sql
Insert Into Receivable_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Analysis_ID,Costcenter_ID,Analyse1,Analyse2)Values(
```
##### استعلام INSERT على جدول `Receivable_Details`:
```sql
Insert Into Receivable_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Analyse1,Analyse2)Values(
```
##### استعلام INSERT على جدول `Receivable_Head`:
```sql
Insert Into Sales_Payment(Note_No,Note_Type_ID,Note_Type_Name_A,Sales_Note_No,Note_Net_With_Tax,Previous_Payed,Payed,Note_Payed,Note_Balance)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Receivable_Head Where Note_No=
```
##### استعلام UPDATE على جدول `Receivable_Head`:
```sql
Update Receivable_Head Set Note_No=
```
##### استعلام DELETE على جدول `Receivable_Details`:
```sql
Delete From Receivable_Details Where Note_No=
```
##### استعلام INSERT على جدول `Receivable_Details`:
```sql
Insert Into Receivable_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Analysis_ID,Costcenter_ID,Analyse1,Analyse2)Values(
```
##### استعلام INSERT على جدول `Receivable_Details`:
```sql
Insert Into Receivable_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Analyse1,Analyse2)Values(
```
##### استعلام DELETE على جدول `Receivable_Head`:
```sql
Delete From Sales_Payment Where Note_No=
```
##### استعلام INSERT على جدول `Receivable_Head`:
```sql
Insert Into Sales_Payment(Note_No,Note_Type_ID,Note_Type_Name_A,Sales_Note_No,Note_Net_With_Tax,Previous_Payed,Payed,Note_Payed,Note_Balance)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Receivable_Head Where Note_No=
```
##### استعلام DELETE على جدول `Receivable_Head`:
```sql
Delete From Receivable_Head where Note_No=
```
##### استعلام DELETE على جدول `Receivable_Details`:
```sql
Delete From Receivable_Details where Note_No=
```
##### استعلام DELETE على جدول `Receivable_Head`:
```sql
Delete From Sales_Payment Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Receivable_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Sales_Payment Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Receivable_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Sales_Payment Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Receivable_Head_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Module_Type>
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

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Exchange_GotFocus, Exchange_KeyDown, Exchange_KeyPress, Exchange_LostFocus, Debit_Amount_GotFocus, Debit_Amount_KeyDown, Debit_Amount_LostFocus, Analysis_ID_GotFocus, Analysis_Name_A_GotFocus, Analysis_Name_A_KeyDown, Analysis_Name_A_LostFocus, Analysis_ID_KeyDown, Analysis_ID_KeyPress, Analysis_ID_LostFocus, Credit_Currency_ID_GotFocus, Credit_Currency_Name_A_GotFocus, Credit_Currency_Name_A_KeyDown, Credit_Currency_Name_A_LostFocus, Credit_Currency_ID_KeyDown, Credit_Currency_ID_KeyPress, Credit_Currency_ID_LostFocus, Credit_Exchange_GotFocus, Credit_Exchange_KeyDown, Credit_Exchange_KeyPress, Credit_Exchange_LostFocus, Analysis_GridView_CellClick, Analysis_GridView_CellFormatting, Analysis_GridView_KeyDown, Adjustment_GridView_DoubleClick, Adjustment_GridView_KeyDown, Print_Journal_Click, Print_Journal_KeyDown, RadButton2_Click, RadButton1_Click, Add_Payments_Click, Add_Payments_KeyDown, Note_Date_Opened, Note_Date_ValueChanged, Credit_Level5_ID_GotFocus, Credit_Level5_ID_KeyDown, Credit_Level5_ID_KeyPress, Credit_Level5_Name_A_GotFocus, Credit_Level5_Name_A_KeyDown, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, Actual_Debit_Amount_GotFocus, Actual_Debit_Amount_KeyDown, Actual_Debit_Amount_KeyPress, Debit_Description_KeyPress, Debit_Level5_ID_GotFocus, Debit_Level5_ID_KeyDown, Credit_Analyse1_GotFocus, Credit_Analyse1_KeyDown, Credit_Analyse1_KeyPress, Credit_Analyse2_GotFocus, Credit_Analyse2_KeyDown, Debit_Description_GotFocus, Debit_Description_KeyDown, Debit_Level5_Name_A_GotFocus, Debit_Level5_Name_A_KeyDown, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, Account_Balance_GotFocus, Note_Balance_KeyDown, Debit_Level5_ID_KeyPress, Add_Transaction_Click, Add_Transaction_KeyDown, Transaction_Actual_Credit_GotFocus, Transaction_Actual_Credit_KeyDown, Transaction_Actual_Credit_KeyPress, Credit_Description_GotFocus, Credit_Description_KeyDown, Credit_Description_KeyPress, Search_Txt_LostFocus, Note_No_KeyPress, Note_No_LostFocus, Note_Net_Text_LostFocus, Debit_Level5_Name_A_LostFocus, Debit_Level5_ID_LostFocus, Debit_Analyse1_GotFocus, Debit_Analyse1_KeyDown, Debit_Analyse1_KeyPress, Debit_Analyse1_LostFocus, Credit_Level5_Name_A_LostFocus, Credit_Level5_ID_LostFocus, Credit_Description_LostFocus, Actual_Debit_Amount_LostFocus, Account_Balance_LostFocus, Transaction_Credit_LostFocus, Debit_Description_LostFocus, Debit_Analyse2_GotFocus, Debit_Analyse2_KeyDown, Credit_Amount_GotFocus, Credit_Amount_KeyDown, Costcenter_ID_GotFocus, Costcenter_Name_A_GotFocus, Costcenter_Name_A_KeyDown, Costcenter_Name_A_LostFocus, Costcenter_ID_KeyDown, Costcenter_ID_KeyPress, Costcenter_ID_LostFocus, Credit_Analyse1_LostFocus, Costcenters_GridView_CellClick, Costcenters_GridView_CellFormatting, Costcenters_GridView_KeyDown, Credit_Amount_LostFocus, Credit_Analyse2_KeyPress, Credit_Analyse2_LostFocus, Debit_Analyse2_KeyPress, Debit_Analyse2_LostFocus, Currency_ID_GotFocus, Currency_Name_A_GotFocus, Currency_Name_A_KeyDown, Currency_Name_A_LostFocus, Currency_ID_KeyDown, Currency_ID_KeyPress, Currency_ID_LostFocus, Currency_GridView_CellClick, Currency_GridView_CellFormatting, Currency_GridView_KeyDown, set_Debit_Analyse2, get_Label25, set_Label25, get_Transaction_Credit, set_Transaction_Credit, get_Analysis_Name_A, set_Analysis_Name_A, get_Analysis_ID, set_Analysis_ID, get_Label12, set_Label12, get_Label13, set_Label13, get_Label4, set_Label4, get_Debit_Amount, set_Debit_Amount, get_Exchange, set_Exchange, get_Label10, set_Label10, get_Label11, set_Label11, get_Currency_ID, set_Currency_ID, get_Currency_Name_A, set_Currency_Name_A, get_Currency_GridView, set_Currency_GridView, get_Analysis_GridView, set_Analysis_GridView, get_Debit_Level4_ID, set_Debit_Level4_ID, get_Credit_Currency_Name_A, set_Credit_Currency_Name_A, get_Credit_Exchange, set_Credit_Exchange, get_Label26, set_Label26, get_Label27, set_Label27, get_Credit_Currency_ID, set_Credit_Currency_ID, get_Previous_Balance, set_Previous_Balance, get_Print_Journal, set_Print_Journal, get_RadButton1, set_RadButton1, get_RadButton2, set_RadButton2, get_TabControl1, set_TabControl1, get_TabPage1, set_TabPage1, get_TabPage2, set_TabPage2, get_Adjustment_GridView1, set_Adjustment_GridView1, get_Add_Payments, set_Add_Payments, get_Credit_Amount1, set_Credit_Amount1, get_CLient_Name1, set_CLient_Name1, Clear_Record, Clear_Data, Fill_Grid, Fill_Level5_Grid, Fill_Analysis_Grid, Fill_Costcenters_Grid, Fill_Currencies_Grid, Lock_Control, Enable_Control, Review_Record, Find_Total, Receivable_Form_KeyDown, Receivable_Form_Load, Receivable_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Option1_Click, Search_Option1_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Note_No_GotFocus, Note_No_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Note_Date_GotFocus, Note_Date_KeyDown, Note_Date_KeyPress, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_Search_Option1, set_Search_Option1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_Note_No, set_Note_No, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_Note_Date, set_Note_Date, get_Actual_Debit_Amount, set_Actual_Debit_Amount, get_Credit_Level5_ID, set_Credit_Level5_ID, get_Level5_GridView, set_Level5_GridView, get_Note_Net_Text, set_Note_Net_Text, get_AquaTheme1, set_AquaTheme1, get_RadPanel7, set_RadPanel7, get_Debit_Description, set_Debit_Description, get_Debit_Level5_ID, set_Debit_Level5_ID, get_Credit_Level5_Name_A, set_Credit_Level5_Name_A, get_Debit_Level5_Name_A, set_Debit_Level5_Name_A, get_Adjustment_GridView, set_Adjustment_GridView, get_Account_Balance, set_Account_Balance, get_Label19, set_Label19, get_Add_Transaction, set_Add_Transaction, get_Transaction_Actual_Credit, set_Transaction_Actual_Credit, get_Credit_Description, set_Credit_Description, get_RadLabel8, set_RadLabel8, get_Credit_Amount, set_Credit_Amount, get_Label5, set_Label5, get_Label6, set_Label6, get_Label7, set_Label7, get_Debit_Analyse1, set_Debit_Analyse1, get_Label18, set_Label18, get_Label21, set_Label21, get_Label22, set_Label22, get_Label23, set_Label23, get_Label24, set_Label24, get_Label1, set_Label1, get_Label2, set_Label2, get_Label9, set_Label9, get_Label14, set_Label14, get_Label15, set_Label15, get_Label16, set_Label16, get_Label20, set_Label20, get_Costcenter_Name_A, set_Costcenter_Name_A, get_Costcenter_ID, set_Costcenter_ID, get_Credit_Analyse1, set_Credit_Analyse1, get_Label3, set_Label3, get_Costcenters_GridView, set_Costcenters_GridView, get_Credit_Analyse2, set_Credit_Analyse2, get_Debit_Analyse2
```

---

### 3.3 شاشة: التحويلات البنكية الصادرة (`Banks_Transfer_Issue_Form`)
- **الاسم الإنجليزي:** Outgoing Bank Transfers
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** إدارة عمليات التحويل البنكي الصادر بين حسابات الشركة البنكية أو للمستفيدين
- **جداول قاعدة البيانات المستهدفة:** `Banks_Transfers_Issue_Head`, `Banks_Transfers_Issue_Details`

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
| `Note_No` | **رقم الحركة / السند** | `RadTextBox` | `Banks_Transfers_Issue_Head.Note_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Banks_Transfers_Issue_Head.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Banks_Transfers_Issue_Head.Entry_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `Note_Date` | **تاريخ الحركة** | `RadDateTimePicker` | `Banks_Transfers_Issue_Head.Note_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `RadTextBox` | `Banks_Transfers_Issue_Head.Note_Net_Text` | `nvarchar(300)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `RadPanel7` | **RadPanel7** | `RadPanel` | - | - | - | - |
| `Description` | **البيان / الشرح** | `RadTextBox` | `Banks_Transfers_Issue_Head.Description` | `nvarchar(300)` (NOT NULL) | `(' ')` | - |
| `Debit_Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Banks_Transfers_Issue_Details.Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Debit_Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Actual_Amount` | **Actual_Amount** | `RadTextBox` | - | - | - | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Label7` | **Label7** | `Label` | - | - | - | - |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Label16` | **Label16** | `Label` | - | - | - | - |
| `Label20` | **Label20** | `Label` | - | - | - | - |
| `Costcenter_Name_A` | **اسم مركز التكلفة** | `RadTextBox` | - | - | - | - |
| `Costcenter_ID` | **كود مركز التكلفة** | `RadTextBox` | `Banks_Transfers_Issue_Details.Costcenter_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Bank_Name` | **البنك المسحوب عليه** | `RadTextBox` | `Banks_Transfers_Issue_Details.Bank_Name` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Costcenters_GridView` | **Costcenters_GridView** | `RadGridView` | - | - | - | - |
| `Label25` | **Label25** | `Label` | - | - | - | - |
| `Amount` | **Amount** | `RadTextBox` | - | - | - | - |
| `Transfer_No` | **Transfer_No** | `RadTextBox` | `Banks_Transfers_Issue_Details.Transfer_No` | `nvarchar(20)` (NOT NULL) | `(' ')` | - |
| `Label12` | **Label12** | `Label` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Currency_GridView` | **Currency_GridView** | `RadGridView` | - | - | - | - |
| `Debit_Level4_ID` | **كود الحساب المستوى 4** | `RadTextBox` | - | - | - | - |
| `Currency_Name_A` | **اسم العملة** | `RadTextBox` | - | - | - | - |
| `Exchange` | **سعر الصرف** | `RadTextBox` | `Banks_Transfers_Issue_Details.Exchange` | `float` (NOT NULL) | `((1))` | - |
| `Label26` | **Label26** | `Label` | - | - | - | - |
| `Label27` | **Label27** | `Label` | - | - | - | - |
| `Currency_ID` | **كود العملة** | `RadTextBox` | `Banks_Transfers_Issue_Details.Currency_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Print_Journal` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Transfer_Date` | **Transfer_Date** | `RadDateTimePicker` | `Banks_Transfers_Issue_Details.Transfer_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Client_Name_A` | **اسم العميل** | `RadTextBox` | - | - | - | - |
| `Client_ID` | **كود العميل** | `RadTextBox` | - | - | - | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Label21` | **Label21** | `Label` | - | - | - | - |
| `Label22` | **Label22** | `Label` | - | - | - | - |
| `Analysis_Name_A` | **اسم الحساب التحليلي** | `RadTextBox` | - | - | - | - |
| `Analysis_ID` | **كود الحساب التحليلي** | `RadTextBox` | `Banks_Transfers_Issue_Details.Analysis_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Analysis_GridView` | **Analysis_GridView** | `RadGridView` | - | - | - | - |
| `Label8` | **Label8** | `Label` | - | - | - | - |
| `Flag` | **حالة الاعتماد / التأكيد** | `RadCheckBox` | `Banks_Transfers_Issue_Head.Flag` | `bit` (NOT NULL) | `((0))` | - |
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الشيك 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم العميـل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم مركز التكلفة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الحساب التحليلي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم العُملـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم العُملـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال المبلـغ 
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Calculation]** حساب تلقائي لحقل الصافي تفقيطاً (كتابة بالكلمات): Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
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
Select * FROM Level5_View Order By Level5_ID Asc
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
Select * FROM Banks_Transfers_Issue_Head_View Order By Note_No DESC
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
Select top 1 Note_No FROM Banks_Transfers_Issue_Head Order By Note_No Desc
```
##### استعلام INSERT على جدول `Banks_Transfers_Issue_Head`:
```sql
Insert Into Banks_Transfers_Issue_Head(Note_No,Note_Date,Description,Note_Debit,Note_Credit,Note_Net_Text,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Banks_Transfers_Issue_Details`:
```sql
Insert Into Banks_Transfers_Issue_Details(Note_No,SR,Level5_ID,Costcenter_ID,Analysis_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Transfer_No,Transfer_Date,Bank_Name,Flag)Values(
```
##### استعلام INSERT على جدول `Banks_Transfers_Issue_Details`:
```sql
Insert Into Banks_Transfers_Issue_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Transfer_No,Transfer_Date,Bank_Name)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Banks_Transfers_Issue_Head Where Note_No=
```
##### استعلام UPDATE على جدول `Banks_Transfers_Issue_Head`:
```sql
Update Banks_Transfers_Issue_Head Set Note_No=
```
##### استعلام DELETE على جدول `Banks_Transfers_Issue_Details`:
```sql
Delete From Banks_Transfers_Issue_Details Where Note_No=
```
##### استعلام INSERT على جدول `Banks_Transfers_Issue_Details`:
```sql
Insert Into Banks_Transfers_Issue_Details(Note_No,SR,Level5_ID,Costcenter_ID,Analysis_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Transfer_No,Transfer_Date,Bank_Name,Flag)Values(
```
##### استعلام INSERT على جدول `Banks_Transfers_Issue_Details`:
```sql
Insert Into Banks_Transfers_Issue_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Transfer_No,Transfer_Date,Bank_Name)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Banks_Transfers_Issue_Head Where Note_No=
```
##### استعلام DELETE على جدول `Banks_Transfers_Issue_Head`:
```sql
Delete From Banks_Transfers_Issue_Head where Note_No=
```
##### استعلام DELETE على جدول `Banks_Transfers_Issue_Details`:
```sql
Delete From Banks_Transfers_Issue_Details where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Banks_Transfers_Issue_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Banks_Transfers_Issue_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Banks_Transfers_Issue_Head_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Module_Type>
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
Select * FROM Level5_View Where Module_Type>
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Module_Type>
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Banks_Transfers_Issue_Head_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Banks_Transfers_Issue_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters_View Where Costcenter_ID=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Bank_Name_LostFocus, Costcenters_GridView_CellClick, Costcenters_GridView_CellFormatting, Costcenters_GridView_KeyDown, Currency_GridView_CellClick, Currency_GridView_CellFormatting, Currency_GridView_KeyDown, Transfer_No_GotFocus, Transfer_No_KeyDown, Transfer_No_KeyPress, Transfer_No_LostFocus, Currency_ID_GotFocus, Currency_Name_A_GotFocus, Currency_Name_A_KeyDown, Currency_Name_A_LostFocus, Currency_ID_KeyDown, Currency_ID_KeyPress, Currency_ID_LostFocus, Exchange_GotFocus, Exchange_KeyDown, Exchange_KeyPress, Exchange_LostFocus, Transfer_Date_Opened, Transfer_Date_ValueChanged, Transfer_Date_KeyDown, Print_Journal_Click, Print_Journal_KeyDown, Client_ID_GotFocus, Client_ID_KeyDown, Client_ID_KeyPress, Client_ID_LostFocus, Analysis_ID_GotFocus, Analysis_Name_A_GotFocus, Analysis_Name_A_KeyDown, Analysis_Name_A_LostFocus, Analysis_ID_KeyDown, Analysis_ID_KeyPress, Analysis_ID_LostFocus, Analysis_GridView_CellClick, Analysis_GridView_CellFormatting, Analysis_GridView_KeyDown, set_Analysis_ID, get_Label4, set_Label4, get_Analysis_GridView, set_Analysis_GridView, get_Label8, set_Label8, get_Flag, set_Flag, Clear_Record, Clear_Data, Fill_Grid, Fill_Level5_Grid, Fill_Costcenters_Grid, Fill_Analysis_Grid, Fill_Currencies_Grid, Lock_Control, Enable_Control, Review_Record, Banks_Transfer_Issue_Form_KeyDown, Banks_Transfer_Issue_Form_Load, Banks_Transfer_Issue_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Option1_Click, Search_Option1_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Note_No_GotFocus, Note_No_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Note_Date_GotFocus, Note_Date_KeyDown, Note_Date_KeyPress, Note_Date_Opened, Note_Date_ValueChanged, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, Description_KeyPress, Debit_Level5_ID_GotFocus, Debit_Level5_ID_KeyDown, Bank_Name_GotFocus, Bank_Name_KeyDown, Bank_Name_KeyPress, Description_GotFocus, Description_KeyDown, Debit_Level5_Name_A_GotFocus, Debit_Level5_Name_A_KeyDown, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, Debit_Level5_ID_KeyPress, Actual_Amount_GotFocus, Actual_Amount_KeyDown, Actual_Amount_KeyPress, Amount_KeyDown, Flag_KeyDown, Search_Txt_LostFocus, Note_No_KeyPress, Note_No_LostFocus, Note_Net_Text_LostFocus, Debit_Level5_Name_A_LostFocus, Debit_Level5_ID_LostFocus, Transaction_Credit_LostFocus, Description_LostFocus, Costcenter_ID_GotFocus, Costcenter_Name_A_GotFocus, Costcenter_Name_A_KeyDown, Costcenter_Name_A_LostFocus, Costcenter_ID_KeyDown, Costcenter_ID_KeyPress, Costcenter_ID_LostFocus, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_Search_Option1, set_Search_Option1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_Note_No, set_Note_No, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_Note_Date, set_Note_Date, get_Level5_GridView, set_Level5_GridView, get_Note_Net_Text, set_Note_Net_Text, get_AquaTheme1, set_AquaTheme1, get_RadPanel7, set_RadPanel7, get_Description, set_Description, get_Debit_Level5_ID, set_Debit_Level5_ID, get_Debit_Level5_Name_A, set_Debit_Level5_Name_A, get_Actual_Amount, set_Actual_Amount, get_RadLabel8, set_RadLabel8, get_Label5, set_Label5, get_Label6, set_Label6, get_Label7, set_Label7, get_Label14, set_Label14, get_Label16, set_Label16, get_Label20, set_Label20, get_Costcenter_Name_A, set_Costcenter_Name_A, get_Costcenter_ID, set_Costcenter_ID, get_Bank_Name, set_Bank_Name, get_Costcenters_GridView, set_Costcenters_GridView, get_Label25, set_Label25, get_Amount, set_Amount, get_Transfer_No, set_Transfer_No, get_Label12, set_Label12, get_Label13, set_Label13, get_Currency_GridView, set_Currency_GridView, get_Debit_Level4_ID, set_Debit_Level4_ID, get_Currency_Name_A, set_Currency_Name_A, get_Exchange, set_Exchange, get_Label26, set_Label26, get_Label27, set_Label27, get_Currency_ID, set_Currency_ID, get_Label1, set_Label1, get_Print_Journal, set_Print_Journal, get_Transfer_Date, set_Transfer_Date, get_Client_Name_A, set_Client_Name_A, get_Client_ID, set_Client_ID, get_Label2, set_Label2, get_Label21, set_Label21, get_Label22, set_Label22, get_Analysis_Name_A, set_Analysis_Name_A, get_Analysis_ID
```

---

### 3.4 شاشة: التحويلات البنكية الواردة (`Banks_Transfer_Delivery_Form`)
- **الاسم الإنجليزي:** Incoming Bank Transfers
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** تسجيل وتأكيد استلام التحويلات البنكية الواردة وإشعار الإضافة البنكي
- **جداول قاعدة البيانات المستهدفة:** `Banks_Transfers_Delivery_Head`, `Banks_Transfers_Delivery_Details`

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
| `Note_No` | **رقم الحركة / السند** | `RadTextBox` | `Banks_Transfers_Delivery_Head.Note_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Banks_Transfers_Delivery_Head.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Banks_Transfers_Delivery_Head.Entry_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `Note_Date` | **تاريخ الحركة** | `RadDateTimePicker` | `Banks_Transfers_Delivery_Head.Note_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `RadTextBox` | `Banks_Transfers_Delivery_Head.Note_Net_Text` | `nvarchar(300)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `RadPanel7` | **RadPanel7** | `RadPanel` | - | - | - | - |
| `Description` | **البيان / الشرح** | `RadTextBox` | `Banks_Transfers_Delivery_Head.Description` | `nvarchar(300)` (NOT NULL) | `(' ')` | - |
| `Debit_Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Banks_Transfers_Delivery_Details.Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Debit_Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Actual_Amount` | **Actual_Amount** | `RadTextBox` | - | - | - | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Label7` | **Label7** | `Label` | - | - | - | - |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Label16` | **Label16** | `Label` | - | - | - | - |
| `Label20` | **Label20** | `Label` | - | - | - | - |
| `Costcenter_Name_A` | **اسم مركز التكلفة** | `RadTextBox` | - | - | - | - |
| `Costcenter_ID` | **كود مركز التكلفة** | `RadTextBox` | `Banks_Transfers_Delivery_Details.Costcenter_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Bank_Name` | **البنك المسحوب عليه** | `RadTextBox` | `Banks_Transfers_Delivery_Details.Bank_Name` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Costcenters_GridView` | **Costcenters_GridView** | `RadGridView` | - | - | - | - |
| `Label25` | **Label25** | `Label` | - | - | - | - |
| `Amount` | **Amount** | `RadTextBox` | - | - | - | - |
| `Transfer_No` | **Transfer_No** | `RadTextBox` | `Banks_Transfers_Delivery_Details.Transfer_No` | `nvarchar(20)` (NOT NULL) | `(' ')` | - |
| `Label12` | **Label12** | `Label` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Currency_GridView` | **Currency_GridView** | `RadGridView` | - | - | - | - |
| `Debit_Level4_ID` | **كود الحساب المستوى 4** | `RadTextBox` | - | - | - | - |
| `Currency_Name_A` | **اسم العملة** | `RadTextBox` | - | - | - | - |
| `Exchange` | **سعر الصرف** | `RadTextBox` | `Banks_Transfers_Delivery_Details.Exchange` | `float` (NOT NULL) | `((1))` | - |
| `Label26` | **Label26** | `Label` | - | - | - | - |
| `Label27` | **Label27** | `Label` | - | - | - | - |
| `Currency_ID` | **كود العملة** | `RadTextBox` | `Banks_Transfers_Delivery_Details.Currency_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Print_Journal` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Transfer_Date` | **Transfer_Date** | `RadDateTimePicker` | `Banks_Transfers_Delivery_Details.Transfer_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Client_Name_A` | **اسم العميل** | `RadTextBox` | - | - | - | - |
| `Client_ID` | **كود العميل** | `RadTextBox` | - | - | - | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Label21` | **Label21** | `Label` | - | - | - | - |
| `Label22` | **Label22** | `Label` | - | - | - | - |
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم العميـل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم مركز التكلفة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم العُملـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم العُملـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال المبلـغ 
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الشيك 
- **[Calculation]** حساب تلقائي لحقل الصافي تفقيطاً (كتابة بالكلمات): Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
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
Select * FROM Level5_View Order By Level5_ID Asc
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Banks_Transfers_Delivery_Head_View Order By Note_No DESC
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
Select * FROM Level5_View Order By Level5_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters_View Order By Costcenter_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Currencies Order By Currency_ID ASC
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM Banks_Transfers_Delivery_Head Order By Note_No Desc
```
##### استعلام INSERT على جدول `Banks_Transfers_Delivery_Head`:
```sql
Insert Into Banks_Transfers_Delivery_Head(Note_No,Note_Date,Description,Note_Debit,Note_Credit,Note_Net_Text,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Banks_Transfers_Delivery_Details`:
```sql
Insert Into Banks_Transfers_Delivery_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Transfer_No,Transfer_Date,Bank_Name)Values(
```
##### استعلام INSERT على جدول `Banks_Transfers_Delivery_Details`:
```sql
Insert Into Banks_Transfers_Delivery_Details(Note_No,SR,Level5_ID,Costcenter_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Transfer_No,Transfer_Date,Bank_Name)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Banks_Transfers_Delivery_Head Where Note_No=
```
##### استعلام UPDATE على جدول `Banks_Transfers_Delivery_Head`:
```sql
Update Banks_Transfers_Delivery_Head Set Note_No=
```
##### استعلام DELETE على جدول `Banks_Transfers_Delivery_Details`:
```sql
Delete From Banks_Transfers_Delivery_Details Where Note_No=
```
##### استعلام INSERT على جدول `Banks_Transfers_Delivery_Details`:
```sql
Insert Into Banks_Transfers_Delivery_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Transfer_No,Transfer_Date,Bank_Name)Values(
```
##### استعلام INSERT على جدول `Banks_Transfers_Delivery_Details`:
```sql
Insert Into Banks_Transfers_Delivery_Details(Note_No,SR,Level5_ID,Costcenter_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Transfer_No,Transfer_Date,Bank_Name)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Banks_Transfers_Delivery_Head Where Note_No=
```
##### استعلام DELETE على جدول `Banks_Transfers_Delivery_Head`:
```sql
Delete From Banks_Transfers_Delivery_Head where Note_No=
```
##### استعلام DELETE على جدول `Banks_Transfers_Delivery_Details`:
```sql
Delete From Banks_Transfers_Delivery_Details where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Banks_Transfers_Delivery_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Banks_Transfers_Delivery_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Banks_Transfers_Delivery_Head_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Module_Type>
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
Select * FROM Currencies Where Currency_Name_A Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Module_Type>
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Module_Type>
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Banks_Transfers_Delivery_Head_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Banks_Transfers_Delivery_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Costcenters_View Where Costcenter_ID=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Currency_ID_GotFocus, Currency_Name_A_GotFocus, Currency_Name_A_KeyDown, Currency_Name_A_LostFocus, Currency_ID_KeyDown, Currency_ID_KeyPress, Currency_ID_LostFocus, Exchange_GotFocus, Exchange_KeyDown, Exchange_KeyPress, Exchange_LostFocus, Transfer_Date_Opened, Transfer_Date_ValueChanged, Transfer_Date_KeyDown, Print_Journal_Click, Print_Journal_KeyDown, Client_ID_GotFocus, Client_ID_KeyDown, Client_ID_KeyPress, Client_ID_LostFocus, Fill_Grid, Fill_Level5_Grid, Fill_Costcenters_Grid, Fill_Currencies_Grid, Lock_Control, Enable_Control, Review_Record, Banks_Transfer_Delivery_Form_KeyDown, Banks_Transfer_Delivery_Form_Load, Banks_Transfer_Delivery_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Option1_Click, Search_Option1_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Note_No_GotFocus, Note_No_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Note_Date_GotFocus, Note_Date_KeyDown, Note_Date_KeyPress, Note_Date_Opened, Note_Date_ValueChanged, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, Description_KeyPress, Debit_Level5_ID_GotFocus, Debit_Level5_ID_KeyDown, Bank_Name_GotFocus, Bank_Name_KeyDown, Bank_Name_KeyPress, Description_GotFocus, Description_KeyDown, Debit_Level5_Name_A_GotFocus, Debit_Level5_Name_A_KeyDown, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, Debit_Level5_ID_KeyPress, Actual_Amount_GotFocus, Actual_Amount_KeyDown, Actual_Amount_KeyPress, Search_Txt_LostFocus, Note_No_KeyPress, Note_No_LostFocus, Note_Net_Text_LostFocus, Debit_Level5_Name_A_LostFocus, Debit_Level5_ID_LostFocus, Transaction_Credit_LostFocus, Description_LostFocus, Costcenter_ID_GotFocus, Costcenter_Name_A_GotFocus, Costcenter_Name_A_KeyDown, Costcenter_Name_A_LostFocus, Costcenter_ID_KeyDown, Costcenter_ID_KeyPress, Costcenter_ID_LostFocus, Bank_Name_LostFocus, Costcenters_GridView_CellClick, Costcenters_GridView_CellFormatting, Costcenters_GridView_KeyDown, Currency_GridView_CellClick, Currency_GridView_CellFormatting, Currency_GridView_KeyDown, Transfer_No_GotFocus, Transfer_No_KeyDown, Transfer_No_KeyPress, Transfer_No_LostFocus, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_Search_Option1, set_Search_Option1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_Note_No, set_Note_No, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_Note_Date, set_Note_Date, get_Level5_GridView, set_Level5_GridView, get_Note_Net_Text, set_Note_Net_Text, get_AquaTheme1, set_AquaTheme1, get_RadPanel7, set_RadPanel7, get_Description, set_Description, get_Debit_Level5_ID, set_Debit_Level5_ID, get_Debit_Level5_Name_A, set_Debit_Level5_Name_A, get_Actual_Amount, set_Actual_Amount, get_RadLabel8, set_RadLabel8, get_Label5, set_Label5, get_Label6, set_Label6, get_Label7, set_Label7, get_Label14, set_Label14, get_Label16, set_Label16, get_Label20, set_Label20, get_Costcenter_Name_A, set_Costcenter_Name_A, get_Costcenter_ID, set_Costcenter_ID, get_Bank_Name, set_Bank_Name, get_Costcenters_GridView, set_Costcenters_GridView, get_Label25, set_Label25, get_Amount, set_Amount, get_Transfer_No, set_Transfer_No, get_Label12, set_Label12, get_Label13, set_Label13, get_Currency_GridView, set_Currency_GridView, get_Debit_Level4_ID, set_Debit_Level4_ID, get_Currency_Name_A, set_Currency_Name_A, get_Exchange, set_Exchange, get_Label26, set_Label26, get_Label27, set_Label27, get_Currency_ID, set_Currency_ID, get_Label1, set_Label1, get_Print_Journal, set_Print_Journal, get_Transfer_Date, set_Transfer_Date, get_Client_Name_A, set_Client_Name_A, get_Client_ID, set_Client_ID, get_Label2, set_Label2, get_Label21, set_Label21, get_Label22, set_Label22, Clear_Record, Clear_Data
```

---

### 3.5 شاشة: الشيكات الصادرة (أوراق دفع) (`Cheque_Issue_Form`)
- **الاسم الإنجليزي:** Outgoing Cheques (Notes Payable)
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** تسجيل بيانات الشيكات الصادرة للموردين وجهات التعامل وتتبع مواعيد الاستحقاق
- **جداول قاعدة البيانات المستهدفة:** `Cheques_Issue_Head`, `Cheques_Issue_Details`

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
| `Note_No` | **رقم الحركة / السند** | `RadTextBox` | `Cheques_Issue_Head.Note_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Cheques_Issue_Head.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Cheques_Issue_Head.Entry_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `Note_Date` | **تاريخ الحركة** | `RadDateTimePicker` | `Cheques_Issue_Head.Note_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Credit_Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Cheques_Issue_Details.Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `RadTextBox` | `Cheques_Issue_Head.Note_Net_Text` | `nvarchar(300)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `RadPanel7` | **RadPanel7** | `RadPanel` | - | - | - | - |
| `Description` | **البيان / الشرح** | `RadTextBox` | `Cheques_Issue_Head.Description` | `nvarchar(300)` (NOT NULL) | `(' ')` | - |
| `Debit_Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Cheques_Issue_Details.Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Credit_Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Debit_Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Actual_Amount` | **Actual_Amount** | `RadTextBox` | - | - | - | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Label7` | **Label7** | `Label` | - | - | - | - |
| `Label22` | **Label22** | `Label` | - | - | - | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Label15` | **Label15** | `Label` | - | - | - | - |
| `Label16` | **Label16** | `Label` | - | - | - | - |
| `Label20` | **Label20** | `Label` | - | - | - | - |
| `Costcenter_Name_A` | **اسم مركز التكلفة** | `RadTextBox` | - | - | - | - |
| `Costcenter_ID` | **كود مركز التكلفة** | `RadTextBox` | `Cheques_Issue_Details.Costcenter_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Bank_Name` | **البنك المسحوب عليه** | `RadTextBox` | `Cheques_Issue_Details.Bank_Name` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Costcenters_GridView` | **Costcenters_GridView** | `RadGridView` | - | - | - | - |
| `Cheque_Name` | **Cheque_Name** | `RadTextBox` | `Cheques_Issue_Details.Cheque_Name` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Label25` | **Label25** | `Label` | - | - | - | - |
| `Amount` | **Amount** | `RadTextBox` | - | - | - | - |
| `Cheque_No` | **رقم الشيك** | `RadTextBox` | `Cheques_Issue_Details.Cheque_No` | `nvarchar(20)` (NOT NULL) | `(' ')` | - |
| `Label12` | **Label12** | `Label` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Currency_GridView` | **Currency_GridView** | `RadGridView` | - | - | - | - |
| `Debit_Level4_ID` | **كود الحساب المستوى 4** | `RadTextBox` | - | - | - | - |
| `Currency_Name_A` | **اسم العملة** | `RadTextBox` | - | - | - | - |
| `Exchange` | **سعر الصرف** | `RadTextBox` | `Cheques_Issue_Details.Exchange` | `float` (NOT NULL) | `((1))` | - |
| `Label26` | **Label26** | `Label` | - | - | - | - |
| `Label27` | **Label27** | `Label` | - | - | - | - |
| `Currency_ID` | **كود العملة** | `RadTextBox` | `Cheques_Issue_Details.Currency_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Print_Journal` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Cheque_Date` | **تاريخ استحقاق الشيك** | `RadDateTimePicker` | `Cheques_Issue_Details.Cheque_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Account_Name_A` | **Account_Name_A** | `RadTextBox` | - | - | - | - |
| `Account_ID` | **Account_ID** | `RadTextBox` | `Cheques_Issue_Details.Account_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Journal_Type` | **Journal_Type** | `RadDropDownList` | `Cheques_Issue_Head.Journal_Type` | `smallint` (NOT NULL) | `((0))` | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Analysis_Name_A` | **اسم الحساب التحليلي** | `RadTextBox` | - | - | - | - |
| `Analysis_ID` | **كود الحساب التحليلي** | `RadTextBox` | `Cheques_Issue_Details.Analysis_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Analysis_GridView` | **Analysis_GridView** | `RadGridView` | - | - | - | - |
| `Label8` | **Label8** | `Label` | - | - | - | - |
| `Flag` | **حالة الاعتماد / التأكيد** | `RadCheckBox` | `Cheques_Issue_Head.Flag` | `bit` (NOT NULL) | `((0))` | - |
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الشيك 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الحسـاب 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم مركز التكلفة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الحساب التحليلي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم العُملـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم العُملـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال المبلـغ 
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Calculation]** حساب تلقائي لحقل الصافي تفقيطاً (كتابة بالكلمات): Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Cheques_Issue_Head_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Cheques_Issue_Details_View Where Note_No=
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
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Accounts_Analysis_View Where Analysis_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Cheques_Issue_Head_View Order By Note_No DESC
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
Select top 1 Note_No FROM Cheques_Issue_Head Order By Note_No Desc
```
##### استعلام INSERT على جدول `Cheques_Issue_Head`:
```sql
Insert Into Cheques_Issue_Head(Note_No,Note_Date,Description,Note_Debit,Note_Credit,Note_Net_Text,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Cheques_Issue_Details`:
```sql
Insert Into Cheques_Issue_Details(Note_No,SR,Level5_ID,Account_ID,Costcenter_ID,Analysis_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Flag)Values(
```
##### استعلام INSERT على جدول `Cheques_Issue_Details`:
```sql
Insert Into Cheques_Issue_Details(Note_No,SR,Level5_ID,Account_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name)Values(
```
##### استعلام INSERT على جدول `Cheques_Issue_Head`:
```sql
Insert Into Cheques_Issue(Note_No,Note_Date,Level5_ID,Account_ID,Costcenter_ID,Description,Currency_ID,Exchange,Actual_Amount,Amount,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name)Values(
```
##### استعلام INSERT على جدول `Cheques_Issue_Head`:
```sql
Insert Into Cheques_Issue(Note_No,Note_Date,Level5_ID,Account_ID,Costcenter_ID,Description,Currency_ID,Exchange,Actual_Amount,Amount,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Cheque_Status)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Cheques_Issue_Head Where Note_No=
```
##### استعلام UPDATE على جدول `Cheques_Issue_Head`:
```sql
Update Cheques_Issue_Head Set Note_No=
```
##### استعلام DELETE على جدول `Cheques_Issue_Details`:
```sql
Delete From Cheques_Issue_Details Where Note_No=
```
##### استعلام DELETE على جدول `Cheques_Issue_Head`:
```sql
Delete From Cheques_Issue Where Note_No=
```
##### استعلام INSERT على جدول `Cheques_Issue_Details`:
```sql
Insert Into Cheques_Issue_Details(Note_No,SR,Level5_ID,Account_ID,Costcenter_ID,Analysis_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Flag)Values(
```
##### استعلام INSERT على جدول `Cheques_Issue_Details`:
```sql
Insert Into Cheques_Issue_Details(Note_No,SR,Level5_ID,Account_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name)Values(
```
##### استعلام INSERT على جدول `Cheques_Issue_Head`:
```sql
Insert Into Cheques_Issue(Note_No,Note_Date,Level5_ID,Account_ID,Costcenter_ID,Description,Currency_ID,Exchange,Actual_Amount,Amount,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name)Values(
```
##### استعلام INSERT على جدول `Cheques_Issue_Head`:
```sql
Insert Into Cheques_Issue(Note_No,Note_Date,Level5_ID,Account_ID,Costcenter_ID,Description,Currency_ID,Exchange,Actual_Amount,Amount,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Cheque_Status)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Cheques_Issue_Head Where Note_No=
```
##### استعلام DELETE على جدول `Cheques_Issue_Head`:
```sql
Delete From Cheques_Issue_Head where Note_No=
```
##### استعلام DELETE على جدول `Cheques_Issue_Details`:
```sql
Delete From Cheques_Issue_Details where Note_No=
```
##### استعلام DELETE على جدول `Cheques_Issue_Head`:
```sql
Delete From Cheques_Issue Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Cheques_Issue_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Cheques_Issue_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Cheques_Issue_Head_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where  Search_Field Like '%
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
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Actual_Amount_KeyDown, Actual_Amount_KeyPress, Search_Txt_LostFocus, Note_No_KeyPress, Note_No_LostFocus, Note_Net_Text_LostFocus, Debit_Level5_Name_A_LostFocus, Debit_Level5_ID_LostFocus, Credit_Level5_Name_A_LostFocus, Credit_Level5_ID_LostFocus, Transaction_Credit_LostFocus, Description_LostFocus, Costcenter_ID_GotFocus, Costcenter_Name_A_GotFocus, Costcenter_Name_A_KeyDown, Costcenter_Name_A_LostFocus, Costcenter_ID_KeyDown, Costcenter_ID_KeyPress, Costcenter_ID_LostFocus, Bank_Name_LostFocus, Costcenters_GridView_CellClick, Costcenters_GridView_CellFormatting, Costcenters_GridView_KeyDown, Cheque_Name_KeyPress, Cheque_Name_LostFocus, Currency_GridView_CellClick, Currency_GridView_CellFormatting, Currency_GridView_KeyDown, Cheque_No_GotFocus, Cheque_No_KeyDown, Cheque_No_KeyPress, Cheque_No_LostFocus, Currency_ID_GotFocus, Currency_Name_A_GotFocus, Currency_Name_A_KeyDown, Currency_Name_A_LostFocus, Currency_ID_KeyDown, Currency_ID_KeyPress, Currency_ID_LostFocus, Exchange_GotFocus, Exchange_KeyDown, Exchange_KeyPress, Exchange_LostFocus, Cheque_Date_Opened, Cheque_Date_ValueChanged, Cheque_Date_KeyDown, Print_Journal_Click, Print_Journal_KeyDown, Account_ID_GotFocus, Account_ID_KeyDown, Account_ID_KeyPress, Account_ID_LostFocus, Analysis_ID_GotFocus, Analysis_Name_A_GotFocus, Analysis_Name_A_KeyDown, Analysis_Name_A_LostFocus, Analysis_ID_KeyDown, Analysis_ID_KeyPress, Analysis_ID_LostFocus, Analysis_GridView_CellClick, Analysis_GridView_CellFormatting, Analysis_GridView_KeyDown, set_Account_Name_A, get_Account_ID, set_Account_ID, get_Label2, set_Label2, get_Journal_Type, set_Journal_Type, get_Label3, set_Label3, get_Analysis_Name_A, set_Analysis_Name_A, get_Analysis_ID, set_Analysis_ID, get_Label4, set_Label4, get_Analysis_GridView, set_Analysis_GridView, get_Label8, set_Label8, get_Flag, set_Flag, Clear_Record, Clear_Data, Fill_Grid, Fill_Level5_Grid, Fill_Costcenters_Grid, Fill_Analysis_Grid, Fill_Currencies_Grid, Lock_Control, Enable_Control, Review_Record, Cheque_Issue_Form_KeyDown, Cheque_Issue_Form_Load, Cheque_Issue_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Option1_Click, Search_Option1_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Note_No_GotFocus, Note_No_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Note_Date_GotFocus, Note_Date_KeyDown, Note_Date_KeyPress, Note_Date_Opened, Note_Date_ValueChanged, Journal_Type_GotFocus, Journal_Type_KeyDown, Journal_Type_KeyPress, Journal_Type_LostFocus, Credit_Level5_ID_GotFocus, Credit_Level5_ID_KeyDown, Credit_Level5_ID_KeyPress, Credit_Level5_Name_A_GotFocus, Credit_Level5_Name_A_KeyDown, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, Description_KeyPress, Debit_Level5_ID_GotFocus, Debit_Level5_ID_KeyDown, Bank_Name_GotFocus, Bank_Name_KeyDown, Bank_Name_KeyPress, Cheque_Name_GotFocus, Cheque_Name_KeyDown, Description_GotFocus, Description_KeyDown, Debit_Level5_Name_A_GotFocus, Debit_Level5_Name_A_KeyDown, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, Debit_Level5_ID_KeyPress, Actual_Amount_GotFocus, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_Search_Option1, set_Search_Option1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_Note_No, set_Note_No, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_Note_Date, set_Note_Date, get_Credit_Level5_ID, set_Credit_Level5_ID, get_Level5_GridView, set_Level5_GridView, get_Note_Net_Text, set_Note_Net_Text, get_AquaTheme1, set_AquaTheme1, get_RadPanel7, set_RadPanel7, get_Description, set_Description, get_Debit_Level5_ID, set_Debit_Level5_ID, get_Credit_Level5_Name_A, set_Credit_Level5_Name_A, get_Debit_Level5_Name_A, set_Debit_Level5_Name_A, get_Actual_Amount, set_Actual_Amount, get_RadLabel8, set_RadLabel8, get_Label5, set_Label5, get_Label6, set_Label6, get_Label7, set_Label7, get_Label22, set_Label22, get_Label9, set_Label9, get_Label14, set_Label14, get_Label15, set_Label15, get_Label16, set_Label16, get_Label20, set_Label20, get_Costcenter_Name_A, set_Costcenter_Name_A, get_Costcenter_ID, set_Costcenter_ID, get_Bank_Name, set_Bank_Name, get_Costcenters_GridView, set_Costcenters_GridView, get_Cheque_Name, set_Cheque_Name, get_Label25, set_Label25, get_Amount, set_Amount, get_Cheque_No, set_Cheque_No, get_Label12, set_Label12, get_Label13, set_Label13, get_Currency_GridView, set_Currency_GridView, get_Debit_Level4_ID, set_Debit_Level4_ID, get_Currency_Name_A, set_Currency_Name_A, get_Exchange, set_Exchange, get_Label26, set_Label26, get_Label27, set_Label27, get_Currency_ID, set_Currency_ID, get_Label1, set_Label1, get_Print_Journal, set_Print_Journal, get_Cheque_Date, set_Cheque_Date, get_Account_Name_A
```

---

### 3.6 شاشة: الشيكات الواردة (أوراق قبض) (`Cheque_Delivery_Form`)
- **الاسم الإنجليزي:** Incoming Cheques (Notes Receivable)
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** استلام وتسجيل الشيكات المحصلة من العملاء ومتابعة مواعيد استحقاقها وحافظة الإيداع
- **جداول قاعدة البيانات المستهدفة:** `Cheques_Delivery_Head`, `Cheques_Delivery_Details`

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
| `Note_No` | **رقم الحركة / السند** | `RadTextBox` | `Cheques_Delivery_Head.Note_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Cheques_Delivery_Head.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Cheques_Delivery_Head.Entry_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `Note_Date` | **تاريخ الحركة** | `RadDateTimePicker` | `Cheques_Delivery_Head.Note_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Credit_Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Cheques_Delivery_Details.Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `RadTextBox` | `Cheques_Delivery_Head.Note_Net_Text` | `nvarchar(300)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `RadPanel7` | **RadPanel7** | `RadPanel` | - | - | - | - |
| `Description` | **البيان / الشرح** | `RadTextBox` | `Cheques_Delivery_Head.Description` | `nvarchar(300)` (NOT NULL) | `(' ')` | - |
| `Debit_Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Cheques_Delivery_Details.Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Credit_Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Debit_Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Actual_Amount` | **Actual_Amount** | `RadTextBox` | - | - | - | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Label7` | **Label7** | `Label` | - | - | - | - |
| `Label22` | **Label22** | `Label` | - | - | - | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Label14` | **Label14** | `Label` | - | - | - | - |
| `Label15` | **Label15** | `Label` | - | - | - | - |
| `Label16` | **Label16** | `Label` | - | - | - | - |
| `Label20` | **Label20** | `Label` | - | - | - | - |
| `Costcenter_Name_A` | **اسم مركز التكلفة** | `RadTextBox` | - | - | - | - |
| `Costcenter_ID` | **كود مركز التكلفة** | `RadTextBox` | `Cheques_Delivery_Details.Costcenter_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Bank_Name` | **البنك المسحوب عليه** | `RadTextBox` | `Cheques_Delivery_Details.Bank_Name` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Costcenters_GridView` | **Costcenters_GridView** | `RadGridView` | - | - | - | - |
| `Cheque_Name` | **Cheque_Name** | `RadTextBox` | `Cheques_Delivery_Details.Cheque_Name` | `nvarchar(200)` (NOT NULL) | `(' ')` | - |
| `Label25` | **Label25** | `Label` | - | - | - | - |
| `Amount` | **Amount** | `RadTextBox` | - | - | - | - |
| `Cheque_No` | **رقم الشيك** | `RadTextBox` | `Cheques_Delivery_Details.Cheque_No` | `nvarchar(20)` (NOT NULL) | `(' ')` | - |
| `Label12` | **Label12** | `Label` | - | - | - | - |
| `Label13` | **Label13** | `Label` | - | - | - | - |
| `Currency_GridView` | **Currency_GridView** | `RadGridView` | - | - | - | - |
| `Debit_Level4_ID` | **كود الحساب المستوى 4** | `RadTextBox` | - | - | - | - |
| `Currency_Name_A` | **اسم العملة** | `RadTextBox` | - | - | - | - |
| `Exchange` | **سعر الصرف** | `RadTextBox` | `Cheques_Delivery_Details.Exchange` | `float` (NOT NULL) | `((1))` | - |
| `Label26` | **Label26** | `Label` | - | - | - | - |
| `Label27` | **Label27** | `Label` | - | - | - | - |
| `Currency_ID` | **كود العملة** | `RadTextBox` | `Cheques_Delivery_Details.Currency_ID` | `smallint` (NOT NULL) | `((1))` | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Print_Journal` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Cheque_Date` | **تاريخ استحقاق الشيك** | `RadDateTimePicker` | `Cheques_Delivery_Details.Cheque_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Client_Name_A` | **اسم العميل** | `RadTextBox` | - | - | - | - |
| `Client_ID` | **كود العميل** | `RadTextBox` | `Cheques_Delivery_Details.Client_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Journal_Type` | **Journal_Type** | `RadDropDownList` | `Cheques_Delivery_Head.Journal_Type` | `smallint` (NOT NULL) | `((0))` | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Analysis_Name_A` | **اسم الحساب التحليلي** | `RadTextBox` | - | - | - | - |
| `Analysis_ID` | **كود الحساب التحليلي** | `RadTextBox` | `Cheques_Delivery_Details.Analysis_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label4` | **Label4** | `Label` | - | - | - | - |
| `Analysis_GridView` | **Analysis_GridView** | `RadGridView` | - | - | - | - |
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الشيك 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم العميـل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم مركز التكلفة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم الحساب التحليلي 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم العُملـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم العُملـة 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال المبلـغ 
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Calculation]** حساب تلقائي لحقل الصافي تفقيطاً (كتابة بالكلمات): Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)
- **[Calculation]** حساب تلقائي لحقل الرصيد / الفارق: Balance = Previous_Balance + Debit - Credit (المعادلة: `Balance = Previous_Balance + Debit - Credit`)

#### ج. خط أنابيب استعلامات الحفظ والتعديل (SQL Persistence Flow)
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Cheques_Delivery_Head_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Cheques_Delivery_Details_View Where Note_No=
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
Select * FROM Level5_View Order By Level5_ID Asc
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
Select * FROM Cheques_Delivery_Head_View Order By Note_No DESC
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
Select top 1 Note_No FROM Cheques_Delivery_Head Order By Note_No Desc
```
##### استعلام INSERT على جدول `Cheques_Delivery_Head`:
```sql
Insert Into Cheques_Delivery_Head(Note_No,Note_Date,Journal_Type,Description,Note_Debit,Note_Credit,Note_Net_Text,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Cheques_Delivery_Details`:
```sql
Insert Into Cheques_Delivery_Details(Note_No,SR,Level5_ID,Client_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name)Values(
```
##### استعلام INSERT على جدول `Cheques_Delivery_Details`:
```sql
Insert Into Cheques_Delivery_Details(Note_No,SR,Level5_ID,Client_ID,Costcenter_ID,Analysis_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name)Values(
```
##### استعلام INSERT على جدول `Cheques_Delivery_Details`:
```sql
Insert Into Cheques_Delivery_Details(Note_No,SR,Level5_ID,Client_ID,Costcenter_ID,Analysis_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name)Values(
```
##### استعلام INSERT على جدول `Cheques_Delivery_Head`:
```sql
Insert Into Cheques(Note_No,Note_Date,Level5_ID,Client_ID,Costcenter_ID,Description,Currency_ID,Exchange,Actual_Amount,Amount,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name)Values(
```
##### استعلام INSERT على جدول `Cheques_Delivery_Details`:
```sql
Insert Into Cheques_Delivery_Details(Note_No,SR,Level5_ID,Client_ID,Costcenter_ID,Analysis_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name)Values(
```
##### استعلام INSERT على جدول `Cheques_Delivery_Head`:
```sql
Insert Into Cheques(Note_No,Note_Date,Level5_ID,Client_ID,Costcenter_ID,Description,Currency_ID,Exchange,Actual_Amount,Amount,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Cheque_Status)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Cheques_Delivery_Head Where Note_No=
```
##### استعلام UPDATE على جدول `Cheques_Delivery_Head`:
```sql
Update Cheques_Delivery_Head Set Note_No=
```
##### استعلام DELETE على جدول `Cheques_Delivery_Details`:
```sql
Delete From Cheques_Delivery_Details Where Note_No=
```
##### استعلام DELETE على جدول `Cheques_Delivery_Head`:
```sql
Delete From Cheques Where Note_No=
```
##### استعلام INSERT على جدول `Cheques_Delivery_Details`:
```sql
Insert Into Cheques_Delivery_Details(Note_No,SR,Level5_ID,Client_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name)Values(
```
##### استعلام INSERT على جدول `Cheques_Delivery_Details`:
```sql
Insert Into Cheques_Delivery_Details(Note_No,SR,Level5_ID,Client_ID,Costcenter_ID,Analysis_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name)Values(
```
##### استعلام INSERT على جدول `Cheques_Delivery_Details`:
```sql
Insert Into Cheques_Delivery_Details(Note_No,SR,Level5_ID,Client_ID,Costcenter_ID,Analysis_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name)Values(
```
##### استعلام INSERT على جدول `Cheques_Delivery_Head`:
```sql
Insert Into Cheques(Note_No,Note_Date,Level5_ID,Client_ID,Costcenter_ID,Description,Currency_ID,Exchange,Actual_Amount,Amount,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name)Values(
```
##### استعلام INSERT على جدول `Cheques_Delivery_Details`:
```sql
Insert Into Cheques_Delivery_Details(Note_No,SR,Level5_ID,Client_ID,Costcenter_ID,Analysis_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name)Values(
```
##### استعلام INSERT على جدول `Cheques_Delivery_Head`:
```sql
Insert Into Cheques(Note_No,Note_Date,Level5_ID,Client_ID,Costcenter_ID,Description,Currency_ID,Exchange,Actual_Amount,Amount,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Cheque_Status)Values(
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Cheques_Delivery_Head Where Note_No=
```
##### استعلام DELETE على جدول `Cheques_Delivery_Head`:
```sql
Delete From Cheques_Delivery_Head where Note_No=
```
##### استعلام DELETE على جدول `Cheques_Delivery_Details`:
```sql
Delete From Cheques_Delivery_Details where Note_No=
```
##### استعلام DELETE على جدول `Cheques_Delivery_Head`:
```sql
Delete From Cheques Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Cheques_Delivery_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Cheques_Delivery_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Cheques_Delivery_Head_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Module_Type>
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
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Module_Type>
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Module_Type>
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Note_No_KeyPress, Note_No_LostFocus, Note_Net_Text_LostFocus, Debit_Level5_Name_A_LostFocus, Debit_Level5_ID_LostFocus, Credit_Level5_Name_A_LostFocus, Credit_Level5_ID_LostFocus, Transaction_Credit_LostFocus, Description_LostFocus, Costcenter_ID_GotFocus, Costcenter_Name_A_GotFocus, Costcenter_Name_A_KeyDown, Costcenter_Name_A_LostFocus, Costcenter_ID_KeyDown, Costcenter_ID_KeyPress, Costcenter_ID_LostFocus, Bank_Name_LostFocus, Costcenters_GridView_CellClick, Costcenters_GridView_CellFormatting, Costcenters_GridView_KeyDown, Cheque_Name_KeyPress, Cheque_Name_LostFocus, Currency_GridView_CellClick, Currency_GridView_CellFormatting, Currency_GridView_KeyDown, Cheque_No_GotFocus, Cheque_No_KeyDown, Cheque_No_KeyPress, Cheque_No_LostFocus, Currency_ID_GotFocus, Currency_Name_A_GotFocus, Currency_Name_A_KeyDown, Currency_Name_A_LostFocus, Currency_ID_KeyDown, Currency_ID_KeyPress, Currency_ID_LostFocus, Exchange_GotFocus, Exchange_KeyDown, Exchange_KeyPress, Exchange_LostFocus, Cheque_Date_Opened, Cheque_Date_ValueChanged, Cheque_Date_KeyDown, Print_Journal_Click, Print_Journal_KeyDown, Client_ID_GotFocus, Client_ID_KeyDown, Client_ID_KeyPress, Client_ID_LostFocus, Analysis_ID_GotFocus, Analysis_Name_A_GotFocus, Analysis_Name_A_KeyDown, Analysis_Name_A_LostFocus, Analysis_ID_KeyDown, Analysis_ID_KeyPress, Analysis_ID_LostFocus, Analysis_GridView_CellClick, Analysis_GridView_CellFormatting, Analysis_GridView_KeyDown, set_Client_Name_A, get_Client_ID, set_Client_ID, get_Label2, set_Label2, get_Journal_Type, set_Journal_Type, get_Label3, set_Label3, get_Analysis_Name_A, set_Analysis_Name_A, get_Analysis_ID, set_Analysis_ID, get_Label4, set_Label4, get_Analysis_GridView, set_Analysis_GridView, Clear_Record, Clear_Data, Fill_Grid, Fill_Level5_Grid, Fill_Analysis_Grid, Fill_Costcenters_Grid, Fill_Currencies_Grid, Lock_Control, Enable_Control, Review_Record, Cheque_Delivery_Form_KeyDown, Cheque_Delivery_Form_Load, Cheque_Delivery_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Option1_Click, Search_Option1_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Note_No_GotFocus, Note_No_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Note_Date_GotFocus, Note_Date_KeyDown, Note_Date_KeyPress, Note_Date_Opened, Note_Date_ValueChanged, Journal_Type_GotFocus, Journal_Type_KeyDown, Journal_Type_KeyPress, Journal_Type_LostFocus, Credit_Level5_ID_GotFocus, Credit_Level5_ID_KeyDown, Credit_Level5_ID_KeyPress, Credit_Level5_Name_A_GotFocus, Credit_Level5_Name_A_KeyDown, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, Description_KeyPress, Debit_Level5_ID_GotFocus, Debit_Level5_ID_KeyDown, Bank_Name_GotFocus, Bank_Name_KeyDown, Bank_Name_KeyPress, Cheque_Name_GotFocus, Cheque_Name_KeyDown, Description_GotFocus, Description_KeyDown, Debit_Level5_Name_A_GotFocus, Debit_Level5_Name_A_KeyDown, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, Debit_Level5_ID_KeyPress, Actual_Amount_GotFocus, Actual_Amount_KeyDown, Actual_Amount_KeyPress, Search_Txt_LostFocus, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_Search_Option1, set_Search_Option1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_Note_No, set_Note_No, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_Note_Date, set_Note_Date, get_Credit_Level5_ID, set_Credit_Level5_ID, get_Level5_GridView, set_Level5_GridView, get_Note_Net_Text, set_Note_Net_Text, get_AquaTheme1, set_AquaTheme1, get_RadPanel7, set_RadPanel7, get_Description, set_Description, get_Debit_Level5_ID, set_Debit_Level5_ID, get_Credit_Level5_Name_A, set_Credit_Level5_Name_A, get_Debit_Level5_Name_A, set_Debit_Level5_Name_A, get_Actual_Amount, set_Actual_Amount, get_RadLabel8, set_RadLabel8, get_Label5, set_Label5, get_Label6, set_Label6, get_Label7, set_Label7, get_Label22, set_Label22, get_Label9, set_Label9, get_Label14, set_Label14, get_Label15, set_Label15, get_Label16, set_Label16, get_Label20, set_Label20, get_Costcenter_Name_A, set_Costcenter_Name_A, get_Costcenter_ID, set_Costcenter_ID, get_Bank_Name, set_Bank_Name, get_Costcenters_GridView, set_Costcenters_GridView, get_Cheque_Name, set_Cheque_Name, get_Label25, set_Label25, get_Amount, set_Amount, get_Cheque_No, set_Cheque_No, get_Label12, set_Label12, get_Label13, set_Label13, get_Currency_GridView, set_Currency_GridView, get_Debit_Level4_ID, set_Debit_Level4_ID, get_Currency_Name_A, set_Currency_Name_A, get_Exchange, set_Exchange, get_Label26, set_Label26, get_Label27, set_Label27, get_Currency_ID, set_Currency_ID, get_Label1, set_Label1, get_Print_Journal, set_Print_Journal, get_Cheque_Date, set_Cheque_Date, get_Client_Name_A
```

---

### 3.7 شاشة: حافظة تحصيل وصرف أوراق القبض (`Cheques_Receipt_Form`)
- **الاسم الإنجليزي:** Cheques Deposit & Collection
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** إيداع الشيكات في البنك وتحصيل قيمتها الفعلية وإثبات الإشعار البنكي
- **جداول قاعدة البيانات المستهدفة:** `Cheques_Receipt_Head`, `Cheques_Receipt_Details`

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
| `Note_No` | **رقم الحركة / السند** | `RadTextBox` | `Cheques_Receipt_Head.Note_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Cheques_Receipt_Head.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Cheques_Receipt_Head.Entry_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `Note_Date` | **تاريخ الحركة** | `RadDateTimePicker` | `Cheques_Receipt_Head.Note_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Credit_Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Cheques_Receipt_Details.Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `RadTextBox` | `Cheques_Receipt_Head.Note_Net_Text` | `nvarchar(300)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `RadPanel7` | **RadPanel7** | `RadPanel` | - | - | - | - |
| `Description` | **البيان / الشرح** | `RadTextBox` | `Cheques_Receipt_Head.Description` | `nvarchar(300)` (NOT NULL) | `(' ')` | - |
| `Debit_Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Cheques_Receipt_Details.Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Label19` | **Label19** | `Label` | - | - | - | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `Note_Net` | **الصافي المستحق** | `RadTextBox` | - | - | - | `Net = Total - Discount + Tax` |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Label7` | **Label7** | `Label` | - | - | - | - |
| `Label22` | **Label22** | `Label` | - | - | - | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Debit_Level4_ID` | **كود الحساب المستوى 4** | `RadTextBox` | - | - | - | - |
| `Adjustment_GridView` | **Adjustment_GridView** | `DataGridView` | - | - | - | - |
| `Print_Journal` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Bank_Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Bank_Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Cheques_Receipt_Details.Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Balance_Adap` | **الرصيد / الفارق** | `SqlDataAdapter` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Adap_Print` | **زر طباعة التقرير / السند** | `SqlDataAdapter` | - | - | - | - |
| `Adap_H` | **Adap_H** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D` | **Adap_D** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D_V0` | **Adap_D_V0** | `SqlDataAdapter` | - | - | - | - |
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
| `Link_Adap` | **Link_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Profile_Adap` | **Profile_Adap** | `OleDbDataAdapter` | - | - | - | - |
| `Balance_RRS` | **الرصيد / الفارق** | `DataSet` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `RRS_Print` | **زر طباعة التقرير / السند** | `DataSet` | - | - | - | - |
| `RRS_H` | **RRS_H** | `DataSet` | - | - | - | - |
| `RRS_D` | **RRS_D** | `DataSet` | - | - | - | - |
| `RRS_D_V0` | **RRS_D_V0** | `DataSet` | - | - | - | - |
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم حساب البنك 
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيد المطلوب  
- **[Calculation]** حساب تلقائي لحقل الصافي تفقيطاً (كتابة بالكلمات): Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
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
Select * From Users Where User_ID=
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
Select * From Cheques_View Where Cheque_Status=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM Cheques_Receipt_Head Order By Note_No Desc
```
##### استعلام INSERT على جدول `Cheques_Receipt_Head`:
```sql
Insert Into Cheques_Receipt_Head(Note_No,Note_Date,Description,Note_Debit,Note_Credit,Note_Net_Text,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Cheques_Receipt_Details`:
```sql
Insert Into Cheques_Receipt_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Transaction_Note_No,Client_ID,Client_Name)Values(
```
##### استعلام INSERT على جدول `Cheques_Receipt_Details`:
```sql
Insert Into Cheques_Receipt_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Transaction_Note_No,Client_ID,Client_Name)Values(
```
##### استعلام UPDATE على جدول `Cheques_Receipt_Head`:
```sql
Update Cheques Set Cheque_Status='
```
##### استعلام INSERT على جدول `Cheques_Receipt_Details`:
```sql
Insert Into Cheques_Receipt_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Transaction_Note_No,Client_ID,Client_Name,Flag_N)Values(
```
##### استعلام INSERT على جدول `Cheques_Receipt_Details`:
```sql
Insert Into Cheques_Receipt_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Transaction_Note_No,Client_ID,Client_Name,Flag_N)Values(
```
##### استعلام INSERT على جدول `Cheques_Receipt_Details`:
```sql
Insert Into Cheques_Receipt_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Transaction_Note_No,Client_ID,Client_Name,Flag_N)Values(
```
##### استعلام UPDATE على جدول `Cheques_Receipt_Head`:
```sql
Update Cheques Set Cheque_Status='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Cheques_Receipt_Head Where Note_No=
```
##### استعلام UPDATE على جدول `Cheques_Receipt_Head`:
```sql
Update Cheques_Receipt_Head Set Note_No=
```
##### استعلام UPDATE على جدول `Cheques_Receipt_Head`:
```sql
Update Cheques Set Cheque_Status='
```
##### استعلام DELETE على جدول `Cheques_Receipt_Details`:
```sql
Delete From Cheques_Receipt_Details Where Note_No=
```
##### استعلام INSERT على جدول `Cheques_Receipt_Details`:
```sql
Insert Into Cheques_Receipt_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Transaction_Note_No,Client_ID,Client_Name)Values(
```
##### استعلام INSERT على جدول `Cheques_Receipt_Details`:
```sql
Insert Into Cheques_Receipt_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Transaction_Note_No,Client_ID,Client_Name)Values(
```
##### استعلام UPDATE على جدول `Cheques_Receipt_Head`:
```sql
Update Cheques Set Cheque_Status='
```
##### استعلام INSERT على جدول `Cheques_Receipt_Details`:
```sql
Insert Into Cheques_Receipt_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Transaction_Note_No,Client_ID,Client_Name,Flag_N)Values(
```
##### استعلام INSERT على جدول `Cheques_Receipt_Details`:
```sql
Insert Into Cheques_Receipt_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Transaction_Note_No,Client_ID,Client_Name,Flag_N)Values(
```
##### استعلام INSERT على جدول `Cheques_Receipt_Details`:
```sql
Insert Into Cheques_Receipt_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Transaction_Note_No,Client_ID,Client_Name,Flag_N)Values(
```
##### استعلام UPDATE على جدول `Cheques_Receipt_Head`:
```sql
Update Cheques Set Cheque_Status='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Cheques_Receipt_Head Where Note_No=
```
##### استعلام DELETE على جدول `Cheques_Receipt_Head`:
```sql
Delete From Cheques_Receipt_Head where Note_No=
```
##### استعلام UPDATE على جدول `Cheques_Receipt_Head`:
```sql
Update Cheques Set Cheque_Status='
```
##### استعلام DELETE على جدول `Cheques_Receipt_Details`:
```sql
Delete From Cheques_Receipt_Details where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Cheques_Receipt_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Cheques_Receipt_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Cheques_Receipt_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Cheques_Receipt_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Cheques_Receipt_Head_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Module_Type>
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Cheques_Receipt_Head_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Cheques_Receipt_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Cheques_Receipt_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Cheques_Receipt_Head_View Order By Note_No DESC
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Fill_Level5_Grid, Lock_Control, Enable_Control, Review_Record, Find_Total, Cheques_Receipt_Form_KeyDown, Cheques_Receipt_Form_Load, Cheques_Receipt_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Option1_Click, Search_Option1_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Note_No_GotFocus, Note_No_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Note_Date_GotFocus, Note_Date_KeyDown, Note_Date_KeyPress, Note_Date_Opened, Note_Date_ValueChanged, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, Debit_Description_KeyPress, Debit_Level5_ID_GotFocus, Debit_Level5_ID_KeyDown, Debit_Description_GotFocus, Debit_Description_KeyDown, Bank_Level5_Name_A_GotFocus, Bank_Level5_Name_A_KeyDown, Bank_Level5_Name_A_LostFocus, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, Bank_Level5_ID_GotFocus, Bank_Level5_ID_KeyPress, Bank_Level5_ID_KeyDown, Bank_Level5_ID_LostFocus, Search_Txt_LostFocus, Note_No_KeyPress, Note_No_LostFocus, Note_Net_Text_LostFocus, Description_LostFocus, Credit_Amount_GotFocus, Credit_Amount_KeyDown, Credit_Amount_LostFocus, Adjustment_GridView_KeyDown, Print_Journal_Click, Print_Journal_KeyDown, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_Search_Option1, set_Search_Option1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_Note_No, set_Note_No, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_Note_Date, set_Note_Date, get_Credit_Level5_ID, set_Credit_Level5_ID, get_Level5_GridView, set_Level5_GridView, get_Note_Net_Text, set_Note_Net_Text, get_AquaTheme1, set_AquaTheme1, get_RadPanel7, set_RadPanel7, get_Description, set_Description, get_Debit_Level5_ID, set_Debit_Level5_ID, get_Label19, set_Label19, get_RadLabel8, set_RadLabel8, get_Note_Net, set_Note_Net, get_Label5, set_Label5, get_Label6, set_Label6, get_Label7, set_Label7, get_Label22, set_Label22, get_Label9, set_Label9, get_Debit_Level4_ID, set_Debit_Level4_ID, get_Adjustment_GridView, set_Adjustment_GridView, get_Print_Journal, set_Print_Journal, get_Label1, set_Label1, get_Label3, set_Label3, get_Bank_Level5_Name_A, set_Bank_Level5_Name_A, get_Bank_Level5_ID, set_Bank_Level5_ID, get_SR, set_SR, get_Transaction_Note_No, set_Transaction_Note_No, get_Currency_ID, set_Currency_ID, get_Exchange, set_Exchange, get_Actual_Amount, set_Actual_Amount, get_Cheque_Date, set_Cheque_Date, get_Cheque_No, set_Cheque_No, get_Bank_Name, set_Bank_Name, get_Cheque_Name, set_Cheque_Name, get_Level5_Name_A, set_Level5_Name_A, get_Client_ID, set_Client_ID, get_Amount, set_Amount, get_Approval, set_Approval, get_Reject, set_Reject, get_Transaction_Level5_ID, set_Transaction_Level5_ID, get_Transaction_Level5_Name, set_Transaction_Level5_Name, Clear_Record, Clear_Data, Fill_Grid
```

---

### 3.8 شاشة: حافظة صرف أوراق الدفع المسحوبة (`Cheques_Issue_Receipt_Form`)
- **الاسم الإنجليزي:** Issued Cheques Clearance
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** تسجيل صرف الشيكات الصادرة المسحوبة على حسابات الشركة بعد خصمها من البنك
- **جداول قاعدة البيانات المستهدفة:** `Cheques_Issue_Receipt_Head`, `Cheques_Issue_Receipt_Details`

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
| `Note_No` | **رقم الحركة / السند** | `RadTextBox` | `Cheques_Issue_Receipt_Head.Note_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Cheques_Issue_Receipt_Head.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Cheques_Issue_Receipt_Head.Entry_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `Note_Date` | **تاريخ الحركة** | `RadDateTimePicker` | `Cheques_Issue_Receipt_Head.Note_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `RadTextBox` | `Cheques_Issue_Receipt_Head.Note_Net_Text` | `nvarchar(300)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `RadPanel7` | **RadPanel7** | `RadPanel` | - | - | - | - |
| `Description` | **البيان / الشرح** | `RadTextBox` | `Cheques_Issue_Receipt_Head.Description` | `nvarchar(300)` (NOT NULL) | `(' ')` | - |
| `Label19` | **Label19** | `Label` | - | - | - | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `Note_Net` | **الصافي المستحق** | `RadTextBox` | - | - | - | `Net = Total - Discount + Tax` |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Label7` | **Label7** | `Label` | - | - | - | - |
| `Debit_Level4_ID` | **كود الحساب المستوى 4** | `RadTextBox` | - | - | - | - |
| `Adjustment_GridView` | **Adjustment_GridView** | `DataGridView` | - | - | - | - |
| `Print_Journal` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Label1` | **Label1** | `Label` | - | - | - | - |
| `Label3` | **Label3** | `Label` | - | - | - | - |
| `Bank_Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Bank_Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Cheques_Issue_Receipt_Details.Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Balance_Adap` | **الرصيد / الفارق** | `SqlDataAdapter` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Adap_Print` | **زر طباعة التقرير / السند** | `SqlDataAdapter` | - | - | - | - |
| `Adap_H` | **Adap_H** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D` | **Adap_D** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D_V0` | **Adap_D_V0** | `SqlDataAdapter` | - | - | - | - |
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
| `Link_Adap` | **Link_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Profile_Adap` | **Profile_Adap** | `OleDbDataAdapter` | - | - | - | - |
| `Balance_RRS` | **الرصيد / الفارق** | `DataSet` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `RRS_Print` | **زر طباعة التقرير / السند** | `DataSet` | - | - | - | - |
| `RRS_H` | **RRS_H** | `DataSet` | - | - | - | - |
| `RRS_D` | **RRS_D** | `DataSet` | - | - | - | - |
| `RRS_D_V0` | **RRS_D_V0** | `DataSet` | - | - | - | - |
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب إدخال رقم حساب البنك 
- **[Calculation]** حساب تلقائي لحقل الصافي تفقيطاً (كتابة بالكلمات): Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
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
Select * From Users Where User_ID=
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
Select * From Cheques_Issues_View Where Cheque_Status=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM Cheques_Issue_Receipt_Head Order By Note_No Desc
```
##### استعلام INSERT على جدول `Cheques_Issue_Receipt_Head`:
```sql
Insert Into Cheques_Issue_Receipt_Head(Note_No,Note_Date,Description,Note_Debit,Note_Credit,Note_Net_Text,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Cheques_Issue_Receipt_Details`:
```sql
Insert Into Cheques_Issue_Receipt_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Transaction_Note_No,Account_ID,Account_Name_A)Values(
```
##### استعلام INSERT على جدول `Cheques_Issue_Receipt_Details`:
```sql
Insert Into Cheques_Issue_Receipt_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Transaction_Note_No,Account_ID,Account_Name_A)Values(
```
##### استعلام INSERT على جدول `Cheques_Issue_Receipt_Details`:
```sql
Insert Into Cheques_Issue_Receipt_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Transaction_Note_No,Account_ID,Account_Name_A)Values(
```
##### استعلام INSERT على جدول `Cheques_Issue_Receipt_Details`:
```sql
Insert Into Cheques_Issue_Receipt_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Transaction_Note_No,Account_ID,Account_Name_A)Values(
```
##### استعلام UPDATE على جدول `Cheques_Issue_Receipt_Head`:
```sql
Update Cheques_Issue Set Cheque_Status='
```
##### استعلام INSERT على جدول `Cheques_Issue_Receipt_Details`:
```sql
Insert Into Cheques_Issue_Receipt_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Transaction_Note_No,Account_ID,Account_Name_A,Flag_N)Values(
```
##### استعلام INSERT على جدول `Cheques_Issue_Receipt_Details`:
```sql
Insert Into Cheques_Issue_Receipt_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Transaction_Note_No,Account_ID,Account_Name_A,Flag_N)Values(
```
##### استعلام INSERT على جدول `Cheques_Issue_Receipt_Details`:
```sql
Insert Into Cheques_Issue_Receipt_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Transaction_Note_No,Account_ID,Account_Name_A,Flag_N)Values(
```
##### استعلام INSERT على جدول `Cheques_Issue_Receipt_Details`:
```sql
Insert Into Cheques_Issue_Receipt_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Transaction_Note_No,Account_ID,Account_Name_A,Flag_N)Values(
```
##### استعلام UPDATE على جدول `Cheques_Issue_Receipt_Head`:
```sql
Update Cheques_Issue Set Cheque_Status='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Cheques_Issue_Receipt_Head Where Note_No=
```
##### استعلام UPDATE على جدول `Cheques_Issue_Receipt_Head`:
```sql
Update Cheques_Issue_Receipt_Head Set Note_No=
```
##### استعلام UPDATE على جدول `Cheques_Issue_Receipt_Head`:
```sql
Update Cheques_Issue Set Cheque_Status='
```
##### استعلام DELETE على جدول `Cheques_Issue_Receipt_Details`:
```sql
Delete From Cheques_Issue_Receipt_Details Where Note_No=
```
##### استعلام INSERT على جدول `Cheques_Issue_Receipt_Details`:
```sql
Insert Into Cheques_Issue_Receipt_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Transaction_Note_No,Account_ID,Account_Name_A)Values(
```
##### استعلام INSERT على جدول `Cheques_Issue_Receipt_Details`:
```sql
Insert Into Cheques_Issue_Receipt_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Transaction_Note_No,Account_ID,Account_Name_A)Values(
```
##### استعلام INSERT على جدول `Cheques_Issue_Receipt_Details`:
```sql
Insert Into Cheques_Issue_Receipt_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Transaction_Note_No,Account_ID,Account_Name_A)Values(
```
##### استعلام INSERT على جدول `Cheques_Issue_Receipt_Details`:
```sql
Insert Into Cheques_Issue_Receipt_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Transaction_Note_No,Account_ID,Account_Name_A)Values(
```
##### استعلام UPDATE على جدول `Cheques_Issue_Receipt_Head`:
```sql
Update Cheques_Issue Set Cheque_Status='
```
##### استعلام INSERT على جدول `Cheques_Issue_Receipt_Details`:
```sql
Insert Into Cheques_Issue_Receipt_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Transaction_Note_No,Account_ID,Account_Name_A,Flag_N)Values(
```
##### استعلام INSERT على جدول `Cheques_Issue_Receipt_Details`:
```sql
Insert Into Cheques_Issue_Receipt_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Transaction_Note_No,Account_ID,Account_Name_A,Flag_N)Values(
```
##### استعلام INSERT على جدول `Cheques_Issue_Receipt_Details`:
```sql
Insert Into Cheques_Issue_Receipt_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Transaction_Note_No,Account_ID,Account_Name_A,Flag_N)Values(
```
##### استعلام INSERT على جدول `Cheques_Issue_Receipt_Details`:
```sql
Insert Into Cheques_Issue_Receipt_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Transaction_Note_No,Account_ID,Account_Name_A,Flag_N)Values(
```
##### استعلام UPDATE على جدول `Cheques_Issue_Receipt_Head`:
```sql
Update Cheques_Issue Set Cheque_Status='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Cheques_Issue_Receipt_Head Where Note_No=
```
##### استعلام DELETE على جدول `Cheques_Issue_Receipt_Head`:
```sql
Delete From Cheques_Issue_Receipt_Head where Note_No=
```
##### استعلام UPDATE على جدول `Cheques_Issue_Receipt_Head`:
```sql
Update Cheques_Issue Set Cheque_Status='
```
##### استعلام DELETE على جدول `Cheques_Issue_Receipt_Details`:
```sql
Delete From Cheques_Issue_Receipt_Details where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Cheques_Issue_Receipt_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Cheques_Issue_Receipt_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Cheques_Issue_Receipt_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Cheques_Issue_Receipt_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Cheques_Issue_Receipt_Head_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Cheques_Issue_Receipt_Head_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Cheques_Issue_Receipt_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Cheques_Issue_Receipt_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Cheques_Issue_Receipt_Head_View Order By Note_No DESC
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Cheques_Issue_Receipt_Form_Load, Cheques_Issue_Receipt_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Option1_Click, Search_Option1_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Note_No_GotFocus, Note_No_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Note_Date_GotFocus, Note_Date_KeyDown, Note_Date_KeyPress, Note_Date_Opened, Note_Date_ValueChanged, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, Debit_Description_KeyPress, Debit_Description_GotFocus, Debit_Description_KeyDown, Bank_Level5_Name_A_GotFocus, Bank_Level5_Name_A_KeyDown, Bank_Level5_Name_A_LostFocus, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, Bank_Level5_ID_GotFocus, Bank_Level5_ID_KeyPress, Bank_Level5_ID_KeyDown, Bank_Level5_ID_LostFocus, Search_Txt_LostFocus, Note_No_KeyPress, Note_No_LostFocus, Note_Net_Text_LostFocus, Description_LostFocus, Credit_Amount_GotFocus, Credit_Amount_KeyDown, Credit_Amount_LostFocus, Adjustment_GridView_KeyDown, Print_Journal_Click, Print_Journal_KeyDown, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_Search_Option1, set_Search_Option1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_Note_No, set_Note_No, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_Note_Date, set_Note_Date, get_Level5_GridView, set_Level5_GridView, get_Note_Net_Text, set_Note_Net_Text, get_AquaTheme1, set_AquaTheme1, get_RadPanel7, set_RadPanel7, get_Description, set_Description, get_Label19, set_Label19, get_RadLabel8, set_RadLabel8, get_Note_Net, set_Note_Net, get_Label5, set_Label5, get_Label6, set_Label6, get_Label7, set_Label7, get_Debit_Level4_ID, set_Debit_Level4_ID, get_Adjustment_GridView, set_Adjustment_GridView, get_Print_Journal, set_Print_Journal, get_Label1, set_Label1, get_Label3, set_Label3, get_Bank_Level5_Name_A, set_Bank_Level5_Name_A, get_Bank_Level5_ID, set_Bank_Level5_ID, get_SR, set_SR, get_Transaction_Note_No, set_Transaction_Note_No, get_Currency_ID, set_Currency_ID, get_Exchange, set_Exchange, get_Actual_Amount, set_Actual_Amount, get_Cheque_Date, set_Cheque_Date, get_Cheque_No, set_Cheque_No, get_Bank_Name, set_Bank_Name, get_Cheque_Name, set_Cheque_Name, get_Account_ID, set_Account_ID, get_Account_Name_A, set_Account_Name_A, get_Amount, set_Amount, get_Approval, set_Approval, get_Reject, set_Reject, get_Level5_ID, set_Level5_ID, get_Level5_Name_A, set_Level5_Name_A, Clear_Record, Clear_Data, Fill_Grid, Fill_Level5_Grid, Lock_Control, Enable_Control, Review_Record, Find_Total, Cheques_Issue_Receipt_Form_KeyDown
```

---

### 3.9 شاشة: حركات ومتابعة حالة الشيكات (`Cheques_Transaction_Form`)
- **الاسم الإنجليزي:** Cheque Status & Lifecycle Tracking
- **فضاء التسمية البرمجي (Namespace):** `Apps_Application_2017`
- **الوظيفة والغرض التشغيلي (Purpose):** متابعة دورة حياة الشيك (تحت التحصيل، مرتد، ملغى، مظهر، محصل)
- **جداول قاعدة البيانات المستهدفة:** `Cheques_Transaction_Head`, `Cheques_Transaction_Details`

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
| `Note_No` | **رقم الحركة / السند** | `RadTextBox` | `Cheques_Transaction_Head.Note_No` | `int` (PRIMARY KEY, NOT NULL) | `((0))` | - |
| `RadPanel2` | **RadPanel2** | `RadPanel` | - | - | - | - |
| `RadPanel3` | **RadPanel3** | `RadPanel` | - | - | - | - |
| `Entry_Name` | **اسم مدخل البيانات** | `RadTextBox` | `Cheques_Transaction_Head.Entry_Name` | `nvarchar(50)` (NOT NULL) | `(' ')` | - |
| `Entry_ID` | **رقم مدخل البيانات** | `RadTextBox` | `Cheques_Transaction_Head.Entry_ID` | `smallint` (NOT NULL) | `((0))` | - |
| `DesertTheme1` | **DesertTheme1** | `DesertTheme` | - | - | - | - |
| `RadPanel1` | **RadPanel1** | `RadPanel` | - | - | - | - |
| `Office2007BlackTheme1` | **Office2007BlackTheme1** | `Office2007BlackTheme` | - | - | - | - |
| `Note_Date` | **تاريخ الحركة** | `RadDateTimePicker` | `Cheques_Transaction_Head.Note_Date` | `nvarchar(10)` (NOT NULL) | `(' ')` | - |
| `Credit_Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Cheques_Transaction_Details.Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Level5_GridView` | **Level5_GridView** | `RadGridView` | - | - | - | - |
| `Note_Net_Text` | **الصافي تفقيطاً (كتابة بالكلمات)** | `RadTextBox` | `Cheques_Transaction_Head.Note_Net_Text` | `nvarchar(300)` (NOT NULL) | `(' ')` | `Net = Total - Discount + Tax` |
| `AquaTheme1` | **AquaTheme1** | `AquaTheme` | - | - | - | - |
| `RadPanel7` | **RadPanel7** | `RadPanel` | - | - | - | - |
| `Description` | **البيان / الشرح** | `RadTextBox` | `Cheques_Transaction_Head.Description` | `nvarchar(300)` (NOT NULL) | `(' ')` | - |
| `Debit_Level5_ID` | **كود الحساب الفرعي** | `RadTextBox` | `Cheques_Transaction_Details.Level5_ID` | `numeric` (NOT NULL) | `((0))` | - |
| `Credit_Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Debit_Level5_Name_A` | **اسم الحساب الفرعي** | `RadTextBox` | - | - | - | - |
| `Label19` | **Label19** | `Label` | - | - | - | - |
| `RadLabel8` | **RadLabel8** | `RadLabel` | - | - | - | - |
| `Note_Net` | **الصافي المستحق** | `RadTextBox` | - | - | - | `Net = Total - Discount + Tax` |
| `Label5` | **Label5** | `Label` | - | - | - | - |
| `Label6` | **Label6** | `Label` | - | - | - | - |
| `Label7` | **Label7** | `Label` | - | - | - | - |
| `Label21` | **Label21** | `Label` | - | - | - | - |
| `Label22` | **Label22** | `Label` | - | - | - | - |
| `Label2` | **Label2** | `Label` | - | - | - | - |
| `Label9` | **Label9** | `Label` | - | - | - | - |
| `Debit_Level4_ID` | **كود الحساب المستوى 4** | `RadTextBox` | - | - | - | - |
| `Adjustment_GridView` | **Adjustment_GridView** | `DataGridView` | - | - | - | - |
| `Print_Journal` | **زر طباعة التقرير / السند** | `RadButton` | - | - | - | - |
| `Balance_Adap` | **الرصيد / الفارق** | `SqlDataAdapter` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `Adap_Print` | **زر طباعة التقرير / السند** | `SqlDataAdapter` | - | - | - | - |
| `Adap_H` | **Adap_H** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D` | **Adap_D** | `SqlDataAdapter` | - | - | - | - |
| `Adap_D_V0` | **Adap_D_V0** | `SqlDataAdapter` | - | - | - | - |
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
| `Link_Adap` | **Link_Adap** | `SqlDataAdapter` | - | - | - | - |
| `Profile_Adap` | **Profile_Adap** | `OleDbDataAdapter` | - | - | - | - |
| `Balance_RRS` | **الرصيد / الفارق** | `DataSet` | - | - | - | `Balance = Previous_Balance + Debit - Credit` |
| `RRS_Print` | **زر طباعة التقرير / السند** | `DataSet` | - | - | - | - |
| `RRS_H` | **RRS_H** | `DataSet` | - | - | - | - |
| `RRS_D` | **RRS_D** | `DataSet` | - | - | - | - |
| `RRS_D_V0` | **RRS_D_V0** | `DataSet` | - | - | - | - |
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
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيد المطلوب  
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء إضافة سجل جديد. للخروج يجب الضغط على الغاء الإضافة ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الخروج أثناء تعديل سجل . للخروج يجب الضغط على الغاء التعديل ثم الضغط على خروج 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن التنقل أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء إضافة سجل جديد 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: لا يمكن الطباعة أثناء تعديل سجل 
- **[Validation Guard]** قيد تحقق ومنع أخطاء: يجب تحديد القيد المطلوب  
- **[Calculation]** حساب تلقائي لحقل الصافي تفقيطاً (كتابة بالكلمات): Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
- **[Calculation]** حساب تلقائي لحقل الصافي المستحق: Net = Total - Discount + Tax (المعادلة: `Net = Total - Discount + Tax`)
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
Select * From Users Where User_ID=
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
Select * From Cheques_View Where Cheque_Status=
```
##### استعلام SELECT على جدول ``:
```sql
Select top 1 Note_No FROM Cheques_Transaction_Head Order By Note_No Desc
```
##### استعلام INSERT على جدول `Cheques_Transaction_Head`:
```sql
Insert Into Cheques_Transaction_Head(Note_No,Note_Date,Description,Note_Debit,Note_Credit,Note_Net_Text,Entry_ID,Entry_Name)Values(
```
##### استعلام INSERT على جدول `Cheques_Transaction_Details`:
```sql
Insert Into Cheques_Transaction_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Transaction_Note_No,Client_Name)Values(
```
##### استعلام INSERT على جدول `Cheques_Transaction_Details`:
```sql
Insert Into Cheques_Transaction_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Transaction_Note_No,Client_Name)Values(
```
##### استعلام UPDATE على جدول `Cheques_Transaction_Head`:
```sql
Update Cheques Set Cheque_Status='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Cheques_Transaction_Head Where Note_No=
```
##### استعلام UPDATE على جدول `Cheques_Transaction_Head`:
```sql
Update Cheques_Transaction_Head Set Note_No=
```
##### استعلام UPDATE على جدول `Cheques_Transaction_Head`:
```sql
Update Cheques Set Cheque_Status='
```
##### استعلام DELETE على جدول `Cheques_Transaction_Details`:
```sql
Delete From Cheques_Transaction_Details Where Note_No=
```
##### استعلام INSERT على جدول `Cheques_Transaction_Details`:
```sql
Insert Into Cheques_Transaction_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Debit,Debit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Transaction_Note_No,Client_Name)Values(
```
##### استعلام INSERT على جدول `Cheques_Transaction_Details`:
```sql
Insert Into Cheques_Transaction_Details(Note_No,SR,Level5_ID,Description,Currency_ID,Exchange,Actual_Credit,Credit,Cheque_No,Cheque_Date,Bank_Name,Cheque_Name,Transaction_Note_No,Client_Name)Values(
```
##### استعلام UPDATE على جدول `Cheques_Transaction_Head`:
```sql
Update Cheques Set Cheque_Status='
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Cheques_Transaction_Head Where Note_No=
```
##### استعلام DELETE على جدول `Cheques_Transaction_Head`:
```sql
Delete From Cheques_Transaction_Head where Note_No=
```
##### استعلام UPDATE على جدول `Cheques_Transaction_Head`:
```sql
Update Cheques Set Cheque_Status='
```
##### استعلام DELETE على جدول `Cheques_Transaction_Details`:
```sql
Delete From Cheques_Transaction_Details where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Cheques_Transaction_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Cheques_Transaction_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Cheques_Transaction_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Cheques_Transaction_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Cheques_Transaction_Head_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Module_Type>
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Search_Field Like '%
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Module_Type>
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Module_Type>
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Module_Type>
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Level5_View Where Level5_ID=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Cheques_Transaction_Head_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Cheques_Transaction_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * From Cheques_Transaction_Details_View Where Note_No=
```
##### استعلام SELECT على جدول ``:
```sql
Select * FROM Cheques_Transaction_Head_View Order By Note_No DESC
```

#### د. معالجات الأحداث البرمجية المكتشفة (Dissected Event Handlers)
```text
Cheques_Transaction_Form_Load, Cheques_Transaction_Form_Resize, Add_Click, Add_KeyDown, Modify_Click, Modify_KeyDown, Save_Click, Save_KeyDown, Delete_Click, Delete_KeyDown, Print_Click, Print_KeyDown, F_Exit_Click, F_Exit_KeyDown, GridView_CellClick1, GridView_CellFormatting, GridView_KeyDown, Search_Option1_Click, Search_Option1_KeyDown, Search_Txt_GotFocus, Search_Txt_TextChanged, Search_Txt_KeyPress, Search_Txt_KeyDown, Note_No_GotFocus, Note_No_KeyDown, Entry_ID_KeyDown, Entry_Name_KeyDown, Note_Date_GotFocus, Note_Date_KeyDown, Note_Date_KeyPress, Note_Date_Opened, Note_Date_ValueChanged, Credit_Level5_ID_GotFocus, Credit_Level5_ID_KeyDown, Credit_Level5_ID_KeyPress, Credit_Level5_Name_A_GotFocus, Credit_Level5_Name_A_KeyDown, Level5_GridView_CellClick, Level5_GridView_CellFormatting, Level5_GridView_KeyDown, Debit_Description_KeyPress, Debit_Level5_ID_GotFocus, Debit_Level5_ID_KeyDown, Debit_Description_GotFocus, Debit_Description_KeyDown, Debit_Level5_Name_A_GotFocus, Debit_Level5_Name_A_KeyDown, Note_Net_Text_GotFocus, Note_Net_Text_KeyDown, Debit_Level5_ID_KeyPress, Search_Txt_LostFocus, Note_No_KeyPress, Note_No_LostFocus, Note_Net_Text_LostFocus, Debit_Level5_Name_A_LostFocus, Debit_Level5_ID_LostFocus, Credit_Level5_Name_A_LostFocus, Credit_Level5_ID_LostFocus, Debit_Description_LostFocus, Credit_Amount_GotFocus, Credit_Amount_KeyDown, Credit_Amount_LostFocus, Adjustment_GridView_KeyDown, Print_Journal_Click, Print_Journal_KeyDown, Dispose, InitializeComponent, get_Windows7Theme1, set_Windows7Theme1, get_Search_Option1, set_Search_Option1, get_ToolTip1, set_ToolTip1, get_Save, set_Save, get_Delete, set_Delete, get_F_Exit, set_F_Exit, get_Print, set_Print, get_Add, set_Add, get_Modify, set_Modify, get_Search_Txt, set_Search_Txt, get_GridView, set_GridView, get_Note_No, set_Note_No, get_RadPanel2, set_RadPanel2, get_RadPanel3, set_RadPanel3, get_Entry_Name, set_Entry_Name, get_Entry_ID, set_Entry_ID, get_DesertTheme1, set_DesertTheme1, get_RadPanel1, set_RadPanel1, get_Office2007BlackTheme1, set_Office2007BlackTheme1, get_Note_Date, set_Note_Date, get_Credit_Level5_ID, set_Credit_Level5_ID, get_Level5_GridView, set_Level5_GridView, get_Note_Net_Text, set_Note_Net_Text, get_AquaTheme1, set_AquaTheme1, get_RadPanel7, set_RadPanel7, get_Description, set_Description, get_Debit_Level5_ID, set_Debit_Level5_ID, get_Credit_Level5_Name_A, set_Credit_Level5_Name_A, get_Debit_Level5_Name_A, set_Debit_Level5_Name_A, get_Label19, set_Label19, get_RadLabel8, set_RadLabel8, get_Note_Net, set_Note_Net, get_Label5, set_Label5, get_Label6, set_Label6, get_Label7, set_Label7, get_Label21, set_Label21, get_Label22, set_Label22, get_Label2, set_Label2, get_Label9, set_Label9, get_Debit_Level4_ID, set_Debit_Level4_ID, get_Adjustment_GridView, set_Adjustment_GridView, get_Print_Journal, set_Print_Journal, get_SR, set_SR, get_Transaction_Note_No, set_Transaction_Note_No, get_Currency_ID, set_Currency_ID, get_Exchange, set_Exchange, get_Actual_Amount, set_Actual_Amount, get_Cheque_Date, set_Cheque_Date, get_Cheque_No, set_Cheque_No, get_Bank_Name, set_Bank_Name, get_Cheque_Name, set_Cheque_Name, get_Level5_Name_A, set_Level5_Name_A, get_Amount, set_Amount, get_Cheque_Status, set_Cheque_Status, Clear_Record, Clear_Data, Fill_Grid, Fill_Level5_Grid, Lock_Control, Enable_Control, Review_Record, Find_Total, Cheques_Transaction_Form_KeyDown
```

---

