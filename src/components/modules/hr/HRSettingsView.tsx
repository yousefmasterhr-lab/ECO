import React, { useState } from 'react';
import { useHR } from '../../../context/HRContext';
import {
  Sliders,
  Clock,
  Coins,
  ShieldCheck,
  Calendar,
  Save
} from 'lucide-react';

export const HRSettingsView: React.FC = () => {
  const { showToast } = useHR();

  const [settings, setSettings] = useState({
    headquartersHours: 8,
    siteHours: 10,
    overtimeWeekdayRate: 1.35,
    overtimeWeekendRate: 1.70,
    socialMinInsuranceWage: 2000,
    socialMaxInsuranceWage: 12600,
    employerInsurancePercent: 18.75,
    employeeInsurancePercent: 11.0,
    annualLeaveStandardDays: 21,
    annualLeaveSeniorDays: 30,
    monthlyLeaveAccrualRate: 1.75,
    allowAdvanceWithoutGuarantor: true,
    maxAdvancePercentOfSalary: 60,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('تم حفظ وتطبيق ضوابط وسياسات الموارد البشرية على كافة شركات المجموعة');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
            <span>إعدادات وسياسات الموارد البشرية واللوائح التنظيمية (HR Configuration)</span>
          </h3>
          <p className="text-xs text-[#5C665E] dark:text-[#8FA392] mt-0.5">
            ضبط ساعات الورديات، مضاعفات الإضافي، شرائح التأمينات، وضوابط سلف العاملين
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EBB34D] text-[#0E1610] text-xs font-bold shadow-md hover:bg-[#d99b26] transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>حفظ التعديلات</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Working Hours & Shifts */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E0D9CB] dark:border-[#243628]">
            <Clock className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
            <h4 className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
              ساعات العمل والورديات الرسمية
            </h4>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">
                ساعات العمل اليومية (المقر الرئيسي والإدارة)
              </label>
              <input
                type="number"
                value={settings.headquartersHours}
                onChange={e => setSettings({ ...settings, headquartersHours: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] outline-hidden focus:border-[#EBB34D]"
              />
            </div>

            <div>
              <label className="block text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">
                ساعات العمل اليومية (المشاريع والمواقع الإنشائية)
              </label>
              <input
                type="number"
                value={settings.siteHours}
                onChange={e => setSettings({ ...settings, siteHours: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] outline-hidden focus:border-[#EBB34D]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">
                  مضاعف الساعات الإضافية (أيام العمل)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={settings.overtimeWeekdayRate}
                  onChange={e => setSettings({ ...settings, overtimeWeekdayRate: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] outline-hidden focus:border-[#EBB34D]"
                />
              </div>

              <div>
                <label className="block text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">
                  مضاعف الساعات الإضافية (العطلات)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={settings.overtimeWeekendRate}
                  onChange={e => setSettings({ ...settings, overtimeWeekendRate: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] outline-hidden focus:border-[#EBB34D]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Social Insurance Brackets */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E0D9CB] dark:border-[#243628]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
              شرائح التأمينات الاجتماعية وقانون العمل المصري
            </h4>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">
                  الحد الأدنى للأجر التأميني (ج.م)
                </label>
                <input
                  type="number"
                  value={settings.socialMinInsuranceWage}
                  onChange={e => setSettings({ ...settings, socialMinInsuranceWage: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] outline-hidden focus:border-[#EBB34D]"
                />
              </div>

              <div>
                <label className="block text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">
                  الحد الأقصى للأجر التأميني (ج.م)
                </label>
                <input
                  type="number"
                  value={settings.socialMaxInsuranceWage}
                  onChange={e => setSettings({ ...settings, socialMaxInsuranceWage: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] outline-hidden focus:border-[#EBB34D]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">
                  حصة المنشأة (%)
                </label>
                <input
                  type="number"
                  step="0.25"
                  value={settings.employerInsurancePercent}
                  onChange={e => setSettings({ ...settings, employerInsurancePercent: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] outline-hidden focus:border-[#EBB34D]"
                />
              </div>

              <div>
                <label className="block text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">
                  حصة الموظف المستقطعة (%)
                </label>
                <input
                  type="number"
                  step="0.25"
                  value={settings.employeeInsurancePercent}
                  onChange={e => setSettings({ ...settings, employeeInsurancePercent: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] outline-hidden focus:border-[#EBB34D]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Leave Policy Rules */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E0D9CB] dark:border-[#243628]">
            <Calendar className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
              سياسة الإجازات والاستحقاق التراكمي
            </h4>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">
                  الإجازة السنوية القياسية (يوم)
                </label>
                <input
                  type="number"
                  value={settings.annualLeaveStandardDays}
                  onChange={e => setSettings({ ...settings, annualLeaveStandardDays: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] outline-hidden focus:border-[#EBB34D]"
                />
              </div>

              <div>
                <label className="block text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">
                  فوق 10 سنوات أو 50 عاماً (يوم)
                </label>
                <input
                  type="number"
                  value={settings.annualLeaveSeniorDays}
                  onChange={e => setSettings({ ...settings, annualLeaveSeniorDays: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] outline-hidden focus:border-[#EBB34D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">
                معدل الاستحقاق الشهري التراكمي (يوم/شهر)
              </label>
              <input
                type="number"
                step="0.05"
                value={settings.monthlyLeaveAccrualRate}
                onChange={e => setSettings({ ...settings, monthlyLeaveAccrualRate: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] outline-hidden focus:border-[#EBB34D]"
              />
            </div>
          </div>
        </div>

        {/* 4. Employee Advances & Loans Policy */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E0D9CB] dark:border-[#243628]">
            <Coins className="w-4 h-4 text-[#EBB34D]" />
            <h4 className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
              سياسة السلف النقدية والقروض الاجتماعية
            </h4>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">
                الحد الأقصى للسلفة كنسبة من صافي الراتب (%)
              </label>
              <input
                type="number"
                value={settings.maxAdvancePercentOfSalary}
                onChange={e => setSettings({ ...settings, maxAdvancePercentOfSalary: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] outline-hidden focus:border-[#EBB34D]"
              />
            </div>

            <div className="flex items-center gap-2 pt-3">
              <input
                type="checkbox"
                id="allowGuarantor"
                checked={settings.allowAdvanceWithoutGuarantor}
                onChange={e => setSettings({ ...settings, allowAdvanceWithoutGuarantor: e.target.checked })}
                className="w-4 h-4 accent-[#EBB34D] cursor-pointer"
              />
              <label htmlFor="allowGuarantor" className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] cursor-pointer">
                السماح بالسلف الطارئة حتى راتب شهر دون ضامن
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
