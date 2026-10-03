import React, { createContext, useContext, useState, useMemo } from 'react';

export type EmployeeStatus = 'active' | 'on_leave' | 'terminated';
export type AttendanceStatus = 'present' | 'absent' | 'leave' | 'mission';
export type LeaveType = 'annual' | 'sick' | 'casual' | 'unpaid' | 'mission';
export type LeaveStatus = 'approved' | 'pending' | 'rejected';
export type AdvanceStatus = 'active' | 'cleared' | 'paused';
export type CustodyStatus = 'in_custody' | 'returned_cleared';
export type ContractExpiryStatus = 'valid' | 'expiring_soon' | 'expired';

export interface DocumentItem {
  id: string;
  type: string;
  titleAr: string;
  status: 'valid' | 'missing' | 'expiring';
  expiryDate?: string;
  updatedAt: string;
  fileName?: string;
}

export interface CustodyAssetItem {
  id: string;
  type: string;
  nameAr: string;
  status: 'delivered' | 'not_delivered';
  issueDate?: string;
  notes?: string;
  serialNumber?: string;
}

export interface AllowanceItem {
  id: string;
  titleAr: string;
  amount: number;
  type: 'transport' | 'housing' | 'site_hardship' | 'phone';
}

export interface BonusItem {
  id: string;
  titleAr: string;
  amount: number;
  date: string;
  reason: string;
  projectLinked?: string;
}

export interface DeductionItem {
  id: string;
  titleAr: string;
  daysCount?: number;
  amount: number;
  date: string;
  reason: string;
}

export interface WorkedHoursDay {
  date: string;
  checkIn: string;
  checkOut: string;
  hoursWorked: number;
  status: 'complete' | 'incomplete' | 'late' | 'mission';
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actionType: string;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
  userName: string;
}

export interface WorkScheduleConfig {
  startDate: string;
  endDate: string;
  contractDurationYears: number;
  officialContractPdf?: string;
  hireDate: string;
  noticePeriodMonths: number;
  hoursPerDay: number;
  daysPerWeek: number;
  weeklyHours: number;
  weekendDays: string[];
  annualTotalDays: number;
  remainingDays: number;
  monthlyAccrualDays: number;
  isFlexibleHours: boolean;
  isRemote: boolean;
  isDriver: boolean;
  isBoardMember: boolean;
  isSiteShifts247: boolean;
  isFixedHours: boolean;
  hasSocialInsurance: boolean;
  socialInsuranceType: string;
  hasMedicalInsurance: boolean;
  medicalInsuranceMonthlyDeduction: number;
}

export interface Employee {
  id: string;
  uid: string; // e.g. '0335'
  employeeCode: string;
  nameAr: string;
  nameEn: string;
  jobTitleAr: string;
  jobTitleEn: string;
  departmentAr: string;
  departmentEn: string;
  companyId: string;
  companyNameAr: string;
  branchAr: string;
  projectCostCenterId?: string;
  projectCostCenterName?: string;
  mobile: string;
  workPhone?: string;
  email: string;
  nationalId: string;
  hireDate: string;
  contractStatus: ContractExpiryStatus;
  status: EmployeeStatus;
  lifecycleStatus: 'active' | 'resigned' | 'archived';
  directManager: string;
  workLocation: string;
  disbursementMethod: 'bank_transfer' | 'cash';
  bankName: string;
  bankAccount: string;
  bankIban?: string;
  hasOvertime: boolean;
  gender: 'male' | 'female';
  religion: string;
  address: string;
  salary: {
    basic: number;
    allowances: number;
    deductions: number;
    net: number;
  };
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  leaveBalance: {
    annualTotal: number;
    annualUsed: number;
    sickTotal: number;
    sickUsed: number;
    monthlyAccrual: number;
  };
  avatarColor: string;
  roleLevel: string;
  bloodType: string;
  socialInsuranceNo: string;
  workSchedule: WorkScheduleConfig;
  documents: DocumentItem[];
  assets: CustodyAssetItem[];
  allowancesList: AllowanceItem[];
  bonuses: BonusItem[];
  deductions: DeductionItem[];
  workedHours: {
    actualHours: number;
    requiredHours: number;
    completedDays: number;
    incompleteDays: number;
    dailyLogs: WorkedHoursDay[];
  };
  auditLogs: AuditLogItem[];
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: AttendanceStatus;
  workLocation: string;
  note?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  jobTitleAr: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  requestDate: string;
  approvedBy?: string;
}

export interface PayrollItem {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  jobTitle: string;
  department: string;
  companyId: string;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  siteBonus: number;
  grossSalary: number;
  insuranceDeduction: number;
  loanDeduction: number;
  taxDeduction: number;
  totalDeductions: number;
  netSalary: number;
  bankName: string;
  bankAccount: string;
  status: 'pending' | 'verified' | 'paid';
}

export interface EmployeeAdvance {
  id: string;
  advanceCode: string;
  employeeId: string;
  employeeName: string;
  jobTitle: string;
  companyId: string;
  totalAmount: number;
  monthlyDeduction: number;
  paidAmount: number;
  remainingAmount: number;
  installmentsTotal: number;
  installmentsRemaining: number;
  startDate: string;
  reason: string;
  status: AdvanceStatus;
  linkedVoucherCode: string;
}

export interface AssetCustody {
  id: string;
  custodyCode: string;
  employeeId: string;
  employeeName: string;
  assetType: 'laptop' | 'vehicle' | 'fuel_card' | 'survey_tool' | 'mobile_device';
  assetNameAr: string;
  serialNumber: string;
  issueDate: string;
  projectLinked: string;
  condition: string;
  status: CustodyStatus;
  clearanceDate?: string;
  notes?: string;
}

export interface EmployeeContractDoc {
  id: string;
  employeeId: string;
  employeeName: string;
  jobTitle: string;
  companyId: string;
  contractType: 'limited' | 'unlimited' | 'consultancy';
  startDate: string;
  endDate: string;
  daysUntilContractExpiry: number;
  nationalIdExpiry: string;
  daysUntilIdExpiry: number;
  workLicenseExpiry: string;
  daysUntilLicenseExpiry: number;
  medicalGrade: string;
  status: ContractExpiryStatus;
  documentRef: string;
}

interface HRContextType {
  // Employees
  employees: Employee[];
  selectedEmployee: Employee | null;
  setSelectedEmployee: (emp: Employee | null) => void;
  addEmployee: (emp: Partial<Employee>) => Employee;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  updateEmployeeContract: (id: string, newSchedule: Partial<WorkScheduleConfig>, newSalary?: number) => void;
  addBonusToEmployee: (id: string, bonus: Omit<BonusItem, 'id'>) => void;
  addDeductionToEmployee: (id: string, deduction: Omit<DeductionItem, 'id'>) => void;
  toggleEmployeeAssetStatus: (employeeId: string, assetId: string) => void;
  updateEmployeeDocumentStatus: (employeeId: string, docId: string, status: 'valid' | 'missing' | 'expiring') => void;
  archiveEmployee: (id: string) => void;
  resignEmployee: (id: string) => void;
  resetEmployeeBiometrics: (id: string) => void;

  // Attendance & Leaves
  attendanceRecords: AttendanceRecord[];
  punchAttendance: (employeeId: string, status: AttendanceStatus, location?: string) => void;
  leaveRequests: LeaveRequest[];
  submitLeaveRequest: (req: Omit<LeaveRequest, 'id' | 'status' | 'requestDate'>) => void;
  updateLeaveStatus: (id: string, status: LeaveStatus) => void;

  // Payroll
  currentPayrollPeriod: string;
  setCurrentPayrollPeriod: (p: string) => void;
  payrollItems: PayrollItem[];
  markPayrollItemPaid: (id: string) => void;
  batchApprovePayroll: () => void;

  // Advances & Custody
  advances: EmployeeAdvance[];
  addAdvance: (advance: Omit<EmployeeAdvance, 'id' | 'advanceCode' | 'paidAmount' | 'remainingAmount' | 'installmentsRemaining' | 'status'>) => void;
  custodyItems: AssetCustody[];
  addCustodyItem: (item: Omit<AssetCustody, 'id' | 'custodyCode' | 'status'>) => void;
  toggleCustodyClearance: (id: string) => void;

  // Contracts
  contracts: EmployeeContractDoc[];
  renewContract: (id: string, newEndDate: string) => void;

  // KPIs
  stats: {
    totalEmployees: number;
    activeCount: number;
    onLeaveCount: number;
    attendanceTodayRate: number;
    totalPayrollNet: number;
    totalActiveAdvances: number;
    expiringDocsCount: number;
    totalCustodyItems: number;
  };

  // Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

// 13 Standard Documents Helper
const createStandardDocuments = (empName: string, isExpiring: boolean = false): DocumentItem[] => [
  { id: 'doc-01', type: 'photo', titleAr: 'الصورة الشخصية الرسمية (خلفية بيضاء)', status: 'valid', updatedAt: '2026-01-10', fileName: 'personal_photo.jpg' },
  { id: 'doc-02', type: 'national_id', titleAr: 'بطاقة الرقم القومي (سارية)', status: isExpiring ? 'expiring' : 'valid', expiryDate: isExpiring ? '2026-11-15' : '2029-08-20', updatedAt: '2026-02-01', fileName: 'national_id_copy.pdf' },
  { id: 'doc-03', type: 'driving_license', titleAr: 'رخصة القيادة (مهنية / خاصة)', status: 'valid', expiryDate: '2028-05-30', updatedAt: '2025-06-15', fileName: 'driving_license.pdf' },
  { id: 'doc-04', type: 'military_cert', titleAr: 'شهادة أداء الخدمة العسكرية / الإعفاء النهائي', status: 'valid', updatedAt: '2024-03-10', fileName: 'military_service.pdf' },
  { id: 'doc-05', type: 'education_cert', titleAr: 'المؤهل الدراسي العالي المعتمد', status: 'valid', updatedAt: '2024-03-10', fileName: 'bachelor_degree.pdf' },
  { id: 'doc-06', type: 'engineers_syndicate', titleAr: 'كارنيه نقابة المهندسين والترخيص النقابي', status: 'valid', expiryDate: '2026-12-31', updatedAt: '2026-01-05', fileName: 'syndicate_card.pdf' },
  { id: 'doc-07', type: 'signed_contract', titleAr: 'عقد العمل الموحد الموقع (PDF)', status: 'valid', updatedAt: '2026-01-01', fileName: `contract_${empName.replace(/\s+/g, '_')}.pdf` },
  { id: 'doc-08', type: 'birth_cert', titleAr: 'شهادة الميلاد المميكنة (كمبيوتر)', status: 'valid', updatedAt: '2024-03-10', fileName: 'birth_certificate.pdf' },
  { id: 'doc-09', type: 'criminal_record', titleAr: 'صحيفة الحالة الجنائية (فيش وتشبيه حديث)', status: 'valid', expiryDate: '2026-12-15', updatedAt: '2026-09-01', fileName: 'criminal_record.pdf' },
  { id: 'doc-10', type: 'work_permit', titleAr: 'تصريح العمل ودخول المواقع الإنشائية', status: 'valid', expiryDate: '2027-02-28', updatedAt: '2026-03-01', fileName: 'site_entry_permit.pdf' },
  { id: 'doc-11', type: 'social_insurance_print', titleAr: 'برنت التأمينات الاجتماعية (س1 / س2)', status: 'valid', updatedAt: '2026-01-15', fileName: 'insurance_printout.pdf' },
  { id: 'doc-12', type: 'medical_check', titleAr: 'الكشف الطبي المهني المعتمد (نموذج س 111)', status: 'valid', updatedAt: '2024-03-15', fileName: 'medical_form_111.pdf' },
  { id: 'doc-13', type: 'utility_bill', titleAr: 'إيصال المرافق لإثبات محل الإقامة الفعلي', status: 'valid', updatedAt: '2025-11-20', fileName: 'utility_bill.pdf' },
];

// 7 Standard Custody Assets Helper
const createStandardAssets = (role: string): CustodyAssetItem[] => [
  { id: 'ast-01', type: 'laptop', nameAr: 'لابتوب العمل الهندسي المحمول (Dell Precision 5570)', status: 'delivered', issueDate: '2024-04-01', serialNumber: 'DELL-PR-88492', notes: 'حالة ممتازة - محمل ببرامج AutoCAD و Revit' },
  { id: 'ast-02', type: 'mobile_phone', nameAr: 'هاتف ذكي للموقع والمكتب (Samsung Galaxy A54)', status: 'delivered', issueDate: '2024-04-01', serialNumber: 'IMEI-3589210984', notes: 'مسلم بكامل مشتملاته' },
  { id: 'ast-03', type: 'sim_card', nameAr: 'خط اتصال مؤسسي مفتوح (فودافون بيزنس)', status: 'delivered', issueDate: '2024-04-01', serialNumber: '010-99238471', notes: 'باقة إنترنت غير محدودة للمواقع' },
  { id: 'ast-04', type: 'site_vehicle', nameAr: role.includes('مهندس') || role.includes('مدير') ? 'سيارة موقع دوبل كابينة (Toyota Hilux 2024)' : 'سيارة نقل خفيف للموقع (Nissan Pickup)', status: 'delivered', issueDate: '2024-06-15', serialNumber: 'رقم اللوحة: أ ر ق - 4829', notes: 'تأمين شامل - فحص دوري سارٍ' },
  { id: 'ast-05', type: 'fuel_card', nameAr: 'كارت وقود مخصص للسيارة (Shell Fleet Card)', status: 'delivered', issueDate: '2024-06-15', serialNumber: 'CARD-SH-99201', notes: 'حد شهري: 2,500 ج.م' },
  { id: 'ast-06', type: 'nfc_badge', nameAr: 'كارت مرور ذكي لبوابات المشاريع (Smart NFC Badge)', status: 'delivered', issueDate: '2024-04-01', serialNumber: 'NFC-ARK-0335', notes: 'صلاحية وصول لموقع شبرا النخل والعزيزية' },
  { id: 'ast-07', type: 'ppe_kit', nameAr: 'طقم مهمات السلامة والصحة المهنية (PPE الكامل)', status: 'delivered', issueDate: '2024-04-01', serialNumber: 'PPE-STD-2024', notes: 'خوذة، حذاء سيفتي، نظارة واقية، وسترة عاكسة' },
];

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-001',
    uid: '0335',
    employeeCode: 'TRB-0335',
    nameAr: 'م. أحمد فاروق رضوان',
    nameEn: 'Eng. Ahmed Farouk Radwan',
    jobTitleAr: 'مهندس موقع أول ومدير المكتب الفني',
    jobTitleEn: 'Senior Site Engineer & Technical Office Lead',
    departmentAr: 'المكتب الفني وإدارة المشاريع',
    departmentEn: 'Technical Office & Projects',
    companyId: 'comp_tarabot',
    companyNameAr: 'ترابط للمقاولات العامة',
    branchAr: 'قطاع مشروعات الشرقية والقليوبية',
    projectCostCenterId: 'PRJ-SHUBRA-01',
    projectCostCenterName: 'مشروع شبرا النخل والعزيزية',
    mobile: '010-6789-1234',
    workPhone: '02-2810-4401',
    email: 'a.farouk@tarabot-eg.com',
    nationalId: '28910150102938',
    hireDate: '2022-04-01',
    contractStatus: 'valid',
    status: 'active',
    lifecycleStatus: 'active',
    directManager: 'م. محمد سالم',
    workLocation: 'موقع شبرا النخل والعزيزية',
    disbursementMethod: 'bank_transfer',
    bankName: 'بنك مصر',
    bankAccount: 'EG380002000100000029384756',
    hasOvertime: true,
    gender: 'male',
    religion: 'مسلم',
    address: 'شارع الجامعة، الزقازيق، محافظة الشرقية',
    salary: { basic: 28000, allowances: 10800, deductions: 2400, net: 36400 },
    emergencyContact: { name: 'فاروق رضوان إبراهيم', relation: 'والد', phone: '012-3456-7890' },
    leaveBalance: { annualTotal: 21, annualUsed: 12, sickTotal: 15, sickUsed: 1, monthlyAccrual: 1.75 },
    avatarColor: '#D99B26',
    roleLevel: 'إشراف هندسي تنفيذي (Level 3)',
    bloodType: 'A+',
    socialInsuranceNo: '78291045',
    workSchedule: {
      startDate: '2024-04-01',
      endDate: '2027-03-31',
      contractDurationYears: 3,
      officialContractPdf: 'contract_ahmed_farouk.pdf',
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
    },
    documents: createStandardDocuments('م. أحمد فاروق رضوان'),
    assets: createStandardAssets('مهندس موقع'),
    allowancesList: [
      { id: 'alw-1', titleAr: 'بدل انتقال ومواصلات للموقع', amount: 3000, type: 'transport' },
      { id: 'alw-2', titleAr: 'بدل سكن واغتراب مشروعات', amount: 4500, type: 'housing' },
      { id: 'alw-3', titleAr: 'بدل طبيعة عمل ومواقع شاقة', amount: 2500, type: 'site_hardship' },
      { id: 'alw-4', titleAr: 'بدل هاتف واتصالات ميدانية', amount: 800, type: 'phone' },
    ],
    bonuses: [
      { id: 'bon-1', titleAr: 'حافز تسليم مرحلة صب الخرسانات سقف الدور الأرضي', amount: 5000, date: '2026-09-15', reason: 'إنجاز الصب قبل الجدول الزمني المعتمد بـ 4 أيام', projectLinked: 'مشروع شبرا النخل والعزيزية' },
      { id: 'bon-2', titleAr: 'مكافأة جودة ضبط الخرسانة واختبارات الهبوط', amount: 3500, date: '2026-07-20', reason: 'تقارير معملية بدون أي ملاحظات استشارية', projectLinked: 'مشروع شبرا النخل والعزيزية' },
    ],
    deductions: [
      { id: 'ded-1', titleAr: 'خصم مخالفة عدم ارتداء حزام الأمان على السقالة', daysCount: 1, amount: 850, date: '2026-08-10', reason: 'ملاحظة تقرير استشاري السلامة والصحة المهنية' },
    ],
    workedHours: {
      actualHours: 176,
      requiredHours: 160,
      completedDays: 22,
      incompleteDays: 0,
      dailyLogs: [
        { date: '2026-10-02', checkIn: '08:02 ص', checkOut: '04:30 م', hoursWorked: 8.5, status: 'complete' },
        { date: '2026-10-01', checkIn: '07:55 ص', checkOut: '05:00 م', hoursWorked: 9, status: 'complete' },
        { date: '2026-09-30', checkIn: '08:10 ص', checkOut: '04:15 م', hoursWorked: 8, status: 'complete' },
        { date: '2026-09-29', checkIn: '08:00 ص', checkOut: '04:30 م', hoursWorked: 8.5, status: 'complete' },
        { date: '2026-09-28', checkIn: '08:15 ص', checkOut: '04:15 م', hoursWorked: 8, status: 'complete' },
      ],
    },
    auditLogs: [
      { id: 'aud-1', timestamp: '2026-10-01 11:20 ص', actionType: 'تعديل بيانات', fieldChanged: 'رقم الحساب البنكي', oldValue: 'بنك القاهرة - 192837', newValue: 'بنك مصر - EG380002000100000029384756', userName: 'أ. دينا الشناوي' },
      { id: 'aud-2', timestamp: '2026-09-15 02:45 م', actionType: 'صرف مكافأة', fieldChanged: 'مكافأة تسليم صب الخرسانات', oldValue: '0 ج.م', newValue: '5,000 ج.م', userName: 'م. محمد سالم' },
      { id: 'aud-3', timestamp: '2026-08-01 09:30 ص', actionType: 'تجديد وثيقة', fieldChanged: 'تصريح العمل ودخول المواقع', oldValue: 'منتهٍ (2026-07-31)', newValue: 'سارٍ حتى (2027-02-28)', userName: 'أ. طارق عبد العزيز' },
    ],
  },
  {
    id: 'EMP-002',
    uid: '0104',
    employeeCode: 'TRB-0104',
    nameAr: 'أ. سامح عبد الحميد عبد الدايم',
    nameEn: 'Mr. Sameh Abdelhamid',
    jobTitleAr: 'محاسب مواقع ومراقب تكاليف المشروعات',
    jobTitleEn: 'Senior Site Accountant & Cost Controller',
    departmentAr: 'الشؤون المالية ومحاسبة التكاليف',
    departmentEn: 'Finance & Cost Accounting',
    companyId: 'comp_tarabot',
    companyNameAr: 'ترابط للمقاولات العامة',
    branchAr: 'قطاع مشروعات الشرقية والقليوبية',
    projectCostCenterId: 'PRJ-SHUBRA-01',
    projectCostCenterName: 'مشروع شبرا النخل والعزيزية',
    mobile: '011-2345-6789',
    workPhone: '02-2810-4402',
    email: 's.abdelhamid@tarabot-eg.com',
    nationalId: '29105120101928',
    hireDate: '2021-06-15',
    contractStatus: 'valid',
    status: 'active',
    lifecycleStatus: 'active',
    directManager: 'أ. كريم عبد العزيز',
    workLocation: 'موقع شبرا النخل والعزيزية',
    disbursementMethod: 'bank_transfer',
    bankName: 'QNB الأهلي',
    bankAccount: 'EG120009000100000049281726',
    hasOvertime: true,
    gender: 'male',
    religion: 'مسلم',
    address: 'شارع سعد زغلول، بنها، محافظة القليوبية',
    salary: { basic: 22000, allowances: 7500, deductions: 1800, net: 27700 },
    emergencyContact: { name: 'محمود عبد الحميد', relation: 'شقيق', phone: '010-8877-6655' },
    leaveBalance: { annualTotal: 21, annualUsed: 6, sickTotal: 15, sickUsed: 0, monthlyAccrual: 1.75 },
    avatarColor: '#059669',
    roleLevel: 'محاسب أول (Level 2)',
    bloodType: 'B+',
    socialInsuranceNo: '62918273',
    workSchedule: {
      startDate: '2024-01-01',
      endDate: '2027-12-31',
      contractDurationYears: 4,
      officialContractPdf: 'contract_sameh.pdf',
      hireDate: '2021-06-15',
      noticePeriodMonths: 3,
      hoursPerDay: 8,
      daysPerWeek: 5,
      weeklyHours: 40,
      weekendDays: ['الجمعة', 'السبت'],
      annualTotalDays: 21,
      remainingDays: 15,
      monthlyAccrualDays: 1.75,
      isFlexibleHours: false,
      isRemote: false,
      isDriver: false,
      isBoardMember: false,
      isSiteShifts247: false,
      isFixedHours: true,
      hasSocialInsurance: true,
      socialInsuranceType: 'تأمين كامل نمطي',
      hasMedicalInsurance: true,
      medicalInsuranceMonthlyDeduction: 350,
    },
    documents: createStandardDocuments('أ. سامح عبد الحميد'),
    assets: createStandardAssets('محاسب'),
    allowancesList: [
      { id: 'alw-1', titleAr: 'بدل انتقال لمواقع المشاريع', amount: 2500, type: 'transport' },
      { id: 'alw-2', titleAr: 'بدل إقامة واغتراب', amount: 3500, type: 'housing' },
      { id: 'alw-3', titleAr: 'بدل هاتف واتصالات مالية', amount: 600, type: 'phone' },
      { id: 'alw-4', titleAr: 'بدل عهدة خزانة موقع', amount: 900, type: 'site_hardship' },
    ],
    bonuses: [
      { id: 'bon-1', titleAr: 'مكافأة جرد ختام المستخلص رقم 03 دون فروقات', amount: 3000, date: '2026-08-25', reason: 'مطابقة تامة بين الحصر الميداني والدفاتر', projectLinked: 'مشروع شبرا النخل والعزيزية' },
    ],
    deductions: [],
    workedHours: {
      actualHours: 168,
      requiredHours: 160,
      completedDays: 21,
      incompleteDays: 0,
      dailyLogs: [
        { date: '2026-10-02', checkIn: '08:30 ص', checkOut: '04:30 م', hoursWorked: 8, status: 'complete' },
        { date: '2026-10-01', checkIn: '08:25 ص', checkOut: '04:35 م', hoursWorked: 8.1, status: 'complete' },
      ],
    },
    auditLogs: [],
  },
  {
    id: 'EMP-003',
    uid: '0089',
    employeeCode: 'MST-0089',
    nameAr: 'م. طارق مصطفى سالم',
    nameEn: 'Eng. Tarek Mostafa Salem',
    jobTitleAr: 'مدير قطاع المشاريع والإنشاءات الكبرى',
    jobTitleEn: 'Projects Director & VP Engineering',
    departmentAr: 'إدارة المشاريع العامة',
    departmentEn: 'Major Projects Directorate',
    companyId: 'comp_master_group',
    companyNameAr: 'ماستر جروب القابضة',
    branchAr: 'المقر الإداري - التجمع الخامس',
    projectCostCenterId: 'PRJ-RIYADH-01',
    projectCostCenterName: 'برج الرياض الاستثماري',
    mobile: '012-7890-1234',
    workPhone: '02-2810-4400',
    email: 't.salem@mastergroup-eg.com',
    nationalId: '27809180103847',
    hireDate: '2019-10-01',
    contractStatus: 'valid',
    status: 'active',
    lifecycleStatus: 'active',
    directManager: 'م. محمد سالم',
    workLocation: 'برج الرياض',
    disbursementMethod: 'bank_transfer',
    bankName: 'CIB البنك التجاري الدولي',
    bankAccount: 'EG940003000100000084920193',
    hasOvertime: false,
    gender: 'male',
    religion: 'مسلم',
    address: 'فيلا 14، الحي الدبلوماسي، التجمع الخامس',
    salary: { basic: 65000, allowances: 25000, deductions: 6800, net: 83200 },
    emergencyContact: { name: 'نهى سالم', relation: 'زوجة', phone: '010-9988-7766' },
    leaveBalance: { annualTotal: 30, annualUsed: 10, sickTotal: 15, sickUsed: 0, monthlyAccrual: 2.5 },
    avatarColor: '#6366F1',
    roleLevel: 'إدارة عليا تنفيذية (Level 4)',
    bloodType: 'O+',
    socialInsuranceNo: '48291038',
    workSchedule: {
      startDate: '2023-10-01',
      endDate: '2028-09-30',
      contractDurationYears: 5,
      officialContractPdf: 'contract_tarek_salem.pdf',
      hireDate: '2019-10-01',
      noticePeriodMonths: 6,
      hoursPerDay: 8,
      daysPerWeek: 5,
      weeklyHours: 40,
      weekendDays: ['الجمعة', 'السبت'],
      annualTotalDays: 30,
      remainingDays: 20,
      monthlyAccrualDays: 2.5,
      isFlexibleHours: true,
      isRemote: true,
      isDriver: false,
      isBoardMember: true,
      isSiteShifts247: false,
      isFixedHours: false,
      hasSocialInsurance: true,
      socialInsuranceType: 'تأمين قيادات وإدارة عليا',
      hasMedicalInsurance: true,
      medicalInsuranceMonthlyDeduction: 800,
    },
    documents: createStandardDocuments('م. طارق مصطفى سالم'),
    assets: createStandardAssets('مدير قطاع'),
    allowancesList: [
      { id: 'alw-1', titleAr: 'بدل سيارة وانتقال تنفيذي', amount: 8000, type: 'transport' },
      { id: 'alw-2', titleAr: 'بدل سكن رئاسة مشاريع', amount: 12000, type: 'housing' },
      { id: 'alw-3', titleAr: 'بدل تمثيل ولقاءات عملاء', amount: 3500, type: 'site_hardship' },
      { id: 'alw-4', titleAr: 'بدل اتصالات وإنترنت دولي', amount: 1500, type: 'phone' },
    ],
    bonuses: [
      { id: 'bon-1', titleAr: 'مكافأة توقيع عقد برج الرياض مع المستثمر الرئيسي', amount: 25000, date: '2026-05-10', reason: 'إتمام المفاوضات الفنية والمالية بنجاح', projectLinked: 'برج الرياض الاستثماري' },
    ],
    deductions: [],
    workedHours: {
      actualHours: 180,
      requiredHours: 160,
      completedDays: 22,
      incompleteDays: 0,
      dailyLogs: [],
    },
    auditLogs: [],
  },
  {
    id: 'EMP-004',
    uid: '0214',
    employeeCode: 'TRB-0214',
    nameAr: 'أ. دينا محمود الشناوي',
    nameEn: 'Ms. Dina El-Shennawy',
    jobTitleAr: 'مسؤولة شؤون العاملين والرواتب (HR Specialist)',
    jobTitleEn: 'HR & Payroll Specialist',
    departmentAr: 'الموارد البشرية والشؤون الإدارية',
    departmentEn: 'Human Resources & Personnel',
    companyId: 'comp_tarabot',
    companyNameAr: 'ترابط للمقاولات العامة',
    branchAr: 'المقر الرئيسي - التجمع الخامس',
    projectCostCenterId: 'HQ-OPERATIONS',
    projectCostCenterName: 'المقر الإداري الرئيسي',
    mobile: '010-3456-7890',
    workPhone: '02-2810-4405',
    email: 'd.elshennawy@tarabot-eg.com',
    nationalId: '29503140102839',
    hireDate: '2023-01-10',
    contractStatus: 'valid',
    status: 'active',
    lifecycleStatus: 'active',
    directManager: 'أ. أحمد مصطفى',
    workLocation: 'المقر الرئيسي - التجمع',
    disbursementMethod: 'bank_transfer',
    bankName: 'بنك مصر',
    bankAccount: 'EG380002000100000039281745',
    hasOvertime: false,
    gender: 'female',
    religion: 'مسلم',
    address: 'مدينة نصر، الحي السابع، القاهرة',
    salary: { basic: 18000, allowances: 4500, deductions: 1400, net: 21100 },
    emergencyContact: { name: 'محمود الشناوي', relation: 'والد', phone: '011-4455-6677' },
    leaveBalance: { annualTotal: 21, annualUsed: 4, sickTotal: 15, sickUsed: 1, monthlyAccrual: 1.75 },
    avatarColor: '#EC4899',
    roleLevel: 'أخصائي أول (Level 2)',
    bloodType: 'O+',
    socialInsuranceNo: '59281048',
    workSchedule: {
      startDate: '2024-01-10',
      endDate: '2027-01-09',
      contractDurationYears: 3,
      officialContractPdf: 'contract_dina.pdf',
      hireDate: '2023-01-10',
      noticePeriodMonths: 2,
      hoursPerDay: 8,
      daysPerWeek: 5,
      weeklyHours: 40,
      weekendDays: ['الجمعة', 'السبت'],
      annualTotalDays: 21,
      remainingDays: 17,
      monthlyAccrualDays: 1.75,
      isFlexibleHours: false,
      isRemote: false,
      isDriver: false,
      isBoardMember: false,
      isSiteShifts247: false,
      isFixedHours: true,
      hasSocialInsurance: true,
      socialInsuranceType: 'تأمين كامل',
      hasMedicalInsurance: true,
      medicalInsuranceMonthlyDeduction: 300,
    },
    documents: createStandardDocuments('أ. دينا محمود الشناوي'),
    assets: createStandardAssets('إداري'),
    allowancesList: [
      { id: 'alw-1', titleAr: 'بدل انتقال ومواصلات', amount: 2500, type: 'transport' },
      { id: 'alw-2', titleAr: 'بدل هاتف وتواصل', amount: 500, type: 'phone' },
      { id: 'alw-3', titleAr: 'حافز انتظام ومتابعة ملفات', amount: 1500, type: 'site_hardship' },
    ],
    bonuses: [],
    deductions: [],
    workedHours: {
      actualHours: 160,
      requiredHours: 160,
      completedDays: 20,
      incompleteDays: 0,
      dailyLogs: [],
    },
    auditLogs: [],
  },
  {
    id: 'EMP-005',
    uid: '0155',
    employeeCode: 'IMB-0155',
    nameAr: 'م. حسام الدين غنيم',
    nameEn: 'Eng. Hossam Ghoneim',
    jobTitleAr: 'استشاري الأنظمة الكهروميكانيكية (MEP Lead)',
    jobTitleEn: 'Lead MEP Consultant & Site Lead',
    departmentAr: 'الهندسة الكهروميكانيكية',
    departmentEn: 'MEP Engineering',
    companyId: 'comp_impro',
    companyNameAr: 'إيمبرو للاستشارات والحلول الهندسية',
    branchAr: 'قطاع مشروعات الجيزة الكبرى',
    projectCostCenterId: 'PRJ-AGOUZA-01',
    projectCostCenterName: 'مستشفى العجوزة التخصصي',
    mobile: '010-9876-5432',
    workPhone: '02-3344-5566',
    email: 'h.ghoneim@impro-eng.com',
    nationalId: '28405160102948',
    hireDate: '2021-08-01',
    contractStatus: 'expiring_soon',
    status: 'active',
    lifecycleStatus: 'active',
    directManager: 'م. طارق مصطفى سالم',
    workLocation: 'مستشفى العجوزة',
    disbursementMethod: 'bank_transfer',
    bankName: 'بنك مصر',
    bankAccount: 'EG380002000100000048291038',
    hasOvertime: true,
    gender: 'male',
    religion: 'مسلم',
    address: 'شارع النيل، العجوزة، محافظة الجيزة',
    salary: { basic: 32000, allowances: 12000, deductions: 3200, net: 40800 },
    emergencyContact: { name: 'نهى غنيم', relation: 'شقيقة', phone: '012-8877-9900' },
    leaveBalance: { annualTotal: 21, annualUsed: 14, sickTotal: 15, sickUsed: 2, monthlyAccrual: 1.75 },
    avatarColor: '#10B981',
    roleLevel: 'استشاري أول (Level 3)',
    bloodType: 'B+',
    socialInsuranceNo: '69201948',
    workSchedule: {
      startDate: '2023-11-01',
      endDate: '2026-11-15',
      contractDurationYears: 3,
      officialContractPdf: 'contract_hossam.pdf',
      hireDate: '2021-08-01',
      noticePeriodMonths: 3,
      hoursPerDay: 8,
      daysPerWeek: 5,
      weeklyHours: 40,
      weekendDays: ['الجمعة', 'السبت'],
      annualTotalDays: 21,
      remainingDays: 7,
      monthlyAccrualDays: 1.75,
      isFlexibleHours: false,
      isRemote: true,
      isDriver: false,
      isBoardMember: false,
      isSiteShifts247: false,
      isFixedHours: true,
      hasSocialInsurance: true,
      socialInsuranceType: 'تأمين كامل نمطي',
      hasMedicalInsurance: true,
      medicalInsuranceMonthlyDeduction: 500,
    },
    documents: createStandardDocuments('م. حسام الدين غنيم', true),
    assets: createStandardAssets('مهندس استشاري'),
    allowancesList: [
      { id: 'alw-1', titleAr: 'بدل انتقال ومحروقات', amount: 3500, type: 'transport' },
      { id: 'alw-2', titleAr: 'بدل مواقع طبية خاصة', amount: 4500, type: 'site_hardship' },
      { id: 'alw-3', titleAr: 'بدل إشراف ليلي غرف العمليات', amount: 3000, type: 'housing' },
      { id: 'alw-4', titleAr: 'بدل هاتف', amount: 1000, type: 'phone' },
    ],
    bonuses: [
      { id: 'bon-1', titleAr: 'مكافأة إنهاء شبكة الغازات الطبية بمستشفى العجوزة', amount: 8000, date: '2026-06-30', reason: 'اجتياز اختبارات الضغط بنجاح مع الاستشاري العام', projectLinked: 'مستشفى العجوزة التخصصي' },
    ],
    deductions: [],
    workedHours: {
      actualHours: 172,
      requiredHours: 160,
      completedDays: 21,
      incompleteDays: 0,
      dailyLogs: [],
    },
    auditLogs: [],
  },
  {
    id: 'EMP-006',
    uid: '0412',
    employeeCode: 'TRB-0412',
    nameAr: 'فني. رمضان عبد العظيم حسن',
    nameEn: 'Mr. Ramadan Abdelazim',
    jobTitleAr: 'مشرف تنفيذ خرسانات وموقع عام',
    jobTitleEn: 'General Concrete & Site Supervisor',
    departmentAr: 'التنفيذ الميداني وإدارة العمالة',
    departmentEn: 'Field Operations & Construction',
    companyId: 'comp_tarabot',
    companyNameAr: 'ترابط للمقاولات العامة',
    branchAr: 'قطاع مشروعات الشرقية والقليوبية',
    projectCostCenterId: 'PRJ-SHUBRA-01',
    projectCostCenterName: 'مشروع شبرا النخل والعزيزية',
    mobile: '012-3344-5566',
    workPhone: '02-2810-4412',
    email: 'r.abdelazim@tarabot-eg.com',
    nationalId: '27908120104839',
    hireDate: '2020-05-15',
    contractStatus: 'valid',
    status: 'active',
    lifecycleStatus: 'active',
    directManager: 'م. أحمد فاروق رضوان',
    workLocation: 'موقع شبرا النخل والعزيزية',
    disbursementMethod: 'cash',
    bankName: 'صرف نقدي (خزينة المشروع)',
    bankAccount: 'CASH-TRB-SITE-01',
    hasOvertime: true,
    gender: 'male',
    religion: 'مسلم',
    address: 'قرية شبرا النخل، مركز بلبيس، الشرقية',
    salary: { basic: 14000, allowances: 5500, deductions: 1100, net: 18400 },
    emergencyContact: { name: 'عبد العظيم حسن', relation: 'والد', phone: '010-1122-3344' },
    leaveBalance: { annualTotal: 21, annualUsed: 8, sickTotal: 15, sickUsed: 0, monthlyAccrual: 1.75 },
    avatarColor: '#F59E0B',
    roleLevel: 'إشراف ميداني (Level 1)',
    bloodType: 'O+',
    socialInsuranceNo: '39201948',
    workSchedule: {
      startDate: '2024-05-15',
      endDate: '2027-05-14',
      contractDurationYears: 3,
      hireDate: '2020-05-15',
      noticePeriodMonths: 1,
      hoursPerDay: 9,
      daysPerWeek: 6,
      weeklyHours: 54,
      weekendDays: ['الجمعة'],
      annualTotalDays: 21,
      remainingDays: 13,
      monthlyAccrualDays: 1.75,
      isFlexibleHours: false,
      isRemote: false,
      isDriver: false,
      isBoardMember: false,
      isSiteShifts247: true,
      isFixedHours: true,
      hasSocialInsurance: true,
      socialInsuranceType: 'تأمين عمالة تشييد وبناء',
      hasMedicalInsurance: true,
      medicalInsuranceMonthlyDeduction: 200,
    },
    documents: createStandardDocuments('فني. رمضان عبد العظيم'),
    assets: createStandardAssets('مشرف موقع'),
    allowancesList: [
      { id: 'alw-1', titleAr: 'بدل إشراف صب ليلي', amount: 2500, type: 'site_hardship' },
      { id: 'alw-2', titleAr: 'بدل انتقال يومي للموقع', amount: 2000, type: 'transport' },
      { id: 'alw-3', titleAr: 'بدل اتصالات وتنسيق مقاولين', amount: 1000, type: 'phone' },
    ],
    bonuses: [
      { id: 'bon-1', titleAr: 'مكافأة التحكم في هالك حديد التسليح بنسبة 1.5%', amount: 3000, date: '2026-09-05', reason: 'توفير ملموس في أوامر توريد الحديد', projectLinked: 'مشروع شبرا النخل والعزيزية' },
    ],
    deductions: [],
    workedHours: {
      actualHours: 210,
      requiredHours: 190,
      completedDays: 25,
      incompleteDays: 0,
      dailyLogs: [],
    },
    auditLogs: [],
  },
  {
    id: 'EMP-007',
    uid: '0072',
    employeeCode: 'JAD-0072',
    nameAr: 'أ. ريهام كمال القاضي',
    nameEn: 'Ms. Reham El-Qadi',
    jobTitleAr: 'مديرة تطوير الأعمال والتسويق المؤسسي',
    jobTitleEn: 'Head of Business Development',
    departmentAr: 'تطوير الأعمال والتعاقدات',
    departmentEn: 'Business Development',
    companyId: 'comp_jadara',
    companyNameAr: 'جدارة للاستشارات وإدارة المرافق',
    branchAr: 'فرع القاهرة - مصر الجديدة',
    projectCostCenterId: 'CORP-BD',
    projectCostCenterName: 'قطاع تطوير الأعمال والشراكات',
    mobile: '010-1234-5678',
    workPhone: '02-2690-1122',
    email: 'r.elqadi@jadara-group.com',
    nationalId: '28804200102938',
    hireDate: '2022-02-01',
    contractStatus: 'valid',
    status: 'active',
    lifecycleStatus: 'active',
    directManager: 'أ. أحمد مصطفى',
    workLocation: 'المقر الرئيسي - التجمع',
    disbursementMethod: 'bank_transfer',
    bankName: 'QNB الأهلي',
    bankAccount: 'EG120009000100000092837465',
    hasOvertime: false,
    gender: 'female',
    religion: 'مسلم',
    address: 'شارع النزهة، مصر الجديدة، القاهرة',
    salary: { basic: 35000, allowances: 15000, deductions: 3800, net: 46200 },
    emergencyContact: { name: 'كمال القاضي', relation: 'والد', phone: '010-6677-8899' },
    leaveBalance: { annualTotal: 21, annualUsed: 5, sickTotal: 15, sickUsed: 0, monthlyAccrual: 1.75 },
    avatarColor: '#8B5CF6',
    roleLevel: 'إدارة عليا (Level 4)',
    bloodType: 'A+',
    socialInsuranceNo: '58291038',
    workSchedule: {
      startDate: '2024-02-01',
      endDate: '2027-01-31',
      contractDurationYears: 3,
      hireDate: '2022-02-01',
      noticePeriodMonths: 3,
      hoursPerDay: 8,
      daysPerWeek: 5,
      weeklyHours: 40,
      weekendDays: ['الجمعة', 'السبت'],
      annualTotalDays: 21,
      remainingDays: 16,
      monthlyAccrualDays: 1.75,
      isFlexibleHours: true,
      isRemote: true,
      isDriver: false,
      isBoardMember: false,
      isSiteShifts247: false,
      isFixedHours: false,
      hasSocialInsurance: true,
      socialInsuranceType: 'تأمين كامل نمطي',
      hasMedicalInsurance: true,
      medicalInsuranceMonthlyDeduction: 600,
    },
    documents: createStandardDocuments('أ. ريهام كمال القاضي'),
    assets: createStandardAssets('مديرة تطوير أعمال'),
    allowancesList: [
      { id: 'alw-1', titleAr: 'بدل سيارة وتمثيل شركات', amount: 6000, type: 'transport' },
      { id: 'alw-2', titleAr: 'بدل سكن واستقرار', amount: 7000, type: 'housing' },
      { id: 'alw-3', titleAr: 'بدل اتصالات وإنترنت', amount: 2000, type: 'phone' },
    ],
    bonuses: [],
    deductions: [],
    workedHours: {
      actualHours: 160,
      requiredHours: 160,
      completedDays: 20,
      incompleteDays: 0,
      dailyLogs: [],
    },
    auditLogs: [],
  },
  {
    id: 'EMP-008',
    uid: '0380',
    employeeCode: 'TRV-0380',
    nameAr: 'كابتن. محمود فتحي النجار',
    nameEn: 'Mr. Mahmoud Fathi',
    jobTitleAr: 'مشرف أسطول النقل والمعدات اللوجستية',
    jobTitleEn: 'Fleet Supervisor & Logistics Coordinator',
    departmentAr: 'الخدمات اللوجستية والنقل',
    departmentEn: 'Logistics & Fleet Operations',
    companyId: 'comp_master_travel',
    companyNameAr: 'ماستر ترافل والنقل البري',
    branchAr: 'جراج الأسطول المركزي - العاشر من رمضان',
    projectCostCenterId: 'LOG-FLEET-CENTRAL',
    projectCostCenterName: 'مركز تشغيل الأسطول والمعدات الثقيلة',
    mobile: '010-8899-0011',
    workPhone: '02-2810-4480',
    email: 'm.fathi@mastertravel-eg.com',
    nationalId: '28307180103928',
    hireDate: '2020-03-01',
    contractStatus: 'valid',
    status: 'active',
    lifecycleStatus: 'active',
    directManager: 'أ. طارق مصطفى سالم',
    workLocation: 'المقر الرئيسي - التجمع',
    disbursementMethod: 'bank_transfer',
    bankName: 'بنك مصر',
    bankAccount: 'EG380002000100000059281748',
    hasOvertime: true,
    gender: 'male',
    religion: 'مسلم',
    address: 'شارع العاشر، مدينة العاشر من رمضان، الشرقية',
    salary: { basic: 16000, allowances: 6000, deductions: 1200, net: 20800 },
    emergencyContact: { name: 'فتحي النجار', relation: 'والد', phone: '011-9988-7766' },
    leaveBalance: { annualTotal: 21, annualUsed: 9, sickTotal: 15, sickUsed: 1, monthlyAccrual: 1.75 },
    avatarColor: '#14B8A6',
    roleLevel: 'إشراف لوجستي (Level 2)',
    bloodType: 'AB+',
    socialInsuranceNo: '49281039',
    workSchedule: {
      startDate: '2024-03-01',
      endDate: '2027-02-28',
      contractDurationYears: 3,
      hireDate: '2020-03-01',
      noticePeriodMonths: 2,
      hoursPerDay: 8,
      daysPerWeek: 6,
      weeklyHours: 48,
      weekendDays: ['الجمعة'],
      annualTotalDays: 21,
      remainingDays: 12,
      monthlyAccrualDays: 1.75,
      isFlexibleHours: true,
      isRemote: false,
      isDriver: true,
      isBoardMember: false,
      isSiteShifts247: true,
      isFixedHours: false,
      hasSocialInsurance: true,
      socialInsuranceType: 'تأمين سائقين ونقل',
      hasMedicalInsurance: true,
      medicalInsuranceMonthlyDeduction: 250,
    },
    documents: createStandardDocuments('كابتن. محمود فتحي النجار'),
    assets: createStandardAssets('مشرف نقل'),
    allowancesList: [
      { id: 'alw-1', titleAr: 'بدل مأموريات سفر ومحافظات', amount: 3000, type: 'transport' },
      { id: 'alw-2', titleAr: 'بدل صيانة وطوارئ طريق', amount: 2000, type: 'site_hardship' },
      { id: 'alw-3', titleAr: 'بدل هاتف تتبع الأسطول', amount: 1000, type: 'phone' },
    ],
    bonuses: [
      { id: 'bon-1', titleAr: 'مكافأة صفر حوادث خلال الربع الثالث 2026', amount: 4000, date: '2026-09-28', reason: 'التزام تام بمعايير القيادة الآمنة وصيانة المركبات' },
    ],
    deductions: [],
    workedHours: {
      actualHours: 195,
      requiredHours: 180,
      completedDays: 24,
      incompleteDays: 0,
      dailyLogs: [],
    },
    auditLogs: [],
  },
];

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att-1', employeeId: 'EMP-001', employeeName: 'م. أحمد فاروق رضوان', date: '2026-10-02', checkIn: '08:02 ص', checkOut: '04:30 م', status: 'present', workLocation: 'موقع شبرا النخل والعزيزية', note: 'بصمة حيوية معتمدة' },
  { id: 'att-2', employeeId: 'EMP-002', employeeName: 'أ. سامح عبد الحميد عبد الدايم', date: '2026-10-02', checkIn: '08:30 ص', checkOut: '04:30 م', status: 'present', workLocation: 'موقع شبرا النخل والعزيزية', note: 'بصمة حيوية معتمدة' },
  { id: 'att-3', employeeId: 'EMP-003', employeeName: 'م. طارق مصطفى سالم', date: '2026-10-02', checkIn: '08:45 ص', checkOut: '05:00 م', status: 'present', workLocation: 'برج الرياض', note: 'بصمة الوجه الذكية' },
  { id: 'att-4', employeeId: 'EMP-004', employeeName: 'أ. دينا محمود الشناوي', date: '2026-10-02', checkIn: '08:50 ص', checkOut: '05:00 م', status: 'present', workLocation: 'المقر الرئيسي - التجمع', note: 'بصمة بطاقة NFC' },
  { id: 'att-5', employeeId: 'EMP-005', employeeName: 'م. حسام الدين غنيم', date: '2026-10-02', checkIn: '08:15 ص', checkOut: '04:15 م', status: 'present', workLocation: 'مستشفى العجوزة', note: 'بصمة الموقع الحيوية' },
  { id: 'att-6', employeeId: 'EMP-006', employeeName: 'فني. رمضان عبد العظيم حسن', date: '2026-10-02', checkIn: '07:30 ص', checkOut: '05:30 م', status: 'present', workLocation: 'موقع شبرا النخل والعزيزية', note: 'بصمة الموقع الحيوية' },
  { id: 'att-7', employeeId: 'EMP-007', employeeName: 'أ. ريهام كمال القاضي', date: '2026-10-02', checkIn: '09:00 ص', checkOut: '05:00 م', status: 'present', workLocation: 'المقر الرئيسي - التجمع', note: 'تسجيل دخول عبر التطبيق' },
  { id: 'att-8', employeeId: 'EMP-008', employeeName: 'كابتن. محمود فتحي النجار', date: '2026-10-02', checkIn: '07:00 ص', checkOut: '04:00 م', status: 'present', workLocation: 'جراج العاشر من رمضان', note: 'بصمة الأسطول' },
];

