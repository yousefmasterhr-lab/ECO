import React, { useState } from 'react';
import { useHR } from '../../../context/HRContext';
import { useLanguage } from '../../../context/LanguageContext';
import {
  Sparkles,
  Calculator,
  Zap,
  Flame,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Percent,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  FileCheck2,
  Download,
  RotateCcw
} from 'lucide-react';

export const PayrollExView: React.FC = () => {
  const { isRtl, t } = useLanguage();
  const { stats, showToast } = useHR();

  // Dynamic simulation parameters
  const [projectBonusPct, setProjectBonusPct] = useState<number>(12);
  const [overtimeFactor, setOvertimeFactor] = useState<number>(1.5);
  const [hardshipTier, setHardshipTier] = useState<'tier1' | 'tier2' | 'tier3'>('tier2');
  const [taxOptimizationActive, setTaxOptimizationActive] = useState<boolean>(true);

  // Computed Simulations
  const estimatedBonusPool = Math.round(stats.totalPayrollNet * (projectBonusPct / 100));
  const estimatedSiteMultiplier = hardshipTier === 'tier1' ? 1.35 : hardshipTier === 'tier2' ? 1.20 : 1.05;
  const simulatedTotalExPayroll = Math.round(stats.totalPayrollNet + estimatedBonusPool * estimatedSiteMultiplier);

  const handleRunSimulation = (name: string) => {
    showToast(`تم تشغيل عملية [${name}] بنجاح ومزامنة النتائج مع الذاكرة السريعة`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Executive Hero Banner for Payroll - Ex */}
      <div className="relative overflow-hidden rounded-2xl border border-[#D99B26]/40 bg-gradient-to-r from-[#17231A] via-[#1C291E] to-[#121B14] p-5 sm:p-6 text-white shadow-lg">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBB34D]/15 border border-[#EBB34D]/30 text-[#EBB34D] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('محرك الرواتب والعمليات الخاصة المتقدم (Payroll - Ex)', 'Advanced Payroll & Custom Incentive Engine')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#F3EFE6] tracking-tight">
              Payroll - Ex Platform
            </h2>
            <p className="text-xs sm:text-sm text-[#8FA392] max-w-2xl mt-1 leading-relaxed">
              {t(
                'منصة تنفيذية متطورة لتخصيص واحتساب مكافآت الإنجاز، بدلات المواقع الشاقة، وتوزيع نسب وفورات مشروعات المقاولات تلقائياً.',
                'Executive platform for dynamic project incentives, site hardship multipliers, and automated savings distribution.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => handleRunSimulation('محاكاة مسير الرواتب الاستثنائي')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EBB34D] hover:bg-[#F5C76D] text-[#0E1610] text-xs font-black shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{t('تشغيل محاكاة الصرف الاستثنائي', 'Run Ex-Simulation')}</span>
            </button>
          </div>
        </div>

        {/* Ambient Glow Aura */}
        <div className="absolute -top-12 -end-12 w-64 h-64 rounded-full bg-[#D99B26]/10 blur-3xl pointer-events-none" />
      </div>

      {/* High-Level Metric Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">
            <span>{t('معامل الإنتاجية الموزون (WPI)', 'Weighted Productivity Index')}</span>
            <span className="font-mono text-[#059669]">1.18x</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#1A241C] dark:text-[#F3EFE6] font-mono">
            +18.4%
          </div>
          <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-1">
            {t('مستند إلى نسبة تسليم مستخلصات IPC', 'Tied to certified IPC delivery')}
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">
            <span>{t('وعاء حوافز المشروعات المرصود', 'Incentive Pool Allocated')}</span>
            <Percent className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#D99B26] dark:text-[#EBB34D] font-mono">
            {estimatedBonusPool.toLocaleString('en-US')} <span className="text-xs font-sans font-bold">ج.م</span>
          </div>
          <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-1">
            {projectBonusPct}% {t('من صافي التزامات الأجور', 'of total net wages')}
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">
            <span>{t('معامل بدل المواقع الشاقة', 'Site Hardship Coefficient')}</span>
            <Flame className="w-4 h-4 text-[#C2410C]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#1A241C] dark:text-[#F3EFE6] font-mono">
            {estimatedSiteMultiplier}x
          </div>
          <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-1">
            {hardshipTier === 'tier1' ? 'مواقع نائية معزولة (العلمين/الصحراء)' : 'مدن جديدة ومشاريع ضخمة (العاصمة)'}
          </p>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">
            <span>{t('إجمالي المسير المتوقع بعد المحاكاة', 'Simulated Total Payout')}</span>
            <TrendingUp className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {simulatedTotalExPayroll.toLocaleString('en-US')} <span className="text-xs font-sans font-bold">ج.م</span>
          </div>
          <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-1">
            {t('تضمين كافة الحوافز ومصفوفة الإضافي', 'Includes all incentives & overtime')}
          </p>
        </div>
      </div>

      {/* Custom Calculation Slots Grid (4 Interactive Slots) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* SLOT 01: Project Milestones Incentive Formula */}
        <div className="p-5 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#D99B26]/15 border border-[#D99B26]/30 flex items-center justify-center text-[#D99B26] dark:text-[#EBB34D]">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                  {t('خانة الحساب 01: حافز إنجاز المشروعات (% من وفورات البنود)', 'Slot 01: Project Milestone Incentive Pool')}
                </h4>
                <p className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392]">
                  {t('احتساب نسبي ديناميكي يوزع على مهندسي ومشرفي المواقع', 'Dynamic pool distributed to site engineers')}
                </p>
              </div>
            </div>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#FBF9F5] dark:bg-[#0E1610] text-[#D99B26] dark:text-[#EBB34D] border border-[#E0D9CB] dark:border-[#243628]">
              {projectBonusPct}%
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[#5C665E] dark:text-[#8FA392]">
              <span>النسبة المطبقة:</span>
              <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{projectBonusPct}% من إجمالي الأجور</span>
            </div>
            <input
              type="range"
              min="0"
              max="35"
              step="1"
              value={projectBonusPct}
              onChange={e => setProjectBonusPct(Number(e.target.value))}
              className="w-full accent-[#EBB34D] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8FA392] font-mono">
              <span>0% (بدون حافز)</span>
              <span>15% (قياسي)</span>
              <span>35% (حد أقصى)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB]/60 dark:border-[#243628]/60 flex items-center justify-between text-xs">
            <span className="text-[#5C665E] dark:text-[#8FA392]">المبلغ المقدر للصرف:</span>
            <span className="font-mono font-bold text-[#D99B26] dark:text-[#EBB34D] text-sm">
              {estimatedBonusPool.toLocaleString('en-US')} ج.م
            </span>
          </div>
        </div>

        {/* SLOT 02: Overtime Coefficient Engine */}
        <div className="p-5 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#059669]/15 border border-[#059669]/30 flex items-center justify-center text-[#059669]">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                  {t('خانة الحساب 02: مصفوفة ساعات العمل الإضافي (Overtime Matrix)', 'Slot 02: Overtime Coefficient Matrix')}
                </h4>
                <p className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392]">
                  {t('معامل ضرب ساعات العمل الإضافي وأيام العطلات الرسمية', 'Overtime hourly rate multiplier')}
                </p>
              </div>
            </div>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#FBF9F5] dark:bg-[#0E1610] text-[#059669] border border-[#E0D9CB] dark:border-[#243628]">
              {overtimeFactor}x
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { val: 1.25, label: 'أيام العمل العادية (1.25x)' },
              { val: 1.50, label: 'العطلات الأسبوعية (1.50x)' },
              { val: 2.00, label: 'الأعياد الرسمية (2.00x)' },
            ].map(m => (
              <button
                key={m.val}
                onClick={() => setOvertimeFactor(m.val)}
                className={`p-2.5 rounded-xl text-center text-xs font-bold transition-all ${
                  overtimeFactor === m.val
                    ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] shadow-xs'
                    : 'bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#5C665E] dark:text-[#8FA392]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB]/60 dark:border-[#243628]/60 flex items-center justify-between text-xs">
            <span className="text-[#5C665E] dark:text-[#8FA392]">متوسط أجر ساعة الإضافي:</span>
            <span className="font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6]">
              {Math.round(145 * overtimeFactor)} ج.م / ساعة
            </span>
          </div>
        </div>

        {/* SLOT 03: Remote Site Hardship Multiplier */}
        <div className="p-5 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#C2410C]/15 border border-[#C2410C]/30 flex items-center justify-center text-[#C2410C]">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                  {t('خانة الحساب 03: بدل مخاطر وإقامة المواقع الشاقة', 'Slot 03: Site Hardship & Remote Multiplier')}
                </h4>
                <p className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392]">
                  {t('تحديد معامل بدل الموقع حسب تصنيف طبيعة المشروع الجغرافية', 'Site geographic condition tier')}
                </p>
              </div>
            </div>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#FBF9F5] dark:bg-[#0E1610] text-[#C2410C] border border-[#E0D9CB] dark:border-[#243628]">
              {estimatedSiteMultiplier}x
            </span>
          </div>

          <div className="space-y-2">
            {[
              { id: 'tier1', label: 'المستوى الأول: مواقع نائية وصحراوية معزولة (+35%)', desc: 'مشروع العلمين والمناطق الساحلية' },
              { id: 'tier2', label: 'المستوى الثاني: مدن جديدة ومشاريع كبرى (+20%)', desc: 'مشروع الحي الحكومي بالعاصمة الإدارية' },
              { id: 'tier3', label: 'المستوى الثالث: مقرات حضرية ومراكز قيادة (+5%)', desc: 'المقر الإداري والمكاتب الفنية' },
            ].map(tier => (
              <label
                key={tier.id}
                onClick={() => setHardshipTier(tier.id as any)}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  hardshipTier === tier.id
                    ? 'bg-[#1C291E] dark:bg-[#1F2E23] border-[#D99B26] text-[#F3EFE6]'
                    : 'bg-[#FBF9F5] dark:bg-[#0E1610] border-[#E0D9CB] dark:border-[#243628] text-[#5C665E] dark:text-[#8FA392]'
                }`}
              >
                <input
                  type="radio"
                  name="hardship"
                  checked={hardshipTier === tier.id}
                  onChange={() => {}}
                  className="mt-0.5 accent-[#EBB34D]"
                />
                <div>
                  <div className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{tier.label}</div>
                  <div className="text-[10px] text-[#8FA392]">{tier.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* SLOT 04: Tax & Compliance Optimization Simulator */}
        <div className="p-5 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#0D9488]/15 border border-[#0D9488]/30 flex items-center justify-center text-[#0D9488]">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                  {t('خانة الحساب 04: محاكي الامتثال الضريبي للأجور (ETA/ZATCA)', 'Slot 04: Tax & Compliance Optimization')}
                </h4>
                <p className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392]">
                  {t('معالجة الإعفاءات الشخصية ووعاء كسب العمل المعتمد', 'Personal tax exemptions & statutory thresholds')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setTaxOptimizationActive(!taxOptimizationActive)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                taxOptimizationActive
                  ? 'bg-[#2A3F30] text-[#A3CFAC] border border-[#3B5440]'
                  : 'bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392]'
              }`}
            >
              {taxOptimizationActive ? 'مُفعّل' : 'معطّل'}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB]/60 dark:border-[#243628]/60 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#5C665E] dark:text-[#8FA392]">حد الإعفاء الشخصي السنوي:</span>
              <span className="font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6]">20,000 ج.م / سنة</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5C665E] dark:text-[#8FA392]">نسبة الاستقطاع المالي التقديري:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">7.25% (أمثل)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5C665E] dark:text-[#8FA392]">حالة الربط مع منظومة الفاتورة/الأجور:</span>
              <span className="font-bold text-[#059669] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>متوافق كلياً مع ETA</span>
              </span>
            </div>
          </div>

          <p className="text-[10.5px] text-[#8FA392] italic">
            * يتم تطبيق معادلات الشرائح الضريبية آلياً وفقاً لأحدث تعديلات قانون الضريبة على الدخل والاشتراكات التأمينية.
          </p>
        </div>
      </div>

      {/* Dedicated Executive Action Triggers Bar */}
      <div className="p-5 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
          <span>{t('إجراءات ومحفزات التشغيل الخاصة (Executive Action Triggers)', 'Executive Action Triggers')}</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <button
            onClick={() => handleRunSimulation('صرف الأثر الرجعي')}
            className="flex items-center justify-between p-3 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
              <span>صرف الأثر الرجعي للترقيات</span>
            </div>
            <ArrowRight className={`w-3.5 h-3.5 text-[#8FA392] ${isRtl ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={() => handleRunSimulation('تطبيق حوافز إغلاق المشروعات')}
            className="flex items-center justify-between p-3 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#059669]" />
              <span>حوافز إغلاق المستخلصات</span>
            </div>
            <ArrowRight className={`w-3.5 h-3.5 text-[#8FA392] ${isRtl ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={() => handleRunSimulation('تحديث مصفوفة بدلات المشروعات')}
            className="flex items-center justify-between p-3 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#C2410C]" />
              <span>مصفوفة بدلات المشروعات</span>
            </div>
            <ArrowRight className={`w-3.5 h-3.5 text-[#8FA392] ${isRtl ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={() => handleRunSimulation('تصدير ميزان القوى العاملة المتقدم')}
            className="flex items-center justify-between p-3 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-[#0D9488]" />
              <span>تصدير بيانات Ex-Data</span>
            </div>
            <ArrowRight className={`w-3.5 h-3.5 text-[#8FA392] ${isRtl ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
