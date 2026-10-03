/**
 * Enterprise Reactive API Client & Fetch Interceptor
 * Injects 'X-Database-Context' into all outgoing /api/* requests
 */

export const getActiveDatabaseContext = (): string => {
  try {
    return localStorage.getItem('selected_database') || localStorage.getItem('erp_active_db_context') || 'Tarabot_Data_2026';
  } catch {
    return 'Tarabot_Data_2026';
  }
};

/**
 * Universal Central API Client Interceptor
 * Injects X-Database-Context into every request based on user active database selection
 */
export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const activeDatabase = localStorage.getItem('selected_database') || localStorage.getItem('erp_active_db_context') || 'Tarabot_Data_2026';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Database-Context': activeDatabase,
    ...(options.headers as Record<string, string>),
  };

  const targetUrl = endpoint.startsWith('http') ? endpoint : `http://localhost:5000${endpoint}`;

  try {
    const response = await fetch(targetUrl, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (err: any) {
    // If port 5000 is unreachable directly from browser (e.g. served via Vite proxy/middleware on :3000), fallback gracefully
    if (!endpoint.startsWith('http') && typeof window !== 'undefined' && window.location.port !== '5000') {
      const fallbackResponse = await fetch(endpoint, {
        ...options,
        headers,
      });

      if (!fallbackResponse.ok) {
        const fallbackErr = await fallbackResponse.json().catch(() => ({}));
        throw new Error(fallbackErr.error || `HTTP error! status: ${fallbackResponse.status}`);
      }

      return fallbackResponse.json();
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
    const urlString = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    // Check if this is an API call
    if (urlString.startsWith('/api') || urlString.includes('/api/')) {
      const headers = new Headers(init?.headers || (typeof input === 'object' && 'headers' in input ? (input as any).headers : undefined));
      if (!headers.has('X-Database-Context')) {
        headers.set('X-Database-Context', activeDb);
      }
      init = {
        ...init,
        headers,
      };
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

