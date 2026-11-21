import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

function loadTsModule(relPath, customMocks = {}) {
  const abs = path.join(root, relPath);
  const src = fs.readFileSync(abs, 'utf8');
  const transpiled = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: abs,
  }).outputText.replace(/\bimport\.meta\b/g, '({ env: {} })');

  const mod = { exports: {} };
  const localRequire = (spec) => {
    if (Object.hasOwn(customMocks, spec)) return customMocks[spec];
    if (spec.startsWith('.')) {
      const base = path.resolve(path.dirname(abs), spec);
      for (const candidate of [base + '.ts', base + '.tsx', base + '.js', path.join(base, 'index.ts')]) {
        if (fs.existsSync(candidate)) {
          return loadTsModule(path.relative(root, candidate).replace(/\\/g, '/'), customMocks);
        }
      }
    }
    return require(spec);
  };
  const fn = new Function('exports', 'require', 'module', '__filename', '__dirname', transpiled);
  fn(mod.exports, localRequire, mod, abs, path.dirname(abs));
  return mod.exports;
}

// ============================================================================
// REG-001: /api/hr/purge D1 Data-Wipe Bomb Defused (Frontend + Cloudflare + SQL Bridge)
// ============================================================================
test('REG-001: hrStorage.ts never calls /api/hr/purge or wipes v2 HR data', () => {
  const hrStorageSrc = read('src/services/hrStorage.ts');
  const codeWithoutComments = hrStorageSrc.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
  assert.equal(codeWithoutComments.includes('/api/hr/purge'), false, 'hrStorage.ts code must never invoke /api/hr/purge');
  assert.equal(
    /localStorage\.setItem\(STORAGE_KEYS\.PURGE_FLAG/.test(codeWithoutComments),
    false,
    'hrStorage.ts must not auto-wipe v2 storage on missing PURGE_FLAG'
  );
});

test('REG-001: Cloudflare functions/api/hr/[[path]].ts hard-blocks POST & DELETE /api/hr/purge with 403', async () => {
  const executedSql = [];
  const fakeDb = {
    prepare(sql) {
      executedSql.push(sql);
      return {
        bind() { return this; },
        async run() { return { success: true }; },
        async all() { return { results: [] }; },
        async first() { return { count: 0 }; },
      };
    },
    async batch(stmts) {
      executedSql.push('BATCH_EXECUTED');
      return stmts;
    },
  };

  const hrHandler = loadTsModule('functions/api/hr/[[path]].ts', {
    '../_hrDb': { ensureHrSchema: async () => {} },
  });

  const postRes = await hrHandler.onRequestPost({
    request: new Request('https://eco.hrsup.com/api/hr/purge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }),
    env: { DB: fakeDb },
    params: { path: ['purge'] },
  });
  assert.equal(postRes.status, 403, 'POST /api/hr/purge must return 403 Forbidden');

  const delRes = await hrHandler.onRequestDelete({
    request: new Request('https://eco.hrsup.com/api/hr/purge', { method: 'DELETE' }),
    env: { DB: fakeDb },
    params: { path: ['purge'] },
  });
  assert.equal(delRes.status, 403, 'DELETE /api/hr/purge must return 403 Forbidden');

  const destructive = executedSql.filter((s) => /DELETE\s+FROM\s+hr_/i.test(s) || s === 'BATCH_EXECUTED');
  assert.equal(destructive.length, 0, 'No DELETE FROM hr_* query may run on /api/hr/purge');
});

test('REG-001: server/sqlBridge.cjs hard-blocks POST & DELETE /api/hr/purge with 403', () => {
  const bridgeSrc = read('server/sqlBridge.cjs');
  assert.match(bridgeSrc, /app\.post\('\/api\/hr\/purge'[\s\S]{0,200}status\(403\)/);
  assert.match(bridgeSrc, /app\.delete\('\/api\/hr\/purge'[\s\S]{0,200}status\(403\)/);
  assert.equal(
    /app\.(?:post|delete)\('\/api\/hr\/purge'[\s\S]{0,200}emptyHrMemoryStore/.test(bridgeSrc),
    false,
    'sqlBridge.cjs purge endpoints must not wipe HR store'
  );
});

// ============================================================================
// REG-002: Dual-Backend Routing in src/services/apiClient.ts (ATS, CTS, Automation)
// ============================================================================
test('REG-002: isCloudflareEdgeRoute classifies /api/ats, /api/cts, /api/automation as Edge and Finance as SQL Bridge', () => {
  const apiClientMod = loadTsModule('src/services/apiClient.ts');
  const { isCloudflareEdgeRoute } = apiClientMod;

  for (const edgePath of [
    '/api/ats/candidates',
    '/api/ats/portal-config?companyId=1',
    'https://eco.hrsup.com/api/ats/offers',
    '/api/cts/correspondences',
    'https://eco.hrsup.com/api/cts/projects',
    '/api/automation/rules',
    '/api/automation/trigger',
    '/api/hr/leaves',
    '/api/auth/login',
  ]) {
    assert.equal(isCloudflareEdgeRoute(edgePath), true, `Expected Edge route: ${edgePath}`);
  }

  for (const sqlPath of [
    '/api/finance/status',
    '/api/finance/journals/save',
    '/api/financial/chart-of-accounts/tree',
    '/api/financial/vouchers',
    '/api/sales/invoices',
    '/api/sales/clients',
    'https://datatest.hrsup.com/api/finance/chart',
  ]) {
    assert.equal(isCloudflareEdgeRoute(sqlPath), false, `Expected SQL Bridge route: ${sqlPath}`);
  }

  const apiClientSrc = read('src/services/apiClient.ts');
  assert.equal(
    apiClientSrc.includes('isFailSafe: true'),
    false,
    'apiClient.ts must not return synthetic HTTP 200 fail-safe responses on unauthenticated calls'
  );
});

// ============================================================================
// REG-003: Finance 1:1 Route Parity & Zero Shadowed Duplicates
// ============================================================================
test('REG-003: server/sqlBridge.cjs exposes all Finance/Sales routes without shadowed duplicates', () => {
  const bridgeSrc = read('server/sqlBridge.cjs');

  for (const requiredRoute of [
    "app.get('/api/finance/status'",
    "app.get('/api/financial/chart-of-accounts/tree'",
    "app.get('/api/finance/journals/:id/details'",
    "app.get('/api/finance/journals/:noteNo/lines'",
    "app.post('/api/finance/journals/save'",
    "app.post('/api/financial/vouchers'",
    "app.get('/api/sales/clients'",
    "app.post('/api/sales/clients'",
    "app.get('/api/sales/items'",
    "app.get('/api/sales/invoices'",
    "app.get('/api/sales/invoices/:id'",
    "app.post('/api/sales/invoices'",
    "app.get('/api/sales/returns'",
    "app.post('/api/sales/returns'",
  ]) {
    assert.equal(bridgeSrc.includes(requiredRoute), true, `Missing required route in sqlBridge.cjs: ${requiredRoute}`);
  }

  // Verify no duplicate /api/system/databases or /api/finance/vouchers/save registrations
  const codeWithoutComments = bridgeSrc.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
  const sysDbMatches = codeWithoutComments.match(/app\.all\('\/api\/system\/databases'/g) || [];
  assert.equal(sysDbMatches.length, 1, 'Expected exactly 1 /api/system/databases route');

  const voucherSaveMatches = codeWithoutComments.match(/\/api\/finance\/vouchers\/save/g) || [];
  assert.equal(voucherSaveMatches.length, 1, 'Expected /api/finance/vouchers/save to be registered once (not shadowed)');

  // Verify vite.config.ts awaits bridge.saveJournal
  const viteSrc = read('vite.config.ts');
  assert.match(viteSrc, /await\s+bridge\.saveJournal\(body,\s*targetDb\)/);

  // Verify salesClient.ts uses getApiBaseUrl() and does not return hardcoded mock arrays
  const salesSrc = read('src/services/salesClient.ts');
  assert.match(salesSrc, /getApiBaseUrl\(\)\}\/api\/sales/);
  assert.equal(salesSrc.includes('مجموعة طلعت مصطفى القابضة'), false, 'salesClient.ts must not return hardcoded mock clients');
});

// ============================================================================
// REG-004: HR Leaves & Attendance D1 ON CONFLICT(id) DO UPDATE Persistence
// ============================================================================
test('REG-004: Leaves & Attendance handlers execute ON CONFLICT(id) DO UPDATE with accurate field mapping', async () => {
  const captured = [];
  const fakeDb = {
    prepare(sql) {
      return {
        bind(...args) {
          captured.push({ sql, args });
          return this;
        },
        async run() { return { success: true }; },
        async all() { return { results: [] }; },
        async first() { return { count: 0 }; },
      };
    },
  };

  const hrHandler = loadTsModule('functions/api/hr/[[path]].ts', {
    '../_hrDb': { ensureHrSchema: async () => {} },
  });

  // 1. Attendance upsert (twice with same id)
  for (const checkOut of ['', '17:00']) {
    const res = await hrHandler.onRequestPost({
      request: new Request('https://eco.hrsup.com/api/hr/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'ATT-100',
          employeeId: 'EMP-1',
          date: '2026-11-21',
          checkIn: '09:00',
          checkOut,
          status: 'present',
          note: 'Cairo HQ',
        }),
      }),
      env: { DB: fakeDb },
      params: { path: ['attendance'] },
    });
    assert.equal(res.status, 200);
  }

  const attCall = captured[captured.length - 1];
  assert.match(attCall.sql, /INSERT INTO hr_attendance[\s\S]*ON CONFLICT\(id\) DO UPDATE SET/i);
  assert.equal(attCall.args[10], 'Cairo HQ', 'Attendance note field must map to notes column');

  // 2. Leave upsert (create pending, then approve same id)
  for (const status of ['pending', 'approved']) {
    const res = await hrHandler.onRequestPost({
      request: new Request('https://eco.hrsup.com/api/hr/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'LR-200',
          employeeId: 'EMP-1',
          type: 'sick',
          startDate: '2026-11-22',
          endDate: '2026-11-24',
          daysCount: 3,
          reason: 'Medical',
          status,
          approvedBy: status === 'approved' ? 'HR Manager' : '',
        }),
      }),
      env: { DB: fakeDb },
      params: { path: ['leaves'] },
    });
    assert.equal(res.status, 200);
  }

  const lvCall = captured[captured.length - 1];
  assert.match(lvCall.sql, /INSERT INTO hr_leaves[\s\S]*ON CONFLICT\(id\) DO UPDATE SET/i);
  assert.equal(lvCall.args[3], 'sick', 'LeaveRequest.type must map to leave_type column');
  assert.equal(lvCall.args[9], 'approved', 'Updated leave status must persist on upsert');
});

