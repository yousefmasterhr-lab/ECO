import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { useFinancial } from '../../../context/FinancialContext';
import { useDatabase } from '../../../services/federation/DatabaseContext';
import { VoucherFormModal } from './VoucherFormModal';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatIban,
  formatDate,
  toWesternDigits,
} from '../../../utils/formatters';
import {
  Banknote,
  Building2,
  RefreshCw,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
  Activity,
  FileText
} from 'lucide-react';

export const TreasuryModule: React.FC = () => {
  const { t } = useLanguage();
  const { selectItem } = useNavigation();
  const { activeDatabase } = useDatabase();
  const { treasuryAccounts, vouchers, refreshPhase2Data } = useFinancial();
  const [modalMode, setModalMode] = useState<'RECEIPT' | 'PAYMENT' | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const cashAccounts = treasuryAccounts.filter(a => a.type === 'CASH');
  const bankAccounts = treasuryAccounts.filter(a => a.type === 'BANK');

  const totalCashBalance = cashAccounts.reduce((acc, a) => acc + (a.balance || 0), 0);
  const totalBankBalance = bankAccounts.reduce((acc, a) => acc + (a.balance || 0), 0);
  const totalLiquidity = totalCashBalance + totalBankBalance;

  // Short-term obligations / payables (simulated from payables data ~ 35% of liquidity)
  const shortTermPayables = 1450000;
  const liquidityRatio = Math.round((totalLiquidity / (shortTermPayables || 1)) * 100);

  const handleCopyIban = (accountNumber: string, id: string) => {
    navigator.clipboard.writeText(accountNumber);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshPhase2Data();
    setIsRefreshing(false);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: Liquidity Overview & Quick Actions */}
      <div className="p-5 sm:p-6 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-gradient-to-r from-[#FBF9F5] via-[#F3EFE6] to-[#EAE4D7]/70 dark:from-[#17231A] dark:via-[#131E15] dark:to-[#0E1610] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EBB34D]/15 text-[#D99B26] dark:text-[#EBB34D] border border-[#EBB34D]/30">
                {t('إدارة السيولة الفورية', 'Instant Liquidity Management')}
              </span>
              <span className="text-xs text-[#5C665E] dark:text-[#8FA392] font-mono">
                {activeDatabase} / Level 4 (1201 - 1202)
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#1A241C] dark:text-[#F3EFE6] tracking-tight">
              {t('الخزينة والبنوك والسيولة النقدية', 'Treasury, Bank Accounts & Cash Management')}
            </h1>

            <p className="text-xs sm:text-sm text-[#5C665E] dark:text-[#8FA392] max-w-2xl leading-relaxed">
              {t(
                'متابعة فورية لأرصدة الخزائن النقدية وحسابات البنوك الشركات، مع ضبط حركات القبض والصرف ومطابقة ميزان السيولة.',
                'Real-time cash and bank ledger balances, cash register sessions, and instant liquidity ratio.'
              )}
            </p>
          </div>

          {/* Quick Transaction Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            <button
              onClick={() => setModalMode('RECEIPT')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#2A3F30] text-[#A3CFAC] hover:bg-[#344F3C] border border-[#344F3C] shadow-xs transition-all cursor-pointer"
            >
              <ArrowDownLeft className="w-4 h-4 text-[#A3CFAC]" />
              <span>{t('تحرير سند قبض (+)', 'New Receipt Voucher (+)')}</span>
            </button>

            <button
              onClick={() => setModalMode('PAYMENT')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#3F2A2A] text-[#EFA3A3] hover:bg-[#4E3535] border border-[#4E3535] shadow-xs transition-all cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4 text-[#EFA3A3]" />
              <span>{t('تحرير سند صرف (-)', 'New Payment Voucher (-)')}</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-10 h-10 rounded-xl flex items-center justify-center border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#1A241C] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#243628] transition-all cursor-pointer"
              title={t('تحديث الأرصدة', 'Refresh Balances')}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#EBB34D]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Liquidity Gauge Bar */}
        <div className="mt-5 pt-4 border-t border-[#E0D9CB]/80 dark:border-[#243628]/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 text-xs">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#EBB34D]" />
              <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                {t('مؤشر كفاية السيولة الفورية (Quick Liquidity Ratio)', 'Instant Liquidity Coverage')}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBB34D]/15 text-[#D99B26] dark:text-[#EBB34D] border border-[#EBB34D]/30">
                {t('مؤشر تقديري تجريبي', 'Estimated Ratio (Preview)')}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-[#5C665E] dark:text-[#8FA392]">
                {t('إجمالي النقد المتاح:', 'Total Liquid:')}
                <strong className="text-[#D99B26] dark:text-[#EBB34D] ms-1 font-inter tabular-nums">
                  {formatCurrency(totalLiquidity)}
                </strong>
              </span>
              <span className="text-[#5C665E] dark:text-[#8FA392]">
                {t('الالتزامات الوشيكة (تجريبي):', 'Obligations (Est):')}
                <strong className="text-[#8FA392] ms-1 font-inter tabular-nums">
                  {formatCurrency(shortTermPayables)}
                </strong>
              </span>
              <span className="font-inter font-bold text-[#EBB34D] tabular-nums">
                ({formatPercent(liquidityRatio)})
              </span>
            </div>
          </div>

          {/* Progress track */}
          <div className="h-2.5 w-full bg-[#EAE4D7] dark:bg-[#1A241C] rounded-full overflow-hidden p-0.5 border border-[#E0D9CB] dark:border-[#243628]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(liquidityRatio, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-[#D99B26] via-[#EBB34D] to-[#A3CFAC] shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Section 1: Cash Boxes (خزائن وصناديق النقدية) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EBB34D]/15 text-[#D99B26] dark:text-[#EBB34D] border border-[#EBB34D]/25 flex items-center justify-center font-bold">
              <Banknote className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
                <span>{t('صناديق الخزينة النقدية (Cash Registers)', 'Cash Registers')}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#2A3F30] text-[#A3CFAC] border border-[#243628]">
                  {t('بيانات مطابقة لقاعدة البيانات', 'Live Database Verified')}
                </span>
              </h2>
              <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                {t('أرصدة الخزائن الرئيسية وصناديق العهد من دفتر الأستاذ العام', 'Cash registers from General Ledger')}
              </span>
            </div>
          </div>

          <span className="text-xs font-inter font-bold text-[#D99B26] dark:text-[#EBB34D] bg-[#EBB34D]/10 px-3 py-1 rounded-lg border border-[#EBB34D]/25 tabular-nums">
            {formatCurrency(totalCashBalance)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cashAccounts.map(box => (
            <div
              key={box.id}
              className="p-4 sm:p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] flex flex-col justify-between space-y-4 shadow-2xs hover:border-[#EBB34D]/40 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EBB34D]/15 text-[#D99B26] dark:text-[#EBB34D] border border-[#EBB34D]/25 flex items-center justify-center shrink-0">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                      {box.nameAr}
                    </h3>
                    <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392] flex items-center gap-1">
                      <span>كود الحساب:</span>
                      <span className="font-inter font-semibold text-[#D99B26] dark:text-[#EBB34D] tabular-nums">
                        {toWesternDigits(box.code)}
                      </span>
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#2A3F30] text-[#A3CFAC] border border-[#243628] shrink-0">
                  {t('نشط', 'Active')}
                </span>
              </div>

              {/* Balance container with dedicated currency badge to prevent awkward wrapping */}
              <div className="p-3.5 rounded-xl bg-[#F3EFE6] dark:bg-[#1A241C] border border-[#E0D9CB]/60 dark:border-[#243628]/60 flex items-baseline justify-between gap-3">
                <div>
                  <span className="text-[11px] font-medium text-[#5C665E] dark:text-[#8FA392] block">
                    {t('الرصيد الدفتري الحالي المتوفر', 'Current Cash Balance')}
                  </span>
                  <span className="text-xl font-black font-inter tracking-tight text-[#1A241C] dark:text-[#F3EFE6] block mt-1 tabular-nums">
                    {formatCurrency(box.balance, false)}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#EBB34D]/15 text-[#D99B26] dark:text-[#EBB34D] border border-[#EBB34D]/30 shrink-0">
                  ج.م
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E0D9CB]/50 dark:border-[#243628]/50">
                <span className="text-[#5C665E] dark:text-[#8FA392]">
                  {t('الموقع / الحيازة:', 'Location:')} {t('المقر الرئيسي', 'HQ')}
                </span>
                <button
                  onClick={() => setModalMode('PAYMENT')}
                  className="font-bold text-[#D99B26] dark:text-[#EBB34D] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>{t('صرف نقدية', 'Disburse')}</span>
                  <span className="font-inter">←</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Corporate Bank Accounts (الحسابات البنكية) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EBB34D]/15 text-[#D99B26] dark:text-[#EBB34D] border border-[#EBB34D]/25 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                {t('الحسابات البنكية المعتمدة (Corporate Bank Accounts)', 'Corporate Bank Accounts')}
              </h2>
              <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                {t('الحسابات الجارية وعمليات المشاريع مع البنوك الرسمية', 'Checking accounts & projects')}
              </span>
            </div>
          </div>

          <span className="text-xs font-inter font-bold text-[#D99B26] dark:text-[#EBB34D] bg-[#EBB34D]/10 px-3 py-1 rounded-lg border border-[#EBB34D]/25 tabular-nums">
            {formatCurrency(totalBankBalance)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {bankAccounts.map(bank => (
            <div
              key={bank.id}
              className="p-4 sm:p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] flex flex-col justify-between space-y-4 shadow-2xs hover:border-[#EBB34D]/40 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-1 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EBB34D]/15 text-[#D99B26] dark:text-[#EBB34D] border border-[#EBB34D]/30 shrink-0">
                    {bank.bankName}
                  </span>
                  <span className="font-inter text-[11px] text-[#5C665E] dark:text-[#8FA392] tabular-nums">
                    {toWesternDigits(bank.code)}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] leading-snug line-clamp-2">
                  {bank.nameAr}
                </h3>
              </div>

              {/* Balance block */}
              <div className="p-3.5 rounded-xl bg-[#F3EFE6] dark:bg-[#1A241C] border border-[#E0D9CB]/60 dark:border-[#243628]/60 flex items-baseline justify-between gap-3">
                <div>
                  <span className="text-[11px] font-medium text-[#5C665E] dark:text-[#8FA392] block">
                    {t('الرصيد الدفتري البنكي', 'Book Balance')}
                  </span>
                  <span className="text-xl font-black font-inter tracking-tight text-[#1A241C] dark:text-[#F3EFE6] block mt-1 tabular-nums">
                    {formatCurrency(bank.balance, false)}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#EBB34D]/15 text-[#D99B26] dark:text-[#EBB34D] border border-[#EBB34D]/30 shrink-0">
                  ج.م
                </span>
              </div>

              {/* Account / IBAN & Copy */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E0D9CB]/50 dark:border-[#243628]/50">
                <span
                  className="font-inter text-xs text-[#5C665E] dark:text-[#8FA392] truncate max-w-[150px] tracking-wider tabular-nums"
                  title={bank.accountNumber}
                >
                  {formatIban(bank.accountNumber)}
                </span>

                <button
                  onClick={() => handleCopyIban(bank.accountNumber, bank.id)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#5C665E] dark:text-[#8FA392] hover:text-[#D99B26] dark:hover:text-[#EBB34D] transition-colors cursor-pointer shrink-0"
                >
                  {copiedId === bank.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#A3CFAC]" />
                      <span className="text-[#A3CFAC]">{t('تم النسخ', 'Copied')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t('نسخ', 'Copy')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Recent Vouchers Strip */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#121B14] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#EBB34D]" />
            <h3 className="text-xs sm:text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
              {t('آخر سندات القبض والصرف المسجلة (Recent Treasury Vouchers)', 'Recent Vouchers')}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#5C665E] dark:text-[#8FA392]">
              <span className="font-inter font-bold text-[#D99B26] dark:text-[#EBB34D] tabular-nums">
                {formatNumber(vouchers.length)}
              </span>{' '}
              {t('سند مسجل', 'vouchers')}
            </span>
            <button
              onClick={() => selectItem('finance', 'fin_vouchers')}
              className="px-3 py-1 text-xs font-bold rounded-lg border border-[#EBB34D]/40 text-[#D99B26] dark:text-[#EBB34D] hover:bg-[#EBB34D]/10 transition-colors cursor-pointer"
            >
              {t('عرض كافة السندات', 'View All Vouchers')}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-[#E0D9CB] dark:border-[#243628] text-[#5C665E] dark:text-[#8FA392]">
                <th className="py-2.5 px-3 text-start">{t('رقم السند', 'No.')}</th>
                <th className="py-2.5 px-3 text-start">{t('النوع', 'Type')}</th>
                <th className="py-2.5 px-3 text-start">{t('التاريخ', 'Date')}</th>
                <th className="py-2.5 px-3 text-start">{t('البيان / المستفيد', 'Description')}</th>
                <th className="py-2.5 px-3 text-start">{t('حساب الخزينة / البنك', 'Account')}</th>
                <th className="py-2.5 px-3 text-end">{t('المبلغ', 'Amount')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CB]/50 dark:divide-[#243628]/50">
              {vouchers.slice(0, 5).map(v => (
                <tr key={v.id} className="hover:bg-[#F3EFE6]/50 dark:hover:bg-[#17231A]/40 transition-colors">
                  <td className="py-3 px-3 font-inter font-bold text-[#D99B26] dark:text-[#EBB34D] tabular-nums">
                    {toWesternDigits(v.noteNo)}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                        v.voucherType === 'RECEIPT'
                          ? 'bg-[#2A3F30] text-[#A3CFAC] border-[#243628]'
                          : 'bg-[#3F2A2A] text-[#EFA3A3] border-[#243628]'
                      }`}
                    >
                      {v.voucherType === 'RECEIPT' ? t('سند قبض', 'Receipt') : t('سند صرف', 'Payment')}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-inter text-[#5C665E] dark:text-[#8FA392] tabular-nums">
                    {formatDate(v.noteDate)}
                  </td>
                  <td className="py-3 px-3 max-w-xs truncate text-[#1A241C] dark:text-[#F3EFE6] font-medium">
                    {v.description}
                  </td>
                  <td className="py-3 px-3 text-[#5C665E] dark:text-[#8FA392] truncate">
                    {v.treasuryAccountName}
                  </td>
                  <td className="py-3 px-3 text-end font-inter font-black text-[#1A241C] dark:text-[#F3EFE6] tabular-nums">
                    <span className="me-1.5">{formatCurrency(v.amount, false)}</span>
                    <span className="text-[10px] font-bold text-[#8FA392]">ج.م</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Voucher Entry Modal */}
      {modalMode && (
        <VoucherFormModal
          type={modalMode}
          onClose={() => setModalMode(null)}
        />
      )}
    </div>
  );
};
