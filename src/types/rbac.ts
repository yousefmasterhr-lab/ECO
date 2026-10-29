import React from 'react';
import {
  Building2,
  Activity,
  Landmark,
  Users,
  HardHat,
  Mail,
  Scale,
  ShieldCheck,
  UserCheck,
  ScrollText,
  ConciergeBell,
  Settings
} from 'lucide-react';

export type DepartmentKey =
  | 'companies'
  | 'executive'
  | 'finance'
  | 'hr'
  | 'engineering'
  | 'cts'
  | 'legal'
  | 'insurance'
  | 'ats'
  | 'decrees'
  | 'reception'
  | 'settings';

export type MatrixActionKey =
  | 'view'
  | 'create'
  | 'edit'
  | 'docs'
  | 'status'
  | 'audit'
  | 'delete';

export interface MatrixActionDef {
  id: MatrixActionKey;
  labelAr: string;
  labelEn: string;
  shortLabelAr: string;
}

export const MATRIX_ACTIONS: MatrixActionDef[] = [
  { id: 'view', labelAr: 'عرض القسم', labelEn: 'View', shortLabelAr: 'عرض' },
  { id: 'create', labelAr: 'إضافة سجل', labelEn: 'Create', shortLabelAr: 'إضافة' },
  { id: 'edit', labelAr: 'تعديل البيانات', labelEn: 'Edit', shortLabelAr: 'تعديل' },
  { id: 'docs', labelAr: 'المرفقات والوثائق', labelEn: 'Docs', shortLabelAr: 'مرفقات' },
  { id: 'status', labelAr: 'تفعيل / إيقاف', labelEn: 'Status', shortLabelAr: 'حالة' },
  { id: 'audit', labelAr: 'سجل التعديلات', labelEn: 'Audit', shortLabelAr: 'تدقيق' },
  { id: 'delete', labelAr: 'حذف', labelEn: 'Delete', shortLabelAr: 'حذف' },
];

export interface SubModuleMatrixRow {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  actions: Record<MatrixActionKey, { key: string; labelAr?: string } | null>;
}

export interface ERPModuleMatrixConfig {
  id: DepartmentKey;
  titleAr: string;
  titleEn: string;
  icon: React.ElementType;
  colorVar: string;
  badge: string;
  descriptionAr: string;
  subModules: SubModuleMatrixRow[];
  allPermissionKeys: string[];
}

export interface RbacPermission {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  categoryAr: string;
  descriptionAr: string;
  categoryIcon: React.ElementType;
}

export interface DepartmentRbacGroup {
  id: DepartmentKey;
  nameAr: string;
  nameEn: string;
  icon: React.ElementType;
  colorVar: string;
  badge: string;
  descriptionAr: string;
  permissions: RbacPermission[];
}

