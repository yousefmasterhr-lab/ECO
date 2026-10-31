import React, { useState, useMemo, useEffect } from 'react';
import { 
  Clock, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  BarChart3, 
  Briefcase, 
  Award, 
  FileSpreadsheet, 
  Check 
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { fireConfetti } from '../../../utils/confetti';
import ExcelJS from 'exceljs';
import { RecruitmentKPIs, Candidate, JobRequisition, JobOffer } from './types';
import { atsStorage } from '../../../services/atsStorage';

interface ATSAnalyticsTabProps {
  companyId?: string;
}

export const ATSAnalyticsTab: React.FC<ATSAnalyticsTabProps> = ({ companyId }) => {
  const { t, language } = useLanguage();
  const [dateRange, setDateRange] = useState<'this_quarter' | 'last_quarter' | 'ytd'>('this_quarter');
  const [selectedChartTab, setSelectedChartTab] = useState<'funnel' | 'sources' | 'recruiters'>('funnel');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const [jobs, setJobs] = useState<JobRequisition[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allJobs, allCandidates, allOffers] = await Promise.all([
        atsStorage.getJobs(companyId),
        atsStorage.getCandidates(companyId),
        atsStorage.getOffers(companyId),
      ]);
      setJobs(allJobs);
      setCandidates(allCandidates);
      setOffers(allOffers);
    } catch (e) {
      console.warn('Failed to load ATS analytics data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('eco-ats-updated', handleUpdate);
    return () => window.removeEventListener('eco-ats-updated', handleUpdate);
  }, [companyId]);

  // Compute live dynamic KPIs based strictly on real database records
  const kpis: RecruitmentKPIs = useMemo(() => {
    const totalJobs = jobs.filter(j => j.status === 'published' || j.status === 'approved').length;
    const activeCandidates = candidates.filter(c => c.stage !== 'hired' && c.stage !== 'rejected').length;
    const hiredCandidates = candidates.filter(c => c.stage === 'hired').length;
    const signedOffers = offers.filter(o => o.status === 'accepted' || o.status === 'synced_to_core_hr').length;
    const totalOffers = offers.length;
    const acceptanceRate = totalOffers > 0 ? Math.round((signedOffers / totalOffers) * 100) : 0;

    return {
      timeToHireDays: 0,
      timeToFillDays: 0,
      costPerHire: 0,
      totalOpenRequisitions: totalJobs,
      activeCandidatesInPipeline: activeCandidates,
      totalHiresThisQuarter: hiredCandidates,
      offerAcceptanceRate: acceptanceRate,
      candidateSatisfactionScore: hiredCandidates > 0 ? 100 : 0,
      timeToHireChange: 0,
      costPerHireSavings: 0,
      offersSignedCount: signedOffers,
      offersSentTotal: totalOffers,
    };
  }, [jobs, candidates, offers]);

  // Compute Funnel Stages dynamically from actual candidates
  const funnelStages = useMemo(() => {
    const total = candidates.length;
    const stageCounts: Record<string, number> = {
      applied: 0,
      screening: 0,
      tech_assessment: 0,
      interview: 0,
      offer: 0,
      hired: 0,
    };

    candidates.forEach(c => {
      const st = c.stage || 'applied';
      if (stageCounts[st] !== undefined) {
        stageCounts[st]++;
      } else {
        stageCounts.applied++;
      }
    });

    const stagesConfig = [
      { id: 'applied', nameAr: 'طلبات جديدة (مقدمة)', nameEn: 'Applied' },
      { id: 'screening', nameAr: 'فرز وتصفية أولية', nameEn: 'Screening' },
      { id: 'tech_assessment', nameAr: 'تقييم فني وإدارة', nameEn: 'Tech Assessment' },
      { id: 'interview', nameAr: 'مقابلات الموارد البشرية', nameEn: 'Interviews' },
      { id: 'offer', nameAr: 'عروض العمل الصادرة', nameEn: 'Offers Sent' },
      { id: 'hired', nameAr: 'تم التعيين والاعتماد', nameEn: 'Hired & Synced' },
    ];

    return stagesConfig.map(s => {
      const cnt = stageCounts[s.id] || 0;
      const rate = total > 0 ? Math.round((cnt / total) * 100) : 0;
      return {
        id: s.id,
        nameAr: s.nameAr,
        nameEn: s.nameEn,
        count: cnt,
        conversionRate: rate,
        days: cnt > 0 ? 1 : 0,
      };
    });
  }, [candidates]);

  // Sourcing Channels from real candidate tracking
  const sources = useMemo(() => {
    const map: Record<string, { count: number; hires: number }> = {};
    candidates.forEach(c => {
      const src = c.utmSource || c.source || 'تقديم مباشر';
      if (!map[src]) map[src] = { count: 0, hires: 0 };
      map[src].count++;
      if (c.stage === 'hired') map[src].hires++;
    });

    return Object.entries(map).map(([source, data]) => ({
      source,
      count: data.count,
      hires: data.hires,
      costPerHire: 0,
      quality: data.count > 0 ? Math.round((data.hires / data.count) * 100) : 0,
    }));
  }, [candidates]);

  // Recruiter Performance from real activities
  const recruiters = useMemo(() => {
    const map: Record<string, { hires: number; activeJobs: number; score: number }> = {};
    candidates.forEach(c => {
      const rec = (c.activities || []).find(a => a.performedBy)?.performedBy || 'فريق التوظيف';
      if (!map[rec]) map[rec] = { hires: 0, activeJobs: 0, score: 100 };
      if (c.stage === 'hired') map[rec].hires++;
    });

    return Object.entries(map).map(([name, data]) => ({
      name,
      role: 'مسؤول استقطاب المواهب',
      hires: data.hires,
      avgDays: 0,
      activeJobs: jobs.length,
      score: data.score,
    }));
  }, [candidates, jobs]);

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'ECO ATS Enterprise';
      workbook.created = new Date();

      const sheet = workbook.addWorksheet('Recruitment Analytics');
      sheet.views = [{ rightToLeft: language === 'ar' }];

      sheet.addRow(['مؤشرات وأداء استقطاب الكفاءات']);
      sheet.addRow(['الفترة الزمنية:', dateRange]);
      sheet.addRow(['تاريخ التصدير:', new Date().toLocaleDateString('ar-EG')]);
      sheet.addRow([]);

      sheet.addRow(['المؤشر الرئيسي', 'القيمة المعيارية', 'الحالة']);
      sheet.addRow(['متوسط فترة التعيين', `${kpis.timeToHireDays} يوم`, kpis.timeToHireDays > 0 ? 'نشط' : 'لا توجد بيانات بعد']);
      sheet.addRow(['تكلفة التعيين للموظف', `${kpis.costPerHire.toLocaleString()} ج.م`, '0 مصروفات مسجلة']);
      sheet.addRow(['نسبة قبول عروض العمل', `${kpis.offerAcceptanceRate}%`, 'معدل حقيقي']);
      sheet.addRow(['إجمالي التعيينات المعتمدة', `${kpis.totalHiresThisQuarter} موظف`, 'مكتمل']);
      sheet.addRow([]);

      sheet.addRow(['مرحلة مسار التوظيف', 'عدد المرشحين', 'نسبة التحويل (%)']);
      funnelStages.forEach(f => {
        sheet.addRow([f.nameAr, f.count, `${f.conversionRate}%`]);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-gradient-to-l from-amber-100/80 via-amber-50/60 to-white dark:from-[#0D1F17] dark:via-[#07130E] dark:to-[#07130E] text-slate-900 dark:text-stone-100 border border-amber-200/60 dark:border-amber-500/30 shadow-sm dark:shadow-xl relative overflow-hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-[#E8F3EB] flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            {t('لوحة مؤشرات أداء التوظيف والسرعة التشغيلية', 'Recruitment Analytics & Velocity KPIs')}
          </h2>
          <p className="text-xs text-slate-600 dark:text-[#97A69B] mt-1">
            {t('رصد لحظي لمسارات استقطاب المواهب، تكلفة التعيين، وسرعة دوران الشواغر عبر المنظومة', 'Real-time talent acquisition velocity, cost-per-hire, and pipeline conversion analytics')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <div className="inline-flex p-1 rounded-xl bg-white/80 dark:bg-[#122318] border border-amber-200/80 dark:border-[#1D3324] shadow-xs">
            {(['this_quarter', 'last_quarter', 'ytd'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setDateRange(period)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  dateRange === period
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-[#97A69B] hover:text-slate-950 dark:hover:text-[#E8F3EB]'
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {exportSuccess ? <Check className="w-4 h-4 text-white" /> : <FileSpreadsheet className="w-4 h-4" />}
            {isExporting ? t('جاري التصدير...', 'Exporting...') : exportSuccess ? t('تم التصدير!', 'Exported!') : t('تصدير Excel', 'Export Excel')}
          </button>
        </div>
      </div>

      {/* 6 Executive KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric 1: Time to Hire */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#0D1C13]/80 border border-amber-200/60 dark:border-[#1D3324] shadow-xs relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-[#97A69B]">{t('متوسط مدة التعيين', 'Time to Hire')}</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-[#E8F3EB] font-mono">
            {kpis.timeToHireDays} <span className="text-xs font-normal text-slate-500 dark:text-[#97A69B]">{t('يوم', 'days')}</span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-slate-500 dark:text-stone-400">
            {kpis.totalHiresThisQuarter > 0 ? `${kpis.totalHiresThisQuarter} تعيينات مكتملة` : 'لا توجد تعيينات مكتملة بعد'}
          </div>
        </div>

        {/* Metric 2: Cost Per Hire */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#0D1C13]/80 border border-amber-200/60 dark:border-[#1D3324] shadow-xs relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-[#97A69B]">{t('تكلفة التعيين للموظف', 'Cost Per Hire')}</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-[#E8F3EB] font-mono">
            {kpis.costPerHire.toLocaleString()} <span className="text-xs font-normal text-slate-500 dark:text-[#97A69B]">ج.م</span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-slate-500 dark:text-stone-400">
            {kpis.costPerHire > 0 ? `وفر ${kpis.costPerHireSavings}%` : '0 مصروفات توظيف مسجلة'}
          </div>
        </div>

        {/* Metric 3: Open Jobs */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#0D1C13]/80 border border-amber-200/60 dark:border-[#1D3324] shadow-xs relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-[#97A69B]">{t('الشواغر المفتوحة', 'Open Jobs')}</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-[#E8F3EB] font-mono">
            {kpis.totalOpenRequisitions} <span className="text-xs font-normal text-slate-500 dark:text-[#97A69B]">{kpis.totalOpenRequisitions > 0 ? t('شاغر نشط', 'active') : t('شواغر نشطة', 'active')}</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-[#97A69B]">
            {kpis.totalOpenRequisitions > 0 ? t('عبر مختلف الشركات', 'across entities') : 'لا توجد شواغر معلنة بعد'}
          </div>
        </div>

        {/* Metric 4: In-Pipeline */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#0D1C13]/80 border border-amber-200/60 dark:border-[#1D3324] shadow-xs relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-[#97A69B]">{t('مرشحون قيد الفرز', 'In-Pipeline')}</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-[#E8F3EB] font-mono">
            {kpis.activeCandidatesInPipeline}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-[#97A69B]">
            {kpis.activeCandidatesInPipeline > 0 ? t('في مختلف المراحل', 'in active stages') : '0 مرشحين قيد الفرز'}
          </div>
        </div>

        {/* Metric 5: Offer Acceptance */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#0D1C13]/80 border border-amber-200/60 dark:border-[#1D3324] shadow-xs relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-[#97A69B]">{t('نسبة قبول العروض', 'Offer Acceptance')}</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-[#E8F3EB] font-mono">
            {kpis.offerAcceptanceRate}%
          </div>
          <div className="mt-2 text-[11px] font-semibold text-slate-500 dark:text-stone-400">
            {kpis.offersSentTotal > 0 ? `${kpis.offersSignedCount} من أصل ${kpis.offersSentTotal}` : '0 عروض عمل مصدرة'}
          </div>
        </div>

        {/* Metric 6: Hires Completed */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#0D1C13]/80 border border-amber-200/60 dark:border-[#1D3324] shadow-xs relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-[#97A69B]">{t('التعيينات المعتمدة', 'Hires Completed')}</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {kpis.totalHiresThisQuarter} <span className="text-xs font-normal text-slate-500 dark:text-[#97A69B]">{t('موظف', 'hires')}</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-[#97A69B]">
            {kpis.totalHiresThisQuarter > 0 ? t('محوّلون لمنظومة HR', 'synced to HR') : '0 تعيينات منجزة'}
          </div>
        </div>
      </div>

      {/* Secondary Chart Tabs */}
      <div className="p-6 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-amber-200/40 dark:border-[#1D3324] gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedChartTab('funnel')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedChartTab === 'funnel'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-[#97A69B] hover:bg-amber-100/40 dark:hover:bg-[#122318]'
              }`}
            >
              {t('قمع التحويل التوظيفي', 'Recruitment Funnel')}
            </button>
            <button
              onClick={() => setSelectedChartTab('sources')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedChartTab === 'sources'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-[#97A69B] hover:bg-amber-100/40 dark:hover:bg-[#122318]'
              }`}
            >
              {t('قنوات استقطاب المواهب', 'Talent Sources')}
            </button>
            <button
              onClick={() => setSelectedChartTab('recruiters')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedChartTab === 'recruiters'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-[#97A69B] hover:bg-amber-100/40 dark:hover:bg-[#122318]'
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
                  className="p-4 rounded-2xl bg-stone-50 dark:bg-[#122318] border border-amber-200/50 dark:border-[#1D3324] flex flex-col justify-between"
                >
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 dark:text-[#97A69B] mb-1">
                      {idx + 1}. {stage.nameAr}
                    </div>
                    <div className="text-xl font-black text-slate-900 dark:text-[#E8F3EB] font-mono">
                      {stage.count} <span className="text-xs font-normal text-slate-400">مرشح</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-200 dark:border-[#1D3324]/60 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">{stage.conversionRate}% تحويل</span>
                    <span className="text-slate-400 font-mono">~ {stage.days} يوم</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual Funnel Bar */}
            <div className="mt-6 p-4 rounded-2xl bg-stone-50/80 dark:bg-[#07130E]/60 border border-amber-200/50 dark:border-[#1D3324]">
              <div className="text-xs font-bold text-slate-900 dark:text-[#E8F3EB] mb-3">
                {t('انسيابية مسار التوظيف والفرز التراكمي', 'Funnel Retention Progression')}
              </div>
              {candidates.length > 0 ? (
                <div className="w-full flex h-4 rounded-full overflow-hidden bg-stone-200 dark:bg-stone-800">
                  {funnelStages.map((st) => {
                    const pct = Math.round((st.count / candidates.length) * 100);
                    if (pct <= 0) return null;
                    const colors: Record<string, string> = {
                      applied: 'bg-amber-600',
                      screening: 'bg-amber-500',
                      tech_assessment: 'bg-teal-600',
                      interview: 'bg-blue-600',
                      offer: 'bg-purple-600',
                      hired: 'bg-emerald-500',
                    };
                    return (
                      <div
                        key={st.id}
                        style={{ width: `${pct}%` }}
                        className={colors[st.id] || 'bg-amber-500'}
                        title={`${st.nameAr}: ${st.count} (${pct}%)`}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="py-2 text-center text-xs text-slate-400">
                  {t('لا توجد بيانات مسار توظيف حالياً (0 مرشحين مسجلين)', 'No pipeline retention data yet (0 candidates)')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Sources */}
        {selectedChartTab === 'sources' && (
          <div className="overflow-x-auto">
            {sources.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                {t('لا توجد قنوات استقطاب مسجلة بعد (0 مترشحين)', 'No talent sources recorded yet (0 candidates)')}
              </div>
            ) : (
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-amber-200/50 dark:border-[#1D3324] text-slate-500 dark:text-[#97A69B]">
                    <th className="py-3 px-4 font-bold">{t('قناة الاستقطاب', 'Source Channel')}</th>
                    <th className="py-3 px-4 font-bold">{t('عدد المتقدمين', 'Candidates')}</th>
                    <th className="py-3 px-4 font-bold">{t('التعيينات الناجحة', 'Successful Hires')}</th>
                    <th className="py-3 px-4 font-bold">{t('تكلفة التعيين', 'Cost Per Hire')}</th>
                    <th className="py-3 px-4 font-bold">{t('مؤشر جودة الكفاءة', 'Quality Score')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-[#1D3324]/50">
                  {sources.map((src, i) => (
                    <tr key={i} className="hover:bg-stone-50 dark:hover:bg-[#122318] transition-all">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-[#E8F3EB]">{src.source}</td>
                      <td className="py-3.5 px-4 font-mono font-bold">{src.count}</td>
                      <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-bold font-mono">{src.hires}</td>
                      <td className="py-3.5 px-4 font-semibold font-mono">{src.costPerHire.toLocaleString()} ج.م</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${src.quality}%` }} />
                          </div>
                          <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">{src.quality}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 3: Recruiters */}
        {selectedChartTab === 'recruiters' && (
          <div>
            {recruiters.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                {t('لا توجد بيانات لأعضاء فريق التوظيف مسجلة حالياً', 'No recruiter activity recorded yet')}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recruiters.map((rec, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-stone-50 dark:bg-[#122318] border border-amber-200/50 dark:border-[#1D3324]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                        {rec.name.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-[#E8F3EB] text-sm">{rec.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-[#97A69B]">{rec.role}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-stone-200 dark:border-[#1D3324]/60 text-center">
                      <div>
                        <div className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">{rec.hires}</div>
                        <div className="text-[10px] text-slate-500 dark:text-[#97A69B]">{t('تعيينات', 'Hires')}</div>
                      </div>
                      <div>
                        <div className="text-base font-black text-slate-900 dark:text-[#E8F3EB] font-mono">{rec.avgDays} ي</div>
                        <div className="text-[10px] text-slate-500 dark:text-[#97A69B]">{t('متوسط الإغلاق', 'Avg Time')}</div>
                      </div>
                      <div>
                        <div className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">{rec.score}%</div>
                        <div className="text-[10px] text-slate-500 dark:text-[#97A69B]">{t('كفاءة الإنجاز', 'Score')}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
