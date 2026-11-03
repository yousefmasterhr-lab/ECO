/**
 * ECO ERP - Tarabot ERP Verbatim Schema Definitions (Phase 01)
 * Source of Truth: tarabot_erp_complete_schema.json & Phase_01_GeneralLedger_Spec.md
 */

// 1. Level1 (دليل الحسابات - المستوى الأول)
export interface Level1Entity {
  Parent_ID: number;           // smallint, NOT NULL, Default: ((1))
  Level1_ID: number;           // smallint, PRIMARY KEY, NOT NULL (e.g. 1: الأصول, 2: الخصوم, 3: المصروفات)
  Level1_Name_A: string;       // nvarchar(100), NOT NULL
  Level1_Name_E: string;       // nvarchar(100), NOT NULL
  Entry_ID: number;            // smallint, NOT NULL, Default: ((1))
  Entry_Name: string;          // nvarchar(50), NOT NULL
  Notice: string;              // nvarchar(200), NOT NULL, Default: (' ')
}

// 2. Level2 (دليل الحسابات - المستوى الثاني)
export interface Level2Entity {
  Level1_ID: number;           // smallint, NOT NULL, FK -> Level1.Level1_ID
  Level2_ID: number;           // smallint, PRIMARY KEY, NOT NULL
  Level2_Name_A: string;       // nvarchar(100), NOT NULL
  Level2_Name_E: string;       // nvarchar(100), NOT NULL
  Entry_ID: number;            // smallint, NOT NULL
  Entry_Name: string;          // nvarchar(50), NOT NULL
  Notice: string;              // nvarchar(200), NOT NULL
}

// 3. Level3 (دليل الحسابات - المستوى الثالث)
export interface Level3Entity {
  Level2_ID: number;           // smallint, NOT NULL, FK -> Level2.Level2_ID
  Level3_ID: number;           // smallint, PRIMARY KEY, NOT NULL
  Level3_Name_A: string;       // nvarchar(100), NOT NULL
  Level3_Name_E: string;       // nvarchar(100), NOT NULL
  Entry_ID: number;            // smallint, NOT NULL
  Entry_Name: string;          // nvarchar(50), NOT NULL
  Notice: string;              // nvarchar(200), NOT NULL
}

// 4. Level4 (دليل الحسابات - المستوى الرابع)
export interface Level4Entity {
  Level3_ID: number;           // smallint, NOT NULL, FK -> Level3.Level3_ID
  Level4_ID: number;           // smallint, PRIMARY KEY, NOT NULL
  Level4_Name_A: string;       // nvarchar(100), NOT NULL
  Level4_Name_E: string;       // nvarchar(100), NOT NULL
  Entry_ID: number;            // smallint, NOT NULL
  Entry_Name: string;          // nvarchar(50), NOT NULL
  Notice: string;              // nvarchar(200), NOT NULL
}

// 5. Level5 (دليل الحسابات - المستوى الخامس التحليلي النهائي - الورقة / Leaf)
export interface Level5Entity {
  Level4_ID: number;           // smallint, NOT NULL, FK -> Level4.Level4_ID
  Level5_ID: number;           // numeric(18, 0), PRIMARY KEY, NOT NULL
  Level5_Name_A: string;       // nvarchar(150), NOT NULL
  Level5_Name_E: string;       // nvarchar(150), NOT NULL
  Account_Nature: number;      // smallint, NOT NULL (0: Debit/مدين, 1: Credit/دائن)
  Balance_Sheet_Type?: number; // smallint, NOT NULL, Default: 0
  Incom_Type?: number;         // smallint, NOT NULL, Default: 0
  Module_Type?: number;        // smallint, NOT NULL, Default: 0
  Is_Costcenter?: boolean;     // bit, NOT NULL, Default: 0 (Requires Cost Center on journal voucher)
  Is_Analysis?: boolean;       // bit, NOT NULL, Default: 0 (Requires Analytical Dimension)
  Entry_ID: number;            // smallint, NOT NULL
  Entry_Name: string;          // nvarchar(50), NOT NULL
  Notice: string;              // nvarchar(200), NOT NULL
}

// 6. Main_Costcenters (مراكز التكلفة الرئيسية)
export interface MainCostcenterEntity {
  Main_Costcenter_ID: number;       // smallint, PRIMARY KEY, NOT NULL
  Main_Costcenter_Name_A: string;   // nvarchar(100), NOT NULL
  Main_Costcenter_Name_E: string;   // nvarchar(100), NOT NULL
  Entry_ID: number;                 // smallint, NOT NULL
  Entry_Name: string;               // nvarchar(50), NOT NULL
  Notice: string;                   // nvarchar(200), NOT NULL
}

