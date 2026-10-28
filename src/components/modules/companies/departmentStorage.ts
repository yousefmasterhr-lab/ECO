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

export const ENTERPRISE_HIERARCHY_TEMPLATE: HierarchyTemplateNode[] = [
  // Level 0: Root CEO
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

  // 1. Level 1: PMO & Cost Control
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

  // 2. Level 1: Internal Audit & Financial Control
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

  // 3. Level 1: Legal Counsel
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

  // 4. Level 1: QHSE Director
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

  // 5. Level 1: Engineering & Projects Director
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
  // Level 2: المكتب الفني
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
  // Level 3 units under المكتب الفني
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
  // Level 2: مديرو المشاريع والمواقع
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
  // Level 3 units under مديرو المشاريع والمواقع
  {
    key: 'eng_exec_engs',
    parentKey: 'eng_site_mgrs',
    nameAr: 'مهندسو التنفيذ (مدني / عمارة / MEP)',
    titleEn: 'Site Execution Engineers (Civil / Arch / MEP)',
    code: 'ENG-304',
    headAr: 'م. مصطفى كامل',
    costCenterCode: 'CC-1521',
    staffCount: 8,
    level: 3,
    responsibilities: 'الإشراف اليومي المباشر على صب الخرسانات والتشطيبات والأعمال الكهروميكانيكية'
  },
  {
    key: 'eng_site_qaqc',
    parentKey: 'eng_site_mgrs',
    nameAr: 'مهندسو الجودة والسلامة بالموقع',
    titleEn: 'Site QA/QC & Safety Engineers',
    code: 'ENG-305',
    headAr: 'م. عمار حمدي',
    costCenterCode: 'CC-1522',
    staffCount: 4,
    level: 3,
    responsibilities: 'التأكد من مطابقة التنفيذ لمواصفات المشروع وضوابط السلامة بالمنطقة الإنشائية'
  },
  {
    key: 'eng_surveyors',
    parentKey: 'eng_site_mgrs',
    nameAr: 'المساحون والمشرفون وإداري المواقع',
    titleEn: 'Site Surveyors, Foremen & Site Admins',
    code: 'ENG-306',
    headAr: 'أ. حازم الصاوي',
    costCenterCode: 'CC-1523',
    staffCount: 4,
    level: 3,
    responsibilities: 'الأعمال المساحية، الإشراف الحرفي على العمالة، وتسجيل الحضور والانصراف بالموقع'
  },

  // 6. Level 1: HR & Admin Director
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
  // Level 2: مسؤولو التوظيف
  {
    key: 'hr_recruitment',
    parentKey: 'hr_dir',
    nameAr: 'مسؤولو التوظيف',
    titleEn: 'Talent Acquisition Team',
    code: 'HRA-201',
    headAr: 'أ. تغريد عاطف',
    costCenterCode: 'CC-1610',
    staffCount: 4,
    level: 2,
    responsibilities: 'استقطاب الكفاءات الهندسية والإدارية، تنظيم المقابلات، وتحديث بطاقات الوصف الوظيفي'
  },
  // Level 3 under مسؤولو التوظيف
  {
    key: 'hr_sourcing',
    parentKey: 'hr_recruitment',
    nameAr: 'استقطاب المواهب وتخطيط القوى العاملة',
    titleEn: 'Talent Sourcing & Workforce Planning',
    code: 'HRA-301',
    headAr: 'أ. رانيا منصور',
    costCenterCode: 'CC-1611',
    staffCount: 2,
    level: 3,
    responsibilities: 'تحديد الاحتياجات الوظيفية السنوية وحملات التوظيف بالجامعات والمعارض'
  },
  {
    key: 'hr_tech_recruit',
    parentKey: 'hr_recruitment',
    nameAr: 'استقطاب المهندسين والفنيين',
    titleEn: 'Technical & Engineering Recruitment',
    code: 'HRA-302',
    headAr: 'أ. حنان البدري',
    costCenterCode: 'CC-1612',
    staffCount: 1,
    level: 3,
    responsibilities: 'استقطاب مهندسي المواقع، المشرفين، والكوادر الفنية المتخصصة'
  },
  {
    key: 'hr_job_desc',
    parentKey: 'hr_recruitment',
    nameAr: 'تحديث الهياكل وبطاقات الوصف الوظيفي',
    titleEn: 'Job Descriptions & Org Updates',
    code: 'HRA-303',
    headAr: 'أ. مروة العوضي',
    costCenterCode: 'CC-1613',
    staffCount: 1,
    level: 3,
    responsibilities: 'صياغة وتحديث مصفوفة المسؤوليات وبطاقات المهام لكل مسمى بالهيكل'
  },
  // Level 2: شؤون العاملين والرواتب
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
  // Level 3 under شؤون العاملين والرواتب
  {
    key: 'hr_contracts',
    parentKey: 'hr_personnel',
    nameAr: 'إدارة عقود العمل ومسيرات الرواتب',
    titleEn: 'Labor Contracts & Payroll Processing',
    code: 'HRA-304',
    headAr: 'أ. محمد جودة',
    costCenterCode: 'CC-1621',
    staffCount: 2,
    level: 3,
    responsibilities: 'إبرام عقود العمل وإصدار مسيرات الرواتب الشهرية والبدلات'
  },
  {
    key: 'hr_insurance',
    parentKey: 'hr_personnel',
    nameAr: 'حوافز المواقع والتأمينات الاجتماعية',
    titleEn: 'Site Incentives & Social Insurance',
    code: 'HRA-305',
    headAr: 'أ. عصام يونس',
    costCenterCode: 'CC-1622',
    staffCount: 2,
    level: 3,
    responsibilities: 'تسجيل استمارات التأمينات (س1/س2/س6) واحتساب بدلات الاغتراب وحوافز الإنتاجية'
  },
  {
    key: 'hr_discipline',
    parentKey: 'hr_personnel',
    nameAr: 'أزمات المقاولات واللوائح التأديبية',
    titleEn: 'Disciplinary Codes & Labor Relations',
    code: 'HRA-306',
    headAr: 'أ. شريف قاسم',
    costCenterCode: 'CC-1623',
    staffCount: 1,
    level: 3,
    responsibilities: 'التحقيقات الإدارية وتطبيق لائحة الجزاءات ومتابعة علاقات العمل'
  },
  // Level 2: الخدمات الحكومية والعلاقات
  {
    key: 'hr_gov_services',
    parentKey: 'hr_dir',
    nameAr: 'الخدمات الحكومية والعلاقات',
    titleEn: 'Government Relations & Admin Services',
    code: 'HRA-203',
    headAr: 'أ. رأفت عبد الغني',
    costCenterCode: 'CC-1630',
    staffCount: 5,
    level: 2,
    responsibilities: 'تخليص المعاملات الحكومية، إدارة الفروع والمقرات، والأرشفة الهندسية المركزية'
  },
  // Level 3 under الخدمات الحكومية والعلاقات
  {
    key: 'hr_clearances',
    parentKey: 'hr_gov_services',
    nameAr: 'تخليص المعاملات والتراخيص الحكومية',
    titleEn: 'Government Approvals & Clearances',
    code: 'HRA-307',
    headAr: 'أ. أحمد عزت',
    costCenterCode: 'CC-1631',
    staffCount: 2,
    level: 3,
    responsibilities: 'استخراج وتجديد التراخيص الهندسية، السجلات التجارية، وتصاريح الحفر والمواقع'
  },
  {
    key: 'hr_facilities',
    parentKey: 'hr_gov_services',
    nameAr: 'إدارة المقر الرئيسي والفروع',
    titleEn: 'HQ & Branch Facilities Management',
    code: 'HRA-308',
    headAr: 'أ. خالد بسيوني',
    costCenterCode: 'CC-1632',
    staffCount: 2,
    level: 3,
    responsibilities: 'إدارة الخدمات اللوجستية، صيانة المقرات، والضيافة والنظافة'
  },
  {
    key: 'hr_archive',
    parentKey: 'hr_gov_services',
    nameAr: 'أرشفة المراسلات الهندسية والمستخلصات',
    titleEn: 'Engineering Correspondence & Archive',
    code: 'HRA-309',
    headAr: 'أ. إيمان فريد',
    costCenterCode: 'CC-1633',
    staffCount: 1,
    level: 3,
    responsibilities: 'التوثيق الرقمي لخطابات المالك والاستشاري وحفظ المستندات التعاقدية'
  },
  // Level 2: أخصائي تكنولوجيا المعلومات
  {
    key: 'hr_it',
    parentKey: 'hr_dir',
    nameAr: 'أخصائي تكنولوجيا المعلومات',
    titleEn: 'IT Infrastructure & Support',
    code: 'HRA-204',
    headAr: 'م. مروان السويدي',
    costCenterCode: 'CC-1640',
    staffCount: 4,
    level: 2,
    responsibilities: 'إدارة البنية التحتية الرقمية، شبكات المواقع، برامج المؤسسة والنسخ الاحتياطي'
  },
  // Level 3 under تكنولوجيا المعلومات
  {
    key: 'hr_network',
    parentKey: 'hr_it',
    nameAr: 'مهندس شبكات وأنظمة ودعم فني',
    titleEn: 'Network & Systems Engineer',
    code: 'HRA-310',
    headAr: 'م. باسل زهران',
    costCenterCode: 'CC-1641',
    staffCount: 2,
    level: 3,
    responsibilities: 'ربط كبائن المواقع الإنشائية بالإنترنت وتأمين الشبكات والدعم الفني للموظفين'
  },
  {
    key: 'hr_erp_admin',
    parentKey: 'hr_it',
    nameAr: 'مسؤول برامج هندسية ومحاسبية (ERP / Primavera)',
    titleEn: 'Enterprise Software Specialist (ERP/Primavera)',
    code: 'HRA-311',
    headAr: 'م. سيف النصر',
    costCenterCode: 'CC-1642',
    staffCount: 1,
    level: 3,
    responsibilities: 'صيانة وتحديث خوادم البرامج الهندسية ونظام ECO ERP وإدارة الصلاحيات'
  },
  {
    key: 'hr_servers',
    parentKey: 'hr_it',
    nameAr: 'إدارة الخوادم والنسخ الاحتياطي',
    titleEn: 'Server & Backup Management',
    code: 'HRA-312',
    headAr: 'م. يحيى الشافعي',
    costCenterCode: 'CC-1643',
    staffCount: 1,
    level: 3,
    responsibilities: 'تأمين قواعد البيانات السحابية (D1) وتطبيق بروتوكولات النسخ الاحتياطي اليومي'
  },

  // 7. Level 1: CFO
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
  // Level 2: محاسبو عملاء ومستخلصات المشاريع
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
  // Level 3 under محاسبو عملاء
  {
    key: 'fin_gov_invoices',
    parentKey: 'fin_receivables',
    nameAr: 'مراجعة مستخلصات الجهات الحكومية والشركات',
    titleEn: 'Billing & Progress Invoices Audit',
    code: 'FIN-301',
    headAr: 'أ. وليد صبحي',
    costCenterCode: 'CC-1711',
    staffCount: 3,
    level: 3,
    responsibilities: 'مطابقة قيود استقطاعات الدفعة المقدمة وغرامات التأخير وتأمين الأعمال'
  },
  {
    key: 'fin_collection',
    parentKey: 'fin_receivables',
    nameAr: 'متابعة التحصيل والاستحقاقات التأمينية',
    titleEn: 'Collections & Insurance Retentions',
    code: 'FIN-302',
    headAr: 'أ. إيهاب سلامة',
    costCenterCode: 'CC-1712',
    staffCount: 3,
    level: 3,
    responsibilities: 'متابعة صرف الشيكات وحسابات التأمين الابتدائي والنهائي مع البنوك'
  },
  // Level 2: محاسبو الموردين والمقاولين والخزينة
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
  // Level 3 under محاسبو الموردين
  {
    key: 'fin_subcon_pay',
    parentKey: 'fin_payables',
    nameAr: 'صرف مستخلصات مقاولي الباطن',
    titleEn: 'Subcontractor Payments Processing',
    code: 'FIN-303',
    headAr: 'أ. شريف الديب',
    costCenterCode: 'CC-1721',
    staffCount: 3,
    level: 3,
    responsibilities: 'تطبيق نسب الاستقطاع وخصم الدمغات وضريبة الأرباح التجارية والصناعية'
  },
  {
    key: 'fin_treasury',
    parentKey: 'fin_payables',
    nameAr: 'إدارة الخزينة وعهد الموقع',
    titleEn: 'Treasury & Site Cash Control',
    code: 'FIN-304',
    headAr: 'أ. طه المغربي',
    costCenterCode: 'CC-1722',
    staffCount: 2,
    level: 3,
    responsibilities: 'تسوية سلف وعهد مهندسي المواقع النقدية ومطابقة إيصالات الصرف'
  },
  {
    key: 'fin_tax_einvoice',
    parentKey: 'fin_payables',
    nameAr: 'القوائم المالية، ضرائب المقاولات والفاتورة الإلكترونية',
    titleEn: 'Financial Statements, Tax & E-Invoicing',
    code: 'FIN-305',
    headAr: 'أ. سامي عبد ربه',
    costCenterCode: 'CC-1723',
    staffCount: 3,
    level: 3,
    responsibilities: 'الإقرارات الضريبية الشهرية، الفاتورة الإلكترونية، وتدقيق حسابات الأرباح والخسائر'
  },

  // 8. Level 1: Procurement & Supply Chain Director
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
  // Level 2: مسؤولو عقود مقاولي الباطن
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
  // Level 3 under مسؤولو عقود مقاولي الباطن
  {
    key: 'scm_prequal',
    parentKey: 'scm_subcon',
    nameAr: 'استقطاب وتقييم مقاولي الباطن للبنود التخصصية',
    titleEn: 'Subcontractor Prequalification',
    code: 'SCM-301',
    headAr: 'م. عصمت مراد',
    costCenterCode: 'CC-1811',
    staffCount: 3,
    level: 3,
    responsibilities: 'فحص سابقة الأعمال والملاءة الفنية والمالية لمقاولي الباطن التخصصيين'
  },
  {
    key: 'scm_work_orders',
    parentKey: 'scm_subcon',
    nameAr: 'إصدار أوامر الشغل ومتابعة التزامهم التعاقدي',
    titleEn: 'Work Orders & Compliance Monitoring',
    code: 'SCM-302',
    headAr: 'م. شادي وجدي',
    costCenterCode: 'CC-1812',
    staffCount: 2,
    level: 3,
    responsibilities: 'إصدار أوامر الإسناد الرسمية ومتابعة الالتزام بمعدلات الإنجاز اليومية'
  },
  // Level 2: مسؤولو المشتريات ومراقبة الخامات
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
    responsibilities: 'شراء مواد البناء الأساسية، التفاوض مع المصانع، وتأجير المعدات الثقيلة والشدات'
  },
  // Level 3 under مسؤولو المشتريات ومراقبة الخامات
  {
    key: 'scm_materials',
    parentKey: 'scm_procurement',
    nameAr: 'توريد مواد البناء',
    titleEn: 'Building Materials Procurement',
    code: 'SCM-303',
    headAr: 'أ. طلال بركات',
    costCenterCode: 'CC-1821',
    staffCount: 3,
    level: 3,
    responsibilities: 'التعاقد على توريد حديد التسليح، الإسمنت، الخرسانة الجاهزة ومستلزمات التشطيب'
  },
  {
    key: 'scm_rentals',
    parentKey: 'scm_procurement',
    nameAr: 'تأجير المعدات الثقيلة والشدات للمواقع عند الحاجة',
    titleEn: 'Heavy Equipment & Formwork Rentals',
    code: 'SCM-304',
    headAr: 'م. ماجد درويش',
    costCenterCode: 'CC-1822',
    staffCount: 3,
    level: 3,
    responsibilities: 'إبرام عقود تأجير الأوناش، الحفارات، اللوادر، والشدات المعدنية وفق جدول الاحتياجات'
  },
  // Level 2: أمناء المخازن وحركة المعدات
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
  },
  // Level 3 under أمناء المخازن وحركة المعدات
  {
    key: 'scm_site_stores',
    parentKey: 'scm_inventory',
    nameAr: 'مراقبة المخزن المركزي ومخازن المواقع',
    titleEn: 'Central & Site Inventory Control',
    code: 'SCM-305',
    headAr: 'أ. خميس عبد ربه',
    costCenterCode: 'CC-1831',
    staffCount: 3,
    level: 3,
    responsibilities: 'إصدار أذون الإضافة والصرف وتوثيق حركة الخامات عبر باركود التخزين'
  },
  {
    key: 'scm_fleet_workshop',
    parentKey: 'scm_inventory',
    nameAr: 'إدارة وتأجير المعدات وورش أسطول معدات ثقيلة',
    titleEn: 'Equipment Fleet Maintenance & Workshops',
    code: 'SCM-306',
    headAr: 'م. صبحي توفيق',
    costCenterCode: 'CC-1832',
    staffCount: 2,
    level: 3,
    responsibilities: 'الصيانة الوقائية لأسطول النقل والمعدات وتوفير قطع الغيار والوقود بالمواقع'
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
   * Synchronously load departments from localStorage cache
   */
  getDepartmentsSync(): DepartmentOrg[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  /**
   * Save departments to localStorage cache
   */
  saveDepartmentsSync(departments: DepartmentOrg[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(departments));
    } catch (err) {
      console.warn('[departmentStorage] Failed to cache departments locally:', err);
    }
  },

  /**
   * Deterministic Remote Fetching from Cloudflare D1 Database
   */
  async getDepartments(): Promise<DepartmentOrg[]> {
    try {
      const res = await fetch('/api/departments', {
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        const list: DepartmentOrg[] = Array.isArray(data) ? data : (data.departments || []);
        departmentStorage.saveDepartmentsSync(list);
        return list;
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
    userName = 'يوسف حجازي'
  ): Promise<DepartmentOrg[]> {
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ bulk: newDepts, userName })
      });

      if (res.ok) {
        const data = await res.json();
        const list: DepartmentOrg[] = Array.isArray(data.departments) ? data.departments : [];
        if (list.length > 0) {
          departmentStorage.saveDepartmentsSync(list);
          return list;
        }
      }
    } catch (err) {
      console.warn('[departmentStorage] Batch mutation error, syncing locally:', err);
    }

    // Merge into local cache
    const current = departmentStorage.getDepartmentsSync();
    const map = new Map<string, DepartmentOrg>(current.map(d => [d.id, d]));
    newDepts.forEach(d => map.set(d.id, d));
    const merged = Array.from(map.values());
    departmentStorage.saveDepartmentsSync(merged);
    return merged;
  },

  /**
   * Seed the complete 4-level enterprise & contracting hierarchy into Cloudflare D1
   */
  async seedEnterpriseHierarchy(
    companyId: string,
    companyNameAr: string,
    userName = 'يوسف حجازي'
  ): Promise<DepartmentOrg[]> {
    const timestamp = getFormattedAuditTimestamp();
    const idMap = new Map<string, string>();

    // Generate unique IDs for all template nodes
    ENTERPRISE_HIERARCHY_TEMPLATE.forEach(node => {
      idMap.set(node.key, `dept_seed_${Date.now()}_${node.key}`);
    });

    const newDepartments: DepartmentOrg[] = ENTERPRISE_HIERARCHY_TEMPLATE.map(node => {
      const id = idMap.get(node.key)!;
      const parentId = node.parentKey ? idMap.get(node.parentKey) || null : null;

      const auditEntry: DepartmentAuditLogEntry = {
        id: `audit_dept_${Date.now()}_seed_${node.key}`,
        departmentId: id,
        timestamp,
        userName,
        action: 'create',
        actionLabelAr: 'تأسيس الهيكل القياسي المتكامل',
        changes: [
          { field: 'nameAr', fieldLabel: 'اسم الوحدة الإدارية', oldValue: '—', newValue: node.nameAr },
          { field: 'level', fieldLabel: 'المستوى الهيكلي', oldValue: '—', newValue: String(node.level) }
        ]
      };

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
        auditLogs: [auditEntry],
        createdAt: timestamp,
        updatedAt: timestamp
      };
    });

    return await departmentStorage.saveDepartmentsBatch(newDepartments, userName);
  }
};
