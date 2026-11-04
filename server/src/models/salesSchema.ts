/**
 * ECO ERP - Sales, Customer Receivables & Invoicing Schema (Phase 05)
 * Source of Truth: tarabot_erp_complete_schema.json & Phase_05_SalesReceivables_Spec.md
 * Verbatim adherence to SQL Server database tables and column casing.
 */

export interface ClientEntity {
  Level4_ID: number;
  Client_ID: number;
  Client_Name_A: string;
  Client_Name_E: string;
  Client_Status: number; // 0 = Active, 1 = Inactive
  SalesMan_ID: number;
  Tel?: string;
  Fax?: string;
  Mobile?: string;
  Manger_Name?: string;
  C_Email?: string;
  Card_No?: string; // Commercial Register / National ID
  Vat_No?: string;  // Tax Identification Number
  Area_ID: number;
  Address?: string;
  Limit_Amount: number; // Credit Limit
  Client_Price_Option: number;
  Client_Price_Option_Name?: string;
  Notice?: string;
  Entry_ID: number;
  Entry_Name: string;
  Balance?: number; // Computed live balance
}

export interface SalesManEntity {
  Main_Costcenter_ID: number;
  SalesMan_ID: number;
  SalesMan_Name_A: string;
  SalesMan_Name_E: string;
  SalesMan_Status: number;
  Tel?: string;
  Fax?: string;
  Mobile?: string;
  C_Email?: string;
  Address?: string;
  Card_ID?: string;
  Card_To_Date?: string;
  Pass_ID?: string;
  Pass_To_Date?: string;
  Per_By_Sales_Option?: number;
  Per_By_Receivable_Option?: number;
  Target1_Amount?: number;
  Target2_Amount?: number;
  Target1_Per?: number;
  Target2_Per?: number;
  Sales_Area?: string;
  Entry_ID: number;
  Entry_Name: string;
}

export interface OfferPriceHeadEntity {
  Note_No: number;
  Note_Date: string;
  Note_Date_H?: string;
  Note_Type: number;
  Currency_ID: number;
  Exchang: number;
  Inventory_ID: number;
  Client_ID: number;
  Cash_Client_Name?: string;
  Previous_Balance?: number;
  Issue_No?: string;
  Sales_Order?: string;
  Analysis_ID?: number;
  SalesMan_ID?: number;
  Discount_Per?: number;
  Discount_Per_Amount?: number;
  Discount_Amount: number;
  Note_Discount?: number;
  D_Tax_Per: number;
  D_Tax_Amount: number;
  Vat_Tax_Per: number;
  Vat_Tax_Amount: number;
  Note_Tax: number;
  Note_Discount_After_Tax?: number;
  Note_Actual_Qty: number;
  Note_Actual_Total: number;
  Note_Total: number;
  Note_Net: number;
  Note_Net_With_Tax: number;
  Note_Net_Text?: string;
  Sales_No?: number;
  Debit_Level5_ID?: number;
  Notice?: string;
  Entry_ID: number;
  Entry_Name: string;
}

export interface OfferPriceDetailsEntity {
  Note_No: number;
  SR: number;
  Item_ID: number;
  Unit_ID: number;
  Unit_Exchang: number;
  Actual_Qty: number;
  Qty: number;
  Actual_Price: number;
  Price: number;
  Cost?: number;
  Cost_Net?: number;
  Actual_Net: number;
  Net: number;
}

export interface SalesHeadEntity {
  Note_No: number;
  Note_Date: string;
  Note_Date_H?: string;
  Note_Type: number; // 0 = Credit (آجل), 1 = Cash (نقدي)
  Currency_ID: number;
  Exchang: number;
  Inventory_ID: number;
  Client_ID: number;
  Cash_Client_Name?: string;
  Previous_Balance?: number;
  Issue_No?: string;
  Sales_Order?: string;
  Analysis_ID?: number;
  SalesMan_ID?: number;
  Discount_Per?: number;
  Discount_Per_Amount?: number;
  Discount_Amount: number;
  Note_Discount?: number;
  D_Tax_Per: number; // Withholding Tax % (1.0)
  D_Tax_Amount: number;
  Vat_Tax_Per: number; // Output VAT % (14.0)
  Vat_Tax_Amount: number;
  Note_Tax: number;
  Note_Discount_After_Tax?: number;
  Note_Actual_Qty: number;
  Note_Actual_Total: number;
  Note_Total: number;
  Note_Net: number;
  Note_Net_With_Tax: number;
  Note_Net_Text?: string;
  Journal_No: number;
  Debit_Level5_ID: number; // Customer Account Debited
  Notice?: string;
  Entry_ID: number;
  Entry_Name: string;
}

