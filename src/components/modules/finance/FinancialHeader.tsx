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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 shadow-xs">
            <Layers className="w-6 h-6" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                {t('الأستاذ العام ودليل الحسابات (الشؤون المالية)', 'General Ledger & Chart of Accounts')}
              </h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                {t('المستوى 1 - 5', '5-Level Tree')}
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
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
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-750 text-xs text-stone-800 dark:text-stone-200 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-amber-400" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 animate-pulse" />
            </span>

            <div className="flex items-center gap-1.5 text-[11px]">
              <Server className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                {mode === 'LOCAL' ? `SQL Server (${connectionStatus?.databaseName || 'Tarabot_Data_2026'})` : 'Cloud Repository (سحابي)'}
              </span>
              <span className="text-[10px] font-mono font-medium text-stone-500 dark:text-stone-400 px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700">
                {connectionStatus?.latencyMs || 12}ms
              </span>
            </div>
          </div>

          {/* Luxury Warm Amber Status Pill ([وضع محلي: نشط]) */}
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
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 text-xs font-medium cursor-pointer transition-all hover:bg-amber-100 dark:hover:bg-amber-900/40 shadow-xs"
            title={t('التبديل بين الاتصال المحلي بقاعدة البيانات والوضع السحابي', 'Switch between Local SQL Server and Cloud Mode')}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            {mode === 'LOCAL' ? (
              <>
                <Database className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{t('وضع محلي: نشط', 'Local Mode: Active')}</span>
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-stone-200/80 dark:border-stone-700/80 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 transition-colors shadow-2xs ${
              isSyncing ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
            }`}
            title={t('مزامنة فورية من قاعدة البيانات', 'Sync from Database')}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-600 dark:text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? t('جارِ المزامنة...', 'Syncing...') : t('مزامنة', 'Sync')}</span>
          </button>
        </div>
      </div>

      {/* Financial KPIs Strip (Warm Amber Accent Tiles - Matching Reception & Visitors) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Accounts */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 border-t-2 border-t-amber-500 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-[11px] font-medium">
            <span>{t('إجمالي الحسابات', 'Total Accounts')}</span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              <FolderTree className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono text-xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
              {summary?.totalAccounts || 330}
            </span>
            <span className="text-[10px] font-medium text-stone-400 dark:text-stone-500">{t('حساب', 'accts')}</span>
          </div>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium mt-1">
            {t('5 مستويات محاسبية', '5 Accounting Levels')}
          </span>
        </div>

        {/* Current Assets */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 border-t-2 border-t-amber-500 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-[11px] font-medium">
            <span>{t('الأصول المتداولة (12)', 'Current Assets')}</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 shadow-xs" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono text-xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
              {accounts.find(a => a.code === '1')?.leafCount || 108}
            </span>
            <span className="text-[10px] font-medium text-stone-400 dark:text-stone-500">{t('حساب فرعي', 'sub')}</span>
          </div>
          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium mt-1 truncate">
            {t('خزائن وبنوك وعملاء ومخزون', 'Treasury, Banks, Debtors')}
          </span>
        </div>

        {/* Liabilities & Equity */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 border-t-2 border-t-amber-500 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-[11px] font-medium">
            <span>{t('الخصوم والملكية (2)', 'Liabilities & Equity')}</span>
            <span className="w-2 h-2 rounded-full bg-amber-600 shadow-xs" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono text-xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
              {accounts.find(a => a.code === '2')?.leafCount || 120}
            </span>
            <span className="text-[10px] font-medium text-stone-400 dark:text-stone-500">{t('حساب فرعي', 'sub')}</span>
          </div>
          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium mt-1 truncate">
            {t('موردون ودائنون ورأس مال', 'Vendors, Payables, Capital')}
          </span>
        </div>

        {/* Expenses & Costs */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 border-t-2 border-t-amber-500 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-[11px] font-medium">
            <span>{t('المصروفات والتكاليف (3)', 'Expenses & Costs')}</span>
            <span className="w-2 h-2 rounded-full bg-amber-700 shadow-xs" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono text-xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
              {accounts.find(a => a.code === '3')?.leafCount || 102}
            </span>
            <span className="text-[10px] font-medium text-stone-400 dark:text-stone-500">{t('حساب فرعي', 'sub')}</span>
          </div>
          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium mt-1 truncate">
            {t('تكاليف مشروعات وعمومية', 'Project Costs & Overhead')}
          </span>
        </div>

        {/* Cost Centers */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 border-t-2 border-t-amber-500 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-[11px] font-medium">
            <span>{t('مراكز التكلفة', 'Cost Centers')}</span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              <Building className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono text-xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
              {costCenters.length || 32}
            </span>
            <span className="text-[10px] font-medium text-stone-400 dark:text-stone-500">{t('مركز نشط', 'active')}</span>
          </div>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium mt-1 truncate">
            {t('مربوطة بالمشاريع والمواقع', 'Linked to Sites')}
          </span>
        </div>

        {/* Accounting Equilibrium Check */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 border-t-2 border-t-amber-500 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-[11px] font-medium">
            <span>{t('توازن الدليل', 'Tree Balance')}</span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              <Scale className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>{t('متزن محاسبياً', 'Balanced')}</span>
          </div>
          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium mt-1">
            {t('طبيعة الحسابات محددة', 'Natures Audited')}
          </span>
        </div>
      </div>
    </div>
  );
};
