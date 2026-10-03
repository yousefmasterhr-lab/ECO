import { OwaspSecurityMiddleware } from './middleware/owasp';
import { TenantResolverMiddleware } from './middleware/tenant-resolver';

export interface Env {
  DB: any; // Cloudflare D1 Database binding
  VAULT_BUCKET?: any; // Cloudflare R2 or Drive secrets
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const securityHeaders = OwaspSecurityMiddleware.getSecurityHeaders();

    // Health check endpoint
    const url = new URL(request.url);
    if (url.pathname === '/health' || url.pathname === '/api/v1/health') {
      return new Response(JSON.stringify({
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: 'ENTERPRISE-ERP-GATEWAY',
        edgeEngine: 'Cloudflare Workers & D1 Relational Engine'
      }), {
        headers: { 'Content-Type': 'application/json', ...securityHeaders }
      });
    }

    try {
      // Resolve tenancy context
      if (url.pathname.startsWith('/api/v1/')) {
        TenantResolverMiddleware.resolveFromHeaders(request.headers);
      }

      return new Response(JSON.stringify({
        message: 'Enterprise Edge Gateway Active',
        path: url.pathname
      }), {
        headers: { 'Content-Type': 'application/json', ...securityHeaders }
      });
    } catch (err: any) {
      return new Response(JSON.stringify({
        error: err.name,
        message: err.message
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...securityHeaders }
      });
    }
  }
};