const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  { id: 'LR-01', employeeId: 'EMP-001', employeeName: 'م. أحمد فاروق رضوان', jobTitleAr: 'مهندس موقع أول', type: 'annual', startDate: '2026-10-18', endDate: '2026-10-22', daysCount: 5, reason: 'إجازة سنوية اعتيادية لتجديد النشاط', status: 'pending', requestDate: '2026-10-01' },
  { id: 'LR-02', employeeId: 'EMP-005', employeeName: 'م. حسام الدين غنيم', jobTitleAr: 'استشاري MEP', type: 'sick', startDate: '2026-09-25', endDate: '2026-09-26', daysCount: 2, reason: 'وعكة صحية طارئة وتقرير طبي مرفق', status: 'approved', requestDate: '2026-09-24', approvedBy: 'أ. أحمد مصطفى' },
  { id: 'LR-03', employeeId: 'EMP-006', employeeName: 'فني. رمضان عبد العظيم حسن', jobTitleAr: 'مشرف موقع', type: 'casual', startDate: '2026-10-05', endDate: '2026-10-06', daysCount: 2, reason: 'ظرف عائلي طارئ', status: 'pending', requestDate: '2026-10-02' },
];

const INITIAL_PAYROLL: PayrollItem[] = INITIAL_EMPLOYEES.map(emp => ({
  id: `PAY-${emp.id}`,
  employeeId: emp.id,
  employeeCode: emp.employeeCode,
  employeeName: emp.nameAr,
  jobTitle: emp.jobTitleAr,
  department: emp.departmentAr,
  companyId: emp.companyId,
  basicSalary: emp.salary.basic,
  housingAllowance: emp.salary.allowances * 0.5,
  transportAllowance: emp.salary.allowances * 0.3,
  siteBonus: emp.salary.allowances * 0.2,
  grossSalary: emp.salary.basic + emp.salary.allowances,
  insuranceDeduction: emp.salary.deductions * 0.6,
  loanDeduction: 0,
  taxDeduction: emp.salary.deductions * 0.4,
  totalDeductions: emp.salary.deductions,
  netSalary: emp.salary.net,
  bankName: emp.bankName,
  bankAccount: emp.bankAccount,
  status: 'verified',
}));

