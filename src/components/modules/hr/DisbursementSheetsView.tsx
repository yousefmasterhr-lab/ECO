import React, { useEffect, useState } from 'react';
import { useHR } from '../../../context/HRContext';
import { companyStorage } from '../companies/companyStorage';
import { CompanyEntity } from '../companies/types';
import { EGYPTIAN_BANKS } from '../../../utils/egyptianLaborAlgorithms';
import {
  CreditCard,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  Send,
  Coins,
  Search,
  Inbox
} from 'lucide-react';

export const DisbursementSheetsView: React.FC = () => {
  const { employees, stats, currentPayrollPeriod, showToast } = useHR();
  const [companies, setCompanies] = useState<CompanyEntity[]>(() => companyStorage.getCompaniesSync());
  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [selectedBank, setSelectedBank] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [disbursedBatches, setDisbursedBatches] = useState<string[]>([]);

  useEffect(() => {
    companyStorage.getCompanies().then((list) => {
      if (list && list.length > 0) setCompanies(list);
    });
    const onUpdate = () => setCompanies(companyStorage.getCompaniesSync());
    window.addEventListener('eco_companies_updated', onUpdate);
    return () => window.removeEventListener('eco_companies_updated', onUpdate);
  }, []);

  const periodLabel =
    currentPayrollPeriod === '2026-11'
      ? 'نوفمبر 2026'
      : currentPayrollPeriod === '2026-10'
      ? 'أكتوبر 2026'
      : currentPayrollPeriod || 'الشهر الجاري';

  const matchesBankFilter = (bankName: string, method: 'bank_transfer' | 'cash', filterCode: string) => {
    if (filterCode === 'all') return true;
    if (filterCode === 'cash') return method === 'cash';
    if (method === 'cash') return false;
    const upper = (bankName || '').toUpperCase();
    if (filterCode === 'NBE') return (upper.includes('NBE') || bankName.includes('الأهلي المصري')) && !upper.includes('QNB');
    if (filterCode === 'MISR') return upper.includes('MISR') || bankName.includes('بنك مصر');
    if (filterCode === 'CIB') return upper.includes('CIB') || bankName.includes('التجاري الدولي');
    if (filterCode === 'QNB') return upper.includes('QNB') || bankName.includes('قطر الوطني');
    return true;
  };

  // Filtered list
  const filteredEmployees = employees.filter((emp) => {
    if (selectedEntity !== 'all' && emp.companyNameAr !== selectedEntity && emp.companyId !== selectedEntity) return false;
    if (!matchesBankFilter(emp.bankName, emp.disbursementMethod, selectedBank)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        emp.nameAr.toLowerCase().includes(q) ||
        emp.employeeCode.toLowerCase().includes(q) ||
        emp.uid.includes(q)
      );
    }
    return true;
  });

  const totalDisbursement = filteredEmployees.reduce((sum, e) => sum + e.salary.net, 0);
  const bankTransferTotal = filteredEmployees
    .filter((e) => e.disbursementMethod === 'bank_transfer')
    .reduce((sum, e) => sum + e.salary.net, 0);
  const cashDisbursementTotal = filteredEmployees
    .filter((e) => e.disbursementMethod === 'cash')
    .reduce((sum, e) => sum + e.salary.net, 0);

  const handleExecuteDisbursement = (batchId: string) => {
    if (!disbursedBatches.includes(batchId)) {
      setDisbursedBatches((prev) => [...prev, batchId]);
      showToast('تم اعتماد إرسال كشف الصرف للبنك وخصم الالتزام من سيولة الخزينة بنجاح');
    }
  };

  const handleExportACH = () => {
    if (filteredEmployees.length === 0) {
      showToast('لا توجد مستحقات موظفين مسجلة حالياً لتصدير ملف التحويل البنكي (ACH)');
      return;
    }
    const header = 'EmployeeCode,EmployeeName,NationalID,BankName,AccountOrIBAN,Method,NetAmountEGP';
    const rows = filteredEmployees.map((e) =>
      [e.uid, `"${e.nameAr}"`, e.nationalId, `"${e.bankName}"`, e.bankIban || e.bankAccount, e.disbursementMethod, e.salary.net].join(',')
    );
    const csv = '\uFEFF' + [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ECO_Payroll_ACH_${currentPayrollPeriod || 'current'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`تم تصدير ملف التحويلات البنكية (ACH/CSV) لعدد ${filteredEmployees.length} موظف`);
  };

  const featuredBanks = EGYPTIAN_BANKS.filter((b) => ['NBE', 'MISR', 'CIB', 'QNB'].includes(b.code));

  return (
    <div className="space-y-6">
      {/* Treasury & Liquidity Federation Banner */}
      <div className="p-4 rounded-2xl bg-[#F3EFE6] dark:bg-gradient-to-r dark:from-[#17231A] dark:via-[#1F2E23] dark:to-[#17231A] border border-[#E0D9CB] dark:border-[#EBB34D]/30 shadow-xs dark:shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 dark:bg-[#EBB34D]/20 text-[#D99B26] dark:text-[#EBB34D] flex items-center justify-center shrink-0 border border-[#D99B26]/30 dark:border-[#EBB34D]/30">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                مركز صرف الرواتب والتحويل البنكي الموحد (ACH Direct Disbursement)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 dark:bg-[#EBB34D]/20 text-[#D99B26] dark:text-[#EBB34D] border border-[#D99B26]/30 dark:border-[#EBB34D]/30">
                مربوط بالخزينة المركزية
              </span>
            </div>
            <p className="text-xs text-[#5C665E] dark:text-[#8FA392] mt-0.5">
              تصدير ملفات الصرف البنكية للبنوك المصرية المعتمدة (الأهلي المصري، بنك مصر، CIB، QNB) وحجز السيولة تلقائياً
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportACH}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#D99B26] dark:bg-[#EBB34D] text-white dark:text-[#0E1610] text-xs font-bold shadow-xs hover:bg-[#b8821d] dark:hover:bg-[#d99b26] transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تصدير ملف البنك (ACH/WPS)</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] text-xs font-bold hover:border-[#D99B26] dark:hover:border-[#EBB34D] transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
            <span>طباعة الكشوف</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
          <span className="text-xs text-[#5C665E] dark:text-[#8FA392] block font-bold">إجمالي صافي الاستحقاق المطلوب</span>
          <div className="text-xl font-black text-[#1A241C] dark:text-[#F3EFE6] mt-1">
            {totalDisbursement.toLocaleString('en-US')} <span className="text-xs text-[#D99B26] dark:text-[#EBB34D]">ج.م</span>
          </div>
          <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392] mt-1 block">لعدد {filteredEmployees.length} موظف مستحق</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
          <span className="text-xs text-[#5C665E] dark:text-[#8FA392] block font-bold">التحويلات البنكية (ACH / بنوك مصر)</span>
          <div className="text-xl font-black text-[#059669] dark:text-emerald-400 mt-1">
            {bankTransferTotal.toLocaleString('en-US')} <span className="text-xs">ج.م</span>
          </div>
          <span className="text-[10px] text-[#059669]/80 dark:text-emerald-400/80 mt-1 block">جاهزة لرفع الملف البنكي الموحد</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
          <span className="text-xs text-[#5C665E] dark:text-[#8FA392] block font-bold">الصرف النقدي (خزينة المشاريع)</span>
          <div className="text-xl font-black text-[#D99B26] dark:text-[#EBB34D] mt-1">
            {cashDisbursementTotal.toLocaleString('en-US')} <span className="text-xs">ج.م</span>
          </div>
          <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392] mt-1 block">أذون صرف نقدية معتمدة عبر الخزينة</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
          <span className="text-xs text-[#5C665E] dark:text-[#8FA392] block font-bold">حالة الالتزام بالخزينة</span>
          <div className="text-xl font-black text-blue-700 dark:text-blue-400 mt-1">
            {filteredEmployees.length === 0 ? 'لا توجد التزامات' : 'مُغطى بالكامل'}
          </div>
          <span className="text-[10px] text-blue-600/80 dark:text-blue-300 mt-1 block">
            {filteredEmployees.length === 0 ? 'في انتظار إدراج موظفين بالمسير' : 'تم حجز السيولة من حساب العمليات'}
          </span>
        </div>
      </div>

      {/* Filter and Bank Tabs Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Bank selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F3EFE6] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] overflow-x-auto select-none no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedBank('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedBank === 'all'
                  ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-sm font-black'
                  : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
              }`}
            >
              كافة القنوات ({filteredEmployees.length})
            </button>
            {featuredBanks.map((bank) => (
              <button
                key={bank.code}
                type="button"
                onClick={() => setSelectedBank(bank.code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedBank === bank.code
                    ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-sm font-black'
                    : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
                }`}
              >
                {bank.nameAr}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSelectedBank('cash')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedBank === 'cash'
                  ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-sm font-black'
                  : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
              }`}
            >
              صرف نقدي (مواقع)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              aria-label="تصفية حسب الشركة"
              className="px-3 py-2 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] outline-hidden focus:border-[#D99B26] dark:focus:border-[#EBB34D]"
            >
              <option value="all" className="bg-white dark:bg-[#141E16] text-[#1A241C] dark:text-[#F3EFE6]">
                كافة الشركات
              </option>
              {companies.map((c) => (
                <option
                  key={c.id}
                  value={c.nameAr}
                  className="bg-white dark:bg-[#141E16] text-[#1A241C] dark:text-[#F3EFE6]"
                >
                  {c.nameAr}
                </option>
              ))}
            </select>

            {/* Search box */}
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[#5C665E] dark:text-[#8FA392]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم، الكود، أو UID..."
                className="w-full ps-9 pe-3 py-2 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-xs text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#D99B26] dark:focus:border-[#EBB34D] outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Disbursement Batches Table */}
      <div className="rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#E0D9CB] dark:border-[#243628] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
            <h4 className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
              كشوف صرف مسيرات الرواتب لفترة {periodLabel}
            </h4>
          </div>
          <span className="text-xs text-[#5C665E] dark:text-[#8FA392]">
            المسير العام: {stats.totalPayrollNet.toLocaleString('en-US')} ج.م
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-end text-xs">
            <thead className="bg-[#FBF9F5] dark:bg-[#111A13] text-[#5C665E] dark:text-[#8FA392] border-b border-[#E0D9CB] dark:border-[#243628]">
              <tr>
                <th className="py-3 px-4 font-bold text-start">كود الموظف</th>
                <th className="py-3 px-4 font-bold text-start">الاسم والوظيفة</th>
                <th className="py-3 px-4 font-bold">الشركة التابعة</th>
                <th className="py-3 px-4 font-bold">طريقة الصرف</th>
                <th className="py-3 px-4 font-bold">البنك / رقم الحساب</th>
                <th className="py-3 px-4 font-bold">الراتب الأساسي</th>
                <th className="py-3 px-4 font-bold">البدلات والحوافز</th>
                <th className="py-3 px-4 font-bold">الاستقطاعات والسلف</th>
                <th className="py-3 px-4 font-bold text-[#059669] dark:text-emerald-400">صافي المستحق</th>
                <th className="py-3 px-4 font-bold text-center">حالة الصرف</th>
                <th className="py-3 px-4 font-bold text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CB] dark:divide-[#243628]">
              {filteredEmployees.map((emp) => {
                const isDisbursed = disbursedBatches.includes(`BATCH-EMP-${emp.id}`);
                return (
                  <tr key={emp.id} className="hover:bg-[#F3EFE6]/50 dark:hover:bg-[#1F2E23]/50 transition-colors">
                    <td className="py-3 px-4 text-start font-mono font-bold text-[#D99B26] dark:text-[#EBB34D]">
                      {emp.uid}
                    </td>
                    <td className="py-3 px-4 text-start">
                      <div className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{emp.nameAr}</div>
                      <div className="text-[10px] text-[#5C665E] dark:text-[#8FA392]">{emp.jobTitleAr}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-[#1A241C] dark:text-[#F3EFE6]">
                      {emp.companyNameAr}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          emp.disbursementMethod === 'bank_transfer'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/15 text-[#D99B26] dark:text-[#EBB34D] border-amber-500/30'
                        }`}
                      >
                        {emp.disbursementMethod === 'bank_transfer' ? 'تحويل بنكي' : 'صرف نقدي'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{emp.bankName}</div>
                      <div className="text-[10.5px] font-mono text-[#5C665E] dark:text-[#8FA392]">{emp.bankAccount}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                      {emp.salary.basic.toLocaleString('en-US')} ج.م
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#059669] dark:text-emerald-400">
                      +{emp.salary.allowances.toLocaleString('en-US')} ج.م
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                      -{emp.salary.deductions.toLocaleString('en-US')} ج.م
                    </td>
                    <td className="py-3 px-4 font-mono font-black text-[#059669] dark:text-emerald-400">
                      {emp.salary.net.toLocaleString('en-US')} ج.م
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold border ${
                          isDisbursed
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/15 text-[#D99B26] dark:text-[#EBB34D] border-amber-500/30'
                        }`}
                      >
                        {isDisbursed ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>تم التحويل</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>بانتظار الصرف</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isDisbursed ? (
                        <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392]">تم اعتماد القيد</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleExecuteDisbursement(`BATCH-EMP-${emp.id}`)}
                          className="px-2.5 py-1 rounded-lg bg-[#D99B26] dark:bg-[#EBB34D] text-white dark:text-[#0E1610] text-[11px] font-bold hover:bg-[#b8821d] dark:hover:bg-[#d99b26] transition-all cursor-pointer flex items-center gap-1 mx-auto"
                        >
                          <Send className="w-3 h-3" />
                          <span>صرف الآن</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Inbox className="w-8 h-8 text-[#D99B26]/60 dark:text-[#EBB34D]/60" />
                      <p className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                        لا توجد كشوف صرف مستحقة حالياً
                      </p>
                      <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                        عند إضافة الموظفين واعتماد رواتبهم، ستظهر بنود التحويل البنكي (ACH) والصرف النقدي هنا تلقائياً.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
