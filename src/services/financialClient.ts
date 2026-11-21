/**
 * ECO ERP - Financial Engine Client SDK
 * Handles dynamic X-Database-Key multi-tenant requests to the backend with fallback to offline dataset.
 */

import { Decimal } from 'decimal.js';
import { getApiBaseUrl } from './apiClient';

export interface DatabaseFleetItem {
  name: string;
  displayNameAr: string;
  displayNameEn: string;
  category: string;
  categoryNameAr: string;
  categoryNameEn: string;
  categoryIcon: string;
  isPrimary: boolean;
  descriptionAr: string;
  isHealthy?: boolean;
}

export interface ClientVoucherLine {
  sr: number;
  level5Id: string;
  level5NameAr?: string;
  description: string;
  debit: string | number;
  credit: string | number;
  costcenterId: string | number;
  costcenterNameAr?: string;
  analysisId?: string | number;
  analysisNameAr?: string;
  currencyId?: number;
  exchange?: number;
}

export interface ClientVoucherPayload {
  noteNo: number;
  noteDate: string;
  noteTypeId?: number;
  description: string;
  entryName: string;
  noteNetText?: string;
  lines: ClientVoucherLine[];
}

export class FinancialClient {
  private static instance: FinancialClient;
  private activeDatabaseKey: string = 'MK_Khalil_Db_2026';

  private get baseUrl(): string {
    const envUrl = (import.meta as any).env?.VITE_FINANCIAL_API_URL;
    if (envUrl && envUrl.trim()) return envUrl.trim().replace(/\/+$/, '');
    return `${getApiBaseUrl()}/api/financial`;
  }

  private constructor() {
    const saved = localStorage.getItem('eco_active_database_key');
    if (saved) this.activeDatabaseKey = saved;
  }

  public static getInstance(): FinancialClient {
    if (!FinancialClient.instance) {
      FinancialClient.instance = new FinancialClient();
    }
    return FinancialClient.instance;
  }

  public getActiveDatabaseKey(): string {
    return this.activeDatabaseKey;
  }

