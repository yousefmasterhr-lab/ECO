/**
 * ECO ERP - Human Resources (HRMS - Egypt Edition) Storage & Sync Service
 *
 * Provides:
 * - Automatic complete purge of legacy/mock v1 HR data across localStorage and backend D1.
 * - Zero mock data initial state (100% clean slate ready for Egyptian enterprise records).
 * - Non-blocking sync with Cloudflare D1 / local bridge via /api/hr.
 * - Custom event broadcasting (`eco-hr-updated`) for reactive UI updates across tabs.
 */

import type {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  EmployeeAdvance,
  EmployeeContractDoc,
  HRCandidate,
  AssetCustody,
} from '../context/HRContext';

const LEGACY_V1_KEYS = [
  'eco_hr_employees_v1',
  'eco_hr_contracts_v1',
  'eco_hr_attendance_v1',
  'eco_hr_leaves_v1',
  'eco_hr_loans_v1',
  'eco_hr_rewards_v1',
  'eco_hr_payroll_v1',
];

const STORAGE_KEYS = {
  EMPLOYEES: 'eco_hr_egypt_employees_v2',
  CONTRACTS: 'eco_hr_egypt_contracts_v2',
  ATTENDANCE: 'eco_hr_egypt_attendance_v2',
  LEAVES: 'eco_hr_egypt_leaves_v2',
  LOANS: 'eco_hr_egypt_loans_v2',
  CANDIDATES: 'eco_hr_egypt_candidates_v2',
  CUSTODY: 'eco_hr_egypt_custody_v2',
  SETTINGS: 'eco_hr_egypt_settings_v2',
  PURGE_FLAG: 'eco_hr_egypt_v2_purged',
};

export interface EgyptianHRRegulationsConfig {
  headquartersHours: number;
  siteHours: number;
  overtimeDayRate: number;
  overtimeNightRate: number;
  overtimeHolidayRate: number;
  socialMinInsuranceWage: number;
  socialMaxInsuranceWage: number;
  employerInsurancePercent: number;
  employeeInsurancePercent: number;
  emergencyFundPercent: number;
  martyrsFundPercent: number;
  personalTaxExemptionAnnual: number;
  zeroTaxBracketAnnual: number;
  annualLeaveStandardDays: number;
  annualLeaveSeniorDays: number;
  casualLeaveMaxDays: number;
  monthlyLeaveAccrualRate: number;
  allowAdvanceWithoutGuarantor: boolean;
  maxAdvancePercentOfSalary: number;
}

export const DEFAULT_EGYPTIAN_HR_SETTINGS: EgyptianHRRegulationsConfig = {
  headquartersHours: 8,
  siteHours: 10,
  overtimeDayRate: 1.35,
  overtimeNightRate: 1.7,
  overtimeHolidayRate: 2.0,
  socialMinInsuranceWage: 2300,
  socialMaxInsuranceWage: 14500,
  employerInsurancePercent: 18.75,
  employeeInsurancePercent: 11.0,
  emergencyFundPercent: 1.0,
  martyrsFundPercent: 0.05,
  personalTaxExemptionAnnual: 20000,
  zeroTaxBracketAnnual: 40000,
  annualLeaveStandardDays: 21,
  annualLeaveSeniorDays: 30,
  casualLeaveMaxDays: 6,
  monthlyLeaveAccrualRate: 1.75,
  allowAdvanceWithoutGuarantor: true,
  maxAdvancePercentOfSalary: 60,
};

class HRStorageService {
  private employees: Employee[] = [];
  private contracts: EmployeeContractDoc[] = [];
  private attendance: AttendanceRecord[] = [];
  private leaves: LeaveRequest[] = [];
  private advances: EmployeeAdvance[] = [];
  private candidates: HRCandidate[] = [];
  private custodyItems: AssetCustody[] = [];
  private settings: EgyptianHRRegulationsConfig = { ...DEFAULT_EGYPTIAN_HR_SETTINGS };
  private isSyncing = false;