// ==============================================================================
// Complete Matrix Configuration for all 12 ERP Modules
// ==============================================================================
export const ERP_MODULES_MATRIX_CONFIG: Record<DepartmentKey, ERPModuleMatrixConfig> = {
  // 1. إدارة الشركات (Company Management) - 5 أقسام فرعية، 28+ صلاحية دقيقة
  companies: {
    id: 'companies',
    titleAr: 'إدارة الشركات',
    titleEn: 'Companies Management',
    icon: Building2,
    colorVar: '#D97706',
    badge: 'الشركات',
    descriptionAr: 'دليل الشركات القانونية، التراخيص والسجلات، الفروع والمواقع، الهيكل الإداري، والمفوضون.',
    subModules: [
      {
        id: 'comp_directory',
        titleAr: 'دليل الشركات',
        titleEn: 'Company Directory',
        descriptionAr: 'بيانات الشركات والكيانات القانونية وهيكل المساهمين ورؤوس الأموال وحالة النشاط',
        actions: {
          view: { key: 'companies.directory.view', labelAr: 'عرض الشركات' },
          create: { key: 'companies.directory.create', labelAr: 'إضافة شركة' },
          edit: { key: 'companies.directory.edit', labelAr: 'تعديل بيانات الشركة' },
          docs: { key: 'companies.directory.view_docs', labelAr: 'وثائق التأسيس' },
          status: { key: 'companies.directory.toggle_status', labelAr: 'تغيير حالة النشاط' },
          audit: { key: 'companies.directory.view_audit', labelAr: 'سجل حركات الشركة' },
          delete: { key: 'companies.directory.delete', labelAr: 'حذف الشركة' },
        },
      },
      {
        id: 'comp_licenses',
        titleAr: 'السجلات والتراخيص',
        titleEn: 'Records & Licenses',
        descriptionAr: 'السجل التجاري والبطاقة الضريبية والتأمينات والوثائق ومواعيد التجديد وتنبيهات السريان',
        actions: {
          view: { key: 'companies.licenses.view', labelAr: 'عرض التراخيص' },
          create: { key: 'companies.licenses.create', labelAr: 'إضافة سجل/ترخيص' },
          edit: { key: 'companies.licenses.edit', labelAr: 'تعديل السجل التجاري' },
          docs: { key: 'companies.licenses.download', labelAr: 'تحميل المرفقات والشهادات' },
          status: null,
          audit: { key: 'companies.licenses.view_audit', labelAr: 'سجل تدقيق التراخيص' },
          delete: { key: 'companies.licenses.delete', labelAr: 'حذف السجل/الترخيص' },
        },
      },
      {
        id: 'comp_branches',
        titleAr: 'الفروع والمواقع',
        titleEn: 'Branches & Sites',
        descriptionAr: 'المقرات الإدارية، المستودعات المركزية، الورش ومواقع المشروعات الميدانية',
        actions: {
          view: { key: 'companies.branches.view', labelAr: 'عرض الفروع' },
          create: { key: 'companies.branches.create', labelAr: 'إنشاء فرع جديد' },
          edit: { key: 'companies.branches.edit', labelAr: 'تعديل بيانات الموقع' },
          docs: null,
          status: null,
          audit: { key: 'companies.branches.view_audit', labelAr: 'سجل تدقيق الفروع' },
          delete: { key: 'companies.branches.delete', labelAr: 'حذف الفرع' },
        },
      },
      {
        id: 'comp_structure',
        titleAr: 'الهيكل ومراكز التكلفة',
        titleEn: 'Org & Cost Centers',
        descriptionAr: 'الشجرة الهرمية للإدارات والأقسام وربط مراكز التكلفة المحاسبية والمسؤوليات',
        actions: {
          view: { key: 'companies.org.view', labelAr: 'عرض الهيكل' },
          create: { key: 'companies.org.create', labelAr: 'إضافة وحدة تنظيمية' },
          edit: { key: 'companies.org.edit', labelAr: 'تعديل مراكز التكلفة' },
          docs: null,
          status: null,
          audit: { key: 'companies.org.view_audit', labelAr: 'سجل تغييرات الهيكل' },
          delete: { key: 'companies.org.delete', labelAr: 'حذف وحدة/مركز' },
        },
      },
      {
        id: 'comp_signatories',
        titleAr: 'المفوضون والصلاحيات',
        titleEn: 'Signatories & Powers',
        descriptionAr: 'التوكيلات بالشهر العقاري وأسقف التوقيع البنكية والتعاقدية وصلاحيات التمثيل',
        actions: {
          view: { key: 'companies.signatories.view', labelAr: 'عرض المفوضين' },
          create: { key: 'companies.signatories.create', labelAr: 'إضافة مفوض جديد' },
          edit: { key: 'companies.signatories.edit', labelAr: 'تعديل حدود الصلاحيات' },
          docs: { key: 'companies.signatories.download_poa', labelAr: 'تحميل التوكيلات الرسمية' },
          status: { key: 'companies.signatories.status', labelAr: 'إلغاء/تفعيل التوكيل' },
          audit: { key: 'companies.signatories.view_audit', labelAr: 'سجل حركات التفويض' },
          delete: { key: 'companies.signatories.delete', labelAr: 'حذف المفوض' },
        },
      },
    ],
    allPermissionKeys: [],
  },

  // 2. الإدارة العليا والاستراتيجية (C-Suite)
  executive: {
    id: 'executive',
    titleAr: 'الإدارة العليا والاستراتيجية',
    titleEn: 'Executive Strategy & Governance',
    icon: Activity,
    colorVar: '#D99B26',
    badge: 'C-Suite',
    descriptionAr: 'مؤشرات الأداء الموحدة، مصفوفة المخاطر، الاعتمادات الاستراتيجية، وإقفال الفترات.',
    subModules: [
      {
        id: 'exec_kpi',
        titleAr: 'مؤشرات الأداء الموحدة',
        titleEn: 'Unified KPIs',
        descriptionAr: 'متابعة ربحية الشركات التابعة، التدفق النقدي، ونسب الإنجاز العامة',
        actions: {
          view: { key: 'exec.kpi.view', labelAr: 'عرض المؤشرات' },
          create: { key: 'exec.kpi.create', labelAr: 'تحديد أهداف جديدة' },
          edit: { key: 'exec.kpi.edit', labelAr: 'تعديل المعايير' },
          docs: { key: 'exec.kpi.docs', labelAr: 'تقارير الأداء التنفيذي' },
          status: { key: 'exec.kpi.status', labelAr: 'تثبيت النتائج' },
          audit: { key: 'exec.kpi.audit', labelAr: 'سجل تدقيق الأهداف' },
          delete: { key: 'exec.kpi.delete', labelAr: 'حذف مؤشر' },
        },
      },
      {
        id: 'exec_risks',
        titleAr: 'مصفوفة المخاطر المؤسسية',
        titleEn: 'Enterprise Risks',
        descriptionAr: 'تقييم المخاطر المالية والتعاقدية والميدانية وخطط المعالجة والتحوط',
        actions: {
          view: { key: 'exec.risks.view', labelAr: 'عرض مصفوفة المخاطر' },
          create: { key: 'exec.risks.create', labelAr: 'تسجيل خطر استراتيجي' },
          edit: { key: 'exec.risks.edit', labelAr: 'تحديث خطة المعالجة' },
          docs: { key: 'exec.risks.docs', labelAr: 'دراسات تقييم المخاطر' },
          status: { key: 'exec.risks.status', labelAr: 'تغيير مستوى التهديد' },
          audit: { key: 'exec.risks.audit', labelAr: 'سجل التقييمات' },
          delete: { key: 'exec.risks.delete', labelAr: 'إسقاط الخطر' },
        },
      },
      {
        id: 'exec_financial',
        titleAr: 'التقرير المالي والتشغيلي',
        titleEn: 'Financial Overview',
        descriptionAr: 'نظرة شاملة ومقارنة مالية للأرباح والخسائر والسيولة الاستراتيجية',
        actions: {
          view: { key: 'exec.financial.view', labelAr: 'الاطلاع على النظرة المالية' },
          create: { key: 'exec.financial.create', labelAr: 'إنشاء توقعات فصلية' },
          edit: { key: 'exec.financial.edit', labelAr: 'تعديل الخطط الاستثمارية' },
          docs: { key: 'exec.financial.docs', labelAr: 'تصدير القوائم التنفيذية' },
          status: { key: 'exec.financial.status', labelAr: 'إقفال الربع المالي' },
          audit: { key: 'exec.financial.audit', labelAr: 'سجل التدقيق المؤسسي' },
          delete: { key: 'exec.financial.delete', labelAr: 'حذف التقديرات' },
        },
      },
      {
        id: 'exec_governance',
        titleAr: 'الاعتمادات والحوكمة',
        titleEn: 'Corporate Governance',
        descriptionAr: 'الموافقة على النفقات الرأسمالية (Capex) واعتماد السياسات الملزمة',
        actions: {
          view: { key: 'exec.governance.view', labelAr: 'عرض سجل القرارات' },
          create: { key: 'exec.governance.create', labelAr: 'إصدار قرار مجلس إدارة' },
          edit: { key: 'exec.governance.edit', labelAr: 'تعديل بنود القرار' },
          docs: { key: 'exec.governance.docs', labelAr: 'المحاضر الموقعة' },
          status: { key: 'exec.governance.status', labelAr: 'تفعيل ونشر القرار' },
          audit: { key: 'exec.governance.audit', labelAr: 'سجل تصويت الأعضاء' },
          delete: { key: 'exec.governance.delete', labelAr: 'إلغاء قرار رسمي' },
        },
      },
    ],
    allPermissionKeys: [],
  },

  // 3. الشؤون المالية والخزينة (Finance)
  finance: {
    id: 'finance',
    titleAr: 'الشؤون المالية والخزينة',
    titleEn: 'Financial Affairs & Treasury',
    icon: Landmark,
    colorVar: '#059669',
    badge: 'مالية',
    descriptionAr: 'الأستاذ العام، سندات القبض والصرف، الخزينة، الشيكات، الفوترة ZATCA والمستخلصات.',
    subModules: [
      {
        id: 'fin_chart',
        titleAr: 'الدليل المحاسبي والأستاذ العام',
        titleEn: 'Chart of Accounts & GL',
        descriptionAr: 'الهيكل الشجري للحسابات، المستويات 1-5، والأرصدة الافتتاحية',
        actions: {
          view: { key: 'fin.chart.view', labelAr: 'عرض شجرة الحسابات' },
          create: { key: 'fin.chart.create', labelAr: 'إضافة حساب جديد' },
          edit: { key: 'fin.chart.edit', labelAr: 'تعديل طبيعة الحساب' },
          docs: { key: 'fin.chart.docs', labelAr: 'مستندات التأسيس المحاسبي' },
          status: { key: 'fin.chart.status', labelAr: 'تجميد/تفعيل الحساب' },
          audit: { key: 'fin.chart.audit', labelAr: 'مراجعة وتدقيق الدليل' },
          delete: { key: 'fin.chart.delete', labelAr: 'حذف الحساب' },
        },
      },
      {
        id: 'fin_treasury',
        titleAr: 'الخزينة والبنوك والسيولة',
        titleEn: 'Treasury & Cash',
        descriptionAr: 'إدارة الصناديق النقدية، الحسابات البنكية، التسويات ومناقلات السيولة',
        actions: {
          view: { key: 'fin.treasury.view', labelAr: 'عرض أرصدة الخزائن والبنوك' },
          create: { key: 'fin.treasury.create', labelAr: 'فتح حساب بنكي / صندوق' },
          edit: { key: 'fin.treasury.edit', labelAr: 'تعديل بيانات الحساب' },
          docs: { key: 'fin.treasury.docs', labelAr: 'كشوف الحسابات البنكية' },
          status: { key: 'fin.treasury.status', labelAr: 'إجراء مطابقة وتسوية بنكية' },
          audit: { key: 'fin.treasury.audit', labelAr: 'سجل حركة الخزينة' },
          delete: { key: 'fin.treasury.delete', labelAr: 'إغلاق الخزينة/الحساب' },
        },
      },
      {
        id: 'fin_vouchers',
        titleAr: 'سندات القبض والصرف',
        titleEn: 'Receipt & Payment Vouchers',
        descriptionAr: 'تسجيل المقبوضات وصرف مستحقات الموردين والعهد واعتماد الدفعات',
        actions: {
          view: { key: 'fin.vouchers.view', labelAr: 'عرض السندات' },
          create: { key: 'fin.vouchers.create', labelAr: 'تحرير سند قبض أو صرف' },
          edit: { key: 'fin.vouchers.edit', labelAr: 'تعديل مسودة سند' },
          docs: { key: 'fin.vouchers.docs', labelAr: 'مرفقات وإيصالات الدفع' },
          status: { key: 'fin.vouchers.status', labelAr: 'الاعتماد المالي النهائي' },
          audit: { key: 'fin.vouchers.audit', labelAr: 'سجل التعديلات المحاسبية' },
          delete: { key: 'fin.vouchers.delete', labelAr: 'إلغاء السند' },
        },
      },
      {
        id: 'fin_cheques',
        titleAr: 'أوراق القبض والدفع والشيكات',
        titleEn: 'Commercial Paper & Cheques',
        descriptionAr: 'شيكات العملاء الواردة تحت التحصيل وحوافظ الإيداع والشيكات الصادرة',
        actions: {
          view: { key: 'fin.cheques.view', labelAr: 'عرض سجل الشيكات' },
          create: { key: 'fin.cheques.create', labelAr: 'تسجيل شيك وارد/صادر' },
          edit: { key: 'fin.cheques.edit', labelAr: 'تعديل بيانات الشيك' },
          docs: { key: 'fin.cheques.docs', labelAr: 'صور الشيكات والحوافظ' },
          status: { key: 'fin.cheques.status', labelAr: 'إثبات تحصيل / ارتداد' },
          audit: { key: 'fin.cheques.audit', labelAr: 'سجل متابعة الحوافظ' },
          delete: { key: 'fin.cheques.delete', labelAr: 'إلغاء شيك' },
        },
      },
      {
        id: 'fin_journals',
        titleAr: 'قيود اليومية العامة',
        titleEn: 'General Journal Entries',
        descriptionAr: 'إدخال قيود التسوية، مراجعة المسودات، والترحيل النهائي للحسابات',
        actions: {
          view: { key: 'fin.journals.view', labelAr: 'عرض قيود اليومية' },
          create: { key: 'fin.journals.create', labelAr: 'إنشاء قيد محاسبي' },
          edit: { key: 'fin.journals.edit', labelAr: 'تعديل أطراف القيد' },
          docs: { key: 'fin.journals.docs', labelAr: 'المستندات المؤيدة للقيد' },
          status: { key: 'fin.journals.status', labelAr: 'ترحيل / فك ترحيل القيد' },
          audit: { key: 'fin.journals.audit', labelAr: 'سجل تدقيق القيود' },
          delete: { key: 'fin.journals.delete', labelAr: 'حذف قيد مسودة' },
        },
      },
      {
        id: 'fin_sales',
        titleAr: 'المبيعات والفوترة ZATCA',
        titleEn: 'Sales & E-Invoicing',
        descriptionAr: 'إصدار فواتير المبيعات، توقيع TLV Base64، وضريبة القيمة المضافة',
        actions: {
          view: { key: 'fin.sales.view', labelAr: 'عرض الفواتير الإلكترونية' },
          create: { key: 'fin.sales.create', labelAr: 'إصدار فاتورة ضريبية' },
          edit: { key: 'fin.sales.edit', labelAr: 'تعديل أسعار وخصومات' },
          docs: { key: 'fin.sales.docs', labelAr: 'تصدير PDF وXML الضريبي' },
          status: { key: 'fin.sales.status', labelAr: 'اعتماد وتوقيع ZATCA' },
          audit: { key: 'fin.sales.audit', labelAr: 'سجل الفواتير المرسلة' },
          delete: { key: 'fin.sales.delete', labelAr: 'إلغاء/إشعار دائن' },
        },
      },
      {
        id: 'fin_procurement',
        titleAr: 'المشتريات والمخزون المالي',
        titleEn: 'Procurement & Inventory',
        descriptionAr: 'فواتير الموردين، تسويات المخزون السلعي، وتكلفة المتوسط المرجح',
        actions: {
          view: { key: 'fin.procurement.view', labelAr: 'عرض فواتير الشراء والمخزون' },
          create: { key: 'fin.procurement.create', labelAr: 'تسجيل فاتورة مورد' },
          edit: { key: 'fin.procurement.edit', labelAr: 'تسوية أسعار التكلفة' },
          docs: { key: 'fin.procurement.docs', labelAr: 'أذون الإضافة المخزنية' },
          status: { key: 'fin.procurement.status', labelAr: 'اعتماد استحقاق الفاتورة' },
          audit: { key: 'fin.procurement.audit', labelAr: 'سجل تسويات المخزون' },
          delete: { key: 'fin.procurement.delete', labelAr: 'حذف فاتورة مورد' },
        },
      },
      {
        id: 'fin_reports',
        titleAr: 'التقارير المالية والختامية',
        titleEn: 'Financial BI & Reports',
        descriptionAr: 'ميزان المراجعة، قائمة الدخل، الميزانية العمومية وكشوف الحسابات',
        actions: {
          view: { key: 'fin.reports.view', labelAr: 'عرض القوائم المالية' },
          create: { key: 'fin.reports.create', labelAr: 'توليد تقرير تحليلي مخصص' },
          edit: { key: 'fin.reports.edit', labelAr: 'تعديل فلاتر ومراكز التقارير' },
          docs: { key: 'fin.reports.docs', labelAr: 'طباعة وتصدير Excel/PDF' },
          status: { key: 'fin.reports.status', labelAr: 'اعتماد الحسابات الختامية' },
          audit: { key: 'fin.reports.audit', labelAr: 'سجل طباعة التقارير' },
          delete: { key: 'fin.reports.delete', labelAr: 'حذف نموذج تقرير' },
        },
      },
    ],
    allPermissionKeys: [],
  },

  // 4. إدارة الموارد البشرية (HRMS)
  hr: {
    id: 'hr',
    titleAr: 'إدارة الموارد البشرية (HRMS)',
    titleEn: 'Human Resources (HRMS)',
    icon: Users,
    colorVar: '#EBB34D',
    badge: 'HRMS',
    descriptionAr: 'ملفات الموظفين، عقود العمل، كشوف المرتبات، مسيرات الأجور، الإجازات، والدوام.',
    subModules: [
      {
        id: 'hr_directory',
        titleAr: 'دليل الموظفين والملفات',
        titleEn: 'Employee Directory',
        descriptionAr: 'السجلات الوظيفية، الأرشيف الإلكتروني، والبيانات الشخصية والمهنية',
        actions: {
          view: { key: 'hr.directory.view', labelAr: 'عرض ملفات الموظفين' },
          create: { key: 'hr.directory.create', labelAr: 'تسجيل موظف جديد' },
          edit: { key: 'hr.directory.edit', labelAr: 'تعديل بيانات العاملين' },
          docs: { key: 'hr.directory.docs', labelAr: 'مسوغات التعيين والوثائق' },
          status: { key: 'hr.directory.status', labelAr: 'تحديث حالة العمل (نشط/معلق)' },
          audit: { key: 'hr.directory.audit', labelAr: 'سجل حركات الموظف' },
          delete: { key: 'hr.directory.delete', labelAr: 'إنهاء الخدمة/أرشفة' },
        },
      },
      {
        id: 'hr_payroll',
        titleAr: 'مسير الرواتب والأجور',
        titleEn: 'Standard Payroll',
        descriptionAr: 'احتساب مسير الرواتب الشهري، البدلات، الخصومات والتأمينات',
        actions: {
          view: { key: 'hr.payroll.view', labelAr: 'عرض مسير الأجور' },
          create: { key: 'hr.payroll.create', labelAr: 'احتساب كشف الشهر' },
          edit: { key: 'hr.payroll.edit', labelAr: 'تعديل بنود الرواتب والبدلات' },
          docs: { key: 'hr.payroll.docs', labelAr: 'قسائم الرواتب Payslips' },
          status: { key: 'hr.payroll.status', labelAr: 'الاعتماد المالي للمسير' },
          audit: { key: 'hr.payroll.audit', labelAr: 'سجل التعديلات على الرواتب' },
          delete: { key: 'hr.payroll.delete', labelAr: 'إلغاء مسودة المسير' },
        },
      },
      {
        id: 'hr_disbursement',
        titleAr: 'كشوف صرف الرواتب',
        titleEn: 'Disbursement Sheets',
        descriptionAr: 'الموافقة النهائية على التحويلات البنكية للمرتبات والسيولة',
        actions: {
          view: { key: 'hr.disbursement.view', labelAr: 'عرض كشوف الصرف' },
          create: { key: 'hr.disbursement.create', labelAr: 'إنشاء ملف التحويل البنكي' },
          edit: { key: 'hr.disbursement.edit', labelAr: 'تعديل أرقام الآيبان والحسابات' },
          docs: { key: 'hr.disbursement.docs', labelAr: 'إشعارات التحويل البنكي' },
          status: { key: 'hr.disbursement.status', labelAr: 'اعتماد الصرف النهائي' },
          audit: { key: 'hr.disbursement.audit', labelAr: 'سجل تأكيد الصرف' },
          delete: { key: 'hr.disbursement.delete', labelAr: 'إلغاء أمر الصرف' },
        },
      },
      {
        id: 'hr_contracts',
        titleAr: 'سجل عقود العمل',
        titleEn: 'Contracts Ledger',
        descriptionAr: 'تحرير عقود العمل، بنود الأجور، تجديد العقود، وإشعارات الانتهاء',
        actions: {
          view: { key: 'hr.contracts.view', labelAr: 'عرض عقود الموظفين' },
          create: { key: 'hr.contracts.create', labelAr: 'تحرير عقد عمل جديد' },
          edit: { key: 'hr.contracts.edit', labelAr: 'تجديد وتعديل بنود العقد' },
          docs: { key: 'hr.contracts.docs', labelAr: 'تحميل العقود الموقعة' },
          status: { key: 'hr.contracts.status', labelAr: 'تفعيل العقد وسريانه' },
          audit: { key: 'hr.contracts.audit', labelAr: 'سجل تجديدات العقود' },
          delete: { key: 'hr.contracts.delete', labelAr: 'إنهاء العقد' },
        },
      },
      {
        id: 'hr_attendance',
        titleAr: 'الحضور والدوام',
        titleEn: 'Attendance Logs',
        descriptionAr: 'متابعة سجلات البصمة، التأخير، الغياب وساعات العمل الإضافية',
        actions: {
          view: { key: 'hr.attendance.view', labelAr: 'عرض سجلات البصمة والدوام' },
          create: { key: 'hr.attendance.create', labelAr: 'إدخال حركة حضور يدوي' },
          edit: { key: 'hr.attendance.edit', labelAr: 'تسوية ساعات التأخير والإضافي' },
          docs: { key: 'hr.attendance.docs', labelAr: 'تقارير الدوام الشهرية' },
          status: { key: 'hr.attendance.status', labelAr: 'إغلاق سجل دوام الشهر' },
          audit: { key: 'hr.attendance.audit', labelAr: 'سجل تعديلات الحركات' },
          delete: { key: 'hr.attendance.delete', labelAr: 'حذف تسجيل دوام خاطئ' },
        },
      },
      {
        id: 'hr_leaves',
        titleAr: 'رصيد الإجازات والأذونات',
        titleEn: 'Time-Off Balance',
        descriptionAr: 'إدارة رصيد الإجازات السنوية، المرضية، طلبات المغادرة واعتمادها',
        actions: {
          view: { key: 'hr.leaves.view', labelAr: 'عرض أرصدة وطلبات الإجازات' },
          create: { key: 'hr.leaves.create', labelAr: 'تقديم طلب إجازة/إذن' },
          edit: { key: 'hr.leaves.edit', labelAr: 'تعديل تواريخ الإجازة' },
          docs: { key: 'hr.leaves.docs', labelAr: 'التقارير الطبية والمستندات' },
          status: { key: 'hr.leaves.status', labelAr: 'الموافقة/رفض الإجازة' },
          audit: { key: 'hr.leaves.audit', labelAr: 'سجل احتساب الرصيد' },
          delete: { key: 'hr.leaves.delete', labelAr: 'إلغاء الإجازة' },
        },
      },
      {
        id: 'hr_advances',
        titleAr: 'السلف والمستحقات',
        titleEn: 'Staff Advances',
        descriptionAr: 'طلبات السلف المالية، جدول الأقساط الشهرية وخصمها من الرواتب',
        actions: {
          view: { key: 'hr.advances.view', labelAr: 'عرض سجل السلف' },
          create: { key: 'hr.advances.create', labelAr: 'تسجيل طلب سلفة جديدة' },
          edit: { key: 'hr.advances.edit', labelAr: 'إعادة جدولة الأقساط' },
          docs: { key: 'hr.advances.docs', labelAr: 'إقرارات استلام السلفة' },
          status: { key: 'hr.advances.status', labelAr: 'اعتماد صرف السلفة' },
          audit: { key: 'hr.advances.audit', labelAr: 'سجل سداد الأقساط' },
          delete: { key: 'hr.advances.delete', labelAr: 'إلغاء السلفة' },
        },
      },
      {
        id: 'hr_penalties',
        titleAr: 'الحوافز والجزاءات',
        titleEn: 'Bonuses & Deductions',
        descriptionAr: 'إقرار المكافآت أو الجزاءات وفق لائحة تنظيم العمل والرقابة',
        actions: {
          view: { key: 'hr.penalties.view', labelAr: 'عرض سجل المكافآت والجزاءات' },
          create: { key: 'hr.penalties.create', labelAr: 'إصدار حافز أو قرار خصم' },
          edit: { key: 'hr.penalties.edit', labelAr: 'تعديل قيمة أو سبب الإجراء' },
          docs: { key: 'hr.penalties.docs', labelAr: 'محاضر التحقيق والقرارات' },
          status: { key: 'hr.penalties.status', labelAr: 'اعتماد التطبيق على الراتب' },
          audit: { key: 'hr.penalties.audit', labelAr: 'سجل حركات الانضباط' },
          delete: { key: 'hr.penalties.delete', labelAr: 'إلغاء الخصم/الحافز' },
        },
      },
    ],
    allPermissionKeys: [],
  },

  // 5. المكتب الفني والمشاريع (Technical Office)
  engineering: {
    id: 'engineering',
    titleAr: 'المكتب الفني والمشاريع',
    titleEn: 'Technical Office & Projects',
    icon: HardHat,
    colorVar: '#3B7A57',
    badge: 'مشاريع',
    descriptionAr: 'مستخلصات المالك، مقاولي الباطن، كشوف الحصر، أوامر التغيير (VOs)، والجداول الزمنية.',
    subModules: [
      {
        id: 'eng_projects',
        titleAr: 'سجل المشاريع والعقود',
        titleEn: 'Project Registry',
        descriptionAr: 'بيانات المشروعات الإنشائية، جهات الإسناد، القيمة التعاقدية ونسب الإنجاز',
        actions: {
          view: { key: 'eng.projects.view', labelAr: 'عرض بيانات المشاريع' },
          create: { key: 'eng.projects.create', labelAr: 'تسجيل مشروع جديد' },
          edit: { key: 'eng.projects.edit', labelAr: 'تعديل بيانات المشروع' },
          docs: { key: 'eng.projects.docs', labelAr: 'عقود المشروع والتراخيص' },
          status: { key: 'eng.projects.status', labelAr: 'تحديث حالة المشروع' },
          audit: { key: 'eng.projects.audit', labelAr: 'سجل العمليات الميدانية' },
          delete: { key: 'eng.projects.delete', labelAr: 'أرشفة/حذف مشروع' },
        },
      },
      {
        id: 'eng_ipc',
        titleAr: 'المستخلصات وشهادات الدفع',
        titleEn: 'Payment Certificates (IPC)',
        descriptionAr: 'إعداد واعتماد مستخلصات المالك ومراجعة مستخلصات مقاولي الباطن',
        actions: {
          view: { key: 'eng.ipc.view', labelAr: 'عرض المستخلصات' },
          create: { key: 'eng.ipc.create', labelAr: 'إصدار مستخلص تنفيذي' },
          edit: { key: 'eng.ipc.edit', labelAr: 'تعديل كميات وبنود المستخلص' },
          docs: { key: 'eng.ipc.docs', labelAr: 'شهادات الإنجاز وتواقيع الاستشاري' },
          status: { key: 'eng.ipc.status', labelAr: 'اعتماد وتثبيت المستخلص' },
          audit: { key: 'eng.ipc.audit', labelAr: 'سجل تدقيق شهادات الدفع' },
          delete: { key: 'eng.ipc.delete', labelAr: 'إلغاء مستخلص مسودة' },
        },
      },
      {
        id: 'eng_boq',
        titleAr: 'حصر الكميات والمقايسات',
        titleEn: 'Bill of Quantities (BOQ)',
        descriptionAr: 'إدخال بنود المقايسات، تحديث كميات التنفيذ الميداني ومطابقتها',
        actions: {
          view: { key: 'eng.boq.view', labelAr: 'عرض جدول المقايسات BOQ' },
          create: { key: 'eng.boq.create', labelAr: 'إضافة بنود مقايسة جديدة' },
          edit: { key: 'eng.boq.edit', labelAr: 'تحديث أسعار وكميات البنود' },
          docs: { key: 'eng.boq.docs', labelAr: 'شيتات الحصر الهندسية' },
          status: { key: 'eng.boq.status', labelAr: 'اعتماد كشف الحصر النهائي' },
          audit: { key: 'eng.boq.audit', labelAr: 'سجل تعديل الكميات' },
          delete: { key: 'eng.boq.delete', labelAr: 'حذف بند مقايسة' },
        },
      },
      {
        id: 'eng_schedule',
        titleAr: 'الجدول الزمني والمسار الحرج',
        titleEn: 'Schedule & Milestones',
        descriptionAr: 'متابعة مراحل المشروع، المعالم الرئيسية، والمسار الحرج ومعدل الإنجاز',
        actions: {
          view: { key: 'eng.schedule.view', labelAr: 'عرض الجدول الزمني' },
          create: { key: 'eng.schedule.create', labelAr: 'إضافة مرحلة أو معلم رئيسي' },
          edit: { key: 'eng.schedule.edit', labelAr: 'تعديل المواعيد والمسار الحرج' },
          docs: { key: 'eng.schedule.docs', labelAr: 'مخططات Primavera/Gantt' },
          status: { key: 'eng.schedule.status', labelAr: 'اعتماد التحديث الدوري' },
          audit: { key: 'eng.schedule.audit', labelAr: 'سجل تأخيرات ومتابعة المهام' },
          delete: { key: 'eng.schedule.delete', labelAr: 'حذف مرحلة من الجدول' },
        },
      },
      {
        id: 'eng_submittals',
        titleAr: 'الاعتمادات الفنية والعينات',
        titleEn: 'Technical Submittals',
        descriptionAr: 'إدارة اعتمادات المواد، المخططات التنفيذية Shop Drawings وعينات الموقع',
        actions: {
          view: { key: 'eng.submittals.view', labelAr: 'عرض سجل الاعتمادات الفنية' },
          create: { key: 'eng.submittals.create', labelAr: 'تقديم طلب اعتماد عينة/مادة' },
          edit: { key: 'eng.submittals.edit', labelAr: 'تعديل بيانات الاعتماد الفني' },
          docs: { key: 'eng.submittals.docs', labelAr: 'المخططات التنفيذية والمواصفات' },
          status: { key: 'eng.submittals.status', labelAr: 'تحديث موقف اعتماد الاستشاري' },
          audit: { key: 'eng.submittals.audit', labelAr: 'سجل ملاحظات الاستشاري' },
          delete: { key: 'eng.submittals.delete', labelAr: 'سحب طلب الاعتماد' },
        },
      },
      {
        id: 'eng_rfi',
        titleAr: 'استفسارات الموقع (RFIs)',
        titleEn: 'Site Inquiries & RFIs',
        descriptionAr: 'إصدار ومتابعة استفسارات الموقع الهندسية والردود الفنية من المصمم',
        actions: {
          view: { key: 'eng.rfi.view', labelAr: 'عرض سجل استفسارات الموقع' },
          create: { key: 'eng.rfi.create', labelAr: 'إصدار استفسار فني جديد' },
          edit: { key: 'eng.rfi.edit', labelAr: 'تحديث بيانات ومرفقات RFI' },
          docs: { key: 'eng.rfi.docs', labelAr: 'المخططات والمراسلات الفنية' },
          status: { key: 'eng.rfi.status', labelAr: 'إغلاق المعاملة بالرد النهائي' },
          audit: { key: 'eng.rfi.audit', labelAr: 'سجل مسار المراسلة' },
          delete: { key: 'eng.rfi.delete', labelAr: 'إلغاء الاستفسار' },
        },
      },
    ],
    allPermissionKeys: [],
  },

  // 6. الصادر والوارد (CTS - Correspondence)
  cts: {
    id: 'cts',
    titleAr: 'الصادر والوارد (CTS)',
    titleEn: 'Correspondence (CTS)',
    icon: Mail,
    colorVar: '#0D9488',
    badge: 'مراسلات',
    descriptionAr: 'قيد المراسلات الواردة، إصدار الخطابات الصادرة، التوجيه الإداري، والأرشفة وسرية المستندات.',
    subModules: [
      {
        id: 'cts_incoming',
        titleAr: 'الوارد العام وقيد المراسلات',
        titleEn: 'Incoming Correspondence',
        descriptionAr: 'إثبات وصول الخطابات وتوليد الرقم الإشاري والباركود والتسجيل الرقمي',
        actions: {
          view: { key: 'cts.incoming.view', labelAr: 'عرض سجل الخطابات الواردة' },
          create: { key: 'cts.incoming.create', labelAr: 'قيد وتسجيل خطاب وارد' },
          edit: { key: 'cts.incoming.edit', labelAr: 'تعديل بيانات الخطاب والمرسل' },
          docs: { key: 'cts.incoming.docs', labelAr: 'تحميل ومسح صور الخطاب' },
          status: { key: 'cts.incoming.status', labelAr: 'تحديث حالة المعاملة' },
          audit: { key: 'cts.incoming.audit', labelAr: 'سجل حركات الخطاب' },
          delete: { key: 'cts.incoming.delete', labelAr: 'حذف قيد وارد' },
        },
      },
      {
        id: 'cts_outgoing',
        titleAr: 'الصادر العام واعتماد الخطابات',
        titleEn: 'Outgoing Letters',
        descriptionAr: 'تحرير واعتماد الخطابات الرسمية الموجهة للجهات الحكومية والشركاء',
        actions: {
          view: { key: 'cts.outgoing.view', labelAr: 'عرض سجل الخطابات الصادرة' },
          create: { key: 'cts.outgoing.create', labelAr: 'تحرير مسودة خطاب صادر' },
          edit: { key: 'cts.outgoing.edit', labelAr: 'تعديل صياغة الخطاب' },
          docs: { key: 'cts.outgoing.docs', labelAr: 'الخطابات الموقعة والأختام' },
          status: { key: 'cts.outgoing.status', labelAr: 'الاعتماد النهائي وإصدار الرقم' },
          audit: { key: 'cts.outgoing.audit', labelAr: 'سجل دورة اعتماد الصادر' },
          delete: { key: 'cts.outgoing.delete', labelAr: 'إلغاء خطاب صادر' },
        },
      },
      {
        id: 'cts_routing',
        titleAr: 'التوجيه والإحالة الإدارية',
        titleEn: 'Administrative Routing',
        descriptionAr: 'إحالة المعاملات للإدارات المختصة، تكليف المهام، ومتابعة سرعة الإنجاز',
        actions: {
          view: { key: 'cts.routing.view', labelAr: 'عرض سجل الإحالات' },
          create: { key: 'cts.routing.create', labelAr: 'إحالة معاملة لإدارة/موظف' },
          edit: { key: 'cts.routing.edit', labelAr: 'تعديل التوجيه والتعليمات' },
          docs: { key: 'cts.routing.docs', labelAr: 'شروحات وتأشيرات الإحالة' },
          status: { key: 'cts.routing.status', labelAr: 'إثبات إنجاز المعاملة المحالة' },
          audit: { key: 'cts.routing.audit', labelAr: 'سجل مسار التداول الإداري' },
          delete: { key: 'cts.routing.delete', labelAr: 'سحب الإحالة' },
        },
      },
      {
        id: 'cts_archive',
        titleAr: 'الأرشيف الرقمي والمسح الضوئي',
        titleEn: 'Optical Archive & QR',
        descriptionAr: 'رفع صور الخطابات والمرفقات ومسح الباركود والبحث المتقدم بالـ OCR',
        actions: {
          view: { key: 'cts.archive.view', labelAr: 'البحث في الأرشيف الرقمي' },
          create: { key: 'cts.archive.create', labelAr: 'أرشفة ملفات ضوئية جديدة' },
          edit: { key: 'cts.archive.edit', labelAr: 'تعديل تصنيف وكلمات البحث' },
          docs: { key: 'cts.archive.docs', labelAr: 'تحميل الملفات المؤرشفة' },
          status: { key: 'cts.archive.status', labelAr: 'تثبيت الأرشفة ومنع التعديل' },
          audit: { key: 'cts.archive.audit', labelAr: 'سجل عمليات الاطلاع على الأرشيف' },
          delete: { key: 'cts.archive.delete', labelAr: 'إتلاف/حذف وثيقة مؤرشفة' },
        },
      },
      {
        id: 'cts_confidential',
        titleAr: 'المراسلات السرية والمقيدة',
        titleEn: 'Confidential Records',
        descriptionAr: 'صلاحية فتح وتداول الخطابات المصنفة بدرجة سري للغاية والقرارات الخاصة',
        actions: {
          view: { key: 'cts.confidential.view', labelAr: 'الاطلاع على المعاملات السرية' },
          create: { key: 'cts.confidential.create', labelAr: 'قيد معاملة سرية للغاية' },
          edit: { key: 'cts.confidential.edit', labelAr: 'تعديل درجة السرية' },
          docs: { key: 'cts.confidential.docs', labelAr: 'فتح المرفقات المشفرة' },
          status: { key: 'cts.confidential.status', labelAr: 'منح تفويض اطلاع مؤقت' },
          audit: { key: 'cts.confidential.audit', labelAr: 'سجل فتح الوثائق السرية' },
          delete: { key: 'cts.confidential.delete', labelAr: 'حذف وثيقة سرية' },
        },
      },
    ],
    allPermissionKeys: [],
  },

  // 7. الشؤون القانونية (Legal Affairs)
  legal: {
    id: 'legal',
    titleAr: 'الشؤون القانونية',
    titleEn: 'Legal Affairs & Compliance',
    icon: Scale,
    colorVar: '#B45309',
    badge: 'قانونية',
    descriptionAr: 'متابعة القضايا، مراجعة العقود وتدقيقها، محاضر إثبات الحالة، الإنذارات والتوكيلات الرسمية.',
    subModules: [
      {
        id: 'leg_contracts',
        titleAr: 'العقود والاتفاقيات',
        titleEn: 'Contracts & Agreements',
        descriptionAr: 'المراجعة والتدقيق القانوني لبنود عقود الموردين والمقاولين والشركاء',
        actions: {
          view: { key: 'leg.contracts.view', labelAr: 'عرض مسودات وعقود الشركة' },
          create: { key: 'leg.contracts.create', labelAr: 'صياغة نموذج عقد جديد' },
          edit: { key: 'leg.contracts.edit', labelAr: 'تعديل البنود والشروط القانونية' },
          docs: { key: 'leg.contracts.docs', labelAr: 'العقود النهائية ومرفقاتها' },
          status: { key: 'leg.contracts.status', labelAr: 'الاعتماد القانوني النهائي' },
          audit: { key: 'leg.contracts.audit', labelAr: 'سجل مراجعات الصياغة' },
          delete: { key: 'leg.contracts.delete', labelAr: 'إلغاء مسودة العقد' },
        },
      },
      {
        id: 'leg_cases',
        titleAr: 'القضايا والنزاعات القضائية',
        titleEn: 'Litigation & Disputes',
        descriptionAr: 'قيد ومتابعة الجلسات بالمحاكم، الأحكام، مذكرات الدفاع والخبراء',
        actions: {
          view: { key: 'leg.cases.view', labelAr: 'عرض ملفات القضايا والنزاعات' },
          create: { key: 'leg.cases.create', labelAr: 'قيد دعوى قضائية جديدة' },
          edit: { key: 'leg.cases.edit', labelAr: 'تحديث بيانات الجلسات والقرارات' },
          docs: { key: 'leg.cases.docs', labelAr: 'مذكرات الدفاع والأحكام' },
          status: { key: 'leg.cases.status', labelAr: 'إقفال القضية بعد الحكم النهائي' },
          audit: { key: 'leg.cases.audit', labelAr: 'سجل متابعة الجلسات' },
          delete: { key: 'leg.cases.delete', labelAr: 'حذف ملف قضية ملغاة' },
        },
      },
      {
        id: 'leg_poa',
        titleAr: 'التوكيلات والتفويضات الرسمية',
        titleEn: 'Powers of Attorney',
        descriptionAr: 'سجل التوكيلات التجارية والشهر العقاري للمحامين والمفوضين وصلاحيات التوقيع',
        actions: {
          view: { key: 'leg.poa.view', labelAr: 'عرض التوكيلات السارية والملغاة' },
          create: { key: 'leg.poa.create', labelAr: 'تسجيل توكيل رسمي جديد' },
          edit: { key: 'leg.poa.edit', labelAr: 'تعديل نطاق الصلاحيات والحدود' },
          docs: { key: 'leg.poa.docs', labelAr: 'تحميل صور التوكيلات بالشهر العقاري' },
          status: { key: 'leg.poa.status', labelAr: 'إلغاء أو تجديد التوكيل' },
          audit: { key: 'leg.poa.audit', labelAr: 'سجل تدقيق استخدام التوكيلات' },
          delete: { key: 'leg.poa.delete', labelAr: 'حذف قيد التوكيل' },
        },
      },
      {
        id: 'leg_notices',
        titleAr: 'الإنذارات ومحاضر إثبات الحالة',
        titleEn: 'Legal Notices & Incident Affidavits',
        descriptionAr: 'توجيه خطابات سحب الأعمال، الإنذارات البنكية، ومحاضر إثبات الحالة الميدانية',
        actions: {
          view: { key: 'leg.notices.view', labelAr: 'عرض سجل الإنذارات والمحاضر' },
          create: { key: 'leg.notices.create', labelAr: 'تحرير إنذار قانوني رسمي' },
          edit: { key: 'leg.notices.edit', labelAr: 'تعديل صيغة الإنذار والمحضر' },
          docs: { key: 'leg.notices.docs', labelAr: 'إعلانات المحضرين والإنذارات الموقعة' },
          status: { key: 'leg.notices.status', labelAr: 'تثبيت إرسال الإنذار رسميًا' },
          audit: { key: 'leg.notices.audit', labelAr: 'سجل المتابعة القضائية' },
          delete: { key: 'leg.notices.delete', labelAr: 'إلغاء الإنذار' },
        },
      },
      {
        id: 'leg_advisory',
        titleAr: 'الاستشارات والرأي القانوني',
        titleEn: 'Legal Consultations & Memos',
        descriptionAr: 'إعداد المذكرات وتقديم الرأي القانوني للإدارة العليا في النزاعات والتعاقدات',
        actions: {
          view: { key: 'leg.advisory.view', labelAr: 'عرض سجل الفتاوى والاستشارات' },
          create: { key: 'leg.advisory.create', labelAr: 'تقديم مذكرة رأي قانوني' },
          edit: { key: 'leg.advisory.edit', labelAr: 'تعديل التوصيات القانونية' },
          docs: { key: 'leg.advisory.docs', labelAr: 'المراجع والسوابق القضائية' },
          status: { key: 'leg.advisory.status', labelAr: 'اعتماد المذكرة وإرسالها للإدارة' },
          audit: { key: 'leg.advisory.audit', labelAr: 'سجل التعديلات على الرأي' },
          delete: { key: 'leg.advisory.delete', labelAr: 'حذف مسودة استشارة' },
        },
      },
    ],
    allPermissionKeys: [],
  },

  // 8. التأمينات الاجتماعية (Social Insurance)
  insurance: {
    id: 'insurance',
    titleAr: 'التأمينات الاجتماعية',
    titleEn: 'Social Insurance & Compliance',
    icon: ShieldCheck,
    colorVar: '#D99B26',
    badge: 'تأمينات',
    descriptionAr: 'مركز العمليات التأمينية، استمارات س1 وس2 وس6، السجل التأميني للعاملين، وعاء الأجور والاشتراكات، ولوحة الفحص والامتثال.',
    subModules: [
      {
        id: 'ins_operations',
        titleAr: 'مركز العمليات التأمينية',
        titleEn: 'Insurance Operations Center',
        descriptionAr: 'تسجيل ومتابعة الطلبات التأمينية وأرقام الوارد ورصد التكرار واستيراد وتصدير Excel',
        actions: {
          view: { key: 'ins.operations.view', labelAr: 'عرض مركز العمليات التأمينية' },
          create: { key: 'ins.operations.create', labelAr: 'إضافة واستيراد عمليات تأمينية' },
          edit: { key: 'ins.operations.edit', labelAr: 'تعديل بيانات العملية' },
          docs: { key: 'ins.operations.docs', labelAr: 'معاينة وطباعة مرفقات العمليات' },
          status: { key: 'ins.operations.status', labelAr: 'تغيير حالة الطلبات التأمينية' },
          audit: { key: 'ins.operations.audit', labelAr: 'سجل تدقيق العمليات' },
          delete: { key: 'ins.operations.delete', labelAr: 'حذف العمليات التأمينية' },
        },
      },
      {
        id: 'ins_forms',
        titleAr: 'استمارات (س1 / س2 / س6)',
        titleEn: 'Insurance Forms (S1/S2/S6)',
        descriptionAr: 'إعداد ورفع استمارات تسجيل العاملين الجدد، تعديل الأجور السنوية، وإنهاء الاشتراك',
        actions: {
          view: { key: 'ins.forms.view', labelAr: 'عرض سجل الاستمارات التأمينية' },
          create: { key: 'ins.forms.create', labelAr: 'تحرير استمارة تأمينية جديدة' },
          edit: { key: 'ins.forms.edit', labelAr: 'تعديل بيانات العامل والأجر' },
          docs: { key: 'ins.forms.docs', labelAr: 'الاستمارات المعتمدة ومختومة' },
          status: { key: 'ins.forms.status', labelAr: 'إثبات التسجيل في مكتب التأمينات' },
          audit: { key: 'ins.forms.audit', labelAr: 'سجل تسليم الاستمارات' },
          delete: { key: 'ins.forms.delete', labelAr: 'إلغاء استمارة مسودة' },
        },
      },
      {
        id: 'ins_register',
        titleAr: 'السجل التأميني للعاملين',
        titleEn: 'Insured Employees Register',
        descriptionAr: 'حصر أرقام التأمين للموظفين، نسب الاستقطاع، وتحديث وعاء الأجر الخاضع للتأمين',
        actions: {
          view: { key: 'ins.register.view', labelAr: 'عرض السجل التأميني للعاملين' },
          create: { key: 'ins.register.create', labelAr: 'إضافة رقم تأميني لموظف' },
          edit: { key: 'ins.register.edit', labelAr: 'تحديث شرائح التأمين' },
          docs: { key: 'ins.register.docs', labelAr: 'برنت التأمينات الرسمية' },
          status: { key: 'ins.register.status', labelAr: 'تحديث حالة التأمين (ساري/متوقف)' },
          audit: { key: 'ins.register.audit', labelAr: 'سجل تعديل الأجور التأمينية' },
          delete: { key: 'ins.register.delete', labelAr: 'حذف قيد تأميني' },
        },
      },
      {
        id: 'ins_wages',
        titleAr: 'وعاء الأجور والاشتراكات الشهرية',
        titleEn: 'Wages & Dues Settlement',
        descriptionAr: 'مطابقة مطالبات مكتب التأمينات الشهرية، إعداد أوامر الصرف وسداد المستحقات',
        actions: {
          view: { key: 'ins.wages.view', labelAr: 'عرض مطالبات الاشتراكات الشهرية' },
          create: { key: 'ins.wages.create', labelAr: 'احتساب اشتراك الشهر المستحق' },
          edit: { key: 'ins.wages.edit', labelAr: 'تسوية الفروق والغرامات' },
          docs: { key: 'ins.wages.docs', labelAr: 'إيصالات السداد البنكي للتأمينات' },
          status: { key: 'ins.wages.status', labelAr: 'اعتماد سداد المطالبة' },
          audit: { key: 'ins.wages.audit', labelAr: 'سجل مطابقة الاشتراكات' },
          delete: { key: 'ins.wages.delete', labelAr: 'إلغاء مطالبة مسودة' },
        },
      },
      {
        id: 'ins_sites',
        titleAr: 'التحليلات والفحص والامتثال الدوري',
        titleEn: 'Analytics & Periodic Compliance',
        descriptionAr: 'لوحة المؤشرات التنفيذية وفحص الامتثال الدوري وملفات العمليات التأمينية',
        actions: {
          view: { key: 'ins.sites.view', labelAr: 'عرض لوحة التحليلات والامتثال' },
          create: { key: 'ins.sites.create', labelAr: 'إضافة بند فحص وامتثال جديد' },
          edit: { key: 'ins.sites.edit', labelAr: 'تعديل بيانات الفحص' },
          docs: { key: 'ins.sites.docs', labelAr: 'شهادات براءة الذمة والتقارير' },
          status: { key: 'ins.sites.status', labelAr: 'اعتماد نتيجة الفحص الدوري' },
          audit: { key: 'ins.sites.audit', labelAr: 'سجل مراجعات مكتب التفتيش' },
          delete: { key: 'ins.sites.delete', labelAr: 'حذف سجل فحص' },
        },
      },
    ],
    allPermissionKeys: [],
  },

  // 9. استقطاب الكفاءات (ATS - Talent Acquisition)
  ats: {
    id: 'ats',
    titleAr: 'استقطاب الكفاءات (ATS)',
    titleEn: 'Talent Acquisition (ATS)',
    icon: UserCheck,
    colorVar: '#6366F1',
    badge: 'توظيف',
    descriptionAr: 'نشر الإعلانات الوظيفية، فحص السير الذاتية، جدولة المقابلات، وإصدار عروض العمل.',
    subModules: [
      {
        id: 'ats_openings',
        titleAr: 'الوظائف الشاغرة والإعلانات',
        titleEn: 'Job Openings & Postings',
        descriptionAr: 'إنشاء متطلبات الوظائف، الشواغر المعتمدة، وفتح باب التقديم الإلكتروني',
        actions: {
          view: { key: 'ats.openings.view', labelAr: 'عرض الشواغر الوظيفية' },
          create: { key: 'ats.openings.create', labelAr: 'نشر إعلان وظيفي جديد' },
          edit: { key: 'ats.openings.edit', labelAr: 'تعديل شروط ومواصفات الوظيفة' },
          docs: { key: 'ats.openings.docs', labelAr: 'بطاقات الوصف الوظيفي' },
          status: { key: 'ats.openings.status', labelAr: 'إغلاق/إعادة فتح التقديم' },
          audit: { key: 'ats.openings.audit', labelAr: 'سجل متابعة طلبات التوظيف' },
          delete: { key: 'ats.openings.delete', labelAr: 'حذف الإعلان الوظيفي' },
        },
      },
      {
        id: 'ats_pipeline',
        titleAr: 'مسار المرشحين وفرز السير (Kanban)',
        titleEn: 'Candidate Pipeline & CVs',
        descriptionAr: 'تقييم ملفات المتقدمين، تصفية السير الذاتية، وتحريكهم في مسار التوظيف',
        actions: {
          view: { key: 'ats.pipeline.view', labelAr: 'عرض مسار المتقدمين للوظائف' },
          create: { key: 'ats.pipeline.create', labelAr: 'إضافة سيرة ذاتية يدوياً' },
          edit: { key: 'ats.pipeline.edit', labelAr: 'تحديث تقييم وملاحظات المرشح' },
          docs: { key: 'ats.pipeline.docs', labelAr: 'تحميل السير الذاتية والشهادات' },
          status: { key: 'ats.pipeline.status', labelAr: 'نقل المرشح إلى المرحلة التالية' },
          audit: { key: 'ats.pipeline.audit', labelAr: 'سجل تقييم لجان الفرز' },
          delete: { key: 'ats.pipeline.delete', labelAr: 'استبعاد سيرة ذاتية' },
        },
      },
      {
        id: 'ats_interviews',
        titleAr: 'المقابلات واللجان الفنية',
        titleEn: 'Interview Scheduling & Panels',
        descriptionAr: 'تحديد مواعيد المقابلات، تشكيل لجان التقييم، وتوثيق درجات المقابلات',
        actions: {
          view: { key: 'ats.interviews.view', labelAr: 'عرض جدول المقابلات' },
          create: { key: 'ats.interviews.create', labelAr: 'جدولة موعد مقابلة شخصية' },
          edit: { key: 'ats.interviews.edit', labelAr: 'تعديل الموعد ولجنة التقييم' },
          docs: { key: 'ats.interviews.docs', labelAr: 'نماذج التقييم الفني المعبأة' },
          status: { key: 'ats.interviews.status', labelAr: 'اعتماد نتيجة المقابلة (قبول/رفض)' },
          audit: { key: 'ats.interviews.audit', labelAr: 'سجل نتائج المقابلات' },
          delete: { key: 'ats.interviews.delete', labelAr: 'إلغاء المقابلة' },
        },
      },
      {
        id: 'ats_offers',
        titleAr: 'عروض العمل ومسوغات التعيين',
        titleEn: 'Job Offers & Onboarding',
        descriptionAr: 'إصدار عروض العمل للمرشحين المقبولين واستلام مسوغات التعيين الرسمية',
        actions: {
          view: { key: 'ats.offers.view', labelAr: 'عرض سجل عروض التوظيف' },
          create: { key: 'ats.offers.create', labelAr: 'إصدار عرض عمل رسمي' },
          edit: { key: 'ats.offers.edit', labelAr: 'تعديل الراتب والبدلات المعروضة' },
          docs: { key: 'ats.offers.docs', labelAr: 'عروض العمل الموقعة والمرفقات' },
          status: { key: 'ats.offers.status', labelAr: 'تحديث موقف قبول العرض والتعيين' },
          audit: { key: 'ats.offers.audit', labelAr: 'سجل تحويل المرشح لموظف' },
          delete: { key: 'ats.offers.delete', labelAr: 'إلغاء عرض العمل' },
        },
      },
    ],
    allPermissionKeys: [],
  },

  // 10. القرارات والتعميمات (Decrees & Circulars)
  decrees: {
    id: 'decrees',
    titleAr: 'القرارات والتعميمات',
    titleEn: 'Decrees & Circulars',
    icon: ScrollText,
    colorVar: '#C2410C',
    badge: 'إداري',
    descriptionAr: 'إصدار القرارات الإدارية، الأوامر المعممة، اللوائح وسياسات العمل المعتمدة.',
    subModules: [
      {
        id: 'dec_decrees',
        titleAr: 'القرارات الإدارية والوزارية',
        titleEn: 'Executive Decrees',
        descriptionAr: 'إصدار اللوائح والقرارات التنظيمية الملزمة على مستوى المجموعة والشركات',
        actions: {
          view: { key: 'dec.decrees.view', labelAr: 'عرض القرارات الإدارية' },
          create: { key: 'dec.decrees.create', labelAr: 'صياغة قرار إداري جديد' },
          edit: { key: 'dec.decrees.edit', labelAr: 'تعديل نصوص وبنود القرار' },
          docs: { key: 'dec.decrees.docs', labelAr: 'القرارات الموقعة والمختومة' },
          status: { key: 'dec.decrees.status', labelAr: 'اعتماد ونشر القرار رسميًا' },
          audit: { key: 'dec.decrees.audit', labelAr: 'سجل توزيع وتعميم القرارات' },
          delete: { key: 'dec.decrees.delete', labelAr: 'إلغاء سريان القرار' },
        },
      },
      {
        id: 'dec_circulars',
        titleAr: 'الأوامر المعممة والنشرات',
        titleEn: 'Circular Orders',
        descriptionAr: 'التعليمات الإدارية الداخلية، مواعيد العمل في المناسبات، والتوجيهات',
        actions: {
          view: { key: 'dec.circulars.view', labelAr: 'عرض التعميمات الإدارية' },
          create: { key: 'dec.circulars.create', labelAr: 'إصدار تعميم داخلي' },
          edit: { key: 'dec.circulars.edit', labelAr: 'تعديل نص التعميم' },
          docs: { key: 'dec.circulars.docs', labelAr: 'ملفات التعميمات الرسمية' },
          status: { key: 'dec.circulars.status', labelAr: 'إرسال التعميم لكافة الموظفين' },
          audit: { key: 'dec.circulars.audit', labelAr: 'سجل قراءة وتأكيد الاستلام' },
          delete: { key: 'dec.circulars.delete', labelAr: 'أرشفة التعميم' },
        },
      },
      {
        id: 'dec_policies',
        titleAr: 'اللوائح وسياسات العمل',
        titleEn: 'Internal Regulations & Policies',
        descriptionAr: 'لائحة تنظيم العمل المعتمدة، مصفوفة الصلاحيات، وسياسات السلامة والجودة',
        actions: {
          view: { key: 'dec.policies.view', labelAr: 'عرض اللوائح والسياسات' },
          create: { key: 'dec.policies.create', labelAr: 'إضافة لائحة عمل جديدة' },
          edit: { key: 'dec.policies.edit', labelAr: 'تحديث بنود ومواد اللائحة' },
          docs: { key: 'dec.policies.docs', labelAr: 'كتيب اللائحة المعتمد' },
          status: { key: 'dec.policies.status', labelAr: 'تفعيل اللائحة وإلزام تطبيقها' },
          audit: { key: 'dec.policies.audit', labelAr: 'سجل إصدارات اللوائح' },
          delete: { key: 'dec.policies.delete', labelAr: 'إلغاء العمل بلائحة قديمة' },
        },
      },
    ],
    allPermissionKeys: [],
  },

  // 11. الاستقبال والزوار (Front Desk & Reception)
  reception: {
    id: 'reception',
    titleAr: 'الاستقبال والزوار',
    titleEn: 'Front Desk & Reception',
    icon: ConciergeBell,
    colorVar: '#D99B26',
    badge: 'استقبال',
    descriptionAr: 'سجل الزيارات الرقمي، تصاريح الدخول، قاعات الاجتماعات، واستلام الطرود.',
    subModules: [
      {
        id: 'rec_visitors',
        titleAr: 'إدارة الزوار والدخول الرقمي',
        titleEn: 'Digital Visitor Check-In',
        descriptionAr: 'تسجيل بيانات الضيوف، التقاط الصور، إصدار شارات الدخول والباركود السريع',
        actions: {
          view: { key: 'rec.visitors.view', labelAr: 'عرض سجل الزيارات اليومية' },
          create: { key: 'rec.visitors.create', labelAr: 'تسجيل زائر جديد وإصدار بطاقة' },
          edit: { key: 'rec.visitors.edit', labelAr: 'تعديل بيانات الزائر والشخص المقابل' },
          docs: { key: 'rec.visitors.docs', labelAr: 'صور بطاقات الهوية والتصاريح' },
          status: { key: 'rec.visitors.status', labelAr: 'إثبات خروج الزائر' },
          audit: { key: 'rec.visitors.audit', labelAr: 'سجل مواعيد وتاريخ الدخول' },
          delete: { key: 'rec.visitors.delete', labelAr: 'حذف تسجيل زيارة' },
        },
      },
      {
        id: 'rec_rooms',
        titleAr: 'حجز قاعات الاجتماعات والضيافة',
        titleEn: 'Meeting Rooms & Hospitality',
        descriptionAr: 'تنظيم جداول قاعات الاجتماعات المركزية، التجهيزات الصوتية والضيافة VIP',
        actions: {
          view: { key: 'rec.rooms.view', labelAr: 'عرض جدول حجوزات القاعات' },
          create: { key: 'rec.rooms.create', labelAr: 'حجز قاعة اجتماع' },
          edit: { key: 'rec.rooms.edit', labelAr: 'تعديل تواريخ وتجهيزات الحجز' },
          docs: { key: 'rec.rooms.docs', labelAr: 'طلبات الضيافة الخاصة' },
          status: { key: 'rec.rooms.status', labelAr: 'تأكيد الحجز وبدء الجلسة' },
          audit: { key: 'rec.rooms.audit', labelAr: 'سجل استخدام القاعات' },
          delete: { key: 'rec.rooms.delete', labelAr: 'إلغاء حجز القاعة' },
        },
      },
      {
        id: 'rec_parcels',
        titleAr: 'سجل الطرود والشحنات السريعة',
        titleEn: 'Parcels & Couriers Log',
        descriptionAr: 'توثيق وصول الطرود الرسمية والشحنات والبريد وتسليمها للمستلمين المعنيين',
        actions: {
          view: { key: 'rec.parcels.view', labelAr: 'عرض سجل الطرود المستلمة' },
          create: { key: 'rec.parcels.create', labelAr: 'تسجيل وصول شحنة/طرد' },
          edit: { key: 'rec.parcels.edit', labelAr: 'تعديل بيانات الشحنة والمستلم' },
          docs: { key: 'rec.parcels.docs', labelAr: 'بوليصات الشحن والتواقيع' },
          status: { key: 'rec.parcels.status', labelAr: 'إثبات تسليم الطرد لصاحبه' },
          audit: { key: 'rec.parcels.audit', labelAr: 'سجل حركات الطرود' },
          delete: { key: 'rec.parcels.delete', labelAr: 'حذف تسجيل شحنة' },
        },
      },
      {
        id: 'rec_passes',
        titleAr: 'تصاريح الفنيين والمقاولين',
        titleEn: 'Contractor & Site Passes',
        descriptionAr: 'منح أذونات الدخول المؤقتة لمقرات المنشأة والمواقع لفرق الصيانة والعمالة',
        actions: {
          view: { key: 'rec.passes.view', labelAr: 'عرض سجل التصاريح المؤقتة' },
          create: { key: 'rec.passes.create', labelAr: 'إصدار تصريح دخول فني/مقاول' },
          edit: { key: 'rec.passes.edit', labelAr: 'تمديد فترة سريان التصريح' },
          docs: { key: 'rec.passes.docs', labelAr: 'إثباتات الهوية والسلامة المهنية' },
          status: { key: 'rec.passes.status', labelAr: 'إيقاف/سحب التصريح الأمني' },
          audit: { key: 'rec.passes.audit', labelAr: 'سجل فحص البوابات' },
          delete: { key: 'rec.passes.delete', labelAr: 'إلغاء التصريح' },
        },
      },
    ],
    allPermissionKeys: [],
  },

  // 12. الإعدادات والصلاحيات (Settings & Permissions)
  settings: {
    id: 'settings',
    titleAr: 'الإعدادات والصلاحيات',
    titleEn: 'Settings & Permissions',
    icon: Settings,
    colorVar: '#5C665E',
    badge: 'نظام',
    descriptionAr: 'مصفوفة الصلاحيات (RBAC)، إدارة حسابات المستخدمين، سجل العمليات والرقابة الأمنية.',
    subModules: [
      {
        id: 'set_rbac',
        titleAr: 'مصفوفة الصلاحيات (RBAC)',
        titleEn: 'Roles & Permissions (RBAC)',
        descriptionAr: 'توزيع الصلاحيات الدقيقة على الأدوار والمستخدمين عبر كافة قطاعات المنظومة الـ 12',
        actions: {
          view: { key: 'set.rbac.view', labelAr: 'عرض مصفوفة الصلاحيات' },
          create: { key: 'set.rbac.create', labelAr: 'إضافة دور وظيفي جديد' },
          edit: { key: 'set.rbac.edit', labelAr: 'تعديل وتخصيص الصلاحيات' },
          docs: { key: 'set.rbac.docs', labelAr: 'تصدير مصفوفة الحوكمة' },
          status: { key: 'set.rbac.status', labelAr: 'تفعيل/تجميد دور وظيفي' },
          audit: { key: 'set.rbac.audit', labelAr: 'سجل تعديلات الصلاحيات' },
          delete: { key: 'set.rbac.delete', labelAr: 'إعادة ضبط الصلاحيات للافتراضي' },
        },
      },
      {
        id: 'set_users',
        titleAr: 'إدارة المستخدمين والحسابات',
        titleEn: 'User Management',
        descriptionAr: 'إنشاء حسابات الموظفين، تعيين الأدوار، إعادة تعيين كلمات المرور وضبط الأمان',
        actions: {
          view: { key: 'set.users.view', labelAr: 'عرض قائمة المستخدمين' },
          create: { key: 'set.users.create', labelAr: 'إنشاء حساب مستخدم جديد' },
          edit: { key: 'set.users.edit', labelAr: 'تعديل بيانات الحساب والدور' },
          docs: { key: 'set.users.docs', labelAr: 'وثائق التعيين وبطاقات الدخول' },
          status: { key: 'set.users.status', labelAr: 'تجميد/تفعيل حساب المستخدم' },
          audit: { key: 'set.users.audit', labelAr: 'سجل تسجيل الدخول والأمان' },
          delete: { key: 'set.users.delete', labelAr: 'حذف حساب المستخدم' },
        },
      },
      {
        id: 'set_configurations',
        titleAr: 'التعريفات والقوائم المرنة',
        titleEn: 'Dynamic Configurations',
        descriptionAr: 'إدارة وتخصيص المسميات الوظيفية، الأقسام، أنواع الوثائق والمقرات وصفات المفوضين',
        actions: {
          view: { key: 'set.configurations.view', labelAr: 'عرض التعريفات والقوائم' },
          create: { key: 'set.configurations.create', labelAr: 'إضافة عنصر تعريف جديد' },
          edit: { key: 'set.configurations.edit', labelAr: 'تعديل بيانات التعريف' },
          docs: { key: 'set.configurations.docs', labelAr: 'تصدير القوائم المعيارية' },
          status: { key: 'set.configurations.status', labelAr: 'تفعيل/إلغاء تفعيل العنصر' },
          audit: { key: 'set.configurations.audit', labelAr: 'سجل تدقيق التعريفات' },
          delete: { key: 'set.configurations.delete', labelAr: 'حذف عنصر من القوائم' },
        },
      },
      {
        id: 'set_audit',
        titleAr: 'سجل العمليات والرقابة الأمنية',
        titleEn: 'Audit Log & Security Oversight',
        descriptionAr: 'الرقابة الشاملة على كافة العمليات، التعديلات الحساسة وتتبع الأنشطة الإدارية',
        actions: {
          view: { key: 'set.audit.view', labelAr: 'عرض سجل العمليات الشامل' },
          create: null,
          edit: null,
          docs: null,
          status: null,
          audit: { key: 'set.audit.audit', labelAr: 'فحص وتصدير السجلات الرقابية' },
          delete: null,
        },
      },
      {
        id: 'set_integrations',
        titleAr: 'ربط وتكامل قواعد البيانات (SQL Hub)',
        titleEn: 'Database Federation Hub (SQL)',
        descriptionAr: 'مزامنة السجلات مع SQL Server وCloudflare D1 وربط خوادم الشركات التابعة',
        actions: {
          view: { key: 'set.integrations.view', labelAr: 'عرض حالة خوادم الربط' },
          create: { key: 'set.integrations.create', labelAr: 'إضافة نقطة اتصال قاعدة بيانات' },
          edit: { key: 'set.integrations.edit', labelAr: 'تعديل إعدادات المزامنة' },
          docs: { key: 'set.integrations.docs', labelAr: 'سجلات الاتصال والـ API' },
          status: { key: 'set.integrations.status', labelAr: 'فحص الاتصال وتشغيل المزامنة' },
          audit: { key: 'set.integrations.audit', labelAr: 'سجل مزامنة البيانات' },
          delete: { key: 'set.integrations.delete', labelAr: 'قطع اتصال الخادم' },
        },
      },
    ],
    allPermissionKeys: [],
  },
};

