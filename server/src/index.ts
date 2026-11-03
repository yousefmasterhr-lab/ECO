/**
 * ECO ERP - Phase 01 Financial Engine Server Entry Point
 */

import express from 'express';
import cors from 'cors';
import { financialRouter } from './routes/financialRoutes.js';
import { DynamicDatabaseManager } from './db/DynamicDatabaseManager.js';

const app = express();
const port = parseInt(process.env.FINANCIAL_PORT || '3001', 10);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Database-Key'],
}));

app.use(express.json({ limit: '10mb' }));

// Mount Financial Engine Routes
app.use('/api/financial', financialRouter);

app.get('/health', async (_req, res) => {
  const dbManager = DynamicDatabaseManager.getInstance();
  const pools = dbManager.getHealthOverview();
  res.json({
    status: 'HEALTHY',
    service: 'ECO Financial Engine Phase 01',
    timestamp: new Date().toISOString(),
    pools,
  });
});

export { app, port };

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`[ECO Financial Engine] Server running on port ${port} (Ready for Phase 01 requests)`);
  });
}
