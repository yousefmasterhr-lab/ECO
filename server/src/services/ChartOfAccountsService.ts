/**
 * ECO ERP - Chart of Accounts Hierarchical Service (Levels 1 to 5)
 * Strict schema conformance with Tarabot ERP (tarabot_erp_complete_schema.json)
 * Implements cascading deletion guards, next-code generators, and hierarchical tree composition.
 */

import sql from 'mssql';
import { DynamicDatabaseManager } from '../db/DynamicDatabaseManager.js';
import {
  Level1Entity,
  Level2Entity,
  Level3Entity,
  Level4Entity,
  Level5Entity,
  ChartOfAccountsTreeNode,
} from '../models/tarabotSchema.js';

export class ChartOfAccountsService {
  private dbManager = DynamicDatabaseManager.getInstance();

  /**
   * Retrieves the full 5-level hierarchical tree of accounts
   */
  public async getCompleteTree(databaseKey?: string): Promise<ChartOfAccountsTreeNode[]> {
    const pool = await this.dbManager.getPool(databaseKey);

    const [l1Res, l2Res, l3Res, l4Res, l5Res] = await Promise.all([
      pool.request().query<Level1Entity>('SELECT * FROM Level1 ORDER BY Level1_ID ASC'),
      pool.request().query<Level2Entity>('SELECT * FROM Level2 ORDER BY Level2_ID ASC'),
      pool.request().query<Level3Entity>('SELECT * FROM Level3 ORDER BY Level3_ID ASC'),
      pool.request().query<Level4Entity>('SELECT * FROM Level4 ORDER BY Level4_ID ASC'),
      pool.request().query<Level5Entity>('SELECT * FROM Level5 ORDER BY Level5_ID ASC'),
    ]);

    const l1List = l1Res.recordset;
    const l2List = l2Res.recordset;
    const l3List = l3Res.recordset;
    const l4List = l4Res.recordset;
    const l5List = l5Res.recordset;

    // Group level 5 by Level4_ID
    const l5ByL4 = new Map<number, ChartOfAccountsTreeNode[]>();
    for (const l5 of l5List) {
      const node: ChartOfAccountsTreeNode = {
        id: Number(l5.Level5_ID),
        code: String(l5.Level5_ID),
        nameAr: l5.Level5_Name_A,
        nameEn: l5.Level5_Name_E,
        level: 5,
        parentId: Number(l5.Level4_ID),
        accountNature: l5.Account_Nature,
        isLeaf: true,
        isCostcenter: Boolean(l5.Is_Costcenter),
        isAnalysis: Boolean(l5.Is_Analysis),
      };
      if (!l5ByL4.has(l5.Level4_ID)) l5ByL4.set(l5.Level4_ID, []);
      l5ByL4.get(l5.Level4_ID)!.push(node);
    }

    // Group level 4 by Level3_ID
    const l4ByL3 = new Map<number, ChartOfAccountsTreeNode[]>();
    for (const l4 of l4List) {
      const children = l5ByL4.get(l4.Level4_ID) || [];
      const node: ChartOfAccountsTreeNode = {
        id: l4.Level4_ID,
        code: String(l4.Level4_ID),
        nameAr: l4.Level4_Name_A,
        nameEn: l4.Level4_Name_E,
        level: 4,
        parentId: l4.Level3_ID,
        isLeaf: children.length === 0,
        children,
      };
      if (!l4ByL3.has(l4.Level3_ID)) l4ByL3.set(l4.Level3_ID, []);
      l4ByL3.get(l4.Level3_ID)!.push(node);
    }

    // Group level 3 by Level2_ID
    const l3ByL2 = new Map<number, ChartOfAccountsTreeNode[]>();
    for (const l3 of l3List) {
      const children = l4ByL3.get(l3.Level3_ID) || [];
      const node: ChartOfAccountsTreeNode = {
        id: l3.Level3_ID,
        code: String(l3.Level3_ID),
        nameAr: l3.Level3_Name_A,
        nameEn: l3.Level3_Name_E,
        level: 3,
        parentId: l3.Level2_ID,
        isLeaf: children.length === 0,
        children,
      };
      if (!l3ByL2.has(l3.Level2_ID)) l3ByL2.set(l3.Level2_ID, []);
      l3ByL2.get(l3.Level2_ID)!.push(node);
    }

    // Group level 2 by Level1_ID
    const l2ByL1 = new Map<number, ChartOfAccountsTreeNode[]>();
    for (const l2 of l2List) {
      const children = l3ByL2.get(l2.Level2_ID) || [];
      const node: ChartOfAccountsTreeNode = {
        id: l2.Level2_ID,
        code: String(l2.Level2_ID),
        nameAr: l2.Level2_Name_A,
        nameEn: l2.Level2_Name_E,
        level: 2,
        parentId: l2.Level1_ID,
        isLeaf: children.length === 0,
        children,
      };
      if (!l2ByL1.has(l2.Level1_ID)) l2ByL1.set(l2.Level1_ID, []);
      l2ByL1.get(l2.Level1_ID)!.push(node);
    }

    // Compose Root Level 1 Nodes
    const rootNodes: ChartOfAccountsTreeNode[] = l1List.map((l1) => {
      const children = l2ByL1.get(l1.Level1_ID) || [];
      return {
        id: l1.Level1_ID,
        code: String(l1.Level1_ID),
        nameAr: l1.Level1_Name_A,
        nameEn: l1.Level1_Name_E,
        level: 1,
        isLeaf: children.length === 0,
        children,
      };
    });

    return rootNodes;
  }

