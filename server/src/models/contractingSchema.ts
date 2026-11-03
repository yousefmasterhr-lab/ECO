/**
 * ECO ERP - Phase 03 Contracting, Projects & Extracts Verbatim Schema
 * Extracted directly from Phase_03_ContractingProjects_Spec.md & tarabot_erp_complete_schema.json
 */

// ==========================================
// 1. SUBCONTRACTOR CONTRACTS (عقود مقاولي الباطن)
// Forms: Contracts_Form -> Contracts_Head, Contracts_Details
// ==========================================
export interface SubcontractorContractHeadEntity {
  Contract_No: number;            // int, PRIMARY KEY
  Note_Date: string;              // nvarchar(10), YYYY-MM-DD
  Note_Date_H?: string;           // nvarchar(10)
  Credit_Level5_ID: number;       // numeric(18, 0) - Subcontractor Payable Account (e.g. 2101001)
  Analysis_ID?: number;           // numeric(18, 0) - Subcontractor Code/Analysis
  Costcenter_ID: number;          // numeric(18, 0) - Project Cost Center
  Note_Actual_Qty?: number;       // float
  Note_Qty?: number;              // float
  Note_Total: number;             // float / DECIMAL(18, 4)
  Note_Net_Text: string;          // nvarchar(250) - Tafqeet
  Work_Insurance_ID?: number;     // numeric(18, 0) - تأمين أعمال Account ID
  Work_Insurance_Per?: number;    // float - تأمين أعمال %
  Work_Balance_ID?: number;       // numeric(18, 0) - ضمان أعمال Account ID
  Work_Balance_Per?: number;      // float - ضمان أعمال %
  Work_Payments_ID?: number;      // numeric(18, 0) - دفعات مقدمة Account ID
  Work_Payments_Per?: number;     // float - استرداد دفعة مقدمة %
  Notice?: string;                // nvarchar(200)
  Contract_End?: boolean;         // bit
  Entry_ID: number;               // smallint
  Entry_Name: string;             // nvarchar(50)
}

export interface SubcontractorContractDetailsEntity {
  Contract_No: number;            // int, PRIMARY KEY
  SR: number;                     // int, PRIMARY KEY
  Level5_ID: number;              // numeric(18, 0) - BOQ Work Item Code
  Unit_Name: string;              // varchar(50) - e.g. 'متر مكعب', 'متر مربع', 'طن', 'عدد'
  Actual_Qty?: number;            // float
  Length?: number;                // float
  Width?: number;                 // float
  Qty: number;                    // float - Contract Quantity
  Price: number;                  // float - Unit Price
  Net: number;                    // float - Total = Qty * Price
}

// ==========================================
// 2. CLIENT / OWNER CONTRACTS (عقود المالك والعملاء)
// Forms: Contracts_Form_For_Clients -> Contracts_Head_For_Clients, Contracts_Details_For_Clients
// ==========================================
export interface ClientContractHeadEntity {
  Contract_No: number;            // int, PRIMARY KEY
  Note_Date: string;              // nvarchar(10)
  Note_Date_H?: string;           // nvarchar(10)
  Credit_Level5_ID: number;       // numeric(18, 0) - Client Receivable Account (e.g. 1203001)
  Analysis_ID?: number;           // numeric(18, 0)
  Costcenter_ID: number;          // numeric(18, 0) - Project Cost Center
  Note_Actual_Qty?: number;       // float
  Note_Qty?: number;              // float
  Note_Total: number;             // float
  Note_Net_Text: string;          // nvarchar(250)
  Notice?: string;                // nvarchar(200)
  Entry_ID: number;               // smallint
  Entry_Name: string;             // nvarchar(50)
}

export interface ClientContractDetailsEntity {
  Contract_No: number;            // int, PRIMARY KEY
  SR: number;                     // int, PRIMARY KEY
  Level5_ID: number;              // numeric(18, 0)
  Unit_Name: string;              // varchar(50)
  Actual_Qty?: number;            // float
  Length?: number;                // float
  Width?: number;                 // float
  Qty: number;                    // float
  Price: number;                  // float
  Net: number;                    // float
}

