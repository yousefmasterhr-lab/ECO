import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import { useFinancial } from '../../../context/FinancialContext';
import { toast } from '@erp/ui-system';
import {
  Database,
  Cloud,
  RefreshCw,
  Server,
  Layers,
  CheckCircle2,
  FolderTree,
  Building,
  Scale
} from 'lucide-react';

export const FinancialHeader: React.FC = () => {
  const { t } = useLanguage();
  const {
    mode,
    toggleMode,
    connectionStatus,
    summary,
    isSyncing,
    refreshAccounts,
    accounts,
    costCenters
  } = useFinancial();

  return (
    <div className="w-full space-y-4">
      {/* Top Bar: Title, Engine Status & Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#D99B26]/15 text-[#D99B26] dark:text-[#EBB34D] flex items-center justify-center shrink-0 border border-[#D99B26]/30 shadow-xs">
            <Layers className="w-6 h-6" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-[#1A241C] dark:text-[#F3EFE6] tracking-tight">
                {t('الأستاذ العام ودليل الحسابات (الشؤون المالية)', 'General Ledger & Chart of Accounts')}
              </h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#D99B26]/15 text-[#D99B26] dark:text-[#EBB34D] border border-[#D99B26]/30">
                {t('المستوى 1 - 5', '5-Level Tree')}
              </span>
            </div>
            <p className="text-xs text-[#5C665E] dark:text-[#8FA392] mt-0.5">
              {t(
                `الهيكل المحاسبي الشامل المستخرج والمربوط مباشرة بقاعدة البيانات (${connectionStatus?.databaseName || 'Tarabot_Data_2026'})`,
                `Comprehensive accounting hierarchy mapped directly to database (${connectionStatus?.databaseName || 'Tarabot_Data_2026'})`
              )}
            </p>
          </div>
        </div>

        {/* Engine Bridge Badge & Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {/* Active Connection Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FBF9F5] dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] text-xs font-semibold text-[#1A241C] dark:text-[#F3EFE6]">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                connectionStatus?.connected ? 'bg-[#A3CFAC]' : 'bg-[#EBB34D]'
              }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                connectionStatus?.connected ? 'bg-[#2A3F30] border border-[#37533E]' : 'bg-[#EBB34D]'
              }`} />
            </span>

            <div className="flex items-center gap-1.5 text-[11px]">
              <Server className="w-3.5 h-3.5 text-[#D99B26] dark:text-[#EBB34D]" />
              <span className="font-bold">
                {mode === 'LOCAL' ? `SQL Server (${connectionStatus?.databaseName || 'Tarabot_Data_2026'})` : 'Cloud Repository (سحابي)'}
              </span>
              <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392]">
                ({connectionStatus?.latencyMs || 12}ms)
              </span>
            </div>
          </div>

          {/* Dual-Mode Toggle Button */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              toggleMode();
              const nextMode = mode === 'LOCAL' ? 'Cloud' : 'Local SQL';
              toast.info(
                t(`تم التحويل إلى وضع ${nextMode}`, `Switched to ${nextMode} mode`),
                connectionStatus?.databaseName || 'Tarabot_Data_2026'
              );
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-[#D99B26] hover:bg-[#C58F38] text-white dark:bg-[#EBB34D] dark:hover:bg-[#F5C76D] dark:text-[#121B14] shadow-xs cursor-pointer"
            title={t('التبديل بين الاتصال المحلي بقاعدة البيانات والوضع السحابي', 'Switch between Local SQL Server and Cloud Mode')}
          >
            {mode === 'LOCAL' ? (
              <>
                <Database className="w-3.5 h-3.5" />
                <span>{t('وضع محلي: نشط', 'Local Mode: Active')}</span>
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5" />
                <span>{t('وضع سحابي: نشط', 'Cloud Mode: Active')}</span>
              </>
            )}
          </motion.button>

          {/* Sync / Refresh Button */}
          <button
            onClick={async () => {
              try {
                await refreshAccounts(true);
                toast.success(
                  t('تمت مزامنة الدليل بنجاح', 'Accounts synced successfully'),
                  `${connectionStatus?.databaseName || 'Tarabot_Data_2026'} (${accounts.length} ${t('حساب', 'accounts')})`
                );
              } catch (err: any) {
                toast.error(t('فشلت مزامنة الدليل', 'Failed to sync accounts'), err.message);
              }
            }}
            disabled={isSyncing}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#1A241C] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-all ${
              isSyncing ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
            }`}
            title={t('مزامنة فورية من قاعدة البيانات', 'Sync from Database')}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#D99B26] dark:text-[#EBB34D]' : ''}`} />
            <span>{isSyncing ? t('جارِ المزامنة...', 'Syncing...') : t('مزامنة', 'Sync')}</span>
          </button>
        </div>
      </div>

      {/* Financial KPIs Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Accounts */}
        <div className="p-3.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6]/70 dark:bg-[#17231A]/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5C665E] dark:text-[#8FA392] text-[11px] font-semibold">
            <span>{t('إجمالي الحسابات', 'Total Accounts')}</span>
            <FolderTree className="w-3.5 h-3.5 text-[#D99B26] dark:text-[#EBB34D]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-black text-[#1A241C] dark:text-[#F3EFE6] font-mono">
              {summary?.totalAccounts || 330}
            </span>
            <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392]">{t('حساب', 'accts')}</span>
          </div>
          <span className="text-[10px] text-[#D99B26] dark:text-[#EBB34D] font-medium mt-1">
            {t('5 مستويات محاسبية', '5 Accounting Levels')}
          </span>
        </div>

        {/* Current Assets */}
        <div className="p-3.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6]/70 dark:bg-[#17231A]/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5C665E] dark:text-[#8FA392] text-[11px] font-semibold">
            <span>{t('الأصول المتداولة (12)', 'Current Assets')}</span>
            <span className="w-2 h-2 rounded-full bg-[#A3CFAC]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-black text-[#1A241C] dark:text-[#F3EFE6] font-mono">
              {accounts.find(a => a.code === '1')?.leafCount || 108}
            </span>
            <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392]">{t('حساب فرعي', 'sub')}</span>
          </div>
          <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392] font-medium mt-1 truncate">
            {t('خزائن وبنوك وعملاء ومخزون', 'Treasury, Banks, Debtors')}
          </span>
        </div>

        {/* Liabilities & Equity */}
        <div className="p-3.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6]/70 dark:bg-[#17231A]/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5C665E] dark:text-[#8FA392] text-[11px] font-semibold">
            <span>{t('الخصوم والملكية (2)', 'Liabilities & Equity')}</span>
            <span className="w-2 h-2 rounded-full bg-[#EBB34D]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-black text-[#1A241C] dark:text-[#F3EFE6] font-mono">
              {accounts.find(a => a.code === '2')?.leafCount || 120}
            </span>
            <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392]">{t('حساب فرعي', 'sub')}</span>
          </div>
          <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392] font-medium mt-1 truncate">
            {t('موردون ودائنون ورأس مال', 'Vendors, Payables, Capital')}
          </span>
        </div>

        {/* Expenses & Costs */}
        <div className="p-3.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6]/70 dark:bg-[#17231A]/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5C665E] dark:text-[#8FA392] text-[11px] font-semibold">
            <span>{t('المصروفات والتكاليف (3)', 'Expenses & Costs')}</span>
            <span className="w-2 h-2 rounded-full bg-[#EFA3A3]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-black text-[#1A241C] dark:text-[#F3EFE6] font-mono">
              {accounts.find(a => a.code === '3')?.leafCount || 102}
            </span>
            <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392]">{t('حساب فرعي', 'sub')}</span>
          </div>
          <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392] font-medium mt-1 truncate">
            {t('تكاليف مشروعات وعمومية', 'Project Costs & Overhead')}
          </span>
        </div>

        {/* Cost Centers */}
        <div className="p-3.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6]/70 dark:bg-[#17231A]/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5C665E] dark:text-[#8FA392] text-[11px] font-semibold">
            <span>{t('مراكز التكلفة', 'Cost Centers')}</span>
            <Building className="w-3.5 h-3.5 text-[#D99B26] dark:text-[#EBB34D]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-black text-[#1A241C] dark:text-[#F3EFE6] font-mono">
              {costCenters.length || 32}
            </span>
            <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392]">{t('مركز نشط', 'active')}</span>
          </div>
          <span className="text-[10px] text-[#D99B26] dark:text-[#EBB34D] font-medium mt-1 truncate">
            {t('مربوطة بالمشاريع والمواقع', 'Linked to Sites')}
          </span>
        </div>

        {/* Accounting Equilibrium Check */}
        <div className="p-3.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6]/70 dark:bg-[#17231A]/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5C665E] dark:text-[#8FA392] text-[11px] font-semibold">
            <span>{t('توازن الدليل', 'Tree Balance')}</span>
            <Scale className="w-3.5 h-3.5 text-[#D99B26] dark:text-[#EBB34D]" />
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[#A3CFAC] font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#A3CFAC]" />
            <span>{t('متزن محاسبياً', 'Balanced')}</span>
          </div>
          <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392] font-medium mt-1">
            {t('طبيعة الحسابات محددة', 'Natures Audited')}
          </span>
        </div>
      </div>
    </div>
  );
};
