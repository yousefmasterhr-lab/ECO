import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Sparkles, 
  Trash2, 
  Eye, 
  X
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { atsStorage } from '../../../services/atsStorage';
import { Candidate, DEFAULT_STAGES } from './types';

interface ATSCandidatesTabProps {
  companyId?: string;
}

export const ATSCandidatesTab: React.FC<ATSCandidatesTabProps> = ({ companyId }) => {
  const { t } = useLanguage();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

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
  };

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.currentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === 'all' || c.stage === stageFilter;
    const matchesComp = !companyId || companyId === 'all' || c.companyId === companyId;
    return matchesSearch && matchesStage && matchesComp;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white/70 dark:bg-[#0D1C13]/70 backdrop-blur-md border border-[#E0D9CB] dark:border-[#1D3324] shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#142319] dark:text-[#E8F3EB] flex items-center gap-2.5">
            <Users className="w-6 h-6 text-amber-500" />
            {t('قاعدة بيانات المرشحين والمواهب (Talent Pool)', 'Talent Pool & Candidates Database')}
          </h2>
          <p className="text-xs text-[#5C665E] dark:text-[#97A69B] mt-1">
            {t('سجل شامل لجميع الكوادر والمتقدمين مع التقييمات، السير الذاتية، ومطابقة الكفاءات', 'Master repository of all applicants, resume evaluations, and competency scoring')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            {filteredCandidates.length} {t('مرشح مسجل', 'Registered Candidates')}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white/60 dark:bg-[#0D1C13]/60 border border-[#E0D9CB] dark:border-[#1D3324] flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#5C665E] dark:text-[#97A69B] absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('ابحث باسم المرشح، المسمى، الوظيفة، أو البريد...', 'Search by name, title, job, or email...')}
            className="w-full pl-3 pr-9 py-2 rounded-xl text-xs bg-white dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] text-[#142319] dark:text-[#E8F3EB] focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Stage Filter */}
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] text-[#142319] dark:text-[#E8F3EB] focus:outline-none"
        >
          <option value="all">{t('كافة المراحل', 'All Pipeline Stages')}</option>
          {DEFAULT_STAGES.map(s => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>
      </div>

      {/* Candidates Table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[#5C665E] dark:text-[#97A69B]">
          {t('جاري تحميل بيانات المرشحين...', 'Loading candidates...')}
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white/40 dark:bg-[#0D1C13]/40 border-2 border-dashed border-[#E0D9CB] dark:border-[#1D3324]">
          <Users className="w-10 h-10 text-[#5C665E] dark:text-[#97A69B] mx-auto mb-3 opacity-40" />
          <h3 className="text-sm font-bold text-[#142319] dark:text-[#E8F3EB]">{t('لا يوجد مرشحون مطابقون', 'No Candidates Found')}</h3>
          <p className="text-xs text-[#5C665E] dark:text-[#97A69B] mt-1">{t('جرّب تغيير معايير البحث أو الفرز', 'Adjust filters to find matching profiles')}</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white/80 dark:bg-[#0D1C13]/80 border border-[#E0D9CB] dark:border-[#1D3324] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-[#E0D9CB] dark:border-[#1D3324] bg-[#F8F6F0]/60 dark:bg-[#122318]/60 text-[#5C665E] dark:text-[#97A69B]">
                  <th className="py-3.5 px-4 font-bold">{t('المرشح', 'Candidate')}</th>
                  <th className="py-3.5 px-4 font-bold">{t('الوظيفة المتقدم لها', 'Job Opening')}</th>
                  <th className="py-3.5 px-4 font-bold">{t('المرحلة الحالية', 'Stage')}</th>
                  <th className="py-3.5 px-4 font-bold">{t('نسبة المطابقة', 'Match Score')}</th>
                  <th className="py-3.5 px-4 font-bold">{t('الخبرة الحالية', 'Experience')}</th>
                  <th className="py-3.5 px-4 font-bold">{t('الراتب المتوقع', 'Expected')}</th>
                  <th className="py-3.5 px-4 font-bold text-center">{t('الإجراءات', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D9CB]/50 dark:divide-[#1D3324]/50">
                {filteredCandidates.map((c) => {
                  const stageObj = DEFAULT_STAGES.find(s => s.id === c.stage);
                  const isHighMatch = (c.matchScore || 0) >= 90;

                  return (
                    <tr key={c.id} className="hover:bg-[#F8F6F0] dark:hover:bg-[#122318] transition-all">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 font-bold flex items-center justify-center">
                            {c.name.substring(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-[#142319] dark:text-[#E8F3EB]">{c.name}</div>
                            <div className="text-[11px] text-[#5C665E] dark:text-[#97A69B] flex items-center gap-2 mt-0.5">
                              <span>{c.phone}</span>
                              <span>•</span>
                              <span>{c.location}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#142319] dark:text-[#E8F3EB]">{c.jobTitle}</div>
                        <div className="text-[10px] text-[#5C665E] dark:text-[#97A69B]">{c.jobDepartment}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                          style={{
                            backgroundColor: `${stageObj?.color || '#F59E0B'}15`,
                            color: stageObj?.color || '#F59E0B',
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stageObj?.color }} />
                          {stageObj?.title || c.stage}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                          isHighMatch ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          <Sparkles className="w-3 h-3" />
                          {c.matchScore}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[#142319] dark:text-[#E8F3EB]">{c.experienceYears} سنوات</div>
                        <div className="text-[10px] text-[#5C665E] dark:text-[#97A69B] line-clamp-1">{c.currentCompany}</div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                        {c.expectedSalary ? `${c.expectedSalary.toLocaleString()} ج.م` : 'غير محدد'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setSelectedCandidate(c)}
                            title={t('عرض الملف', 'View')}
                            className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCandidate(c.id)}
                            title={t('حذف', 'Delete')}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
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

      {/* Candidate Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0D1C13] border border-[#E0D9CB] dark:border-[#1D3324] shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0D9CB] dark:border-[#1D3324]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 font-bold flex items-center justify-center">
                  {selectedCandidate.name.substring(0, 2)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#142319] dark:text-[#E8F3EB]">{selectedCandidate.name}</h3>
                  <div className="text-[11px] text-[#5C665E] dark:text-[#97A69B]">{selectedCandidate.currentTitle}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-1.5 rounded-lg text-[#5C665E] hover:bg-[#F0ECE1] dark:hover:bg-[#122318]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F8F6F0] dark:bg-[#122318] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#5C665E] dark:text-[#97A69B]">{t('الهاتف:', 'Phone:')}</span>
                  <span className="font-semibold text-[#142319] dark:text-[#E8F3EB]" dir="ltr">{selectedCandidate.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C665E] dark:text-[#97A69B]">{t('البريد:', 'Email:')}</span>
                  <span className="font-semibold text-[#142319] dark:text-[#E8F3EB]">{selectedCandidate.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C665E] dark:text-[#97A69B]">{t('المؤهل:', 'Education:')}</span>
                  <span className="font-semibold text-[#142319] dark:text-[#E8F3EB]">{selectedCandidate.education}</span>
                </div>
              </div>

              {selectedCandidate.parsedResume?.summary && (
                <div className="p-3 rounded-xl bg-[#F0ECE1]/50 dark:bg-[#07130E]/50">
                  <div className="font-bold text-[#142319] dark:text-[#E8F3EB] mb-1">{t('الملخص:', 'Summary:')}</div>
                  <p className="text-[#5C665E] dark:text-[#97A69B] leading-relaxed">{selectedCandidate.parsedResume.summary}</p>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-[#E0D9CB] dark:border-[#1D3324] flex justify-end">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600"
              >
                {t('إغلاق', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

