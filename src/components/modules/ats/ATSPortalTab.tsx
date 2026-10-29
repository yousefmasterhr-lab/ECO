import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe2,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Monitor,
  Eye,
  Send,
  Building2,
  Link2
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { atsStorage } from '../../../services/atsStorage';
import { JobRequisition, Candidate } from './types';
import { EcoOfficialLogo } from '../../common/EcoOfficialLogo';

interface ATSPortalTabProps {
  companyId?: string;
}

export const ATSPortalTab: React.FC<ATSPortalTabProps> = ({ companyId }) => {
  const { t } = useLanguage();

  const [jobs, setJobs] = useState<JobRequisition[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // UTM Generator Form
  const [source, setSource] = useState('linkedin');
  const [medium, setMedium] = useState('social_post');
  const [campaign, setCampaign] = useState('q4_hiring_push');
  const [referralName, setReferralName] = useState('');

  // Fetch jobs & candidates
  const loadData = async () => {
    try {
      const allJobs = await atsStorage.getJobs(companyId);
      const allCandidates = await atsStorage.getCandidates(companyId);
      setJobs(allJobs);
      setCandidates(allCandidates);
      if (allJobs.length > 0 && !selectedJobId) {
        setSelectedJobId(allJobs[0].id);
      }
    } catch (err) {
      console.error('Failed to load ATS data for portal', err);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('eco-ats-updated', handleUpdate);
    return () => window.removeEventListener('eco-ats-updated', handleUpdate);
  }, [companyId]);

  const selectedJob = useMemo(() => {
    return jobs.find(j => j.id === selectedJobId) || jobs[0] || null;
  }, [jobs, selectedJobId]);

  // Construct Live UTM Link
  const generatedUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const base = `${window.location.origin}/careers`;
    const params = new URLSearchParams();
    if (selectedJob?.id) params.set('jobId', selectedJob.id);
    if (source) params.set('utm_source', source);
    if (medium) params.set('utm_medium', medium);
    if (campaign) params.set('utm_campaign', campaign);
    if (referralName) params.set('ref', referralName);
    return `${base}?${params.toString()}`;
  }, [selectedJob, source, medium, campaign, referralName]);

  const handleCopy = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // Channels performance analytics
  const channelStats = useMemo(() => {
    const counts: Record<string, number> = {
      linkedin: 0,
      indeed: 0,
      bayt: 0,
      referral: 0,
      direct: 0,
      other: 0,
    };

    candidates.forEach(c => {
      const src = (c.utmSource || c.source || '').toLowerCase();
      if (src.includes('linkedin')) counts.linkedin++;
      else if (src.includes('indeed')) counts.indeed++;
      else if (src.includes('bayt')) counts.bayt++;
      else if (src.includes('referral') || c.referralEmployeeName) counts.referral++;
      else if (src.includes('direct') || src.includes('careers')) counts.direct++;
      else counts.other++;
    });

    return counts;
  }, [candidates]);

  const sourcesList = [
    { id: 'linkedin', labelAr: 'لينكد إن', labelEn: 'LinkedIn', color: '#0A66C2' },
    { id: 'indeed', labelAr: 'إنديد', labelEn: 'Indeed', color: '#2164F3' },
    { id: 'bayt', labelAr: 'بيت.كوم', labelEn: 'Bayt.com', color: '#00A389' },
    { id: 'twitter', labelAr: 'إكس (تويتر)', labelEn: 'X (Twitter)', color: '#000000' },
    { id: 'facebook', labelAr: 'فيسبوك / إنستغرام', labelEn: 'Meta / Facebook', color: '#1877F2' },
    { id: 'whatsapp', labelAr: 'مجموعات واتساب', labelEn: 'WhatsApp Group', color: '#25D366' },
    { id: 'referral', labelAr: 'إحالة موظف داخلي', labelEn: 'Employee Referral', color: '#F59E0B' },
    { id: 'direct', labelAr: 'موقع الشركة المباشر', labelEn: 'Direct Careers Web', color: '#10B981' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#0F2618] via-[#142A1D] to-[#0A180F] border border-[#1D3324] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-400 text-xs font-bold">
              <Globe2 className="w-3.5 h-3.5" />
              <span>{t('قنوات النشر وروابط UTM الذكية', 'Multi-channel Sourcing & Smart UTMs')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {t('بوابة التوظيف وروابط التتبع الذكية لقنوات النشر', 'Careers Portal & Campaign Tracking')}
            </h2>
            <p className="text-xs sm:text-sm text-[#97A69B] max-w-2xl leading-relaxed">
              {t(
                'توليد روابط تتبع ذكية (UTM Tracking Links) لكل شاغر وظيفي لمشاركتها عبر منصات التوظيف ومواقع التواصل الاجتماعي، مع معاينة حية لبوابة التوظيف.',
                'Generate specialized tracking links for each job vacancy across hiring platforms, monitor inbound sourcing channels, and preview the public portal live.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/careers"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-98 transition-all shrink-0"
            >
              <span>{t('فتح البوابة العامة مباشرة', 'Open Public Portal')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards for Sourcing Channels */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl border border-amber-200/60 dark:border-stone-800 bg-white dark:bg-[#0E1A11] shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400 block">
            LinkedIn
          </span>
          <span className="text-xl font-black text-[#0A66C2] mt-1 block font-mono">
            {channelStats.linkedin}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-stone-500">
            {t('مترشح وارد', 'applicants')}
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-amber-200/60 dark:border-stone-800 bg-white dark:bg-[#0E1A11] shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400 block">
            Indeed
          </span>
          <span className="text-xl font-black text-[#2164F3] mt-1 block font-mono">
            {channelStats.indeed}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-stone-500">
            {t('مترشح وارد', 'applicants')}
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-amber-200/60 dark:border-stone-800 bg-white dark:bg-[#0E1A11] shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400 block">
            Bayt.com
          </span>
          <span className="text-xl font-black text-[#00A389] mt-1 block font-mono">
            {channelStats.bayt}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-stone-500">
            {t('مترشح وارد', 'applicants')}
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-amber-200/60 dark:border-stone-800 bg-white dark:bg-[#0E1A11] shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400 block">
            {t('إحالات الموظفين', 'Referrals')}
          </span>
          <span className="text-xl font-black text-amber-500 mt-1 block font-mono">
            {channelStats.referral}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-stone-500">
            {t('إحالة داخلية', 'internal')}
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-amber-200/60 dark:border-stone-800 bg-white dark:bg-[#0E1A11] shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400 block">
            {t('البوابة المباشرة', 'Direct Web')}
          </span>
          <span className="text-xl font-black text-emerald-500 mt-1 block font-mono">
            {channelStats.direct}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-stone-500">
            {t('تقديم مباشر', 'organic')}
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-amber-200/60 dark:border-stone-800 bg-white dark:bg-[#0E1A11] shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400 block">
            {t('قنوات أخرى', 'Other Sources')}
          </span>
          <span className="text-xl font-black text-stone-400 mt-1 block font-mono">
            {channelStats.other}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-stone-500">
            {t('حملات متنوعة', 'campaigns')}
          </span>
        </div>
      </div>

      {/* 3. Main Workspace: UTM Generator (Left) + Interactive Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Generator Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl border border-amber-200/60 dark:border-stone-800 bg-white dark:bg-[#0E1A11] shadow-md shadow-amber-900/5 space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-amber-200/40 dark:border-stone-800">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <Link2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {t('مولد روابط التتبع الذكية (UTM Generator)', 'Smart UTM Generator')}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-stone-400">
                  {t('حدد الشاغر والقناة لتوليد رابط تتبع فوري', 'Pick job and source to craft tracked link')}
                </p>
              </div>
            </div>

            {/* Step 1: Select Active Job */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1.5">
                {t('1. الوظيفة الشاغرة المستهدفة *', '1. Target Job Opening *')}
              </label>
              <select
                value={selectedJobId}
                onChange={e => setSelectedJobId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200/70 dark:border-stone-800 bg-amber-50/20 dark:bg-[#121F16] text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.department}) - #{j.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Source Channel Pills */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-2">
                {t('2. قناة النشر أو المصدر (utm_source) *', '2. Sourcing Channel (utm_source) *')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {sourcesList.map(item => {
                  const isSelected = source === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSource(item.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-start flex items-center gap-2 ${
                        isSelected
                          ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20 ring-1 ring-amber-400'
                          : 'bg-white dark:bg-[#121F16] border-amber-200/50 dark:border-stone-800 text-slate-700 dark:text-stone-300 hover:border-amber-400'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: isSelected ? '#FFFFFF' : item.color }}
                      />
                      <span className="truncate">{t(item.labelAr, item.labelEn)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Campaign & Medium */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                  {t('اسم الحملة (Campaign)', 'Campaign Name')}
                </label>
                <input
                  type="text"
                  value={campaign}
                  onChange={e => setCampaign(e.target.value)}
                  placeholder="e.g. q4_hiring_push"
                  className="w-full px-3 py-2 rounded-xl border border-amber-200/70 dark:border-stone-800 bg-white dark:bg-[#121F16] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                  {t('نوع الوسيلة (Medium)', 'Medium')}
                </label>
                <input
                  type="text"
                  value={medium}
                  onChange={e => setMedium(e.target.value)}
                  placeholder="e.g. social_post"
                  className="w-full px-3 py-2 rounded-xl border border-amber-200/70 dark:border-stone-800 bg-white dark:bg-[#121F16] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Internal Referral Option */}
            {source === 'referral' && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <label className="block text-xs font-bold text-amber-800 dark:text-amber-300">
                  {t('اسم الموظف صاحب الإحالة (Referral Name)', 'Referring Employee Name')}
                </label>
                <input
                  type="text"
                  value={referralName}
                  onChange={e => setReferralName(e.target.value)}
                  placeholder={t('مثال: مهندس سامح كمال', 'e.g. Sameh Kamal')}
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-600/40 bg-white dark:bg-[#121F16] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}

            {/* Generated Link Display Box */}
            <div className="pt-2 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-stone-300">
                {t('الرابط الذكي المُولَّد جاهز للنشر والمشاركة:', 'Generated Smart Link:')}
              </label>

              <div className="p-3 rounded-2xl border border-amber-300 dark:border-stone-700 bg-amber-50/50 dark:bg-black/30 break-all text-xs font-mono text-slate-800 dark:text-amber-300 select-all">
                {generatedUrl}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t('تم نسخ الرابط بنجاح!', 'Link Copied!')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{t('نسخ رابط التتبع', 'Copy Smart Link')}</span>
                    </>
                  )}
                </button>

                <a
                  href={generatedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-amber-300 dark:border-stone-800 hover:bg-amber-100/50 dark:hover:bg-stone-800 text-slate-700 dark:text-stone-300 transition-colors"
                  title={t('معاينة الرابط في نافذة جديدة', 'Open in new tab')}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Interactive Device Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Preview Toolbar */}
          <div className="flex items-center justify-between p-3 rounded-2xl border border-amber-200/60 dark:border-stone-800 bg-white dark:bg-[#0E1A11]">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-black text-slate-900 dark:text-white">
                {t('المعاينة الحية لبوابة التوظيف', 'Live Portal Preview')}
              </span>
            </div>

            <div className="flex items-center gap-1 bg-amber-100/40 dark:bg-stone-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                  previewDevice === 'desktop'
                    ? 'bg-white dark:bg-black text-amber-600 shadow-xs'
                    : 'text-slate-500 dark:text-stone-400'
                }`}
                title={t('معاينة سطح المكتب', 'Desktop View')}
              >
                <Monitor className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                  previewDevice === 'mobile'
                    ? 'bg-white dark:bg-black text-amber-600 shadow-xs'
                    : 'text-slate-500 dark:text-stone-400'
                }`}
                title={t('معاينة الهاتف', 'Mobile View')}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Device Frame */}
          <div className="flex justify-center w-full">
            <div
              className={`w-full transition-all duration-300 rounded-3xl border border-amber-300/80 dark:border-stone-800 bg-[#FFFDF9] dark:bg-[#060D08] shadow-2xl overflow-hidden ${
                previewDevice === 'mobile'
                  ? 'max-w-sm border-8 border-stone-800 rounded-[40px] shadow-2xl'
                  : 'max-w-full'
              }`}
            >
              {/* Fake Browser / Mobile Header */}
              <div className="px-4 py-2.5 bg-amber-100/60 dark:bg-stone-900 border-b border-amber-200/70 dark:border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="text-[10px] font-mono text-slate-500 dark:text-stone-400 truncate max-w-[200px]">
                  careers.eco-group.com
                </div>
                <div className="w-3" />
              </div>

              {/* Portal Live Header Inside Preview */}
              <div className="p-4 sm:p-5 border-b border-amber-200/50 dark:border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <EcoOfficialLogo size="sm" />
                  <div>
                    <span className="text-xs font-black text-amber-500">ECO Careers</span>
                    <p className="text-[9px] text-slate-400">Official Portal</p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  {t('نشر مباشر', 'Live')}
                </span>
              </div>

              {/* Job Preview Body */}
              {selectedJob ? (
                <div className="p-5 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600">
                      {selectedJob.department}
                    </span>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      {selectedJob.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-stone-400 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-amber-500" />
                      <span>{selectedJob.companyName || t('شركة المجموعة المعتمدة', 'Group Entity')}</span>
                      <span>•</span>
                      <span>{selectedJob.location || t('القاهرة، مصر', 'Cairo, Egypt')}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-stone-900 border border-amber-200/50 dark:border-stone-800">
                      <span className="text-[10px] text-slate-400 block">{t('نوع العمل', 'Type')}</span>
                      <span className="font-bold text-slate-800 dark:text-stone-200">
                        {selectedJob.employmentType === 'remote' ? 'عن بعد' : 'دوام كامل'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-stone-900 border border-amber-200/50 dark:border-stone-800">
                      <span className="text-[10px] text-slate-400 block">{t('الراتب المعروض', 'Salary')}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {selectedJob.budgetMin
                          ? `${selectedJob.budgetMin.toLocaleString()} ${selectedJob.currency || 'EGP'}`
                          : 'تنافسي'}
                      </span>
                    </div>
                  </div>

                  {selectedJob.skills && selectedJob.skills.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-stone-300">
                        {t('المهارات المطلوبة:', 'Required Skills:')}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedJob.skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Simulated Application Button */}
                  <div className="pt-2">
                    <a
                      href={generatedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 hover:bg-amber-600 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{t('التقديم الآن على الوظيفة', 'Apply Now')}</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  {t('لا توجد وظائف معتمدة للمعاينة', 'No jobs available for preview')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

