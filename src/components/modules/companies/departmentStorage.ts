import { DepartmentOrg, DepartmentAuditLogEntry, DepartmentAuditChange } from './types';

const STORAGE_KEY = 'eco_company_departments_v2';

/**
 * Field Labels mapping in Arabic for department audit diff presentation
 */
export const DEPARTMENT_FIELD_LABELS: Record<string, string> = {
  nameAr: 'اسم الإدارة / القسم',
  code: 'كود الإدارة',
  headAr: 'المدير المسؤول',
  staffCount: 'عدد الموظفين',
  responsibilities: 'المهام والاختصاصات',
  costCenterCode: 'مركز التكلفة المرتبط',
  parentId: 'الإدارة الرئيسية التابعة لها',
  branchNameAr: 'الفرع / الموقع التابع له',
  titleEn: 'المسمى الوظيفي بالإنجليزية',
  level: 'المستوى الهيكلي'
};

/**
 * Returns formatted local timestamp with exact seconds
 */
export function getFormattedAuditTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Computes deterministic depth levels (0 = Root, 1 = Executive, 2 = Sub-dept, 3 = Tasks)
 */
export function computeHierarchyLevels(departments: DepartmentOrg[]): DepartmentOrg[] {
  const map = new Map<string, DepartmentOrg>();
  departments.forEach(d => map.set(d.id, d));

  const getLevel = (dept: DepartmentOrg, visited = new Set<string>()): number => {
    if (dept.level !== undefined && dept.level !== null && !isNaN(Number(dept.level))) {
      return Number(dept.level);
    }
    if (!dept.parentId || !map.has(dept.parentId) || visited.has(dept.id)) {
      return 0;
    }
    visited.add(dept.id);
    const parent = map.get(dept.parentId)!;
    return getLevel(parent, visited) + 1;
  };

  return departments.map(d => ({
    ...d,
    level: d.level !== undefined && d.level !== null ? Number(d.level) : getLevel(d)
  }));
}

/**
 * In-memory & database deduplication engine for departments.
 * Keeps exactly ONE canonical record per (companyId + nameAr), preferring valid parents & cost centers.
 */
export function deduplicateDepartments(departments: DepartmentOrg[]): DepartmentOrg[] {
  if (!departments || departments.length === 0) return [];

  const groups = new Map<string, DepartmentOrg[]>();
  departments.forEach(dept => {
    const key = `${dept.companyId || 'comp_default'}::${(dept.nameAr || '').trim()}`;
    const arr = groups.get(key) || [];
    arr.push(dept);
    groups.set(key, arr);
  });

  const canonical: DepartmentOrg[] = [];
  const oldIdToCanonical = new Map<string, string>();

  groups.forEach(group => {
    // Score based on richness of information
    group.sort((a, b) => {
      const aScore =
        (a.parentId ? 2 : (a.level === 0 ? 3 : 0)) +
        (a.costCenterCode ? 1 : 0) +
        ((a.auditLogs && a.auditLogs.length > 0) ? 2 : 0) +
        (a.headAr ? 1 : 0);
      const bScore =
        (b.parentId ? 2 : (b.level === 0 ? 3 : 0)) +
        (b.costCenterCode ? 1 : 0) +
        ((b.auditLogs && b.auditLogs.length > 0) ? 2 : 0) +
        (b.headAr ? 1 : 0);
      return bScore - aScore;
    });

    const chosen = group[0];
    canonical.push(chosen);

    for (let i = 1; i < group.length; i++) {
      oldIdToCanonical.set(group[i].id, chosen.id);
    }
  });

  // Re-map parent IDs to canonical IDs if parent was one of the purged duplicates
  return canonical.map(dept => {
    if (dept.parentId && oldIdToCanonical.has(dept.parentId)) {
      return { ...dept, parentId: oldIdToCanonical.get(dept.parentId)! };
    }
    return dept;
  });
}

export interface HierarchyTemplateNode {
  key: string;
  parentKey: string | null;
  nameAr: string;
  titleEn: string;
  code: string;
  headAr?: string;
  costCenterCode?: string;
  staffCount?: number;
  level: number;
  responsibilities?: string;
}

