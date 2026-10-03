import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import {
  ShieldCheck,
  Check,
  Search,
  Save,
  Layers,
  Banknote,
  Receipt,
  ShoppingCart,
  Package,
  HardHat,
  BarChart3
} from 'lucide-react';

interface RbacFlag {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  categoryAr: string;
  descriptionAr: string;
  categoryIcon: React.ElementType;
}

const FINANCIAL_RBAC_FLAGS: RbacFlag[] = [
  // 1. الدليل المحاسبي
  { id: 'f_coa_view', code: 'Perm_COA_View', nameAr: 'عرض شجرة الحسابات', nameEn: 'View Chart of Accounts', categoryAr: 'دليل الحسابات', descriptionAr: 'استعراض الهيكل الشجري للحسابات والمستويات 1-5', categoryIcon: Layers },
  { id: 'f_coa_add', code: 'Perm_COA_Add', nameAr: 'إضافة حساب جديد', nameEn: 'Add New Account', categoryAr: 'دليل الحسابات', descriptionAr: 'إنشاء حسابات تفصيلية أو رئيسية جديدة', categoryIcon: Layers },
  { id: 'f_coa_edit', code: 'Perm_COA_Edit', nameAr: 'تعديل بيانات حساب', nameEn: 'Edit Account Details', categoryAr: 'دليل الحسابات', descriptionAr: 'تعديل اسم أو طبيعة أو تصنيف الحساب', categoryIcon: Layers },
  { id: 'f_coa_delete', code: 'Perm_COA_Delete', nameAr: 'حذف / تعطيل حساب', nameEn: 'Delete/Deactivate Account', categoryAr: 'دليل الحسابات', descriptionAr: 'تعطيل الحسابات الخالية من الحركات التاريخية', categoryIcon: Layers },
  { id: 'f_coa_audit', code: 'Perm_COA_Audit', nameAr: 'مراجعة وتدقيق الدليل', nameEn: 'Audit Chart of Accounts', categoryAr: 'دليل الحسابات', descriptionAr: 'مطابقة طبيعة الحسابات وتوازن الأصول والخصوم', categoryIcon: Layers },

  // 2. قيود اليومية
  { id: 'f_jv_view', code: 'Perm_JV_View', nameAr: 'عرض قيود اليومية', nameEn: 'View Journal Entries', categoryAr: 'قيود اليومية', descriptionAr: 'الاطلاع على سندات وقيود اليومية العامة', categoryIcon: Receipt },
  { id: 'f_jv_create', code: 'Perm_JV_Create', nameAr: 'إنشاء قيد يومية', nameEn: 'Create Journal Voucher', categoryAr: 'قيود اليومية', descriptionAr: 'إدخال قيود محاسبية يدوية وتفقيط المبالغ', categoryIcon: Receipt },
  { id: 'f_jv_edit', code: 'Perm_JV_Edit', nameAr: 'تعديل مسودة قيد', nameEn: 'Edit Draft Voucher', categoryAr: 'قيود اليومية', descriptionAr: 'تعديل أطراف القيد قبل الاعتماد والترحيل', categoryIcon: Receipt },
  { id: 'f_jv_post', code: 'Perm_JV_Post', nameAr: 'ترحيل القيود للحسابات', nameEn: 'Post Journal Entries', categoryAr: 'قيود اليومية', descriptionAr: 'الترحيل النهائي للأستاذ العام ومنع التعديل', categoryIcon: Receipt },
  { id: 'f_jv_unpost', code: 'Perm_JV_Unpost', nameAr: 'إلغاء ترحيل قيد', nameEn: 'Unpost Journal Entry', categoryAr: 'قيود اليومية', descriptionAr: 'فك ترحيل القيود للأغراض التصحيحية والرقابية', categoryIcon: Receipt },
  { id: 'f_jv_print', code: 'Perm_JV_Print', nameAr: 'طباعة سندات القيد', nameEn: 'Print Journal Vouchers', categoryAr: 'قيود اليومية', descriptionAr: 'استخراج وتصدير نماذج القيود المعتمدة', categoryIcon: Receipt },

  // 3. الخزينة والبنوك
  { id: 'f_cash_receipt_create', code: 'Perm_Cash_Receipt_Add', nameAr: 'تحرير سند قبض نقد/بنك', nameEn: 'Create Receipt Voucher', categoryAr: 'الخزينة والبنوك', descriptionAr: 'تسجيل المقبوضات النقدية والتحويلات البنكية', categoryIcon: Banknote },
  { id: 'f_cash_payment_create', code: 'Perm_Cash_Payment_Add', nameAr: 'تحرير سند صرف نقد/بنك', nameEn: 'Create Payment Voucher', categoryAr: 'الخزينة والبنوك', descriptionAr: 'صرف مستحقات الموردين والعهد والمصروفات', categoryIcon: Banknote },
  { id: 'f_cash_approve', code: 'Perm_Cash_Approve', nameAr: 'اعتماد سندات الصرف', nameEn: 'Approve Payment Vouchers', categoryAr: 'الخزينة والبنوك', descriptionAr: 'الموافقة المالية النهائية قبل خروج النقدية', categoryIcon: Banknote },
  { id: 'f_cash_reconciliation', code: 'Perm_Bank_Reconcile', nameAr: 'التسوية البنكية ومطابقة الصناديق', nameEn: 'Bank Reconciliation', categoryAr: 'الخزينة والبنوك', descriptionAr: 'مطابقة كشوف حسابات البنوك مع دفاتر المنشأة', categoryIcon: Banknote },
  { id: 'f_cash_transfer', code: 'Perm_Cash_Transfer', nameAr: 'التحويل بين الخزائن والبنوك', nameEn: 'Treasury Inter-Transfer', categoryAr: 'الخزينة والبنوك', descriptionAr: 'إجراء مناقلات السيولة وتغذية العهد', categoryIcon: Banknote },

  // 4. الشيكات وأوراق القبض والدفع
  { id: 'f_chq_in_receive', code: 'Perm_Chq_In_Add', nameAr: 'استلام شيك تحت التحصيل', nameEn: 'Receive Cheque Inward', categoryAr: 'أوراق القبض والدفع', descriptionAr: 'تسجيل بيانات شيكات العملاء الواردة', categoryIcon: Receipt },
  { id: 'f_chq_in_deposit', code: 'Perm_Chq_In_Deposit', nameAr: 'حافظة إيداع شيك للبنك', nameEn: 'Deposit Cheque to Bank', categoryAr: 'أوراق القبض والدفع', descriptionAr: 'إرسال الشيكات للتحصيل وتوليد القيد الوسيط', categoryIcon: Receipt },
  { id: 'f_chq_in_collect', code: 'Perm_Chq_In_Collect', nameAr: 'إثبات تحصيل شيك بالبنك', nameEn: 'Collect Cheque', categoryAr: 'أوراق القبض والدفع', descriptionAr: 'إضافة قيمة الشيك لحساب البنك الجاري', categoryIcon: Receipt },
  { id: 'f_chq_in_bounce', code: 'Perm_Chq_In_Bounce', nameAr: 'إثبات ارتداد شيك عميل', nameEn: 'Bounce Cheque', categoryAr: 'أوراق القبض والدفع', descriptionAr: 'إعادة فتح مديونية العميل واحتساب مصاريف الارتداد', categoryIcon: Receipt },
  { id: 'f_chq_out_issue', code: 'Perm_Chq_Out_Issue', nameAr: 'إصدار شيك لمورد', nameEn: 'Issue Outward Cheque', categoryAr: 'أوراق القبض والدفع', descriptionAr: 'تحرير شيكات آجلة وربطها برقم الحساب البنكي', categoryIcon: Receipt },

  // 5. المبيعات والفوترة ZATCA
  { id: 'f_inv_create', code: 'Perm_Sales_Inv_Create', nameAr: 'إنشاء فاتورة مبيعات', nameEn: 'Create Sales Invoice', categoryAr: 'المبيعات والفوترة', descriptionAr: 'إصدار فواتير المبيعات ونقاط البيع', categoryIcon: ShoppingCart },
  { id: 'f_inv_approve', code: 'Perm_Sales_Inv_Approve', nameAr: 'اعتماد الفواتير التجارية', nameEn: 'Approve Sales Invoices', categoryAr: 'المبيعات والفوترة', descriptionAr: 'الاعتماد المحاسبي وتوليد قيود ضريبة القيمة المضافة', categoryIcon: ShoppingCart },
  { id: 'f_inv_price_override', code: 'Perm_Sales_Price_Override', nameAr: 'تعديل أسعار البيع المعتمدة', nameEn: 'Override Sales Prices', categoryAr: 'المبيعات والفوترة', descriptionAr: 'صلاحية تغيير السعر عن قائمة الأسعار المحددة', categoryIcon: ShoppingCart },
  { id: 'f_inv_discount', code: 'Perm_Sales_Discount', nameAr: 'منح خصومات تجارية', nameEn: 'Grant Sales Discounts', categoryAr: 'المبيعات والفوترة', descriptionAr: 'تطبيق نسب الخصم المسموح به للعميل', categoryIcon: ShoppingCart },
  { id: 'f_inv_zatca_sign', code: 'Perm_ZATCA_Sign', nameAr: 'توقيع وتصدير ZATCA TLV', nameEn: 'Sign ZATCA E-Invoice', categoryAr: 'المبيعات والفوترة', descriptionAr: 'توليد الباركود المشفر Base64 TLV والربط الضريبي', categoryIcon: ShoppingCart },
  { id: 'f_inv_returns', code: 'Perm_Sales_Returns', nameAr: 'اعتماد مردودات المبيعات', nameEn: 'Approve Sales Returns', categoryAr: 'المبيعات والفوترة', descriptionAr: 'إصدار إشعارات دائنة وإرجاع البضائع للمستودع', categoryIcon: ShoppingCart },

  // 6. المشتريات والموردين
  { id: 'f_po_bill_create', code: 'Perm_Purch_Bill_Create', nameAr: 'تسجيل فاتورة شراء مورد', nameEn: 'Record Vendor Bill', categoryAr: 'المشتريات والمخزون', descriptionAr: 'إدخال فواتير الموردين وضريبة المدخلات', categoryIcon: Package },
  { id: 'f_po_bill_approve', code: 'Perm_Purch_Bill_Approve', nameAr: 'اعتماد استحقاق فاتورة الشراء', nameEn: 'Approve Vendor Bill', categoryAr: 'المشتريات والمخزون', descriptionAr: 'تثبيت المديونية وتوليد قيد الموردين التلقائي', categoryIcon: Package },
  { id: 'f_po_cost_view', code: 'Perm_Cost_Price_View', nameAr: 'الاطلاع على أسعار التكلفة', nameEn: 'View Cost Prices', categoryAr: 'المشتريات والمخزون', descriptionAr: 'كشف متوسط تكلفة الأصناف ومشتريات الشركات', categoryIcon: Package },
  { id: 'f_inv_adj', code: 'Perm_Stock_Reconcile', nameAr: 'تسويات المخزون السلعي', nameEn: 'Inventory Valuation Adjustments', categoryAr: 'المشتريات والمخزون', descriptionAr: 'تعديل أرصدة الأصناف وتكلفة المتوسط المرجح', categoryIcon: Package },

  // 7. المستخلصات والمشاريع
  { id: 'f_ext_owner_approve', code: 'Perm_Extract_Owner_Approve', nameAr: 'اعتماد مستخلص المالك', nameEn: 'Approve Owner Payment Certificate', categoryAr: 'المشاريع والمستخلصات', descriptionAr: 'اعتماد مستخلصات المشروعات وإثبات إيرادات WIP', categoryIcon: HardHat },
  { id: 'f_ext_subcon_approve', code: 'Perm_Extract_Subcon_Approve', nameAr: 'اعتماد مستخلص مقاول باطن', nameEn: 'Approve Subcontractor IPC', categoryAr: 'المشاريع والمستخلصات', descriptionAr: 'خصم الدفعات المقدمة وتأمين الأعمال واحتساب الصافي', categoryIcon: HardHat },
  { id: 'f_ext_retention_release', code: 'Perm_Retention_Release', nameAr: 'الإفراج عن تأمين الأعمال', nameEn: 'Release Retention Guarantees', categoryAr: 'المشاريع والمستخلصات', descriptionAr: 'رد مبالغ الضمان بعد التسليم النهائي للمشروع', categoryIcon: HardHat },

  // 8. التقارير المالية والختامية
  { id: 'f_rep_trial_balance', code: 'Perm_Report_Trial_Balance', nameAr: 'استخراج ميزان المراجعة', nameEn: 'Run Trial Balance', categoryAr: 'التقارير المالية والختامية', descriptionAr: 'عرض ميزان المراجعة بالمستويات 1 إلى 5', categoryIcon: BarChart3 },
  { id: 'f_rep_income_statement', code: 'Perm_Report_Income_Stmt', nameAr: 'عرض قائمة الدخل والأرباح', nameEn: 'Run Income Statement', categoryAr: 'التقارير المالية والختامية', descriptionAr: 'حساب مجمل وصافي الربح للفترات المحاسبية', categoryIcon: BarChart3 },
  { id: 'f_rep_balance_sheet', code: 'Perm_Report_Balance_Sheet', nameAr: 'عرض الميزانية العمومية', nameEn: 'Run Balance Sheet', categoryAr: 'التقارير المالية والختامية', descriptionAr: 'استعراض المركز المالي للمنشأة وحقوق الشركاء', categoryIcon: BarChart3 },
  { id: 'f_rep_statement_acc', code: 'Perm_Report_Statement', nameAr: 'طباعة كشف حساب تفصيلي', nameEn: 'Print Statement of Account', categoryAr: 'التقارير المالية والختامية', descriptionAr: 'استخراج حركات أي حساب مع فلاتر التاريخ ومراكز التكلفة', categoryIcon: BarChart3 },
];

