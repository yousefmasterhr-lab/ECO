/**
 * ECO ERP - Financial & General Ledger Express Routes
 * Connects Desktop UI & Clients to the Multi-Database Engine via X-Database-Key
 */

import { Router, Request, Response } from 'express';
import { DynamicDatabaseManager } from '../db/DynamicDatabaseManager.js';
import { DATABASE_REGISTRY } from '../config/databases.js';
import { ChartOfAccountsService } from '../services/ChartOfAccountsService.js';
import { GeneralLedgerService } from '../services/GeneralLedgerService.js';

export const financialRouter = Router();

const dbManager = DynamicDatabaseManager.getInstance();
const coaService = new ChartOfAccountsService();
const glService = new GeneralLedgerService();

// Helper to extract target database key from request header
function getTargetDb(req: Request): string {
  const headerKey = req.headers['x-database-key'] as string;
  return dbManager.resolveDatabaseKey(headerKey);
}

// 1. Get Database Fleet & Status
financialRouter.get('/databases', async (req: Request, res: Response) => {
  try {
    const healthOverview = dbManager.getHealthOverview();
    const healthMap = new Map(healthOverview.map((h) => [h.databaseKey, h]));

    const fleet = Object.values(DATABASE_REGISTRY).map((entry) => {
      const health = healthMap.get(entry.name);
      return {
        ...entry,
        isHealthy: health ? health.connected : false,
        activeRequests: health ? health.activeRequests : 0,
        lastChecked: health ? health.lastHealthCheck : null,
      };
    });

    res.json({
      success: true,
      activeDatabase: getTargetDb(req),
      totalDatabases: fleet.length,
      databases: fleet,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Chart of Accounts - 5-Level Hierarchical Tree
financialRouter.get('/chart-of-accounts/tree', async (req: Request, res: Response) => {
  try {
    const targetDb = getTargetDb(req);
    const tree = await coaService.getCompleteTree(targetDb);
    res.json({ success: true, database: targetDb, tree });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Chart of Accounts - Level Filter
financialRouter.get('/chart-of-accounts/level/:level', async (req: Request, res: Response) => {
  try {
    const targetDb = getTargetDb(req);
    const levelStr = String(req.params.level || '1');
    const level = parseInt(levelStr, 10) as 1 | 2 | 3 | 4 | 5;
    if (isNaN(level) || level < 1 || level > 5) {
      return res.status(400).json({ success: false, error: 'المستوى المطلوب يجب أن يكون بين 1 و 5' });
    }
    const accounts = await coaService.getAccountsByLevel(level, targetDb);
    res.json({ success: true, database: targetDb, level, accounts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Next Account Code Generator
financialRouter.get('/chart-of-accounts/next-code/:level/:parentId', async (req: Request, res: Response) => {
  try {
    const targetDb = getTargetDb(req);
    const levelStr = String(req.params.level || '5');
    const parentIdStr = String(req.params.parentId || '1');
    const level = parseInt(levelStr, 10) as 2 | 3 | 4 | 5;
    const parentId = parseInt(parentIdStr, 10);
    const nextCode = await coaService.getNextAccountCode(level, parentId, targetDb);
    res.json({ success: true, database: targetDb, level, parentId, nextCode });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Save Level 5 Leaf Account
financialRouter.post('/chart-of-accounts/level5', async (req: Request, res: Response) => {
  try {
    const targetDb = getTargetDb(req);
    const saved = await coaService.saveLevel5Account(req.body, targetDb);
    res.json({ success: true, database: targetDb, account: saved });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 6. Delete Account with Cascading Guard
financialRouter.delete('/chart-of-accounts/level/:level/:id', async (req: Request, res: Response) => {
  try {
    const targetDb = getTargetDb(req);
    const levelStr = String(req.params.level || '5');
    const idStr = String(req.params.id || '0');
    const level = parseInt(levelStr, 10) as 1 | 2 | 3 | 4 | 5;
    const id = parseInt(idStr, 10);
    const result = await coaService.deleteAccountNode(level, id, targetDb);
    res.json({ database: targetDb, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 7. General Ledger Vouchers - List & Search
financialRouter.get('/vouchers', async (req: Request, res: Response) => {
  try {
    const targetDb = getTargetDb(req);
    const limit = parseInt(String(req.query.limit || '50'), 10);
    const offset = parseInt(String(req.query.offset || '0'), 10);
    const result = await glService.listVouchers(targetDb, limit, offset);
    res.json({ success: true, database: targetDb, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Next Voucher Number
financialRouter.get('/vouchers/next-number', async (req: Request, res: Response) => {
  try {
    const targetDb = getTargetDb(req);
    const nextNo = await glService.getNextVoucherNumber(targetDb);
    res.json({ success: true, database: targetDb, nextNo });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Single Voucher Details
financialRouter.get('/vouchers/:noteNo', async (req: Request, res: Response) => {
  try {
    const targetDb = getTargetDb(req);
    const noteNo = parseInt(String(req.params.noteNo || '0'), 10);
    const voucher = await glService.getVoucherByNoteNo(noteNo, targetDb);
    if (!voucher) {
      return res.status(404).json({ success: false, error: `سند قيد اليومية رقم [#${noteNo}] غير موجود` });
    }
    res.json({ success: true, database: targetDb, voucher });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Atomic Save & Post Journal Voucher
financialRouter.post('/vouchers', async (req: Request, res: Response) => {
  try {
    const targetDb = getTargetDb(req);
    const result = await glService.saveAndPostVoucher(req.body, targetDb);
    res.json({ database: targetDb, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 11. Delete Journal Voucher
financialRouter.delete('/vouchers/:noteNo', async (req: Request, res: Response) => {
  try {
    const targetDb = getTargetDb(req);
    const noteNo = parseInt(String(req.params.noteNo || '0'), 10);
    const result = await glService.deleteVoucher(noteNo, targetDb);
    res.json({ database: targetDb, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 12. Cost Centers Lookups
financialRouter.get('/costcenters', async (req: Request, res: Response) => {
  try {
    const targetDb = getTargetDb(req);
    const pool = await dbManager.getPool(targetDb);
    const result = await pool.request().query('SELECT * FROM Costcenters ORDER BY Costcenter_ID ASC');
    res.json({ success: true, database: targetDb, costcenters: result.recordset });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 13. Accounts Analysis Lookups
financialRouter.get('/analysis', async (req: Request, res: Response) => {
  try {
    const targetDb = getTargetDb(req);
    const pool = await dbManager.getPool(targetDb);
    const result = await pool.request().query('SELECT * FROM Accounts_Analysis ORDER BY Analysis_ID ASC');
    res.json({ success: true, database: targetDb, analysis: result.recordset });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