export interface SalesDetailsEntity {
  Note_No: number;
  SR: number;
  Item_ID: number;
  Unit_ID: number;
  Unit_Exchang: number;
  Actual_Qty: number;
  Qty: number;
  Actual_Price: number;
  Price: number;
  Cost?: number;
  Cost_Net?: number;
  Actual_Net: number;
  Net: number;
  Item_Name_A?: string;
  Unit_Name_A?: string;
}

export interface SalesReturnHeadEntity {
  Note_No: number;
  Note_Date: string;
  Note_Date_H?: string;
  Note_Type: number;
  Currency_ID: number;
  Exchang: number;
  Inventory_ID: number;
  Client_ID: number;
  Cash_Client_Name?: string;
  Issue_No?: string;
  Sales_Order?: string;
  Analysis_ID?: number;
  SalesMan_ID?: number;
  Discount_Per?: number;
  Discount_Per_Amount?: number;
  Discount_Amount: number;
  Note_Discount?: number;
  D_Tax_Per: number;
  D_Tax_Amount: number;
  Vat_Tax_Per: number;
  Vat_Tax_Amount: number;
  Note_Tax: number;
  Note_Discount_After_Tax?: number;
  Note_Actual_Qty: number;
  Note_Actual_Total: number;
  Note_Total: number;
  Note_Net: number;
  Note_Net_With_Tax: number;
  Note_Net_Text?: string;
  Journal_No: number;
  Credit_Level5_ID: number; // Customer Account Credited on return
  Notice?: string;
  Entry_ID: number;
  Entry_Name: string;
}

export interface SalesReturnDetailsEntity {
  Note_No: number;
  SR: number;
  Item_ID: number;
  Unit_ID: number;
  Unit_Exchang: number;
  Actual_Qty: number;
  Qty: number;
  Actual_Price: number;
  Price: number;
  Cost?: number;
  Cost_Net?: number;
  Actual_Net: number;
  Net: number;
  Item_Name_A?: string;
  Unit_Name_A?: string;
}

export interface SalesSettingsEntity {
  ID: number;
  Inventory_ID?: number;
  Sales_Link_Option?: number;
  Vat_Tax_Per?: number;
  D_Tax_Per?: number;
}

// ----------------------------------------------------------------------------
// API DTOs
// ----------------------------------------------------------------------------

export interface SalesInvoiceLineDTO {
  Item_ID: number;
  Unit_ID?: number;
  Unit_Exchang?: number;
  Qty: number;
  Price: number;
  Discount?: number;
  Item_Name_A?: string;
  Unit_Name_A?: string;
}

export interface CreateSalesInvoiceDTO {
  Note_Date: string;
  Note_Type: number; // 0 = Credit, 1 = Cash
  Currency_ID?: number;
  Exchang?: number;
  Inventory_ID: number;
  Client_ID: number;
  Client_Name?: string;
  Issue_No?: string;
  Sales_Order?: string;
  SalesMan_ID?: number;
  Debit_Level5_ID?: number;  // Customer Level 5 Account
  Credit_Level5_ID?: number; // Sales Revenue Level 5 Account
  Costcenter_ID?: number;
  Analysis_ID?: number;
  Discount_Amount?: number;
  Vat_Tax_Per?: number;      // e.g. 14.0
  D_Tax_Per?: number;        // e.g. 1.0 (Withholding tax receivable)
  Notice?: string;
  details: SalesInvoiceLineDTO[];
}

export interface CreateSalesReturnDTO {
  Note_Date: string;
  Note_Type: number;
  Currency_ID?: number;
  Exchang?: number;
  Inventory_ID: number;
  Client_ID: number;
  Client_Name?: string;
  Issue_No?: string;
  Sales_Order?: string;
  Credit_Level5_ID?: number; // Customer Level 5 Account
  Debit_Level5_ID?: number;  // Sales Revenue / Returns Account
  Costcenter_ID?: number;
  Analysis_ID?: number;
  Discount_Amount?: number;
  Vat_Tax_Per?: number;
  D_Tax_Per?: number;
  Notice?: string;
  details: SalesInvoiceLineDTO[];
}

export interface CreateClientDTO {
  Client_Name_A: string;
  Client_Name_E?: string;
  Level4_ID?: number; // default 1204 (العملاء)
  SalesMan_ID?: number;
  Tel?: string;
  Fax?: string;
  Mobile?: string;
  Manger_Name?: string;
  C_Email?: string;
  Card_No?: string; // سجل تجاري / رقم قومي
  Vat_No?: string;  // بطاقة ضريبية
  Area_ID?: number;
  Address?: string;
  Limit_Amount?: number; // حد ائتمان
  Client_Price_Option?: number;
  Notice?: string;
}
