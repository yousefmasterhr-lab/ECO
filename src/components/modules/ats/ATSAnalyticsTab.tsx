import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  BarChart3, 
  Sparkles,
  Briefcase,
  Award,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { fireConfetti } from '../../../utils/confetti';
import ExcelJS from 'exceljs';
import { RecruitmentKPIs } from './types';

interface ATSAnalyticsTabProps {
  companyId?: string;
}

export const ATSAnalyticsTab: React.FC<ATSAnalyticsTabProps> = ({ companyId: _companyId }) => {
  const { t, language } = useLanguage();
  const [dateRange, setDateRange] = useState<'this_quarter' | 'last_quarter' | 'ytd'>('this_quarter');
  const [selectedChartTab, setSelectedChartTab] = useState<'funnel' | 'sources' | 'recruiters'>('funnel');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const kpis: RecruitmentKPIs = useMemo(() => {
    if (dateRange === 'last_quarter') {
      return {
        timeToHireDays: 24,
        timeToFillDays: 29,
        costPerHire: 14200,
        totalOpenRequisitions: 8,
        activeCandidatesInPipeline: 94,
        totalHiresThisQuarter: 12,
        offerAcceptanceRate: 88,
        candidateSatisfactionScore: 92,
        timeToHireChange: -8,
        costPerHireSavings: 15,
        offersSignedCount: 12,
        offersSentTotal: 14,
      };
    }
    if (dateRange === 'ytd') {
      return {
        timeToHireDays: 20,
        timeToFillDays: 25,
        costPerHire: 12800,
        totalOpenRequisitions: 18,
        activeCandidatesInPipeline: 280,
        totalHiresThisQuarter: 44,
        offerAcceptanceRate: 94,
        candidateSatisfactionScore: 96,
        timeToHireChange: -18,
        costPerHireSavings: 28,
        offersSignedCount: 44,
        offersSentTotal: 47,
      };
    }
    return {
      timeToHireDays: 18,
      timeToFillDays: 22,
      costPerHire: 11500,
      totalOpenRequisitions: 11,
      activeCandidatesInPipeline: 142,
      totalHiresThisQuarter: 16,
      offerAcceptanceRate: 93,
      candidateSatisfactionScore: 95,
      timeToHireChange: -14,
      costPerHireSavings: 22,
      offersSignedCount: 16,
      offersSentTotal: 17,
    };
  }, [dateRange]);

  const funnelStages = useMemo(() => [
    { id: 'applied', nameAr: 'طلبات جديدة (مقدمة)', nameEn: 'Applied', count: 184, conversionRate: 100, days: 2 },
    { id: 'screening', nameAr: 'فرز وتصفية أولية', nameEn: 'Screening', count: 112, conversionRate: 61, days: 3 },
    { id: 'tech_assessment', nameAr: 'تقييم فني وإدارة', nameEn: 'Tech Assessment', count: 68, conversionRate: 60, days: 4 },
    { id: 'interview', nameAr: 'مقابلات الموارد البشرية', nameEn: 'Interviews', count: 34, conversionRate: 50, days: 5 },
    { id: 'offer', nameAr: 'عروض العمل الصادرة', nameEn: 'Offers Sent', count: 17, conversionRate: 50, days: 3 },
    { id: 'hired', nameAr: 'تم التعيين والاعتماد', nameEn: 'Hired & Synced', count: 16, conversionRate: 94, days: 1 },
  ], []);

  const sources = useMemo(() => [
    { source: 'لينكد إن (LinkedIn Recruiter)', count: 88, hires: 9, costPerHire: 9500, quality: 94 },
    { source: 'بوابة التوظيف المباشرة (Careers)', count: 42, hires: 4, costPerHire: 2800, quality: 88 },
    { source: 'برنامج ترشيحات الموظفين (Referrals)', count: 26, hires: 3, costPerHire: 5000, quality: 96 },
    { source: 'بيت.كوم ومواقع التوظيف (Bayt / Indeed)', count: 28, hires: 0, costPerHire: 14000, quality: 72 },
  ], []);

  const recruiters = useMemo(() => [
    { name: 'أحمد فؤاد', role: 'مسؤول أول استقطاب المواهب', hires: 7, avgDays: 16, activeJobs: 4, score: 96 },
    { name: 'سارة عبد الرحمن', role: 'شريك توظيف الموارد البشرية', hires: 5, avgDays: 19, activeJobs: 3, score: 92 },
    { name: 'محمود ناصر', role: 'أخصائي استقطاب الكفاءات الهندسية', hires: 4, avgDays: 21, activeJobs: 4, score: 90 },
  ], []);

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'ECO ATS Enterprise';
      workbook.created = new Date();

      const sheet = workbook.addWorksheet('Recruitment Analytics');
      sheet.views = [{ rightToLeft: language === 'ar' }];

      sheet.addRow(['مؤشرات وأداء استقطاب الكفاءات (ATS KPIs)']);
      sheet.addRow(['الفترة الزمنية:', dateRange]);
      sheet.addRow(['تاريخ التصدير:', new Date().toLocaleDateString('ar-EG')]);
      sheet.addRow([]);

      sheet.addRow(['المؤشر الرئيسي', 'القيمة المعيارية', 'معدل التغيير']);
      sheet.addRow(['متوسط فترة التعيين (Time-to-Hire)', `${kpis.timeToHireDays} يوم`, `${kpis.timeToHireChange}%`]);
      sheet.addRow(['تكلفة التعيين للموظف (Cost-per-Hire)', `${kpis.costPerHire.toLocaleString()} ج.م`, `وفر ${kpis.costPerHireSavings}%`]);
      sheet.addRow(['نسبة قبول عروض العمل (Acceptance Rate)', `${kpis.offerAcceptanceRate}%`, 'معدل قياسي']);
      sheet.addRow(['إجمالي التعيينات المعتمدة', `${kpis.totalHiresThisQuarter} موظف`, 'مكتمل']);
      sheet.addRow([]);

      sheet.addRow(['مرحلة قمع التوظيف', 'عدد المرشحين', 'نسبة التحويل (%)', 'متوسط الأيام']);
      funnelStages.forEach(f => {
        sheet.addRow([f.nameAr, f.count, `${f.conversionRate}%`, `${f.days} أيام`]);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ECO_ATS_Analytics_${dateRange}_${new Date().toISOString().substring(0, 10)}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

      setIsExporting(false);
      setExportSuccess(true);
      fireConfetti();
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Export Error:', err);
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Range Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white/70 dark:bg-[#0D1C13]/70 backdrop-blur-md border border-[#E0D9CB] dark:border-[#1D3324] shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#142319] dark:text-[#E8F3EB] flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-amber-500" />
            {t('لوحة مؤشرات أداء التوظيف والسرعة التشغيلية', 'Recruitment Analytics & Velocity KPIs')}
          </h2>
          <p className="text-xs text-[#5C665E] dark:text-[#97A69B] mt-1">
            {t('رصد لحظي لمسارات استقطاب المواهب، تكلفة التعيين، وسرعة دوران الشواغر عبر المنظومة', 'Real-time talent acquisition velocity, cost-per-hire, and pipeline conversion analytics')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <div className="inline-flex p-1 rounded-xl bg-[#F0ECE1] dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324]">
            {(['this_quarter', 'last_quarter', 'ytd'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setDateRange(period)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  dateRange === period
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-[#5C665E] dark:text-[#97A69B] hover:text-[#142319] dark:hover:text-[#E8F3EB]'
                }`}
              >
                {period === 'this_quarter' ? t('الربع الحالي', 'This Quarter') :
                 period === 'last_quarter' ? t('الربع السابق', 'Last Quarter') :
                 t('منذ بداية العام', 'Year-to-Date')}
              </button>
            ))}
          </div>

          {/* Export to Excel */}
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50"
          >
            {exportSuccess ? <Check className="w-4 h-4 text-white" /> : <FileSpreadsheet className="w-4 h-4" />}
            {isExporting ? t('جاري التصدير...', 'Exporting...') : exportSuccess ? t('تم التصدير!', 'Exported!') : t('تصدير Excel', 'Export Excel')}
          </button>
        </div>
      </div>

      {/* 6 Executive KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#0D1C13]/80 border border-[#E0D9CB] dark:border-[#1D3324] shadow-xs relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#5C665E] dark:text-[#97A69B]">{t('متوسط مدة التعيين', 'Time to Hire')}</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#142319] dark:text-[#E8F3EB]">{kpis.timeToHireDays} <span className="text-xs font-normal text-[#5C665E] dark:text-[#97A69B]">{t('يوم', 'days')}</span></div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{Math.abs(kpis.timeToHireChange)}% {t('أسرع من المعدل', 'faster')}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#0D1C13]/80 border border-[#E0D9CB] dark:border-[#1D3324] shadow-xs relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#5C665E] dark:text-[#97A69B]">{t('تكلفة التعيين للموظف', 'Cost Per Hire')}</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#142319] dark:text-[#E8F3EB]">{kpis.costPerHire.toLocaleString()} <span className="text-xs font-normal text-[#5C665E] dark:text-[#97A69B]">ج.م</span></div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>وفر {kpis.costPerHireSavings}% {t('في المصاريف', 'savings')}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#0D1C13]/80 border border-[#E0D9CB] dark:border-[#1D3324] shadow-xs relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#5C665E] dark:text-[#97A69B]">{t('الشواغر المفتوحة', 'Open Jobs')}</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#142319] dark:text-[#E8F3EB]">{kpis.totalOpenRequisitions} <span className="text-xs font-normal text-[#5C665E] dark:text-[#97A69B]">{t('شاغر نشط', 'active')}</span></div>
          <div className="mt-2 text-[11px] text-[#5C665E] dark:text-[#97A69B]">
            {t('عبر مختلف الشركات', 'across entities')}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#0D1C13]/80 border border-[#E0D9CB] dark:border-[#1D3324] shadow-xs relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#5C665E] dark:text-[#97A69B]">{t('مرشحون قيد الفرز', 'In-Pipeline')}</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#142319] dark:text-[#E8F3EB]">{kpis.activeCandidatesInPipeline}</div>
          <div className="mt-2 text-[11px] text-[#5C665E] dark:text-[#97A69B]">
            {t('في مختلف المراحل', 'in active stages')}
          </div>
        </div>

        {/* Metric 5 */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#0D1C13]/80 border border-[#E0D9CB] dark:border-[#1D3324] shadow-xs relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#5C665E] dark:text-[#97A69B]">{t('نسبة قبول العروض', 'Offer Acceptance')}</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#142319] dark:text-[#E8F3EB]">{kpis.offerAcceptanceRate}%</div>
          <div className="mt-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            {kpis.offersSignedCount} {t('من أصل', 'out of')} {kpis.offersSentTotal}
          </div>
        </div>

        {/* Metric 6 */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#0D1C13]/80 border border-[#E0D9CB] dark:border-[#1D3324] shadow-xs relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#5C665E] dark:text-[#97A69B]">{t('التعيينات المعتمدة', 'Hires Completed')}</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{kpis.totalHiresThisQuarter} <span className="text-xs font-normal text-[#5C665E] dark:text-[#97A69B]">{t('موظف', 'hires')}</span></div>
          <div className="mt-2 text-[11px] text-[#5C665E] dark:text-[#97A69B]">
            {t('محوّلون لمنظومة HR', 'synced to HR')}
          </div>
        </div>
      </div>

      {/* Secondary Chart Tabs */}
      <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#0D1C13]/80 border border-[#E0D9CB] dark:border-[#1D3324] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-[#E0D9CB] dark:border-[#1D3324] gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedChartTab('funnel')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedChartTab === 'funnel'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-[#5C665E] dark:text-[#97A69B] hover:bg-[#F0ECE1] dark:hover:bg-[#122318]'
              }`}
            >
              {t('قمع التحويل التوظيفي (Recruitment Funnel)', 'Recruitment Funnel')}
            </button>
            <button
              onClick={() => setSelectedChartTab('sources')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedChartTab === 'sources'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-[#5C665E] dark:text-[#97A69B] hover:bg-[#F0ECE1] dark:hover:bg-[#122318]'
              }`}
            >
              {t('قنوات واستقطاب المواهب (Sources & Channels)', 'Talent Sources')}
            </button>
            <button
              onClick={() => setSelectedChartTab('recruiters')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedChartTab === 'recruiters'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-[#5C665E] dark:text-[#97A69B] hover:bg-[#F0ECE1] dark:hover:bg-[#122318]'
              }`}
            >
              {t('سرعة وأداء فريق التوظيف', 'Recruiter Performance')}
            </button>
          </div>
        </div>

        {/* Tab 1: Funnel Chart */}
        {selectedChartTab === 'funnel' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              {funnelStages.map((stage, idx) => (
                <div
                  key={stage.id}
                  className="p-4 rounded-xl bg-[#F8F6F0] dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] flex flex-col justify-between"
                >
                  <div>
                    <div className="text-[11px] font-bold text-[#5C665E] dark:text-[#97A69B] mb-1">
                      {idx + 1}. {stage.nameAr}
                    </div>
                    <div className="text-xl font-extrabold text-[#142319] dark:text-[#E8F3EB]">
                      {stage.count} <span className="text-xs font-normal text-[#5C665E] dark:text-[#97A69B]">مرشح</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E0D9CB]/60 dark:border-[#1D3324]/60 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{stage.conversionRate}% تحويل</span>
                    <span className="text-[#5C665E] dark:text-[#97A69B]">~ {stage.days} أيام</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual Funnel Bar */}
            <div className="mt-6 p-4 rounded-xl bg-[#F0ECE1]/60 dark:bg-[#07130E]/60 border border-[#E0D9CB] dark:border-[#1D3324]">
              <div className="text-xs font-bold text-[#142319] dark:text-[#E8F3EB] mb-3">
                {t('انسيابية مسار التوظيف والفرز التراكمي', 'Funnel Retention Progression')}
              </div>
              <div className="w-full flex h-4 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800">
                <div style={{ width: '45%' }} className="bg-amber-600" title="طلبات جديدة" />
                <div style={{ width: '25%' }} className="bg-amber-500" title="فرز مبدئي" />
                <div style={{ width: '15%' }} className="bg-teal-600" title="تقييم فني" />
                <div style={{ width: '8%' }} className="bg-blue-600" title="مقابلات" />
                <div style={{ width: '4%' }} className="bg-purple-600" title="عروض" />
                <div style={{ width: '3%' }} className="bg-emerald-500" title="تم التعيين" />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Sources */}
        {selectedChartTab === 'sources' && (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-[#E0D9CB] dark:border-[#1D3324] text-[#5C665E] dark:text-[#97A69B]">
                  <th className="py-3 px-4 font-bold">{t('قناة الاستقطاب', 'Source Channel')}</th>
                  <th className="py-3 px-4 font-bold">{t('عدد المتقدمين', 'Candidates')}</th>
                  <th className="py-3 px-4 font-bold">{t('التعيينات الناجحة', 'Successful Hires')}</th>
                  <th className="py-3 px-4 font-bold">{t('تكلفة التعيين', 'Cost Per Hire')}</th>
                  <th className="py-3 px-4 font-bold">{t('مؤشر جودة الكفاءة', 'Quality Score')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D9CB]/50 dark:divide-[#1D3324]/50">
                {sources.map((src, i) => (
                  <tr key={i} className="hover:bg-[#F8F6F0] dark:hover:bg-[#122318] transition-all">
                    <td className="py-3.5 px-4 font-bold text-[#142319] dark:text-[#E8F3EB]">{src.source}</td>
                    <td className="py-3.5 px-4">{src.count}</td>
                    <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-bold">{src.hires}</td>
                    <td className="py-3.5 px-4 font-semibold">{src.costPerHire.toLocaleString()} ج.م</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: `${src.quality}%` }} />
                        </div>
                        <span className="font-bold text-amber-500">{src.quality}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Recruiters */}
        {selectedChartTab === 'recruiters' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recruiters.map((rec, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#F8F6F0] dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-sm">
                    {rec.name.substring(0, 2)}
                  </div>
                  <div>
                    <div className="font-bold text-[#142319] dark:text-[#E8F3EB] text-sm">{rec.name}</div>
                    <div className="text-[11px] text-[#5C665E] dark:text-[#97A69B]">{rec.role}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#E0D9CB]/60 dark:border-[#1D3324]/60 text-center">
                  <div>
                    <div className="text-base font-black text-emerald-600 dark:text-emerald-400">{rec.hires}</div>
                    <div className="text-[10px] text-[#5C665E] dark:text-[#97A69B]">{t('تعيينات', 'Hires')}</div>
                  </div>
                  <div>
                    <div className="text-base font-black text-[#142319] dark:text-[#E8F3EB]">{rec.avgDays} ي</div>
                    <div className="text-[10px] text-[#5C665E] dark:text-[#97A69B]">{t('متوسط الإغلاق', 'Avg Time')}</div>
                  </div>
                  <div>
                    <div className="text-base font-black text-amber-500">{rec.score}%</div>
                    <div className="text-[10px] text-[#5C665E] dark:text-[#97A69B]">{t('كفاءة الإنجاز', 'Score')}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