const INITIAL_ADVANCES: EmployeeAdvance[] = [
  {
    id: 'ADV-01',
    advanceCode: 'ADV-2026-004',
    employeeId: 'EMP-001',
    employeeName: 'م. أحمد فاروق رضوان',
    jobTitle: 'مهندس موقع أول',
    companyId: 'comp_tarabot',
    totalAmount: 30000,
    monthlyDeduction: 3000,
    paidAmount: 18000,
    remainingAmount: 12000,
    installmentsTotal: 10,
    installmentsRemaining: 4,
    startDate: '2026-04-01',
    reason: 'سلفة تحسين سكن عائلي بالقرب من الموقع',
    status: 'active',
    linkedVoucherCode: 'VOU-PAY-2026-1892',
  },
  {
    id: 'ADV-02',
    advanceCode: 'ADV-2026-008',
    employeeId: 'EMP-006',
    employeeName: 'فني. رمضان عبد العظيم حسن',
    jobTitle: 'مشرف موقع',
    companyId: 'comp_tarabot',
    totalAmount: 15000,
    monthlyDeduction: 1500,
    paidAmount: 6000,
    remainingAmount: 9000,
    installmentsTotal: 10,
    installmentsRemaining: 6,
    startDate: '2026-06-01',
    reason: 'سلفة زواج ابنة طارئة',
    status: 'active',
    linkedVoucherCode: 'VOU-PAY-2026-2144',
  },
];

