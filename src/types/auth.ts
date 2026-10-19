export type UserRole =
  | 'SUPER_ADMIN'
  | 'FINANCE_OFFICER'
  | 'HR_MANAGER'
  | 'HR_SPECIALIST'
  | 'PROJECTS_ENGINEER'
  | 'LEGAL_COUNSEL'
  | 'RECEPTION_SECURITY';

// ==============================================================================
// Granular Permission Keys Schema for Company Management (إدارة الشركات)
// ==============================================================================
export const ALL_COMPANY_PERMISSIONS = [
  // 1. دليل الشركات
  'companies.directory.view',
  'companies.directory.create',
  'companies.directory.edit',
  'companies.directory.toggle_status',
  'companies.directory.view_docs',
  'companies.directory.view_audit',
  'companies.directory.delete',

  // 2. السجلات والتراخيص
  'companies.licenses.view',
  'companies.licenses.create',
  'companies.licenses.edit',
  'companies.licenses.download',
  'companies.licenses.view_audit',
  'companies.licenses.delete',

  // 3. الفروع والمواقع
  'companies.branches.view',
  'companies.branches.create',
  'companies.branches.edit',
  'companies.branches.view_audit',
  'companies.branches.delete',

  // 4. الهيكل ومراكز التكلفة
  'companies.org.view',
  'companies.org.create',
  'companies.org.edit',
  'companies.org.view_audit',
  'companies.org.delete',

  // 5. المفوضون والصلاحيات
  'companies.signatories.view',
  'companies.signatories.create',
  'companies.signatories.edit',
  'companies.signatories.download_poa',
  'companies.signatories.view_audit',
  'companies.signatories.delete',
] as const;

export type CompanyPermissionKey = (typeof ALL_COMPANY_PERMISSIONS)[number];

export interface SubModulePermissionDef {
  id: string;
  tabKey: string;
  titleAr: string;
  descriptionAr: string;
  view: CompanyPermissionKey;
  create: CompanyPermissionKey;
  edit: CompanyPermissionKey;
  special: {
    key: CompanyPermissionKey;
    labelAr: string;
  };
  audit: CompanyPermissionKey;
  delete: CompanyPermissionKey;
}

export const COMPANY_SUBMODULE_PERMISSIONS: SubModulePermissionDef[] = [
  {
    id: 'directory',
    tabKey: 'comp_directory',
    titleAr: 'دليل الشركات',
    descriptionAr: 'بيانات الشركات والكيانات القانونية وهيكل المساهمين ورؤوس الأموال',
    view: 'companies.directory.view',
    create: 'companies.directory.create',
    edit: 'companies.directory.edit',
    special: { key: 'companies.directory.toggle_status', labelAr: 'تغيير الحالة والمستندات' },
    audit: 'companies.directory.view_audit',
    delete: 'companies.directory.delete',
  },
  {
    id: 'licenses',
    tabKey: 'comp_licenses',
    titleAr: 'السجلات والتراخيص',
    descriptionAr: 'السجل التجاري والبطاقة الضريبية والتأمينات والوثائق ومواعيد التجديد',
    view: 'companies.licenses.view',
    create: 'companies.licenses.create',
    edit: 'companies.licenses.edit',
    special: { key: 'companies.licenses.download', labelAr: 'معاينة وتحميل المرفقات' },
    audit: 'companies.licenses.view_audit',
    delete: 'companies.licenses.delete',
  },
  {
    id: 'branches',
    tabKey: 'comp_branches',
    titleAr: 'الفروع والمواقع',
    descriptionAr: 'المقرات الإدارية، المستودعات، الورش ومواقع المشروعات الميدانية',
    view: 'companies.branches.view',
    create: 'companies.branches.create',
    edit: 'companies.branches.edit',
    special: { key: 'companies.branches.view', labelAr: 'إدارة الموقع' },
    audit: 'companies.branches.view_audit',
    delete: 'companies.branches.delete',
  },
  {
    id: 'org_structure',
    tabKey: 'comp_structure',
    titleAr: 'الهيكل ومراكز التكلفة',
    descriptionAr: 'الشجرة الهرمية للإدارات والأقسام وربط مراكز التكلفة والمسؤوليات',
    view: 'companies.org.view',
    create: 'companies.org.create',
    edit: 'companies.org.edit',
    special: { key: 'companies.org.view', labelAr: 'تعديل التبعية' },
    audit: 'companies.org.view_audit',
    delete: 'companies.org.delete',
  },
  {
    id: 'signatories',
    tabKey: 'comp_signatories',
    titleAr: 'المفوضون والصلاحيات',
    descriptionAr: 'التوكيلات الرسمية بالشهر العقاري وأسقف التوقيع البنكية والتعاقدية',
    view: 'companies.signatories.view',
    create: 'companies.signatories.create',
    edit: 'companies.signatories.edit',
    special: { key: 'companies.signatories.download_poa', labelAr: 'تحميل ملف التوكيل' },
    audit: 'companies.signatories.view_audit',
    delete: 'companies.signatories.delete',
  },
];

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  nameAr: string;
  nameEn: string;
  jobTitleAr?: string;
  jobTitleEn?: string;
  phone?: string;
  role: UserRole;
  roleLabelAr: string;
  roleLabelEn: string;
  departmentAr: string;
  departmentEn: string;
  clearanceLevel: 1 | 2 | 3 | 4;
  clearanceNameAr: string;
  clearanceNameEn: string;
  avatarUrl?: string;
  allowedModuleIds: string[];
  allowedCompanyIds?: string[];
  permissions?: string[];
  lastLogin?: string;
}

