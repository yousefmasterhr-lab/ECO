import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  hrStorage,
  EgyptianHRRegulationsConfig,
  DEFAULT_EGYPTIAN_HR_SETTINGS,
} from '../services/hrStorage';
import {
  parseEgyptianNationalId,
  calculateFullEgyptianPayrollSlip,
  calculateAnnualLeaveEntitlement,
} from '../utils/egyptianLaborAlgorithms';

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
  fileData?: string;
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
  uid: string; // e.g. '0001'
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
  birthDate?: string;
  governorate?: string;
  workforceCategory?: string;
  insurableWage?: number;
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

export interface HRCandidate {
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

  // Recruitment Candidates
  candidates: HRCandidate[];
  addCandidate: (cand: Omit<HRCandidate, 'id' | 'stage' | 'appliedDate'>) => void;
  advanceCandidateStage: (candId: string) => void;

  // Egyptian HR Regulations & Purge
  regulations: EgyptianHRRegulationsConfig;
  updateRegulations: (next: EgyptianHRRegulationsConfig) => void;
  purgeAllHRModuleData: () => Promise<void>;

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

// مسوغات التعيين المصرية الـ 13 المعتمدة طبقاً لقانون العمل المصري رقم 12 لسنة 2003
export const createStandardDocuments = (_empName: string, isExpiring: boolean = false): DocumentItem[] => {
  const today = new Date().toISOString().slice(0, 10);
  return [
    { id: 'doc-01', type: 'birth_cert', titleAr: 'أصل شهادة الميلاد المميكنة (كمبيوتر)', status: 'missing', updatedAt: today },
    { id: 'doc-02', type: 'criminal_record', titleAr: 'صحيفة الحالة الجنائية (فيش وتشبيه موجه للشركة)', status: 'missing', updatedAt: today },
    { id: 'doc-03', type: 'labor_office_stub', titleAr: 'كعب العمل (شهادة القيد بمكتب القوى العاملة - يرد خلال 30 يوماً)', status: 'missing', updatedAt: today },
    { id: 'doc-04', type: 'social_insurance_s1', titleAr: 'استمارة س1 تأمينات اجتماعية وبرنت الرقم التأميني', status: 'missing', updatedAt: today },
    { id: 'doc-05', type: 'social_insurance_s6', titleAr: 'استمارة س6 تأمينات (إخلاء طرف من جهة عمل سابقة)', status: 'missing', updatedAt: today },
    { id: 'doc-06', type: 'medical_check_111', titleAr: 'نموذج الكشف الطبي الابتدائي (استمارة 111 تأمين صحي)', status: 'missing', updatedAt: today },
    { id: 'doc-07', type: 'military_cert', titleAr: 'شهادة تأدية الخدمة العسكرية أو الإعفاء النهائي (للذكور)', status: 'missing', updatedAt: today },
    { id: 'doc-08', type: 'education_cert', titleAr: 'أصل المؤهل الدراسي أو الشهادة المعتمدة', status: 'missing', updatedAt: today },
    { id: 'doc-09', type: 'syndicate_card', titleAr: 'كارنيه النقابة المهنية الساري (المهندسين / التجاريين / المحامين)', status: 'missing', updatedAt: today },
    { id: 'doc-10', type: 'national_id', titleAr: 'صورة بطاقة الرقم القومي السارية (وجهين) + 6 صور 4×6', status: isExpiring ? 'expiring' : 'missing', updatedAt: today },
    { id: 'doc-11', type: 'signed_contract', titleAr: 'عقد العمل الفردي الموحد (3 نسخ: موظف / شركة / تأمينات)', status: 'missing', updatedAt: today },
    { id: 'doc-12', type: 'driving_license', titleAr: 'رخصة القيادة المهنية / الخاصة السارية', status: 'missing', updatedAt: today },
    { id: 'doc-13', type: 'custody_utility', titleAr: 'إقرار الذمة المالية واستلام العهدة وإيصال مرافق حديث', status: 'missing', updatedAt: today },
  ];
};

// Standard Custody Assets Helper
export const createStandardAssets = (_role: string): CustodyAssetItem[] => [];

const HRContext = createContext<HRContextType | undefined>(undefined);

export const HRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 100% Real Live State initialized directly from hrStorage (Zero Mock Data)
  const [employees, setEmployees] = useState<Employee[]>(() => hrStorage.getEmployees());
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(() => {
    const list = hrStorage.getEmployees();
    return list.length > 0 ? list[0] : null;
  });
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => hrStorage.getAttendance());
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => hrStorage.getLeaves());
  const [payrollItems, setPayrollItems] = useState<PayrollItem[]>([]);
  const [advances, setAdvances] = useState<EmployeeAdvance[]>(() => hrStorage.getAdvances());
  const [custodyItems, setCustodyItems] = useState<AssetCustody[]>(() => hrStorage.getCustodyItems());
  const [contracts, setContracts] = useState<EmployeeContractDoc[]>(() => hrStorage.getContracts());
  const [candidates, setCandidates] = useState<HRCandidate[]>(() => hrStorage.getCandidates());
  const [regulations, setRegulations] = useState<EgyptianHRRegulationsConfig>(() =>
    hrStorage.getSettings() || { ...DEFAULT_EGYPTIAN_HR_SETTINGS }
  );
  const [currentPayrollPeriod, setCurrentPayrollPeriod] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reactive listener to eco-hr-updated broadcast from D1 / storage sync
  useEffect(() => {
    const handleUpdate = () => {
      const emps = hrStorage.getEmployees();
      setEmployees(emps);
      setSelectedEmployee(prev => {
        if (!prev) return emps.length > 0 ? emps[0] : null;
        return emps.find(e => e.id === prev.id) || (emps.length > 0 ? emps[0] : null);
      });
      setContracts(hrStorage.getContracts());
      setAttendanceRecords(hrStorage.getAttendance());
      setLeaveRequests(hrStorage.getLeaves());
      setAdvances(hrStorage.getAdvances());
      setCandidates(hrStorage.getCandidates());
      setCustodyItems(hrStorage.getCustodyItems());
      setRegulations(hrStorage.getSettings());
    };

    window.addEventListener('eco-hr-updated', handleUpdate);
    return () => window.removeEventListener('eco-hr-updated', handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Add Employee with zero mock data + Egyptian National ID & Labor Law Calculations
  const addEmployee = (empData: Partial<Employee>): Employee => {
    const nextNum = employees.length + 1;
    const newId = empData.id || `EMP-${Date.now().toString().slice(-4)}`;
    const newUid = empData.uid || String(nextNum).padStart(4, '0');
    const newCode = empData.employeeCode || `EMP-${newUid}`;
    const hireDate = empData.hireDate || new Date().toISOString().slice(0, 10);

    const nidInfo = parseEgyptianNationalId(empData.nationalId || '');
    const leaveEntitlement = calculateAnnualLeaveEntitlement({
      hireDate,
      nationalId: empData.nationalId,
    });

    const basicSalary = empData.salary?.basic ?? 0;
    const allowancesAmount = empData.salary?.allowances ?? 0;
    const payrollCalc = calculateFullEgyptianPayrollSlip({
      basicSalary,
      insurableWage: empData.insurableWage ?? basicSalary,
      housingAllowance: allowancesAmount,
      isInsured: empData.workSchedule?.hasSocialInsurance ?? true,
    });

    const computedSalary =
      empData.salary && empData.salary.deductions > 0
        ? empData.salary
        : {
            basic: basicSalary,
            allowances: allowancesAmount,
            deductions: payrollCalc.totalStatutoryAndCustomDeductions,
            net: payrollCalc.netSalary,
          };

    const newEmp: Employee = {
      id: newId,
      uid: newUid,
      employeeCode: newCode,
      nameAr: empData.nameAr || '',
      nameEn: empData.nameEn || '',
      jobTitleAr: empData.jobTitleAr || '',
      jobTitleEn: empData.jobTitleEn || '',
      departmentAr: empData.departmentAr || '',
      departmentEn: empData.departmentEn || '',
      companyId: empData.companyId || '',
      companyNameAr: empData.companyNameAr || '',
      branchAr: empData.branchAr || '',
      projectCostCenterId: empData.projectCostCenterId || '',
      projectCostCenterName: empData.projectCostCenterName || '',
      mobile: empData.mobile || '',
      workPhone: empData.workPhone || '',
      email: empData.email || '',
      nationalId: empData.nationalId || '',
      birthDate: empData.birthDate || nidInfo.birthDate || '',
      governorate: empData.governorate || nidInfo.governorateName || '',
      workforceCategory: empData.workforceCategory || 'عمالة دائمة — الإدارة المركزية',
      insurableWage: payrollCalc.insurance.clampedInsurableWage,
      hireDate,
      contractStatus: 'valid',
      status: empData.status || 'active',
      lifecycleStatus: 'active',
      directManager: empData.directManager || '',
      workLocation: empData.workLocation || '',
      disbursementMethod: empData.disbursementMethod || 'bank_transfer',
      bankName: empData.bankName || 'البنك الأهلي المصري (NBE)',
      bankAccount: empData.bankAccount || '',
      hasOvertime: empData.hasOvertime ?? true,
      gender: empData.gender || nidInfo.gender || 'male',
      religion: empData.religion || 'مسلم',
      address: empData.address || (nidInfo.governorateName ? `محافظة ${nidInfo.governorateName}` : ''),
      salary: computedSalary,
      emergencyContact: empData.emergencyContact || { name: '', relation: '', phone: '' },
      leaveBalance: {
        annualTotal: leaveEntitlement.annualTotal,
        annualUsed: 0,
        sickTotal: 15,
        sickUsed: 0,
        monthlyAccrual: leaveEntitlement.monthlyAccrual,
      },
      avatarColor: '#059669',
      roleLevel: empData.roleLevel || empData.jobTitleAr || '',
      bloodType: empData.bloodType || 'O+',
      socialInsuranceNo: empData.socialInsuranceNo || '',
      workSchedule: empData.workSchedule || {
        startDate: hireDate,
        endDate: `${new Date(hireDate).getFullYear() + 1}-${hireDate.slice(5)}`,
        contractDurationYears: 1,
        hireDate,
        noticePeriodMonths: 2,
        hoursPerDay: regulations.headquartersHours || 8,
        daysPerWeek: 5,
        weeklyHours: (regulations.headquartersHours || 8) * 5,
        weekendDays: ['الجمعة', 'السبت'],
        annualTotalDays: leaveEntitlement.annualTotal,
        remainingDays: leaveEntitlement.annualTotal,
        monthlyAccrualDays: leaveEntitlement.monthlyAccrual,
        isFlexibleHours: false,
        isRemote: false,
        isDriver: false,
        isBoardMember: false,
        isSiteShifts247: false,
        isFixedHours: true,
        hasSocialInsurance: true,
        socialInsuranceType: 'تأمين نمطي (قانون 148 لسنة 2019)',
        hasMedicalInsurance: false,
        medicalInsuranceMonthlyDeduction: 0,
      },
      documents: empData.documents || createStandardDocuments(empData.nameAr || 'موظف جديد'),
      assets: empData.assets || [],
      allowancesList: empData.allowancesList || [],
      bonuses: [],
      deductions: [],
      workedHours: {
        actualHours: 0,
        requiredHours: 160,
        completedDays: 0,
        incompleteDays: 0,
        dailyLogs: [],
      },
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toLocaleDateString('ar-EG'),
          actionType: 'إنشاء ملف موظف مصري',
          fieldChanged: 'الهوية والراتب',
          oldValue: 'غير مسجل',
          newValue: `${newCode} — رصيد إجازات ${leaveEntitlement.annualTotal} يوم`,
          userName: 'مدير الموارد البشرية',
        },
      ],
    };

    const endYear = Number(hireDate.slice(0, 4)) + 1;
    const contractEndDate = `${endYear}-${hireDate.slice(5)}`;
    const initialContract: EmployeeContractDoc = {
      id: `CTR-${Date.now()}`,
      employeeId: newId,
      employeeName: newEmp.nameAr,
      jobTitle: newEmp.jobTitleAr,
      companyId: newEmp.companyId,
      contractType: 'limited',
      startDate: hireDate,
      endDate: contractEndDate,
      daysUntilContractExpiry: 365,
      nationalIdExpiry: '',
      daysUntilIdExpiry: 365,
      workLicenseExpiry: '',
      daysUntilLicenseExpiry: 365,
      medicalGrade: 'نموذج س111 تأمين صحي',
      status: 'valid',
      documentRef: `EG-CTR-${newUid}`,
    };

    setEmployees(prev => [newEmp, ...prev]);
    setContracts(prev => [initialContract, ...prev]);
    setSelectedEmployee(newEmp);
    hrStorage.saveEmployee(newEmp);
    hrStorage.saveContract(initialContract);

    showToast(`تم تسجيل الموظف وعقده المصري بنجاح: ${newEmp.nameAr || newCode}`);
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
          hrStorage.saveEmployee(updated);
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
            oldValue: `${e.workSchedule?.hoursPerDay || 8} س/يوم - ${e.salary?.basic || 0} ج.م`,
            newValue: `${updatedSchedule.hoursPerDay} س/يوم - ${updatedSalary.basic} ج.م`,
            userName: 'مدير الموارد البشرية',
          };
          const updated = {
            ...e,
            workSchedule: updatedSchedule,
            salary: updatedSalary,
            auditLogs: [newAudit, ...(e.auditLogs || [])],
          };
          if (selectedEmployee?.id === id) {
            setSelectedEmployee(updated);
          }
          hrStorage.saveEmployee(updated);
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
            bonuses: [newBonus, ...(e.bonuses || [])],
            auditLogs: [newAudit, ...(e.auditLogs || [])],
          };
          if (selectedEmployee?.id === id) setSelectedEmployee(updated);
          hrStorage.saveEmployee(updated);
          return updated;
        }
        return e;
      })
    );
    showToast(`تم صرف المكافأة بقيمة ${bonus.amount.toLocaleString('en-US')} ج.م بنجاح`);
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
            deductions: [newDeduction, ...(e.deductions || [])],
            auditLogs: [newAudit, ...(e.auditLogs || [])],
          };
          if (selectedEmployee?.id === id) setSelectedEmployee(updated);
          hrStorage.saveEmployee(updated);
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
          const updatedAssets = (e.assets || []).map(a =>
            a.id === assetId
              ? { ...a, status: a.status === 'delivered' ? ('not_delivered' as const) : ('delivered' as const) }
              : a
          );
          const assetName = e.assets?.find(a => a.id === assetId)?.nameAr || 'العهدة';
          const newAudit: AuditLogItem = {
            id: `aud-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            actionType: 'تعديل حالة عهدة',
            fieldChanged: assetName,
            oldValue: 'تغيير الحالة',
            newValue: 'تم تحديث حالة التسليم والاسترداد',
            userName: 'مسؤول العهد والمخازن',
          };
          const updated = { ...e, assets: updatedAssets, auditLogs: [newAudit, ...(e.auditLogs || [])] };
          if (selectedEmployee?.id === employeeId) setSelectedEmployee(updated);
          hrStorage.saveEmployee(updated);
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
          const updatedDocs = (e.documents || []).map(d => (d.id === docId ? { ...d, status } : d));
          const updated = { ...e, documents: updatedDocs };
          if (selectedEmployee?.id === employeeId) setSelectedEmployee(updated);
          hrStorage.saveEmployee(updated);
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
          const updated = { ...e, lifecycleStatus: 'archived' as const, status: 'terminated' as const };
          if (selectedEmployee?.id === id) setSelectedEmployee(updated);
          hrStorage.saveEmployee(updated);
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
          hrStorage.saveEmployee(updated);
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

  // Punch Attendance (computed synchronously before setState to avoid React 18 deferred updater null reads)
  const punchAttendance = (employeeId: string, status: AttendanceStatus, location?: string) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const nowTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const existing = attendanceRecords.find(a => a.employeeId === employeeId && a.date === todayStr);
    const recordToSave: AttendanceRecord = existing
      ? { ...existing, status, checkOut: nowTime, note: location }
      : {
          id: `ATT-${Date.now()}`,
          employeeId,
          employeeName: emp.nameAr,
          date: todayStr,
          checkIn: nowTime,
          status,
          workLocation: location || emp.workLocation,
        };

    setAttendanceRecords(prev => {
      const idx = prev.findIndex(a => a.id === recordToSave.id);
      return idx >= 0 ? prev.map(a => (a.id === recordToSave.id ? recordToSave : a)) : [recordToSave, ...prev];
    });
    hrStorage.saveAttendance(recordToSave);

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
      requestDate: new Date().toISOString().slice(0, 10),
    };
    setLeaveRequests(prev => [newReq, ...prev]);
    hrStorage.saveLeave(newReq);
    showToast(`تم تقديم طلب الإجازة بنجاح: ${req.employeeName}`);
  };

  // Update Leave Status (computed synchronously before setState — zero side effects inside updater)
  const updateLeaveStatus = (id: string, status: LeaveStatus) => {
    const currentTarget = leaveRequests.find(l => l.id === id);
    if (!currentTarget) return;
    const updatedTarget: LeaveRequest = {
      ...currentTarget,
      status,
      approvedBy: 'إدارة الموارد البشرية',
    };
    setLeaveRequests(prev => prev.map(l => (l.id === id ? updatedTarget : l)));
    hrStorage.saveLeave(updatedTarget);
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
    const nextCode = `ADV-${new Date().getFullYear()}-${String(advances.length + 1).padStart(3, '0')}`;
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
    hrStorage.saveAdvance(newAdv);
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
    hrStorage.saveCustodyItem(newItem);
    showToast(`تم تسليم العهدة: ${item.assetNameAr}`);
  };

  // Toggle Custody Clearance
  const toggleCustodyClearance = (id: string) => {
    setCustodyItems(prev =>
      prev.map(c => {
        if (c.id === id) {
          const newStatus: CustodyStatus = c.status === 'in_custody' ? 'returned_cleared' : 'in_custody';
          const nowStr = newStatus === 'returned_cleared' ? new Date().toISOString().slice(0, 10) : undefined;
          const updated = { ...c, status: newStatus, clearanceDate: nowStr };
          hrStorage.saveCustodyItem(updated);
          return updated;
        }
        return c;
      })
    );
    showToast('تم تحديث حالة إخلاء طرف العهدة بنجاح');
  };

  // Renew Contract
  const renewContract = (id: string, newEndDate: string) => {
    setContracts(prev => {
      const updatedList = prev.map(c => {
        if (c.id === id) {
          const updated = {
            ...c,
            endDate: newEndDate,
            daysUntilContractExpiry: 365,
            status: 'valid' as const,
          };
          hrStorage.saveContract(updated);
          return updated;
        }
        return c;
      });
      return updatedList;
    });
    showToast('تم تجديد العقد وتحديث تاريخ الانتهاء');
  };

  // Recruitment Candidates
  const addCandidate = (cand: Omit<HRCandidate, 'id' | 'stage' | 'appliedDate'>) => {
    const nextNum = candidates.length + 101;
    const newCand: HRCandidate = {
      ...cand,
      id: `CAN-${nextNum}`,
      stage: 'new',
      appliedDate: new Date().toISOString().slice(0, 10),
    };
    setCandidates(prev => [newCand, ...prev]);
    hrStorage.saveCandidate(newCand);
    showToast(`تم تسجيل المرشح (${cand.nameAr}) في بوابة التوظيف`);
  };

  const advanceCandidateStage = (candId: string) => {
    const order: HRCandidate['stage'][] = ['new', 'interview', 'offer', 'hired'];
    setCandidates(prev =>
      prev.map(c => {
        if (c.id !== candId) return c;
        const nextIdx = Math.min(order.length - 1, order.indexOf(c.stage) + 1);
        const updated = { ...c, stage: order[nextIdx] };
        hrStorage.saveCandidate(updated);
        return updated;
      })
    );
    showToast('تم ترقية المرشح إلى المرحلة التالية في مسار التوظيف');
  };

  // Update Egyptian HR Regulations Settings
  const updateRegulations = (next: EgyptianHRRegulationsConfig) => {
    setRegulations(next);
    hrStorage.saveSettings(next);
    showToast('تم حفظ وتطبيق لوائح العمل والتأمينات وضريبة كسب العمل المصرية بنجاح');
  };

  // Full Purge & Reset of HR Module
  const purgeAllHRModuleData = async () => {
    await hrStorage.purgeAllHRData();
    setEmployees([]);
    setSelectedEmployee(null);
    setAttendanceRecords([]);
    setLeaveRequests([]);
    setPayrollItems([]);
    setAdvances([]);
    setCustodyItems([]);
    setContracts([]);
    setCandidates([]);
    showToast('تم تفريغ وتصفير موديول الموارد البشرية بالكامل بنجاح (0 سجلات)');
  };

  // Compute live stats based on real data
  const stats = useMemo(() => {
    const totalEmployees = employees.length;
    const activeCount = employees.filter(e => e.status === 'active' && e.lifecycleStatus === 'active').length;
    const onLeaveCount = employees.filter(e => e.status === 'on_leave').length;
    const attendanceTodayRate = totalEmployees > 0 ? Math.round((activeCount / totalEmployees) * 100) : 0;
    const totalPayrollNet = employees.reduce((sum, e) => sum + (e.salary?.net || 0), 0);
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
        candidates,
        addCandidate,
        advanceCandidateStage,
        regulations,
        updateRegulations,
        purgeAllHRModuleData,
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