  /**
   * Retrieves all accounts of a specific level
   */
  public async getAccountsByLevel(level: 1 | 2 | 3 | 4 | 5, databaseKey?: string): Promise<any[]> {
    const pool = await this.dbManager.getPool(databaseKey);
    const tableName = `Level${level}`;
    const idColumn = `Level${level}_ID`;
    const result = await pool.request().query(`SELECT * FROM ${tableName} ORDER BY ${idColumn} ASC`);
    return result.recordset;
  }

  /**
   * Generates the next available account code under a parent
   */
  public async getNextAccountCode(
    level: 2 | 3 | 4 | 5,
    parentId: number,
    databaseKey?: string
  ): Promise<string> {
    const pool = await this.dbManager.getPool(databaseKey);
    const tableName = `Level${level}`;
    const idCol = `Level${level}_ID`;
    const parentCol = `Level${level - 1}_ID`;

    const result = await pool
      .request()
      .input('parentId', parentId)
      .query(`SELECT MAX(${idCol}) AS maxId FROM ${tableName} WHERE ${parentCol} = @parentId`);

    const maxId = result.recordset[0]?.maxId;
    if (!maxId) {
      if (level === 5) {
        return `${parentId}001`;
      }
      return `${parentId}01`;
    }

    const nextNumeric = Number(maxId) + 1;
    return String(nextNumeric);
  }

  /**
   * Cascading Deletion Guard & Node Removal
   * Strictly enforces parent-child constraint and checks GeneralLedger_Details on Level 5
   */
  public async deleteAccountNode(
    level: 1 | 2 | 3 | 4 | 5,
    accountId: number,
    databaseKey?: string
  ): Promise<{ success: boolean; message: string }> {
    const pool = await this.dbManager.getPool(databaseKey);

    // Level 1 Guard: Check Level 2
    if (level === 1) {
      const check = await pool
        .request()
        .input('id', accountId)
        .query('SELECT COUNT(1) AS cnt FROM Level2 WHERE Level1_ID = @id');
      if (check.recordset[0].cnt > 0) {
        throw new Error('لا يمكن حذف السجل لأرتباطه ببيانات في ملف تأسيس المستوى الثاني في الشجرة المحاسبية');
      }
      await pool.request().input('id', accountId).query('DELETE FROM Level1 WHERE Level1_ID = @id');
      return { success: true, message: 'تم حذف حساب المستوى الأول بنجاح' };
    }

    // Level 2 Guard: Check Level 3
    if (level === 2) {
      const check = await pool
        .request()
        .input('id', accountId)
        .query('SELECT COUNT(1) AS cnt FROM Level3 WHERE Level2_ID = @id');
      if (check.recordset[0].cnt > 0) {
        throw new Error('لا يمكن حذف السجل لأرتباطه ببيانات في ملف تأسيس المستوى الثالث في الشجرة المحاسبية');
      }
      await pool.request().input('id', accountId).query('DELETE FROM Level2 WHERE Level2_ID = @id');
      return { success: true, message: 'تم حذف حساب المستوى الثاني بنجاح' };
    }

    // Level 3 Guard: Check Level 4
    if (level === 3) {
      const check = await pool
        .request()
        .input('id', accountId)
        .query('SELECT COUNT(1) AS cnt FROM Level4 WHERE Level3_ID = @id');
      if (check.recordset[0].cnt > 0) {
        throw new Error('لا يمكن حذف السجل لأرتباطه ببيانات في ملف تأسيس المستوى الرابع في الشجرة المحاسبية');
      }
      await pool.request().input('id', accountId).query('DELETE FROM Level3 WHERE Level3_ID = @id');
      return { success: true, message: 'تم حذف حساب المستوى الثالث بنجاح' };
    }

    // Level 4 Guard: Check Level 5
    if (level === 4) {
      const check = await pool
        .request()
        .input('id', accountId)
        .query('SELECT COUNT(1) AS cnt FROM Level5 WHERE Level4_ID = @id');
      if (check.recordset[0].cnt > 0) {
        throw new Error('لا يمكن حذف السجل لأرتباطه ببيانات في ملف تأسيس المستوى الخامس في الشجرة المحاسبية');
      }
      await pool.request().input('id', accountId).query('DELETE FROM Level4 WHERE Level4_ID = @id');
      return { success: true, message: 'تم حذف حساب المستوى الرابع بنجاح' };
    }

    // Level 5 Guard: Check GeneralLedger_Details
    if (level === 5) {
      const check = await pool
        .request()
        .input('id', accountId)
        .query('SELECT COUNT(1) AS cnt FROM GeneralLedger_Details WHERE Level5_ID = @id');
      if (check.recordset[0].cnt > 0) {
        throw new Error(`لا يمكن حذف الحساب [${accountId}] لوجود حركات وقيود محاسبية مسجلة عليه في قيود اليومية`);
      }
      await pool.request().input('id', accountId).query('DELETE FROM Level5 WHERE Level5_ID = @id');
      return { success: true, message: 'تم حذف الحساب التحليلي بنجاح' };
    }

    throw new Error('مستوى الحساب غير صالح');
  }

