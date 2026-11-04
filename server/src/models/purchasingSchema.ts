/**
 * ECO ERP - Purchasing, Supplier Payables & Vendor Invoicing Schema (Phase 04)
 * Source of Truth: tarabot_erp_complete_schema.json & Phase_04_PurchasingPayables_Spec.md
 * Verbatim adherence to SQL Server database tables and column casing.
 */

export interface SupplierEntity {
  Level4_ID: number;
  Supplier_ID: number;
  Supplier_Name_A: string;
  Supplier_Name_E: string;
  Supplier_Status: number; // 0 = Active, 1 = Inactive
  Tel?: string;
  Fax?: string;
  Mobile?: string;
  Manger_Name?: string;
  C_Email?: string;
  Card_No?: string; // Commercial Register / National ID
  Vat_No?: string;  // Tax Identification Number
  Area_ID: number;
  Address?: string;
  Limit_Amount: number;
  Notice?: string;
  Entry_ID: number;
  Entry_Name: string;
  Balance?: number; // Computed live balance
}

export interface PurchaseOrderHeadEntity {
  Note_No: number;
  Note_Date: string;
  Note_Date_H?: string;
  Analysis_ID?: number;
  Costcenter_ID?: number;
  Note_Actual_Qty?: number;
  Note_Qty?: number;
  Note_Total: number;
  Note_Net: number;
  Notice?: string;
  Note_Net_Text?: string;
  Entry_ID: number;
  Entry_Name: string;
}

export interface PurchaseOrderDetailsEntity {
  Note_No: number;
  SR: number;
  Item_ID: number;
  Unit_ID: number;
  Unit_Exchang: number;
  Actual_Qty: number;
  Qty: number;
  Actual_Price: number;
  Price: number;
  Actual_Net: number;
  Net: number;
  Item_Desc?: string;
}

export interface PurchaseHeadEntity {
  Note_No: number;
  Note_Date: string;
  Note_Date_H?: string;
  Note_Type: number; // 0 = Credit (آجل), 1 = Cash (نقدي)
  Currency_ID: number;
  Exchang: number;
  Inventory_ID: number;
  Supplier_ID: number;
  Cash_Supplier_Name?: string;
  Previous_Balance?: number;
  Supplier_Invoices?: string; // Vendor paper bill number
  Purchase_Order?: string;
  Analysis_ID?: number;
  Costcenter_ID?: number;
  Discount_Amount: number;
  D_Tax_Per: number; // Withholding Tax % (e.g. 1.0)
  D_Tax_Amount: number;
  Vat_Tax_Per: number; // Value Added Tax % (e.g. 14.0)
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
  Credit_Level5_ID: number; // Supplier Level 5 account
  Notice?: string;
  Entry_ID: number;
  Entry_Name: string;
}

export interface PurchaseDetailsEntity {
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
  Actual_Net: number;
  Net: number;
  Item_Name_A?: string;
  Unit_Name_A?: string;
}

export interface PurchaseHead1Entity {
  Note_No: number;
  Note_Date: string;
  Note_Date_H?: string;
  Note_Type: number;
  Currency_ID: number;
  Exchang: number;
  Inventory_ID: number;
  Supplier_ID: number;
  Cash_Supplier_Name?: string;
  Supplier_Invoices?: string;
  Purchase_Order?: string;
  Analysis_ID?: number;
  Costcenter_ID?: number;
  D_Tax_Per: number;
  D_Tax_Amount: number;
  Vat_Tax_Per: number;
  Vat_Tax_Amount: number;
  Note_Tax: number;
  Note_Actual_Qty: number;
  Note_Actual_Total: number;
  Note_Total: number;
  Note_Net: number;
  Note_Net_With_Tax: number;
  Note_Net_Text?: string;
  Journal_No: number;
  Credit_Level5_ID: number;
  Notice?: string;
  Entry_ID: number;
  Entry_Name: string;
}

