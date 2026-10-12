import {
  PagesFunction,
  jsonResponse,
  errorResponse,
  handleOptions,
} from '../_utils';

export const onRequestOptions: PagesFunction = async () => {
  return handleOptions();
};

export const onRequestGet: PagesFunction = async (context) => {
  const { env } = context;

  // Fallback defaults
  const defaults = {
    sql_server_host: '100.76.198.119',
    sql_server_port: 1433,
    local_portproxy_target: '192.168.1.50:49748',
    gateway_url: 'https://datatest.hrsup.com',
  };

  if (!env.DB) {
    return jsonResponse({
      success: true,
      source: 'local_fallback',
      settings: defaults,
    });
  }

  try {
    // Ensure table exists on D1
    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const result = await env.DB.prepare('SELECT key, value FROM system_settings').all();
    const map: Record<string, string> = {};
    for (const row of (result.results || []) as any[]) {
      if (row.key && row.value !== undefined) {
        map[row.key] = row.value;
      }
    }

    return jsonResponse({
      success: true,
      source: 'cloudflare_d1',
      settings: {
        sql_server_host: map['sql_server_host'] || defaults.sql_server_host,
        sql_server_port: parseInt(map['sql_server_port'] || String(defaults.sql_server_port), 10),
        local_portproxy_target: map['local_portproxy_target'] || defaults.local_portproxy_target,
        gateway_url: map['gateway_url'] || defaults.gateway_url,
      },
    });
  } catch (err: any) {
    return jsonResponse({
      success: true,
      source: 'error_fallback',
      warning: err.message,
      settings: defaults,
    });
  }
};

export const onRequestPost: PagesFunction = async (context) => {
  const { request, env } = context;

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const host = body.sql_server_host || body.host;
  const port = body.sql_server_port || body.port;
  const portProxy = body.local_portproxy_target || body.portProxyTarget;
  const gateway = body.gateway_url || body.gatewayUrl;

  const resolved = {
    sql_server_host: host ? String(host).trim() : '100.76.198.119',
    sql_server_port: parseInt(String(port || 1433), 10) || 1433,
    local_portproxy_target: portProxy ? String(portProxy).trim() : '192.168.1.50:49748',
    gateway_url: gateway ? String(gateway).trim() : 'https://datatest.hrsup.com',
  };

  if (env.DB) {
    try {
      await env.DB.exec(`
        CREATE TABLE IF NOT EXISTS system_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const stmts = [
        env.DB.prepare(`
          INSERT INTO system_settings (key, value, updated_at) VALUES ('sql_server_host', ?, CURRENT_TIMESTAMP)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
        `).bind(resolved.sql_server_host),
        env.DB.prepare(`
          INSERT INTO system_settings (key, value, updated_at) VALUES ('sql_server_port', ?, CURRENT_TIMESTAMP)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
        `).bind(String(resolved.sql_server_port)),
        env.DB.prepare(`
          INSERT INTO system_settings (key, value, updated_at) VALUES ('local_portproxy_target', ?, CURRENT_TIMESTAMP)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
        `).bind(resolved.local_portproxy_target),
        env.DB.prepare(`
          INSERT INTO system_settings (key, value, updated_at) VALUES ('gateway_url', ?, CURRENT_TIMESTAMP)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
        `).bind(resolved.gateway_url),
      ];

      await env.DB.batch(stmts);
    } catch (e: any) {
      console.warn('[D1 system_settings] Batch upsert warning:', e.message);
    }
  }

  return jsonResponse({
    success: true,
    persistedTo: env.DB ? 'cloudflare_d1' : 'edge_memory',
    settings: resolved,
  });
};
