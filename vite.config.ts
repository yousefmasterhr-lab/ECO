import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

function getBridge() {
  const bridgePath = require.resolve('./server/sqlBridge.cjs');
  delete require.cache[bridgePath];
  return require('./server/sqlBridge.cjs');
}

function parseBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: any) => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e: any) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function sqlServerBridgePlugin() {
  return {
    name: 'sql-server-bridge-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const url = req.url?.split('?')[0];
        const targetDb = (req.headers['x-database-context'] as string) || (req.url.includes('databaseContext=') ? new URL(req.url, 'http://localhost').searchParams.get('databaseContext') : null) || 'Tarabot_Data_2026';

        // 1. Status
        if (url === '/api/finance/status') {
          try {
            const bridge = getBridge();
            const status = await bridge.getStatus(targetDb);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(status));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 2. Chart of Accounts
        if (url === '/api/finance/chart') {
          try {
            const bridge = getBridge();
            const forceRefresh = req.url.includes('refresh=true');
            const accounts = await bridge.getAccounts(forceRefresh, targetDb);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(accounts));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 3. Cost Centers
        if (url === '/api/finance/cost-centers') {
          try {
            const bridge = getBridge();
            const costCenters = await bridge.getCostCenters(false, targetDb);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(costCenters));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 4. Treasury & Bank Balances
        if (url === '/api/finance/treasury/balances') {
          try {
            const bridge = getBridge();
            const balances = await bridge.getTreasuryBalances(targetDb);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(balances));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 5. Vouchers (Receivable / Payable / All)
        if (url === '/api/finance/vouchers' || url === '/api/finance/vouchers/receivable' || url === '/api/finance/vouchers/payable') {
          try {
            const bridge = getBridge();
            const type = url.includes('receivable') ? 'RECEIPT' : url.includes('payable') ? 'PAYMENT' : 'ALL';
            const vouchers = await bridge.getVouchers(type, targetDb);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(vouchers));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 6. Save Voucher
        if (url === '/api/finance/vouchers/save' && req.method === 'POST') {
          try {
            const body = await parseBody(req);
            const bridge = getBridge();
            const result = bridge.saveVoucher(body);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (err: any) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 7. Cheques
        if (url === '/api/finance/cheques') {
          try {
            const bridge = getBridge();
            const cheques = bridge.getCheques();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(cheques));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 8. Update Cheque Status
        if (url === '/api/finance/cheques/status' && (req.method === 'PATCH' || req.method === 'POST')) {
          try {
            const body = await parseBody(req);
            const bridge = getBridge();
            const result = bridge.updateChequeStatus(body.id, body.status);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (err: any) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 9. Add Cheque
        if (url === '/api/finance/cheques/add' && req.method === 'POST') {
          try {
            const body = await parseBody(req);
            const bridge = getBridge();
            const result = bridge.addCheque(body);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (err: any) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 10. Journals
        if (url === '/api/finance/journals') {
          try {
            const bridge = getBridge();
            const journals = await bridge.getJournals(targetDb);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(journals));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 11. Save Journal
        if (url === '/api/finance/journals/save' && req.method === 'POST') {
          try {
            const body = await parseBody(req);
            const bridge = getBridge();
            const result = bridge.saveJournal(body);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (err: any) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 12. Items & Stock
        if (url === '/api/finance/items') {
          try {
            const bridge = getBridge();
            const items = bridge.getItems();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(items));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 13. Clients
        if (url === '/api/finance/clients') {
          try {
            const bridge = getBridge();
            const clients = bridge.getClients();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(clients));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 14. Suppliers
        if (url === '/api/finance/suppliers') {
          try {
            const bridge = getBridge();
            const suppliers = await bridge.getSuppliers(targetDb);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(suppliers));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 15. Sales Invoices
        if (url === '/api/finance/sales/invoices') {
          try {
            const bridge = getBridge();
            const invoices = bridge.getSalesInvoices();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(invoices));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 16. Save Sales Invoice
        if (url === '/api/finance/sales/save' && req.method === 'POST') {
          try {
            const body = await parseBody(req);
            const bridge = getBridge();
            const result = bridge.saveSalesInvoice(body);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (err: any) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 17. Purchase Bills
        if (url === '/api/finance/purchases/invoices') {
          try {
            const bridge = getBridge();
            const bills = bridge.getPurchaseBills();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(bills));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 18. Save Purchase Bill
        if (url === '/api/finance/purchases/save' && req.method === 'POST') {
          try {
            const body = await parseBody(req);
            const bridge = getBridge();
            const result = bridge.savePurchaseBill(body);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (err: any) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 19. Cost Centers Tree & Balances
        if (url === '/api/finance/cost-centers/tree') {
          try {
            const bridge = getBridge();
            const tree = await bridge.getCostCentersTree(targetDb);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(tree));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 20. Analysis Dimensions
        if (url === '/api/finance/analysis-dimensions') {
          try {
            const bridge = getBridge();
            const dims = await bridge.getAnalysisDimensions(targetDb);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(dims));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 21. Contracts
        if (url === '/api/finance/contracts') {
          try {
            const bridge = getBridge();
            const contracts = bridge.getContracts();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(contracts));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 22. Save Contract
        if (url === '/api/finance/contracts/save' && req.method === 'POST') {
          try {
            const body = await parseBody(req);
            const bridge = getBridge();
            const result = bridge.saveContract(body);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (err: any) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 23. Extracts
        if (url === '/api/finance/extracts') {
          try {
            const bridge = getBridge();
            const extracts = bridge.getExtracts();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(extracts));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 24. Save Extract
        if (url === '/api/finance/extracts/save' && req.method === 'POST') {
          try {
            const body = await parseBody(req);
            const bridge = getBridge();
            const result = bridge.saveExtract(body);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (err: any) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 25. Trial Balance Report
        if (url === '/api/finance/reports/trial-balance') {
          try {
            const u = new URL(req.url, 'http://localhost');
            const level = Number(u.searchParams.get('level')) || 4;
            const startDate = u.searchParams.get('startDate') || '2025-01-01';
            const endDate = u.searchParams.get('endDate') || '2026-12-31';
            const costcenterId = u.searchParams.get('costcenterId') ? Number(u.searchParams.get('costcenterId')) : null;

            const bridge = getBridge();
            const report = await bridge.getTrialBalanceReport(level, startDate, endDate, costcenterId, targetDb);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(report));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 26. Income Statement Report (P&L)
        if (url === '/api/finance/reports/income-statement') {
          try {
            const u = new URL(req.url, 'http://localhost');
            const startDate = u.searchParams.get('startDate') || '2026-01-01';
            const endDate = u.searchParams.get('endDate') || '2026-12-31';
            const costcenterId = u.searchParams.get('costcenterId') ? Number(u.searchParams.get('costcenterId')) : null;

            const bridge = getBridge();
            const report = await bridge.getIncomeStatementReport(startDate, endDate, costcenterId, targetDb);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(report));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 27. Balance Sheet Report
        if (url === '/api/finance/reports/balance-sheet') {
          try {
            const u = new URL(req.url, 'http://localhost');
            const asOfDate = u.searchParams.get('asOfDate') || '2026-12-31';

            const bridge = getBridge();
            const report = await bridge.getBalanceSheetReport(asOfDate, targetDb);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(report));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 28. Statement of Account Report
        if (url === '/api/finance/reports/statement-of-account' || url === '/api/reports/statement') {
          try {
            const u = new URL(req.url, 'http://localhost');
            const level5Id = u.searchParams.get('level5Id') || u.searchParams.get('accountId') || '1201001';
            const startDate = u.searchParams.get('startDate') || '2025-01-01';
            const endDate = u.searchParams.get('endDate') || '2026-12-31';
            const costcenterId = u.searchParams.get('costcenterId') ? Number(u.searchParams.get('costcenterId')) : null;
            const analysisId = u.searchParams.get('analysisId') ? Number(u.searchParams.get('analysisId')) : null;

            const bridge = getBridge();
            const report = await bridge.getStatementOfAccountReport(level5Id, startDate, endDate, costcenterId, analysisId, targetDb);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(report));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 29. CFO Executive BI Metrics
        if (url === '/api/finance/reports/cfo-metrics') {
          try {
            const bridge = getBridge();
            const metrics = await bridge.getCfoMetrics(targetDb);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(metrics));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // Context-Aware Accounts endpoint
        if (url === '/api/finance/accounts') {
          try {
            const bridge = getBridge();
            const pool = await bridge.getDatabasePool(targetDb);
            const activeMode = pool.mode === 'REMOTE' ? 'REMOTE' : 'LOCAL_FALLBACK';
            let query = 'SELECT * FROM dbo.Level5 ORDER BY Account_Number';
            try {
              const result = await pool.request().query(query);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                active_mode: activeMode,
                target_db: targetDb,
                latency_status: 'healthy',
                source_database: targetDb,
                count: result.recordset.length,
                data: result.recordset,
              }));
            } catch {
              const altResult = await pool.request().query('SELECT Level5_ID AS Account_Number, Level5_Name_A AS Account_Name, * FROM dbo.Level5 ORDER BY Level5_ID');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                active_mode: activeMode,
                target_db: targetDb,
                latency_status: 'healthy',
                source_database: targetDb,
                count: altResult.recordset.length,
                data: altResult.recordset,
              }));
            }
          } catch (err: any) {
            try {
              const bridge = getBridge();
              let rows;
              try {
                rows = await bridge.querySqlJson('SELECT * FROM dbo.Level5 ORDER BY Account_Number', targetDb);
              } catch {
                rows = await bridge.querySqlJson('SELECT Level5_ID AS Account_Number, Level5_Name_A AS Account_Name, * FROM dbo.Level5 ORDER BY Level5_ID', targetDb);
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                active_mode: 'LOCAL_FALLBACK',
                target_db: targetDb,
                latency_status: 'healthy',
                source_database: targetDb,
                count: rows.length,
                data: rows,
              }));
            } catch (fallbackErr: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          }
          return;
        }

        // Cross-Database Federation: Payroll Integration Bridge
        if (url === '/api/finance/payroll-integration') {
          try {
            const bridge = getBridge();
            const pool = await bridge.getDatabasePool('Tarabot_Data_2026');
            const crossQuery = `
              SELECT 
                E.Emp_ID,
                E.Emp_Name,
                S.Net_Salary,
                S.Month,
                A.Account_Name
              FROM [SL_Salary_Db_2026].[dbo].[Salaries] S
              INNER JOIN [SL_Salary_Db_2026].[dbo].[Employees] E ON S.Emp_ID = E.Emp_ID
              LEFT JOIN [Tarabot_Data_2026].[dbo].[Level5] A ON A.Account_Number = E.GL_Account_Number;
            `;
            const result = await pool.request().query(crossQuery);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result.recordset));
          } catch (err: any) {
            try {
              const bridge = getBridge();
              const rows = await bridge.querySqlJson(`
                SELECT TOP 50
                  e.Employee_ID AS Emp_ID,
                  e.Employee_Name_A AS Emp_Name,
                  ISNULL(e.Total_Salary, 0) - (ISNULL(e.Insurance_Amount, 0) + ISNULL(e.Tax_Amount, 0)) AS Net_Salary,
                  N'2026-03' AS Month,
                  N'حساب الأجور والرواتب' AS Account_Name
                FROM [SL_Salary_Db_2026].dbo.Employees e
              `, 'SL_Salary_Db_2026');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(rows));
            } catch (fallbackErr: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          }
          return;
        }

        // Context-Aware Statement of Account & General Ledger Endpoints
        if (url === '/api/finance/reports/statement' || url === '/api/finance/ledger') {
          try {
            const u = new URL(req.url, 'http://localhost');
            const accountId = u.searchParams.get('accountId') || u.searchParams.get('level5Id');
            const fromDate = u.searchParams.get('fromDate') || u.searchParams.get('startDate');
            const toDate = u.searchParams.get('toDate') || u.searchParams.get('endDate');
            const costcenterId = u.searchParams.get('costcenterId');
            const analysisId = u.searchParams.get('analysisId');
            const limit = u.searchParams.get('limit');

            const bridge = getBridge();
            const { pool, mode } = await bridge.getDatabasePool(targetDb);
            const activeMode = mode === 'REMOTE' ? 'REMOTE' : 'LOCAL_FALLBACK';

            const result = await bridge.executeLedgerQuery(pool, targetDb, {
              accountId,
              fromDate,
              toDate,
              costcenterId,
              analysisId,
              limit
            });

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              active_mode: activeMode,
              target_db: targetDb,
              latency_status: 'healthy',
              source_database: targetDb,
              ...result
            }));
          } catch (err: any) {
            console.error(`[Vite SQL Bridge] [${url}] CRITICAL SQL ERROR on [${targetDb}]:`, err.message);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              error: err.message,
              status: 500,
              target_db: targetDb,
              endpoint: url
            }));
          }
          return;
        }

        // =================================================================
        // Database & SQL Federation Hub API Endpoints
        // =================================================================

        // 30. Database Fleet Discovery
        if (url === '/api/system/databases') {
          try {
            const bridge = getBridge();
            const fleet = await bridge.getDatabaseFleet();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              ...fleet,
              active_mode: fleet.active_mode || (fleet.isFailSafe ? 'LOCAL_FALLBACK' : 'REMOTE'),
              target_db: targetDb,
              latency_status: fleet.latency_status || 'healthy'
            }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 31. Federation Connection Health & Latency Ping
        if (url === '/api/system/health') {
          try {
            const bridge = getBridge();
            const health = await bridge.getFederationHealth();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(health));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 32. Federated Safe SQL Query Execution (Read-Only)
        if (url === '/api/system/query' && req.method === 'POST') {
          try {
            const body = await parseBody(req);
            const contextDb = req.headers['x-database-context'] || body.database || 'Tarabot_Data_2026';
            const bridge = getBridge();
            const result = await bridge.executeFederatedQuery(body.sqlQuery, contextDb);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (err: any) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 33. Prebuilt Bridge 1: Payroll-to-GL Inspection
        if (url === '/api/system/federation/payroll-gl') {
          try {
            const bridge = getBridge();
            const result = await bridge.getPayrollGlBridge();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 34. Prebuilt Bridge 2: Universal Project Search
        if (url === '/api/system/federation/universal-projects') {
          try {
            const bridge = getBridge();
            const result = await bridge.getUniversalProjectsBridge();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 35. Prebuilt Bridge 3: Multi-Year Comparative Balances
        if (url === '/api/system/federation/multi-year-balance') {
          try {
            const bridge = getBridge();
            const result = await bridge.getMultiYearBalanceBridge();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), sqlServerBridgePlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@erp/ui-system': fileURLToPath(new URL('./src/ui-system/index.ts', import.meta.url))
    }
  },
  server: {
    port: 3000,
    host: true
  }
});
