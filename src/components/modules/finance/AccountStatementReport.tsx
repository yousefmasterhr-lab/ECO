import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { useFinancial } from '../../../context/FinancialContext';
import { useDatabase } from '../../../services/federation/DatabaseContext';
import { getFiscalDateRange } from '../../../utils/fiscalYearHelper';
import { StatementOfAccountReportData, StatementOfAccountLine, AccountNode } from '../../../services/database/types';
import { ReportPrintLayout } from './ReportPrintLayout';
import { Modal, toast } from '@erp/ui-system';
import { formatEGP, formatAccountingNumber } from '../../../utils/exportUtils';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import {
  BookOpen,
  Calendar,
  Search,
  RefreshCw,
  Printer,
  Building2,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Info,
  FileText,
  FileSpreadsheet
} from 'lucide-react';

function getLeafAccounts(nodes: AccountNode[]): AccountNode[] {
  const result: AccountNode[] = [];
  function walk(list: AccountNode[]) {
    for (const node of list) {
      if (node.level === 5 || !node.children || node.children.length === 0) {
        result.push(node);
      }
      if (node.children && node.children.length > 0) {
        walk(node.children);
      }
    }
  }
  walk(nodes);
  return result;
}

function findAccountInTree(nodes: AccountNode[], codeOrId: string): AccountNode | null {
  const clean = codeOrId.replace(/[^0-9]/g, '');
  for (const node of nodes) {
    if (node.code === codeOrId || node.id === codeOrId || (clean && node.code.replace(/[^0-9]/g, '') === clean)) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      const found = findAccountInTree(node.children, codeOrId);
      if (found) return found;
    }
  }
  return null;
}

