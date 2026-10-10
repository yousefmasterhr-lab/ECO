export type UserRole =
  | 'SUPER_ADMIN'
  | 'FINANCE_OFFICER'
  | 'HR_MANAGER'
  | 'HR_SPECIALIST'
  | 'PROJECTS_ENGINEER'
  | 'LEGAL_COUNSEL'
  | 'RECEPTION_SECURITY';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  nameAr: string;
  nameEn: string;
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
    titleAr: 'الرئيس التنفيذي للعمليات (الإدارة العليا)',
    titleEn: 'Chief Operating Officer (C-Suite)',
    badgeAr: 'C-Suite',
    badgeEn: 'C-Suite',
    clearanceLevel: 4,
    clearanceNameAr: 'المستوى 4 - إدارة عليا',
    clearanceNameEn: 'Level 4 - C-Suite Governance',
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
    titleAr: 'المدير المالي التنفيذي (الشؤون المالية)',
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
    titleAr: 'مدير الموارد البشرية (HRMS)',
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
    titleAr: 'أخصائي شؤون العاملين (HRMS)',
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

export interface SeedAccount {
  user: AuthUser;
  passwordHash: string; // Plaintext or token verification for local seed
}

export const PRECONFIGURED_SEED_USERS: SeedAccount[] = [
  {
    user: {
      id: 'usr_csuite_01',
      email: 'admin@hrsup.com',
      username: 'admin',
      nameAr: 'م. أحمد مصطفى',
      nameEn: 'Eng. Ahmed Mostafa',
      role: 'SUPER_ADMIN',
      roleLabelAr: 'الرئيس التنفيذي للعمليات (COO)',
      roleLabelEn: 'Chief Operating Officer (COO)',
      departmentAr: 'الإدارة العليا والاستراتيجية',
      departmentEn: 'Executive Management',
      clearanceLevel: 4,
      clearanceNameAr: 'المستوى 4 - إدارة عليا',
      clearanceNameEn: 'Level 4 - C-Suite Governance',
      avatarUrl: '',
      allowedModuleIds: ROLE_CONFIGURATIONS.SUPER_ADMIN.allowedModuleIds,
      lastLogin: '2026-10-10 08:30',
    },
    passwordHash: 'admin123',
  },
  {
    user: {
      id: 'usr_finance_01',
      email: 'finance@hrsup.com',
      username: 'finance',
      nameAr: 'أ. إبراهيم خليل',
      nameEn: 'Mr. Ibrahim Khalil',
      role: 'FINANCE_OFFICER',
      roleLabelAr: 'المدير المالي التنفيذي (CFO)',
      roleLabelEn: 'Chief Financial Officer (CFO)',
      departmentAr: 'الشؤون المالية والخزينة',
      departmentEn: 'Financial Affairs',
      clearanceLevel: 3,
      clearanceNameAr: 'المستوى 3 - شؤون مالية',
      clearanceNameEn: 'Level 3 - Financial Management',
      avatarUrl: '',
      allowedModuleIds: ROLE_CONFIGURATIONS.FINANCE_OFFICER.allowedModuleIds,
      lastLogin: '2026-10-10 09:15',
    },
    passwordHash: 'finance123',
  },
  {
    user: {
      id: 'usr_hr_01',
      email: 'hr@hrsup.com',
      username: 'hr',
      nameAr: 'أ. دينا محمود الشناوي',
      nameEn: 'Mrs. Dina El-Shennawy',
      role: 'HR_MANAGER',
      roleLabelAr: 'مدير الموارد البشرية (HR Director)',
      roleLabelEn: 'HR Director',
      departmentAr: 'إدارة الموارد البشرية',
      departmentEn: 'Human Resources',
      clearanceLevel: 3,
      clearanceNameAr: 'المستوى 3 - إدارة الموارد البشرية',
      clearanceNameEn: 'Level 3 - HR Director',
      avatarUrl: '',
      allowedModuleIds: ROLE_CONFIGURATIONS.HR_MANAGER.allowedModuleIds,
      lastLogin: '2026-10-10 08:45',
    },
    passwordHash: 'hr123',
  },
  {
    user: {
      id: 'usr_eng_01',
      email: 'engineer@hrsup.com',
      username: 'engineer',
      nameAr: 'م. طارق مصطفى سالم',
      nameEn: 'Eng. Tarek Salem',
      role: 'PROJECTS_ENGINEER',
      roleLabelAr: 'مدير المكتب الفني والمشاريع',
      roleLabelEn: 'Technical Office Director',
      departmentAr: 'المكتب الفني',
      departmentEn: 'Technical Office',
      clearanceLevel: 3,
      clearanceNameAr: 'المستوى 3 - المكتب الفني',
      clearanceNameEn: 'Level 3 - Technical Office',
      avatarUrl: '',
      allowedModuleIds: ROLE_CONFIGURATIONS.PROJECTS_ENGINEER.allowedModuleIds,
      lastLogin: '2026-10-09 16:20',
    },
    passwordHash: 'eng123',
  },
  {
    user: {
      id: 'usr_legal_01',
      email: 'legal@hrsup.com',
      username: 'legal',
      nameAr: 'المستشار. فاروق الدسوقي',
      nameEn: 'Counsellor Farouk El-Desouky',
      role: 'LEGAL_COUNSEL',
      roleLabelAr: 'المستشار القانوني العام',
      roleLabelEn: 'General Legal Counsel',
      departmentAr: 'الشؤون القانونية',
      departmentEn: 'Legal Affairs',
      clearanceLevel: 3,
      clearanceNameAr: 'المستوى 3 - الشؤون القانونية',
      clearanceNameEn: 'Level 3 - Legal Affairs',
      avatarUrl: '',
      allowedModuleIds: ROLE_CONFIGURATIONS.LEGAL_COUNSEL.allowedModuleIds,
      lastLogin: '2026-10-08 14:10',
    },
    passwordHash: 'legal123',
  },
  {
    user: {
      id: 'usr_sec_01',
      email: 'security@hrsup.com',
      username: 'security',
      nameAr: 'أ. عادل عبد السلام',
      nameEn: 'Adel Abdel-Salam',
      role: 'RECEPTION_SECURITY',
      roleLabelAr: 'مسؤول الاستقبال والأمن',
      roleLabelEn: 'Front Desk & Security Officer',
      departmentAr: 'الاستقبال والخدمات الإدارية',
      departmentEn: 'Front Desk & Security',
      clearanceLevel: 2,
      clearanceNameAr: 'المستوى 2 - الاستقبال والأمن',
      clearanceNameEn: 'Level 2 - Reception & Security',
      avatarUrl: '',
      allowedModuleIds: ROLE_CONFIGURATIONS.RECEPTION_SECURITY.allowedModuleIds,
      lastLogin: '2026-10-10 07:50',
    },
    passwordHash: 'security123',
  },
];

export interface ManagedUser {
  id: string;
  nameAr: string;
  nameEn: string;
  nationalId: string;
  email: string;
  username: string;
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
  id: 'usr_root_csuite',
  nameAr: 'م. أحمد مصطفى',
  nameEn: 'Eng. Ahmed Mostafa',
  nationalId: '28501010102345',
  email: 'admin@hrsup.com',
  username: 'admin',
  departmentAr: 'الإدارة العليا والاستراتيجية',
  departmentEn: 'Executive Management & Strategy',
  departmentId: 'executive',
  role: 'SUPER_ADMIN',
  roleLabelAr: 'الرئيس التنفيذي للعمليات (COO)',
  roleLabelEn: 'Chief Operating Officer (COO)',
  clearanceLevel: 4,
  clearanceNameAr: 'المستوى 4 - إدارة عليا',
  clearanceNameEn: 'Level 4 - C-Suite Governance',
  status: 'ACTIVE',
  passwordHash: 'admin123',
  createdAt: '2026-01-01',
  lastLogin: '2026-10-10 08:30',
  customPermissions: [],
};

