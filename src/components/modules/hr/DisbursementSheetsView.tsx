import React, { useState } from 'react';
import { useHR } from '../../../context/HRContext';
import {
  CreditCard,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  Send,
  Coins,
  Search
} from 'lucide-react';

export const DisbursementSheetsView: React.FC = () => {
  const { employees, stats, showToast } = useHR();
  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [selectedBank, setSelectedBank] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [disbursedBatches, setDisbursedBatches] = useState<string[]>(['BATCH-2026-10-MISR']);

  // Filtered list
  const filteredEmployees = employees.filter(emp => {
    if (selectedEntity !== 'all' && emp.companyNameAr !== selectedEntity && emp.companyId !== selectedEntity) return false;
    if (selectedBank !== 'all') {
      if (selectedBank === 'cash' && emp.disbursementMethod !== 'cash') return false;
      if (selectedBank === 'misr' && !emp.bankName.includes('مصر')) return false;
      if (selectedBank === 'qnb' && !emp.bankName.includes('QNB') && !emp.bankName.includes('الأهلي')) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return emp.nameAr.toLowerCase().includes(q) || emp.employeeCode.toLowerCase().includes(q) || emp.uid.includes(q);
    }
    return true;
  });

  const totalDisbursement = filteredEmployees.reduce((sum, e) => sum + e.salary.net, 0);
  const bankTransferTotal = filteredEmployees.filter(e => e.disbursementMethod === 'bank_transfer').reduce((sum, e) => sum + e.salary.net, 0);
  const cashDisbursementTotal = filteredEmployees.filter(e => e.disbursementMethod === 'cash').reduce((sum, e) => sum + e.salary.net, 0);

  const handleExecuteDisbursement = (batchId: string) => {
    if (!disbursedBatches.includes(batchId)) {
      setDisbursedBatches(prev => [...prev, batchId]);
      showToast('تم اعتماد إرسال كشف الصرف للبنك وخصم الالتزام من سيولة الخزينة بنجاح');
    }
  };

  return (
    <div className="space-y-6">
      {/* Treasury & Liquidity Federation Banner */}
      <div className="p-4 rounded-2xl bg-linear-to-r from-[#17231A] via-[#1F2E23] to-[#17231A] border border-[#EBB34D]/30 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EBB34D]/20 text-[#EBB34D] flex items-center justify-center shrink-0 border border-[#EBB34D]/30">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#F3EFE6]">
                مركز صرف الرواتب والتحويل البنكي الموحد (ACH Direct Disbursement)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBB34D]/20 text-[#EBB34D] border border-[#EBB34D]/30">
                مربوط بالخزينة المركزية
              </span>
            </div>
            <p className="text-xs text-[#8FA392] mt-0.5">
              تصدير ملفات الصرف البنكية المشفرة للبنوك المعتمدة وحجز مخصصات السيولة النقدية تلقائياً
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => showToast('جاري تصدير ملف البنك المعتمد بتنسيق ACH/TXT المشفر')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EBB34D] text-[#0E1610] text-xs font-bold shadow-md hover:bg-[#d99b26] transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تصدير ملف البنك (ACH/WPS)</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#F3EFE6] text-xs font-bold hover:border-[#EBB34D] transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
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
          <span className="text-[10px] text-[#8FA392] mt-1 block">لعدد {filteredEmployees.length} موظف مستحق</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
          <span className="text-xs text-[#5C665E] dark:text-[#8FA392] block font-bold">التحويلات البنكية (بنك مصر / QNB)</span>
          <div className="text-xl font-black text-emerald-400 mt-1">
            {bankTransferTotal.toLocaleString('en-US')} <span className="text-xs">ج.م</span>
          </div>
          <span className="text-[10px] text-emerald-400/80 mt-1 block">جاهزة لرفع الملف البنكي الموحد</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
          <span className="text-xs text-[#5C665E] dark:text-[#8FA392] block font-bold">الصرف النقدي (خزينة المشاريع)</span>
          <div className="text-xl font-black text-[#EBB34D] mt-1">
            {cashDisbursementTotal.toLocaleString('en-US')} <span className="text-xs">ج.م</span>
          </div>
          <span className="text-[10px] text-[#8FA392] mt-1 block">أذون صرف نقدية معتمدة عبر الخزينة</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
          <span className="text-xs text-[#5C665E] dark:text-[#8FA392] block font-bold">الالتزام المالي بالخزينة</span>
          <div className="text-xl font-black text-blue-400 mt-1">
            مُغطى بالكامل
          </div>
          <span className="text-[10px] text-blue-300 mt-1 block">تم حجز السيولة من حساب العمليات</span>
        </div>
      </div>

      {/* Filter and Bank Tabs Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Bank selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F3EFE6] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedBank('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedBank === 'all'
                  ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-white dark:text-[#0E1610]'
                  : 'text-[#8FA392] hover:text-[#F3EFE6]'
              }`}
            >
              كافة القنوات ({filteredEmployees.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedBank('misr')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedBank === 'misr'
                  ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-white dark:text-[#0E1610]'
                  : 'text-[#8FA392] hover:text-[#F3EFE6]'
              }`}
            >
              بنك مصر (BM Online)
            </button>
            <button
              type="button"
              onClick={() => setSelectedBank('qnb')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedBank === 'qnb'
                  ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-white dark:text-[#0E1610]'
                  : 'text-[#8FA392] hover:text-[#F3EFE6]'
              }`}
            >
              بنك QNB الأهلي
            </button>
            <button
              type="button"
              onClick={() => setSelectedBank('cash')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedBank === 'cash'
                  ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-white dark:text-[#0E1610]'
                  : 'text-[#8FA392] hover:text-[#F3EFE6]'
              }`}
            >
              صرف نقدي (مواقع)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedEntity}
              onChange={e => setSelectedEntity(e.target.value)}
              aria-label="تصفية حسب الشركة"
              className="px-3 py-2 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] outline-hidden focus:border-[#EBB34D]"
            >
              <option value="all">كافة الشركات</option>
              <option value="ترابط للمقاولات">ترابط للمقاولات</option>
              <option value="ماستر جروب">ماستر جروب</option>
              <option value="ماستر ترافل">ماستر ترافل</option>
              <option value="إيمبرو للتجارة والتوريدات">إيمبرو للتجارة والتوريدات</option>
            </select>

            {/* Search box */}
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[#8FA392]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم، الكود، أو UID..."
                className="w-full ps-9 pe-3 py-2 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-xs text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] outline-hidden"
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
              كشوف صرف مسيرات الرواتب لشهر أكتوبر 2026
            </h4>
          </div>
          <span className="text-xs text-[#8FA392]">
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
                <th className="py-3 px-4 font-bold text-emerald-400">صافي المستحق</th>
                <th className="py-3 px-4 font-bold text-center">حالة الصرف</th>
                <th className="py-3 px-4 font-bold text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CB] dark:divide-[#243628]">
              {filteredEmployees.map(emp => {
                const isDisbursed = disbursedBatches.includes(`BATCH-EMP-${emp.id}`);
                return (
                  <tr key={emp.id} className="hover:bg-[#F3EFE6]/50 dark:hover:bg-[#1F2E23]/50 transition-colors">
                    <td className="py-3 px-4 text-start font-mono font-bold text-[#D99B26] dark:text-[#EBB34D]">
                      {emp.uid}
                    </td>
                    <td className="py-3 px-4 text-start">
                      <div className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{emp.nameAr}</div>
                      <div className="text-[10px] text-[#8FA392]">{emp.jobTitleAr}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-[#1A241C] dark:text-[#F3EFE6]">
                      {emp.companyNameAr}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        emp.disbursementMethod === 'bank_transfer'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/40'
                          : 'bg-amber-950/80 text-[#EBB34D] border border-amber-600/40'
                      }`}>
                        {emp.disbursementMethod === 'bank_transfer' ? 'تحويل بنكي' : 'صرف نقدي'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{emp.bankName}</div>
                      <div className="text-[10.5px] font-mono text-[#8FA392]">{emp.bankAccount}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      {emp.salary.basic.toLocaleString('en-US')} ج.م
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      +{emp.salary.allowances.toLocaleString('en-US')} ج.م
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-rose-400">
                      -{emp.salary.deductions.toLocaleString('en-US')} ج.م
                    </td>
                    <td className="py-3 px-4 font-mono font-black text-emerald-400">
                      {emp.salary.net.toLocaleString('en-US')} ج.م
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold ${
                        isDisbursed
                          ? 'bg-[#2A3F30] text-emerald-300 border border-emerald-600/40'
                          : 'bg-[#3D2D14] text-[#EBB34D] border border-amber-600/40'
                      }`}>
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
                        <span className="text-[10px] text-[#8FA392]">تم اعتماد القيد</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleExecuteDisbursement(`BATCH-EMP-${emp.id}`)}
                          className="px-2.5 py-1 rounded-lg bg-[#EBB34D] text-[#0E1610] text-[11px] font-bold hover:bg-[#d99b26] transition-all cursor-pointer flex items-center gap-1 mx-auto"
                        >
                          <Send className="w-3 h-3" />
                          <span>صرف الآن</span>
                        </button>
                      )}
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
