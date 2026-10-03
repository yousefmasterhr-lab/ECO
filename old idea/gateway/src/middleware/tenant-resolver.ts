import { TenantContextHolder, TenantIsolationError } from '@erp/core';

export class TenantResolverMiddleware {
  public static resolveFromHeaders(headers: Headers): { tenantId: string; companyId: string } {
    const tenantId = headers.get('X-Tenant-ID') || headers.get('x-tenant-id');
    const companyId = headers.get('X-Company-ID') || headers.get('x-company-id');

    if (!tenantId || !companyId) {
      throw new TenantIsolationError('Missing mandatory tenancy headers: X-Tenant-ID or X-Company-ID.');
    }

    TenantContextHolder.setContext({ tenantId, companyId });
    return { tenantId, companyId };
  }
}
