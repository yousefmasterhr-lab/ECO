import React, { useState, useMemo } from 'react';
import {
  FileText,
  User,
  GraduationCap,
  Award,
  Briefcase,
  BookOpen,
  ShieldCheck,
  Plus,
  Trash2,
  UploadCloud,
  CheckCircle2,
  Building2,
  Printer,
  X,
  UserPlus,
  Send,
  AlertCircle,
  Sparkles,
  FileCheck2,
} from 'lucide-react';
import {
  TarabotApplicationForm,
  TarabotEducationRow,
  TarabotTrainingRow,
  TarabotExperienceRow,
  SkillLevelRating,
  MaritalStatusAr,
  MilitaryStatusAr,
  Candidate,
} from './types';
import { parseEgyptianNationalId } from '../../../utils/egyptianLaborAlgorithms';
import { tafqeet } from '../../../utils/tafqeet';
import { atsStorage } from '../../../services/atsStorage';

const MARITAL_OPTIONS: MaritalStatusAr[] = ['أعزب', 'متزوج', 'مطلق', 'أرمل'];
const MILITARY_OPTIONS: MilitaryStatusAr[] = [
  'لم يصبه الدور',
  'أدى الخدمة',
  'إعفاء نهائى',
  'إعفاء مؤقت',
  'غير خاضع',
];
const SKILL_LEVELS: SkillLevelRating[] = ['جيد جداً', 'جيد', 'متوسط', 'ضعيف'];

export const OFFICIAL_LAW_14_2025_DECLARATION =
  'أشهد أنا موقع هذا الطلب أن البيانات المدونة صحيحة وأن أى مغالطة أو إغفال للحقائق فى هذا الطلب يعد سبباً لفصلى من العمل . وفى حالة تعيينى أوافق على إجراء الفحص الطبى وأوافق أن يكون إستخدامى طبقاً لقانون العمل رقم ١٤ لسنة ٢٠٢٥ وقواعد الشركة ولوائحها وأى تعديلات تطرأ عليها .';

const createEmptyEducationRow = (): TarabotEducationRow => ({
  id: `edu_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  degree: '',
  graduationYear: '',
  major: '',
  studyDuration: '',
});

const createEmptyTrainingRow = (): TarabotTrainingRow => ({
  id: `trn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  courseType: '',
  title: '',
  date: '',
  duration: '',
  provider: '',
});

const createEmptyExperienceRow = (): TarabotExperienceRow => ({
  id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  employer: '',
  duration: '',
  jobTitle: '',
  leavingReason: '',
});

export const buildInitialTarabotForm = (
  initialJobTitle = '',
  initialDepartment = '',
  mode: 'public' | 'internal' = 'public',
  overrides?: Partial<TarabotApplicationForm>
): TarabotApplicationForm => {
  const today = new Date().toISOString().slice(0, 10);
  return {
    registrationNumber: overrides?.registrationNumber || '',
    applicationDate: overrides?.applicationDate || today,
    fullName: overrides?.fullName || '',
    nationality: overrides?.nationality || 'مصرى',
    nationalId: overrides?.nationalId || '',
    nationalIdExpiryDate: overrides?.nationalIdExpiryDate || '',
    birthDate: overrides?.birthDate || '',
    governorate: overrides?.governorate || '',
    gender: overrides?.gender,
    residenceAddress: overrides?.residenceAddress || '',
    landlinePhone: overrides?.landlinePhone || '',
    mobilePhone: overrides?.mobilePhone || '',
    email: overrides?.email || '',
    maritalStatus: overrides?.maritalStatus || 'أعزب',
    positionAppliedFor: overrides?.positionAppliedFor || initialJobTitle,
    department: overrides?.department || initialDepartment,
    militaryStatus: overrides?.militaryStatus || 'لم يصبه الدور',
    militaryExemptionReason: overrides?.militaryExemptionReason || '',
    militaryTempExemptionYears: overrides?.militaryTempExemptionYears || '',
    militaryTempExemptionEndDate: overrides?.militaryTempExemptionEndDate || '',
    previouslyInsured: overrides?.previouslyInsured ?? false,
    socialInsuranceNumber: overrides?.socialInsuranceNumber || '',
    educationHistory:
      overrides?.educationHistory && overrides.educationHistory.length > 0
        ? overrides.educationHistory
        : [createEmptyEducationRow()],
    acquiredSkills: overrides?.acquiredSkills || {
      englishLanguage: 'جيد',
      computerSkills: 'جيد جداً',
      interpersonalSkills: 'جيد جداً',
    },
    trainingCourses:
      overrides?.trainingCourses && overrides.trainingCourses.length > 0
        ? overrides.trainingCourses
        : [createEmptyTrainingRow()],
    workExperiences:
      overrides?.workExperiences && overrides.workExperiences.length > 0
        ? overrides.workExperiences
        : [createEmptyExperienceRow()],
    declarationAccepted: overrides?.declarationAccepted ?? mode === 'internal',
    applicantSignature: overrides?.applicantSignature || '',
    cvFileName: overrides?.cvFileName || '',
    cvFileDataUrl: overrides?.cvFileDataUrl || '',
    scannedPaperFormName: overrides?.scannedPaperFormName || '',
    scannedPaperFormDataUrl: overrides?.scannedPaperFormDataUrl || '',
    hrManagerEvaluation: overrides?.hrManagerEvaluation || '',
    departmentManagerEvaluation: overrides?.departmentManagerEvaluation || '',
    hiringStartDate: overrides?.hiringStartDate || '2026-01-01',
    agreedSalary: overrides?.agreedSalary ?? undefined,
    agreedSalaryText: overrides?.agreedSalaryText || '',
    managementNotes: overrides?.managementNotes || '',
    hrApprovalName: overrides?.hrApprovalName || '',
    deptManagerApprovalName: overrides?.deptManagerApprovalName || '',
    ceoApprovalName: overrides?.ceoApprovalName || '',
    ceoApprovalStatus: overrides?.ceoApprovalStatus || 'pending',
    entryChannel:
      overrides?.entryChannel ||
      (mode === 'internal' ? 'internal_digitization' : 'public_portal'),
    digitizedBy: overrides?.digitizedBy || '',
  };
};

interface TarabotApplicationFormViewProps {
  mode: 'public' | 'internal';
  initialJobTitle?: string;
  initialDepartment?: string;
  initialForm?: Partial<TarabotApplicationForm>;
  isSubmitting?: boolean;
  onSubmit: (
    form: TarabotApplicationForm,
    saveTarget: 'candidate_only' | 'direct_hire_employee'
  ) => Promise<void> | void;
  onCancel?: () => void;
}

const INPUT_CLASS =
  'w-full px-3.5 py-2.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FFFFFF] dark:bg-[#17231A] text-xs font-medium text-[#1A241C] dark:text-[#F3EFE6] placeholder-[#8FA392]/70 focus:outline-none focus:ring-2 focus:ring-[#D99B26]/60 focus:border-[#D99B26] transition-all';

const LABEL_CLASS =
  'block text-[11.5px] font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1.5';

const SECTION_CARD_CLASS =
  'rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FFFFFF] dark:bg-[#141E16] p-5 sm:p-6 shadow-xs space-y-5';

