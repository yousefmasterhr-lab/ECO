/**
 * ECO ERP - Inventory, Warehouses & Stock Movements Schema (Phase 06)
 * Source of Truth: tarabot_erp_complete_schema.json & Phase_06_InventoryItems_Spec.md
 * Verbatim adherence to SQL Server database tables and column casing.
 */

// ----------------------------------------------------------------------------
// 1. Warehouses & Stores Master Directory (dbo.Inventories)
// ----------------------------------------------------------------------------

export interface WarehouseEntity {
  Inventory_ID: number;           // numeric PRIMARY KEY
  Inventory_Name_A: string;       // nvarchar(100) NOT NULL
  Inventory_Name_E: string;       // nvarchar(100) NOT NULL
  Notice?: string;                // nvarchar(255)
  Address?: string;               // nvarchar(255)
  Manger_Name?: string;           // nvarchar(255)
  Mobile?: string;                // nvarchar(50)
  Fax?: string;                   // nvarchar(50)
  Tel?: string;                   // nvarchar(50)
  Entry_ID: number;               // smallint NOT NULL
  Entry_Name: string;             // nvarchar(50) NOT NULL
  Level5_ID?: number;             // Associated GL Inventory Asset Account (e.g. 1203001)
  ItemsCount?: number;            // Live items count
  TotalValuation?: number;        // Live stock valuation
}

// ----------------------------------------------------------------------------
// 2. Units of Measure (dbo.Units)
// ----------------------------------------------------------------------------

export interface UnitEntity {
  Unit_ID: number;                // smallint PRIMARY KEY
  Unit_Name_A: string;            // nvarchar(255) NOT NULL
  Unit_Name_E: string;            // nvarchar(255) NOT NULL
  Notice?: string;                // nvarchar(200)
  Entry_ID: number;               // smallint NOT NULL
  Entry_Name: string;             // nvarchar(50) NOT NULL
}

// ----------------------------------------------------------------------------
// 3. Item Categories & Classifications
// ----------------------------------------------------------------------------

export interface ItemTypeEntity {
  Item_Type_ID: number;           // smallint PRIMARY KEY
  Item_Type_Name_A: string;       // nvarchar(255) NOT NULL
  Item_Type_Name_E: string;       // nvarchar(255) NOT NULL
  Notice?: string;                // nvarchar(200)
  Entry_ID: number;
  Entry_Name: string;
}

export interface MainCategoryEntity {
  Main_Category_ID: number;       // smallint PRIMARY KEY
  Main_Category_Name_A: string;   // nvarchar(255) NOT NULL
  Main_Category_Name_E: string;   // nvarchar(255) NOT NULL
  Category_Type: number;          // smallint
  Notice?: string;
  Entry_ID: number;
  Entry_Name: string;
}

export interface SubCategoryEntity {
  Sub_Category_ID: number;        // int PRIMARY KEY
  Main_Category_ID: number;       // smallint NOT NULL
  Sub_Category_Name_A: string;    // nvarchar(255) NOT NULL
  Sub_Category_Name_E: string;    // nvarchar(255) NOT NULL
  Notice?: string;
  Entry_ID: number;
  Entry_Name: string;
}

// ----------------------------------------------------------------------------
// 4. Master Items Card & Multi-UOM (dbo.Items & dbo.Items_Details)
// ----------------------------------------------------------------------------

