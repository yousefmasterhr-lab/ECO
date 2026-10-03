import React, { useState, useEffect } from 'react';
import { Employee, useHR, WorkScheduleConfig } from '../../../context/HRContext';
import { Modal } from '../../common/Modal';
import {
  FileText,
  Clock,
  Coins,
  Upload,
  Trash2,
  Save,
  CheckSquare,
  Square
} from 'lucide-react';

interface EditContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

export const EditContractModal: React.FC<EditContractModalProps> = ({ isOpen, onClose, employee }) => {
  const { updateEmployeeContract } = useHR();

  const [activeTab, setActiveTab] = useState<'contract' | 'hr_attendance' | 'payroll'>('contract');

  // Form State initialized from employee
  const [formData, setFormData] = useState<WorkScheduleConfig>({
    startDate: '2024-04-01',
    endDate: '2027-03-31',
    contractDurationYears: 3,
    officialContractPdf: 'contract_official_signed.pdf',
    hireDate: '2022-04-01',
    noticePeriodMonths: 3,
    hoursPerDay: 8,
    daysPerWeek: 5,
    weeklyHours: 40,
    weekendDays: ['الجمعة', 'السبت'],
    annualTotalDays: 21,
    remainingDays: 9,
    monthlyAccrualDays: 1.75,
    isFlexibleHours: false,
    isRemote: true,
    isDriver: false,
    isBoardMember: false,
    isSiteShifts247: false,
    isFixedHours: true,
    hasSocialInsurance: true,
    socialInsuranceType: 'تأمين كامل نمطي للمهندسين',
    hasMedicalInsurance: true,
    medicalInsuranceMonthlyDeduction: 450,
  });

  const [salaryBasic, setSalaryBasic] = useState<number>(28000);

  useEffect(() => {
    if (employee) {
      setFormData(employee.workSchedule);
      setSalaryBasic(employee.salary.basic);
    }
  }, [employee]);

  if (!employee) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmployeeContract(employee.id, formData, salaryBasic);
    onClose();
  };

  const toggleWeekend = (day: string) => {
    setFormData(prev => {
      const exists = prev.weekendDays.includes(day);
      return {
        ...prev,
        weekendDays: exists ? prev.weekendDays.filter(d => d !== day) : [...prev.weekendDays, day],
      };
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تعديل بنود العقد ونظام العمل (Contract & HR Primitive)"
      subtitle={`${employee.nameAr} (${employee.employeeCode}) - ${employee.jobTitleAr}`}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSave} className="space-y-5">
        {/* Modal Sub-Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F3EFE6] dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
          <button
            type="button"
            onClick={() => setActiveTab('contract')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'contract'
                ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] shadow-sm'
                : 'text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. إعدادات العقد والمرفق</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hr_attendance')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'hr_attendance'
                ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] shadow-sm'
                : 'text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>2. ضوابط الدوام والتأمينات</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payroll')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'payroll'
                ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] shadow-sm'
                : 'text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>3. الراتب والاستحقاقات</span>
          </button>
        </div>

        {/* SECTION 1: CONTRACT SETTINGS */}
        {activeTab === 'contract' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                  تاريخ بداية العقد *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                  تاريخ نهاية العقد *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                  مدة العقد (سنوات)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.contractDurationYears}
                  onChange={(e) => setFormData({ ...formData, contractDurationYears: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] outline-none font-mono"
                />
              </div>
            </div>

            {/* Contract Attachment Primitive */}
            <div className="p-4 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
                  <span>مرفق العقد الرسمي الموقع (PDF)</span>
                </span>
                {formData.officialContractPdf ? (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                    مرفوع وسارٍ
                  </span>
                ) : (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-500 font-bold">
                    غير مرفوع
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-dashed border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#EBB34D]/15 text-[#D99B26] dark:text-[#EBB34D] flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                      {formData.officialContractPdf || 'لم يتم اختيار ملف بعد'}
                    </div>
                    <div className="text-[10px] text-[#5C665E] dark:text-[#8FA392]">
                      صيغ مقبولة: PDF, DOCX (أقصى حجم 15 ميجابايت)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <label className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#1A241C] dark:text-[#F3EFE6] text-xs font-bold hover:bg-[#E0D9CB] dark:hover:bg-[#243628] cursor-pointer transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع ملف</span>
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setFormData({ ...formData, officialContractPdf: file.name });
                      }}
                    />
                  </label>
                  {formData.officialContractPdf && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, officialContractPdf: undefined })}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="حذف المرفق"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: HR & ATTENDANCE SETTINGS */}
        {activeTab === 'hr_attendance' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Row 1: Hire date & Notice period */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                  تاريخ التعيين الرسمي المعتمد
                </label>
                <input
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                  فترة الإشعار قبل إنهاء الخدمة (شهور)
                </label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={formData.noticePeriodMonths}
                  onChange={(e) => setFormData({ ...formData, noticePeriodMonths: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] outline-none font-mono"
                />
              </div>
            </div>

            {/* Row 2: Working Hours Matrix */}
            <div className="p-3.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628]">
              <span className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] block mb-2.5">
                مصفوفة ساعات الدوام الأسبوعية:
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-[#5C665E] dark:text-[#8FA392] mb-1">ساعات الدوام اليومي</label>
                  <input
                    type="number"
                    min="4"
                    max="12"
                    value={formData.hoursPerDay}
                    onChange={(e) => {
                      const h = Number(e.target.value);
                      setFormData({ ...formData, hoursPerDay: h, weeklyHours: h * formData.daysPerWeek });
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#5C665E] dark:text-[#8FA392] mb-1">أيام العمل بالأسبوع</label>
                  <input
                    type="number"
                    min="4"
                    max="7"
                    value={formData.daysPerWeek}
                    onChange={(e) => {
                      const d = Number(e.target.value);
                      setFormData({ ...formData, daysPerWeek: d, weeklyHours: formData.hoursPerDay * d });
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#5C665E] dark:text-[#8FA392] mb-1">إجمالي ساعات الأسبوع</label>
                  <div className="px-2.5 py-1.5 rounded-lg text-xs bg-[#EAE4D7] dark:bg-[#1F2E23] font-mono font-bold text-[#D99B26] dark:text-[#EBB34D]">
                    {formData.weeklyHours} ساعة / أسبوع
                  </div>
                </div>
              </div>

              {/* Weekend Days Selector */}
              <div className="mt-3 pt-3 border-t border-[#E0D9CB]/60 dark:border-[#243628]/60">
                <span className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1.5">
                  أيام العطلة الأسبوعية:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['الجمعة', 'السبت', 'الأحد', 'الخميس'].map(day => {
                    const isSelected = formData.weekendDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleWeekend(day)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610]'
                            : 'bg-white dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] border border-[#E0D9CB] dark:border-[#243628]'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Row 3: Leave Entitlement */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                  رصيد الإجازات السنوي
                </label>
                <input
                  type="number"
                  value={formData.annualTotalDays}
                  onChange={(e) => setFormData({ ...formData, annualTotalDays: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                  الرصيد المتبقي الحالي
                </label>
                <input
                  type="number"
                  value={formData.remainingDays}
                  onChange={(e) => setFormData({ ...formData, remainingDays: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] font-mono font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                  الاستحقاق الشهري (يوم/شهر)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={formData.monthlyAccrualDays}
                  onChange={(e) => setFormData({ ...formData, monthlyAccrualDays: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] font-mono"
                />
              </div>
            </div>

            {/* Row 4: Work Nature Checkboxes (The 6 options) */}
            <div className="p-3.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628]">
              <span className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] block mb-2">
                خيارات طبيعة العمل والتواجد:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                {[
                  { key: 'isFlexibleHours', label: 'ساعات دوام مرنة' },
                  { key: 'isRemote', label: 'عمل عن بُعد / أونلاين' },
                  { key: 'isDriver', label: 'سائق معدات / نقل' },
                  { key: 'isBoardMember', label: 'عضو مجلس إدارة' },
                  { key: 'isSiteShifts247', label: 'ورديات مواقع متغيرة (24/7)' },
                  { key: 'isFixedHours', label: 'ساعات دوام ثابتة' },
                ].map(opt => {
                  const checked = (formData as any)[opt.key];
                  return (
                    <button
                      type="button"
                      key={opt.key}
                      onClick={() => setFormData({ ...formData, [opt.key]: !checked })}
                      className="flex items-center gap-2 text-start p-1.5 rounded-lg hover:bg-[#EAE4D7] dark:hover:bg-[#17231A] transition-colors cursor-pointer select-none"
                    >
                      {checked ? (
                        <CheckSquare className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D] shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-[#5C665E] dark:text-[#8FA392] shrink-0" />
                      )}
                      <span className={`text-[11.5px] ${checked ? 'font-bold text-[#1A241C] dark:text-[#F3EFE6]' : 'text-[#5C665E] dark:text-[#8FA392]'}`}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 5: Social & Medical Insurance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">التأمين الاجتماعي</span>
                  <input
                    type="checkbox"
                    checked={formData.hasSocialInsurance}
                    onChange={(e) => setFormData({ ...formData, hasSocialInsurance: e.target.checked })}
                    className="w-4 h-4 accent-[#EBB34D]"
                  />
                </div>
                <input
                  type="text"
                  value={formData.socialInsuranceType}
                  onChange={(e) => setFormData({ ...formData, socialInsuranceType: e.target.value })}
                  placeholder="نوع التغطية التأمينية..."
                  className="w-full px-2.5 py-1 rounded-lg text-xs bg-[#FBF9F5] dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]"
                />
              </div>

              <div className="p-3 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">التأمين الطبي الخاص</span>
                  <input
                    type="checkbox"
                    checked={formData.hasMedicalInsurance}
                    onChange={(e) => setFormData({ ...formData, hasMedicalInsurance: e.target.checked })}
                    className="w-4 h-4 accent-[#EBB34D]"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">الخصم الشهري:</span>
                  <input
                    type="number"
                    value={formData.medicalInsuranceMonthlyDeduction}
                    onChange={(e) => setFormData({ ...formData, medicalInsuranceMonthlyDeduction: Number(e.target.value) })}
                    className="flex-1 px-2.5 py-1 rounded-lg text-xs bg-[#FBF9F5] dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] font-mono"
                  />
                  <span className="text-[10px] text-[#8FA392]">ج.م</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: PAYROLL & WAGE */}
        {activeTab === 'payroll' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-4 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] space-y-3">
              <label className="block text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                تحديد الراتب الأساسي الشهري (Egyptian Pounds) *
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="5000"
                    step="500"
                    value={salaryBasic}
                    onChange={(e) => setSalaryBasic(Number(e.target.value))}
                    className="w-full ps-4 pe-14 py-2.5 rounded-xl text-base font-black font-mono bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] outline-none"
                    required
                  />
                  <span className="absolute end-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#D99B26] dark:text-[#EBB34D]">
                    ج.م
                  </span>
                </div>
                <div className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                  صافي الراتب التقديري بعد البدلات: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{(salaryBasic + employee.salary.allowances - employee.salary.deductions).toLocaleString('en-US')} ج.م</span>
                </div>
              </div>

              <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                * يتم تحديث مسير الرواتب الشهري المعتمد تلقائياً، وتنعكس التزامات السيولة مباشرة في حساب الشؤون المالية (230101).
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E0D9CB] dark:border-[#243628]">
          <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
            تاريخ آخر اعتماد: <span className="font-mono font-bold">2026-10-02</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-all cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>حفظ واعتماد التعديلات</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
