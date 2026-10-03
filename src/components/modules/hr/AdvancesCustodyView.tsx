import React, { useState } from 'react';
import { useHR } from '../../../context/HRContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Modal } from '../../common/Modal';
import {
  Coins,
  ShieldCheck,
  Laptop,
  Car,
  CreditCard,
  Plus,
  Search
} from 'lucide-react';

interface AdvancesCustodyViewProps {
  defaultSection?: 'advances' | 'custody';
}

export const AdvancesCustodyView: React.FC<AdvancesCustodyViewProps> = ({ defaultSection = 'advances' }) => {
  const { t } = useLanguage();
  const {
    employees,
    advances,
    addAdvance,
    custodyItems,
    addCustodyItem,
    toggleCustodyClearance,
  } = useHR();

  // Active section tab: advances vs custody
  const [activeSection, setActiveSection] = useState<'advances' | 'custody'>(defaultSection);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddAdvanceModalOpen, setIsAddAdvanceModalOpen] = useState(false);
  const [isAddCustodyModalOpen, setIsAddCustodyModalOpen] = useState(false);

  // Forms
  const [advanceForm, setAdvanceForm] = useState({
    employeeId: employees[0]?.id || '',
    totalAmount: 10000,
    installmentsTotal: 10,
    startDate: '2026-11-01',
    reason: '',
  });

  const [custodyForm, setCustodyForm] = useState({
    employeeId: employees[0]?.id || '',
    assetType: 'laptop' as const,
    assetNameAr: '',
    serialNumber: '',
    issueDate: '2026-10-02',
    projectLinked: 'المكتب الفني - المقر الرئيسي',
    condition: 'ممتازة',
    notes: '',
  });

  // Filtered lists
  const filteredAdvances = advances.filter(a =>
    a.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.advanceCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustody = custodyItems.filter(c =>
    c.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.assetNameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Totals for advances
  const totalLoanPrincipal = advances.reduce((a, b) => a + b.totalAmount, 0);
  const totalLoanRemaining = advances.reduce((a, b) => a + b.remainingAmount, 0);
  const totalMonthlyDeductions = advances
    .filter(a => a.status === 'active')
    .reduce((a, b) => a + b.monthlyDeduction, 0);

  // Handle Create Advance
  const handleCreateAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === advanceForm.employeeId);
    if (!emp) return;

    const monthly = Math.round(advanceForm.totalAmount / advanceForm.installmentsTotal);

    addAdvance({
      employeeId: emp.id,
      employeeName: emp.nameAr,
      jobTitle: emp.jobTitleAr,
      companyId: emp.companyId,
      totalAmount: Number(advanceForm.totalAmount),
      monthlyDeduction: monthly,
      installmentsTotal: Number(advanceForm.installmentsTotal),
      startDate: advanceForm.startDate,
      reason: advanceForm.reason || 'سلفة اجتماعية طارئة',
      linkedVoucherCode: `VOU-PAY-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    });

    setIsAddAdvanceModalOpen(false);
  };

  // Handle Create Custody
  const handleCreateCustody = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === custodyForm.employeeId);
    if (!emp) return;

    addCustodyItem({
      employeeId: emp.id,
      employeeName: emp.nameAr,
      assetType: custodyForm.assetType,
      assetNameAr: custodyForm.assetNameAr || 'عهدة أجهزة ومعدات',
      serialNumber: custodyForm.serialNumber || `SN-${Math.floor(10000 + Math.random() * 90000)}`,
      issueDate: custodyForm.issueDate,
      projectLinked: custodyForm.projectLinked,
      condition: custodyForm.condition,
      notes: custodyForm.notes,
    });

    setIsAddCustodyModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Section Nav / Summary Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSection('advances')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'advances'
                ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] shadow-sm'
                : 'text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>{t('سلف وقروض الموظفين', 'Employee Advances')}</span>
            <span className="font-mono text-[10.5px] px-1.5 py-0.2 rounded-md bg-[#0E1610]/20">
              {advances.filter(a => a.status === 'active').length}
            </span>
          </button>

          <button
            onClick={() => setActiveSection('custody')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'custody'
                ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] shadow-sm'
                : 'text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t('سجل العهد العينية والأصول', 'Asset Custody Ledger')}</span>
            <span className="font-mono text-[10.5px] px-1.5 py-0.2 rounded-md bg-[#0E1610]/20">
              {custodyItems.filter(c => c.status === 'in_custody').length}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-[#5C665E] dark:text-[#8FA392]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeSection === 'advances' ? t('بحث بالسلفة أو الموظف...', 'Search advance or employee...') : t('بحث بالعهدة أو الموظف...', 'Search asset or employee...')}
            className="w-full ps-9 pe-3 py-1.5 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D99B26] dark:focus:border-[#EBB34D]"
          />
        </div>

        {/* Action Button */}
        {activeSection === 'advances' ? (
          <button
            onClick={() => setIsAddAdvanceModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('طلب سلفة جديدة', 'New Advance')}</span>
          </button>
        ) : (
          <button
            onClick={() => setIsAddCustodyModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('تسليم عهدة جديدة', 'Issue New Custody')}</span>
          </button>
        )}
      </div>

      {/* SECTION 1: ADVANCES TRACKER */}
      {activeSection === 'advances' && (
        <div className="space-y-5">
          {/* Advances KPI Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
              <span className="text-xs text-[#5C665E] dark:text-[#8FA392] font-bold block mb-1">
                {t('إجمالي السلف القائمة للتحصيل', 'Total Outstanding Advances')}
              </span>
              <div className="text-xl sm:text-2xl font-black text-rose-500 font-mono">
                {totalLoanRemaining.toLocaleString('en-US')} <span className="text-xs font-sans font-bold">ج.م</span>
              </div>
              <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-1">
                {t('رصيد مدين مسترد شهرياً من الرواتب', 'Deducted automatically from monthly payroll')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
              <span className="text-xs text-[#5C665E] dark:text-[#8FA392] font-bold block mb-1">
                {t('المستقطع شهرياً من مسير الرواتب', 'Monthly Payroll Recoveries')}
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#D99B26] dark:text-[#EBB34D] font-mono">
                {totalMonthlyDeductions.toLocaleString('en-US')} <span className="text-xs font-sans font-bold">ج.م</span>
              </div>
              <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-1">
                {t('يخصم تلقائياً من صافي التحويل البنكي', 'Deducted directly from employee slips')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
              <span className="text-xs text-[#5C665E] dark:text-[#8FA392] font-bold block mb-1">
                {t('إجمالي المبالغ المسددة بالكامل', 'Total Repaid Principal')}
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#059669] font-mono">
                {(totalLoanPrincipal - totalLoanRemaining).toLocaleString('en-US')} <span className="text-xs font-sans font-bold">ج.م</span>
              </div>
              <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-1">
                {t('سلف تم تصفيتها وإبراء ذمتها مالياً', 'Cleared and audited vouchers')}
              </p>
            </div>
          </div>

          {/* Advances Table */}
          <div className="overflow-x-auto rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] shadow-xs">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E0D9CB] dark:border-[#243628] bg-[#EAE4D7]/50 dark:bg-[#121B14] text-[#5C665E] dark:text-[#8FA392]">
                  <th className="p-3.5 text-start font-bold">{t('الموظف', 'Employee')}</th>
                  <th className="p-3.5 text-start font-bold">{t('كود السلفة', 'Loan Code')}</th>
                  <th className="p-3.5 text-end font-bold">{t('إجمالي السلفة', 'Total Loan')}</th>
                  <th className="p-3.5 text-end font-bold">{t('القسط الشهري', 'Monthly')}</th>
                  <th className="p-3.5 text-center font-bold">{t('الأقساط المتبقية', 'Installments')}</th>
                  <th className="p-3.5 text-end font-bold text-rose-500">{t('المتبقي', 'Remaining')}</th>
                  <th className="p-3.5 text-start font-bold">{t('سند الصرف المالي', 'Voucher')}</th>
                  <th className="p-3.5 text-center font-bold">{t('الحالة', 'Status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]/60">
                {filteredAdvances.map(adv => (
                  <tr key={adv.id} className="hover:bg-[#EAE4D7]/40 dark:hover:bg-[#1F2E23]/60 transition-colors">
                    <td className="p-3.5 font-bold text-[#1A241C] dark:text-[#F3EFE6] whitespace-nowrap">
                      {adv.employeeName}
                      <div className="text-[10.5px] font-normal text-[#5C665E] dark:text-[#8FA392]">{adv.reason}</div>
                    </td>
                    <td className="p-3.5 font-mono text-[#D99B26] dark:text-[#EBB34D] font-bold">{adv.advanceCode}</td>
                    <td className="p-3.5 text-end font-mono font-bold">{adv.totalAmount.toLocaleString('en-US')} ج.م</td>
                    <td className="p-3.5 text-end font-mono text-[#059669]">-{adv.monthlyDeduction.toLocaleString('en-US')} ج.م</td>
                    <td className="p-3.5 text-center font-mono">
                      {adv.installmentsRemaining} / {adv.installmentsTotal}
                    </td>
                    <td className="p-3.5 text-end font-mono font-black text-rose-500">
                      {adv.remainingAmount.toLocaleString('en-US')} ج.م
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                      {adv.linkedVoucherCode}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        adv.status === 'active'
                          ? 'bg-[#D99B26]/15 text-[#EBB34D]'
                          : 'bg-[#2A3F30] text-[#A3CFAC]'
                      }`}>
                        {adv.status === 'active' ? 'قيد السداد' : 'تمت التصفية بالكامل'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: CUSTODY LEDGER */}
      {activeSection === 'custody' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] shadow-xs">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E0D9CB] dark:border-[#243628] bg-[#EAE4D7]/50 dark:bg-[#121B14] text-[#5C665E] dark:text-[#8FA392]">
                  <th className="p-3.5 text-start font-bold">{t('اسم العهدة الأصل', 'Asset / Item')}</th>
                  <th className="p-3.5 text-start font-bold">{t('النوع', 'Type')}</th>
                  <th className="p-3.5 text-start font-bold">{t('الموظف المسؤول', 'Responsible Employee')}</th>
                  <th className="p-3.5 text-start font-bold">{t('الرقم التسلسلي / اللوحة', 'Serial / Plate')}</th>
                  <th className="p-3.5 text-start font-bold">{t('المشروع المرتبط', 'Linked Project')}</th>
                  <th className="p-3.5 text-start font-bold">{t('تاريخ التسليم', 'Issue Date')}</th>
                  <th className="p-3.5 text-center font-bold">{t('الحالة', 'Status')}</th>
                  <th className="p-3.5 text-center font-bold">{t('إبراء الذمة / استرداد', 'Clearance')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]/60">
                {filteredCustody.map(item => (
                  <tr key={item.id} className="hover:bg-[#EAE4D7]/40 dark:hover:bg-[#1F2E23]/60 transition-colors">
                    <td className="p-3.5 font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                      {item.assetNameAr}
                      {item.notes && <div className="text-[10px] text-[#8FA392] font-normal">{item.notes}</div>}
                    </td>
                    <td className="p-3.5">
                      <span className="flex items-center gap-1.5 font-bold text-[#5C665E] dark:text-[#8FA392]">
                        {item.assetType === 'laptop' ? <Laptop className="w-3.5 h-3.5 text-[#D99B26] dark:text-[#EBB34D]" /> :
                         item.assetType === 'vehicle' ? <Car className="w-3.5 h-3.5 text-[#059669]" /> :
                         <CreditCard className="w-3.5 h-3.5 text-[#0D9488]" />}
                        <span>{item.assetType === 'laptop' ? 'لابتوب' : item.assetType === 'vehicle' ? 'سيارة' : item.assetType === 'fuel_card' ? 'كارت وقود' : 'جهاز هندسي'}</span>
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-[#1A241C] dark:text-[#F3EFE6]">{item.employeeName}</td>
                    <td className="p-3.5 font-mono text-[#5C665E] dark:text-[#8FA392]">{item.serialNumber}</td>
                    <td className="p-3.5 text-[#5C665E] dark:text-[#8FA392]">{item.projectLinked}</td>
                    <td className="p-3.5 font-mono text-[#5C665E] dark:text-[#8FA392]">{item.issueDate}</td>
                    <td className="p-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'in_custody'
                          ? 'bg-[#2A3F30] text-[#A3CFAC]'
                          : 'bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#8FA392]'
                      }`}>
                        {item.status === 'in_custody' ? 'في العهدة' : 'تم استردادها'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => toggleCustodyClearance(item.id)}
                        className={`px-3 py-1 text-[10.5px] font-bold rounded-lg transition-colors cursor-pointer ${
                          item.status === 'in_custody'
                            ? 'bg-[#3F2A2A] text-[#EFA3A3] hover:bg-[#5A3535]'
                            : 'bg-[#2A3F30] text-[#A3CFAC] hover:bg-[#3B5440]'
                        }`}
                      >
                        {item.status === 'in_custody' ? 'إبراء واسترداد' : 'إعادة للعهدة'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: Request Advance */}
      <Modal
        isOpen={isAddAdvanceModalOpen}
        onClose={() => setIsAddAdvanceModalOpen(false)}
        title={t('تسجيل طلب سلفة مالية للموظف', 'New Employee Loan Request')}
        subtitle={t('تحديد إجمالي السلفة وجدولة الاستقطاع الشهري وربطها بسند الصرف', 'Schedule monthly deductions & financial voucher')}
        icon={Coins}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateAdvance} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#5C665E] dark:text-[#8FA392] font-bold mb-1">
              {t('الموظف *', 'Employee *')}
            </label>
            <select
              value={advanceForm.employeeId}
              onChange={e => setAdvanceForm({ ...advanceForm, employeeId: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] font-bold"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.nameAr} - صافي راتبه: {emp.salary.net} ج.م</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#5C665E] dark:text-[#8FA392] font-bold mb-1">
                {t('إجمالي مبلغ السلفة (ج.م) *', 'Loan Amount (EGP) *')}
              </label>
              <input
                type="number"
                required
                min="1000"
                step="500"
                value={advanceForm.totalAmount}
                onChange={e => setAdvanceForm({ ...advanceForm, totalAmount: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[#5C665E] dark:text-[#8FA392] font-bold mb-1">
                {t('عدد أشهر السداد (أقساط) *', 'Installment Months *')}
              </label>
              <input
                type="number"
                required
                min="1"
                max="24"
                value={advanceForm.installmentsTotal}
                onChange={e => setAdvanceForm({ ...advanceForm, installmentsTotal: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] font-mono font-bold"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#D99B26]/10 border border-[#D99B26]/30 text-xs flex justify-between font-bold">
            <span>الخصم الشهري المحسوب:</span>
            <span className="font-mono text-[#D99B26] dark:text-[#EBB34D]">
              {Math.round(advanceForm.totalAmount / advanceForm.installmentsTotal)} ج.م / شهر
            </span>
          </div>

          <div>
            <label className="block text-[#5C665E] dark:text-[#8FA392] font-bold mb-1">
              {t('سبب السلفة *', 'Reason *')}
            </label>
            <input
              type="text"
              required
              value={advanceForm.reason}
              onChange={e => setAdvanceForm({ ...advanceForm, reason: e.target.value })}
              placeholder="مثال: سلفة زواج / رعاية صحية طارئة"
              className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6]"
            />
          </div>

          <div className="pt-3 border-t border-[#E0D9CB] dark:border-[#243628] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddAdvanceModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#EAE4D7] dark:bg-[#1F2E23] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] text-xs font-bold shadow-md cursor-pointer"
            >
              اعتماد السلفة وصرفها
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Issue Custody */}
      <Modal
        isOpen={isAddCustodyModalOpen}
        onClose={() => setIsAddCustodyModalOpen(false)}
        title={t('تسليم عهدة عينية أو أصل جديد', 'Issue New Asset Custody')}
        subtitle={t('تسجيل أصل عيني في ذمة الموظف مع الرقم التسلسلي والمشروع المرتبط', 'Register physical item in employee custody')}
        icon={ShieldCheck}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateCustody} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#5C665E] dark:text-[#8FA392] font-bold mb-1">
              {t('الموظف المستلم للعهدة *', 'Employee *')}
            </label>
            <select
              value={custodyForm.employeeId}
              onChange={e => setCustodyForm({ ...custodyForm, employeeId: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] font-bold"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.nameAr} - {emp.jobTitleAr}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#5C665E] dark:text-[#8FA392] font-bold mb-1">
                {t('نوع العهدة *', 'Asset Type *')}
              </label>
              <select
                value={custodyForm.assetType}
                onChange={e => setCustodyForm({ ...custodyForm, assetType: e.target.value as any })}
                className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] font-bold"
              >
                <option value="laptop">لابتوب / محطة عمل</option>
                <option value="vehicle">سيارة موقع</option>
                <option value="fuel_card">كارت وقود</option>
                <option value="survey_tool">أجهزة مساحية / هندسية</option>
                <option value="mobile_device">هاتف / جهاز لوحي</option>
              </select>
            </div>
            <div>
              <label className="block text-[#5C665E] dark:text-[#8FA392] font-bold mb-1">
                {t('الرقم التسلسلي / اللوحة *', 'Serial Number *')}
              </label>
              <input
                type="text"
                required
                value={custodyForm.serialNumber}
                onChange={e => setCustodyForm({ ...custodyForm, serialNumber: e.target.value })}
                placeholder="SN-998822"
                className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#5C665E] dark:text-[#8FA392] font-bold mb-1">
              {t('اسم ووصف الأصل / العهدة *', 'Asset Description *')}
            </label>
            <input
              type="text"
              required
              value={custodyForm.assetNameAr}
              onChange={e => setCustodyForm({ ...custodyForm, assetNameAr: e.target.value })}
              placeholder="مثال: لابتوب Dell Precision 7680"
              className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6]"
            />
          </div>

          <div>
            <label className="block text-[#5C665E] dark:text-[#8FA392] font-bold mb-1">
              {t('المشروع المرتبط به العهدة *', 'Linked Project *')}
            </label>
            <input
              type="text"
              required
              value={custodyForm.projectLinked}
              onChange={e => setCustodyForm({ ...custodyForm, projectLinked: e.target.value })}
              placeholder="مثال: مشروع الحي الحكومي بالعاصمة"
              className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6]"
            />
          </div>

          <div className="pt-3 border-t border-[#E0D9CB] dark:border-[#243628] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddCustodyModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#EAE4D7] dark:bg-[#1F2E23] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] text-xs font-bold shadow-md cursor-pointer"
            >
              تسليم وتوقيع العهدة
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
