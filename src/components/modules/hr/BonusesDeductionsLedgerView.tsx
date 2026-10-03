import React, { useState } from 'react';
import { useHR } from '../../../context/HRContext';
import {
  Sparkles,
  AlertTriangle,
  Coins,
  Search
} from 'lucide-react';
import { AddBonusModal } from './AddBonusModal';
import { AddDeductionModal } from './AddDeductionModal';

export const BonusesDeductionsLedgerView: React.FC = () => {
  const { employees } = useHR();

  const [activeFilterType, setActiveFilterType] = useState<'all' | 'bonus' | 'deduction'>('all');
  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [isDeductionModalOpen, setIsDeductionModalOpen] = useState(false);
  const targetEmployee = employees[0] || null;

  // Flatten all bonuses and deductions
  const allRecords = employees.flatMap(emp => {
    const bList = emp.bonuses.map(b => ({
      ...b,
      recordType: 'bonus' as const,
      employeeId: emp.id,
      employeeName: emp.nameAr,
      employeeUid: emp.uid,
      jobTitle: emp.jobTitleAr,
      companyName: emp.companyNameAr,
    }));
    const dList = emp.deductions.map(d => ({
      ...d,
      recordType: 'deduction' as const,
      employeeId: emp.id,
      employeeName: emp.nameAr,
      employeeUid: emp.uid,
      jobTitle: emp.jobTitleAr,
      companyName: emp.companyNameAr,
    }));
    return [...bList, ...dList];
  });

  const filteredRecords = allRecords.filter(rec => {
    if (activeFilterType !== 'all' && rec.recordType !== activeFilterType) return false;
    if (selectedEntity !== 'all' && rec.companyName !== selectedEntity) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        rec.employeeName.toLowerCase().includes(q) ||
        rec.titleAr.toLowerCase().includes(q) ||
        rec.employeeUid.includes(q)
      );
    }
    return true;
  });

  const totalBonuses = allRecords
    .filter(r => r.recordType === 'bonus')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalDeductions = allRecords
    .filter(r => r.recordType === 'deduction')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Cockpit */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
            <span>سجل الحوافز والمكافآت والجزاءات المعتمدة (Bonuses & Deductions Ledger)</span>
          </h3>
          <p className="text-xs text-[#5C665E] dark:text-[#8FA392] mt-0.5">
            إدارة وتوثيق مكافآت تسليم مراحل المشاريع وجزاءات مخالفات السلامة ومواعيد الدوام
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsBonusModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md hover:bg-emerald-500 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>+ صرف مكافأة جديدة</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDeductionModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md hover:bg-rose-500 transition-all cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>+ تسجيل جزاء إداري</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
          <span className="text-xs text-[#5C665E] dark:text-[#8FA392] block font-bold">إجمالي الحوافز والمكافآت المصروفة</span>
          <div className="text-xl font-black text-emerald-400 mt-1">
            +{totalBonuses.toLocaleString('en-US')} <span className="text-xs">ج.م</span>
          </div>
          <span className="text-[10px] text-emerald-400/80 mt-1 block">حوافز إنتاج وتسليم مراحل مواقع</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
          <span className="text-xs text-[#5C665E] dark:text-[#8FA392] block font-bold">إجمالي الجزاءات والخصومات المحسومة</span>
          <div className="text-xl font-black text-rose-400 mt-1">
            -{totalDeductions.toLocaleString('en-US')} <span className="text-xs">ج.م</span>
          </div>
          <span className="text-[10px] text-rose-400/80 mt-1 block">خصومات تأخير ومخالفات سلامة وصحة مهنية</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
          <span className="text-xs text-[#5C665E] dark:text-[#8FA392] block font-bold">صافي الأثر على مسير الرواتب</span>
          <div className="text-xl font-black text-[#EBB34D] mt-1">
            {(totalBonuses - totalDeductions).toLocaleString('en-US')} <span className="text-xs">ج.م</span>
          </div>
          <span className="text-[10px] text-[#8FA392] mt-1 block">تنعكس تلقائياً في قسيمة الراتب الشهرية</span>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F3EFE6] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628]">
          <button
            type="button"
            onClick={() => setActiveFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeFilterType === 'all'
                ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-white dark:text-[#0E1610]'
                : 'text-[#8FA392] hover:text-[#F3EFE6]'
            }`}
          >
            كافة السجلات ({allRecords.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilterType('bonus')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeFilterType === 'bonus'
                ? 'bg-emerald-600 text-white'
                : 'text-[#8FA392] hover:text-[#F3EFE6]'
            }`}
          >
            المكافآت والحوافز
          </button>
          <button
            type="button"
            onClick={() => setActiveFilterType('deduction')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeFilterType === 'deduction'
                ? 'bg-rose-600 text-white'
                : 'text-[#8FA392] hover:text-[#F3EFE6]'
            }`}
          >
            الجزاءات والخصومات
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

          <div className="relative w-64">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[#8FA392]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث بالموظف، البيان، أو UID..."
              className="w-full ps-9 pe-3 py-2 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-xs text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-end text-xs">
            <thead className="bg-[#FBF9F5] dark:bg-[#111A13] text-[#5C665E] dark:text-[#8FA392] border-b border-[#E0D9CB] dark:border-[#243628]">
              <tr>
                <th className="py-3 px-4 font-bold text-start">النوع</th>
                <th className="py-3 px-4 font-bold text-start">الموظف المعني</th>
                <th className="py-3 px-4 font-bold">الشركة التابعة</th>
                <th className="py-3 px-4 font-bold">البيان والسبب</th>
                <th className="py-3 px-4 font-bold">المشروع المرتبط</th>
                <th className="py-3 px-4 font-bold">التاريخ</th>
                <th className="py-3 px-4 font-bold">القيمة المالية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CB] dark:divide-[#243628]">
              {filteredRecords.map(rec => {
                const isBonus = rec.recordType === 'bonus';
                return (
                  <tr key={rec.id} className="hover:bg-[#F3EFE6]/50 dark:hover:bg-[#1F2E23]/50 transition-colors">
                    <td className="py-3 px-4 text-start">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isBonus
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/40'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-600/40'
                      }`}>
                        {isBonus ? <Sparkles className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        <span>{isBonus ? 'مكافأة' : 'جزاء'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-start">
                      <div className="font-bold text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-1.5">
                        <span>{rec.employeeName}</span>
                        <span className="font-mono text-[10px] text-[#EBB34D]">({rec.employeeUid})</span>
                      </div>
                      <div className="text-[10px] text-[#8FA392]">{rec.jobTitle}</div>
                    </td>
                    <td className="py-3 px-4 text-[#1A241C] dark:text-[#F3EFE6] font-medium">
                      {rec.companyName}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{rec.titleAr}</div>
                      <div className="text-[10.5px] text-[#8FA392]">{rec.reason}</div>
                    </td>
                    <td className="py-3 px-4 text-[#8FA392]">
                      {'projectLinked' in rec && rec.projectLinked ? (rec.projectLinked as string) : 'المقر الرئيسي'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#8FA392]">
                      {rec.date}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      <span className={isBonus ? 'text-emerald-400' : 'text-rose-400'}>
                        {isBonus ? '+' : '-'}{rec.amount.toLocaleString('en-US')} ج.م
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reusable Modals */}
      <AddBonusModal
        isOpen={isBonusModalOpen}
        onClose={() => setIsBonusModalOpen(false)}
        employee={targetEmployee}
      />
      <AddDeductionModal
        isOpen={isDeductionModalOpen}
        onClose={() => setIsDeductionModalOpen(false)}
        employee={targetEmployee}
      />
    </div>
  );
};
