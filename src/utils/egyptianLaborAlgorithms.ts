/**
 * المحرك الخوارزمي والقانوني لإدارة الموارد البشرية المصرية (ECO ERP - Egypt HR Engine)
 *
 * المرجعيات التشريعية المطبقة:
 * 1. قانون العمل المصري رقم 12 لسنة 2003 (المواد 47، 61، 85).
 * 2. قانون التأمينات الاجتماعية والمعاشات الموحد رقم 148 لسنة 2019 (نسب 2026: العامل 11%، صاحب العمل 18.75%، صندوق الطوارئ 1%).
 * 3. قانون الضريبة على الدخل رقم 91 لسنة 2005 وتعديلاته بالقانون رقم 7 لسنة 2024 (الإعفاء الشخصي 20,000 ج.م والشريحة المعفاة 40,000 ج.م).
 * 4. قانون صندوق تكريم الشهداء وضحايا العمليات رقم 16 لسنة 2018 (نسبة 0.05% من الأجر الشامل).
 * 5. خوارزمية تحليل وفحص بطاقة الرقم القومي المصري (14 رقماً).
 */

export const EGYPTIAN_GOVERNORATE_CODES: Record<string, string> = {
  '01': 'القاهرة',
  '02': 'الإسكندرية',
  '03': 'بورسعيد',
  '04': 'السويس',
  '11': 'دمياط',
  '12': 'الدقهلية',
  '13': 'الشرقية',
  '14': 'القليوبية',
  '15': 'كفر الشيخ',
  '16': 'الغربية',
  '17': 'المنوفية',
  '18': 'البحيرة',
  '19': 'الإسماعيلية',
  '21': 'الجيزة',
  '22': 'بني سويف',
  '23': 'الفيوم',
  '24': 'المنيا',
  '25': 'أسيوط',
  '26': 'سوهاج',
  '27': 'قنا',
  '28': 'أسوان',
  '29': 'الأقصر',
  '31': 'البحر الأحمر',
  '32': 'الوادي الجديد',
  '33': 'مطروح',
  '34': 'شمال سيناء',
  '35': 'جنوب سيناء',
  '88': 'خارج الجمهورية',
};

export const EGYPTIAN_BANKS = [
  { code: 'NBE', nameAr: 'البنك الأهلي المصري (NBE)', achSupported: true },
  { code: 'MISR', nameAr: 'بنك مصر (Banque Misr)', achSupported: true },
  { code: 'CIB', nameAr: 'البنك التجاري الدولي (CIB)', achSupported: true },
  { code: 'QNB', nameAr: 'بنك قطر الوطني الأهلي (QNB)', achSupported: true },
  { code: 'AAIB', nameAr: 'البنك العربي الأفريقي الدولي (AAIB)', achSupported: true },
  { code: 'ADIB', nameAr: 'مصرف أبوظبي الإسلامي (ADIB)', achSupported: true },
  { code: 'BDC', nameAr: 'بنك القاهرة (Banque du Caire)', achSupported: true },
  { code: 'ALEX', nameAr: 'بنك الإسكندرية (AlexBank)', achSupported: true },
  { code: 'INSTAPAY', nameAr: 'محفظة إلكترونية / إنستاباي (InstaPay)', achSupported: false },
];

export const EGYPTIAN_WORKFORCE_CLASSIFICATIONS = [
  { id: 'hq_permanent', labelAr: 'عمالة دائمة — الإدارة المركزية', dailyHours: 8, weeklyDays: 5 },
  { id: 'site_engineers', labelAr: 'مهندسو ومشرفو المواقع والتنفيذ', dailyHours: 10, weeklyDays: 6 },
  { id: 'equipment_operators', labelAr: 'سائقون وفنيو تشغيل المعدات الثقيلة', dailyHours: 10, weeklyDays: 6 },
  { id: 'site_casual', labelAr: 'عمالة يومية ومؤقتة بالمواقع (غير منتظمة)', dailyHours: 9, weeklyDays: 6 },
] as const;

export interface NationalIdAnalysis {
  isValid: boolean;
  errorMessage?: string;
  birthDate?: string;
  ageYears?: number;
  retirementDate?: string;
  governorateCode?: string;
  governorateName?: string;
  gender?: 'male' | 'female';
  genderAr?: 'ذكر' | 'أنثى';
  statutoryAnnualLeaveDays?: number;
}

