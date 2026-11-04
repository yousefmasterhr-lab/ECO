/**
 * ECO ERP - Inventory, Warehouses & Stock Movements Express Routes (Phase 06)
 * Mounting path: /api/inventory
 * Source of Truth: tarabot_erp_complete_schema.json & Phase_06_InventoryItems_Spec.md
 */

import { Router, Request, Response } from 'express';
import { InventoryService } from '../services/InventoryService.js';
import {
  CreateStockIssueDTO,
  CreateStockDeliveryDTO,
  CreateStockTransferDTO,
  CreateStockAdjustmentDTO,
  CreateWarehouseDTO,
  CreateItemDTO,
} from '../models/inventorySchema.js';

export const inventoryRouter = Router();
const inventoryService = InventoryService.getInstance();

const extractDatabaseKey = (req: Request): string | undefined => {
  return (req.headers['x-database-key'] as string) || (req.query.databaseKey as string) || undefined;
};

// ----------------------------------------------------------------------------
// 1. Warehouses Master
// ----------------------------------------------------------------------------

inventoryRouter.get('/warehouses', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbKey = extractDatabaseKey(req);
    const warehouses = await inventoryService.getWarehouses(dbKey);
    res.json({ success: true, count: warehouses.length, data: warehouses });
  } catch (err: any) {
    console.error('[inventoryRouter] GET /warehouses error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

inventoryRouter.post('/warehouses', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbKey = extractDatabaseKey(req);
    const dto: CreateWarehouseDTO = req.body;
    const user = (req as any).user || { id: 1, username: 'مدير المستودعات' };

    if (!dto.Inventory_Name_A) {
      res.status(400).json({ success: false, error: 'Warehouse Arabic Name is required (اسم المستودع بالعربية مطلوب)' });
      return;
    }

    const created = await inventoryService.createWarehouse(dbKey, dto, user);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    console.error('[inventoryRouter] POST /warehouses error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 2. Items Catalog & Balances
// ----------------------------------------------------------------------------

inventoryRouter.get('/items', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbKey = extractDatabaseKey(req);
    const items = await inventoryService.getItems(dbKey);
    res.json({ success: true, count: items.length, data: items });
  } catch (err: any) {
    console.error('[inventoryRouter] GET /items error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

inventoryRouter.post('/items', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbKey = extractDatabaseKey(req);
    const dto: CreateItemDTO = req.body;
    const user = (req as any).user || { id: 1, username: 'مدير المخازن' };

    if (!dto.Item_Name_A) {
      res.status(400).json({ success: false, error: 'Item Arabic Name is required (اسم الصنف بالعربية مطلوب)' });
      return;
    }

    const created = await inventoryService.createItem(dbKey, dto, user);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    console.error('[inventoryRouter] POST /items error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

inventoryRouter.get('/balances', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbKey = extractDatabaseKey(req);
    const inventoryId = req.query.inventoryId ? parseInt(req.query.inventoryId as string, 10) : undefined;
    const balances = await inventoryService.getItemStockBalances(dbKey, inventoryId);
    res.json({ success: true, count: balances.length, data: balances });
  } catch (err: any) {
    console.error('[inventoryRouter] GET /balances error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 3. Stock Issue Notes (أذون الصرف المخزني)
// ----------------------------------------------------------------------------

inventoryRouter.get('/issues', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbKey = extractDatabaseKey(req);
    const issues = await inventoryService.getInternalIssues(dbKey);
    res.json({ success: true, count: issues.length, data: issues });
  } catch (err: any) {
    console.error('[inventoryRouter] GET /issues error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

inventoryRouter.post('/issues', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbKey = extractDatabaseKey(req);
    const dto: CreateStockIssueDTO = req.body;
    const user = (req as any).user || { id: 1, username: 'مدير المخازن' };

    const result = await inventoryService.createInternalIssue(dbKey, dto, user);
    res.status(201).json({ success: true, ...result });
  } catch (err: any) {
    console.error('[inventoryRouter] POST /issues error:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 4. Stock Delivery / Receipt Notes (أذون الإضافة المخزنية)
// ----------------------------------------------------------------------------

inventoryRouter.get('/deliveries', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbKey = extractDatabaseKey(req);
    const deliveries = await inventoryService.getInternalDeliveries(dbKey);
    res.json({ success: true, count: deliveries.length, data: deliveries });
  } catch (err: any) {
    console.error('[inventoryRouter] GET /deliveries error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

inventoryRouter.post('/deliveries', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbKey = extractDatabaseKey(req);
    const dto: CreateStockDeliveryDTO = req.body;
    const user = (req as any).user || { id: 1, username: 'مدير المخازن' };

    const result = await inventoryService.createInternalDelivery(dbKey, dto, user);
    res.status(201).json({ success: true, ...result });
  } catch (err: any) {
    console.error('[inventoryRouter] POST /deliveries error:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 5. Inter-Store Transfers (التحويل بين المخازن)
// ----------------------------------------------------------------------------

inventoryRouter.get('/transfers', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbKey = extractDatabaseKey(req);
    const transfers = await inventoryService.getWarehouseTransfers(dbKey);
    res.json({ success: true, count: transfers.length, data: transfers });
  } catch (err: any) {
    console.error('[inventoryRouter] GET /transfers error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

inventoryRouter.post('/transfers', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbKey = extractDatabaseKey(req);
    const dto: CreateStockTransferDTO = req.body;
    const user = (req as any).user || { id: 1, username: 'مدير المخازن' };

    const result = await inventoryService.createWarehouseTransfer(dbKey, dto, user);
    res.status(201).json({ success: true, ...result });
  } catch (err: any) {
    console.error('[inventoryRouter] POST /transfers error:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 6. Stock Adjustments (التسويات الجردية)
// ----------------------------------------------------------------------------

inventoryRouter.get('/adjustments', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbKey = extractDatabaseKey(req);
    const adjustments = await inventoryService.getStockAdjustments(dbKey);
    res.json({ success: true, count: adjustments.length, data: adjustments });
  } catch (err: any) {
    console.error('[inventoryRouter] GET /adjustments error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

inventoryRouter.post('/adjustments', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbKey = extractDatabaseKey(req);
    const dto: CreateStockAdjustmentDTO = req.body;
    const user = (req as any).user || { id: 1, username: 'مدير المخازن' };

    const result = await inventoryService.createStockAdjustment(dbKey, dto, user);
    res.status(201).json({ success: true, ...result });
  } catch (err: any) {
    console.error('[inventoryRouter] POST /adjustments error:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});
