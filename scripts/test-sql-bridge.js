/**
 * Automated Diagnostic Tool for SQL Bridge & Network Pipeline
 * Usage: node scripts/test-sql-bridge.js
 */

import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import sql from 'mssql';

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const DB_SERVER = process.env.DB_SERVER || '100.68.121.85';
const DB_PORT = parseInt(process.env.DB_PORT || '1433', 10);
const DB_USER = process.env.DB_USER || 'sa';
const DB_PASSWORD = process.env.DB_PASSWORD || process.env.MSSQL_PASSWORD || 'sa123456789';
const DB_NAME = process.env.DB_NAME || 'master';

console.log(`${colors.cyan}${colors.bold}======================================================${colors.reset}`);
console.log(`${colors.cyan}${colors.bold}   ECO ERP - SQL Bridge & Network Pipeline Diagnostic  ${colors.reset}`);
console.log(`${colors.cyan}${colors.bold}======================================================${colors.reset}`);
console.log(`${colors.gray}Target SQL Server:${colors.reset} ${DB_SERVER}:${DB_PORT}`);
console.log(`${colors.gray}Database User:    ${colors.reset} ${DB_USER}`);
console.log(`${colors.gray}Local Bridge:     ${colors.reset} http://localhost:5000`);
console.log(`${colors.gray}Public Gateway:   ${colors.reset} https://datatest.hrsup.com\n`);

async function testHttpEndpoint(urlStr, timeoutMs = 5000) {
  return new Promise((resolve) => {
    try {
      const url = new URL(urlStr);
      const client = url.protocol === 'https:' ? https : http;
      const req = client.get(url, { timeout: timeoutMs }, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, statusCode: res.statusCode, data });
        });
      });
      req.on('timeout', () => {
        req.destroy();
        resolve({ ok: false, error: 'Request Timed Out (' + timeoutMs + 'ms)' });
      });
      req.on('error', (err) => {
        resolve({ ok: false, error: err.message });
      });
    } catch (e) {
      resolve({ ok: false, error: e.message });
    }
  });
}

function testRawTcp(host, port, timeoutMs = 5000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    socket.setTimeout(timeoutMs);

    socket.once('connect', () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve({ ok: true });
      }
    });

    socket.once('timeout', () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve({ ok: false, error: `Connection Timed Out after ${timeoutMs}ms (packet dropped or host unreachable)` });
      }
    });

    socket.once('error', (err) => {
      if (!settled) {
        settled = true;
        resolve({ ok: false, error: err.message });
      }
    });

    try {
      socket.connect(port, host);
    } catch (err) {
      resolve({ ok: false, error: err.message });
    }
  });
}

