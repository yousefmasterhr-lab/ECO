import React, { useState, useEffect, useRef } from 'react';
import { 
  FileSignature, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  X, 
  Eye
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useTenant } from '../../../context/TenantContext';
import { atsStorage } from '../../../services/atsStorage';
import { JobOffer, Candidate, JobRequisition } from './types';
import { fireConfetti } from '../../../utils/confetti';

interface ATSOffersTabProps {
  companyId?: string;
}

export const ATSOffersTab: React.FC<ATSOffersTabProps> = ({ companyId }) => {
  const { t } = useLanguage();
  const { activeCompany, selectedCompanies } = useTenant();

  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [, setJobs] = useState<JobRequisition[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isSyncSuccessModalOpen, setIsSyncSuccessModalOpen] = useState(false);
  const [syncedEmployeeCode, setSyncedEmployeeCode] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Digital Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Form State
  const [candSelectId, setCandSelectId] = useState('');
  const [basicSalary, setBasicSalary] = useState(15000);
  const [housingAllowance, setHousingAllowance] = useState(4000);
  const [transportAllowance, setTransportAllowance] = useState(2000);
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().substring(0, 10));

  const totalMonthly = basicSalary + housingAllowance + transportAllowance;

  const loadData = async () => {
    try {
      setLoading(true);
      const [offerList, candList, jobList] = await Promise.all([
        atsStorage.getOffers(companyId),
        atsStorage.getCandidates(companyId),
        atsStorage.getJobs(companyId),
      ]);
      setOffers(offerList);
      setCandidates(candList);
      setJobs(jobList);
      if (candList.length > 0 && !candSelectId) {
        setCandSelectId(candList[0].id);
      }
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

  // Handle Create Offer
  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    const cand = candidates.find(c => c.id === candSelectId);
    if (!cand) return;

    const targetComp = selectedCompanies.find(c => c.id === cand.companyId) || activeCompany;
    const newOffer: JobOffer = {
      id: `off_${Date.now()}`,
      candidateId: cand.id,
      candidateName: cand.name,
      candidateEmail: cand.email,
      candidatePhone: cand.phone,
      jobId: cand.jobId,
      jobTitle: cand.jobTitle,
      department: cand.jobDepartment || 'الإدارة الهندسية',
      companyId: targetComp?.id || 'comp_01',
      companyName: targetComp?.nameAr || 'شركة أركان للإنشاءات الهندسية',
      reportingTo: 'مدير الإدارة المختص',
      joiningDate,
      expiryDate: new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10),
      compensation: {
        basicSalary,
        housingAllowance,
        transportAllowance,
        otherAllowance: 0,
        totalMonthly,
        totalAnnual: totalMonthly * 12,
        currency: targetComp?.currency || 'EGP',
        probationMonths: 3,
        annualLeaveDays: 21,
        medicalInsuranceTier: 'Class A',
      },
      termsAndConditions: 'عرض عمل رسمي خاضع لقانون العمل المصري واللوائح الداخلية للشركة.',
      status: 'sent_to_candidate',
      hrSignerName: 'مسؤول الموارد البشرية',
      hrSignedAt: new Date().toISOString().substring(0, 10),
      isSyncedToCoreHR: false,
      preboardingDocuments: [
        { id: 'doc_1', type: 'national_id', title: 'صورة بطاقة الرقم القومي', titleEn: 'National ID', isRequired: true, isUploaded: true, verificationStatus: 'verified' },
        { id: 'doc_2', type: 'degree_certificate', title: 'شهادة المؤهل الجامعي المعتمدة', titleEn: 'Degree Certificate', isRequired: true, isUploaded: true, verificationStatus: 'verified' },
        { id: 'doc_3', type: 'criminal_clearance', title: 'صحيفة الحالة الجنائية (فيش وتشبيه)', titleEn: 'Criminal Record', isRequired: true, isUploaded: false, verificationStatus: 'pending' },
      ],
      createdAt: new Date().toISOString().substring(0, 10),
      updatedAt: new Date().toISOString().substring(0, 10),
    };

    await atsStorage.saveOffer(newOffer);
    await atsStorage.moveCandidateStage(cand.id, 'job_offer');
    setIsCreateModalOpen(false);
    fireConfetti();
  };

  // 1-Click Conversion to Core HR & Insurance
  const handleSyncToCoreHR = async (offer: JobOffer) => {
    try {
      setIsSyncing(true);
      const res = await atsStorage.syncCandidateToCoreHR(offer.id, 'مسؤول استقطاب الكفاءات');
      setSyncedEmployeeCode(res.employeeCode);
      setIsSyncSuccessModalOpen(true);
      fireConfetti();
    } catch (err: any) {
      alert(`حدث خطأ أثناء نقل الموظف: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // E-Signature
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  };

  const saveSignature = async () => {
    if (!selectedOffer || !canvasRef.current) return;
    const sigUrl = canvasRef.current.toDataURL();
    const updated: JobOffer = {
      ...selectedOffer,
      status: 'accepted',
      candidateSignature: {
        signatureDataUrl: sigUrl,
        signedAt: new Date().toISOString(),
        ipAddress: '192.168.1.55 (Cairo)',
      },
    };
    await atsStorage.saveOffer(updated);
    await atsStorage.moveCandidateStage(selectedOffer.candidateId, 'hired', 'تم توقيع العرض الوظيفي رقمياً');
    setSelectedOffer(updated);
    setIsSignModalOpen(false);
    fireConfetti();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white/70 dark:bg-[#0D1C13]/70 backdrop-blur-md border border-[#E0D9CB] dark:border-[#1D3324] shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#142319] dark:text-[#E8F3EB] flex items-center gap-2.5">
            <FileSignature className="w-6 h-6 text-amber-500" />
            {t('عروض العمل وتعيين الموظف (Job Offers & Conversion)', 'Job Offers & Core HR Conversion')}
          </h2>
          <p className="text-xs text-[#5C665E] dark:text-[#97A69B] mt-1">
            {t('صياغة العروض الوظيفية الرسمية، التوقيع الرقمي، والتحويل الآلي الفوري لمنظومة الموارد البشرية والتأمينات بنقرة واحدة', 'Generate official offers, digital e-signatures, and 1-click seamless conversion to Core HR & Social Insurance')}
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {t('إصدار عرض وظيفي جديد', 'Issue New Job Offer')}
        </button>
      </div>

      {/* Offers List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[#5C665E] dark:text-[#97A69B]">
          {t('جاري تحميل عروض العمل...', 'Loading job offers...')}
        </div>
      ) : offers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white/40 dark:bg-[#0D1C13]/40 border-2 border-dashed border-[#E0D9CB] dark:border-[#1D3324]">
          <FileSignature className="w-10 h-10 text-[#5C665E] dark:text-[#97A69B] mx-auto mb-3 opacity-40" />
          <h3 className="text-sm font-bold text-[#142319] dark:text-[#E8F3EB]">{t('لا توجد عروض وظيفية مصدرة حالياً', 'No Job Offers Issued Yet')}</h3>
          <p className="text-xs text-[#5C665E] dark:text-[#97A69B] mt-1">{t('يمكنك صياغة وتوجيه عرض عمل للمرشحين المتأهلين', 'Draft and send official offers to qualified candidates')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((offer) => {
            const isSynced = offer.isSyncedToCoreHR || offer.status === 'synced_to_core_hr';
            const isAccepted = offer.status === 'accepted';

            return (
              <div
                key={offer.id}
                className="p-5 rounded-2xl bg-white/80 dark:bg-[#0D1C13]/80 border border-[#E0D9CB] dark:border-[#1D3324] hover:border-amber-500/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500">
                      {offer.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSynced ? 'bg-emerald-500/10 text-emerald-500' :
                      isAccepted ? 'bg-blue-500/10 text-blue-500' :
                      'bg-amber-500/10 text-amber-500'
                    }`}>
                      {isSynced ? t('معتمد ومحوّل لـ HR', 'Synced to Core HR') :
                       isAccepted ? t('موقع ومقبول', 'Offer Accepted') :
                       t('مرسل للمرشح', 'Sent to Candidate')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#142319] dark:text-[#E8F3EB]">{offer.candidateName}</h3>
                  <div className="text-xs text-[#5C665E] dark:text-[#97A69B] mt-0.5">{offer.jobTitle} • {offer.department}</div>

                  <div className="mt-4 p-3 rounded-xl bg-[#F8F6F0] dark:bg-[#122318] space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#5C665E] dark:text-[#97A69B]">{t('إجمالي الراتب الشهري:', 'Monthly Package:')}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {offer.compensation.totalMonthly.toLocaleString()} {offer.compensation.currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5C665E] dark:text-[#97A69B]">{t('تاريخ بدء العمل:', 'Start Date:')}</span>
                      <span className="font-semibold text-[#142319] dark:text-[#E8F3EB]">{offer.joiningDate}</span>
                    </div>

                    {isSynced && offer.coreHREmployeeId && (
                      <div className="flex justify-between pt-1 border-t border-[#E0D9CB]/50 dark:border-[#1D3324]/50">
                        <span className="text-[#5C665E] dark:text-[#97A69B]">{t('الرقم الوظيفي المعتمد:', 'Employee Code:')}</span>
                        <span className="font-mono font-bold text-amber-500">{offer.coreHREmployeeId}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-3 border-t border-[#E0D9CB]/60 dark:border-[#1D3324]/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedOffer(offer)}
                      className="flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:text-amber-600"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {t('عرض الخطاب والمستندات', 'View Offer')}
                    </button>

                    {!isAccepted && !isSynced && (
                      <button
                        onClick={() => {
                          setSelectedOffer(offer);
                          setIsSignModalOpen(true);
                        }}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {t('محاكاة توقيع المرشح', 'Sign Offer')}
                      </button>
                    )}
                  </div>

                  {/* 1-Click Conversion Golden Button */}
                  {!isSynced && (
                    <button
                      onClick={() => handleSyncToCoreHR(offer)}
                      disabled={isSyncing}
                      className="w-full mt-2 py-2.5 px-3 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 group"
                    >
                      <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                      <span>{t('⚡ اعتماد ونقل الموظف إلى منظومة الموارد البشرية والتأمينات', '⚡ Convert & Sync to Core HR & Insurance')}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Offer */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0D1C13] border border-[#E0D9CB] dark:border-[#1D3324] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0D9CB] dark:border-[#1D3324]">
              <h3 className="text-base font-bold text-[#142319] dark:text-[#E8F3EB] flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-amber-500" />
                {t('صياغة وتوجيه عرض عمل رسمي', 'Draft Official Job Offer')}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-[#5C665E] hover:bg-[#F0ECE1] dark:hover:bg-[#122318]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOffer} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#142319] dark:text-[#E8F3EB] mb-1">
                  {t('اختر المرشح المؤهل *', 'Select Candidate *')}
                </label>
                <select
                  value={candSelectId}
                  onChange={(e) => setCandSelectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#F8F6F0] dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] text-[#142319] dark:text-[#E8F3EB] focus:outline-none"
                >
                  {candidates.map(c => (
                    <option key={c.id} value={c.id}>{c.name} — ({c.jobTitle})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#142319] dark:text-[#E8F3EB] mb-1">
                    {t('الراتب الأساسي', 'Base Salary')}
                  </label>
                  <input
                    type="number"
                    value={basicSalary}
                    onChange={(e) => setBasicSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-[#F8F6F0] dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] text-[#142319] dark:text-[#E8F3EB] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#142319] dark:text-[#E8F3EB] mb-1">
                    {t('بدل سكن', 'Housing')}
                  </label>
                  <input
                    type="number"
                    value={housingAllowance}
                    onChange={(e) => setHousingAllowance(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-[#F8F6F0] dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] text-[#142319] dark:text-[#E8F3EB] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#142319] dark:text-[#E8F3EB] mb-1">
                    {t('بدل انتقال', 'Transport')}
                  </label>
                  <input
                    type="number"
                    value={transportAllowance}
                    onChange={(e) => setTransportAllowance(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-[#F8F6F0] dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] text-[#142319] dark:text-[#E8F3EB] focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex justify-between items-center text-xs">
                <span className="font-bold text-[#142319] dark:text-[#E8F3EB]">{t('إجمالي الراتب الشهري الشامل:', 'Total Monthly Package:')}</span>
                <span className="text-base font-black text-amber-500">{totalMonthly.toLocaleString()} ج.م</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#142319] dark:text-[#E8F3EB] mb-1">
                  {t('تاريخ المباشرة المتوقع *', 'Expected Start Date *')}
                </label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#F8F6F0] dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] text-[#142319] dark:text-[#E8F3EB] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E0D9CB] dark:border-[#1D3324]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5C665E]"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-sm"
                >
                  {t('إرسال العرض الوظيفي', 'Send Offer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Offer Letter & Preboarding */}
      {selectedOffer && !isSignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#0D1C13] border border-[#E0D9CB] dark:border-[#1D3324] shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0D9CB] dark:border-[#1D3324]">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-500">{selectedOffer.id}</span>
                <h3 className="text-base font-bold text-[#142319] dark:text-[#E8F3EB]">{t('خطاب العرض الوظيفي المعتمد', 'Official Job Offer Letter')}</h3>
              </div>
              <button
                onClick={() => setSelectedOffer(null)}
                className="p-1.5 rounded-lg text-[#5C665E] hover:bg-[#F0ECE1] dark:hover:bg-[#122318]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Letter Content */}
            <div className="mt-4 p-6 rounded-2xl bg-[#FBF9F5] dark:bg-[#08120B] border border-[#E0D9CB] dark:border-[#1D3324] space-y-4 text-xs">
              <div className="text-center pb-4 border-b border-[#E0D9CB]/70 dark:border-[#1D3324]/70">
                <div className="text-sm font-black text-[#142319] dark:text-[#E8F3EB]">{selectedOffer.companyName}</div>
                <div className="text-[11px] text-[#5C665E] dark:text-[#97A69B]">قطاع الموارد البشرية واستقطاب الكفاءات</div>
              </div>

              <div className="space-y-1">
                <div><strong>السيد / السيدة:</strong> {selectedOffer.candidateName}</div>
                <div><strong>المسمى الوظيفي:</strong> {selectedOffer.jobTitle}</div>
                <div><strong>الإدارة / القطاع:</strong> {selectedOffer.department}</div>
                <div><strong>تاريخ الالتحاق:</strong> {selectedOffer.joiningDate}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] space-y-2">
                <div className="font-bold text-[#142319] dark:text-[#E8F3EB]">{t('تفاصيل الحزمة المالية والبدلات:', 'Compensation Breakdown:')}</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>الراتب الأساسي: <strong className="text-emerald-600 dark:text-emerald-400">{selectedOffer.compensation.basicSalary.toLocaleString()} ج.م</strong></div>
                  <div>بدل السكن: <strong>{selectedOffer.compensation.housingAllowance.toLocaleString()} ج.م</strong></div>
                  <div>بدل الانتقال: <strong>{selectedOffer.compensation.transportAllowance.toLocaleString()} ج.م</strong></div>
                  <div>إجمالي الراتب الشهري: <strong className="text-amber-500">{selectedOffer.compensation.totalMonthly.toLocaleString()} ج.م</strong></div>
                </div>
              </div>

              {/* Preboarding documents checklist */}
              <div className="space-y-2">
                <div className="font-bold text-[#142319] dark:text-[#E8F3EB]">{t('مسوغات التعيين المطلوبة (Preboarding Checklist):', 'Preboarding Checklist:')}</div>
                <div className="space-y-1.5">
                  {(selectedOffer.preboardingDocuments || []).map((doc) => (
                    <div key={doc.id} className="p-2 rounded-lg bg-white dark:bg-[#122318] flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        {doc.verificationStatus === 'verified' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-500" />
                        )}
                        <span>{doc.title}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        doc.verificationStatus === 'verified' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {doc.verificationStatus === 'verified' ? t('تم التحقق', 'Verified') : t('قيد الإرفاق', 'Pending')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signature Display if signed */}
              {selectedOffer.candidateSignature && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">تم التوقيع الرقمي المعتمد</div>
                    <div className="text-[10px] text-[#5C665E] dark:text-[#97A69B]">{selectedOffer.candidateSignature.signedAt}</div>
                  </div>
                  <img src={selectedOffer.candidateSignature.signatureDataUrl} alt="Signature" className="h-8 max-w-[120px] object-contain" />
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-[#E0D9CB] dark:border-[#1D3324] flex items-center justify-between">
              {!selectedOffer.isSyncedToCoreHR && (
                <button
                  onClick={() => handleSyncToCoreHR(selectedOffer)}
                  disabled={isSyncing}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 shadow-sm"
                >
                  {t('⚡ اعتماد ونقل الموظف إلى HR والتأمينات', '⚡ Sync to Core HR & Insurance')}
                </button>
              )}

              <button
                onClick={() => setSelectedOffer(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5C665E]"
              >
                {t('إغلاق', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Digital Signature Canvas */}
      {isSignModalOpen && selectedOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0D1C13] border border-[#E0D9CB] dark:border-[#1D3324] shadow-2xl p-6">
            <h3 className="text-base font-bold text-[#142319] dark:text-[#E8F3EB] mb-2">{t('التوقيع الرقمي للمرشح', 'Candidate Digital Signature')}</h3>
            <p className="text-xs text-[#5C665E] dark:text-[#97A69B] mb-4">{t('يرجى التوقيع في المساحة أدناه لاعتماد العرض الوظيفي', 'Draw signature below to accept the offer')}</p>

            <div className="rounded-xl border border-dashed border-[#E0D9CB] dark:border-[#1D3324] bg-white p-2">
              <canvas
                ref={canvasRef}
                width={360}
                height={150}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={() => setIsDrawing(false)}
                onMouseLeave={() => setIsDrawing(false)}
                className="w-full h-[150px] cursor-crosshair"
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setIsSignModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5C665E]"
              >
                {t('إلغاء', 'Cancel')}
              </button>
              <button
                onClick={saveSignature}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-sm"
              >
                {t('اعتماد التوقيع وقبول العرض', 'Save Signature & Accept')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Sync Success Confetti Modal */}
      {isSyncSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0D1C13] border border-emerald-500/30 shadow-2xl p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-lg font-black text-[#142319] dark:text-[#E8F3EB]">{t('تم اعتماد الموظف ونقله بنجاح!', 'Employee Successfully Synced to Core HR!')}</h3>
            <p className="text-xs text-[#5C665E] dark:text-[#97A69B] mt-2 leading-relaxed">
              {t('تم إنشاء ملف الموظف في إدارة الموارد البشرية وإدراج بياناته التأمينية في مركز العمليات التأمينية مع توليد الرقم الوظيفي المعتمد.', 'Candidate dossier converted to Core HR & Social Insurance with assigned employee code.')}
            </p>

            <div className="my-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-xs text-[#5C665E] dark:text-[#97A69B]">{t('الرقم الوظيفي المعتمد للموظف الجديد', 'Assigned Corporate Code')}</div>
              <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">{syncedEmployeeCode}</div>
            </div>

            <button
              onClick={() => {
                setIsSyncSuccessModalOpen(false);
                setSelectedOffer(null);
              }}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md"
            >
              {t('تم، إغلاق والعودة للقائمة', 'Done, Return to Offers')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

