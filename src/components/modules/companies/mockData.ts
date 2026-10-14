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

export const INITIAL_BRANCHES: BranchLocation[] = [
  {
    id: 'branch_hq',
    companyId: 'comp_01',
    companyNameAr: 'شركة أركان للإنشاءات الهندسية (ش.م.م)',
    nameAr: 'المقر الإداري الرئيسي (مبنى أركان بلازا)',
    typeAr: 'مقر رئيسي',
    cityAr: 'القاهرة الجديدة',
    addressAr: 'شارع التسعين الشمالي، التجمع الخامس، القاهرة',
    managerAr: 'أ. سامح عبد الفتاح',
    phone: '+20 2 2810 5000',
    staffCount: 185,
    activeProjects: 8
  },
  {
    id: 'branch_alex',
    companyId: 'comp_01',
    companyNameAr: 'شركة أركان للإنشاءات الهندسية (ش.م.م)',
    nameAr: 'فرع الإسكندرية والساحل الشمالي',
    typeAr: 'فرع إقليمي',
    cityAr: 'الإسكندرية',
    addressAr: 'طريق 14 مايو، سموحة، برج الصفوة، الإسكندرية',
    managerAr: 'م. إسلام الجندي',
    phone: '+20 3 4290 120',
    staffCount: 48,
    activeProjects: 4
  },
  {
    id: 'branch_wh',
    companyId: 'comp_01',
    companyNameAr: 'شركة أركان للإنشاءات الهندسية (ش.م.م)',
    nameAr: 'المستودع المركزي وورش التشوين الميكانيكية',
    typeAr: 'مستودع تشوين وورش',
    cityAr: 'العاشر من رمضان',
    addressAr: 'المنطقة الصناعية الثالثة (A3)، بجوار محطة المحولات',
    managerAr: 'م. عادل الشامي',
    phone: '+20 15 360 880',
    staffCount: 72,
    activeProjects: 14
  },
  {
    id: 'branch_mono',
    companyId: 'comp_04',
    companyNameAr: 'أركان لإدارة المشروعات والبنية التحتية (ش.م.م)',
    nameAr: 'مكتب موقع مشروع مونوريل شرق النيل',
    typeAr: 'مكتب موقع',
    cityAr: 'العاصمة الإدارية الجديدة',
    addressAr: 'القطاع الأوسط، محطة الحي الحكومي رقم 18',
    managerAr: 'م. شريف مدكور',
    phone: '+20 10 9940 112',
    staffCount: 95,
    activeProjects: 1
  },
  {
    id: 'branch_consult',
    companyId: 'comp_02',
    companyNameAr: 'دار الاستشارات الهندسية المتطورة (ذ.م.م)',
    nameAr: 'مقر الدراسات والتصميم الهندسي المركزي',
    typeAr: 'مقر رئيسي',
    cityAr: 'الجيزة',
    addressAr: 'شارع مصدق، الدقي، برج المهندسين، الطابق الرابع',
    managerAr: 'د.م. طارق عبد الرحمن',
    phone: '+20 2 3762 4410',
    staffCount: 60,
    activeProjects: 8
  }
];

export const INITIAL_DEPARTMENTS: DepartmentOrg[] = [
  {
    id: 'dept_csuite',
    nameAr: 'الإدارة العليا والمكتب التنفيذي',
    code: 'EXEC-01',
    headAr: 'م. أحمد مصطفى (الرئيس التنفيذي)',
    staffCount: 12,
    subUnits: ['أمانة مجلس الإدارة', 'المكتب الفني للرئيس التنفيذي', 'المراجعة الداخلية والحوكمة'],
    responsibilities: 'رسم السياسات العامة، قيادة الإستراتيجية المؤسسية، وعلاقات المستثمرين والشركاء.'
  },
  {
    id: 'dept_tech',
    nameAr: 'إدارة المكتب الفني والدراسات الهندسية',
    code: 'TECH-02',
    headAr: 'م. شريف حسني (مدير المكتب الفني)',
    staffCount: 38,
    subUnits: ['قسم حصر الكميات والمقايسات (BOQ)', 'قسم تسعير العطاءات والمناقصات', 'قسم مطابقة الرسومات التنفيذية (Shop Drawings)'],
    responsibilities: 'إعداد مقايسات المشروعات، إدارة مطالبات المستخلصات وتدقيق أوامر التغيير والمواصفات.'
  },
  {
    id: 'dept_ops',
    nameAr: 'إدارة المشروعات والعمليات الميدانية',
    code: 'PROJ-03',
    headAr: 'م. خالد النجار (مدير المشروعات)',
    staffCount: 220,
    subUnits: ['إدارة مواقع القاهرة الكبرى', 'إدارة مشروعات الوجه البحري والساحل', 'مراقبة الجودة والسلامة المهنية (HSE)'],
    responsibilities: 'تنفيذ المشروعات التعاقدية وفق الجدول الزمني، وإدارة مقاولي الباطن والفرق الميدانية.'
  },
  {
    id: 'dept_fin',
    nameAr: 'الإدارة المالية والحسابات العامة',
    code: 'FIN-04',
    headAr: 'أ. كمال إبراهيم الشناوي (المدير المالي)',
    staffCount: 26,
    subUnits: ['قسم حسابات المقاولين والموردين', 'قسم المقبوضات وتدقيق المستخلصات', 'قسم الخزينة والعلاقات المصرفية'],
    responsibilities: 'إدارة التدفقات النقدية، إعداد الموازنات التقديرية، التنسيق المصرفي وإصدار خطابات الضمان.'
  },
  {
    id: 'dept_hr',
    nameAr: 'الموارد البشرية والخدمات الإدارية',
    code: 'HR-05',
    headAr: 'أ. هاني فريد (مدير الموارد البشرية)',
    staffCount: 18,
    subUnits: ['قسم التوظيف وإدارة المواهب', 'قسم شؤون العاملين والرواتب (Payroll)', 'قسم الخدمات اللوجستية والحركة'],
    responsibilities: 'إدارة الكادر البشري، التأمينات والعلاقات العمالية، وتنظيم وتأمين المقرات والفروع.'
  },
  {
    id: 'dept_legal',
    nameAr: 'إدارة الشؤون القانونية والعقود',
    code: 'LEGAL-06',
    headAr: 'المستشار / رأفت عبد العال (المستشار القانوني)',
    staffCount: 14,
    subUnits: ['قسم صياغة ومراجعة العقود الهندسية', 'قسم التمثيل القضائي والمنازعات', 'قسم السجلات والتراخيص والتوكيلات'],
    responsibilities: 'صياغة العقود مع جهات الإسناد والمقاولين، تمثيل الشركات أمام القضاء، ومتابعة السجلات الرسمية.'
  }
];

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
