import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useFinancial } from '../../../context/FinancialContext';
import { useAuth } from '../../../context/AuthContext';
import { useDatabase } from '../../../services/federation/DatabaseContext';
import { getFiscalDateRange } from '../../../utils/fiscalYearHelper';
import { TrialBalanceReportData } from '../../../services/database/types';
import { ReportPrintLayout } from './ReportPrintLayout';
import { formatEGP, formatAccountingNumber } from '../../../utils/exportUtils';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { toast } from '@erp/ui-system';
import {
  Scale,
  Search,
  RefreshCw,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Calendar,
  Building2,
  ChevronDown
} from 'lucide-react';

export const TrialBalanceReport: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
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

  // Programmatic Page Chunking for Print
  const [printOrientation, setPrintOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const ROWS_PER_PAGE = printOrientation === 'landscape' ? 22 : 26;

  const printPages = useMemo(() => {
    if (!filteredItems.length) return [];
    const chunks: (typeof filteredItems)[] = [];
    for (let i = 0; i < filteredItems.length; i += ROWS_PER_PAGE) {
      chunks.push(filteredItems.slice(i, i + ROWS_PER_PAGE));
    }
    return chunks;
  }, [filteredItems, ROWS_PER_PAGE]);
  const totalPrintPages = printPages.length;

  // Export to Excel (.xlsx)
  const handleExportExcel = async () => {
    if (!filteredItems.length) return;
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'ECO ERP';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('ميزان المراجعة', {
        views: [{ rtl: true, rightToLeft: true, showGridLines: true } as any]
      });

      // 1. Company Brand Header
      worksheet.mergeCells('A1:I1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'شركة ترابط للمقاولات والتجارة - ECO ERP';
      titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0F172A' }
      };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(1).height = 36;

      // 2. Report Title & Accent
      worksheet.mergeCells('A2:I2');
      const subTitleCell = worksheet.getCell('A2');
      subTitleCell.value = `ميزان المراجعة بالمستويات الخمسة (المستوى ${selectedLevel})`;
      subTitleCell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF0F172A' } };
      subTitleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFEF3C7' }
      };
      subTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(2).height = 24;

      // 3. Metadata info
      worksheet.mergeCells('A3:I3');
      const metaCell = worksheet.getCell('A3');
      metaCell.value = `قاعدة البيانات: ${activeDatabase || 'MK_Khalil_Db_2026'} | الفترة: من ${startDate} إلى ${endDate} | تاريخ الإصدار: 2026-10-13`;
      metaCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF475569' } };
      metaCell.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(3).height = 20;

      // 4. Empty row
      worksheet.addRow([]);

      // 5. Table Header
      const headerRow = worksheet.addRow([
        'كود الحساب',
        'اسم الحساب',
        'المستوى',
        'رصيد أول المدة - مدين',
        'رصيد أول المدة - دائن',
        'حركات الفترة - مدين',
        'حركات الفترة - دائن',
        'الرصيد الختامي - مدين',
        'الرصيد الختامي - دائن'
      ]);
      headerRow.height = 26;
      headerRow.eachCell(cell => {
        cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0F172A' }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
          left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
        };
      });

      // 6. Data rows
      const thinBorder: Partial<ExcelJS.Borders> = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };

      filteredItems.forEach((item, index) => {
        const row = worksheet.addRow([
          item.accountCode,
          item.accountNameAr,
          `م${item.level}`,
          item.openingDebit,
          item.openingCredit,
          item.periodDebit,
          item.periodCredit,
          item.endingDebit,
          item.endingCredit
        ]);
        row.height = 20;

        const isZebra = index % 2 === 1;
        const rowBg = isZebra ? 'FFF8FAFC' : 'FFFFFFFF';

        row.eachCell((cell, colNumber) => {
          cell.border = thinBorder;
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: rowBg }
          };
          if (colNumber === 1 || colNumber === 3) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else if (colNumber === 2) {
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
          } else {
            cell.alignment = { horizontal: 'left', vertical: 'middle' };
            cell.numFmt = '#,##0.00 "جم";(#,##0.00 "جم");"-"';
          }
        });
      });

      // 7. Grand Totals
      if (data) {
        const totalRow = worksheet.addRow([
          'الإجمالي العام',
          '',
          '',
          data.totalOpeningDebit,
          data.totalOpeningCredit,
          data.totalPeriodDebit,
          data.totalPeriodCredit,
          data.totalEndingDebit,
          data.totalEndingCredit
        ]);
        totalRow.height = 24;

        totalRow.eachCell((cell, colNumber) => {
          cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0F172A' } };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFEF3C7' }
          };
          cell.border = {
            top: { style: 'medium', color: { argb: 'FF0F172A' } },
            bottom: { style: 'double', color: { argb: 'FF0F172A' } },
            left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
            right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
          };
          if (colNumber <= 3) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else {
            cell.alignment = { horizontal: 'left', vertical: 'middle' };
            cell.numFmt = '#,##0.00 "جم";(#,##0.00 "جم");"-"';
          }
        });
      }

      // Column widths
      worksheet.getColumn(1).width = 16;
      worksheet.getColumn(2).width = 34;
      worksheet.getColumn(3).width = 12;
      worksheet.getColumn(4).width = 22;
      worksheet.getColumn(5).width = 22;
      worksheet.getColumn(6).width = 22;
      worksheet.getColumn(7).width = 22;
      worksheet.getColumn(8).width = 22;
      worksheet.getColumn(9).width = 22;

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `ميزان_المراجعة_مستوى_${selectedLevel}_${endDate}.xlsx`);

      toast.success(
        t('تم تصدير تقرير ميزان المراجعة بنجاح', 'Trial balance report exported successfully'),
        `${t('المستوى', 'Level')} ${selectedLevel} (${filteredItems.length} ${t('حساب', 'accounts')})`
      );
    } catch (err) {
      console.error('Failed to export Excel:', err);
      toast.error(t('فشل تصدير ملف Excel', 'Failed to export Excel report'));
    }
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
              onClick={handleExportExcel}
              disabled={loading || !data?.items.length}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-600/30 dark:border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 transition-all cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Excel Report</span>
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
      <div className="border border-slate-300 dark:border-[#243628] rounded-xl overflow-hidden shadow-sm bg-white dark:bg-[#17231A]">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              {/* Header Tier 1 */}
              <tr className="border-b border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#1D2B20] text-[#1A241C] dark:text-[#F3EFE6] font-black">
                <th rowSpan={2} className="py-3 px-3 w-32 border-l border-[#E0D9CB] dark:border-[#243628] text-center font-bold align-middle">
                  {t('كود الحساب', 'Account Code')}
                </th>
                <th rowSpan={2} className="py-3 px-3 min-w-[200px] border-l border-[#E0D9CB] dark:border-[#243628] text-center font-bold align-middle">
                  {t('اسم الحساب', 'Account Name')}
                </th>
                <th rowSpan={2} className="py-3 px-2 text-center align-middle w-16 border-l border-[#E0D9CB] dark:border-[#243628]">
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
                <th className="py-2 px-3 text-center font-bold align-middle border-l border-[#E0D9CB] dark:border-[#243628] w-28 font-mono">مدين</th>
                <th className="py-2 px-3 text-center font-bold align-middle border-l border-[#E0D9CB] dark:border-[#243628] w-28 font-mono">دائن</th>
                <th className="py-2 px-3 text-center font-bold align-middle border-l border-[#E0D9CB] dark:border-[#243628] w-28 font-mono">مدين</th>
                <th className="py-2 px-3 text-center font-bold align-middle border-l border-[#E0D9CB] dark:border-[#243628] w-28 font-mono">دائن</th>
                <th className="py-2 px-3 text-center font-bold align-middle border-l border-[#E0D9CB] dark:border-[#243628] w-28 font-mono">مدين</th>
                <th className="py-2 px-3 text-center font-bold align-middle w-28 font-mono">دائن</th>
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
                      <td className="text-center font-mono align-middle py-2.5 px-3 border-l border-[#E0D9CB]/50 dark:border-[#243628]/50 text-xs">
                        <span className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {item.accountCode}
                        </span>
                      </td>

                      {/* Name with indentation based on level */}
                      <td className="py-2.5 px-3 border-l border-[#E0D9CB]/50 dark:border-[#243628]/50 text-center font-medium align-middle">
                        <div
                          className="flex items-center justify-center gap-1.5"
                          style={{ paddingRight: `${Math.max(0, item.level - 1) * 14}px` }}
                        >
                          {item.level > 1 && (
                            <span className="text-gray-300 dark:text-gray-600 font-mono text-[10px]">↳</span>
                          )}
                          <span>{item.accountNameAr}</span>
                        </div>
                      </td>

                      {/* Level Badge */}
                      <td className="text-center align-middle py-2.5 px-2 border-l border-[#E0D9CB]/50 dark:border-[#243628]/50">
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
                      <td className="text-center font-mono align-middle py-1 px-3 border-l border-[#E0D9CB]/50 dark:border-[#243628]/50 text-xs tabular-nums" dir="ltr">
                        {formatAccountingNumber(item.openingDebit)}
                      </td>

                      {/* Opening Credit */}
                      <td className="text-center font-mono align-middle py-1 px-3 border-l border-[#E0D9CB]/50 dark:border-[#243628]/50 text-xs tabular-nums" dir="ltr">
                        {formatAccountingNumber(item.openingCredit)}
                      </td>

                      {/* Period Debit */}
                      <td className="text-center font-mono align-middle py-1 px-3 border-l border-[#E0D9CB]/50 dark:border-[#243628]/50 text-xs font-bold text-blue-700 dark:text-blue-300 tabular-nums" dir="ltr">
                        {formatAccountingNumber(item.periodDebit)}
                      </td>

                      {/* Period Credit */}
                      <td className="text-center font-mono align-middle py-1 px-3 border-l border-[#E0D9CB]/50 dark:border-[#243628]/50 text-xs font-bold text-amber-700 dark:text-amber-300 tabular-nums" dir="ltr">
                        {formatAccountingNumber(item.periodCredit)}
                      </td>

                      {/* Ending Debit */}
                      <td className="text-center font-mono align-middle py-1 px-3 border-l border-[#E0D9CB]/50 dark:border-[#243628]/50 text-xs font-black text-emerald-800 dark:text-emerald-300 tabular-nums" dir="ltr">
                        {formatAccountingNumber(item.endingDebit)}
                      </td>

                      {/* Ending Credit */}
                      <td className="text-center font-mono align-middle py-1 px-3 text-xs font-black text-emerald-800 dark:text-emerald-300 tabular-nums" dir="ltr">
                        {formatAccountingNumber(item.endingCredit)}
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
                  <td className="text-center font-mono align-middle py-3 px-3 border-l border-[#E0D9CB] dark:border-[#243628] text-xs tabular-nums" dir="ltr">
                    {formatAccountingNumber(data.totalOpeningDebit)}
                  </td>
                  <td className="text-center font-mono align-middle py-3 px-3 border-l border-[#E0D9CB] dark:border-[#243628] text-xs tabular-nums" dir="ltr">
                    {formatAccountingNumber(data.totalOpeningCredit)}
                  </td>
                  <td className="text-center font-mono align-middle py-3 px-3 border-l border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-blue-800 dark:text-blue-300 tabular-nums" dir="ltr">
                    {formatAccountingNumber(data.totalPeriodDebit)}
                  </td>
                  <td className="text-center font-mono align-middle py-3 px-3 border-l border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-amber-800 dark:text-amber-300 tabular-nums" dir="ltr">
                    {formatAccountingNumber(data.totalPeriodCredit)}
                  </td>
                  <td className="text-center font-mono align-middle py-3 px-3 border-l border-[#E0D9CB] dark:border-[#243628] text-xs font-black text-emerald-800 dark:text-emerald-300 tabular-nums" dir="ltr">
                    {formatAccountingNumber(data.totalEndingDebit)}
                  </td>
                  <td className="text-center font-mono align-middle py-3 px-3 text-xs font-black text-emerald-800 dark:text-emerald-300 tabular-nums" dir="ltr">
                    {formatAccountingNumber(data.totalEndingCredit)}
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
        programmaticPagination={true}
        orientation={printOrientation}
        onOrientationChange={setPrintOrientation}
        titleAr={`ميزان المراجعة بالأرصدة والمجاميع (المستوى ${selectedLevel})`}
        titleEn={`5-Level Trial Balance Report (Level ${selectedLevel})`}
        periodText={`من ${startDate} إلى ${endDate}`}
        filterText={
          selectedCostCenter
            ? `مركز التكلفة: ${costCenters.find(c => String(c.id) === String(selectedCostCenter))?.nameAr || selectedCostCenter}`
            : 'جميع مراكز التكلفة'
        }
      >
        <div className="print-document flex flex-col items-center gap-6 print:gap-0 print:block w-full">
          {printPages.map((pageRows, pageIndex) => {
            const isFirstPage = pageIndex === 0;
            const isLastPage = pageIndex === totalPrintPages - 1;
            const printedByName = (user as any)?.displayName || user?.nameAr || user?.nameEn || (user as any)?.name || 'يوسف حجازي';

            return (
              <div
                key={pageIndex}
                className="print-sheet flex flex-col justify-between bg-white text-slate-900 p-6 rounded-2xl border border-slate-200 shadow-md w-full max-w-[1240px] print:max-w-none print:w-full print:bg-white print:p-0 print:m-0 print:border-none print:shadow-none print:rounded-none print:overflow-hidden print:break-after-page"
                style={{ pageBreakAfter: isLastPage ? 'auto' : 'always' }}
              >
                {/* 1. Header (Full Brand Header on Page 1, Condensed Mini-Header on Subsequent Pages) */}
                <div className="shrink-0">
                  {isFirstPage ? (
                    <div className="space-y-2 pb-2">
                      <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2 print:pb-1">
                        <div className="space-y-0.5">
                          <h1 className="text-xl print:text-lg font-black tracking-tight text-slate-900 print:text-black flex items-center gap-2">
                            <span className="text-[#D99B26] print:text-black">شركة ترابط للمقاولات والتجارة</span>
                            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-300 print:hidden font-bold">ش.م.م</span>
                          </h1>
                          <p className="text-xs print:text-[10px] font-bold text-slate-600 print:text-gray-700">
                            TARABOT CONTRACTING & TRADING CO.
                          </p>
                          <p className="text-[10px] print:text-[9px] text-slate-500 print:text-gray-600">
                            سجل تجاري: 48921 | بطاقة ضريبية: 312-894-102 | القاهرة، جمهورية مصر العربية
                          </p>
                        </div>

                        <div className="text-center p-2 print:p-1.5 rounded-2xl border border-slate-300 bg-slate-50/80 print:border-slate-800 print:bg-transparent min-w-[220px]">
                          <div className="text-sm print:text-xs font-black text-slate-900 print:text-black">
                            ميزان المراجعة بالأرصدة والمجاميع (المستوى {selectedLevel})
                          </div>
                          <div className="text-[10px] print:text-[9px] font-bold text-slate-600 print:text-black">
                            5-Level Trial Balance Report (Level {selectedLevel})
                          </div>
                          <div className="text-[9px] print:text-[8px] text-slate-500 print:text-gray-600 mt-0.5">
                            معايير المحاسبة المصرية (EAS) والدولية (IFRS)
                          </div>
                          <div className="text-[9px] print:text-[8px] font-mono text-slate-600 mt-0.5 print:text-black">
                            من {startDate} إلى {endDate}
                          </div>
                        </div>
                      </div>

                      {/* Subtitle / Filter notes / Metadata 3-Way Realignment */}
                      <div className="grid grid-cols-3 items-center text-xs print:text-[10px] text-slate-600 pb-1 border-b border-slate-200 print:border-slate-300">
                        <div className="text-right font-bold text-slate-800 print:text-black">
                          {selectedCostCenter
                            ? `مركز التكلفة: ${costCenters.find(c => String(c.id) === String(selectedCostCenter))?.nameAr || selectedCostCenter}`
                            : 'جميع مراكز التكلفة'}
                        </div>
                        <div className="text-center font-mono text-[10px] text-slate-700 print:text-black font-semibold">
                          تاريخ الإصدار: 2026-10-13
                        </div>
                        <div className="text-left font-bold text-slate-800 print:text-black">
                          {printedByName}
                        </div>
                      </div>

                      {/* Printable Balance Confirmation Alert Header */}
                      <div className="flex items-center justify-between p-2 rounded-xl border border-slate-300 text-xs font-bold print:border-slate-400 bg-slate-50/50 print:bg-slate-100/40">
                        <span className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${isBalanced ? 'bg-emerald-600' : 'bg-rose-600'}`}></span>
                          حالة اتزان الميزان: {isBalanced ? 'متزن بنجاح (الفرق = 0.00 جم)' : `غير متزن (الفرق = ${formatEGP(diff)} جم)`}
                        </span>
                        <span>عدد الحسابات الإجمالي: {filteredItems.length} حساب</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-1 text-slate-700 text-xs shrink-0 print:border-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 print:text-black">شركة ترابط للمقاولات والتجارة</span>
                        <span className="text-slate-400 print:text-slate-500">|</span>
                        <span className="font-medium text-slate-700 print:text-black">
                          ميزان المراجعة بالأرصدة والمجاميع (المستوى {selectedLevel})
                        </span>
                        <span className="text-slate-400 print:text-slate-500">|</span>
                        <span className="font-mono text-[10px] text-slate-600 print:text-black">
                          من {startDate} إلى {endDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[10px] text-slate-600">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-300 print:border-slate-400 font-bold">
                          صفحة {pageIndex + 1} من {totalPrintPages}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 2. Curved Table with Fixed Rows */}
                  <div className="border border-slate-300 rounded-xl overflow-hidden mt-1.5 print:border-slate-400 print:rounded-xl">
                    <table
                      className="w-full table-fixed border-separate border-spacing-0 text-center"
                      style={{ tableLayout: 'fixed', width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}
                    >
                      <colgroup>
                        <col style={{ width: '10%' }} /> {/* كود الحساب */}
                        <col style={{ width: '28%' }} /> {/* اسم الحساب (مساحة واسعة مريحة) */}
                        <col style={{ width: '6%' }} />  {/* المستوى */}
                        <col style={{ width: '9.3%' }} />{/* أول المدة مدين */}
                        <col style={{ width: '9.3%' }} />{/* أول المدة دائن */}
                        <col style={{ width: '9.3%' }} />{/* حركات مدين */}
                        <col style={{ width: '9.3%' }} />{/* حركات دائن */}
                        <col style={{ width: '9.3%' }} />{/* ختامي مدين */}
                        <col style={{ width: '9.5%' }} />{/* ختامي دائن */}
                      </colgroup>
                      <thead className="bg-slate-100 print:bg-slate-200 text-slate-800 text-[10px] font-bold">
                        <tr className="border-b border-slate-300 print:border-slate-400">
                          <th className="w-[10%] py-1.5 px-1 border-b border-l border-slate-300 print:border-slate-400 text-center font-bold align-middle">
                            كود الحساب
                          </th>
                          <th className="w-[28%] py-1.5 px-2 border-b border-l border-slate-300 print:border-slate-400 text-center font-bold align-middle">
                            اسم الحساب
                          </th>
                          <th className="w-[6%] py-1.5 px-1 border-b border-l border-slate-300 print:border-slate-400 text-center font-bold align-middle whitespace-nowrap">
                            المستوى
                          </th>
                          <th className="w-[9.3%] py-1.5 px-1 border-b border-l border-slate-300 print:border-slate-400 text-center font-bold align-middle font-mono">
                            أول المدة (مدين)
                          </th>
                          <th className="w-[9.3%] py-1.5 px-1 border-b border-l border-slate-300 print:border-slate-400 text-center font-bold align-middle font-mono">
                            أول المدة (دائن)
                          </th>
                          <th className="w-[9.3%] py-1.5 px-1 border-b border-l border-slate-300 print:border-slate-400 text-center font-bold align-middle font-mono">
                            حركات (مدين)
                          </th>
                          <th className="w-[9.3%] py-1.5 px-1 border-b border-l border-slate-300 print:border-slate-400 text-center font-bold align-middle font-mono">
                            حركات (دائن)
                          </th>
                          <th className="w-[9.3%] py-1.5 px-1 border-b border-l border-slate-300 print:border-slate-400 text-center font-bold align-middle font-mono">
                            ختامي (مدين)
                          </th>
                          <th className="w-[9.5%] py-1.5 px-1 border-b border-slate-300 print:border-slate-400 text-center font-bold align-middle font-mono">
                            ختامي (دائن)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 print:divide-slate-300 text-[9.5px]">
                        {pageRows.map((row, idx) => (
                          <tr
                            key={row.accountCode}
                            className={`h-6 border-b border-slate-200 print:border-slate-300 ${
                              idx % 2 === 1 ? 'bg-slate-50/50 print:bg-slate-100/40' : 'bg-white print:bg-white'
                            } ${row.level <= 2 ? 'font-bold bg-slate-100/70 print:bg-slate-200/50' : ''}`}
                          >
                            <td className="font-mono text-center align-middle py-1 px-1 border-b border-l border-slate-200 print:border-slate-300">
                              {row.accountCode}
                            </td>
                            <td className="text-center align-middle px-2 overflow-hidden text-ellipsis whitespace-nowrap border-b border-l border-slate-200 print:border-slate-300">
                              <div className="flex items-center justify-center gap-1 overflow-hidden">
                                {row.level > 1 && (
                                  <span className="text-gray-400 print:text-gray-500 font-mono text-[8px] shrink-0">↳</span>
                                )}
                                <span className="truncate">{row.accountNameAr}</span>
                              </div>
                            </td>
                            <td className="text-center align-middle py-1 px-1 whitespace-nowrap border-b border-l border-slate-200 print:border-slate-300">
                              م{row.level}
                            </td>
                            <td className="font-mono text-center align-middle py-1 px-1 tabular-nums border-b border-l border-slate-200 print:border-slate-300" dir="ltr">
                              {formatAccountingNumber(row.openingDebit)}
                            </td>
                            <td className="font-mono text-center align-middle py-1 px-1 tabular-nums border-b border-l border-slate-200 print:border-slate-300" dir="ltr">
                              {formatAccountingNumber(row.openingCredit)}
                            </td>
                            <td className="font-mono text-center align-middle py-1 px-1 tabular-nums border-b border-l border-slate-200 print:border-slate-300" dir="ltr">
                              {formatAccountingNumber(row.periodDebit)}
                            </td>
                            <td className="font-mono text-center align-middle py-1 px-1 tabular-nums border-b border-l border-slate-200 print:border-slate-300" dir="ltr">
                              {formatAccountingNumber(row.periodCredit)}
                            </td>
                            <td className="font-mono text-center align-middle py-1 px-1 tabular-nums border-b border-l border-slate-200 print:border-slate-300" dir="ltr">
                              {formatAccountingNumber(row.endingDebit)}
                            </td>
                            <td className="font-mono text-center align-middle py-1 px-1 tabular-nums border-b border-slate-200 print:border-slate-300" dir="ltr">
                              {formatAccountingNumber(row.endingCredit)}
                            </td>
                          </tr>
                        ))}

                        {/* If Last Page: Append Grand Total Row directly below last account */}
                        {isLastPage && data && (
                          <tr className="ledger-tail-row h-7 border-t-2 border-b-2 border-slate-800 bg-slate-200 print:bg-slate-300 font-black">
                            <td colSpan={3} className="py-1 px-2 text-center align-middle font-black border-t-2 border-b-2 border-slate-800 border-l border-slate-300 print:border-slate-400 text-xs">
                              الإجمالي العام
                            </td>
                            <td className="font-mono text-center align-middle py-1 px-1 tabular-nums font-black border-t-2 border-b-2 border-slate-800 border-l border-slate-300 print:border-slate-400" dir="ltr">
                              {formatAccountingNumber(data.totalOpeningDebit)}
                            </td>
                            <td className="font-mono text-center align-middle py-1 px-1 tabular-nums font-black border-t-2 border-b-2 border-slate-800 border-l border-slate-300 print:border-slate-400" dir="ltr">
                              {formatAccountingNumber(data.totalOpeningCredit)}
                            </td>
                            <td className="font-mono text-center align-middle py-1 px-1 tabular-nums font-black border-t-2 border-b-2 border-slate-800 border-l border-slate-300 print:border-slate-400" dir="ltr">
                              {formatAccountingNumber(data.totalPeriodDebit)}
                            </td>
                            <td className="font-mono text-center align-middle py-1 px-1 tabular-nums font-black border-t-2 border-b-2 border-slate-800 border-l border-slate-300 print:border-slate-400" dir="ltr">
                              {formatAccountingNumber(data.totalPeriodCredit)}
                            </td>
                            <td className="font-mono text-center align-middle py-1 px-1 tabular-nums font-black border-t-2 border-b-2 border-slate-800 border-l border-slate-300 print:border-slate-400" dir="ltr">
                              {formatAccountingNumber(data.totalEndingDebit)}
                            </td>
                            <td className="font-mono text-center align-middle py-1 px-1 tabular-nums font-black border-t-2 border-b-2 border-slate-800 print:border-slate-400" dir="ltr">
                              {formatAccountingNumber(data.totalEndingCredit)}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. Bottom Section: Signatures on Last Page + Persistent Numbered Footer on ALL Pages */}
                <div className="mt-auto pt-2 shrink-0">
                  {isLastPage && (
                    <div className="grid grid-cols-3 gap-3 mb-2 print:gap-2 print:mb-1.5 shrink-0">
                      <div className="border border-slate-300 print:border-slate-400 rounded-xl p-2 print:p-1.5 text-center bg-slate-50/50 print:bg-white flex flex-col justify-between">
                        <span className="font-bold text-xs print:text-[10px] text-slate-800 print:text-black block">المحاسب</span>
                        <span className="text-[9px] print:text-[8px] text-slate-600 print:text-black block mt-3 print:mt-2" dir="rtl">
                          التاريخ: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        </span>
                      </div>
                      <div className="border border-slate-300 print:border-slate-400 rounded-xl p-2 print:p-1.5 text-center bg-slate-50/50 print:bg-white flex flex-col justify-between">
                        <span className="font-bold text-xs print:text-[10px] text-slate-800 print:text-black block">المراجع</span>
                        <span className="text-[9px] print:text-[8px] text-slate-600 print:text-black block mt-3 print:mt-2" dir="rtl">
                          التاريخ: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        </span>
                      </div>
                      <div className="border border-slate-300 print:border-slate-400 rounded-xl p-2 print:p-1.5 text-center bg-slate-50/50 print:bg-white flex flex-col justify-between">
                        <span className="font-bold text-xs print:text-[10px] text-slate-800 print:text-black block">يعتمد</span>
                        <span className="text-[9px] print:text-[8px] text-slate-600 print:text-black block mt-3 print:mt-2" dir="rtl">
                          التاريخ: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Visible Audit & Pagination Bar on EVERY single printed page */}
                  <div className="flex justify-between items-center text-[9px] text-slate-600 pt-1 border-t border-slate-300 print:pt-1 shrink-0">
                    <span>طُبع بواسطة: <strong>{printedByName}</strong></span>
                    <span className="font-mono font-bold bg-slate-100 border border-slate-300 px-3 py-0.5 rounded-full text-slate-800 print:text-black">
                      صفحة {pageIndex + 1} من {totalPrintPages}
                    </span>
                    <span>تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ReportPrintLayout>
    </div>
  );
};
