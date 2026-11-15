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
  Link2,
  SlidersHorizontal,
  Sparkles,
  Save
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useTenant } from '../../../context/TenantContext';
import { atsStorage, ATSPortalConfig } from '../../../services/atsStorage';
import { JobRequisition, Candidate } from './types';
import { EcoOfficialLogo } from '../../common/EcoOfficialLogo';

interface ATSPortalTabProps {
  companyId?: string;
}

export const ATSPortalTab: React.FC<ATSPortalTabProps> = ({ companyId }) => {
  const { t } = useLanguage();
  const { companies, activeCompany, selectedCompanies } = useTenant();

  const [jobs, setJobs] = useState<JobRequisition[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('general_apply');
  const [copied, setCopied] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Smart Company Branding Configuration (Synced to Cloudflare D1 / localStorage)
  const [portalConfig, setPortalConfig] = useState<ATSPortalConfig>(() => atsStorage.getPortalConfigSync());
  const [portalConfigLoaded, setPortalConfigLoaded] = useState(false);
  const [manualCompanyName, setManualCompanyName] = useState<string>(
    () => atsStorage.getPortalConfigSync().companyNameAr || ''
  );
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [companySavedFlash, setCompanySavedFlash] = useState(false);

  // Optional UTM Tracking (OFF by default so published links stay ultra-short)
  const [includeUtm, setIncludeUtm] = useState(false);
  const [source, setSource] = useState('linkedin');
  const [medium, setMedium] = useState('social_post');
  const [campaign, setCampaign] = useState('general_recruitment');
  const [referralName, setReferralName] = useState('');

  // Fetch jobs & candidates
  const loadData = async () => {
    try {
      const allJobs = await atsStorage.getJobs(companyId);
      const allCandidates = await atsStorage.getCandidates(companyId);
      setJobs(allJobs);
      setCandidates(allCandidates);
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

  // Load persisted portal company configuration on mount
  useEffect(() => {
    let mounted = true;
    atsStorage.getPortalConfig().then(cfg => {
      if (!mounted) return;
      setPortalConfig(cfg);
      if (cfg.companyNameAr) {
        setManualCompanyName(prev => prev || cfg.companyNameAr);
      }
      setPortalConfigLoaded(true);
    });

    const handleConfigUpdate = () => {
      const syncCfg = atsStorage.getPortalConfigSync();
      setPortalConfig(syncCfg);
    };
    window.addEventListener('eco-ats-portal-config-updated', handleConfigUpdate);
    return () => {
      mounted = false;
      window.removeEventListener('eco-ats-portal-config-updated', handleConfigUpdate);
    };
  }, []);

  const topBarCompany = useMemo(() => {
    return activeCompany || (selectedCompanies.length === 1 ? selectedCompanies[0] : null);
  }, [activeCompany, selectedCompanies]);

  // Auto-sync active selected company to backend config when in 'selected' mode
  useEffect(() => {
    if (!portalConfigLoaded) return;
    if (portalConfig.companyMode !== 'selected') return;
    if (!topBarCompany?.nameAr) return;

    if (
      portalConfig.companyId !== topBarCompany.id ||
      portalConfig.companyNameAr !== topBarCompany.nameAr
    ) {
      const nextCfg: ATSPortalConfig = {
        companyMode: 'selected',
        companyId: topBarCompany.id,
        companyNameAr: topBarCompany.nameAr,
      };
      setPortalConfig(nextCfg);
      atsStorage.savePortalConfig(nextCfg).catch(err => {
        console.warn('Auto-sync portal company failed:', err);
      });
    }
  }, [portalConfigLoaded, portalConfig.companyMode, portalConfig.companyId, portalConfig.companyNameAr, topBarCompany]);

  const resolvedCompanyName = useMemo(() => {
    if (portalConfig.companyMode === 'manual') {
      return (
        manualCompanyName.trim() ||
        portalConfig.companyNameAr ||
        topBarCompany?.nameAr ||
        'الشركة المسجلة'
      );
    }
    return (
      topBarCompany?.nameAr ||
      portalConfig.companyNameAr ||
      companies[0]?.nameAr ||
      'الشركة المسجلة'
    );
  }, [portalConfig.companyMode, portalConfig.companyNameAr, manualCompanyName, topBarCompany, companies]);

  const persistPortalCompany = async (nextCfg: ATSPortalConfig) => {
    setIsSavingCompany(true);
    try {
      const saved = await atsStorage.savePortalConfig(nextCfg);
      setPortalConfig(saved);
      setCompanySavedFlash(true);
      setTimeout(() => setCompanySavedFlash(false), 2000);
    } finally {
      setIsSavingCompany(false);
    }
  };

  const handleSwitchCompanyMode = (mode: 'selected' | 'manual') => {
    if (mode === 'selected') {
      const target =
        topBarCompany ||
        companies.find(c => c.id === portalConfig.companyId) ||
        companies[0] ||
        null;
      persistPortalCompany({
        companyMode: 'selected',
        companyId: target?.id || '',
        companyNameAr: target?.nameAr || portalConfig.companyNameAr || 'الشركة المسجلة',
      });
    } else {
      const seedName =
        manualCompanyName.trim() ||
        portalConfig.companyNameAr ||
        topBarCompany?.nameAr ||
        companies[0]?.nameAr ||
        '';
      setManualCompanyName(seedName);
      persistPortalCompany({
        companyMode: 'manual',
        companyId: '',
        companyNameAr: seedName,
      });
    }
  };

  const handleSaveManualCompany = (overrideName?: string) => {
    const cleanName = (overrideName !== undefined ? overrideName : manualCompanyName).trim();
    if (!cleanName) return;
    setManualCompanyName(cleanName);
    persistPortalCompany({
      companyMode: 'manual',
      companyId: '',
      companyNameAr: cleanName,
    });
  };

  const selectedJob = useMemo(() => {
    if (selectedJobId === 'general_apply' || selectedJobId === 'tarabot_general') return null;
    return jobs.find(j => j.id === selectedJobId) || null;
  }, [jobs, selectedJobId]);

  // Construct Short Publishable Link (default /apply; UTM params appended only if toggled on)
  const generatedUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const base = `${window.location.origin}/apply`;
    const params = new URLSearchParams();
    if (selectedJob) {
      params.set('j', selectedJob.code || selectedJob.id);
    }
    if (includeUtm) {
      if (source) params.set('s', source);
      if (medium) params.set('m', medium);
      if (campaign) params.set('cmp', campaign);
      if (referralName.trim()) params.set('ref', referralName.trim());
    }
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }, [selectedJob, includeUtm, source, medium, campaign, referralName]);

  const previewUrlLabel = useMemo(() => {
    if (typeof window === 'undefined') return 'apply';
    try {
      const u = new URL(generatedUrl);
      return `${u.host}${u.pathname}${u.search}`;
    } catch {
      return `${window.location.host}/apply`;
    }
  }, [generatedUrl]);

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
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-l from-[#FBF5E6] via-[#FBF9F5] to-[#FFFFFF] dark:from-[#121D15] dark:via-[#141E16] dark:to-[#0E1610] text-[#1A241C] dark:text-[#F3EFE6] border border-[#E0D9CB] dark:border-[#243628] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#D99B26]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D99B26]/15 border border-[#D99B26]/30 text-[#9A6B12] dark:text-[#EBB34D] text-xs font-bold">
              <Globe2 className="w-3.5 h-3.5 text-[#D99B26]" />
              <span>{t('الرابط المختصر وبوابة التقديم العامة', 'Short Application Link & Public Portal')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1A241C] dark:text-[#F3EFE6]">
              {t('بوابة التوظيف والرابط المختصر للمتقدمين', 'Careers Portal & Short Publish Link')}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C665E] dark:text-[#8FA392] max-w-2xl leading-relaxed">
              {t(
                'شارك رابط تقديم قصير وبسيط (/apply) مع المتقدمين باسم الشركة المختارة أو باسم مخصص، مع خيار تفعيل معاملات تتبع المصدر عند الحاجة.',
                'Publish a clean short /apply link using the selected company or a custom name, with optional UTM tracking and live preview.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={generatedUrl || '/apply'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#D99B26] hover:bg-[#C2881D] text-[#0E1610] font-bold text-xs shadow-md shadow-[#D99B26]/20 active:scale-[0.98] transition-all shrink-0 cursor-pointer"
            >
              <span>{t('فتح البوابة العامة مباشرة', 'Open Public Portal')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards for Sourcing Channels */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FFFFFF] dark:bg-[#141E16] shadow-xs">
          <span className="text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] block">
            LinkedIn
          </span>
          <span className="text-xl font-black text-[#0A66C2] mt-1 block font-mono">
            {channelStats.linkedin}
          </span>
          <span className="text-[10px] text-[#5C665E]/80 dark:text-[#8FA392]/70">
            {t('مترشح وارد', 'applicants')}
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FFFFFF] dark:bg-[#141E16] shadow-xs">
          <span className="text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] block">
            Indeed
          </span>
          <span className="text-xl font-black text-[#2164F3] mt-1 block font-mono">
            {channelStats.indeed}
          </span>
          <span className="text-[10px] text-[#5C665E]/80 dark:text-[#8FA392]/70">
            {t('مترشح وارد', 'applicants')}
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FFFFFF] dark:bg-[#141E16] shadow-xs">
          <span className="text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] block">
            Bayt.com
          </span>
          <span className="text-xl font-black text-[#059669] mt-1 block font-mono">
            {channelStats.bayt}
          </span>
          <span className="text-[10px] text-[#5C665E]/80 dark:text-[#8FA392]/70">
            {t('مترشح وارد', 'applicants')}
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FFFFFF] dark:bg-[#141E16] shadow-xs">
          <span className="text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] block">
            {t('إحالات الموظفين', 'Referrals')}
          </span>
          <span className="text-xl font-black text-[#D99B26] mt-1 block font-mono">
            {channelStats.referral}
          </span>
          <span className="text-[10px] text-[#5C665E]/80 dark:text-[#8FA392]/70">
            {t('إحالة داخلية', 'internal')}
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FFFFFF] dark:bg-[#141E16] shadow-xs">
          <span className="text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] block">
            {t('البوابة المباشرة', 'Direct Web')}
          </span>
          <span className="text-xl font-black text-[#059669] mt-1 block font-mono">
            {channelStats.direct}
          </span>
          <span className="text-[10px] text-[#5C665E]/80 dark:text-[#8FA392]/70">
            {t('تقديم مباشر', 'organic')}
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FFFFFF] dark:bg-[#141E16] shadow-xs">
          <span className="text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] block">
            {t('قنوات أخرى', 'Other Sources')}
          </span>
          <span className="text-xl font-black text-[#5C665E] dark:text-[#8FA392] mt-1 block font-mono">
            {channelStats.other}
          </span>
          <span className="text-[10px] text-[#5C665E]/80 dark:text-[#8FA392]/70">
            {t('حملات متنوعة', 'campaigns')}
          </span>
        </div>
      </div>

      {/* 3. Main Workspace: Link & Company Controls (5 cols) + Interactive Live Preview (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Right (RTL): Generator Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FFFFFF] dark:bg-[#141E16] shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-[#E0D9CB]/80 dark:border-[#243628]">
              <div className="w-9 h-9 rounded-xl bg-[#D99B26]/12 text-[#D99B26] flex items-center justify-center shrink-0">
                <Link2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black text-[#1A241C] dark:text-[#F3EFE6]">
                  {t('إعداد رابط التقديم واسم الشركة', 'Short Link & Company Branding')}
                </h3>
                <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                  {t('رابط مختصر جاهز للنشر مع تحكم ذكي باسم الشركة', 'Short shareable URL with auto or manual company name')}
                </p>
              </div>
            </div>

            {/* Smart Company Branding Control */}
            <div className="p-4 rounded-2xl bg-[#FBF9F5] dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] space-y-3">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#D99B26]" />
                  <span>{t('اسم الشركة في استمارة التوظيف *', 'Portal Company Name *')}</span>
                </label>

                {companySavedFlash && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#059669]/12 text-[#059669] dark:text-[#34D399] text-[10px] font-bold">
                    <Check className="w-3 h-3" />
                    <span>{t('تم الحفظ', 'Saved')}</span>
                  </span>
                )}
              </div>

              {/* Segmented Toggle: Auto vs Manual */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#F3EFE6] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628]">
                <button
                  type="button"
                  onClick={() => handleSwitchCompanyMode('selected')}
                  className={`py-2 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    portalConfig.companyMode === 'selected'
                      ? 'bg-[#059669] text-white shadow-xs'
                      : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
                  }`}
                >
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span>{t('تلقائي من المختارة', 'Auto Selected')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchCompanyMode('manual')}
                  className={`py-2 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    portalConfig.companyMode === 'manual'
                      ? 'bg-[#D99B26] text-[#0E1610] shadow-xs'
                      : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
                  }`}
                >
                  <SlidersHorizontal className="w-3 h-3 shrink-0" />
                  <span>{t('إدخال الاسم يدوياً', 'Custom Manual')}</span>
                </button>
              </div>

              {portalConfig.companyMode === 'selected' ? (
                <div className="space-y-2">
                  <div className="px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6] truncate">
                      {resolvedCompanyName}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#059669]/12 text-[#059669] dark:text-[#34D399] shrink-0">
                      {t('مربوط تلقائياً', 'Auto Synced')}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] leading-relaxed">
                    {topBarCompany
                      ? t(
                          'يأخذ الرابط اسم الشركة المختارة حالياً في الشريط العلوي ويحفظه تلقائياً لصفحة المتقدمين.',
                          'Inherits the currently selected company from the header bar automatically.'
                        )
                      : t(
                          'اختر شركة واحدة من الشريط العلوي لتحديث الاسم تلقائياً، أو بدّل إلى "إدخال الاسم يدوياً".',
                          'Select a single company in the header bar or switch to manual mode.'
                        )}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={manualCompanyName}
                      onChange={e => setManualCompanyName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSaveManualCompany();
                        }
                      }}
                      placeholder={t('اكتب اسم الشركة المطلوب إظهاره...', 'Type company display name...')}
                      className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FFFFFF] dark:bg-[#17231A] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:ring-2 focus:ring-[#D99B26]"
                    />
                    <button
                      type="button"
                      disabled={isSavingCompany || !manualCompanyName.trim()}
                      onClick={() => handleSaveManualCompany()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#D99B26] hover:bg-[#C2881D] disabled:opacity-50 text-[#0E1610] font-bold text-xs shadow-xs cursor-pointer shrink-0 transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingCompany ? t('حفظ...', 'Saving...') : t('حفظ', 'Save')}</span>
                    </button>
                  </div>

                  {companies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {companies.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSaveManualCompany(c.nameAr)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                            manualCompanyName.trim() === c.nameAr
                              ? 'bg-[#D99B26]/15 border-[#D99B26] text-[#9A6B12] dark:text-[#EBB34D]'
                              : 'bg-[#FFFFFF] dark:bg-[#17231A] border-[#E0D9CB] dark:border-[#243628] text-[#5C665E] dark:text-[#8FA392] hover:border-[#D99B26]'
                          }`}
                        >
                          {c.nameAr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 1: Select Active Job */}
            <div>
              <label className="block text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1.5">
                {t('1. الوظيفة الشاغرة المستهدفة', '1. Target Job Opening')}
              </label>
              <select
                value={selectedJobId}
                onChange={e => setSelectedJobId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#17231A] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:ring-2 focus:ring-[#D99B26]"
              >
                <option value="general_apply">
                  {t(
                    `استمارة طلب التوظيف العامة — ${resolvedCompanyName} (تقديم مباشر)`,
                    `General Employment Application — ${resolvedCompanyName}`
                  )}
                </option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.department}) - #{j.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Generated Short Link Display Box */}
            <div className="pt-1 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <label className="block text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                  {includeUtm
                    ? t('الرابط المختصر مع معاملات التتبع:', 'Tracked Short Link:')
                    : t('الرابط المختصر جاهز للنشر والمشاركة:', 'Short Publishable Link:')}
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#059669]/12 text-[#059669] dark:text-[#34D399]">
                  {t('مختصر وبسيط', 'Clean URL')}
                </span>
              </div>

              <div
                dir="ltr"
                className="p-3.5 rounded-2xl border border-[#D99B26]/60 dark:border-[#D99B26]/40 bg-[#FBF9F5] dark:bg-[#0E1610] break-all text-xs sm:text-sm font-mono font-bold text-[#1A241C] dark:text-[#EBB34D] select-all text-left"
              >
                {generatedUrl}
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#D99B26] hover:bg-[#C2881D] text-[#0E1610] font-bold text-xs shadow-md shadow-[#D99B26]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t('تم نسخ الرابط المختصر!', 'Short Link Copied!')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{t('نسخ الرابط المختصر', 'Copy Short Link')}</span>
                    </>
                  )}
                </button>

                <a
                  href={generatedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#17231A] hover:border-[#D99B26] text-[#1A241C] dark:text-[#F3EFE6] transition-colors"
                  title={t('معاينة الرابط في نافذة جديدة', 'Open in new tab')}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Optional UTM Tracking Toggle (OFF by default to keep link clean) */}
            <div className="pt-2 border-t border-[#E0D9CB]/80 dark:border-[#243628]">
              <button
                type="button"
                onClick={() => setIncludeUtm(prev => !prev)}
                className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#121B14] hover:border-[#D99B26] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#D99B26]" />
                  <span>{t('إضافة تتبع قنوات النشر (UTM — اختياري)', 'Include Campaign UTM Tracking (Optional)')}</span>
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    includeUtm
                      ? 'bg-[#D99B26] text-[#0E1610]'
                      : 'bg-[#F3EFE6] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392]'
                  }`}
                >
                  {includeUtm ? t('مفعّل', 'ON') : t('معطّل', 'OFF')}
                </span>
              </button>

              {includeUtm && (
                <div className="mt-4 space-y-4 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-2">
                      {t('قناة النشر أو المصدر (s)', 'Sourcing Channel (s)')}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {sourcesList.map(item => {
                        const isSelected = source === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSource(item.id)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-start flex items-center gap-2 cursor-pointer ${
                              isSelected
                                ? 'bg-[#D99B26] text-[#0E1610] font-bold border-[#D99B26] shadow-sm'
                                : 'bg-[#FFFFFF] dark:bg-[#17231A] border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] hover:border-[#D99B26]'
                            }`}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: isSelected ? '#0E1610' : item.color }}
                            />
                            <span className="truncate">{t(item.labelAr, item.labelEn)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                        {t('اسم الحملة (cmp)', 'Campaign (cmp)')}
                      </label>
                      <input
                        type="text"
                        value={campaign}
                        onChange={e => setCampaign(e.target.value)}
                        placeholder="q4_hiring"
                        className="w-full px-3 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FFFFFF] dark:bg-[#17231A] text-xs font-medium text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:ring-2 focus:ring-[#D99B26]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                        {t('نوع الوسيلة (m)', 'Medium (m)')}
                      </label>
                      <input
                        type="text"
                        value={medium}
                        onChange={e => setMedium(e.target.value)}
                        placeholder="social_post"
                        className="w-full px-3 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FFFFFF] dark:bg-[#17231A] text-xs font-medium text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:ring-2 focus:ring-[#D99B26]"
                      />
                    </div>
                  </div>

                  {source === 'referral' && (
                    <div className="p-3.5 rounded-2xl bg-[#D99B26]/10 border border-[#D99B26]/30 space-y-1">
                      <label className="block text-xs font-bold text-[#9A6B12] dark:text-[#EBB34D]">
                        {t('اسم الموظف صاحب الإحالة (ref)', 'Referring Employee Name')}
                      </label>
                      <input
                        type="text"
                        value={referralName}
                        onChange={e => setReferralName(e.target.value)}
                        placeholder={t('مثال: مهندس سامح كمال', 'e.g. Sameh Kamal')}
                        className="w-full px-3 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FFFFFF] dark:bg-[#17231A] text-xs font-medium text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:ring-2 focus:ring-[#D99B26]"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Left (RTL): Interactive Device Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Preview Toolbar */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FFFFFF] dark:bg-[#141E16]">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#D99B26]" />
              <span className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6]">
                {t('المعاينة الحية لبوابة التوظيف', 'Live Portal Preview')}
              </span>
            </div>

            <div className="flex items-center gap-1 bg-[#F3EFE6] dark:bg-[#0E1610] p-1 rounded-xl border border-[#E0D9CB] dark:border-[#243628]">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  previewDevice === 'desktop'
                    ? 'bg-[#FFFFFF] dark:bg-[#17231A] text-[#D99B26] shadow-xs'
                    : 'text-[#5C665E] dark:text-[#8FA392]'
                }`}
                title={t('معاينة سطح المكتب', 'Desktop View')}
              >
                <Monitor className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  previewDevice === 'mobile'
                    ? 'bg-[#FFFFFF] dark:bg-[#17231A] text-[#D99B26] shadow-xs'
                    : 'text-[#5C665E] dark:text-[#8FA392]'
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
              className={`w-full transition-all duration-300 rounded-3xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#0E1610] shadow-xl overflow-hidden ${
                previewDevice === 'mobile'
                  ? 'max-w-sm border-8 border-[#243628] rounded-[40px] shadow-2xl'
                  : 'max-w-full'
              }`}
            >
              {/* Fake Browser / Mobile Header */}
              <div className="px-4 py-2.5 bg-[#F3EFE6] dark:bg-[#121B14] border-b border-[#E0D9CB] dark:border-[#243628] flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#D99B26]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
                </div>
                <div
                  dir="ltr"
                  className="text-[10px] font-mono text-[#5C665E] dark:text-[#8FA392] truncate max-w-[260px]"
                >
                  {previewUrlLabel}
                </div>
                <div className="w-3 shrink-0" />
              </div>

              {/* Portal Live Header Inside Preview (Aligned, Clean, No Login Button / No Redundant Sentence) */}
              <div className="px-4 sm:px-5 py-3.5 bg-[#FFFFFF]/90 dark:bg-[#141E16]/90 border-b border-[#E0D9CB] dark:border-[#243628] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <EcoOfficialLogo size="sm" />
                  <div className="min-w-0">
                    <span className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6] block truncate">
                      {resolvedCompanyName}
                    </span>
                    <p className="text-[10px] font-bold text-[#059669] dark:text-[#34D399]">
                      {t('بوابة التوظيف الرسمية', 'Careers Portal')}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#059669]/12 text-[#059669] dark:text-[#34D399] border border-[#059669]/25 shrink-0">
                  {t('نشر مباشر', 'Live')}
                </span>
              </div>

              {/* Job Preview Body */}
              {selectedJob ? (
                <div className="p-5 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#D99B26]/12 text-[#9A6B12] dark:text-[#EBB34D]">
                      {selectedJob.department}
                    </span>
                    <h4 className="text-base font-black text-[#1A241C] dark:text-[#F3EFE6]">
                      {selectedJob.title}
                    </h4>
                    <p className="text-xs text-[#5C665E] dark:text-[#8FA392] flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#D99B26] shrink-0" />
                      <span className="truncate">{resolvedCompanyName}</span>
                      <span>•</span>
                      <span>{selectedJob.location || t('القاهرة، مصر', 'Cairo, Egypt')}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#141E16] border border-[#E0D9CB] dark:border-[#243628]">
                      <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392] block">
                        {t('نوع العمل', 'Type')}
                      </span>
                      <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                        {selectedJob.employmentType === 'remote' ? 'عن بعد' : 'دوام كامل'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#141E16] border border-[#E0D9CB] dark:border-[#243628]">
                      <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392] block">
                        {t('الراتب المعروض', 'Salary')}
                      </span>
                      <span className="font-bold text-[#059669] dark:text-[#34D399]">
                        {selectedJob.budgetMin
                          ? `${selectedJob.budgetMin.toLocaleString()} ${selectedJob.currency || 'EGP'}`
                          : 'تنافسي'}
                      </span>
                    </div>
                  </div>

                  {selectedJob.skills && selectedJob.skills.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                        {t('المهارات المطلوبة:', 'Required Skills:')}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedJob.skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#D99B26]/12 text-[#9A6B12] dark:text-[#EBB34D]"
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
                      className="w-full py-2.5 rounded-xl bg-[#D99B26] text-[#0E1610] font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#D99B26]/20 hover:bg-[#C2881D] transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{t('التقديم الآن على الوظيفة', 'Apply Now')}</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-[#059669]/12 text-[#059669] dark:text-[#34D399]">
                      {t('نموذج التوظيف الإلكتروني المعتمد', 'Official Application Form')}
                    </span>
                    <h4 className="text-base font-black text-[#1A241C] dark:text-[#F3EFE6]">
                      {t(`طلب توظيف — ${resolvedCompanyName}`, `Employment Application — ${resolvedCompanyName}`)}
                    </h4>
                    <p className="text-xs text-[#5C665E] dark:text-[#8FA392] leading-relaxed">
                      {t(
                        'يفتح الرابط مباشرة على استمارة التوظيف المماثلة للنموذج الورقي (المعلومات العامة، الرقم القومي، التجنيد، التأمينات، المؤهلات، المهارات، الدورات، الخبرات، والإقرار الرسمي).',
                        'Direct link to the structured employment application form including identity, qualifications, training, experience, and official declaration.'
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#141E16] border border-[#E0D9CB] dark:border-[#243628]">
                      <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392] block">
                        {t('التحقق الآلي', 'Auto Check')}
                      </span>
                      <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                        {t('الرقم القومي 14 رقم', '14-Digit National ID')}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#141E16] border border-[#E0D9CB] dark:border-[#243628]">
                      <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392] block">
                        {t('المرفقات', 'Attachments')}
                      </span>
                      <span className="font-bold text-[#059669] dark:text-[#34D399]">
                        {t('CV + نسخة قابلة للطباعة', 'CV + Printable PDF')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <a
                      href={generatedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-xl bg-[#D99B26] text-[#0E1610] font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#D99B26]/20 hover:bg-[#C2881D] transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{t('فتح رابط التقديم المباشر', 'Open Direct Application Link')}</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

