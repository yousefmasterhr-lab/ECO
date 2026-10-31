import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  MapPin,
  Building2,
  Sparkles,
  Send,
  Sun,
  Moon,
  Search,
  CheckCircle2,
  Clock,
  Coins,
  Award,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Phone,
  Mail,
  User,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import { atsStorage } from '../../../services/atsStorage';
import { JobRequisition, Candidate } from './types';
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
  const utmSource = searchParams.get('utm_source') || 'careers_portal';
  const utmMedium = searchParams.get('utm_medium') || 'web_direct';
  const utmCampaign = searchParams.get('utm_campaign') || 'talent_sourcing';
  const referralName = searchParams.get('ref') || searchParams.get('referral') || '';

  // State
  const [jobs, setJobs] = useState<JobRequisition[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobRequisition | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  // Candidate Application Form
  const [candName, setCandName] = useState('');
  const [candEmail, setCandEmail] = useState('');
  const [candPhone, setCandPhone] = useState('');
  const [candLocation, _setCandLocation] = useState('القاهرة، مصر');
  const [candCurrentTitle, setCandCurrentTitle] = useState('');
  const [candCompany, setCandCompany] = useState('');
  const [candExpYears, setCandExpYears] = useState<number>(4);
  const [candExpectedSalary, setCandExpectedSalary] = useState<number>(45000);
  const [candNoticeDays, setCandNoticeDays] = useState<number>(30);
  const [candSkills, setCandSkills] = useState('');
  const [candSummary, setCandSummary] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [knockoutAnswers, setKnockoutAnswers] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  // Load published jobs from storage / D1
  useEffect(() => {
    let isMounted = true;
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await atsStorage.getJobs();
        if (!isMounted) return;
        setJobs(data);

        // If jobId passed in query, find and select it
        if (paramJobId) {
          const matched = data.find(j => j.id === paramJobId || j.code === paramJobId);
          if (matched) {
            setSelectedJob(matched);
            setCandSkills((matched.skills || []).slice(0, 4).join(', '));
            if (matched.budgetMin && matched.budgetMax) {
              setCandExpectedSalary(Math.round((matched.budgetMin + matched.budgetMax) / 2));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load jobs', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchJobs();
    return () => { isMounted = false; };
  }, [paramJobId]);

  // Handle job card selection
  const handleSelectJob = (job: JobRequisition) => {
    setSelectedJob(job);
    setCandSkills((job.skills || []).slice(0, 4).join(', '));
    if (job.budgetMin && job.budgetMax) {
      setCandExpectedSalary(Math.round((job.budgetMin + job.budgetMax) / 2));
    }
    setSubmittedRef(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter published jobs
  const departments = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach(j => {
      if (j.department) set.add(j.department);
    });
    return Array.from(set);
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      const matchSearch =
        !searchTerm ||
        j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (j.titleEn && j.titleEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (j.department && j.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (j.skills && j.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchDept = selectedDept === 'all' || j.department === selectedDept;
      return matchSearch && matchDept;
    });
  }, [jobs, searchTerm, selectedDept]);

  // Handle application submission
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !candName || !candEmail || !candPhone) return;

    setIsSubmitting(true);

    try {
      const skillsArray = candSkills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const jobSkills = selectedJob.skills || [];
      const matched = skillsArray.filter(s =>
        jobSkills.some(js => js.toLowerCase().includes(s.toLowerCase()))
      );

      const matchScore = Math.min(
        98,
        Math.max(65, Math.round((matched.length / Math.max(1, jobSkills.length)) * 100) + 18)
      );

      const refNumber = `APP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      const newCandidate: Candidate = {
        id: `cand_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: candName,
        nameEn: candName,
        email: candEmail,
        phone: candPhone,
        avatar: '',
        location: candLocation,
        currentTitle: candCurrentTitle || selectedJob.title,
        currentCompany: candCompany || 'شركة سابقة',
        experienceYears: Number(candExpYears),
        education: 'مؤهل جامعي معتمد',
        expectedSalary: Number(candExpectedSalary),
        currency: selectedJob.currency || 'EGP',
        noticePeriodDays: Number(candNoticeDays),
        source: utmSource as any,
        utmSource,
        utmCampaign,
        referralEmployeeName: referralName || undefined,
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        jobDepartment: selectedJob.department,
        companyId: selectedJob.companyId,
        companyName: selectedJob.companyName,
        stage: 'applied',
        status: 'active',
        matchScore,
        rating: 4.5,
        tags: [
          utmSource,
          'تقديم عبر البوابة الخارجية',
          referralName ? `إحالة: ${referralName}` : 'إعلان توظيف خارجي'
        ],
        parsedResume: {
          summary:
            candSummary ||
            `مرشح تقدم مباشرة عبر بوابة التوظيف الرسمية (${utmSource}) لشغل وظيفة ${selectedJob.title}. يمتلك خبرة ${candExpYears} سنوات.`,
          extractedSkills: skillsArray.length > 0 ? skillsArray : jobSkills,
          matchedSkills: matched.length > 0 ? matched : jobSkills.slice(0, 3),
          missingSkills: jobSkills.filter(s => !matched.includes(s)),
          education: 'بكالوريوس هندسة / حاسبات / إدارة أعمال',
          experienceSummary: `خبرة عملية ${candExpYears} سنوات`,
          yearsOfExperience: Number(candExpYears),
          languages: ['العربية (اللغة الأم)', 'الإنجليزية (متقدم)'],
          certifications: ['شهادات مهنية معتمدة'],
        },
        knockoutResults: ((selectedJob as any).knockoutRules || (selectedJob as any).knockoutQuestions || []).map((q: any) => ({
          questionId: q.id,
          question: q.question,
          answer: knockoutAnswers[q.id] || 'نعم، مطابق للشروط',
          passed: true,
        })),
        notes: [
          {
            id: `note_${Date.now()}`,
            authorId: 'system_portal',
            authorName: 'بوابة التوظيف الرقمية',
            content: `تم استلام الطلب برقم مرجعي: ${refNumber}. القناة المصدر: ${utmSource} / ${utmMedium} / ${utmCampaign}${referralName ? ` (إحالة الموظف: ${referralName})` : ''}`,
            createdAt: new Date().toISOString(),
            isPrivate: false,
          }
        ],
        activities: [
          {
            id: `act_${Date.now()}`,
            type: 'stage_change',
            title: 'تم استلام طلب التقديم',
            titleEn: 'Application Submitted via Careers Portal',
            description: `تم تسجيل طلب المترشح برقم مرجعي ${refNumber} بنجاح`,
            performedBy: 'بوابة التوظيف الذكية',
            timestamp: new Date().toISOString(),
          }
        ],
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await atsStorage.saveCandidate(newCandidate);

      setSubmittedRef(refNumber);
      fireConfetti();
    } catch (err) {
      console.error('Error submitting application', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResumeSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFileName(e.target.files[0].name);
    }
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`min-h-screen w-full font-sans transition-colors duration-300 ${isDark ? 'bg-[#060D08] text-stone-100' : 'bg-[#FFFDF9] text-slate-900'
        }`}
    >
      {/* 1. Public Header Bar */}
      <header
        className={`sticky top-0 z-50 w-full backdrop-blur-xl border-b transition-colors ${isDark
          ? 'bg-[#060D08]/90 border-amber-500/20 shadow-lg shadow-black/40'
          : 'bg-[#FFFDF9]/90 border-amber-200/50 shadow-sm shadow-amber-900/5'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3.5">
            <EcoOfficialLogo size="md" className="shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wider bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 bg-clip-text text-transparent">
                  ECO
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {t('بوابة التوظيف الرسمية', 'Official Careers Portal')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-stone-400 font-medium">
                {t('منظومة استقطاب الكفاءات والوظائف الشاغرة', 'Enterprise Talent Acquisition Hub')}
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switch */}
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${isDark
                ? 'border-stone-800 hover:bg-stone-800 text-stone-200'
                : 'border-amber-200 hover:bg-amber-100/50 text-slate-800'
                }`}
            >
              {language === 'ar' ? 'English' : 'عربي'}
            </button>

            {/* Dark / Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-colors ${isDark
                ? 'border-stone-800 hover:bg-stone-800 text-amber-400'
                : 'border-amber-200 hover:bg-amber-100/50 text-slate-800'
                }`}
              title={t('تبديل وضع العرض', 'Toggle Theme')}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Sign In to ERP Link */}
            <a
              href="/"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/20 transition-all hover:scale-102"
            >
              <span>{t('تسجيل الدخول للنظام', 'ERP Login')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* 2. Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {selectedJob ? (
          /* ========================================================================= */
          /* VIEW A: SPECIFIC JOB DETAILS & APPLICATION FORM */
          /* ========================================================================= */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Back Button */}
            <button
              onClick={() => {
                setSelectedJob(null);
                setSubmittedRef(null);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-amber-200/60 dark:border-stone-800 hover:bg-amber-100/40 dark:hover:bg-stone-800/60 transition-colors"
            >
              {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              <span>{t('العودة لكافة الوظائف الشاغرة', 'Back to All Job Openings')}</span>
            </button>

            {submittedRef ? (
              /* Success Confirmation Card */
              <div
                className={`p-8 sm:p-12 rounded-3xl border text-center space-y-6 shadow-2xl ${isDark
                  ? 'bg-gradient-to-b from-[#0F2618] to-[#0A180F] border-emerald-500/40 text-stone-100'
                  : 'bg-gradient-to-b from-amber-50/70 to-emerald-50/40 border-emerald-300/60 text-slate-900'
                  }`}
              >
                <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2 max-w-lg mx-auto">
                  <h2 className="text-2xl sm:text-3xl font-black">
                    {t('تم استلام طلبك بنجاح!', 'Application Received Successfully!')}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-stone-300 leading-relaxed">
                    {t(
                      'شكراً لاهتمامك بالانضمام إلى فريقنا. تم تسجيل ملفك وسيرتك الذاتية في منظومة الموارد البشرية وستقوم لجنة الفرز بمراجعة بياناتك والتواصل معك.',
                      'Thank you for your interest. Your profile has been registered in our recruitment system. Our team will review your application and reach out shortly.'
                    )}
                  </p>
                </div>

                {/* Application Reference Pill */}
                <div className="inline-flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-white/80 dark:bg-black/40 border border-emerald-500/30">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400">
                    {t('الرقم المرجعي لمتابعة الطلب:', 'Application Reference Number:')}
                  </span>
                  <span className="text-xl sm:text-2xl font-black font-mono tracking-wider text-emerald-600 dark:text-emerald-400">
                    {submittedRef}
                  </span>
                </div>

                <div>
                  <button
                    onClick={() => {
                      setSelectedJob(null);
                      setSubmittedRef(null);
                    }}
                    className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-lg shadow-amber-500/25 transition-all"
                  >
                    {t('استعراض وظائف أخرى', 'Explore More Opportunities')}
                  </button>
                </div>
              </div>
            ) : (
              /* Two-Column Grid: Left Details & Right Form */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Job Description & Highlights (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  <div
                    className={`p-6 sm:p-7 rounded-3xl border shadow-lg ${isDark
                      ? 'bg-[#0E1A11] border-amber-500/20'
                      : 'bg-[#FFFDF9] border-amber-200/60 shadow-amber-900/5'
                      }`}
                  >
                    {/* Header */}
                    <div className="space-y-3 pb-6 border-b border-amber-200/40 dark:border-stone-800">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          {selectedJob.department || t('إدارة متخصصة', 'Specialized Dept')}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 dark:text-stone-400">
                          #{selectedJob.code}
                        </span>
                      </div>

                      <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                        {isRtl ? selectedJob.title : (selectedJob.titleEn || selectedJob.title)}
                      </h1>

                      {selectedJob.companyName && (
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-stone-400">
                          <Building2 className="w-4 h-4 text-amber-500" />
                          <span>{selectedJob.companyName}</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-3 py-6 border-b border-amber-200/40 dark:border-stone-800">
                      <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-stone-400">
                          <MapPin className="w-3.5 h-3.5 text-amber-500" />
                          <span>{t('الموقع', 'Location')}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-stone-200 mt-1">
                          {selectedJob.location || t('القاهرة، مصر', 'Cairo, Egypt')}
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-stone-400">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>{t('نوع التعاقد', 'Job Type')}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-stone-200 mt-1">
                          {selectedJob.employmentType === 'remote'
                            ? t('عن بُعد', 'Remote')
                            : selectedJob.employmentType === 'hybrid'
                              ? t('هجين (مكتبي وعن بعد)', 'Hybrid')
                              : t('دوام كامل', 'Full Time')}
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-stone-400">
                          <Coins className="w-3.5 h-3.5 text-amber-500" />
                          <span>{t('نطاق الراتب', 'Salary Range')}</span>
                        </div>
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                          {selectedJob.budgetMin
                            ? `${selectedJob.budgetMin.toLocaleString()} - ${selectedJob.budgetMax.toLocaleString()} ${selectedJob.currency || 'EGP'}`
                            : t('يحدد حسب الخبرة', 'Competitive')}
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-stone-400">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          <span>{t('سنوات الخبرة', 'Experience')}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-stone-200 mt-1">
                          {selectedJob.experienceYearsMin || 2} - {selectedJob.experienceYearsMax || 6} {t('سنوات', 'years')}
                        </p>
                      </div>
                    </div>

                    {/* Skills Tags */}
                    {selectedJob.skills && selectedJob.skills.length > 0 && (
                      <div className="pt-6 space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>{t('المهارات والتقنيات المطلوبة', 'Required Skills & Tech')}</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedJob.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Application Form (7 cols) */}
                <div className="lg:col-span-7">
                  <div
                    className={`p-6 sm:p-8 rounded-3xl border shadow-xl ${isDark
                      ? 'bg-[#0E1A11] border-amber-500/20'
                      : 'bg-[#FFFDF9] border-amber-200/60 shadow-amber-900/5'
                      }`}
                  >
                    <div className="flex items-center justify-between pb-6 mb-6 border-b border-amber-200/40 dark:border-stone-800">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">
                          {t('نموذج التقديم المباشر على الوظيفة', 'Direct Job Application')}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-stone-400 mt-0.5">
                          {t('املأ البيانات التالية بعناية ليتم تسجيل ترشيحك فورياً', 'Fill out your details to submit your application directly')}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                        <Send className="w-5 h-5" />
                      </div>
                    </div>

                    <form onSubmit={handleSubmitApplication} className="space-y-4 sm:space-y-5">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1.5">
                          {t('الاسم الثلاثي أو الرباعي بالكامل *', 'Full Name *')}
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute start-3 top-3.5 pointer-events-none" />
                          <input
                            type="text"
                            required
                            value={candName}
                            onChange={e => setCandName(e.target.value)}
                            placeholder={t('مثال: أحمد محمود علي', 'e.g. John Doe')}
                            className="w-full ps-10 pe-3.5 py-2.5 rounded-xl border border-amber-200/70 dark:border-stone-800 bg-white dark:bg-[#121F16] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>

                      {/* Contact: Email & Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1.5">
                            {t('البريد الإلكتروني *', 'Email Address *')}
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute start-3 top-3.5 pointer-events-none" />
                            <input
                              type="email"
                              required
                              value={candEmail}
                              onChange={e => setCandEmail(e.target.value)}
                              placeholder="name@example.com"
                              className="w-full ps-10 pe-3.5 py-2.5 rounded-xl border border-amber-200/70 dark:border-stone-800 bg-white dark:bg-[#121F16] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1.5">
                            {t('رقم الهاتف / واتساب *', 'Phone / WhatsApp *')}
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-slate-400 absolute start-3 top-3.5 pointer-events-none" />
                            <input
                              type="tel"
                              required
                              value={candPhone}
                              onChange={e => setCandPhone(e.target.value)}
                              placeholder="+20 100 123 4567"
                              className="w-full ps-10 pe-3.5 py-2.5 rounded-xl border border-amber-200/70 dark:border-stone-800 bg-white dark:bg-[#121F16] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Current Title & Company */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1.5">
                            {t('المسمى الوظيفي الحالي / الأخير', 'Current Job Title')}
                          </label>
                          <input
                            type="text"
                            value={candCurrentTitle}
                            onChange={e => setCandCurrentTitle(e.target.value)}
                            placeholder={t('مثال: مهندس برمجيات أول', 'e.g. Senior Software Engineer')}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200/70 dark:border-stone-800 bg-white dark:bg-[#121F16] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1.5">
                            {t('جهة العمل الحالية / السابقة', 'Current / Last Company')}
                          </label>
                          <input
                            type="text"
                            value={candCompany}
                            onChange={e => setCandCompany(e.target.value)}
                            placeholder={t('اسم الشركة أو المؤسسة', 'Company name')}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200/70 dark:border-stone-800 bg-white dark:bg-[#121F16] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>

                      {/* Experience, Notice Period & Expected Salary */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1.5">
                            {t('سنوات الخبرة', 'Experience (Years)')}
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="40"
                            value={candExpYears}
                            onChange={e => setCandExpYears(Number(e.target.value))}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200/70 dark:border-stone-800 bg-white dark:bg-[#121F16] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1.5">
                            {t('فترة الإخطار (بالأيام)', 'Notice Period (Days)')}
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="180"
                            value={candNoticeDays}
                            onChange={e => setCandNoticeDays(Number(e.target.value))}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200/70 dark:border-stone-800 bg-white dark:bg-[#121F16] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1.5">
                            {t('الراتب الشهري المتوقع', 'Expected Salary')}
                          </label>
                          <input
                            type="number"
                            step="1000"
                            value={candExpectedSalary}
                            onChange={e => setCandExpectedSalary(Number(e.target.value))}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200/70 dark:border-stone-800 bg-white dark:bg-[#121F16] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>

                      {/* Technical Skills */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1.5">
                          {t('أبرز المهارات والتقنيات التي تتقنها (مفصولة بفاصلة)', 'Core Skills (Comma separated)')}
                        </label>
                        <input
                          type="text"
                          value={candSkills}
                          onChange={e => setCandSkills(e.target.value)}
                          placeholder="React, TypeScript, Cloud Architecture, Leadership"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200/70 dark:border-stone-800 bg-white dark:bg-[#121F16] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      {/* Cover Letter / Summary */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1.5">
                          {t('نبذة تعريفية أو خطاب تقديم (Cover Letter)', 'Brief Summary / Cover Letter')}
                        </label>
                        <textarea
                          rows={3}
                          value={candSummary}
                          onChange={e => setCandSummary(e.target.value)}
                          placeholder={t('اكتب نبذة مختصرة عن أبرز إنجازاتك ولماذا تعتبر نفسك مناسباً لهذا المنصب...', 'Share your key achievements and why you fit this role...')}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200/70 dark:border-stone-800 bg-white dark:bg-[#121F16] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                        />
                      </div>

                      {/* Resume Upload Pill */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1.5">
                          {t('تحميل السيرة الذاتية (PDF, Word)', 'Attach Resume (PDF, Word)')}
                        </label>
                        <label className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-amber-200/80 dark:border-stone-800 hover:border-amber-500 bg-amber-500/5 cursor-pointer transition-colors">
                          <UploadCloud className="w-5 h-5 text-amber-500" />
                          <span className="text-xs font-bold text-slate-700 dark:text-stone-300">
                            {resumeFileName || t('اختر ملف السيرة الذاتية من جهازك', 'Choose file from your device')}
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleResumeSimulatedUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Knockout Questions if any */}
                      {Boolean((selectedJob as any).knockoutRules?.length || (selectedJob as any).knockoutQuestions?.length) && (
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                          <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-amber-500" />
                            <span>{t('أسئلة التأهيل المبدئي للشواغر', 'Initial Screening Questions')}</span>
                          </h4>
                          {(((selectedJob as any).knockoutRules || (selectedJob as any).knockoutQuestions || []) as any[]).map((q: any) => (
                            <div key={q.id} className="space-y-1">
                              <p className="text-xs font-medium text-slate-800 dark:text-stone-200">
                                {q.question}
                              </p>
                              <select
                                value={knockoutAnswers[q.id] || 'نعم'}
                                onChange={e => setKnockoutAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                className="w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-[#121F16] border border-amber-200/70 dark:border-stone-800 text-slate-900 dark:text-white"
                              >
                                <option value="نعم">{t('نعم، مطابق للشروط تماماً', 'Yes, fully qualified')}</option>
                                <option value="لا">{t('لا، غير مطابق', 'No')}</option>
                              </select>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-sm shadow-xl shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{t('جاري تسجيل طلبك في المنظومة...', 'Submitting Application...')}</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>{t('إرسال طلب التقديم فورياً', 'Submit Application Now')}</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW B: ALL OPENINGS CATALOG & HERO BANNER */
          /* ========================================================================= */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Hero Banner */}
            <div
              className={`relative overflow-hidden rounded-3xl p-8 sm:p-12 border text-center shadow-xl ${isDark
                ? 'bg-gradient-to-br from-[#0F2618] via-[#142A1D] to-[#0A180F] border-[#1D3324] text-white'
                : 'bg-gradient-to-br from-[#FFFDF9] via-amber-50/70 to-amber-100/40 border-amber-200/60 text-slate-900'
                }`}
            >
              <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('انضم إلى فريق النخبة واصنع الفارق', 'Join Our Elite Team & Shape The Future')}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  {t('بوابة الوظائف الشاغرة والفرص الواعدة', 'Available Career Opportunities')}
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-[#97A69B] leading-relaxed">
                  {t(
                    'استكشف الشواغر الوظيفية المتاحة في مختلف شركات وقطاعات المجموعة، وقدم سيرتك الذاتية مباشرة ليتم فحصها والتواصل معك.',
                    'Explore active job openings across group entities and submit your resume directly for automated review and consideration.'
                  )}
                </p>

                {/* Live Search & Filter Bar */}
                <div className="pt-4 flex flex-col sm:flex-row items-center gap-2.5">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder={t('ابحث باسم الوظيفة، الإدارة، أو المهارة المطلوبة...', 'Search job title, dept, or skill...')}
                      className={`w-full ps-10 pe-4 py-2.5 rounded-2xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 ${isDark
                        ? 'bg-[#121F16] border-stone-800 text-white placeholder-stone-400'
                        : 'bg-white border-amber-200/80 text-slate-900 placeholder-slate-400 shadow-sm'
                        }`}
                    />
                  </div>

                  <select
                    value={selectedDept}
                    onChange={e => setSelectedDept(e.target.value)}
                    className={`px-4 py-2.5 rounded-2xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 shrink-0 ${isDark
                      ? 'bg-[#121F16] border-stone-800 text-white'
                      : 'bg-white border-amber-200/80 text-slate-900 shadow-sm'
                      }`}
                  >
                    <option value="all">{t('كافة الإدارات والقطاعات', 'All Departments')}</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Openings Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-500" />
                  <span>{t('الوظائف المتاحة حالياً للتقديم', 'Active Job Vacancies')}</span>
                </h3>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                  {filteredJobs.length} {t('وظيفة معتمدة', 'positions')}
                </span>
              </div>

              {loading ? (
                <div className="py-16 text-center">
                  <div className="w-8 h-8 mx-auto border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-500 dark:text-stone-400 mt-3 font-medium">
                    {t('جاري تحميل الشواغر الوظيفية المعتمدة...', 'Loading verified job postings...')}
                  </p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div
                  className={`p-12 rounded-3xl border text-center space-y-3 ${isDark ? 'bg-[#0E1A11] border-stone-800' : 'bg-white border-amber-200/60'
                    }`}
                >
                  <Briefcase className="w-10 h-10 mx-auto text-amber-500 opacity-40" />
                  <p className="text-sm font-bold text-slate-700 dark:text-stone-300">
                    {t('لا توجد شواغر مطابقة لمعايير البحث الحالية', 'No vacancies match your search criteria')}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-stone-400">
                    {t('جرّب إعادة ضبط كلمات البحث أو اختيار كافة الإدارات', 'Try clearing your search terms or picking all departments')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredJobs.map(job => (
                    <div
                      key={job.id}
                      className={`p-6 rounded-3xl border transition-all duration-200 flex flex-col justify-between group hover:shadow-xl hover:scale-101 cursor-pointer ${isDark
                        ? 'bg-[#0E1A11] border-amber-500/20 hover:border-amber-500/50'
                        : 'bg-white border-amber-200/60 hover:border-amber-400 shadow-sm shadow-amber-900/5'
                        }`}
                      onClick={() => handleSelectJob(job)}
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-2">
                          <span className="px-2.5 py-1 rounded-xl text-[10.5px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            {job.department || t('إدارة عامة', 'General Dept')}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 dark:text-stone-500">
                            #{job.code}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-base font-black text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                            {isRtl ? job.title : (job.titleEn || job.title)}
                          </h4>
                          {job.companyName && (
                            <p className="text-xs text-slate-500 dark:text-stone-400 mt-1 flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-amber-500" />
                              <span>{job.companyName}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-stone-300">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-amber-500" />
                            <span>{job.location || t('القاهرة', 'Cairo')}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
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
                                className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-amber-500/5 text-slate-700 dark:text-stone-300 border border-amber-500/15"
                              >
                                {s}
                              </span>
                            ))}
                            {job.skills.length > 3 && (
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                +{job.skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-6 mt-4 border-t border-amber-200/40 dark:border-stone-800 flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {job.budgetMin
                            ? `${job.budgetMin.toLocaleString()} - ${job.budgetMax.toLocaleString()} ${job.currency || 'EGP'}`
                            : t('راتب تنافسي', 'Competitive')}
                        </span>

                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                          <span>{t('تفاصيل والتقديم', 'View & Apply')}</span>
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
    </div>
  );
};
