import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useDatabase } from '../../../services/federation/DatabaseContext';
import { FinancialDashboard } from './FinancialDashboard';
import { TrialBalanceReport } from './TrialBalanceReport';
import { IncomeStatementReport } from './IncomeStatementReport';
import { BalanceSheetReport } from './BalanceSheetReport';
import { AccountStatementReport } from './AccountStatementReport';
import {
  BarChart3,
  Scale,
  TrendingUp,
  Landmark,
  BookOpen,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

type ReportTab =
  | 'CFO_DASHBOARD'
  | 'TRIAL_BALANCE'
  | 'INCOME_STATEMENT'
  | 'BALANCE_SHEET'
  | 'STATEMENT_OF_ACCOUNT';

const resolveInitialTab = (): ReportTab => {
  if (typeof window === 'undefined') return 'CFO_DASHBOARD';
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab');
  if (tab === 'statement' || tab === 'STATEMENT_OF_ACCOUNT') return 'STATEMENT_OF_ACCOUNT';
  if (tab === 'trial-balance' || tab === 'TRIAL_BALANCE') return 'TRIAL_BALANCE';
  if (tab === 'income-statement' || tab === 'INCOME_STATEMENT') return 'INCOME_STATEMENT';
  if (tab === 'balance-sheet' || tab === 'BALANCE_SHEET') return 'BALANCE_SHEET';
  return 'CFO_DASHBOARD';
};

export const ReportsModule: React.FC = () => {
  const { t } = useLanguage();
  const { activeDatabase } = useDatabase();
  const [activeTab, setActiveTab] = useState<ReportTab>(resolveInitialTab);

  React.useEffect(() => {
    const handleDeepLink = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail?.tab) {
        setActiveTab(custom.detail.tab);
      }
    };
    window.addEventListener('erp:deep-link', handleDeepLink);
    return () => window.removeEventListener('erp:deep-link', handleDeepLink);
  }, []);

  const handleTabChange = (tabId: ReportTab) => {
    setActiveTab(tabId);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const tabParam =
        tabId === 'STATEMENT_OF_ACCOUNT'
          ? 'statement'
          : tabId === 'TRIAL_BALANCE'
          ? 'trial-balance'
          : tabId === 'INCOME_STATEMENT'
          ? 'income-statement'
          : tabId === 'BALANCE_SHEET'
          ? 'balance-sheet'
          : 'cfo-dashboard';
      url.searchParams.set('tab', tabParam);
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  };

  const TABS: {
    id: ReportTab;
    titleAr: string;
    titleEn: string;
    icon: React.ElementType;
    badgeAr?: string;
  }[] = [
    {
      id: 'CFO_DASHBOARD',
      titleAr: 'لوحة الذكاء المالي للمدير المالي',
      titleEn: 'CFO Executive BI Dashboard',
      icon: BarChart3,
      badgeAr: 'مؤشرات حية',
    },
    {
      id: 'TRIAL_BALANCE',
      titleAr: 'ميزان المراجعة (5 مستويات)',
      titleEn: '5-Level Trial Balance',
      icon: Scale,
      badgeAr: 'فحص الاتزان',
    },
    {
      id: 'INCOME_STATEMENT',
      titleAr: 'قائمة الدخل والأرباح والخسائر',
      titleEn: 'Income Statement (P&L)',
      icon: TrendingUp,
      badgeAr: 'الأرباح والتكاليف',
    },
    {
      id: 'BALANCE_SHEET',
      titleAr: 'الميزانية العمومية والمركز المالي',
      titleEn: 'Balance Sheet & Financial Position',
      icon: Landmark,
      badgeAr: 'معادلة المركز',
    },
    {
      id: 'STATEMENT_OF_ACCOUNT',
      titleAr: 'كشف الحساب التفصيلي والتحليلي',
      titleEn: 'Statement of Account (Sub-Ledger)',
      icon: BookOpen,
      badgeAr: 'رصيد متحرك',
    },
  ];

  return (
    <div className="w-full max-w-none space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Module Header */}
      <div className="p-6 rounded-3xl border border-[#E0D9CB] dark:border-[#243628] bg-gradient-to-r from-[#FBF9F5] via-[#F3EFE6] to-[#EAE4D7]/70 dark:from-[#17231A] dark:via-[#131E15] dark:to-[#0E1610] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black px-3 py-1 rounded-full bg-[#2A3F30] text-[#A3CFAC] border border-[#3E5C46] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#EBB34D]" />
                {t('منظومة التقارير المالية والذكاء التحليلي (المرحلة 5)', 'Financial BI & Reporting Engine (Phase 5)')}
              </span>
              <span className="text-xs font-bold text-[#5C665E] dark:text-[#8FA392]">
                {t('بديل 164 تقرير كريستال ريبورت legacy (.rpt)', 'Replacing 164 legacy Crystal Reports (.rpt) assets')}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1A241C] dark:text-[#F3EFE6]">
              {t('التقارير المالية المعتمدة والقوائم الختامية للمنشأة', 'Enterprise Financial Statements & BI Analytics')}
            </h1>
            <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
              {t(
                'استخراج فوري لموازين المراجعة الخماسية، وقوائم الدخل، والمركز المالي، وكشوف الحسابات التفصيلية مع تصدير Excel وطباعة معتمدة.',
                'Real-time trial balance, P&L, balance sheets, and running sub-ledgers with high-DPI print stylesheets and Excel exports.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
            <div className="px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] flex items-center gap-2 text-xs shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#EBB34D]" />
              <div className="text-right">
                <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392] block">{t('قاعدة البيانات النشطة:', 'Active DB Context:')}</span>
                <span className="font-mono font-bold text-[#EBB34D]">{activeDatabase}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="mt-6 pt-4 border-t border-[#E0D9CB]/60 dark:border-[#243628] flex items-center gap-2 overflow-x-auto pb-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#1F2E23] text-[#EBB34D] border border-[#EBB34D] shadow-md shadow-black/20'
                    : 'bg-white dark:bg-[#121A13] border border-[#E0D9CB] dark:border-[#243628] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1D2B20]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t(tab.titleAr, tab.titleEn)}</span>
                {tab.badgeAr && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-[#EBB34D]/20 text-[#EBB34D] border border-[#EBB34D]/30'
                        : 'bg-[#2A3F30] border border-[#3E5C46] text-[#A3CFAC]'
                    }`}
                  >
                    {tab.badgeAr}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Selected Report View */}
      <div className="w-full">
        {activeTab === 'CFO_DASHBOARD' && <FinancialDashboard />}
        {activeTab === 'TRIAL_BALANCE' && <TrialBalanceReport />}
        {activeTab === 'INCOME_STATEMENT' && <IncomeStatementReport />}
        {activeTab === 'BALANCE_SHEET' && <BalanceSheetReport />}
        {activeTab === 'STATEMENT_OF_ACCOUNT' && <AccountStatementReport />}
      </div>
    </div>
  );
};
