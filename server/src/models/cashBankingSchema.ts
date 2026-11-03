/**
 * ECO ERP - Phase 02 Cash, Banking & Check Portfolio Verbatim Schema
 * Extracted directly from Phase_02_CashBanking_Spec.md & tarabot_erp_complete_schema.json
 */

// ==========================================
// 1. MASTER DATA: CURRENCIES
// ==========================================
export interface CurrencyEntity {
  Currency_ID: number;            // smallint, PRIMARY KEY
  Currency_Name_A: string;        // nvarchar(50)
  Currency_Name_E?: string;       // nvarchar(50)
  Currency_Sub_Name_A?: string;   // nvarchar(50)
  Exchange: number;               // float / DECIMAL(18, 4)
}

// ==========================================
// 2. CASH & BANK PAYMENT VOUCHERS (سندات الصرف)
// Forms: Payable_Form -> Payable_Head, Payable_Details
// ==========================================
export interface PayableHeadEntity {
  Note_No: number;                // int, PRIMARY KEY
  Note_Date: string;              // nvarchar(10), YYYY-MM-DD
  Description: string;            // nvarchar(300)
  Note_Debit: number;             // float / DECIMAL(18, 4)
  Note_Credit: number;            // float / DECIMAL(18, 4)
  Note_Net_Text: string;          // nvarchar(300) - Tafqeet
  Previous_Balance?: number;      // float
  Entry_ID: number;               // smallint
  Entry_Name: string;             // nvarchar(50)
  Flag?: boolean;                 // bit
}

export interface PayableDetailsEntity {
  Note_No: number;                // int
  SR: number;                     // int, 1-based index
  Level5_ID: number | string;     // numeric(18, 0)
  Description?: string;           // nvarchar(300)
  Currency_ID: number;            // smallint
  Exchange: number;               // float
  Actual_Debit?: number;          // float (foreign currency)
  Debit?: number;                 // float (base currency)
  Actual_Credit?: number;         // float (foreign currency)
  Credit?: number;                // float (base currency)
  Costcenter_ID?: number;         // numeric(18, 0)
  Analysis_ID?: number;           // numeric(18, 0)
  Analyse1?: string;              // nvarchar(200)
  Analyse2?: string;              // nvarchar(200)
  Flag?: boolean;                 // bit
}

// ==========================================
// 3. CASH & BANK RECEIPT VOUCHERS (سندات القبض)
// Forms: Receivable_Form -> Receivable_Head, Receivable_Details
// ==========================================
export interface ReceivableHeadEntity {
  Note_No: number;                // int, PRIMARY KEY
  Note_Date: string;              // nvarchar(10), YYYY-MM-DD
  Description: string;            // nvarchar(300)
  Note_Debit: number;             // float / DECIMAL(18, 4)
  Note_Credit: number;            // float / DECIMAL(18, 4)
  Note_Net_Text: string;          // nvarchar(300) - Tafqeet
  Previous_Balance?: number;      // float
  Entry_ID: number;               // smallint
  Entry_Name: string;             // nvarchar(50)
}

export interface ReceivableDetailsEntity {
  Note_No: number;                // int
  SR: number;                     // int
  Level5_ID: number | string;     // numeric(18, 0)
  Description?: string;           // nvarchar(300)
  Currency_ID: number;            // smallint
  Exchange: number;               // float
  Actual_Debit?: number;          // float
  Debit?: number;                 // float
  Actual_Credit?: number;         // float
  Credit?: number;                // float
  Costcenter_ID?: number;         // numeric(18, 0)
  Analysis_ID?: number;           // numeric(18, 0)
  Analyse1?: string;              // nvarchar(200)
  Analyse2?: string;              // nvarchar(200)
}

// ==========================================
// 4. OUTGOING BANK TRANSFERS (التحويلات البنكية الصادرة)
// Forms: Banks_Transfer_Issue_Form -> Banks_Transfers_Issue_Head, Banks_Transfers_Issue_Details
// ==========================================
export interface BanksTransfersIssueHeadEntity {
  Note_No: number;                // int, PRIMARY KEY
  Note_Date: string;              // nvarchar(10)
  Description: string;            // nvarchar(300)
  Note_Debit: number;             // float
  Note_Credit: number;            // float
  Note_Net_Text: string;          // nvarchar(300)
  Entry_ID: number;               // smallint
  Entry_Name: string;             // nvarchar(50)
  Flag?: boolean;                 // bit
}