export interface PurchaseDetails1Entity {
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
  Actual_Net: number;
  Net: number;
  Level5_ID: number;
}

export interface PurchaseReturnHeadEntity {
  Note_No: number;
  Note_Date: string;
  Note_Date_H?: string;
  Note_Type: number;
  Currency_ID: number;
  Exchang: number;
  Inventory_ID: number;
  Supplier_ID: number;
  Cash_Supplier_Name?: string;
  Supplier_Invoices?: string;
  Purchase_Order?: string;
  Analysis_ID?: number;
  Costcenter_ID?: number;
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
  Debit_Level5_ID: number; // Supplier Level 5 account
  Notice?: string;
  Entry_ID: number;
  Entry_Name: string;
}

export interface PurchaseReturnDetailsEntity {
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
  Actual_Net: number;
  Net: number;
  Item_Name_A?: string;
  Unit_Name_A?: string;
}

export interface PurchaseSettingsEntity {
  ID: number;
  Inventory_ID?: number;
  D_Tax_Registery_Option?: number;
  D_Tax_Per?: number;
  Purchase_Link_Option?: number;
}

export interface PurchasingItemCatalogEntity {
  Item_ID: number;
  Item_Name_A: string;
  Item_Name_E?: string;
  Item_Description?: string;
  Default_Unit_ID: number;
  Unit_Name_A?: string;
  Last_Cost: number;
  Average_Cost: number;
  Vat_Per: number;
  Level5_ID: number;
}

// ----------------------------------------------------------------------------
// API DTOs
// ----------------------------------------------------------------------------

export interface PurchaseInvoiceLineDTO {
  Item_ID: number;
  Unit_ID?: number;
  Unit_Exchang?: number;
  Qty: number;
  Price: number;
  Discount?: number;
  Item_Name_A?: string;
  Unit_Name_A?: string;
}

export interface CreatePurchaseInvoiceDTO {
  Note_Date: string;
  Note_Type: number; // 0 = Credit, 1 = Cash
  Currency_ID?: number;
  Exchang?: number;
  Inventory_ID: number;
  Supplier_ID: number;
  Supplier_Name?: string;
  Supplier_Invoices?: string;
  Purchase_Order?: string;
  Credit_Level5_ID?: number; // Supplier Level 5 Account
  Debit_Level5_ID?: number;  // Purchases/Inventory Account
  Costcenter_ID?: number;
  Analysis_ID?: number;
  Discount_Amount?: number;
  Vat_Tax_Per?: number;      // e.g. 14.0
  D_Tax_Per?: number;        // e.g. 1.0 (Withholding tax)
  Notice?: string;
  details: PurchaseInvoiceLineDTO[];
}

export interface CreatePurchaseReturnDTO {
  Note_Date: string;
  Note_Type: number;
  Currency_ID?: number;
  Exchang?: number;
  Inventory_ID: number;
  Supplier_ID: number;
  Supplier_Name?: string;
  Supplier_Invoices?: string;
  Purchase_Order?: string;
  Debit_Level5_ID?: number;  // Supplier Level 5 Account
  Credit_Level5_ID?: number; // Purchases/Inventory Account
  Costcenter_ID?: number;
  Analysis_ID?: number;
  Discount_Amount?: number;
  Vat_Tax_Per?: number;
  D_Tax_Per?: number;
  Notice?: string;
  details: PurchaseInvoiceLineDTO[];
}

export interface CreateSupplierDTO {
  Supplier_Name_A: string;
  Supplier_Name_E?: string;
  Level4_ID?: number; // default 2201 (الموردين)
  Tel?: string;
  Fax?: string;
  Mobile?: string;
  Manger_Name?: string;
  C_Email?: string;
  Card_No?: string; // سجل تجاري
  Vat_No?: string;  // رقم ضريبي
  Area_ID?: number;
  Address?: string;
  Limit_Amount?: number;
  Notice?: string;
}

