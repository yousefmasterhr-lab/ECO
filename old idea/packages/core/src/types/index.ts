export type UUID = string;

export type TenantID = string;
export type CompanyID = string;
export type UserID = string;

export type Department = 
  | 'ENGINEERING'
  | 'CTS'
  | 'INSURANCE'
  | 'ATS'
  | 'LEGAL'
  | 'EXECUTIVE'
  | 'ADMINISTRATION';

export type ClearanceLevel = 1 | 2 | 3 | 4;

export interface BaseEntity {
  id: UUID;
  tenant_id: TenantID;
  company_id: CompanyID;
  created_at: string;
  updated_at?: string;
  created_by?: UserID;
}

export interface Tenant {
  id: TenantID;
  legal_name: string;
  subdomain: string;
  subscription_plan: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  is_active: boolean;
  created_at: string;
}

export interface Company {
  id: CompanyID;
  tenant_id: TenantID;
  commercial_name: string;
  tax_number: string;
  commercial_registration_no: string;
  currency: string;
  drive_root_folder_id?: string;
  created_at: string;
}

export interface UserSession {
  user_id: UserID;
  tenant_id: TenantID;
  company_id: CompanyID;
  email: string;
  full_name: string;
  department: Department;
  role: string;
  clearance_level: ClearanceLevel;
  available_companies: {
    id: CompanyID;
    name: string;
    role: string;
    clearance_level: ClearanceLevel;
  }[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    per_page?: number;
    total?: number;
    timestamp: string;
    tenant_id: TenantID;
    company_id: CompanyID;
  };
}
