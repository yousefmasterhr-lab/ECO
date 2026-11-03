/**
 * ECO ERP - Phase 02 Cash, Banking & Check Portfolio REST API Routes
 */

import { Router, Request, Response } from 'express';
import { CashBankingService } from '../services/CashBankingService.js';
import {
  CreatePaymentVoucherDTO,
  CreateReceiptVoucherDTO,
  ChequeTransitionDTO,
} from '../models/cashBankingSchema.js';

export const cashBankingRouter = Router();
const service = CashBankingService.getInstance();

// Helper to extract database key from request headers or query params
const extractDbKey = (req: Request): string | undefined => {
  return (req.headers['x-database-key'] as string) || (req.query.dbKey as string) || undefined;
};

// ==========================================
// 1. MASTER DATA: SAFES, BANKS & CURRENCIES
// ==========================================

// GET /api/cash-banking/safes
cashBankingRouter.get('/safes', async (req: Request, res: Response) => {
  try {
    const dbKey = extractDbKey(req);
    const safes = await service.getSafes(dbKey);
    res.json({ success: true, count: safes.length, safes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/cash-banking/banks
cashBankingRouter.get('/banks', async (req: Request, res: Response) => {
  try {
    const dbKey = extractDbKey(req);
    const banks = await service.getBanks(dbKey);
    res.json({ success: true, count: banks.length, banks });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/cash-banking/currencies
cashBankingRouter.get('/currencies', async (req: Request, res: Response) => {
  try {
    const dbKey = extractDbKey(req);
    const currencies = await service.getCurrencies(dbKey);
    res.json({ success: true, currencies });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 2. PAYMENT VOUCHERS (سندات الصرف)
// ==========================================

// GET /api/cash-banking/payables
cashBankingRouter.get('/payables', async (req: Request, res: Response) => {
  try {
    const dbKey = extractDbKey(req);
    const limit = parseInt(String(req.query.limit || '50'), 10);
    const payables = await service.listPaymentVouchers(dbKey, limit);
    res.json({ success: true, count: payables.length, payables });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/cash-banking/payables
cashBankingRouter.post('/payables', async (req: Request, res: Response) => {
  try {
    const dbKey = extractDbKey(req);
    const payload: CreatePaymentVoucherDTO = req.body;
    const result = await service.createPaymentVoucher(payload, dbKey);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==========================================
// 3. RECEIPT VOUCHERS (سندات القبض)
// ==========================================

// GET /api/cash-banking/receivables
cashBankingRouter.get('/receivables', async (req: Request, res: Response) => {
  try {
    const dbKey = extractDbKey(req);
    const limit = parseInt(String(req.query.limit || '50'), 10);
    const receivables = await service.listReceiptVouchers(dbKey, limit);
    res.json({ success: true, count: receivables.length, receivables });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/cash-banking/receivables
cashBankingRouter.post('/receivables', async (req: Request, res: Response) => {
  try {
    const dbKey = extractDbKey(req);
    const payload: CreateReceiptVoucherDTO = req.body;
    const result = await service.createReceiptVoucher(payload, dbKey);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==========================================
// 4. CHECK PORTFOLIO & LIFECYCLE (محفظة الشيكات)
// ==========================================

// GET /api/cash-banking/cheques
cashBankingRouter.get('/cheques', async (req: Request, res: Response) => {
  try {
    const dbKey = extractDbKey(req);
    const cheques = await service.getChequesPortfolio(dbKey);
    res.json({ success: true, count: cheques.length, cheques });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/cash-banking/cheques/transition
cashBankingRouter.post('/cheques/transition', async (req: Request, res: Response) => {
  try {
    const dbKey = extractDbKey(req);
    const payload: ChequeTransitionDTO = req.body;
    const result = await service.transitionChequeStatus(payload, dbKey);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});