export interface BanksTransfersIssueDetailsEntity {
  Note_No: number;                // int
  SR: number;                     // int
  Level5_ID: number | string;     // numeric(18, 0)
  Costcenter_ID?: number;         // numeric(18, 0)
  Analysis_ID?: number;           // numeric(18, 0)
  Description?: string;           // nvarchar(300)
  Currency_ID: number;            // smallint
  Exchange: number;               // float
  Actual_Debit?: number;          // float
  Debit?: number;                 // float
  Actual_Credit?: number;         // float
  Credit?: number;                // float
  Transfer_No?: string;           // nvarchar(20)
  Transfer_Date?: string;         // nvarchar(10)
  Bank_Name?: string;             // nvarchar(200)
  Flag?: boolean;                 // bit
}

// ==========================================
// 5. INCOMING BANK TRANSFERS (التحويلات البنكية الواردة)
// Forms: Banks_Transfer_Delivery_Form -> Banks_Transfers_Delivery_Head, Banks_Transfers_Delivery_Details
// ==========================================
export interface BanksTransfersDeliveryHeadEntity {
  Note_No: number;                // int, PRIMARY KEY
  Note_Date: string;              // nvarchar(10)
  Description: string;            // nvarchar(300)
  Note_Debit: number;             // float
  Note_Credit: number;            // float
  Note_Net_Text: string;          // nvarchar(300)
  Entry_ID: number;               // smallint
  Entry_Name: string;             // nvarchar(50)
}

export interface BanksTransfersDeliveryDetailsEntity {
  Note_No: number;                // int
  SR: number;                     // int
  Level5_ID: number | string;     // numeric(18, 0)
  Costcenter_ID?: number;         // numeric(18, 0)
  Description?: string;           // nvarchar(300)
  Currency_ID: number;            // smallint
  Exchange: number;               // float
  Actual_Debit?: number;          // float
  Debit?: number;                 // float
  Actual_Credit?: number;         // float
  Credit?: number;                // float
  Transfer_No?: string;           // nvarchar(20)
  Transfer_Date?: string;         // nvarchar(10)
  Bank_Name?: string;             // nvarchar(200)
}

// ==========================================
// 6. CHEQUES ISSUED (أوراق دفع / شيكات صادرة)
// Forms: Cheque_Issue_Form -> Cheques_Issue_Head, Cheques_Issue_Details
// ==========================================
export interface ChequesIssueHeadEntity {
  Note_No: number;                // int, PRIMARY KEY
  Note_Date: string;              // nvarchar(10)
  Description: string;            // nvarchar(300)
  Note_Debit: number;             // float
  Note_Credit: number;            // float
  Note_Net_Text: string;          // nvarchar(300)
  Journal_Type?: number;          // smallint
  Entry_ID: number;               // smallint
  Entry_Name: string;             // nvarchar(50)
  Flag?: boolean;                 // bit
}

export interface ChequesIssueDetailsEntity {
  Note_No: number;                // int
  SR: number;                     // int
  Level5_ID: number | string;     // numeric(18, 0) - Notes Payable Account (e.g. 2102001)
  Account_ID?: number;            // numeric(18, 0) - Beneficiary Account
  Costcenter_ID?: number;         // numeric(18, 0)
  Analysis_ID?: number;           // numeric(18, 0)
  Description?: string;           // nvarchar(300)
  Currency_ID: number;            // smallint
  Exchange: number;               // float
  Actual_Debit?: number;          // float
  Debit?: number;                 // float
  Actual_Credit?: number;         // float
  Credit?: number;                // float
  Cheque_No: string;              // nvarchar(20)
  Cheque_Date: string;            // nvarchar(10) - Due/Maturity Date
  Bank_Name: string;              // nvarchar(200) - Drawee Bank
  Cheque_Name: string;            // nvarchar(200) - Payee Name
  Flag?: boolean;                 // bit
}

// ==========================================
// 7. CHEQUES RECEIVED (أوراق قبض / شيكات واردة)
// Forms: Cheque_Delivery_Form -> Cheques_Delivery_Head, Cheques_Delivery_Details
// ==========================================
export interface ChequesDeliveryHeadEntity {
  Note_No: number;                // int, PRIMARY KEY
  Note_Date: string;              // nvarchar(10)
  Journal_Type?: number;          // smallint
  Description: string;            // nvarchar(300)
  Note_Debit: number;             // float
  Note_Credit: number;            // float
  Note_Net_Text: string;          // nvarchar(300)
  Entry_ID: number;               // smallint
  Entry_Name: string;             // nvarchar(50)
}

