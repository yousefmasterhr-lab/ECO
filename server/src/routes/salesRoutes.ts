/**
 * ECO ERP - Sales, Customer Receivables & Invoicing Express Routes (Phase 05)
 * Mounting path: /api/sales
 * Source of Truth: tarabot_erp_complete_schema.json & Phase_05_SalesReceivables_Spec.md
 */

import { Router, Request, Response } from 'express';
import { SalesService } from '../services/SalesService.js';
import { CreateSalesInvoiceDTO, CreateSalesReturnDTO, CreateClientDTO } from '../models/salesSchema.js';

export const salesRouter = Router();
const salesService = SalesService.getInstance();

const extractDatabaseKey = (req: Request): string | undefined => {
  return (req.headers['x-database-key'] as string) || (req.query.databaseKey as string) || undefined;
};

// ----------------------------------------------------------------------------
// 1. Clients / Customers
// ----------------------------------------------------------------------------

salesRouter.get('/clients', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbKey = extractDatabaseKey(req);
    const clients = await salesService.getClients(dbKey);
    res.json({ success: true, count: clients.length, data: clients });
  } catch (err: any) {
    console.error('[salesRouter] GET /clients error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

salesRouter.post('/clients', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbKey = extractDatabaseKey(req);
    const dto: CreateClientDTO = req.body;
    const user = (req as any).user || { id: 1, username: 'مدير المبيعات' };

    if (!dto.Client_Name_A) {
      res.status(400).json({ success: false, error: 'Client Arabic Name is required (اسم العميل مطلوب)' });
      return;
    }

    const created = await salesService.createClient(dbKey, dto, user);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    console.error('[salesRouter] POST /clients error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 2. Items Catalog for Sales
// ----------------------------------------------------------------------------

salesRouter.get('/items', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbKey = extractDatabaseKey(req);
    const items = await salesService.getItems(dbKey);
    res.json({ success: true, count: items.length, data: items });
  } catch (err: any) {
    console.error('[salesRouter] GET /items error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 3. Sales Invoices
// ----------------------------------------------------------------------------

salesRouter.get('/invoices', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbKey = extractDatabaseKey(req);
    const invoices = await salesService.getSalesInvoices(dbKey);
    res.json({ success: true, count: invoices.length, data: invoices });
  } catch (err: any) {
    console.error('[salesRouter] GET /invoices error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

salesRouter.get('/invoices/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbKey = extractDatabaseKey(req);
    const idParam = typeof req.params.id === 'string' ? req.params.id : String(req.params.id);
    const noteNo = parseInt(idParam, 10);
    const invoice = await salesService.getSalesInvoiceById(dbKey, noteNo);

    if (!invoice) {
      res.status(404).json({ success: false, error: `Sales invoice #${noteNo} not found` });
      return;
    }

    res.json({ success: true, data: invoice });
  } catch (err: any) {
    console.error('[salesRouter] GET /invoices/:id error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

salesRouter.post('/invoices', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbKey = extractDatabaseKey(req);
    const dto: CreateSalesInvoiceDTO = req.body;
    const user = (req as any).user || { id: 1, username: 'مدير المبيعات' };

    const result = await salesService.createSalesInvoice(dbKey, dto, user);
    res.status(201).json(result);
  } catch (err: any) {
    console.error('[salesRouter] POST /invoices error:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 4. Sales Returns
// ----------------------------------------------------------------------------

salesRouter.get('/returns', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbKey = extractDatabaseKey(req);
    const returns = await salesService.getSalesReturns(dbKey);
    res.json({ success: true, count: returns.length, data: returns });
  } catch (err: any) {
    console.error('[salesRouter] GET /returns error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

salesRouter.post('/returns', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbKey = extractDatabaseKey(req);
    const dto: CreateSalesReturnDTO = req.body;
    const user = (req as any).user || { id: 1, username: 'مدير المبيعات' };

    const result = await salesService.createSalesReturn(dbKey, dto, user);
    res.status(201).json(result);
  } catch (err: any) {
    console.error('[salesRouter] POST /returns error:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

