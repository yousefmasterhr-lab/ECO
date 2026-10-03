import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useFinancial } from '../../../context/FinancialContext';
import { useDatabase } from '../../../services/federation/DatabaseContext';
import { getFiscalDateRange } from '../../../utils/fiscalYearHelper';
import { IncomeStatementReportData, FinancialStatementLine } from '../../../services/database/types';
import { ReportPrintLayout } from './ReportPrintLayout';
import { exportToCsv, formatEGP } from '../../../utils/exportUtils';
import { toast } from '@erp/ui-system';
import { FinancialToken } from '../../common/FinancialToken';
import {
  TrendingUp,
  Calendar,
  RefreshCw,
  Printer,
  Download,
  Percent,
  DollarSign,
  Briefcase,
  PieChart,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

export const IncomeStatementReport: React.FC = () => {
  const { t } = useLanguage();
  const { activeDatabase } = useDatabase();
  const { fetchIncomeStatement } = useFinancial();

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<IncomeStatementReportData | null>(null);

  const initialRange = useMemo(() => getFiscalDateRange(activeDatabase), [activeDatabase]);
  const [startDate, setStartDate] = useState<string>(() => initialRange.startDate);
  const [endDate, setEndDate] = useState<string>(() => initialRange.endDate);

  // Sync dates when activeDatabase changes
  useEffect(() => {
    const range = getFiscalDateRange(activeDatabase);
    setStartDate(range.startDate);
    setEndDate(range.endDate);
  }, [activeDatabase]);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchIncomeStatement(startDate || undefined, endDate || undefined);
      setData(res);
    } catch (err) {
      console.error('Failed to load income statement:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchIncomeStatement, startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Export to CSV
  const handleExportCsv = () => {
    if (!data) return;
    const headers = ['البند المالي', 'المبلغ (جم)', 'النسبة من الإيرادات (%)'];
    const rows: (string | number)[][] = [];

    // Revenues
    rows.push(['--- الإيرادات التشغيلية ---', '', '']);
    data.operatingRevenues.forEach(line => {
      rows.push([line.titleAr, line.amount, line.percentage ? `${line.percentage}%` : '']);
    });
    rows.push(['إجمالي الإيرادات التشغيلية', data.totalOperatingRevenues, '100%']);

    // Cost of Revenues
    rows.push(['--- تكلفة الإيرادات والعقود ---', '', '']);
    data.costOfRevenues.forEach(line => {
      rows.push([line.titleAr, line.amount, line.percentage ? `${line.percentage}%` : '']);
    });
    rows.push(['إجمالي تكلفة الإيرادات', data.totalCostOfRevenues, `${((data.totalCostOfRevenues / (data.totalOperatingRevenues || 1)) * 100).toFixed(1)}%`]);

    // Gross Profit
    rows.push(['مجمل الربح', data.grossProfit, `${data.grossMarginPercent}%`]);

    // Expenses
    rows.push(['--- المصروفات العمومية والإدارية ---', '', '']);
    data.operatingExpenses.forEach(line => {
      rows.push([line.titleAr, line.amount, line.percentage ? `${line.percentage}%` : '']);
    });
    rows.push(['إجمالي المصروفات العمومية والإدارية', data.totalOperatingExpenses, `${((data.totalOperatingExpenses / (data.totalOperatingRevenues || 1)) * 100).toFixed(1)}%`]);

    // Operating Profit
    rows.push(['صافي الربح التشغيلي قبل الضريبة', data.operatingProfit, `${data.operatingMarginPercent}%`]);

    // Tax & Net
    rows.push(['مخصص ضريبة الدخل المقدرة', data.estimatedTax, '']);
    rows.push(['صافي أرباح العام بعد الضريبة', data.netProfitAfterTax, `${data.netMarginPercent}%`]);

    exportToCsv(`قائمة_الدخل_والأرباح_والخسائر_${endDate}`, headers, rows);
    toast.success(
      t('تم تصدير قائمة الدخل بنجاح', 'Income statement exported successfully'),
      `${t('الفترة حتى', 'Period up to')} ${endDate}`
    );
  };

  const renderSectionRows = (
    lines: FinancialStatementLine[],
    baseRevenue: number
  ) => {
    return lines.map((line, idx) => {
      const pct = baseRevenue > 0 ? ((line.amount / baseRevenue) * 100).toFixed(1) : '0.0';
      return (
        <tr
          key={idx}
          className="border-b border-[#E0D9CB]/40 dark:border-[#243628]/40 hover:bg-emerald-500/5 transition-colors"
        >
          <td className="py-2.5 px-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs">•</span>
              <span className="font-bold text-[#1A241C] dark:text-[#EAE4D7]">{line.titleAr}</span>
            </div>
          </td>
          <td className="py-2.5 px-4 text-left font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6]">
            {formatEGP(line.amount)}
          </td>
          <td className="py-2.5 px-4 text-center font-mono text-xs text-[#5C665E] dark:text-[#8FA392]">
            <div className="flex items-center justify-center gap-2">
              <div className="w-16 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, Number(pct)))}%` }}
                />
              </div>
              <span className="w-10 text-right">{pct}%</span>
            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Filter and Actions Toolbar */}
      <div className="bg-white dark:bg-[#17231A] rounded-3xl border border-[#E0D9CB] dark:border-[#243628] p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Header Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-[#059669] flex items-center justify-center border border-emerald-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
                <span>{t('قائمة الدخل والأرباح والخسائر', 'Income Statement / P&L')}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                  {data?.periodName || 'الفترة المالية 2023'}
                </span>
              </h2>
              <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                {t(
                  'بيان دوري لحساب الإيرادات المحققة وتكاليف العمليات وصافي هوامش الربحية',
                  'Periodic statement of recognized revenue, operational costs, and net margins'
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
              disabled={loading || !data}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#1F2E23] hover:bg-[#EAE4D7] dark:hover:bg-[#253929] text-[#1A241C] dark:text-[#F3EFE6] transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('تصدير Excel (CSV)', 'Export CSV')}</span>
            </button>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              disabled={loading || !data}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-[#D99B26] hover:bg-[#C58F38] text-[#0E1610] shadow-md shadow-amber-900/20 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('طباعة رسمية', 'Official Print')}</span>
            </button>
          </div>
        </div>

        {/* Date Filter Bar */}
        <div className="mt-5 pt-4 border-t border-[#E0D9CB]/60 dark:border-[#243628] flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#5C665E] dark:text-[#8FA392] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#059669]" />
              {t('من تاريخ:', 'From:')}
            </span>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="h-9 px-3 rounded-xl text-xs font-mono font-bold border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#121A13] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#059669] focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#5C665E] dark:text-[#8FA392] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#059669]" />
              {t('إلى تاريخ:', 'To:')}
            </span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="h-9 px-3 rounded-xl text-xs font-mono font-bold border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#121A13] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#059669] focus:outline-hidden"
            />
          </div>

          {/* Quick Period Buttons */}
          <div className="flex items-center gap-1 mr-auto">
            <button
              onClick={() => {
                const yr = endDate.slice(0, 4) || '2026';
                setStartDate(`${yr}-01-01`);
                setEndDate(`${yr}-12-31`);
              }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-[#E0D9CB] dark:border-[#243628] hover:bg-[#EAE4D7] dark:hover:bg-[#1E2E21] cursor-pointer"
            >
              العام المالي {endDate.slice(0, 4) || '2026'}
            </button>
            <button
              onClick={() => {
                const yr = endDate.slice(0, 4) || '2026';
                setStartDate(`${yr}-07-01`);
                setEndDate(`${yr}-12-31`);
              }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-[#E0D9CB] dark:border-[#243628] hover:bg-[#EAE4D7] dark:hover:bg-[#1E2E21] cursor-pointer"
            >
              النصف الثاني (H2)
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Overview */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Net Revenues */}
          <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">
              <span>{t('إجمالي الإيرادات التشغيلية', 'Total Revenue')}</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="whitespace-nowrap">
              <FinancialToken amount={data.totalOperatingRevenues} size="xl" />
            </div>
            <div className="mt-2 text-[11px] font-bold text-emerald-600 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>مستخلصات المقاولات والمبيعات</span>
            </div>
          </div>

          {/* Gross Profit & Margin */}
          <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">
              <span>{t('مجمل الربح (Gross Profit)', 'Gross Profit')}</span>
              <Percent className="w-4 h-4 text-blue-500" />
            </div>
            <div className="whitespace-nowrap">
              <FinancialToken
                amount={data.grossProfit}
                size="xl"
                amountClassName="text-blue-800 dark:text-blue-300"
              />
            </div>
            <div className="mt-2 text-[11px] font-bold text-blue-600 flex items-center gap-1">
              <span dir="ltr">هامش مجمل الربح: {data.grossMarginPercent}%</span>
            </div>
          </div>

          {/* Operating Profit */}
          <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">
              <span>{t('الربح التشغيلي قبل الضريبة', 'Operating Profit (EBIT)')}</span>
              <Briefcase className="w-4 h-4 text-amber-500" />
            </div>
            <div className="whitespace-nowrap">
              <FinancialToken
                amount={data.operatingProfit}
                size="xl"
                amountClassName="text-amber-800 dark:text-amber-300"
              />
            </div>
            <div className="mt-2 text-[11px] font-bold text-amber-600 flex items-center gap-1">
              <span dir="ltr">الهامش التشغيلي: {data.operatingMarginPercent}%</span>
            </div>
          </div>

          {/* Net Profit After Tax */}
          <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/20 shadow-xs">
            <div className="flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 mb-1 font-bold">
              <span>{t('صافي أرباح العام بعد الضريبة', 'Net Profit After Tax')}</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="whitespace-nowrap">
              <FinancialToken
                amount={data.netProfitAfterTax}
                size="xl"
                amountClassName="text-emerald-800 dark:text-emerald-300"
              />
            </div>
            <div className="mt-2 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <span dir="ltr">صافي العائد النهائي: {data.netMarginPercent}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Income Statement Table */}
      <div className="bg-white dark:bg-[#17231A] rounded-3xl border border-[#E0D9CB] dark:border-[#243628] shadow-xs overflow-hidden">
        <div className="p-4 bg-[#FBF9F5] dark:bg-[#1D2B20] border-b border-[#E0D9CB] dark:border-[#243628] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#059669]" />
            <h3 className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6]">
              {t('بيان قائمة الدخل التفصيلي المقارن', 'Detailed Comparative Income Statement Table')}
            </h3>
          </div>
          <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
            جميع المبالغ موضحة بالجنيه المصري (EGP)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E0D9CB] dark:border-[#243628] bg-[#F4EFE6] dark:bg-[#1A271C] font-black text-[#1A241C] dark:text-[#F3EFE6]">
                <th className="py-3 px-4 w-1/2">{t('البيان المحاسبي / البند المالي', 'Financial Line Item')}</th>
                <th className="py-3 px-4 text-left w-1/4 font-mono">{t('المبلغ الحالي (جم)', 'Amount (EGP)')}</th>
                <th className="py-3 px-4 text-center w-1/4 font-mono">{t('النسبة من الإيرادات', '% of Revenue')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CB]/50 dark:divide-[#243628]/50">
              {loading || !data ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-[#5C665E]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#059669]" />
                      <span className="font-bold text-xs">{t('جارٍ احتساب نتائج الأعمال وقائمة الدخل...', 'Computing income statement...')}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {/* SECTION 1: OPERATING REVENUES */}
                  <tr className="bg-emerald-500/10 font-black text-emerald-950 dark:text-emerald-200">
                    <td colSpan={3} className="py-2.5 px-4 text-xs">
                      1. الإيرادات التشغيلية (Operating Revenues)
                    </td>
                  </tr>
                  {renderSectionRows(data.operatingRevenues, data.totalOperatingRevenues)}
                  <tr className="bg-[#FBF9F5] dark:bg-[#1D2B20] font-black text-[#1A241C] dark:text-[#F3EFE6] border-b-2 border-emerald-500/30">
                    <td className="py-2.5 px-4">إجمالي الإيرادات التشغيلية</td>
                    <td className="py-2.5 px-4 text-left font-mono text-emerald-800 dark:text-emerald-300">
                      {formatEGP(data.totalOperatingRevenues)}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold">100.0%</td>
                  </tr>

                  {/* SECTION 2: COST OF REVENUES */}
                  <tr className="bg-rose-500/10 font-black text-rose-950 dark:text-rose-200">
                    <td colSpan={3} className="py-2.5 px-4 text-xs">
                      2. (-) تكلفة الإيرادات والعقود (Cost of Revenues & Contracts)
                    </td>
                  </tr>
                  {renderSectionRows(data.costOfRevenues, data.totalOperatingRevenues)}
                  <tr className="bg-[#FBF9F5] dark:bg-[#1D2B20] font-black text-[#1A241C] dark:text-[#F3EFE6] border-b-2 border-rose-500/30">
                    <td className="py-2.5 px-4">إجمالي تكلفة الإيرادات</td>
                    <td className="py-2.5 px-4 text-left font-mono text-rose-800 dark:text-rose-300">
                      ({formatEGP(data.totalCostOfRevenues)})
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-rose-600">
                      {((data.totalCostOfRevenues / (data.totalOperatingRevenues || 1)) * 100).toFixed(1)}%
                    </td>
                  </tr>

                  {/* SECTION 3: GROSS PROFIT */}
                  <tr className="bg-blue-500/15 dark:bg-blue-950/40 font-black text-blue-950 dark:text-blue-200 border-y-2 border-blue-500/40">
                    <td className="py-3 px-4 text-sm">(=) مجمل الربح (Gross Profit)</td>
                    <td className="py-3 px-4 text-left font-mono text-sm text-blue-800 dark:text-blue-300">
                      {formatEGP(data.grossProfit)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-sm font-black text-blue-800 dark:text-blue-300">
                      {data.grossMarginPercent}%
                    </td>
                  </tr>

                  {/* SECTION 4: OPERATING EXPENSES */}
                  <tr className="bg-amber-500/10 font-black text-amber-950 dark:text-amber-200">
                    <td colSpan={3} className="py-2.5 px-4 text-xs">
                      3. (-) المصروفات العمومية والإدارية والتسويقية (Operating Expenses)
                    </td>
                  </tr>
                  {renderSectionRows(data.operatingExpenses, data.totalOperatingRevenues)}
                  <tr className="bg-[#FBF9F5] dark:bg-[#1D2B20] font-black text-[#1A241C] dark:text-[#F3EFE6] border-b-2 border-amber-500/30">
                    <td className="py-2.5 px-4">إجمالي المصروفات الإدارية والتشغيلية</td>
                    <td className="py-2.5 px-4 text-left font-mono text-amber-800 dark:text-amber-300">
                      ({formatEGP(data.totalOperatingExpenses)})
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-amber-600">
                      {((data.totalOperatingExpenses / (data.totalOperatingRevenues || 1)) * 100).toFixed(1)}%
                    </td>
                  </tr>

                  {/* SECTION 5: OPERATING PROFIT (EBIT) */}
                  <tr className="bg-emerald-500/15 dark:bg-emerald-950/40 font-black text-emerald-950 dark:text-emerald-200 border-y-2 border-emerald-500/40">
                    <td className="py-3 px-4 text-sm">(=) صافي الربح التشغيلي قبل الضريبة (EBIT)</td>
                    <td className="py-3 px-4 text-left font-mono text-sm text-emerald-800 dark:text-emerald-300">
                      {formatEGP(data.operatingProfit)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-sm font-black text-emerald-800 dark:text-emerald-300">
                      {data.operatingMarginPercent}%
                    </td>
                  </tr>

                  {/* SECTION 6: TAXATION */}
                  <tr className="border-b border-[#E0D9CB]/60 dark:border-[#243628]">
                    <td className="py-2.5 px-4 font-bold text-[#5C665E] dark:text-[#8FA392]">
                      (-) مخصص ضريبة الدخل المقدرة (22.5%)
                    </td>
                    <td className="py-2.5 px-4 text-left font-mono font-bold text-rose-700 dark:text-rose-400">
                      ({formatEGP(data.estimatedTax)})
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono text-gray-500">
                      {data.operatingProfit > 0 ? '22.5%' : '0.0%'}
                    </td>
                  </tr>

                  {/* SECTION 7: FINAL NET INCOME */}
                  <tr className="bg-emerald-600 text-white font-black text-sm border-t-2 border-emerald-700">
                    <td className="py-3.5 px-4">(=) صافي أرباح العام النهائي بعد الضريبة (Net Income)</td>
                    <td className="py-3.5 px-4 text-left font-mono text-base font-black whitespace-nowrap" dir="ltr">
                      {formatEGP(data.netProfitAfterTax)} <span className="text-xs">ج.م</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-base font-black">
                      {data.netMarginPercent}%
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Print Preview Modal */}
      <ReportPrintLayout
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        titleAr="قائمة الدخل والأرباح والخسائر الرسمية"
        titleEn="Official Statement of Profit and Loss (Income Statement)"
        periodText={`من ${startDate} إلى ${endDate}`}
        subtitleAr="وفقاً لمعايير المحاسبة المعتمدة وقوانين الضرائب المصرية"
      >
        {data && (
          <div className="space-y-4">
            <table className="w-full text-right border-collapse text-xs print:text-[10px]">
              <thead>
                <tr className="border-b-2 border-black bg-gray-100 print:bg-gray-200 font-black">
                  <th className="py-1.5 px-2 border border-black">البيان المحاسبي</th>
                  <th className="py-1.5 px-2 border border-black text-left w-36">المبلغ (جم)</th>
                  <th className="py-1.5 px-2 border border-black text-center w-24">النسبة %</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-50 font-black border border-black">
                  <td colSpan={3} className="py-1 px-2">أولاً: الإيرادات التشغيلية</td>
                </tr>
                {data.operatingRevenues.map((l, i) => (
                  <tr key={i} className="border-b border-gray-300">
                    <td className="py-1 px-3 border border-gray-300">• {l.titleAr}</td>
                    <td className="py-1 px-2 border border-gray-300 text-left font-mono">{formatEGP(l.amount)}</td>
                    <td className="py-1 px-2 border border-gray-300 text-center font-mono">
                      {data.totalOperatingRevenues > 0 ? `${((l.amount / data.totalOperatingRevenues) * 100).toFixed(1)}%` : '0.0%'}
                    </td>
                  </tr>
                ))}
                <tr className="font-black bg-gray-100 border border-black">
                  <td className="py-1 px-2 border border-black">إجمالي الإيرادات</td>
                  <td className="py-1 px-2 border border-black text-left font-mono">{formatEGP(data.totalOperatingRevenues)}</td>
                  <td className="py-1 px-2 border border-black text-center font-mono">100.0%</td>
                </tr>

                <tr className="bg-gray-50 font-black border border-black">
                  <td colSpan={3} className="py-1 px-2">ثانياً: تكلفة الإيرادات والعقود</td>
                </tr>
                {data.costOfRevenues.map((l, i) => (
                  <tr key={i} className="border-b border-gray-300">
                    <td className="py-1 px-3 border border-gray-300">• {l.titleAr}</td>
                    <td className="py-1 px-2 border border-gray-300 text-left font-mono">({formatEGP(l.amount)})</td>
                    <td className="py-1 px-2 border border-gray-300 text-center font-mono">
                      {data.totalOperatingRevenues > 0 ? `${((l.amount / data.totalOperatingRevenues) * 100).toFixed(1)}%` : '0.0%'}
                    </td>
                  </tr>
                ))}
                <tr className="font-black bg-gray-100 border border-black">
                  <td className="py-1 px-2 border border-black">إجمالي التكاليف</td>
                  <td className="py-1 px-2 border border-black text-left font-mono">({formatEGP(data.totalCostOfRevenues)})</td>
                  <td className="py-1 px-2 border border-black text-center font-mono">
                    {((data.totalCostOfRevenues / (data.totalOperatingRevenues || 1)) * 100).toFixed(1)}%
                  </td>
                </tr>

                <tr className="font-black bg-gray-200 border-2 border-black">
                  <td className="py-1.5 px-2 border border-black">مجمل الربح (Gross Profit)</td>
                  <td className="py-1.5 px-2 border border-black text-left font-mono">{formatEGP(data.grossProfit)}</td>
                  <td className="py-1.5 px-2 border border-black text-center font-mono">{data.grossMarginPercent}%</td>
                </tr>

                <tr className="bg-gray-50 font-black border border-black">
                  <td colSpan={3} className="py-1 px-2">ثالثاً: المصروفات العمومية والإدارية</td>
                </tr>
                {data.operatingExpenses.map((l, i) => (
                  <tr key={i} className="border-b border-gray-300">
                    <td className="py-1 px-3 border border-gray-300">• {l.titleAr}</td>
                    <td className="py-1 px-2 border border-gray-300 text-left font-mono">({formatEGP(l.amount)})</td>
                    <td className="py-1 px-2 border border-gray-300 text-center font-mono">
                      {data.totalOperatingRevenues > 0 ? `${((l.amount / data.totalOperatingRevenues) * 100).toFixed(1)}%` : '0.0%'}
                    </td>
                  </tr>
                ))}
                <tr className="font-black bg-gray-100 border border-black">
                  <td className="py-1 px-2 border border-black">إجمالي المصروفات</td>
                  <td className="py-1 px-2 border border-black text-left font-mono">({formatEGP(data.totalOperatingExpenses)})</td>
                  <td className="py-1 px-2 border border-black text-center font-mono">
                    {((data.totalOperatingExpenses / (data.totalOperatingRevenues || 1)) * 100).toFixed(1)}%
                  </td>
                </tr>

                <tr className="font-black bg-gray-200 border-2 border-black">
                  <td className="py-1.5 px-2 border border-black">صافي الربح التشغيلي قبل الضريبة</td>
                  <td className="py-1.5 px-2 border border-black text-left font-mono">{formatEGP(data.operatingProfit)}</td>
                  <td className="py-1.5 px-2 border border-black text-center font-mono">{data.operatingMarginPercent}%</td>
                </tr>

                <tr className="border border-black">
                  <td className="py-1 px-2 border border-black">مخصص ضريبة الدخل (22.5%)</td>
                  <td className="py-1 px-2 border border-black text-left font-mono">({formatEGP(data.estimatedTax)})</td>
                  <td className="py-1 px-2 border border-black text-center font-mono">---</td>
                </tr>

                <tr className="font-black bg-black text-white print:bg-black print:text-white border-2 border-black">
                  <td className="py-2 px-2 border border-black text-sm">صافي أرباح العام بعد الضريبة</td>
                  <td className="py-2 px-2 border border-black text-left font-mono text-sm whitespace-nowrap" dir="ltr">{formatEGP(data.netProfitAfterTax)} ج.م</td>
                  <td className="py-2 px-2 border border-black text-center font-mono text-sm">{data.netMarginPercent}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </ReportPrintLayout>
    </div>
  );
};
