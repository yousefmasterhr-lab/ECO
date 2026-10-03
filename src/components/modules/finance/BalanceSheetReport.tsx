import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useFinancial } from '../../../context/FinancialContext';
import { useDatabase } from '../../../services/federation/DatabaseContext';
import { getFiscalDateRange } from '../../../utils/fiscalYearHelper';
import { BalanceSheetReportData, BalanceSheetSection } from '../../../services/database/types';
import { ReportPrintLayout } from './ReportPrintLayout';
import { exportToCsv, formatEGP } from '../../../utils/exportUtils';
import { toast } from '@erp/ui-system';
import {
  Landmark,
  Calendar,
  RefreshCw,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  Coins,
  Shield
} from 'lucide-react';

export const BalanceSheetReport: React.FC = () => {
  const { t } = useLanguage();
  const { activeDatabase } = useDatabase();
  const { fetchBalanceSheet } = useFinancial();

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<BalanceSheetReportData | null>(null);

  const initialRange = useMemo(() => getFiscalDateRange(activeDatabase), [activeDatabase]);
  const [asOfDate, setAsOfDate] = useState<string>(() => initialRange.asOfDate);

  // Sync date when activeDatabase changes
  useEffect(() => {
    const range = getFiscalDateRange(activeDatabase);
    setAsOfDate(range.asOfDate);
  }, [activeDatabase]);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchBalanceSheet(asOfDate || undefined);
      setData(res);
    } catch (err) {
      console.error('Failed to load balance sheet:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchBalanceSheet, asOfDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Export to CSV
  const handleExportCsv = () => {
    if (!data) return;
    const headers = ['القسم المالي / البند', 'المبلغ (جم)'];
    const rows: (string | number)[][] = [];

    // Assets
    rows.push(['=== جانب الأصول (ASSETS) ===', '']);
    rows.push(['--- أصول متداولة (Current Assets) ---', '']);
    data.currentAssets.lines.forEach(l => rows.push([l.titleAr, l.amount]));
    rows.push(['إجمالي الأصول المتداولة', data.currentAssets.total]);

    rows.push(['--- أصول غير متداولة (Non-Current Assets) ---', '']);
    data.nonCurrentAssets.lines.forEach(l => rows.push([l.titleAr, l.amount]));
    rows.push(['إجمالي الأصول غير المتداولة', data.nonCurrentAssets.total]);
    rows.push(['إجمالي جانب الأصول', data.totalAssets]);

    // Liabilities
    rows.push(['=== جانب الخصوم والالتزامات (LIABILITIES) ===', '']);
    rows.push(['--- خصوم متداولة (Current Liabilities) ---', '']);
    data.currentLiabilities.lines.forEach(l => rows.push([l.titleAr, l.amount]));
    rows.push(['إجمالي الخصوم المتداولة', data.currentLiabilities.total]);

    rows.push(['--- خصوم غير متداولة (Non-Current Liabilities) ---', '']);
    data.nonCurrentLiabilities.lines.forEach(l => rows.push([l.titleAr, l.amount]));
    rows.push(['إجمالي الخصوم غير المتداولة', data.nonCurrentLiabilities.total]);
    rows.push(['إجمالي الخصوم', data.totalLiabilities]);

    // Equity
    rows.push(['=== حقوق الملكية (SHAREHOLDERS EQUITY) ===', '']);
    data.equity.lines.forEach(l => rows.push([l.titleAr, l.amount]));
    rows.push(['إجمالي حقوق الملكية', data.totalEquity]);

    rows.push(['إجمالي الخصوم وحقوق الملكية', data.totalLiabilitiesAndEquity]);
    rows.push(['فارق الاتزان', data.difference]);

    exportToCsv(`قائمة_المركز_المالي_الميزانية_العمومية_${asOfDate}`, headers, rows);
    toast.success(
      t('تم تصدير الميزانية العمومية بنجاح', 'Balance sheet exported successfully'),
      `${t('كما في', 'As of')} ${asOfDate}`
    );
  };

  const isBalanced = data?.isBalanced ?? true;
  const diff = data?.difference ?? 0;

  const renderSectionTable = (section: BalanceSheetSection, bgBadge: string) => {
    return (
      <div className="space-y-1">
        <div className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center justify-between ${bgBadge}`}>
          <span>{section.titleAr}</span>
          <span className="font-mono">{formatEGP(section.total)} جم</span>
        </div>
        <table className="w-full text-right text-xs">
          <tbody className="divide-y divide-gray-100 dark:divide-[#243628]/40">
            {section.lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-emerald-500/5 transition-colors">
                <td className="py-2 px-3 text-[#3E4A41] dark:text-[#C5D2C7] font-medium">
                  <span className="text-gray-400 text-xs ml-1.5">•</span>
                  {line.titleAr}
                </td>
                <td className="py-2 px-3 text-left font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6] w-36">
                  {formatEGP(line.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Filter and Actions Toolbar */}
      <div className="bg-white dark:bg-[#17231A] rounded-3xl border border-[#E0D9CB] dark:border-[#243628] p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Header Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-[#059669] flex items-center justify-center border border-emerald-500/20">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
                <span>{t('الميزانية العمومية والمركز المالي', 'Balance Sheet & Financial Position')}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                  {t('حتى تاريخ', 'As of')} {asOfDate}
                </span>
              </h2>
              <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                {t(
                  'تحقق من معادلة المركز المالي: الأصول = الالتزامات + حقوق الملكية',
                  'Validation of fundamental accounting equation: Assets = Liabilities + Equity'
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

        {/* As of Date Bar */}
        <div className="mt-5 pt-4 border-t border-[#E0D9CB]/60 dark:border-[#243628] flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#5C665E] dark:text-[#8FA392] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#059669]" />
              {t('تاريخ المركز المالي (Cut-off Date):', 'Cut-off Date:')}
            </span>
            <input
              type="date"
              value={asOfDate}
              onChange={e => setAsOfDate(e.target.value)}
              className="h-9 px-3 rounded-xl text-xs font-mono font-bold border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#121A13] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#059669] focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1 mr-auto">
            <button
              onClick={() => setAsOfDate(`${asOfDate.slice(0, 4) || '2026'}-12-31`)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-[#E0D9CB] dark:border-[#243628] hover:bg-[#EAE4D7] dark:hover:bg-[#1E2E21] cursor-pointer"
            >
              إقفال 31 ديسمبر {asOfDate.slice(0, 4) || '2026'}
            </button>
            <button
              onClick={() => setAsOfDate(`${asOfDate.slice(0, 4) || '2026'}-06-30`)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-[#E0D9CB] dark:border-[#243628] hover:bg-[#EAE4D7] dark:hover:bg-[#1E2E21] cursor-pointer"
            >
              نصف سنوي (30 يونيو)
            </button>
          </div>
        </div>
      </div>

      {/* Accounting Equation Equilibrium Guard */}
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
                    ? t(
                        'معادلة الميزانية متزنة بنجاح: الأصول = الالتزامات + حقوق الملكية',
                        'Balance Sheet Equation Validated: Assets = Liabilities + Equity'
                      )
                    : t('تحذير ميزانية: يوجد اختلال في توازن المركز المالي!', 'Balance Sheet Imbalance Detected!')}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                    isBalanced
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white animate-pulse'
                  }`}
                >
                  {isBalanced ? 'فرق = 0.00 جم' : `فرق = ${formatEGP(diff)} جم`}
                </span>
              </div>
              <p className="text-xs opacity-80 mt-0.5">
                {isBalanced
                  ? t(
                      'إجمالي الأصول يطابق تماماً مجموع الالتزامات وحقوق المساهمين والأرباح المحققة.',
                      'Total Assets perfectly match total liabilities, shareholder equity, and retained earnings.'
                    )
                  : t(
                      'يرجى مراجعة قيود إقفال الأرباح والخسائر وحسابات الأستاذ العام.',
                      'Please verify profit and loss closing entries and general ledger postings.'
                    )}
              </p>
            </div>
          </div>

          {/* Quick Equilibrium Mini-Display */}
          {data && (
            <div className="flex items-center gap-2 text-xs font-mono font-black shrink-0 self-end md:self-auto">
              <div className="px-3 py-1.5 rounded-xl bg-white/70 dark:bg-black/20 border border-current/10">
                <span className="text-[10px] font-sans block opacity-70">إجمالي الأصول</span>
                <span>{formatEGP(data.totalAssets)} جم</span>
              </div>
              <span className="text-lg font-sans font-bold">=</span>
              <div className="px-3 py-1.5 rounded-xl bg-white/70 dark:bg-black/20 border border-current/10">
                <span className="text-[10px] font-sans block opacity-70">الخصوم + حقوق الملكية</span>
                <span>{formatEGP(data.totalLiabilitiesAndEquity)} جم</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dual Column Statement of Financial Position */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* RIGHT COLUMN: ASSETS (جانب الأصول) */}
          <div className="bg-white dark:bg-[#17231A] rounded-3xl border border-[#E0D9CB] dark:border-[#243628] shadow-xs overflow-hidden flex flex-col">
            <div className="p-4 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-950 dark:text-emerald-200">
                <Coins className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-black">
                  {t('جانب الأصول والموجودات (ASSETS)', 'Total Assets')}
                </h3>
              </div>
              <span className="text-xs font-mono font-black text-emerald-800 dark:text-emerald-300">
                {formatEGP(data.totalAssets)} جم
              </span>
            </div>

            <div className="p-5 space-y-6 flex-1">
              {/* Current Assets */}
              {renderSectionTable(
                data.currentAssets,
                'bg-blue-500/10 text-blue-950 dark:text-blue-200 border border-blue-500/20'
              )}

              {/* Non-Current Assets */}
              {renderSectionTable(
                data.nonCurrentAssets,
                'bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 border border-emerald-500/20'
              )}
            </div>

            {/* Total Assets Footnote */}
            <div className="p-4 bg-[#FBF9F5] dark:bg-[#1D2B20] border-t-2 border-emerald-500/30 flex items-center justify-between">
              <span className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6]">
                {t('مجموع الأصول (الأصول المتداولة + غير المتداولة):', 'Total Assets:')}
              </span>
              <span className="text-sm font-black font-mono text-emerald-800 dark:text-emerald-300">
                {formatEGP(data.totalAssets)} جم
              </span>
            </div>
          </div>

          {/* LEFT COLUMN: LIABILITIES & EQUITY (جانب الخصوم وحقوق الملكية) */}
          <div className="bg-white dark:bg-[#17231A] rounded-3xl border border-[#E0D9CB] dark:border-[#243628] shadow-xs overflow-hidden flex flex-col">
            <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-950 dark:text-amber-200">
                <Shield className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-black">
                  {t('الخصوم وحقوق الملكية (LIABILITIES & EQUITY)', 'Liabilities & Equity')}
                </h3>
              </div>
              <span className="text-xs font-mono font-black text-amber-800 dark:text-amber-300">
                {formatEGP(data.totalLiabilitiesAndEquity)} جم
              </span>
            </div>

            <div className="p-5 space-y-6 flex-1">
              {/* Current Liabilities */}
              {renderSectionTable(
                data.currentLiabilities,
                'bg-rose-500/10 text-rose-950 dark:text-rose-200 border border-rose-500/20'
              )}

              {/* Non-Current Liabilities */}
              {renderSectionTable(
                data.nonCurrentLiabilities,
                'bg-purple-500/10 text-purple-950 dark:text-purple-200 border border-purple-500/20'
              )}

              {/* Total Liabilities Summary */}
              <div className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-between text-xs font-bold">
                <span>إجمالي الخصوم والالتزامات</span>
                <span className="font-mono">{formatEGP(data.totalLiabilities)} جم</span>
              </div>

              {/* Shareholders Equity */}
              {renderSectionTable(
                data.equity,
                'bg-emerald-600/15 text-emerald-950 dark:text-emerald-200 border border-emerald-600/30'
              )}
            </div>

            {/* Total Liabilities & Equity Footnote */}
            <div className="p-4 bg-[#FBF9F5] dark:bg-[#1D2B20] border-t-2 border-amber-500/30 flex items-center justify-between">
              <span className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6]">
                {t('مجموع الخصوم وحقوق الملكية:', 'Total Liabilities & Equity:')}
              </span>
              <span className="text-sm font-black font-mono text-amber-800 dark:text-amber-300">
                {formatEGP(data.totalLiabilitiesAndEquity)} جم
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Official Print Preview Modal */}
      <ReportPrintLayout
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        titleAr="قائمة المركز المالي (الميزانية العمومية الرسمية)"
        titleEn="Official Statement of Financial Position (Balance Sheet)"
        periodText={`كما في ${asOfDate}`}
        subtitleAr="وفقاً لمعايير المحاسبة المصرية والدولية (EAS / IFRS)"
      >
        {data && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs print:text-[10px]">
              {/* Assets Print Column */}
              <div className="border border-black p-2 space-y-2">
                <div className="font-black bg-gray-200 p-1 border-b border-black text-center">
                  أولاً: جانب الأصول (Assets)
                </div>
                <div className="font-bold underline">الأصول المتداولة:</div>
                <table className="w-full">
                  <tbody>
                    {data.currentAssets.lines.map((l, i) => (
                      <tr key={i} className="border-b border-gray-200">
                        <td className="py-0.5">• {l.titleAr}</td>
                        <td className="py-0.5 text-left font-mono">{formatEGP(l.amount)}</td>
                      </tr>
                    ))}
                    <tr className="font-bold bg-gray-100">
                      <td>مجموع الأصول المتداولة</td>
                      <td className="text-left font-mono">{formatEGP(data.currentAssets.total)}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="font-bold underline pt-2">الأصول غير المتداولة:</div>
                <table className="w-full">
                  <tbody>
                    {data.nonCurrentAssets.lines.map((l, i) => (
                      <tr key={i} className="border-b border-gray-200">
                        <td className="py-0.5">• {l.titleAr}</td>
                        <td className="py-0.5 text-left font-mono">{formatEGP(l.amount)}</td>
                      </tr>
                    ))}
                    <tr className="font-bold bg-gray-100">
                      <td>مجموع الأصول غير المتداولة</td>
                      <td className="text-left font-mono">{formatEGP(data.nonCurrentAssets.total)}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="p-1 bg-black text-white font-black flex justify-between mt-4">
                  <span>إجمالي جانب الأصول:</span>
                  <span className="font-mono">{formatEGP(data.totalAssets)} جم</span>
                </div>
              </div>

              {/* Liabilities & Equity Print Column */}
              <div className="border border-black p-2 space-y-2">
                <div className="font-black bg-gray-200 p-1 border-b border-black text-center">
                  ثانياً: الخصوم وحقوق الملكية
                </div>
                <div className="font-bold underline">الخصوم المتداولة:</div>
                <table className="w-full">
                  <tbody>
                    {data.currentLiabilities.lines.map((l, i) => (
                      <tr key={i} className="border-b border-gray-200">
                        <td className="py-0.5">• {l.titleAr}</td>
                        <td className="py-0.5 text-left font-mono">{formatEGP(l.amount)}</td>
                      </tr>
                    ))}
                    <tr className="font-bold bg-gray-100">
                      <td>مجموع الخصوم المتداولة</td>
                      <td className="text-left font-mono">{formatEGP(data.currentLiabilities.total)}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="font-bold underline pt-2">الخصوم غير المتداولة:</div>
                <table className="w-full">
                  <tbody>
                    {data.nonCurrentLiabilities.lines.map((l, i) => (
                      <tr key={i} className="border-b border-gray-200">
                        <td className="py-0.5">• {l.titleAr}</td>
                        <td className="py-0.5 text-left font-mono">{formatEGP(l.amount)}</td>
                      </tr>
                    ))}
                    <tr className="font-bold bg-gray-100">
                      <td>مجموع الخصوم غير المتداولة</td>
                      <td className="text-left font-mono">{formatEGP(data.nonCurrentLiabilities.total)}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="font-bold underline pt-2">حقوق المساهمين:</div>
                <table className="w-full">
                  <tbody>
                    {data.equity.lines.map((l, i) => (
                      <tr key={i} className="border-b border-gray-200">
                        <td className="py-0.5">• {l.titleAr}</td>
                        <td className="py-0.5 text-left font-mono">{formatEGP(l.amount)}</td>
                      </tr>
                    ))}
                    <tr className="font-bold bg-gray-100">
                      <td>مجموع حقوق الملكية</td>
                      <td className="text-left font-mono">{formatEGP(data.totalEquity)}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="p-1 bg-black text-white font-black flex justify-between mt-4">
                  <span>إجمالي الخصوم وحقوق الملكية:</span>
                  <span className="font-mono">{formatEGP(data.totalLiabilitiesAndEquity)} جم</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </ReportPrintLayout>
    </div>
  );
};
