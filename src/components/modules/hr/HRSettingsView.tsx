import React, { useEffect, useState } from 'react';
import { useHR } from '../../../context/HRContext';
import {
  DEFAULT_EGYPTIAN_HR_SETTINGS,
  EgyptianHRRegulationsConfig,
} from '../../../services/hrStorage';
import {
  Settings2,
  Save,
  Clock,
  Shield,
  Calendar,
  Coins,
  Scale,
  RotateCcw,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

export const HRSettingsView: React.FC = () => {
  const { regulations, updateRegulations, purgeAllHRModuleData, stats, showToast } = useHR();
  const [settings, setSettings] = useState<EgyptianHRRegulationsConfig>(() => ({
    ...DEFAULT_EGYPTIAN_HR_SETTINGS,
    ...regulations,
  }));
  const [confirmPurge, setConfirmPurge] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  useEffect(() => {
    setSettings({ ...DEFAULT_EGYPTIAN_HR_SETTINGS, ...regulations });
  }, [regulations]);

  const handleNumChange = (field: keyof EgyptianHRRegulationsConfig, val: string) => {
    const parsed = parseFloat(val);
    setSettings((prev) => ({
      ...prev,
      [field]: Number.isFinite(parsed) ? parsed : 0,
    }));
  };

  const handleSave = () => {
    updateRegulations(settings);
    showToast('تم حفظ وتطبيق لائحة العمل والتأمينات والضرائب المصرية بنجاح على كافة شركات المجموعة');
  };

  const handleResetDefaults = () => {
    const fresh = { ...DEFAULT_EGYPTIAN_HR_SETTINGS };
    setSettings(fresh);
    updateRegulations(fresh);
    showToast('تمت استعادة المعايير التشريعية المصرية الافتراضية لعام 2026');
  };

  const handleConfirmPurge = async () => {
    setIsPurging(true);
    try {
      await purgeAllHRModuleData();
      setConfirmPurge(false);
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
            <span>اللائحة التنظيمية وقواعد العمل والتأمينات والضرائب المصرية</span>
          </h3>
          <p className="text-xs text-[#5C665E] dark:text-[#8FA392] mt-0.5">
            ضوابط حساب الساعات الإضافية (م85)، التأمينات (148/2019)، شرائح ضريبة كسب العمل (7/2024)، وأرصدة الإجازات (م47)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EAE4D7] dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] text-xs font-bold hover:border-[#D99B26] transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#D99B26] dark:text-[#EBB34D]" />
            <span>استعادة المعايير المصرية 2026</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ وتطبيق الضوابط واللوائح</span>
          </button>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Working Hours & Overtime (Egyptian Labor Law Art. 85) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E0D9CB] dark:border-[#243628]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6]">
                  ساعات العمل ومعاملات الإضافي (مادة 85)
                </h4>
                <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392]">
                  ساعات المقر والمواقع ومعامل الأجر الإضافي
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
              قانون العمل
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                دوام المقر الرئيسي (ساعات)
              </label>
              <input
                type="number"
                value={settings.headquartersHours}
                onChange={(e) => handleNumChange('headquartersHours', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#D99B26] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                دوام المواقع الميدانية (ساعات)
              </label>
              <input
                type="number"
                value={settings.siteHours}
                onChange={(e) => handleNumChange('siteHours', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#D99B26] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                معامل الإضافي النهاري (1.35x)
              </label>
              <input
                type="number"
                step="0.05"
                value={settings.overtimeDayRate}
                onChange={(e) => handleNumChange('overtimeDayRate', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#D99B26] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                معامل الإضافي الليلي (1.70x)
              </label>
              <input
                type="number"
                step="0.05"
                value={settings.overtimeNightRate}
                onChange={(e) => handleNumChange('overtimeNightRate', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#D99B26] outline-hidden"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                معامل العمل في الراحة الأسبوعية / العطلات الرسمية (2.00x)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.overtimeHolidayRate}
                onChange={(e) => handleNumChange('overtimeHolidayRate', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#D99B26] outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* 2. Social Insurance Law 148/2019 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E0D9CB] dark:border-[#243628]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-[#059669] dark:text-emerald-400 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6]">
                  التأمينات الاجتماعية وصندوق الطوارئ (قانون 148 لسنة 2019)
                </h4>
                <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392]">
                  حدود أجر الاشتراك التأميني 2026 وحصص العامل والمنشأة
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-[#059669] dark:text-emerald-300 border border-emerald-500/20">
              تأمينات مصر
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                الحد الأدنى لأجر الاشتراك (ج.م)
              </label>
              <input
                type="number"
                value={settings.socialMinInsuranceWage}
                onChange={(e) => handleNumChange('socialMinInsuranceWage', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#D99B26] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                الحد الأقصى لأجر الاشتراك (ج.م)
              </label>
              <input
                type="number"
                value={settings.socialMaxInsuranceWage}
                onChange={(e) => handleNumChange('socialMaxInsuranceWage', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#D99B26] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                حصة الموظف التأمينية (%)
              </label>
              <input
                type="number"
                step="0.05"
                value={settings.employeeInsurancePercent}
                onChange={(e) => handleNumChange('employeeInsurancePercent', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#D99B26] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                حصة صاحب العمل التأمينية (%)
              </label>
              <input
                type="number"
                step="0.05"
                value={settings.employerInsurancePercent}
                onChange={(e) => handleNumChange('employerInsurancePercent', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#D99B26] outline-hidden"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                نسبة صندوق إعانات الطوارئ للعمال (م9 قانون 156/2002 — تتحملها الشركة % من الأجر الأساسي)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.emergencyFundPercent}
                onChange={(e) => handleNumChange('emergencyFundPercent', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#D99B26] outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* 3. Salary Tax Law 7/2024 & Martyrs Fund */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E0D9CB] dark:border-[#243628]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-[#D99B26] dark:text-[#EBB34D] flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6]">
                  ضريبة كسب العمل وصندوق الشهداء (قانون 7 لسنة 2024)
                </h4>
                <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392]">
                  الإعفاء الشخصي السنوي، الشريحة المعفاة 0%، ومساهمة تكريم الشهداء
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-[#D99B26] dark:text-[#EBB34D] border border-[#D99B26]/30">
              الضرائب المصرية
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                الإعفاء الشخصي السنوي (ج.م)
              </label>
              <input
                type="number"
                value={settings.personalTaxExemptionAnnual}
                onChange={(e) => handleNumChange('personalTaxExemptionAnnual', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#D99B26] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                الشريحة المعفاة 0% سنوياً (ج.م)
              </label>
              <input
                type="number"
                value={settings.zeroTaxBracketAnnual}
                onChange={(e) => handleNumChange('zeroTaxBracketAnnual', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#D99B26] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                مساهمة صندوق الشهداء (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.martyrsFundPercent}
                onChange={(e) => handleNumChange('martyrsFundPercent', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#D99B26] outline-hidden"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[11px] text-[#5C665E] dark:text-[#8FA392] leading-relaxed">
            <strong className="text-[#1A241C] dark:text-[#F3EFE6]">صافي الحد المعفى قبل الضريبة: </strong>
            {(settings.personalTaxExemptionAnnual + settings.zeroTaxBracketAnnual).toLocaleString('en-US')} ج.م سنوياً (ما يعادل{' '}
            {Math.round((settings.personalTaxExemptionAnnual + settings.zeroTaxBracketAnnual) / 12).toLocaleString('en-US')} ج.م شهرياً بعد خصم التأمينات).
          </div>
        </div>

        {/* 4. Leave Policy (Art. 47) & Advances Controls */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E0D9CB] dark:border-[#243628]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-700 dark:text-purple-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6]">
                  أرصدة الإجازات (مادة 47 / 51) وسقف السلف
                </h4>
                <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392]">
                  الاستحقاق السنوي والعارضة (6 أيام) والحد الأقصى للسلفة
                </span>
              </div>
            </div>
            <Coins className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                الإجازة السنوية الاعتيادية (يوم)
              </label>
              <input
                type="number"
                value={settings.annualLeaveStandardDays}
                onChange={(e) => handleNumChange('annualLeaveStandardDays', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#D99B26] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                رصيد +10 سنوات / سن +50 (يوم)
              </label>
              <input
                type="number"
                value={settings.annualLeaveSeniorDays}
                onChange={(e) => handleNumChange('annualLeaveSeniorDays', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#D99B26] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                العارضة السنوية (م51 - أقصى يومين/مرة)
              </label>
              <input
                type="number"
                value={settings.casualLeaveMaxDays}
                onChange={(e) => handleNumChange('casualLeaveMaxDays', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#D99B26] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                سقف القسط الشهري للسلفة (% من الصافي)
              </label>
              <input
                type="number"
                value={settings.maxAdvancePercentOfSalary}
                onChange={(e) => handleNumChange('maxAdvancePercentOfSalary', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#D99B26] outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628]">
            <div>
              <div className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                صرف سلفة طارئة بدون كفيل
              </div>
              <div className="text-[10px] text-[#5C665E] dark:text-[#8FA392]">
                بحد أقصى شهر واحد بعد اجتياز فترة الاختبار (3 أشهر)
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                aria-label="صرف سلفة بدون كفيل"
                checked={settings.allowAdvanceWithoutGuarantor}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    allowAdvanceWithoutGuarantor: e.target.checked,
                  }))
                }
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-[#E0D9CB] dark:bg-[#243628] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#059669]" />
            </label>
          </div>
        </div>
      </div>

      {/* Full HR Data Purge & Clean Reset Governance Zone */}
      <div className="p-5 rounded-2xl bg-rose-500/5 dark:bg-[#1A1315] border border-rose-500/25 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6]">
                منطقة التصفير والتفريغ الشامل لموديول الموارد البشرية (Factory Purge — 0 Records)
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                الرصيد الحالي: {stats.totalEmployees} موظف
              </span>
            </div>
            <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-1 leading-relaxed">
              تصفير كافة جداول الموظفين، المرشحين، العقود، الحضور والانصراف، الإجازات، السلف، والعهد من الذاكرة المحلية وقاعدة البيانات السحابية D1 بالكامل للبدء على نظافة تامة.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!confirmPurge ? (
            <button
              type="button"
              onClick={() => setConfirmPurge(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>تفريغ وتصفير بيانات الموارد البشرية بالكامل</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isPurging}
                onClick={handleConfirmPurge}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-black shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isPurging ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>تأكيد التفريغ النهائي (0 سجلات)</span>
              </button>
              <button
                type="button"
                disabled={isPurging}
                onClick={() => setConfirmPurge(false)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
