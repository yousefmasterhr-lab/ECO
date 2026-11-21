import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const TEST_JWT_SECRET = 'test-eco-erp-hs256-signing-secret-2026-strong';
const TEST_BRIDGE_SECRET = 'test-eco-erp-bridge-shared-secret-2026-strong';

// Compile and load TypeScript Cloudflare Function modules in-process without disk writes
function loadTsModules(entryRelPath, mocks = {}) {
  const cache = new Map();
  const baseRequire = createRequire(import.meta.url);

  function compileAndLoad(absPath) {
    if (cache.has(absPath)) return cache.get(absPath).exports;
    const source = fs.readFileSync(absPath, 'utf8').replace(/\bimport\.meta\b/g, '({ env: {} })');
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
      fileName: absPath,
    });
    const mod = { exports: {} };
    cache.set(absPath, mod);

    const localRequire = (spec) => {
      if (Object.prototype.hasOwnProperty.call(mocks, spec)) return mocks[spec];
      if (spec.startsWith('.')) {
        const resolvedBase = path.resolve(path.dirname(absPath), spec);
        const candidates = [
          resolvedBase,
          `${resolvedBase}.ts`,
          `${resolvedBase}.tsx`,
          `${resolvedBase}.js`,
          path.join(resolvedBase, 'index.ts'),
        ];
        for (const c of candidates) {
          if (fs.existsSync(c) && fs.statSync(c).isFile()) {
            return compileAndLoad(c);
          }
        }
      }
      return baseRequire(spec);
    };

    const fn = new Function('require', 'module', 'exports', '__filename', '__dirname', outputText);
    fn(localRequire, mod, mod.exports, absPath, path.dirname(absPath));
    return mod.exports;
  }

  return compileAndLoad(path.join(ROOT, entryRelPath));
}

function makeMockD1(userRows = []) {
  const updates = [];
  return {
    updates,
    prepare(sql) {
      let params = [];
      return {
        bind(...args) {
          params = args;
          return this;
        },
        async first() {
          const lower = sql.toLowerCase();
          if (lower.includes('from users')) {
            const p0 = String(params[0] || '').toLowerCase();
            const p1 = String(params[1] || p0).toLowerCase();
            return (
              userRows.find(
                (u) =>
                  u.is_active === 1 &&
                  (String(u.id).toLowerCase() === p0 ||
                    String(u.username).toLowerCase() === p0 ||
                    String(u.email).toLowerCase() === p1)
              ) || null
            );
          }
          return null;
        },
        async run() {
          updates.push({ sql, params });
          if (sql.toLowerCase().includes('update users set password_hash')) {
            const [newHash, id] = params;
            const u = userRows.find((r) => r.id === id);
            if (u) u.password_hash = newHash;
          }
          return { success: true, results: [], meta: {} };
        },
        async all() {
          return { success: true, results: userRows, meta: {} };
        },
      };
    },
  };
}

function httpRequest(port, method, reqPath, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const payload = body !== null ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const reqHeaders = { ...headers };
    if (payload !== null && !reqHeaders['Content-Type']) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }
    const req = http.request(
      { hostname: '127.0.0.1', port, method, path: reqPath, headers: reqHeaders },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf8');
          let json = null;
          try {
            json = JSON.parse(raw);
          } catch {
            json = null;
          }
          resolve({ status: res.statusCode, headers: res.headers, raw, json });
        });
      }
    );
    req.on('error', reject);
    if (payload !== null) req.write(payload);
    req.end();
  });
}

