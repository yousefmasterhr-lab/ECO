export type DatabaseCategory =
  | 'primary'
  | 'archives'
  | 'specialized_payroll'
  | 'engineering_archive'
  | 'partners'
  | 'sandbox';

export interface DatabaseFleetItem {
  name: string;
  displayNameAr: string;
  displayNameEn: string;
  category: DatabaseCategory;
  categoryNameAr: string;
  categoryNameEn: string;
  categoryIcon: string;
  isPrimary: boolean;
  createDate: string;
  status: string;
  sizeMb: number;
  descriptionAr: string;
}

export interface ConnectionHealthStatus {
  connected: boolean;
  isFailSafe: boolean;
  active_mode?: 'REMOTE' | 'LOCAL_FALLBACK';
  target_db?: string;
  latency_status?: string;
  host: string;
  port: number;
  portProxyTarget: string;
  serverName: string;
  version: string;
  activeDatabase: string;
  activePoolsCount: number;
  latencyMs: number;
  error?: string;
  timestamp: string;
}

export interface DatabaseFleetResponse {
  connected: boolean;
  isFailSafe: boolean;
  active_mode?: 'REMOTE' | 'LOCAL_FALLBACK';
  target_db?: string;
  latency_status?: string;
  environment?: string;
  host: string;
  port: number;
  portProxyTarget: string;
  engine: string;
  activePoolsCount: number;
  latencyMs: number;
  totalDatabases: number;
  databases: DatabaseFleetItem[];
  error?: string;
}

export interface FederatedQueryResult {
  success: boolean;
  database: string;
  rows: Record<string, any>[];
  rowCount: number;
  columns: string[];
  durationMs: number;
  error?: string;
  timestamp: string;
}

export interface PayrollEmployeeItem {
  employeeId: number;
  nameAr: string;
  basicSalary: number;
  totalSalary: number;
  insuranceAmount: number;
  taxAmount: number;
  netSalary: number;
  departmentAr: string;
}

export interface PayrollGlAccountItem {
  code: string;
  nameAr: string;
  budgeted: number;
  actualDisbursed: number;
  variance: number;
  nature: 'DEBIT' | 'CREDIT';
}

export interface PayrollGlBridgeData {
  success: boolean;
  database: string;
  totalEmployees: number;
  totalGross: number;
  totalInsurance: number;
  totalTax: number;
  totalNet: number;
  employees: PayrollEmployeeItem[];
  glAccounts: PayrollGlAccountItem[];
  timestamp: string;
  error?: string;
}

export interface UniversalProjectItem {
  sourceDb: string;
  companyAr: string;
  projectId: number;
  projectNameAr: string;
  statusAr: string;
}

export interface UniversalProjectsBridgeData {
  success: boolean;
  totalCount: number;
  databasesQueried: string[];
  projects: UniversalProjectItem[];
  timestamp: string;
  error?: string;
}

export interface ComparativeMetricItem {
  metricAr: string;
  metricEn: string;
  y2022: number;
  y2023: number;
  y2026: number;
  growthPercent: number;
}

export interface MultiYearBalanceData {
  success: boolean;
  fiscalYears: number[];
  databases: string[];
  comparativeMetrics: ComparativeMetricItem[];
  timestamp: string;
  error?: string;
}
