import { UserSession, ClearanceLevel, Department, SecurityClearanceError, TenantIsolationError } from '@erp/core';
import { ROLE_CAPABILITIES, EnterpriseRole } from '../rbac/matrix';

export class ClearanceGuard {
  /**
   * Enforces department boundary access
   */
  public static verifyDepartmentAccess(session: UserSession, department: Department): boolean {
    if (session.role === 'SUPER_ADMIN') return true;

    const capabilities = ROLE_CAPABILITIES[session.role as EnterpriseRole];
    if (!capabilities) {
      throw new SecurityClearanceError(`Unknown or unassigned role: ${session.role}`);
    }

    if (!capabilities.allowedDepartments.includes(department)) {
      throw new SecurityClearanceError(
        `Access denied: User department '${session.department}' is not authorized to access '${department}'.`
      );
    }

    return true;
  }

  /**
   * Enforces numeric clearance level (1 to 4)
   */
  public static verifyClearanceLevel(session: UserSession, requiredLevel: ClearanceLevel): boolean {
    if (session.clearance_level < requiredLevel) {
      throw new SecurityClearanceError(
        `Insufficient Clearance: Requires Level ${requiredLevel}, but user only possesses Level ${session.clearance_level}.`
      );
    }
    return true;
  }

  /**
   * Enforces company tenant isolation
   */
  public static verifyCompanyScope(session: UserSession, targetCompanyId: string): boolean {
    if (session.role === 'SUPER_ADMIN') return true;

    const isAuthorized = session.available_companies.some(comp => comp.id === targetCompanyId);
    if (!isAuthorized) {
      throw new TenantIsolationError(
        `Security Breach: User is not authorized to switch to or access company ${targetCompanyId}.`
      );
    }

    return true;
  }
}
