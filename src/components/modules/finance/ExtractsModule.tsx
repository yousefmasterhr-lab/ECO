import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useFinancial } from '../../../context/FinancialContext';
import { ExtractRecord } from '../../../services/database/types';
import { ExtractModal } from './ExtractModal';
import { ExtractPrintModal } from './ExtractPrintModal';
import { FinancialToken } from '../../common/FinancialToken';
import {
  FileSpreadsheet,
  Building,
  HardHat,
  Plus,
  Search,
  RefreshCw,
  Coins,
  Printer,
  AlertCircle,
  BarChart3,
  ShieldCheck
} from 'lucide-react';

export const ExtractsModule: React.FC = () => {
  const { t } = useLanguage();
  const { extracts, costCentersTree, contracts, refreshPhase4Data } = useFinancial();

  const [activeTab, setActiveTab] = useState<'OWNER' | 'SUBCONTRACTOR' | 'WIP_COSTING'>('OWNER');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'DRAFT' | 'PAID'>('ALL');
  const [selectedExtractForPrint, setSelectedExtractForPrint] = useState<ExtractRecord | null>(null);
  const [isExtractModalOpen, setIsExtractModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filtered extracts
  const filteredExtracts = useMemo(() => {
    return extracts.filter(e => {
      const matchType = e.extractType === (activeTab === 'OWNER' ? 'OWNER' : 'SUBCONTRACTOR');
      const matchStatus = statusFilter === 'ALL' || e.status === statusFilter;
      const matchSearch =
        e.projectNameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.partyNameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.contractNo.toString().includes(searchTerm) ||
        e.extractNo.toString().includes(searchTerm);
      return matchType && matchStatus && matchSearch;
    });
  }, [extracts, activeTab, statusFilter, searchTerm]);

  // Aggregate Metrics
  const ownerTotal = useMemo(() => {
    return extracts
      .filter(e => e.extractType === 'OWNER')
      .reduce((acc, e) => acc + e.currentWorkTotal, 0);
  }, [extracts]);

  const subTotal = useMemo(() => {
    return extracts
      .filter(e => e.extractType === 'SUBCONTRACTOR')
      .reduce((acc, e) => acc + e.currentWorkTotal, 0);
  }, [extracts]);

  const totalRetentions = useMemo(() => {
    return extracts.reduce((acc, e) => acc + e.retentionDeductionAmount, 0);
  }, [extracts]);

  const netPayablesTotal = useMemo(() => {
    return filteredExtracts.reduce((acc, e) => acc + e.netPayable, 0);
  }, [filteredExtracts]);

  // WIP Costing Data derived from project cost centers & extracts
  const projectCostings = useMemo(() => {
    const projects = costCentersTree.filter(c => c.mainCenterId === 52);
    return projects.map(p => {
      const contract = contracts.find(c => c.costCenterId === p.id && c.contractType === 'CLIENT');
      const contractVal = contract ? contract.totalValue : (p.revenue || 10000000);
      const billedRev = contract ? contract.billedToDate : (p.revenue || 6000000);
      const direct = p.directCosts || Math.round(billedRev * 0.72);
      const indirect = p.indirectCosts || Math.round(billedRev * 0.08);
      const totalCost = direct + indirect;
      const grossMargin = billedRev - totalCost;
      const grossMarginPercent = billedRev > 0 ? (grossMargin / billedRev) * 100 : 0;
      const wipBalance = Math.max(0, totalCost - billedRev * 0.85);

      return {
        costCenterId: p.id,
        projectNameAr: p.nameAr,
        contractValue: contractVal,
        billedRevenue: billedRev,
        directCosts: direct,
        indirectCosts: indirect,
        totalCosts: totalCost,
        wipBalance: wipBalance,
        grossMargin: grossMargin,
        grossMarginPercent: Number(grossMarginPercent.toFixed(1)),
      };
    });
  }, [costCentersTree, contracts]);

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
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#059669]/15 text-[#059669] dark:text-[#34D399] border border-[#059669]/30">
                {t('محرك المستخلصات الجارية والختامية', 'Progressive Billings Engine')}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                {t('تجريبي (بيئة محاكاة المستخلصات)', 'Preview (Sandbox Extracts)')}
              </span>
              <span className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                {t('حصر الكميات، الاستقطاعات التعاقدية، وتكاليف المشروعات (WIP)', 'Cumulative Progress, Deductions & Job Costing')}
              </span>
            </div>
            <h2 className="text-xl font-black text-[#1A241C] dark:text-[#F3EFE6] tracking-tight">
              {t('إدارة مستخلصات المشروعات ومقاولي الباطن', 'Project Progressive Extracts & WIP Costing')}
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
            onClick={() => setIsExtractModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#059669] text-white hover:bg-[#047857] text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('مستخلص جاري جديد (+)', 'New Extract (+)')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Owner Extracts */}
        <div className="p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-2">
          <div className="flex items-center justify-between text-[#5C665E] dark:text-[#8FA392] text-xs font-bold">
            <span className="flex items-center gap-1">
              <span>{t('إجمالي مستخلصات المالك المعتمدة', 'Approved Owner Extracts')}</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">({t('تجريبي', 'Preview')})</span>
            </span>
            <Building className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="whitespace-nowrap">
            <FinancialToken
              amount={ownerTotal}
              size="xl"
              amountClassName="text-[#059669] dark:text-[#34D399]"
            />
          </div>
          <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
            {extracts.filter(e => e.extractType === 'OWNER').length} {t('مستخلص معتمد لجهات الإسناد (تجريبي)', 'owner extracts (preview)')}
          </p>
        </div>

        {/* Subcontractor Extracts */}
        <div className="p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-2">
          <div className="flex items-center justify-between text-[#5C665E] dark:text-[#8FA392] text-xs font-bold">
            <span className="flex items-center gap-1">
              <span>{t('مستخلصات مقاولي الباطن المعتمدة', 'Subcontractor Extracts')}</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">({t('تجريبي', 'Preview')})</span>
            </span>
            <HardHat className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="whitespace-nowrap">
            <FinancialToken
              amount={subTotal}
              size="xl"
              amountClassName="text-[#D97706] dark:text-[#FBBF24]"
            />
          </div>
          <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
            {extracts.filter(e => e.extractType === 'SUBCONTRACTOR').length} {t('مستخلص لحزم الأعمال التخصصية (تجريبي)', 'trade package extracts (preview)')}
          </p>
        </div>

        {/* Retention Guarantees Held */}
        <div className="p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-2">
          <div className="flex items-center justify-between text-[#5C665E] dark:text-[#8FA392] text-xs font-bold">
            <span className="flex items-center gap-1">
              <span>{t('أمانات ضمان الأعمال المحتجزة (5%)', 'Retention Guarantees (5%)')}</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">({t('تجريبي', 'Preview')})</span>
            </span>
            <ShieldCheck className="w-4 h-4 text-[#3B82F6]" />
          </div>
          <div className="whitespace-nowrap">
            <FinancialToken
              amount={totalRetentions}
              size="xl"
              amountClassName="text-[#3B82F6] dark:text-[#60A5FA]"
            />
          </div>
          <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
            {t('محتجزة لحين التسليم النهائي للأعمال', 'Held until final handover')}
          </p>
        </div>

        {/* Net Payables in View */}
        <div className="p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-2">
          <div className="flex items-center justify-between text-[#5C665E] dark:text-[#8FA392] text-xs font-bold">
            <span className="flex items-center gap-1">
              <span>{t('صافي المستحق للصرف بالجدول', 'Net Payable in View')}</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">({t('تجريبي', 'Preview')})</span>
            </span>
            <Coins className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="whitespace-nowrap">
            <FinancialToken amount={netPayablesTotal} size="xl" />
          </div>
          <p className="text-[11px] text-[#059669] dark:text-[#34D399] font-bold">
            {t('تم توليد القيود المزدوجة آلياً', 'GL vouchers auto-posted')}
          </p>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-2 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16]">
        {/* Mode Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('OWNER')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'OWNER'
                ? 'bg-[#059669] text-white shadow-xs'
                : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1C2A1E]'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>{t('مستخلصات المالك (تجريبي)', 'Owner Extracts (Preview)')}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20">
              {extracts.filter(e => e.extractType === 'OWNER').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('SUBCONTRACTOR')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'SUBCONTRACTOR'
                ? 'bg-[#059669] text-white shadow-xs'
                : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1C2A1E]'
            }`}
          >
            <HardHat className="w-4 h-4" />
            <span>{t('مستخلصات مقاولي الباطن (تجريبي)', 'Subcontractor Extracts (Preview)')}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20">
              {extracts.filter(e => e.extractType === 'SUBCONTRACTOR').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('WIP_COSTING')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'WIP_COSTING'
                ? 'bg-[#059669] text-white shadow-xs'
                : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1C2A1E]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{t('محاسبة تكاليف المشروعات (WIP Job Costing - تجريبي)', 'WIP Job Costing & Margins (Preview)')}</span>
          </button>
        </div>

        {/* Filter controls if in extract mode */}
        {activeTab !== 'WIP_COSTING' && (
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute right-3 top-2.5 text-[#5C665E] dark:text-[#8FA392]" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={t('بحث برقم المستخلص أو المشروع...', 'Search extract or project...')}
                className="w-full h-9 pr-9 pl-3 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#1A241C] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:ring-2 focus:ring-[#059669]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="h-9 px-3 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#1A241C] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:ring-2 focus:ring-[#059669]"
            >
              <option value="ALL">{t('جميع الحالات', 'All Statuses')}</option>
              <option value="APPROVED">{t('معتمد ومرحل', 'Approved & Posted')}</option>
              <option value="DRAFT">{t('مسودة', 'Draft')}</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {activeTab === 'WIP_COSTING' ? (
        /* WIP Job Costing & Margins Table */
        <div className="rounded-3xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6]/60 dark:bg-[#17231A]/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#059669]" />
              <h3 className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6]">
                {t('لوحة تحليل تكاليف العمليات الإنشائية وهوامش الربح الإجمالية للمشروعات (WIP Analysis)', 'Project WIP Costing & Margin Analytics')}
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#5C665E] dark:text-[#8FA392]">
              {projectCostings.length} {t('مشروع إنشائي نشط', 'active projects')}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6]/40 dark:bg-[#17231A]/40 text-[#5C665E] dark:text-[#8FA392] font-black">
                  <th className="py-3 px-4 min-w-[50px]">#</th>
                  <th className="py-3 px-4 min-w-[180px]">{t('المشروع الإنشائي ومركز التكلفة', 'Project & Cost Center')}</th>
                  <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">{t('القيمة التعاقدية', 'Contract Value')}</th>
                  <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">{t('الإيراد المستخلص', 'Billed Revenue')}</th>
                  <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">{t('التكاليف المباشرة', 'Direct Costs')}</th>
                  <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">{t('التكاليف غير المباشرة', 'Indirect Costs')}</th>
                  <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">{t('إجمالي التكاليف', 'Total Costs')}</th>
                  <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">{t('مجمل الربح (Margin)', 'Gross Profit')}</th>
                  <th className="py-3 px-4 min-w-[110px] whitespace-nowrap">{t('نسبة الهامش %', 'Margin %')}</th>
                  <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">{t('رصيد WIP', 'WIP Balance')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D9CB] dark:divide-[#243628]">
                {projectCostings.map((p, idx) => (
                  <tr key={p.costCenterId} className="hover:bg-[#F3EFE6]/40 dark:hover:bg-[#1C2A1E]/40 transition-colors">
                    <td className="py-3.5 px-4 font-normal text-[#5C665E]">{idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{p.projectNameAr}</div>
                      <div className="text-[11px] text-[#059669]">مركز تكلفة: {p.costCenterId}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <FinancialToken amount={p.contractValue} amountClassName="text-[#1A241C] dark:text-[#F3EFE6]" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <FinancialToken amount={p.billedRevenue} amountClassName="text-[#059669] dark:text-[#34D399]" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <FinancialToken amount={p.directCosts} amountClassName="text-[#5C665E] dark:text-[#8FA392]" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <FinancialToken amount={p.indirectCosts} amountClassName="text-[#5C665E] dark:text-[#8FA392]" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <FinancialToken amount={p.totalCosts} amountClassName="text-[#D97706] dark:text-[#FBBF24]" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <FinancialToken amount={p.grossMargin} amountClassName="text-[#059669] dark:text-[#34D399]" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="w-20 space-y-1">
                        <span className="text-[11px] font-bold text-[#059669]" dir="ltr">
                          {p.grossMarginPercent}%
                        </span>
                        <div className="h-1.5 rounded-full bg-[#E0D9CB] dark:bg-[#243628] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              p.grossMarginPercent >= 15
                                ? 'bg-[#059669]'
                                : p.grossMarginPercent >= 8
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(p.grossMarginPercent * 3, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <FinancialToken amount={p.wipBalance} amountClassName="text-[#3B82F6] dark:text-[#60A5FA]" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Extracts Datagrid */
        <div className="rounded-3xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6]/60 dark:bg-[#17231A]/60 text-[#5C665E] dark:text-[#8FA392] font-black">
                  <th className="py-3 px-4 min-w-[50px]">#</th>
                  <th className="py-3 px-4 min-w-[120px] whitespace-nowrap">{t('رقم المستخلص', 'Extract No')}</th>
                  <th className="py-3 px-4 min-w-[100px] whitespace-nowrap">{t('تاريخ الاعتماد', 'Date')}</th>
                  <th className="py-3 px-4 min-w-[180px]">{t('المشروع ومركز التكلفة', 'Project & Cost Center')}</th>
                  <th className="py-3 px-4 min-w-[180px]">
                    {activeTab === 'OWNER'
                      ? t('العميل / جهة الإسناد', 'Client / Owner')
                      : t('مقاول الباطن / التخصص', 'Subcontractor / Trade')}
                  </th>
                  <th className="py-3 px-4 min-w-[150px] whitespace-nowrap">{t('إجمالي الأعمال الحالية', 'Current Work Gross')}</th>
                  <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">{t('استرداد دفعة (10%)', 'Advance Rec.')}</th>
                  <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">{t('ضمان أعمال (5%)', 'Retention')}</th>
                  <th className="py-3 px-4 min-w-[150px] whitespace-nowrap">{t('صافي المستحق', 'Net Payable')}</th>
                  <th className="py-3 px-4 min-w-[100px] whitespace-nowrap">{t('قيد اليومية', 'GL Voucher')}</th>
                  <th className="py-3 px-4 min-w-[100px] whitespace-nowrap">{t('الحالة', 'Status')}</th>
                  <th className="py-3 px-4 min-w-[100px] text-center whitespace-nowrap">{t('الإجراءات', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D9CB] dark:divide-[#243628]">
                {filteredExtracts.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-[#5C665E] dark:text-[#8FA392]">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-[#5C665E]/50" />
                      <p className="text-sm font-bold">{t('لا توجد مستخلصات مسجلة مطابقة لمعايير البحث', 'No matching extracts found')}</p>
                    </td>
                  </tr>
                ) : (
                  filteredExtracts.map((e, idx) => (
                    <tr
                      key={e.id}
                      className="hover:bg-[#F3EFE6]/40 dark:hover:bg-[#1C2A1E]/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-normal text-[#5C665E]">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-[#1A241C] dark:text-[#F3EFE6] whitespace-nowrap">
                        EXT-{e.contractNo}-{String(e.extractNo).padStart(2, '0')}
                      </td>
                      <td className="py-3.5 px-4 text-[#5C665E] dark:text-[#8FA392] whitespace-nowrap" dir="ltr">{e.extractDate}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{e.projectNameAr}</div>
                        <div className="text-[11px] text-[#059669]">مركز تكلفة: {e.costCenterId}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{e.partyNameAr}</div>
                        {e.consultantNameAr && (
                          <div className="text-[10px] text-[#5C665E] dark:text-[#8FA392]">
                            استشاري: {e.consultantNameAr}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <FinancialToken amount={e.currentWorkTotal} amountClassName="text-[#1A241C] dark:text-[#F3EFE6]" />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <FinancialToken
                          amount={e.advanceDeductionAmount}
                          isNegative
                          amountClassName="text-red-600 dark:text-red-400"
                        />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <FinancialToken
                          amount={e.retentionDeductionAmount}
                          isNegative
                          amountClassName="text-blue-600 dark:text-blue-400"
                        />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <FinancialToken
                          amount={e.netPayable}
                          amountClassName="text-[#059669] dark:text-[#34D399]"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#3B7A57] whitespace-nowrap" dir="ltr">
                        {e.journalNo ? `#${e.journalNo}` : '—'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                          {t('معتمد ومرحل', 'Approved')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedExtractForPrint(e)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-[#1A241C] border border-[#E0D9CB] dark:border-[#243628] hover:border-[#059669] text-[#1A241C] dark:text-[#F3EFE6] text-[11px] font-bold shadow-2xs hover:bg-[#059669] hover:text-white transition-all cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>{t('طباعة', 'Print')}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Extract Modal */}
      <ExtractModal
        isOpen={isExtractModalOpen}
        onClose={() => setIsExtractModalOpen(false)}
        defaultType={activeTab === 'SUBCONTRACTOR' ? 'SUBCONTRACTOR' : 'OWNER'}
      />

      {/* Extract Print Preview Modal */}
      <ExtractPrintModal
        isOpen={Boolean(selectedExtractForPrint)}
        onClose={() => setSelectedExtractForPrint(null)}
        extract={selectedExtractForPrint}
      />
    </div>
  );
};