export interface ItemEntity {
  Item_ID: number;                // numeric PRIMARY KEY
  Item_Name_A: string;            // nvarchar(255) NOT NULL
  Item_Name_E: string;            // nvarchar(255) NOT NULL
  Item_Description?: string;      // nvarchar(500)
  Item_Sort?: string;             // nvarchar(10) (Barcode / Quick Sort code)
  Item_Type_ID?: number;          // smallint
  Sub_Category_ID?: number;       // int
  Factory_No?: number;            // numeric
  Request_Limit?: number;         // float (Reorder point / الحد الأدنى للطلب)
  Request_Qty?: number;           // float (Standard order quantity)
  Default_Unit_ID: number;        // smallint NOT NULL
  First_Cost?: number;            // float (Opening cost)
  Last_Cost: number;              // float NOT NULL (Last purchase cost)
  Average_Cost: number;           // float NOT NULL (Weighted average cost)
  Active: boolean;                // bit NOT NULL (0 or 1)
  Vat_Per: number;                // float NOT NULL (default 14.0)
  Visible_By_Stock: boolean;      // bit NOT NULL
  Level5_ID: number;              // numeric NOT NULL (GL Inventory Asset Account)
  Entry_ID: number;
  Entry_Name: string;
  // Computed / Joined fields
  Unit_Name_A?: string;
  Unit_Exchang?: number;          // Exchange factor for second unit
  Retail_Price?: number;          // Sales retail price
  Wholesale_Price?: number;       // Sales wholesale price
  Current_Balance?: number;       // On-hand balance in selected/all warehouses
  Total_Valuation?: number;       // Current_Balance * Average_Cost
}

export interface ItemStockBalanceEntity {
  Inventory_ID: number;
  Inventory_Name_A: string;
  Item_ID: number;
  Item_Name_A: string;
  Unit_ID: number;
  Unit_Name_A: string;
  OnHand_Qty: number;             // Actual Physical Stock
  Reserved_Qty: number;           // Allocated for SO / Projects
  Available_Qty: number;          // OnHand - Reserved
  Average_Cost: number;
  Total_Valuation: number;
}

// ----------------------------------------------------------------------------
// 5. Stock Opening Balances (dbo.Stock_Head & dbo.Stock_Details)
// ----------------------------------------------------------------------------

export interface StockHeadEntity {
  Note_No: number;                // int PRIMARY KEY
  Note_Date: string;              // nvarchar(10) NOT NULL (YYYY-MM-DD)
  Note_Date_H?: string;           // nvarchar(10)
  Inventory_ID: number;           // numeric NOT NULL
  Level5_ID?: number;             // numeric (Offsetting equity / opening balance GL account)
  Notice?: string;                // nvarchar(200)
  Note_Actual_Qty: number;        // float NOT NULL
  Note_Total: number;             // float NOT NULL
  Note_Net: number;               // float NOT NULL
  Note_Net_Text?: string;         // nvarchar(200)
  Journal_No?: number;            // Linked GL Journal Entry No
  Entry_ID: number;
  Entry_Name: string;
}

export interface StockDetailsEntity {
  Note_No: number;                // int NOT NULL
  SR: number;                     // int PRIMARY KEY (Line item serial)
  Item_ID: number;                // numeric NOT NULL
  Unit_ID: number;                // smallint NOT NULL
  Unit_Exchang: number;           // float NOT NULL (default 1.0)
  Actual_Qty: number;             // float NOT NULL
  Qty: number;                    // float NOT NULL
  Actual_Price: number;           // float NOT NULL (Cost per unit)
  Price: number;                  // float NOT NULL
  Net: number;                    // float NOT NULL (Actual_Qty * Actual_Price)
}

// ----------------------------------------------------------------------------
// 6. Stock Issue Note (إذن صرف مخزني - dbo.Internal_Issue_Head / Details)
// ----------------------------------------------------------------------------

export interface InternalIssueHeadEntity {
  Note_No: number;                // int PRIMARY KEY
  Note_Date: string;              // nvarchar(10) NOT NULL
  Note_Date_H?: string;
  Inventory_ID: number;           // numeric NOT NULL (Issuing Warehouse)
  Costcenter_ID: number;          // numeric NOT NULL (Project / Department Cost Center)
  Analysis_ID: number;            // numeric NOT NULL (Project / Sub-Ledger Analysis)
  Project_ID?: number;            // Associated Contracting Project
  Notice?: string;                // nvarchar(200)
  Note_Actual_Qty: number;        // float NOT NULL (Total Quantities)
  Note_Total: number;             // float NOT NULL (Total Valuation)
  Note_Net: number;               // float NOT NULL (Net Valuation)
  Note_Net_Text?: string;         // nvarchar(200) (Arabic Tafqeet)
  Journal_No?: number;            // int (Automated GL Journal Entry Number)
  Entry_ID: number;
  Entry_Name: string;
}

