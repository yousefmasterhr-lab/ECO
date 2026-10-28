// Cloudflare Pages Functions - Company Management Database Helpers & Schema Auto-Init
import { D1Database } from './_utils';

/**
 * Ensures all required Company Management tables exist in Cloudflare D1.
 * Uses atomic db.batch with individual single-statement prepare calls.
 */
export async function ensureCompanySchema(db: D1Database): Promise<void> {
  try {
    await db.batch([
      db.prepare(`
        CREATE TABLE IF NOT EXISTS companies (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          legal_form TEXT,
          capital REAL DEFAULT 0,
          commercial_register TEXT,
          tax_id TEXT,
          manager_name TEXT,
          address TEXT,
          metadata_json TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS company_licenses (
          id TEXT PRIMARY KEY,
          company_id TEXT NOT NULL,
          doc_type TEXT NOT NULL,
          doc_number TEXT,
          issuing_authority TEXT,
          issue_date TEXT,
          expiry_date TEXT,
          file_url TEXT,
          status TEXT DEFAULT 'active',
          metadata_json TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS branches_sites (
          id TEXT PRIMARY KEY,
          company_id TEXT NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          address TEXT,
          manager_name TEXT,
          cost_center_code TEXT,
          metadata_json TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS departments (
          id TEXT PRIMARY KEY,
          company_id TEXT,
          branch_id TEXT,
          parent_id TEXT,
          name TEXT NOT NULL,
          manager_name TEXT,
          cost_center_code TEXT,
          metadata_json TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS authorized_persons (
          id TEXT PRIMARY KEY,
          company_id TEXT NOT NULL,
          name TEXT NOT NULL,
          title TEXT NOT NULL,
          poa_number TEXT,
          notary_office TEXT,
          issue_date TEXT,
          expiry_date TEXT,
          powers_json TEXT,
          status TEXT DEFAULT 'active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS company_audit_logs (
          id TEXT PRIMARY KEY,
          entity_type TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          user_name TEXT NOT NULL,
          action TEXT NOT NULL,
          field_diffs_json TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_companies_cr ON companies(commercial_register)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_licenses_comp ON company_licenses(company_id)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_branches_comp ON branches_sites(company_id)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_depts_comp ON departments(company_id)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_sigs_comp ON authorized_persons(company_id)`)
    ]);
  } catch (err) {
    console.warn('[ensureCompanySchema] Schema batch check notice:', err);
  }
}

/**
 * Record an audit log entry in D1
 */