// Compute allPermissionKeys dynamically for every module
Object.values(ERP_MODULES_MATRIX_CONFIG).forEach(module => {
  const keys: string[] = [];
  module.subModules.forEach(sub => {
    Object.values(sub.actions).forEach(action => {
      if (action && action.key) {
        keys.push(action.key);
      }
    });
  });
  module.allPermissionKeys = keys;
});

export const ALL_12_ERP_MODULES = Object.values(ERP_MODULES_MATRIX_CONFIG);

// Backwards-compatible map matching DepartmentRbacGroup format
export const MULTI_DEPARTMENT_RBAC_DATA: Record<DepartmentKey, DepartmentRbacGroup> = ((): Record<DepartmentKey, DepartmentRbacGroup> => {
  const data = {} as Record<DepartmentKey, DepartmentRbacGroup>;
  Object.values(ERP_MODULES_MATRIX_CONFIG).forEach(mod => {
    const permissions: RbacPermission[] = [];
    mod.subModules.forEach(sub => {
      Object.entries(sub.actions).forEach(([actionKey, action]) => {
        if (action) {
          permissions.push({
            id: action.key,
            code: action.key,
            nameAr: `${action.labelAr || actionKey} - ${sub.titleAr}`,
            nameEn: `${actionKey} - ${sub.titleEn}`,
            categoryAr: sub.titleAr,
            descriptionAr: sub.descriptionAr,
            categoryIcon: mod.icon,
          });
        }
      });
    });

    data[mod.id] = {
      id: mod.id,
      nameAr: mod.titleAr,
      nameEn: mod.titleEn,
      icon: mod.icon,
      colorVar: mod.colorVar,
      badge: mod.badge,
      descriptionAr: mod.descriptionAr,
      permissions,
    };
  });
  return data;
})();