  /**
   * Creates or updates a Level 5 Account
   */
  public async saveLevel5Account(account: Level5Entity, databaseKey?: string): Promise<Level5Entity> {
    const pool = await this.dbManager.getPool(databaseKey);

    const existsCheck = await pool
      .request()
      .input('id', account.Level5_ID)
      .query('SELECT COUNT(1) AS cnt FROM Level5 WHERE Level5_ID = @id');

    const exists = existsCheck.recordset[0].cnt > 0;

    if (exists) {
      await pool
        .request()
        .input('id', account.Level5_ID)
        .input('l4', account.Level4_ID)
        .input('nameA', account.Level5_Name_A)
        .input('nameE', account.Level5_Name_E || account.Level5_Name_A)
        .input('nature', account.Account_Nature)
        .input('isCostcenter', account.Is_Costcenter ? 1 : 0)
        .input('isAnalysis', account.Is_Analysis ? 1 : 0)
        .input('notice', account.Notice || ' ')
        .query(`
          UPDATE Level5 SET
            Level4_ID = @l4,
            Level5_Name_A = @nameA,
            Level5_Name_E = @nameE,
            Account_Nature = @nature,
            Is_Costcenter = @isCostcenter,
            Is_Analysis = @isAnalysis,
            Notice = @notice
          WHERE Level5_ID = @id
        `);
    } else {
      await pool
        .request()
        .input('id', account.Level5_ID)
        .input('l4', account.Level4_ID)
        .input('nameA', account.Level5_Name_A)
        .input('nameE', account.Level5_Name_E || account.Level5_Name_A)
        .input('nature', account.Account_Nature)
        .input('balanceSheetType', account.Balance_Sheet_Type || 0)
        .input('incomType', account.Incom_Type || 0)
        .input('moduleType', account.Module_Type || 0)
        .input('isCostcenter', account.Is_Costcenter ? 1 : 0)
        .input('isAnalysis', account.Is_Analysis ? 1 : 0)
        .input('entryId', account.Entry_ID || 1)
        .input('entryName', account.Entry_Name || 'Admin')
        .input('notice', account.Notice || ' ')
        .query(`
          INSERT INTO Level5 (
            Level4_ID, Level5_ID, Level5_Name_A, Level5_Name_E, Account_Nature,
            Balance_Sheet_Type, Incom_Type, Module_Type, Is_Costcenter, Is_Analysis,
            Entry_ID, Entry_Name, Notice
          ) VALUES (
            @l4, @id, @nameA, @nameE, @nature,
            @balanceSheetType, @incomType, @moduleType, @isCostcenter, @isAnalysis,
            @entryId, @entryName, @notice
          )
        `);
    }

    return account;
  }
}