export interface InternalIssueDetailsEntity {
  Note_No: number;
  SR: number;                     // int PRIMARY KEY (1..N)
  Item_ID: number;
  Unit_ID: number;
  Unit_Exchang: number;
  Actual_Qty: number;
  Qty: number;
  Actual_Price: number;           // Average Cost at time of issue
  Price: number;
  Net: number;
  Item_Name_A?: string;
  Unit_Name_A?: string;
}

// ----------------------------------------------------------------------------
// 7. Stock Delivery / Receipt Note (إذن إضافة مخزني - dbo.Internal_Delivery_Head / Details)
// ----------------------------------------------------------------------------

export interface InternalDeliveryHeadEntity {
  Note_No: number;                // int PRIMARY KEY
  Note_Date: string;
  Note_Date_H?: string;
  Inventory_ID: number;           // numeric NOT NULL (Receiving Warehouse)
  Costcenter_ID: number;          // numeric NOT NULL
  Analysis_ID: number;            // numeric NOT NULL
  Notice?: string;
  Note_Actual_Qty: number;
  Note_Total: number;
  Note_Net: number;
  Note_Net_Text?: string;
  Journal_No?: number;
  Entry_ID: number;
  Entry_Name: string;
}

export interface InternalDeliveryDetailsEntity {
  Note_No: number;
  SR: number;
  Item_ID: number;
  Unit_ID: number;
  Unit_Exchang: number;
  Actual_Qty: number;
  Qty: number;
  Actual_Price: number;           // Incoming valuation cost
  Price: number;
  Net: number;
  Item_Name_A?: string;
  Unit_Name_A?: string;
}

// ----------------------------------------------------------------------------
// 8. Inter-Store Transfers (التحويل بين المخازن - dbo.Transfer_Issue_Head / Details)
// ----------------------------------------------------------------------------

export interface TransferIssueHeadEntity {
  Note_No: number;                // int PRIMARY KEY
  Note_Date: string;
  Note_Date_H?: string;
  Inventory_ID: number;           // Source Warehouse (المستودع المحول منه)
  Inventory_ID1: number;          // Target Warehouse (المستودع المحول إليه)
  Notice?: string;
  Note_Actual_Qty: number;
  Note_Total: number;
  Note_Net: number;
  Note_Net_Text?: string;
  Journal_No?: number;
  Entry_ID: number;
  Entry_Name: string;
}

export interface TransferIssueDetailsEntity {
  Note_No: number;
  SR: number;
  Item_ID: number;
  Unit_ID: number;
  Unit_Exchang: number;
  Actual_Qty: number;
  Qty: number;
  Actual_Price: number;
  Price: number;
  Net: number;
  Item_Name_A?: string;
  Unit_Name_A?: string;
}

// ----------------------------------------------------------------------------
// 9. Stock Adjustments & Physical Inventory (dbo.Stock_Adjustment_Head / Details)
// ----------------------------------------------------------------------------

export interface StockAdjustmentHeadEntity {
  Note_No: number;                // int PRIMARY KEY
  Note_Date: string;
  Note_Date_H?: string;
  Inventory_ID: number;           // Audited Warehouse
  Notice?: string;
  Note_Actual_Qty: number;        // Total Variance Quantity
  Note_Total: number;             // Total Variance Value
  Note_Net: number;               // Net Value
  Note_Net_Text?: string;
  Journal_No?: number;
  Entry_ID: number;
  Entry_Name: string;
}