const INITIAL_CUSTODY: AssetCustody[] = [
  { id: 'CST-01', custodyCode: 'AST-LPT-001', employeeId: 'EMP-001', employeeName: 'م. أحمد فاروق رضوان', assetType: 'laptop', assetNameAr: 'لابتوب هندسي (Dell Precision 5570)', serialNumber: 'DELL-PR-88492', issueDate: '2024-04-01', projectLinked: 'مشروع شبرا النخل والعزيزية', condition: 'ممتازة', status: 'in_custody', notes: 'محمل ببرامج AutoCAD و Revit' },
  { id: 'CST-02', custodyCode: 'AST-CAR-002', employeeId: 'EMP-001', employeeName: 'م. أحمد فاروق رضوان', assetType: 'vehicle', assetNameAr: 'سيارة تويوتا هايلوكس 2024 للموقع', serialNumber: 'أ ر ق - 4829', issueDate: '2024-06-15', projectLinked: 'مشروع شبرا النخل والعزيزية', condition: 'ممتازة', status: 'in_custody', notes: 'كارت وقود 2,500 ج.م/شهر' },
  { id: 'CST-03', custodyCode: 'AST-LPT-003', employeeId: 'EMP-002', employeeName: 'أ. سامح عبد الحميد عبد الدايم', assetType: 'laptop', assetNameAr: 'لابتوب محاسبي (ThinkPad T14)', serialNumber: 'LEN-TP-9281', issueDate: '2024-02-10', projectLinked: 'مشروع شبرا النخل والعزيزية', condition: 'جيدة جداً', status: 'in_custody' },
  { id: 'CST-04', custodyCode: 'AST-MOB-004', employeeId: 'EMP-006', employeeName: 'فني. رمضان عبد العظيم حسن', assetType: 'mobile_device', assetNameAr: 'هاتف ميداني سامسونج A54 مقاوم للصدمات', serialNumber: 'SM-A54-8821', issueDate: '2024-05-15', projectLinked: 'مشروع شبرا النخل والعزيزية', condition: 'جيدة', status: 'in_custody' },
];