async function runDiagnostics() {
  const results = [];

  // ---------------------------------------------------------
  // Hop 1: Local Port Check (localhost:5000)
  // ---------------------------------------------------------
  process.stdout.write(`[1/4] Hop 1: Local Port Check (http://localhost:5000/api/system/health)... `);
  const hop1 = await testHttpEndpoint('http://localhost:5000/api/system/health', 3000);
  if (hop1.ok) {
    console.log(`${colors.green}✓ PASS (HTTP ${hop1.statusCode})${colors.reset}`);
    results.push({ hop: 'Hop 1: Local Bridge (Port 5000)', status: 'PASS', details: 'Listening and responding to health probe' });
  } else {
    console.log(`${colors.red}✗ FAIL${colors.reset} -> ${hop1.error || 'HTTP ' + hop1.statusCode}`);
    results.push({ hop: 'Hop 1: Local Bridge (Port 5000)', status: 'FAIL', details: hop1.error || `HTTP ${hop1.statusCode}` });
  }

  // ---------------------------------------------------------
  // Hop 2: Tailscale SQL Reachability (Raw TCP)
  // ---------------------------------------------------------
  process.stdout.write(`[2/4] Hop 2: Tailscale Raw TCP Socket (${DB_SERVER}:${DB_PORT})... `);
  const hop2 = await testRawTcp(DB_SERVER, DB_PORT, 5000);
  if (hop2.ok) {
    console.log(`${colors.green}✓ PASS (TCP Handshake Established)${colors.reset}`);
    results.push({ hop: 'Hop 2: Tailscale Reachability', status: 'PASS', details: `Port ${DB_PORT} is accessible across mesh` });
  } else {
    console.log(`${colors.red}✗ FAIL${colors.reset} -> ${hop2.error}`);
    results.push({ hop: 'Hop 2: Tailscale Reachability', status: 'FAIL', details: hop2.error });
  }

  // ---------------------------------------------------------
  // Hop 3: SQL Authentication & Query Execution
  // ---------------------------------------------------------
  process.stdout.write(`[3/4] Hop 3: SQL Authentication & Query Execution (SELECT @@VERSION)... `);
  try {
    const pool = await new sql.ConnectionPool({
      server: DB_SERVER,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      options: {
        encrypt: false,
        trustServerCertificate: true,
        connectTimeout: 8000,
        requestTimeout: 10000,
      }
    }).connect();

    const q = await pool.request().query('SELECT @@VERSION AS version, DB_NAME() AS activeDb, @@SERVERNAME AS srv');
    const versionSnippet = (q.recordset[0]?.version || '').split('\n')[0].substring(0, 50);
    const serverName = q.recordset[0]?.srv || 'Unknown';
    await pool.close();

    console.log(`${colors.green}✓ PASS${colors.reset}`);
    console.log(`      ${colors.gray}Connected to:${colors.reset} ${serverName} | ${versionSnippet}...`);
    results.push({ hop: 'Hop 3: SQL Authentication', status: 'PASS', details: `${serverName} (${versionSnippet})` });
  } catch (err) {
    console.log(`${colors.red}✗ FAIL${colors.reset} -> ${err.message}`);
    results.push({ hop: 'Hop 3: SQL Authentication', status: 'FAIL', details: err.message });
  }

  // ---------------------------------------------------------
  // Hop 4: Cloudflare Tunnel Reachability (datatest.hrsup.com)
  // ---------------------------------------------------------
  process.stdout.write(`[4/4] Hop 4: Cloudflare Tunnel Reachability (https://datatest.hrsup.com/api/system/health)... `);
  const hop4 = await testHttpEndpoint('https://datatest.hrsup.com/api/system/health', 5000);
  if (hop4.ok) {
    console.log(`${colors.green}✓ PASS (Tunnel Active & Forwarding Traffic)${colors.reset}`);
    results.push({ hop: 'Hop 4: Cloudflare Tunnel Gateway', status: 'PASS', details: 'Public endpoint forwards traffic to bridge' });
  } else {
    console.log(`${colors.yellow}⚠ NOT ACTIVE${colors.reset} -> ${hop4.error || 'HTTP ' + hop4.statusCode}`);
    results.push({
      hop: 'Hop 4: Cloudflare Tunnel Gateway',
      status: 'OFFLINE',
      details: hop4.error || `HTTP ${hop4.statusCode} (Cloudflare Tunnel eco-data-bridge is not currently connected to localhost:5000)`
    });
  }

  // ---------------------------------------------------------
  // Summary Scorecard
  // ---------------------------------------------------------
  console.log(`\n${colors.cyan}${colors.bold}------------------------------------------------------${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}                 DIAGNOSTIC SUMMARY                   ${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}------------------------------------------------------${colors.reset}`);
  results.forEach(r => {
    const badge = r.status === 'PASS'
      ? `${colors.green}[ PASS ]${colors.reset}`
      : r.status === 'OFFLINE'
      ? `${colors.yellow}[OFFLINE]${colors.reset}`
      : `${colors.red}[ FAIL ]${colors.reset}`;
    console.log(`${badge} ${colors.bold}${r.hop}${colors.reset}`);
    console.log(`         ${colors.gray}${r.details}${colors.reset}`);
  });

  console.log(`\n${colors.cyan}${colors.bold}Guidance & Recommendations:${colors.reset}`);
  if (results[0].status === 'PASS' && results[1].status === 'PASS' && results[2].status === 'PASS') {
    if (results[3].status !== 'PASS') {
      console.log(`${colors.yellow}• Local bridge and SQL Server are 100% HEALTHY!${colors.reset}`);
      console.log(`${colors.yellow}• In the frontend SQL Federation Hub, switch the gateway URL to: http://localhost:5000${colors.reset}`);
      console.log(`${colors.yellow}  or launch Cloudflare Tunnel with token to connect https://datatest.hrsup.com.${colors.reset}`);
    } else {
      console.log(`${colors.green}• Entire pipeline (Local, Tailscale, SQL Server, and Cloudflare Tunnel) is 100% ONLINE!${colors.reset}`);
    }
  } else {
    if (results[0].status !== 'PASS') {
      console.log(`${colors.red}• Start the local bridge with: node server/sqlBridge.cjs${colors.reset}`);
    }
    if (results[1].status !== 'PASS') {
      console.log(`${colors.red}• Verify Tailscale is running and IP ${DB_SERVER} is active.${colors.reset}`);
    }
    if (results[2].status !== 'PASS' && results[1].status === 'PASS') {
      console.log(`${colors.red}• Check SQL credentials for user '${DB_USER}' or mixed authentication mode.${colors.reset}`);
    }
  }
  console.log('');
}

runDiagnostics().catch(console.error);
