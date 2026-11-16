import React, { useState, useEffect } from 'react';
import { 
  Kanban, 
  Search, 
  Star, 
  FileText, 
  Sparkles, 
  MapPin, 
  Briefcase, 
  Phone, 
  Mail, 
  X,
  MessageSquare,
  Paperclip,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  RotateCcw,
  MessageCircle,
  Link2,
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { atsStorage } from '../../../services/atsStorage';
import { Candidate, PipelineStageId, DEFAULT_STAGES, JobRequisition } from './types';
import { TarabotPrintableApplicationModal } from './TarabotApplicationFormView';
import { fireConfetti } from '../../../utils/confetti';

interface ATSPipelineTabProps {
  companyId?: string;
}

export const ATSPipelineTab: React.FC<ATSPipelineTabProps> = ({ companyId }) => {
  const { t } = useLanguage();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<JobRequisition[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);

  // Drag & Drop State
  const [draggedCandidateId, setDraggedCandidateId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  // Candidate Details Drawer
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [printableCandidate, setPrintableCandidate] = useState<Candidate | null>(null);
  const [newNoteText, setNewNoteText] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [cands, jobList] = await Promise.all([
        atsStorage.getCandidates(companyId),
        atsStorage.getJobs(companyId),
      ]);
      setCandidates(cands);
      setJobs(jobList);
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

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedCandidateId(id);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (dragOverStage === stageId) {
      setDragOverStage(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStage: PipelineStageId) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedCandidateId;
    if (id) {
      await atsStorage.moveCandidateStage(id, targetStage);
      if (targetStage === 'hired') {
        fireConfetti();
      }
    }
    setDraggedCandidateId(null);
    setDragOverStage(null);
  };

  const handleDragEnd = () => {
    setDraggedCandidateId(null);
    setDragOverStage(null);
  };

  // Add Note
  const handleAddNote = async (candidateId: string) => {
    if (!newNoteText.trim()) return;
    const cand = candidates.find(c => c.id === candidateId);
    if (!cand) return;

    const newNote = {
      id: `note_${Date.now()}`,
      authorId: 'admin',
      authorName: 'مسؤول التوظيف',
      content: newNoteText,
      createdAt: new Date().toISOString().substring(0, 10),
      isPrivate: false,
    };

    const updated = {
      ...cand,
      notes: [newNote, ...(cand.notes || [])],
    };

    await atsStorage.saveCandidate(updated);
    setSelectedCandidate(updated);
    setNewNoteText('');
  };

  // Filter candidates
  const filteredCandidates = candidates.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (c.name || '').toLowerCase().includes(q) ||
      (c.jobTitle || '').toLowerCase().includes(q) ||
      (c.parsedResume?.extractedSkills || []).some(s => s.toLowerCase().includes(q));
    const matchesJob = selectedJobId === 'all' || c.jobId === selectedJobId;
    const matchesScore = (c.matchScore || 0) >= minScoreFilter;
    const matchesComp =
      !companyId ||
      companyId === 'all' ||
      !c.companyId ||
      c.companyId === 'all' ||
      c.companyId === 'comp_01' ||
      c.companyId === 'comp_1' ||
      c.companyId === companyId;
    return matchesSearch && matchesJob && matchesScore && matchesComp;
  });

  const activePipelineStages = DEFAULT_STAGES.filter(s => s.id !== 'rejected');

  const handleStageTransition = async (
    candidate: Candidate,
    targetStage: PipelineStageId,
    noteText?: string
  ) => {
    await atsStorage.moveCandidateStage(candidate.id, targetStage, noteText);
    if (targetStage === 'hired') {
      fireConfetti();
    }
    setSelectedCandidate((prev) =>
      prev && prev.id === candidate.id ? { ...prev, stage: targetStage } : prev
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-gradient-to-l from-amber-100/80 via-amber-50/60 to-white dark:from-[#0D1F17] dark:via-[#07130E] dark:to-[#07130E] text-slate-900 dark:text-stone-100 border border-amber-200/60 dark:border-amber-500/30 shadow-sm dark:shadow-xl relative overflow-hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-[#E8F3EB] flex items-center gap-2.5">
            <Kanban className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            {t('مسار التوظيف والفرز التفاعلي', 'Interactive Candidate Pipeline')}
          </h2>
          <p className="text-xs text-slate-600 dark:text-[#97A69B] mt-1">
            {t('سحب وإفلات المرشحين عبر مراحل التعيين مع تحديث لحظي ومطابقة الذكاء الاصطناعي', 'Drag and drop candidates across pipeline stages with instant sync and AI match scores')}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-[#5C665E] dark:text-[#97A69B] absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('بحث بالاسم أو المهارة...', 'Search candidate or skill...')}
              className="w-full pl-3 pr-9 py-1.5 rounded-xl text-xs bg-white dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] text-[#142319] dark:text-[#E8F3EB] focus:outline-none"
            />
          </div>

          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] text-[#142319] dark:text-[#E8F3EB] focus:outline-none"
          >
            <option value="all">{t('كافة الوظائف والشواغر', 'All Job Openings')}</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>

          <select
            value={minScoreFilter}
            onChange={(e) => setMinScoreFilter(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] text-[#142319] dark:text-[#E8F3EB] focus:outline-none"
          >
            <option value="0">{t('كافة نسب المطابقة', 'All Match Scores')}</option>
            <option value="80">{t('مطابقة عالية (+80%)', 'High Match (+80%)')}</option>
            <option value="90">{t('مطابقة استثنائية (+90%)', 'Exceptional (+90%)')}</option>
          </select>
        </div>
      </div>

      {/* Kanban Board Container */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[#5C665E] dark:text-[#97A69B]">
          {t('جاري تحميل مسار التوظيف والفرز...', 'Loading candidate pipeline...')}
        </div>
      ) : (
        <div className="overflow-x-auto pb-6">
          <div className="flex gap-4 min-w-[1300px]">
            {DEFAULT_STAGES.map((stage) => {
              const stageCandidates = filteredCandidates.filter(c => c.stage === stage.id);
              const isOver = dragOverStage === stage.id;

              return (
                <div
                  key={stage.id}
                  onDragOver={(e) => handleDragOver(e, stage.id)}
                  onDragLeave={(e) => handleDragLeave(e, stage.id)}
                  onDrop={(e) => handleDrop(e, stage.id)}
                  className={`flex-1 min-w-[270px] max-w-[310px] rounded-2xl flex flex-col transition-all duration-200 border ${
                    isOver
                      ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30'
                      : 'bg-[#F8F6F0]/80 dark:bg-[#0D1C13]/70 border-[#E0D9CB] dark:border-[#1D3324]'
                  }`}
                >
                  {/* Stage Header */}
                  <div className="p-3.5 border-b border-[#E0D9CB]/70 dark:border-[#1D3324]/70 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor: stage.color,
                          boxShadow: `0 0 8px ${stage.color}`,
                        }}
                      />
                      <span className="text-xs font-bold text-[#142319] dark:text-[#F3EFE6]">
                        {stage.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] text-[#1A241C] dark:text-[#F3EFE6]">
                      {stageCandidates.length}
                    </span>
                  </div>

                  {/* Stage Column Content */}
                  <div className="p-2.5 space-y-2.5 flex-1 min-h-[500px]">
                    {stageCandidates.map((c) => {
                      const isHighMatch = (c.matchScore || 0) >= 90;
                      return (
                        <div
                          key={c.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, c.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => setSelectedCandidate(c)}
                          className="p-3.5 rounded-xl bg-white dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] hover:border-amber-500/50 shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing group select-none"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-semibold text-[#5C665E] dark:text-[#97A69B] line-clamp-1">
                              {c.jobTitle}
                            </span>
                            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${
                              isHighMatch ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                            }`}>
                              <Sparkles className="w-2.5 h-2.5" />
                              {c.matchScore}%
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-[#142319] dark:text-[#E8F3EB] group-hover:text-amber-500 transition-colors">
                            {c.name}
                          </h4>

                          <div className="text-[11px] text-[#5C665E] dark:text-[#97A69B] mt-1 line-clamp-1">
                            {c.currentTitle} • {c.currentCompany}
                          </div>

                          <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#5C665E] dark:text-[#97A69B] pt-2 border-t border-[#E0D9CB]/50 dark:border-[#1D3324]/50">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3 text-amber-500" />
                                <span>{c.experienceYears} سنوات خبرة</span>
                              </div>
                              {(c.resumeUrl || c.applicationForm?.cvFileDataUrl) && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#059669]/10 text-[#059669] dark:text-emerald-400 font-bold">
                                  <Paperclip className="w-2.5 h-2.5" />
                                  CV
                                </span>
                              )}
                            </div>

                            {c.rating && (
                              <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                                <Star className="w-3 h-3 fill-amber-500" />
                                <span>{c.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {stageCandidates.length === 0 && (
                      <div className="h-28 flex items-center justify-center text-[11px] text-[#5C665E]/50 dark:text-[#97A69B]/50 border border-dashed border-[#E0D9CB]/50 dark:border-[#1D3324]/50 rounded-xl">
                        {t('لا يوجد مرشحون', 'Empty Stage')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Candidate Details Modal / Drawer */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#0D1C13] border border-[#E0D9CB] dark:border-[#1D3324] shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E0D9CB] dark:border-[#1D3324]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-lg">
                  {selectedCandidate.name.substring(0, 2)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#142319] dark:text-[#E8F3EB] flex items-center gap-2">
                    {selectedCandidate.name}
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                      {selectedCandidate.matchScore}% مطابقة
                    </span>
                  </h3>
                  <div className="text-xs text-[#5C665E] dark:text-[#97A69B]">
                    {selectedCandidate.currentTitle} • {selectedCandidate.currentCompany}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-1.5 rounded-lg text-[#5C665E] hover:bg-[#F0ECE1] dark:hover:bg-[#122318]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Candidate Details */}
            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-[#F8F6F0] dark:bg-[#122318]">
                <div>
                  <div className="text-[#5C665E] dark:text-[#97A69B] text-[10px]">{t('الشاغر المستهدف', 'Job')}</div>
                  <div className="font-bold text-[#142319] dark:text-[#E8F3EB] line-clamp-1">{selectedCandidate.jobTitle}</div>
                </div>
                <div>
                  <div className="text-[#5C665E] dark:text-[#97A69B] text-[10px]">{t('سنوات الخبرة', 'Experience')}</div>
                  <div className="font-bold text-[#142319] dark:text-[#E8F3EB]">{selectedCandidate.experienceYears} سنوات</div>
                </div>
                <div>
                  <div className="text-[#5C665E] dark:text-[#97A69B] text-[10px]">{t('الراتب المتوقع', 'Expected')}</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedCandidate.expectedSalary ? `${selectedCandidate.expectedSalary.toLocaleString()} ج.م` : 'غير محدد'}
                  </div>
                </div>
                <div>
                  <div className="text-[#5C665E] dark:text-[#97A69B] text-[10px]">{t('مهلة البدء', 'Notice Period')}</div>
                  <div className="font-bold text-[#142319] dark:text-[#E8F3EB]">{selectedCandidate.noticePeriodDays || 30} يوم</div>
                </div>
              </div>

              {/* Contact info */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#5C665E] dark:text-[#97A69B]">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-500" />
                  <span dir="ltr">{selectedCandidate.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-500" />
                  <span>{selectedCandidate.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  <span>{selectedCandidate.location}</span>
                </div>
              </div>

              {/* Sequential Pipeline Stepper */}
              <div className="p-3.5 rounded-xl bg-[#FBF9F5] dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#142319] dark:text-[#E8F3EB]">
                  <span>{t('التسلسل المرحلي للفرز والاعتماد:', 'Sequential Recruitment Stage:')}</span>
                  {selectedCandidate.stage === 'rejected' && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 text-[10px] font-bold">
                      {t('قائمة الاحتياط / مستبعد', 'Rejected / Reserve')}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {activePipelineStages.map((stg, idx) => {
                    const currentIdx = activePipelineStages.findIndex(
                      (s) => s.id === selectedCandidate.stage
                    );
                    const isCurrent = stg.id === selectedCandidate.stage;
                    const isPassed = currentIdx >= 0 && idx < currentIdx;

                    return (
                      <button
                        key={stg.id}
                        type="button"
                        onClick={() => handleStageTransition(selectedCandidate, stg.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-bold border transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-[#D99B26] border-[#D99B26] text-white shadow-xs'
                            : isPassed
                              ? 'bg-[#059669]/12 border-[#059669]/30 text-[#059669] dark:text-emerald-400'
                              : 'bg-white dark:bg-[#0D1C13] border-[#E0D9CB] dark:border-[#1D3324] text-[#5C665E] dark:text-[#97A69B] hover:border-[#D99B26]'
                        }`}
                      >
                        {isPassed ? (
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                        ) : (
                          <span className="font-mono">{idx + 1}.</span>
                        )}
                        <span>{stg.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Attached CV & Official Form Controls */}
              <div className="p-3.5 rounded-xl bg-[#D99B26]/10 border border-[#D99B26]/30 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#142319] dark:text-[#E8F3EB]">
                  <Paperclip className="w-4 h-4 text-[#D99B26]" />
                  <span>
                    {selectedCandidate.resumeUrl || selectedCandidate.applicationForm?.cvFileDataUrl
                      ? selectedCandidate.resumeName ||
                        selectedCandidate.applicationForm?.cvFileName ||
                        'السيرة الذاتية المرفقة (CV)'
                      : 'لم يرفق المتقدم ملف سيرة ذاتية إضافي'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {(selectedCandidate.resumeUrl || selectedCandidate.applicationForm?.cvFileDataUrl) && (
                    <>
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
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#D99B26] hover:bg-[#C2881D] text-white text-[11px] font-bold cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t('عرض السيرة الذاتية', 'View CV')}</span>
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
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-[11px] font-bold cursor-pointer transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{t('تحميل CV', 'Download')}</span>
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const target = selectedCandidate;
                      setSelectedCandidate(null);
                      setPrintableCandidate(target);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#059669]/40 bg-[#059669]/10 hover:bg-[#059669]/20 text-[#059669] dark:text-emerald-400 text-[11px] font-bold cursor-pointer transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{t('استمارة التوظيف (ص1+ص2)', 'Official Form')}</span>
                  </button>
                </div>
              </div>

              {/* Notify Candidate Bar (WhatsApp / Email / Tracking URL) */}
              {(() => {
                const notif = atsStorage.buildCandidateNotification(selectedCandidate);
                return (
                  <div className="p-3 rounded-xl bg-[#059669]/8 dark:bg-[#059669]/12 border border-[#059669]/25 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-[#142319] dark:text-[#E8F3EB]">
                      إخطار المتقدم بنتيجة المرحلة الحالية / رابط المتابعة:
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {notif.hasPhone && (
                        <a
                          href={notif.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white text-[11px] font-bold transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>واتساب</span>
                        </a>
                      )}
                      <a
                        href={notif.mailtoUrl}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] font-bold transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>إيميل</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(notif.trackingUrl)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E0D9CB] dark:border-[#1D3324] bg-white dark:bg-[#122318] hover:border-[#D99B26] text-[#142319] dark:text-[#E8F3EB] text-[11px] font-bold cursor-pointer"
                      >
                        <Link2 className="w-3.5 h-3.5 text-[#D99B26]" />
                        <span>نسخ الرابط</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Resume Summary */}
              {selectedCandidate.parsedResume?.summary && (
                <div className="p-3.5 rounded-xl bg-[#F0ECE1]/50 dark:bg-[#07130E]/50 border border-[#E0D9CB] dark:border-[#1D3324]">
                  <div className="font-bold text-[#142319] dark:text-[#E8F3EB] mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                    {t('الملخص المهني للسيرة الذاتية (CV Summary)', 'Professional Summary')}
                  </div>
                  <p className="text-[#5C665E] dark:text-[#97A69B] leading-relaxed">
                    {selectedCandidate.parsedResume.summary}
                  </p>
                </div>
              )}

              {/* Skills */}
              {selectedCandidate.parsedResume?.extractedSkills && (
                <div>
                  <div className="font-bold text-[#142319] dark:text-[#E8F3EB] mb-2">{t('المهارات المستخرجة:', 'Extracted Skills:')}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCandidate.parsedResume.extractedSkills.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[11px] font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Internal Notes */}
              <div className="pt-3 border-t border-[#E0D9CB] dark:border-[#1D3324]">
                <div className="font-bold text-[#142319] dark:text-[#E8F3EB] mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                  {t('الملاحظات الداخلية وتقييم المقابلة', 'Internal Notes')}
                </div>

                <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                  {(selectedCandidate.notes || []).map((note) => (
                    <div key={note.id} className="p-2.5 rounded-lg bg-[#F8F6F0] dark:bg-[#122318] text-[11px]">
                      <div className="flex justify-between font-semibold text-[#142319] dark:text-[#E8F3EB] mb-0.5">
                        <span>{note.authorName}</span>
                        <span className="text-[#5C665E] dark:text-[#97A69B] text-[10px]">{note.createdAt}</span>
                      </div>
                      <p className="text-[#5C665E] dark:text-[#97A69B]">{note.content}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder={t('أضف ملاحظة جديدة حول المرشح...', 'Add evaluation note...')}
                    className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-[#F8F6F0] dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] text-[#142319] dark:text-[#E8F3EB] focus:outline-none"
                  />
                  <button
                    onClick={() => handleAddNote(selectedCandidate.id)}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#D99B26] hover:bg-[#C2881D] text-white transition-all cursor-pointer"
                  >
                    {t('إضافة', 'Add')}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions — Sequential Stage Progression */}
            {(() => {
              const currentIdx = activePipelineStages.findIndex(
                (s) => s.id === selectedCandidate.stage
              );
              const prevStage = currentIdx > 0 ? activePipelineStages[currentIdx - 1] : null;
              const nextStage =
                currentIdx >= 0 && currentIdx < activePipelineStages.length - 1
                  ? activePipelineStages[currentIdx + 1]
                  : null;

              return (
                <div className="mt-5 pt-3 border-t border-[#E0D9CB] dark:border-[#1D3324] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedCandidate.stage === 'rejected' ? (
                      <button
                        type="button"
                        onClick={() => handleStageTransition(selectedCandidate, 'screening', 'إعادة للمسار من قائمة الاحتياط')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#059669] hover:bg-[#047857] cursor-pointer transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{t('إعادة للمسار (فرز وتصفية أولية)', 'Restore to Screening')}</span>
                      </button>
                    ) : (
                      <>
                        {nextStage && (
                          <button
                            type="button"
                            onClick={() => handleStageTransition(selectedCandidate, nextStage.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#059669] hover:bg-[#047857] shadow-xs cursor-pointer transition-colors"
                          >
                            <span>{t(`نقل للمرحلة التالية: ${nextStage.title}`, `Next: ${nextStage.titleEn}`)}</span>
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                        )}
                        {prevStage && (
                          <button
                            type="button"
                            onClick={() => handleStageTransition(selectedCandidate, prevStage.id, `إرجاع إلى مرحله: ${prevStage.title}`)}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border border-[#E0D9CB] dark:border-[#1D3324] text-[#142319] dark:text-[#E8F3EB] hover:border-[#D99B26] cursor-pointer transition-colors"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                            <span>{t(`رجوع: ${prevStage.title}`, `Back: ${prevStage.titleEn}`)}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={async () => {
                            await atsStorage.moveCandidateStage(
                              selectedCandidate.id,
                              'rejected',
                              'استبعاد بعد الفرز والمقابلة'
                            );
                            setSelectedCandidate(null);
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                        >
                          {t('استبعاد', 'Reject')}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#D99B26] hover:bg-[#C2881D] text-white cursor-pointer transition-colors"
                  >
                    {t('إغلاق', 'Close')}
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {printableCandidate && (
        <TarabotPrintableApplicationModal
          candidate={printableCandidate}
          onClose={() => setPrintableCandidate(null)}
          onUpdated={loadData}
        />
      )}
    </div>
  );
};

