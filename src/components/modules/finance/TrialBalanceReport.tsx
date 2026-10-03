import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useFinancial } from '../../../context/FinancialContext';
import { useDatabase } from '../../../services/federation/DatabaseContext';
import { getFiscalDateRange } from '../../../utils/fiscalYearHelper';
import { TrialBalanceReportData } from '../../../services/database/types';
import { ReportPrintLayout } from './ReportPrintLayout';
import { exportToCsv, formatEGP } from '../../../utils/exportUtils';
import { toast } from '@erp/ui-system';
import {
  Scale,
  Search,
  RefreshCw,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Calendar,
  Building2,
  ChevronDown
} from 'lucide-react';

export const TrialBalanceReport: React.FC = () => {
  const { t } = useLanguage();
  const { activeDatabase } = useDatabase();
  const { fetchTrialBalance, costCenters } = useFinancial();

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<TrialBalanceReportData | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number>(5);

  const initialRange = useMemo(() => getFiscalDateRange(activeDatabase), [activeDatabase]);
  const [startDate, setStartDate] = useState<string>(() => initialRange.startDate);
  const [endDate, setEndDate] = useState<string>(() => initialRange.endDate);

  // Sync dates when activeDatabase changes
  useEffect(() => {
    const range = getFiscalDateRange(activeDatabase);
    setStartDate(range.startDate);
    setEndDate(range.endDate);
  }, [activeDatabase]);

  const [selectedCostCenter, setSelectedCostCenter] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchTrialBalance(
        selectedLevel,
        startDate || undefined,
        endDate || undefined,
        selectedCostCenter
      );
      setData(res);
    } catch (err) {
      console.error('Failed to load trial balance:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchTrialBalance, selectedLevel, startDate, endDate, selectedCostCenter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Client-side text filter on items
  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    if (!searchQuery.trim()) return data.items;
    const q = searchQuery.trim().toLowerCase();
    return data.items.filter(
      item =>
        item.accountCode.toLowerCase().includes(q) ||
        item.accountNameAr.toLowerCase().includes(q) ||
        (item.accountNameEn && item.accountNameEn.toLowerCase().includes(q))
    );
  }, [data, searchQuery]);

  // Export to CSV
  const handleExportCsv = () => {
    if (!filteredItems.length) return;
    const headers = [
      'كود الحساب',
      'اسم الحساب',
      'المستوى',
      'رصيد أول المدة - مدين',
      'رصيد أول المدة - دائن',
      'حركات الفترة - مدين',
      'حركات الفترة - دائن',
      'رصيد ختامي - مدين',
      'رصيد ختامي - دائن'
    ];
    const rows = filteredItems.map(item => [
      item.accountCode,
      item.accountNameAr,
      `المستوى ${item.level}`,
      item.openingDebit,
      item.openingCredit,
      item.periodDebit,
      item.periodCredit,
      item.endingDebit,
      item.endingCredit
    ]);

    // Summary row
    if (data) {
      rows.push([
        'الإجمالي العام',
        '---',
        '---',
        data.totalOpeningDebit,
        data.totalOpeningCredit,
        data.totalPeriodDebit,
        data.totalPeriodCredit,
        data.totalEndingDebit,
        data.totalEndingCredit
      ]);
    }

    exportToCsv(`ميزان_المراجعة_مستوى_${selectedLevel}_${endDate}`, headers, rows);
    toast.success(
      t('تم تصدير ميزان المراجعة بنجاح', 'Trial balance exported successfully'),
      `${t('المستوى', 'Level')} ${selectedLevel} (${data?.items.length || 0} ${t('حساب محاسبي', 'accounts')})`
    );
  };

  const isBalanced = data?.isBalanced ?? true;
  const diff = data?.difference ?? 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Filter and Actions Toolbar */}
      <div className="bg-white dark:bg-[#17231A] rounded-3xl border border-[#E0D9CB] dark:border-[#243628] p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Header Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-[#059669] flex items-center justify-center border border-emerald-500/20">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
                <span>{t('ميزان المراجعة بالمستويات الخمسة', '5-Level Trial Balance')}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                  {t(`المستوى ${selectedLevel}`, `Level ${selectedLevel}`)}
                </span>
              </h2>
              <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                {t(
                  'تحقق فوري من التوازن المحاسبي والحركات المالية للأستاذ العام',
                  'Real-time verification of accounting equilibrium and general ledger movements'
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#1E2E21] hover:bg-[#EAE4D7] dark:hover:bg-[#253929] text-[#1A241C] dark:text-[#F3EFE6] transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{t('تحديث', 'Refresh')}</span>
            </button>

            <button
              onClick={handleExportCsv}
              disabled={loading || !data?.items.length}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#1F2E23] hover:bg-[#EAE4D7] dark:hover:bg-[#253929] text-[#1A241C] dark:text-[#F3EFE6] transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('تصدير Excel (CSV)', 'Export CSV')}</span>
            </button>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              disabled={loading || !data?.items.length}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-[#D99B26] hover:bg-[#C58F38] text-[#0E1610] shadow-md shadow-amber-900/20 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('طباعة رسمية', 'Official Print')}</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-5 pt-4 border-t border-[#E0D9CB]/60 dark:border-[#243628] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Level Depth Selector */}
          <div>
            <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#059669]" />
                {t('مستوى العرض', 'Chart Level Depth')}
              </span>
            </label>
            <div className="relative">
              <select
                value={selectedLevel}
                onChange={e => setSelectedLevel(Number(e.target.value))}
                className="w-full h-10 px-3 pr-8 rounded-xl text-xs font-bold border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#121A13] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#059669] focus:outline-hidden appearance-none cursor-pointer"
              >
                <option value={1}>{t('المستوى 1 (الأصول، الخصوم، الإيرادات...)', 'Level 1 (Major Classes)')}</option>
                <option value={2}>{t('المستوى 2 (المجموعات الرئيسية)', 'Level 2 (Main Groups)')}</option>
                <option value={3}>{t('المستوى 3 (الحسابات العامة)', 'Level 3 (General Accounts)')}</option>
                <option value={4}>{t('المستوى 4 (الحسابات الفرعية)', 'Level 4 (Sub Accounts)')}</option>
                <option value={5}>{t('المستوى 5 (الحسابات التحليلية - تفصيلي)', 'Level 5 (Posting Ledgers)')}</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute left-2.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#059669]" />
                {t('من تاريخ', 'From Date')}
              </span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full h-10 px-3 rounded-xl text-xs font-mono font-bold border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#121A13] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#059669] focus:outline-hidden"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#059669]" />
                {t('إلى تاريخ', 'To Date')}
              </span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full h-10 px-3 rounded-xl text-xs font-mono font-bold border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#121A13] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#059669] focus:outline-hidden"
            />
          </div>

          {/* Cost Center Filter */}
          <div>
            <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3 text-[#059669]" />
                {t('مركز التكلفة', 'Cost Center')}
              </span>
            </label>
            <div className="relative">
              <select
                value={selectedCostCenter ?? ''}
                onChange={e => setSelectedCostCenter(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full h-10 px-3 pr-8 rounded-xl text-xs font-bold border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#121A13] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#059669] focus:outline-hidden appearance-none cursor-pointer"
              >
                <option value="">{t('جميع مراكز التكلفة', 'All Cost Centers')}</option>
                {costCenters.map(cc => (
                  <option key={cc.id} value={cc.id}>
                    {cc.code} - {cc.nameAr}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute left-2.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Quick Search */}
          <div>
            <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
              <span className="flex items-center gap-1">
                <Search className="w-3 h-3 text-[#059669]" />
                {t('بحث في الميزان', 'Filter Results')}
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('كود أو اسم الحساب...', 'Account code or name...')}
                className="w-full h-10 pr-9 pl-3 rounded-xl text-xs font-bold border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#121A13] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#059669] focus:outline-hidden"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Mathematical Equilibrium Guard (شريط فحص اتزان الميزان) */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          isBalanced
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isBalanced ? (
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black">
                  {isBalanced
                    ? t('الميزان متزن رياضياً بنجاح (Σ مدين = Σ دائن)', 'Trial Balance in Mathematical Equilibrium (Σ Debit = Σ Credit)')
                    : t('تحذير محاسبي: يوجد عدم اتزان بالميزان!', 'Accounting Warning: Imbalance Detected!')}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                    isBalanced
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white animate-pulse'
                  }`}
                >
                  {isBalanced ? 'فرق = 0.00 ج.م' : `فرق = ${formatEGP(diff)} ج.م`}
                </span>
              </div>
              <p className="text-xs opacity-80 mt-0.5">
                {isBalanced
                  ? t(
                      'جميع قيود اليومية وحركات الحسابات متطابقة مع المعادلة المحاسبية الأساسية.',
                      'All journal entries and account movements match the fundamental accounting equation.'
                    )
                  : t(
                      'يرجى مراجعة قيود اليومية غير المتزنة أو الحسابات المعلقة قبل إقفال الفترة المالية.',
                      'Please audit unbalanced journal entries or suspense accounts before closing the period.'
                    )}
              </p>
            </div>
          </div>

          {/* Quick Equilibrium Summary Mini-Cards */}
          {data && (
            <div className="flex items-center gap-3 text-xs shrink-0 self-end md:self-auto">
              <div className="px-3 py-1.5 rounded-xl bg-white/70 dark:bg-black/20 border border-current/10 whitespace-nowrap">
                <span className="text-[10px] block opacity-70">إجمالي الحركات (مدين)</span>
                <span className="font-mono font-black" dir="ltr">{formatEGP(data.totalPeriodDebit)} <span className="text-[10px] font-normal">ج.م</span></span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/70 dark:bg-black/20 border border-current/10 whitespace-nowrap">
                <span className="text-[10px] block opacity-70">إجمالي الحركات (دائن)</span>
                <span className="font-mono font-black" dir="ltr">{formatEGP(data.totalPeriodCredit)} <span className="text-[10px] font-normal">ج.م</span></span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/70 dark:bg-black/20 border border-current/10 whitespace-nowrap">
                <span className="text-[10px] block opacity-70">إجمالي الأرصدة الختامية</span>
                <span className="font-mono font-black" dir="ltr">{formatEGP(data.totalEndingDebit)} <span className="text-[10px] font-normal">ج.م</span></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive Multi-Level Data Table */}
      <div className="bg-white dark:bg-[#17231A] rounded-3xl border border-[#E0D9CB] dark:border-[#243628] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              {/* Header Tier 1 */}
              <tr className="border-b border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#1D2B20] text-[#1A241C] dark:text-[#F3EFE6] font-black">
                <th rowSpan={2} className="py-3 px-3 w-32 border-l border-[#E0D9CB] dark:border-[#243628]">
                  {t('كود الحساب', 'Account Code')}
                </th>
                <th rowSpan={2} className="py-3 px-3 min-w-[200px] border-l border-[#E0D9CB] dark:border-[#243628]">
                  {t('اسم الحساب', 'Account Name')}
                </th>
                <th rowSpan={2} className="py-3 px-2 text-center w-16 border-l border-[#E0D9CB] dark:border-[#243628]">
                  {t('المستوى', 'Level')}
                </th>
                <th colSpan={2} className="py-2 px-3 text-center border-l border-[#E0D9CB] dark:border-[#243628] bg-amber-500/10 text-amber-900 dark:text-amber-200">
                  {t('رصيد أول المدة', 'Opening Balance')}
                </th>
                <th colSpan={2} className="py-2 px-3 text-center border-l border-[#E0D9CB] dark:border-[#243628] bg-blue-500/10 text-blue-900 dark:text-blue-200">
                  {t('حركات الفترة الحالية', 'Period Movements')}
                </th>
                <th colSpan={2} className="py-2 px-3 text-center bg-emerald-500/10 text-emerald-900 dark:text-emerald-200">
                  {t('الرصيد الختامي', 'Ending Balance')}
                </th>
              </tr>
              {/* Header Tier 2 */}
              <tr className="border-b border-[#E0D9CB] dark:border-[#243628] bg-[#F4EFE6] dark:bg-[#19261C] text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392]">
                <th className="py-2 px-3 text-left border-l border-[#E0D9CB] dark:border-[#243628] w-28 font-mono">مدين</th>
                <th className="py-2 px-3 text-left border-l border-[#E0D9CB] dark:border-[#243628] w-28 font-mono">دائن</th>
                <th className="py-2 px-3 text-left border-l border-[#E0D9CB] dark:border-[#243628] w-28 font-mono">مدين</th>
                <th className="py-2 px-3 text-left border-l border-[#E0D9CB] dark:border-[#243628] w-28 font-mono">دائن</th>
                <th className="py-2 px-3 text-left border-l border-[#E0D9CB] dark:border-[#243628] w-28 font-mono">مدين</th>
                <th className="py-2 px-3 text-left w-28 font-mono">دائن</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CB]/50 dark:divide-[#243628]/50">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#5C665E]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#059669]" />
                      <span className="font-bold text-xs">{t('جارٍ تجميع ومطابقة ميزان المراجعة...', 'Aggregating trial balance movements...')}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#5C665E]">
                    <span className="font-bold">{t('لا توجد حسابات أو حركات مطابقة لمعايير البحث.', 'No matching accounts found.')}</span>
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const isMajor = item.level <= 2;
                  const isSub = item.level === 3;

                  return (
                    <tr
                      key={item.accountCode}
                      className={`transition-colors hover:bg-emerald-500/5 ${
                        isMajor
                          ? 'bg-[#FBF9F5] dark:bg-[#1B271D] font-black text-[#1A241C] dark:text-[#F3EFE6]'
                          : isSub
                          ? 'font-bold text-[#1A241C] dark:text-[#EAE4D7]'
                          : 'text-[#3E4A41] dark:text-[#C5D2C7]'
                      }`}
                    >
                      {/* Code */}
                      <td className="py-2.5 px-3 border-l border-[#E0D9CB]/50 dark:border-[#243628]/50 font-mono text-xs">
                        <span className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {item.accountCode}
                        </span>
                      </td>

                      {/* Name with indentation based on level */}
                      <td className="py-2.5 px-3 border-l border-[#E0D9CB]/50 dark:border-[#243628]/50">
                        <div
                          className="flex items-center gap-1.5"
                          style={{ paddingRight: `${Math.max(0, item.level - 1) * 14}px` }}
                        >
                          {item.level > 1 && (
                            <span className="text-gray-300 dark:text-gray-600 font-mono text-[10px]">↳</span>
                          )}
                          <span>{item.accountNameAr}</span>
                        </div>
                      </td>

                      {/* Level Badge */}
                      <td className="py-2.5 px-2 text-center border-l border-[#E0D9CB]/50 dark:border-[#243628]/50">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                            item.level === 1
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : item.level === 2
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : item.level === 3
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                          }`}
                        >
                          م{item.level}
                        </span>
                      </td>

                      {/* Opening Debit */}
                      <td className="py-2.5 px-3 text-left border-l border-[#E0D9CB]/50 dark:border-[#243628]/50 font-mono">
                        {formatEGP(item.openingDebit, false)}
                      </td>

                      {/* Opening Credit */}
                      <td className="py-2.5 px-3 text-left border-l border-[#E0D9CB]/50 dark:border-[#243628]/50 font-mono">
                        {formatEGP(item.openingCredit, false)}
                      </td>

                      {/* Period Debit */}
                      <td className="py-2.5 px-3 text-left border-l border-[#E0D9CB]/50 dark:border-[#243628]/50 font-mono font-bold text-blue-700 dark:text-blue-300">
                        {formatEGP(item.periodDebit, false)}
                      </td>

                      {/* Period Credit */}
                      <td className="py-2.5 px-3 text-left border-l border-[#E0D9CB]/50 dark:border-[#243628]/50 font-mono font-bold text-amber-700 dark:text-amber-300">
                        {formatEGP(item.periodCredit, false)}
                      </td>

                      {/* Ending Debit */}
                      <td className="py-2.5 px-3 text-left border-l border-[#E0D9CB]/50 dark:border-[#243628]/50 font-mono font-black text-emerald-800 dark:text-emerald-300">
                        {formatEGP(item.endingDebit, false)}
                      </td>

                      {/* Ending Credit */}
                      <td className="py-2.5 px-3 text-left font-mono font-black text-emerald-800 dark:text-emerald-300">
                        {formatEGP(item.endingCredit, false)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Table Footer - Grand Totals */}
            {data && (
              <tfoot>
                <tr className="border-t-2 border-[#1A241C] dark:border-[#F3EFE6] bg-[#EAE4D7] dark:bg-[#1D2B20] font-black text-[#1A241C] dark:text-[#F3EFE6] text-xs">
                  <td colSpan={3} className="py-3 px-3 text-center border-l border-[#E0D9CB] dark:border-[#243628]">
                    <span>{t('الإجمالي العام لميزان المراجعة', 'Grand Total Equilibrium Sum')}</span>
                  </td>
                  <td className="py-3 px-3 text-left border-l border-[#E0D9CB] dark:border-[#243628] font-mono">
                    {formatEGP(data.totalOpeningDebit)}
                  </td>
                  <td className="py-3 px-3 text-left border-l border-[#E0D9CB] dark:border-[#243628] font-mono">
                    {formatEGP(data.totalOpeningCredit)}
                  </td>
                  <td className="py-3 px-3 text-left border-l border-[#E0D9CB] dark:border-[#243628] font-mono text-blue-800 dark:text-blue-300">
                    {formatEGP(data.totalPeriodDebit)}
                  </td>
                  <td className="py-3 px-3 text-left border-l border-[#E0D9CB] dark:border-[#243628] font-mono text-amber-800 dark:text-amber-300">
                    {formatEGP(data.totalPeriodCredit)}
                  </td>
                  <td className="py-3 px-3 text-left border-l border-[#E0D9CB] dark:border-[#243628] font-mono text-emerald-800 dark:text-emerald-300">
                    {formatEGP(data.totalEndingDebit)}
                  </td>
                  <td className="py-3 px-3 text-left font-mono text-emerald-800 dark:text-emerald-300">
                    {formatEGP(data.totalEndingCredit)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Official Print Preview Modal */}
      <ReportPrintLayout
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        titleAr={`ميزان المراجعة بالأرصدة والمجاميع (المستوى ${selectedLevel})`}
        titleEn={`5-Level Trial Balance Report (Level ${selectedLevel})`}
        periodText={`من ${startDate} إلى ${endDate}`}
        filterText={
          selectedCostCenter
            ? `مركز التكلفة: ${costCenters.find(c => String(c.id) === String(selectedCostCenter))?.nameAr || selectedCostCenter}`
            : 'جميع مراكز التكلفة'
        }
      >
        <div className="space-y-4">
          {/* Printable Balance Confirmation Header */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-gray-300 text-xs font-bold print:border-black">
            <span>
              حالة اتزان الميزان: {isBalanced ? 'متزن بنجاح (الفرق = 0.00 جم)' : `غير متزن (الفرق = ${formatEGP(diff)} جم)`}
            </span>
            <span>عدد الحسابات المندرجة: {filteredItems.length}</span>
          </div>

          {/* Printable Table */}
          <table className="w-full text-right border-collapse text-[10px] print:text-[9px]">
            <thead>
              <tr className="border-b-2 border-black bg-gray-100 print:bg-gray-200 font-black">
                <th className="py-1 px-1 border border-black w-20">كود الحساب</th>
                <th className="py-1 px-1 border border-black">اسم الحساب</th>
                <th className="py-1 px-1 border border-black text-center w-12">المستوى</th>
                <th className="py-1 px-1 border border-black text-left w-20">أول المدة (مدين)</th>
                <th className="py-1 px-1 border border-black text-left w-20">أول المدة (دائن)</th>
                <th className="py-1 px-1 border border-black text-left w-20">حركات (مدين)</th>
                <th className="py-1 px-1 border border-black text-left w-20">حركات (دائن)</th>
                <th className="py-1 px-1 border border-black text-left w-20">ختامي (مدين)</th>
                <th className="py-1 px-1 border border-black text-left w-20">ختامي (دائن)</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr
                  key={item.accountCode}
                  className={`border-b border-gray-300 print:border-black ${
                    item.level <= 2 ? 'font-black bg-gray-50' : ''
                  }`}
                >
                  <td className="py-1 px-1 border border-gray-300 print:border-black font-mono">{item.accountCode}</td>
                  <td className="py-1 px-1 border border-gray-300 print:border-black">
                    <span style={{ paddingRight: `${Math.max(0, item.level - 1) * 8}px` }}>
                      {item.accountNameAr}
                    </span>
                  </td>
                  <td className="py-1 px-1 border border-gray-300 print:border-black text-center font-mono">م{item.level}</td>
                  <td className="py-1 px-1 border border-gray-300 print:border-black text-left font-mono">{formatEGP(item.openingDebit, false)}</td>
                  <td className="py-1 px-1 border border-gray-300 print:border-black text-left font-mono">{formatEGP(item.openingCredit, false)}</td>
                  <td className="py-1 px-1 border border-gray-300 print:border-black text-left font-mono">{formatEGP(item.periodDebit, false)}</td>
                  <td className="py-1 px-1 border border-gray-300 print:border-black text-left font-mono">{formatEGP(item.periodCredit, false)}</td>
                  <td className="py-1 px-1 border border-gray-300 print:border-black text-left font-mono">{formatEGP(item.endingDebit, false)}</td>
                  <td className="py-1 px-1 border border-gray-300 print:border-black text-left font-mono">{formatEGP(item.endingCredit, false)}</td>
                </tr>
              ))}
            </tbody>
            {data && (
              <tfoot>
                <tr className="border-t-2 border-black bg-gray-200 print:bg-gray-300 font-black">
                  <td colSpan={3} className="py-1.5 px-2 text-center border border-black">الإجمالي العام</td>
                  <td className="py-1.5 px-1 border border-black text-left font-mono">{formatEGP(data.totalOpeningDebit)}</td>
                  <td className="py-1.5 px-1 border border-black text-left font-mono">{formatEGP(data.totalOpeningCredit)}</td>
                  <td className="py-1.5 px-1 border border-black text-left font-mono">{formatEGP(data.totalPeriodDebit)}</td>
                  <td className="py-1.5 px-1 border border-black text-left font-mono">{formatEGP(data.totalPeriodCredit)}</td>
                  <td className="py-1.5 px-1 border border-black text-left font-mono">{formatEGP(data.totalEndingDebit)}</td>
                  <td className="py-1.5 px-1 border border-black text-left font-mono">{formatEGP(data.totalEndingCredit)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </ReportPrintLayout>
    </div>
  );
};