type RoleKey = 'cfo' | 'chief_acc' | 'gen_acc' | 'cashier' | 'purchaser' | 'auditor';

const ROLES: { id: RoleKey; titleAr: string; titleEn: string; badge: string }[] = [
  { id: 'cfo', titleAr: 'المدير المالي (CFO)', titleEn: 'Chief Financial Officer', badge: 'إدارة عليا' },
  { id: 'chief_acc', titleAr: 'رئيس الحسابات', titleEn: 'Chief Accountant', badge: 'إشرافي' },
  { id: 'gen_acc', titleAr: 'محاسب عام', titleEn: 'General Accountant', badge: 'تشغيلي' },
  { id: 'cashier', titleAr: 'أمين صندوق / خازن', titleEn: 'Treasurer & Cashier', badge: 'خزينة' },
  { id: 'purchaser', titleAr: 'مسؤول المشتريات', titleEn: 'Purchasing Officer', badge: 'مشتريات' },
  { id: 'auditor', titleAr: 'مراجع حسابات داخلي', titleEn: 'Internal Auditor', badge: 'رقابة وتدقيق' },
];

export const FinancialRbacMatrix: React.FC = () => {
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<RoleKey>('cfo');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Initial matrix state
  const [permissionsState, setPermissionsState] = useState<Record<RoleKey, Set<string>>>(() => {
    const cfoSet = new Set(FINANCIAL_RBAC_FLAGS.map(f => f.id));
    const chiefSet = new Set(
      FINANCIAL_RBAC_FLAGS.filter(f => f.id !== 'f_coa_delete' && f.id !== 'f_ext_retention_release').map(f => f.id)
    );
    const genSet = new Set([
      'f_coa_view', 'f_jv_view', 'f_jv_create', 'f_jv_edit', 'f_jv_print',
      'f_cash_receipt_create', 'f_cash_payment_create', 'f_chq_in_receive',
      'f_inv_create', 'f_po_bill_create', 'f_rep_trial_balance', 'f_rep_statement_acc'
    ]);
    const cashierSet = new Set([
      'f_coa_view', 'f_cash_receipt_create', 'f_cash_payment_create',
      'f_cash_transfer', 'f_chq_in_receive', 'f_chq_in_deposit', 'f_rep_statement_acc'
    ]);
    const purchaserSet = new Set([
      'f_coa_view', 'f_po_bill_create', 'f_po_cost_view'
    ]);
    const auditorSet = new Set([
      'f_coa_view', 'f_coa_audit', 'f_jv_view', 'f_jv_print', 'f_cash_reconciliation',
      'f_po_cost_view', 'f_rep_trial_balance', 'f_rep_income_statement',
      'f_rep_balance_sheet', 'f_rep_statement_acc'
    ]);

    return {
      cfo: cfoSet,
      chief_acc: chiefSet,
      gen_acc: genSet,
      cashier: cashierSet,
      purchaser: purchaserSet,
      auditor: auditorSet,
    };
  });

  const categories = Array.from(new Set(FINANCIAL_RBAC_FLAGS.map(f => f.categoryAr)));

  const togglePermission = (flagId: string) => {
    setPermissionsState(prev => {
      const currentRoleSet = new Set(prev[selectedRole]);
      if (currentRoleSet.has(flagId)) {
        currentRoleSet.delete(flagId);
      } else {
        currentRoleSet.add(flagId);
      }
      return {
        ...prev,
        [selectedRole]: currentRoleSet,
      };
    });
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const filteredFlags = FINANCIAL_RBAC_FLAGS.filter(flag => {
    const matchesSearch =
      !searchQuery ||
      flag.nameAr.includes(searchQuery) ||
      flag.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flag.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || flag.categoryAr === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const activeRolePermissions = permissionsState[selectedRole];

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-gradient-to-r from-[#FBF9F5] via-[#F3EFE6] to-[#EAE4D7]/60 dark:from-[#17231A] dark:via-[#131E15] dark:to-[#0E1610] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#059669]/15 text-[#059669] dark:text-[#34D399] flex items-center justify-center shrink-0 border border-[#059669]/25 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-[#1A241C] dark:text-[#F3EFE6]">
                {t('صلاحيات الإدارة المالية (Financial Affairs Permissions Matrix)', 'Financial Affairs RBAC Matrix')}
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#059669]/15 text-[#059669] dark:text-[#34D399]">
                58 {t('صلاحية تفصيلية', 'Flags')}
              </span>
            </div>
            <p className="text-xs text-[#5C665E] dark:text-[#8FA392] mt-0.5">
              {t(
                'إدارة وتوزيع صلاحيات الحسابات وقيود اليومية والاعتمادات النقدية والمبيعات والتكلفة المستخرجة من جدول المستخدمين dbo.Users',
                'Granular financial RBAC matrix modernized from legacy dbo.Users permissions'
              )}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              {t('تم حفظ المصفوفة بنجاح', 'Saved Successfully')}
            </span>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#059669] text-white hover:bg-[#047857] shadow-xs transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{t('حفظ صلاحيات الدور', 'Save Permissions')}</span>
          </button>
        </div>
      </div>

      {/* Role Presets Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {ROLES.map(role => {
          const isSelected = selectedRole === role.id;
          const assignedCount = permissionsState[role.id].size;

          return (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#059669] text-white border-[#059669] shadow-xs'
                  : 'bg-[#F3EFE6] dark:bg-[#17231A] border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-[#EAE4D7] dark:bg-[#243628] text-[#5C665E] dark:text-[#8FA392]'
                  }`}
                >
                  {role.badge}
                </span>
                <span
                  className={`text-xs font-mono font-bold ${
                    isSelected ? 'text-white' : 'text-[#059669] dark:text-[#34D399]'
                  }`}
                >
                  {assignedCount}/{FINANCIAL_RBAC_FLAGS.length}
                </span>
              </div>
              <h4 className="text-xs font-bold truncate">{role.titleAr}</h4>
            </button>
          );
        })}
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="p-3.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute inset-y-0 my-auto start-3 text-[#5C665E] dark:text-[#8FA392]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('بحث في صلاحيات الإدارة المالية...', 'Search financial permissions...')}
            className="w-full ps-9 pe-4 py-1.5 text-xs rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#1A241C] text-[#1A241C] dark:text-[#F3EFE6] placeholder-[#5C665E]/70 focus:outline-hidden focus:border-[#059669]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-[#059669] text-white'
                : 'bg-[#F3EFE6] dark:bg-[#1A241C] text-[#5C665E] dark:text-[#8FA392] border border-[#E0D9CB] dark:border-[#243628]'
            }`}
          >
            {t('جميع الأقسام', 'All Sections')}
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-[#059669] text-white'
                  : 'bg-[#F3EFE6] dark:bg-[#1A241C] text-[#5C665E] dark:text-[#8FA392] border border-[#E0D9CB] dark:border-[#243628]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Permissions Grid Table */}
      <div className="rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#121B14] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] font-bold">
                <th className="py-3 px-4 text-start">{t('الصلاحية المالية والرمز', 'Permission & Code')}</th>
                <th className="py-3 px-4 text-start">{t('التصنيف المحاسبي', 'Category')}</th>
                <th className="py-3 px-4 text-start">{t('الوصف الإجرائي', 'Scope & Description')}</th>
                <th className="py-3 px-4 text-center w-28">{t('حالة الصلاحية', 'Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]/60">
              {filteredFlags.map(flag => {
                const isGranted = activeRolePermissions.has(flag.id);
                const Icon = flag.categoryIcon;

                return (
                  <tr
                    key={flag.id}
                    onClick={() => togglePermission(flag.id)}
                    className={`hover:bg-[#F3EFE6]/70 dark:hover:bg-[#17231A]/60 transition-colors cursor-pointer ${
                      isGranted ? 'bg-[#059669]/5' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isGranted
                              ? 'bg-[#059669]/15 text-[#059669]'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6] block">
                            {flag.nameAr}
                          </span>
                          <span className="font-mono text-[10.5px] text-[#5C665E] dark:text-[#8FA392]">
                            {flag.code}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392] border border-[#E0D9CB] dark:border-[#243628]">
                        {flag.categoryAr}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[#5C665E] dark:text-[#8FA392]">
                      {flag.descriptionAr}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                            isGranted
                              ? 'bg-[#059669] border-[#059669] text-white shadow-2xs'
                              : 'border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A]'
                          }`}
                        >
                          {isGranted && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