// 7. Costcenters (مراكز التكلفة الفرعية والتشغيلية)
export interface CostcenterEntity {
  Main_Costcenter_ID: number;       // smallint, NOT NULL, FK -> Main_Costcenters.Main_Costcenter_ID
  Costcenter_ID: number;            // numeric(18, 0), PRIMARY KEY, NOT NULL
  Costcenter_Name_A: string;        // nvarchar(150), NOT NULL
  Costcenter_Name_E: string;        // nvarchar(150), NOT NULL
  Entry_ID: number;                 // smallint, NOT NULL
  Entry_Name: string;               // nvarchar(50), NOT NULL
  Notice: string;                   // nvarchar(200), NOT NULL
}

// 8. Accounts_Analysis (الحسابات التحليلية)
export interface AccountsAnalysisEntity {
  Analysis_ID: number;              // numeric(18, 0), PRIMARY KEY, NOT NULL
  Analysis_Name_A: string;          // nvarchar(150), NOT NULL
  Analysis_Name_E: string;          // nvarchar(150), NOT NULL
  Entry_ID: number;                 // smallint, NOT NULL
  Entry_Name: string;               // nvarchar(50), NOT NULL
  Notice: string;                   // nvarchar(200), NOT NULL
}

// 9. GeneralLedger_Head (رأس سند قيد اليومية العام)
export interface GeneralLedgerHeadEntity {
  Note_No: number;             // int, PRIMARY KEY, NOT NULL (رقم الحركة / السند)
  Note_Type_ID: number;        // smallint, NOT NULL, Default: 201 (نوع القيد / قيود عامة)
  Note_Date: string;           // nvarchar(10), NOT NULL (YYYY/MM/DD)
  Note_Date_H?: string;        // nvarchar(10), NOT NULL (التاريخ الهجري)
  Journal_Type: number;        // smallint, NOT NULL, Default: 0
  Note_Debit: number;          // float -> Stored as DECIMAL(18, 4) in database
  Note_Credit: number;         // float -> Stored as DECIMAL(18, 4) in database
  Note_Net_Text: string;       // nvarchar(300), NOT NULL (الصافي تفقيطاً بالكلمات)
  Description: string;         // nvarchar(300), NOT NULL (البيان / الشرح العام)
  Entry_ID: number;            // smallint, NOT NULL (رقم مدخل البيانات)
  Entry_Name: string;          // nvarchar(50), NOT NULL (اسم مدخل البيانات)
  Flag: boolean;               // bit, NOT NULL, Default: 0 (حالة الاعتماد / التأكيد)
  Flag_N: number;              // smallint, NOT NULL, Default: 0
  Notice?: string;             // nvarchar(200)
  History_Edits?: string;      // nvarchar(MAX)
}

// 10. GeneralLedger_Details (تفاصيل وسطور سند قيد اليومية)
export interface GeneralLedgerDetailsEntity {
  Note_No: number;             // int, NOT NULL, FK -> GeneralLedger_Head.Note_No
  SR: number;                  // smallint, PRIMARY KEY (composite), NOT NULL (مسلسل السطر)
  Level5_ID: number;           // numeric(18, 0), NOT NULL, FK -> Level5.Level5_ID
  Description: string;         // nvarchar(300), NOT NULL (البيان / الشرح للسطر)
  Currency_ID: number;         // smallint, NOT NULL, Default: 1 (جنيه)
  Exchange: number;            // float -> DECIMAL(18, 4), Default: 1.0000
  Actual_Debit: number;        // float -> DECIMAL(18, 4), المدين بالعملة الأجنبية
  Debit: number;               // float -> DECIMAL(18, 4), المدين بالعملة المحلية
  Actual_Credit: number;       // float -> DECIMAL(18, 4), الدائن بالعملة الأجنبية
  Credit: number;              // float -> DECIMAL(18, 4), الدائن بالعملة المحلية
  Costcenter_ID: number;       // numeric(18, 0), NOT NULL, Default: 0
  Analysis_ID: number;         // numeric(18, 0), NOT NULL, Default: 0
  Job_Order_No?: number;       // numeric(18, 0), Default: 0
  Analyse1?: string;           // nvarchar(200), Default: '-'
  Analyse2?: string;           // nvarchar(200), Default: '-'
  Flag: boolean;               // bit, NOT NULL, Default: 0
  Flag_N: number;              // smallint, NOT NULL, Default: 0
  Notice?: string;             // nvarchar(200)
  History_Edits?: string;      // nvarchar(MAX)
}

// Complete Composite Voucher DTO
export interface CompleteVoucherDTO {
  head: GeneralLedgerHeadEntity;
  details: GeneralLedgerDetailsEntity[];
}

// Hierarchical Node for Chart of Accounts Tree Navigator
export interface ChartOfAccountsTreeNode {
  id: number;
  code: string;
  nameAr: string;
  nameEn: string;
  level: 1 | 2 | 3 | 4 | 5;
  parentId?: number;
  accountNature?: number; // 0: Debit, 1: Credit
  isLeaf: boolean;
  isCostcenter?: boolean;
  isAnalysis?: boolean;
  balance?: number;
  children?: ChartOfAccountsTreeNode[];
}
