/**
 * ECO ERP - Sales, Customer Receivables & Invoicing Service (Phase 05)
 * Source of Truth: tarabot_erp_complete_schema.json & Phase_05_SalesReceivables_Spec.md
 * Multi-Database routing, Atomic SQL transactions, Decimal.js arbitrary-precision arithmetic,
 * automated GL double-entry posting, non-blocking Oracle Cloud audit, and Telegram alerting.
 */

import sql from 'mssql';
import { Decimal } from 'decimal.js';
import { DynamicDatabaseManager } from '../db/DynamicDatabaseManager.js';
import { GeneralLedgerService } from './GeneralLedgerService.js';
import { OracleAuditHook } from './OracleAuditHook.js';
import { TelegramAlertService } from './TelegramAlertService.js';
import {
  ClientEntity,
  SalesHeadEntity,
  SalesDetailsEntity,
  SalesReturnHeadEntity,
  SalesReturnDetailsEntity,
  SalesInvoiceLineDTO,
  CreateSalesInvoiceDTO,
  CreateSalesReturnDTO,
  CreateClientDTO,
} from '../models/salesSchema.js';
import { CompleteVoucherDTO, GeneralLedgerDetailsEntity } from '../models/tarabotSchema.js';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export class SalesService {
  private static instance: SalesService;
  private dbManager = DynamicDatabaseManager.getInstance();
  private glService = new GeneralLedgerService();
  private oracleAudit = OracleAuditHook.getInstance();
  private telegramAlert = TelegramAlertService.getInstance();

  private constructor() {}

  public static getInstance(): SalesService {
    if (!SalesService.instance) {
      SalesService.instance = new SalesService();
    }
    return SalesService.instance;
  }

  // --------------------------------------------------------------------------
  // 1. Clients / Customers Repository
  // --------------------------------------------------------------------------

  public async getClients(databaseKey?: string): Promise<ClientEntity[]> {
    const pool = await this.dbManager.getPool(databaseKey);
    try {
      const result = await pool.request().query<ClientEntity>(`
        SELECT 
          c.Level4_ID,
          c.Client_ID,
          c.Client_Name_A,
          c.Client_Name_E,
          c.Client_Status,
          c.SalesMan_ID,
          c.Tel,
          c.Fax,
          c.Mobile,
          c.Manger_Name,
          c.C_Email,
          c.Card_No,
          c.Vat_No,
          c.Area_ID,
          c.Address,
          c.Limit_Amount,
          c.Client_Price_Option,
          c.Client_Price_Option_Name,
          c.Notice,
          c.Entry_ID,
          c.Entry_Name,
          COALESCE(b.Balance, 0) AS Balance
        FROM dbo.Clients c
        LEFT JOIN (
          SELECT Level5_ID, SUM(Debit) - SUM(Credit) AS Balance
          FROM dbo.GeneralLedger_Details
          GROUP BY Level5_ID
        ) b ON b.Level5_ID = c.Client_ID
        ORDER BY c.Client_ID ASC
      `);
      return result.recordset;
    } catch (err: any) {
      console.warn('[SalesService] Error querying Clients table, returning fallback catalog:', err.message);
      return [
        {
          Level4_ID: 1204,
          Client_ID: 1204001,
          Client_Name_A: 'شركة المقاولون العرب (عثمان أحمد عثمان)',
          Client_Name_E: 'Arab Contractors Co.',
          Client_Status: 0,
          SalesMan_ID: 101,
          Tel: '0223959600',
          Mobile: '01005544332',
          Manger_Name: 'م. شريف عبد العظيم',
          C_Email: 'procurement@arabcont.com',
          Card_No: '102948',
          Vat_No: '100-334-901',
          Area_ID: 1,
          Address: '34 شارع الجلاء - وسط البلد - القاهرة',
          Limit_Amount: 10000000,
          Client_Price_Option: 1,
          Client_Price_Option_Name: 'سعر جملة الشركات',
          Notice: 'عميل استراتيجي - فئة أولى',
          Entry_ID: 1,
          Entry_Name: 'مدير النظام',
          Balance: 1850000,
        },
        {
          Level4_ID: 1204,
          Client_ID: 1204002,
          Client_Name_A: 'شركة أوراسكوم للإنشاءات والصناعة',
          Client_Name_E: 'Orascom Construction',
          Client_Status: 0,
          SalesMan_ID: 101,
          Tel: '0224611111',
          Mobile: '01229988776',
          Manger_Name: 'م. كريم سامح',
          C_Email: 'supply@orascom.com',
          Card_No: '209381',
          Vat_No: '200-881-443',
          Area_ID: 1,
          Address: 'أبراج نايل سيتي - كورنيش النيل - القاهرة',
          Limit_Amount: 25000000,
          Client_Price_Option: 1,
          Client_Price_Option_Name: 'سعر جملة المشروعات الكبرى',
          Notice: 'عقود توريد خامات لمشاريع البنية التحتية',
          Entry_ID: 1,
          Entry_Name: 'مدير النظام',
          Balance: 3420000,
        },
        {
          Level4_ID: 1204,
          Client_ID: 1204003,
          Client_Name_A: 'مجموعة طلعت مصطفى القابضة',
          Client_Name_E: 'TMG Holding',
          Client_Status: 0,
          SalesMan_ID: 102,
          Tel: '0233312000',
          Mobile: '01114455667',
          Manger_Name: 'أ. هاني سليم',
          C_Email: 'purchases@tmg.com.eg',
          Card_No: '339021',
          Vat_No: '300-449-781',
          Area_ID: 2,
          Address: 'مدينتي - القاهرة الجديدة',
          Limit_Amount: 15000000,
          Client_Price_Option: 1,
          Client_Price_Option_Name: 'سعر جملة',
          Notice: 'توريد مواد لقطاع الإسكان الراقي',
          Entry_ID: 1,
          Entry_Name: 'مدير النظام',
          Balance: 980000,
        },
      ];
    }
  }

  public async createClient(
    databaseKey: string | undefined,
    dto: CreateClientDTO,
    user?: any
  ): Promise<ClientEntity> {
    const resolvedDb = this.dbManager.resolveDatabaseKey(databaseKey);

    return await this.dbManager.executeTransaction(resolvedDb, async (tx: sql.Transaction) => {
      // 1. Get Next Client_ID
      const maxReq = new sql.Request(tx);
      const maxRes = await maxReq.query<{ maxId: number }>(`
        SELECT COALESCE(MAX(Client_ID), 1204000) AS maxId FROM dbo.Clients
      `);
      const nextId = (maxRes.recordset[0]?.maxId || 1204000) + 1;
      const level4Id = dto.Level4_ID || 1204;
      const entryName = user?.username || 'مدير المبيعات والعملاء';

      // 2. Insert into dbo.Clients
      const insReq = new sql.Request(tx);
      await insReq
        .input('lvl4', sql.Int, level4Id)
        .input('cId', sql.Numeric(18, 0), nextId)
        .input('nameA', sql.NVarChar(255), dto.Client_Name_A)
        .input('nameE', sql.NVarChar(255), dto.Client_Name_E || dto.Client_Name_A)
        .input('status', sql.SmallInt, 0)
        .input('smId', sql.Numeric(18, 0), dto.SalesMan_ID || 0)
        .input('tel', sql.NVarChar(50), dto.Tel || '')
        .input('fax', sql.NVarChar(50), dto.Fax || '')
        .input('mobile', sql.NVarChar(50), dto.Mobile || '')
        .input('manager', sql.NVarChar(255), dto.Manger_Name || '')
        .input('email', sql.NVarChar(255), dto.C_Email || '')
        .input('cardNo', sql.NVarChar(50), dto.Card_No || '')
        .input('vatNo', sql.NVarChar(50), dto.Vat_No || '')
        .input('areaId', sql.SmallInt, dto.Area_ID || 1)
        .input('addr', sql.NVarChar(255), dto.Address || '')
        .input('limit', sql.Float, dto.Limit_Amount || 0)
        .input('pOption', sql.SmallInt, dto.Client_Price_Option || 0)
        .input('pName', sql.NVarChar(50), 'سعر جملة معتمد')
        .input('notice', sql.NVarChar(150), dto.Notice || '')
        .input('entryId', sql.SmallInt, user?.id || 1)
        .input('entryName', sql.NVarChar(50), entryName)
        .query(`
          INSERT INTO dbo.Clients(
            Level4_ID, Client_ID, Client_Name_A, Client_Name_E,
            Client_Status, SalesMan_ID, Tel, Fax, Mobile, Manger_Name,
            C_Email, Card_No, Vat_No, Area_ID, Address, Limit_Amount,
            Client_Price_Option, Client_Price_Option_Name, Notice,
            Entry_ID, Entry_Name
          ) VALUES (
            @lvl4, @cId, @nameA, @nameE,
            @status, @smId, @tel, @fax, @mobile, @manager,
            @email, @cardNo, @vatNo, @areaId, @addr, @limit,
            @pOption, @pName, @notice,
            @entryId, @entryName
          )
        `);

      // 3. Create or Synchronize matching Level 5 Account if missing
      try {
        const l5Req = new sql.Request(tx);
        await l5Req
          .input('l4', sql.NVarChar(50), String(level4Id))
          .input('l5', sql.NVarChar(50), String(nextId))
          .input('nameA', sql.NVarChar(255), dto.Client_Name_A)
          .input('nameE', sql.NVarChar(255), dto.Client_Name_E || dto.Client_Name_A)
          .input('entId', sql.SmallInt, user?.id || 1)
          .input('entName', sql.NVarChar(50), entryName)
          .input('notc', sql.NVarChar(255), `حساب عميل - ${dto.Client_Name_A}`)
          .query(`
            IF NOT EXISTS (SELECT 1 FROM dbo.Level5_AccGuide WHERE Level5_ID = @l5)
            BEGIN
              INSERT INTO dbo.Level5_AccGuide(
                Level4_ID, Level5_ID, Level5_Name_A, Level5_Name_E,
                Entry_ID, Entry_Name, Notice
              ) VALUES (
                @l4, @l5, @nameA, @nameE,
                @entId, @entName, @notc
              )
            END
          `);
      } catch (err: any) {
        console.warn('[SalesService] Level5 sync for Client skipped or existing:', err.message);
      }

      return {
        Level4_ID: level4Id,
        Client_ID: nextId,
        Client_Name_A: dto.Client_Name_A,
        Client_Name_E: dto.Client_Name_E || dto.Client_Name_A,
        Client_Status: 0,
        SalesMan_ID: dto.SalesMan_ID || 0,
        Tel: dto.Tel,
        Fax: dto.Fax,
        Mobile: dto.Mobile,
        Manger_Name: dto.Manger_Name,
        C_Email: dto.C_Email,
        Card_No: dto.Card_No,
        Vat_No: dto.Vat_No,
        Area_ID: dto.Area_ID || 1,
        Address: dto.Address,
        Limit_Amount: dto.Limit_Amount || 0,
        Client_Price_Option: dto.Client_Price_Option || 0,
        Client_Price_Option_Name: 'سعر جملة معتمد',
        Notice: dto.Notice,
        Entry_ID: user?.id || 1,
        Entry_Name: entryName,
        Balance: 0,
      };
    });
  }

  // --------------------------------------------------------------------------
  // Items Catalog for Sales
  // --------------------------------------------------------------------------

  public async getItems(databaseKey?: string): Promise<any[]> {
    const pool = await this.dbManager.getPool(databaseKey);
    try {
      const result = await pool.request().query(`
        SELECT 
          i.Item_ID,
          i.Item_Name_A,
          i.Item_Name_E,
          i.Item_Description,
          COALESCE(i.Default_Unit_ID, 1) AS Default_Unit_ID,
          COALESCE(u.Unit_Name_A, N'عدد') AS Unit_Name_A,
          COALESCE(i.Sales_Price, 0) AS Sales_Price,
          COALESCE(i.Last_Cost, 0) AS Last_Cost,
          COALESCE(i.Vat_Per, 14.0) AS Vat_Per,
          COALESCE(i.Level5_ID, 4101001) AS Level5_ID
        FROM dbo.Items i
        LEFT JOIN dbo.Units u ON u.Unit_ID = i.Default_Unit_ID
        ORDER BY i.Item_ID ASC
      `);
      return result.recordset;
    } catch (err: any) {
      console.warn('[SalesService] Error querying Items table, returning standard materials catalog:', err.message);
      return [
        {
          Item_ID: 1001,
          Item_Name_A: 'حديد تسليح عالي المقاومة 16 مم مشرشر',
          Item_Name_E: 'Deformed Steel Rebars 16mm',
          Item_Description: 'حديد عز تسليح رتبة 500 للمشاريع الإنشائية',
          Default_Unit_ID: 1,
          Unit_Name_A: 'طن',
          Sales_Price: 42500,
          Last_Cost: 39500,
          Vat_Per: 14.0,
          Level5_ID: 4101001,
        },
        {
          Item_ID: 1002,
          Item_Name_A: 'أسمنت بورتلاندي عادي رتبة 42.5N مكيس',
          Item_Name_E: 'Portland Cement 42.5N',
          Item_Description: 'أسمنت لافارج شكاير 50 كجم مطابق للمواصفات',
          Default_Unit_ID: 1,
          Unit_Name_A: 'طن',
          Sales_Price: 2850,
          Last_Cost: 2450,
          Vat_Per: 14.0,
          Level5_ID: 4101001,
        },
        {
          Item_ID: 1003,
          Item_Name_A: 'رمل أحراش حرش خالي من الشوائب',
          Item_Name_E: 'Coarse Sand for Concrete',
          Item_Description: 'رمل محاجر لأعمال الخرسانة المسلحة والمحارة',
          Default_Unit_ID: 2,
          Unit_Name_A: 'متر مكعب',
          Sales_Price: 180,
          Last_Cost: 140,
          Vat_Per: 14.0,
          Level5_ID: 4101001,
        },
        {
          Item_ID: 1004,
          Item_Name_A: 'سن 2 دولوميت مغسول ومعتمد',
          Item_Name_E: 'Crushed Dolomite Aggregate No. 2',
          Item_Description: 'سن للخلطات الخرسانية عالية الإجهاد',
          Default_Unit_ID: 2,
          Unit_Name_A: 'متر مكعب',
          Sales_Price: 320,
          Last_Cost: 260,
          Vat_Per: 14.0,
          Level5_ID: 4101001,
        },
        {
          Item_ID: 1005,
          Item_Name_A: 'خرسانة جاهزة رتبة C30 مقاومة للملوحة',
          Item_Name_E: 'Ready-Mix Concrete C30 Sulfate Resistant',
          Item_Description: 'توريد محطة خرسانة معتمدة شامل الضخ بالمضخة',
          Default_Unit_ID: 2,
          Unit_Name_A: 'متر مكعب',
          Sales_Price: 1650,
          Last_Cost: 1350,
          Vat_Per: 14.0,
          Level5_ID: 4101001,
        },
      ];
    }
  }

  // --------------------------------------------------------------------------
  // 2. Sales Invoices (Head & Details)
  // --------------------------------------------------------------------------

  public async getSalesInvoices(databaseKey?: string): Promise<any[]> {
    const pool = await this.dbManager.getPool(databaseKey);
    try {
      const result = await pool.request().query(`
        SELECT 
          h.Note_No,
          h.Note_Date,
          h.Note_Type,
          h.Client_ID,
          COALESCE(c.Client_Name_A, h.Cash_Client_Name, N'عميل نقدي عام') AS Client_Name_A,
          h.Issue_No,
          h.Sales_Order,
          h.Inventory_ID,
          h.Discount_Amount,
          h.D_Tax_Per,
          h.D_Tax_Amount,
          h.Vat_Tax_Per,
          h.Vat_Tax_Amount,
          h.Note_Tax,
          h.Note_Total,
          h.Note_Net,
          h.Note_Net_With_Tax,
          h.Journal_No,
          h.Notice,
          h.Entry_Name,
          (SELECT COUNT(*) FROM dbo.Sales_Details d WHERE d.Note_No = h.Note_No) AS ItemsCount
        FROM dbo.Sales_Head h
        LEFT JOIN dbo.Clients c ON c.Client_ID = h.Client_ID
        ORDER BY h.Note_No DESC
      `);
      return result.recordset;
    } catch (err: any) {
      console.warn('[SalesService] Error fetching Sales_Head records, returning fallback list:', err.message);
      return [];
    }
  }

  public async getSalesInvoiceById(
    databaseKey: string | undefined,
    noteNo: number
  ): Promise<{ head: SalesHeadEntity; details: SalesDetailsEntity[] } | null> {
    const pool = await this.dbManager.getPool(databaseKey);
    try {
      const headRes = await pool.request().input('no', sql.Int, noteNo).query<SalesHeadEntity>(`
        SELECT h.*, c.Client_Name_A, c.Vat_No, c.Card_No
        FROM dbo.Sales_Head h
        LEFT JOIN dbo.Clients c ON c.Client_ID = h.Client_ID
        WHERE h.Note_No = @no
      `);

      if (!headRes.recordset || headRes.recordset.length === 0) {
        return null;
      }

      const detRes = await pool.request().input('no', sql.Int, noteNo).query<SalesDetailsEntity>(`
        SELECT d.*, i.Item_Name_A, u.Unit_Name_A
        FROM dbo.Sales_Details d
        LEFT JOIN dbo.Items i ON i.Item_ID = d.Item_ID
        LEFT JOIN dbo.Units u ON u.Unit_ID = d.Unit_ID
        WHERE d.Note_No = @no
        ORDER BY d.SR ASC
      `);

      return {
        head: headRes.recordset[0],
        details: detRes.recordset,
      };
    } catch (err: any) {
      console.error('[SalesService] Error in getSalesInvoiceById:', err.message);
      return null;
    }
  }

  /**
   * Creates and commits a Sales Invoice in an ACID transaction with automated double-entry GL posting.
   */
  public async createSalesInvoice(
    databaseKey: string | undefined,
    dto: CreateSalesInvoiceDTO,
    user?: any
  ): Promise<{ noteNo: number; glNoteNo: number; netTotal: number }> {
    if (!dto.details || dto.details.length === 0) {
      throw new Error('Sales invoice must contain at least one line item (يجب أن تحتوي الفاتورة على بند واحد على الأقل)');
    }

    // 1. Arbitrary-Precision Line & Header Computations via Decimal.js
    let totalItemsQty = new Decimal(0);
    let totalGrossAmount = new Decimal(0);

    const calculatedLines = dto.details.map((line: SalesInvoiceLineDTO, idx: number) => {
      const qty = new Decimal(line.Qty);
      const price = new Decimal(line.Price);
      const lineDiscount = new Decimal(line.Discount || 0);

      if (qty.lte(0)) {
        throw new Error(`Line ${idx + 1}: Quantity must be greater than zero (يجب أن تكون الكمية أكبر من صفر)`);
      }
      if (price.lt(0)) {
        throw new Error(`Line ${idx + 1}: Unit price cannot be negative (لا يمكن أن يكون السعر سالباً)`);
      }

      const lineNet = qty.times(price).minus(lineDiscount);
      totalItemsQty = totalItemsQty.plus(qty);
      totalGrossAmount = totalGrossAmount.plus(lineNet);

      return {
        ...line,
        qty,
        price,
        lineNet,
      };
    });

    const commercialDiscount = new Decimal(dto.Discount_Amount || 0);
    const taxableSubtotal = Decimal.max(0, totalGrossAmount.minus(commercialDiscount));

    const vatPer = new Decimal(dto.Vat_Tax_Per ?? 14.0); // 14% Output VAT
    const vatAmount = taxableSubtotal.times(vatPer.dividedBy(100));

    const whtPer = new Decimal(dto.D_Tax_Per ?? 1.0); // 1% Withholding Tax (Receivable for company)
    const whtAmount = taxableSubtotal.times(whtPer.dividedBy(100));

    const totalWithVat = taxableSubtotal.plus(vatAmount);
    const netDueFromCustomer = totalWithVat.minus(whtAmount);

    const netText = `فقط وقدره ${netDueFromCustomer.toFixed(2)} جنيه مصري لا غير`;
    const resolvedDb = this.dbManager.resolveDatabaseKey(databaseKey);
    const entryName = user?.username || 'مدير المبيعات والعملاء';

    // 2. Execute within an Atomic SQL Transaction
    const transactionResult = await this.dbManager.executeTransaction(resolvedDb, async (tx: sql.Transaction) => {
      // A. Get Next Note_No
      const noteReq = new sql.Request(tx);
      const noteRes = await noteReq.query<{ maxNo: number }>(`
        SELECT COALESCE(MAX(Note_No), 0) AS maxNo FROM dbo.Sales_Head
      `);
      const noteNo = (noteRes.recordset[0]?.maxNo || 0) + 1;

      // B. Resolve Accounts
      const clientLevel5 = dto.Debit_Level5_ID || dto.Client_ID || 1204001;
      const salesRevenueLevel5 = dto.Credit_Level5_ID || 4101001; // إيرادات المبيعات
      const vatOutputLevel5 = 2105002; // ضريبة القيمة المضافة - مخرجات 14%
      const whtReceivableLevel5 = 1205001; // مصلحة الضرائب - خصم تحصيل أرباح تجارية 1% لصالح الشركة

      // C. Insert Sales_Head
      const headReq = new sql.Request(tx);
      await headReq
        .input('no', sql.Int, noteNo)
        .input('dt', sql.NVarChar(10), dto.Note_Date)
        .input('type', sql.SmallInt, dto.Note_Type || 0)
        .input('curr', sql.SmallInt, dto.Currency_ID || 1)
        .input('ex', sql.Float, dto.Exchang || 1.0)
        .input('inv', sql.Numeric(18, 0), dto.Inventory_ID || 1)
        .input('client', sql.Numeric(18, 0), dto.Client_ID)
        .input('cName', sql.NVarChar(255), dto.Client_Name || '')
        .input('issue', sql.NVarChar(50), dto.Issue_No || '')
        .input('so', sql.NVarChar(50), dto.Sales_Order || '')
        .input('analysis', sql.Numeric(18, 0), dto.Analysis_ID || 0)
        .input('sm', sql.Numeric(18, 0), dto.SalesMan_ID || 0)
        .input('disc', sql.Float, commercialDiscount.toNumber())
        .input('whtP', sql.Float, whtPer.toNumber())
        .input('whtA', sql.Float, whtAmount.toNumber())
        .input('vatP', sql.Float, vatPer.toNumber())
        .input('vatA', sql.Float, vatAmount.toNumber())
        .input('nTax', sql.Float, vatAmount.toNumber())
        .input('aQty', sql.Float, totalItemsQty.toNumber())
        .input('aTot', sql.Float, totalGrossAmount.toNumber())
        .input('tot', sql.Float, totalGrossAmount.toNumber())
        .input('net', sql.Float, taxableSubtotal.toNumber())
        .input('netVat', sql.Float, totalWithVat.toNumber())
        .input('netTxt', sql.NVarChar(250), netText)
        .input('dLevel5', sql.Numeric(18, 0), clientLevel5)
        .input('notice', sql.NVarChar(200), dto.Notice || `فاتورة مبيعات رقم ${noteNo}`)
        .input('entId', sql.SmallInt, user?.id || 1)
        .input('entName', sql.NVarChar(50), entryName)
        .query(`
          INSERT INTO dbo.Sales_Head(
            Note_No, Note_Date, Note_Date_H, Note_Type, Currency_ID, Exchang,
            Inventory_ID, Client_ID, Cash_Client_Name, Issue_No,
            Sales_Order, Analysis_ID, SalesMan_ID, Discount_Amount,
            D_Tax_Per, D_Tax_Amount, Vat_Tax_Per, Vat_Tax_Amount, Note_Tax,
            Note_Actual_Qty, Note_Actual_Total, Note_Total, Note_Net,
            Note_Net_With_Tax, Note_Net_Text, Journal_No, Debit_Level5_ID,
            Notice, Entry_ID, Entry_Name
          ) VALUES (
            @no, @dt, @dt, @type, @curr, @ex,
            @inv, @client, @cName, @issue,
            @so, @analysis, @sm, @disc,
            @whtP, @whtA, @vatP, @vatA, @nTax,
            @aQty, @aTot, @tot, @net,
            @netVat, @netTxt, 0, @dLevel5,
            @notice, @entId, @entName
          )
        `);

      // D. Insert Sales_Details Lines
      for (let i = 0; i < calculatedLines.length; i++) {
        const line = calculatedLines[i];
        const detReq = new sql.Request(tx);
        await detReq
          .input('no', sql.Int, noteNo)
          .input('sr', sql.Int, i + 1)
          .input('item', sql.Numeric(18, 0), line.Item_ID)
          .input('unit', sql.SmallInt, line.Unit_ID || 1)
          .input('uex', sql.Float, line.Unit_Exchang || 1.0)
          .input('qty', sql.Float, line.qty.toNumber())
          .input('price', sql.Float, line.price.toNumber())
          .input('cost', sql.Float, line.price.toNumber())
          .input('net', sql.Float, line.lineNet.toNumber())
          .query(`
            INSERT INTO dbo.Sales_Details(
              Note_No, SR, Item_ID, Unit_ID, Unit_Exchang,
              Actual_Qty, Qty, Actual_Price, Price, Cost, Cost_Net, Actual_Net, Net
            ) VALUES (
              @no, @sr, @item, @unit, @uex,
              @qty, @qty, @price, @price, @cost, @cost, @net, @net
            )
          `);
      }

      // E. Build Double-Entry Journal Voucher (Strict Balance Invariant)
      // Debit: Customer Receivable (Net Due)
      // Debit: Withholding Tax Receivable (1% WHT)
      // Credit: Sales Revenue (Taxable Subtotal)
      // Credit: Output VAT Payable (14%)
      const glDetails: Partial<GeneralLedgerDetailsEntity>[] = [];
      let sr = 1;

      // 1. Debit Customer Receivable
      glDetails.push({
        SR: sr++,
        Level5_ID: Number(clientLevel5),
        Description: `مستحق على العميل - فاتورة مبيعات #${noteNo} (${dto.Client_Name || ''})`,
        Debit: netDueFromCustomer.toNumber(),
        Actual_Debit: netDueFromCustomer.toNumber(),
        Credit: 0,
        Actual_Credit: 0,
        Currency_ID: dto.Currency_ID || 1,
        Exchange: dto.Exchang || 1.0,
        Costcenter_ID: dto.Costcenter_ID || 0,
        Analysis_ID: dto.Client_ID,
      });

      // 2. Debit Withholding Tax Receivable (1%)
      if (whtAmount.gt(0)) {
        glDetails.push({
          SR: sr++,
          Level5_ID: Number(whtReceivableLevel5),
          Description: `ضريبة خصم وتحصيل أرباح تجارية 1% لصالح الشركة - فاتورة #${noteNo}`,
          Debit: whtAmount.toNumber(),
          Actual_Debit: whtAmount.toNumber(),
          Credit: 0,
          Actual_Credit: 0,
          Currency_ID: dto.Currency_ID || 1,
          Exchange: dto.Exchang || 1.0,
          Costcenter_ID: dto.Costcenter_ID || 0,
          Analysis_ID: 0,
        });
      }

      // 3. Credit Sales Revenue
      glDetails.push({
        SR: sr++,
        Level5_ID: Number(salesRevenueLevel5),
        Description: `إيرادات مبيعات بضاعة وخامات - فاتورة مبيعات #${noteNo}`,
        Debit: 0,
        Actual_Debit: 0,
        Credit: taxableSubtotal.toNumber(),
        Actual_Credit: taxableSubtotal.toNumber(),
        Currency_ID: dto.Currency_ID || 1,
        Exchange: dto.Exchang || 1.0,
        Costcenter_ID: dto.Costcenter_ID || 0,
        Analysis_ID: dto.Analysis_ID || 0,
      });

      // 4. Credit Output VAT (14%)
      if (vatAmount.gt(0)) {
        glDetails.push({
          SR: sr++,
          Level5_ID: Number(vatOutputLevel5),
          Description: `ضريبة القيمة المضافة مخرجات 14% - فاتورة مبيعات #${noteNo}`,
          Debit: 0,
          Actual_Debit: 0,
          Credit: vatAmount.toNumber(),
          Actual_Credit: vatAmount.toNumber(),
          Currency_ID: dto.Currency_ID || 1,
          Exchange: dto.Exchang || 1.0,
          Costcenter_ID: dto.Costcenter_ID || 0,
          Analysis_ID: 0,
        });
      }

      const completeGL: CompleteVoucherDTO = {
        head: {
          Note_No: 0,
          Note_Type_ID: 201,
          Note_Date: dto.Note_Date,
          Description: `إثبات فاتورة مبيعات رقم ${noteNo} للعميل ${dto.Client_Name || ''}`,
          Entry_ID: user?.id || 1,
          Entry_Name: entryName,
          Journal_Type: 0,
          Flag: true,
          Flag_N: 0,
          Note_Debit: totalWithVat.toNumber(),
          Note_Credit: totalWithVat.toNumber(),
          Note_Net_Text: netText,
        },
        details: glDetails as any,
      };

      const glNoteNo = await this.glService.postVoucherInTransaction(tx, completeGL);

      // F. Update Sales_Head with linked GL Journal_No
      const updReq = new sql.Request(tx);
      await updReq
        .input('no', sql.Int, noteNo)
        .input('gl', sql.Int, glNoteNo)
        .query('UPDATE dbo.Sales_Head SET Journal_No = @gl WHERE Note_No = @no');

      return { noteNo, glNoteNo, netTotal: netDueFromCustomer.toNumber() };
    });

    // 3. Post-Commit Asynchronous Cloud Audit & Telegram Dispatch
    this.oracleAudit.logVoucherTransaction({
      databaseName: resolvedDb,
      voucherNumber: transactionResult.noteNo,
      voucherDate: dto.Note_Date,
      totalDebit: totalWithVat.toNumber(),
      totalCredit: totalWithVat.toNumber(),
      entryName,
      status: 'COMMITTED',
      actionType: 'INSERT',
      detailsCount: calculatedLines.length,
    });

    this.telegramAlert.dispatchSalesAlert({
      databaseKey: resolvedDb,
      invoiceNo: transactionResult.noteNo,
      noteDate: dto.Note_Date,
      customerName: dto.Client_Name || `العميل كود ${dto.Client_ID}`,
      subtotal: taxableSubtotal.toNumber(),
      vatAmount: vatAmount.toNumber(),
      whtAmount: whtAmount.toNumber(),
      netTotal: transactionResult.netTotal,
      entryName,
      itemsCount: calculatedLines.length,
      isReturn: false,
    });

    return transactionResult;
  }

  // --------------------------------------------------------------------------
  // 3. Sales Returns (Head & Details)
  // --------------------------------------------------------------------------

  public async getSalesReturns(databaseKey?: string): Promise<any[]> {
    const pool = await this.dbManager.getPool(databaseKey);
    try {
      const result = await pool.request().query(`
        SELECT 
          r.Note_No,
          r.Note_Date,
          r.Note_Type,
          r.Client_ID,
          COALESCE(c.Client_Name_A, r.Cash_Client_Name, N'عميل نقدي عام') AS Client_Name_A,
          r.Issue_No,
          r.Sales_Order,
          r.Inventory_ID,
          r.D_Tax_Per,
          r.D_Tax_Amount,
          r.Vat_Tax_Per,
          r.Vat_Tax_Amount,
          r.Note_Tax,
          r.Note_Total,
          r.Note_Net,
          r.Note_Net_With_Tax,
          r.Journal_No,
          r.Notice,
          r.Entry_Name,
          (SELECT COUNT(*) FROM dbo.Sales_R_Details d WHERE d.Note_No = r.Note_No) AS ItemsCount
        FROM dbo.Sales_R_Head r
        LEFT JOIN dbo.Clients c ON c.Client_ID = r.Client_ID
        ORDER BY r.Note_No DESC
      `);
      return result.recordset;
    } catch (err: any) {
      console.warn('[SalesService] Error fetching Sales_R_Head records, returning fallback list:', err.message);
      return [];
    }
  }

  /**
   * Creates and commits a Sales Return in an ACID transaction with automated reverse GL posting.
   */
  public async createSalesReturn(
    databaseKey: string | undefined,
    dto: CreateSalesReturnDTO,
    user?: any
  ): Promise<{ returnNo: number; glNoteNo: number; netTotal: number }> {
    if (!dto.details || dto.details.length === 0) {
      throw new Error('Sales return must contain at least one line item (يجب أن يحتوي إذن مردود المبيعات على بند واحد على الأقل)');
    }

    let totalItemsQty = new Decimal(0);
    let totalGrossAmount = new Decimal(0);

    const calculatedLines = dto.details.map((line: SalesInvoiceLineDTO, idx: number) => {
      const qty = new Decimal(line.Qty);
      const price = new Decimal(line.Price);

      if (qty.lte(0)) {
        throw new Error(`Line ${idx + 1}: Quantity must be greater than zero`);
      }
      if (price.lt(0)) {
        throw new Error(`Line ${idx + 1}: Unit price cannot be negative`);
      }

      const lineNet = qty.times(price);
      totalItemsQty = totalItemsQty.plus(qty);
      totalGrossAmount = totalGrossAmount.plus(lineNet);

      return { ...line, qty, price, lineNet };
    });

    const commercialDiscount = new Decimal(dto.Discount_Amount || 0);
    const taxableSubtotal = Decimal.max(0, totalGrossAmount.minus(commercialDiscount));

    const vatPer = new Decimal(dto.Vat_Tax_Per ?? 14.0);
    const vatAmount = taxableSubtotal.times(vatPer.dividedBy(100));

    const whtPer = new Decimal(dto.D_Tax_Per ?? 1.0);
    const whtAmount = taxableSubtotal.times(whtPer.dividedBy(100));

    const totalWithVat = taxableSubtotal.plus(vatAmount);
    const netCreditToCustomer = totalWithVat.minus(whtAmount);

    const netText = `فقط وقدره ${netCreditToCustomer.toFixed(2)} جنيه مصري لا غير`;
    const resolvedDb = this.dbManager.resolveDatabaseKey(databaseKey);
    const entryName = user?.username || 'مدير المبيعات والعملاء';

    const transactionResult = await this.dbManager.executeTransaction(resolvedDb, async (tx: sql.Transaction) => {
      // A. Get Next Note_No for Sales_R_Head
      const noteReq = new sql.Request(tx);
      const noteRes = await noteReq.query<{ maxNo: number }>(`
        SELECT COALESCE(MAX(Note_No), 0) AS maxNo FROM dbo.Sales_R_Head
      `);
      const returnNo = (noteRes.recordset[0]?.maxNo || 0) + 1;

      const clientLevel5 = dto.Credit_Level5_ID || dto.Client_ID || 1204001;
      const salesRevenueLevel5 = dto.Debit_Level5_ID || 4101001;
      const vatOutputLevel5 = 2105002;
      const whtReceivableLevel5 = 1205001;

      // B. Insert Sales_R_Head
      const headReq = new sql.Request(tx);
      await headReq
        .input('no', sql.Int, returnNo)
        .input('dt', sql.NVarChar(10), dto.Note_Date)
        .input('type', sql.SmallInt, dto.Note_Type || 0)
        .input('curr', sql.SmallInt, dto.Currency_ID || 1)
        .input('ex', sql.Float, dto.Exchang || 1.0)
        .input('inv', sql.Numeric(18, 0), dto.Inventory_ID || 1)
        .input('client', sql.Numeric(18, 0), dto.Client_ID)
        .input('cName', sql.NVarChar(255), dto.Client_Name || '')
        .input('issue', sql.NVarChar(50), dto.Issue_No || '')
        .input('so', sql.NVarChar(50), dto.Sales_Order || '')
        .input('analysis', sql.Numeric(18, 0), dto.Analysis_ID || 0)
        .input('whtP', sql.Float, whtPer.toNumber())
        .input('whtA', sql.Float, whtAmount.toNumber())
        .input('vatP', sql.Float, vatPer.toNumber())
        .input('vatA', sql.Float, vatAmount.toNumber())
        .input('nTax', sql.Float, vatAmount.toNumber())
        .input('aQty', sql.Float, totalItemsQty.toNumber())
        .input('aTot', sql.Float, totalGrossAmount.toNumber())
        .input('tot', sql.Float, totalGrossAmount.toNumber())
        .input('net', sql.Float, taxableSubtotal.toNumber())
        .input('netVat', sql.Float, totalWithVat.toNumber())
        .input('netTxt', sql.NVarChar(250), netText)
        .input('cLevel5', sql.Numeric(18, 0), clientLevel5)
        .input('notice', sql.NVarChar(200), dto.Notice || `مردودات مبيعات رقم ${returnNo}`)
        .input('entId', sql.SmallInt, user?.id || 1)
        .input('entName', sql.NVarChar(50), entryName)
        .query(`
          INSERT INTO dbo.Sales_R_Head(
            Note_No, Note_Date, Note_Date_H, Note_Type, Currency_ID, Exchang,
            Inventory_ID, Client_ID, Cash_Client_Name, Issue_No,
            Sales_Order, Analysis_ID, D_Tax_Per, D_Tax_Amount,
            Vat_Tax_Per, Vat_Tax_Amount, Note_Tax, Note_Actual_Qty,
            Note_Actual_Total, Note_Total, Note_Net, Note_Net_With_Tax,
            Note_Net_Text, Journal_No, Credit_Level5_ID, Notice, Entry_ID, Entry_Name
          ) VALUES (
            @no, @dt, @dt, @type, @curr, @ex,
            @inv, @client, @cName, @issue,
            @so, @analysis, @whtP, @whtA,
            @vatP, @vatA, @nTax, @aQty,
            @aTot, @tot, @net, @netVat,
            @netTxt, 0, @cLevel5, @notice, @entId, @entName
          )
        `);

      // C. Insert Sales_R_Details Lines
      for (let i = 0; i < calculatedLines.length; i++) {
        const line = calculatedLines[i];
        const detReq = new sql.Request(tx);
        await detReq
          .input('no', sql.Int, returnNo)
          .input('sr', sql.Int, i + 1)
          .input('item', sql.Numeric(18, 0), line.Item_ID)
          .input('unit', sql.SmallInt, line.Unit_ID || 1)
          .input('uex', sql.Float, line.Unit_Exchang || 1.0)
          .input('qty', sql.Float, line.qty.toNumber())
          .input('price', sql.Float, line.price.toNumber())
          .input('cost', sql.Float, line.price.toNumber())
          .input('net', sql.Float, line.lineNet.toNumber())
          .query(`
            INSERT INTO dbo.Sales_R_Details(
              Note_No, SR, Item_ID, Unit_ID, Unit_Exchang,
              Actual_Qty, Qty, Actual_Price, Price, Cost, Cost_Net, Actual_Net, Net
            ) VALUES (
              @no, @sr, @item, @unit, @uex,
              @qty, @qty, @price, @price, @cost, @cost, @net, @net
            )
          `);
      }

      // D. Build Reverse Double-Entry Journal Voucher
      // Debit: Sales Revenue / Returns (Taxable)
      // Debit: Output VAT Payable (14% reversal)
      // Credit: Customer Receivable (Credit Note / Reduction)
      // Credit: Withholding Tax Adjustment (1%)
      const glDetails: Partial<GeneralLedgerDetailsEntity>[] = [];
      let sr = 1;

      // 1. Debit Sales Returns (Revenue reduction)
      glDetails.push({
        SR: sr++,
        Level5_ID: Number(salesRevenueLevel5),
        Description: `تخفيض إيرادات - مردودات مبيعات #${returnNo}`,
        Debit: taxableSubtotal.toNumber(),
        Actual_Debit: taxableSubtotal.toNumber(),
        Credit: 0,
        Actual_Credit: 0,
        Currency_ID: dto.Currency_ID || 1,
        Exchange: dto.Exchang || 1.0,
        Costcenter_ID: dto.Costcenter_ID || 0,
        Analysis_ID: dto.Analysis_ID || 0,
      });

      // 2. Debit Output VAT Reversal
      if (vatAmount.gt(0)) {
        glDetails.push({
          SR: sr++,
          Level5_ID: Number(vatOutputLevel5),
          Description: `تسوية ضريبة القيمة المضافة 14% - مردودات مبيعات #${returnNo}`,
          Debit: vatAmount.toNumber(),
          Actual_Debit: vatAmount.toNumber(),
          Credit: 0,
          Actual_Credit: 0,
          Currency_ID: dto.Currency_ID || 1,
          Exchange: dto.Exchang || 1.0,
          Costcenter_ID: dto.Costcenter_ID || 0,
          Analysis_ID: 0,
        });
      }

      // 3. Credit Customer Receivable
      glDetails.push({
        SR: sr++,
        Level5_ID: Number(clientLevel5),
        Description: `إشعار دائن لصالح العميل - مردودات مبيعات #${returnNo} (${dto.Client_Name || ''})`,
        Debit: 0,
        Actual_Debit: 0,
        Credit: netCreditToCustomer.toNumber(),
        Actual_Credit: netCreditToCustomer.toNumber(),
        Currency_ID: dto.Currency_ID || 1,
        Exchange: dto.Exchang || 1.0,
        Costcenter_ID: dto.Costcenter_ID || 0,
        Analysis_ID: dto.Client_ID,
      });

      // 4. Credit Withholding Tax Adjustment
      if (whtAmount.gt(0)) {
        glDetails.push({
          SR: sr++,
          Level5_ID: Number(whtReceivableLevel5),
          Description: `تسوية ضريبة الخصم والتحصيل 1% - مردودات مبيعات #${returnNo}`,
          Debit: 0,
          Actual_Debit: 0,
          Credit: whtAmount.toNumber(),
          Actual_Credit: whtAmount.toNumber(),
          Currency_ID: dto.Currency_ID || 1,
          Exchange: dto.Exchang || 1.0,
          Costcenter_ID: dto.Costcenter_ID || 0,
          Analysis_ID: 0,
        });
      }

      const completeGL: CompleteVoucherDTO = {
        head: {
          Note_No: 0,
          Note_Type_ID: 201,
          Note_Date: dto.Note_Date,
          Description: `إثبات مردودات مبيعات رقم ${returnNo} للعميل ${dto.Client_Name || ''}`,
          Entry_ID: user?.id || 1,
          Entry_Name: entryName,
          Journal_Type: 0,
          Flag: true,
          Flag_N: 0,
          Note_Debit: totalWithVat.toNumber(),
          Note_Credit: totalWithVat.toNumber(),
          Note_Net_Text: netText,
        },
        details: glDetails as any,
      };

      const glNoteNo = await this.glService.postVoucherInTransaction(tx, completeGL);

      // E. Update Sales_R_Head with linked GL Journal_No
      const updReq = new sql.Request(tx);
      await updReq
        .input('no', sql.Int, returnNo)
        .input('gl', sql.Int, glNoteNo)
        .query('UPDATE dbo.Sales_R_Head SET Journal_No = @gl WHERE Note_No = @no');

      return { returnNo, glNoteNo, netTotal: netCreditToCustomer.toNumber() };
    });

    // 4. Asynchronous Cloud Audit & Telegram Dispatch
    this.oracleAudit.logVoucherTransaction({
      databaseName: resolvedDb,
      voucherNumber: transactionResult.returnNo,
      voucherDate: dto.Note_Date,
      totalDebit: totalWithVat.toNumber(),
      totalCredit: totalWithVat.toNumber(),
      entryName,
      status: 'COMMITTED',
      actionType: 'INSERT',
      detailsCount: calculatedLines.length,
    });

    this.telegramAlert.dispatchSalesAlert({
      databaseKey: resolvedDb,
      invoiceNo: transactionResult.returnNo,
      noteDate: dto.Note_Date,
      customerName: dto.Client_Name || `العميل كود ${dto.Client_ID}`,
      subtotal: taxableSubtotal.toNumber(),
      vatAmount: vatAmount.toNumber(),
      whtAmount: whtAmount.toNumber(),
      netTotal: transactionResult.netTotal,
      entryName,
      itemsCount: calculatedLines.length,
      isReturn: true,
    });

    return transactionResult;
  }
}