export const TarabotApplicationFormView: React.FC<TarabotApplicationFormViewProps> = ({
  mode,
  initialJobTitle = '',
  initialDepartment = '',
  initialForm,
  isSubmitting = false,
  onSubmit,
  onCancel,
}) => {
  const [form, setForm] = useState<TarabotApplicationForm>(() =>
    buildInitialTarabotForm(initialJobTitle, initialDepartment, mode, initialForm)
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const nidAnalysis = useMemo(
    () => (form.nationalId.trim() ? parseEgyptianNationalId(form.nationalId) : null),
    [form.nationalId]
  );

  const handleNationalIdChange = (rawValue: string) => {
    const cleaned = rawValue.replace(/[^\d]/g, '').slice(0, 14);
    const parsed = cleaned.length === 14 ? parseEgyptianNationalId(cleaned) : null;
    setForm((prev) => ({
      ...prev,
      nationalId: cleaned,
      birthDate: parsed?.isValid && parsed.birthDate ? parsed.birthDate : prev.birthDate,
      governorate:
        parsed?.isValid && parsed.governorateName ? parsed.governorateName : prev.governorate,
      gender: parsed?.isValid && parsed.gender ? parsed.gender : prev.gender,
    }));
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'cv' | 'scanned_form'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const setNameAndData = (dataUrl?: string) => {
      setForm((prev) =>
        target === 'cv'
          ? { ...prev, cvFileName: file.name, cvFileDataUrl: dataUrl }
          : { ...prev, scannedPaperFormName: file.name, scannedPaperFormDataUrl: dataUrl }
      );
    };
    if (file.size <= 900 * 1024) {
      const reader = new FileReader();
      reader.onload = () => setNameAndData(typeof reader.result === 'string' ? reader.result : '');
      reader.readAsDataURL(file);
    } else {
      setNameAndData('');
    }
  };

  const handleAgreedSalaryChange = (rawVal: string) => {
    const numeric = rawVal === '' ? undefined : Number(rawVal);
    const tafqeetStr =
      numeric !== undefined && !Number.isNaN(numeric) && numeric > 0
        ? tafqeet(numeric, 'EGP')
        : '';
    setForm((prev) => ({
      ...prev,
      agreedSalary: numeric,
      agreedSalaryText: tafqeetStr,
    }));
  };

  // Dynamic Table Updaters
  const updateEducationRow = (
    idx: number,
    field: keyof TarabotEducationRow,
    val: string
  ) => {
    setForm((prev) => ({
      ...prev,
      educationHistory: prev.educationHistory.map((row, i) =>
        i === idx ? { ...row, [field]: val } : row
      ),
    }));
  };

  const updateTrainingRow = (idx: number, field: keyof TarabotTrainingRow, val: string) => {
    setForm((prev) => ({
      ...prev,
      trainingCourses: prev.trainingCourses.map((row, i) =>
        i === idx ? { ...row, [field]: val } : row
      ),
    }));
  };

  const updateExperienceRow = (
    idx: number,
    field: keyof TarabotExperienceRow,
    val: string
  ) => {
    setForm((prev) => ({
      ...prev,
      workExperiences: prev.workExperiences.map((row, i) =>
        i === idx ? { ...row, [field]: val } : row
      ),
    }));
  };

  const handleFormAction = async (
    saveTarget: 'candidate_only' | 'direct_hire_employee'
  ) => {
    setValidationError(null);
    if (!form.fullName.trim()) {
      setValidationError('يرجى إدخال الاسم بالكامل.');
      return;
    }
    if (!form.nationalId.trim() || (form.nationalId.length === 14 && nidAnalysis && !nidAnalysis.isValid)) {
      setValidationError(
        nidAnalysis?.errorMessage || 'يرجى إدخال الرقم القومي المكون من 14 رقماً بشكل صحيح.'
      );
      return;
    }
    if (!form.mobilePhone.trim()) {
      setValidationError('يرجى إدخال رقم تليفون الموبايل.');
      return;
    }
    if (!form.positionAppliedFor.trim()) {
      setValidationError('يرجى تحديد الوظيفة المتقدم لها.');
      return;
    }
    if (mode === 'public' && !form.declarationAccepted) {
      setValidationError('يجب الموافقة على الإقرار القانوني الخاص بصحة البيانات وقانون العمل 14 لسنة 2025.');
      return;
    }

    const cleanedForm: TarabotApplicationForm = {
      ...form,
      educationHistory: form.educationHistory.filter(
        (r) => r.degree.trim() || r.major.trim() || r.graduationYear.trim()
      ),
      trainingCourses: form.trainingCourses.filter(
        (r) => r.title.trim() || r.courseType.trim() || r.provider.trim()
      ),
      workExperiences: form.workExperiences.filter(
        (r) => r.employer.trim() || r.jobTitle.trim()
      ),
      applicantSignature: form.applicantSignature.trim() || form.fullName.trim(),
    };

    await onSubmit(cleanedForm, saveTarget);
  };

  return (
    <div dir="rtl" className="space-y-6">
      {/* Official Tarabot Bilingual Document Header */}
      <div className="rounded-3xl border border-[#D99B26]/40 bg-gradient-to-l from-[#F3EFE6] via-[#FBF9F5] to-[#FFFFFF] dark:from-[#121B14] dark:via-[#141E16] dark:to-[#0E1610] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-[#E0D9CB] dark:border-[#243628]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#059669]/10 text-[#059669] dark:text-emerald-400 border border-[#059669]/25 text-[11px] font-bold">
              <Building2 className="w-3.5 h-3.5" />
              <span>
                {mode === 'internal'
                  ? 'نموذج تفريغ الأرشيف الورقي وإدخال السير الذاتية (داخلي)'
                  : 'استمارة التقديم الرسمية المعتمدة — بوابة التوظيف'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[#1A241C] dark:text-[#F3EFE6]">
              شركة ترابط للإستثمارات و المشروعات <span className="text-[#D99B26] font-extrabold">مساهمة مصرية</span>
            </h2>
            <p className="text-xs font-mono text-[#5C665E] dark:text-[#8FA392]">
              Tarabot Company Investment & Projects Egyptian joint stock
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="px-4 py-2.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-center">
              <div className="text-[10px] font-bold text-[#5C665E] dark:text-[#8FA392]">
                سجل الطلب برقم ( / 2026 )
              </div>
              <input
                type="text"
                value={form.registrationNumber}
                onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                placeholder={mode === 'internal' ? 'مثال: 104 / 2026' : 'يُولّد تلقائياً عند الإرسال'}
                className="mt-1 w-full text-center text-xs font-mono font-bold bg-transparent text-[#D99B26] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D99B26]/15 text-[#D99B26] flex items-center justify-center border border-[#D99B26]/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#1A241C] dark:text-[#F3EFE6]">طلب توظيف</h3>
              <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                {mode === 'internal'
                  ? 'يشمل الصفحة الأولى (بيانات المتقدم والمؤهلات والخبرات) والصفحة الثانية (تقييم الإدارة وقرار التعيين)'
                  : 'يرجى استيفاء جميع البيانات بدقة طبقاً لبطاقة الرقم القومي والمستندات الرسمية'}
              </p>
            </div>
          </div>

          <div className="text-xs font-bold text-[#059669] dark:text-emerald-400 bg-[#059669]/10 px-3 py-1.5 rounded-xl border border-[#059669]/20">
            قانون العمل المصري رقم 14 لسنة 2025
          </div>
        </div>
      </div>

      {/* SECTION 1: معلومات عامة */}
      <div className={SECTION_CARD_CLASS}>
        <div className="flex items-center justify-between border-b border-[#E0D9CB] dark:border-[#243628] pb-3">
          <h4 className="text-sm font-black text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
            <User className="w-4 h-4 text-[#D99B26]" />
            <span>أولاً: معلومات عامة (بيانات الهوية والتواصل والتجنيد والتأمينات)</span>
          </h4>
          {nidAnalysis?.isValid && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#059669]/10 text-[#059669] dark:text-emerald-400 border border-[#059669]/25">
              <Sparkles className="w-3 h-3" />
              <span>
                {nidAnalysis.governorateName} • {nidAnalysis.genderAr} • {nidAnalysis.ageYears} سنة
              </span>
            </span>
          )}
        </div>

        {/* Row 1: الاسم + الجنسية */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className={LABEL_CLASS}>الأسم بالكامل (كما هو ببطاقة الرقم القومى) *</label>
            <input
              type="text"
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="مثال: أحمد محمود محمد عبد الرحمن"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>الجنسية *</label>
            <input
              type="text"
              value={form.nationality}
              onChange={(e) => setForm({ ...form, nationality: e.target.value })}
              placeholder="مصرى"
              className={INPUT_CLASS}
            />
          </div>
        </div>

        {/* Row 2: الرقم القومى + تاريخ انتهاء البطاقة + تاريخ الميلاد */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={LABEL_CLASS}>الرقم القومى (14 رقماً) *</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={14}
              required
              dir="ltr"
              value={form.nationalId}
              onChange={(e) => handleNationalIdChange(e.target.value)}
              placeholder="29501010100123"
              className={`${INPUT_CLASS} font-mono tracking-wider text-right`}
            />
            {form.nationalId.length > 0 && nidAnalysis && !nidAnalysis.isValid && (
              <p className="text-[10.5px] text-rose-500 mt-1 font-semibold">
                {nidAnalysis.errorMessage}
              </p>
            )}
          </div>

          <div>
            <label className={LABEL_CLASS}>تاريخ أنتهاء بطاقة شخصية *</label>
            <input
              type="date"
              value={form.nationalIdExpiryDate}
              onChange={(e) => setForm({ ...form, nationalIdExpiryDate: e.target.value })}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>تاريخ الميلاد *</label>
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              className={INPUT_CLASS}
            />
          </div>
        </div>

        {/* Row 3: مكان الإقامة */}
        <div>
          <label className={LABEL_CLASS}>مكان الإقامة (العنوان بالتفصيل كما بالبطاقة أو السكن الفعلى) *</label>
          <input
            type="text"
            value={form.residenceAddress}
            onChange={(e) => setForm({ ...form, residenceAddress: e.target.value })}
            placeholder="المحافظة / الحي / اسم الشارع / رقم العقار"
            className={INPUT_CLASS}
          />
        </div>

        {/* Row 4: الهواتف والبريد */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={LABEL_CLASS}>رقم تليفون الموبايل *</label>
            <input
              type="tel"
              required
              dir="ltr"
              value={form.mobilePhone}
              onChange={(e) => setForm({ ...form, mobilePhone: e.target.value })}
              placeholder="01012345678"
              className={`${INPUT_CLASS} font-mono text-right`}
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>رقم تليفون المنزل</label>
            <input
              type="tel"
              dir="ltr"
              value={form.landlinePhone}
              onChange={(e) => setForm({ ...form, landlinePhone: e.target.value })}
              placeholder="02-23456789"
              className={`${INPUT_CLASS} font-mono text-right`}
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>البريد الإلكتروني (اختياري)</label>
            <input
              type="email"
              dir="ltr"
              value={form.email || ''}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="applicant@example.com"
              className={`${INPUT_CLASS} text-right`}
            />
          </div>
        </div>

        {/* Row 5: الحالة الاجتماعية + الوظيفة المتقدم لها + الإدارة */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <div>
            <label className={LABEL_CLASS}>الحالة الأجتماعية *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2">
              {MARITAL_OPTIONS.map((opt) => {
                const active = form.maritalStatus === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setForm({ ...form, maritalStatus: opt })}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      active
                        ? 'bg-[#059669] text-white border-[#059669] shadow-xs'
                        : 'bg-[#FBF9F5] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] border-[#E0D9CB] dark:border-[#243628] hover:border-[#D99B26]'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>الوظيفة المتقدم لها *</label>
            <input
              type="text"
              required
              value={form.positionAppliedFor}
              onChange={(e) => setForm({ ...form, positionAppliedFor: e.target.value })}
              placeholder="مثال: مهندس موقع مدني / محاسب مالي / سائق"
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>الإدارة / القطاع المختص</label>
            <input
              type="text"
              value={form.department || ''}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              placeholder="مثال: المشروعات والتنفيذ / الشؤون المالية"
              className={INPUT_CLASS}
            />
          </div>
        </div>

        {/* Row 6: موقف التجنيد */}
        <div className="p-4 rounded-2xl bg-[#FBF9F5] dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] space-y-3">
          <label className={LABEL_CLASS}>موقف التجنيد *</label>
          <div className="flex flex-wrap gap-2">
            {MILITARY_OPTIONS.map((opt) => {
              const active = form.militaryStatus === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setForm({ ...form, militaryStatus: opt })}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    active
                      ? 'bg-[#D99B26] text-[#1A241C] border-[#D99B26] shadow-xs'
                      : 'bg-[#FFFFFF] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] border-[#E0D9CB] dark:border-[#243628] hover:border-[#D99B26]'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {form.militaryStatus === 'إعفاء نهائى' && (
            <div className="pt-1">
              <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                سبب الإعفاء النهائى :
              </label>
              <input
                type="text"
                value={form.militaryExemptionReason || ''}
                onChange={(e) =>
                  setForm({ ...form, militaryExemptionReason: e.target.value })
                }
                placeholder="اذكر سبب الإعفاء النهائى المدون بالشهادة..."
                className={INPUT_CLASS}
              />
            </div>
          )}

          {form.militaryStatus === 'إعفاء مؤقت' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                  مدة الإعفاء المؤقت (بالسنوات) :
                </label>
                <input
                  type="text"
                  value={form.militaryTempExemptionYears || ''}
                  onChange={(e) =>
                    setForm({ ...form, militaryTempExemptionYears: e.target.value })
                  }
                  placeholder="مثال: 3 سنوات"
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                  ينتهى فى تاريخ :
                </label>
                <input
                  type="date"
                  value={form.militaryTempExemptionEndDate || ''}
                  onChange={(e) =>
                    setForm({ ...form, militaryTempExemptionEndDate: e.target.value })
                  }
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          )}
        </div>

        {/* Row 7: التأمينات الاجتماعية */}
        <div className="p-4 rounded-2xl bg-[#FBF9F5] dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
              هل سبق لك وأن سجلت بنظام التأمينات الاجتماعية ؟ *
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, previouslyInsured: true })}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  form.previouslyInsured
                    ? 'bg-[#059669] text-white border-[#059669]'
                    : 'bg-[#FFFFFF] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] border-[#E0D9CB] dark:border-[#243628]'
                }`}
              >
                نعم
              </button>
              <button
                type="button"
                onClick={() =>
                  setForm({ ...form, previouslyInsured: false, socialInsuranceNumber: '' })
                }
                className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  !form.previouslyInsured
                    ? 'bg-[#D99B26] text-[#1A241C] border-[#D99B26]'
                    : 'bg-[#FFFFFF] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] border-[#E0D9CB] dark:border-[#243628]'
                }`}
              >
                لا
              </button>
            </div>
          </div>

          {form.previouslyInsured && (
            <div className="pt-1">
              <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                الرقم التأمينى :
              </label>
              <input
                type="text"
                dir="ltr"
                value={form.socialInsuranceNumber || ''}
                onChange={(e) =>
                  setForm({ ...form, socialInsuranceNumber: e.target.value })
                }
                placeholder="أدخل الرقم التأمينى (9 أو 11 رقم) إن وجد..."
                className={`${INPUT_CLASS} font-mono text-right`}
              />
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: المؤهلات العلمية */}
      <div className={SECTION_CARD_CLASS}>
        <div className="flex items-center justify-between border-b border-[#E0D9CB] dark:border-[#243628] pb-3">
          <h4 className="text-sm font-black text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#D99B26]" />
            <span>ثانياً: المؤهلات العلمية</span>
          </h4>
          <button
            type="button"
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                educationHistory: [...prev.educationHistory, createEmptyEducationRow()],
              }))
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#059669]/10 text-[#059669] dark:text-emerald-400 border border-[#059669]/25 hover:bg-[#059669]/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة مؤهل علمى</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-[#F3EFE6] dark:bg-[#121B14] text-[#5C665E] dark:text-[#8FA392] border border-[#E0D9CB] dark:border-[#243628]">
                <th className="p-2.5 font-bold">الشهادة الحاصل عليها</th>
                <th className="p-2.5 font-bold w-28">سنة التخرج</th>
                <th className="p-2.5 font-bold">التخصص</th>
                <th className="p-2.5 font-bold w-32">مدة الدراسة</th>
                <th className="p-2.5 font-bold w-12 text-center">حذف</th>
              </tr>
            </thead>
            <tbody>
              {form.educationHistory.map((row, idx) => (
                <tr
                  key={row.id}
                  className="border-b border-x border-[#E0D9CB] dark:border-[#243628]"
                >
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.degree}
                      onChange={(e) => updateEducationRow(idx, 'degree', e.target.value)}
                      placeholder="بكالوريوس / دبلوم / ثانوية..."
                      className={INPUT_CLASS}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.graduationYear}
                      onChange={(e) => updateEducationRow(idx, 'graduationYear', e.target.value)}
                      placeholder="2021"
                      className={`${INPUT_CLASS} font-mono`}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.major}
                      onChange={(e) => updateEducationRow(idx, 'major', e.target.value)}
                      placeholder="هندسة مدنية / محاسبة..."
                      className={INPUT_CLASS}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.studyDuration}
                      onChange={(e) => updateEducationRow(idx, 'studyDuration', e.target.value)}
                      placeholder="4 سنوات"
                      className={INPUT_CLASS}
                    />
                  </td>
                  <td className="p-2 text-center">
                    {form.educationHistory.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            educationHistory: prev.educationHistory.filter((_, i) => i !== idx),
                          }))
                        }
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: المهارات المكتسبة */}
      <div className={SECTION_CARD_CLASS}>
        <div className="border-b border-[#E0D9CB] dark:border-[#243628] pb-3">
          <h4 className="text-sm font-black text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
            <Award className="w-4 h-4 text-[#D99B26]" />
            <span>ثالثاً: المهارات المكتسبة</span>
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border border-[#E0D9CB] dark:border-[#243628] rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-[#F3EFE6] dark:bg-[#121B14] text-[#1A241C] dark:text-[#F3EFE6]">
                <th className="p-3 font-black border-b border-[#E0D9CB] dark:border-[#243628]">
                  المهارة
                </th>
                {SKILL_LEVELS.map((lvl) => (
                  <th
                    key={lvl}
                    className="p-3 font-black text-center border-b border-[#E0D9CB] dark:border-[#243628]"
                  >
                    {lvl}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CB] dark:divide-[#243628]">
              {(
                [
                  { key: 'englishLanguage', label: 'اللغة الإنجليزية' },
                  { key: 'computerSkills', label: 'التعامل مع الحاسب الألى' },
                  { key: 'interpersonalSkills', label: 'التعامل مع الأخرين' },
                ] as const
              ).map((skillItem) => (
                <tr key={skillItem.key}>
                  <td className="p-3 font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                    {skillItem.label}
                  </td>
                  {SKILL_LEVELS.map((lvl) => {
                    const checked = form.acquiredSkills[skillItem.key] === lvl;
                    return (
                      <td key={lvl} className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              acquiredSkills: {
                                ...prev.acquiredSkills,
                                [skillItem.key]: lvl,
                              },
                            }))
                          }
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                            checked
                              ? 'bg-[#059669] text-white border-[#059669] shadow-xs'
                              : 'bg-[#FBF9F5] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] border-[#E0D9CB] dark:border-[#243628] hover:border-[#D99B26]'
                          }`}
                        >
                          {checked ? '✓ ' : ''}
                          {lvl}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4: الدورات التدريبية */}
      <div className={SECTION_CARD_CLASS}>
        <div className="flex items-center justify-between border-b border-[#E0D9CB] dark:border-[#243628] pb-3">
          <h4 className="text-sm font-black text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#D99B26]" />
            <span>رابعاً: الدورات التدريبية</span>
          </h4>
          <button
            type="button"
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                trainingCourses: [...prev.trainingCourses, createEmptyTrainingRow()],
              }))
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#059669]/10 text-[#059669] dark:text-emerald-400 border border-[#059669]/25 hover:bg-[#059669]/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة دورة تدريبية</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-[#F3EFE6] dark:bg-[#121B14] text-[#5C665E] dark:text-[#8FA392] border border-[#E0D9CB] dark:border-[#243628]">
                <th className="p-2.5 font-bold">نوع الدورة</th>
                <th className="p-2.5 font-bold">العنوان</th>
                <th className="p-2.5 font-bold w-28">التاريخ</th>
                <th className="p-2.5 font-bold w-28">المدة</th>
                <th className="p-2.5 font-bold">الجهة</th>
                <th className="p-2.5 font-bold w-12 text-center">حذف</th>
              </tr>
            </thead>
            <tbody>
              {form.trainingCourses.map((row, idx) => (
                <tr
                  key={row.id}
                  className="border-b border-x border-[#E0D9CB] dark:border-[#243628]"
                >
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.courseType}
                      onChange={(e) => updateTrainingRow(idx, 'courseType', e.target.value)}
                      placeholder="فنية / إدارية / لغات"
                      className={INPUT_CLASS}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.title}
                      onChange={(e) => updateTrainingRow(idx, 'title', e.target.value)}
                      placeholder="اسم الدورة التدريبية"
                      className={INPUT_CLASS}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.date}
                      onChange={(e) => updateTrainingRow(idx, 'date', e.target.value)}
                      placeholder="2024"
                      className={INPUT_CLASS}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.duration}
                      onChange={(e) => updateTrainingRow(idx, 'duration', e.target.value)}
                      placeholder="30 ساعة"
                      className={INPUT_CLASS}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.provider}
                      onChange={(e) => updateTrainingRow(idx, 'provider', e.target.value)}
                      placeholder="الجهة المانحة"
                      className={INPUT_CLASS}
                    />
                  </td>
                  <td className="p-2 text-center">
                    {form.trainingCourses.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            trainingCourses: prev.trainingCourses.filter((_, i) => i !== idx),
                          }))
                        }
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 5: الخبرات العملية */}
      <div className={SECTION_CARD_CLASS}>
        <div className="flex items-center justify-between border-b border-[#E0D9CB] dark:border-[#243628] pb-3">
          <h4 className="text-sm font-black text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#D99B26]" />
            <span>خامساً: الخبرات العملية</span>
          </h4>
          <button
            type="button"
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                workExperiences: [...prev.workExperiences, createEmptyExperienceRow()],
              }))
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#059669]/10 text-[#059669] dark:text-emerald-400 border border-[#059669]/25 hover:bg-[#059669]/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة خبرة عملية</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-[#F3EFE6] dark:bg-[#121B14] text-[#5C665E] dark:text-[#8FA392] border border-[#E0D9CB] dark:border-[#243628]">
                <th className="p-2.5 font-bold">جهة العمل</th>
                <th className="p-2.5 font-bold w-32">مدة العمل</th>
                <th className="p-2.5 font-bold">مسمى الوظيفة</th>
                <th className="p-2.5 font-bold">سبب ترك العمل</th>
                <th className="p-2.5 font-bold w-12 text-center">حذف</th>
              </tr>
            </thead>
            <tbody>
              {form.workExperiences.map((row, idx) => (
                <tr
                  key={row.id}
                  className="border-b border-x border-[#E0D9CB] dark:border-[#243628]"
                >
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.employer}
                      onChange={(e) => updateExperienceRow(idx, 'employer', e.target.value)}
                      placeholder="اسم الشركة أو الجهة"
                      className={INPUT_CLASS}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.duration}
                      onChange={(e) => updateExperienceRow(idx, 'duration', e.target.value)}
                      placeholder="سنتان"
                      className={INPUT_CLASS}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.jobTitle}
                      onChange={(e) => updateExperienceRow(idx, 'jobTitle', e.target.value)}
                      placeholder="المسمى الوظيفى"
                      className={INPUT_CLASS}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.leavingReason}
                      onChange={(e) => updateExperienceRow(idx, 'leavingReason', e.target.value)}
                      placeholder="انتهاء المشروع / بحث عن فرصة أفضل"
                      className={INPUT_CLASS}
                    />
                  </td>
                  <td className="p-2 text-center">
                    {form.workExperiences.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            workExperiences: prev.workExperiences.filter((_, i) => i !== idx),
                          }))
                        }
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 6: المرفقات (السيرة الذاتية + مسح ضوئي للاستمارة الورقية) */}
      <div className={SECTION_CARD_CLASS}>
        <div className="border-b border-[#E0D9CB] dark:border-[#243628] pb-3">
          <h4 className="text-sm font-black text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-[#D99B26]" />
            <span>
              {mode === 'internal'
                ? 'سادساً: أرشفة السيرة الذاتية (CV) ونسخة طلب التوظيف الورقي الممسوح ضوئياً'
                : 'سادساً: إرفاق السيرة الذاتية (CV)'}
            </span>
          </h4>
        </div>

        <div className={`grid grid-cols-1 ${mode === 'internal' ? 'md:grid-cols-2' : ''} gap-4`}>
          <label className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed border-[#D99B26]/40 hover:border-[#D99B26] bg-[#FBF9F5] dark:bg-[#17231A] cursor-pointer transition-all text-center">
            <FileCheck2 className="w-6 h-6 text-[#D99B26]" />
            <span className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
              {form.cvFileName || 'اضغط لرفع السيرة الذاتية (PDF / Word / صورة)'}
            </span>
            <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392]">
              {form.cvFileName ? 'تم إرفاق الملف بنجاح — اضغط للتغيير' : 'اختياري أثناء التقديم'}
            </span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              onChange={(e) => handleFileUpload(e, 'cv')}
              className="hidden"
            />
          </label>

          {mode === 'internal' && (
            <label className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed border-[#059669]/40 hover:border-[#059669] bg-[#FBF9F5] dark:bg-[#17231A] cursor-pointer transition-all text-center">
              <UploadCloud className="w-6 h-6 text-[#059669]" />
              <span className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                {form.scannedPaperFormName || 'إرفاق صورة طلب التوظيف الورقي الممسوح (Scan PDF / JPG)'}
              </span>
              <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392]">
                يُحفظ تلقائياً في أرشيف الموظف / المرشح بالمنظومة
              </span>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => handleFileUpload(e, 'scanned_form')}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* SECTION 7: الإقرار القانوني (قانون العمل 14 لسنة 2025) */}
      <div className="rounded-2xl border border-[#D99B26]/40 bg-[#F3EFE6]/70 dark:bg-[#121B14] p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-black text-[#1A241C] dark:text-[#F3EFE6]">
          <ShieldCheck className="w-4 h-4 text-[#059669]" />
          <span>إقرار المتقدم للوظيفة (طبقاً لقانون العمل رقم 14 لسنة 2025)</span>
        </div>

        <p className="p-4 rounded-xl bg-[#FFFFFF] dark:bg-[#141E16] border border-[#E0D9CB] dark:border-[#243628] text-xs font-semibold leading-relaxed text-[#1A241C] dark:text-[#F3EFE6]">
          {OFFICIAL_LAW_14_2025_DECLARATION}
        </p>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.declarationAccepted}
            onChange={(e) => setForm({ ...form, declarationAccepted: e.target.checked })}
            className="w-4 h-4 accent-[#059669] rounded cursor-pointer"
          />
          <span className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
            أقر أنا الموقع أدناه بصحة كافة البيانات المدونة أعلاه والموافقة الكاملة على الإقرار واللوائح الداخلية للشركة *
          </span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className={LABEL_CLASS}>تاريخ تحرير الطلب</label>
            <input
              type="date"
              value={form.applicationDate}
              onChange={(e) => setForm({ ...form, applicationDate: e.target.value })}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>أسم مقدم الطلب</label>
            <input
              type="text"
              value={form.fullName}
              readOnly
              placeholder="يُنسخ تلقائياً من الاسم أعلاه"
              className={`${INPUT_CLASS} opacity-80`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>التوقيع</label>
            <input
              type="text"
              value={form.applicantSignature}
              onChange={(e) => setForm({ ...form, applicantSignature: e.target.value })}
              placeholder="اكتب اسمك كتوقيع إلكتروني"
              className={INPUT_CLASS}
            />
          </div>
        </div>
      </div>

      {/* SECTION 8 (INTERNAL DIGITIZATION ONLY): الصفحة الثانية - خاص بإدارة الشركة */}
      {mode === 'internal' && (
        <div className="rounded-3xl border-2 border-[#059669]/40 bg-gradient-to-b from-[#059669]/5 to-[#FFFFFF] dark:from-[#059669]/10 dark:to-[#141E16] p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E0D9CB] dark:border-[#243628] pb-3">
            <div>
              <h4 className="text-sm font-black text-[#059669] dark:text-emerald-400">
                الصفحة الثانية — خاص بإدارة الشركة (تقييم المقابلات وقرار التعيين)
              </h4>
              <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-0.5">
                قم بتفريغ التقييمات المدونة على ظهر الاستمارة الورقية وتحديد الراتب وتاريخ التعيين للموظفين الفعليين أو المقبولين
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#D99B26]/15 text-[#D99B26] border border-[#D99B26]/30">
              خاص بإدارة الشركة فقط
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>تقييم مدير الموارد البشرية :</label>
              <textarea
                rows={3}
                value={form.hrManagerEvaluation || ''}
                onChange={(e) =>
                  setForm({ ...form, hrManagerEvaluation: e.target.value })
                }
                placeholder="ملخص تقييم مدير الموارد البشرية المدون بالاستمارة..."
                className={`${INPUT_CLASS} resize-none`}
              />
            </div>

            <div>
              <label className={LABEL_CLASS}>تقييم مدير الإدارة :</label>
              <textarea
                rows={3}
                value={form.departmentManagerEvaluation || ''}
                onChange={(e) =>
                  setForm({ ...form, departmentManagerEvaluation: e.target.value })
                }
                placeholder="ملخص التقييم الفنى لمدير الإدارة المختصة..."
                className={`${INPUT_CLASS} resize-none`}
              />
            </div>
          </div>

          {/* معلومات التعيين */}
          <div className="p-4 rounded-2xl bg-[#FBF9F5] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-4">
            <h5 className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6]">
              معلومات التعيين المعتمدة :
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={LABEL_CLASS}>يتم التعيين بدءاً من :</label>
                <input
                  type="date"
                  value={form.hiringStartDate || ''}
                  onChange={(e) => setForm({ ...form, hiringStartDate: e.target.value })}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>الراتب المحدد (بالأرقام جنيهاً) :</label>
                <input
                  type="number"
                  min={0}
                  step={500}
                  value={form.agreedSalary ?? ''}
                  onChange={(e) => handleAgreedSalaryChange(e.target.value)}
                  placeholder="مثال: 15000"
                  className={`${INPUT_CLASS} font-mono`}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>الراتب المحدد بالحروف (تفقيط تلقائي) :</label>
                <input
                  type="text"
                  value={form.agreedSalaryText || ''}
                  onChange={(e) => setForm({ ...form, agreedSalaryText: e.target.value })}
                  placeholder="فقط ... جنيهاً مصرياً لا غير"
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            <div>
              <label className={LABEL_CLASS}>ملاحظات الإدارة :</label>
              <textarea
                rows={2}
                value={form.managementNotes || ''}
                onChange={(e) => setForm({ ...form, managementNotes: e.target.value })}
                placeholder="أى شروط خاصة، فترة اختبار، بدلات، أو ملاحظات إدارية..."
                className={`${INPUT_CLASS} resize-none`}
              />
            </div>
          </div>

          {/* الاعتمادات الثلاثية */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={LABEL_CLASS}>إعتماد الموارد البشرية</label>
              <input
                type="text"
                value={form.hrApprovalName || ''}
                onChange={(e) => setForm({ ...form, hrApprovalName: e.target.value })}
                placeholder="الاسم / التوقيع"
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>إعتماد مدير الادارة</label>
              <input
                type="text"
                value={form.deptManagerApprovalName || ''}
                onChange={(e) =>
                  setForm({ ...form, deptManagerApprovalName: e.target.value })
                }
                placeholder="الاسم / التوقيع"
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>يعتمد ،،، الرئيس التنفيذى والعضو المنتدب</label>
              <input
                type="text"
                value={form.ceoApprovalName || ''}
                onChange={(e) => setForm({ ...form, ceoApprovalName: e.target.value })}
                placeholder="اسم الرئيس التنفيذي المعتمد"
                className={INPUT_CLASS}
              />
            </div>
          </div>
        </div>
      )}

      {/* Validation Alert */}
      {validationError && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-5 py-3 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#5C665E] dark:text-[#8FA392] hover:bg-[#F3EFE6] dark:hover:bg-[#17231A] transition-colors cursor-pointer"
          >
            إلغاء والرجوع
          </button>
        )}

        {mode === 'public' ? (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleFormAction('candidate_only')}
            className="flex-1 sm:flex-none px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#D99B26] to-[#EBB34D] hover:brightness-105 text-[#1A241C] font-black text-sm shadow-lg shadow-[#D99B26]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-[#1A241C] border-t-transparent rounded-full animate-spin" />
                <span>جاري حفظ طلب التوظيف...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>إرسال طلب التوظيف الرسمي لشركة ترابط</span>
              </>
            )}
          </button>
        ) : (
          <>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleFormAction('candidate_only')}
              className="px-5 py-3 rounded-2xl border border-[#D99B26] bg-[#D99B26]/15 hover:bg-[#D99B26]/25 text-[#1A241C] dark:text-[#F3EFE6] font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-[#D99B26]" />
              <span>حفظ في أرشيف المتقدمين والمرشحين (ATS)</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleFormAction('direct_hire_employee')}
              className="px-6 py-3 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white font-black text-xs shadow-lg shadow-[#059669]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>حفظ وتعيين مباشر كموظف فعلي (HR + التأمينات)</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

interface TarabotPrintableApplicationModalProps {
  candidate: Candidate;
  onClose: () => void;
  onUpdated?: () => void;
}

export const TarabotPrintableApplicationModal: React.FC<
  TarabotPrintableApplicationModalProps
> = ({ candidate, onClose, onUpdated }) => {
  const [viewMode, setViewMode] = useState<'print' | 'edit'>('print');
  const [saving, setSaving] = useState(false);

  const f: TarabotApplicationForm =
    candidate.applicationForm ||
    buildInitialTarabotForm(candidate.jobTitle, candidate.jobDepartment, 'internal', {
      fullName: candidate.name,
      nationalId: candidate.nationalId || '',
      residenceAddress: candidate.location,
      mobilePhone: candidate.phone,
      email: candidate.email,
      positionAppliedFor: candidate.jobTitle,
      agreedSalary: candidate.expectedSalary,
      agreedSalaryText: candidate.expectedSalary
        ? tafqeet(candidate.expectedSalary, 'EGP')
        : '',
    });

  const handlePrint = () => {
    window.print();
  };

  const handleInternalSaveOrConvert = async (
    updatedForm: TarabotApplicationForm,
    saveTarget: 'candidate_only' | 'direct_hire_employee'
  ) => {
    setSaving(true);
    try {
      if (saveTarget === 'direct_hire_employee') {
        await atsStorage.convertCandidateWithApplicationToEmployee(
          candidate.id,
          updatedForm
        );
      } else {
        await atsStorage.saveCandidate({
          ...candidate,
          name: updatedForm.fullName || candidate.name,
          phone: updatedForm.mobilePhone || candidate.phone,
          nationalId: updatedForm.nationalId || candidate.nationalId,
          location: updatedForm.residenceAddress || candidate.location,
          jobTitle: updatedForm.positionAppliedFor || candidate.jobTitle,
          expectedSalary: updatedForm.agreedSalary ?? candidate.expectedSalary,
          applicationForm: updatedForm,
        });
      }
      if (onUpdated) onUpdated();
      setViewMode('print');
    } finally {
      setSaving(false);
    }
  };

  const eduRows =
    f.educationHistory && f.educationHistory.length > 0
      ? f.educationHistory
      : [{ id: 'e1', degree: candidate.education || '-', graduationYear: '-', major: '-', studyDuration: '-' }];

  const trnRows =
    f.trainingCourses && f.trainingCourses.length > 0
      ? f.trainingCourses
      : [{ id: 't1', courseType: '-', title: '-', date: '-', duration: '-', provider: '-' }];

  const expRows =
    f.workExperiences && f.workExperiences.length > 0
      ? f.workExperiences
      : [
          {
            id: 'x1',
            employer: candidate.currentCompany || '-',
            duration: candidate.experienceYears ? `${candidate.experienceYears} سنوات` : '-',
            jobTitle: candidate.currentTitle || '-',
            leavingReason: '-',
          },
        ];

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs overflow-y-auto print:static print:p-0 print:bg-white"
    >
      <div className="w-full max-w-5xl rounded-3xl bg-[#FFFFFF] dark:bg-[#141E16] border border-[#E0D9CB] dark:border-[#243628] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col print:max-h-none print:shadow-none print:border-none">
        {/* Toolbar (hidden on print) */}
        <div className="px-6 py-4 bg-[#F3EFE6] dark:bg-[#121B14] border-b border-[#E0D9CB] dark:border-[#243628] flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-[#D99B26]" />
            <div>
              <h3 className="text-sm font-black text-[#1A241C] dark:text-[#F3EFE6]">
                استمارة طلب التوظيف الرسمية — شركة ترابط للاستثمارات والمشروعات
              </h3>
              <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                {candidate.coreHREmployeeCode
                  ? `معيّن فعلياً بالسجل العام للموظفين (${candidate.coreHREmployeeCode})`
                  : 'نسخة مطابقة للنموذج الورقي (الصفحة الأولى + الصفحة الثانية خاصة بالإدارة)'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'print' ? 'edit' : 'print')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                viewMode === 'edit'
                  ? 'bg-[#D99B26] text-[#1A241C] border-[#D99B26]'
                  : 'bg-[#FFFFFF] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] border-[#E0D9CB] dark:border-[#243628] hover:border-[#D99B26]'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>
                {viewMode === 'edit'
                  ? 'عرض وطباعة الاستمارة'
                  : 'تعديل / استكمال تقييم الإدارة (ص2) والتحويل لموظف'}
              </span>
            </button>

            {viewMode === 'print' && (
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الاستمارة (A4 PDF)</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] text-[#5C665E] dark:text-[#8FA392] hover:bg-[#FFFFFF] dark:hover:bg-[#17231A] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body: Either Edit Mode or Printable Document Body */}
        {viewMode === 'edit' ? (
          <div className="p-6 flex-1 min-h-0 overflow-y-auto bg-[#FBF9F5] dark:bg-[#0E1610]">
            <TarabotApplicationFormView
              mode="internal"
              initialJobTitle={f.positionAppliedFor}
              initialDepartment={f.department}
              initialForm={f}
              isSubmitting={saving}
              onSubmit={handleInternalSaveOrConvert}
              onCancel={() => setViewMode('print')}
            />
          </div>
        ) : (
        <div className="p-6 sm:p-8 flex-1 min-h-0 overflow-y-auto space-y-8 bg-[#FFFFFF] text-[#111827] print:overflow-visible print:p-4">
          {/* PAGE 1: يملاها المتقدم للوظيفة */}
          <div className="border-2 border-[#1A241C] rounded-xl p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-[#1A241C] pb-3 text-xs font-bold">
              <div>شركة ترابط للإستثمارات و المشروعات مساهمة مصرية</div>
              <div className="font-mono text-[11px]" dir="ltr">
                Tarabot Company Investment & Projects Egyptian joint stock
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs font-bold">
                سجل الطلب برقم ( <span className="font-mono">{f.registrationNumber || '....'}</span> )
              </div>
              <h1 className="text-xl font-black underline underline-offset-4">طلب توظيف</h1>
              <div className="text-xs font-bold">يملاها المتقدم للوظيفة</div>
            </div>

            {/* معلومات عامة */}
            <div className="space-y-2 text-xs">
              <h2 className="font-black bg-[#F3EFE6] px-3 py-1.5 border border-[#1A241C]/30">
                معلومات عامة :
              </h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-1">
                <div>
                  <strong>الأسم :</strong> {f.fullName || '....................'}
                </div>
                <div>
                  <strong>الجنسية :</strong> {f.nationality || 'مصرى'}
                </div>
                <div>
                  <strong>الرقم القومى :</strong>{' '}
                  <span className="font-mono">{f.nationalId || '....................'}</span>
                </div>
                <div>
                  <strong>تاريخ أنتهاء بطاقة شخصية :</strong>{' '}
                  <span className="font-mono">{f.nationalIdExpiryDate || '..../..../....'}</span>
                </div>
                <div>
                  <strong>تاريخ الميلاد :</strong>{' '}
                  <span className="font-mono">{f.birthDate || '..../..../....'}</span>
                </div>
                <div>
                  <strong>الحالة الأجتماعية :</strong> {f.maritalStatus}
                </div>
                <div className="col-span-2">
                  <strong>مكان الإقامة :</strong> {f.residenceAddress || '....................'}
                </div>
                <div>
                  <strong>رقم تليفون المنزل :</strong>{' '}
                  <span className="font-mono">{f.landlinePhone || '....................'}</span>
                </div>
                <div>
                  <strong>رقم تليفون الموبايل :</strong>{' '}
                  <span className="font-mono">{f.mobilePhone || '....................'}</span>
                </div>
                <div className="col-span-2">
                  <strong>الوظيفة المتقدم لها :</strong> {f.positionAppliedFor || '....................'}
                </div>
                <div className="col-span-2">
                  <strong>موقف التجنيد :</strong> {f.militaryStatus}
                  {f.militaryStatus === 'إعفاء نهائى' && f.militaryExemptionReason
                    ? ` (السبب: ${f.militaryExemptionReason})`
                    : ''}
                  {f.militaryStatus === 'إعفاء مؤقت'
                    ? ` (${f.militaryTempExemptionYears || '...'} سنوات ينتهى فى ${
                        f.militaryTempExemptionEndDate || '../../....'
                      })`
                    : ''}
                </div>
                <div className="col-span-2">
                  <strong>هل سبق لك وان سجلت بنظام التأمينات الاجتماعية :</strong>{' '}
                  {f.previouslyInsured
                    ? `نعم — الرقم التأمينى : ${f.socialInsuranceNumber || '....................'}`
                    : 'لا'}
                </div>
              </div>
            </div>

            {/* المؤهلات العلمية */}
            <div className="space-y-1.5 text-xs">
              <h2 className="font-black bg-[#F3EFE6] px-3 py-1.5 border border-[#1A241C]/30">
                المؤهلات العلمية :
              </h2>
              <table className="w-full border border-[#1A241C]/40 border-collapse text-center">
                <thead>
                  <tr className="bg-[#FBF9F5]">
                    <th className="border border-[#1A241C]/40 p-1.5">الشهادة الحاصل عليها</th>
                    <th className="border border-[#1A241C]/40 p-1.5">سنة التخرج</th>
                    <th className="border border-[#1A241C]/40 p-1.5">التخصص</th>
                    <th className="border border-[#1A241C]/40 p-1.5">مدة الدراسة</th>
                  </tr>
                </thead>
                <tbody>
                  {eduRows.map((e) => (
                    <tr key={e.id}>
                      <td className="border border-[#1A241C]/40 p-1.5">{e.degree || '-'}</td>
                      <td className="border border-[#1A241C]/40 p-1.5 font-mono">
                        {e.graduationYear || '-'}
                      </td>
                      <td className="border border-[#1A241C]/40 p-1.5">{e.major || '-'}</td>
                      <td className="border border-[#1A241C]/40 p-1.5">{e.studyDuration || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* المهارات المكتسبة */}
            <div className="space-y-1.5 text-xs">
              <h2 className="font-black bg-[#F3EFE6] px-3 py-1.5 border border-[#1A241C]/30">
                المهارات المكتسبة :
              </h2>
              <table className="w-full border border-[#1A241C]/40 border-collapse text-center">
                <thead>
                  <tr className="bg-[#FBF9F5]">
                    <th className="border border-[#1A241C]/40 p-1.5 text-right">المهارة</th>
                    {SKILL_LEVELS.map((l) => (
                      <th key={l} className="border border-[#1A241C]/40 p-1.5">
                        {l}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      { key: 'englishLanguage', label: 'اللغة الإنجليزية' },
                      { key: 'computerSkills', label: 'التعامل مع الحاسب الألى' },
                      { key: 'interpersonalSkills', label: 'التعامل مع الأخرين' },
                    ] as const
                  ).map((sk) => (
                    <tr key={sk.key}>
                      <td className="border border-[#1A241C]/40 p-1.5 text-right font-bold">
                        {sk.label}
                      </td>
                      {SKILL_LEVELS.map((l) => (
                        <td key={l} className="border border-[#1A241C]/40 p-1.5 font-black">
                          {f.acquiredSkills?.[sk.key] === l ? '✓' : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* الدورات التدريبية */}
            <div className="space-y-1.5 text-xs">
              <h2 className="font-black bg-[#F3EFE6] px-3 py-1.5 border border-[#1A241C]/30">
                الدورات التدريبية :
              </h2>
              <table className="w-full border border-[#1A241C]/40 border-collapse text-center">
                <thead>
                  <tr className="bg-[#FBF9F5]">
                    <th className="border border-[#1A241C]/40 p-1.5">نوع الدورة</th>
                    <th className="border border-[#1A241C]/40 p-1.5">العنوان</th>
                    <th className="border border-[#1A241C]/40 p-1.5">التاريخ</th>
                    <th className="border border-[#1A241C]/40 p-1.5">المدة</th>
                    <th className="border border-[#1A241C]/40 p-1.5">الجهة</th>
                  </tr>
                </thead>
                <tbody>
                  {trnRows.map((t) => (
                    <tr key={t.id}>
                      <td className="border border-[#1A241C]/40 p-1.5">{t.courseType || '-'}</td>
                      <td className="border border-[#1A241C]/40 p-1.5">{t.title || '-'}</td>
                      <td className="border border-[#1A241C]/40 p-1.5">{t.date || '-'}</td>
                      <td className="border border-[#1A241C]/40 p-1.5">{t.duration || '-'}</td>
                      <td className="border border-[#1A241C]/40 p-1.5">{t.provider || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* الخبرات العملية */}
            <div className="space-y-1.5 text-xs">
              <h2 className="font-black bg-[#F3EFE6] px-3 py-1.5 border border-[#1A241C]/30">
                الخبرات العملية :
              </h2>
              <table className="w-full border border-[#1A241C]/40 border-collapse text-center">
                <thead>
                  <tr className="bg-[#FBF9F5]">
                    <th className="border border-[#1A241C]/40 p-1.5">جهة العمل</th>
                    <th className="border border-[#1A241C]/40 p-1.5">مدة العمل</th>
                    <th className="border border-[#1A241C]/40 p-1.5">مسمى الوظيفة</th>
                    <th className="border border-[#1A241C]/40 p-1.5">سبب ترك العمل</th>
                  </tr>
                </thead>
                <tbody>
                  {expRows.map((x) => (
                    <tr key={x.id}>
                      <td className="border border-[#1A241C]/40 p-1.5">{x.employer || '-'}</td>
                      <td className="border border-[#1A241C]/40 p-1.5">{x.duration || '-'}</td>
                      <td className="border border-[#1A241C]/40 p-1.5">{x.jobTitle || '-'}</td>
                      <td className="border border-[#1A241C]/40 p-1.5">{x.leavingReason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* أقرار */}
            <div className="space-y-3 pt-2 border-t border-[#1A241C]/40 text-xs">
              <div className="font-black">أقـــــــــرار</div>
              <p className="leading-relaxed font-semibold">{OFFICIAL_LAW_14_2025_DECLARATION}</p>
              <div className="grid grid-cols-3 gap-4 pt-3 text-center font-bold">
                <div>تاريخ تحرير الطلب : {f.applicationDate || '..../..../2026'}</div>
                <div>أسم مقدم الطلب : {f.fullName || '................'}</div>
                <div>التوقيع : {f.applicantSignature || f.fullName || '................'}</div>
              </div>
            </div>
          </div>

          {/* PAGE 2: خاص بإدارة الشركة */}
          <div className="border-2 border-[#1A241C] rounded-xl p-6 space-y-5 break-before-page">
            <div className="flex items-center justify-between border-b-2 border-[#1A241C] pb-3 text-xs font-bold">
              <div>شركة ترابط للإستثمارات و المشروعات مساهمة مصرية</div>
              <div className="font-mono text-[11px]" dir="ltr">
                Tarabot Company Investment & Projects Egyptian joint stock
              </div>
            </div>

            <div className="text-center font-black text-base underline underline-offset-4">
              خاص بإدارة الشركة
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="font-black">تقييم مدير الموارد البشرية :</div>
                <div className="min-h-[60px] p-3 border border-dashed border-[#1A241C]/40 rounded-lg">
                  {f.hrManagerEvaluation || '................................................................'}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="font-black">تقييم مدير الإدارة :</div>
                <div className="min-h-[60px] p-3 border border-dashed border-[#1A241C]/40 rounded-lg">
                  {f.departmentManagerEvaluation ||
                    '................................................................'}
                </div>
              </div>

              <div className="p-4 bg-[#FBF9F5] border border-[#1A241C]/30 rounded-lg space-y-2">
                <div className="font-black">معلومات التعيين :</div>
                <div>
                  <strong>يتم التعيين بدءاً من :</strong>{' '}
                  <span className="font-mono">{f.hiringStartDate || '2026/..../....'}</span>
                </div>
                <div>
                  <strong>الراتب المحدد :</strong>{' '}
                  {f.agreedSalary ? `${f.agreedSalary.toLocaleString()} جنيهاً مصرياً` : '..............'}{' '}
                  ({f.agreedSalaryText || '...................................... جنيهاً'})
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="font-black">ملاحظات :</div>
                <div className="min-h-[45px] p-3 border border-dashed border-[#1A241C]/40 rounded-lg">
                  {f.managementNotes || '................................................................'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-6 text-center font-bold">
                <div className="space-y-2">
                  <div>إعتماد الموارد البشرية</div>
                  <div>{f.hrApprovalName || '..........................'}</div>
                </div>
                <div className="space-y-2">
                  <div>إعتماد مدير الادارة</div>
                  <div>{f.deptManagerApprovalName || '..........................'}</div>
                </div>
              </div>

              <div className="pt-6 text-center font-black space-y-2">
                <div>يعتمد ،،، الرئيس التنفيذى والعضو المنتدب</div>
                <div>{f.ceoApprovalName || '........................................'}</div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};