export async function logCompanyAudit(
  db: D1Database,
  entityType: 'company' | 'license' | 'branch' | 'department' | 'authorized_person',
  entityId: string,
  userName: string,
  action: 'create' | 'update' | 'delete' | 'status_change' | 'revoke',
  fieldDiffs: any[] = []
): Promise<void> {
  try {
    const id = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const diffsJson = JSON.stringify(fieldDiffs || []);
    await db
      .prepare(
        `INSERT INTO company_audit_logs (id, entity_type, entity_id, user_name, action, field_diffs_json, created_at)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
      )
      .bind(id, entityType, entityId, userName || 'يوسف حجازي', action, diffsJson)
      .run();
  } catch (err) {
    console.warn('[logCompanyAudit] Error recording audit log:', err);
  }
}

/**
 * Map D1 Row -> Frontend CompanyEntity
 */
export function mapRowToCompany(row: any): any {
  let meta: any = {};
  try {
    meta = row.metadata_json ? JSON.parse(row.metadata_json) : {};
  } catch {}

  return {
    id: row.id,
    nameAr: row.name || meta.nameAr || '',
    legalType: row.legal_form || meta.legalType || 'ش.م.م',
    issuedCapital: Number(row.capital ?? meta.issuedCapital ?? 0),
    paidCapital: Number(meta.paidCapital ?? row.capital ?? 0),
    totalShares: Number(meta.totalShares ?? 1000000),
    nominalShareValue: Number(meta.nominalShareValue ?? 100),
    crNumber: row.commercial_register || meta.crNumber || '',
    crOffice: meta.crOffice || row.address || '',
    taxNumber: row.tax_id || meta.taxNumber || '',
    establishedYear: meta.establishedYear || String(new Date().getFullYear()),
    ceoAr: row.manager_name || meta.ceoAr || '',
    branchesCount: Number(meta.branchesCount ?? 0),
    projectsCount: Number(meta.projectsCount ?? 0),
    status: meta.status || 'active',
    shareholders: Array.isArray(meta.shareholders) ? meta.shareholders : [],
    documents: Array.isArray(meta.documents) ? meta.documents : [],
    auditLogs: Array.isArray(meta.auditLogs) ? meta.auditLogs : [],
    createdAt: row.created_at || meta.createdAt,
    updatedAt: row.updated_at || meta.updatedAt
  };
}

/**
 * Map D1 Row -> Frontend SmartDocument
 */
export function mapRowToLicense(row: any): any {
  let meta: any = {};
  try {
    meta = row.metadata_json ? JSON.parse(row.metadata_json) : {};
  } catch {}

  return {
    id: row.id,
    companyId: row.company_id || meta.companyId || '',
    companyNameAr: meta.companyNameAr || '',
    docTypeAr: row.doc_type || meta.docTypeAr || 'سجل تجاري',
    titleAr: meta.titleAr || row.doc_type || 'مستند رسمي',
    docNumber: row.doc_number || meta.docNumber || '',
    issuingAuthorityAr: row.issuing_authority || meta.issuingAuthorityAr || '',
    issueDate: row.issue_date || meta.issueDate || '',
    expiryDate: row.expiry_date || meta.expiryDate || '',
    isOpenEnded: Boolean(meta.isOpenEnded),
    status: row.status || meta.status || 'active',
    daysRemaining: Number(meta.daysRemaining ?? 0),
    notesAr: meta.notesAr || '',
    attachment: meta.attachment || (row.file_url ? { id: 'att_1', name: 'مرفق المستند', sizeBytes: 0, mimeType: 'application/pdf', uploadedAt: row.created_at, dataUrl: row.file_url } : undefined),
    auditLogs: Array.isArray(meta.auditLogs) ? meta.auditLogs : [],
    createdAt: row.created_at || meta.createdAt,
    updatedAt: meta.updatedAt || row.created_at
  };
}

/**
 * Map D1 Row -> Frontend BranchLocation
 */
export function mapRowToBranch(row: any): any {
  let meta: any = {};
  try {
    meta = row.metadata_json ? JSON.parse(row.metadata_json) : {};
  } catch {}

  return {
    id: row.id,
    companyId: row.company_id || meta.companyId || '',
    companyNameAr: meta.companyNameAr || '',
    nameAr: row.name || meta.nameAr || '',
    typeAr: row.type || meta.typeAr || 'فرع رئيسي',
    addressAr: row.address || meta.addressAr || '',
    cityAr: meta.cityAr || 'القاهرة',
    managerAr: row.manager_name || meta.managerAr || '',
    phone: meta.phone || '',
    staffCount: Number(meta.staffCount ?? 0),
    activeProjects: Number(meta.activeProjects ?? 0),
    costCenterCode: row.cost_center_code || meta.costCenterCode || '',
    status: meta.status || 'نشط',
    notesAr: meta.notesAr,
    auditLogs: Array.isArray(meta.auditLogs) ? meta.auditLogs : [],
    createdAt: row.created_at || meta.createdAt,
    updatedAt: meta.updatedAt || row.created_at
  };
}

/**
 * Map D1 Row -> Frontend DepartmentOrg
 */
export function mapRowToDepartment(row: any): any {
  let meta: any = {};
  try {
    meta = row.metadata_json ? JSON.parse(row.metadata_json) : {};
  } catch {}

  return {
    id: row.id,
    nameAr: row.name || meta.nameAr || '',
    nameEn: meta.nameEn || meta.titleEn || '',
    titleEn: meta.titleEn || meta.nameEn || '',
    code: meta.code || row.cost_center_code || 'DEP-01',
    headAr: row.manager_name || meta.headAr || '',
    staffCount: Number(meta.staffCount ?? 0),
    subUnits: Array.isArray(meta.subUnits) ? meta.subUnits : [],
    responsibilities: meta.responsibilities || '',
    parentId: row.parent_id !== undefined ? row.parent_id : meta.parentId,
    companyId: row.company_id || meta.companyId,
    companyNameAr: meta.companyNameAr,
    branchId: row.branch_id || meta.branchId,
    branchNameAr: meta.branchNameAr,
    costCenterCode: row.cost_center_code || meta.costCenterCode || '',
    level: meta.level !== undefined ? Number(meta.level) : undefined,
    auditLogs: Array.isArray(meta.auditLogs) ? meta.auditLogs : [],
    createdAt: row.created_at || meta.createdAt,
    updatedAt: meta.updatedAt || row.created_at
  };
}

/**
 * Map D1 Row -> Frontend AuthorizedSignatory
 */
export function mapRowToSignatory(row: any): any {
  let powers: any = {};
  try {
    powers = row.powers_json ? JSON.parse(row.powers_json) : {};
  } catch {}

  return {
    id: row.id,
    companyId: row.company_id || powers.companyId || '',
    companyNameAr: powers.companyNameAr || '',
    nameAr: row.name || powers.nameAr || '',
    roleAr: row.title || powers.roleAr || '',
    nationalId: powers.nationalId || '',
    poaNumber: row.poa_number || powers.poaNumber || '',
    notaryOfficeAr: row.notary_office || powers.notaryOfficeAr || '',
    issueDate: row.issue_date || powers.issueDate || '',
    expiryDate: row.expiry_date || powers.expiryDate || '',
    isOpenEnded: Boolean(powers.isOpenEnded),
    driveDocUrl: powers.driveDocUrl || '',
    status: row.status || powers.status || 'active',
    bankingLimits: powers.bankingLimits || { singleLimit: 0, jointLimit: 0, allowLettersOfGuarantee: false, allowLettersOfCredit: false, allowOpenAccounts: false, notesAr: '' },
    contractualLimits: powers.contractualLimits || { allowContracts: false, allowTenders: false, allowAssetTrade: false, notesAr: '' },
    judicialLimits: powers.judicialLimits || { allowCourtRepresentation: false, allowGovRepresentation: false, allowDisputeResolution: false, notesAr: '' },
    poaAttachment: powers.poaAttachment,
    auditLogs: Array.isArray(powers.auditLogs) ? powers.auditLogs : [],
    createdAt: row.created_at || powers.createdAt,
    updatedAt: powers.updatedAt || row.created_at
  };
}