  constructor() {
    this.ensureInitialCleanPurge();
    this.loadFromLocalStorage();
    if (typeof window !== 'undefined') {
      setTimeout(() => this.syncFromCloud(), 350);
    }
  }

  /**
   * Removes deprecated v1 browser-only localStorage keys.
   * Data-Safety Invariant (RULE-005): NEVER purge v2 records or invoke /api/hr/purge on startup.
   */
  private ensureInitialCleanPurge() {
    if (typeof window === 'undefined') return;
    try {
      LEGACY_V1_KEYS.forEach((key) => localStorage.removeItem(key));
    } catch (err) {
      console.warn('[HRStorage] Failed to clear legacy v1 localStorage keys:', err);
    }
  }

  private loadFromLocalStorage() {
    if (typeof window === 'undefined') return;
    try {
      const empRaw = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      this.employees = empRaw ? JSON.parse(empRaw) : [];

      const ctrRaw = localStorage.getItem(STORAGE_KEYS.CONTRACTS);
      this.contracts = ctrRaw ? JSON.parse(ctrRaw) : [];

      const attRaw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      this.attendance = attRaw ? JSON.parse(attRaw) : [];

      const lvRaw = localStorage.getItem(STORAGE_KEYS.LEAVES);
      this.leaves = lvRaw ? JSON.parse(lvRaw) : [];

      const lnRaw = localStorage.getItem(STORAGE_KEYS.LOANS);
      this.advances = lnRaw ? JSON.parse(lnRaw) : [];

      const candRaw = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
      this.candidates = candRaw ? JSON.parse(candRaw) : [];

      const cstRaw = localStorage.getItem(STORAGE_KEYS.CUSTODY);
      this.custodyItems = cstRaw ? JSON.parse(cstRaw) : [];

      const cfgRaw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (cfgRaw) {
        this.settings = { ...DEFAULT_EGYPTIAN_HR_SETTINGS, ...JSON.parse(cfgRaw) };
      }
    } catch (e) {
      console.warn('[HRStorage] Failed to load local cache:', e);
    }
  }

