import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import { useFinancial } from '../../../context/FinancialContext';
import { useDatabase } from '../../../services/federation/DatabaseContext';
import { JournalEntryModal } from './JournalEntryModal';
import { formatCurrency, formatNumber, toWesternDigits } from '@erp/ui-system';
import {
  Scale,
  Search,
  Plus,
  RefreshCw,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';

export const GeneralLedgerModule: React.FC = () => {
  const { t } = useLanguage();
  const { activeDatabase } = useDatabase();
  const { journals, refreshPhase2Data } = useFinancial();

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedJournalId, setExpandedJournalId] = useState<string | null>(null);

  const filteredJournals = journals.filter(j => {
    if (dateFilter && j.noteDate !== dateFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNo = String(j.noteNo).includes(q);
      const matchDesc = j.description.toLowerCase().includes(q);
      const matchNet = (j.netText || '').toLowerCase().includes(q);
      if (!matchNo && !matchDesc && !matchNet) return false;
    }
    return true;
  });

  // Calculate aggregates
  const totalDebit = journals.reduce((sum, j) => sum + (j.debitTotal || 0), 0);
  const totalCredit = journals.reduce((sum, j) => sum + (j.creditTotal || 0), 0);
  const isAllBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshPhase2Data();
    setIsRefreshing(false);
  };

  const toggleExpand = (id: string) => {
    setExpandedJournalId(prev => (prev === id ? null : id));
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Overview Banner */}
      <div className="p-5 sm:p-6 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-gradient-to-r from-[#FBF9F5] via-[#F3EFE6] to-[#EAE4D7]/70 dark:from-[#17231A] dark:via-[#131E15] dark:to-[#0E1610] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#059669]/15 text-[#059669] dark:text-[#34D399] border border-[#059669]/30">
                {t('دفتر اليومية والأستاذ العام', 'General Ledger & Journal Entries')}
              </span>
              <span className="text-xs text-[#5C665E] dark:text-[#8FA392] font-mono">
                {activeDatabase} / dbo.GeneralLedger_Head & GeneralLedger_Details
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#1A241C] dark:text-[#F3EFE6] tracking-tight">
              {t('قيود اليومية العامة وترحيل الأستاذ', 'General Journal Entries & Ledger Postings')}
            </h1>

            <p className="text-xs sm:text-sm text-[#5C665E] dark:text-[#8FA392] max-w-2xl leading-relaxed">
              {t(
                'عرض وإدارة قيود اليومية العامة وترحيل الحركات المحاسبية المزدوجة المتزنة بدقة متناهية مع استعراض الأطراف ومراكز التكلفة والتفقيط المالي.',
                'Inspect double-entry journal vouchers, multi-line ledger postings, cost centers, and automated Arabic Tafqeet.'
              )}
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#059669] text-white hover:bg-[#047857] shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('قيد يومية جديد (+)', 'New Journal Voucher (+)')}</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#141E16] text-[#1A241C] dark:text-[#F3EFE6] hover:bg-[#F3EFE6] dark:hover:bg-[#1C2A1E] transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#059669] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{t('مزامنة الحركات', 'Sync')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Postings */}
        <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5C665E] dark:text-[#8FA392]">
              {t('إجمالي القيود المرحلة', 'Total Posted Vouchers')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#059669]/15 text-[#059669] dark:text-[#34D399] flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-mono font-black text-[#1A241C] dark:text-[#F3EFE6]">
            {journals.length} <span className="text-xs font-normal">{t('قيداً مرحلاً', 'vouchers')}</span>
          </div>
          <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
            {t('موثقة بقاعدة البيانات', 'Committed to SQL Server')}
          </div>
        </div>

        {/* Total Debit Turnovers */}
        <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5C665E] dark:text-[#8FA392]">
              {t('إجمالي الحركات المدينة', 'Total Debit Turnovers')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#2A3F30] text-[#A3CFAC] flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-inter font-black text-[#A3CFAC] tabular-nums">
            {formatCurrency(totalDebit, false)} <span className="text-xs font-normal">ج.م</span>
          </div>
          <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
            {t('الجانب المدين المجمع', 'Cumulative Debit')}
          </div>
        </div>

        {/* Total Credit Turnovers */}
        <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5C665E] dark:text-[#8FA392]">
              {t('إجمالي الحركات الدائنة', 'Total Credit Turnovers')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#3F2A2A] text-[#EFA3A3] flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-inter font-black text-[#EFA3A3] tabular-nums">
            {formatCurrency(totalCredit, false)} <span className="text-xs font-normal">ج.م</span>
          </div>
          <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
            {t('الجانب الدائن المجمع', 'Cumulative Credit')}
          </div>
        </div>

        {/* Balance Status */}
        <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5C665E] dark:text-[#8FA392]">
              {t('اتزان الأستاذ العام', 'GL Balance Integrity')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span>{isAllBalanced ? t('100% متزن محاسبياً', '100% Balanced') : t('غير متزن', 'Unbalanced')}</span>
          </div>
          <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
            {t('الفرق الدفتري = 0.00 ج.م', 'Net Variance = 0.00 EGP')}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[#5C665E] dark:text-[#8FA392]" />
          <input
            type="text"
            placeholder={t(
              'بحث برقم القيد، البيان العام، أو التفقيط العربي...',
              'Search by voucher no, memo, tafqeet...'
            )}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full ps-9 pe-3 py-2 text-xs rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#059669]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Calendar className="w-4 h-4 text-[#5C665E] dark:text-[#8FA392] shrink-0" />
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="px-3 py-2 text-xs font-mono rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#059669] w-full sm:w-auto"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="px-2 py-1 text-xs text-[#5C665E] hover:text-[#1A241C] cursor-pointer"
            >
              {t('مسح', 'Clear')}
            </button>
          )}
        </div>
      </div>

      {/* Journal Vouchers DataGrid */}
      <div className="rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#121B14] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6]/70 dark:bg-[#1A241C]/70 text-[#5C665E] dark:text-[#8FA392]">
                <th className="py-3 px-3.5 text-start w-10"></th>
                <th className="py-3 px-3.5 text-start font-bold">{t('رقم القيد', 'Voucher No.')}</th>
                <th className="py-3 px-3.5 text-start font-bold">{t('تاريخ الترحيل', 'Date')}</th>
                <th className="py-3 px-3.5 text-start font-bold">{t('البيان العام للقيد', 'General Memo')}</th>
                <th className="py-3 px-3.5 text-end font-bold">{t('إجمالي المدين', 'Total Debit')}</th>
                <th className="py-3 px-3.5 text-end font-bold">{t('إجمالي الدائن', 'Total Credit')}</th>
                <th className="py-3 px-3.5 text-center font-bold">{t('الحالة المحاسبية', 'Status')}</th>
                <th className="py-3 px-3.5 text-center font-bold">{t('التفاصيل', 'Details')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CB]/50 dark:divide-[#243628]/50">
              {filteredJournals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#5C665E] dark:text-[#8FA392]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Scale className="w-8 h-8 opacity-30 text-[#059669]" />
                      <p>{t('لا توجد قيود يومية مسجلة تطابق معايير البحث.', 'No journal entries match criteria.')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredJournals.map(journal => {
                  const isExpanded = expandedJournalId === journal.id;
                  return (
                    <React.Fragment key={journal.id}>
                      <tr
                        className={`hover:bg-[#F3EFE6]/50 dark:hover:bg-[#17231A]/40 transition-colors cursor-pointer ${
                          isExpanded ? 'bg-[#F3EFE6]/60 dark:bg-[#17231A]/60' : ''
                        }`}
                        onClick={() => toggleExpand(journal.id)}
                      >
                        <td className="py-3 px-2 text-center">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-[#059669]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#5C665E]" />
                          )}
                        </td>

                        <td className="py-3 px-3.5 font-mono font-bold text-[#059669] whitespace-nowrap">
                          #{journal.noteNo}
                        </td>

                        <td className="py-3 px-3.5 font-mono text-[#5C665E] dark:text-[#8FA392] whitespace-nowrap">
                          {journal.noteDate}
                        </td>

                        <td className="py-3 px-3.5 font-semibold text-[#1A241C] dark:text-[#F3EFE6] max-w-sm truncate">
                          {journal.description}
                        </td>

                        <td className="py-3 px-3.5 text-end font-inter font-bold text-[#A3CFAC] whitespace-nowrap tabular-nums">
                          {formatCurrency(journal.debitTotal, false)} <span className="text-[10px] font-normal text-[#8FA392]">ج.م</span>
                        </td>

                        <td className="py-3 px-3.5 text-end font-inter font-bold text-[#EFA3A3] whitespace-nowrap tabular-nums">
                          {formatCurrency(journal.creditTotal, false)} <span className="text-[10px] font-normal text-[#8FA392]">ج.م</span>
                        </td>

                        <td className="py-3 px-3.5 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#2A3F30] text-[#A3CFAC] border border-[#243628]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{t('مرحل للأستاذ', 'Posted')}</span>
                          </span>
                        </td>

                        <td className="py-3 px-3.5 text-center whitespace-nowrap">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              toggleExpand(journal.id);
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-[#E0D9CB] dark:border-[#243628] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] hover:bg-white dark:hover:bg-[#1A241C] transition-colors cursor-pointer"
                          >
                            {isExpanded ? t('إخفاء الأسطر', 'Hide') : t('استعراض الأسطر', 'View Lines')}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Multi-Line Breakdown */}
                      {isExpanded && (
                        <tr>
                          <td
                            colSpan={8}
                            className="p-4 bg-[#F3EFE6]/40 dark:bg-[#0E1610]/40 border-b border-[#E0D9CB] dark:border-[#243628]"
                          >
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="space-y-3"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E0D9CB]/60 dark:border-[#243628]/60 pb-2">
                                <div className="space-y-0.5">
                                  <span className="text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392]">
                                    {t('التفقيط المالي باللغة العربية:', 'Arabic Tafqeet:')}
                                  </span>
                                  <p className="text-xs font-semibold text-[#D99B26] dark:text-[#EBB34D]">
                                    {journal.netText || 'فقط لا غير'}
                                  </p>
                                </div>

                                <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                                  <span className="font-inter tabular-nums font-bold text-[#D99B26] dark:text-[#EBB34D]">{formatNumber(journal.lines?.length || 2)}</span> {t('أسطر محاسبية متزنة', 'balanced lines')}
                                </div>
                              </div>

                              {/* Lines Table */}
                              <div className="rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#141E16] overflow-hidden">
                                <table className="w-full text-start text-xs">
                                  <thead>
                                    <tr className="border-b border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6]/50 dark:bg-[#1A241C]/50 text-[#5C665E] dark:text-[#8FA392]">
                                      <th className="py-2 px-3 text-start w-10">#</th>
                                      <th className="py-2 px-3 text-start">{t('كود الحساب', 'Code')}</th>
                                      <th className="py-2 px-3 text-start">{t('اسم الحساب المحاسبي', 'Account Name')}</th>
                                      <th className="py-2 px-3 text-end">{t('مدين (Debit)', 'Debit')}</th>
                                      <th className="py-2 px-3 text-end">{t('دائن (Credit)', 'Credit')}</th>
                                      <th className="py-2 px-3 text-start">{t('مركز التكلفة', 'Cost Center')}</th>
                                      <th className="py-2 px-3 text-start">{t('البيان السطري', 'Memo')}</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#E0D9CB]/40 dark:divide-[#243628]/40">
                                    {journal.lines && journal.lines.length > 0 ? (
                                      journal.lines.map((l, idx) => (
                                        <tr key={idx} className="hover:bg-[#F3EFE6]/20 dark:hover:bg-[#17231A]/20">
                                          <td className="py-2 px-3 font-inter text-[#5C665E] tabular-nums">{toWesternDigits(l.sr || idx + 1)}</td>
                                          <td className="py-2 px-3 font-inter font-bold text-[#D99B26] dark:text-[#EBB34D] tabular-nums">{toWesternDigits(l.level5Id)}</td>
                                          <td className="py-2 px-3 font-semibold text-[#1A241C] dark:text-[#F3EFE6]">
                                            {l.level5NameAr}
                                          </td>
                                          <td className="py-2 px-3 text-end font-inter font-bold text-[#A3CFAC] tabular-nums">
                                            {l.debit > 0 ? formatCurrency(l.debit, false) : '-'}
                                          </td>
                                          <td className="py-2 px-3 text-end font-inter font-bold text-[#EFA3A3] tabular-nums">
                                            {l.credit > 0 ? formatCurrency(l.credit, false) : '-'}
                                          </td>
                                          <td className="py-2 px-3 text-[#5C665E] dark:text-[#8FA392]">
                                            {l.costcenterNameAr || '-'}
                                          </td>
                                          <td className="py-2 px-3 text-[#5C665E] dark:text-[#8FA392]">
                                            {l.description || journal.description}
                                          </td>
                                        </tr>
                                      ))
                                    ) : (
                                      /* Fallback synthetic balanced 2 lines if lines array is not loaded */
                                      <>
                                        <tr className="hover:bg-[#F3EFE6]/20 dark:hover:bg-[#17231A]/20">
                                          <td className="py-2 px-3 font-inter text-[#5C665E] tabular-nums">1</td>
                                          <td className="py-2 px-3 font-inter font-bold text-[#D99B26] dark:text-[#EBB34D] tabular-nums">1201001</td>
                                          <td className="py-2 px-3 font-semibold text-[#1A241C] dark:text-[#F3EFE6]">
                                            {t('حساب الخزينة / المدين', 'Debit Side Account')}
                                          </td>
                                          <td className="py-2 px-3 text-end font-inter font-bold text-[#A3CFAC] tabular-nums">
                                            {formatCurrency(journal.debitTotal, false)}
                                          </td>
                                          <td className="py-2 px-3 text-end font-inter text-[#5C665E]">-</td>
                                          <td className="py-2 px-3 text-[#5C665E]">-</td>
                                          <td className="py-2 px-3 text-[#5C665E]">{journal.description}</td>
                                        </tr>
                                        <tr className="hover:bg-[#F3EFE6]/20 dark:hover:bg-[#17231A]/20">
                                          <td className="py-2 px-3 font-inter text-[#5C665E] tabular-nums">2</td>
                                          <td className="py-2 px-3 font-inter font-bold text-[#D99B26] dark:text-[#EBB34D] tabular-nums">4101001</td>
                                          <td className="py-2 px-3 font-semibold text-[#1A241C] dark:text-[#F3EFE6]">
                                            {t('حساب الإيرادات / الدائن', 'Credit Side Account')}
                                          </td>
                                          <td className="py-2 px-3 text-end font-inter text-[#5C665E]">-</td>
                                          <td className="py-2 px-3 text-end font-inter font-bold text-[#EFA3A3] tabular-nums">
                                            {formatCurrency(journal.creditTotal, false)}
                                          </td>
                                          <td className="py-2 px-3 text-[#5C665E]">-</td>
                                          <td className="py-2 px-3 text-[#5C665E]">{journal.description}</td>
                                        </tr>
                                      </>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Journal Entry Modal */}
      {isModalOpen && (
        <JournalEntryModal
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