export interface RoleConfig {
  role: UserRole;
  titleAr: string;
  titleEn: string;
  badgeAr: string;
  badgeEn: string;
  clearanceLevel: 1 | 2 | 3 | 4;
  clearanceNameAr: string;
  clearanceNameEn: string;
  departmentAr: string;
  departmentEn: string;
  allowedModuleIds: string[];
  descriptionAr: string;
  descriptionEn: string;
}

export const ROLE_CONFIGURATIONS: Record<UserRole, RoleConfig> = {
  SUPER_ADMIN: {
    role: 'SUPER_ADMIN',
    titleAr: 'مدير النظام العام / رئيس مجلس الإدارة',
    titleEn: 'System Administrator / CEO',
    badgeAr: 'C-Suite',
    badgeEn: 'C-Suite',
    clearanceLevel: 4,
    clearanceNameAr: 'إدارة عليا وحوكمة',
    clearanceNameEn: 'C-Suite Governance',
    departmentAr: 'الإدارة العليا والاستراتيجية',
    departmentEn: 'Executive Management & Strategy',
    allowedModuleIds: [
      'executive',
      'companies',
      'finance',
      'hr',
      'engineering',
      'cts',
      'legal',
      'insurance',
      'ats',
      'decrees',
      'reception',
      'settings',
    ],
    descriptionAr: 'صلاحيات حوكمة كاملة غير مقيدة على كافة المنظومات والشركات التابعة.',
    descriptionEn: 'Full unconstrained platform governance across all modules & entities.',
  },
  FINANCE_OFFICER: {
    role: 'FINANCE_OFFICER',
    titleAr: 'المدير المالي التنفيذي',
    titleEn: 'Chief Financial Officer (Finance)',
    badgeAr: 'مالية',
    badgeEn: 'Finance',
    clearanceLevel: 3,
    clearanceNameAr: 'المستوى 3 - شؤون مالية',
    clearanceNameEn: 'Level 3 - Financial Management',
    departmentAr: 'الشؤون المالية والخزينة',
    departmentEn: 'Financial Affairs & Treasury',
    allowedModuleIds: [
      'finance',
      'companies',
      'decrees',
    ],
    descriptionAr: 'إدارة الأستاذ العام، سندات الصرف والقبض، الخزينة، الشيكات والفوترة المرتبطة بـ SQL Server.',
    descriptionEn: 'Direct financial ledger, vouchers, treasury, cheques & SQL Server bridge access.',
  },
  HR_MANAGER: {
    role: 'HR_MANAGER',
    titleAr: 'مدير الموارد البشرية',
    titleEn: 'Human Resources Director (HRMS)',
    badgeAr: 'HRMS',
    badgeEn: 'HRMS',
    clearanceLevel: 3,
    clearanceNameAr: 'المستوى 3 - إدارة الموارد البشرية',
    clearanceNameEn: 'Level 3 - HR Management',
    departmentAr: 'إدارة الموارد البشرية والرواتب',
    departmentEn: 'HR & Talent Management',
    allowedModuleIds: [
      'hr',
      'ats',
      'insurance',
      'companies',
      'decrees',
    ],
    descriptionAr: 'إدارة شؤون الموظفين، مسيرات الرواتب، التعيينات، الإجازات والتأمينات الاجتماعية.',
    descriptionEn: 'Employee dossiers, payroll ledger, talent acquisition & social insurance.',
  },
  HR_SPECIALIST: {
    role: 'HR_SPECIALIST',
    titleAr: 'أخصائي شؤون العاملين',
    titleEn: 'HR Specialist',
    badgeAr: 'HRMS',
    badgeEn: 'HRMS',
    clearanceLevel: 2,
    clearanceNameAr: 'المستوى 2 - شؤون عاملين',
    clearanceNameEn: 'Level 2 - HR Operations',
    departmentAr: 'إدارة الموارد البشرية',
    departmentEn: 'Human Resources',
    allowedModuleIds: [
      'hr',
      'insurance',
      'decrees',
    ],
    descriptionAr: 'متابعة الحضور والانصراف، سجلات الإجازات وملفات العاملين ونواقص المستندات.',
    descriptionEn: 'Attendance logs, time-off balances & document compliance.',
  },
  PROJECTS_ENGINEER: {
    role: 'PROJECTS_ENGINEER',
    titleAr: 'مدير المكتب الفني والمشاريع',
    titleEn: 'Technical Office Director',
    badgeAr: 'مشاريع',
    badgeEn: 'Projects',
    clearanceLevel: 3,
    clearanceNameAr: 'المستوى 3 - المكتب الفني',
    clearanceNameEn: 'Level 3 - Technical Office',
    departmentAr: 'المكتب الفني وإدارة المشاريع',
    departmentEn: 'Technical Office & Engineering',
    allowedModuleIds: [
      'engineering',
      'companies',
      'decrees',
    ],
    descriptionAr: 'متابعة المشاريع الهندسية، المستخلصات الفنية، مقاولي الباطن والجدول الزمني.',
    descriptionEn: 'Engineering project registry, IPC payment certificates & contractor contracts.',
  },
  LEGAL_COUNSEL: {
    role: 'LEGAL_COUNSEL',
    titleAr: 'المستشار القانوني العام',
    titleEn: 'General Legal Counsel',
    badgeAr: 'قانونية',
    badgeEn: 'Legal',
    clearanceLevel: 3,
    clearanceNameAr: 'المستوى 3 - الشؤون القانونية',
    clearanceNameEn: 'Level 3 - Legal Affairs',
    departmentAr: 'الشؤون القانونية والتوثيق',
    departmentEn: 'Legal Affairs & Compliance',
    allowedModuleIds: [
      'legal',
      'companies',
      'decrees',
    ],
    descriptionAr: 'صياغة واعتماد العقود، إدارة النزاعات والقضايا، التوكيلات والاستشارات القانونية.',
    descriptionEn: 'Corporate contracts, litigation cases, powers of attorney & advisory notes.',
  },
  RECEPTION_SECURITY: {
    role: 'RECEPTION_SECURITY',
    titleAr: 'مسؤول الاستقبال والأمن المؤسسي',
    titleEn: 'Front Desk & Security Officer',
    badgeAr: 'استقبال',
    badgeEn: 'Reception',
    clearanceLevel: 2,
    clearanceNameAr: 'المستوى 2 - الاستقبال والأمن',
    clearanceNameEn: 'Level 2 - Front Desk & Security',
    departmentAr: 'الاستقبال والخدمات الإدارية',
    departmentEn: 'Front Desk & Administrative Services',
    allowedModuleIds: [
      'reception',
      'cts',
      'decrees',
    ],
    descriptionAr: 'تسجيل الزوار الرقمي، إدارة قاعات الاجتماعات، تصاريح المقاولين وسجل الصادر والوارد.',
    descriptionEn: 'Digital visitor check-in, meeting rooms, courier logs & correspondence log.',
  },
};

