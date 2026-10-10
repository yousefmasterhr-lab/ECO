import React from 'react';
import {
  Layers,
  Receipt,
  Banknote,
  ShoppingCart,
  Package,
  HardHat,
  BarChart3,
  Users,
  FileText,
  Clock,
  Award,
  AlertCircle,
  FolderMinus,
  Calendar,
  ClipboardList,
  FileCheck,
  HelpCircle,
  Scale,
  FileWarning,
  Scroll,
  Mail,
  Send,
  Share2,
  Archive,
  Lock,
  ShieldCheck,
  CheckCircle,
  CreditCard,
  UserCheck,
  FileSpreadsheet,
  ConciergeBell,
  DoorOpen,
  Box,
  PhoneCall,
  Activity,
  ShieldAlert,
  CheckSquare,
  LockKeyhole,
  KeyRound
} from 'lucide-react';

export type DepartmentKey =
  | 'finance'
  | 'hr'
  | 'engineering'
  | 'legal'
  | 'cts'
  | 'insurance'
  | 'ats'
  | 'reception'
  | 'csuite';

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

export const MULTI_DEPARTMENT_RBAC_DATA: Record<DepartmentKey, DepartmentRbacGroup> = {
  // 1. الشؤون المالية (58 صلاحية مرتبطة بالربط المالي المحلي)
  finance: {
    id: 'finance',
    nameAr: 'الشؤون المالية والخزينة',
    nameEn: 'Financial Affairs & Treasury',
    icon: Banknote,
    colorVar: '#059669',
    badge: 'SQL Server',
    descriptionAr: 'الأستاذ العام، سندات القبض والصرف، الخزينة، الشيكات، الفوترة ZATCA والمستخلصات.',
    permissions: [
      // الدليل المحاسبي
      { id: 'f_coa_view', code: 'Perm_COA_View', nameAr: 'عرض شجرة الحسابات', nameEn: 'View Chart of Accounts', categoryAr: 'دليل الحسابات', descriptionAr: 'استعراض الهيكل الشجري للحسابات والمستويات 1-5', categoryIcon: Layers },
      { id: 'f_coa_add', code: 'Perm_COA_Add', nameAr: 'إضافة حساب جديد', nameEn: 'Add New Account', categoryAr: 'دليل الحسابات', descriptionAr: 'إنشاء حسابات تفصيلية أو رئيسية جديدة', categoryIcon: Layers },
      { id: 'f_coa_edit', code: 'Perm_COA_Edit', nameAr: 'تعديل بيانات حساب', nameEn: 'Edit Account Details', categoryAr: 'دليل الحسابات', descriptionAr: 'تعديل اسم أو طبيعة أو تصنيف الحساب', categoryIcon: Layers },
      { id: 'f_coa_delete', code: 'Perm_COA_Delete', nameAr: 'حذف / تعطيل حساب', nameEn: 'Delete/Deactivate Account', categoryAr: 'دليل الحسابات', descriptionAr: 'تعطيل الحسابات الخالية من الحركات التاريخية', categoryIcon: Layers },
      { id: 'f_coa_audit', code: 'Perm_COA_Audit', nameAr: 'مراجعة وتدقيق الدليل', nameEn: 'Audit Chart of Accounts', categoryAr: 'دليل الحسابات', descriptionAr: 'مطابقة طبيعة الحسابات وتوازن الأصول والخصوم', categoryIcon: Layers },

      // قيود اليومية
      { id: 'f_jv_view', code: 'Perm_JV_View', nameAr: 'عرض قيود اليومية', nameEn: 'View Journal Entries', categoryAr: 'قيود اليومية', descriptionAr: 'الاطلاع على سندات وقيود اليومية العامة', categoryIcon: Receipt },
      { id: 'f_jv_create', code: 'Perm_JV_Create', nameAr: 'إنشاء قيد يومية', nameEn: 'Create Journal Voucher', categoryAr: 'قيود اليومية', descriptionAr: 'إدخال قيود محاسبية يدوية وتفقيط المبالغ', categoryIcon: Receipt },
      { id: 'f_jv_edit', code: 'Perm_JV_Edit', nameAr: 'تعديل مسودة قيد', nameEn: 'Edit Draft Voucher', categoryAr: 'قيود اليومية', descriptionAr: 'تعديل أطراف القيد قبل الاعتماد والترحيل', categoryIcon: Receipt },
      { id: 'f_jv_post', code: 'Perm_JV_Post', nameAr: 'ترحيل القيود للحسابات', nameEn: 'Post Journal Entries', categoryAr: 'قيود اليومية', descriptionAr: 'الترحيل النهائي للأستاذ العام ومنع التعديل', categoryIcon: Receipt },
      { id: 'f_jv_unpost', code: 'Perm_JV_Unpost', nameAr: 'إلغاء ترحيل قيد', nameEn: 'Unpost Journal Entry', categoryAr: 'قيود اليومية', descriptionAr: 'فك ترحيل القيود للأغراض التصحيحية والرقابية', categoryIcon: Receipt },
      { id: 'f_jv_print', code: 'Perm_JV_Print', nameAr: 'طباعة سندات القيد', nameEn: 'Print Journal Vouchers', categoryAr: 'قيود اليومية', descriptionAr: 'استخراج وتصدير نماذج القيود المعتمدة', categoryIcon: Receipt },

      // الخزينة والبنوك
      { id: 'f_cash_receipt_create', code: 'Perm_Cash_Receipt_Add', nameAr: 'تحرير سند قبض نقد/بنك', nameEn: 'Create Receipt Voucher', categoryAr: 'الخزينة والبنوك', descriptionAr: 'تسجيل المقبوضات النقدية والتحويلات البنكية', categoryIcon: Banknote },
      { id: 'f_cash_payment_create', code: 'Perm_Cash_Payment_Add', nameAr: 'تحرير سند صرف نقد/بنك', nameEn: 'Create Payment Voucher', categoryAr: 'الخزينة والبنوك', descriptionAr: 'صرف مستحقات الموردين والعهد والمصروفات', categoryIcon: Banknote },
      { id: 'f_cash_approve', code: 'Perm_Cash_Approve', nameAr: 'اعتماد سندات الصرف', nameEn: 'Approve Payment Vouchers', categoryAr: 'الخزينة والبنوك', descriptionAr: 'الموافقة المالية النهائية قبل خروج النقدية', categoryIcon: Banknote },
      { id: 'f_cash_reconciliation', code: 'Perm_Bank_Reconcile', nameAr: 'التسوية البنكية ومطابقة الصناديق', nameEn: 'Bank Reconciliation', categoryAr: 'الخزينة والبنوك', descriptionAr: 'مطابقة كشوف حسابات البنوك مع دفاتر المنشأة', categoryIcon: Banknote },
      { id: 'f_cash_transfer', code: 'Perm_Cash_Transfer', nameAr: 'التحويل بين الخزائن والبنوك', nameEn: 'Treasury Inter-Transfer', categoryAr: 'الخزينة والبنوك', descriptionAr: 'إجراء مناقلات السيولة وتغذية العهد', categoryIcon: Banknote },

      // الشيكات وأوراق القبض والدفع
      { id: 'f_chq_in_receive', code: 'Perm_Chq_In_Add', nameAr: 'استلام شيك تحت التحصيل', nameEn: 'Receive Cheque Inward', categoryAr: 'أوراق القبض والدفع', descriptionAr: 'تسجيل بيانات شيكات العملاء الواردة', categoryIcon: Receipt },
      { id: 'f_chq_in_deposit', code: 'Perm_Chq_In_Deposit', nameAr: 'حافظة إيداع شيك للبنك', nameEn: 'Deposit Cheque to Bank', categoryAr: 'أوراق القبض والدفع', descriptionAr: 'إرسال الشيكات للتحصيل وتوليد القيد الوسيط', categoryIcon: Receipt },
      { id: 'f_chq_in_collect', code: 'Perm_Chq_In_Collect', nameAr: 'إثبات تحصيل شيك بالبنك', nameEn: 'Collect Cheque', categoryAr: 'أوراق القبض والدفع', descriptionAr: 'إضافة قيمة الشيك لحساب البنك الجاري', categoryIcon: Receipt },
      { id: 'f_chq_in_bounce', code: 'Perm_Chq_In_Bounce', nameAr: 'إثبات ارتداد شيك عميل', nameEn: 'Bounce Cheque', categoryAr: 'أوراق القبض والدفع', descriptionAr: 'إعادة فتح مديونية العميل واحتساب مصاريف الارتداد', categoryIcon: Receipt },
      { id: 'f_chq_out_issue', code: 'Perm_Chq_Out_Issue', nameAr: 'إصدار شيك لمورد', nameEn: 'Issue Outward Cheque', categoryAr: 'أوراق القبض والدفع', descriptionAr: 'تحرير شيكات آجلة وربطها برقم الحساب البنكي', categoryIcon: Receipt },

      // المبيعات والفوترة ZATCA
      { id: 'f_inv_create', code: 'Perm_Sales_Inv_Create', nameAr: 'إنشاء فاتورة مبيعات', nameEn: 'Create Sales Invoice', categoryAr: 'المبيعات والفوترة', descriptionAr: 'إصدار فواتير المبيعات ونقاط البيع', categoryIcon: ShoppingCart },
      { id: 'f_inv_approve', code: 'Perm_Sales_Inv_Approve', nameAr: 'اعتماد الفواتير التجارية', nameEn: 'Approve Sales Invoices', categoryAr: 'المبيعات والفوترة', descriptionAr: 'الاعتماد المحاسبي وتوليد قيود ضريبة القيمة المضافة', categoryIcon: ShoppingCart },
      { id: 'f_inv_price_override', code: 'Perm_Sales_Price_Override', nameAr: 'تعديل أسعار البيع المعتمدة', nameEn: 'Override Sales Prices', categoryAr: 'المبيعات والفوترة', descriptionAr: 'صلاحية تغيير السعر عن قائمة الأسعار المحددة', categoryIcon: ShoppingCart },
      { id: 'f_inv_discount', code: 'Perm_Sales_Discount', nameAr: 'منح خصومات تجارية', nameEn: 'Grant Sales Discounts', categoryAr: 'المبيعات والفوترة', descriptionAr: 'تطبيق نسب الخصم المسموح به للعميل', categoryIcon: ShoppingCart },
      { id: 'f_inv_zatca_sign', code: 'Perm_ZATCA_Sign', nameAr: 'توقيع وتصدير ZATCA TLV', nameEn: 'Sign ZATCA E-Invoice', categoryAr: 'المبيعات والفوترة', descriptionAr: 'توليد الباركود المشفر Base64 TLV والربط الضريبي', categoryIcon: ShoppingCart },
      { id: 'f_inv_returns', code: 'Perm_Sales_Returns', nameAr: 'اعتماد مردودات المبيعات', nameEn: 'Approve Sales Returns', categoryAr: 'المبيعات والفوترة', descriptionAr: 'إصدار إشعارات دائنة وإرجاع البضائع للمستودع', categoryIcon: ShoppingCart },

      // المشتريات والموردين
      { id: 'f_po_bill_create', code: 'Perm_Purch_Bill_Create', nameAr: 'تسجيل فاتورة شراء مورد', nameEn: 'Record Vendor Bill', categoryAr: 'المشتريات والمخزون', descriptionAr: 'إدخال فواتير الموردين وضريبة المدخلات', categoryIcon: Package },
      { id: 'f_po_bill_approve', code: 'Perm_Purch_Bill_Approve', nameAr: 'اعتماد استحقاق فاتورة الشراء', nameEn: 'Approve Vendor Bill', categoryAr: 'المشتريات والمخزون', descriptionAr: 'تثبيت المديونية وتوليد قيد الموردين التلقائي', categoryIcon: Package },
      { id: 'f_po_cost_view', code: 'Perm_Cost_Price_View', nameAr: 'الاطلاع على أسعار التكلفة', nameEn: 'View Cost Prices', categoryAr: 'المشتريات والمخزون', descriptionAr: 'كشف متوسط تكلفة الأصناف ومشتريات الشركات', categoryIcon: Package },
      { id: 'f_inv_adj', code: 'Perm_Stock_Reconcile', nameAr: 'تسويات المخزون السلعي', nameEn: 'Inventory Valuation Adjustments', categoryAr: 'المشتريات والمخزون', descriptionAr: 'تعديل أرصدة الأصناف وتكلفة المتوسط المرجح', categoryIcon: Package },

      // المستخلصات والمشاريع
      { id: 'f_ext_owner_approve', code: 'Perm_Extract_Owner_Approve', nameAr: 'اعتماد مستخلص المالك', nameEn: 'Approve Owner Payment Certificate', categoryAr: 'المشاريع والمستخلصات', descriptionAr: 'اعتماد مستخلصات المشروعات وإثبات إيرادات WIP', categoryIcon: HardHat },
      { id: 'f_ext_subcon_approve', code: 'Perm_Extract_Subcon_Approve', nameAr: 'اعتماد مستخلص مقاول باطن', nameEn: 'Approve Subcontractor IPC', categoryAr: 'المشاريع والمستخلصات', descriptionAr: 'خصم الدفعات المقدمة وتأمين الأعمال واحتساب الصافي', categoryIcon: HardHat },
      { id: 'f_ext_retention_release', code: 'Perm_Retention_Release', nameAr: 'الإفراج عن تأمين الأعمال', nameEn: 'Release Retention Guarantees', categoryAr: 'المشاريع والمستخلصات', descriptionAr: 'رد مبالغ الضمان بعد التسليم النهائي للمشروع', categoryIcon: HardHat },

      // التقارير المالية والختامية
      { id: 'f_rep_trial_balance', code: 'Perm_Report_Trial_Balance', nameAr: 'استخراج ميزان المراجعة', nameEn: 'Run Trial Balance', categoryAr: 'التقارير المالية والختامية', descriptionAr: 'عرض ميزان المراجعة بالمستويات 1 إلى 5', categoryIcon: BarChart3 },
      { id: 'f_rep_income_statement', code: 'Perm_Report_Income_Stmt', nameAr: 'عرض قائمة الدخل والأرباح', nameEn: 'Run Income Statement', categoryAr: 'التقارير المالية والختامية', descriptionAr: 'حساب مجمل وصافي الربح للفترات المحاسبية', categoryIcon: BarChart3 },
      { id: 'f_rep_balance_sheet', code: 'Perm_Report_Balance_Sheet', nameAr: 'عرض الميزانية العمومية', nameEn: 'Run Balance Sheet', categoryAr: 'التقارير المالية والختامية', descriptionAr: 'استعراض المركز المالي للمنشأة وحقوق الشركاء', categoryIcon: BarChart3 },
      { id: 'f_rep_statement_acc', code: 'Perm_Report_Statement', nameAr: 'طباعة كشف حساب تفصيلي', nameEn: 'Print Statement of Account', categoryAr: 'التقارير المالية والختامية', descriptionAr: 'استخراج حركات أي حساب مع فلاتر التاريخ ومراكز التكلفة', categoryIcon: BarChart3 },
    ],
  },

  // 2. الموارد البشرية (HRMS)
  hr: {
    id: 'hr',
    nameAr: 'إدارة الموارد البشرية (HRMS)',
    nameEn: 'Human Resources (HRMS)',
    icon: Users,
    colorVar: '#EBB34D',
    badge: 'HR Core',
    descriptionAr: 'ملفات الموظفين، عقود العمل، كشوف المرتبات، مسيرات الأجور، الإجازات، تقييم الأداء وإنهاء الخدمة.',
    permissions: [
      { id: 'hr_emp_dossier', code: 'Perm_HR_Dossier_Manage', nameAr: 'إدارة ملفات الموظفين وسجلاتهم', nameEn: 'Manage Employee Master Dossiers', categoryAr: 'شؤون الموظفين', descriptionAr: 'إنشاء وتعديل بيانات العاملين والأرشيف الوظيفي', categoryIcon: Users },
      { id: 'hr_contracts_ledger', code: 'Perm_HR_Contracts_Ledger', nameAr: 'إدارة وتوثيق عقود العمل', nameEn: 'Manage Employment Contracts Ledger', categoryAr: 'العقود والتوثيق', descriptionAr: 'تحرير عقود العمل وبنود الرواتب والبدلات والمدة', categoryIcon: FileText },
      { id: 'hr_payroll_calc', code: 'Perm_HR_Payroll_Calculate', nameAr: 'احتساب مسير الرواتب الشهري', nameEn: 'Calculate Standard Monthly Payroll', categoryAr: 'الرواتب والأجور', descriptionAr: 'إعداد كشوف الرواتب الشهرية والخصومات والتأمينات', categoryIcon: Banknote },
      { id: 'hr_disbursement_approve', code: 'Perm_HR_Disburse_Approve', nameAr: 'اعتماد كشوف صرف الأجور', nameEn: 'Approve Payroll Disbursement Sheets', categoryAr: 'الرواتب والأجور', descriptionAr: 'الموافقة النهائية على تحويل الرواتب للبنوك والسيولة', categoryIcon: CheckSquare },
      { id: 'hr_leaves_manage', code: 'Perm_HR_Leaves_Manage', nameAr: 'إدارة رصيد الإجازات والأذونات', nameEn: 'Manage Time-Off & Leave Balances', categoryAr: 'الدوام والإجازات', descriptionAr: 'اعتماد الإجازات السنوية والمرضية والخصومات المرتبطة', categoryIcon: Clock },
      { id: 'hr_appraisal_run', code: 'Perm_HR_Appraisal_Run', nameAr: 'إجراء تقييم الأداء الدوري', nameEn: 'Conduct Employee Performance Reviews', categoryAr: 'التطوير الإداري', descriptionAr: 'تسجيل مؤشرات الأداء الوظيفي والترقيات والتقارير', categoryIcon: Award },
      { id: 'hr_penalties_issue', code: 'Perm_HR_Penalties_Issue', nameAr: 'تطبيق الجزاءات والحوافز', nameEn: 'Issue Bonuses & Disciplinary Deductions', categoryAr: 'الرقابة والانضباط', descriptionAr: 'إقرار المكافآت أو الجزاءات وفق لائحة العمل', categoryIcon: AlertCircle },
      { id: 'hr_eos_settle', code: 'Perm_HR_EOS_Settle', nameAr: 'تسوية وإنهاء الخدمة (مكافأة نهاية الخدمة)', nameEn: 'Process End of Service Settlements', categoryAr: 'إنهاء الخدمة', descriptionAr: 'حساب مستحقات نهاية الخدمة ومخالصات الاستقالة/الفصل', categoryIcon: FolderMinus },
    ],
  },

  // 3. المكتب الفني والمشاريع (Technical Office & Projects)
  engineering: {
    id: 'engineering',
    nameAr: 'المكتب الفني وإدارة المشاريع',
    nameEn: 'Technical Office & Projects',
    icon: HardHat,
    colorVar: '#3B7A57',
    badge: 'Projects',
    descriptionAr: 'مستخلصات المالك، مقاولي الباطن، كشوف الحصر، أوامر التغيير (VOs)، الجداول الزمنية والتقارير.',
    permissions: [
      { id: 'eng_owner_ipc_issue', code: 'Perm_Eng_Owner_IPC', nameAr: 'إصدار مستخلص المالك التنفيذي', nameEn: 'Issue Owner Payment Certificates (IPC)', categoryAr: 'المستخلصات', descriptionAr: 'إعداد ورفع المستخلصات الدورية لجهة الإسناد والمالك', categoryIcon: FileCheck },
      { id: 'eng_subcon_ipc_audit', code: 'Perm_Eng_Subcon_IPC', nameAr: 'مراجعة وتدقيق مستخلصات مقاولي الباطن', nameEn: 'Audit Subcontractor Payment Certificates', categoryAr: 'المستخلصات', descriptionAr: 'حصر الأعمال المنفذة ومطابقتها مع مقاولي الباطن', categoryIcon: CheckSquare },
      { id: 'eng_boq_ledger', code: 'Perm_Eng_BOQ_Manage', nameAr: 'إدارة كشوف حصر الكميات والمقايسات', nameEn: 'Manage Bill of Quantities (BOQ)', categoryAr: 'حصر الكميات', descriptionAr: 'إدخال بنود المقايسات وتحديث كميات التنفيذ الميداني', categoryIcon: ClipboardList },
      { id: 'eng_vo_manage', code: 'Perm_Eng_VO_Manage', nameAr: 'إصدار واعتماد أوامر التغيير (VOs)', nameEn: 'Issue & Approve Variation Orders (VO)', categoryAr: 'أوامر التغيير', descriptionAr: 'تسجيل وتوثيق الأعمال المستجدة وتأثيرها المالي', categoryIcon: AlertCircle },
      { id: 'eng_schedule_track', code: 'Perm_Eng_Schedule_Track', nameAr: 'متابعة الجداول الزمنية ومراحل المشروع', nameEn: 'Track Project Milestones & Critical Path', categoryAr: 'التخطيط الزمني', descriptionAr: 'تحديث مؤشرات الإنجاز الزمني والمسار الحرج', categoryIcon: Calendar },
      { id: 'eng_site_daily_reports', code: 'Perm_Eng_Daily_Reports', nameAr: 'إعداد واعتماد تقارير الموقع اليومية', nameEn: 'Submit & Approve Daily Site Reports', categoryAr: 'المتابعة الميدانية', descriptionAr: 'توثيق العمالة والمعدات والطقس ونسب التنفيذ اليومية', categoryIcon: Activity },
      { id: 'eng_submittals_review', code: 'Perm_Eng_Submittals', nameAr: 'إدارة الاعتمادات الفنية للمواد والعينات', nameEn: 'Manage Technical Submittals & Approvals', categoryAr: 'الاعتمادات الفنية', descriptionAr: 'تقديم واعتماد المواصفات والمخططات التنفيذية Shop Drawings', categoryIcon: FileCheck },
      { id: 'eng_rfi_manage', code: 'Perm_Eng_RFI_Manage', nameAr: 'إصدار ومتابعة استفسارات الموقع (RFIs)', nameEn: 'Manage Site Inquiries & RFIs', categoryAr: 'الاستفسارات الفنية', descriptionAr: 'توجيه الاستفسارات الهندسية للاستشاري والمصمم', categoryIcon: HelpCircle },
    ],
  },

  // 4. الشؤون القانونية (Legal Affairs)
  legal: {
    id: 'legal',
    nameAr: 'الشؤون القانونية والتوثيق',
    nameEn: 'Legal Affairs & Compliance',
    icon: Scale,
    colorVar: '#B45309',
    badge: 'Legal',
    descriptionAr: 'متابعة القضايا، مراجعة العقود وتدقيقها، محاضر إثبات الحالة، الإنذارات والتوكيلات الرسمية.',
    permissions: [
      { id: 'leg_cases_manage', code: 'Perm_Leg_Cases_Manage', nameAr: 'متابعة القضايا والنزاعات القضائية', nameEn: 'Manage Litigation Tracking & Case Dossiers', categoryAr: 'التقاضي والنزاعات', descriptionAr: 'قيد ومتابعة الجلسات والأحكام ومذكرات الدفاع', categoryIcon: Scale },
      { id: 'leg_contract_vetting', code: 'Perm_Leg_Contract_Vetting', nameAr: 'مراجعة وتدقيق العقود والاتفاقيات', nameEn: 'Review & Vet Corporate Agreements', categoryAr: 'صياغة العقود', descriptionAr: 'الفحص القانوني لبنود عقود الموردين والمقاولين والشركاء', categoryIcon: FileText },
      { id: 'leg_incident_reports', code: 'Perm_Leg_Incident_Reports', nameAr: 'تحرير محاضر إثبات الحالة الإدارية', nameEn: 'File Incident Reports & Official Affidavits', categoryAr: 'إثبات الحالة', descriptionAr: 'توثيق المخالفات الميدانية ومحاضر التسليم والتسلم', categoryIcon: FileWarning },
      { id: 'leg_notices_issue', code: 'Perm_Leg_Notices_Issue', nameAr: 'إصدار وتوجيه الإنذارات القانونية الرسمية', nameEn: 'Issue Formal Legal Notices & Warnings', categoryAr: 'الإنذارات الرسمية', descriptionAr: 'توجيه خطابات سحب الأعمال والإنذارات البنكية والقانونية', categoryIcon: AlertCircle },
      { id: 'leg_poa_signatories', code: 'Perm_Leg_POA_Signatories', nameAr: 'إدارة التوكيلات والتفويضات الرسمية', nameEn: 'Manage Powers of Attorney & Signatories', categoryAr: 'التوكيلات الرسمية', descriptionAr: 'سجل التوكيلات التجارية والشهر العقاري وصلاحيات التوقيع', categoryIcon: Scroll },
      { id: 'leg_advisory_memos', code: 'Perm_Leg_Advisory_Memos', nameAr: 'إعداد المذكرات والاستشارات القانونية', nameEn: 'Draft Legal Advisory Notes & Memos', categoryAr: 'الرأي القانوني', descriptionAr: 'تقديم الرأي القانوني للإدارة العليا في النزاعات والتعاقدات', categoryIcon: HelpCircle },
    ],
  },

  // 5. الصادر والوارد (CTS - Correspondence)
  cts: {
    id: 'cts',
    nameAr: 'الصادر والوارد (CTS)',
    nameEn: 'Correspondence (CTS)',
    icon: Mail,
    colorVar: '#0D9488',
    badge: 'CTS Log',
    descriptionAr: 'قيد المراسلات الواردة، إصدار الخطابات الصادرة، التوجيه الإداري، والأرشفة وسرية المستندات.',
    permissions: [
      { id: 'cts_incoming_log', code: 'Perm_CTS_Incoming_Log', nameAr: 'تسجيل وقيد المراسلات والخطابات الواردة', nameEn: 'Register Incoming Correspondence', categoryAr: 'الوارد العام', descriptionAr: 'إثبات وصول الخطابات وتوليد الرقم الإشاري والباركود', categoryIcon: Mail },
      { id: 'cts_outgoing_issue', code: 'Perm_CTS_Outgoing_Issue', nameAr: 'تحرير واعتماد الخطابات الرسمية الصادرة', nameEn: 'Draft & Approve Outgoing Letters', categoryAr: 'الصادر العام', descriptionAr: 'إصدار المراسلات الموجهة للجهات الحكومية والشركاء', categoryIcon: Send },
      { id: 'cts_routing_action', code: 'Perm_CTS_Routing_Action', nameAr: 'التوجيه والإحالة الإدارية وتكليف المهام', nameEn: 'Administrative Routing & Action Directives', categoryAr: 'التوجيه الإداري', descriptionAr: 'إحالة المعاملات للإدارات المختصة ومتابعة الإنجاز', categoryIcon: Share2 },
      { id: 'cts_archive_scan', code: 'Perm_CTS_Archive_Scan', nameAr: 'الأرشفة الضوئية الرقمية والباركود', nameEn: 'Optical Document Archiving & Scanning', categoryAr: 'الأرشيف الرقمي', descriptionAr: 'رفع صور الخطابات والمرفقات ومسح الباركود السريع', categoryIcon: Archive },
      { id: 'cts_confidentiality', code: 'Perm_CTS_Confidential_Access', nameAr: 'الاطلاع على المراسلات السرية والمقيدة', nameEn: 'Access Confidential & Secret Records', categoryAr: 'السرية والأمان', descriptionAr: 'صلاحية فتح وتداول الخطابات المصنفة بدرجة سري للغاية', categoryIcon: Lock },
    ],
  },

  // 6. التأمينات الاجتماعية (Social Insurance)
  insurance: {
    id: 'insurance',
    nameAr: 'التأمينات الاجتماعية والامتثال',
    nameEn: 'Social Insurance & Compliance',
    icon: ShieldCheck,
    colorVar: '#15803D',
    badge: 'Insurance',
    descriptionAr: 'استمارات س1 وس2 وس6، سداد الاشتراكات الشهرية، وفتح وإغلاق ملفات المقاولات والعمليات.',
    permissions: [
      { id: 'ins_form_s1_register', code: 'Perm_Ins_Form_S1', nameAr: 'إعداد ورفع استمارات س1 (تسجيل عامل)', nameEn: 'Prepare & File Form S1 (New Insured)', categoryAr: 'الاستمارات التأمينية', descriptionAr: 'تسجيل العاملين الجدد في منظومة التأمينات الاجتماعية', categoryIcon: UserCheck },
      { id: 'ins_form_s2_update', code: 'Perm_Ins_Form_S2', nameAr: 'تحديث استمارات س2 (تعديل الأجور والاشتراكات)', nameEn: 'Update Form S2 (Annual Wage Adjustments)', categoryAr: 'الاستمارات التأمينية', descriptionAr: 'تحديث وعاء الأجور السنوي للمؤمن عليهم لدى التأمينات', categoryIcon: FileSpreadsheet },
      { id: 'ins_form_s6_terminate', code: 'Perm_Ins_Form_S6', nameAr: 'إعداد استمارات س6 (إنهاء اشتراك مؤمن عليه)', nameEn: 'File Form S6 (Insurance De-registration)', categoryAr: 'الاستمارات التأمينية', descriptionAr: 'استبعاد العاملين المنتهية خدمتهم وإسقاط التغطية', categoryIcon: FolderMinus },
      { id: 'ins_dues_reconcile', code: 'Perm_Ins_Dues_Reconcile', nameAr: 'مطابقة وسداد الاشتراكات الشهرية المستحقة', nameEn: 'Reconcile & Settle Monthly Insurance Dues', categoryAr: 'الاشتراكات المالية', descriptionAr: 'مطابقة مطالبات مكتب التأمينات وإعداد أوامر الصرف', categoryIcon: CreditCard },
      { id: 'ins_sites_file_open', code: 'Perm_Ins_Site_Files', nameAr: 'فتح وإغلاق ملفات العمليات والمقاولات التأمينية', nameEn: 'Open & Close Site Insurance Contractor Files', categoryAr: 'ملفات المقاولات', descriptionAr: 'استخراج الشهادات التأمينية للمشاريع وتصفية العمليات', categoryIcon: HardHat },
      { id: 'ins_compliance_audit', code: 'Perm_Ins_Compliance_Audit', nameAr: 'الفحص والامتثال التأميني الدوري والشهادات', nameEn: 'Run Insurance Compliance Audit & Clearances', categoryAr: 'الامتثال والفحص', descriptionAr: 'الحصول على شهادات التأمينات السارية وتجنب الغرامات', categoryIcon: ShieldCheck },
    ],
  },

  // 7. استقطاب الكفاءات (ATS - Recruitment)
  ats: {
    id: 'ats',
    nameAr: 'استقطاب الكفاءات والتوظيف (ATS)',
    nameEn: 'Talent Acquisition (ATS)',
    icon: UserCheck,
    colorVar: '#6366F1',
    badge: 'Hiring',
    descriptionAr: 'نشر الإعلانات الوظيفية، فحص السير الذاتية، جدولة المقابلات، وإصدار عروض العمل.',
    permissions: [
      { id: 'ats_job_post_manage', code: 'Perm_ATS_Job_Postings', nameAr: 'نشر وإدارة الإعلانات الوظيفية والشواغر', nameEn: 'Manage Job Openings & Public Postings', categoryAr: 'الشواغر الوظيفية', descriptionAr: 'إنشاء متطلبات الوظائف وفتح باب التقديم الإلكتروني', categoryIcon: FileText },
      { id: 'ats_resume_screen', code: 'Perm_ATS_Resume_Screen', nameAr: 'فحص وتصنيف السير الذاتية ومسار المرشحين', nameEn: 'Screen Resumes & Manage Candidate Pipeline', categoryAr: 'فرز المرشحين', descriptionAr: 'تقييم ملفات المتقدمين وتحريكهم في مسار Kanban', categoryIcon: UserCheck },
      { id: 'ats_interview_schedule', code: 'Perm_ATS_Interview_Schedule', nameAr: 'جدولة لجان المقابلات والاختبارات الفنية', nameEn: 'Schedule Interviews & Technical Evaluations', categoryAr: 'المقابلات الشخصية', descriptionAr: 'تحديد مواعيد المقابلات وتوثيق درجات لجان التقييم', categoryIcon: Calendar },
      { id: 'ats_offer_onboard', code: 'Perm_ATS_Offer_Onboarding', nameAr: 'إصدار عروض العمل ومسوغات التعيين (Onboarding)', nameEn: 'Issue Job Offers & Manage Onboarding Dossiers', categoryAr: 'عروض التعيين', descriptionAr: 'إرسال عروض العمل للمرشحين واستلام مسوغات التعيين', categoryIcon: CheckCircle },
    ],
  },

  // 8. الاستقبال والزوار (Front Desk & Security)
  reception: {
    id: 'reception',
    nameAr: 'الاستقبال وضبط البوابات',
    nameEn: 'Front Desk & Reception',
    icon: ConciergeBell,
    colorVar: '#D99B26',
    badge: 'Front Desk',
    descriptionAr: 'سجل الزيارات، تصاريح الدخول، قاعات الاجتماعات، استلام الطرود والمستندات الورقية.',
    permissions: [
      { id: 'rec_visitor_checkin', code: 'Perm_Rec_Visitor_Log', nameAr: 'تسجيل الزوار الرقمي وإصدار بطاقات الدخول', nameEn: 'Digital Visitor Check-In & Access Badging', categoryAr: 'إدارة الزوار', descriptionAr: 'تسجيل بيانات الضيوف والتقاط الصور وتوليد تصريح الدخول', categoryIcon: DoorOpen },
      { id: 'rec_meeting_rooms', code: 'Perm_Rec_Room_Booking', nameAr: 'حجز وتجهيز قاعات الاجتماعات والضيافة VIP', nameEn: 'Meeting Room Reservations & VIP Hospitality', categoryAr: 'القاعات والضيافة', descriptionAr: 'تنظيم جداول قاعات الاجتماعات وتنسيق خدمات الضيافة', categoryIcon: Calendar },
      { id: 'rec_contractor_passes', code: 'Perm_Rec_Contractor_Passes', nameAr: 'إصدار تصاريح دخول الفنيين ومقاولي الصيانة', nameEn: 'Issue Temporary Contractor & Tech Passes', categoryAr: 'التصاريح الأمنية', descriptionAr: 'منح أذونات الدخول المؤقتة لمقرات المنشأة والمواقع', categoryIcon: KeyRound },
      { id: 'rec_parcels_courier', code: 'Perm_Rec_Parcels_Log', nameAr: 'استلام وتسليم الطرود والشحنات السريعة', nameEn: 'Log & Dispatch Parcels, Mail & Couriers', categoryAr: 'الشحنات والطرود', descriptionAr: 'توثيق وصول الطرود الرسمية وتسليمها للمستلمين المعنيين', categoryIcon: Box },
      { id: 'rec_calls_directory', code: 'Perm_Rec_Calls_Directory', nameAr: 'سجل الاتصالات وتحويل المكالمات والبدالة', nameEn: 'Handle Corporate Inquiries & Phone Directory', categoryAr: 'الاتصالات والبدالة', descriptionAr: 'الرد على الاستفسارات المركزية وتحويل الخطوط الداخلية', categoryIcon: PhoneCall },
    ],
  },

  // 9. الإدارة العليا والاستراتيجية (C-Suite)
  csuite: {
    id: 'csuite',
    nameAr: 'الإدارة العليا والاستراتيجية (C-Suite)',
    nameEn: 'Executive Strategy & Governance',
    icon: Activity,
    colorVar: '#D99B26',
    badge: 'C-Suite',
    descriptionAr: 'مؤشرات الأداء الموحدة، مصفوفة المخاطر، الاعتمادات الاستراتيجية، وإقفال الفترات.',
    permissions: [
      { id: 'exec_kpi_oversight', code: 'Perm_Exec_Unified_KPIs', nameAr: 'الاطلاع على لوحة مؤشرات الأداء الموحدة', nameEn: 'Unified Enterprise KPI Governance & Analytics', categoryAr: 'مؤشرات الأداء', descriptionAr: 'متابعة ربحية الشركات التابعة، التدفق النقدي، ونسب الإنجاز', categoryIcon: Activity },
      { id: 'exec_risk_matrix', code: 'Perm_Exec_Risk_Matrix', nameAr: 'إدارة وتحديث مصفوفة المخاطر المؤسسية', nameEn: 'Manage Enterprise Risk Matrix & Contingencies', categoryAr: 'إدارة المخاطر', descriptionAr: 'تقييم المخاطر المالية والتعاقدية والميدانية وخطط المعالجة', categoryIcon: ShieldAlert },
      { id: 'exec_strategic_approvals', code: 'Perm_Exec_Strategic_Capex', nameAr: 'الاعتمادات الاستراتيجية للنفقات والمشاريع', nameEn: 'Approve Strategic Investments & Project Capex', categoryAr: 'الاعتمادات الاستراتيجية', descriptionAr: 'الموافقة على عقود المشاريع الكبرى وشراء الأصول الرأسمالية', categoryIcon: CheckSquare },
      { id: 'exec_period_close', code: 'Perm_Exec_Period_Close', nameAr: 'إقفال الفترات المالية والتشغيلية العامة', nameEn: 'Authorize Financial & Operational Period Close', categoryAr: 'الإقفال المؤسسي', descriptionAr: 'إغلاق الفترات المحاسبية السنوية والربع سنوية ومنع التعديل', categoryIcon: LockKeyhole },
      { id: 'exec_governance_board', code: 'Perm_Exec_Board_Resolutions', nameAr: 'حوكمة القرارات والتعميمات السيادية', nameEn: 'Corporate Governance & Board Resolutions', categoryAr: 'الحوكمة العامة', descriptionAr: 'إصدار اللوائح والقرارات الإدارية العليا الملزمة لكافة الشركات', categoryIcon: Award },
    ],
  },
};
