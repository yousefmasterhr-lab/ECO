// Centralized Deny-by-Default Auth, Server-Side RBAC & Strict CORS Middleware
// Covers ALL 22 Cloudflare Pages Functions under functions/api/**

import {
  PagesFunction,
  AuthTokenPayload,
  buildCorsHeaders,
  errorResponse,
  handleOptions,
  resolveJwtSecret,
  verifySessionToken,
} from './_utils';

const ADMIN_ROLES = new Set(['SUPER_ADMIN', 'ADMIN']);
const HR_ROLES = new Set(['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'HR_SPECIALIST', 'HR', 'MANAGER']);
const FINANCE_ROLES = new Set(['SUPER_ADMIN', 'ADMIN', 'FINANCE_OFFICER', 'FINANCE', 'MANAGER']);
const COMPANY_WRITE_ROLES = new Set(['SUPER_ADMIN', 'ADMIN', 'LEGAL_COUNSEL', 'MANAGER']);
const COMPANY_READ_ROLES = new Set([
  'SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'HR_SPECIALIST', 'HR',
  'FINANCE_OFFICER', 'FINANCE', 'MANAGER', 'PROJECTS_ENGINEER', 'ENGINEER',
  'LEGAL_COUNSEL', 'LEGAL', 'RECEPTION_SECURITY', 'RECEPTION',
]);
const CTS_ROLES = new Set([
  'SUPER_ADMIN', 'ADMIN', 'MANAGER', 'PROJECTS_ENGINEER', 'ENGINEER',
  'LEGAL_COUNSEL', 'LEGAL', 'HR_MANAGER', 'RECEPTION_SECURITY', 'RECEPTION',
]);
const RECEPTION_ROLES = new Set(['SUPER_ADMIN', 'ADMIN', 'RECEPTION_SECURITY', 'RECEPTION', 'HR_MANAGER', 'MANAGER']);
const EMPLOYEE_ROLES = new Set(['EMPLOYEE', 'STAFF', 'USER']);

function normalizeRole(role: string): string {
  return String(role || '').trim().toUpperCase();
}

function isPublicRoute(pathname: string, method: string): boolean {
  const clean = pathname.replace(/\/+$/, '');
  if (method === 'OPTIONS') return true;
  if (clean === '/api/auth/login' && method === 'POST') return true;
  if (clean === '/api/health' && method === 'GET') return true;
  return false;
}

function isAuthorizedForRoute(
  pathname: string,
  method: string,
  auth: AuthTokenPayload,
  url: URL
): { allowed: boolean; reason?: string } {
  const clean = pathname.replace(/\/+$/, '').toLowerCase();
  const role = normalizeRole(auth.role);
  const isRead = method === 'GET' || method === 'HEAD';

  if (ADMIN_ROLES.has(role)) return { allowed: true };

  // Session self-lookup
  if (clean === '/api/auth/me') return { allowed: true };

  // Version check & lookup lists read-only for authenticated users; mutations admin-only
  if (clean === '/api/system/version' || clean === '/api/configurations') {
    return isRead ? { allowed: true } : { allowed: false, reason: 'Admin role required for system configuration changes' };
  }

  // Strictly Admin-only routes
  if (
    clean.startsWith('/api/users') ||
    clean.startsWith('/api/rbac') ||
    clean.startsWith('/api/permissions') ||
    clean.startsWith('/api/audit-logs') ||
    clean.startsWith('/api/automation') ||
    clean.startsWith('/api/system')
  ) {
    return { allowed: false, reason: 'Admin role required' };
  }

  // Finance routes (if ever hit via edge)
  if (clean.startsWith('/api/finance') || clean.startsWith('/api/financial') || clean.startsWith('/api/sales')) {
    return FINANCE_ROLES.has(role) ? { allowed: true } : { allowed: false, reason: 'Finance role required' };
  }

  // HR routes with Employee self-service IDOR ownership guard
  if (clean.startsWith('/api/hr')) {
    if (HR_ROLES.has(role)) return { allowed: true };
    if (EMPLOYEE_ROLES.has(role)) {
      // Employees may only access their own leaves or attendance records (IDOR check)
      const isSelfResource = clean === '/api/hr/leaves' || clean === '/api/hr/attendance';
      if (!isSelfResource) {
        return { allowed: false, reason: 'HR role required for non-personal HR endpoints' };
      }
      const queryEmpId = url.searchParams.get('employeeId') || url.searchParams.get('employee_id');
      if (isRead && queryEmpId && queryEmpId !== auth.sub) {
        return { allowed: false, reason: 'IDOR blocked: employees may only access their own records' };
      }
      if (isRead && !queryEmpId) {
        return { allowed: false, reason: 'IDOR blocked: employeeId query scoped to own account is required' };
      }
      if (isRead || method === 'POST') return { allowed: true };
    }
    return { allowed: false, reason: 'HR role required' };
  }

  // Social Insurance & ATS
  if (clean.startsWith('/api/insurance') || clean.startsWith('/api/ats')) {
    return HR_ROLES.has(role) ? { allowed: true } : { allowed: false, reason: 'HR role required' };
  }

  // Company Governance
  if (
    clean.startsWith('/api/companies') ||
    clean.startsWith('/api/branches') ||
    clean.startsWith('/api/departments') ||
    clean.startsWith('/api/licenses') ||
    clean.startsWith('/api/authorized-persons')
  ) {
    if (isRead) {
      return COMPANY_READ_ROLES.has(role) ? { allowed: true } : { allowed: false, reason: 'Authorized staff role required' };
    }
    return COMPANY_WRITE_ROLES.has(role) ? { allowed: true } : { allowed: false, reason: 'Admin or Legal/Manager role required' };
  }

  // CTS
  if (clean.startsWith('/api/cts')) {
    return CTS_ROLES.has(role) ? { allowed: true } : { allowed: false, reason: 'CTS role required' };
  }

  // Reception
  if (clean.startsWith('/api/reception')) {
    return RECEPTION_ROLES.has(role) ? { allowed: true } : { allowed: false, reason: 'Reception role required' };
  }

  // Document Vault (R2)
  if (clean.startsWith('/api/storage')) {
    if (method === 'DELETE') {
      return COMPANY_WRITE_ROLES.has(role) || HR_ROLES.has(role)
        ? { allowed: true }
        : { allowed: false, reason: 'Elevated role required to delete documents' };
    }
    return { allowed: true };
  }

  // Deny by default for any unrecognized /api/* route
  return { allowed: false, reason: 'Access denied by default policy' };
}

function applyStrictCorsHeaders(response: Response, request: Request, env: any): Response {
  const strict = buildCorsHeaders(request, env);
  const headers = new Headers(response.headers);
  headers.delete('Access-Control-Allow-Origin');
  headers.delete('Access-Control-Allow-Credentials');
  for (const [k, v] of Object.entries(strict)) {
    headers.set(k, v);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export const onRequest: PagesFunction = async (context) => {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const method = request.method.toUpperCase();

  // 1. Preflight OPTIONS
  if (method === 'OPTIONS') {
    return handleOptions(request, env);
  }

  // 2. Public allowlist strictly limited to POST /api/auth/login and GET /api/health
  if (isPublicRoute(url.pathname, method)) {
    const res = await next();
    return applyStrictCorsHeaders(res, request, env);
  }

  // 3. Deny-by-default HS256 JWT verification
  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return errorResponse('Authentication required (Bearer token missing)', 401, undefined, request, env);
  }

  const secret = resolveJwtSecret(env, request.url);
  if (!secret) {
    return errorResponse('Server authentication secret is not configured', 503, undefined, request, env);
  }

  const token = authHeader.slice(7).trim();
  const payload = await verifySessionToken(token, secret);
  if (!payload) {
    return errorResponse('Invalid or expired authentication token', 401, undefined, request, env);
  }

  // 4. Server-side RBAC + IDOR check
  const decision = isAuthorizedForRoute(url.pathname, method, payload, url);
  if (!decision.allowed) {
    return errorResponse(decision.reason || 'Forbidden', 403, undefined, request, env);
  }

  // 5. IDOR body check for employee self-service POSTs on /api/hr/leaves & /api/hr/attendance
  const role = normalizeRole(payload.role);
  if (EMPLOYEE_ROLES.has(role) && method === 'POST' && (url.pathname.includes('/api/hr/leaves') || url.pathname.includes('/api/hr/attendance'))) {
    try {
      const cloned = request.clone();
      const body: any = await cloned.json().catch(() => ({}));
      const targetEmp = String(body?.employeeId || body?.employee_id || '').trim();
      if (targetEmp && targetEmp !== payload.sub) {
        return errorResponse('IDOR blocked: employees may only submit records for themselves', 403, undefined, request, env);
      }
    } catch {
      return errorResponse('Invalid request payload', 400, undefined, request, env);
    }
  }

  if (context.data && typeof context.data === 'object') {
    context.data.authUser = payload;
  }

  const res = await next();
  return applyStrictCorsHeaders(res, request, env);
};
