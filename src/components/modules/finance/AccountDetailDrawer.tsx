import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AccountNode, StatementOfAccountReportData } from '../../../services/database/types';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { useFinancial } from '../../../context/FinancialContext';
import { formatCurrency, toast } from '@erp/ui-system';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  ArrowDownLeft,
  ArrowUpRight,
  FileSpreadsheet,
  History,
  RotateCw,
  Eye
} from 'lucide-react';

interface AccountDetailDrawerProps {
  account: AccountNode | null;
  onClose: () => void;
}

export const AccountDetailDrawer: React.FC<AccountDetailDrawerProps> = ({ account, onClose }) => {
  const { isRtl, t } = useLanguage();
  const { selectItem } = useNavigation();
  const { fetchStatementOfAccount } = useFinancial();

  const [copied, setCopied] = useState(false);
  const [statementData, setStatementData] = useState<StatementOfAccountReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch live ledger statement whenever the inspected account changes
  useEffect(() => {
    if (!account) {
      setStatementData(null);
      return;
    }

    let isCurrent = true;
    setIsLoading(true);

    fetchStatementOfAccount(account.code)
      .then(res => {
        if (isCurrent) {
          setStatementData(res);
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.warn('[AccountDetailDrawer] Live statement fetch error:', err);
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [account, fetchStatementOfAccount]);

  if (!account) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(account.code);
    setCopied(true);
    toast.success(
      isRtl ? 'تم نسخ رمز الحساب بنجاح' : 'Account code copied',
      `${account.code} - ${account.nameAr}`
    );
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenStatement = () => {
    onClose();

    // 1. Programmatically navigate with clean query parameters
    const cleanCode = String(account.code || '').trim().replace(/^L[1-5]-/i, '');
    const url = new URL(window.location.href);
    url.pathname = '/financials/reports';
    url.searchParams.set('tab', 'statement');
    url.searchParams.set('accountId', cleanCode);
    window.history.pushState({}, '', url.pathname + url.search);

    // 2. Dispatch cross-module deep link event
    window.dispatchEvent(
      new CustomEvent('erp:deep-link', {
        detail: {
          category: 'finance',
          subItem: 'fin_reports',
          tab: 'STATEMENT_OF_ACCOUNT',
          accountId: cleanCode,
          accountName: account.nameAr,
        },
      })
    );

    // 3. Switch active module in NavigationContext
    selectItem('finance', 'fin_reports');

    // 4. Enterprise animated toast notice
    toast.info(
      isRtl ? 'فتح كشف الحساب التفصيلي' : 'Opening Statement of Account',
      `${account.code} - ${account.nameAr}`
    );
  };

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 1:
        return t('المستوى 1: حساب أصل رئيسي (جذر الدليل)', 'Level 1: Root Master Account');
      case 2:
        return t('المستوى 2: حساب عام رئيسي', 'Level 2: General Group');
      case 3:
        return t('المستوى 3: حساب مساعد', 'Level 3: Auxiliary Category');
      case 4:
        return t('المستوى 4: حساب إجمالي فرعي', 'Level 4: Sub-Ledger Account');
      case 5:
        return t('المستوى 5: حساب تفصيلي ختامي (يقبل القيود)', 'Level 5: Detail Leaf Account (Entry-Enabled)');
      default:
        return `المستوى ${level}`;
    }
  };

  // Compute live balances
  const endingBalance = statementData ? statementData.endingBalance : (account.balance ?? 0);
  const totalDebit = statementData ? statementData.totalDebit : (endingBalance > 0 && account.nature === 0 ? endingBalance : 0);
  const totalCredit = statementData ? statementData.totalCredit : (endingBalance > 0 && account.nature === 1 ? endingBalance : 0);
  const movementCount = statementData?.transactions?.length ?? (account.balance ? 1 : 0);

  const formatBalanceWithNature = (bal: number, nature: number) => {
    const absVal = Math.abs(bal);
    if (absVal < 0.001) return `0.00 ${t('ج.م متزن', 'EGP Balanced')}`;
    const isDebit = nature === 0 ? bal >= 0 : bal < 0;
    const natureTag = isDebit ? t('مدين', 'Debit') : t('دائن', 'Credit');
    return `${absVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${t('ج.م', 'EGP')} ${natureTag}`;
  };

  // Complete list of transactions for the inspected account (newest first)
  const allTransactions = (statementData?.transactions || []).slice().reverse();
  const totalCount = allTransactions.length;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] overflow-hidden flex justify-end" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xs transition-opacity"
        />

        {/* Slide-over panel */}
        <motion.div
          initial={{ x: isRtl ? -520 : 520 }}
          animate={{ x: 0 }}
          exit={{ x: isRtl ? -520 : 520 }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="relative w-full max-w-xl bg-[#0E1610] text-[#F3EFE6] border-s border-[#243628] shadow-2xl z-[101] flex flex-col h-full overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#243628] flex items-center justify-between shrink-0 bg-[#17231A]/90 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono text-sm shadow-xs ${
                  account.level === 5
                    ? 'bg-[#1F2E23] text-[#EBB34D] border border-[#EBB34D]/40'
                    : 'bg-[#D99B26] text-[#0E1610]'
                }`}
              >
                L{account.level}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#8FA392]">
                    {t('بطاقة الحساب المحاسبي الفوري', 'Live Account Inspection Card')}
                  </span>
                  {isLoading && (
                    <RotateCw className="w-3 h-3 text-[#EBB34D] animate-spin" />
                  )}
                </div>
                <h3 className="text-base font-bold text-[#F3EFE6] leading-snug">
                  {account.nameAr}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8FA392] hover:text-[#F3EFE6] hover:bg-[#243628] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-sidebar-scrollbar">
            {/* Live Real-Time Balance Hero Card */}
            <div className="p-4 rounded-2xl border border-[#EBB34D]/30 bg-gradient-to-br from-[#17231A] via-[#141F16] to-[#0E1610] shadow-md space-y-3 relative overflow-hidden">
              <div className="absolute top-0 end-0 w-32 h-32 bg-[#EBB34D]/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8FA392] flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#EBB34D]" />
                  {t('الرصيد الفعلي الحالي (المرحل للأستاذ العام)', 'Current Real-Time Ledger Balance')}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1F2E23] text-[#EBB34D] border border-[#EBB34D]/30">
                  {t('محدث لحظياً', 'Live Sync')}
                </span>
              </div>

              <div className="text-2xl sm:text-3xl font-black font-mono text-[#EBB34D] tracking-tight">
                {formatBalanceWithNature(endingBalance, account.nature)}
              </div>

              {/* 3 Summary Pills */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#243628]/70">
                {/* Total Debit Turnovers */}
                <div className="p-2 rounded-xl bg-[#17231A] border border-[#243628] space-y-1">
                  <span className="text-[10px] text-[#8FA392] flex items-center gap-1">
                    <ArrowDownLeft className="w-3 h-3 text-[#A3CFAC]" />
                    {t('إجمالي المدين', 'Total Debit')}
                  </span>
                  <div className="text-xs font-mono font-bold text-[#A3CFAC] truncate tabular-nums">
                    {formatCurrency(totalDebit, false)}
                  </div>
                </div>

                {/* Total Credit Turnovers */}
                <div className="p-2 rounded-xl bg-[#17231A] border border-[#243628] space-y-1">
                  <span className="text-[10px] text-[#8FA392] flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-[#EFA3A3]" />
                    {t('إجمالي الدائن', 'Total Credit')}
                  </span>
                  <div className="text-xs font-mono font-bold text-[#EFA3A3] truncate tabular-nums">
                    {formatCurrency(totalCredit, false)}
                  </div>
                </div>

                {/* Posted Vouchers Count */}
                <div className="p-2 rounded-xl bg-[#17231A] border border-[#243628] space-y-1">
                  <span className="text-[10px] text-[#8FA392] flex items-center gap-1">
                    <FileSpreadsheet className="w-3 h-3 text-[#EBB34D]" />
                    {t('القيود المرحلة', 'Postings')}
                  </span>
                  <div className="text-xs font-mono font-bold text-[#EBB34D] truncate">
                    {movementCount} {t('قيد', 'entries')}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Code & Copy */}
            <div className="p-3.5 rounded-xl border border-[#243628] bg-[#17231A] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#8FA392] block">
                  {t('رمز / كود الحساب المعتمد', 'Verified Account Code')}
                </span>
                <span className="text-lg font-black font-mono text-[#EBB34D] tracking-wider mt-0.5 block">
                  {account.code}
                </span>
              </div>

              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-[#243628] bg-[#0E1610] text-[#F3EFE6] hover:bg-[#1F2E23] transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#A3CFAC]" />
                    <span>{t('تم النسخ', 'Copied')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t('نسخ الكود', 'Copy')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Core Classification Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Nature */}
              <div className="p-3 rounded-xl border border-[#243628] bg-[#17231A]/70">
                <span className="text-[11px] font-semibold text-[#8FA392] block">
                  {t('طبيعة الحساب المحاسبية', 'Account Nature')}
                </span>
                <div className="mt-1 flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      account.nature === 0
                        ? 'bg-[#2A3F30] text-[#A3CFAC] border border-[#37533E]'
                        : 'bg-[#3F2A2A] text-[#EFA3A3] border border-[#533737]'
                    }`}
                  >
                    {account.natureLabelAr} ({account.nature === 0 ? 'Debit' : 'Credit'})
                  </span>
                </div>
              </div>

              {/* Statement Type */}
              <div className="p-3 rounded-xl border border-[#243628] bg-[#17231A]/70">
                <span className="text-[11px] font-semibold text-[#8FA392] block">
                  {t('القائمة المالية التابع لها', 'Financial Statement')}
                </span>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EBB34D]/15 text-[#EBB34D] border border-[#EBB34D]/30">
                    {account.statementType === 'BALANCE_SHEET'
                      ? t('ميزانية عمومية', 'Balance Sheet')
                      : t('قائمة الدخل والأرباح والخسائر', 'Income Statement')}
                  </span>
                </div>
              </div>
            </div>

            {/* Level Classification */}
            <div className="p-3.5 rounded-xl border border-[#243628] bg-[#17231A]/70 space-y-1.5">
              <span className="text-[11px] font-semibold text-[#8FA392] block">
                {t('الموقع في الهيكل التنظيمي المالي', 'Hierarchy Level')}
              </span>
              <p className="text-xs font-bold text-[#F3EFE6]">
                {getLevelLabel(account.level)}
              </p>
              {account.parentNameAr && (
                <div className="pt-1.5 border-t border-[#243628] flex items-center gap-1.5 text-xs text-[#8FA392]">
                  <span>{t('الحساب الأب المباشر:', 'Parent Account:')}</span>
                  <span className="font-bold text-[#F3EFE6]">{account.parentNameAr}</span>
                </div>
              )}
            </div>

            {/* Sub-accounts Count if Parent */}
            {account.level < 5 && (
              <div className="p-3.5 rounded-xl border border-[#243628] bg-[#17231A] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#EBB34D]">
                    {t('الحسابات التحليلية التابعة (أوراق الشجرة)', 'Sub-Accounts Rollup')}
                  </span>
                  <span className="text-sm font-black font-mono text-[#EBB34D]">
                    {account.leafCount} {t('حساب', 'accounts')}
                  </span>
                </div>
                <p className="text-[11px] text-[#8FA392]">
                  {t(
                    'يتفرع من هذا الحساب القيود التفصيلية ومراكز التكلفة المرتبطة.',
                    'Detailed transactional vouchers and cost centers roll up under this branch.'
                  )}
                </p>
              </div>
            )}

            {/* Complete Transaction Ledger Feed (غير مقيد بـ 5 حركات) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#EBB34D]" />
                  <h4 className="text-xs font-bold text-[#F3EFE6]">
                    {t(
                      `سجل حركات الأستاذ العام (إجمالي ${totalCount} حركة)`,
                      `General Ledger Transactions (${totalCount} Total Movements)`
                    )}
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-[#8FA392]">
                  {totalCount > 0 ? `${totalCount} ${t('حركة مسجلة', 'movements')}` : ''}
                </span>
              </div>

              {allTransactions.length === 0 ? (
                <div className="py-7 px-4 rounded-xl border border-dashed border-[#243628] bg-[#17231A]/40 flex flex-col items-center justify-center text-center gap-2">
                  <History className="w-6 h-6 text-[#8FA392]/50" />
                  <p className="text-xs font-medium text-[#8FA392]">
                    {t(
                      'لا توجد حركات مسجلة لهذا الحساب في الفترة المحددة',
                      'No transactions recorded for this account in the specified period'
                    )}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="rounded-xl border border-[#243628] bg-[#17231A] overflow-hidden shadow-xs max-h-80 overflow-y-auto custom-sidebar-scrollbar relative">
                    <table className="w-full text-start text-[11px]">
                      <thead className="sticky top-0 bg-[#141F16] z-10">
                        <tr className="border-b border-[#243628] text-[#8FA392]">
                          <th className="py-2.5 px-2.5 text-start font-bold">{t('التاريخ', 'Date')}</th>
                          <th className="py-2.5 px-2.5 text-start font-bold">{t('نوع المستند', 'Doc Type')}</th>
                          <th className="py-2.5 px-2.5 text-start font-bold">{t('البيان', 'Memo')}</th>
                          <th className="py-2.5 px-2.5 text-end font-bold">{t('مدين', 'Debit')}</th>
                          <th className="py-2.5 px-2.5 text-end font-bold">{t('دائن', 'Credit')}</th>
                          <th className="py-2.5 px-2.5 text-end font-bold">{t('الرصيد', 'Balance')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#243628]/60">
                        {allTransactions.map((tx, idx) => (
                          <tr key={tx.id || idx} className="hover:bg-[#1F2E23]/40 transition-colors">
                            <td className="py-2 px-2.5 font-mono text-[#8FA392] whitespace-nowrap">
                              {tx.noteDate || tx.entryDate || '-'}
                            </td>
                            <td className="py-2 px-2.5 whitespace-nowrap">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#1F2E23] text-[#EBB34D] border border-[#243628]">
                                {tx.voucherType || tx.DocumentType || (tx.noteNo ? `#${tx.noteNo}` : 'قيد')}
                              </span>
                            </td>
                            <td className="py-2 px-2.5 text-[#F3EFE6] max-w-[130px] truncate" title={tx.description}>
                              {tx.description || '-'}
                            </td>
                            <td className="py-2 px-2.5 text-end font-mono font-bold text-[#A3CFAC] whitespace-nowrap tabular-nums">
                              {Number(tx.debit) > 0 ? formatCurrency(Number(tx.debit), false) : '-'}
                            </td>
                            <td className="py-2 px-2.5 text-end font-mono font-bold text-[#EFA3A3] whitespace-nowrap tabular-nums">
                              {Number(tx.credit) > 0 ? formatCurrency(Number(tx.credit), false) : '-'}
                            </td>
                            <td className="py-2 px-2.5 text-end font-mono font-bold text-[#EBB34D] whitespace-nowrap tabular-nums">
                              {tx.runningBalance !== undefined ? formatCurrency(tx.runningBalance, false) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Pills: إجمالي المدين | إجمالي الدائن | الرصيد الختامي المتحرك */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#243628]">
                    <div className="p-2 rounded-xl bg-[#141F16] border border-[#243628] text-center">
                      <span className="text-[10px] text-[#8FA392] block">{t('إجمالي المدين', 'Total Debit')}</span>
                      <span className="text-xs font-mono font-bold text-[#A3CFAC] tabular-nums">
                        {formatCurrency(totalDebit, false)}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#141F16] border border-[#243628] text-center">
                      <span className="text-[10px] text-[#8FA392] block">{t('إجمالي الدائن', 'Total Credit')}</span>
                      <span className="text-xs font-mono font-bold text-[#EFA3A3] tabular-nums">
                        {formatCurrency(totalCredit, false)}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#141F16] border border-[#243628] text-center">
                      <span className="text-[10px] text-[#8FA392] block">{t('الرصيد الختامي المتحرك', 'Closing Balance')}</span>
                      <span className="text-xs font-mono font-bold text-[#EBB34D] tabular-nums truncate block">
                        {formatBalanceWithNature(endingBalance, account.nature)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Posting Specifications */}
            <div className="p-3.5 rounded-xl border border-[#243628] bg-[#17231A]/70 space-y-2">
              <span className="text-xs font-bold text-[#F3EFE6] block">
                {t('مواصفات الترحيل والتسجيل', 'Posting & Operational Rules')}
              </span>
              <ul className="text-xs text-[#8FA392] space-y-1.5">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#A3CFAC] shrink-0" />
                  <span>
                    {account.level === 5
                      ? t('يقبل تسجيل قيود اليومية العامة وسندات القبض والصرف المباشرة', 'Accepts direct journal vouchers and receipts/payments')
                      : t('حساب تجميعي رقابي يجمع الحركات آلياً', 'Rollup control account that aggregates sub-ledger movements automatically')}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#A3CFAC] shrink-0" />
                  <span>{t('العملة المعتمدة: الجنيه المصري (ج.م - EGP)', 'Approved Currency: Egyptian Pound (EGP)')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#A3CFAC] shrink-0" />
                  <span>{t('الربط بمراكز التكلفة والمشروعات: متاح للتحليل المالي', 'Cost center & project linking: Fully enabled')}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 border-t border-[#243628] bg-[#17231A] flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold border border-[#243628] bg-[#0E1610] text-[#8FA392] hover:text-[#F3EFE6] hover:bg-[#1F2E23] transition-colors cursor-pointer"
            >
              {t('إغلاق البطاقة', 'Close')}
            </button>

            <button
              onClick={handleOpenStatement}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#D99B26] hover:bg-[#C58F38] text-[#0E1610] shadow-md shadow-amber-950/40 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{t('كشف حساب تفصيلي', 'Statement of Account')}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
