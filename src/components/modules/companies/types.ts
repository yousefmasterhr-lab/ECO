export interface Shareholder {
  id: string;
  name: string;
  entityType: 'فرد' | 'مؤسسة' | 'شريك متضامن' | 'شريك موصي' | 'صندوق استثماري';
  sharesCount: number;
  ownershipPercent: number; // dynamically calculated: (sharesCount / totalShares) * 100
  nationality: string;
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
}

export interface SmartDocument {
  id: string;
  companyId: string;
  companyNameAr: string;
  docType: 'سجل تجاري' | 'بطاقة ضريبية' | 'رخصة تشغيل' | 'اتحاد مقاولين' | 'تأمينات اجتماعية' | 'شهادة تصنيف';
  titleAr: string;
  docNumber: string;
  issuerAr: string;
  issueDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  driveUrl: string;
  notesAr?: string;
}

export interface BranchLocation {
  id: string;
  companyId: string;
  companyNameAr: string;
  nameAr: string;
  typeAr: 'مقر رئيسي' | 'فرع إقليمي' | 'مستودع تشوين وورش' | 'مكتب موقع';
  cityAr: string;
  addressAr: string;
  managerAr: string;
  phone: string;
  staffCount: number;
  activeProjects: number;
}

export interface DepartmentOrg {
  id: string;
  nameAr: string;
  code: string;
  headAr: string;
  staffCount: number;
  subUnits: string[];
  responsibilities: string;
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

export interface BankingLimits {
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
  companyId: string;
  companyNameAr: string;
  poaNumber: string;
  notaryOfficeAr: string;
  issueDate: string;
  expiryDate: string;
  driveDocUrl: string;
  status: 'active' | 'revoked';
  bankingLimits: BankingLimits;
  contractualLimits: ContractualLimits;
  judicialLimits: JudicialLimits;
}