// ============================================================================
// REG-006: Backdoor Password Killed, Zero Hash Leaks, PBKDF2-SHA256 + Migration
// ============================================================================
test('REG-006: Login kills master backdoor, leaks zero hashes, upgrades legacy SHA-256 to PBKDF2', async () => {
  const utils = loadTsModules('functions/api/_utils.ts');
  const loginMod = loadTsModules('functions/api/auth/login.ts');

  const legacySha256 = crypto.createHash('sha256').update('MyStrongPass!2026').digest('hex');
  const users = [
    {
      id: 'usr_legacy_01',
      national_id: '29001010100123',
      full_name: 'Legacy Admin',
      username: 'legacyadmin',
      email: 'legacy@hrsup.com',
      password_hash: legacySha256,
      role_id: 'SUPER_ADMIN',
      department: 'Executive',
      job_title: 'Admin',
      phone: '+201000000000',
      clearance_level: 4,
      is_active: 1,
      permissions_json: '["*"]',
      allowed_company_ids: '["all"]',
    },
  ];
  const mockDb = makeMockD1(users);
  const env = { DB: mockDb, JWT_SECRET: TEST_JWT_SECRET, ALLOWED_ORIGINS: 'https://eco.hrsup.com' };

  // 1. Master backdoor ('admin123') MUST fail with 401 and leak ZERO hash/debug fields
  const badReq = new Request('https://eco.hrsup.com/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://eco.hrsup.com' },
    body: JSON.stringify({ identifier: 'legacyadmin', password: 'admin123' }),
  });
  const badRes = await loginMod.onRequestPost({ request: badReq, env });
  assert.equal(badRes.status, 401);
  const badBody = await badRes.text();
  assert.ok(!badBody.includes(legacySha256), '401 response must NEVER leak stored hash');
  assert.ok(!badBody.includes('inputHash') && !badBody.includes('storedHash') && !badBody.includes('debug'));

  // 2. Legitimate legacy SHA-256 password succeeds (Zero Lockout) AND transparently upgrades to PBKDF2
  const okReq = new Request('https://eco.hrsup.com/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://eco.hrsup.com' },
    body: JSON.stringify({ identifier: 'legacyadmin', password: 'MyStrongPass!2026' }),
  });
  const okRes = await loginMod.onRequestPost({ request: okReq, env });
  assert.equal(okRes.status, 200);
  const okJson = await okRes.json();
  assert.equal(okJson.success, true);
  assert.ok(okJson.token && okJson.token.split('.').length === 3, 'Must issue 3-part HS256 JWT');
  assert.equal(okJson.user.password_hash, undefined, '200 response must NEVER include password_hash');
  assert.ok(
    users[0].password_hash.startsWith('pbkdf2_sha256$100000$'),
    'Legacy hash must be transparently upgraded to salted PBKDF2-SHA256'
  );

  // 3. Re-verify using upgraded PBKDF2 hash
  const verified = await utils.verifyPassword('MyStrongPass!2026', users[0].password_hash);
  assert.equal(verified.valid, true);
  assert.equal(verified.needsUpgrade, false);

  // 4. Static check: LuxuryLoginPage.tsx has ZERO hardcoded fallback credentials
  const loginPageSrc = fs.readFileSync(path.join(ROOT, 'src/components/auth/LuxuryLoginPage.tsx'), 'utf8');
  assert.ok(!loginPageSrc.includes('MasterHR@2026'), 'Hardcoded biometric password must be removed');
});