/**
 * Universal Sub-Module View Permission Map covering ALL 12 ERP Modules
 * Aligned 1:1 with ERP_MODULES_MATRIX_CONFIG .view keys so the RBAC Matrix
 * is the single source of truth for Sidebar and Dashboard visibility.
 */
export const SUBMODULE_VIEW_PERMISSION_MAP: Record<string, string> = {
  // 1. Companies Management
  comp_directory: 'companies.directory.view',
  comp_licenses: 'companies.licenses.view',
  comp_branches: 'companies.branches.view',
  comp_structure: 'companies.org.view',
  comp_signatories: 'companies.signatories.view',

  // 2. Executive Management & Strategy
  exec_kpi: 'exec.kpi.view',
  exec_risks: 'exec.risks.view',
  exec_financial: 'exec.financial.view',
  exec_governance: 'exec.governance.view',

  // 3. Financial Affairs
  fin_chart: 'fin.chart.view',
  fin_treasury: 'fin.treasury.view',
  fin_vouchers: 'fin.vouchers.view',
  fin_cheques: 'fin.cheques.view',
  fin_journals: 'fin.journals.view',
  fin_sales: 'fin.sales.view',
  fin_procurement: 'fin.procurement.view',
  fin_costcenters: 'fin.chart.view',
  fin_contracts: 'fin.procurement.view',
  fin_projects: 'fin.reports.view',
  fin_reports: 'fin.reports.view',

  // 4. Human Resources (HRMS)
  hr_directory: 'hr.directory.view',
  hr_payroll: 'hr.payroll.view',
  hr_disbursement: 'hr.disbursement.view',
  hr_contracts: 'hr.contracts.view',
  hr_attendance: 'hr.attendance.view',
  hr_leaves: 'hr.leaves.view',
  hr_advances: 'hr.advances.view',
  hr_advances_requests: 'hr.advances.view',
  hr_advances_active: 'hr.advances.view',
  hr_recruitment: 'hr.directory.create',
  hr_penalties: 'hr.penalties.view',
  hr_missing_docs: 'hr.directory.docs',
  hr_approvals: 'hr.leaves.status',
  hr_settings: 'hr.directory.edit',
  hr_audit: 'hr.directory.audit',
  hr_org_tree: 'hr.directory.view',

  // 5. Technical Office (Engineering)
  eng_projects: 'eng.projects.view',
  eng_schedule: 'eng.schedule.view',
  eng_ipc: 'eng.ipc.view',
  eng_contractors: 'eng.ipc.view',
  eng_rfq: 'eng.boq.view',
  eng_po: 'eng.boq.view',
  eng_boq: 'eng.boq.view',
  eng_submittals: 'eng.submittals.view',
  eng_rfi: 'eng.rfi.view',

  // 6. Correspondence & Document Control (CTS)
  cts_incoming: 'cts.incoming.view',
  cts_outgoing: 'cts.outgoing.view',
  cts_routing: 'cts.routing.view',
  cts_archive: 'cts.archive.view',
  cts_confidential: 'cts.confidential.view',
  cts_overview: 'cts.incoming.view',
  cts_log: 'cts.incoming.view',
  cts_incoming_new: 'cts.incoming.create',
  cts_outgoing_draft: 'cts.outgoing.view',

  // 7. Legal Affairs
  leg_contracts: 'leg.contracts.view',
  leg_cases: 'leg.cases.view',
  leg_poa: 'leg.poa.view',
  leg_notices: 'leg.notices.view',
  leg_advisory: 'leg.advisory.view',

  // 8. Social Insurance
  ins_operations: 'ins.operations.view',
  ins_forms: 'ins.forms.view',
  ins_register: 'ins.register.view',
  ins_wages: 'ins.wages.view',
  ins_sites: 'ins.sites.view',
  ins_compliance: 'ins.sites.view',

  // 9. Talent Acquisition (ATS)
  ats_analytics: 'ats.openings.view',
  ats_jobs: 'ats.openings.view',
  ats_openings: 'ats.openings.view',
  ats_pipeline: 'ats.pipeline.view',
  ats_candidates: 'ats.pipeline.view',
  ats_interviews: 'ats.interviews.view',
  ats_offers: 'ats.offers.view',

  // 10. Administrative Decrees & Circulars
  dec_decrees: 'dec.decrees.view',
  dec_circulars: 'dec.circulars.view',
  dec_policies: 'dec.policies.view',
  dec_bulletins: 'dec.circulars.view',

  // 11. Front Desk & Reception
  rec_visitors: 'rec.visitors.view',
  rec_rooms: 'rec.rooms.view',
  rec_parcels: 'rec.parcels.view',
  rec_calls: 'rec.visitors.view',
  rec_passes: 'rec.passes.view',

  // 12. Settings & Permissions
  set_rbac: 'set.rbac.view',
  set_users: 'set.users.view',
  set_configurations: 'set.configurations.view',
  set_audit: 'set.audit.view',
  set_automation: 'set.configurations.view',
  settings_automation: 'set.configurations.view',
  set_integrations: 'set.integrations.view',
  set_upgrades: 'set.integrations.view',
};