// ============================================================================
// REG-005: HRContext.tsx Synchronous recordToSave (No React 18 Batching Loss)
// ============================================================================
test('REG-005: HRContext.tsx computes recordToSave & updatedTarget synchronously before setState', () => {
  const hrCtxSrc = read('src/context/HRContext.tsx');

  const punchIdx = hrCtxSrc.indexOf('const punchAttendance =');
  const submitIdx = hrCtxSrc.indexOf('const submitLeaveRequest =');
  assert.ok(punchIdx > 0 && submitIdx > punchIdx, 'Could not locate punchAttendance block');
  const punchBlock = hrCtxSrc.slice(punchIdx, submitIdx);

  assert.equal(
    /let\s+recordToSave\s*:\s*AttendanceRecord\s*\|\s*null\s*=\s*null/.test(punchBlock),
    false,
    'punchAttendance must not use nullable recordToSave mutated inside setState updater'
  );
  const recordDeclPos = punchBlock.indexOf('const recordToSave: AttendanceRecord');
  const setAttPos = punchBlock.indexOf('setAttendanceRecords(');
  const saveAttPos = punchBlock.indexOf('hrStorage.saveAttendance(recordToSave)');
  assert.ok(recordDeclPos > 0 && recordDeclPos < setAttPos && setAttPos < saveAttPos, 'recordToSave must be built synchronously before setAttendanceRecords and passed directly to hrStorage.saveAttendance');

  const updateLeaveIdx = hrCtxSrc.indexOf('const updateLeaveStatus =');
  const markPayrollIdx = hrCtxSrc.indexOf('const markPayrollItemPaid =');
  assert.ok(updateLeaveIdx > 0 && markPayrollIdx > updateLeaveIdx, 'Could not locate updateLeaveStatus block');
  const leaveBlock = hrCtxSrc.slice(updateLeaveIdx, markPayrollIdx);
  const updatedDeclPos = leaveBlock.indexOf('const updatedTarget: LeaveRequest');
  const setLeavePos = leaveBlock.indexOf('setLeaveRequests(');
  const saveLeavePos = leaveBlock.indexOf('hrStorage.saveLeave(updatedTarget)');
  assert.ok(updatedDeclPos > 0 && updatedDeclPos < setLeavePos && setLeavePos < saveLeavePos, 'updatedTarget must be built synchronously before setLeaveRequests and saved outside updater');
});