// ==========================================
// 3. SUBCONTRACTOR PROGRESS EXTRACTS (مستخلصات مقاولي الباطن)
// Forms: Extracts_Form -> Extracts_Head, Extracts_Details (AbsProjectH, AbsProjectD)
// ==========================================
export interface SubcontractorExtractHeadEntity {
  Extract_No: number;             // int, PRIMARY KEY
  Extract_Date: string;           // nvarchar(10), YYYY-MM-DD
  Extract_Date_H?: string;        // nvarchar(10)
  Contract_No: number;            // int - Foreign Key -> Contracts_Head
  Credit_Level5_ID: number;       // numeric(18, 0) - Subcontractor Account
  Analysis_ID?: number;           // numeric(18, 0)
  Costcenter_ID: number;          // numeric(18, 0) - Project Cost Center
  Work_Insurance_ID?: number;     // numeric(18, 0)
  Work_Insurance_Per?: number;    // float
  Work_Insurance_Amount: number;  // float - خصم تأمين الأعمال المحتجز
  Work_Balance_ID?: number;       // numeric(18, 0)
  Work_Balance_Per?: number;      // float
  Work_Balance_Amount: number;    // float - خصم ضمان الأعمال المحتجز
  Work_Payments_ID?: number;      // numeric(18, 0)
  Work_Payments_Per?: number;     // float
  Work_Payments_Amount: number;   // float - خصم استرداد الدفعة المقدمة
  Nonconformities_ID?: number;    // numeric(18, 0)
  Nonconformities_Per?: number;   // float
  Nonconformities_Amount: number; // float - خصومات فنية وغرامات واختبارات
  Note_Actual_Qty?: number;       // float
  Note_Qty?: number;              // float
  Note_Total: number;             // float - إجمالي الأعمال الحالية (Gross)
  Note_Net: number;               // float - صافي المستحق للمقاول (Net Payable)
  Note_Net_Text: string;          // nvarchar(250) - Tafqeet
  Vat_Tax_Per?: number;           // float
  Vat_Tax_Amount?: number;        // float
  Note_Net_With_Tax?: number;     // float
  Notice?: string;                // nvarchar(200)
  Journal_No?: number;            // int - Linked General Ledger Journal Entry No
  Entry_ID: number;               // smallint
  Entry_Name: string;             // nvarchar(50)
}

export interface SubcontractorExtractDetailsEntity {
  Extract_No: number;             // int, PRIMARY KEY
  SR: number;                     // int, PRIMARY KEY
  Level5_ID: number;              // numeric(18, 0) - BOQ Item Code
  Unit_Name: string;              // varchar(50)
  Previous_Qty: number;           // float - الكمية السابقة المنفذة
  Actual_Qty: number;             // float - الكمية الحالية المنفذة
  Qty: number;                    // float - الكمية الحالية
  Total_Qty: number;              // float - الكمية الإجمالية التراكمية (Prev + Current)
  Price: number;                  // float - سعر الفئة التعاقدي
  Net: number;                    // float - إجمالي البند = Qty * Price
  Completion_Rate: number;        // float - نسبة الصرف / الإنجاز المعتمدة %
  Completion_Net: number;         // float - صافي المستحق للبند بعد نسبة الإنجاز
  Description?: string;           // nvarchar(300)
}

// ==========================================
// 4. CLIENT / OWNER EXTRACTS (مستخلصات المالك والعملاء)
// Forms: Extracts_Form_For_Clients -> Extracts_Head_For_Clients, Extracts_Details_For_Clients
// ==========================================
export interface ClientExtractHeadEntity {
  Extract_No: number;             // int, PRIMARY KEY
  Extract_Date: string;           // nvarchar(10)
  Extract_Date_H?: string;        // nvarchar(10)
  Contract_No: number;            // int
  Credit_Level5_ID: number;       // numeric(18, 0) - Client Account
  Analysis_ID?: number;           // numeric(18, 0)
  Costcenter_ID: number;          // numeric(18, 0)
  Note_Actual_Qty?: number;       // float
  Note_Qty?: number;              // float
  Note_Total: number;             // float - Gross Amount
  Note_Net_Text: string;          // nvarchar(250)
  Discount_Amount?: number;       // float
  Note_Net: number;               // float - Net Due from Owner
  Vat_Tax_Per?: number;           // float
  Vat_Tax_Amount?: number;        // float
  Note_Net_With_Tax?: number;     // float
  Notice?: string;                // nvarchar(200)
  Vat_No_For_Invoice?: string;    // nvarchar(50)
  Journal_No?: number;            // int
  Entry_ID: number;               // smallint
  Entry_Name: string;             // nvarchar(50)
}