/**
 * Set of all valid granular permission keys defined across the 12 ERP modules in the RBAC Matrix
 */
export const ALL_VALID_MATRIX_PERMISSION_KEYS: Set<string> = new Set(
  ALL_12_ERP_MODULES.flatMap(mod => mod.allPermissionKeys)
);

/**
 * Strict Super Admin Identification
 * ONLY Super Admin has full access by default. All other users have ZERO default permissions.
 */
export function isSuperAdminUser(
  user: { id?: string; username?: string; email?: string; role?: string; jobTitleAr?: string } | null | undefined
): boolean {
  if (!user) return false;
  return (
    user.id === 'admin' ||
    user.id === 'usr_root_csuite_01' ||
    user.id === 'usr_root_csuite' ||
    user.username === 'admin' ||
    user.email === 'admin@hrsup.com' ||
    user.role === 'SUPER_ADMIN' ||
    user.role === 'admin' ||
    user.role === 'مدير النظام العام / رئيس مجلس الإدارة' ||
    user.jobTitleAr === 'مدير النظام العام / رئيس مجلس الإدارة'
  );
}

/**
 * Sanitizes a user's permissions array under Strict Deny-By-Default rules:
 * - For Super Admin: returns ['*'].
 * - For Non-Admin users: strips all wildcards ('*', 'hr.*', 'ats.*', etc.) and legacy
 *   non-matrix keys so ONLY explicit RBAC Matrix keys are retained.
 */
