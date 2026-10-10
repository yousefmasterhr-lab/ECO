/**
 * Enterprise Reactive API Client & Fetch Interceptor
 * Injects 'X-Database-Context' into all outgoing /api/* requests
 * 
 * Default Production Gateway: https://datatest.hrsup.com (Cloudflare Tunnel: eco-data-bridge)
 */

export const PRODUCTION_DEFAULT_GATEWAY = 'https://datatest.hrsup.com';
export const LOCAL_DEV_DEFAULT_GATEWAY = 'http://localhost:5000';

/**
 * Determines whether the current execution context is in production
 * Detects hrsup.com domains, Cloudflare Pages (*.pages.dev), and Vite production builds.
 */
export const isProductionEnvironment = (): boolean => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    // Production Cloudflare Pages or custom enterprise domain
    if (host.includes('hrsup.com') || host.includes('pages.dev') || host.includes('cloudflare')) {
      return true;
    }
    // Explicit local development
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host.endsWith('.local')) {
      return false;
    }
  }
  return Boolean((import.meta as any).env?.PROD);
};

export const getActiveDatabaseContext = (): string => {
  try {
    return localStorage.getItem('selected_database') || localStorage.getItem('erp_active_db_context') || 'Tarabot_Data_2026';
  } catch {
    return 'Tarabot_Data_2026';
  }
};

/**
 * Resolves the active API Gateway Base URL following the strict precedence:
 * 1. User-specified URL in localStorage ('eco_api_base_url')
 * 2. Environment variable (VITE_API_BASE_URL if present)
 * 3. Default production fallback: https://datatest.hrsup.com
 * 4. Local development fallback: http://localhost:5000
 */
export const getApiBaseUrl = (): string => {
  try {
    // 1. User-specified URL in localStorage (if manually set by admin)
    const customUrl = localStorage.getItem('eco_api_base_url');
    if (customUrl && customUrl.trim()) {
      return customUrl.trim().replace(/\/+$/, '');
    }
  } catch {}

  // 2. Environment variable (VITE_API_BASE_URL if present)
  const envUrl = ((import.meta as any).env?.VITE_API_BASE_URL as string)?.trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }

  // 3. Default production fallback
  if (isProductionEnvironment()) {
    return PRODUCTION_DEFAULT_GATEWAY;
  }

  // 4. Local development fallback
  return LOCAL_DEV_DEFAULT_GATEWAY;
};

export const setApiBaseUrl = (url: string): void => {
  try {
    if (!url || !url.trim() || url.trim() === PRODUCTION_DEFAULT_GATEWAY) {
      localStorage.removeItem('eco_api_base_url');
    } else {
      localStorage.setItem('eco_api_base_url', url.trim().replace(/\/+$/, ''));
    }
    window.dispatchEvent(new CustomEvent('eco-api-url-changed', { detail: { url } }));
  } catch {}
};

/**
 * Edge Cloudflare D1 & R2 Routing Predicate
 * Governs Core Authentication, RBAC Users, Audit Trails, and Document Vault
 * These routes run at Cloudflare Edge and must remain strictly decoupled from the local SQL Server bridge.
 */
export const isCloudflareEdgeRoute = (endpoint: string): boolean => {
  const clean = endpoint.toLowerCase().replace(/^\/+/, '');
  return (
    clean.startsWith('api/auth') ||
    clean.startsWith('api/users') ||
    clean.startsWith('api/audit-logs') ||
    clean.startsWith('api/storage')
  );
};

/**
 * Determines whether the user is actively authenticated and not on public/login routes
 */
export const isUserAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  if (path.includes('/login')) return false;
  try {
    const session = localStorage.getItem('eco_auth_session') || sessionStorage.getItem('eco_auth_session');
    const token = localStorage.getItem('eco_session_token') || sessionStorage.getItem('eco_session_token') || localStorage.getItem('token');
    return Boolean(session || token);
  } catch {
    return false;
  }
};