export interface ClientExtractDetailsEntity {
  Extract_No: number;             // int, PRIMARY KEY
  SR: number;                     // int, PRIMARY KEY
  Level5_ID: number;              // numeric(18, 0)
  Unit_Name: string;              // varchar(50)
  Actual_Qty: number;             // float
  Length?: number;                // float
  Width?: number;                 // float
  Qty: number;                    // float
  Price: number;                  // float
  Net: number;                    // float
  Item_Vat_Amount?: number;       // float
  Item_Net_With_Vat?: number;     // float
}

// ==========================================
// 5. PROJECT COSTING & WORK ORDERS
// Tables: Projects_Cost_Head, Projects_Cost_Details, Job_Orders
// ==========================================
export interface ProjectCostHeadEntity {
  Note_No: number;                // int, PRIMARY KEY
  Note_Date: string;              // nvarchar(10)
  Note_Date_H?: string;           // nvarchar(10)
  Costcenter_ID: number;          // numeric(18, 0) - Project Cost Center
  Note_Qty?: number;              // float
  Note_Cost: number;              // float - Total Budgeted Cost
  Note_Project_Price: number;     // float - Total Contract Price
  Note_Net_Text: string;          // nvarchar(250)
  Notice?: string;                // nvarchar(200)
  Entry_ID: number;               // smallint
  Entry_Name: string;             // nvarchar(50)
}

export interface ProjectCostDetailsEntity {
  Note_No: number;                // int, PRIMARY KEY
  SR: number;                     // int, PRIMARY KEY
  Level5_ID: number;              // numeric(18, 0) - Cost Element / BOQ Item
  Qty: number;                    // float
  Cost: number;                   // float
  Project_Price: number;          // float
  Period?: number;                // int - Days
  Start_Date?: string;            // nvarchar(10)
  End_Date?: string;              // nvarchar(10)
}

export interface JobOrderEntity {
  Job_Order_No: number;           // int, PRIMARY KEY
  Job_Order_Date: string;         // nvarchar(10)
  Job_Order_Date_H?: string;      // nvarchar(10)
  Delivery_Date?: string;         // nvarchar(10)
  Job_Order_Name_A: string;       // nvarchar(100)
  Job_Order_Name_E?: string;      // nvarchar(100)
  Level5_ID?: number;             // numeric(18, 0)
  Production_Line_ID?: number;    // numeric(18, 0)
  Job_Order_Desc?: string;        // nvarchar(300)
  Entry_ID: number;               // smallint
  Entry_Name: string;             // nvarchar(50)
  Notice?: string;                // nvarchar(200)
}

// ==========================================
// 6. HIGH-LEVEL DTOs FOR APIS & UI
// ==========================================

export interface ProjectOverviewDTO {
  id: string;
  code: string;
  nameAr: string;
  costcenterId: number;
  ownerName: string;
  ownerAccountId: number;
  contractValue: number;
  totalExecutedValue: number;
  completionPercentage: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
}

export interface CreateSubcontractorContractDTO {
  noteDate: string;
  subcontractorAccountId: number; // Credit_Level5_ID (e.g. 2101001)
  subcontractorNameAr?: string;
  costcenterId: number;           // Project Cost Center
  advancePaymentPercentage?: number;
  advancePaymentAccountId?: number;
  retentionPercentage?: number;   // ضمان أعمال %
  retentionAccountId?: number;
  insurancePercentage?: number;   // تأمين أعمال %
  insuranceAccountId?: number;
  notice?: string;
  items: Array<{
    itemCode: number;             // Level5_ID
    description: string;
    unit: string;
    qty: number;
    price: number;
  }>;
  entryName?: string;
}

export interface CreateExtractDTO {
  extractType: 'SUBCONTRACTOR' | 'OWNER';
  extractDate: string;
  contractNo: number;
  partyAccountId: number;         // Subcontractor or Owner Account ID
  partyNameAr?: string;
  costcenterId: number;           // Project Cost Center
  advanceRecoveryRate?: number;   // %
  advanceRecoveryAccountId?: number;
  retentionRate?: number;         // %
  retentionAccountId?: number;
  insuranceRate?: number;         // %
  insuranceAccountId?: number;
  penaltiesAndLabAmount?: number; // غرامات وتجارب معملية
  withholdingTaxRate?: number;    // % ضريبة الخصم والإضافة (default 1%)
  vatRate?: number;               // % ضريبة القيمة المضافة (default 14%)
  notice?: string;
  lines: Array<{
    itemCode: number;
    description: string;
    unit: string;
    previousQty: number;
    currentQty: number;
    unitPrice: number;
    completionRate: number;       // % (100% or partial)
  }>;
  entryName?: string;
}