  public setActiveDatabaseKey(key: string): void {
    this.activeDatabaseKey = key;
    localStorage.setItem('eco_active_database_key', key);
    window.dispatchEvent(new CustomEvent('eco-database-changed', { detail: { key } }));
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Database-Key': this.activeDatabaseKey,
      'X-Database-Context': this.activeDatabaseKey,
    };
  }

  public async getDatabases(): Promise<DatabaseFleetItem[]> {
    try {
      const res = await fetch(`${this.baseUrl}/databases`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return data.databases || [];
      }
    } catch {}

    // Fallback registry
    return [
      {
        name: 'MK_Khalil_Db_2026',
        displayNameAr: 'مؤسسة محمد خليل للمقاولات العامة (2026)',
        displayNameEn: 'MK Khalil General Contracting (2026)',
        category: 'partners',
        categoryNameAr: 'شركات الشركاء والفروع',
        categoryNameEn: 'Partners & Affiliates',
        categoryIcon: 'Building2',
        isPrimary: true,
        descriptionAr: 'قاعدة البيانات التشغيلية الرئيسية لمؤسسة محمد خليل',
        isHealthy: true,
      },
      {
        name: 'Tarabot_Data_2026',
        displayNameAr: 'شركة ترابط - المنظومة المالية النشطة (2026)',
        displayNameEn: 'Tarabot Co. - Active Fiscal Year (2026)',
        category: 'primary',
        categoryNameAr: 'المنظومة المالية النشطة',
        categoryNameEn: 'Active Financial System',
        categoryIcon: 'Activity',
        isPrimary: false,
        descriptionAr: 'قاعدة البيانات التشغيلية للعام المالي 2026',
        isHealthy: true,
      },
      {
        name: 'acc',
        displayNameAr: 'قاعدة الحسابات الميدانية (ACC)',
        displayNameEn: 'Field Accounts Database (ACC)',
        category: 'partners',
        categoryNameAr: 'شركات الشركاء والفروع',
        categoryNameEn: 'Partners & Affiliates',
        categoryIcon: 'Coins',
        isPrimary: false,
        descriptionAr: 'قاعدة الحسابات المحاسبية الميدانية للأفرع',
        isHealthy: true,
      },
      {
        name: 'newhope',
        displayNameAr: 'مؤسسة نيو هوب للاستثمارات (New Hope)',
        displayNameEn: 'New Hope Investments Enterprise',
        category: 'partners',
        categoryNameAr: 'شركات الشركاء والفروع',
        categoryNameEn: 'Partners & Affiliates',
        categoryIcon: 'Sparkles',
        isPrimary: false,
        descriptionAr: 'قاعدة بيانات مؤسسة نيو هوب الاستثمارية التابعة',
        isHealthy: true,
      },
    ];
  }

  public async getChartOfAccountsTree(): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/chart-of-accounts/tree`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Failed to fetch chart of accounts tree (HTTP ${res.status}): ${errText}`);
    }
    const data = await res.json();
    return Array.isArray(data.tree) ? data.tree : [];
  }

  public async getNextVoucherNumber(): Promise<number> {
    const res = await fetch(`${this.baseUrl}/vouchers/next-number`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Failed to fetch next voucher number (HTTP ${res.status}): ${errText}`);
    }
    const data = await res.json();
    return Number(data.nextNo);
  }

  public async saveAndPostVoucher(payload: ClientVoucherPayload): Promise<{ success: boolean; noteNo: number; message: string }> {
    // 1. Client-Side Invariant Validation via Decimal.js
    let totalD = new Decimal(0);
    let totalC = new Decimal(0);

    for (let i = 0; i < payload.lines.length; i++) {
      const line = payload.lines[i];
      const d = new Decimal(line.debit || 0);
      const c = new Decimal(line.credit || 0);

      if (d.isNegative() || c.isNegative()) {
        throw new Error(`السطر (${i + 1}): لا يُسمح بإدخال قيم سالبة.`);
      }
      if (d.isZero() && c.isZero()) {
        throw new Error(`السطر (${i + 1}): يجب إدخال قيمة في المدين أو الدائن.`);
      }
      if (!line.level5Id) {
        throw new Error(`السطر (${i + 1}): يجب اختيار الحساب.`);
      }

      totalD = totalD.plus(d);
      totalC = totalC.plus(c);
    }

    const diff = totalD.minus(totalC).abs();
    if (!diff.isZero()) {
      throw new Error(`القيد غير متوازن! إجمالي المدين (${totalD.toFixed(4)}) لا يساوي إجمالي الدائن (${totalC.toFixed(4)}). الفارق: ${diff.toFixed(4)}.`);
    }

    // 2. Transmit to Backend
    try {
      const backendPayload = {
        head: {
          Note_No: payload.noteNo,
          Note_Type_ID: payload.noteTypeId || 201,
          Note_Date: payload.noteDate,
          Description: payload.description,
          Entry_ID: 1,
          Entry_Name: payload.entryName || 'Admin',
          Note_Debit: totalD.toNumber(),
          Note_Credit: totalC.toNumber(),
          Note_Net_Text: payload.noteNetText || '',
          Flag: false,
          Flag_N: 0,
        },
        details: payload.lines.map((l, idx) => ({
          Note_No: payload.noteNo,
          SR: idx + 1,
          Level5_ID: Number(l.level5Id),
          Description: l.description || payload.description,
          Currency_ID: l.currencyId || 1,
          Exchange: l.exchange || 1,
          Debit: Number(l.debit || 0),
          Credit: Number(l.credit || 0),
          Costcenter_ID: Number(l.costcenterId || 0),
          Analysis_ID: Number(l.analysisId || 0),
          Flag: false,
          Flag_N: 0,
        })),
      };

      const res = await fetch(`${this.baseUrl}/vouchers`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(backendPayload),
      });

      if (res.ok) {
        return await res.json();
      }
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `فشل تسجيل وترحيل القيد في قاعدة البيانات المركزية (رمز الخطأ: ${res.status}).`);
    } catch (e: any) {
      console.error('[financialClient] saveAndPostVoucher error:', e);
      throw new Error(e.message || 'فشل الاتصال بقاعدة البيانات المركزية لترحيل القيد المحاسبي.');
    }
  }
}

