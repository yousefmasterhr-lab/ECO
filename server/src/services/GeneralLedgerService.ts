/**
 * ECO ERP - General Ledger Journal Voucher Transaction Engine
 * Implements strict arbitrary-precision balance validation via decimal.js
 * Atomic SQL Server ACID transactions with automatic rollback on error.
 * Non-blocking Oracle Autonomous DB Cloud Audit hook & Telegram Alert dispatcher.
 */

import sql from 'mssql';
import { Decimal } from 'decimal.js';
import { DynamicDatabaseManager } from '../db/DynamicDatabaseManager.js';
import {
  GeneralLedgerHeadEntity,
  GeneralLedgerDetailsEntity,
  CompleteVoucherDTO,
} from '../models/tarabotSchema.js';
import { OracleAuditHook } from './OracleAuditHook.js';
import { TelegramAlertService } from './TelegramAlertService.js';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export class GeneralLedgerService {
  private dbManager = DynamicDatabaseManager.getInstance();
  private oracleAudit = OracleAuditHook.getInstance();
  private telegramAlert = TelegramAlertService.getInstance();

  /**
   * Evaluates the fundamental double-entry invariant using Decimal.js:
   * |TotalDebit - TotalCredit| === 0.0000
   */
  public validateVoucherInvariant(details: GeneralLedgerDetailsEntity[]): {
    isValid: boolean;
    totalDebit: Decimal;
    totalCredit: Decimal;
    difference: Decimal;
    errorMessage?: string;
  } {
    if (!details || details.length === 0) {
      return {
        isValid: false,
        totalDebit: new Decimal(0),
        totalCredit: new Decimal(0),
        difference: new Decimal(0),
        errorMessage: 'لا يمكن حفظ سند قيد يومية خالي من السطور (Zero-row voucher rejected).',
      };
    }

    let totalDebit = new Decimal(0);
    let totalCredit = new Decimal(0);

    for (let i = 0; i < details.length; i++) {
      const line = details[i];
      const d = new Decimal(line.Debit || 0);
      const c = new Decimal(line.Credit || 0);

      // Invariant: No negative values in debit or credit
      if (d.isNegative() || c.isNegative()) {
        return {
          isValid: false,
          totalDebit,
          totalCredit,
          difference: new Decimal(0),
          errorMessage: `السطر رقم (${i + 1}): غير صالح. لا يُسمح بإدخال مبالغ سالبة في خانة المدين أو الدائن.`,
        };
      }

      // Invariant: At least one side must be positive
      if (d.isZero() && c.isZero()) {
        return {
          isValid: false,
          totalDebit,
          totalCredit,
          difference: new Decimal(0),
          errorMessage: `السطر رقم (${i + 1}): يجب إدخال قيمة في أي حقل من مدين أو دائن.`,
        };
      }

      // Invariant: Account ID required
      if (!line.Level5_ID || Number(line.Level5_ID) <= 0) {
        return {
          isValid: false,
          totalDebit,
          totalCredit,
          difference: new Decimal(0),
          errorMessage: `السطر رقم (${i + 1}): يجب تحديد كود حساب المستوى الخامس التحليلي.`,
        };
      }

      totalDebit = totalDebit.plus(d);
      totalCredit = totalCredit.plus(c);
    }

    const difference = totalDebit.minus(totalCredit).abs();
    const isBalanced = difference.equals(new Decimal(0));

    if (!isBalanced) {
      return {
        isValid: false,
        totalDebit,
        totalCredit,
        difference,
        errorMessage: `القيد غير متوازن محاسبياً! إجمالي المدين: ${totalDebit.toFixed(4)} ج.م | إجمالي الدائن: ${totalCredit.toFixed(4)} ج.م | الفارق: ${difference.toFixed(4)} ج.م. شرط التوازن الإلزامي: الفارق = 0.0000.`,
      };
    }

    return {
      isValid: true,
      totalDebit,
      totalCredit,
      difference,
    };
  }

  /**
   * Fetches the next sequential voucher number for the given database
   */
  public async getNextVoucherNumber(databaseKey?: string): Promise<number> {
    const pool = await this.dbManager.getPool(databaseKey);
    const result = await pool.request().query('SELECT ISNULL(MAX(Note_No), 0) + 1 AS nextNo FROM GeneralLedger_Head');
    return Number(result.recordset[0].nextNo);
  }

  /**
   * Retrieves a single voucher with its details
   */
  public async getVoucherByNoteNo(noteNo: number, databaseKey?: string): Promise<CompleteVoucherDTO | null> {
    const pool = await this.dbManager.getPool(databaseKey);

    const headRes = await pool
      .request()
      .input('noteNo', noteNo)
      .query<GeneralLedgerHeadEntity>('SELECT * FROM GeneralLedger_Head WHERE Note_No = @noteNo');

    if (headRes.recordset.length === 0) return null;

    const detailsRes = await pool
      .request()
      .input('noteNo', noteNo)
      .query<GeneralLedgerDetailsEntity>('SELECT * FROM GeneralLedger_Details WHERE Note_No = @noteNo ORDER BY SR ASC');

    return {
      head: headRes.recordset[0],
      details: detailsRes.recordset,
    };
  }

  /**
   * Lists recent vouchers with pagination
   */
  public async listVouchers(
    databaseKey?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ vouchers: GeneralLedgerHeadEntity[]; total: number }> {
    const pool = await this.dbManager.getPool(databaseKey);

    const countRes = await pool.request().query('SELECT COUNT(1) AS total FROM GeneralLedger_Head');
    const total = Number(countRes.recordset[0].total);

    const listRes = await pool
      .request()
      .input('limit', limit)
      .input('offset', offset)
      .query<GeneralLedgerHeadEntity>(`
        SELECT * FROM GeneralLedger_Head 
        ORDER BY Note_No DESC 
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `);

    return { vouchers: listRes.recordset, total };
  }

  /**
   * Saves and posts a Journal Voucher atomically inside an ACID transaction.
   * Auto-rollbacks if balance != 0.0000 or database error occurs.
   * On commit, triggers asynchronous Oracle Cloud Audit and Telegram alert.
   */
  public async saveAndPostVoucher(
    voucher: CompleteVoucherDTO,
    databaseKey?: string
  ): Promise<{ success: boolean; noteNo: number; message: string }> {
    const resolvedDb = this.dbManager.resolveDatabaseKey(databaseKey);

    // 1. Invariant Evaluation via Decimal.js
    const validation = this.validateVoucherInvariant(voucher.details);
    if (!validation.isValid) {
      // Dispatch immediate Telegram Security Alert
      this.telegramAlert.dispatchIntegrityFailureAlert({
        databaseKey: resolvedDb,
        attemptedNoteNo: voucher.head.Note_No,
        totalDebit: validation.totalDebit.toFixed(4),
        totalCredit: validation.totalCredit.toFixed(4),
        difference: validation.difference.toFixed(4),
        entryName: voucher.head.Entry_Name,
        errorMessage: validation.errorMessage || 'فشل التحقق من توازن القيد',
      });

      throw new Error(validation.errorMessage);
    }

    // 2. Atomic SQL Server Transaction
    const result = await this.dbManager.executeTransaction(resolvedDb, async (tx) => {
      let targetNoteNo = voucher.head.Note_No;

      // Auto-assign Note_No if 0 or new
      if (!targetNoteNo || targetNoteNo <= 0) {
        const nextReq = new sql.Request(tx);
        const nextRes = await nextReq.query('SELECT ISNULL(MAX(Note_No), 0) + 1 AS nextNo FROM GeneralLedger_Head');
        targetNoteNo = Number(nextRes.recordset[0].nextNo);
      }

      // Check if updating existing
      const checkReq = new sql.Request(tx);
      checkReq.input('noteNo', targetNoteNo);
      const checkRes = await checkReq.query('SELECT COUNT(1) AS cnt FROM GeneralLedger_Head WHERE Note_No = @noteNo');
      const isExisting = checkRes.recordset[0].cnt > 0;

      const totalDebitFloat = validation.totalDebit.toNumber();
      const totalCreditFloat = validation.totalCredit.toNumber();

      if (isExisting) {
        // Update Head
        const updateHeadReq = new sql.Request(tx);
        updateHeadReq
          .input('noteNo', targetNoteNo)
          .input('noteTypeId', voucher.head.Note_Type_ID || 201)
          .input('noteDate', voucher.head.Note_Date)
          .input('noteDateH', voucher.head.Note_Date_H || '')
          .input('journalType', voucher.head.Journal_Type || 0)
          .input('debit', totalDebitFloat)
          .input('credit', totalCreditFloat)
          .input('netText', voucher.head.Note_Net_Text || '')
          .input('desc', voucher.head.Description || '')
          .input('entryId', voucher.head.Entry_ID || 1)
          .input('entryName', voucher.head.Entry_Name || 'Admin')
          .input('flag', voucher.head.Flag ? 1 : 0)
          .input('flagN', voucher.head.Flag_N || 0)
          .input('notice', voucher.head.Notice || '')
          .query(`
            UPDATE GeneralLedger_Head SET
              Note_Type_ID = @noteTypeId,
              Note_Date = @noteDate,
              Note_Date_H = @noteDateH,
              Journal_Type = @journalType,
              Note_Debit = @debit,
              Note_Credit = @credit,
              Note_Net_Text = @netText,
              Description = @desc,
              Entry_ID = @entryId,
              Entry_Name = @entryName,
              Flag = @flag,
              Flag_N = @flagN,
              Notice = @notice
            WHERE Note_No = @noteNo
          `);

        // Delete old details lines for atomic replacement
        const delDetailsReq = new sql.Request(tx);
        delDetailsReq.input('noteNo', targetNoteNo);
        await delDetailsReq.query('DELETE FROM GeneralLedger_Details WHERE Note_No = @noteNo');
      } else {
        // Insert Head
        const insertHeadReq = new sql.Request(tx);
        insertHeadReq
          .input('noteNo', targetNoteNo)
          .input('noteTypeId', voucher.head.Note_Type_ID || 201)
          .input('noteDate', voucher.head.Note_Date)
          .input('noteDateH', voucher.head.Note_Date_H || '')
          .input('journalType', voucher.head.Journal_Type || 0)
          .input('debit', totalDebitFloat)
          .input('credit', totalCreditFloat)
          .input('netText', voucher.head.Note_Net_Text || '')
          .input('desc', voucher.head.Description || '')
          .input('entryId', voucher.head.Entry_ID || 1)
          .input('entryName', voucher.head.Entry_Name || 'Admin')
          .input('flag', voucher.head.Flag ? 1 : 0)
          .input('flagN', voucher.head.Flag_N || 0)
          .input('notice', voucher.head.Notice || '')
          .query(`
            INSERT INTO GeneralLedger_Head (
              Note_No, Note_Type_ID, Note_Date, Note_Date_H, Journal_Type,
              Note_Debit, Note_Credit, Note_Net_Text, Description,
              Entry_ID, Entry_Name, Flag, Flag_N, Notice
            ) VALUES (
              @noteNo, @noteTypeId, @noteDate, @noteDateH, @journalType,
              @debit, @credit, @netText, @desc,
              @entryId, @entryName, @flag, @flagN, @notice
            )
          `);
      }

      // Insert Detail Lines with Sequential SR
      for (let i = 0; i < voucher.details.length; i++) {
        const line = voucher.details[i];
        const sr = i + 1;
        const lineDebit = new Decimal(line.Debit || 0).toNumber();
        const lineCredit = new Decimal(line.Credit || 0).toNumber();
        const exchange = new Decimal(line.Exchange || 1).toNumber();
        const actualDebit = line.Actual_Debit ? new Decimal(line.Actual_Debit).toNumber() : lineDebit;
        const actualCredit = line.Actual_Credit ? new Decimal(line.Actual_Credit).toNumber() : lineCredit;

        const lineReq = new sql.Request(tx);
        lineReq
          .input('noteNo', targetNoteNo)
          .input('sr', sr)
          .input('l5', line.Level5_ID)
          .input('desc', line.Description || voucher.head.Description || '')
          .input('currencyId', line.Currency_ID || 1)
          .input('exchange', exchange)
          .input('actualDebit', actualDebit)
          .input('debit', lineDebit)
          .input('actualCredit', actualCredit)
          .input('credit', lineCredit)
          .input('costcenterId', line.Costcenter_ID || 0)
          .input('analysisId', line.Analysis_ID || 0)
          .input('jobOrderNo', line.Job_Order_No || 0)
          .input('analyse1', line.Analyse1 || '-')
          .input('analyse2', line.Analyse2 || '-')
          .input('flag', line.Flag ? 1 : 0)
          .input('flagN', line.Flag_N || 0)
          .input('notice', line.Notice || '')
          .query(`
            INSERT INTO GeneralLedger_Details (
              Note_No, SR, Level5_ID, Description, Currency_ID,
              Exchange, Actual_Debit, Debit, Actual_Credit, Credit,
              Costcenter_ID, Analysis_ID, Job_Order_No,
              Analyse1, Analyse2, Flag, Flag_N, Notice
            ) VALUES (
              @noteNo, @sr, @l5, @desc, @currencyId,
              @exchange, @actualDebit, @debit, @actualCredit, @credit,
              @costcenterId, @analysisId, @jobOrderNo,
              @analyse1, @analyse2, @flag, @flagN, @notice
            )
          `);
      }

      return targetNoteNo;
    });

    // 3. Post-Commit Asynchronous Cloud Audit & Telegram Dispatch (Non-Blocking)
    this.oracleAudit.logVoucherTransaction({
      databaseName: resolvedDb,
      voucherNumber: result,
      voucherDate: voucher.head.Note_Date,
      totalDebit: validation.totalDebit.toNumber(),
      totalCredit: validation.totalCredit.toNumber(),
      entryName: voucher.head.Entry_Name,
      status: 'COMMITTED',
      actionType: voucher.head.Note_No ? 'UPDATE' : 'INSERT',
      detailsCount: voucher.details.length,
    });

    this.telegramAlert.dispatchVoucherCommitAlert({
      databaseKey: resolvedDb,
      noteNo: result,
      noteDate: voucher.head.Note_Date,
      totalDebit: validation.totalDebit.toNumber(),
      totalCredit: validation.totalCredit.toNumber(),
      description: voucher.head.Description,
      entryName: voucher.head.Entry_Name,
      linesCount: voucher.details.length,
    });

    return {
      success: true,
      noteNo: result,
      message: `تم حفظ وترحيل سند قيد اليومية رقم [#${result}] بنجاح في قاعدة البيانات [${resolvedDb}]. القيد متوازن ومطابق لمعايير الحوكمة المالية.`,
    };
  }

  /**
   * Deletes a journal voucher and its lines if not audited/flagged
   */
  public async deleteVoucher(
    noteNo: number,
    databaseKey?: string
  ): Promise<{ success: boolean; message: string }> {
    const resolvedDb = this.dbManager.resolveDatabaseKey(databaseKey);

    return await this.dbManager.executeTransaction(resolvedDb, async (tx) => {
      const checkReq = new sql.Request(tx);
      checkReq.input('noteNo', noteNo);
      const checkRes = await checkReq.query<GeneralLedgerHeadEntity>(
        'SELECT Flag FROM GeneralLedger_Head WHERE Note_No = @noteNo'
      );

      if (checkRes.recordset.length === 0) {
        throw new Error(`سند قيد اليومية رقم [#${noteNo}] غير موجود.`);
      }

      if (checkRes.recordset[0].Flag) {
        throw new Error(`لا يمكن حذف سند قيد اليومية رقم [#${noteNo}] لأنه معتمد ومغلق محاسبياً (Audited/Flagged).`);
      }

      const delDetails = new sql.Request(tx);
      delDetails.input('noteNo', noteNo);
      await delDetails.query('DELETE FROM GeneralLedger_Details WHERE Note_No = @noteNo');

      const delHead = new sql.Request(tx);
      delHead.input('noteNo', noteNo);
      await delHead.query('DELETE FROM GeneralLedger_Head WHERE Note_No = @noteNo');

      // Non-blocking Audit
      this.oracleAudit.logVoucherTransaction({
        databaseName: resolvedDb,
        voucherNumber: noteNo,
        voucherDate: new Date().toISOString().split('T')[0],
        totalDebit: 0,
        totalCredit: 0,
        entryName: 'Admin',
        status: 'CANCELLED',
        actionType: 'DELETE',
      });

      return {
        success: true,
        message: `تم حذف سند قيد اليومية رقم [#${noteNo}] وكافة سطوره المرتبطة بنجاح.`,
      };
    });
  }
}
