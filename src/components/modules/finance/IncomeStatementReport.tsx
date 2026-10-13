import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useFinancial } from '../../../context/FinancialContext';
import { useDatabase } from '../../../services/federation/DatabaseContext';
import { getFiscalDateRange } from '../../../utils/fiscalYearHelper';
import { IncomeStatementReportData, FinancialStatementLine } from '../../../services/database/types';
import { ReportPrintLayout } from './ReportPrintLayout';
import { formatAccountingNumber, calculateRevenueShare } from '../../../utils/exportUtils';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { toast } from '@erp/ui-system';
import { FinancialToken } from '../../common/FinancialToken';
import {
  TrendingUp,
  Calendar,
  RefreshCw,
  Printer,
  FileSpreadsheet,
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
  const [isExporting, setIsExporting] = useState<boolean>(false);

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

  // Luxury Branded Excel (.xlsx) Export Engine using ExcelJS
  const handleExportExcel = async () => {
    if (!data) return;
    setIsExporting(true);

    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'ECO ERP - ترابط';
      workbook.created = new Date();
      workbook.modified = new Date();

      const worksheet = workbook.addWorksheet('قائمة الدخل والأرباح والخسائر', {
        views: [{ rtl: true, rightToLeft: true, showGridLines: true } as any]
      });

      // 1. Company Brand Header (Row 1)
      worksheet.mergeCells('A1:C1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'شركة ترابط للمقاولات والتجارة - ECO ERP';
      titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(1).height = 36;

      // Brand Sub-Header (Row 2)
      worksheet.mergeCells('A2:C2');
      const subCell = worksheet.getCell('A2');
      subCell.value = `قائمة الدخل والأرباح والخسائر الشاملة (من ${startDate} إلى ${endDate})`;
      subCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFD97706' } };
      subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
      subCell.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(2).height = 28;

      // Row 3 Spacing
      worksheet.addRow([]);
      worksheet.getRow(3).height = 10;

      // Metadata Box (Rows 4 & 5)
      worksheet.getCell('A4').value = 'الفترة المالية:';
      worksheet.getCell('B4').value = `من ${startDate} إلى ${endDate}`;
      worksheet.getCell('C4').value = `قاعدة البيانات: ${activeDatabase}`;

      worksheet.getCell('A5').value = 'تاريخ الاستخراج:';
      worksheet.getCell('B5').value = new Date().toLocaleString('ar-EG');
      worksheet.getCell('C5').value = `صافي النتيجة: ${formatAccountingNumber(data.netProfitAfterTax, 'جم')}`;

      [4, 5].forEach(rowNum => {
        const row = worksheet.getRow(rowNum);
        row.height = 22;
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          if (colNumber <= 3) {
            cell.font = { name: 'Arial', size: 10, bold: colNumber === 1 };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
              bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
              left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
              right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
            };
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
          }
        });
      });

      // Row 6 Spacing
      worksheet.addRow([]);
      worksheet.getRow(6).height = 12;

      // Table Header Row 7
      const headerRow = worksheet.addRow(['البيان المحاسبي / البند المالي', 'المبلغ (جم)', 'النسبة من الإيرادات (%)']);
      headerRow.height = 28;
      headerRow.eachCell(cell => {
        cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF475569' } },
          bottom: { style: 'medium', color: { argb: 'FFD97706' } },
          left: { style: 'thin', color: { argb: 'FF475569' } },
          right: { style: 'thin', color: { argb: 'FF475569' } }
        };
      });

      const addCategoryHeader = (title: string, bgArgb = 'FF0F172A') => {
        const r = worksheet.addRow([title, '', '']);
        worksheet.mergeCells(`A${r.number}:C${r.number}`);
        r.height = 25;
        const cell = worksheet.getCell(`A${r.number}`);
        cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
        };
      };

      const addDetailRows = (lines: FinancialStatementLine[], isCost = false) => {
        lines.forEach((l, idx) => {
          const isEven = idx % 2 === 0;
          const r = worksheet.addRow([
            `  • ${l.titleAr}`,
            isCost ? -Math.abs(l.amount) : l.amount,
            calculateRevenueShare(l.amount, data.totalOperatingRevenues)
          ]);
          r.height = 22;
          r.getCell(1).font = { name: 'Arial', size: 10 };
          r.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' };
          r.getCell(2).font = { name: 'Arial', size: 10, bold: true };
          r.getCell(2).numFmt = '#,##0.00 "جم";(#,##0.00 "جم");"-"';
          r.getCell(2).alignment = { horizontal: 'right', vertical: 'middle' };
          r.getCell(3).font = { name: 'Arial', size: 10 };
          r.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };

          [1, 2, 3].forEach(col => {
            const c = r.getCell(col);
            if (isEven) {
              c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
            }
            c.border = {
              top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
              bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
              left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
              right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
            };
          });
        });
      };

      const addSummaryRow = (title: string, amount: number, pct: string, bgArgb = 'FFF1F5F9', isDoubleUnderline = false) => {
        const r = worksheet.addRow([title, amount, pct]);
        r.height = isDoubleUnderline ? 30 : 25;
        r.getCell(1).font = { name: 'Arial', size: isDoubleUnderline ? 11 : 10, bold: true, color: { argb: 'FF0F172A' } };
        r.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' };
        r.getCell(2).font = { name: 'Arial', size: isDoubleUnderline ? 12 : 10, bold: true, color: { argb: amount < 0 ? 'FFDC2626' : 'FF0F172A' } };
        r.getCell(2).numFmt = '#,##0.00 "جم";(#,##0.00 "جم");"-"';
        r.getCell(2).alignment = { horizontal: 'right', vertical: 'middle' };
        r.getCell(3).font = { name: 'Arial', size: 10, bold: true };
        r.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };

        [1, 2, 3].forEach(col => {
          const c = r.getCell(col);
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
          c.border = {
            top: { style: 'thin', color: { argb: isDoubleUnderline ? 'FFD97706' : 'FFCBD5E1' } },
            bottom: { style: isDoubleUnderline ? 'double' : 'medium', color: { argb: isDoubleUnderline ? 'FFD97706' : 'FF94A3B8' } },
            left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
            right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
          };
        });
      };

      // 1. Operating Revenues
      addCategoryHeader('1. الإيرادات التشغيلية (Operating Revenues)', 'FF065F46');
      addDetailRows(data.operatingRevenues);
      addSummaryRow('إجمالي الإيرادات التشغيلية', data.totalOperatingRevenues, '100.0%', 'FFECFDF5');

      // 2. Cost of Revenues
      addCategoryHeader('2. (-) تكلفة الإيرادات والعقود (Cost of Revenues)', 'FF991B1B');
      addDetailRows(data.costOfRevenues, true);
      addSummaryRow('إجمالي تكلفة الإيرادات', -Math.abs(data.totalCostOfRevenues), calculateRevenueShare(data.totalCostOfRevenues, data.totalOperatingRevenues), 'FFFEF2F2');

      // 3. Gross Profit
      addSummaryRow('(=) مجمل الربح (Gross Profit)', data.grossProfit, data.totalOperatingRevenues > 0 ? `${data.grossMarginPercent}%` : '0.0%', 'FFEFF6FF');

      // 4. Operating Expenses
      addCategoryHeader('3. (-) المصروفات العمومية والإدارية (Operating Expenses)', 'FF92400E');
      addDetailRows(data.operatingExpenses, true);
      addSummaryRow('إجمالي المصروفات الإدارية والتشغيلية', -Math.abs(data.totalOperatingExpenses), calculateRevenueShare(data.totalOperatingExpenses, data.totalOperatingRevenues), 'FFFFFBEB');

      // 5. Operating Profit (EBIT)
      addSummaryRow('(=) صافي الربح التشغيلي قبل الضريبة (EBIT)', data.operatingProfit, data.totalOperatingRevenues > 0 ? `${data.operatingMarginPercent}%` : '0.0%', 'FFECFDF5');

      // 6. Tax
      const taxRow = worksheet.addRow(['(-) مخصص ضريبة الدخل المقدرة (22.5%)', -Math.abs(data.estimatedTax), data.operatingProfit > 0 ? '22.5%' : '0.0%']);
      taxRow.height = 24;
      taxRow.getCell(1).font = { name: 'Arial', size: 10, bold: true };
      taxRow.getCell(2).font = { name: 'Arial', size: 10, bold: true };
      taxRow.getCell(2).numFmt = '#,##0.00 "جم";(#,##0.00 "جم");"-"';
      taxRow.getCell(2).alignment = { horizontal: 'right', vertical: 'middle' };
      taxRow.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
      [1, 2, 3].forEach(col => {
        const c = taxRow.getCell(col);
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        c.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };
      });

      // 7. Net Income After Tax
      addSummaryRow('(=) صافي أرباح العام النهائي بعد الضريبة (Net Income)', data.netProfitAfterTax, data.totalOperatingRevenues > 0 ? `${data.netMarginPercent}%` : '0.0%', 'FFFEF3C7', true);

      // Widths
      worksheet.getColumn(1).width = 48;
      worksheet.getColumn(2).width = 24;
      worksheet.getColumn(3).width = 22;

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const filename = `قائمة_الدخل_والأرباح_والخسائر_${endDate}.xlsx`;
      saveAs(blob, filename);

      toast.success(
        t('تم تصدير قائمة الدخل بنجاح', 'Income statement exported successfully'),
        filename
      );
    } catch (err: any) {
      console.error('[ExcelJS Income Statement Error]:', err);
      toast.error(
        t('فشل تصدير قائمة الدخل', 'Failed to export income statement'),
        err?.message || 'Error creating Excel workbook'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const renderSectionRows = (
    lines: FinancialStatementLine[],
    baseRevenue: number
  ) => {
    return lines.map((line, idx) => {
      const pctFormatted = calculateRevenueShare(line.amount, baseRevenue);
      const rawPct = baseRevenue > 0 ? Math.min(100, Math.max(0, (Math.abs(line.amount) / Math.abs(baseRevenue)) * 100)) : 0;
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
          <td className="py-2.5 px-4 text-center font-mono align-middle tabular-nums font-bold text-[#1A241C] dark:text-[#F3EFE6]" dir="ltr">
            {formatAccountingNumber(line.amount)}
          </td>
          <td className="py-2.5 px-4 text-center align-middle font-mono text-xs text-[#5C665E] dark:text-[#8FA392]">
            <div className="flex items-center justify-center gap-2">
              <div className="w-16 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${rawPct}%` }}
                />
              </div>
              <span className="w-12 text-center">{pctFormatted}</span>
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
              onClick={handleExportExcel}
              disabled={loading || !data || isExporting}
              className="px-4 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileSpreadsheet className={`w-4 h-4 text-emerald-300 ${isExporting ? 'animate-spin' : ''}`} />
              <span>{isExporting ? t('جاري التصدير...', 'Exporting...') : 'Excel Report'}</span>
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
              <span dir="ltr">هامش مجمل الربح: {data.totalOperatingRevenues > 0 ? `${data.grossMarginPercent}%` : '0.0%'}</span>
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
              <span dir="ltr">الهامش التشغيلي: {data.totalOperatingRevenues > 0 ? `${data.operatingMarginPercent}%` : '0.0%'}</span>
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
              <span dir="ltr">صافي العائد النهائي: {data.totalOperatingRevenues > 0 ? `${data.netMarginPercent}%` : '0.0%'}</span>
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
                <th className="py-3 px-4 text-center align-middle w-1/4 font-mono">{t('المبلغ الحالي (جم)', 'Amount (EGP)')}</th>
                <th className="py-3 px-4 text-center align-middle w-1/4 font-mono">{t('النسبة من الإيرادات', '% of Revenue')}</th>
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
                    <td className="py-2.5 px-4 text-center font-mono align-middle tabular-nums text-emerald-800 dark:text-emerald-300" dir="ltr">
                      {formatAccountingNumber(data.totalOperatingRevenues)}
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
                    <td className="py-2.5 px-4 text-center font-mono align-middle tabular-nums text-rose-800 dark:text-rose-300" dir="ltr">
                      {formatAccountingNumber(-Math.abs(data.totalCostOfRevenues))}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-rose-600">
                      {calculateRevenueShare(data.totalCostOfRevenues, data.totalOperatingRevenues)}
                    </td>
                  </tr>

                  {/* SECTION 3: GROSS PROFIT */}
                  <tr className="bg-blue-500/15 dark:bg-blue-950/40 font-black text-blue-950 dark:text-blue-200 border-y-2 border-blue-500/40">
                    <td className="py-3 px-4 text-sm">(=) مجمل الربح (Gross Profit)</td>
                    <td className="py-3 px-4 text-center font-mono align-middle tabular-nums text-sm text-blue-800 dark:text-blue-300" dir="ltr">
                      {formatAccountingNumber(data.grossProfit)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-sm font-black text-blue-800 dark:text-blue-300">
                      {data.totalOperatingRevenues > 0 ? `${data.grossMarginPercent}%` : '0.0%'}
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
                    <td className="py-2.5 px-4 text-center font-mono align-middle tabular-nums text-amber-800 dark:text-amber-300" dir="ltr">
                      {formatAccountingNumber(-Math.abs(data.totalOperatingExpenses))}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-amber-600">
                      {calculateRevenueShare(data.totalOperatingExpenses, data.totalOperatingRevenues)}
                    </td>
                  </tr>

                  {/* SECTION 5: OPERATING PROFIT (EBIT) */}
                  <tr className="bg-emerald-500/15 dark:bg-emerald-950/40 font-black text-emerald-950 dark:text-emerald-200 border-y-2 border-emerald-500/40">
                    <td className="py-3 px-4 text-sm">(=) صافي الربح التشغيلي قبل الضريبة (EBIT)</td>
                    <td className="py-3 px-4 text-center font-mono align-middle tabular-nums text-sm text-emerald-800 dark:text-emerald-300" dir="ltr">
                      {formatAccountingNumber(data.operatingProfit)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-sm font-black text-emerald-800 dark:text-emerald-300">
                      {data.totalOperatingRevenues > 0 ? `${data.operatingMarginPercent}%` : '0.0%'}
                    </td>
                  </tr>

                  {/* SECTION 6: TAXATION */}
                  <tr className="border-b border-[#E0D9CB]/60 dark:border-[#243628]">
                    <td className="py-2.5 px-4 font-bold text-[#5C665E] dark:text-[#8FA392]">
                      (-) مخصص ضريبة الدخل المقدرة (22.5%)
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono align-middle tabular-nums font-bold text-rose-700 dark:text-rose-400" dir="ltr">
                      {formatAccountingNumber(-Math.abs(data.estimatedTax))}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono text-gray-500">
                      {data.operatingProfit > 0 ? '22.5%' : '0.0%'}
                    </td>
                  </tr>

                  {/* SECTION 7: FINAL NET INCOME */}
                  <tr className="bg-emerald-600 text-white font-black text-sm border-t-2 border-emerald-700">
                    <td className="py-3.5 px-4">(=) صافي أرباح العام النهائي بعد الضريبة (Net Income)</td>
                    <td className="py-3.5 px-4 text-center font-mono align-middle tabular-nums text-base font-black whitespace-nowrap" dir="ltr">
                      {formatAccountingNumber(data.netProfitAfterTax, 'جم')}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-base font-black">
                      {data.totalOperatingRevenues > 0 ? `${data.netMarginPercent}%` : '0.0%'}
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
        singlePage={true}
        titleAr="قائمة الدخل والأرباح والخسائر الرسمية"
        titleEn="Official Statement of Profit and Loss (Income Statement)"
        periodText={`من ${startDate} إلى ${endDate}`}
        subtitleAr="وفقاً لمعايير المحاسبة المعتمدة وقوانين الضرائب المصرية"
      >
        {data && (
          <div className="space-y-2">
            <div className="border border-slate-300 rounded-xl overflow-hidden shadow-none print:border-slate-400 print:rounded-xl">
              <table className="w-full text-right border-collapse text-xs print:text-[9.5px]">
                <thead>
                  <tr className="border-b-2 border-slate-900 bg-slate-100 print:bg-slate-200 font-black text-slate-900">
                    <th className="py-1.5 px-2.5 border-b border-slate-300 text-right">البيان المحاسبي</th>
                    <th className="py-1.5 px-2 border-b border-slate-300 text-center align-middle w-36">المبلغ (جم)</th>
                    <th className="py-1.5 px-2 border-b border-slate-300 text-center align-middle w-24">النسبة %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-slate-100/90 font-bold text-slate-900">
                    <td colSpan={3} className="py-1 px-2.5 text-slate-900 font-black">أولاً: الإيرادات التشغيلية</td>
                  </tr>
                  {data.operatingRevenues.map((l, i) => (
                    <tr key={i} className="border-b border-slate-200">
                      <td className="py-1 print:py-0.5 px-3">• {l.titleAr}</td>
                      <td className="text-center font-mono align-middle print:text-center py-1 print:py-0.5 tabular-nums" dir="ltr">{formatAccountingNumber(l.amount)}</td>
                      <td className="text-center align-middle font-mono print:text-center py-1 print:py-0.5">
                        {calculateRevenueShare(l.amount, data.totalOperatingRevenues)}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-slate-100 text-slate-900 border-t border-b border-slate-300">
                    <td className="py-1 print:py-0.5 px-2.5">إجمالي الإيرادات</td>
                    <td className="text-center font-mono align-middle print:text-center py-1 print:py-0.5 tabular-nums font-bold" dir="ltr">{formatAccountingNumber(data.totalOperatingRevenues)}</td>
                    <td className="text-center align-middle font-mono print:text-center py-1 print:py-0.5 font-bold">100.0%</td>
                  </tr>

                  <tr className="bg-slate-100/90 font-bold text-slate-900">
                    <td colSpan={3} className="py-1 px-2.5 text-slate-900 font-black">ثانياً: تكلفة الإيرادات والعقود</td>
                  </tr>
                  {data.costOfRevenues.map((l, i) => (
                    <tr key={i} className="border-b border-slate-200">
                      <td className="py-1 print:py-0.5 px-3">• {l.titleAr}</td>
                      <td className="text-center font-mono align-middle print:text-center py-1 print:py-0.5 tabular-nums" dir="ltr">{formatAccountingNumber(-Math.abs(l.amount))}</td>
                      <td className="text-center align-middle font-mono print:text-center py-1 print:py-0.5">
                        {calculateRevenueShare(l.amount, data.totalOperatingRevenues)}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-slate-100 text-slate-900 border-t border-b border-slate-300">
                    <td className="py-1 print:py-0.5 px-2.5">إجمالي التكاليف</td>
                    <td className="text-center font-mono align-middle print:text-center py-1 print:py-0.5 tabular-nums font-bold" dir="ltr">{formatAccountingNumber(-Math.abs(data.totalCostOfRevenues))}</td>
                    <td className="text-center align-middle font-mono print:text-center py-1 print:py-0.5 font-bold">
                      {calculateRevenueShare(data.totalCostOfRevenues, data.totalOperatingRevenues)}
                    </td>
                  </tr>

                  <tr className="font-black bg-slate-200/80 border-y border-slate-400 text-slate-900">
                    <td className="py-1.5 print:py-1 px-2.5">مجمل الربح (Gross Profit)</td>
                    <td className="text-center font-mono align-middle print:text-center py-1.5 print:py-1 tabular-nums font-bold" dir="ltr">{formatAccountingNumber(data.grossProfit)}</td>
                    <td className="text-center align-middle font-mono print:text-center py-1.5 print:py-1 font-bold">{data.totalOperatingRevenues > 0 ? `${data.grossMarginPercent}%` : '0.0%'}</td>
                  </tr>

                  <tr className="bg-slate-100/90 font-bold text-slate-900">
                    <td colSpan={3} className="py-1 px-2.5 text-slate-900 font-black">ثالثاً: المصروفات العمومية والإدارية</td>
                  </tr>
                  {data.operatingExpenses.map((l, i) => (
                    <tr key={i} className="border-b border-slate-200">
                      <td className="py-1 print:py-0.5 px-3">• {l.titleAr}</td>
                      <td className="text-center font-mono align-middle print:text-center py-1 print:py-0.5 tabular-nums" dir="ltr">{formatAccountingNumber(-Math.abs(l.amount))}</td>
                      <td className="text-center align-middle font-mono print:text-center py-1 print:py-0.5">
                        {calculateRevenueShare(l.amount, data.totalOperatingRevenues)}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-slate-100 text-slate-900 border-t border-b border-slate-300">
                    <td className="py-1 print:py-0.5 px-2.5">إجمالي المصروفات</td>
                    <td className="text-center font-mono align-middle print:text-center py-1 print:py-0.5 tabular-nums font-bold" dir="ltr">{formatAccountingNumber(-Math.abs(data.totalOperatingExpenses))}</td>
                    <td className="text-center align-middle font-mono print:text-center py-1 print:py-0.5 font-bold">
                      {calculateRevenueShare(data.totalOperatingExpenses, data.totalOperatingRevenues)}
                    </td>
                  </tr>

                  <tr className="font-black bg-slate-200/80 border-y border-slate-400 text-slate-900">
                    <td className="py-1.5 print:py-1 px-2.5">صافي الربح التشغيلي قبل الضريبة (EBIT)</td>
                    <td className="text-center font-mono align-middle print:text-center py-1.5 print:py-1 tabular-nums font-bold" dir="ltr">{formatAccountingNumber(data.operatingProfit)}</td>
                    <td className="text-center align-middle font-mono print:text-center py-1.5 print:py-1 font-bold">{data.totalOperatingRevenues > 0 ? `${data.operatingMarginPercent}%` : '0.0%'}</td>
                  </tr>

                  <tr className="border-b border-slate-300">
                    <td className="py-1 print:py-0.5 px-2.5">مخصص ضريبة الدخل (22.5%)</td>
                    <td className="text-center font-mono align-middle print:text-center py-1 print:py-0.5 tabular-nums" dir="ltr">{formatAccountingNumber(-Math.abs(data.estimatedTax))}</td>
                    <td className="text-center align-middle font-mono print:text-center py-1 print:py-0.5">{data.operatingProfit > 0 ? '22.5%' : '0.0%'}</td>
                  </tr>

                  <tr className="font-black bg-amber-50/70 text-slate-900 border-t-2 border-slate-900 border-b-4 border-double border-slate-900">
                    <td className="py-2 print:py-1.5 px-2.5 text-xs print:text-[10px]">صافي أرباح العام النهائي بعد الضريبة (Net Income)</td>
                    <td className="text-center font-mono align-middle print:text-center py-2 print:py-1.5 tabular-nums text-xs print:text-[10px] font-black whitespace-nowrap" dir="ltr">{formatAccountingNumber(data.netProfitAfterTax, 'جم')}</td>
                    <td className="text-center align-middle font-mono print:text-center py-2 print:py-1.5 text-xs print:text-[10px] font-black">{data.totalOperatingRevenues > 0 ? `${data.netMarginPercent}%` : '0.0%'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </ReportPrintLayout>
    </div>
  );
};
