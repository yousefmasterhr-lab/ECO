import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  MapPin,
  Building2,
  Sparkles,
  Sun,
  Moon,
  Search,
  CheckCircle2,
  Clock,
  Coins,
  Award,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Printer,
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import { atsStorage } from '../../../services/atsStorage';
import { JobRequisition, Candidate, TarabotApplicationForm } from './types';
import {
  TarabotApplicationFormView,
  TarabotPrintableApplicationModal,
} from './TarabotApplicationFormView';
import { EcoOfficialLogo } from '../../common/EcoOfficialLogo';
import { fireConfetti } from '../../../utils/confetti';

export const PublicCareersPortal: React.FC = () => {
  const { isRtl, language, setLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  // URL Query Parameters Parsing
  const searchParams = useMemo(() => {
    if (typeof window === 'undefined') return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  }, []);

  const paramJobId = searchParams.get('jobId') || '';
  const paramDirect = searchParams.get('direct') === 'true' || searchParams.get('form') === 'tarabot';
  const utmSource = searchParams.get('utm_source') || 'careers_portal';
  const utmMedium = searchParams.get('utm_medium') || 'web_direct';
  const utmCampaign = searchParams.get('utm_campaign') || 'talent_sourcing';
  const referralName = searchParams.get('ref') || searchParams.get('referral') || '';

  // State
  const [jobs, setJobs] = useState<JobRequisition[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobRequisition | null>(null);
  const [isGeneralApplication, setIsGeneralApplication] = useState(paramDirect && !paramJobId);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [submittedCandidate, setSubmittedCandidate] = useState<Candidate | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Load published jobs from storage / D1
  useEffect(() => {
    let isMounted = true;
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await atsStorage.getJobs();
        if (!isMounted) return;
        setJobs(data);

        if (paramJobId) {
          const matched = data.find((j) => j.id === paramJobId || j.code === paramJobId);
          if (matched) {
            setSelectedJob(matched);
            setIsGeneralApplication(false);
          }
        }
      } catch (err) {
        console.error('Failed to load jobs', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchJobs();
    return () => {
      isMounted = false;
    };
  }, [paramJobId]);

  const handleSelectJob = (job: JobRequisition) => {
    setSelectedJob(job);
    setIsGeneralApplication(false);
    setSubmittedRef(null);
    setSubmittedCandidate(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartGeneralApplication = () => {
    setSelectedJob(null);
    setIsGeneralApplication(true);
    setSubmittedRef(null);
    setSubmittedCandidate(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const departments = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      if (j.department) set.add(j.department);
    });
    return Array.from(set);
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const matchSearch =
        !searchTerm ||
        j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (j.titleEn && j.titleEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (j.department && j.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (j.skills && j.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchDept = selectedDept === 'all' || j.department === selectedDept;
      return matchSearch && matchDept;
    });
  }, [jobs, searchTerm, selectedDept]);

  const handleTarabotPublicSubmit = async (form: TarabotApplicationForm) => {
    setIsSubmitting(true);
    try {
      const enrichedForm: TarabotApplicationForm = {
        ...form,
        entryChannel: 'public_portal',
      };
      const result = await atsStorage.submitTarabotApplication(enrichedForm, {
        mode: 'candidate_only',
        job: selectedJob,
        companyId: selectedJob?.companyId || 'comp_01',
        companyName:
          selectedJob?.companyName || 'شركة ترابط للإستثمارات و المشروعات (ش.م.م)',
        utmSource: utmSource || 'careers_portal',
        utmCampaign: utmCampaign || utmMedium,
        referralName: referralName || undefined,
        actorName: form.fullName,
      });

      setSubmittedRef(result.refNumber);
      setSubmittedCandidate(result.candidate);
      fireConfetti();
    } catch (err) {
      console.error('Error submitting Tarabot application', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isInFormView = Boolean(selectedJob || isGeneralApplication);

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`min-h-screen w-full font-sans transition-colors duration-300 ${
        isDark ? 'bg-[#0E1610] text-[#F3EFE6]' : 'bg-[#FBF9F5] text-[#1A241C]'
      }`}
    >
      {/* 1. Public Header Bar */}
      <header
        className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors ${
          isDark
            ? 'bg-[#121B14]/95 border-[#243628] shadow-lg shadow-black/30'
            : 'bg-[#FBF9F5]/95 border-[#E0D9CB] shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <EcoOfficialLogo size="md" className="shrink-0" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base sm:text-lg font-black text-[#1A241C] dark:text-[#F3EFE6]">
                  {t('شركة ترابط للإستثمارات و المشروعات', 'Tarabot Investment & Projects')}
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-[#059669]/10 text-[#059669] dark:text-emerald-400 border border-[#059669]/25">
                  {t('بوابة التوظيف الرسمية', 'Official Careers Portal')}
                </span>
              </div>
              <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] font-medium">
                {t(
                  'طلب التوظيف الإلكتروني المعتمد وفق قانون العمل المصري رقم ١٤ لسنة ٢٠٢٥',
                  'Official Digital Job Application Portal — Law No. 14 of 2025'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold border border-[#E0D9CB] dark:border-[#243628] bg-[#FFFFFF] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] hover:border-[#D99B26] transition-colors cursor-pointer"
            >
              {language === 'ar' ? 'English' : 'عربي'}
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FFFFFF] dark:bg-[#17231A] text-[#D99B26] hover:border-[#D99B26] transition-colors cursor-pointer"
              title={t('تبديل وضع العرض', 'Toggle Theme')}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <a
              href="/"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#D99B26] hover:bg-[#EBB34D] text-[#1A241C] shadow-xs transition-all"
            >
              <span>{t('تسجيل الدخول للنظام', 'ERP Login')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* 2. Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {isInFormView ? (
          /* ========================================================================= */
          /* VIEW A: TARABOT OFFICIAL JOB APPLICATION FORM (VACANCY OR GENERAL)        */
          /* ========================================================================= */
          <div className="space-y-6 animate-in fade-in duration-300">
            <button
              onClick={() => {
                setSelectedJob(null);
                setIsGeneralApplication(false);
                setSubmittedRef(null);
                setSubmittedCandidate(null);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-[#E0D9CB] dark:border-[#243628] bg-[#FFFFFF] dark:bg-[#141E16] text-[#1A241C] dark:text-[#F3EFE6] hover:border-[#D99B26] transition-colors cursor-pointer"
            >
              {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              <span>{t('العودة لبوابة الوظائف الشاغرة', 'Back to Career Opportunities')}</span>
            </button>

            {submittedRef ? (
              <div className="p-8 sm:p-12 rounded-3xl border border-[#059669]/40 bg-[#FFFFFF] dark:bg-[#141E16] text-center space-y-6 shadow-xl">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-[#059669] text-white flex items-center justify-center shadow-lg shadow-[#059669]/25">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2 max-w-lg mx-auto">
                  <h2 className="text-2xl sm:text-3xl font-black text-[#1A241C] dark:text-[#F3EFE6]">
                    {t('تم تسجيل طلب التوظيف بنجاح!', 'Application Received Successfully!')}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#5C665E] dark:text-[#8FA392] leading-relaxed">
                    {t(
                      'تم قيد استمارة طلب التوظيف الرسمية الخاصة بك في منظومة الموارد البشرية لشركة ترابط للإستثمارات و المشروعات، وسيتم مراجعة مؤهلاتك وخبراتك والتواصل معك قريباً.',
                      'Your official Tarabot job application has been registered. Our HR team will review your qualifications and reach out shortly.'
                    )}
                  </p>
                </div>

                <div className="inline-flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#121B14] border border-[#059669]/30">
                  <span className="text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392]">
                    {t('رقم قيد الطلب المرجعي:', 'Application Registration Number:')}
                  </span>
                  <span className="text-xl sm:text-2xl font-black font-mono tracking-wider text-[#059669] dark:text-emerald-400">
                    {submittedRef}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  {submittedCandidate && (
                    <button
                      type="button"
                      onClick={() => setShowPrintModal(true)}
                      className="px-5 py-3 rounded-2xl border border-[#059669] bg-[#059669]/10 hover:bg-[#059669]/20 text-[#059669] dark:text-emerald-400 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <Printer className="w-4 h-4" />
                      <span>{t('عرض / طباعة نسخة طلب التوظيف (PDF)', 'View / Print Submitted Form')}</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedJob(null);
                      setIsGeneralApplication(false);
                      setSubmittedRef(null);
                      setSubmittedCandidate(null);
                    }}
                    className="px-6 py-3 rounded-2xl bg-[#D99B26] hover:bg-[#EBB34D] text-[#1A241C] font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    {t('العودة للصفحة الرئيسية للتوظيف', 'Explore More Opportunities')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
                {selectedJob && (
                  <div className="lg:col-span-4 space-y-6">
                    <div className="p-6 rounded-3xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FFFFFF] dark:bg-[#141E16] shadow-sm space-y-5">
                      <div className="space-y-3 pb-5 border-b border-[#E0D9CB] dark:border-[#243628]">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#D99B26]/15 text-[#D99B26] border border-[#D99B26]/30">
                            {selectedJob.department || t('إدارة متخصصة', 'Specialized Dept')}
                          </span>
                          <span className="text-[11px] font-mono text-[#5C665E] dark:text-[#8FA392]">
                            #{selectedJob.code}
                          </span>
                        </div>

                        <h1 className="text-xl font-black text-[#1A241C] dark:text-[#F3EFE6] leading-tight">
                          {isRtl ? selectedJob.title : selectedJob.titleEn || selectedJob.title}
                        </h1>

                        {selectedJob.companyName && (
                          <div className="flex items-center gap-2 text-xs text-[#5C665E] dark:text-[#8FA392]">
                            <Building2 className="w-4 h-4 text-[#D99B26]" />
                            <span>{selectedJob.companyName}</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-2xl bg-[#FBF9F5] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628]">
                          <div className="flex items-center gap-1.5 text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                            <MapPin className="w-3.5 h-3.5 text-[#D99B26]" />
                            <span>{t('الموقع', 'Location')}</span>
                          </div>
                          <p className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mt-1">
                            {selectedJob.location || t('القاهرة، مصر', 'Cairo, Egypt')}
                          </p>
                        </div>

                        <div className="p-3 rounded-2xl bg-[#FBF9F5] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628]">
                          <div className="flex items-center gap-1.5 text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                            <Clock className="w-3.5 h-3.5 text-[#D99B26]" />
                            <span>{t('نوع التعاقد', 'Job Type')}</span>
                          </div>
                          <p className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mt-1">
                            {selectedJob.employmentType === 'remote'
                              ? t('عن بُعد', 'Remote')
                              : selectedJob.employmentType === 'hybrid'
                                ? t('هجين', 'Hybrid')
                                : t('دوام كامل', 'Full Time')}
                          </p>
                        </div>

                        <div className="p-3 rounded-2xl bg-[#FBF9F5] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628]">
                          <div className="flex items-center gap-1.5 text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                            <Coins className="w-3.5 h-3.5 text-[#D99B26]" />
                            <span>{t('نطاق الراتب', 'Salary Range')}</span>
                          </div>
                          <p className="text-xs font-bold text-[#059669] dark:text-emerald-400 mt-1">
                            {selectedJob.budgetMin
                              ? `${selectedJob.budgetMin.toLocaleString()} - ${selectedJob.budgetMax.toLocaleString()} ${selectedJob.currency || 'EGP'}`
                              : t('يحدد حسب الخبرة', 'Competitive')}
                          </p>
                        </div>

                        <div className="p-3 rounded-2xl bg-[#FBF9F5] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628]">
                          <div className="flex items-center gap-1.5 text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                            <Award className="w-3.5 h-3.5 text-[#D99B26]" />
                            <span>{t('سنوات الخبرة', 'Experience')}</span>
                          </div>
                          <p className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mt-1">
                            {selectedJob.experienceYearsMin || 2} - {selectedJob.experienceYearsMax || 6}{' '}
                            {t('سنوات', 'years')}
                          </p>
                        </div>
                      </div>

                      {selectedJob.skills && selectedJob.skills.length > 0 && (
                        <div className="pt-2 space-y-2.5">
                          <h4 className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-[#D99B26]" />
                            <span>{t('المهارات المطلوبة للشاغر', 'Required Skills')}</span>
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedJob.skills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-[#D99B26]/10 text-[#1A241C] dark:text-[#F3EFE6] border border-[#D99B26]/25"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className={selectedJob ? 'lg:col-span-8' : 'lg:col-span-12'}>
                  <TarabotApplicationFormView
                    mode="public"
                    initialJobTitle={selectedJob?.title || ''}
                    initialDepartment={selectedJob?.department || ''}
                    isSubmitting={isSubmitting}
                    onSubmit={handleTarabotPublicSubmit}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW B: ALL OPENINGS CATALOG & DIRECT TARABOT FORM LAUNCHER               */
          /* ========================================================================= */
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 border border-[#D99B26]/30 bg-gradient-to-l from-[#F3EFE6] via-[#FBF9F5] to-[#FFFFFF] dark:from-[#121B14] dark:via-[#141E16] dark:to-[#0E1610] text-center shadow-sm">
              <div className="relative z-10 max-w-3xl mx-auto space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D99B26]/15 border border-[#D99B26]/30 text-[#1A241C] dark:text-[#EBB34D] text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-[#D99B26]" />
                  <span>
                    {t(
                      'شركة ترابط للإستثمارات و المشروعات (ش.م.م) — التوظيف المباشر',
                      'Tarabot Company Investment & Projects — Careers Hub'
                    )}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#1A241C] dark:text-[#F3EFE6] leading-tight">
                  {t('بوابة الوظائف الشاغرة واستمارة طلب التوظيف الرسمية', 'Available Vacancies & Official Job Application')}
                </h1>

                <p className="text-xs sm:text-sm text-[#5C665E] dark:text-[#8FA392] leading-relaxed">
                  {t(
                    'يمكنك التقديم على أحد الشواغر المتاحة أدناه، أو تعبئة استمارة طلب التوظيف الرسمية لشركة ترابط مباشرة لإدراج بياناتك في قاعدة الكفاءات والموارد البشرية.',
                    'Apply directly to any open vacancy below, or submit the official Tarabot Employment Application Form directly.'
                  )}
                </p>

                {/* Primary CTA: Direct Tarabot Application Form */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleStartGeneralApplication}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#D99B26] to-[#EBB34D] hover:brightness-105 text-[#1A241C] font-black text-sm shadow-lg shadow-[#D99B26]/25 transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{t('ملء استمارة طلب توظيف شركة ترابط مباشرة', 'Fill Official Tarabot Job Application')}</span>
                  </button>
                </div>

                {/* Live Search & Filter Bar */}
                <div className="pt-3 flex flex-col sm:flex-row items-center gap-2.5 max-w-2xl mx-auto">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-[#5C665E] dark:text-[#8FA392] absolute start-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={t(
                        'ابحث باسم الوظيفة، الإدارة، أو المهارة المطلوبة...',
                        'Search job title, dept, or skill...'
                      )}
                      className="w-full ps-10 pe-4 py-2.5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FFFFFF] dark:bg-[#17231A] text-xs font-medium text-[#1A241C] dark:text-[#F3EFE6] placeholder-[#8FA392] focus:outline-none focus:ring-2 focus:ring-[#D99B26]"
                    />
                  </div>

                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="px-4 py-2.5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FFFFFF] dark:bg-[#17231A] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:ring-2 focus:ring-[#D99B26] shrink-0"
                  >
                    <option value="all">{t('كافة الإدارات والقطاعات', 'All Departments')}</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Openings Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#D99B26]" />
                  <span>{t('الوظائف المتاحة حالياً للتقديم', 'Active Job Vacancies')}</span>
                </h3>
                <span className="text-xs font-bold text-[#059669] dark:text-emerald-400 font-mono">
                  {filteredJobs.length} {t('وظيفة معتمدة', 'positions')}
                </span>
              </div>

              {loading ? (
                <div className="py-16 text-center">
                  <div className="w-8 h-8 mx-auto border-2 border-[#D99B26] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-[#5C665E] dark:text-[#8FA392] mt-3 font-medium">
                    {t('جاري تحميل الشواغر الوظيفية المعتمدة...', 'Loading verified job postings...')}
                  </p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="p-10 rounded-3xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FFFFFF] dark:bg-[#141E16] text-center space-y-4">
                  <Briefcase className="w-10 h-10 mx-auto text-[#D99B26] opacity-60" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                      {t('لا توجد شواغر منشورة حالياً، يمكنك التقديم عبر استمارة التوظيف العامة', 'No published vacancies — use the general Tarabot form')}
                    </p>
                    <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                      {t('اضغط أدناه لملء طلب توظيف شركة ترابط الرسمي وسنتواصل معك فور توفر فرصة مناسبة.', 'Click below to fill out the official Tarabot Job Application Form.')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartGeneralApplication}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{t('فتح استمارة طلب التوظيف الرسمية', 'Open Official Application Form')}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredJobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => handleSelectJob(job)}
                      className="p-6 rounded-3xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FFFFFF] dark:bg-[#141E16] hover:border-[#D99B26] transition-all duration-200 flex flex-col justify-between group hover:shadow-lg cursor-pointer"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-2">
                          <span className="px-2.5 py-1 rounded-xl text-[10.5px] font-bold bg-[#D99B26]/10 text-[#D99B26] border border-[#D99B26]/25">
                            {job.department || t('إدارة عامة', 'General Dept')}
                          </span>
                          <span className="text-[10px] font-mono text-[#5C665E] dark:text-[#8FA392]">
                            #{job.code}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-base font-black text-[#1A241C] dark:text-[#F3EFE6] group-hover:text-[#D99B26] transition-colors">
                            {isRtl ? job.title : job.titleEn || job.title}
                          </h4>
                          {job.companyName && (
                            <p className="text-xs text-[#5C665E] dark:text-[#8FA392] mt-1 flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-[#D99B26]" />
                              <span>{job.companyName}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#5C665E] dark:text-[#8FA392]">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#D99B26]" />
                            <span>{job.location || t('القاهرة', 'Cairo')}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#D99B26]" />
                            <span>
                              {job.employmentType === 'remote' ? t('عن بعد', 'Remote') : t('دوام كامل', 'Full Time')}
                            </span>
                          </span>
                        </div>

                        {job.skills && job.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {job.skills.slice(0, 3).map((s, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] border border-[#E0D9CB] dark:border-[#243628]"
                              >
                                {s}
                              </span>
                            ))}
                            {job.skills.length > 3 && (
                              <span className="text-[10px] font-bold text-[#D99B26]">
                                +{job.skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-5 mt-4 border-t border-[#E0D9CB] dark:border-[#243628] flex items-center justify-between">
                        <span className="text-xs font-bold text-[#059669] dark:text-emerald-400">
                          {job.budgetMin
                            ? `${job.budgetMin.toLocaleString()} - ${job.budgetMax.toLocaleString()} ${job.currency || 'EGP'}`
                            : t('راتب تنافسي', 'Competitive')}
                        </span>

                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#D99B26]">
                          <span>{t('فتح الاستمارة والتقديم', 'Apply via Form')}</span>
                          {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {showPrintModal && submittedCandidate && (
        <TarabotPrintableApplicationModal
          candidate={submittedCandidate}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
};
