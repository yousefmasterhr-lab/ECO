import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useFinancial } from '../../../context/FinancialContext';
import { CfoExecutiveMetrics } from '../../../services/database/types';
import { FinancialToken } from '../../common/FinancialToken';
import {
  TrendingUp,
  BarChart3,
  Coins,
  ShieldCheck,
  ArrowUpRight,
  RefreshCw,
  Building,
  PieChart,
  Wallet
} from 'lucide-react';

export const FinancialDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { fetchCfoMetrics } = useFinancial();

  const [metrics, setMetrics] = useState<CfoExecutiveMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadMetrics = async () => {
    try {
      const data = await fetchCfoMetrics();
      setMetrics(data);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadMetrics();
  };

  if (isLoading || !metrics) {
    return (
      <div className="flex items-center justify-center py-20 text-[#5C665E] dark:text-[#8FA392]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#059669] mb-2" />
        <span className="text-xs font-bold mr-2">{t('جاري تحميل مؤشرات الذكاء المالي...', 'Loading financial metrics...')}</span>
      </div>
    );
  }

  // Calculate highest revenue month for scaling
  const maxMonthRev = Math.max(...metrics.monthlyTrends.map(m => m.revenue));

  return (
    <div className="w-full max-w-none space-y-6">
      {/* Strategic Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] shadow-xs mt-1">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#059669]/15 text-[#059669] dark:text-[#34D399] flex items-center justify-center shadow-xs">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#059669]/15 text-[#059669] dark:text-[#34D399] border border-[#059669]/30">
                {t('لوحة الذكاء المالي للمدير المالي (CFO Suite)', 'Executive CFO BI Dashboard')}
              </span>
              <span className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                {t('التحليل المالي الاستراتيجي والسيولة', 'Strategic Financial Performance & Liquidity')}
              </span>
            </div>
            <h2 className="text-xl font-black text-[#1A241C] dark:text-[#F3EFE6] tracking-tight">
              {t('مؤشرات الأداء المالي وهوامش ربحية المشروعات', 'Financial KPIs & Project Profitability Benchmarks')}
            </h2>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#5C665E] hover:text-[#1A241C] dark:text-[#8FA392] dark:hover:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1C2A1E] transition-all cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#059669]' : ''}`} />
          <span>{t('تحديث البيانات', 'Refresh Metrics')}</span>
        </button>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Revenue */}
        <div className="p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-2">
          <div className="flex items-center justify-between text-[#5C665E] dark:text-[#8FA392] text-xs font-bold">
            <span>{t('صافي الإيرادات التشغيلية', 'Net Operating Revenue')}</span>
            <Coins className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="whitespace-nowrap">
            <FinancialToken amount={metrics.netRevenue} size="2xl" />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-4 h-4" />
            <span>+18.4% {t('مقارنة بالعام السابق', 'vs previous fiscal year')}</span>
          </div>
        </div>

        {/* Gross Profit & Margin */}
        <div className="p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-2">
          <div className="flex items-center justify-between text-[#5C665E] dark:text-[#8FA392] text-xs font-bold">
            <span>{t('مجمل الربح وهامش العمليات', 'Gross Profit & Margin')}</span>
            <TrendingUp className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="whitespace-nowrap">
            <FinancialToken
              amount={metrics.grossProfit}
              size="2xl"
              amountClassName="text-[#059669] dark:text-[#34D399]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#059669]" dir="ltr">
              {metrics.grossMarginPercent}% {t('هامش إجمالي', 'gross margin')}
            </span>
            <span className="text-[#5C665E] text-xs">|</span>
            <span className="text-xs font-bold text-[#3B82F6]" dir="ltr">
              {metrics.operatingMarginPercent}% {t('تشغيلي', 'operating')}
            </span>
          </div>
        </div>

        {/* Working Capital & Liquidity Ratios */}
        <div className="p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-2">
          <div className="flex items-center justify-between text-[#5C665E] dark:text-[#8FA392] text-xs font-bold">
            <span>{t('رأس المال العامل ومؤشر السيولة', 'Working Capital & Liquidity')}</span>
            <Wallet className="w-4 h-4 text-[#3B82F6]" />
          </div>
          <div className="whitespace-nowrap">
            <FinancialToken
              amount={metrics.workingCapital}
              size="2xl"
              amountClassName="text-[#3B82F6] dark:text-[#60A5FA]"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392]">
            <span>{t('السيولة الجارية:', 'Current Ratio:')} <b className="font-bold text-[#1A241C] dark:text-[#F3EFE6]" dir="ltr">{metrics.currentRatio}x</b></span>
            <span>{t('السيولة السريعة:', 'Quick Ratio:')} <b className="font-bold text-[#059669]" dir="ltr">{metrics.quickRatio}x</b></span>
          </div>
        </div>

        {/* Receivables vs Payables */}
        <div className="p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-2">
          <div className="flex items-center justify-between text-[#5C665E] dark:text-[#8FA392] text-xs font-bold">
            <span>{t('العملاء (مدينون) مقابل الموردين', 'Receivables vs Payables')}</span>
            <ShieldCheck className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center whitespace-nowrap">
              <span className="text-[#5C665E]">{t('مديونيات العملاء (AR):', 'Receivables:')}</span>
              <FinancialToken amount={metrics.totalReceivables} amountClassName="text-[#059669]" />
            </div>
            <div className="flex justify-between items-center whitespace-nowrap">
              <span className="text-[#5C665E]">{t('مستحقات الموردين (AP):', 'Payables:')}</span>
              <FinancialToken amount={metrics.totalPayables} amountClassName="text-[#D97706]" />
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-[#E0D9CB] dark:bg-[#243628] overflow-hidden flex">
            {metrics.totalReceivables + metrics.totalPayables > 0 ? (
              <>
                <div
                  className="bg-[#059669]"
                  style={{ width: `${Math.round((metrics.totalReceivables / (metrics.totalReceivables + metrics.totalPayables)) * 100)}%` }}
                />
                <div
                  className="bg-[#D97706]"
                  style={{ width: `${Math.round((metrics.totalPayables / (metrics.totalReceivables + metrics.totalPayables)) * 100)}%` }}
                />
              </>
            ) : (
              <div className="bg-gray-400 w-full" />
            )}
          </div>
        </div>
      </div>

      {/* Financial Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue vs. Expense Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#059669]" />
              <h3 className="text-sm font-black text-[#1A241C] dark:text-[#F3EFE6]">
                {t('منحنى الإيرادات والمصروفات وهوامش الربح الشهرية (2026)', 'Monthly Revenue vs Expenses (2026)')}
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--accent-primary)' }} />
                <span className="text-[#5C665E] dark:text-[#8FA392]">{t('الإيرادات', 'Revenue')}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--accent-cta)' }} />
                <span className="text-[#5C665E] dark:text-[#8FA392]">{t('المصروفات', 'Expenses')}</span>
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-64 flex items-end gap-2 sm:gap-4 pt-6 border-b border-[#E0D9CB] dark:border-[#243628]">
            {metrics.monthlyTrends.map((m, idx) => {
              const revHeight = maxMonthRev > 0 ? (m.revenue / maxMonthRev) * 100 : 0;
              const expHeight = maxMonthRev > 0 ? (m.expense / maxMonthRev) * 100 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    {/* Revenue Bar with Dynamic Theme Gradient */}
                    <div
                      className="w-1/2 rounded-t-md transition-all duration-500 hover:brightness-110 relative shadow-sm"
                      style={{
                        height: `${revHeight}%`,
                        background: 'linear-gradient(180deg, var(--chart-gradient-from) 0%, var(--chart-gradient-to) 100%)',
                      }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] font-mono py-0.5 px-1.5 rounded-md whitespace-nowrap z-20 pointer-events-none transition-opacity">
                        {(m.revenue / 1000000).toFixed(1)}M
                      </div>
                    </div>

                    {/* Expense Bar with Dynamic Theme Accent CTA */}
                    <div
                      className="w-1/2 rounded-t-md transition-all duration-500 hover:brightness-110 relative opacity-90 shadow-sm"
                      style={{
                        height: `${expHeight}%`,
                        backgroundColor: 'var(--accent-cta)',
                      }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] font-mono py-0.5 px-1.5 rounded-md whitespace-nowrap z-20 pointer-events-none transition-opacity">
                        {(m.expense / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392] font-bold mt-2 whitespace-nowrap">
                    {m.monthAr}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392] pt-1 gap-2 whitespace-nowrap">
            <span className="flex items-center gap-1.5">
              <span>{t('متوسط الإيراد الشهري:', 'Average Monthly Revenue:')}</span>
              <FinancialToken amount={metrics.netRevenue / 12} amountClassName="text-[#059669]" />
            </span>
            <span className="flex items-center gap-1.5">
              <span>{t('متوسط هامش الربح الشهري:', 'Average Monthly Margin:')}</span>
              <FinancialToken amount={metrics.grossProfit / 12} amountClassName="text-[#059669]" />
            </span>
          </div>
        </div>

        {/* Expense Categories Distribution */}
        <div className="p-6 rounded-3xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-[#059669]" />
            <h3 className="text-sm font-black text-[#1A241C] dark:text-[#F3EFE6]">
              {t('توزيع هيكل التكاليف والمصروفات', 'Cost & Expense Distribution')}
            </h3>
          </div>

          <div className="space-y-3 pt-2">
            {metrics.expenseCategories.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold whitespace-nowrap">
                  <span className="text-[#1A241C] dark:text-[#F3EFE6] font-medium">{cat.categoryAr}</span>
                  <FinancialToken
                    amount={cat.amount}
                    percentage={cat.percentage}
                    amountClassName="text-[#5C665E] dark:text-[#8FA392] font-semibold"
                  />
                </div>
                <div className="h-2 rounded-full bg-[#E0D9CB] dark:bg-[#243628] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      idx === 0 ? 'bg-[#059669]' : idx === 1 ? 'bg-[#3B82F6]' : idx === 2 ? 'bg-[#D97706]' : 'bg-[#6366F1]'
                    }`}
                    style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-white/70 dark:bg-[#1A241C]/70 border border-[#E0D9CB] dark:border-[#243628] text-[11px] text-[#5C665E] dark:text-[#8FA392]">
            {t('تمثل حزم مقاولي الباطن والمواد الإنشائية 88.3% من إجمالي التكاليف المباشرة.', 'Subcontractors and materials represent 88.3% of total direct project costs.')}
          </div>
        </div>
      </div>

      {/* Project Profitability Rankings */}
      <div className="rounded-3xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-[#059669]" />
            <h3 className="text-sm font-black text-[#1A241C] dark:text-[#F3EFE6]">
              {t('ترتيب المشروعات الأعلى ربحية وهامش مساهمة (Project Profitability Rankings)', 'Top 5 Projects by Profitability & Gross Margin')}
            </h3>
          </div>
          <span className="text-xs text-[#5C665E] dark:text-[#8FA392]">
            {metrics.projectMargins.length} {t('مشروعات رائدة', 'key projects')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6]/60 dark:bg-[#17231A]/60 text-[#5C665E] dark:text-[#8FA392] font-black">
                <th className="py-3 px-4 min-w-[40px]">#</th>
                <th className="py-3 px-4 min-w-[200px]">{t('اسم المشروع الهندسي', 'Project Name')}</th>
                <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">{t('الإيراد المستخلص', 'Billed Revenue')}</th>
                <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">{t('التكلفة الفعلية', 'Direct Cost')}</th>
                <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">{t('مجمل الربح', 'Gross Profit')}</th>
                <th className="py-3 px-4 min-w-[110px] whitespace-nowrap">{t('نسبة الهامش %', 'Margin %')}</th>
                <th className="py-3 px-4 min-w-[100px] whitespace-nowrap">{t('مستوى الأداء', 'Rating')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CB] dark:divide-[#243628]">
              {metrics.projectMargins.map((p, idx) => (
                <tr key={idx} className="hover:bg-[#F3EFE6]/40 dark:hover:bg-[#1C2A1E]/40 transition-colors">
                  <td className="py-3 px-4 font-normal text-[#5C665E]">{idx + 1}</td>
                  <td className="py-3 px-4 font-semibold text-[#1A241C] dark:text-[#F3EFE6]">{p.projectNameAr}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <FinancialToken amount={p.revenue} amountClassName="text-[#059669] dark:text-[#34D399]" />
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <FinancialToken amount={p.cost} amountClassName="text-[#5C665E] dark:text-[#8FA392]" />
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <FinancialToken amount={p.margin} amountClassName="text-[#1A241C] dark:text-[#F3EFE6]" />
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="w-24 space-y-1">
                      <span className="font-bold text-[#059669]" dir="ltr">{p.marginPercent}%</span>
                      <div className="h-1.5 rounded-full bg-[#E0D9CB] dark:bg-[#243628] overflow-hidden">
                        <div
                          className="h-full bg-[#059669] rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(p.marginPercent * 3, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      {p.marginPercent >= 20 ? t('ممتاز (A)', 'Grade A') : t('جيد جداً (B)', 'Grade B')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