// ============================================================================
// REG-007: Real HS256 JWT — Forged/Tampered/Expired/alg:none Rejected + Fail-Closed
// ============================================================================
test('REG-007: HS256 JWT rejects forged, tampered, expired, alg:none tokens and fails closed in production', async () => {
  const utils = loadTsModules('functions/api/_utils.ts');

  const validToken = await utils.createSessionToken(
    { sub: 'usr_1', id: 'usr_1', role: 'FINANCE_OFFICER' },
    TEST_JWT_SECRET,
    3600
  );
  const verified = await utils.verifySessionToken(validToken, TEST_JWT_SECRET);
  assert.equal(verified?.sub, 'usr_1');
  assert.equal(verified?.role, 'FINANCE_OFFICER');

  // Tampered payload
  const [h, , s] = validToken.split('.');
  const forgedPayload = Buffer.from(
    JSON.stringify({ sub: 'usr_1', role: 'SUPER_ADMIN', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600 })
  ).toString('base64url');
  assert.equal(await utils.verifySessionToken(`${h}.${forgedPayload}.${s}`, TEST_JWT_SECRET), null);

  // alg: "none" attack
  const noneHeader = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  assert.equal(await utils.verifySessionToken(`${noneHeader}.${forgedPayload}.`, TEST_JWT_SECRET), null);
  assert.equal(await utils.verifySessionToken(`${noneHeader}.${forgedPayload}.fake`, TEST_JWT_SECRET), null);

  // Expired token
  const expiredToken = await utils.createSessionToken(
    { sub: 'usr_1', id: 'usr_1', role: 'SUPER_ADMIN' },
    TEST_JWT_SECRET,
    -10
  );
  assert.equal(await utils.verifySessionToken(expiredToken, TEST_JWT_SECRET), null);

  // Wrong secret
  assert.equal(await utils.verifySessionToken(validToken, 'wrong-secret-0123456789'), null);

  // Legacy unsigned base64 token rejected
  const unsignedB64 = Buffer.from(JSON.stringify({ id: 'usr_1', role: 'SUPER_ADMIN', exp: Date.now() + 99999 })).toString('base64');
  assert.equal(await utils.verifySessionToken(unsignedB64, TEST_JWT_SECRET), null);

  // Fail closed in production when JWT_SECRET is missing
  assert.equal(
    utils.resolveJwtSecret({ NODE_ENV: 'production' }, 'https://eco.hrsup.com/api/users'),
    null
  );
});