export const AccountStatementReport: React.FC = () => {
  const { t } = useLanguage();
  const { activeDatabase } = useDatabase();
  const { currentUser } = useNavigation();
  const {
    fetchStatementOfAccount,
    accounts,
    costCenters,
    dimensions
  } = useFinancial();

  // Flattened Level 5 leaf accounts for selection
  const leafAccounts = useMemo(() => getLeafAccounts(accounts), [accounts]);

  // Selected filters
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [accountSearchText, setAccountSearchText] = useState<string>('');
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState<boolean>(false);

  const initialRange = useMemo(() => getFiscalDateRange(activeDatabase), [activeDatabase]);
  const [startDate, setStartDate] = useState<string>(() => initialRange.startDate);
  const [endDate, setEndDate] = useState<string>(() => initialRange.endDate);
  const [selectedCostCenter, setSelectedCostCenter] = useState<number | undefined>(undefined);
  const [selectedDimension, setSelectedDimension] = useState<number | undefined>(undefined);

  // Sync dates when activeDatabase changes
  useEffect(() => {
    const range = getFiscalDateRange(activeDatabase);
    setStartDate(range.startDate);
    setEndDate(range.endDate);
  }, [activeDatabase]);

  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<StatementOfAccountReportData | null>(null);

  // Selected line for transaction inspection modal
  const [inspectingLine, setInspectingLine] = useState<StatementOfAccountLine | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [printOrientation, setPrintOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Programmatic Page Chunking for Account Statement Print
  const printPages = useMemo(() => {
    if (!data?.transactions) return [];
    const txs = data.transactions;
    const isPortrait = printOrientation === 'portrait';

    const p1Limit = isPortrait ? 14 : 10;
    const normalLimit = isPortrait ? 20 : 16;
    const lastPageLimit = isPortrait ? 15 : 11;

    if (txs.length <= p1Limit) {
      if (txs.length <= (isPortrait ? 9 : 6)) {
        return [{ rows: txs, isFirst: true, isLast: true }];
      } else {
        return [
          { rows: txs.slice(0, p1Limit - 4), isFirst: true, isLast: false },
          { rows: txs.slice(p1Limit - 4), isFirst: false, isLast: true },
        ];
      }
    }

    const pages: { rows: StatementOfAccountLine[]; isFirst: boolean; isLast: boolean }[] = [];
    pages.push({
      rows: txs.slice(0, p1Limit),
      isFirst: true,
      isLast: false,
    });
    let currentIndex = p1Limit;

    while (currentIndex < txs.length) {
      const remaining = txs.length - currentIndex;
      if (remaining <= lastPageLimit) {
        pages.push({
          rows: txs.slice(currentIndex),
          isFirst: false,
          isLast: true,
        });
        break;
      } else if (remaining <= normalLimit) {
        const half = Math.ceil(remaining / 2);
        pages.push({
          rows: txs.slice(currentIndex, currentIndex + half),
          isFirst: false,
          isLast: false,
        });
        pages.push({
          rows: txs.slice(currentIndex + half),
          isFirst: false,
          isLast: true,
        });
        break;
      } else {
        pages.push({
          rows: txs.slice(currentIndex, currentIndex + normalLimit),
          isFirst: false,
          isLast: false,
        });
        currentIndex += normalLimit;
      }
    }
    return pages;
  }, [data?.transactions, printOrientation]);
  const totalPrintPages = printPages.length;

  // Listen for cross-module deep link events
  useEffect(() => {
    const handleDeepLink = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail?.accountId) {
        let rawTarget = String(custom.detail.accountId).trim().replace(/^L[1-5]-/i, '');
        if (rawTarget.startsWith('54101001')) rawTarget = '4101001';
        const targetId = rawTarget;
        const match =
          leafAccounts.find(
            a => a.code === targetId || a.id === targetId || a.code.replace(/[^0-9]/g, '') === targetId.replace(/[^0-9]/g, '')
          ) || findAccountInTree(accounts, targetId);

        if (match) {
          setSelectedAccountId(match.code);
          setAccountSearchText(`${match.code} - ${match.nameAr}`);
        } else {
          setSelectedAccountId(targetId);
          setAccountSearchText(custom.detail.accountName ? `${targetId} - ${custom.detail.accountName}` : targetId);
        }
      }
    };
    window.addEventListener('erp:deep-link', handleDeepLink);
    return () => window.removeEventListener('erp:deep-link', handleDeepLink);
  }, [leafAccounts, accounts]);

  // Initialize or align selected account with deep link or liquid cash/bank accounts
  useEffect(() => {
    if (leafAccounts.length === 0 && accounts.length === 0) return;

    // 1. Check URL query parameters for accountId deep link
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const rawUrlAccountId = params.get('accountId');
      if (rawUrlAccountId) {
        let rawClean = rawUrlAccountId.trim().replace(/^L[1-5]-/i, '');
        if (rawClean.startsWith('54101001')) rawClean = '4101001';
        const urlAccountId = rawClean;
        const match =
          leafAccounts.find(
            a => a.code === urlAccountId || a.id === urlAccountId || a.code.replace(/[^0-9]/g, '') === urlAccountId.replace(/[^0-9]/g, '')
          ) || findAccountInTree(accounts, urlAccountId);

        if (match) {
          setSelectedAccountId(match.code);
          setAccountSearchText(`${match.code} - ${match.nameAr}`);
          return;
        } else {
          setSelectedAccountId(urlAccountId);
          setAccountSearchText(urlAccountId);
          return;
        }
      }
    }

    // 2. Default to active liquid account with actual balance or activity, then fallback
    const activeLiquidAccount = leafAccounts.find(
      a => (a.code.startsWith('1201') || a.code.startsWith('1202') || a.code.startsWith('1206') || a.code.startsWith('1211')) && Math.abs(a.balance ?? 0) > 0
    );
    const anyActiveAccount = leafAccounts.find(a => Math.abs(a.balance ?? 0) > 0);
    const operatingBank = leafAccounts.find(a => a.code === '1202002' || a.code === '1202001' || a.id === '1202002');
    const primaryCash = leafAccounts.find(a => a.code === '1201001' || a.id === '1201001');
    const anyCashOrBank = leafAccounts.find(a => a.code.startsWith('1201') || a.code.startsWith('1202'));

    const bestAccount = activeLiquidAccount || anyActiveAccount || operatingBank || primaryCash || anyCashOrBank || leafAccounts[0];

    // If not selected or if currently pointing to dormant fixed asset 1101001 on initial load / DB switch
    if (!selectedAccountId || selectedAccountId === '1101001' || selectedAccountId === '1101') {
      if (bestAccount) {
        setSelectedAccountId(bestAccount.code);
        setAccountSearchText(`${bestAccount.code} - ${bestAccount.nameAr}`);
      }
    }
  }, [leafAccounts, accounts, selectedAccountId, activeDatabase]);

  // Load ledger data
  const loadData = useCallback(async () => {
    if (!selectedAccountId) return;
    setLoading(true);
    try {
      const res = await fetchStatementOfAccount(
        selectedAccountId,
        startDate || undefined,
        endDate || undefined,
        selectedCostCenter,
        selectedDimension
      );
      setData(res);
    } catch (err) {
      console.error('Failed to load statement of account:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchStatementOfAccount, selectedAccountId, startDate, endDate, selectedCostCenter, selectedDimension]);

  useEffect(() => {
    if (selectedAccountId) {
      loadData();
    }
  }, [loadData, selectedAccountId]);

  // Filter leaf accounts for autocomplete
  const filteredLeafAccounts = useMemo(() => {
    if (!accountSearchText.trim()) return leafAccounts.slice(0, 30);
    const q = accountSearchText.toLowerCase();
    return leafAccounts
      .filter(a => a.code.toLowerCase().includes(q) || a.nameAr.toLowerCase().includes(q))
      .slice(0, 40);
  }, [leafAccounts, accountSearchText]);

  // Luxury Branded Excel (.xlsx) Export Engine using ExcelJS
  const handleExportExcel = async () => {
    if (!data) return;
    setIsExporting(true);

    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'ECO ERP - ترابط';
      workbook.created = new Date();
      workbook.modified = new Date();

      const worksheet = workbook.addWorksheet('كشف الحساب التفصيلي', {
        views: [{ rtl: true, rightToLeft: true, showGridLines: true } as any]
      });

      const cleanAccountId = String(data.level5Id || selectedAccountId || '').replace(/^L[1-5]-/i, '');
      const costCenterObj = selectedCostCenter !== undefined ? costCenters.find(c => String(c.id) === String(selectedCostCenter)) : undefined;
      const dimensionObj = selectedDimension !== undefined ? dimensions.find(d => String(d.id) === String(selectedDimension)) : undefined;
      const costCenterLabel = costCenterObj ? costCenterObj.nameAr : t('عام / كافة المراكز', 'All Cost Centers');
      const dimensionLabel = dimensionObj ? dimensionObj.nameAr : t('كافة الحسابات التحليلية', 'All Sub-Ledgers');

      // 1. Company Brand Header (Row 1)
      worksheet.mergeCells('A1:I1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'شركة ترابط للمقاولات والتجارة - منظومة إدارة الموارد المؤسسية الذكية ECO';
      titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(1).height = 36;

      // Brand Sub-Header (Row 2)
      worksheet.mergeCells('A2:I2');
      const subCell = worksheet.getCell('A2');
      subCell.value = `كشف الحساب التفصيلي والتحليلي للأستاذ المساعد: ${data.accountNameAr} (${cleanAccountId})`;
      subCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFD97706' } };
      subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
      subCell.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(2).height = 28;

      // Row 3 Spacing
      worksheet.addRow([]);
      worksheet.getRow(3).height = 10;

      // 2. Report Parameters & Metadata Box (Rows 4 & 5)
      worksheet.mergeCells('A4:B4');
      worksheet.getCell('A4').value = 'اسم ورقم الحساب:';
      worksheet.mergeCells('C4:D4');
      worksheet.getCell('C4').value = `${data.accountNameAr} (${cleanAccountId})`;
      worksheet.getCell('E4').value = 'مركز التكلفة:';
      worksheet.getCell('F4').value = costCenterLabel;
      worksheet.getCell('G4').value = 'تاريخ الاستخراج:';
      worksheet.mergeCells('H4:I4');
      worksheet.getCell('H4').value = new Date().toLocaleString('ar-EG');

      worksheet.mergeCells('A5:B5');
      worksheet.getCell('A5').value = 'الفترة المحاسبية:';
      worksheet.mergeCells('C5:D5');
      worksheet.getCell('C5').value = `من ${startDate} إلى ${endDate}`;
      worksheet.getCell('E5').value = 'الحساب التحليلي:';
      worksheet.getCell('F5').value = dimensionLabel;
      worksheet.getCell('G5').value = 'قاعدة البيانات:';
      worksheet.mergeCells('H5:I5');
      worksheet.getCell('H5').value = activeDatabase;

      [4, 5].forEach(rowNum => {
        const row = worksheet.getRow(rowNum);
        row.height = 24;
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          if (colNumber <= 9) {
            cell.font = { name: 'Arial', size: 10, bold: colNumber % 2 !== 0 };
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
      worksheet.getRow(6).height = 10;

      // 3. Financial Balance Summary Cards (Rows 7 & 8)
      worksheet.mergeCells('A7:B7');
      worksheet.getCell('A7').value = 'رصيد أول المدة المنقول';
      worksheet.mergeCells('C7:D7');
      worksheet.getCell('C7').value = 'إجمالي حركات المدين (+)';
      worksheet.mergeCells('E7:F7');
      worksheet.getCell('E7').value = 'إجمالي حركات الدائن (-)';
      worksheet.mergeCells('G7:I7');
      worksheet.getCell('G7').value = 'الرصيد الختامي الحالي';

      worksheet.getRow(7).height = 24;
      [
        { range: 'A7:B7', color: 'FF475569', bg: 'FFF1F5F9' },
        { range: 'C7:D7', color: 'FF047857', bg: 'FFECFDF5' },
        { range: 'E7:F7', color: 'FFB91C1C', bg: 'FFFEF2F2' },
        { range: 'G7:I7', color: 'FFB45309', bg: 'FFFFFBEB' }
      ].forEach(box => {
        const cell = worksheet.getCell(box.range.split(':')[0]);
        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: box.color } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: box.bg } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      worksheet.mergeCells('A8:B8');
      worksheet.getCell('A8').value = data.openingBalance;
      worksheet.mergeCells('C8:D8');
      worksheet.getCell('C8').value = data.totalDebit;
      worksheet.mergeCells('E8:F8');
      worksheet.getCell('E8').value = data.totalCredit;
      worksheet.mergeCells('G8:I8');
      worksheet.getCell('G8').value = data.endingBalance;

      worksheet.getRow(8).height = 32;
      [
        { cell: 'A8', color: 'FF0F172A', bg: 'FFF8FAFC' },
        { cell: 'C8', color: 'FF059669', bg: 'FFF0FDF4' },
        { cell: 'E8', color: 'FFDC2626', bg: 'FFFFF1F2' },
        { cell: 'G8', color: data.endingBalance >= 0 ? 'FFD97706' : 'FFDC2626', bg: 'FFFEF3C7' }
      ].forEach(box => {
        const c = worksheet.getCell(box.cell);
        c.font = { name: 'Arial', size: 13, bold: true, color: { argb: box.color } };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: box.bg } };
        c.numFmt = '#,##0.00 "جم";(#,##0.00 "جم");"-"';
        c.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      ['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7', 'I7',
       'A8', 'B8', 'C8', 'D8', 'E8', 'F8', 'G8', 'H8', 'I8'].forEach(addr => {
        worksheet.getCell(addr).border = {
          top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
        };
      });

      // Row 9 Spacing
      worksheet.addRow([]);
      worksheet.getRow(9).height = 12;

      // 4. Data Headers (Row 10)
      const headerRow = worksheet.addRow([
        'التاريخ',
        'رقم القيد',
        'نوع المعاملة',
        'البيان والشرح التفصيلي',
        'مركز التكلفة',
        'الحساب التحليلي',
        'مدين',
        'دائن',
        'الرصيد المتحرك'
      ]);
      headerRow.height = 32;
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

      // 5. Data Rows
      // 5.1 Opening Balance Row
      const openingRow = worksheet.addRow([
        startDate,
        '---',
        'رصيد افتتاحي',
        'رصيد أول المدة المنقول للحساب',
        costCenterLabel,
        dimensionLabel,
        data.openingBalance >= 0 ? data.openingBalance : 0,
        data.openingBalance < 0 ? Math.abs(data.openingBalance) : 0,
        data.openingBalance
      ]);
      openingRow.height = 24;
      openingRow.eachCell((cell, colNumber) => {
        cell.font = { name: 'Arial', size: 10, bold: colNumber >= 4 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF9C3' } };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };
        if (colNumber <= 3) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else if (colNumber <= 6) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
        } else {
          cell.numFmt = '#,##0.00 "جم";(#,##0.00 "جم");"-"';
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
        }
      });

      // 5.2 Transaction Rows
      data.transactions.forEach((tx, idx) => {
        const isEven = idx % 2 === 0;
        const txRow = worksheet.addRow([
          tx.noteDate,
          tx.noteNo ? `#${tx.noteNo}` : '---',
          tx.voucherType || 'قيود عامة',
          tx.description || '',
          tx.costCenterNameAr || 'عام / غير مخصص',
          tx.analysisNameAr || 'حساب عام',
          tx.debit || 0,
          tx.credit || 0,
          tx.runningBalance || 0
        ]);
        txRow.height = 24;

        txRow.eachCell((cell, colNumber) => {
          cell.font = { name: 'Arial', size: 10 };
          if (isEven) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
          }
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
          };

          if (colNumber <= 3) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else if (colNumber <= 6) {
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
          } else {
            cell.numFmt = '#,##0.00 "جم";(#,##0.00 "جم");"-"';
            cell.alignment = { horizontal: 'right', vertical: 'middle' };

            if (colNumber === 7 && tx.debit > 0) {
              cell.font = { name: 'Arial', size: 10, color: { argb: 'FF0F766E' } };
            } else if (colNumber === 8 && tx.credit > 0) {
              cell.font = { name: 'Arial', size: 10, color: { argb: 'FF991B1B' } };
            } else if (colNumber === 9) {
              cell.font = {
                name: 'Arial',
                size: 10,
                bold: true,
                color: { argb: tx.runningBalance < 0 ? 'FF991B1B' : 'FF0F172A' }
              };
            }
          }
        });
      });

      // 6. Grand Totals Row
      const totalRow = worksheet.addRow([
        'إجمالي حركات الفترة والرصيد الختامي',
        '',
        '',
        '',
        '',
        '',
        data.totalDebit,
        data.totalCredit,
        data.endingBalance
      ]);
      worksheet.mergeCells(`A${totalRow.number}:F${totalRow.number}`);
      totalRow.height = 30;

      totalRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber <= 9) {
          cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF0F172A' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFD97706' } },
            bottom: { style: 'double', color: { argb: 'FFD97706' } },
            left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
            right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
          };
          if (colNumber === 1) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else if (colNumber >= 7) {
            cell.numFmt = '#,##0.00 "جم";(#,##0.00 "جم");"-"';
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
            if (colNumber === 9 && data.endingBalance < 0) {
              cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF991B1B' } };
            }
          }
        }
      });

      // 7. Auto-fit Column Widths
      const colWidths = [15, 16, 16, 48, 26, 22, 18, 18, 20];
      colWidths.forEach((w, idx) => {
        worksheet.getColumn(idx + 1).width = w;
      });

      // 8. Generate & Download File
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const filename = `كشف_حساب_${cleanAccountId}_${endDate}.xlsx`;
      saveAs(blob, filename);

      toast.success(
        t('تم تصدير كشف الحساب الفاخر بنجاح', 'Luxury statement workbook exported successfully'),
        `${data.accountNameAr} (${filename})`
      );
    } catch (err: any) {
      console.error('[ExcelJS Export Error]:', err);
      toast.error(
        t('فشل تصدير كشف الحساب', 'Failed to export statement'),
        err?.message || 'Error creating Excel workbook'
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Filter and Actions Toolbar */}
      <div className="bg-white dark:bg-[#17231A] rounded-3xl border border-[#E0D9CB] dark:border-[#243628] p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Header Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1F2E23] text-[#EBB34D] flex items-center justify-center border border-[#243628] shadow-xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
                <span>{t('كشف الحساب التفصيلي والتحليلي', 'Statement of Account / Sub-Ledger')}</span>
                {data && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#2A3F30] text-[#A3CFAC] font-bold border border-[#3E5C46]">
                    {data.accountNameAr} ({String(data.level5Id || '').replace(/^L[1-5]-/i, '')})
                  </span>
                )}
              </h2>
              <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                {t(
                  'استعراض الحركات المالية للأستاذ المساعد واحتساب الرصيد التراكمي المتحرك فصلاً فصلاً',
                  'Sub-ledger statement with running dynamic balance calculations and transaction drill-down'
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading || !selectedAccountId}
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
              <span>{t('طباعة كشف الحساب', 'Print Statement')}</span>
            </button>
          </div>
        </div>

        {/* Filter Selection Grid */}
        <div className="mt-5 pt-4 border-t border-[#E0D9CB]/60 dark:border-[#243628] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Account Autocomplete Selector */}
          <div className="relative">
            <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
              <span className="flex items-center gap-1">
                <Search className="w-3 h-3 text-[#EBB34D]" />
                {t('الحساب المالي (المستوى 5):', 'Financial Account (Level 5):')}
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={accountSearchText}
                onChange={e => {
                  setAccountSearchText(e.target.value);
                  setIsAccountDropdownOpen(true);
                }}
                onFocus={() => setIsAccountDropdownOpen(true)}
                placeholder={t('ابحث برقم أو اسم الحساب...', 'Search account...')}
                className="w-full h-10 px-3 pr-8 rounded-xl text-xs font-bold border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#121A13] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] focus:ring-1 focus:ring-[#EBB34D] focus:outline-hidden"
              />
              <ChevronDown className="w-4 h-4 text-gray-400 absolute left-2.5 top-3 pointer-events-none" />
            </div>

            {/* Dropdown Options */}
            {isAccountDropdownOpen && (
              <div className="absolute z-30 mt-1 w-full max-h-60 overflow-y-auto rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] shadow-xl p-1 divide-y divide-gray-100 dark:divide-gray-800">
                {filteredLeafAccounts.map(acc => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => {
                      setSelectedAccountId(acc.code);
                      setAccountSearchText(`${acc.code} - ${acc.nameAr}`);
                      setIsAccountDropdownOpen(false);
                    }}
                    className="w-full text-right p-2.5 rounded-xl hover:bg-[#1F2E23] transition-colors flex items-center justify-between text-xs cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{acc.nameAr}</div>
                      <div className="font-mono text-[10px] text-gray-500">{acc.code}</div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#121B14] border border-[#243628] text-[#8FA392] font-mono">
                      م{acc.level}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Range: From */}
          <div>
            <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#EBB34D]" />
                {t('من تاريخ:', 'From Date:')}
              </span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full h-10 px-3 rounded-xl text-xs font-mono font-bold border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#121A13] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] focus:ring-1 focus:ring-[#EBB34D] focus:outline-hidden"
            />
          </div>

          {/* Date Range: To */}
          <div>
            <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#EBB34D]" />
                {t('إلى تاريخ:', 'To Date:')}
              </span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full h-10 px-3 rounded-xl text-xs font-mono font-bold border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#121A13] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] focus:ring-1 focus:ring-[#EBB34D] focus:outline-hidden"
            />
          </div>

          {/* Cost Center / Analytical Sub-ledger */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1 truncate">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-[#EBB34D]" />
                  {t('مركز التكلفة', 'Cost Center')}
                </span>
              </label>
              <select
                value={selectedCostCenter ?? ''}
                onChange={e => setSelectedCostCenter(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full h-10 px-2 rounded-xl text-xs font-bold border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#121A13] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] focus:ring-1 focus:ring-[#EBB34D] focus:outline-hidden cursor-pointer"
              >
                <option value="">{t('الكل', 'All')}</option>
                {costCenters.map(cc => (
                  <option key={cc.id} value={cc.id}>
                    {cc.code} - {cc.nameAr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1 truncate">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3 text-[#EBB34D]" />
                  {t('التحليلي', 'Dimension')}
                </span>
              </label>
              <select
                value={selectedDimension ?? ''}
                onChange={e => setSelectedDimension(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full h-10 px-2 rounded-xl text-xs font-bold border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#121A13] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] focus:ring-1 focus:ring-[#EBB34D] focus:outline-hidden cursor-pointer"
              >
                <option value="">{t('الكل', 'All')}</option>
                {dimensions.map(dim => (
                  <option key={dim.id} value={dim.id}>
                    {dim.nameAr}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Account Balance Summary Cards */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Opening Balance */}
          <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] shadow-xs">
            <span className="text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] block mb-1">
              {t('رصيد أول المدة المنقول', 'Opening Balance')}
            </span>
            <div className="text-xl font-black font-mono text-[#1A241C] dark:text-[#F3EFE6]">
              {formatEGP(Math.abs(data.openingBalance))} <span className="text-xs font-sans">جم</span>
            </div>
            <div className="mt-1 text-[11px] font-bold text-gray-500">
              {data.openingBalance >= 0 ? 'طبيعة الرصيد: مدين (Debit)' : 'طبيعة الرصيد: دائن (Credit)'}
            </div>
          </div>

          {/* Total Period Debit */}
          <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] shadow-xs">
            <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 block mb-1">
              {t('إجمالي حركات الفترة (مدين)', 'Total Period Debit')}
            </span>
            <div className="text-xl font-black font-mono text-blue-800 dark:text-blue-300">
              {formatEGP(data.totalDebit)} <span className="text-xs font-sans">جم</span>
            </div>
            <div className="mt-1 text-[11px] font-bold text-blue-600 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>إيداعات ومستحقات مسجلة</span>
            </div>
          </div>

          {/* Total Period Credit */}
          <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] shadow-xs">
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block mb-1">
              {t('إجمالي حركات الفترة (دائن)', 'Total Period Credit')}
            </span>
            <div className="text-xl font-black font-mono text-amber-800 dark:text-amber-300">
              {formatEGP(data.totalCredit)} <span className="text-xs font-sans">جم</span>
            </div>
            <div className="mt-1 text-[11px] font-bold text-amber-600 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>مدفوعات وتسويات مسجلة</span>
            </div>
          </div>

          {/* Ending Balance */}
          <div className={`p-4 rounded-2xl border shadow-xs transition-colors ${
            data.endingBalance < 0
              ? 'border-rose-400 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/30'
              : 'border-[#243628] bg-white dark:bg-[#17231A]'
          }`}>
            <span className={`text-[11px] font-bold block mb-1 ${
              data.endingBalance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-[#EBB34D]'
            }`}>
              {t('الرصيد الختامي الحالي', 'Current Ending Balance')}
            </span>
            <div className={`text-xl font-black font-mono tabular-nums ${
              data.endingBalance < 0 ? 'text-rose-700 dark:text-rose-400' : 'text-[#1A241C] dark:text-[#F3EFE6]'
            }`} dir="ltr">
              {formatAccountingNumber(data.endingBalance, 'جم')}
            </div>
            <div className={`mt-1 text-[11px] font-bold ${
              data.endingBalance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-[#5C665E] dark:text-[#8FA392]'
            }`}>
              {data.endingBalance >= 0 ? 'رصيد ختامي مدين (+ Debit)' : 'رصيد ختامي دائن (- Credit)'}
            </div>
          </div>
        </div>
      )}

      {/* Granular Sub-Ledger Table */}
      <div className="bg-white dark:bg-[#17231A] rounded-3xl border border-[#E0D9CB] dark:border-[#243628] shadow-xs overflow-hidden">
        <div className="p-4 bg-[#FBF9F5] dark:bg-[#1D2B20] border-b border-[#E0D9CB] dark:border-[#243628] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#EBB34D]" />
            <h3 className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6]">
              {t('حركات دفتر الأستاذ التفصيلي والرصيد التراكمي المتحرك', 'Detailed Sub-Ledger Movements & Running Balance')}
            </h3>
          </div>
          <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
            انقر على أي صف لمعاينة تفاصيل المستند الأصلي
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E0D9CB] dark:border-[#243628] bg-[#F4EFE6] dark:bg-[#1A271C] font-black text-[#1A241C] dark:text-[#F3EFE6]">
                <th className="py-3 px-3 w-24">{t('التاريخ', 'Date')}</th>
                <th className="py-3 px-3 w-24">{t('رقم القيد', 'Entry No')}</th>
                <th className="py-3 px-3 w-28">{t('نوع المعاملة', 'Type')}</th>
                <th className="py-3 px-4 min-w-[220px]">{t('البيان والشرح التفصيلي', 'Description')}</th>
                <th className="py-3 px-3 w-32">{t('مركز التكلفة', 'Cost Center')}</th>
                <th className="py-3 px-3 w-28 text-left font-mono">{t('مدين', 'Debit')}</th>
                <th className="py-3 px-3 w-28 text-left font-mono">{t('دائن', 'Credit')}</th>
                <th className="py-3 px-4 w-36 text-left font-mono bg-[#1F2E23] text-[#EBB34D] border-l border-[#243628]">
                  {t('الرصيد المتحرك', 'Running Balance')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CB]/50 dark:divide-[#243628]/50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#5C665E]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#EBB34D]" />
                      <span className="font-bold text-xs">{t('جارٍ جلب قيود وحركات دفتر الأستاذ...', 'Loading sub-ledger movements...')}</span>
                    </div>
                  </td>
                </tr>
              ) : !data || data.transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#5C665E]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Info className="w-8 h-8 text-gray-400" />
                      <span className="font-bold">{t('لا توجد حركات مسجلة لهذا الحساب خلال الفترة المحددة.', 'No movements found for this account in the selected period.')}</span>
                      {data && data.openingBalance !== 0 && (
                        <span className="text-xs text-[#EBB34D] font-mono">
                          يوجد رصيد افتتاحي منقول قدره: {formatEGP(data.openingBalance)} جم
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {/* Opening Balance Row */}
                  <tr className="bg-amber-500/10 font-bold text-amber-950 dark:text-amber-200">
                    <td className="py-2.5 px-3 font-mono">{startDate}</td>
                    <td className="py-2.5 px-3 font-mono text-gray-400">---</td>
                    <td className="py-2.5 px-3">رصيد أول المدة</td>
                    <td className="py-2.5 px-4">رصيد مرحل من فترات محاسبية سابقة</td>
                    <td className="py-2.5 px-3 text-gray-400">---</td>
                    <td className="py-2.5 px-3 text-left font-mono" dir="ltr">
                      {data.openingBalance >= 0 ? formatEGP(data.openingBalance) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-left font-mono" dir="ltr">
                      {data.openingBalance < 0 ? formatEGP(Math.abs(data.openingBalance)) : '-'}
                    </td>
                    <td className={`py-2.5 px-4 text-left font-mono font-black tabular-nums whitespace-nowrap ${
                      data.openingBalance < 0
                        ? 'text-rose-600 dark:text-rose-400 text-negative-balance'
                        : 'text-[#1A241C] dark:text-[#F3EFE6]'
                    }`} dir="ltr">
                      {formatAccountingNumber(data.openingBalance)}
                    </td>
                  </tr>

                  {/* Transaction Rows */}
                  {data.transactions.map((tx, idx) => (
                    <tr
                      key={tx.id || idx}
                      onClick={() => setInspectingLine(tx)}
                      className="hover:bg-[#1F2E23]/60 transition-colors cursor-pointer group"
                    >
                      {/* Date */}
                      <td className="py-2.5 px-3 font-mono text-gray-600 dark:text-gray-400">
                        {tx.noteDate}
                      </td>

                      {/* Entry No */}
                      <td className="py-2.5 px-3 font-mono">
                        <span className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold">
                          #{tx.noteNo}
                        </span>
                      </td>

                      {/* Voucher Type */}
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2A3F30] border border-[#3E5C46] text-[#A3CFAC]">
                          {tx.voucherType || 'قيد تسوية'}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-2.5 px-4 font-medium text-[#1A241C] dark:text-[#EAE4D7]">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#EBB34D] transition-colors" />
                          <span>{tx.description}</span>
                        </div>
                      </td>

                      {/* Cost Center */}
                      <td className="py-2.5 px-3 text-gray-600 dark:text-gray-400">
                        {tx.costCenterNameAr || '-'}
                      </td>

                      {/* Debit */}
                      <td className="py-2.5 px-3 text-left font-mono font-bold text-blue-700 dark:text-blue-300" dir="ltr">
                        {tx.debit > 0 ? formatEGP(tx.debit) : '-'}
                      </td>

                      {/* Credit */}
                      <td className="py-2.5 px-3 text-left font-mono font-bold text-amber-700 dark:text-amber-300" dir="ltr">
                        {tx.credit > 0 ? formatEGP(tx.credit) : '-'}
                      </td>

                      {/* Running Balance */}
                      <td className={`py-2.5 px-4 text-left font-mono font-black tabular-nums bg-[#1F2E23]/20 whitespace-nowrap ${
                        tx.runningBalance < 0
                          ? 'text-rose-600 dark:text-rose-400 text-negative-balance'
                          : 'text-[#1A241C] dark:text-[#F3EFE6]'
                      }`} dir="ltr">
                        {formatAccountingNumber(tx.runningBalance)}
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>

            {/* Table Footer Totals */}
            {data && data.transactions.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-[#1A241C] dark:border-[#F3EFE6] bg-[#EAE4D7] dark:bg-[#1D2B20] font-black text-[#1A241C] dark:text-[#F3EFE6] text-xs">
                  <td colSpan={5} className="py-3 px-4 text-right">
                    <span>{t('إجمالي حركات الفترة والرصيد الختامي المستحق', 'Period Totals and Ending Balance')}</span>
                  </td>
                  <td className="py-3 px-3 text-left font-mono text-blue-800 dark:text-blue-300" dir="ltr">
                    {formatEGP(data.totalDebit)}
                  </td>
                  <td className="py-3 px-3 text-left font-mono text-amber-800 dark:text-amber-300" dir="ltr">
                    {formatEGP(data.totalCredit)}
                  </td>
                  <td className={`py-3 px-4 text-left font-mono font-black tabular-nums text-sm whitespace-nowrap ${
                    data.endingBalance < 0
                      ? 'text-rose-600 dark:text-rose-400 text-negative-balance'
                      : 'text-[#EBB34D]'
                  }`} dir="ltr">
                    {formatAccountingNumber(data.endingBalance)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Transaction Inspection Drill-Down Modal */}
      {inspectingLine && (
        <Modal
          isOpen={true}
          onClose={() => setInspectingLine(null)}
          maxWidth="max-w-lg"
          title={t('تفاصيل القيد المحاسبي المرجعي', 'Underlying Accounting Entry Details')}
          icon={FileText}
          footer={
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={() => setInspectingLine(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold border border-[#243628] bg-[#1F2E23] text-[#8FA392] hover:text-[#F3EFE6] transition-colors cursor-pointer"
              >
                {t('إغلاق', 'Close')}
              </button>
            </div>
          }
        >
          <div className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#121B14] border border-[#243628]">
              <div>
                <span className="text-[10px] text-[#8FA392] block">رقم القيد / السند:</span>
                <span className="font-mono font-bold text-sm text-[#EBB34D]">#{inspectingLine.noteNo}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8FA392] block">تاريخ القيد:</span>
                <span className="font-mono font-bold text-[#F3EFE6]">{inspectingLine.noteDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8FA392] block">نوع المعاملة:</span>
                <span className="font-bold text-[#F3EFE6]">{inspectingLine.voucherType || 'قيد تسوية عام'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8FA392] block">مركز التكلفة المرتبط:</span>
                <span className="font-bold text-[#F3EFE6]">{inspectingLine.costCenterNameAr || 'عام'}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-[#8FA392] block mb-1">البيان والشرح المحاسبي:</span>
              <p className="p-3 rounded-xl bg-[#121B14] border border-[#243628] font-medium text-[#F3EFE6]">
                {inspectingLine.description}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="p-2.5 rounded-xl bg-[#121B14] border border-blue-900/40">
                <span className="text-[10px] text-blue-400 block">المبلغ المدين</span>
                <span className="font-mono font-black text-sm text-blue-300">
                  {formatEGP(inspectingLine.debit)} جم
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#121B14] border border-[#5C431D]">
                <span className="text-[10px] text-[#EBB34D] block">المبلغ الدائن</span>
                <span className="font-mono font-black text-sm text-[#EBB34D]">
                  {formatEGP(inspectingLine.credit)} جم
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#121B14] border border-[#3E5C46]">
                <span className="text-[10px] text-[#A3CFAC] block">الرصيد بعد الحركة</span>
                <span className="font-mono font-black text-sm text-[#A3CFAC]">
                  {formatEGP(inspectingLine.runningBalance)} جم
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Official Print Preview Modal */}
      <ReportPrintLayout
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        hideFooter={true}
        programmaticPagination={true}
        orientation={printOrientation}
        onOrientationChange={setPrintOrientation}
        titleAr={`كشف حساب: ${data?.accountNameAr || ''} (${data?.level5Id || ''})`}
        titleEn={`Statement of Account - ${data?.level5Id || ''}`}
        periodText={`من ${startDate || '01-01-2026'} إلى ${endDate && !endDate.includes('2020') ? endDate : '31-12-2026'}`}
        subtitleAr="حساب الأستاذ العام"
        printedByName={(currentUser as any)?.displayName || currentUser?.nameAr || currentUser?.nameEn || 'يوسف حجازي'}
      >
        {data && (
          <div className="print-document flex flex-col items-center gap-6 print:gap-0 print:block w-full">
            {printPages.map((page, pageIndex) => {
              const isFirstPage = page.isFirst;
              const isLastPage = page.isLast;
              const printedByName = (currentUser as any)?.displayName || currentUser?.nameAr || currentUser?.nameEn || 'يوسف حجازي';

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
                              كشف حساب: {data?.accountNameAr || ''} ({data?.level5Id || ''})
                            </div>
                            <div className="text-[10px] print:text-[9px] font-bold text-slate-600 print:text-black">
                              Statement of Account - {data?.level5Id || ''}
                            </div>
                            <div className="text-[9px] print:text-[8px] text-slate-500 print:text-gray-600 mt-0.5">
                              معايير المحاسبة المصرية (EAS) والدولية (IFRS)
                            </div>
                            <div className="text-[9px] print:text-[8px] font-mono text-slate-600 mt-0.5 print:text-black">
                              من {startDate || '01-01-2026'} إلى {endDate && !endDate.includes('2020') ? endDate : '31-12-2026'}
                            </div>
                          </div>
                        </div>

                        {/* Subtitle / Filter notes / Metadata 3-Way Realignment */}
                        <div className="grid grid-cols-3 items-center text-xs print:text-[10px] text-slate-600 pb-1 border-b border-slate-200 print:border-slate-300">
                          <div className="text-right font-bold text-slate-800 print:text-black">
                            حساب الأستاذ العام
                          </div>
                          <div className="text-center font-mono text-[10px] text-slate-700 print:text-black font-semibold">
                            تاريخ الإصدار: 2026-10-13
                          </div>
                          <div className="text-left font-bold text-slate-800 print:text-black">
                            {printedByName}
                          </div>
                        </div>

                        {/* Page 1: 4 KPI Summary Cards STRICTLY at the TOP above the table */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs print:text-[10px] p-2 print:py-1.5 print:px-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold overflow-hidden">
                          <div className="p-2 print:py-1 print:px-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900">
                            <span className="block text-[10px] print:text-[9px] text-slate-600 mb-0.5 font-bold">
                              رصيد أول المدة:
                            </span>
                            <span dir="ltr" className="font-mono text-xs print:text-[11px] font-bold text-slate-900 inline-block whitespace-nowrap">
                              {data.openingBalance < 0
                                ? `(${formatEGP(Math.abs(data.openingBalance))} جم)`
                                : `${formatEGP(data.openingBalance)} جم`}
                            </span>
                          </div>
                          <div className="p-2 print:py-1 print:px-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900">
                            <span className="block text-[10px] print:text-[9px] text-slate-600 mb-0.5 font-bold">
                              إجمالي المدين:
                            </span>
                            <span dir="ltr" className="font-mono text-xs print:text-[11px] font-bold text-blue-900 inline-block whitespace-nowrap">
                              {formatEGP(data.totalDebit)} جم
                            </span>
                          </div>
                          <div className="p-2 print:py-1 print:px-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900">
                            <span className="block text-[10px] print:text-[9px] text-slate-600 mb-0.5 font-bold">
                              إجمالي الدائن:
                            </span>
                            <span dir="ltr" className="font-mono text-xs print:text-[11px] font-bold text-amber-900 inline-block whitespace-nowrap">
                              {formatEGP(data.totalCredit)} جم
                            </span>
                          </div>
                          <div
                            className={`p-2 print:py-1 print:px-1.5 rounded-lg border ${
                              data.endingBalance < 0
                                ? 'bg-rose-50 border-rose-300 text-rose-700'
                                : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          >
                            <span
                              className={`block text-[10px] print:text-[9px] mb-0.5 font-bold ${
                                data.endingBalance < 0
                                  ? 'text-rose-700'
                                  : 'text-slate-600'
                              }`}
                            >
                              الرصيد الختامي:
                            </span>
                            <span
                              dir="ltr"
                              className="font-mono text-xs print:text-[11px] font-bold inline-block whitespace-nowrap"
                            >
                              {formatAccountingNumber(data.endingBalance, 'جم')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-1 text-slate-700 text-xs shrink-0 print:border-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 print:text-black">شركة ترابط للمقاولات والتجارة</span>
                          <span className="text-slate-400 print:text-slate-500">|</span>
                          <span className="font-medium text-slate-700 print:text-black">
                            كشف حساب: {data?.accountNameAr || ''} ({data?.level5Id || ''})
                          </span>
                          <span className="text-slate-400 print:text-slate-500">|</span>
                          <span className="font-mono text-[10px] text-slate-600 print:text-black">
                            من {startDate || '01-01-2026'} إلى {endDate && !endDate.includes('2020') ? endDate : '31-12-2026'}
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
                          <col style={{ width: '11%' }} /> {/* التاريخ */}
                          <col style={{ width: '8%' }} />  {/* رقم القيد */}
                          <col style={{ width: '11%' }} /> {/* نوع السند */}
                          <col style={{ width: '37%' }} /> {/* البيان */}
                          <col style={{ width: '11%' }} /> {/* مدين */}
                          <col style={{ width: '11%' }} /> {/* دائن */}
                          <col style={{ width: '11%' }} /> {/* الرصيد */}
                        </colgroup>
                        <thead className="bg-slate-100 print:bg-slate-200 text-slate-800 text-[10px] font-bold">
                          <tr className="border-b border-slate-300 print:border-slate-400">
                            <th className="w-[11%] py-1.5 px-1 border-b border-l border-slate-300 print:border-slate-400 text-center font-bold align-middle">
                              التاريخ
                            </th>
                            <th className="w-[8%] py-1.5 px-1 border-b border-l border-slate-300 print:border-slate-400 text-center font-bold align-middle whitespace-nowrap">
                              رقم القيد
                            </th>
                            <th className="w-[11%] py-1.5 px-1 border-b border-l border-slate-300 print:border-slate-400 text-center font-bold align-middle whitespace-nowrap">
                              نوع السند
                            </th>
                            <th className="w-[37%] py-1.5 px-2 border-b border-l border-slate-300 print:border-slate-400 text-center font-bold align-middle">
                              البيان
                            </th>
                            <th className="w-[11%] py-1.5 px-1 border-b border-l border-slate-300 print:border-slate-400 text-center font-bold align-middle font-mono">
                              مدين
                            </th>
                            <th className="w-[11%] py-1.5 px-1 border-b border-l border-slate-300 print:border-slate-400 text-center font-bold align-middle font-mono">
                              دائن
                            </th>
                            <th className="w-[11%] py-1.5 px-1 border-b border-slate-300 print:border-slate-400 text-center font-bold align-middle font-mono">
                              الرصيد
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 print:divide-slate-300 text-[9.5px]">
                          {/* If Page 1: Opening Balance Row */}
                          {isFirstPage && (
                            <tr
                              className="h-6 border-b border-slate-300 font-bold bg-slate-50 print:bg-slate-100/60 text-slate-900"
                              style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
                            >
                              <td className="font-mono text-center align-middle py-1 px-1 border-b border-l border-slate-300 print:border-slate-400">
                                {startDate}
                              </td>
                              <td className="font-mono text-center align-middle py-1 px-1 border-b border-l border-slate-300 print:border-slate-400">
                                -
                              </td>
                              <td className="text-center align-middle py-1 px-1 whitespace-nowrap border-b border-l border-slate-300 print:border-slate-400 font-bold">
                                رصيد أول المدة
                              </td>
                              <td className="text-center align-middle px-2 overflow-hidden text-ellipsis whitespace-nowrap border-b border-l border-slate-300 print:border-slate-400">
                                رصيد مرحل من فترات محاسبية سابقة
                              </td>
                              <td className="overflow-hidden whitespace-nowrap text-ellipsis font-mono text-center align-middle py-1 px-1 tabular-nums border-b border-l border-slate-300 print:border-slate-400 text-blue-900" dir="ltr">
                                {data.openingBalance >= 0 ? formatEGP(data.openingBalance) : '-'}
                              </td>
                              <td className="overflow-hidden whitespace-nowrap text-ellipsis font-mono text-center align-middle py-1 px-1 tabular-nums border-b border-l border-slate-300 print:border-slate-400 text-amber-900" dir="ltr">
                                {data.openingBalance < 0 ? formatEGP(Math.abs(data.openingBalance)) : '-'}
                              </td>
                              <td className="overflow-hidden whitespace-nowrap text-ellipsis font-mono text-center align-middle py-1 px-1 tabular-nums border-b border-slate-300 print:border-slate-400" dir="ltr">
                                <span className={`inline-block whitespace-nowrap font-mono text-center ${data.openingBalance < 0 ? 'text-rose-600 font-semibold' : 'text-slate-900'}`} dir="ltr">
                                  {formatAccountingNumber(data.openingBalance)}
                                </span>
                              </td>
                            </tr>
                          )}

                          {/* Transaction Rows */}
                          {page.rows.map((t, idx) => (
                            <tr
                              key={idx}
                              className={`h-6 border-b border-slate-200 print:border-slate-300 ${
                                idx % 2 === 1 ? 'bg-slate-50/50 print:bg-slate-100/40' : 'bg-white print:bg-white'
                              }`}
                              style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
                            >
                              <td className="font-mono text-center align-middle py-1 px-1 border-b border-l border-slate-200 print:border-slate-300">
                                {t.noteDate}
                              </td>
                              <td className="font-mono text-center align-middle py-1 px-1 border-b border-l border-slate-200 print:border-slate-300">
                                #{t.noteNo}
                              </td>
                              <td className="text-center align-middle py-1 px-1 whitespace-nowrap border-b border-l border-slate-200 print:border-slate-300">
                                {t.voucherType}
                              </td>
                              <td className="text-center align-middle px-2 overflow-hidden text-ellipsis whitespace-nowrap border-b border-l border-slate-200 print:border-slate-300">
                                <span className="truncate block" title={t.description}>{t.description}</span>
                              </td>
                              <td className="overflow-hidden whitespace-nowrap text-ellipsis font-mono text-center align-middle py-1 px-1 tabular-nums border-b border-slate-200 border-l border-slate-300 text-blue-900" dir="ltr">
                                {t.debit > 0 ? formatEGP(t.debit) : '-'}
                              </td>
                              <td className="overflow-hidden whitespace-nowrap text-ellipsis font-mono text-center align-middle py-1 px-1 tabular-nums border-b border-slate-200 border-l border-slate-300 text-amber-900" dir="ltr">
                                {t.credit > 0 ? formatEGP(t.credit) : '-'}
                              </td>
                              <td className="overflow-hidden whitespace-nowrap text-ellipsis font-mono text-center align-middle py-1 px-1 tabular-nums border-b border-slate-200 print:border-slate-300" dir="ltr">
                                <span className={`inline-block whitespace-nowrap font-mono text-center ${t.runningBalance < 0 ? 'text-rose-600 font-semibold' : 'text-slate-900'}`} dir="ltr">
                                  {formatAccountingNumber(t.runningBalance)}
                                </span>
                              </td>
                            </tr>
                          ))}

                          {/* If Last Page: Grand Total Row */}
                          {isLastPage && (
                            <tr
                              className="ledger-tail-row h-7 border-t-2 border-b-2 border-slate-800 bg-slate-200 print:bg-slate-300 font-black"
                              style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
                            >
                              <td colSpan={4} className="py-1 px-2 text-center align-middle font-black border-t-2 border-b-2 border-slate-800 border-l border-slate-300 print:border-slate-400 text-xs">
                                الإجمالي العام والرصيد الختامي
                              </td>
                              <td className="overflow-hidden whitespace-nowrap text-ellipsis font-mono text-center align-middle py-1 px-1 tabular-nums font-black border-t-2 border-b-2 border-slate-800 border-l border-slate-300 print:border-slate-400 text-blue-950" dir="ltr">
                                {formatEGP(data.totalDebit)}
                              </td>
                              <td className="overflow-hidden whitespace-nowrap text-ellipsis font-mono text-center align-middle py-1 px-1 tabular-nums font-black border-t-2 border-b-2 border-slate-800 border-l border-slate-300 print:border-slate-400 text-amber-950" dir="ltr">
                                {formatEGP(data.totalCredit)}
                              </td>
                              <td className="overflow-hidden whitespace-nowrap text-ellipsis font-mono text-center align-middle py-1 px-1 tabular-nums font-black border-t-2 border-b-2 border-slate-800 print:border-slate-400" dir="ltr">
                                <span className={`inline-block whitespace-nowrap font-mono text-center ${data.endingBalance < 0 ? 'text-rose-600' : 'text-slate-950'}`} dir="ltr">
                                  {formatAccountingNumber(data.endingBalance)}
                                </span>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 3. Bottom Section: Signatures on Last Page + Persistent Audit Bar on ALL Pages */}
                  <div className="mt-auto pt-2 shrink-0">
                    {isLastPage && (
                      <div className="grid grid-cols-3 gap-3 mb-2 print:gap-2 print:mb-1.5 shrink-0" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                        {/* 1. Accountant */}
                        <div className="border border-slate-300 print:border-slate-400 rounded-xl p-2.5 print:p-2 text-center bg-slate-50/50 print:bg-white flex flex-col justify-between min-h-[95px] print:min-h-[85px]">
                          <span className="font-bold text-xs text-slate-800 print:text-black block">المحاسب</span>
                          <div className="flex-1 min-h-[35px] print:min-h-[30px]"></div>
                          <span className="text-[10px] text-slate-600 print:text-black block" dir="rtl">
                            التاريخ: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          </span>
                        </div>

                        {/* 2. Internal Auditor */}
                        <div className="border border-slate-300 print:border-slate-400 rounded-xl p-2.5 print:p-2 text-center bg-slate-50/50 print:bg-white flex flex-col justify-between min-h-[95px] print:min-h-[85px]">
                          <span className="font-bold text-xs text-slate-800 print:text-black block">المراجع</span>
                          <div className="flex-1 min-h-[35px] print:min-h-[30px]"></div>
                          <span className="text-[10px] text-slate-600 print:text-black block" dir="rtl">
                            التاريخ: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          </span>
                        </div>

                        {/* 3. Executive Approval */}
                        <div className="border border-slate-300 print:border-slate-400 rounded-xl p-2.5 print:p-2 text-center bg-slate-50/50 print:bg-white flex flex-col justify-between min-h-[95px] print:min-h-[85px]">
                          <span className="font-bold text-xs text-slate-800 print:text-black block">يعتمد</span>
                          <div className="flex-1 min-h-[35px] print:min-h-[30px]"></div>
                          <span className="text-[10px] text-slate-600 print:text-black block" dir="rtl">
                            التاريخ: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Persistent Audit Bar on ALL pages */}
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
        )}
      </ReportPrintLayout>
    </div>
  );
};