const INITIAL_CONTRACTS: EmployeeContractDoc[] = [
  {
    id: 'DOC-01',
    employeeId: 'EMP-001',
    employeeName: 'م. أحمد فاروق رضوان',
    jobTitle: 'مهندس موقع أول',
    companyId: 'comp_tarabot',
    contractType: 'limited',
    startDate: '2024-04-01',
    endDate: '2027-03-31',
    daysUntilContractExpiry: 180,
    nationalIdExpiry: '2029-08-20',
    daysUntilIdExpiry: 1050,
    workLicenseExpiry: '2028-05-30',
    daysUntilLicenseExpiry: 600,
    medicalGrade: 'الفئة A+ كبار الشخصيات (VIP)',
    status: 'valid',
    documentRef: 'CTS-2024-HR-089',
  },
  {
    id: 'DOC-02',
    employeeId: 'EMP-005',
    employeeName: 'م. حسام الدين غنيم',
    jobTitle: 'استشاري MEP',
    companyId: 'comp_impro',
    contractType: 'limited',
    startDate: '2023-11-01',
    endDate: '2026-11-15',
    daysUntilContractExpiry: 44,
    nationalIdExpiry: '2028-11-10',
    daysUntilIdExpiry: 760,
    workLicenseExpiry: '2026-11-15',
    daysUntilLicenseExpiry: 44,
    medicalGrade: 'الفئة A الممتازة (Gold Care)',
    status: 'expiring_soon',
    documentRef: 'CTS-2023-HR-214',
  },
];

const HRContext = createContext<HRContextType | undefined>(undefined);

