export class EnterpriseError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(message: string, code: string = 'ENTERPRISE_INTERNAL_ERROR', statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'EnterpriseError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class TenantIsolationError extends EnterpriseError {
  constructor(message: string = 'Access denied across tenant or company boundary') {
    super(message, 'TENANT_ISOLATION_VIOLATION', 403);
    this.name = 'TenantIsolationError';
  }
}

export class SecurityClearanceError extends EnterpriseError {
  constructor(message: string = 'Access denied: Insufficient Security Clearance Level') {
    super(message, 'SECURITY_CLEARANCE_DENIED', 403);
    this.name = 'SecurityClearanceError';
  }
}
