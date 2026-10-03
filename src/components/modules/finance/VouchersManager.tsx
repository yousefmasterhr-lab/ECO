import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useFinancial } from '../../../context/FinancialContext';
import { VoucherHeaderItem, VoucherType } from '../../../services/database/types';
import { VoucherFormModal } from './VoucherFormModal';
import { VoucherPrintModal } from './VoucherPrintModal';
import {
  formatCurrency,
  formatNumber,
  formatDate,
  toWesternDigits
} from '@erp/ui-system';
import {
  FileText,
  Search,
  Plus,
  Printer,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';

export const VouchersManager: React.FC = () => {
  const { t } = useLanguage();
  const { vouchers, treasuryAccounts } = useFinancial();

  const [activeTab, setActiveTab] = useState<'ALL' | 'RECEIPT' | 'PAYMENT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTreasuryFilter, setSelectedTreasuryFilter] = useState('ALL');
  const [modalType, setModalType] = useState<VoucherType | null>(null);
  const [printTargetVoucher, setPrintTargetVoucher] = useState<VoucherHeaderItem | null>(null);

  // Totals
  const receiptsTotal = useMemo(() => {
    return vouchers
      .filter(v => v.voucherType === 'RECEIPT')
      .reduce((sum, v) => sum + (v.amount || 0), 0);
  }, [vouchers]);

  const paymentsTotal = useMemo(() => {
    return vouchers
      .filter(v => v.voucherType === 'PAYMENT')
      .reduce((sum, v) => sum + (v.amount || 0), 0);
  }, [vouchers]);

  // Filtered List
  const filteredVouchers = useMemo(() => {
    return vouchers.filter(v => {
      const matchesTab = activeTab === 'ALL' || v.voucherType === activeTab;
      const matchesSearch =
        !searchQuery ||
        String(v.noteNo).includes(searchQuery) ||
        v.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.treasuryAccountName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTreasury =
        selectedTreasuryFilter === 'ALL' || String(v.treasuryAccountId) === selectedTreasuryFilter;

      return matchesTab && matchesSearch && matchesTreasury;
    });
  }, [vouchers, activeTab, searchQuery, selectedTreasuryFilter]);

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200">
      {/* Overview Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Receipts Total Card */}
        <div className="p-4 sm:p-5 rounded-2xl border border-[#243628] bg-[#17231A] flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#8FA392] block">
              {t('إجمالي سندات القبض (+)', 'Total Receipts (+)')}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black font-inter text-[#A3CFAC] tabular-nums tracking-tight">
                {formatCurrency(receiptsTotal, false)}
              </span>
              <span className="text-[11px] font-bold text-[#8FA392]">ج.م</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#2A3F30] text-[#A3CFAC] border border-[#344F3C] flex items-center justify-center shrink-0">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        {/* Payments Total Card */}
        <div className="p-4 sm:p-5 rounded-2xl border border-[#243628] bg-[#17231A] flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#8FA392] block">
              {t('إجمالي سندات الصرف (-)', 'Total Payments (-)')}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black font-inter text-[#EFA3A3] tabular-nums tracking-tight">
                {formatCurrency(paymentsTotal, false)}
              </span>
              <span className="text-[11px] font-bold text-[#8FA392]">ج.م</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#3F2A2A] text-[#EFA3A3] border border-[#4E3535] flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        {/* Vouchers Count Card */}
        <div className="p-4 sm:p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#5C665E] dark:text-[#8FA392] block">
              {t('إجمالي عدد السندات الدفترية', 'Vouchers Count')}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black font-inter text-[#1A241C] dark:text-[#F3EFE6] tabular-nums tracking-tight">
                {formatNumber(vouchers.length)}
              </span>
              <span className="text-xs font-bold text-[#D99B26] dark:text-[#EBB34D]">
                {t('سند مرحّل', 'vouchers')}
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#D99B26] dark:text-[#EBB34D] border border-[#243628] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Toolbar & Filter Bar */}
      <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-[#1F2E23] text-[#EBB34D] border border-[#EBB34D]/40 shadow-2xs'
                  : 'bg-[#F3EFE6] dark:bg-[#1A241C] text-[#5C665E] dark:text-[#8FA392] border border-[#E0D9CB] dark:border-[#243628]'
              }`}
            >
              <span>{t('جميع السندات', 'All Vouchers')}</span>
              <span className="ms-1.5 font-inter font-bold tabular-nums">({formatNumber(vouchers.length)})</span>
            </button>

            <button
              onClick={() => setActiveTab('RECEIPT')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'RECEIPT'
                  ? 'bg-[#2A3F30] text-[#A3CFAC] border border-[#344F3C] shadow-2xs'
                  : 'bg-[#F3EFE6] dark:bg-[#1A241C] text-[#5C665E] dark:text-[#8FA392] border border-[#E0D9CB] dark:border-[#243628]'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>{t('سندات القبض', 'Receipts')}</span>
            </button>

            <button
              onClick={() => setActiveTab('PAYMENT')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'PAYMENT'
                  ? 'bg-[#3F2A2A] text-[#EFA3A3] border border-[#4E3535] shadow-2xs'
                  : 'bg-[#F3EFE6] dark:bg-[#1A241C] text-[#5C665E] dark:text-[#8FA392] border border-[#E0D9CB] dark:border-[#243628]'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{t('سندات الصرف', 'Payments')}</span>
            </button>
          </div>

          {/* New Voucher Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalType('RECEIPT')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#2A3F30] text-[#A3CFAC] hover:bg-[#344F3C] border border-[#344F3C] shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('سند قبض (+)', 'New Receipt')}</span>
            </button>

            <button
              onClick={() => setModalType('PAYMENT')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#3F2A2A] text-[#EFA3A3] hover:bg-[#4E3535] border border-[#4E3535] shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('سند صرف (-)', 'New Payment')}</span>
            </button>
          </div>
        </div>

        {/* Search & Treasury Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E0D9CB]/60 dark:border-[#243628]/60">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute inset-y-0 my-auto start-3 text-[#5C665E] dark:text-[#8FA392]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('بحث برقم السند، البيان، أو اسم الحساب...', 'Search vouchers...')}
              className="w-full ps-9 pe-4 py-2 text-xs rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#1A241C] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D]"
            />
          </div>

          <div>
            <select
              value={selectedTreasuryFilter}
              onChange={e => setSelectedTreasuryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#1A241C] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D]"
            >
              <option value="ALL">{t('جميع الخزائن والبنوك', 'All Treasuries & Banks')}</option>
              {treasuryAccounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.nameAr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vouchers DataGrid */}
      <div className="rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#121B14] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] font-bold">
                <th className="py-3 px-4 text-start w-24">{t('رقم السند', 'Voucher #')}</th>
                <th className="py-3 px-4 text-start w-28">{t('نوع السند', 'Type')}</th>
                <th className="py-3 px-4 text-start w-28">{t('التاريخ', 'Date')}</th>
                <th className="py-3 px-4 text-start">{t('البيان العام والمستفيد', 'Description')}</th>
                <th className="py-3 px-4 text-start">{t('حساب الخزينة / البنك', 'Treasury / Bank')}</th>
                <th className="py-3 px-4 text-start">{t('مركز التكلفة', 'Cost Center')}</th>
                <th className="py-3 px-4 text-end w-36">{t('المبلغ (ج.م)', 'Amount')}</th>
                <th className="py-3 px-4 text-center w-24">{t('إجراءات', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]/60">
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#5C665E] dark:text-[#8FA392]">
                    {t('لا توجد سندات مطابقة لمعايير البحث المحددة', 'No matching vouchers found')}
                  </td>
                </tr>
              ) : (
                filteredVouchers.map(v => {
                  const isRec = v.voucherType === 'RECEIPT';
                  return (
                    <tr key={v.id} className="hover:bg-[#F3EFE6]/50 dark:hover:bg-[#17231A]/40 transition-colors">
                      <td className="py-3 px-4 font-inter font-bold text-[#D99B26] dark:text-[#EBB34D] tabular-nums">
                        {toWesternDigits(v.noteNo)}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10.5px] font-bold border ${
                            isRec
                              ? 'bg-[#2A3F30] text-[#A3CFAC] border-[#243628]'
                              : 'bg-[#3F2A2A] text-[#EFA3A3] border-[#243628]'
                          }`}
                        >
                          {isRec ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          <span>{isRec ? t('قبض', 'Receipt') : t('صرف', 'Payment')}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 font-inter text-[#5C665E] dark:text-[#8FA392] tabular-nums">
                        {formatDate(v.noteDate)}
                      </td>

                      <td className="py-3 px-4 max-w-sm truncate text-[#1A241C] dark:text-[#F3EFE6] font-medium" title={v.description}>
                        {v.description}
                      </td>

                      <td className="py-3 px-4 text-[#5C665E] dark:text-[#8FA392]">
                        {v.treasuryAccountName}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-[#EAE4D7] dark:bg-[#1F2E23] text-[10.5px] text-[#5C665E] dark:text-[#8FA392] border border-[#243628]">
                          {v.costcenterName || 'عام'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-end font-inter font-black text-[#1A241C] dark:text-[#F3EFE6] tabular-nums">
                        <span className="me-1.5">{formatCurrency(v.amount, false)}</span>
                        <span className="text-[10px] font-bold text-[#8FA392]">ج.م</span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setPrintTargetVoucher(v)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#5C665E] dark:text-[#8FA392] hover:text-[#D99B26] dark:hover:text-[#EBB34D] hover:bg-[#EBB34D]/10 transition-colors mx-auto cursor-pointer"
                          title={t('طباعة السند الدفتري', 'Print Voucher')}
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entry Modal */}
      {modalType && (
        <VoucherFormModal
          type={modalType}
          onClose={() => setModalType(null)}
        />
      )}

      {/* Print Modal */}
      {printTargetVoucher && (
        <VoucherPrintModal
          voucher={printTargetVoucher}
          onClose={() => setPrintTargetVoucher(null)}
        />
      )}
    </div>
  );
};
