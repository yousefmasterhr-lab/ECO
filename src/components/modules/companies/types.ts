export interface Shareholder {
  id: string;
  name: string;
  entityType: 'فرد' | 'مؤسسة' | 'شريك متضامن' | 'شريك موصي' | 'صندوق استثماري';
  sharesCount: number;
  ownershipPercent: number; // dynamically calculated: (sharesCount / totalShares) * 100
  nationality: string;
}

export interface CompanyDocumentAttachment {
  id: string;
  name: string;
  docType: 'السجل التجاري' | 'البطاقة الضريبية' | 'عقد التأسيس' | 'شهادة تسجيل القيمة المضافة' | 'تراخيص مزاولة النشاط' | string;
  sizeBytes: number;
  mimeType: string;
  uploadedAt: string;
  dataUrl?: string; // Base64 or Object URL for instant preview / download
}

export interface CompanyAuditChange {
  field: string;
  fieldLabel: string;
  oldValue: string;
  newValue: string;
}

export interface CompanyAuditLogEntry {
  id: string;
  companyId: string;
  timestamp: string; // Exact date and time (YYYY-MM-DD HH:mm:ss)
  userName: string;
  action: 'create' | 'update' | 'delete' | 'status_change';
  actionLabelAr: string;
  changes: CompanyAuditChange[];
  notes?: string;
}

export interface CompanyEntity {
  id: string;
  nameAr: string;
  legalType: 'ش.م.م' | 'ذ.م.م' | 'شركة تضامن' | 'فرع أجنبي';
  issuedCapital: number;
  paidCapital: number;
  totalShares: number;
  nominalShareValue: number;
  crNumber: string;
  crOffice: string;
  taxNumber: string;
  establishedYear: string;
  ceoAr: string;
  branchesCount: number;
  projectsCount: number;
  status: 'active' | 'inactive';
  shareholders: Shareholder[];
  documents?: CompanyDocumentAttachment[];
  auditLogs?: CompanyAuditLogEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentAuditChange {
  field: string;
  fieldLabel: string;
  oldValue: string;
  newValue: string;
}

export interface DocumentAuditLogEntry {
  id: string;
  documentId: string;
  timestamp: string; // Exact date and time (YYYY-MM-DD HH:mm:ss)
  userName: string;
  action: 'create' | 'update' | 'delete';
  actionLabelAr: string;
  changes: DocumentAuditChange[];
  notes?: string;
}

export interface SmartDocument {
  id: string;
  companyId: string;
  companyNameAr: string;
  docType: 'سجل تجاري' | 'بطاقة ضريبية' | 'رخصة تشغيل' | 'اتحاد مقاولين' | 'تأمينات اجتماعية' | 'شهادة تصنيف' | string;
  titleAr: string;
  docNumber: string;
  issuerAr: string;
  issueDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  driveUrl?: string;
  notesAr?: string;
  fileAttachment?: CompanyDocumentAttachment;
  auditLogs?: DocumentAuditLogEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BranchAuditChange {
  field: string;
  fieldLabel: string;
  oldValue: string;
  newValue: string;
}

export interface BranchAuditLogEntry {
  id: string;
  branchId: string;
  timestamp: string; // Exact date and time (YYYY-MM-DD HH:mm:ss)
  userName: string;
  action: 'create' | 'update' | 'delete';
  actionLabelAr: string;
  changes: BranchAuditChange[];
  notes?: string;
}

export interface BranchLocation {
  id: string;
  companyId: string;
  companyNameAr: string;
  nameAr: string;
  typeAr: 'مقر رئيسي' | 'فرع إداري' | 'موقع إنشائي/مشروع' | 'مخزن' | 'ورشة مركزية' | 'فرع إقليمي' | 'مستودع تشوين وورش' | 'مكتب موقع' | string;
  cityAr: string;
  addressAr: string;
  googleMapsUrl?: string;
  managerAr: string;
  phone: string;
  staffCount: number;
  activeProjects: number;
  costCenterCode?: string;
  startDate?: string;
  expectedDeliveryDate?: string;
  status?: 'نشط' | 'تحت الإنشاء' | 'مسلم' | 'معلق' | string;
  notesAr?: string;
  auditLogs?: BranchAuditLogEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentAuditChange {
  field: string;
  fieldLabel: string;
  oldValue: string;
  newValue: string;
}

export interface DepartmentAuditLogEntry {
  id: string;
  departmentId: string;
  timestamp: string; // Exact date and time (YYYY-MM-DD HH:mm:ss)
  userName: string;
  action: 'create' | 'update' | 'delete' | 'reparent';
  actionLabelAr: string;
  changes: DepartmentAuditChange[];
  notes?: string;
}

export interface DepartmentOrg {
  id: string;
  nameAr: string;
  nameEn?: string;
  titleEn?: string;
  code: string;
  headAr: string;
  staffCount: number;
  subUnits?: string[];
  responsibilities?: string;
  parentId?: string | null; // For hierarchical org tree (null = root)
  companyId?: string;
  companyNameAr?: string;
  branchId?: string;
  branchNameAr?: string;
  costCenterCode?: string; // Structural Cost Center Mapping
  level?: number; // 0 = Root, 1 = Executive Department, 2 = Sub-Department/Section, 3 = Specialized Unit/Task
  auditLogs?: DepartmentAuditLogEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CostCenter {
  id: string;
  code: string; // e.g. CC-101
  nameAr: string;
  companyId: string;
  companyNameAr: string;
  typeAr: 'مشروع إنشائي' | 'تشغيلي' | 'إداري';
  budget: number;
  spent: number;
  financialOfficerAr: string;
}

export interface SignatoryAuditChange {
  field: string;
  fieldLabel: string;
  oldValue: string;
  newValue: string;
}

export interface SignatoryAuditLogEntry {
  id: string;
  signatoryId: string;
  timestamp: string; // Exact date and time (YYYY-MM-DD HH:mm:ss)
  userName: string;
  action: 'create' | 'update' | 'revoke' | 'activate' | 'delete';
  actionLabelAr: string;
  changes: SignatoryAuditChange[];
  notes?: string;
}

export interface BankingLimits {
  enabled?: boolean;
  singleLimit: number;
  jointLimit: number;
  allowLettersOfGuarantee: boolean;
  allowLettersOfCredit: boolean;
  allowOpenAccounts: boolean;
  notesAr: string;
}

export interface ContractualLimits {
  allowContracts: boolean;
  allowTenders: boolean;
  allowAssetTrade: boolean;
  notesAr: string;
}

export interface JudicialLimits {
  allowCourtRepresentation: boolean;
  allowGovRepresentation: boolean;
  allowDisputeResolution: boolean;
  notesAr: string;
}

export interface AuthorizedSignatory {
  id: string;
  nameAr: string;
  roleAr: string;
  nationalId?: string;
  companyId: string;
  companyNameAr: string;
  poaNumber: string;
  notaryOfficeAr: string;
  issueDate: string;
  expiryDate: string;
  isOpenEnded?: boolean;
  driveDocUrl?: string;
  status: 'active' | 'revoked' | 'expired';
  bankingLimits: BankingLimits;
  contractualLimits: ContractualLimits;
  judicialLimits: JudicialLimits;
  poaAttachment?: CompanyDocumentAttachment;
  auditLogs?: SignatoryAuditLogEntry[];
  createdAt?: string;
  updatedAt?: string;
}
