import React, { useState } from 'react';
import { useHR, PayrollItem } from '../../../context/HRContext';
import { useTenant } from '../../../context/TenantContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Modal } from '../../common/Modal';
import {
  Download,
  CheckCircle2,
  FileSpreadsheet,
  Coins,
  TrendingDown,
  TrendingUp,
  FileText,
  Printer,
  Calendar,
  Landmark,
  Search
} from 'lucide-react';

export const StandardPayrollView: React.FC = () => {
  const { t } = useLanguage();
  const {
    payrollItems,
    currentPayrollPeriod,
    setCurrentPayrollPeriod,
    markPayrollItemPaid,
    batchApprovePayroll,
  } = useHR();
  const { companies } = useTenant();

  // Search & Filter
  const [payrollSearch, setPayrollSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');

  // Modals
  const [selectedSlip, setSelectedSlip] = useState<PayrollItem | null>(null);
  const [isBankExportOpen, setIsBankExportOpen] = useState(false);

  // Filtered Items
  const filteredPayroll = payrollItems.filter(item => {
    const matchesSearch =
      item.employeeName.toLowerCase().includes(payrollSearch.toLowerCase()) ||
      item.employeeCode.toLowerCase().includes(payrollSearch.toLowerCase()) ||
      item.jobTitle.toLowerCase().includes(payrollSearch.toLowerCase());
    const matchesCompany = companyFilter === 'all' || item.companyId === companyFilter;
    return matchesSearch && matchesCompany;
  });

  // Totals
  const totalBasic = filteredPayroll.reduce((a, b) => a + b.basicSalary, 0);
  const totalAllowances = filteredPayroll.reduce((a, b) => a + (b.housingAllowance + b.transportAllowance + b.siteBonus), 0);
  const totalDeductions = filteredPayroll.reduce((a, b) => a + b.totalDeductions, 0);
  const totalNet = filteredPayroll.reduce((a, b) => a + b.netSalary, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Financial Payroll Totals Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Net Payroll */}
        <div className="p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">
            <span>{t('صافي رواتب الفترة', 'Net Payroll Commitment')}</span>
            <Coins className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#D99B26] dark:text-[#EBB34D] font-mono">
            {totalNet.toLocaleString('en-US')} <span className="text-xs font-sans font-bold">ج.م</span>
          </div>
          <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-1">
            {filteredPayroll.length} {t('موظف معتمد في المسير', 'verified employees in register')}
          </p>
        </div>

        {/* Basic Salaries */}
        <div className="p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">
            <span>{t('إجمالي الرواتب الأساسية', 'Total Basic Wages')}</span>
            <TrendingUp className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#1A241C] dark:text-[#F3EFE6] font-mono">
            {totalBasic.toLocaleString('en-US')} <span className="text-xs font-sans font-bold">ج.م</span>
          </div>
          <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-1">
            {t('وعاء التأمينات الاجتماعية الأساسي', 'Base social insurance pool')}
          </p>
        </div>

        {/* Allowances & Site Bonuses */}
        <div className="p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">
            <span>{t('إجمالي البدلات والمكافآت', 'Allowances & Site Bonuses')}</span>
            <TrendingUp className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            +{totalAllowances.toLocaleString('en-US')} <span className="text-xs font-sans font-bold">ج.م</span>
          </div>
          <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-1">
            {t('سكن، انتقال، وبدلات إشراف مواقع', 'Housing, transport & site allowances')}
          </p>
        </div>

        {/* Deductions & Loans */}
        <div className="p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">
            <span>{t('إجمالي الاستقطاعات والسلف', 'Deductions & Advances')}</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-500 font-mono">
            -{totalDeductions.toLocaleString('en-US')} <span className="text-xs font-sans font-bold">ج.م</span>
          </div>
          <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-1">
            {t('تأمينات وضريبة وسداد أقساط السلف', 'Insurance, taxes & loan deductions')}
          </p>
        </div>
      </div>

      {/* Action Controls & Month Selector Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Period Selector */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
            <Calendar className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
            <span>{t('الفترة المالية:', 'Period:')}</span>
            <select
              value={currentPayrollPeriod}
              onChange={e => setCurrentPayrollPeriod(e.target.value)}
              className="bg-transparent border-none text-xs font-black text-[#D99B26] dark:text-[#EBB34D] focus:outline-hidden cursor-pointer"
            >
              <option value="2026-10" className="bg-[#FBF9F5] dark:bg-[#0E1610]">مسير رواتب أكتوبر 2026</option>
              <option value="2026-09" className="bg-[#FBF9F5] dark:bg-[#0E1610]">مسير رواتب سبتمبر 2026</option>
              <option value="2026-08" className="bg-[#FBF9F5] dark:bg-[#0E1610]">مسير رواتب أغسطس 2026</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 start-3 text-[#5C665E] dark:text-[#8FA392]" />
            <input
              type="text"
              value={payrollSearch}
              onChange={e => setPayrollSearch(e.target.value)}
              placeholder={t('بحث بالاسم أو الكود...', 'Search by name or code...')}
              className="ps-8 pe-3 py-1.5 text-xs rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] placeholder-[#5C665E] dark:placeholder-[#8FA392] focus:outline-hidden"
            />
          </div>

          {/* Company Filter */}
          <select
            value={companyFilter}
            onChange={e => setCompanyFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden cursor-pointer"
          >
            <option value="all">جميع الكيانات</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.nameAr}</option>
            ))}
          </select>
        </div>

        {/* Export & Batch Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBankExportOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EAE4D7] dark:bg-[#1F2E23] hover:bg-[#D99B26]/20 text-[#1A241C] dark:text-[#F3EFE6] text-xs font-bold transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#059669]" />
            <span>{t('تصدير كشف التحويل البنكي', 'Export Bank Sheet')}</span>
          </button>

          <button
            onClick={batchApprovePayroll}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t('اعتماد وصرف المسير بالكامل', 'Approve All')}</span>
          </button>
        </div>
      </div>

      {/* Cross-Module Accounting Impact Badge (Linking to Finance) */}
      <div className="p-3.5 rounded-xl bg-[#1F2E23]/60 border border-[#243628] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D] shrink-0" />
          <div>
            <span className="font-bold text-[#F3EFE6]">
              {t('الأثر المحاسبي والسيولة في الشؤون المالية (حساب 230101):', 'Financial GL Impact (Account 230101):')}
            </span>
            <span className="text-[#8FA392] ms-1.5">
              قيد استحقاق الأجور والرواتب ينعكس كالتزام فوري في الخزينة والسيولة النقدية.
            </span>
          </div>
        </div>
        <span className="font-mono text-xs font-bold text-[#EBB34D] bg-[#0E1610] px-2.5 py-1 rounded-lg border border-[#243628] shrink-0">
          دائن: {totalNet.toLocaleString('en-US')} ج.م
        </span>
      </div>

      {/* Main Payroll Table */}
      <div className="overflow-x-auto rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] shadow-xs">
        <table className="w-full text-start text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E0D9CB] dark:border-[#243628] bg-[#EAE4D7]/50 dark:bg-[#121B14] text-[#5C665E] dark:text-[#8FA392]">
              <th className="p-3.5 text-start font-bold">{t('الموظف', 'Employee')}</th>
              <th className="p-3.5 text-start font-bold">{t('الكود والإدارة', 'Code & Dept')}</th>
              <th className="p-3.5 text-end font-bold">{t('الأساسي', 'Basic')}</th>
              <th className="p-3.5 text-end font-bold">{t('البدلات', 'Allowances')}</th>
              <th className="p-3.5 text-end font-bold">{t('إجمالي الأجر', 'Gross')}</th>
              <th className="p-3.5 text-end font-bold">{t('الاستقطاعات', 'Deductions')}</th>
              <th className="p-3.5 text-end font-bold text-[#D99B26] dark:text-[#EBB34D]">{t('الصافي المستحق', 'Net Payable')}</th>
              <th className="p-3.5 text-start font-bold">{t('البنك المحول إليه', 'Bank')}</th>
              <th className="p-3.5 text-center font-bold">{t('الحالة', 'Status')}</th>
              <th className="p-3.5 text-center font-bold">{t('قسيمة الراتب', 'Slip')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]/60">
            {filteredPayroll.map(item => (
              <tr key={item.id} className="hover:bg-[#EAE4D7]/40 dark:hover:bg-[#1F2E23]/60 transition-colors">
                <td className="p-3.5 font-bold text-[#1A241C] dark:text-[#F3EFE6] whitespace-nowrap">
                  {item.employeeName}
                </td>
                <td className="p-3.5">
                  <span className="font-mono font-bold text-[#D99B26] dark:text-[#EBB34D]">{item.employeeCode}</span>
                  <div className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392]">{item.department}</div>
                </td>
                <td className="p-3.5 text-end font-mono">{item.basicSalary.toLocaleString('en-US')}</td>
                <td className="p-3.5 text-end font-mono text-[#059669]">
                  +{(item.housingAllowance + item.transportAllowance + item.siteBonus).toLocaleString('en-US')}
                </td>
                <td className="p-3.5 text-end font-mono font-semibold">{item.grossSalary.toLocaleString('en-US')}</td>
                <td className="p-3.5 text-end font-mono text-rose-500">
                  -{item.totalDeductions.toLocaleString('en-US')}
                </td>
                <td className="p-3.5 text-end font-mono font-black text-sm text-[#059669] dark:text-[#EBB34D]">
                  {item.netSalary.toLocaleString('en-US')} ج.م
                </td>
                <td className="p-3.5">
                  <div className="text-[11px] font-bold text-[#1A241C] dark:text-[#F3EFE6]">{item.bankName}</div>
                  <div className="font-mono text-[9.5px] text-[#5C665E] dark:text-[#8FA392] truncate max-w-[120px]">{item.bankAccount}</div>
                </td>
                <td className="p-3.5 text-center">
                  {item.status === 'paid' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2A3F30] text-[#A3CFAC]">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>تم الصرف</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => markPayrollItemPaid(item.id)}
                      className="px-2 py-1 text-[10.5px] font-bold rounded-lg bg-[#D99B26]/15 hover:bg-[#D99B26]/25 text-[#D99B26] dark:text-[#EBB34D] transition-colors cursor-pointer"
                    >
                      تأكيد الصرف
                    </button>
                  )}
                </td>
                <td className="p-3.5 text-center">
                  <button
                    onClick={() => setSelectedSlip(item)}
                    className="p-1.5 rounded-lg bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#1A241C] dark:text-[#F3EFE6] hover:bg-[#D99B26] hover:text-[#0E1610] transition-colors cursor-pointer"
                    title={t('عرض قسيمة الراتب', 'View Payslip')}
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Individual Employee Pay Slip Modal */}
      {selectedSlip && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedSlip(null)}
          title={`قسيمة الراتب الرسمية - ${selectedSlip.employeeName}`}
          subtitle={`مسير شهر أكتوبر 2026 • كود: ${selectedSlip.employeeCode}`}
          icon={FileText}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            {/* Header Voucher Box */}
            <div className="p-4 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-[#E0D9CB]/50 dark:border-[#243628]/50">
                <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{selectedSlip.employeeName}</span>
                <span className="font-mono text-[#D99B26] dark:text-[#EBB34D] font-bold">{selectedSlip.employeeCode}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                <div>المسمى: <strong className="text-[#1A241C] dark:text-[#F3EFE6]">{selectedSlip.jobTitle}</strong></div>
                <div>الإدارة: <strong className="text-[#1A241C] dark:text-[#F3EFE6]">{selectedSlip.department}</strong></div>
                <div className="col-span-2 font-mono">الحساب البنكي: {selectedSlip.bankAccount}</div>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="p-4 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] space-y-2">
              <div className="font-bold text-[#1A241C] dark:text-[#F3EFE6] pb-1 border-b border-[#E0D9CB]/50 dark:border-[#243628]/50">
                تفاصيل الاستحقاقات والاستقطاعات:
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#5C665E] dark:text-[#8FA392]">الراتب الأساسي:</span>
                  <span className="font-mono font-bold">{selectedSlip.basicSalary.toLocaleString('en-US')} ج.م</span>
                </div>
                <div className="flex justify-between text-[#059669]">
                  <span>بدل سكن:</span>
                  <span className="font-mono font-bold">+{selectedSlip.housingAllowance.toLocaleString('en-US')} ج.م</span>
                </div>
                <div className="flex justify-between text-[#059669]">
                  <span>بدل انتقال:</span>
                  <span className="font-mono font-bold">+{selectedSlip.transportAllowance.toLocaleString('en-US')} ج.م</span>
                </div>
                {selectedSlip.siteBonus > 0 && (
                  <div className="flex justify-between text-[#059669]">
                    <span>حافز موقع ومستخلصات:</span>
                    <span className="font-mono font-bold">+{selectedSlip.siteBonus.toLocaleString('en-US')} ج.م</span>
                  </div>
                )}
                <div className="flex justify-between text-rose-500 pt-1 border-t border-[#E0D9CB]/40 dark:border-[#243628]/40">
                  <span>استقطاع تأمينات اجتماعية:</span>
                  <span className="font-mono font-bold">-{selectedSlip.insuranceDeduction.toLocaleString('en-US')} ج.م</span>
                </div>
                <div className="flex justify-between text-rose-500">
                  <span>ضريبة كسب العمل:</span>
                  <span className="font-mono font-bold">-{selectedSlip.taxDeduction.toLocaleString('en-US')} ج.م</span>
                </div>
                {selectedSlip.loanDeduction > 0 && (
                  <div className="flex justify-between text-rose-500">
                    <span>قسط سلفة شهرية:</span>
                    <span className="font-mono font-bold">-{selectedSlip.loanDeduction.toLocaleString('en-US')} ج.م</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-[#E0D9CB] dark:border-[#243628] font-bold text-sm bg-[#EAE4D7]/50 dark:bg-[#1F2E23] p-2 rounded-lg">
                  <span className="text-[#1A241C] dark:text-[#F3EFE6]">صافي الراتب المحول:</span>
                  <span className="font-mono text-[#D99B26] dark:text-[#EBB34D]">{selectedSlip.netSalary.toLocaleString('en-US')} ج.م</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedSlip(null)}
                className="px-4 py-2 rounded-xl bg-[#EAE4D7] dark:bg-[#1F2E23] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]"
              >
                إغلاق
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] text-xs font-bold shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة القسيمة</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Export to Bank Sheet Modal */}
      <Modal
        isOpen={isBankExportOpen}
        onClose={() => setIsBankExportOpen(false)}
        title={t('تصدير كشف التحويل البنكي الموحد (Bank Payroll Sheet)', 'Export Unified Bank Payroll File')}
        subtitle={t('توليد ملف التحويل الجماعي البنكي المعتمد (NBE / CIB / SNB)', 'Generate ACH bank transfer sheet')}
        icon={FileSpreadsheet}
        maxWidth="max-w-lg"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#5C665E] dark:text-[#8FA392]">إجمالي الموظفين:</span>
              <strong className="font-mono">{filteredPayroll.length} موظف</strong>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#5C665E] dark:text-[#8FA392]">إجمالي المبلغ المحول:</span>
              <strong className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{totalNet.toLocaleString('en-US')} ج.م</strong>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#5C665E] dark:text-[#8FA392]">البنك المعتمد للتحويل:</span>
              <strong className="text-[#1A241C] dark:text-[#F3EFE6]">البنك الأهلي المصري (حساب الرواتب المؤسسي)</strong>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#D99B26]/10 border border-[#D99B26]/30 text-[11px] text-[#5C665E] dark:text-[#8FA392]">
            يحتوي الملف المصدر على أرقام الآيبان (IBAN) لكل موظف، وصافي الأجر، وكود الموظف، مع التشفير البنكي المعتمد لغرفة المقاصة الآلية.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setIsBankExportOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#EAE4D7] dark:bg-[#1F2E23] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]"
            >
              إلغاء
            </button>
            <button
              onClick={() => {
                alert('تم تصدير ملف كشف الرواتب البنكي بصيغة Excel / CSV بنجاح');
                setIsBankExportOpen(false);
              }}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل كشف البنك (.xlsx / .csv)</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
