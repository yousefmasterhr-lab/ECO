import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useFinancial } from '../../../context/FinancialContext';
import { ContractModal } from './ContractModal';
import { FinancialToken } from '../../common/FinancialToken';
import {
  Building,
  HardHat,
  Plus,
  Search,
  RefreshCw,
  TrendingUp,
  Percent,
  Coins,
  CheckCircle2,
  AlertCircle,
  FileCheck
} from 'lucide-react';

export const ContractsModule: React.FC = () => {
  const { t } = useLanguage();
  const { contracts, refreshPhase4Data } = useFinancial();

  const [activeTab, setActiveTab] = useState<'CLIENT' | 'SUBCONTRACTOR'>('CLIENT');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filtered contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      const matchType = c.contractType === activeTab;
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchSearch =
        c.projectNameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.partyNameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contractNo.toString().includes(searchTerm) ||
        c.costCenterId.toString().includes(searchTerm);
      return matchType && matchStatus && matchSearch;
    });
  }, [contracts, activeTab, statusFilter, searchTerm]);

  // Financial aggregates
  const totalValue = useMemo(() => {
    return filteredContracts.reduce((acc, c) => acc + c.totalValue, 0);
  }, [filteredContracts]);

  const totalBilled = useMemo(() => {
    return filteredContracts.reduce((acc, c) => acc + c.billedToDate, 0);
  }, [filteredContracts]);

  const totalBacklog = useMemo(() => {
    return filteredContracts.reduce((acc, c) => acc + c.backlogValue, 0);
  }, [filteredContracts]);

  const avgRealization = useMemo(() => {
    return totalValue > 0 ? (totalBilled / totalValue) * 100 : 0;
  }, [totalValue, totalBilled]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshPhase4Data();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="w-full max-w-none space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] shadow-xs mt-1">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#059669]/15 text-[#059669] dark:text-[#34D399] flex items-center justify-center shadow-xs">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#059669]/15 text-[#059669] dark:text-[#34D399] border border-[#059669]/30">
                {t('عقود وارتباطات المشروعات', 'Contracts & Commitments')}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                {t('تجريبي (بيئة محاكاة العقود)', 'Preview (Sandbox Contracts)')}
              </span>
              <span className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                {t('المرحلة الرابعة: المقاولات والمستخلصات', 'Phase 4: Contracting & Extracts')}
              </span>
            </div>
            <h2 className="text-xl font-black text-[#1A241C] dark:text-[#F3EFE6] tracking-tight">
              {t('سجل عقود المشروعات ومقاولي الباطن', 'Project & Subcontractor Contracts')}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#5C665E] hover:text-[#1A241C] dark:text-[#8FA392] dark:hover:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1C2A1E] transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#059669]' : ''}`} />
            <span>{t('تحديث', 'Refresh')}</span>
          </button>

          <button
            onClick={() => setIsContractModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#059669] text-white hover:bg-[#047857] text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('عقد هندسي جديد', 'New Contract')}</span>
          </button>
        </div>
      </div>

      {/* KPI Realization Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Contract Value */}
        <div className="p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-2">
          <div className="flex items-center justify-between text-[#5C665E] dark:text-[#8FA392] text-xs font-bold">
            <span className="flex items-center gap-1">
              <span>{t('إجمالي قيمة العقود النشطة', 'Total Active Contracts')}</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">({t('تجريبي', 'Preview')})</span>
            </span>
            <Coins className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="whitespace-nowrap">
            <FinancialToken amount={totalValue} size="xl" />
          </div>
          <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
            {filteredContracts.length} {t('عقد هندسي مسجل (تجريبي)', 'registered contracts (preview)')}
          </p>
        </div>

        {/* Billed to Date */}
        <div className="p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-2">
          <div className="flex items-center justify-between text-[#5C665E] dark:text-[#8FA392] text-xs font-bold">
            <span className="flex items-center gap-1">
              <span>{t('الأعمال المستخلصة حتى تاريخه', 'Billed to Date')}</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">({t('تجريبي', 'Preview')})</span>
            </span>
            <TrendingUp className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="whitespace-nowrap">
            <FinancialToken
              amount={totalBilled}
              size="xl"
              amountClassName="text-[#059669] dark:text-[#34D399]"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-[#E0D9CB] dark:bg-[#243628] overflow-hidden">
              <div
                className="h-full bg-[#059669] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(avgRealization, 100)}%` }}
              />
            </div>
            <span className="text-xs font-bold text-[#059669]" dir="ltr">
              {avgRealization.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Remaining Backlog */}
        <div className="p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-2">
          <div className="flex items-center justify-between text-[#5C665E] dark:text-[#8FA392] text-xs font-bold">
            <span className="flex items-center gap-1">
              <span>{t('القيمة المتبقية (Backlog)', 'Remaining Backlog')}</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">({t('تجريبي', 'Preview')})</span>
            </span>
            <Percent className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="whitespace-nowrap">
            <FinancialToken
              amount={totalBacklog}
              size="xl"
              amountClassName="text-[#D97706] dark:text-[#FBBF24]"
            />
          </div>
          <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
            <span dir="ltr">{(100 - avgRealization).toFixed(1)}%</span> {t('أعمال مستقبلية قيد التنفيذ', 'unbilled progress')}
          </p>
        </div>

        {/* Contractual Terms Standard */}
        <div className="p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-2">
          <div className="flex items-center justify-between text-[#5C665E] dark:text-[#8FA392] text-xs font-bold">
            <span className="flex items-center gap-1">
              <span>{t('الشروط التعاقدية المعيارية', 'Standard Terms')}</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">({t('تجريبي', 'Preview')})</span>
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="text-xs text-[#1A241C] dark:text-[#F3EFE6] space-y-1">
            <div className="flex justify-between">
              <span>{t('استرداد دفعة مقدمة:', 'Advance Recovery:')}</span>
              <span className="font-mono font-bold text-[#059669]">10.0%</span>
            </div>
            <div className="flex justify-between">
              <span>{t('استقطاع ضمان أعمال:', 'Retention Guarantee:')}</span>
              <span className="font-mono font-bold text-[#059669]">5.0%</span>
            </div>
          </div>
          <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
            {t('تخصم آلياً من كل مستخلص جاري', 'Deducted on every extract')}
          </p>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-2 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16]">
        {/* Mode Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('CLIENT')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'CLIENT'
                ? 'bg-[#059669] text-white shadow-xs'
                : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1C2A1E]'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>{t('عقود العملاء والملاك (تجريبي)', 'Owner / Client Contracts (Preview)')}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20">
              {contracts.filter(c => c.contractType === 'CLIENT').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('SUBCONTRACTOR')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'SUBCONTRACTOR'
                ? 'bg-[#059669] text-white shadow-xs'
                : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1C2A1E]'
            }`}
          >
            <HardHat className="w-4 h-4" />
            <span>{t('عقود مقاولي الباطن (تجريبي)', 'Subcontractor Packages (Preview)')}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20">
              {contracts.filter(c => c.contractType === 'SUBCONTRACTOR').length}
            </span>
          </button>
        </div>

        {/* Search & Status Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-[#5C665E] dark:text-[#8FA392]" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={t('بحث برقم العقد أو اسم المشروع...', 'Search project or contract no...')}
              className="w-full h-9 pr-9 pl-3 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#1A241C] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:ring-2 focus:ring-[#059669]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="h-9 px-3 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#1A241C] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:ring-2 focus:ring-[#059669]"
          >
            <option value="ALL">{t('جميع الحالات', 'All Statuses')}</option>
            <option value="ACTIVE">{t('ساري / نشط', 'Active')}</option>
            <option value="COMPLETED">{t('منتهي / مكتمل', 'Completed')}</option>
          </select>
        </div>
      </div>

      {/* Contracts Datagrid */}
      <div className="rounded-3xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6]/60 dark:bg-[#17231A]/60 text-[#5C665E] dark:text-[#8FA392] font-black">
                <th className="py-3 px-4 min-w-[50px]">#</th>
                <th className="py-3 px-4 min-w-[120px] whitespace-nowrap">{t('رقم العقد', 'Contract No')}</th>
                <th className="py-3 px-4 min-w-[180px]">{t('المشروع ومركز التكلفة', 'Project & Cost Center')}</th>
                <th className="py-3 px-4 min-w-[180px]">
                  {activeTab === 'CLIENT'
                    ? t('العميل / جهة الإسناد', 'Client / Owner')
                    : t('مقاول الباطن / التخصص', 'Subcontractor / Trade')}
                </th>
                <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">{t('القيمة الإجمالية', 'Total Value')}</th>
                <th className="py-3 px-4 min-w-[150px] whitespace-nowrap">{t('المستخلص حتى تاريخه', 'Billed to Date')}</th>
                <th className="py-3 px-4 min-w-[110px] whitespace-nowrap">{t('الإنجاز المالي', 'Realization %')}</th>
                <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">{t('القيمة المتبقية', 'Backlog')}</th>
                <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">{t('الاستقطاعات', 'Deductions %')}</th>
                <th className="py-3 px-4 min-w-[120px] whitespace-nowrap">{t('فترة التنفيذ', 'Execution Period')}</th>
                <th className="py-3 px-4 min-w-[100px] whitespace-nowrap">{t('الحالة', 'Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CB] dark:divide-[#243628]">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-[#5C665E] dark:text-[#8FA392]">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-[#5C665E]/50" />
                    <p className="text-sm font-bold">{t('لا توجد عقود مطابقة لمعايير البحث', 'No matching contracts found')}</p>
                  </td>
                </tr>
              ) : (
                filteredContracts.map((c, idx) => {
                  const realizationPercent = c.totalValue > 0 ? (c.billedToDate / c.totalValue) * 100 : 0;
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-[#F3EFE6]/40 dark:hover:bg-[#1C2A1E]/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-normal text-[#5C665E]">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-[#1A241C] dark:text-[#F3EFE6] whitespace-nowrap">
                        CTR-{c.contractNo}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{c.projectNameAr}</div>
                        <div className="text-[11px] text-[#059669] dark:text-[#34D399]">
                          مركز تكلفة: {c.costCenterId}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{c.partyNameAr}</div>
                        {c.consultantNameAr && (
                          <div className="text-[10px] text-[#5C665E] dark:text-[#8FA392]">
                            استشاري: {c.consultantNameAr}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <FinancialToken amount={c.totalValue} amountClassName="text-[#1A241C] dark:text-[#F3EFE6]" />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <FinancialToken amount={c.billedToDate} amountClassName="text-[#059669] dark:text-[#34D399]" />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="w-24 space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-[#059669]" dir="ltr">
                            <span>{realizationPercent.toFixed(1)}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-[#E0D9CB] dark:bg-[#243628] overflow-hidden">
                            <div
                              className="h-full bg-[#059669] rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(realizationPercent, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <FinancialToken amount={c.backlogValue} amountClassName="text-[#D97706] dark:text-[#FBBF24]" />
                      </td>
                      <td className="py-3.5 px-4 text-[11px] whitespace-nowrap">
                        <span className="font-semibold text-[#059669]" dir="ltr">دفعة: {c.advancePaymentPercent}%</span>
                        <span className="text-[#5C665E] mx-1">|</span>
                        <span className="font-semibold text-[#3B82F6]" dir="ltr">ضمان: {c.retentionPercent}%</span>
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-[#5C665E] dark:text-[#8FA392] whitespace-nowrap" dir="ltr">
                        <div>{c.startDate}</div>
                        <div>{c.endDate}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            c.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
                          }`}
                        >
                          {c.status === 'ACTIVE' ? t('ساري ونشط', 'Active') : t('مكتمل', 'Completed')}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contract Creation Modal */}
      <ContractModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        defaultType={activeTab}
      />
    </div>
  );
};