export function sanitizeUserPermissions(
  userOrPerms:
    | { id?: string; username?: string; email?: string; role?: string; jobTitleAr?: string; permissions?: string[] }
    | string[]
    | null
    | undefined,
  isSuperAdminOverride = false
): string[] {
  if (!userOrPerms) return [];
  if (Array.isArray(userOrPerms)) {
    if (isSuperAdminOverride) return ['*'];
    return Array.from(
      new Set(
        userOrPerms.filter(
          k => typeof k === 'string' && !k.includes('*') && ALL_VALID_MATRIX_PERMISSION_KEYS.has(k)
        )
      )
    );
  }
  if (isSuperAdminUser(userOrPerms)) {
    return ['*'];
  }
  const raw = Array.isArray(userOrPerms.permissions) ? userOrPerms.permissions : [];
  return Array.from(
    new Set(
      raw.filter(
        k => typeof k === 'string' && !k.includes('*') && ALL_VALID_MATRIX_PERMISSION_KEYS.has(k)
      )
    )
  );
}

/**
 * Clean Arabic Titles Helper: Removes underscores, trims extra spaces,
 * and strips technical English acronym tags (C-Suite, CFO, HRD, etc.)
 */
export function cleanArabicTitle(title?: string): string {
  if (!title) return '';
  return title
    .replace(/موادر/g, 'موارد')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\(C-Suite\)/gi, '')
    .replace(/\(CFO\)/gi, '')
    .replace(/\(HRD\)/gi, '')
    .replace(/\(HRMS\)/gi, '')
    .replace(/\(ATS\)/gi, '')
    .replace(/\(CTS\)/gi, '')
    .trim();
}