  private persistLocal() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(this.employees));
      localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(this.contracts));
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(this.attendance));
      localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(this.leaves));
      localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(this.advances));
      localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(this.candidates));
      localStorage.setItem(STORAGE_KEYS.CUSTODY, JSON.stringify(this.custodyItems));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    } catch {}
  }

  private notify() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('eco-hr-updated'));
    }
  }

  /**
   * Hard-blocked per RULE-005 / Core Law #9: client-triggered full HR data wipe is permanently disabled.
   */
  public async purgeAllHRData(): Promise<void> {
    throw new Error('تم تعطيل المسح الجماعي لبيانات الموارد البشرية لحماية بيانات الإنتاج (RULE-005).');
  }

  /**
   * Synchronize all HR data from Cloudflare D1 / local bridge
   */
  public async syncFromCloud(): Promise<void> {
    if (this.isSyncing || typeof window === 'undefined') return;
    this.isSyncing = true;

    try {
      const [empRes, ctrRes, attRes, lvRes, lnRes] = await Promise.all([
        fetch('/api/hr/employees', { cache: 'no-store' }).catch(() => null),
        fetch('/api/hr/contracts', { cache: 'no-store' }).catch(() => null),
        fetch('/api/hr/attendance', { cache: 'no-store' }).catch(() => null),
        fetch('/api/hr/leaves', { cache: 'no-store' }).catch(() => null),
        fetch('/api/hr/loans', { cache: 'no-store' }).catch(() => null),
      ]);

      if (empRes && empRes.ok) {
        const rows = await empRes.json();
        if (Array.isArray(rows)) {
          this.employees = rows.map((r) => this.mapRowToEmployee(r));
        }
      }

      if (ctrRes && ctrRes.ok) {
        const rows = await ctrRes.json();
        if (Array.isArray(rows)) {
          this.contracts = rows.map((r) => this.mapRowToContract(r));
        }
      }

      if (attRes && attRes.ok) {
        const rows = await attRes.json();
        if (Array.isArray(rows)) {
          this.attendance = rows.map((r) => this.mapRowToAttendance(r));
        }
      }

      if (lvRes && lvRes.ok) {
        const rows = await lvRes.json();
        if (Array.isArray(rows)) {
          this.leaves = rows.map((r) => this.mapRowToLeave(r));
        }
      }

      if (lnRes && lnRes.ok) {
        const rows = await lnRes.json();
        if (Array.isArray(rows)) {
          this.advances = rows.map((r) => this.mapRowToLoan(r));
        }
      }

      this.persistLocal();
      this.notify();
    } catch (err) {
      console.warn('[HRStorage] Background sync error:', err);
    } finally {
      this.isSyncing = false;
    }
  }

  // --- Employees ---
  public getEmployees(): Employee[] {
    return [...this.employees];
  }

  public getEmployeeById(id: string): Employee | undefined {
    return this.employees.find((e) => e.id === id || e.uid === id);
  }

  public async saveEmployee(emp: Employee): Promise<Employee> {
    const idx = this.employees.findIndex((e) => e.id === emp.id);
    if (idx >= 0) {
      this.employees[idx] = emp;
    } else {
      this.employees.unshift(emp);
    }

    this.persistLocal();
    this.notify();

    fetch('/api/hr/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emp),
    }).catch((err) => console.warn('[HRStorage] Failed to push employee to backend:', err));

    return emp;
  }

  public async deleteEmployee(id: string): Promise<boolean> {
    this.employees = this.employees.filter((e) => e.id !== id);
    this.persistLocal();
    this.notify();

    fetch(`/api/hr/employees/${id}`, { method: 'DELETE' }).catch(() => {});
    return true;
  }

  // --- Contracts ---
  public getContracts(): EmployeeContractDoc[] {
    return [...this.contracts];
  }

  public async saveContract(contract: EmployeeContractDoc): Promise<EmployeeContractDoc> {
    const idx = this.contracts.findIndex((c) => c.id === contract.id);
    if (idx >= 0) {
      this.contracts[idx] = contract;
    } else {
      this.contracts.unshift(contract);
    }
    this.persistLocal();
    this.notify();

    fetch('/api/hr/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contract),
    }).catch(() => {});

    return contract;
  }

  // --- Attendance ---
  public getAttendance(): AttendanceRecord[] {
    return [...this.attendance];
  }

  public async saveAttendance(record: AttendanceRecord): Promise<void> {
    const idx = this.attendance.findIndex((a) => a.id === record.id);
    if (idx >= 0) {
      this.attendance[idx] = record;
    } else {
      this.attendance.unshift(record);
    }
    this.persistLocal();
    this.notify();

    try {
      const res = await fetch('/api/hr/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        console.error(`[HRStorage] Failed to persist attendance (${res.status}):`, errBody);
      }
    } catch (err) {
      console.error('[HRStorage] Network error persisting attendance:', err);
    }
  }

  // --- Leaves ---
  public getLeaves(): LeaveRequest[] {
    return [...this.leaves];
  }

  public async saveLeave(request: LeaveRequest): Promise<void> {
    const idx = this.leaves.findIndex((l) => l.id === request.id);
    if (idx >= 0) {
      this.leaves[idx] = request;
    } else {
      this.leaves.unshift(request);
    }
    this.persistLocal();
    this.notify();

    try {
      const res = await fetch('/api/hr/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        console.error(`[HRStorage] Failed to persist leave (${res.status}):`, errBody);
      }
    } catch (err) {
      console.error('[HRStorage] Network error persisting leave:', err);
    }
  }

  // --- Loans & Advances ---
  public getAdvances(): EmployeeAdvance[] {
    return [...this.advances];
  }

  public async saveAdvance(adv: EmployeeAdvance): Promise<void> {
    const idx = this.advances.findIndex((a) => a.id === adv.id);
    if (idx >= 0) {
      this.advances[idx] = adv;
    } else {
      this.advances.unshift(adv);
    }
    this.persistLocal();
    this.notify();

    fetch('/api/hr/loans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adv),
    }).catch(() => {});
  }

  // --- Candidates ---
  public getCandidates(): HRCandidate[] {
    return [...this.candidates];
  }

  public saveCandidate(cand: HRCandidate): void {
    const idx = this.candidates.findIndex((c) => c.id === cand.id);
    if (idx >= 0) {
      this.candidates[idx] = cand;
    } else {
      this.candidates.unshift(cand);
    }
    this.persistLocal();
    this.notify();
  }

  // --- Custody Items ---
  public getCustodyItems(): AssetCustody[] {
    return [...this.custodyItems];
  }

  public saveCustodyItem(item: AssetCustody): void {
    const idx = this.custodyItems.findIndex((c) => c.id === item.id);
    if (idx >= 0) {
      this.custodyItems[idx] = item;
    } else {
      this.custodyItems.unshift(item);
    }
    this.persistLocal();
    this.notify();
  }

  // --- Egyptian HR Regulations Settings ---
  public getSettings(): EgyptianHRRegulationsConfig {
    return { ...this.settings };
  }

  public saveSettings(next: EgyptianHRRegulationsConfig): void {
    this.settings = { ...next };
    this.persistLocal();
    this.notify();
  }

  // --- Row Mappers (supporting both D1 snake_case and local camelCase bridge) ---
  private mapRowToEmployee(row: any): Employee {
    if (row && typeof row.nameAr === 'string' && row.salary) {
      return row as Employee;
    }

    let docs = [];
    let assets = [];
    let allowances = [];
    let schedule: any = {};
    let audit = [];

    try { docs = JSON.parse(row.documents_json || '[]'); } catch {}
    try { assets = JSON.parse(row.custody_json || '[]'); } catch {}
    try { allowances = JSON.parse(row.allowances_json || '[]'); } catch {}
    try { schedule = JSON.parse(row.work_schedule_json || '{}'); } catch {}
    try { audit = JSON.parse(row.audit_logs_json || '[]'); } catch {}

    return {
      id: row.id,
      uid: row.code?.replace('EMP-', '').replace('TRB-', '') || String(row.id).slice(-4),
      employeeCode: row.code || row.id,
      nameAr: row.name_ar || '',
      nameEn: row.name_en || '',
      jobTitleAr: row.job_title || '',
      jobTitleEn: '',
      departmentAr: row.department_id || 'الإدارة العامة',
      departmentEn: '',
      companyId: row.company_id || '',
      companyNameAr: row.company_name_ar || '',
      branchAr: row.branch_id || 'المقر الرئيسي',
      mobile: row.phone || '',
      workPhone: row.work_phone || '',
      email: row.email || '',
      nationalId: row.national_id || '',
      hireDate: row.hire_date || '',
      contractStatus: 'valid',
      status: row.status || 'active',
      lifecycleStatus: row.status === 'resigned' ? 'resigned' : row.status === 'archived' ? 'archived' : 'active',
      directManager: row.direct_manager_id || '—',
      workLocation: row.address || '',
      disbursementMethod: row.payment_method || 'bank_transfer',
      bankName: row.bank_name || '',
      bankAccount: row.iban || '',
      hasOvertime: true,
      gender: 'male',
      religion: row.religion || 'مسلم',
      address: row.address || '',
      salary: {
        basic: Number(row.basic_salary || 0),
        allowances: Number(row.allowances_total || 0),
        deductions: Number(row.deductions_total || 0),
        net: Number(row.net_salary || 0),
      },
      emergencyContact: {
        name: row.emergency_contact_name || '',
        relation: row.emergency_contact_relation || '',
        phone: row.emergency_contact_phone || '',
      },
      leaveBalance: {
        annualTotal: 21,
        annualUsed: 0,
        sickTotal: 15,
        sickUsed: 0,
        monthlyAccrual: 1.75,
      },
      avatarColor: '#D99B26',
      roleLevel: row.job_title || '',
      bloodType: row.blood_type || 'O+',
      socialInsuranceNo: row.insurance_no || '',
      workSchedule: {
        startDate: row.hire_date || '',
        endDate: '',
        contractDurationYears: 1,
        hireDate: row.hire_date || '',
        noticePeriodMonths: 2,
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
        socialInsuranceType: 'تأمين نمطي (قانون 148)',
        hasMedicalInsurance: true,
        medicalInsuranceMonthlyDeduction: 0,
        ...schedule,
      },
      documents: docs,
      assets,
      allowancesList: allowances,
      bonuses: [],
      deductions: [],
      workedHours: {
        actualHours: 0,
        requiredHours: 160,
        completedDays: 0,
        incompleteDays: 0,
        dailyLogs: [],
      },
      auditLogs: audit,
    };
  }

  private mapRowToContract(row: any): EmployeeContractDoc {
    if (row && typeof row.employeeName === 'string' && row.startDate) {
      return row as EmployeeContractDoc;
    }
    return {
      id: row.id,
      employeeId: row.employee_id,
      employeeName: '',
      jobTitle: '',
      companyId: row.company_id,
      contractType: row.contract_type || 'limited',
      startDate: row.start_date || '',
      endDate: row.end_date || '',
      daysUntilContractExpiry: 180,
      nationalIdExpiry: '',
      daysUntilIdExpiry: 365,
      workLicenseExpiry: '',
      daysUntilLicenseExpiry: 365,
      medicalGrade: 'كشف طبي س111',
      status: row.status || 'valid',
      documentRef: row.file_name || row.id,
    };
  }

  private mapRowToAttendance(row: any): AttendanceRecord {
    if (row && typeof row.employeeName === 'string' && row.checkIn !== undefined) {
      return row as AttendanceRecord;
    }
    return {
      id: row.id,
      employeeId: row.employee_id,
      employeeName: '',
      date: row.date,
      checkIn: row.check_in || '',
      checkOut: row.check_out || '',
      status: row.status || 'present',
      workLocation: '',
      note: row.notes || '',
    };
  }

  private mapRowToLeave(row: any): LeaveRequest {
    if (row && typeof row.employeeName === 'string' && row.startDate) {
      return row as LeaveRequest;
    }
    return {
      id: row.id,
      employeeId: row.employee_id,
      employeeName: '',
      jobTitleAr: '',
      type: row.leave_type || 'annual',
      startDate: row.start_date,
      endDate: row.end_date,
      daysCount: Number(row.days_count || 1),
      reason: row.reason || '',
      status: row.status || 'pending',
      requestDate: row.created_at?.slice(0, 10) || '',
      approvedBy: row.approved_by || '',
    };
  }

  private mapRowToLoan(row: any): EmployeeAdvance {
    if (row && typeof row.advanceCode === 'string') {
      return row as EmployeeAdvance;
    }
    return {
      id: row.id,
      advanceCode: row.id,
      employeeId: row.employee_id,
      employeeName: '',
      jobTitle: '',
      companyId: row.company_id || '',
      totalAmount: Number(row.total_amount || 0),
      monthlyDeduction: Number(row.monthly_installment || 0),
      paidAmount: Number(row.paid_amount || 0),
      remainingAmount: Number(row.remaining_amount || 0),
      installmentsTotal: Number(row.installments_count || 1),
      installmentsRemaining: Math.ceil(
        Number(row.remaining_amount || 0) / Math.max(1, Number(row.monthly_installment || 1))
      ),
      startDate: row.start_month || '',
      reason: row.reason || '',
      status: row.status === 'مسددة' ? 'cleared' : 'active',
      linkedVoucherCode: `VOU-${row.id}`,
    };
  }
}

export const hrStorage = new HRStorageService();