/**
 * Calibrated Standard Contracting Hierarchy: Exactly 34 operational units
 * 1 Root + 4 PMO + 4 Audit + 4 Legal + 3 QHSE + 6 Eng + 5 HR + 3 CFO + 4 SCM = 34 Units
 */
export const ENTERPRISE_HIERARCHY_TEMPLATE: HierarchyTemplateNode[] = [
  // 1. Root Level 0: Owner & CEO (1)
  {
    key: 'root_ceo',
    parentKey: null,
    nameAr: 'المالك والرئيس التنفيذي',
    titleEn: 'Owner & CEO',
    code: 'EXEC-001',
    headAr: 'يوسف حجازي',
    costCenterCode: 'CC-1000',
    staffCount: 1,
    level: 0,
    responsibilities: 'القيادة التنفيذية، رسم الاستراتيجيات العامة للشركة، واعتماد موازنات المشروعات'
  },

  // 2. Level 1: PMO & Cost Control (4 units)
  {
    key: 'pmo_dir',
    parentKey: 'root_ceo',
    nameAr: 'مدير مكتب إدارة المشروعات ومراقبة التكاليف',
    titleEn: 'PMO & Cost Control Director',
    code: 'PMO-101',
    headAr: 'م. عمرو السعيد',
    costCenterCode: 'CC-1100',
    staffCount: 6,
    level: 1,
    responsibilities: 'إدارة البرامج الزمنية، الموازنات التقديرية، ومراقبة انحرافات التكلفة والزمن'
  },
  {
    key: 'pmo_sched',
    parentKey: 'pmo_dir',
    nameAr: 'إعداد البرامج الزمنية (Primavera)',
    titleEn: 'Primavera Project Scheduling',
    code: 'PMO-201',
    headAr: 'م. تامر ممدوح',
    costCenterCode: 'CC-1110',
    staffCount: 2,
    level: 2,
    responsibilities: 'تحديث المسار الحرج (Critical Path) والخطط الزمنية للمشاريع الإنشائية'
  },
  {
    key: 'pmo_budgets',
    parentKey: 'pmo_dir',
    nameAr: 'الموازنات التقديرية للمشاريع',
    titleEn: 'Project Cost Estimation & Budgets',
    code: 'PMO-202',
    headAr: 'م. هاني شاكر',
    costCenterCode: 'CC-1120',
    staffCount: 2,
    level: 2,
    responsibilities: 'إعداد الميزانيات التقديرية ومصفوفات تدفق السيولة النقدية'
  },
  {
    key: 'pmo_variance',
    parentKey: 'pmo_dir',
    nameAr: 'مراقبة انحرافات التكلفة والزمن',
    titleEn: 'Cost & Schedule Variance Control (EVM)',
    code: 'PMO-203',
    headAr: 'م. عادل إمام',
    costCenterCode: 'CC-1130',
    staffCount: 2,
    level: 2,
    responsibilities: 'تحليل القيمة المكتسبة (EVM) وإصدار تقارير الانحرافات الشهرية'
  },

  // 3. Level 1: Internal Audit & Financial Control (4 units)
  {
    key: 'audit_dir',
    parentKey: 'root_ceo',
    nameAr: 'مدير المراجعة الداخلية والرقابة المالية',
    titleEn: 'Internal Audit & Financial Control Director',
    code: 'AUD-102',
    headAr: 'أ. مصطفى الشناوي',
    costCenterCode: 'CC-1200',
    staffCount: 5,
    level: 1,
    responsibilities: 'التدقيق المالي والتشغيلي المستقل، مراجعة المستخلصات والمشتريات وجرد المخازن'
  },
  {
    key: 'audit_invoices',
    parentKey: 'audit_dir',
    nameAr: 'التدقيق المالي والتشغيلي المستقل على المستخلصات',
    titleEn: 'Independent Financial & Operational Audit',
    code: 'AUD-201',
    headAr: 'أ. سامي فهمي',
    costCenterCode: 'CC-1210',
    staffCount: 2,
    level: 2,
    responsibilities: 'الفحص الدوري لمستخلصات المالك ومقاولي الباطن ومطابقتها للشروط التعاقدية'
  },
  {
    key: 'audit_procure',
    parentKey: 'audit_dir',
    nameAr: 'المشتريات وعهد الموقع',
    titleEn: 'Procurement & Site Petty Cash Audit',
    code: 'AUD-202',
    headAr: 'أ. علاء الدين حسن',
    costCenterCode: 'CC-1220',
    staffCount: 2,
    level: 2,
    responsibilities: 'تدقيق سلامة دورة المشتريات ومطابقة الصرف في عهد المواقع النقدية'
  },
  {
    key: 'audit_inventory',
    parentKey: 'audit_dir',
    nameAr: 'جرد المخازن',
    titleEn: 'Warehouse Inventory Audit',
    code: 'AUD-203',
    headAr: 'أ. ياسر جلال',
    costCenterCode: 'CC-1230',
    staffCount: 1,
    level: 2,
    responsibilities: 'الجرد المفاجئ والدوري للمخازن المركزية ومخازن التشوين بالمواقع'
  },

  // 4. Level 1: Legal Counsel (4 units)
  {
    key: 'legal_dir',
    parentKey: 'root_ceo',
    nameAr: 'المستشار القانوني',
    titleEn: 'Legal Counsel',
    code: 'LEG-103',
    headAr: 'المستشار أشرف توفيق',
    costCenterCode: 'CC-1300',
    staffCount: 4,
    level: 1,
    responsibilities: 'صياغة ومراجعة عقود المقاولات ومقاولي الباطن ومتابعة قضايا التحكيم'
  },
  {
    key: 'legal_gov',
    parentKey: 'legal_dir',
    nameAr: 'صياغة ومراجعة عقود المقاولات الحكومية والشركات',
    titleEn: 'Government & Corporate Contracting',
    code: 'LEG-201',
    headAr: 'أ. وائل نصار',
    costCenterCode: 'CC-1310',
    staffCount: 2,
    level: 2,
    responsibilities: 'دراسة الشروط الحقوقية والشروط العامة والخاصة لمناقصات المشروعات'
  },
  {
    key: 'legal_subcon',
    parentKey: 'legal_dir',
    nameAr: 'عقود مقاولي الباطن',
    titleEn: 'Subcontractor Agreements',
    code: 'LEG-202',
    headAr: 'أ. حسام الباز',
    costCenterCode: 'CC-1320',
    staffCount: 1,
    level: 2,
    responsibilities: 'إعداد صيغ العقود الموحدة لمقاولي الباطن وتضمين بنود الجزاءات والتأخير'
  },
  {
    key: 'legal_disputes',
    parentKey: 'legal_dir',
    nameAr: 'متابعة القضايا والتحكيم',
    titleEn: 'Litigation & Arbitration Affairs',
    code: 'LEG-203',
    headAr: 'أ. مروان فوزي',
    costCenterCode: 'CC-1330',
    staffCount: 1,
    level: 2,
    responsibilities: 'إدارة النزاعات القضائية، التحكيم الهندسي، والمطالبات القانونية'
  },

  // 5. Level 1: QHSE Director (3 units)
  {
    key: 'qhse_dir',
    parentKey: 'root_ceo',
    nameAr: 'مدير السلامة والصحة المهنية والجودة',
    titleEn: 'QHSE Director',
    code: 'QHS-104',
    headAr: 'م. كريم علام',
    costCenterCode: 'CC-1400',
    staffCount: 6,
    level: 1,
    responsibilities: 'الإشراف على فحص واستلام الأعمال بالورش والمواقع وتطبيق معايير السلامة المهنية'
  },
  {
    key: 'qhse_qaqc',
    parentKey: 'qhse_dir',
    nameAr: 'فحص واستلام الأعمال بالمواقع (QA/QC - WIR/MIR)',
    titleEn: 'Site Inspection QA/QC (WIR/MIR)',
    code: 'QHS-201',
    headAr: 'م. هشام طلعت',
    costCenterCode: 'CC-1410',
    staffCount: 3,
    level: 2,
    responsibilities: 'فحص الخامات الموردة (MIR) وتسليم بنود التنفيذ للاستشاري (WIR)'
  },
  {
    key: 'qhse_hse',
    parentKey: 'qhse_dir',
    nameAr: 'الإشراف على السلامة المهنية (HSE)',
    titleEn: 'Health, Safety & Environment (HSE)',
    code: 'QHS-202',
    headAr: 'م. ماجد المهدي',
    costCenterCode: 'CC-1420',
    staffCount: 3,
    level: 2,
    responsibilities: 'تأمين بيئة العمل بالمواقع الإنشائية وتطبيق لوائح الحماية الشخصية والدفاع المدني'
  },

  // 6. Level 1: Engineering & Projects (6 units)
  {
    key: 'eng_dir',
    parentKey: 'root_ceo',
    nameAr: 'مدير عام المشروعات والإدارة الهندسية',
    titleEn: 'Engineering & Projects Director',
    code: 'ENG-105',
    headAr: 'م. محمود النجار',
    costCenterCode: 'CC-1500',
    staffCount: 28,
    level: 1,
    responsibilities: 'إدارة العمليات الهندسية، المكتب الفني، والمواقع الإنشائية'
  },
  {
    key: 'eng_tech_office',
    parentKey: 'eng_dir',
    nameAr: 'رئيس قسم المكتب الفني',
    titleEn: 'Technical Office Head',
    code: 'ENG-201',
    headAr: 'م. زياد طارق',
    costCenterCode: 'CC-1510',
    staffCount: 12,
    level: 2,
    responsibilities: 'إدارة عمليات التسعير، الشوب دروينج، وحصر الكميات ومستخلصات المالك'
  },
  {
    key: 'eng_pricing',
    parentKey: 'eng_tech_office',
    nameAr: 'مهندسو التسعير والعطاءات',
    titleEn: 'Tendering & Cost Estimation Engineers',
    code: 'ENG-301',
    headAr: 'م. أحمد شكري',
    costCenterCode: 'CC-1511',
    staffCount: 4,
    level: 3,
    responsibilities: 'دراسة المقايسات، طلب عروض الأسعار، وتحليل تكاليف بنود المناقصات'
  },
  {
    key: 'eng_shopdraw',
    parentKey: 'eng_tech_office',
    nameAr: 'مهندسو الشوب دروينج (Shop Drawings)',
    titleEn: 'Shop Drawings Engineers',
    code: 'ENG-302',
    headAr: 'م. أحمد فؤاد',
    costCenterCode: 'CC-1512',
    staffCount: 4,
    level: 3,
    responsibilities: 'إعداد المخططات التنفيذية وتفاصيل التسليح والتنسيق بين التخصصات (BIM/CAD)'
  },
  {
    key: 'eng_qs',
    parentKey: 'eng_tech_office',
    nameAr: 'مهندسو حصر الكميات والمطالبات',
    titleEn: 'Quantity Surveying & Claims Engineers',
    code: 'ENG-303',
    headAr: 'م. نادر سليم',
    costCenterCode: 'CC-1513',
    staffCount: 4,
    level: 3,
    responsibilities: 'الحصر الهندسي للمنفذ ومقارنته بالمخططات وإعداد مستخلصات الأعمال'
  },
  {
    key: 'eng_site_mgrs',
    parentKey: 'eng_dir',
    nameAr: 'مديرو المشاريع والمواقع',
    titleEn: 'Project & Site Managers',
    code: 'ENG-202',
    headAr: 'م. باهر كمال',
    costCenterCode: 'CC-1520',
    staffCount: 16,
    level: 2,
    responsibilities: 'القيادة الميدانية لتنفيذ الأعمال، تنسيق فرق العمل، وضمان الجودة والبرنامج الزمني'
  },

  // 7. Level 1: HR & Administration (5 units)
  {
    key: 'hr_dir',
    parentKey: 'root_ceo',
    nameAr: 'مدير الموارد البشرية والشؤون الإدارية',
    titleEn: 'HR & Admin Director',
    code: 'HRA-106',
    headAr: 'أ. إبراهيم رضوان',
    costCenterCode: 'CC-1600',
    staffCount: 18,
    level: 1,
    responsibilities: 'إدارة رأس المال البشري، الشؤون الإدارية، والتراخيص وتكنولوجيا المعلومات'
  },
  {
    key: 'hr_recruitment',
    parentKey: 'hr_dir',
    nameAr: 'مسؤولو التوظيف واستقطاب الكفاءات',
    titleEn: 'Talent Acquisition Team',
    code: 'HRA-201',
    headAr: 'أ. تغريد عاطف',
    costCenterCode: 'CC-1610',
    staffCount: 4,
    level: 2,
    responsibilities: 'استقطاب الكفاءات الهندسية والإدارية، تنظيم المقابلات، وتحديث بطاقات الوصف الوظيفي'
  },
  {
    key: 'hr_personnel',
    parentKey: 'hr_dir',
    nameAr: 'شؤون العاملين والرواتب',
    titleEn: 'Personnel & Payroll Team',
    code: 'HRA-202',
    headAr: 'أ. طارق عبد العليم',
    costCenterCode: 'CC-1620',
    staffCount: 5,
    level: 2,
    responsibilities: 'إدارة عقود العمل، مسيرات الرواتب، التأمينات الاجتماعية، وحوافز المواقع'
  },
  {
    key: 'hr_gov_services',
    parentKey: 'hr_dir',
    nameAr: 'الخدمات الحكومية والعلاقات العامة',
    titleEn: 'Government Relations & Admin Services',
    code: 'HRA-203',
    headAr: 'أ. رأفت عبد الغني',
    costCenterCode: 'CC-1630',
    staffCount: 5,
    level: 2,
    responsibilities: 'تخليص المعاملات الحكومية، إدارة الفروع والمقرات، والأرشفة الهندسية المركزية'
  },
  {
    key: 'hr_it',
    parentKey: 'hr_dir',
    nameAr: 'أخصائي تكنولوجيا المعلومات والأنظمة',
    titleEn: 'IT Infrastructure & Support',
    code: 'HRA-204',
    headAr: 'م. مروان السويدي',
    costCenterCode: 'CC-1640',
    staffCount: 4,
    level: 2,
    responsibilities: 'إدارة البنية التحتية الرقمية، شبكات المواقع، برامج المؤسسة والنسخ الاحتياطي'
  },

  // 8. Level 1: CFO & Finance (3 units)
  {
    key: 'fin_dir',
    parentKey: 'root_ceo',
    nameAr: 'المدير المالي',
    titleEn: 'CFO / Financial Manager',
    code: 'FIN-107',
    headAr: 'أ. سامح عبد الفتاح',
    costCenterCode: 'CC-1700',
    staffCount: 14,
    level: 1,
    responsibilities: 'التخطيط والتحليل المالي، إدارة الحسابات، الضرائب، والسيولة النقدية'
  },
  {
    key: 'fin_receivables',
    parentKey: 'fin_dir',
    nameAr: 'محاسبو عملاء ومستخلصات المشاريع',
    titleEn: 'Clients & Revenue Accounts',
    code: 'FIN-201',
    headAr: 'أ. مدحت غانم',
    costCenterCode: 'CC-1710',
    staffCount: 6,
    level: 2,
    responsibilities: 'مراجعة وتحصيل مستخلصات المالك ومتابعة خطابات الضمان والتحصيلات البنكية'
  },
  {
    key: 'fin_payables',
    parentKey: 'fin_dir',
    nameAr: 'محاسبو الموردين والمقاولين والخزينة',
    titleEn: 'Payables & Treasury Accounts',
    code: 'FIN-202',
    headAr: 'أ. رمزي عبد السميع',
    costCenterCode: 'CC-1720',
    staffCount: 8,
    level: 2,
    responsibilities: 'صرف مستخلصات مقاولي الباطن، إدارة الخزائن وعهد المواقع والضرائب'
  },

  // 9. Level 1: Procurement & Supply Chain (4 units)
  {
    key: 'scm_dir',
    parentKey: 'root_ceo',
    nameAr: 'مدير المشتريات وسلاسل الإمداد',
    titleEn: 'Procurement & Supply Chain Director',
    code: 'SCM-108',
    headAr: 'م. حسام الشربيني',
    costCenterCode: 'CC-1800',
    staffCount: 16,
    level: 1,
    responsibilities: 'إدارة عقود مقاولي الباطن، المشتريات الاستراتيجية، وإدارة المخازن والمعدات'
  },
  {
    key: 'scm_subcon',
    parentKey: 'scm_dir',
    nameAr: 'مسؤولو عقود مقاولي الباطن',
    titleEn: 'Subcontracting Contracts Team',
    code: 'SCM-201',
    headAr: 'م. أيمن عكاشة',
    costCenterCode: 'CC-1810',
    staffCount: 5,
    level: 2,
    responsibilities: 'استقطاب وتقييم مقاولي الباطن للبنود التخصصية وإصدار أوامر الشغل ومتابعة التزامهم'
  },
  {
    key: 'scm_procurement',
    parentKey: 'scm_dir',
    nameAr: 'مسؤولو المشتريات ومراقبة الخامات',
    titleEn: 'Procurement & Material Control',
    code: 'SCM-202',
    headAr: 'أ. فتحي القاضي',
    costCenterCode: 'CC-1820',
    staffCount: 6,
    level: 2,
    responsibilities: 'شراء مواد البناء الأساسية، التفاوض مع المصانع، وتأجير المعدات والشدات'
  },
  {
    key: 'scm_inventory',
    parentKey: 'scm_dir',
    nameAr: 'أمناء المخازن وحركة المعدات',
    titleEn: 'Warehousing & Fleet Management',
    code: 'SCM-203',
    headAr: 'أ. عبد الله راشد',
    costCenterCode: 'CC-1830',
    staffCount: 5,
    level: 2,
    responsibilities: 'مراقبة المخزن المركزي ومخازن المواقع، صيانة أسطول المعدات وإدارة الورش'
  }
];