/**
 * Real-Time Reactive RBAC Event Protocol
 * Enables zero-refresh permission updates and instantaneous UI re-gating
 */
export const ECO_PERMISSIONS_UPDATED_EVENT = 'eco-permissions-updated';
export const ECO_RBAC_UPDATED_EVENT = 'eco-rbac-updated';

export interface PermissionsUpdatedEventDetail {
  userId?: string;
  permissions?: string[];
  user?: any;
}

/**
 * Universal dispatcher for zero-refresh reactive RBAC state synchronization
 * Broadcasts across local window event mesh and cross-tab BroadcastChannel
 */
export function dispatchPermissionsUpdate(detail?: PermissionsUpdatedEventDetail): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(ECO_PERMISSIONS_UPDATED_EVENT, { detail: detail || {} })
    );
    window.dispatchEvent(
      new CustomEvent(ECO_RBAC_UPDATED_EVENT, { detail: detail || {} })
    );
    window.dispatchEvent(new CustomEvent('eco-data-updated'));

    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('eco_rbac_channel');
        bc.postMessage({
          type: 'PERMISSIONS_UPDATED',
          detail: detail || {},
        });
        bc.close();
      } catch {}
    }
  }
}

/**
 * Strict Deny-By-Default Sub-Module View Check:
 * Returns true IF AND ONLY IF:
 * 1. The user is Super Admin, OR
 * 2. The sub-module's explicit `.view` (or mapped) permission key is saved in the user's RBAC matrix.
 * Zero department or role fallbacks.
 */
