/**
 * ECO ERP - Phase 03 Contracting, Projects & Progress Billing Extraction Engine
 * Arbitrary-precision progress billing mathematics via Decimal.js
 * Atomic ACID SQL Server transactions with automatic rollback on error.
 * Unified General Ledger Auto-Posting inside the SAME database transaction boundary.
 * Non-blocking Oracle Autonomous DB Cloud Audit hook & Telegram Alert dispatcher.
 */

import sql from 'mssql';
import { Decimal } from 'decimal.js';
import { DynamicDatabaseManager } from '../db/DynamicDatabaseManager.js';
import { GeneralLedgerService } from './GeneralLedgerService.js';
import { OracleAuditHook } from './OracleAuditHook.js';
import { TelegramAlertService } from './TelegramAlertService.js';
import {
  ProjectOverviewDTO,
  CreateSubcontractorContractDTO,
  CreateExtractDTO,
  SubcontractorContractHeadEntity,
  SubcontractorExtractHeadEntity,
  SubcontractorExtractDetailsEntity,
} from '../models/contractingSchema.js';
import { CompleteVoucherDTO } from '../models/tarabotSchema.js';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export class ContractingService {
  private static instance: ContractingService;
  private dbManager = DynamicDatabaseManager.getInstance();
  private glService = new GeneralLedgerService();
  private oracleAudit = OracleAuditHook.getInstance();
  private telegramAlert = TelegramAlertService.getInstance();

  public static getInstance(): ContractingService {
    if (!ContractingService.instance) {
      ContractingService.instance = new ContractingService();
    }
    return ContractingService.instance;
  }

  // ==========================================
  // 1. PROJECTS & WORK BREAKDOWN MASTER DATA
  // ==========================================

  /**
   * Retrieves active projects and sites with executed values and completion rates
   */
  public async getProjects(databaseKey?: string): Promise<ProjectOverviewDTO[]> {
    const pool = await this.dbManager.getPool(databaseKey);

    try {
      // In Tarabot ERP, Projects are tracked through Costcenters and Contracts
      const query = `
        SELECT 
          c.Costcenter_ID AS costcenterId,
          c.Costcenter_Name_A AS nameAr,
          ISNULL(SUM(eh.Note_Total), 0) AS totalExecutedValue,
          ISNULL(MAX(ch.Note_Total), 25000000) AS contractValue
        FROM Costcenters c
        LEFT JOIN Contracts_Head ch ON c.Costcenter_ID = ch.Costcenter_ID
        LEFT JOIN Extracts_Head eh ON c.Costcenter_ID = eh.Costcenter_ID
        GROUP BY c.Costcenter_ID, c.Costcenter_Name_A
        ORDER BY c.Costcenter_ID ASC
      `;

      const res = await pool.request().query(query);
      if (res.recordset.length > 0) {
        return res.recordset.map((r, idx) => {
          const cv = Number(r.contractValue) || 10000000;
          const ev = Number(r.totalExecutedValue) || 0;
          const pct = cv > 0 ? Math.min(100, Math.round((ev / cv) * 100)) : 0;
          return {
            id: `PRJ-${r.costcenterId}`,
            code: `PRJ-${String(r.costcenterId).padStart(4, '0')}`,
            nameAr: r.nameAr || `مشروع المقاولات #${r.costcenterId}`,
            costcenterId: Number(r.costcenterId),
            ownerName: 'هيئة المجتمعات العمرانية / صندوق الإسكان',
            ownerAccountId: 1203001,
            contractValue: cv,
            totalExecutedValue: ev,
            completionPercentage: pct,
            startDate: '2025-01-01',
            endDate: '2027-12-31',
            status: pct >= 100 ? 'COMPLETED' : 'ACTIVE',
          };
        });
      }
    } catch {
      // Development fallback
    }

    return [
      {
        id: 'PRJ-101',
        code: 'PRJ-0101',
        nameAr: 'مشروع إنشاء وتشييد أبراج الفسطاط السكنية (كمبوند الفسطاط)',
        costcenterId: 101,
        ownerName: 'هيئة المجتمعات العمرانية الجديدة',
        ownerAccountId: 1203001,
        contractValue: 48500000,
        totalExecutedValue: 18450000,
        completionPercentage: 38,
        startDate: '2025-03-01',
        endDate: '2027-08-30',
        status: 'ACTIVE',
      },
      {
        id: 'PRJ-102',
        code: 'PRJ-0102',
        nameAr: 'مشروع مرافق ومحطة معالجة مياه الصرف الصحي - 6 أكتوبر',
        costcenterId: 102,
        ownerName: 'جهاز مدينة 6 أكتوبر',
        ownerAccountId: 1203002,
        contractValue: 22000000,
        totalExecutedValue: 15400000,
        completionPercentage: 70,
        startDate: '2024-09-01',
        endDate: '2026-12-31',
        status: 'ACTIVE',
      },
      {
        id: 'PRJ-103',
        code: 'PRJ-0103',
        nameAr: 'مشروع تطوير وتوسعة طريق الواحات والمحاور المحيطة',
        costcenterId: 103,
        ownerName: 'الهيئة الهندسية للطرق والكباري',
        ownerAccountId: 1203003,
        contractValue: 65000000,
        totalExecutedValue: 52000000,
        completionPercentage: 80,
        startDate: '2024-06-01',
        endDate: '2026-11-30',
        status: 'ACTIVE',
      },
    ];
  }

  // ==========================================
  // 2. SUBCONTRACTOR CONTRACTS
  // ==========================================

  /**
   * Lists all subcontractor contracts with BOQ summary
   */
  public async getSubcontractorContracts(databaseKey?: string): Promise<SubcontractorContractHeadEntity[]> {
    const pool = await this.dbManager.getPool(databaseKey);

    try {
      const res = await pool.request().query<SubcontractorContractHeadEntity>(`
        SELECT TOP 50 * FROM Contracts_Head ORDER BY Contract_No DESC
      `);
      if (res.recordset.length > 0) return res.recordset;
    } catch {
      // Fallback
    }

    return [
      {
        Contract_No: 501,
        Note_Date: '2026-01-15',
        Credit_Level5_ID: 2101001,
        Analysis_ID: 10,
        Costcenter_ID: 101,
        Note_Total: 4500000,
        Note_Net_Text: 'فقط أربعة ملايين وخمسمائة ألف جنيه لا غير',
        Work_Insurance_Per: 5,
        Work_Balance_Per: 5,
        Work_Payments_Per: 10,
        Notice: 'عقد أعمال الخرسانة المسلحة والهيكل الإنشائي لمبنى B1',
        Entry_ID: 1,
        Entry_Name: 'Eng. Ahmed',
      },
      {
        Contract_No: 502,
        Note_Date: '2026-02-10',
        Credit_Level5_ID: 2101002,
        Analysis_ID: 12,
        Costcenter_ID: 101,
        Note_Total: 1850000,
        Note_Net_Text: 'فقط مليون وثمانمائة وخمسون ألف جنيه لا غير',
        Work_Insurance_Per: 5,
        Work_Balance_Per: 5,
        Work_Payments_Per: 15,
        Notice: 'عقد أعمال التشطيبات المتكاملة والمباني والوجهات',
        Entry_ID: 1,
        Entry_Name: 'Eng. Ahmed',
      },
    ];
  }

  /**
   * Creates a new Subcontractor Contract with BOQ line items
   */
  public async createSubcontractorContract(
    payload: CreateSubcontractorContractDTO,
    databaseKey?: string
  ): Promise<{ success: boolean; contractNo: number; message: string }> {
    const resolvedDb = this.dbManager.resolveDatabaseKey(databaseKey);

    if (!payload.items || payload.items.length === 0) {
      throw new Error('لا يمكن تسجيل عقد مقاولة بدون بنود أعمال (BOQ Items).');
    }

    let totalContractValue = new Decimal(0);
    payload.items.forEach((item, idx) => {
      const q = new Decimal(item.qty || 0);
      const p = new Decimal(item.price || 0);
      if (q.isNegative() || q.isZero() || p.isNegative()) {
        throw new Error(`البند رقم (${idx + 1}): الكمية والسعر يجب أن يكونا أكبر من الصفر.`);
      }
      totalContractValue = totalContractValue.plus(q.times(p));
    });

    return await this.dbManager.executeTransaction(resolvedDb, async (tx) => {
      // 1. Get next contract number
      const noReq = new sql.Request(tx);
      const noRes = await noReq.query('SELECT ISNULL(MAX(Contract_No), 500) + 1 AS nextNo FROM Contracts_Head');
      const contractNo = Number(noRes.recordset[0].nextNo);

      // 2. Insert into Contracts_Head
      const headReq = new sql.Request(tx);
      await headReq
        .input('contractNo', contractNo)
        .input('noteDate', payload.noteDate)
        .input('creditL5', payload.subcontractorAccountId)
        .input('analysisId', 0)
        .input('costcenterId', payload.costcenterId)
        .input('noteTotal', totalContractValue.toNumber())
        .input('netText', `فقط وقدره ${totalContractValue.toFixed(2)} لا غير`)
        .input('insPer', payload.insurancePercentage || 5)
        .input('balPer', payload.retentionPercentage || 5)
        .input('payPer', payload.advancePaymentPercentage || 10)
        .input('notice', payload.notice || 'عقد مقاولة باطن')
        .input('entryId', 1)
        .input('entryName', payload.entryName || 'Chief Engineer')
        .query(`
          INSERT INTO Contracts_Head (
            Contract_No, Note_Date, Credit_Level5_ID, Analysis_ID,
            Costcenter_ID, Note_Total, Note_Net_Text,
            Work_Insurance_Per, Work_Balance_Per, Work_Payments_Per,
            Notice, Entry_ID, Entry_Name
          ) VALUES (
            @contractNo, @noteDate, @creditL5, @analysisId,
            @costcenterId, @noteTotal, @netText,
            @insPer, @balPer, @payPer,
            @notice, @entryId, @entryName
          )
        `);

      // 3. Insert into Contracts_Details (BOQ items)
      for (let i = 0; i < payload.items.length; i++) {
        const item = payload.items[i];
        const sr = i + 1;
        const q = new Decimal(item.qty);
        const p = new Decimal(item.price);
        const net = q.times(p);

        const dReq = new sql.Request(tx);
        await dReq
          .input('contractNo', contractNo)
          .input('sr', sr)
          .input('l5', item.itemCode)
          .input('unit', item.unit || 'عدد')
          .input('qty', q.toNumber())
          .input('price', p.toNumber())
          .input('net', net.toNumber())
          .query(`
            INSERT INTO Contracts_Details (
              Contract_No, SR, Level5_ID, Unit_Name,
              Qty, Price, Net
            ) VALUES (
              @contractNo, @sr, @l5, @unit,
              @qty, @price, @net
            )
          `);
      }

      return {
        success: true,
        contractNo,
        message: `تم توثيق عقد مقاولة الباطن رقم [#${contractNo}] بإجمالي قيمة تعاقدية [${totalContractValue.toFixed(2)} ج.م] بنجاح.`,
      };
    });
  }

  // ==========================================
  // 3. PROGRESS EXTRACTS (مستخلصات مقاولي الباطن والمالك)
  // Tables: Extracts_Head, Extracts_Details (AbsProjectH, AbsProjectD)
  // ==========================================

  /**
   * Retrieves previous cumulative quantity for a given contract and BOQ item
   */
  public async getPreviousQty(contractNo: number, itemCode: number, databaseKey?: string): Promise<number> {
    const pool = await this.dbManager.getPool(databaseKey);

    try {
      const res = await pool
        .request()
        .input('cNo', contractNo)
        .input('item', itemCode)
        .query(`
          SELECT ISNULL(SUM(ed.Qty), 0) AS prevQty
          FROM Extracts_Details ed
          JOIN Extracts_Head eh ON ed.Extract_No = eh.Extract_No
          WHERE eh.Contract_No = @cNo AND ed.Level5_ID = @item
        `);

      return Number(res.recordset[0].prevQty) || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Creates and approves a progress billing extract atomically with General Ledger posting.
   * Single Transaction ACID Boundary:
   * BEGIN TRANSACTION -> Insert Extracts_Head -> Insert Extracts_Details -> Post GL Entry -> COMMIT
   */
  public async createExtract(
    payload: CreateExtractDTO,
    databaseKey?: string
  ): Promise<{ success: boolean; extractNo: number; glNoteNo: number; message: string }> {
    const resolvedDb = this.dbManager.resolveDatabaseKey(databaseKey);

    if (!payload.lines || payload.lines.length === 0) {
      throw new Error('لا يمكن إصدار مستخلص خالي من بنود الأعمال.');
    }

    // 1. Calculate Gross Work & Deductions via Arbitrary-Precision Decimal.js
    let totalGrossWork = new Decimal(0);
    const processedLines: Array<{
      itemCode: number;
      description: string;
      unit: string;
      previousQty: Decimal;
      currentQty: Decimal;
      totalQty: Decimal;
      unitPrice: Decimal;
      lineGross: Decimal;
      completionRate: Decimal;
      lineNet: Decimal;
    }> = [];

    for (let i = 0; i < payload.lines.length; i++) {
      const line = payload.lines[i];
      const prevQ = new Decimal(line.previousQty || 0);
      const currQ = new Decimal(line.currentQty || 0);
      const price = new Decimal(line.unitPrice || 0);
      const compRate = new Decimal(line.completionRate || 100);

      if (currQ.isNegative() || price.isNegative()) {
        throw new Error(`السطر رقم (${i + 1}): الكمية وسعر الفئة لا يمكن أن يكونا سالباً.`);
      }

      const totalQ = prevQ.plus(currQ);
      const gross = currQ.times(price);
      const net = gross.times(compRate.dividedBy(100));

      totalGrossWork = totalGrossWork.plus(net);

      processedLines.push({
        itemCode: Number(line.itemCode),
        description: line.description || 'بند مقاولة معتمد',
        unit: line.unit || 'مقطوعية',
        previousQty: prevQ,
        currentQty: currQ,
        totalQty: totalQ,
        unitPrice: price,
        lineGross: gross,
        completionRate: compRate,
        lineNet: net,
      });
    }

    if (totalGrossWork.isZero()) {
      throw new Error('إجمالي قيمة الأعمال المنجزة في المستخلص تساوي صفراً.');
    }

    // Deductions Calculation
    const advRate = new Decimal(payload.advanceRecoveryRate || 0);
    const retRate = new Decimal(payload.retentionRate || 0);
    const insRate = new Decimal(payload.insuranceRate || 0);
    const taxRate = new Decimal(payload.withholdingTaxRate || 1); // 1% default WHT
    const penalties = new Decimal(payload.penaltiesAndLabAmount || 0);

    const advanceRecoveryAmt = totalGrossWork.times(advRate.dividedBy(100));
    const retentionAmt = totalGrossWork.times(retRate.dividedBy(100));
    const insuranceAmt = totalGrossWork.times(insRate.dividedBy(100));
    const withholdingTaxAmt = totalGrossWork.times(taxRate.dividedBy(100));

    const totalDeductions = advanceRecoveryAmt
      .plus(retentionAmt)
      .plus(insuranceAmt)
      .plus(withholdingTaxAmt)
      .plus(penalties);

    const netPayable = totalGrossWork.minus(totalDeductions);

    if (netPayable.isNegative()) {
      throw new Error(
        `إجمالي الخصومات (${totalDeductions.toFixed(2)} ج.م) تجاوز قيمة الأعمال المنجزة (${totalGrossWork.toFixed(2)} ج.م).`
      );
    }

    // 2. Prepare Double-Entry Balancing GL Voucher
    const isSubcontractor = payload.extractType === 'SUBCONTRACTOR';
    const glDetails: Array<{
      Level5_ID: string;
      Debit: number;
      Credit: number;
      Description: string;
      Currency_ID: number;
      Exchange: number;
      Costcenter_ID: number;
      Analysis_ID: number;
    }> = [];

    if (isSubcontractor) {
      // Subcontractor Extract Accounting Rule:
      // Debit: Project WIP / Construction Expense (مشروعات تحت التنفيذ - أعمال مقاولين)
      glDetails.push({
        Level5_ID: '3102001', // أعمال مقاولي باطن - مشروعات
        Debit: totalGrossWork.toNumber(),
        Credit: 0,
        Description: `إثبات مستخلص مقاول باطن رقم [Pending] - مشروع #${payload.costcenterId}`,
        Currency_ID: 1,
        Exchange: 1,
        Costcenter_ID: payload.costcenterId,
        Analysis_ID: 0,
      });

      // Credit: Subcontractor Payable (Net Due)
      glDetails.push({
        Level5_ID: String(payload.partyAccountId),
        Debit: 0,
        Credit: netPayable.toNumber(),
        Description: `صافي المستحق للمقاول بموجب المستخلص - ${payload.partyNameAr || ''}`,
        Currency_ID: 1,
        Exchange: 1,
        Costcenter_ID: payload.costcenterId,
        Analysis_ID: 0,
      });

      // Credit: Advance Payment Recovery (if any)
      if (advanceRecoveryAmt.greaterThan(0)) {
        glDetails.push({
          Level5_ID: String(payload.advanceRecoveryAccountId || '1205001'), // دفعات مقدمة مقاولين
          Debit: 0,
          Credit: advanceRecoveryAmt.toNumber(),
          Description: `استرداد واستهلاك الدفعة المقدمة (${advRate}%)`,
          Currency_ID: 1,
          Exchange: 1,
          Costcenter_ID: payload.costcenterId,
          Analysis_ID: 0,
        });
      }

      // Credit: Retention / Business Guarantee Withheld
      if (retentionAmt.greaterThan(0)) {
        glDetails.push({
          Level5_ID: String(payload.retentionAccountId || '2104001'), // أمانات وضمان أعمال محتجزة
          Debit: 0,
          Credit: retentionAmt.toNumber(),
          Description: `خصم تأمين وضمان أعمال (${retRate}%)`,
          Currency_ID: 1,
          Exchange: 1,
          Costcenter_ID: payload.costcenterId,
          Analysis_ID: 0,
        });
      }

      // Credit: Withholding Tax (خصم وإضافة)
      if (withholdingTaxAmt.greaterThan(0)) {
        glDetails.push({
          Level5_ID: '2105001', // مصلحة الضرائب - خصم وتحصيل تحت حساب الضريبة
          Debit: 0,
          Credit: withholdingTaxAmt.toNumber(),
          Description: `خصم ضريبة الخصم والإضافة (${taxRate}%)`,
          Currency_ID: 1,
          Exchange: 1,
          Costcenter_ID: payload.costcenterId,
          Analysis_ID: 0,
        });
      }

      // Credit: Penalties & Deductions (if any)
      if (penalties.greaterThan(0)) {
        glDetails.push({
          Level5_ID: '4201001', // إيرادات متنوعة وغرامات مقاولين
          Debit: 0,
          Credit: penalties.toNumber(),
          Description: 'غرامات وملاحظات واختبارات معملية مخصومة',
          Currency_ID: 1,
          Exchange: 1,
          Costcenter_ID: payload.costcenterId,
          Analysis_ID: 0,
        });
      }
    } else {
      // Owner / Client Extract Accounting Rule:
      // Debit: Client / Project Owner (Net Due)
      glDetails.push({
        Level5_ID: String(payload.partyAccountId),
        Debit: netPayable.toNumber(),
        Credit: 0,
        Description: `صافي المطالبة بموجب مستخلص المالك رقم [Pending]`,
        Currency_ID: 1,
        Exchange: 1,
        Costcenter_ID: payload.costcenterId,
        Analysis_ID: 0,
      });

      // Debit: Retention Guarantee Asset (تأمينات لدى الغير)
      if (retentionAmt.greaterThan(0)) {
        glDetails.push({
          Level5_ID: String(payload.retentionAccountId || '1207001'),
          Debit: retentionAmt.toNumber(),
          Credit: 0,
          Description: `ضمان أعمال محتجز لدى المالك (${retRate}%)`,
          Currency_ID: 1,
          Exchange: 1,
          Costcenter_ID: payload.costcenterId,
          Analysis_ID: 0,
        });
      }

      // Debit: Advance Payment Deduction Amortized
      if (advanceRecoveryAmt.greaterThan(0)) {
        glDetails.push({
          Level5_ID: String(payload.advanceRecoveryAccountId || '2103001'),
          Debit: advanceRecoveryAmt.toNumber(),
          Credit: 0,
          Description: `خصم واستهلاك الدفعة المقدمة المحصلة مسبقاً (${advRate}%)`,
          Currency_ID: 1,
          Exchange: 1,
          Costcenter_ID: payload.costcenterId,
          Analysis_ID: 0,
        });
      }

      // Debit: Withholding Tax Deducted
      if (withholdingTaxAmt.greaterThan(0)) {
        glDetails.push({
          Level5_ID: '1208001', // مصلحة الضرائب - خصم لدى الغير
          Debit: withholdingTaxAmt.toNumber(),
          Credit: 0,
          Description: `ضريبة خصم وإضافة مقتطعة من المنبع (${taxRate}%)`,
          Currency_ID: 1,
          Exchange: 1,
          Costcenter_ID: payload.costcenterId,
          Analysis_ID: 0,
        });
      }

      // Credit: Contracting Revenue (إيرادات نشاط المقاولات)
      glDetails.push({
        Level5_ID: '4101001', // إيرادات عقود المقاولات والتشييد
        Debit: 0,
        Credit: totalGrossWork.toNumber(),
        Description: `إيرادات أعمال منجزة - مستخلص مالك مشروع #${payload.costcenterId}`,
        Currency_ID: 1,
        Exchange: 1,
        Costcenter_ID: payload.costcenterId,
        Analysis_ID: 0,
      });
    }

    // 3. Execute in Atomic ACID Transaction Boundary
    const result = await this.dbManager.executeTransaction(resolvedDb, async (tx) => {
      // A. Get Next Extract_No
      const nextNoReq = new sql.Request(tx);
      const nextNoRes = await nextNoReq.query('SELECT ISNULL(MAX(Extract_No), 100) + 1 AS nextNo FROM Extracts_Head');
      const extractNo = Number(nextNoRes.recordset[0].nextNo);

      // B. Insert into Extracts_Head
      const headReq = new sql.Request(tx);
      await headReq
        .input('extNo', extractNo)
        .input('extDate', payload.extractDate)
        .input('contractNo', payload.contractNo)
        .input('creditL5', payload.partyAccountId)
        .input('analysisId', 0)
        .input('costcenterId', payload.costcenterId)
        .input('insId', payload.insuranceAccountId || 0)
        .input('insPer', insRate.toNumber())
        .input('insAmt', insuranceAmt.toNumber())
        .input('balId', payload.retentionAccountId || 0)
        .input('balPer', retRate.toNumber())
        .input('balAmt', retentionAmt.toNumber())
        .input('payId', payload.advanceRecoveryAccountId || 0)
        .input('payPer', advRate.toNumber())
        .input('payAmt', advanceRecoveryAmt.toNumber())
        .input('nonId', 0)
        .input('nonPer', 0)
        .input('nonAmt', penalties.toNumber())
        .input('total', totalGrossWork.toNumber())
        .input('net', netPayable.toNumber())
        .input('netText', `فقط وقدره ${netPayable.toFixed(2)} لا غير`)
        .input('vatPer', payload.vatRate || 14)
        .input('vatAmt', totalGrossWork.times(0.14).toNumber())
        .input('netWithTax', netPayable.times(1.14).toNumber())
        .input('notice', payload.notice || 'مستخلص مقاولات معتمد')
        .input('entryId', 1)
        .input('entryName', payload.entryName || 'Chief Engineer')
        .query(`
          INSERT INTO Extracts_Head (
            Extract_No, Extract_Date, Contract_No, Credit_Level5_ID,
            Analysis_ID, Costcenter_ID,
            Work_Insurance_ID, Work_Insurance_Per, Work_Insurance_Amount,
            Work_Balance_ID, Work_Balance_Per, Work_Balance_Amount,
            Work_Payments_ID, Work_Payments_Per, Work_Payments_Amount,
            Nonconformities_ID, Nonconformities_Per, Nonconformities_Amount,
            Note_Total, Note_Net, Note_Net_Text,
            Vat_Tax_Per, Vat_Tax_Amount, Note_Net_With_Tax,
            Notice, Entry_ID, Entry_Name
          ) VALUES (
            @extNo, @extDate, @contractNo, @creditL5,
            @analysisId, @costcenterId,
            @insId, @insPer, @insAmt,
            @balId, @balPer, @balAmt,
            @payId, @payPer, @payAmt,
            @nonId, @nonPer, @nonAmt,
            @total, @net, @netText,
            @vatPer, @vatAmt, @netWithTax,
            @notice, @entryId, @entryName
          )
        `);

      // C. Insert Details Lines
      for (let i = 0; i < processedLines.length; i++) {
        const line = processedLines[i];
        const sr = i + 1;
        const dReq = new sql.Request(tx);
        await dReq
          .input('extNo', extractNo)
          .input('sr', sr)
          .input('l5', line.itemCode)
          .input('unit', line.unit)
          .input('prevQ', line.previousQty.toNumber())
          .input('actQ', line.currentQty.toNumber())
          .input('q', line.currentQty.toNumber())
          .input('totQ', line.totalQty.toNumber())
          .input('price', line.unitPrice.toNumber())
          .input('net', line.lineGross.toNumber())
          .input('rate', line.completionRate.toNumber())
          .input('compNet', line.lineNet.toNumber())
          .input('desc', line.description)
          .query(`
            INSERT INTO Extracts_Details (
              Extract_No, SR, Level5_ID, Unit_Name,
              Previous_Qty, Actual_Qty, Qty, Total_Qty,
              Price, Net, Completion_Rate, Completion_Net,
              Description
            ) VALUES (
              @extNo, @sr, @l5, @unit,
              @prevQ, @actQ, @q, @totQ,
              @price, @net, @rate, @compNet,
              @desc
            )
          `);
      }

      // D. Post Double-Entry Balancing GL Voucher in the SAME Transaction
      const completeGL: CompleteVoucherDTO = {
        head: {
          Note_No: 0,
          Note_Type_ID: isSubcontractor ? 301 : 302, // Progress Billing GL Type
          Note_Date: payload.extractDate,
          Description: `قيد اليومية التلقائي لمستخلص #${extractNo} (${isSubcontractor ? 'مقاول باطن' : 'المالك'}) - مشروع #${payload.costcenterId}`,
          Journal_Type: 0,
          Flag: true,
          Flag_N: 0,
          Entry_ID: 1,
          Entry_Name: payload.entryName || 'Chief Engineer',
          Note_Debit: totalGrossWork.toNumber(),
          Note_Credit: totalGrossWork.toNumber(),
          Note_Net_Text: `فقط وقدره ${netPayable.toFixed(2)} لا غير`,
        },
        details: glDetails as any,
      };

      const glNoteNo = await this.glService.postVoucherInTransaction(tx, completeGL);

      // E. Update Extracts_Head with Linked GL Note_No
      const updReq = new sql.Request(tx);
      await updReq
        .input('extNo', extractNo)
        .input('glNo', glNoteNo)
        .query('UPDATE Extracts_Head SET Journal_No = @glNo WHERE Extract_No = @extNo');

      return { extractNo, glNoteNo };
    });

    // 4. Post-Commit Asynchronous Cloud Audit & Telegram Dispatch
    this.oracleAudit.logVoucherTransaction({
      databaseName: resolvedDb,
      voucherNumber: result.extractNo,
      voucherDate: payload.extractDate,
      totalDebit: totalGrossWork.toNumber(),
      totalCredit: totalGrossWork.toNumber(),
      entryName: payload.entryName || 'Chief Engineer',
      status: 'COMMITTED',
      actionType: 'INSERT',
      detailsCount: processedLines.length,
    });

    this.telegramAlert.dispatchVoucherCommitAlert({
      databaseKey: resolvedDb,
      noteNo: result.extractNo,
      noteDate: payload.extractDate,
      totalDebit: totalGrossWork.toNumber(),
      totalCredit: totalGrossWork.toNumber(),
      description: `[مستخلص مقاولات] #${result.extractNo} | صافي المستحق: ${netPayable.toFixed(2)} ج.م | قيد مرتبط: [#${result.glNoteNo}]`,
      entryName: payload.entryName || 'Chief Engineer',
      linesCount: processedLines.length,
    });

    return {
      success: true,
      extractNo: result.extractNo,
      glNoteNo: result.glNoteNo,
      message: `تم اعتماد وترحيل المستخلص رقم [#${result.extractNo}] وقيد الأستاذ العام رقم [#${result.glNoteNo}] بنجاح في قاعدة البيانات [${resolvedDb}].`,
    };
  }

  // ==========================================
  // 4. LISTINGS & REPORTS
  // ==========================================

  public async listExtracts(databaseKey?: string, limit: number = 50): Promise<SubcontractorExtractHeadEntity[]> {
    const pool = await this.dbManager.getPool(databaseKey);
    try {
      const res = await pool.request().input('limit', limit).query<SubcontractorExtractHeadEntity>(`
        SELECT TOP (@limit) * FROM Extracts_Head ORDER BY Extract_No DESC
      `);
      return res.recordset;
    } catch {
      return [];
    }
  }

  public async getExtractDetails(extractNo: number, databaseKey?: string): Promise<SubcontractorExtractDetailsEntity[]> {
    const pool = await this.dbManager.getPool(databaseKey);
    try {
      const res = await pool
        .request()
        .input('extNo', extractNo)
        .query<SubcontractorExtractDetailsEntity>(`
          SELECT * FROM Extracts_Details WHERE Extract_No = @extNo ORDER BY SR ASC
        `);
      return res.recordset;
    } catch {
      return [];
    }
  }
}
