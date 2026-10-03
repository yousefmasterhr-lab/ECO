import { UserSession } from '@erp/core';

export interface AuthTokenPayload {
  sub: string;
  tenant_id: string;
  company_id: string;
  role: string;
  clearance_level: number;
  exp: number;
}

export class SessionTokenManager {
  /**
   * Generates mock/development JWT token structure for dev & portal shell
   */
  public static createSessionPayload(session: UserSession, expiryHours: number = 12): AuthTokenPayload {
    return {
      sub: session.user_id,
      tenant_id: session.tenant_id,
      company_id: session.company_id,
      role: session.role,
      clearance_level: session.clearance_level,
      exp: Math.floor(Date.now() / 1000) + expiryHours * 3600
    };
  }

  public static isTokenExpired(payload: AuthTokenPayload): boolean {
    return Math.floor(Date.now() / 1000) > payload.exp;
  }
}