export function canViewSubModule(
  user: { id?: string; username?: string; email?: string; role?: string; jobTitleAr?: string; permissions?: string[] } | null | undefined,
  subModuleId: string
): boolean {
  if (!user) return false;
  if (isSuperAdminUser(user)) return true;

  const permKey = SUBMODULE_VIEW_PERMISSION_MAP[subModuleId];
  if (!permKey) return false;

  const explicitPerms = sanitizeUserPermissions(user);
  return explicitPerms.includes(permKey);
}

/**
 * Strict Deny-By-Default Module View Check:
 * Returns true IF AND ONLY IF:
 * 1. The user is Super Admin, OR
 * 2. At least one sub-module within this module has `view: true` explicitly saved in the user's RBAC matrix.
 * Zero department or role fallbacks.
 */
export function canViewModule(
  user: { id?: string; username?: string; email?: string; role?: string; jobTitleAr?: string; permissions?: string[] } | null | undefined,
  moduleId: string
): boolean {
  if (!user) return false;
  if (isSuperAdminUser(user)) return true;

  const explicitPerms = sanitizeUserPermissions(user);
  if (explicitPerms.length === 0) return false;

  const modConfig = ERP_MODULES_MATRIX_CONFIG[moduleId as DepartmentKey];
  if (modConfig) {
    const viewKeys = modConfig.subModules
      .map(sub => sub.actions.view?.key)
      .filter((k): k is string => Boolean(k));
    return viewKeys.some(k => explicitPerms.includes(k));
  }

  return false;
}

/**
 * Backwards-compatible alias for canViewModule — enforces strict Deny-By-Default
 */
export function hasModuleAccess(
  user: { id?: string; username?: string; email?: string; role?: string; jobTitleAr?: string; permissions?: string[] } | null | undefined,
  moduleId: string
): boolean {
  return canViewModule(user, moduleId);
}