/**
 * خوارزمية تحليل والتحقق من بطاقة الرقم القومي المصري (14 رقماً)
 * تستخرج: تاريخ الميلاد، العمر الفعلي، المحافظة، النوع، وتاريخ بلوغ سن المعاش (60 عاماً)،
 * وتحدد استحقاق الإجازة السنوية تلقائياً (30 يوماً لمن بلغ 50 عاماً أو 21 يوماً).
 */
export function parseEgyptianNationalId(nationalId: string, referenceDate = new Date()): NationalIdAnalysis {
  const cleaned = (nationalId || '').replace(/\s+/g, '').trim();
  if (!cleaned) {
    return { isValid: false, errorMessage: 'يرجى إدخال الرقم القومي المكون من 14 رقماً' };
  }
  if (!/^[23]\d{13}$/.test(cleaned)) {
    return { isValid: false, errorMessage: 'صيغة غير صحيحة — يجب أن يبدأ الرقم القومي بـ 2 أو 3 ويتكون من 14 رقماً' };
  }

  const century = cleaned[0] === '2' ? 1900 : 2000;
  const year = century + Number(cleaned.slice(1, 3));
  const month = Number(cleaned.slice(3, 5));
  const day = Number(cleaned.slice(5, 7));
  const govCode = cleaned.slice(7, 9);
  const serialGenderDigit = Number(cleaned[12]);

  const birth = new Date(Date.UTC(year, month - 1, day));
  if (
    birth.getUTCFullYear() !== year ||
    birth.getUTCMonth() !== month - 1 ||
    birth.getUTCDate() !== day
  ) {
    return { isValid: false, errorMessage: 'تاريخ الميلاد المستخرج من الرقم القومي غير صالح' };
  }

  const governorateName = EGYPTIAN_GOVERNORATE_CODES[govCode];
  if (!governorateName) {
    return { isValid: false, errorMessage: `كود المحافظة (${govCode}) غير مدرج في الأحوال المدنية المصرية` };
  }

  let ageYears = referenceDate.getUTCFullYear() - year;
  const monthDiff = referenceDate.getUTCMonth() - (month - 1);
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getUTCDate() < day)) {
    ageYears -= 1;
  }

  if (ageYears < 15 || ageYears > 90) {
    return { isValid: false, errorMessage: 'العمر المستخرج خارج النطاق القانوني للتوظيف (15 - 90 عاماً)' };
  }

  const birthDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const retirementDate = `${year + 60}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const gender: 'male' | 'female' = serialGenderDigit % 2 === 1 ? 'male' : 'female';
  const genderAr: 'ذكر' | 'أنثى' = gender === 'male' ? 'ذكر' : 'أنثى';
  const statutoryAnnualLeaveDays = ageYears >= 50 ? 30 : 21;

  return {
    isValid: true,
    birthDate,
    ageYears,
    retirementDate,
    governorateCode: govCode,
    governorateName,
    gender,
    genderAr,
    statutoryAnnualLeaveDays,
  };
}

export interface SocialInsuranceResult {
  requestedWage: number;
  clampedInsurableWage: number;
  minWageBound: number;
  maxWageBound: number;
  employeeShare: number;
  employerShare: number;
  emergencyFund: number;
  totalInsuranceCost: number;
  wasClamped: boolean;
}

/**
 * محرك حساب التأمينات الاجتماعية المصرية وفق القانون 148 لسنة 2019 (تعديل الحدود الدنيا والقصوى 2026)
 */
export function calculateEgyptianSocialInsurance(
  insurableWageInput: number,
  basicSalaryForEmergencyFund: number,
  options?: {
    minWage?: number;
    maxWage?: number;
    employeeRate?: number;
    employerRate?: number;
    emergencyFundRate?: number;
    isInsured?: boolean;
  }
): SocialInsuranceResult {
  const minWage = options?.minWage ?? 2300;
  const maxWage = options?.maxWage ?? 14500;
  const employeeRate = options?.employeeRate ?? 0.11;
  const employerRate = options?.employerRate ?? 0.1875;
  const emergencyFundRate = options?.emergencyFundRate ?? 0.01;
  const isInsured = options?.isInsured ?? true;

  if (!isInsured || basicSalaryForEmergencyFund <= 0) {
    return {
      requestedWage: Math.max(0, insurableWageInput),
      clampedInsurableWage: 0,
      minWageBound: minWage,
      maxWageBound: maxWage,
      employeeShare: 0,
      employerShare: 0,
      emergencyFund: 0,
      totalInsuranceCost: 0,
      wasClamped: false,
    };
  }

  const baseForClamp = insurableWageInput > 0 ? insurableWageInput : basicSalaryForEmergencyFund;
  const clampedWage = Math.min(maxWage, Math.max(minWage, baseForClamp));
  const wasClamped = clampedWage !== baseForClamp;

  const employeeShare = roundCurrency(clampedWage * employeeRate);
  const employerShare = roundCurrency(clampedWage * employerRate);
  const emergencyFund = roundCurrency(basicSalaryForEmergencyFund * emergencyFundRate);
  const totalInsuranceCost = roundCurrency(employeeShare + employerShare + emergencyFund);

  return {
    requestedWage: baseForClamp,
    clampedInsurableWage: clampedWage,
    minWageBound: minWage,
    maxWageBound: maxWage,
    employeeShare,
    employerShare,
    emergencyFund,
    totalInsuranceCost,
    wasClamped,
  };
}

export interface TaxBracketSlice {
  labelAr: string;
  ratePercent: number;
  taxableSliceAnnual: number;
  taxAnnual: number;
}

export interface SalaryTaxResult {
  monthlyGross: number;
  monthlyEmployeeInsurance: number;
  annualNetBeforeTax: number;
  personalExemptionAnnual: number;
  annualTaxableIncome: number;
  annualTax: number;
  monthlyTax: number;
  martyrsFundMonthly: number;
  effectiveTaxRatePercent: number;
  bracketsBreakdown: TaxBracketSlice[];
}

interface TaxTierSchedule {
  maxIncome: number;
  slices: Array<{ upperLimit: number; rate: number; labelAr: string }>;
}

const LAW_7_2024_TAX_SCHEDULES: TaxTierSchedule[] = [
  {
    maxIncome: 600_000,
    slices: [
      { upperLimit: 40_000, rate: 0.0, labelAr: 'الشريحة الأولى (معفاة حتى 40,000 ج.م)' },
      { upperLimit: 55_000, rate: 0.1, labelAr: 'الشريحة الثانية (40 - 55 ألف ج.م)' },
      { upperLimit: 70_000, rate: 0.15, labelAr: 'الشريحة الثالثة (55 - 70 ألف ج.م)' },
      { upperLimit: 200_000, rate: 0.2, labelAr: 'الشريحة الرابعة (70 - 200 ألف ج.م)' },
      { upperLimit: 400_000, rate: 0.225, labelAr: 'الشريحة الخامسة (200 - 400 ألف ج.م)' },
      { upperLimit: 600_000, rate: 0.25, labelAr: 'الشريحة السادسة (400 - 600 ألف ج.م)' },
    ],
  },
  {
    maxIncome: 700_000,
    slices: [
      { upperLimit: 55_000, rate: 0.1, labelAr: 'الشريحة الأولى المعدلة (حتى 55 ألف ج.م)' },
      { upperLimit: 70_000, rate: 0.15, labelAr: 'الشريحة الثانية (55 - 70 ألف ج.م)' },
      { upperLimit: 200_000, rate: 0.2, labelAr: 'الشريحة الثالثة (70 - 200 ألف ج.م)' },
      { upperLimit: 400_000, rate: 0.225, labelAr: 'الشريحة الرابعة (200 - 400 ألف ج.م)' },
      { upperLimit: 700_000, rate: 0.25, labelAr: 'الشريحة الخامسة (400 - 700 ألف ج.م)' },
    ],
  },
  {
    maxIncome: 800_000,
    slices: [
      { upperLimit: 70_000, rate: 0.15, labelAr: 'الشريحة الأولى المعدلة (حتى 70 ألف ج.م)' },
      { upperLimit: 200_000, rate: 0.2, labelAr: 'الشريحة الثانية (70 - 200 ألف ج.م)' },
      { upperLimit: 400_000, rate: 0.225, labelAr: 'الشريحة الثالثة (200 - 400 ألف ج.م)' },
      { upperLimit: 800_000, rate: 0.25, labelAr: 'الشريحة الرابعة (400 - 800 ألف ج.م)' },
    ],
  },
  {
    maxIncome: 900_000,
    slices: [
      { upperLimit: 200_000, rate: 0.2, labelAr: 'الشريحة الأولى المعدلة (حتى 200 ألف ج.م)' },
      { upperLimit: 400_000, rate: 0.225, labelAr: 'الشريحة الثانية (200 - 400 ألف ج.م)' },
      { upperLimit: 900_000, rate: 0.25, labelAr: 'الشريحة الثالثة (400 - 900 ألف ج.م)' },
    ],
  },
  {
    maxIncome: 1_200_000,
    slices: [
      { upperLimit: 400_000, rate: 0.225, labelAr: 'الشريحة الأولى المعدلة (حتى 400 ألف ج.م)' },
      { upperLimit: 1_200_000, rate: 0.25, labelAr: 'الشريحة الثانية (400 ألف - 1.2 مليون ج.م)' },
    ],
  },
  {
    maxIncome: Number.POSITIVE_INFINITY,
    slices: [
      { upperLimit: 1_200_000, rate: 0.25, labelAr: 'الشريحة الأولى (حتى 1.2 مليون ج.م)' },
      { upperLimit: Number.POSITIVE_INFINITY, rate: 0.275, labelAr: 'الشريحة العليا (فوق 1.2 مليون ج.م)' },
    ],
  },
];

/**
 * محرك ضريبة كسب العمل التصاعدية المصرية (القانون 91 لسنة 2005 وتعديلاته بالقانون 7 لسنة 2024)
 * يشمل خصم حصة العامل في التأمينات + الإعفاء الشخصي السنوي (20,000 ج.م) + صندوق تكريم الشهداء (0.05%)
 */
export function calculateEgyptianSalaryTax(
  monthlyGross: number,
  monthlyEmployeeInsurance: number,
  personalExemptionAnnual = 20_000
): SalaryTaxResult {
  const safeGross = Math.max(0, monthlyGross);
  const safeIns = Math.max(0, monthlyEmployeeInsurance);
  const martyrsFundMonthly = roundCurrency(safeGross * 0.0005);

  const annualNetBeforeTax = Math.max(0, (safeGross - safeIns) * 12);
  const annualTaxableIncome = Math.max(0, annualNetBeforeTax - personalExemptionAnnual);

  if (annualTaxableIncome <= 0) {
    return {
      monthlyGross: safeGross,
      monthlyEmployeeInsurance: safeIns,
      annualNetBeforeTax,
      personalExemptionAnnual,
      annualTaxableIncome: 0,
      annualTax: 0,
      monthlyTax: 0,
      martyrsFundMonthly,
      effectiveTaxRatePercent: 0,
      bracketsBreakdown: [
        {
          labelAr: 'معفى بالكامل تحت حد الإعفاء السنوي (60,000 ج.م)',
          ratePercent: 0,
          taxableSliceAnnual: annualNetBeforeTax,
          taxAnnual: 0,
        },
      ],
    };
  }

  const schedule =
    LAW_7_2024_TAX_SCHEDULES.find(s => annualTaxableIncome <= s.maxIncome) ||
    LAW_7_2024_TAX_SCHEDULES[LAW_7_2024_TAX_SCHEDULES.length - 1];

  let prevLimit = 0;
  let annualTax = 0;
  const bracketsBreakdown: TaxBracketSlice[] = [];

  for (const slice of schedule.slices) {
    if (annualTaxableIncome <= prevLimit) break;
    const upper = Math.min(annualTaxableIncome, slice.upperLimit);
    const sliceAmount = Math.max(0, upper - prevLimit);
    const sliceTax = sliceAmount * slice.rate;

    if (sliceAmount > 0) {
      bracketsBreakdown.push({
        labelAr: slice.labelAr,
        ratePercent: Number((slice.rate * 100).toFixed(1)),
        taxableSliceAnnual: roundCurrency(sliceAmount),
        taxAnnual: roundCurrency(sliceTax),
      });
    }

    annualTax += sliceTax;
    prevLimit = slice.upperLimit;
  }

  const roundedAnnualTax = roundCurrency(annualTax);
  const monthlyTax = roundCurrency(roundedAnnualTax / 12);
  const effectiveTaxRatePercent =
    safeGross > 0 ? Number(((monthlyTax / safeGross) * 100).toFixed(2)) : 0;

  return {
    monthlyGross: safeGross,
    monthlyEmployeeInsurance: safeIns,
    annualNetBeforeTax,
    personalExemptionAnnual,
    annualTaxableIncome,
    annualTax: roundedAnnualTax,
    monthlyTax,
    martyrsFundMonthly,
    effectiveTaxRatePercent,
    bracketsBreakdown,
  };
}

export interface OvertimeAndPenaltiesResult {
  hourlyBaseRate: number;
  dailyBaseRate: number;
  daytimeOvertimePay: number;
  nighttimeOvertimePay: number;
  holidayOvertimePay: number;
  totalOvertimePay: number;
  maxAllowedPenaltyDeduction: number;
  appliedPenaltyDeduction: number;
  carriedOverPenaltyDeduction: number;
}

/**
 * محرك احتساب الأجر الإضافي والجزاءات التأديبية وفق المادتين 61 و 85 من قانون العمل رقم 12 لسنة 2003
 * - إضافي نهاري: 1.35x | إضافي ليلي: 1.70x | إجازات وعطلات رسمية: 2.00x
 * - سقف الخصم التأديبي الشهري: لا يتجاوز أجر 5 أيام في الشهر الواحد
 */
export function calculateEgyptianOvertimeAndPenalties(params: {
  basicSalary: number;
  hoursPerDay?: number;
  daytimeOvertimeHours?: number;
  nighttimeOvertimeHours?: number;
  holidayOvertimeHours?: number;
  rawPenaltyAmount?: number;
}): OvertimeAndPenaltiesResult {
  const hoursPerDay = Math.max(1, params.hoursPerDay ?? 8);
  const dailyBaseRate = roundCurrency(params.basicSalary / 30);
  const hourlyBaseRate = roundCurrency(dailyBaseRate / hoursPerDay);

  const daytimeOvertimePay = roundCurrency(
    (params.daytimeOvertimeHours ?? 0) * hourlyBaseRate * 1.35
  );
  const nighttimeOvertimePay = roundCurrency(
    (params.nighttimeOvertimeHours ?? 0) * hourlyBaseRate * 1.7
  );
  const holidayOvertimePay = roundCurrency(
    (params.holidayOvertimeHours ?? 0) * hourlyBaseRate * 2.0
  );
  const totalOvertimePay = roundCurrency(
    daytimeOvertimePay + nighttimeOvertimePay + holidayOvertimePay
  );

  // المادة 61: الحد الأقصى لخصم الجزاء في الشهر الواحد 5 أيام عمل
  const maxAllowedPenaltyDeduction = roundCurrency(dailyBaseRate * 5);
  const rawPenalty = Math.max(0, params.rawPenaltyAmount ?? 0);
  const appliedPenaltyDeduction = roundCurrency(
    Math.min(rawPenalty, maxAllowedPenaltyDeduction)
  );
  const carriedOverPenaltyDeduction = roundCurrency(
    Math.max(0, rawPenalty - maxAllowedPenaltyDeduction)
  );

  return {
    hourlyBaseRate,
    dailyBaseRate,
    daytimeOvertimePay,
    nighttimeOvertimePay,
    holidayOvertimePay,
    totalOvertimePay,
    maxAllowedPenaltyDeduction,
    appliedPenaltyDeduction,
    carriedOverPenaltyDeduction,
  };
}

export interface FullEgyptianPayrollSlip {
  basicSalary: number;
  allowancesTotal: number;
  bonusesAndOvertime: number;
  grossSalary: number;
  insurance: SocialInsuranceResult;
  tax: SalaryTaxResult;
  overtimeAndPenalties: OvertimeAndPenaltiesResult;
  advanceInstallment: number;
  otherDeductions: number;
  totalStatutoryAndCustomDeductions: number;
  netSalary: number;
  totalEmployerCost: number;
}

/**
 * الخوارزمية الموحدة لإعداد قسيمة الراتب المصرية الشاملة (Gross-to-Net Egyptian Payroll Engine)
 */
export function calculateFullEgyptianPayrollSlip(input: {
  basicSalary: number;
  insurableWage?: number;
  housingAllowance?: number;
  transportAllowance?: number;
  siteAllowance?: number;
  bonuses?: number;
  daytimeOvertimeHours?: number;
  nighttimeOvertimeHours?: number;
  holidayOvertimeHours?: number;
  hoursPerDay?: number;
  penaltyDeductionRaw?: number;
  advanceInstallment?: number;
  otherDeductions?: number;
  isInsured?: boolean;
}): FullEgyptianPayrollSlip {
  const basicSalary = Math.max(0, input.basicSalary || 0);
  const allowancesTotal = roundCurrency(
    (input.housingAllowance ?? 0) +
      (input.transportAllowance ?? 0) +
      (input.siteAllowance ?? 0)
  );

  const overtimeAndPenalties = calculateEgyptianOvertimeAndPenalties({
    basicSalary,
    hoursPerDay: input.hoursPerDay,
    daytimeOvertimeHours: input.daytimeOvertimeHours,
    nighttimeOvertimeHours: input.nighttimeOvertimeHours,
    holidayOvertimeHours: input.holidayOvertimeHours,
    rawPenaltyAmount: input.penaltyDeductionRaw,
  });

  const bonusesAndOvertime = roundCurrency(
    (input.bonuses ?? 0) + overtimeAndPenalties.totalOvertimePay
  );
  const grossSalary = roundCurrency(basicSalary + allowancesTotal + bonusesAndOvertime);

  const insurance = calculateEgyptianSocialInsurance(
    input.insurableWage ?? basicSalary,
    basicSalary,
    { isInsured: input.isInsured ?? true }
  );

  const tax = calculateEgyptianSalaryTax(grossSalary, insurance.employeeShare);
  const advanceInstallment = Math.max(0, input.advanceInstallment ?? 0);
  const otherDeductions = Math.max(0, input.otherDeductions ?? 0);

  const totalStatutoryAndCustomDeductions = roundCurrency(
    insurance.employeeShare +
      tax.monthlyTax +
      tax.martyrsFundMonthly +
      overtimeAndPenalties.appliedPenaltyDeduction +
      advanceInstallment +
      otherDeductions
  );

  const netSalary = Math.max(
    0,
    roundCurrency(grossSalary - totalStatutoryAndCustomDeductions)
  );

  const totalEmployerCost = roundCurrency(
    grossSalary + insurance.employerShare + insurance.emergencyFund
  );

  return {
    basicSalary,
    allowancesTotal,
    bonusesAndOvertime,
    grossSalary,
    insurance,
    tax,
    overtimeAndPenalties,
    advanceInstallment,
    otherDeductions,
    totalStatutoryAndCustomDeductions,
    netSalary,
    totalEmployerCost,
  };
}

/**
 * حساب استحقاق الإجازة السنوية القانوني بناءً على العمر ومدة الخدمة في مصر (المادة 47)
 */
export function calculateAnnualLeaveEntitlement(params: {
  hireDate?: string;
  nationalId?: string;
}): { annualTotal: number; casualLimit: number; monthlyAccrual: number; reasonAr: string } {
  const idAnalysis = params.nationalId ? parseEgyptianNationalId(params.nationalId) : null;
  if (idAnalysis?.isValid && (idAnalysis.ageYears ?? 0) >= 50) {
    return {
      annualTotal: 30,
      casualLimit: 6,
      monthlyAccrual: 2.5,
      reasonAr: 'تجاوز الموظف سن 50 عاماً — يستحق 30 يوماً سنوياً (المادة 47)',
    };
  }

  if (params.hireDate) {
    const start = new Date(params.hireDate);
    if (!Number.isNaN(start.getTime())) {
      const yearsOfService = (Date.now() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (yearsOfService >= 10) {
        return {
          annualTotal: 30,
          casualLimit: 6,
          monthlyAccrual: 2.5,
          reasonAr: 'أتم 10 سنوات خدمة — يستحق 30 يوماً سنوياً (المادة 47)',
        };
      }
    }
  }

  return {
    annualTotal: 21,
    casualLimit: 6,
    monthlyAccrual: 1.75,
    reasonAr: 'الرصيد القانوني الأساسي (21 يوماً سنوياً منها 6 أيام عارضة)',
  };
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}