export interface StockAdjustmentDetailsEntity {
  Note_No: number;
  SR: number;
  Item_ID: number;
  Unit_ID: number;
  Unit_Exchang: number;
  Prog_Balance: number;           // System Book Balance (رصيد البرنامج الدفتري)
  Actual_Balance: number;         // Physical Count Balance (الرصيد الفعلي في الجرد)
  Actual_Qty: number;             // Difference: Actual_Balance - Prog_Balance
  Qty: number;
  Actual_Price: number;           // Unit Cost
  Price: number;
  Net: number;                    // Variance Cost: (Actual - Prog) * Cost
  Item_Name_A?: string;
  Unit_Name_A?: string;
}

// ----------------------------------------------------------------------------
// 10. Inventory Settings (dbo.Stock_Settings)
// ----------------------------------------------------------------------------

export interface StockSettingsEntity {
  ID: number;
  Inventory_Name_A?: string;
  Products_Cost_Option: number;   // 0 = Weighted Average Cost, 1 = FIFO, 2 = Last Cost
  Decimals_Option: number;        // Decimal places (default 2)
  Issue_Without_Balance_Option: number; // 0 = Disallow negative stock, 1 = Allow
  Transfer_Link_Option: number;   // Automatic GL posting for transfers
  Internal_Issue_Link_Option: number;
  Costcenters_Option: number;
  Analysis_Option: number;
}

// ----------------------------------------------------------------------------
// 11. API DTOs & Client Payloads
// ----------------------------------------------------------------------------

export interface InventoryVoucherLineDTO {
  Item_ID: number;
  Unit_ID?: number;
  Unit_Exchang?: number;
  Qty: number;
  Price: number;                  // Unit Cost
  Item_Name_A?: string;
  Unit_Name_A?: string;
  Prog_Balance?: number;          // For adjustments
  Actual_Balance?: number;        // For adjustments
}

export interface CreateStockIssueDTO {
  Note_Date: string;
  Inventory_ID: number;
  Costcenter_ID: number;
  Analysis_ID?: number;
  Project_ID?: number;
  Debit_Level5_ID?: number;       // Expense / WIP GL Account (e.g. 3102001)
  Credit_Level5_ID?: number;      // Inventory Asset GL Account (e.g. 1203001)
  Notice?: string;
  details: InventoryVoucherLineDTO[];
}

export interface CreateStockDeliveryDTO {
  Note_Date: string;
  Inventory_ID: number;
  Costcenter_ID?: number;
  Analysis_ID?: number;
  Debit_Level5_ID?: number;       // Inventory Asset GL Account (e.g. 1203001)
  Credit_Level5_ID?: number;      // Production / Clearing GL Account (e.g. 3101001)
  Notice?: string;
  details: InventoryVoucherLineDTO[];
}

export interface CreateStockTransferDTO {
  Note_Date: string;
  Inventory_ID: number;           // Source Warehouse
  Inventory_ID1: number;          // Target Warehouse
  Notice?: string;
  details: InventoryVoucherLineDTO[];
}

export interface CreateStockAdjustmentDTO {
  Note_Date: string;
  Inventory_ID: number;
  Notice?: string;
  details: InventoryVoucherLineDTO[];
}

export interface CreateWarehouseDTO {
  Inventory_Name_A: string;
  Inventory_Name_E?: string;
  Notice?: string;
  Address?: string;
  Manger_Name?: string;
  Mobile?: string;
  Tel?: string;
  Level5_ID?: number;
}

export interface CreateItemDTO {
  Item_Name_A: string;
  Item_Name_E?: string;
  Item_Description?: string;
  Item_Sort?: string;             // Barcode / Code
  Sub_Category_ID?: number;
  Default_Unit_ID: number;
  Last_Cost?: number;
  Average_Cost?: number;
  First_Cost?: number;
  Vat_Per?: number;
  Level5_ID?: number;             // GL Inventory Asset Account (1203001)
  Request_Limit?: number;         // Minimum stock level
}