export interface ChequesDeliveryDetailsEntity {
  Note_No: number;                // int
  SR: number;                     // int
  Level5_ID: number | string;     // numeric(18, 0) - Notes Receivable Account (e.g. 1204001)
  Client_ID?: number;             // numeric(18, 0) - Customer Account
  Costcenter_ID?: number;         // numeric(18, 0)
  Analysis_ID?: number;           // numeric(18, 0)
  Description?: string;           // nvarchar(300)
  Currency_ID: number;            // smallint
  Exchange: number;               // float
  Actual_Debit?: number;          // float
  Debit?: number;                 // float
  Actual_Credit?: number;         // float
  Credit?: number;                // float
  Cheque_No: string;              // nvarchar(20)
  Cheque_Date: string;            // nvarchar(10) - Maturity Date
  Bank_Name: string;              // nvarchar(200) - Drawer/Client Bank
  Cheque_Name: string;            // nvarchar(200) - Drawer Name
}

// ==========================================
// 8. CHEQUES CLEARANCE & STATUS TRANSITIONS
// (حافظة تحصيل الشيكات / أوراق الدفع والقبض)
// ==========================================
export type ChequeStatus = 
  | 'UNDER_COLLECTION'   // أوراق قبض تحت التحصيل (Received)
  | 'DEPOSITED'          // مودع بالبنك للتحصيل (Deposited in Bank)
  | 'COLLECTED'          // محصل بالبنك (Cleared & Deposited into Bank Account)
  | 'BOUNCED'            // مرتد / مرفوض من البنك (Returned / Rejected)
  | 'ISSUED'             // شيك صادر للمستفيد (Note Payable Issued)
  | 'CLEARED'            // تم صرفه من البنك (Deducted from Bank Account)
  | 'CANCELLED';         // ملغي (Voided)

export interface ChequePortfolioItemDTO {
  id: string;
  voucherType: 'RECEIPT' | 'PAYMENT' | 'DELIVERY' | 'ISSUE';
  noteNo: number;
  sr: number;
  chequeNo: string;
  chequeDate: string;             // Maturity Date
  issueDate: string;
  amount: number;
  currencyId: number;
  currencyName: string;
  exchange: number;
  bankName: string;
  chequeName: string;             // Drawer or Payee
  beneficiaryOrClientId?: number | string;
  beneficiaryOrClientName?: string;
  portfolioAccountId: string;     // e.g. 1204001 or 2102001
  status: ChequeStatus;
  statusLabelAr: string;
  clearedDate?: string;
  clearedBankAccountId?: string;
  glVoucherNoteNo?: number;
}

// ==========================================
// 9. HIGH-LEVEL VOUCHER DTOs FOR APIS
// ==========================================
export interface CashSafeItemDTO {
  id: string;
  code: string;
  nameAr: string;
  linkedAccountId: string;        // Level5_ID
  accountBalance: number;
  currencyId: number;
  currencyName: string;
  cashierName?: string;
  isActive: boolean;
}

export interface BankAccountItemDTO {
  id: string;
  code: string;
  bankNameAr: string;
  accountNumber: string;
  iban?: string;
  linkedAccountId: string;        // Level5_ID
  accountBalance: number;
  currencyId: number;
  currencyName: string;
  facilityLimit?: number;
  isActive: boolean;
}

export interface CreatePaymentVoucherDTO {
  noteDate: string;
  safeOrBankAccountId: string;    // Level5_ID for credit (safe/bank)
  description: string;
  currencyId: number;
  exchange: number;
  lines: Array<{
    targetAccountId: string;      // Level5_ID for debit (supplier/expense/etc)
    targetAccountNameAr?: string;
    amount: number;               // Foreign amount
    exchange?: number;
    description?: string;
    costcenterId?: number;
    analysisId?: number;
    beneficiaryName?: string;
    chequeNo?: string;
    chequeDate?: string;
    bankName?: string;
  }>;
  entryName?: string;
}

export interface CreateReceiptVoucherDTO {
  noteDate: string;
  safeOrBankAccountId: string;    // Level5_ID for debit (safe/bank)
  description: string;
  currencyId: number;
  exchange: number;
  receiptMode: 'CASH' | 'BANK_TRANSFER' | 'CHEQUE';
  lines: Array<{
    sourceAccountId: string;      // Level5_ID for credit (customer/revenue/etc)
    sourceAccountNameAr?: string;
    amount: number;               // Foreign amount
    exchange?: number;
    description?: string;
    costcenterId?: number;
    analysisId?: number;
    payerName?: string;
    chequeNo?: string;
    chequeDate?: string;
    draweeBankName?: string;
  }>;
  entryName?: string;
}

export interface ChequeTransitionDTO {
  chequeNo: string;
  sourceNoteNo: number;
  sr: number;
  action: 'DEPOSIT' | 'COLLECT' | 'BOUNCE' | 'CLEAR' | 'CANCEL';
  targetBankAccountId?: string;   // Level5_ID of bank when collecting or clearing
  transitionDate: string;
  notes?: string;
  entryName?: string;
}
