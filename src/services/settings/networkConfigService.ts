/**
 * Enterprise Network Configuration Service
 * Provides dynamic and persistent management of SQL Server Tailscale Node,
 * PortProxy Local Target, and Gateway API Bridge URL.
 * 
 * Supports:
 * 1. Synchronous instant retrieval from localStorage for latency-free renders.
 * 2. Asynchronous bidirectional sync with Cloudflare D1 (/api/system/settings)
 * 3. Dynamic runtime propagation to SQL Server Bridge (/api/system/config)
 */

export interface NetworkConfig {
  sql_server_host: string;
  sql_server_port: number;
  local_portproxy_target: string;
  gateway_url: string;
}

export const DEFAULT_NETWORK_CONFIG: NetworkConfig = {
  sql_server_host: '100.76.198.119',
  sql_server_port: 1433,
  local_portproxy_target: '192.168.1.50:49748',
  gateway_url: 'https://datatest.hrsup.com',
};

export const NETWORK_STORAGE_KEYS = {
  HOST: 'eco_sql_server_host',
  PORT: 'eco_sql_server_port',
  PORTPROXY: 'eco_local_portproxy_target',
  GATEWAY: 'eco_api_base_url',
} as const;

/**
 * Synchronously retrieves active network parameters from LocalStorage with enterprise defaults.
 */
export function getNetworkConfigSync(): NetworkConfig {
  let host = DEFAULT_NETWORK_CONFIG.sql_server_host;
  let port = DEFAULT_NETWORK_CONFIG.sql_server_port;
  let portProxy = DEFAULT_NETWORK_CONFIG.local_portproxy_target;
  let gateway = DEFAULT_NETWORK_CONFIG.gateway_url;

  if (typeof window !== 'undefined') {
    try {
      const storedHost = localStorage.getItem(NETWORK_STORAGE_KEYS.HOST);
      if (storedHost && storedHost.trim()) {
        host = storedHost.trim();
      }

      const storedPort = localStorage.getItem(NETWORK_STORAGE_KEYS.PORT);
      if (storedPort && !isNaN(Number(storedPort))) {
        port = Number(storedPort);
      }

      const storedPortProxy = localStorage.getItem(NETWORK_STORAGE_KEYS.PORTPROXY);
      if (storedPortProxy && storedPortProxy.trim()) {
        portProxy = storedPortProxy.trim();
      }

      const storedGateway = localStorage.getItem(NETWORK_STORAGE_KEYS.GATEWAY);
      if (storedGateway && storedGateway.trim()) {
        gateway = storedGateway.trim().replace(/\/+$/, '');
      }
    } catch {}
  }

  return {
    sql_server_host: host,
    sql_server_port: port,
    local_portproxy_target: portProxy,
    gateway_url: gateway,
  };
}

/**
 * Asynchronously loads settings from Cloudflare D1 or local backend,
 * updating LocalStorage cache if remote settings are retrieved.
 */
export async function fetchNetworkConfig(): Promise<NetworkConfig> {
  const current = getNetworkConfigSync();
  try {
    const res = await fetch('/api/system/settings', {
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      const settings = data.settings || data;
      if (settings && (settings.sql_server_host || settings.host)) {
        const remoteConfig: NetworkConfig = {
          sql_server_host: settings.sql_server_host || settings.host || current.sql_server_host,
          sql_server_port: Number(settings.sql_server_port || settings.port) || current.sql_server_port,
          local_portproxy_target: settings.local_portproxy_target || settings.portProxyTarget || current.local_portproxy_target,
          gateway_url: settings.gateway_url || settings.gatewayUrl || current.gateway_url,
        };
        saveNetworkConfigSync(remoteConfig);
        return remoteConfig;
      }
    }
  } catch {
    // Graceful fallback to cached local settings
  }
  return current;
}

/**
 * Synchronously commits configuration to LocalStorage and notifies the application.
 */
export function saveNetworkConfigSync(config: Partial<NetworkConfig>): NetworkConfig {
  const existing = getNetworkConfigSync();
  const updated: NetworkConfig = {
    sql_server_host: (config.sql_server_host ?? existing.sql_server_host).trim(),
    sql_server_port: Number(config.sql_server_port ?? existing.sql_server_port) || 1433,
    local_portproxy_target: (config.local_portproxy_target ?? existing.local_portproxy_target).trim(),
    gateway_url: (config.gateway_url ?? existing.gateway_url).trim().replace(/\/+$/, ''),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(NETWORK_STORAGE_KEYS.HOST, updated.sql_server_host);
      localStorage.setItem(NETWORK_STORAGE_KEYS.PORT, String(updated.sql_server_port));
      localStorage.setItem(NETWORK_STORAGE_KEYS.PORTPROXY, updated.local_portproxy_target);
      localStorage.setItem(NETWORK_STORAGE_KEYS.GATEWAY, updated.gateway_url);

      window.dispatchEvent(
        new CustomEvent('eco-network-config-changed', { detail: updated })
      );
    } catch {}
  }

  return updated;
}

/**
 * Saves network configuration:
 * 1. Immediately persists to LocalStorage.
 * 2. Persists to Cloudflare D1 (/api/system/settings).
 * 3. Pushes updated connection parameters to the SQL Bridge (/api/system/config).
 */
export async function saveNetworkConfig(config: Partial<NetworkConfig>): Promise<{
  success: boolean;
  config: NetworkConfig;
  d1Synced: boolean;
  bridgeSynced: boolean;
}> {
  const updated = saveNetworkConfigSync(config);

  let d1Synced = false;
  let bridgeSynced = false;

  // 1. Persist to Cloudflare D1
  try {
    const d1Res = await fetch('/api/system/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(updated),
    });
    if (d1Res.ok) d1Synced = true;
  } catch {}

  // 2. Propagate to SQL Server Bridge
  try {
    const bridgeRes = await fetch('/api/system/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        host: updated.sql_server_host,
        port: updated.sql_server_port,
        portProxyTarget: updated.local_portproxy_target,
        gatewayUrl: updated.gateway_url,
      }),
    });
    if (bridgeRes.ok) bridgeSynced = true;
  } catch {}

  return {
    success: true,
    config: updated,
    d1Synced,
    bridgeSynced,
  };
}
