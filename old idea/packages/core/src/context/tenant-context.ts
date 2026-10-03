import { TenantID, CompanyID, UserSession } from '../types';

export interface ITenantContext {
  tenantId: TenantID;
  companyId: CompanyID;
  session?: UserSession;
}

export class TenantContextHolder {
  private static currentContext: ITenantContext | null = null;

  public static setContext(context: ITenantContext): void {
    this.currentContext = context;
  }

  public static getContext(): ITenantContext {
    if (!this.currentContext) {
      throw new Error('SECURITY_VIOLATION: Multi-tenant context has not been initialized for this execution.');
    }
    return this.currentContext;
  }

  public static clear(): void {
    this.currentContext = null;
  }
}