export interface ManagedUser {
  id: string;
  nameAr: string;
  nameEn: string;
  nationalId: string;
  email: string;
  username: string;
  jobTitleAr?: string;
  jobTitleEn?: string;
  phone?: string;
  departmentAr: string;
  departmentEn: string;
  departmentId: string;
  role: UserRole;
  roleLabelAr: string;
  roleLabelEn: string;
  clearanceLevel: 1 | 2 | 3 | 4;
  clearanceNameAr: string;
  clearanceNameEn: string;
  status: 'ACTIVE' | 'SUSPENDED';
  passwordHash: string;
  createdAt: string;
  lastLogin?: string;
  customPermissions?: string[];
  permissions?: string[];
  allowedCompanyIds?: string[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  actionAr: string;
  actionEn: string;
  category: 'AUTH' | 'USER_MGMT' | 'RBAC' | 'SECURITY';
  detailsAr: string;
  detailsEn: string;
  ipAddress?: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export const INITIAL_ROOT_ADMIN: ManagedUser = {
  id: 'usr_root_csuite_01',
  nameAr: 'يوسف حجازي',
  nameEn: 'Yousef Hegazy',
  nationalId: '',
  email: 'admin@hrsup.com',
  username: 'admin',
  jobTitleAr: 'مدير النظام العام / رئيس مجلس الإدارة',
  jobTitleEn: 'System Administrator / CEO',
  phone: '+20 100 000 0000',
  departmentAr: 'الإدارة العليا والاستراتيجية',
  departmentEn: 'Executive Management & Strategy',
  departmentId: 'executive',
  role: 'SUPER_ADMIN',
  roleLabelAr: 'مدير النظام العام / رئيس مجلس الإدارة',
  roleLabelEn: 'System Administrator / CEO',
  clearanceLevel: 4,
  clearanceNameAr: 'إدارة عليا وحوكمة',
  clearanceNameEn: 'C-Suite Governance',
  status: 'ACTIVE',
  passwordHash: 'admin123',
  createdAt: '2026-01-01',
  lastLogin: '2026-10-10 08:30',
  customPermissions: [...ALL_COMPANY_PERMISSIONS],
  permissions: [...ALL_COMPANY_PERMISSIONS],
  allowedCompanyIds: ['all'],
};

export const INITIAL_TAGHREED_USER: ManagedUser = {
  id: 'usr_hr_taghreed_01',
  nameAr: 'تغريد عاطف',
  nameEn: 'Taghreed Atef',
  nationalId: '',
  email: 'taghreed@hrsup.com',
  username: 'taghreed',
  jobTitleAr: 'مدير الموارد البشرية',
  jobTitleEn: 'HR Director',
  phone: '+20 100 000 0001',
  departmentAr: 'إدارة الموارد البشرية والرواتب',
  departmentEn: 'HR & Talent Management',
  departmentId: 'dept_hr',
  role: 'HR_MANAGER',
  roleLabelAr: 'مدير الموارد البشرية',
  roleLabelEn: 'Human Resources Director',
  clearanceLevel: 3,
  clearanceNameAr: 'المستوى 3 - إدارة الموارد البشرية',
  clearanceNameEn: 'Level 3 - HR Management',
  status: 'ACTIVE',
  passwordHash: 'admin123',
  createdAt: '2026-01-01',
  lastLogin: '2026-10-10 08:30',
  customPermissions: ['hr.*', 'insurance.*', 'ats.*', 'decrees.*', 'companies.directory.view', 'companies.licenses.view'],
  permissions: ['hr.*', 'insurance.*', 'ats.*', 'decrees.*', 'companies.directory.view', 'companies.licenses.view'],
  allowedCompanyIds: ['comp_01'],
};

export interface SeedAccount {
  user: AuthUser;
  passwordHash: string; // Plaintext or token verification for local seed
}

export const PRECONFIGURED_SEED_USERS: SeedAccount[] = [
  {
    user: {
      id: INITIAL_ROOT_ADMIN.id,
      email: INITIAL_ROOT_ADMIN.email,
      username: INITIAL_ROOT_ADMIN.username,
      nameAr: INITIAL_ROOT_ADMIN.nameAr,
      nameEn: INITIAL_ROOT_ADMIN.nameEn,
      jobTitleAr: INITIAL_ROOT_ADMIN.jobTitleAr,
      jobTitleEn: INITIAL_ROOT_ADMIN.jobTitleEn,
      phone: INITIAL_ROOT_ADMIN.phone,
      role: INITIAL_ROOT_ADMIN.role,
      roleLabelAr: INITIAL_ROOT_ADMIN.roleLabelAr,
      roleLabelEn: INITIAL_ROOT_ADMIN.roleLabelEn,
      departmentAr: INITIAL_ROOT_ADMIN.departmentAr,
      departmentEn: INITIAL_ROOT_ADMIN.departmentEn,
      clearanceLevel: INITIAL_ROOT_ADMIN.clearanceLevel,
      clearanceNameAr: INITIAL_ROOT_ADMIN.clearanceNameAr,
      clearanceNameEn: INITIAL_ROOT_ADMIN.clearanceNameEn,
      avatarUrl: '',
      allowedModuleIds: ROLE_CONFIGURATIONS.SUPER_ADMIN.allowedModuleIds,
      allowedCompanyIds: ['all'],
      permissions: [...ALL_COMPANY_PERMISSIONS],
      lastLogin: '2026-10-10 08:30',
    },
    passwordHash: INITIAL_ROOT_ADMIN.passwordHash,
  },
  {
    user: {
      id: INITIAL_TAGHREED_USER.id,
      email: INITIAL_TAGHREED_USER.email,
      username: INITIAL_TAGHREED_USER.username,
      nameAr: INITIAL_TAGHREED_USER.nameAr,
      nameEn: INITIAL_TAGHREED_USER.nameEn,
      jobTitleAr: INITIAL_TAGHREED_USER.jobTitleAr,
      jobTitleEn: INITIAL_TAGHREED_USER.jobTitleEn,
      phone: INITIAL_TAGHREED_USER.phone,
      role: INITIAL_TAGHREED_USER.role,
      roleLabelAr: INITIAL_TAGHREED_USER.roleLabelAr,
      roleLabelEn: INITIAL_TAGHREED_USER.roleLabelEn,
      departmentAr: INITIAL_TAGHREED_USER.departmentAr,
      departmentEn: INITIAL_TAGHREED_USER.departmentEn,
      clearanceLevel: INITIAL_TAGHREED_USER.clearanceLevel,
      clearanceNameAr: INITIAL_TAGHREED_USER.clearanceNameAr,
      clearanceNameEn: INITIAL_TAGHREED_USER.clearanceNameEn,
      avatarUrl: '',
      allowedModuleIds: ['hr', 'ats', 'insurance', 'companies', 'decrees'],
      allowedCompanyIds: ['comp_01'],
      permissions: ['hr.*', 'insurance.*', 'ats.*', 'decrees.*', 'companies.directory.view', 'companies.licenses.view'],
      lastLogin: '2026-10-10 08:30',
    },
    passwordHash: 'admin123',
  },
];

