import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Sparkles,
  Trash2,
  Eye,
  X,
  FilePlus2,
  FileText,
  CheckCircle2,
  UserCheck,
  Download,
  Paperclip,
  MessageCircle,
  Mail,
  Link2,
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useTenant } from '../../../context/TenantContext';
import { atsStorage } from '../../../services/atsStorage';
import { Candidate, DEFAULT_STAGES, TarabotApplicationForm } from './types';
import {
  TarabotApplicationFormView,
  TarabotPrintableApplicationModal,
} from './TarabotApplicationFormView';

interface ATSCandidatesTabProps {
  companyId?: string;
}

export const ATSCandidatesTab: React.FC<ATSCandidatesTabProps> = ({ companyId }) => {
  const { t } = useLanguage();
  const { activeCompany } = useTenant();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'paper_digitization' | 'portal'>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Internal Digitization & Official Printable Application Modal
  const [showDigitizeModal, setShowDigitizeModal] = useState(false);
  const [isDigitizing, setIsDigitizing] = useState(false);
  const [printableCandidate, setPrintableCandidate] = useState<Candidate | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const data = await atsStorage.getCandidates(companyId);
      setCandidates(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
    const handleUpdate = () => loadCandidates();
    window.addEventListener('eco-ats-updated', handleUpdate);
    return () => window.removeEventListener('eco-ats-updated', handleUpdate);
  }, [companyId]);

  const handleDeleteCandidate = async (candidateId: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف ملف هذا المرشح نهائياً؟')) return;
    await atsStorage.deleteCandidate(candidateId);
    if (selectedCandidate?.id === candidateId) setSelectedCandidate(null);
    if (printableCandidate?.id === candidateId) setPrintableCandidate(null);
  };

  const handleInternalDigitizeSubmit = async (
    form: TarabotApplicationForm,
    saveTarget: 'candidate_only' | 'direct_hire_employee'
  ) => {
    setIsDigitizing(true);
    try {
      const targetCompanyName =
        form.companyName?.trim() ||
        activeCompany?.nameAr ||
        atsStorage.getPortalConfigSync().companyNameAr ||
        'الشركة المسجلة';

      const result = await atsStorage.submitTarabotApplication(
        {
          ...form,
          companyName: targetCompanyName,
          entryChannel: 'internal_digitization',
        },
        {
          mode: saveTarget,
          companyId: activeCompany?.id || companyId || 'comp_01',
          companyName: targetCompanyName,
          utmSource: 'paper_digitization',
          utmCampaign: 'backlog_digitization',
          actorName: 'إدارة الموارد البشرية',
        }
      );

      setShowDigitizeModal(false);
      await loadCandidates();

      if (saveTarget === 'direct_hire_employee' && result.offer) {
        setStatusBanner(
          `تم تفريغ استمارة (${form.fullName}) وتحويله إلى مرحلة العرض الوظيفي وإصدار العرض رقم ${result.offer.id} بنجاح.`
        );
      } else {
        setStatusBanner(
          `تم حفظ وتفريغ طلب توظيف (${form.fullName}) في قاعدة بيانات المتقدمين برقم قيد ${result.refNumber}.`
        );
      }
      setTimeout(() => setStatusBanner(null), 6500);
    } finally {
      setIsDigitizing(false);
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.currentTitle.toLowerCase().includes(q) ||
      c.jobTitle.toLowerCase().includes(q) ||
      (c.nationalId || '').includes(q) ||
      (c.phone || '').includes(q) ||
      c.email.toLowerCase().includes(q);
    const matchesStage = stageFilter === 'all' || c.stage === stageFilter;
    const matchesSource =
      sourceFilter === 'all'
        ? true
        : sourceFilter === 'paper_digitization'
          ? c.source === 'paper_digitization' ||
            c.applicationForm?.entryChannel === 'internal_digitization'
          : c.source !== 'paper_digitization' &&
            c.applicationForm?.entryChannel !== 'internal_digitization';
    const matchesComp =
      !companyId ||
      companyId === 'all' ||
      !c.companyId ||
      c.companyId === 'all' ||
      c.companyId === 'comp_01' ||
      c.companyId === 'comp_1' ||
      c.companyId === companyId;
    return matchesSearch && matchesStage && matchesSource && matchesComp;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-gradient-to-l from-[#F3EFE6] via-[#FBF9F5] to-[#FFFFFF] dark:from-[#121B14] dark:via-[#141E16] dark:to-[#0E1610] text-[#1A241C] dark:text-[#F3EFE6] border border-[#E0D9CB] dark:border-[#243628] shadow-sm relative overflow-hidden">
        <div>
          <h2 className="text-xl font-black text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#D99B26]" />
            {t(
              'قاعدة بيانات المرشحين وتفريغ الاستمارات الورقية',
              'Talent Pool & Paper Application Digitization'
            )}
          </h2>
          <p className="text-xs text-[#5C665E] dark:text-[#8FA392] mt-1">
            {t(
              'السجل الموحد للمتقدمين عبر رابط التوظيف والاستمارات الورقية والسير الذاتية المفرغة داخلياً مع إمكانية التعيين المباشر',
              'Unified repository for portal applicants and digitized paper applications/CVs with 1-click Core HR conversion'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold px-3 py-2 rounded-xl bg-[#FFFFFF] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] border border-[#E0D9CB] dark:border-[#243628]">
            {filteredCandidates.length} {t('ملف مسجل', 'Registered')}
          </span>

          <button
            type="button"
            onClick={() => setShowDigitizeModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-black shadow-md shadow-[#059669]/20 transition-all cursor-pointer"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>+ تفريغ استمارة توظيف ورقية / إدخال سيرة ذاتية (نموذج ترابط)</span>
          </button>
        </div>
      </div>

      {/* Confirmation Banner */}
      {statusBanner && (
        <div className="p-4 rounded-2xl bg-[#059669]/10 border border-[#059669]/30 text-[#059669] dark:text-emerald-400 text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="p-1 rounded-lg hover:bg-[#059669]/15 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#141E16] border border-[#E0D9CB] dark:border-[#243628] flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#5C665E] dark:text-[#8FA392] absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(
              'ابحث بالاسم، الرقم القومي، الموبايل، أو الوظيفة...',
              'Search by name, national ID, phone, or job...'
            )}
            className="w-full pl-3 pr-9 py-2 rounded-xl text-xs bg-[#FBF9F5] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:ring-2 focus:ring-[#D99B26]/60"
          />
        </div>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value as any)}
          className="px-3 py-2 rounded-xl text-xs font-bold bg-[#FBF9F5] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none"
        >
          <option value="all">{t('كافة قنوات الإدخال', 'All Sources')}</option>
          <option value="paper_digitization">{t('استمارات ورقية وسير ذاتية مفرغة', 'Digitized Paper Forms')}</option>
          <option value="portal">{t('تقديمات رابط التوظيف الخارجي', 'Careers Portal Link')}</option>
        </select>

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs font-bold bg-[#FBF9F5] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none"
        >
          <option value="all">{t('كافة المراحل', 'All Pipeline Stages')}</option>
          {DEFAULT_STAGES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </div>

      {/* Candidates Table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[#5C665E] dark:text-[#8FA392]">
          {t('جاري تحميل بيانات المرشحين...', 'Loading candidates...')}
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#FFFFFF] dark:bg-[#141E16] border-2 border-dashed border-[#E0D9CB] dark:border-[#243628] space-y-3">
          <Users className="w-10 h-10 text-[#D99B26] mx-auto opacity-60" />
          <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
            {t('لا توجد استمارات أو مرشحون مطابقون حالياً', 'No Candidates Found')}
          </h3>
          <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
            {t(
              'ابدأ بتفريغ الاستمارات الورقية والسير الذاتية الموجودة بالشركة أو مشاركة رابط التوظيف العام.',
              'Start digitizing paper job applications & CVs or share your public recruitment link.'
            )}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#FFFFFF] dark:bg-[#141E16] border border-[#E0D9CB] dark:border-[#243628] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#121B14] text-[#5C665E] dark:text-[#8FA392]">
                  <th className="py-3.5 px-4 font-bold">{t('مقدم الطلب / المرشح', 'Candidate')}</th>
                  <th className="py-3.5 px-4 font-bold">{t('الوظيفة المتقدم لها', 'Position')}</th>
                  <th className="py-3.5 px-4 font-bold">{t('المصدر / الحالة', 'Source & Stage')}</th>
                  <th className="py-3.5 px-4 font-bold">{t('المؤهل / التقييم', 'Match / Edu')}</th>
                  <th className="py-3.5 px-4 font-bold">{t('الراتب المحدد / المتوقع', 'Salary')}</th>
                  <th className="py-3.5 px-4 font-bold text-center">{t('الإجراءات', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]">
                {filteredCandidates.map((c) => {
                  const stageObj = DEFAULT_STAGES.find((s) => s.id === c.stage);
                  const isHighMatch = (c.matchScore || 0) >= 90;
                  const isDigitized =
                    c.source === 'paper_digitization' ||
                    c.applicationForm?.entryChannel === 'internal_digitization';

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-[#FBF9F5] dark:hover:bg-[#17231A] transition-all"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#D99B26]/15 text-[#D99B26] font-black flex items-center justify-center shrink-0">
                            {c.name.substring(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-1.5 flex-wrap">
                              <span>{c.name}</span>
                              {c.coreHREmployeeCode && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#059669]/15 text-[#059669] dark:text-emerald-400">
                                  <UserCheck className="w-3 h-3" />
                                  {c.coreHREmployeeCode}
                                </span>
                              )}
                              {(c.resumeUrl || c.applicationForm?.cvFileDataUrl) && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    atsStorage.openOrDownloadAttachment(
                                      c.resumeUrl || c.applicationForm?.cvFileDataUrl,
                                      c.resumeName || c.applicationForm?.cvFileName || 'cv.pdf',
                                      'view'
                                    );
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D99B26]/15 text-[#D99B26] hover:bg-[#D99B26] hover:text-white transition-colors cursor-pointer"
                                  title={c.resumeName || c.applicationForm?.cvFileName || 'عرض السيرة الذاتية'}
                                >
                                  <Paperclip className="w-3 h-3" />
                                  <span>CV مرفق</span>
                                </button>
                              )}
                            </div>
                            <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392] flex items-center gap-2 mt-0.5">
                              <span className="font-mono" dir="ltr">
                                {c.phone}
                              </span>
                              {c.nationalId && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono">{c.nationalId}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#1A241C] dark:text-[#F3EFE6]">
                          {c.jobTitle}
                        </div>
                        <div className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392]">
                          {c.jobDepartment}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 space-y-1">
                        {(() => {
                          const badgeMap: Record<string, string> = {
                            applied:
                              'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/35 dark:border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
                            screening:
                              'bg-teal-500/15 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/35 dark:border-teal-400/45',
                            tech_assessment:
                              'bg-blue-500/15 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/35 dark:border-blue-400/45',
                            first_interview:
                              'bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/35 dark:border-amber-400/45',
                            final_interview:
                              'bg-purple-500/15 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/35 dark:border-purple-400/45',
                            job_offer:
                              'bg-[#D99B26]/18 dark:bg-[#D99B26]/25 text-[#9A6B12] dark:text-[#FCD34D] border border-[#D99B26]/40',
                            hired:
                              'bg-emerald-600/15 dark:bg-emerald-500/25 text-emerald-800 dark:text-emerald-300 border border-emerald-500/45',
                            rejected:
                              'bg-rose-500/15 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/35 dark:border-rose-400/45',
                          };
                          return (
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                badgeMap[c.stage] ||
                                'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/35'
                              }`}
                            >
                              <span
                                className="w-2 h-2 rounded-full animate-pulse"
                                style={{
                                  backgroundColor: stageObj?.color || '#10B981',
                                  boxShadow: `0 0 8px ${stageObj?.color || '#10B981'}`,
                                }}
                              />
                              {stageObj?.title || c.stage}
                            </span>
                          );
                        })()}
                        <div className="text-[10px] font-bold text-[#5C665E] dark:text-[#8FA392]">
                          {isDigitized ? 'تفريغ استمارة ورقية / أرشيف' : 'بوابة التوظيف الإلكترونية'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-extrabold ${
                              isHighMatch
                                ? 'bg-[#059669]/15 text-[#059669] dark:text-emerald-400'
                                : 'bg-[#D99B26]/15 text-[#D99B26]'
                            }`}
                          >
                            <Sparkles className="w-3 h-3" />
                            {c.matchScore}%
                          </span>
                        </div>
                        <div className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] mt-0.5 line-clamp-1">
                          {c.education}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-[#059669] dark:text-emerald-400">
                        {c.expectedSalary ? `${c.expectedSalary.toLocaleString()} ج.م` : 'غير محدد'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          {(c.resumeUrl || c.applicationForm?.cvFileDataUrl) && (
                            <>
                              <button
                                onClick={() =>
                                  atsStorage.openOrDownloadAttachment(
                                    c.resumeUrl || c.applicationForm?.cvFileDataUrl,
                                    c.resumeName || c.applicationForm?.cvFileName || 'cv.pdf',
                                    'view'
                                  )
                                }
                                title={t('عرض السيرة الذاتية (CV)', 'View Attached CV')}
                                className="p-1.5 rounded-lg text-[#D99B26] hover:bg-[#D99B26]/15 cursor-pointer"
                              >
                                <Paperclip className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  atsStorage.openOrDownloadAttachment(
                                    c.resumeUrl || c.applicationForm?.cvFileDataUrl,
                                    c.resumeName || c.applicationForm?.cvFileName || 'cv.pdf',
                                    'download'
                                  )
                                }
                                title={t('تحميل السيرة الذاتية (CV)', 'Download CV')}
                                className="p-1.5 rounded-lg text-[#059669] hover:bg-[#059669]/10 cursor-pointer"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setPrintableCandidate(c)}
                            title={t(
                              'استمارة ترابط الرسمية (عرض / طباعة / تقييم الإدارة ص2)',
                              'Official Tarabot Form & Page 2'
                            )}
                            className="p-1.5 rounded-lg text-[#059669] hover:bg-[#059669]/10 cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedCandidate(c)}
                            title={t('عرض الملخص', 'Quick View')}
                            className="p-1.5 rounded-lg text-[#D99B26] hover:bg-[#D99B26]/10 cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCandidate(c.id)}
                            title={t('حذف', 'Delete')}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Candidate Quick View Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#FFFFFF] dark:bg-[#141E16] border border-[#E0D9CB] dark:border-[#243628] shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0D9CB] dark:border-[#243628]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D99B26]/15 text-[#D99B26] font-black flex items-center justify-center">
                  {selectedCandidate.name.substring(0, 2)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                    {selectedCandidate.name}
                  </h3>
                  <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                    {selectedCandidate.jobTitle}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-1.5 rounded-lg text-[#5C665E] dark:text-[#8FA392] hover:bg-[#F3EFE6] dark:hover:bg-[#17231A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#FBF9F5] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#5C665E] dark:text-[#8FA392]">{t('الرقم القومي:', 'National ID:')}</span>
                  <span className="font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                    {selectedCandidate.nationalId || 'غير مسجل'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C665E] dark:text-[#8FA392]">{t('الهاتف:', 'Phone:')}</span>
                  <span className="font-mono font-semibold text-[#1A241C] dark:text-[#F3EFE6]" dir="ltr">
                    {selectedCandidate.phone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C665E] dark:text-[#8FA392]">{t('المؤهل:', 'Education:')}</span>
                  <span className="font-semibold text-[#1A241C] dark:text-[#F3EFE6]">
                    {selectedCandidate.education}
                  </span>
                </div>
                {selectedCandidate.applicationForm && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[#5C665E] dark:text-[#8FA392]">موقف التجنيد:</span>
                      <span className="font-semibold text-[#1A241C] dark:text-[#F3EFE6]">
                        {selectedCandidate.applicationForm.militaryStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5C665E] dark:text-[#8FA392]">التأمينات السابقة:</span>
                      <span className="font-semibold text-[#1A241C] dark:text-[#F3EFE6]">
                        {selectedCandidate.applicationForm.previouslyInsured
                          ? `نعم (${selectedCandidate.applicationForm.socialInsuranceNumber || 'بدون رقم'})`
                          : 'لا'}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {(selectedCandidate.resumeUrl || selectedCandidate.applicationForm?.cvFileDataUrl) && (
                <div className="p-3.5 rounded-xl bg-[#D99B26]/10 border border-[#D99B26]/30 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                    <Paperclip className="w-4 h-4 text-[#D99B26]" />
                    <span>
                      {selectedCandidate.resumeName ||
                        selectedCandidate.applicationForm?.cvFileName ||
                        'السيرة الذاتية المرفقة'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        atsStorage.openOrDownloadAttachment(
                          selectedCandidate.resumeUrl ||
                            selectedCandidate.applicationForm?.cvFileDataUrl,
                          selectedCandidate.resumeName ||
                            selectedCandidate.applicationForm?.cvFileName ||
                            'cv.pdf',
                          'view'
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-[#D99B26] hover:bg-[#C2881D] text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>عرض السيرة الذاتية</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        atsStorage.openOrDownloadAttachment(
                          selectedCandidate.resumeUrl ||
                            selectedCandidate.applicationForm?.cvFileDataUrl,
                          selectedCandidate.resumeName ||
                            selectedCandidate.applicationForm?.cvFileName ||
                            'cv.pdf',
                          'download'
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تحميل</span>
                    </button>
                  </div>
                </div>
              )}

              {selectedCandidate.parsedResume?.summary && (
                <div className="p-3.5 rounded-xl bg-[#F3EFE6]/60 dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628]">
                  <div className="font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                    {t('الملخص:', 'Summary:')}
                  </div>
                  <p className="text-[#5C665E] dark:text-[#8FA392] leading-relaxed">
                    {selectedCandidate.parsedResume.summary}
                  </p>
                </div>
              )}

              {/* Candidate Notification & Tracking Channels */}
              {(() => {
                const notif = atsStorage.buildCandidateNotification(selectedCandidate);
                return (
                  <div className="p-3.5 rounded-xl bg-[#059669]/8 dark:bg-[#059669]/12 border border-[#059669]/25 space-y-2.5">
                    <div className="font-bold text-[#1A241C] dark:text-[#F3EFE6] flex items-center justify-between gap-2">
                      <span>إشعار المتقدم ومتابعة حالة الطلب (واتساب / إيميل / رابط مباشر):</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {notif.hasPhone && (
                        <a
                          href={notif.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-[11px] font-bold shadow-xs transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>إرسال عبر واتساب</span>
                        </a>
                      )}
                      <a
                        href={notif.mailtoUrl}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] font-bold shadow-xs transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>إرسال بالبريد الإلكتروني</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(notif.trackingUrl);
                          setStatusBanner(`تم نسخ رابط متابعة طلب (${selectedCandidate.name}) للمشاركة المباشرة.`);
                          setTimeout(() => setStatusBanner(null), 3000);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FFFFFF] dark:bg-[#17231A] hover:border-[#D99B26] text-[#1A241C] dark:text-[#F3EFE6] text-[11px] font-bold cursor-pointer transition-colors"
                      >
                        <Link2 className="w-3.5 h-3.5 text-[#D99B26]" />
                        <span>نسخ رابط المتابعة المباشر</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="mt-5 pt-3 border-t border-[#E0D9CB] dark:border-[#243628] flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const target = selectedCandidate;
                  setSelectedCandidate(null);
                  setPrintableCandidate(target);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#059669] hover:bg-[#047857] text-white cursor-pointer transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>استمارة ترابط الرسمية (ص1 + ص2 وتحويل لموظف)</span>
              </button>

              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#D99B26] hover:bg-[#C2881D] text-white transition-all cursor-pointer"
              >
                {t('إغلاق', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Internal Paper Application & CV Digitization Modal */}
      {showDigitizeModal && (
        <div
          dir="rtl"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs overflow-y-auto"
        >
          <div className="w-full max-w-5xl rounded-3xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 bg-[#F3EFE6] dark:bg-[#121B14] border-b border-[#E0D9CB] dark:border-[#243628] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <FilePlus2 className="w-5 h-5 text-[#059669]" />
                <div>
                  <h3 className="text-sm font-black text-[#1A241C] dark:text-[#F3EFE6]">
                    تفريغ استمارات التوظيف الورقية والسير الذاتية المجمعة بالشركة
                  </h3>
                  <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                    سجّل بيانات الاستمارة الورقية كاملة (ص1 + ص2) واختر إما حفظها كمرشح أو تعيين الموظف مباشرة بالسجل العام
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDigitizeModal(false)}
                className="p-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] text-[#5C665E] dark:text-[#8FA392] hover:bg-[#FFFFFF] dark:hover:bg-[#17231A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 flex-1 min-h-0 overflow-y-auto">
              <TarabotApplicationFormView
                mode="internal"
                companyName={activeCompany?.nameAr || ''}
                isSubmitting={isDigitizing}
                onSubmit={handleInternalDigitizeSubmit}
                onCancel={() => setShowDigitizeModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Official Printable Form + Page 2 Evaluation / Employee Conversion Modal */}
      {printableCandidate && (
        <TarabotPrintableApplicationModal
          candidate={printableCandidate}
          onClose={() => setPrintableCandidate(null)}
          onUpdated={loadCandidates}
        />
      )}
    </div>
  );
};
