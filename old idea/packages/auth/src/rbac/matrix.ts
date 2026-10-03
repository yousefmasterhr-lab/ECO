import { Department, ClearanceLevel } from '@erp/core';

export type EnterpriseRole = 
  | 'SUPER_ADMIN'
  | 'C_SUITE_EXECUTIVE'
  | 'LEGAL_DIRECTOR'
  | 'LEGAL_OFFICER'
  | 'HR_INSURANCE_DIRECTOR'
  | 'INSURANCE_SPECIALIST'
  | 'ATS_RECRUITER'
  | 'ENGINEERING_DIRECTOR'
  | 'PROJECT_MANAGER'
  | 'SITE_ENGINEER'
  | 'CTS_SUPERVISOR'
  | 'CTS_REGISTRAR'
  | 'AUDITOR';

export interface RoleCapability {
  allowedDepartments: Department[];
  defaultClearance: ClearanceLevel;
  canExport: boolean;
  canManageUsers: boolean;
  canCrossCompanyAudit: boolean;
}

export const ROLE_CAPABILITIES: Record<EnterpriseRole, RoleCapability> = {
  SUPER_ADMIN: {
    allowedDepartments: ['ENGINEERING', 'CTS', 'INSURANCE', 'ATS', 'LEGAL', 'EXECUTIVE', 'ADMINISTRATION'],
    defaultClearance: 4,
    canExport: true,
    canManageUsers: true,
    canCrossCompanyAudit: true
  },
  C_SUITE_EXECUTIVE: {
    allowedDepartments: ['EXECUTIVE', 'LEGAL', 'ENGINEERING', 'CTS', 'INSURANCE', 'ATS'],
    defaultClearance: 4,
    canExport: true,
    canManageUsers: false,
    canCrossCompanyAudit: true
  },
  LEGAL_DIRECTOR: {
    allowedDepartments: ['LEGAL', 'EXECUTIVE'],
    defaultClearance: 4,
    canExport: true,
    canManageUsers: false,
    canCrossCompanyAudit: false
  },
  LEGAL_OFFICER: {
    allowedDepartments: ['LEGAL'],
    defaultClearance: 2,
    canExport: false,
    canManageUsers: false,
    canCrossCompanyAudit: false
  },
  HR_INSURANCE_DIRECTOR: {
    allowedDepartments: ['INSURANCE', 'ATS', 'EXECUTIVE'],
    defaultClearance: 3,
    canExport: true,
    canManageUsers: false,
    canCrossCompanyAudit: false
  },
  INSURANCE_SPECIALIST: {
    allowedDepartments: ['INSURANCE'],
    defaultClearance: 2,
    canExport: true,
    canManageUsers: false,
    canCrossCompanyAudit: false
  },
  ATS_RECRUITER: {
    allowedDepartments: ['ATS'],
    defaultClearance: 1,
    canExport: false,
    canManageUsers: false,
    canCrossCompanyAudit: false
  },
  ENGINEERING_DIRECTOR: {
    allowedDepartments: ['ENGINEERING', 'CTS', 'EXECUTIVE'],
    defaultClearance: 3,
    canExport: true,
    canManageUsers: false,
    canCrossCompanyAudit: false
  },
  PROJECT_MANAGER: {
    allowedDepartments: ['ENGINEERING', 'CTS'],
    defaultClearance: 2,
    canExport: true,
    canManageUsers: false,
    canCrossCompanyAudit: false
  },
  SITE_ENGINEER: {
    allowedDepartments: ['ENGINEERING'],
    defaultClearance: 1,
    canExport: false,
    canManageUsers: false,
    canCrossCompanyAudit: false
  },
  CTS_SUPERVISOR: {
    allowedDepartments: ['CTS'],
    defaultClearance: 2,
    canExport: true,
    canManageUsers: false,
    canCrossCompanyAudit: false
  },
  CTS_REGISTRAR: {
    allowedDepartments: ['CTS'],
    defaultClearance: 1,
    canExport: false,
    canManageUsers: false,
    canCrossCompanyAudit: false
  },
  AUDITOR: {
    allowedDepartments: ['EXECUTIVE', 'INSURANCE', 'CTS', 'ENGINEERING'],
    defaultClearance: 3,
    canExport: true,
    canManageUsers: false,
    canCrossCompanyAudit: true
  }
};