/**
 * Universal Central API Client Interceptor
 * Injects X-Database-Context and Accept headers into every request
 * Provides resilient retry logic for transient tunnel reconnects (502/503/504)
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  retries = 1
): Promise<T> {
  const activeDatabase = getActiveDatabaseContext();
  const baseUrl = getApiBaseUrl();

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Database-Context': activeDatabase,
    ...(options.headers as Record<string, string>),
  };

  const token = typeof window !== 'undefined'
    ? localStorage.getItem('eco_session_token') || sessionStorage.getItem('eco_session_token')
    : null;
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const isEdge = isCloudflareEdgeRoute(cleanEndpoint);

  // Guard Financial & System Queries: Do NOT ping https://datatest.hrsup.com while on /login or unauthenticated
  if (!isEdge && !isUserAuthenticated()) {
    return Promise.resolve({
      connected: false,
      isFailSafe: true,
      data: [],
      accounts: [],
      costCenters: [],
      databases: [],
      vouchers: [],
      cheques: [],
      journals: [],
      items: [],
      clients: [],
      suppliers: [],
    } as unknown as T);
  }

  const targetUrl = endpoint.startsWith('http')
    ? endpoint
    : isEdge
    ? cleanEndpoint
    : `${baseUrl}${cleanEndpoint}`;

  try {
    const response = await fetch(targetUrl, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // If 502/503/504 Bad Gateway from tunnel during temporary reconnect, retry once
      if (retries > 0 && [502, 503, 504].includes(response.status)) {
        await new Promise(resolve => setTimeout(resolve, 800));
        return apiRequest<T>(endpoint, options, retries - 1);
      }
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (err: any) {
    // If network failure / connection drop and retries remain, attempt retry
    if (retries > 0 && (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('network'))) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return apiRequest<T>(endpoint, options, retries - 1);
    }

    // If targetUrl is not localhost and failed, and user is local dev, fallback gracefully to localhost
    if (!endpoint.startsWith('http') && !isEdge && typeof window !== 'undefined') {
      const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocalHost && !targetUrl.includes('localhost:5000')) {
        const fallbackResponse = await fetch(`http://localhost:5000${cleanEndpoint}`, {
          ...options,
          headers,
        });

        if (fallbackResponse.ok) {
          return fallbackResponse.json();
        }
      }
    }

    throw err;
  }
}

// Global Fetch Interceptor
let isFetchIntercepted = false;

export function setupFetchInterceptor(): void {
  if (isFetchIntercepted || typeof window === 'undefined') return;
  const originalFetch = window.fetch;

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const activeDb = getActiveDatabaseContext();
    let urlString = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    // Check if this is an API call
    if (urlString.startsWith('/api') || urlString.startsWith('api/')) {
      const cleanUrl = urlString.startsWith('/') ? urlString : `/${urlString}`;
      const isEdge = isCloudflareEdgeRoute(cleanUrl);

      // Guard Financial & System Queries: Do NOT ping https://datatest.hrsup.com while on /login or unauthenticated
      if (!isEdge && !isUserAuthenticated()) {
        return new Response(JSON.stringify({
          success: true,
          data: [],
          unauthenticated: true,
          isFailSafe: true,
          connected: false,
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const baseUrl = getApiBaseUrl();
      urlString = isEdge ? cleanUrl : (baseUrl ? `${baseUrl}${cleanUrl}` : cleanUrl);

      const headers = new Headers(
        init?.headers || (typeof input === 'object' && 'headers' in input ? (input as any).headers : undefined)
      );

      if (!headers.has('X-Database-Context')) {
        headers.set('X-Database-Context', activeDb);
      }
      if (!headers.has('Accept')) {
        headers.set('Accept', 'application/json');
      }

      const sessionToken = localStorage.getItem('eco_session_token') || sessionStorage.getItem('eco_session_token');
      if (sessionToken && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${sessionToken}`);
      }

      init = {
        ...init,
        headers,
      };

      try {
        const res = await originalFetch.call(this, urlString, init);
        // Handle transient 502/503/504 from Cloudflare Tunnel reconnection
        if ([502, 503, 504].includes(res.status)) {
          await new Promise(r => setTimeout(r, 600));
          return originalFetch.call(this, urlString, init);
        }
        return res;
      } catch (err: any) {
        // Retry once on network disconnect
        try {
          await new Promise(r => setTimeout(r, 600));
          return await originalFetch.call(this, urlString, init);
        } catch {
          throw err;
        }
      }
    } else if (urlString.includes('/api/')) {
      const isEdge = isCloudflareEdgeRoute(urlString);
      if (!isEdge && !isUserAuthenticated()) {
        return new Response(JSON.stringify({
          success: true,
          data: [],
          unauthenticated: true,
          isFailSafe: true,
          connected: false,
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // If absolute URL to an API endpoint
      const headers = new Headers(
        init?.headers || (typeof input === 'object' && 'headers' in input ? (input as any).headers : undefined)
      );
      if (!headers.has('X-Database-Context')) {
        headers.set('X-Database-Context', activeDb);
      }
      if (!headers.has('Accept')) {
        headers.set('Accept', 'application/json');
      }
      init = {
        ...init,
        headers,
      };
      return originalFetch.call(this, urlString, init);
    }

    return originalFetch.call(this, input, init);
  };

  isFetchIntercepted = true;
}

// Auto-initialize interceptor on load
setupFetchInterceptor();

export const apiClient = {
  get: async <T = any>(url: string, headers?: Record<string, string>): Promise<T> => {
    return apiRequest<T>(url, { method: 'GET', headers });
  },

  post: async <T = any>(url: string, data?: any, headers?: Record<string, string>): Promise<T> => {
    return apiRequest<T>(url, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  },
};
