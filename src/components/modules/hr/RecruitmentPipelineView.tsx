import React, { useState, useEffect } from 'react';
import { useHR, HRCandidate } from '../../../context/HRContext';
import { companyStorage } from '../companies/companyStorage';
import { CompanyEntity } from '../companies/types';
import { Modal } from '../../common/Modal';
import {
  UserPlus,
  ArrowRight,
  Plus,
  Building2,
  UserCheck
} from 'lucide-react';

export const RecruitmentPipelineView: React.FC = () => {
  const { candidates, addCandidate, advanceCandidateStage, addEmployee, showToast } = useHR();
  const [companies, setCompanies] = useState<CompanyEntity[]>(() => companyStorage.getCompaniesSync());

  useEffect(() => {
    companyStorage.getCompanies().then((list) => {
      if (Array.isArray(list) && list.length > 0) setCompanies(list);
    });
    const onUpdate = () => setCompanies(companyStorage.getCompaniesSync());
    window.addEventListener('eco-companies-updated', onUpdate);
    return () => window.removeEventListener('eco-companies-updated', onUpdate);
  }, []);

  const [isNewCandidateOpen, setIsNewCandidateOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    nameAr: '',
    jobPosition: '',
    department: 'المكتب الفني والتنفيذ',
    companyNameAr: companies[0]?.nameAr || 'ترابط للمقاولات',
    mobile: '',
    email: '',
    yearsOfExp: 5,
    expectedSalary: 18000,
    notes: '',
  });

  const stages: Array<{ id: HRCandidate['stage']; label: string; color: string }> = [
    { id: 'new', label: 'طلبات جديدة وفحص السيرة', color: 'text-[#059669] dark:text-[#34D399]' },
    { id: 'interview', label: 'المقابلات الفنية والهندسية', color: 'text-[#D99B26] dark:text-[#EBB34D]' },
    { id: 'offer', label: 'عروض العمل المالية (Job Offers)', color: 'text-[#D99B26] dark:text-[#EBB34D]' },
    { id: 'hired', label: 'معتمد للتعيين (مسوغات س1)', color: 'text-[#059669] dark:text-emerald-400' },
  ];

  const handleCreateCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.nameAr.trim() || !newForm.jobPosition.trim()) return;

    addCandidate({
      nameAr: newForm.nameAr.trim(),
      jobPosition: newForm.jobPosition.trim(),
      department: newForm.department,
      companyNameAr: newForm.companyNameAr,
      mobile: newForm.mobile.trim(),
      email: newForm.email.trim(),
      yearsOfExp: Number(newForm.yearsOfExp),
      expectedSalary: Number(newForm.expectedSalary),
      notes: newForm.notes.trim() || 'مرشح جديد عبر بوابة الاستقطاب المصرية',
    });

    setIsNewCandidateOpen(false);
    setNewForm({
      nameAr: '',
      jobPosition: '',
      department: 'المكتب الفني والتنفيذ',
      companyNameAr: companies[0]?.nameAr || '',
      mobile: '',
      email: '',
      yearsOfExp: 5,
      expectedSalary: 18000,
      notes: '',
    });
  };

  const handleConvertToEmployee = (cand: HRCandidate) => {
    const matchedComp = companies.find((c) => c.nameAr === cand.companyNameAr) || companies[0];
    addEmployee({
      nameAr: cand.nameAr,
      jobTitleAr: cand.jobPosition,
      departmentAr: cand.department,
      companyId: matchedComp?.id || '',
      companyNameAr: cand.companyNameAr || matchedComp?.nameAr || '',
      mobile: cand.mobile,
      email: cand.email,
      salary: {
        basic: cand.expectedSalary,
        allowances: 0,
        deductions: 0,
        net: cand.expectedSalary,
      },
    });
    showToast(`تم تحويل (${cand.nameAr}) إلى موظف فعلي وإصدار ملف مسوغات التعيين واستمارة س1`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
            <span>بوابة استقطاب الكفاءات والتعيينات (Egyptian Talent Acquisition)</span>
          </h3>
          <p className="text-xs text-[#5C665E] dark:text-[#8FA392] mt-0.5">
            متابعة مراحل المقابلات الفنية وإصدار العروض المالية وتحويل المقبولين مباشرة إلى سجل الموظفين ومسار س1 تأمينات
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewCandidateOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-md shadow-emerald-900/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ تسجيل مرشح جديد</span>
        </button>
      </div>

      {/* Kanban Pipeline Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stages.map((stage) => {
          const stageCandidates = candidates.filter((c) => c.stage === stage.id);
          return (
            <div
              key={stage.id}
              className="rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] p-4 flex flex-col space-y-3 min-h-[420px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#E0D9CB] dark:border-[#243628]">
                <span className={`text-xs font-bold ${stage.color}`}>{stage.label}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FBF9F5] dark:bg-[#0E1610] text-[#1A241C] dark:text-[#F3EFE6] border border-[#E0D9CB] dark:border-[#243628]">
                  {stageCandidates.length}
                </span>
              </div>

              {/* Candidate Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageCandidates.map((cand) => (
                  <div
                    key={cand.id}
                    className="p-3.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#1F2E23] hover:border-[#D99B26] dark:hover:border-[#EBB34D] transition-all shadow-xs space-y-2.5"
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
                      <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-[#EAE4D7] dark:bg-[#0E1610] text-[#5C665E] dark:text-[#8FA392]">
                        {cand.id}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[10.5px] text-[#5C665E] dark:text-[#8FA392]">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-[#D99B26] dark:text-[#EBB34D]" />
                        {cand.companyNameAr}
                      </span>
                      <span>•</span>
                      <span>خبرة: {cand.yearsOfExp} سنوات</span>
                    </div>

                    <div className="p-2 rounded-lg bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[10.5px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[#5C665E] dark:text-[#8FA392]">الراتب المتوقع:</span>
                        <span className="font-mono font-bold text-[#059669] dark:text-emerald-400">
                          {cand.expectedSalary.toLocaleString('en-US')} ج.م
                        </span>
                      </div>
                      <p className="text-[10px] text-[#5C665E] dark:text-[#8FA392] line-clamp-2">
                        {cand.notes}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#E0D9CB] dark:border-[#243628]/60 text-[10px] text-[#5C665E] dark:text-[#8FA392]">
                      <span className="font-mono">{cand.appliedDate}</span>
                      {cand.stage !== 'hired' ? (
                        <button
                          type="button"
                          onClick={() => advanceCandidateStage(cand.id)}
                          className="flex items-center gap-1 text-[#D99B26] dark:text-[#EBB34D] hover:underline font-bold cursor-pointer"
                        >
                          <span>ترقية للمرحلة التالية</span>
                          <ArrowRight className="w-3 h-3 rotate-180" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleConvertToEmployee(cand)}
                          className="flex items-center gap-1 text-[#059669] dark:text-emerald-400 hover:underline font-bold cursor-pointer"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>تحويل لموظف فعلي</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {stageCandidates.length === 0 && (
                  <div className="py-10 text-center text-xs text-[#5C665E] dark:text-[#8FA392]">
                    لا يوجد مرشحون في هذه المرحلة حالياً
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Candidate Modal */}
      <Modal
        isOpen={isNewCandidateOpen}
        onClose={() => setIsNewCandidateOpen(false)}
        title="تسجيل مرشح وطلب توظيف جديد"
        subtitle="إدراج الكوادر المرشحة للتقييم الهندسي والإداري وفق اللوائح المصرية"
        icon={UserPlus}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateCandidate} className="space-y-3 text-xs">
          <div>
            <label className="block text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">اسم المرشح بالكامل *</label>
            <input
              type="text"
              required
              value={newForm.nameAr}
              onChange={(e) => setNewForm({ ...newForm, nameAr: e.target.value })}
              placeholder="مثال: م. أحمد محمود الشربيني"
              className="w-full p-2.5 rounded-xl bg-white dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] outline-hidden focus:border-[#D99B26]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">المسمى الوظيفي المستهدف *</label>
              <input
                type="text"
                required
                value={newForm.jobPosition}
                onChange={(e) => setNewForm({ ...newForm, jobPosition: e.target.value })}
                placeholder="مهندس موقع، محاسب تكاليف..."
                className="w-full p-2.5 rounded-xl bg-white dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] outline-hidden focus:border-[#D99B26]"
              />
            </div>
            <div>
              <label className="block text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">الشركة التابعة</label>
              <select
                value={newForm.companyNameAr}
                onChange={(e) => setNewForm({ ...newForm, companyNameAr: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] outline-hidden focus:border-[#D99B26]"
              >
                {companies.length > 0 ? (
                  companies.map((c) => (
                    <option key={c.id} value={c.nameAr} className="bg-white dark:bg-[#0E1610] text-[#1A241C] dark:text-[#F3EFE6]">
                      {c.nameAr}
                    </option>
                  ))
                ) : (
                  <option value="الشركة الرئيسية">الشركة الرئيسية</option>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">رقم الهاتف</label>
              <input
                type="text"
                value={newForm.mobile}
                onChange={(e) => setNewForm({ ...newForm, mobile: e.target.value })}
                placeholder="010XXXXXXXX"
                className="w-full p-2.5 rounded-xl bg-white dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] font-mono outline-hidden focus:border-[#D99B26]"
              />
            </div>
            <div>
              <label className="block text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">سنوات الخبرة</label>
              <input
                type="number"
                value={newForm.yearsOfExp}
                onChange={(e) => setNewForm({ ...newForm, yearsOfExp: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] font-mono outline-hidden focus:border-[#D99B26]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">الراتب المقترح (ج.م)</label>
            <input
              type="number"
              value={newForm.expectedSalary}
              onChange={(e) => setNewForm({ ...newForm, expectedSalary: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl bg-white dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] font-mono outline-hidden focus:border-[#D99B26]"
            />
          </div>

          <div>
            <label className="block text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">ملاحظات المقابلة الفنية</label>
            <textarea
              rows={2}
              value={newForm.notes}
              onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })}
              placeholder="ملاحظات حول المؤهل وخبرات المواقع السابقة..."
              className="w-full p-2.5 rounded-xl bg-white dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] outline-hidden focus:border-[#D99B26]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E0D9CB] dark:border-[#243628]">
            <button
              type="button"
              onClick={() => setIsNewCandidateOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#1A241C] dark:text-[#F3EFE6] font-bold cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold shadow-md cursor-pointer"
            >
              حفظ المرشح
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