// ============================================================================
// REG-008: Cloudflare _middleware.ts Deny-by-Default Auth, RBAC & Employee IDOR
// ============================================================================
test('REG-008: Cloudflare _middleware.ts enforces deny-by-default Auth, RBAC, IDOR, and public allowlist', async () => {
  const utils = loadTsModules('functions/api/_utils.ts');
  const mw = loadTsModules('functions/api/_middleware.ts');
  const env = { JWT_SECRET: TEST_JWT_SECRET, ALLOWED_ORIGINS: 'https://eco.hrsup.com', NODE_ENV: 'production' };
  const dummyNext = async () => new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  // 1. Public allowlist: GET /api/health passes without token
  const healthRes = await mw.onRequest({
    request: new Request('https://eco.hrsup.com/api/health', { method: 'GET' }),
    env,
    data: {},
    next: dummyNext,
  });
  assert.equal(healthRes.status, 200);

  // 2. Unauthenticated GET /api/users -> 401
  const unauthRes = await mw.onRequest({
    request: new Request('https://eco.hrsup.com/api/users', { method: 'GET' }),
    env,
    data: {},
    next: dummyNext,
  });
  assert.equal(unauthRes.status, 401);

  // 3. Unauthorized role (HR_SPECIALIST -> /api/users) -> 403
  const hrToken = await utils.createSessionToken({ sub: 'emp_hr', id: 'emp_hr', role: 'HR_SPECIALIST' }, TEST_JWT_SECRET);
  const hrToUsersRes = await mw.onRequest({
    request: new Request('https://eco.hrsup.com/api/users', {
      method: 'GET',
      headers: { Authorization: `Bearer ${hrToken}` },
    }),
    env,
    data: {},
    next: dummyNext,
  });
  assert.equal(hrToUsersRes.status, 403);

  // 4. HR_SPECIALIST -> /api/hr/employees -> 200
  const hrToHrRes = await mw.onRequest({
    request: new Request('https://eco.hrsup.com/api/hr/employees', {
      method: 'GET',
      headers: { Authorization: `Bearer ${hrToken}` },
    }),
    env,
    data: {},
    next: dummyNext,
  });
  assert.equal(hrToHrRes.status, 200);

  // 5. EMPLOYEE IDOR: reading another employee's leaves -> 403; reading own leaves -> 200
  const empToken = await utils.createSessionToken({ sub: 'emp_42', id: 'emp_42', role: 'EMPLOYEE' }, TEST_JWT_SECRET);
  const idorGetRes = await mw.onRequest({
    request: new Request('https://eco.hrsup.com/api/hr/leaves?employeeId=emp_99', {
      method: 'GET',
      headers: { Authorization: `Bearer ${empToken}` },
    }),
    env,
    data: {},
    next: dummyNext,
  });
  assert.equal(idorGetRes.status, 403);

  const ownGetRes = await mw.onRequest({
    request: new Request('https://eco.hrsup.com/api/hr/leaves?employeeId=emp_42', {
      method: 'GET',
      headers: { Authorization: `Bearer ${empToken}` },
    }),
    env,
    data: {},
    next: dummyNext,
  });
  assert.equal(ownGetRes.status, 200);

  // 6. EMPLOYEE IDOR POST: submitting leave for another employee -> 403
  const idorPostRes = await mw.onRequest({
    request: new Request('https://eco.hrsup.com/api/hr/leaves', {
      method: 'POST',
      headers: { Authorization: `Bearer ${empToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: 'emp_99', type: 'annual' }),
    }),
    env,
    data: {},
    next: dummyNext,
  });
  assert.equal(idorPostRes.status, 403);
});

// ============================================================================
// REG-009 & REG-010: Live SQL Bridge Auth, RBAC, X-Bridge-Secret, SQLi & CORS
// ============================================================================
test('REG-009 & REG-010: Live SQL Bridge enforces JWT, RBAC, X-Bridge-Secret, SQLi sanitization & strict CORS', async () => {
  process.env.SQL_BRIDGE_NO_LISTEN = '1';
  process.env.JWT_SECRET = TEST_JWT_SECRET;
  process.env.BRIDGE_SHARED_SECRET = TEST_BRIDGE_SECRET;
  process.env.ALLOWED_ORIGINS = 'https://eco.hrsup.com';
  process.env.NODE_ENV = 'production';

  const req = createRequire(import.meta.url);
  const bridge = req(path.join(ROOT, 'server/sqlBridge.cjs'));

  // Verify SQL identifier sanitizer neutralizes injection payloads
  assert.equal(
    bridge.sanitizeDatabaseName('MK_Khalil_Db_2026]; DROP TABLE users;--'),
    'MK_Khalil_Db_2026DROPTABLEusers'
  );

  // Verify executeFederatedQuery blocks mutations, multi-statement, comments, xp_/sp_, OPENROWSET
  for (const badSql of [
    'SELECT 1; DROP TABLE users',
    'SELECT * FROM Level5 -- comment',
    'DELETE FROM Level5',
    'EXEC xp_cmdshell "whoami"',
    'SELECT * INTO EvilTable FROM Level5',
    'WAITFOR DELAY "00:00:05"',
  ]) {
    await assert.rejects(() => bridge.executeFederatedQuery(badSql, 'MK_Khalil_Db_2026'));
  }

  // Verify cross-compatibility: token signed by Cloudflare Web Crypto (_utils.ts) is verified by Node sqlBridge.cjs
  const utils = loadTsModules('functions/api/_utils.ts');
  const adminToken = await utils.createSessionToken({ sub: 'usr_admin', id: 'usr_admin', role: 'SUPER_ADMIN' }, TEST_JWT_SECRET);
  const hrToken = await utils.createSessionToken({ sub: 'usr_hr', id: 'usr_hr', role: 'HR_MANAGER' }, TEST_JWT_SECRET);
  const finToken = await utils.createSessionToken({ sub: 'usr_fin', id: 'usr_fin', role: 'FINANCE_OFFICER' }, TEST_JWT_SECRET);
  assert.equal(bridge.verifyJwtNode(adminToken, TEST_JWT_SECRET)?.sub, 'usr_admin');

  // Start ephemeral HTTP server on port 0
  const server = await new Promise((resolve) => {
    const s = bridge.app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const { port } = server.address();

  try {
    // 1. Public GET /api/health returns 200 minimal payload
    const health = await httpRequest(port, 'GET', '/api/health', { Origin: 'https://eco.hrsup.com' });
    assert.equal(health.status, 200);
    assert.equal(health.json?.ok, true);
    assert.equal(health.headers['access-control-allow-origin'], 'https://eco.hrsup.com');
    assert.equal(health.headers['vary'], 'Origin');

    // 2. Disallowed CORS origin gets NO Access-Control-Allow-Origin (never '*') and OPTIONS -> 403
    const evilGet = await httpRequest(port, 'GET', '/api/health', { Origin: 'https://evil.attacker.example' });
    assert.equal(evilGet.headers['access-control-allow-origin'], undefined);
    const evilOpt = await httpRequest(port, 'OPTIONS', '/api/finance/status', { Origin: 'https://evil.attacker.example' });
    assert.equal(evilOpt.status, 403);
    assert.equal(evilOpt.headers['access-control-allow-origin'], undefined);

    // 3. Unauthenticated request to finance/system endpoints -> 401
    const unauthFin = await httpRequest(port, 'GET', '/api/finance/cheques');
    assert.equal(unauthFin.status, 401);
    const unauthSys = await httpRequest(port, 'GET', '/api/system/config');
    assert.equal(unauthSys.status, 401);

    // 4. Unauthenticated ?host=evil.attacker query MUST NOT override bridge DB host
    const beforeHost = bridge.getConfig().host;
    await httpRequest(port, 'GET', '/api/health?host=evil.attacker.local&port=9999');
    assert.equal(bridge.getConfig().host, beforeHost, 'Unauthenticated host override must be blocked');

    // 5. Role mismatch -> 403 (HR calling finance; Finance calling HR)
    const hrOnFin = await httpRequest(port, 'GET', '/api/finance/cheques', { Authorization: `Bearer ${hrToken}` });
    assert.equal(hrOnFin.status, 403);
    const finOnHr = await httpRequest(port, 'GET', '/api/hr/employees', { Authorization: `Bearer ${finToken}` });
    assert.equal(finOnHr.status, 403);

    // 6. Valid Finance role can access finance route -> 200
    const finOnFin = await httpRequest(port, 'GET', '/api/finance/cheques', { Authorization: `Bearer ${finToken}` });
    assert.equal(finOnFin.status, 200);

    // 7. /api/system/query & /api/system/config require BOTH Admin JWT AND valid X-Bridge-Secret
    const adminNoSecret = await httpRequest(
      port,
      'POST',
      '/api/system/query',
      { Authorization: `Bearer ${adminToken}` },
      { sqlQuery: 'SELECT 1' }
    );
    assert.equal(adminNoSecret.status, 403);

    const adminWrongSecret = await httpRequest(
      port,
      'GET',
      '/api/system/config',
      { Authorization: `Bearer ${adminToken}`, 'X-Bridge-Secret': 'wrong-secret' }
    );
    assert.equal(adminWrongSecret.status, 403);

    const finWithSecret = await httpRequest(
      port,
      'GET',
      '/api/system/config',
      { Authorization: `Bearer ${finToken}`, 'X-Bridge-Secret': TEST_BRIDGE_SECRET }
    );
    assert.equal(finWithSecret.status, 403);

    const adminWithSecret = await httpRequest(
      port,
      'GET',
      '/api/system/config',
      { Authorization: `Bearer ${adminToken}`, 'X-Bridge-Secret': TEST_BRIDGE_SECRET }
    );
    assert.equal(adminWithSecret.status, 200);
    assert.equal(adminWithSecret.json?.success, true);

    // 8. REG-001 preserved: /api/hr/purge still returns 403 even for SUPER_ADMIN
    const purgeRes = await httpRequest(port, 'POST', '/api/hr/purge', { Authorization: `Bearer ${adminToken}` });
    assert.equal(purgeRes.status, 403);

    // 9. Static check: zero hardcoded SQL password in sqlBridge.cjs or databases.ts
    const bridgeSrc = fs.readFileSync(path.join(ROOT, 'server/sqlBridge.cjs'), 'utf8');
    const dbCfgSrc = fs.readFileSync(path.join(ROOT, 'server/src/config/databases.ts'), 'utf8');
    assert.ok(!bridgeSrc.includes('sa123456789'), 'No hardcoded SQL password in sqlBridge.cjs');
    assert.ok(!dbCfgSrc.includes('sa123456789'), 'No hardcoded SQL password in server/src/config/databases.ts');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

