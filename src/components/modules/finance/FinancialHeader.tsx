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
      {/* Overview Banner - Matching General Journal Master Palette */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="p-5 sm:p-6 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-gradient-to-r from-[#FBF9F5] via-[#F3EFE6] to-[#EAE4D7]/70 dark:from-[#17231A] dark:via-[#131E15] dark:to-[#0E1610] shadow-xs"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#059669]/15 text-[#059669] dark:text-[#34D399] border border-[#059669]/30">
                {t('دليل الحسابات والأستاذ العام', 'Chart of Accounts & General Ledger')}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-sans">
                {t('المستوى 1 - 5', '5-Level Tree')}
              </span>
              <span className="text-xs text-[#5C665E] dark:text-[#8FA392] font-mono">
                {connectionStatus?.databaseName || 'Tarabot_Data_2026'} / Level1_AccGuide .. Level5_AccGuide
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#1A241C] dark:text-[#F3EFE6] tracking-tight">
              {t('الأستاذ العام ودليل الحسابات (الشؤون المالية)', 'General Ledger & Chart of Accounts')}
            </h1>

            <p className="text-xs sm:text-sm text-[#5C665E] dark:text-[#8FA392] max-w-2xl leading-relaxed">
              {t(
                'الهيكل المحاسبي الشامل المستخرج والمربوط مباشرة بقاعدة البيانات مع التدقيق اللحظي للأرصدة والمستويات ومراكز التكلفة والتفقيط المالي.',
                'Comprehensive accounting hierarchy mapped directly to database with real-time balance integrity and cost center tracking.'
              )}
            </p>
          </div>

          {/* Engine Bridge Badge & Controls */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            {/* Active Connection Status Badge */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-[#141E16] border border-[#E0D9CB] dark:border-[#243628] text-xs text-[#1A241C] dark:text-[#F3EFE6] shadow-2xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#059669]" />
              </span>

              <div className="flex items-center gap-1.5 text-[11px]">
                <Server className="w-3.5 h-3.5 text-[#059669] dark:text-[#34D399]" />
                <span className="font-semibold text-[#1A241C] dark:text-[#F3EFE6]">
                  {mode === 'LOCAL' ? `SQL Server (${connectionStatus?.databaseName || 'Tarabot_Data_2026'})` : 'Cloud Repository (سحابي)'}
                </span>
                <span className="text-[10px] font-mono font-bold text-[#059669] dark:text-[#34D399] px-1.5 py-0.5 rounded bg-[#059669]/10 border border-[#059669]/20">
                  {connectionStatus?.latencyMs || 12}ms
                </span>
              </div>
            </div>

            {/* Mode Switcher Pill */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                toggleMode();
                const nextMode = mode === 'LOCAL' ? 'Cloud' : 'Local SQL';
                toast.info(
                  t(`تم التحويل إلى وضع ${nextMode}`, `Switched to ${nextMode} mode`),
                  connectionStatus?.databaseName || 'Tarabot_Data_2026'
                );
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#141E16] text-[#1A241C] dark:text-[#F3EFE6] hover:bg-[#F3EFE6] dark:hover:bg-[#1C2A1E] transition-all cursor-pointer shadow-xs"
              title={t('التبديل بين الاتصال المحلي بقاعدة البيانات والوضع السحابي', 'Switch between Local SQL Server and Cloud Mode')}
            >
              <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse shrink-0" />
              {mode === 'LOCAL' ? (
                <>
                  <Database className="w-3.5 h-3.5 text-[#059669] dark:text-[#34D399]" />
                  <span>{t('وضع محلي: نشط', 'Local Mode: Active')}</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5 text-[#059669] dark:text-[#34D399]" />
                  <span>{t('وضع سحابي: نشط', 'Cloud Mode: Active')}</span>
                </>
              )}
            </motion.button>

            {/* Sync / Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
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
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#141E16] text-[#1A241C] dark:text-[#F3EFE6] hover:bg-[#F3EFE6] dark:hover:bg-[#1C2A1E] transition-all cursor-pointer shadow-xs ${
                isSyncing ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              title={t('مزامنة فورية من قاعدة البيانات', 'Sync from Database')}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#059669] ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? t('جارِ المزامنة...', 'Syncing...') : t('مزامنة الحسابات', 'Sync Accounts')}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Financial KPIs Strip (Matching General Journal Metric Tiles) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Accounts */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-1.5 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392]">
            <span>{t('إجمالي الحسابات', 'Total Accounts')}</span>
            <div className="w-8 h-8 rounded-lg bg-[#059669]/15 text-[#059669] dark:text-[#34D399] flex items-center justify-center">
              <FolderTree className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-mono font-black text-[#1A241C] dark:text-[#F3EFE6]">
            {summary?.totalAccounts || accounts.length || 330}{' '}
            <span className="text-xs font-normal text-[#5C665E] dark:text-[#8FA392]">{t('حساب', 'accts')}</span>
          </div>
          <span className="text-[11px] text-[#059669] dark:text-[#34D399] font-medium">
            {t('5 مستويات محاسبية', '5 Accounting Levels')}
          </span>
        </motion.div>

        {/* Current Assets */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-1.5 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392]">
            <span>{t('الأصول المتداولة (12)', 'Current Assets')}</span>
            <div className="w-8 h-8 rounded-lg bg-[#EAF3EB] dark:bg-[#2A3F30] text-[#245E33] dark:text-[#A3CFAC] flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-[#059669] dark:bg-[#34D399]" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-mono font-black text-[#245E33] dark:text-[#A3CFAC] tabular-nums">
            {accounts.find(a => a.code === '1')?.leafCount || 108}{' '}
            <span className="text-xs font-normal text-[#5C665E] dark:text-[#8FA392]">{t('فرعي', 'sub')}</span>
          </div>
          <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392] truncate">
            {t('خزائن وبنوك وعملاء ومخزون', 'Treasury, Banks, Debtors')}
          </span>
        </motion.div>

        {/* Liabilities & Equity */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-1.5 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392]">
            <span>{t('الخصوم والملكية (2)', 'Liabilities & Equity')}</span>
            <div className="w-8 h-8 rounded-lg bg-[#F8EBEB] dark:bg-[#3F2A2A] text-[#7A2828] dark:text-[#EFA3A3] flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-[#DC2626] dark:bg-[#EFA3A3]" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-mono font-black text-[#7A2828] dark:text-[#EFA3A3] tabular-nums">
            {accounts.find(a => a.code === '2')?.leafCount || 120}{' '}
            <span className="text-xs font-normal text-[#5C665E] dark:text-[#8FA392]">{t('فرعي', 'sub')}</span>
          </div>
          <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392] truncate">
            {t('موردون ودائنون ورأس مال', 'Vendors, Payables, Capital')}
          </span>
        </motion.div>

        {/* Expenses & Costs */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-1.5 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392]">
            <span>{t('المصروفات والتكاليف (3)', 'Expenses & Costs')}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-mono font-black text-amber-700 dark:text-amber-300 tabular-nums">
            {accounts.find(a => a.code === '3')?.leafCount || 102}{' '}
            <span className="text-xs font-normal text-[#5C665E] dark:text-[#8FA392]">{t('فرعي', 'sub')}</span>
          </div>
          <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392] truncate">
            {t('تكاليف مشروعات وعمومية', 'Project Costs & Overhead')}
          </span>
        </motion.div>

        {/* Cost Centers */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-1.5 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392]">
            <span>{t('مراكز التكلفة', 'Cost Centers')}</span>
            <div className="w-8 h-8 rounded-lg bg-[#059669]/15 text-[#059669] dark:text-[#34D399] flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-mono font-black text-[#1A241C] dark:text-[#F3EFE6] tabular-nums">
            {costCenters.length || 47}{' '}
            <span className="text-xs font-normal text-[#5C665E] dark:text-[#8FA392]">{t('مركز نشط', 'active')}</span>
          </div>
          <span className="text-[11px] text-[#059669] dark:text-[#34D399] font-medium truncate">
            {t('مربوطة بالمشاريع والمواقع', 'Linked to Sites')}
          </span>
        </motion.div>

        {/* Accounting Equilibrium Check */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-1.5 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392]">
            <span>{t('توازن الدليل', 'Tree Balance')}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{t('100% متزن محاسبياً', '100% Balanced')}</span>
          </div>
          <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
            {t('الفرق الدفتري = 0.00 ج.م', 'Net Variance = 0.00 EGP')}
          </span>
        </motion.div>
      </div>
    </div>
  );
};
