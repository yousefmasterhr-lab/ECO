import {
  CompanyEntity,
  SmartDocument,
  BranchLocation,
  DepartmentOrg,
  CostCenter,
  AuthorizedSignatory
} from './types';

export const INITIAL_COMPANIES: CompanyEntity[] = [];

export const INITIAL_DOCUMENTS: SmartDocument[] = [];

export const INITIAL_BRANCHES: BranchLocation[] = [];

export const INITIAL_DEPARTMENTS: DepartmentOrg[] = [];

export const INITIAL_COST_CENTERS: CostCenter[] = [
  {
    id: 'cc_101',
    code: 'CC-101',
    nameAr: 'الإدارة العامة والمصروفات المشتركة',
    companyId: 'comp_01',
    companyNameAr: 'شركة أركان للإنشاءات الهندسية (ش.م.م)',
    typeAr: 'إداري',
    budget: 35000000,
    spent: 22400000,
    financialOfficerAr: 'أ. كمال إبراهيم الشناوي'
  },
  {
    id: 'cc_201',
    code: 'CC-201',
    nameAr: 'مشروع مونوريل العاصمة الإدارية (قطاع 4)',
    companyId: 'comp_04',
    companyNameAr: 'أركان لإدارة المشروعات والبنية التحتية (ش.م.م)',
    typeAr: 'مشروع إنشائي',
    budget: 180000000,
    spent: 142500000,
    financialOfficerAr: 'أ. حسام فوزي'
  },
  {
    id: 'cc_202',
    code: 'CC-202',
    nameAr: 'مجمع الأبراج السكنية - العلمين الجديدة',
    companyId: 'comp_01',
    companyNameAr: 'شركة أركان للإنشاءات الهندسية (ش.م.م)',
    typeAr: 'مشروع إنشائي',
    budget: 95000000,
    spent: 61800000,
    financialOfficerAr: 'أ. طارق رضوان'
  },
  {
    id: 'cc_301',
    code: 'CC-301',
    nameAr: 'إدارة المكتب الفني وتطوير التصاميم',
    companyId: 'comp_02',
    companyNameAr: 'دار الاستشارات الهندسية المتطورة (ذ.م.م)',
    typeAr: 'تشغيلي',
    budget: 18000000,
    spent: 12100000,
    financialOfficerAr: 'أ. نادر سليم'
  },
  {
    id: 'cc_401',
    code: 'CC-401',
    nameAr: 'المستودع المركزي وصيانة المعدات الثقيلة',
    companyId: 'comp_01',
    companyNameAr: 'شركة أركان للإنشاءات الهندسية (ش.م.م)',
    typeAr: 'تشغيلي',
    budget: 28000000,
    spent: 19600000,
    financialOfficerAr: 'أ. محمود عبد الهادي'
  }
];

export const INITIAL_SIGNATORIES: AuthorizedSignatory[] = [
  {
    id: 'sig_01',
    nameAr: 'م. أحمد مصطفى إبراهيم',
    roleAr: 'رئيس مجلس الإدارة والرئيس التنفيذي',
    companyId: 'comp_01',
    companyNameAr: 'شركة أركان للإنشاءات الهندسية (ش.م.م)',
    poaNumber: 'توكيل عام رسمي رقم 1422 لسنة 2023 - مكتب توثيق الأهرام النموذجي',
    notaryOfficeAr: 'مكتب توثيق الأهرام النموذجي - الجيزة',
    issueDate: '2023-02-15',
    expiryDate: '2028-02-14',
    driveDocUrl: 'https://drive.google.com/file/d/demo-poa-ceo',
    status: 'active',
    bankingLimits: {
      singleLimit: 15000000,
      jointLimit: 0, // 0 = بدون حد أقصى
      allowLettersOfGuarantee: true,
      allowLettersOfCredit: true,
      allowOpenAccounts: true,
      notesAr: 'صلاحية توقيع منفرد حتى 15 مليون جنيه، وبدون حد أقصى بالتوقيع المشترك'
    },
    contractualLimits: {
      allowContracts: true,
      allowTenders: true,
      allowAssetTrade: true,
      notesAr: 'توقيع عقود المقاولات العامة والتحالفات الاستراتيجية ودخول المزادات والمناقصات'
    },
    judicialLimits: {
      allowCourtRepresentation: true,
      allowGovRepresentation: true,
      allowDisputeResolution: true,
      notesAr: 'التمثيل الشامل أمام كافة درجات التقاضي وهيئات التحكيم والجهات الحكومية'
    }
  },
  {
    id: 'sig_02',
    nameAr: 'أ. كمال إبراهيم الشناوي',
    roleAr: 'المدير المالي العام للمجموعة',
    companyId: 'comp_01',
    companyNameAr: 'شركة أركان للإنشاءات الهندسية (ش.م.م)',
    poaNumber: 'توكيل خاص مصرفي رقم 981 لسنة 2025 - مكتب توثيق قصر النيل',
    notaryOfficeAr: 'مكتب توثيق قصر النيل - القاهرة',
    issueDate: '2025-10-15',
    expiryDate: '2026-10-14', // ~21 days remaining (Urgent renewal!)
    driveDocUrl: 'https://drive.google.com/file/d/demo-poa-cfo',
    status: 'active',
    bankingLimits: {
      singleLimit: 3000000,
      jointLimit: 25000000,
      allowLettersOfGuarantee: true,
      allowLettersOfCredit: true,
      allowOpenAccounts: false,
      notesAr: 'توقيع شيكات وتحويلات منفرد حتى 3 مليون جنيه، ومشترك حتى 25 مليون جنيه'
    },
    contractualLimits: {
      allowContracts: false,
      allowTenders: false,
      allowAssetTrade: false,
      notesAr: 'التفويض مقصور على المعاملات المالية والمصرفية والضريبية'
    },
    judicialLimits: {
      allowCourtRepresentation: false,
      allowGovRepresentation: true,
      allowDisputeResolution: false,
      notesAr: 'التمثيل أمام مصلحة الضرائب والجمارك والتأمينات الاجتماعية فقط'
    }
  },
  {
    id: 'sig_03',
    nameAr: 'المستشار / رأفت عبد العال',
    roleAr: 'المستشار القانوني ومدير الإدارة القانونية',
    companyId: 'comp_01',
    companyNameAr: 'شركة أركان للإنشاءات الهندسية (ش.م.م)',
    poaNumber: 'توكيل قضايا وتمثيل رسمي رقم 4402 لسنة 2022 - مكتب توثيق مدينة نصر',
    notaryOfficeAr: 'مكتب توثيق مدينة نصر أول - القاهرة',
    issueDate: '2022-08-01',
    expiryDate: '2026-07-31', // Expired!
    driveDocUrl: 'https://drive.google.com/file/d/demo-poa-legal',
    status: 'active',
    bankingLimits: {
      singleLimit: 0,
      jointLimit: 0,
      allowLettersOfGuarantee: false,
      allowLettersOfCredit: false,
      allowOpenAccounts: false,
      notesAr: 'غير مفوض مصرفياً بالتعامل على الحسابات أو الشيكات'
    },
    contractualLimits: {
      allowContracts: true,
      allowTenders: false,
      allowAssetTrade: false,
      notesAr: 'توثيق وتصديق العقود والاتفاقيات لدى الشهر العقاري والغرف التجارية'
    },
    judicialLimits: {
      allowCourtRepresentation: true,
      allowGovRepresentation: true,
      allowDisputeResolution: true,
      notesAr: 'المرافعة وتمثيل الشركة أمام كافة المحاكم ومكاتب الخبراء وهيئات التحكيم'
    }
  }
];
