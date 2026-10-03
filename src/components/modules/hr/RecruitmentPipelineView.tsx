import React, { useState } from 'react';
import { useHR } from '../../../context/HRContext';
import {
  UserPlus,
  ArrowRight,
  Plus,
  Building2
} from 'lucide-react';

interface Candidate {
  id: string;
  nameAr: string;
  jobPosition: string;
  department: string;
  companyNameAr: string;
  mobile: string;
  email: string;
  yearsOfExp: number;
  expectedSalary: number;
  stage: 'new' | 'interview' | 'offer' | 'hired';
  appliedDate: string;
  notes: string;
}

export const RecruitmentPipelineView: React.FC = () => {
  const { showToast } = useHR();

  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      id: 'CAN-101',
      nameAr: 'م. أحمد نبيل الشربيني',
      jobPosition: 'مهندس أول مكتب فني وحصر',
      department: 'المكتب الفني',
      companyNameAr: 'ترابط للمقاولات',
      mobile: '01018892415',
      email: 'ahmed.nabil.eng@gmail.com',
      yearsOfExp: 7,
      expectedSalary: 28000,
      stage: 'interview',
      appliedDate: '2026-09-24',
      notes: 'خبرة ممتازة في تسعير المناقصات ومستخلصات الطرق والكباري',
    },
    {
      id: 'CAN-102',
      nameAr: 'أ. سامح عبد الفتاح درويش',
      jobPosition: 'محاسب تكاليف ومشاريع',
      department: 'الإدارة المالية',
      companyNameAr: 'ماستر جروب',
      mobile: '01124459812',
      email: 'sameh.darwish.acc@gmail.com',
      yearsOfExp: 5,
      expectedSalary: 18500,
      stage: 'offer',
      appliedDate: '2026-09-28',
      notes: 'تمت المقابلة الفنية بنجاح وإرسال مسودة العقد المالي',
    },
    {
      id: 'CAN-103',
      nameAr: 'م. كريم محمود الباز',
      jobPosition: 'مهندس أمن وسلامة وصحة مهنية (HSE)',
      department: 'السلامة والصحة المهنية',
      companyNameAr: 'ترابط للمقاولات',
      mobile: '01289943210',
      email: 'karim.hse@yahoo.com',
      yearsOfExp: 4,
      expectedSalary: 16000,
      stage: 'new',
      appliedDate: '2026-10-01',
      notes: 'حاصل على شهادة أوشا OSHA ونيبوش NEBOSH المعتمدة',
    },
    {
      id: 'CAN-104',
      nameAr: 'أ. محمود جلال الصاوي',
      jobPosition: 'مسؤول مشتريات وتوريدات موقع',
      department: 'سلاسل الإمداد والمشتريات',
      companyNameAr: 'إيمبرو للتجارة والتوريدات',
      mobile: '01004455221',
      email: 'm.sawi.procure@gmail.com',
      yearsOfExp: 6,
      expectedSalary: 21000,
      stage: 'hired',
      appliedDate: '2026-09-15',
      notes: 'تم استلام مسوغات التعيين وإصدار الكود الوظيفي الرسمي',
    },
    {
      id: 'CAN-105',
      nameAr: 'م. شادي علاء الدين إبراهيم',
      jobPosition: 'مهندس مساحة عامة وأجهزة توتال ستيشن',
      department: 'المساحة والرفع الميداني',
      companyNameAr: 'ترابط للمقاولات',
      mobile: '01155998877',
      email: 'shady.surveyor@gmail.com',
      yearsOfExp: 8,
      expectedSalary: 24000,
      stage: 'interview',
      appliedDate: '2026-09-29',
      notes: 'مطلوب دعمه لمشروع شبرا النخل والعزيزية بصورة عاجلة',
    },
  ]);

  const [isNewCandidateOpen, setIsNewCandidateOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    nameAr: '',
    jobPosition: '',
    department: 'المكتب الفني',
    companyNameAr: 'ترابط للمقاولات',
    mobile: '',
    email: '',
    yearsOfExp: 5,
    expectedSalary: 20000,
    notes: '',
  });

  const stages = [
    { id: 'new', label: 'طلبات جديدة ومطابقة السيرة', count: candidates.filter(c => c.stage === 'new').length, color: 'text-blue-400' },
    { id: 'interview', label: 'المقابلات الفنية والهندسية', count: candidates.filter(c => c.stage === 'interview').length, color: 'text-[#EBB34D]' },
    { id: 'offer', label: 'عروض العمل المالية (Job Offers)', count: candidates.filter(c => c.stage === 'offer').length, color: 'text-amber-400' },
    { id: 'hired', label: 'تم الاعتماد واستكمال الملف', count: candidates.filter(c => c.stage === 'hired').length, color: 'text-emerald-400' },
  ];

  const handleAdvanceStage = (candId: string) => {
    setCandidates(prev =>
      prev.map(c => {
        if (c.id !== candId) return c;
        if (c.stage === 'new') return { ...c, stage: 'interview' };
        if (c.stage === 'interview') return { ...c, stage: 'offer' };
        if (c.stage === 'offer') return { ...c, stage: 'hired' };
        return c;
      })
    );
    showToast('تم ترقية المرشح إلى المرحلة التالية في مسار التوظيف');
  };

  const handleCreateCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.nameAr || !newForm.jobPosition) return;

    const cand: Candidate = {
      id: `CAN-${Math.floor(100 + Math.random() * 900)}`,
      nameAr: newForm.nameAr,
      jobPosition: newForm.jobPosition,
      department: newForm.department,
      companyNameAr: newForm.companyNameAr,
      mobile: newForm.mobile || '01000000000',
      email: newForm.email || 'candidate@domain.com',
      yearsOfExp: Number(newForm.yearsOfExp),
      expectedSalary: Number(newForm.expectedSalary),
      stage: 'new',
      appliedDate: '2026-10-02',
      notes: newForm.notes || 'طلب توظيف جديد عبر بوابة الاستقطاب',
    };

    setCandidates(prev => [cand, ...prev]);
    setIsNewCandidateOpen(false);
    showToast('تمت إضافة المرشح الجديد بنجاح إلى مرحلة المطابقة');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
            <span>بوابة التوظيف واستقطاب الكفاءات الهندسية والإدارية (Recruitment Hub)</span>
          </h3>
          <p className="text-xs text-[#5C665E] dark:text-[#8FA392] mt-0.5">
            متابعة مراحل المقابلات الفنية وإصدار العروض المالية لكافة شركات المجموعة والمشاريع
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewCandidateOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EBB34D] text-[#0E1610] text-xs font-bold shadow-md hover:bg-[#d99b26] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ تسجيل مرشح جديد</span>
        </button>
      </div>

      {/* Kanban Pipeline Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stages.map(stage => {
          const stageCandidates = candidates.filter(c => c.stage === stage.id);
          return (
            <div
              key={stage.id}
              className="rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] p-4 flex flex-col space-y-3 min-h-[480px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#E0D9CB] dark:border-[#243628]">
                <span className={`text-xs font-bold ${stage.color}`}>{stage.label}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F3EFE6] dark:bg-[#0E1610] text-[#1A241C] dark:text-[#F3EFE6] border border-[#E0D9CB] dark:border-[#243628]">
                  {stage.count}
                </span>
              </div>

              {/* Candidate Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageCandidates.map(cand => (
                  <div
                    key={cand.id}
                    className="p-3.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#1F2E23] hover:border-[#EBB34D] transition-all shadow-xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                          {cand.nameAr}
                        </div>
                        <div className="text-[11px] font-medium text-[#D99B26] dark:text-[#EBB34D] mt-0.5">
                          {cand.jobPosition}
                        </div>
                      </div>
                      <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-[#17231A] text-[#8FA392]">
                        {cand.id}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[10.5px] text-[#5C665E] dark:text-[#8FA392]">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-[#EBB34D]" />
                        {cand.companyNameAr}
                      </span>
                      <span>•</span>
                      <span>خبرة: {cand.yearsOfExp} سنوات</span>
                    </div>

                    <div className="p-2 rounded-lg bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[10.5px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[#8FA392]">الراتب المتوقع:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {cand.expectedSalary.toLocaleString('en-US')} ج.م
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8FA392] italic line-clamp-2">
                        {cand.notes}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#E0D9CB] dark:border-[#243628]/60 text-[10px] text-[#8FA392]">
                      <span>{cand.appliedDate}</span>
                      {cand.stage !== 'hired' && (
                        <button
                          type="button"
                          onClick={() => handleAdvanceStage(cand.id)}
                          className="flex items-center gap-1 text-[#EBB34D] hover:underline font-bold cursor-pointer"
                        >
                          <span>نقل للمرحلة التالية</span>
                          <ArrowRight className="w-3 h-3 rotate-180" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {stageCandidates.length === 0 && (
                  <div className="py-8 text-center text-xs text-[#8FA392]">
                    لا يوجد مرشحون في هذه المرحلة
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Candidate Modal */}
      {isNewCandidateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-[#17231A] border border-[#243628] text-[#F3EFE6] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#243628]">
              <h4 className="text-sm font-bold text-[#EBB34D]">تسجيل طلب توظيف جديد</h4>
              <button
                type="button"
                onClick={() => setIsNewCandidateOpen(false)}
                className="text-[#8FA392] hover:text-[#F3EFE6] text-xs cursor-pointer"
              >
                ✕ إغلاق
              </button>
            </div>

            <form onSubmit={handleCreateCandidate} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#8FA392] mb-1 font-bold">اسم المرشح بالكامل</label>
                <input
                  type="text"
                  required
                  value={newForm.nameAr}
                  onChange={e => setNewForm({ ...newForm, nameAr: e.target.value })}
                  placeholder="مثال: م. أحمد عبد العظيم"
                  className="w-full p-2.5 rounded-xl bg-[#0E1610] border border-[#243628] text-[#F3EFE6] outline-hidden focus:border-[#EBB34D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8FA392] mb-1 font-bold">المسمى الوظيفي المستهدف</label>
                  <input
                    type="text"
                    required
                    value={newForm.jobPosition}
                    onChange={e => setNewForm({ ...newForm, jobPosition: e.target.value })}
                    placeholder="مهندس موقع، محاسب..."
                    className="w-full p-2.5 rounded-xl bg-[#0E1610] border border-[#243628] text-[#F3EFE6] outline-hidden focus:border-[#EBB34D]"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA392] mb-1 font-bold">الشركة التابعة</label>
                  <select
                    value={newForm.companyNameAr}
                    onChange={e => setNewForm({ ...newForm, companyNameAr: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#0E1610] border border-[#243628] text-[#F3EFE6] outline-hidden focus:border-[#EBB34D]"
                  >
                    <option value="ترابط للمقاولات">ترابط للمقاولات</option>
                    <option value="ماستر جروب">ماستر جروب</option>
                    <option value="ماستر ترافل">ماستر ترافل</option>
                    <option value="إيمبرو للتجارة والتوريدات">إيمبرو للتجارة والتوريدات</option>
                    <option value="جدارة للخدمات">جدارة للخدمات</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8FA392] mb-1 font-bold">رقم الهاتف</label>
                  <input
                    type="text"
                    value={newForm.mobile}
                    onChange={e => setNewForm({ ...newForm, mobile: e.target.value })}
                    placeholder="010XXXXXXXX"
                    className="w-full p-2.5 rounded-xl bg-[#0E1610] border border-[#243628] text-[#F3EFE6] outline-hidden focus:border-[#EBB34D]"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA392] mb-1 font-bold">سنوات الخبرة</label>
                  <input
                    type="number"
                    value={newForm.yearsOfExp}
                    onChange={e => setNewForm({ ...newForm, yearsOfExp: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-[#0E1610] border border-[#243628] text-[#F3EFE6] outline-hidden focus:border-[#EBB34D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8FA392] mb-1 font-bold">الراتب المتوقع (ج.م)</label>
                <input
                  type="number"
                  value={newForm.expectedSalary}
                  onChange={e => setNewForm({ ...newForm, expectedSalary: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-[#0E1610] border border-[#243628] text-[#F3EFE6] outline-hidden focus:border-[#EBB34D]"
                />
              </div>

              <div>
                <label className="block text-[#8FA392] mb-1 font-bold">ملاحظات المقابلة المبدئية</label>
                <textarea
                  rows={2}
                  value={newForm.notes}
                  onChange={e => setNewForm({ ...newForm, notes: e.target.value })}
                  placeholder="ملاحظات حول المؤهل وخبرات المشاريع السابقة..."
                  className="w-full p-2.5 rounded-xl bg-[#0E1610] border border-[#243628] text-[#F3EFE6] outline-hidden focus:border-[#EBB34D]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewCandidateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#0E1610] border border-[#243628] text-[#8FA392] hover:text-[#F3EFE6] cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#EBB34D] text-[#0E1610] font-bold shadow-md hover:bg-[#d99b26] cursor-pointer"
                >
                  حفظ المرشح
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