export const HRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(INITIAL_EMPLOYEES[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [payrollItems, setPayrollItems] = useState<PayrollItem[]>(INITIAL_PAYROLL);
  const [advances, setAdvances] = useState<EmployeeAdvance[]>(INITIAL_ADVANCES);
  const [custodyItems, setCustodyItems] = useState<AssetCustody[]>(INITIAL_CUSTODY);
  const [contracts, setContracts] = useState<EmployeeContractDoc[]>(INITIAL_CONTRACTS);
  const [currentPayrollPeriod, setCurrentPayrollPeriod] = useState<string>('2026-10');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Add Employee
  const addEmployee = (empData: Partial<Employee>): Employee => {
    const nextNum = employees.length + 1;
    const newId = `EMP-${String(nextNum).padStart(3, '0')}`;
    const newUid = `0${String(nextNum + 330).padStart(3, '0')}`;
    const newCode = `TRB-${newUid}`;

    const newEmp: Employee = {
      id: newId,
      uid: newUid,
      employeeCode: newCode,
      nameAr: empData.nameAr || 'موظف جديد',
      nameEn: empData.nameEn || 'New Employee',
      jobTitleAr: empData.jobTitleAr || 'مهندس موقع',
      jobTitleEn: empData.jobTitleEn || 'Site Engineer',
      departmentAr: empData.departmentAr || 'إدارة المشاريع',
      departmentEn: empData.departmentEn || 'Projects Directorate',
      companyId: empData.companyId || 'comp_tarabot',
      companyNameAr: empData.companyNameAr || 'ترابط للمقاولات العامة',
      branchAr: empData.branchAr || 'قطاع مشروعات الشرقية والقليوبية',
      projectCostCenterId: empData.projectCostCenterId || 'PRJ-SHUBRA-01',
      projectCostCenterName: empData.projectCostCenterName || 'مشروع شبرا النخل والعزيزية',
      mobile: empData.mobile || '010-0000-0000',
      workPhone: empData.workPhone || '02-2810-4499',
      email: empData.email || `emp${nextNum}@tarabot-eg.com`,
      nationalId: empData.nationalId || '29000000000000',
      hireDate: empData.hireDate || '2026-10-01',
      contractStatus: 'valid',
      status: 'active',
      lifecycleStatus: 'active',
      directManager: empData.directManager || 'م. محمد سالم',
      workLocation: empData.workLocation || 'مشروع شبرا النخل والعزيزية',
      disbursementMethod: empData.disbursementMethod || 'bank_transfer',
      bankName: empData.bankName || 'بنك مصر',
      bankAccount: empData.bankAccount || 'EG380002000000000000000000',
      hasOvertime: true,
      gender: empData.gender || 'male',
      religion: empData.religion || 'مسلم',
      address: empData.address || 'القاهرة، جمهورية مصر العربية',
      salary: empData.salary || { basic: 20000, allowances: 6000, deductions: 1600, net: 24400 },
      emergencyContact: empData.emergencyContact || { name: 'جهة اتصال طوارئ', relation: 'قريب', phone: '010-0000-0000' },
      leaveBalance: { annualTotal: 21, annualUsed: 0, sickTotal: 15, sickUsed: 0, monthlyAccrual: 1.75 },
      avatarColor: '#D99B26',
      roleLevel: 'إشراف ميداني تنفيذي',
      bloodType: 'O+',
      socialInsuranceNo: '99001122',
      workSchedule: {
        startDate: '2026-10-01',
        endDate: '2029-09-30',
        contractDurationYears: 3,
        hireDate: '2026-10-01',
        noticePeriodMonths: 3,
        hoursPerDay: 8,
        daysPerWeek: 5,
        weeklyHours: 40,
        weekendDays: ['الجمعة', 'السبت'],
        annualTotalDays: 21,
        remainingDays: 21,
        monthlyAccrualDays: 1.75,
        isFlexibleHours: false,
        isRemote: false,
        isDriver: false,
        isBoardMember: false,
        isSiteShifts247: false,
        isFixedHours: true,
        hasSocialInsurance: true,
        socialInsuranceType: 'تأمين كامل نمطي',
        hasMedicalInsurance: true,
        medicalInsuranceMonthlyDeduction: 350,
      },
      documents: createStandardDocuments(empData.nameAr || 'موظف جديد'),
      assets: createStandardAssets('مهندس'),
      allowancesList: [
        { id: 'alw-1', titleAr: 'بدل انتقال ومواصلات', amount: 3000, type: 'transport' },
        { id: 'alw-2', titleAr: 'بدل سكن واغتراب', amount: 3000, type: 'housing' },
      ],
      bonuses: [],
      deductions: [],
      workedHours: {
        actualHours: 160,
        requiredHours: 160,
        completedDays: 20,
        incompleteDays: 0,
        dailyLogs: [],
      },
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toLocaleDateString('ar-EG'),
          actionType: 'إنشاء ملف موظف',
          fieldChanged: 'الحالة العامة',
          oldValue: 'غير مسجل',
          newValue: 'مسجل ومعتمد',
          userName: 'مدير الموارد البشرية',
        },
      ],
    };

    setEmployees(prev => [newEmp, ...prev]);

    // Add to payroll items
    const newPay: PayrollItem = {
      id: `PAY-${newId}`,
      employeeId: newId,
      employeeCode: newCode,
      employeeName: newEmp.nameAr,
      jobTitle: newEmp.jobTitleAr,
      department: newEmp.departmentAr,
      companyId: newEmp.companyId,
      basicSalary: newEmp.salary.basic,
      housingAllowance: newEmp.salary.allowances * 0.5,
      transportAllowance: newEmp.salary.allowances * 0.5,
      siteBonus: 0,
      grossSalary: newEmp.salary.basic + newEmp.salary.allowances,
      insuranceDeduction: newEmp.salary.deductions * 0.6,
      loanDeduction: 0,
      taxDeduction: newEmp.salary.deductions * 0.4,
      totalDeductions: newEmp.salary.deductions,
      netSalary: newEmp.salary.net,
      bankName: newEmp.bankName,
      bankAccount: newEmp.bankAccount,
      status: 'pending',
    };
    setPayrollItems(prev => [newPay, ...prev]);

    showToast(`تم إضافة الموظف بنجاح: ${newEmp.nameAr} (${newCode})`);
    return newEmp;
  };

  // Update Employee
  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev =>
      prev.map(e => {
        if (e.id === id) {
          const updated = { ...e, ...updates };
          if (selectedEmployee?.id === id) {
            setSelectedEmployee(updated);
          }
          return updated;
        }
        return e;
      })
    );
    showToast('تم تحديث بيانات ملف الموظف بنجاح');
  };

  // Update Employee Contract
  const updateEmployeeContract = (id: string, newSchedule: Partial<WorkScheduleConfig>, newSalary?: number) => {
    setEmployees(prev =>
      prev.map(e => {
        if (e.id === id) {
          const updatedSchedule = { ...e.workSchedule, ...newSchedule };
          const updatedSalary = newSalary !== undefined ? { ...e.salary, basic: newSalary, net: newSalary + e.salary.allowances - e.salary.deductions } : e.salary;
          const newAudit: AuditLogItem = {
            id: `aud-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            actionType: 'تعديل بنود العقد',
            fieldChanged: 'شروط العقد ونظام العمل',
            oldValue: `${e.workSchedule.hoursPerDay} س/يوم - ${e.salary.basic} ج.م`,
            newValue: `${updatedSchedule.hoursPerDay} س/يوم - ${updatedSalary.basic} ج.م`,
            userName: 'مدير الموارد البشرية',
          };
          const updated = {
            ...e,
            workSchedule: updatedSchedule,
            salary: updatedSalary,
            auditLogs: [newAudit, ...e.auditLogs],
          };
          if (selectedEmployee?.id === id) {
            setSelectedEmployee(updated);
          }
          return updated;
        }
        return e;
      })
    );
    showToast('تم حفظ واعتماد بنود العقد ونظام العمل بنجاح');
  };

  // Add Bonus
  const addBonusToEmployee = (id: string, bonus: Omit<BonusItem, 'id'>) => {
    setEmployees(prev =>
      prev.map(e => {
        if (e.id === id) {
          const newBonus: BonusItem = { ...bonus, id: `bon-${Date.now()}` };
          const newAudit: AuditLogItem = {
            id: `aud-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            actionType: 'صرف مكافأة',
            fieldChanged: bonus.titleAr,
            oldValue: '0 ج.م',
            newValue: `${bonus.amount.toLocaleString('en-US')} ج.م`,
            userName: 'مدير المشاريع',
          };
          const updated = {
            ...e,
            bonuses: [newBonus, ...e.bonuses],
            auditLogs: [newAudit, ...e.auditLogs],
          };
          if (selectedEmployee?.id === id) setSelectedEmployee(updated);
          return updated;
        }
        return e;
      })
    );
    showToast(`تم صرف المكافأة للموظف بقيمة ${bonus.amount.toLocaleString('en-US')} ج.م بنجاح`);
  };

  // Add Deduction
  const addDeductionToEmployee = (id: string, deduction: Omit<DeductionItem, 'id'>) => {
    setEmployees(prev =>
      prev.map(e => {
        if (e.id === id) {
          const newDeduction: DeductionItem = { ...deduction, id: `ded-${Date.now()}` };
          const newAudit: AuditLogItem = {
            id: `aud-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            actionType: 'تسجيل جزاء',
            fieldChanged: deduction.titleAr,
            oldValue: '0 ج.م',
            newValue: `خصم ${deduction.amount.toLocaleString('en-US')} ج.م`,
            userName: 'الشؤون القانونية والموارد البشرية',
          };
          const updated = {
            ...e,
            deductions: [newDeduction, ...e.deductions],
            auditLogs: [newAudit, ...e.auditLogs],
          };
          if (selectedEmployee?.id === id) setSelectedEmployee(updated);
          return updated;
        }
        return e;
      })
    );
    showToast(`تم تسجيل الخصم بقيمة ${deduction.amount.toLocaleString('en-US')} ج.م`);
  };

  // Toggle Asset Status
  const toggleEmployeeAssetStatus = (employeeId: string, assetId: string) => {
    setEmployees(prev =>
      prev.map(e => {
        if (e.id === employeeId) {
          const updatedAssets = e.assets.map(a =>
            a.id === assetId
              ? { ...a, status: a.status === 'delivered' ? ('not_delivered' as const) : ('delivered' as const) }
              : a
          );
          const assetName = e.assets.find(a => a.id === assetId)?.nameAr || 'العهدة';
          const newAudit: AuditLogItem = {
            id: `aud-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            actionType: 'تعديل حالة عهدة',
            fieldChanged: assetName,
            oldValue: 'تغيير الحالة',
            newValue: 'تم تحديث حالة التسليم والاسترداد',
            userName: 'مسؤول العهد والمخازن',
          };
          const updated = { ...e, assets: updatedAssets, auditLogs: [newAudit, ...e.auditLogs] };
          if (selectedEmployee?.id === employeeId) setSelectedEmployee(updated);
          return updated;
        }
        return e;
      })
    );
    showToast('تم تحديث حالة العهدة وتوثيق العملية في سجل العمليات');
  };

  // Update Document Status
  const updateEmployeeDocumentStatus = (employeeId: string, docId: string, status: 'valid' | 'missing' | 'expiring') => {
    setEmployees(prev =>
      prev.map(e => {
        if (e.id === employeeId) {
          const updatedDocs = e.documents.map(d => (d.id === docId ? { ...d, status } : d));
          const updated = { ...e, documents: updatedDocs };
          if (selectedEmployee?.id === employeeId) setSelectedEmployee(updated);
          return updated;
        }
        return e;
      })
    );
    showToast('تم تحديث حالة الوثيقة بنجاح');
  };

  // Archive Employee
  const archiveEmployee = (id: string) => {
    setEmployees(prev =>
      prev.map(e => {
        if (e.id === id) {
          const updated = { ...e, lifecycleStatus: 'archived' as const };
          if (selectedEmployee?.id === id) setSelectedEmployee(updated);
          return updated;
        }
        return e;
      })
    );
    showToast('تم نقل ملف الموظف إلى سجل الأرشيف الإداري بنجاح');
  };

  // Resign Employee
  const resignEmployee = (id: string) => {
    setEmployees(prev =>
      prev.map(e => {
        if (e.id === id) {
          const updated = { ...e, lifecycleStatus: 'resigned' as const, status: 'terminated' as const };
          if (selectedEmployee?.id === id) setSelectedEmployee(updated);
          return updated;
        }
        return e;
      })
    );
    showToast('تم تسجيل استقالة الموظف وبدء إجراءات إخلاء الطرف');
  };

  // Reset Biometrics
  const resetEmployeeBiometrics = (id: string) => {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;
    showToast(`تم إرسال أمر إعادة تعيين البصمة للموظف: ${emp.nameAr} لأجهزة الموقع بنجاح`);
  };

  // Punch Attendance
  const punchAttendance = (employeeId: string, status: AttendanceStatus, location?: string) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    const todayStr = '2026-10-02';
    const nowTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    setAttendanceRecords(prev => {
      const existing = prev.find(a => a.employeeId === employeeId && a.date === todayStr);
      if (existing) {
        return prev.map(a => (a.id === existing.id ? { ...a, status, checkOut: nowTime, note: location } : a));
      } else {
        const newRecord: AttendanceRecord = {
          id: `ATT-${Date.now()}`,
          employeeId,
          employeeName: emp.nameAr,
          date: todayStr,
          checkIn: nowTime,
          status,
          workLocation: location || emp.workLocation,
        };
        return [newRecord, ...prev];
      }
    });

    const labelMap = {
      present: 'حاضر',
      absent: 'غائب',
      leave: 'إجازة',
      mission: 'مأمورية عمل',
    };
    showToast(`تم تسجيل الحضور: ${emp.nameAr} - [${labelMap[status]}]`);
  };

  // Submit Leave Request
  const submitLeaveRequest = (req: Omit<LeaveRequest, 'id' | 'status' | 'requestDate'>) => {
    const newReq: LeaveRequest = {
      ...req,
      id: `LR-${Date.now()}`,
      status: 'pending',
      requestDate: '2026-10-02',
    };
    setLeaveRequests(prev => [newReq, ...prev]);
    showToast(`تم تقديم طلب الإجازة بنجاح: ${req.employeeName}`);
  };

  // Update Leave Status
  const updateLeaveStatus = (id: string, status: LeaveStatus) => {
    setLeaveRequests(prev => prev.map(l => (l.id === id ? { ...l, status, approvedBy: 'إدارة الموارد البشرية' } : l)));
    showToast(`تم تحديث حالة الإجازة: ${status === 'approved' ? 'معتمدة' : 'مرفوضة'}`);
  };

  // Mark Payroll Item Paid
  const markPayrollItemPaid = (id: string) => {
    setPayrollItems(prev => prev.map(p => (p.id === id ? { ...p, status: 'paid' as const } : p)));
    showToast('تم تأكيد صرف وتحويل الراتب بنجاح');
  };

  // Batch Approve Payroll
  const batchApprovePayroll = () => {
    setPayrollItems(prev => prev.map(p => ({ ...p, status: 'paid' as const })));
    showToast('تم اعتماد وصرف كشف مسير الرواتب بالكامل');
  };

  // Add Advance
  const addAdvance = (advance: Omit<EmployeeAdvance, 'id' | 'advanceCode' | 'paidAmount' | 'remainingAmount' | 'installmentsRemaining' | 'status'>) => {
    const nextCode = `ADV-2026-${String(advances.length + 1).padStart(3, '0')}`;
    const newAdv: EmployeeAdvance = {
      ...advance,
      id: `ADV-${Date.now()}`,
      advanceCode: nextCode,
      paidAmount: 0,
      remainingAmount: advance.totalAmount,
      installmentsRemaining: advance.installmentsTotal,
      status: 'active',
    };
    setAdvances(prev => [newAdv, ...prev]);
    showToast(`تم تسجيل السلفة بنجاح: ${advance.employeeName} (${advance.totalAmount.toLocaleString('en-US')} ج.م)`);
  };

  // Add Custody Item
  const addCustodyItem = (item: Omit<AssetCustody, 'id' | 'custodyCode' | 'status'>) => {
    const nextCode = `AST-${String(custodyItems.length + 1).padStart(3, '0')}`;
    const newItem: AssetCustody = {
      ...item,
      id: `CST-${Date.now()}`,
      custodyCode: nextCode,
      status: 'in_custody',
    };
    setCustodyItems(prev => [newItem, ...prev]);
    showToast(`تم تسليم العهدة: ${item.assetNameAr}`);
  };

  // Toggle Custody Clearance
  const toggleCustodyClearance = (id: string) => {
    setCustodyItems(prev =>
      prev.map(c => {
        if (c.id === id) {
          const newStatus: CustodyStatus = c.status === 'in_custody' ? 'returned_cleared' : 'in_custody';
          const nowStr = newStatus === 'returned_cleared' ? '2026-10-02' : undefined;
          return { ...c, status: newStatus, clearanceDate: nowStr };
        }
        return c;
      })
    );
    showToast('تم تحديث حالة إخلاء طرف العهدة بنجاح');
  };

  // Renew Contract
  const renewContract = (id: string, newEndDate: string) => {
    setContracts(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            endDate: newEndDate,
            daysUntilContractExpiry: 365,
            status: 'valid',
          };
        }
        return c;
      })
    );
    showToast('تم تجديد العقد وتحديث تاريخ الانتهاء');
  };

  // Compute live stats
  const stats = useMemo(() => {
    const totalEmployees = employees.length;
    const activeCount = employees.filter(e => e.status === 'active' && e.lifecycleStatus === 'active').length;
    const onLeaveCount = employees.filter(e => e.status === 'on_leave').length;
    const attendanceTodayRate = totalEmployees > 0 ? Math.round((activeCount / totalEmployees) * 100) : 100;
    const totalPayrollNet = employees.reduce((sum, e) => sum + e.salary.net, 0);
    const totalActiveAdvances = advances.filter(a => a.status === 'active').length;
    const expiringDocsCount = contracts.filter(c => c.status === 'expiring_soon' || c.status === 'expired').length;
    const totalCustodyItems = custodyItems.filter(c => c.status === 'in_custody').length;

    return {
      totalEmployees,
      activeCount,
      onLeaveCount,
      attendanceTodayRate,
      totalPayrollNet,
      totalActiveAdvances,
      expiringDocsCount,
      totalCustodyItems,
    };
  }, [employees, advances, contracts, custodyItems]);

  return (
    <HRContext.Provider
      value={{
        employees,
        selectedEmployee,
        setSelectedEmployee,
        addEmployee,
        updateEmployee,
        updateEmployeeContract,
        addBonusToEmployee,
        addDeductionToEmployee,
        toggleEmployeeAssetStatus,
        updateEmployeeDocumentStatus,
        archiveEmployee,
        resignEmployee,
        resetEmployeeBiometrics,
        attendanceRecords,
        punchAttendance,
        leaveRequests,
        submitLeaveRequest,
        updateLeaveStatus,
        currentPayrollPeriod,
        setCurrentPayrollPeriod,
        payrollItems,
        markPayrollItemPaid,
        batchApprovePayroll,
        advances,
        addAdvance,
        custodyItems,
        addCustodyItem,
        toggleCustodyClearance,
        contracts,
        renewContract,
        stats,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </HRContext.Provider>
  );
};

export const useHR = (): HRContextType => {
  const context = useContext(HRContext);
  if (!context) {
    throw new Error('useHR must be used within an HRProvider');
  }
  return context;
};
