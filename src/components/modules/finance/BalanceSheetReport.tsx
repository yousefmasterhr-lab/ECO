import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useFinancial } from '../../../context/FinancialContext';
import { useDatabase } from '../../../services/federation/DatabaseContext';
import { getFiscalDateRange } from '../../../utils/fiscalYearHelper';
import { BalanceSheetReportData, BalanceSheetSection } from '../../../services/database/types';
import { ReportPrintLayout } from './ReportPrintLayout';
import { formatEGP, formatAccountingNumber } from '../../../utils/exportUtils';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { toast } from '@erp/ui-system';
import {
  Landmark,
  Calendar,
  RefreshCw,
  Printer,
  FileSpreadsheet,
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
  const [isExporting, setIsExporting] = useState<boolean>(false);

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

  // Luxury Branded Excel (.xlsx) Export Engine using ExcelJS
  const handleExportExcel = async () => {
    if (!data) return;
    setIsExporting(true);

    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'ECO ERP - ترابط';
      workbook.created = new Date();
      workbook.modified = new Date();

      const worksheet = workbook.addWorksheet('الميزانية العمومية والمركز المالي', {
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
      subCell.value = `قائمة المركز المالي والميزانية العمومية (كما في ${asOfDate})`;
      subCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFD97706' } };
      subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
      subCell.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(2).height = 28;

      // Spacing Row 3
      worksheet.addRow([]);
      worksheet.getRow(3).height = 10;

      // Metadata Box (Rows 4 & 5)
      worksheet.getCell('A4').value = 'تاريخ المركز المالي:';
      worksheet.getCell('B4').value = asOfDate;
      worksheet.getCell('C4').value = `قاعدة البيانات: ${activeDatabase}`;

      worksheet.getCell('A5').value = 'تاريخ الاستخراج:';
      worksheet.getCell('B5').value = new Date().toLocaleString('ar-EG');
      worksheet.getCell('C5').value = isBalanced ? 'حالة الميزانية: متزنة تماماً' : `فارق عدم اتزان: ${formatAccountingNumber(diff, 'جم')}`;

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

      // Spacing Row 6
      worksheet.addRow([]);
      worksheet.getRow(6).height = 12;

      // Table Header Row 7
      const headerRow = worksheet.addRow(['القسم المحاسبي / البند المالي', 'المبلغ الجزئي', 'إجمالي القسم (جم)']);
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

      // Helper function to add category banner
      const addCategoryBanner = (title: string, bgArgb = 'FF0F172A', textArgb = 'FFFFFFFF') => {
        const r = worksheet.addRow([title, '', '']);
        worksheet.mergeCells(`A${r.number}:C${r.number}`);
        r.height = 26;
        const cell = worksheet.getCell(`A${r.number}`);
        cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: textArgb } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
        };
      };

      // Helper for section lines
      const addSectionLines = (secTitle: string, lines: { titleAr: string; amount: number }[], subtotal: number) => {
        const subBanner = worksheet.addRow([secTitle, '', '']);
        worksheet.mergeCells(`A${subBanner.number}:C${subBanner.number}`);
        subBanner.height = 22;
        const bCell = worksheet.getCell(`A${subBanner.number}`);
        bCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF1E293B' } };
        bCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        bCell.alignment = { horizontal: 'right', vertical: 'middle' };

        lines.forEach((l, idx) => {
          const isEven = idx % 2 === 0;
          const r = worksheet.addRow([`  • ${l.titleAr}`, l.amount, '']);
          r.height = 22;
          r.getCell(1).font = { name: 'Arial', size: 10 };
          r.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' };
          r.getCell(2).font = { name: 'Arial', size: 10, bold: true };
          r.getCell(2).numFmt = '#,##0.00 "جم";(#,##0.00 "جم");"-"';
          r.getCell(2).alignment = { horizontal: 'right', vertical: 'middle' };
          r.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' };

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

        // Subtotal row
        const subRow = worksheet.addRow([`إجمالي ${secTitle}`, '', subtotal]);
        subRow.height = 24;
        subRow.getCell(1).font = { name: 'Arial', size: 10, bold: true };
        subRow.getCell(3).font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF0F172A' } };
        subRow.getCell(3).numFmt = '#,##0.00 "جم";(#,##0.00 "جم");"-"';
        [1, 2, 3].forEach(col => {
          const c = subRow.getCell(col);
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
          c.border = {
            top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
            bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
            left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
            right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
          };
        });
      };

      // Add Assets
      addCategoryBanner('أولاً: جانب الأصول والموجودات (ASSETS)', 'FF065F46', 'FFFFFFFF');
      addSectionLines(data.currentAssets.titleAr, data.currentAssets.lines, data.currentAssets.total);
      addSectionLines(data.nonCurrentAssets.titleAr, data.nonCurrentAssets.lines, data.nonCurrentAssets.total);

      // Grand Total Assets
      const assetsTotalRow = worksheet.addRow(['إجمالي جانب الأصول (Total Assets)', '', data.totalAssets]);
      assetsTotalRow.height = 30;
      assetsTotalRow.getCell(1).font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF0F172A' } };
      assetsTotalRow.getCell(3).font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF065F46' } };
      assetsTotalRow.getCell(3).numFmt = '#,##0.00 "جم";(#,##0.00 "جم");"-"';
      [1, 2, 3].forEach(col => {
        const c = assetsTotalRow.getCell(col);
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
        c.border = {
          top: { style: 'thin', color: { argb: 'FFD97706' } },
          bottom: { style: 'double', color: { argb: 'FFD97706' } },
          left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
        };
      });

      // Spacing
      worksheet.addRow([]);

      // Add Liabilities & Equity
      addCategoryBanner('ثانياً: جانب الخصوم والالتزامات وحقوق الملكية (LIABILITIES & EQUITY)', 'FF78350F', 'FFFFFFFF');
      addSectionLines(data.currentLiabilities.titleAr, data.currentLiabilities.lines, data.currentLiabilities.total);
      addSectionLines(data.nonCurrentLiabilities.titleAr, data.nonCurrentLiabilities.lines, data.nonCurrentLiabilities.total);

      // Total Liabilities
      const liabRow = worksheet.addRow(['إجمالي الخصوم والالتزامات', '', data.totalLiabilities]);
      liabRow.height = 24;
      liabRow.getCell(1).font = { name: 'Arial', size: 10, bold: true };
      liabRow.getCell(3).font = { name: 'Arial', size: 10, bold: true };
      liabRow.getCell(3).numFmt = '#,##0.00 "جم";(#,##0.00 "جم");"-"';
      [1, 2, 3].forEach(col => {
        const c = liabRow.getCell(col);
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
        c.border = {
          top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
        };
      });

      addSectionLines(data.equity.titleAr, data.equity.lines, data.totalEquity);

      // Grand Total Liabilities & Equity
      const liabEquityTotalRow = worksheet.addRow(['إجمالي الخصوم وحقوق الملكية (Total Liabilities & Equity)', '', data.totalLiabilitiesAndEquity]);
      liabEquityTotalRow.height = 30;
      liabEquityTotalRow.getCell(1).font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF0F172A' } };
      liabEquityTotalRow.getCell(3).font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF92400E' } };
      liabEquityTotalRow.getCell(3).numFmt = '#,##0.00 "جم";(#,##0.00 "جم");"-"';
      [1, 2, 3].forEach(col => {
        const c = liabEquityTotalRow.getCell(col);
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
        c.border = {
          top: { style: 'thin', color: { argb: 'FFD97706' } },
          bottom: { style: 'double', color: { argb: 'FFD97706' } },
          left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
        };
      });

      // Equilibrium Difference Row
      const diffRow = worksheet.addRow(['فارق توازن المركز المالي (الأصول - الخصوم وحقوق الملكية)', '', data.difference]);
      diffRow.height = 24;
      diffRow.getCell(1).font = { name: 'Arial', size: 10, bold: true };
      diffRow.getCell(3).font = { name: 'Arial', size: 10, bold: true, color: { argb: data.difference === 0 ? 'FF065F46' : 'FFDC2626' } };
      diffRow.getCell(3).numFmt = '#,##0.00 "جم";(#,##0.00 "جم");"-"';

      // Widths
      worksheet.getColumn(1).width = 50;
      worksheet.getColumn(2).width = 24;
      worksheet.getColumn(3).width = 24;

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const filename = `الميزانية_العمومية_والمركز_المالي_${asOfDate}.xlsx`;
      saveAs(blob, filename);

      toast.success(
        t('تم تصدير الميزانية العمومية بنجاح', 'Balance sheet exported successfully'),
        filename
      );
    } catch (err: any) {
      console.error('[ExcelJS Balance Sheet Error]:', err);
      toast.error(
        t('فشل تصدير الميزانية العمومية', 'Failed to export balance sheet'),
        err?.message || 'Error creating Excel workbook'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const isBalanced = data?.isBalanced ?? true;
  const diff = data?.difference ?? 0;

  const renderSectionTable = (section: BalanceSheetSection, bgBadge: string) => {
    return (
      <div className="space-y-1">
        <div className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center justify-between ${bgBadge}`}>
          <span>{section.titleAr}</span>
          <span className="font-mono tabular-nums" dir="ltr">{formatAccountingNumber(section.total, 'جم')}</span>
        </div>
        <table className="w-full text-right text-xs">
          <tbody className="divide-y divide-gray-100 dark:divide-[#243628]/40">
            {section.lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-emerald-500/5 transition-colors">
                <td className="py-2 px-3 text-[#3E4A41] dark:text-[#C5D2C7] font-medium">
                  <span className="text-gray-400 text-xs ml-1.5">•</span>
                  {line.titleAr}
                </td>
                <td className="py-2 px-3 text-center align-middle font-mono tabular-nums font-bold text-[#1A241C] dark:text-[#F3EFE6] w-36" dir="ltr">
                  {formatAccountingNumber(line.amount)}
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
                <span dir="ltr" className="tabular-nums">{formatAccountingNumber(data.totalAssets, 'جم')}</span>
              </div>
              <span className="text-lg font-sans font-bold">=</span>
              <div className="px-3 py-1.5 rounded-xl bg-white/70 dark:bg-black/20 border border-current/10">
                <span className="text-[10px] font-sans block opacity-70">الخصوم + حقوق الملكية</span>
                <span dir="ltr" className="tabular-nums">{formatAccountingNumber(data.totalLiabilitiesAndEquity, 'جم')}</span>
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
              <span className="text-xs font-mono font-black tabular-nums text-emerald-800 dark:text-emerald-300" dir="ltr">
                {formatAccountingNumber(data.totalAssets, 'جم')}
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
              <span className="text-sm font-black font-mono tabular-nums text-emerald-800 dark:text-emerald-300" dir="ltr">
                {formatAccountingNumber(data.totalAssets, 'جم')}
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
              <span className="text-xs font-mono font-black tabular-nums text-amber-800 dark:text-amber-300" dir="ltr">
                {formatAccountingNumber(data.totalLiabilitiesAndEquity, 'جم')}
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
                <span className="font-mono tabular-nums" dir="ltr">{formatAccountingNumber(data.totalLiabilities, 'جم')}</span>
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
              <span className="text-sm font-black font-mono tabular-nums text-amber-800 dark:text-amber-300" dir="ltr">
                {formatAccountingNumber(data.totalLiabilitiesAndEquity, 'جم')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Official Print Preview Modal */}
      <ReportPrintLayout
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        singlePage={true}
        titleAr="قائمة المركز المالي (الميزانية العمومية الرسمية)"
        titleEn="Official Statement of Financial Position (Balance Sheet)"
        periodText={`كما في ${asOfDate}`}
        subtitleAr="وفقاً لمعايير المحاسبة المصرية والدولية (EAS / IFRS)"
      >
        {data && (
          <div className="space-y-1.5 print:space-y-1">
            <div className="grid grid-cols-2 gap-3 items-stretch text-xs print:text-[9.5px]">
              {/* Assets Print Column */}
              <div className="flex flex-col justify-between border border-slate-300 print:border-slate-400 rounded-xl p-2.5 print:p-2 bg-white">
                <div className="flex-1 space-y-1.5">
                  <div className="font-bold bg-slate-100 print:bg-slate-200 p-1.5 print:p-1 border border-slate-300 print:border-slate-400 text-center text-slate-900 rounded-lg text-xs print:text-[10px]">
                    أولاً: جانب الأصول (Assets)
                  </div>
                  <div className="font-bold text-slate-800 text-[11px] print:text-[9.5px] pt-0.5">الأصول المتداولة (Current Assets):</div>
                  <table className="w-full text-right border-collapse border border-slate-300 print:border-slate-400 rounded-lg overflow-hidden">
                    <tbody>
                      {data.currentAssets.lines.map((l, i) => (
                        <tr key={i} className="border-b border-slate-300 print:border-slate-400">
                          <td className="py-0.5 print:py-0.5 px-2 leading-tight">• {l.titleAr}</td>
                          <td className="text-center font-mono align-middle py-0.5 print:py-0.5 px-2 tabular-nums border-l border-slate-300 print:border-slate-400 w-32 leading-tight" dir="ltr">{formatAccountingNumber(l.amount)}</td>
                        </tr>
                      ))}
                      <tr className="font-bold bg-slate-50 print:bg-slate-100 border-t border-slate-300 print:border-slate-400">
                        <td className="py-0.5 print:py-0.5 px-2">مجموع الأصول المتداولة</td>
                        <td className="text-center font-mono align-middle py-0.5 print:py-0.5 px-2 tabular-nums font-bold border-l border-slate-300 print:border-slate-400 w-32" dir="ltr">{formatAccountingNumber(data.currentAssets.total)}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="font-bold text-slate-800 text-[11px] print:text-[9.5px] pt-1">الأصول غير المتداولة (Non-Current Assets):</div>
                  <table className="w-full text-right border-collapse border border-slate-300 print:border-slate-400 rounded-lg overflow-hidden">
                    <tbody>
                      {data.nonCurrentAssets.lines.map((l, i) => (
                        <tr key={i} className="border-b border-slate-300 print:border-slate-400">
                          <td className="py-0.5 print:py-0.5 px-2 leading-tight">• {l.titleAr}</td>
                          <td className="text-center font-mono align-middle py-0.5 print:py-0.5 px-2 tabular-nums border-l border-slate-300 print:border-slate-400 w-32 leading-tight" dir="ltr">{formatAccountingNumber(l.amount)}</td>
                        </tr>
                      ))}
                      <tr className="font-bold bg-slate-50 print:bg-slate-100 border-t border-slate-300 print:border-slate-400">
                        <td className="py-0.5 print:py-0.5 px-2">مجموع الأصول غير المتداولة</td>
                        <td className="text-center font-mono align-middle py-0.5 print:py-0.5 px-2 tabular-nums font-bold border-l border-slate-300 print:border-slate-400 w-32" dir="ltr">{formatAccountingNumber(data.nonCurrentAssets.total)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-auto border-t-2 border-slate-800 pt-1.5">
                  <div className="p-2 print:p-1.5 border-t border-slate-900 border-b-4 border-double border-slate-900 bg-slate-100 font-black text-slate-900 flex justify-between items-center text-xs print:text-[10px]">
                    <span>إجمالي جانب الأصول:</span>
                    <span className="font-mono tabular-nums font-black text-center" dir="ltr">{formatAccountingNumber(data.totalAssets, 'جم')}</span>
                  </div>
                </div>
              </div>

              {/* Liabilities & Equity Print Column */}
              <div className="flex flex-col justify-between border border-slate-300 print:border-slate-400 rounded-xl p-2.5 print:p-2 bg-white">
                <div className="flex-1 space-y-1.5">
                  <div className="font-bold bg-slate-100 print:bg-slate-200 p-1.5 print:p-1 border border-slate-300 print:border-slate-400 text-center text-slate-900 rounded-lg text-xs print:text-[10px]">
                    ثانياً: الخصوم وحقوق الملكية (Liabilities & Equity)
                  </div>
                  <div className="font-bold text-slate-800 text-[11px] print:text-[9.5px] pt-0.5">الخصوم المتداولة (Current Liabilities):</div>
                  <table className="w-full text-right border-collapse border border-slate-300 print:border-slate-400 rounded-lg overflow-hidden">
                    <tbody>
                      {data.currentLiabilities.lines.map((l, i) => (
                        <tr key={i} className="border-b border-slate-300 print:border-slate-400">
                          <td className="py-0.5 print:py-0.5 px-2 leading-tight">• {l.titleAr}</td>
                          <td className="text-center font-mono align-middle py-0.5 print:py-0.5 px-2 tabular-nums border-l border-slate-300 print:border-slate-400 w-32 leading-tight" dir="ltr">{formatAccountingNumber(l.amount)}</td>
                        </tr>
                      ))}
                      <tr className="font-bold bg-slate-50 print:bg-slate-100 border-t border-slate-300 print:border-slate-400">
                        <td className="py-0.5 print:py-0.5 px-2">مجموع الخصوم المتداولة</td>
                        <td className="text-center font-mono align-middle py-0.5 print:py-0.5 px-2 tabular-nums font-bold border-l border-slate-300 print:border-slate-400 w-32" dir="ltr">{formatAccountingNumber(data.currentLiabilities.total)}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="font-bold text-slate-800 text-[11px] print:text-[9.5px] pt-1">الخصوم غير المتداولة (Non-Current Liabilities):</div>
                  <table className="w-full text-right border-collapse border border-slate-300 print:border-slate-400 rounded-lg overflow-hidden">
                    <tbody>
                      {data.nonCurrentLiabilities.lines.map((l, i) => (
                        <tr key={i} className="border-b border-slate-300 print:border-slate-400">
                          <td className="py-0.5 print:py-0.5 px-2 leading-tight">• {l.titleAr}</td>
                          <td className="text-center font-mono align-middle py-0.5 print:py-0.5 px-2 tabular-nums border-l border-slate-300 print:border-slate-400 w-32 leading-tight" dir="ltr">{formatAccountingNumber(l.amount)}</td>
                        </tr>
                      ))}
                      <tr className="font-bold bg-slate-50 print:bg-slate-100 border-t border-slate-300 print:border-slate-400">
                        <td className="py-0.5 print:py-0.5 px-2">مجموع الخصوم غير المتداولة</td>
                        <td className="text-center font-mono align-middle py-0.5 print:py-0.5 px-2 tabular-nums font-bold border-l border-slate-300 print:border-slate-400 w-32" dir="ltr">{formatAccountingNumber(data.nonCurrentLiabilities.total)}</td>
                      </tr>
                      <tr className="font-bold bg-slate-100 print:bg-slate-200 border-t border-slate-400">
                        <td className="py-0.5 print:py-0.5 px-2">إجمالي الخصوم والالتزامات</td>
                        <td className="text-center font-mono align-middle py-0.5 print:py-0.5 px-2 tabular-nums font-bold border-l border-slate-400 w-32" dir="ltr">{formatAccountingNumber(data.totalLiabilities)}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="font-bold text-slate-800 text-[11px] print:text-[9.5px] pt-1">حقوق المساهمين (Shareholders Equity):</div>
                  <table className="w-full text-right border-collapse border border-slate-300 print:border-slate-400 rounded-lg overflow-hidden">
                    <tbody>
                      {data.equity.lines.map((l, i) => (
                        <tr key={i} className="border-b border-slate-300 print:border-slate-400">
                          <td className="py-0.5 print:py-0.5 px-2 leading-tight">• {l.titleAr}</td>
                          <td className="text-center font-mono align-middle py-0.5 print:py-0.5 px-2 tabular-nums border-l border-slate-300 print:border-slate-400 w-32 leading-tight" dir="ltr">{formatAccountingNumber(l.amount)}</td>
                        </tr>
                      ))}
                      <tr className="font-bold bg-slate-50 print:bg-slate-100 border-t border-slate-300 print:border-slate-400">
                        <td className="py-0.5 print:py-0.5 px-2">مجموع حقوق الملكية</td>
                        <td className="text-center font-mono align-middle py-0.5 print:py-0.5 px-2 tabular-nums font-bold border-l border-slate-300 print:border-slate-400 w-32" dir="ltr">{formatAccountingNumber(data.totalEquity)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-auto border-t-2 border-slate-800 pt-1.5">
                  <div className="p-2 print:p-1.5 border-t border-slate-900 border-b-4 border-double border-slate-900 bg-slate-100 font-black text-slate-900 flex justify-between items-center text-xs print:text-[10px]">
                    <span>إجمالي الخصوم وحقوق الملكية:</span>
                    <span className="font-mono tabular-nums font-black text-center" dir="ltr">{formatAccountingNumber(data.totalLiabilitiesAndEquity, 'جم')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </ReportPrintLayout>
    </div>
  );
};
