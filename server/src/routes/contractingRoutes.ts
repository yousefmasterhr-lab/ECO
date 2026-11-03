/**
 * ECO ERP - Phase 03 Contracting, Projects & Extracts REST API Routes
 */

import { Router, Request, Response } from 'express';
import { ContractingService } from '../services/ContractingService.js';
import {
  CreateSubcontractorContractDTO,
  CreateExtractDTO,
} from '../models/contractingSchema.js';

export const contractingRouter = Router();
const service = ContractingService.getInstance();

const extractDbKey = (req: Request): string | undefined => {
  return (req.headers['x-database-key'] as string) || (req.query.dbKey as string) || undefined;
};

// ==========================================
// 1. PROJECTS & SITES MASTER DATA
// ==========================================

// GET /api/contracting/projects
contractingRouter.get('/projects', async (req: Request, res: Response) => {
  try {
    const dbKey = extractDbKey(req);
    const projects = await service.getProjects(dbKey);
    res.json({ success: true, count: projects.length, projects });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 2. SUBCONTRACTOR CONTRACTS
// ==========================================

// GET /api/contracting/contracts
contractingRouter.get('/contracts', async (req: Request, res: Response) => {
  try {
    const dbKey = extractDbKey(req);
    const contracts = await service.getSubcontractorContracts(dbKey);
    res.json({ success: true, count: contracts.length, contracts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/contracting/contracts
contractingRouter.post('/contracts', async (req: Request, res: Response) => {
  try {
    const dbKey = extractDbKey(req);
    const payload: CreateSubcontractorContractDTO = req.body;
    const result = await service.createSubcontractorContract(payload, dbKey);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==========================================
// 3. PROGRESS EXTRACTS (مستخلصات المقاولات)
// ==========================================

// GET /api/contracting/extracts
contractingRouter.get('/extracts', async (req: Request, res: Response) => {
  try {
    const dbKey = extractDbKey(req);
    const limit = parseInt(String(req.query.limit || '50'), 10);
    const extracts = await service.listExtracts(dbKey, limit);
    res.json({ success: true, count: extracts.length, extracts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/contracting/extracts/:extractNo/details
contractingRouter.get('/extracts/:extractNo/details', async (req: Request, res: Response) => {
  try {
    const dbKey = extractDbKey(req);
    const extractNo = parseInt(String(req.params.extractNo), 10);
    const details = await service.getExtractDetails(extractNo, dbKey);
    res.json({ success: true, count: details.length, details });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/contracting/previous-qty
contractingRouter.get('/previous-qty', async (req: Request, res: Response) => {
  try {
    const dbKey = extractDbKey(req);
    const contractNo = parseInt(String(req.query.contractNo), 10);
    const itemCode = parseInt(String(req.query.itemCode), 10);
    const prevQty = await service.getPreviousQty(contractNo, itemCode, dbKey);
    res.json({ success: true, contractNo, itemCode, prevQty });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/contracting/extracts
contractingRouter.post('/extracts', async (req: Request, res: Response) => {
  try {
    const dbKey = extractDbKey(req);
    const payload: CreateExtractDTO = req.body;
    const result = await service.createExtract(payload, dbKey);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});
