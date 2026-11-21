/**
 * ECO ERP - Phase 05 Sales, Customer Receivables & Invoicing Client SDK
 * Source of Truth: tarabot_erp_complete_schema.json & Phase_05_SalesReceivables_Spec.md
 */

export interface ClientListItem {
  Level4_ID: number;
  Client_ID: number;
  Client_Name_A: string;
  Client_Name_E?: string;
  Client_Status: number;
  SalesMan_ID?: number;
  Tel?: string;
  Fax?: string;
  Mobile?: string;
  Manger_Name?: string;
  C_Email?: string;
  Card_No?: string;
  Vat_No?: string;
  Area_ID?: number;
  Address?: string;
  Limit_Amount: number;
  Client_Price_Option?: number;
  Notice?: string;
  Balance: number;
}

export interface SalesItemCatalog {
  Item_ID: number;
  Item_Name_A: string;
  Item_Name_E?: string;
  Item_Description?: string;
  Default_Unit_ID: number;
  Unit_Name_A: string;
  Sales_Price: number;
  Last_Cost: number;
  Vat_Per: number;
  Level5_ID: number;
}

export interface SalesInvoiceItem {
  Note_No: number;
  Note_Date: string;
  Note_Type: number; // 0 = Credit (آجل), 1 = Cash (نقدي)
  Client_ID: number;
  Client_Name_A: string;
  Cash_Client_Name?: string;
  Issue_No?: string;
  Sales_Order?: string;
  Inventory_ID: number;
  Discount_Amount: number;
  D_Tax_Per: number;
  D_Tax_Amount: number;
  Vat_Tax_Per: number;
  Vat_Tax_Amount: number;
  Note_Tax: number;
  Note_Total: number;
  Note_Net: number;
  Note_Net_With_Tax: number;
  Note_Net_Text?: string;
  Journal_No?: number;
  Notice?: string;
  Entry_Name?: string;
  ItemsCount?: number;
}

export interface SalesReturnItem {
  Note_No: number;
  Note_Date: string;
  Note_Type: number;
  Client_ID: number;
  Client_Name_A: string;
  Cash_Client_Name?: string;
  Issue_No?: string;
  Sales_Order?: string;
  Inventory_ID: number;
  Discount_Amount: number;
  D_Tax_Per: number;
  D_Tax_Amount: number;
  Vat_Tax_Per: number;
  Vat_Tax_Amount: number;
  Note_Tax: number;
  Note_Total: number;
  Note_Net: number;
  Note_Net_With_Tax: number;
  Note_Net_Text?: string;
  Journal_No?: number;
  Notice?: string;
  Entry_Name?: string;
  ItemsCount?: number;
}

export interface SalesInvoiceLineInput {
  Item_ID: number;
  Item_Name_A?: string;
  Unit_ID?: number;
  Unit_Name_A?: string;
  Qty: number;
  Price: number;
  Discount?: number;
}

export interface CreateSalesInvoiceClientDTO {
  Note_Date: string;
  Note_Type: number; // 0 = Credit, 1 = Cash
  Inventory_ID: number;
  Client_ID: number;
  Client_Name?: string;
  Issue_No?: string;
  Sales_Order?: string;
  Debit_Level5_ID?: number;
  Credit_Level5_ID?: number;
  Costcenter_ID?: number;
  Analysis_ID?: number;
  Discount_Amount?: number;
  Vat_Tax_Per?: number;
  D_Tax_Per?: number;
  Notice?: string;
  details: SalesInvoiceLineInput[];
}

export interface CreateSalesReturnClientDTO {
  Note_Date: string;
  Note_Type: number;
  Inventory_ID: number;
  Client_ID: number;
  Client_Name?: string;
  Issue_No?: string;
  Sales_Order?: string;
  Credit_Level5_ID?: number;
  Debit_Level5_ID?: number;
  Costcenter_ID?: number;
  Analysis_ID?: number;
  Discount_Amount?: number;
  Vat_Tax_Per?: number;
  D_Tax_Per?: number;
  Notice?: string;
  details: SalesInvoiceLineInput[];
}

export interface CreateClientDTO {
  Client_Name_A: string;
  Client_Name_E?: string;
  Level4_ID?: number;
  SalesMan_ID?: number;
  Tel?: string;
  Fax?: string;
  Mobile?: string;
  Manger_Name?: string;
  C_Email?: string;
  Card_No?: string;
  Vat_No?: string;
  Address?: string;
  Limit_Amount?: number;
  Notice?: string;
}

import { getApiBaseUrl } from './apiClient';

export class SalesClient {
  private static instance: SalesClient;
  private activeDatabaseKey: string = 'MK_Khalil_Db_2026';

  private get baseUrl(): string {
    return `${getApiBaseUrl()}/api/sales`;
  }

  public static getInstance(): SalesClient {
    if (!SalesClient.instance) {
      SalesClient.instance = new SalesClient();
    }
    return SalesClient.instance;
  }

  public setActiveDatabaseKey(key: string) {
    this.activeDatabaseKey = key;
  }

  public getActiveDatabaseKey(): string {
    return this.activeDatabaseKey;
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'X-Database-Key': this.activeDatabaseKey,
      'X-Database-Context': this.activeDatabaseKey,
    };
  }

  // --------------------------------------------------------------------------
  // Clients / Customers
  // --------------------------------------------------------------------------

  public async getClients(): Promise<ClientListItem[]> {
    const res = await fetch(`${this.baseUrl}/clients`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch sales clients (HTTP ${res.status})`);
    }
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
  }

  public async createClient(dto: CreateClientDTO): Promise<ClientListItem> {
    const res = await fetch(`${this.baseUrl}/clients`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create client' }));
      throw new Error(err.error || 'Server error creating client');
    }

    const data = await res.json();
    return data.data;
  }

  // --------------------------------------------------------------------------
  // Items Catalog for Sales
  // --------------------------------------------------------------------------

  public async getItems(): Promise<SalesItemCatalog[]> {
    const res = await fetch(`${this.baseUrl}/items`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch sales items (HTTP ${res.status})`);
    }
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
  }

  // --------------------------------------------------------------------------
  // Sales Invoices
  // --------------------------------------------------------------------------

  public async getSalesInvoices(): Promise<SalesInvoiceItem[]> {
    const res = await fetch(`${this.baseUrl}/invoices`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch sales invoices (HTTP ${res.status})`);
    }
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
  }

  public async getSalesInvoiceById(id: number): Promise<any> {
    const res = await fetch(`${this.baseUrl}/invoices/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to load sales invoice #${id}`);
    }
    const json = await res.json();
    return json.data;
  }

  public async createSalesInvoice(dto: CreateSalesInvoiceClientDTO): Promise<any> {
    const res = await fetch(`${this.baseUrl}/invoices`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create sales invoice' }));
      throw new Error(err.error || 'Server error creating sales invoice');
    }

    return await res.json();
  }

  // --------------------------------------------------------------------------
  // Sales Returns
  // --------------------------------------------------------------------------

  public async getSalesReturns(): Promise<SalesReturnItem[]> {
    const res = await fetch(`${this.baseUrl}/returns`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch sales returns (HTTP ${res.status})`);
    }
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
  }

  public async createSalesReturn(dto: CreateSalesReturnClientDTO): Promise<any> {
    const res = await fetch(`${this.baseUrl}/returns`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create sales return' }));
      throw new Error(err.error || 'Server error creating sales return');
    }

    return await res.json();
  }
}

