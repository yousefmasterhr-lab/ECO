/**
 * ECO ERP - Purchasing, Supplier Payables & Vendor Invoicing Express Routes (Phase 04)
 * Mounting path: /api/purchasing
 */

import { Router, Request, Response } from 'express';
import { PurchasingService } from '../services/PurchasingService.js';
import { CreatePurchaseInvoiceDTO, CreatePurchaseReturnDTO, CreateSupplierDTO } from '../models/purchasingSchema.js';

export const purchasingRouter = Router();
const purchasingService = PurchasingService.getInstance();

const extractDatabaseKey = (req: Request): string | undefined => {
  return (req.headers['x-database-key'] as string) || (req.query.databaseKey as string) || undefined;
};

// ----------------------------------------------------------------------------
// Suppliers
// ----------------------------------------------------------------------------

purchasingRouter.get('/suppliers', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbKey = extractDatabaseKey(req);
    const suppliers = await purchasingService.getSuppliers(dbKey);
    res.json({ success: true, count: suppliers.length, data: suppliers });
  } catch (err: any) {
    console.error('[purchasingRouter] GET /suppliers error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

purchasingRouter.post('/suppliers', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbKey = extractDatabaseKey(req);
    const dto: CreateSupplierDTO = req.body;
    const user = (req as any).user || { id: 1, username: 'مدير المشتريات' };

    if (!dto.Supplier_Name_A) {
      res.status(400).json({ success: false, error: 'Supplier Arabic Name is required (اسم المورد مطلوب)' });
      return;
    }

    const created = await purchasingService.createSupplier(dbKey, dto, user);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    console.error('[purchasingRouter] POST /suppliers error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// Items Catalog
// ----------------------------------------------------------------------------

purchasingRouter.get('/items', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbKey = extractDatabaseKey(req);
    const items = await purchasingService.getItems(dbKey);
    res.json({ success: true, count: items.length, data: items });
  } catch (err: any) {
    console.error('[purchasingRouter] GET /items error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// Purchase Invoices
// ----------------------------------------------------------------------------

purchasingRouter.get('/invoices', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbKey = extractDatabaseKey(req);
    const invoices = await purchasingService.getPurchaseInvoices(dbKey);
    res.json({ success: true, count: invoices.length, data: invoices });
  } catch (err: any) {
    console.error('[purchasingRouter] GET /invoices error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

purchasingRouter.get('/invoices/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbKey = extractDatabaseKey(req);
    const idParam = typeof req.params.id === 'string' ? req.params.id : String(req.params.id);
    const noteNo = parseInt(idParam, 10);
    const invoice = await purchasingService.getPurchaseInvoiceById(dbKey, noteNo);

    if (!invoice) {
      res.status(404).json({ success: false, error: `Purchase invoice #${noteNo} not found` });
      return;
    }

    res.json({ success: true, data: invoice });
  } catch (err: any) {
    console.error('[purchasingRouter] GET /invoices/:id error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

purchasingRouter.post('/invoices', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbKey = extractDatabaseKey(req);
    const dto: CreatePurchaseInvoiceDTO = req.body;
    const user = (req as any).user || { id: 1, username: 'مدير المشتريات' };

    const result = await purchasingService.createPurchaseInvoice(dbKey, dto, user);
    res.status(201).json(result);
  } catch (err: any) {
    console.error('[purchasingRouter] POST /invoices error:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// Purchase Returns
// ----------------------------------------------------------------------------

purchasingRouter.get('/returns', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbKey = extractDatabaseKey(req);
    const returns = await purchasingService.getPurchaseReturns(dbKey);
    res.json({ success: true, count: returns.length, data: returns });
  } catch (err: any) {
    console.error('[purchasingRouter] GET /returns error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

purchasingRouter.post('/returns', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbKey = extractDatabaseKey(req);
    const dto: CreatePurchaseReturnDTO = req.body;
    const user = (req as any).user || { id: 1, username: 'مدير المشتريات' };

    const result = await purchasingService.createPurchaseReturn(dbKey, dto, user);
    res.status(201).json(result);
  } catch (err: any) {
    console.error('[purchasingRouter] POST /returns error:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});