export function computeDepartmentDiff(
  oldDept: DepartmentOrg,
  newDept: DepartmentOrg
): DepartmentAuditChange[] {
  const changes: DepartmentAuditChange[] = [];

  const scalarFields: (keyof DepartmentOrg)[] = [
    'nameAr',
    'code',
    'headAr',
    'staffCount',
    'responsibilities',
    'costCenterCode',
    'parentId',
    'branchNameAr'
  ];

  for (const field of scalarFields) {
    const oldVal = oldDept[field];
    const newVal = newDept[field];

    if (String(oldVal ?? '').trim() !== String(newVal ?? '').trim()) {
      changes.push({
        field: String(field),
        fieldLabel: DEPARTMENT_FIELD_LABELS[field] || String(field),
        oldValue: String(oldVal ?? '—'),
        newValue: String(newVal ?? '—')
      });
    }
  }

  return changes;
}

/**
 * Persistent Storage Repository for Departments & Org Structure (Cloudflare D1 Remote Persistence)
 */
export const departmentStorage = {
  /**
   * Synchronously load departments from localStorage cache with automatic deduplication
   */
  getDepartmentsSync(): DepartmentOrg[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      const deduped = deduplicateDepartments(parsed);
      if (deduped.length !== parsed.length) {
        departmentStorage.saveDepartmentsSync(deduped);
      }
      return deduped;
    } catch {
      return [];
    }
  },

  /**
   * Save departments to localStorage cache
   */
  saveDepartmentsSync(departments: DepartmentOrg[]): void {
    try {
      const deduped = deduplicateDepartments(departments);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped));
    } catch (err) {
      console.warn('[departmentStorage] Failed to cache departments locally:', err);
    }
  },

  /**
   * Deterministic Remote Fetching from Cloudflare D1 Database with automatic deduplication
   */
  async getDepartments(): Promise<DepartmentOrg[]> {
    try {
      const res = await fetch('/api/departments', {
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        const list: DepartmentOrg[] = Array.isArray(data) ? data : (data.departments || []);
        const deduped = deduplicateDepartments(list);
        departmentStorage.saveDepartmentsSync(deduped);
        return deduped;
      }
    } catch (err) {
      console.warn('[departmentStorage] Remote fetch error from Cloudflare D1, falling back to cache:', err);
    }

    return departmentStorage.getDepartmentsSync();
  },

  /**
   * Create or update a department with remote Cloudflare D1 mutation
   */
  async saveDepartment(
    deptData: Partial<DepartmentOrg> & { nameAr: string; code: string },
    userName = 'يوسف حجازي'
  ): Promise<{ department: DepartmentOrg; auditEntry?: DepartmentAuditLogEntry }> {
    const list = departmentStorage.getDepartmentsSync();
    const existingIndex = list.findIndex(d => d.id === deptData.id);
    const timestamp = getFormattedAuditTimestamp();
    const isUpdate = existingIndex >= 0;

    let targetDept: DepartmentOrg;
    let auditEntry: DepartmentAuditLogEntry | undefined;
    let changes: DepartmentAuditChange[] = [];

    if (isUpdate) {
      const oldDept = list[existingIndex];
      targetDept = {
        ...oldDept,
        ...deptData,
        id: oldDept.id,
        updatedAt: timestamp
      };

      changes = computeDepartmentDiff(oldDept, targetDept);
      if (changes.length > 0) {
        auditEntry = {
          id: `audit_dept_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          departmentId: oldDept.id,
          timestamp,
          userName,
          action: 'update',
          actionLabelAr: 'تعديل بيانات وتعيينات الإدارة',
          changes
        };
        targetDept.auditLogs = [auditEntry, ...(oldDept.auditLogs || [])];
      }
    } else {
      const newId = deptData.id || `dept_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      auditEntry = {
        id: `audit_dept_${Date.now()}_init`,
        departmentId: newId,
        timestamp,
        userName,
        action: 'create',
        actionLabelAr: 'إنشاء واستحداث إدارة في الهيكل',
        changes: [
          {
            field: 'nameAr',
            fieldLabel: DEPARTMENT_FIELD_LABELS.nameAr,
            oldValue: '—',
            newValue: deptData.nameAr
          },
          {
            field: 'code',
            fieldLabel: DEPARTMENT_FIELD_LABELS.code,
            oldValue: '—',
            newValue: deptData.code
          }
        ]
      };

      targetDept = {
        id: newId,
        code: deptData.code,
        nameAr: deptData.nameAr,
        headAr: deptData.headAr || '',
        staffCount: deptData.staffCount || 0,
        subUnits: deptData.subUnits || [],
        responsibilities: deptData.responsibilities || '',
        parentId: deptData.parentId !== undefined ? deptData.parentId : null,
        companyId: deptData.companyId,
        companyNameAr: deptData.companyNameAr,
        branchId: deptData.branchId,
        branchNameAr: deptData.branchNameAr,
        costCenterCode: deptData.costCenterCode,
        auditLogs: [auditEntry],
        createdAt: timestamp,
        updatedAt: timestamp
      };
    }

    // Awaited Network Mutation to Cloudflare D1
    try {
      const endpoint = isUpdate ? `/api/departments/${targetDept.id}` : '/api/departments';
      const method = isUpdate ? 'PUT' : 'POST';
      const payload = isUpdate
        ? { ...targetDept, changes, userName }
        : { ...targetDept, userName };

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const json = await res.json();
        if (json.department) {
          targetDept = json.department;
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `فشل حفظ الإدارة في Cloudflare D1 (${res.status})`);
      }
    } catch (err: any) {
      console.warn('[departmentStorage] Cloudflare mutation error:', err);
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.warn('[departmentStorage] Operating in offline mode. Saved to cache.');
      } else {
        throw err;
      }
    }

    // Update local cache
    const currentList = departmentStorage.getDepartmentsSync();
    const idx = currentList.findIndex(d => d.id === targetDept.id);
    if (idx >= 0) {
      currentList[idx] = targetDept;
    } else {
      currentList.push(targetDept);
    }
    departmentStorage.saveDepartmentsSync(currentList);

    return { department: targetDept, auditEntry };
  },

  /**
   * Delete a department permanently via Cloudflare D1
   */
  async deleteDepartment(id: string, userName = 'يوسف حجازي'): Promise<boolean> {
    try {
      const res = await fetch(`/api/departments/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ deletedBy: userName })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `فشل حذف الإدارة من Cloudflare D1 (${res.status})`);
      }
    } catch (err: any) {
      console.warn('[departmentStorage] Delete mutation error:', err);
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.warn('[departmentStorage] Operating offline, deleted from cache only.');
      } else {
        throw err;
      }
    }

    const list = departmentStorage.getDepartmentsSync();
    // Re-parent children to null (root)
    const updated = list
      .filter(d => d.id !== id)
      .map(d => (d.parentId === id ? { ...d, parentId: null } : d));
    departmentStorage.saveDepartmentsSync(updated);
    return true;
  },

  /**
   * Batch insert or update multiple departments via Cloudflare D1
   */
  async saveDepartmentsBatch(
    newDepts: DepartmentOrg[],
    userName = 'يوسف حجازي',
    resetHierarchy = false,
    companyId?: string
  ): Promise<DepartmentOrg[]> {
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          bulk: newDepts,
          userName,
          resetHierarchy,
          companyId
        })
      });

      if (res.ok) {
        const data = await res.json();
        const list: DepartmentOrg[] = Array.isArray(data)
          ? data
          : (Array.isArray(data.departments) ? data.departments : []);
        if (list.length > 0) {
          const deduped = deduplicateDepartments(list);
          departmentStorage.saveDepartmentsSync(deduped);
          return deduped;
        }
      }
    } catch (err) {
      console.warn('[departmentStorage] Batch mutation error, syncing locally:', err);
    }

    // Merge into local cache
    const current = resetHierarchy
      ? (companyId ? departmentStorage.getDepartmentsSync().filter(d => d.companyId !== companyId) : [])
      : departmentStorage.getDepartmentsSync();
    const map = new Map<string, DepartmentOrg>(current.map(d => [d.id, d]));
    newDepts.forEach(d => map.set(d.id, d));
    const merged = deduplicateDepartments(Array.from(map.values()));
    departmentStorage.saveDepartmentsSync(merged);
    return merged;
  },

  /**
   * Generate in-memory Draft of the 34-unit Standard Hierarchy (isDraft: true).
   * Does NOT write to localStorage or Cloudflare D1 until committed.
   */
  generateDraftHierarchy(
    companyId: string,
    companyNameAr: string
  ): DepartmentOrg[] {
    const timestamp = getFormattedAuditTimestamp();
    const idMap = new Map<string, string>();

    // Deterministic IDs for the 34 nodes
    ENTERPRISE_HIERARCHY_TEMPLATE.forEach(node => {
      idMap.set(node.key, `draft_dept_${companyId || 'comp'}_${node.key}`);
    });

    return ENTERPRISE_HIERARCHY_TEMPLATE.map(node => {
      const id = idMap.get(node.key)!;
      const parentId = node.parentKey ? idMap.get(node.parentKey) || null : null;

      return {
        id,
        nameAr: node.nameAr,
        titleEn: node.titleEn,
        nameEn: node.titleEn,
        code: node.code,
        headAr: node.headAr || '',
        staffCount: node.staffCount || 1,
        subUnits: [],
        responsibilities: node.responsibilities || '',
        parentId,
        companyId,
        companyNameAr,
        costCenterCode: node.costCenterCode || '',
        level: node.level,
        isDraft: true,
        auditLogs: [],
        createdAt: timestamp,
        updatedAt: timestamp
      };
    });
  },

  /**
   * Commit the draft hierarchy permanently to Cloudflare D1 with resetHierarchy flag.
   */
  async commitHierarchy(
    departments: DepartmentOrg[],
    companyId: string,
    userName = 'يوسف حجازي'
  ): Promise<DepartmentOrg[]> {
    const timestamp = getFormattedAuditTimestamp();
    const cleanDepartments = departments.map(d => {
      const { isDraft, ...rest } = d;
      const auditEntry: DepartmentAuditLogEntry = {
        id: `audit_dept_${Date.now()}_commit_${d.code}`,
        departmentId: d.id,
        timestamp,
        userName,
        action: 'create',
        actionLabelAr: 'اعتماد وتثبيت الهيكل التنظيمي القياسي المعتمد',
        changes: [
          { field: 'nameAr', fieldLabel: 'اسم الإدارة', oldValue: '—', newValue: d.nameAr },
          { field: 'code', fieldLabel: 'كود الإدارة', oldValue: '—', newValue: d.code }
        ]
      };
      return {
        ...rest,
        isDraft: false,
        auditLogs: [auditEntry]
      };
    });

    return await departmentStorage.saveDepartmentsBatch(
      cleanDepartments,
      userName,
      true, // resetHierarchy = true to purge duplicates
      companyId
    );
  },

  /**
   * Legacy seed method kept for compatibility (now delegates to commitHierarchy)
   */
  async seedEnterpriseHierarchy(
    companyId: string,
    companyNameAr: string,
    userName = 'يوسف حجازي'
  ): Promise<DepartmentOrg[]> {
    const draft = departmentStorage.generateDraftHierarchy(companyId, companyNameAr);
    return await departmentStorage.commitHierarchy(draft, companyId, userName);
  }
};
