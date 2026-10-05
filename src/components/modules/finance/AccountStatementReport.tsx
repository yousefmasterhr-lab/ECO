import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useFinancial } from '../../../context/FinancialContext';
import { useDatabase } from '../../../services/federation/DatabaseContext';
import { getFiscalDateRange } from '../../../utils/fiscalYearHelper';
import { StatementOfAccountReportData, StatementOfAccountLine, AccountNode } from '../../../services/database/types';
import { ReportPrintLayout } from './ReportPrintLayout';
import { Modal, toast } from '@erp/ui-system';
import { exportToCsv, formatEGP } from '../../../utils/exportUtils';
import {
  BookOpen,
  Calendar,
  Search,
  RefreshCw,
  Printer,
  Download,
  Building2,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Info,
  FileText
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

  // Export to CSV
  const handleExportCsv = () => {
    if (!data) return;
    const headers = [
      'التاريخ',
      'رقم المستند/القيد',
      'نوع المعاملة',
      'البيان والشرح',
      'مركز التكلفة',
      'التحليلي',
      'مدين (جم)',
      'دائن (جم)',
      'الرصيد التراكمي المتحرك (جم)'
    ];

    const rows: (string | number)[][] = [];

    // Opening Balance row
    rows.push([
      startDate,
      '-',
      'رصيد افتتاحي',
      'رصيد أول المدة المنقول',
      '-',
      '-',
      data.openingBalance >= 0 ? data.openingBalance : 0,
      data.openingBalance < 0 ? Math.abs(data.openingBalance) : 0,
      data.openingBalance
    ]);

    // Transactions
    data.transactions.forEach(t => {
      rows.push([
        t.noteDate,
        t.noteNo,
        t.voucherType,
        t.description,
        t.costCenterNameAr || '-',
        t.analysisNameAr || '-',
        t.debit,
        t.credit,
        t.runningBalance
      ]);
    });

    // Summary row
    rows.push([
      endDate,
      '-',
      'إجمالي ختامي',
      'مجموع الحركات والرصيد الختامي',
      '-',
      '-',
      data.totalDebit,
      data.totalCredit,
      data.endingBalance
    ]);

    exportToCsv(`كشف_حساب_${data.level5Id}_${endDate}`, headers, rows);
    toast.success(
      t('تم تصدير كشف الحساب بنجاح', 'Statement exported successfully'),
      `${data.accountNameAr} (${data.transactions.length} ${t('حركة مسجلة', 'transactions')})`
    );
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
            <div className={`text-xl font-black font-mono ${
              data.endingBalance < 0 ? 'text-rose-700 dark:text-rose-400' : 'text-[#1A241C] dark:text-[#F3EFE6]'
            }`} dir="ltr">
              {data.endingBalance < 0
                ? `(${formatEGP(Math.abs(data.endingBalance))} جم)`
                : `${formatEGP(data.endingBalance)} جم`}
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
                    <td className="py-2.5 px-4 text-left font-mono font-black text-[#1A241C] dark:text-[#F3EFE6] whitespace-nowrap" dir="ltr">
                      {data.openingBalance < 0
                        ? `(${formatEGP(Math.abs(data.openingBalance))})`
                        : formatEGP(data.openingBalance)}
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
                      <td className="py-2.5 px-4 text-left font-mono font-black text-[#1A241C] dark:text-[#F3EFE6] bg-[#1F2E23]/20 whitespace-nowrap" dir="ltr">
                        {tx.runningBalance < 0
                          ? `(${formatEGP(Math.abs(tx.runningBalance))})`
                          : formatEGP(tx.runningBalance)}
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
                  <td colSpan={5} className="py-3 px-4 text-center">
                    <span>{t('إجمالي حركات الفترة والرصيد الختامي المستحق', 'Period Totals and Ending Balance')}</span>
                  </td>
                  <td className="py-3 px-3 text-left font-mono text-blue-800 dark:text-blue-300" dir="ltr">
                    {formatEGP(data.totalDebit)}
                  </td>
                  <td className="py-3 px-3 text-left font-mono text-amber-800 dark:text-amber-300" dir="ltr">
                    {formatEGP(data.totalCredit)}
                  </td>
                  <td className="py-3 px-4 text-left font-mono text-[#EBB34D] font-black text-sm whitespace-nowrap" dir="ltr">
                    {data.endingBalance < 0
                      ? `(${formatEGP(Math.abs(data.endingBalance))})`
                      : formatEGP(data.endingBalance)}
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
        titleAr={`كشف حساب: ${data?.accountNameAr || ''} (${data?.level5Id || ''})`}
        titleEn={`Statement of Account - ${data?.level5Id || ''}`}
        periodText={`من ${startDate} إلى ${endDate}`}
        subtitleAr="مستخرج رسمي من واقع قيود دفتر الأستاذ العام المعتمدة"
      >
        {data && (
          <div className="space-y-4">
            {/* Header Totals / Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 print:bg-slate-100 print:border-black print:text-slate-900 font-bold shadow-xs">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 print:bg-transparent print:border-none">
                <span className="block text-[11px] text-slate-600 dark:text-slate-400 print:text-slate-700 mb-1">
                  رصيد أول المدة:
                </span>
                <span dir="ltr" className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100 print:text-slate-900 inline-block">
                  {data.openingBalance < 0
                    ? `(${formatEGP(Math.abs(data.openingBalance))} جم)`
                    : `${formatEGP(data.openingBalance)} جم`}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 print:bg-transparent print:border-none">
                <span className="block text-[11px] text-blue-600 dark:text-blue-400 print:text-slate-700 mb-1">
                  إجمالي المدين:
                </span>
                <span dir="ltr" className="font-mono text-sm font-bold text-blue-700 dark:text-blue-300 print:text-slate-900 inline-block">
                  {formatEGP(data.totalDebit)} جم
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 print:bg-transparent print:border-none">
                <span className="block text-[11px] text-amber-600 dark:text-amber-400 print:text-slate-700 mb-1">
                  إجمالي الدائن:
                </span>
                <span dir="ltr" className="font-mono text-sm font-bold text-amber-700 dark:text-amber-300 print:text-slate-900 inline-block">
                  {formatEGP(data.totalCredit)} جم
                </span>
              </div>
              <div
                className={`p-2.5 rounded-xl border transition-colors ${
                  data.endingBalance < 0
                    ? 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/60 print:bg-rose-50 print:border-rose-300'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/80 print:bg-transparent print:border-none'
                }`}
              >
                <span
                  className={`block text-[11px] mb-1 font-bold ${
                    data.endingBalance < 0
                      ? 'text-rose-600 dark:text-rose-400 print:text-rose-700'
                      : 'text-emerald-600 dark:text-emerald-400 print:text-slate-700'
                  }`}
                >
                  الرصيد الختامي:
                </span>
                <span
                  dir="ltr"
                  className={`font-mono text-sm font-black inline-block ${
                    data.endingBalance < 0
                      ? 'text-rose-700 dark:text-rose-300 print:text-rose-800'
                      : 'text-emerald-700 dark:text-emerald-300 print:text-slate-900'
                  }`}
                >
                  {data.endingBalance < 0
                    ? `(${formatEGP(Math.abs(data.endingBalance))} جم)`
                    : `${formatEGP(data.endingBalance)} جم`}
                </span>
              </div>
            </div>

            {/* Table */}
            <table className="w-full text-right border-collapse text-[10px] print:text-[9px]">
              <thead className="print:table-header-group">
                <tr className="border-b-2 border-slate-400 dark:border-slate-600 print:border-black bg-slate-100 dark:bg-slate-800 font-black">
                  <th className="py-2 px-1.5 border border-slate-300 dark:border-slate-700 print:border-black text-slate-800 dark:text-slate-200 print:text-slate-900 w-20">
                    التاريخ
                  </th>
                  <th className="py-2 px-1.5 border border-slate-300 dark:border-slate-700 print:border-black text-slate-800 dark:text-slate-200 print:text-slate-900 w-16">
                    رقم القيد
                  </th>
                  <th className="py-2 px-1.5 border border-slate-300 dark:border-slate-700 print:border-black text-slate-800 dark:text-slate-200 print:text-slate-900 w-20">
                    نوع السند
                  </th>
                  <th className="py-2 px-2 border border-slate-300 dark:border-slate-700 print:border-black text-slate-800 dark:text-slate-200 print:text-slate-900">
                    البيان
                  </th>
                  <th className="py-2 px-1.5 border border-slate-300 dark:border-slate-700 print:border-black text-slate-800 dark:text-slate-200 print:text-slate-900 text-left w-20">
                    مدين
                  </th>
                  <th className="py-2 px-1.5 border border-slate-300 dark:border-slate-700 print:border-black text-slate-800 dark:text-slate-200 print:text-slate-900 text-left w-20">
                    دائن
                  </th>
                  <th className="py-2 px-1.5 border border-slate-300 dark:border-slate-700 print:border-black text-slate-800 dark:text-slate-200 print:text-slate-900 text-left w-24">
                    الرصيد
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-300 dark:border-slate-700 print:border-black font-bold bg-slate-50/80 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 print:text-slate-900">
                  <td className="py-1 px-1.5 border border-slate-300 dark:border-slate-700 print:border-black font-mono">{startDate}</td>
                  <td className="py-1 px-1.5 border border-slate-300 dark:border-slate-700 print:border-black text-center font-mono">-</td>
                  <td className="py-1 px-1.5 border border-slate-300 dark:border-slate-700 print:border-black">رصيد أول المدة</td>
                  <td className="py-1 px-2 border border-slate-300 dark:border-slate-700 print:border-black">رصيد مرحل من فترات سابقة</td>
                  <td className="py-1 px-1.5 border border-slate-300 dark:border-slate-700 print:border-black text-left font-mono" dir="ltr">{data.openingBalance >= 0 ? formatEGP(data.openingBalance) : '-'}</td>
                  <td className="py-1 px-1.5 border border-slate-300 dark:border-slate-700 print:border-black text-left font-mono" dir="ltr">{data.openingBalance < 0 ? formatEGP(Math.abs(data.openingBalance)) : '-'}</td>
                  <td className="py-1 px-1.5 border border-slate-300 dark:border-slate-700 print:border-black text-left font-mono font-bold whitespace-nowrap" dir="ltr">
                    {data.openingBalance < 0
                      ? `(${formatEGP(Math.abs(data.openingBalance))})`
                      : formatEGP(data.openingBalance)}
                  </td>
                </tr>
                {data.transactions.map((t, i) => (
                  <tr key={i} className="border-b border-slate-200 dark:border-slate-800 print:border-black hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-1 px-1.5 border border-slate-200 dark:border-slate-800 print:border-black font-mono text-slate-700 dark:text-slate-300 print:text-slate-900">{t.noteDate}</td>
                    <td className="py-1 px-1.5 border border-slate-200 dark:border-slate-800 print:border-black font-mono text-slate-700 dark:text-slate-300 print:text-slate-900">#{t.noteNo}</td>
                    <td className="py-1 px-1.5 border border-slate-200 dark:border-slate-800 print:border-black text-slate-700 dark:text-slate-300 print:text-slate-900">{t.voucherType}</td>
                    <td className="py-1 px-2 border border-slate-200 dark:border-slate-800 print:border-black text-slate-800 dark:text-slate-200 print:text-slate-900">{t.description}</td>
                    <td className="py-1 px-1.5 border border-slate-200 dark:border-slate-800 print:border-black text-left font-mono font-bold text-blue-700 dark:text-blue-400 print:text-slate-900" dir="ltr">{t.debit > 0 ? formatEGP(t.debit) : '-'}</td>
                    <td className="py-1 px-1.5 border border-slate-200 dark:border-slate-800 print:border-black text-left font-mono font-bold text-amber-700 dark:text-amber-400 print:text-slate-900" dir="ltr">{t.credit > 0 ? formatEGP(t.credit) : '-'}</td>
                    <td className="py-1 px-1.5 border border-slate-200 dark:border-slate-800 print:border-black text-left font-mono font-bold text-slate-900 dark:text-slate-100 print:text-slate-900 whitespace-nowrap" dir="ltr">
                      {t.runningBalance < 0
                        ? `(${formatEGP(Math.abs(t.runningBalance))})`
                        : formatEGP(t.runningBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="print:table-footer-group">
                <tr className="border-t-2 border-slate-400 dark:border-slate-600 print:border-black bg-slate-100 dark:bg-slate-800 font-black text-slate-800 dark:text-slate-200 print:text-slate-900">
                  <td colSpan={4} className="py-1.5 px-2 text-center border border-slate-300 dark:border-slate-700 print:border-black">الإجمالي العام والرصيد الختامي</td>
                  <td className="py-1.5 px-1.5 border border-slate-300 dark:border-slate-700 print:border-black text-left font-mono text-blue-700 dark:text-blue-400 print:text-slate-900" dir="ltr">{formatEGP(data.totalDebit)}</td>
                  <td className="py-1.5 px-1.5 border border-slate-300 dark:border-slate-700 print:border-black text-left font-mono text-amber-700 dark:text-amber-400 print:text-slate-900" dir="ltr">{formatEGP(data.totalCredit)}</td>
                  <td className="py-1.5 px-1.5 border border-slate-300 dark:border-slate-700 print:border-black text-left font-mono font-black text-slate-900 dark:text-slate-100 print:text-slate-900 whitespace-nowrap" dir="ltr">
                    {data.endingBalance < 0
                      ? `(${formatEGP(Math.abs(data.endingBalance))})`
                      : formatEGP(data.endingBalance)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </ReportPrintLayout>
    </div>
  );
};
