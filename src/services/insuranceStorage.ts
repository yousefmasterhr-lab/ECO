/**
 * ECO ERP - Social Insurance (التأمينات الاجتماعية) Cloudflare D1 Storage & Synchronization Engine
 *
 * Ports 100% of the business logic, lifecycle engine, duplicate detection, statutory wage
 * calculations, and occupation dictionaries from `./Insurance` into ECO's reactive D1 architecture:
 * - Zero Mock Data (starts at 0 records).
 * - Instant optimistic UI updates with resilient local caching.
 * - Live background synchronization with Cloudflare D1 (/api/insurance).
 * - Real-time event broadcast ('eco-insurance-updated' & 'eco-data-updated').
 */

export interface InsuranceAuditDiff {
  timestamp: string;
  userName: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
}

export interface EmployeeAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string;
  uploadDate: string;
}

export type OperationStatusType = 'انتظار' | 'قيد المراجعة' | 'مكتمل' | 'مرفوض' | 'مكرر';

export interface InsuranceOperationRecord {
  id: string;
  seq_num: number;
  request_code: string;
  incoming_number: string;
  incoming_date: string;
  request_type: string;
  status: OperationStatusType;
  company_id: string;
  company_name: string;
  employee_id?: string;
  employee_code?: string;
  employee_name: string;
  national_id: string;
  insurance_number: string;
  notes?: string;
  attachment_data?: string | null;
  attachment_name?: string | null;
  audit_log_json?: string | InsuranceAuditDiff[];
  created_at?: string;
  updated_at?: string;
}

export interface InsuredEmployeeRecord {
  id: string;
  code: string;
  name: string;
  national_id: string;
  insurance_number: string;
  company_id: string;
  company_name: string;
  office_name?: string;
  mother_name?: string;
  qualification?: string;
  occupation?: string;
  occupation_code?: string;
  hire_date?: string;
  sub_start_date?: string;
  ins_date?: string;
  resignation_date?: string;
  resignation_reason?: string;
  duration_type?: string;
  sub_wage: number;
  comp_wage: number;
  status?: string;
  s1_incoming_number?: string;
  has_disability?: string;
  disability_date?: string;
  disability_percent?: string;
  gov?: string;
  center?: string;
  village?: string;
  street?: string;
  building_no?: string;
  phone?: string;
  attachments_json?: string | EmployeeAttachment[];
  audit_log_json?: string | InsuranceAuditDiff[];
  created_at?: string;
  updated_at?: string;
}

export interface OfficialFormRecord {
  id: string;
  form_type: 'س1' | 'س2' | 'س6';
  form_code: string;
  company_id: string;
  company_name: string;
  employee_id?: string;
  employee_name: string;
  national_id: string;
  insurance_number: string;
  form_date: string;
  status: 'مسودة' | 'معتمد' | 'مسجل بمركز العمليات';
  payload_json: string | Record<string, any>;
  attachment_data?: string | null;
  attachment_name?: string | null;
  audit_log_json?: string | InsuranceAuditDiff[];
  created_at?: string;
  updated_at?: string;
}

export interface InsuranceRemittanceRecord {
  id: string;
  batch_code: string;
  month_year: string;
  company_id: string;
  company_name: string;
  employees_count: number;
  total_sub_wage: number;
  total_comp_wage: number;
  employee_share_total: number;
  employer_share_total: number;
  total_due: number;
  receipt_number?: string;
  payment_date?: string;
  status: 'مجدول للدفع' | 'تم السداد والتوريد' | 'قيد المراجعة المالية' | 'متأخر';
  notes?: string;
  attachment_data?: string | null;
  attachment_name?: string | null;
  audit_log_json?: string | InsuranceAuditDiff[];
  created_at?: string;
  updated_at?: string;
}

export interface InsuranceComplianceRecord {
  id: string;
  check_code: string;
  title: string;
  category: string;
  company_id: string;
  company_name: string;
  inspector_name?: string;
  due_date: string;
  status: 'مكتمل ومطابق' | 'قيد الفحص' | 'ملاحظات تحتاج استيفاء' | 'عاجل';
  score: number;
  findings?: string;
  attachment_data?: string | null;
  attachment_name?: string | null;
  audit_log_json?: string | InsuranceAuditDiff[];
  created_at?: string;
  updated_at?: string;
}

export interface InsuranceWageConfig {
  minSubWage: number;
  maxSubWage: number;
  employeeShareRate: number; // default 11% (0.11)
  employerShareRate: number; // default 18.75% (0.1875)
}

export interface EmployeeComputedInsuranceStatus {
  label: string;
  type: 'active' | 'exited' | 'review' | 'pending' | 'rejected' | 'uninsured';
  colorClass: string;
  badgeBgClass: string;
  s1Op: InsuranceOperationRecord | null;
  s6Op: InsuranceOperationRecord | null;
  s1IncomingNumber: string;
  s6IncomingNumber: string;
  s6ExitDate: string;
  s6Reason: string;
  effectiveInsDate: string;
  linkedOperations: InsuranceOperationRecord[];
}

export const DEFAULT_INSURANCE_REQUEST_TYPES = [
  { id: 'req_s1', value: 'س1', labelAr: 'س1 (التحاق عامل بمنشأة)' },
  { id: 'req_s2', value: 'س2', labelAr: 'س2 (تعديل الأجور والاشتراكات)' },
  { id: 'req_s6', value: 'س6', labelAr: 'س6 (إنهاء اشتراك / استقالة)' },
  { id: 'req_title', value: 'تعديل مسمى وظيفي', labelAr: 'تعديل مسمى وظيفي' },
  { id: 'req_mgr', value: 'تعديل مدير مسؤول', labelAr: 'تعديل مدير مسؤول' },
  { id: 'req_wage', value: 'تعديل أجر', labelAr: 'تعديل أجر' },
  { id: 'req_cov', value: 'استمارة تغطية', labelAr: 'استمارة تغطية' },
  { id: 'req_print', value: 'برنت تأميني', labelAr: 'برنت تأميني' },
  { id: 'req_file', value: 'فتح ملف منشأة', labelAr: 'فتح ملف منشأة' },
];

export const COMMON_INSURANCE_OCCUPATIONS: Array<{ code: string; name: string }> = [
  { code: '111201', name: 'رئيس مجلس إدارة' },
  { code: '112001', name: 'مدير عام / مدير تنفيذي' },
  { code: '121101', name: 'مدير مالي' },
  { code: '121201', name: 'مدير موارد بشرية' },
  { code: '122101', name: 'مدير مبيعات وتسويق' },
  { code: '132301', name: 'مدير مشروعات هندسية' },
  { code: '214201', name: 'مهندس مدني' },
  { code: '214202', name: 'مهندس مكتب فني' },
  { code: '214203', name: 'مهندس تنفيذ موقع' },
  { code: '214101', name: 'مهندس معماري' },
  { code: '215101', name: 'مهندس كهرباء' },
  { code: '214401', name: 'مهندس ميكانيكا' },
  { code: '241101', name: 'محاسب عام' },
  { code: '241102', name: 'مراجع حسابات' },
  { code: '242301', name: 'أخصائي موارد بشرية' },
  { code: '242302', name: 'أخصائي تأمينات اجتماعية وعلاقات حكومية' },
  { code: '261101', name: 'مستشار قانوني / محامي' },
  { code: '251201', name: 'مهندس برمجيات / نظم معلومات' },
  { code: '311201', name: 'مشرف تنفيذ معماري / مدني' },
  { code: '312301', name: 'مراقب موقع إنشاءات' },
  { code: '325701', name: 'أخصائي سلامة وصحة مهنية (HSE)' },
  { code: '332201', name: 'مندوب مبيعات / تسويق' },
  { code: '332301', name: 'مسؤول مشتريات وتعاقدات' },
  { code: '411001', name: 'موظف إداري / سكرتارية تنفيذية' },
  { code: '412001', name: 'مدخل بيانات' },
  { code: '422401', name: 'موظف استقبال واستعلامات' },
  { code: '431101', name: 'أمين خزينة / كاشير' },
  { code: '432101', name: 'أمين مخزن / مراقب عهدة' },
  { code: '541401', name: 'فرد أمن وحراسة' },
  { code: '711101', name: 'فني بناء وتشطيبات' },
  { code: '741101', name: 'فني كهرباء وصيانة' },
  { code: '832201', name: 'سائق درجة أولى / ثانية / ثالثة' },
  { code: '911201', name: 'عامل خدمات ومعاونة / بوفيه' },
  { code: '931301', name: 'عامل عادي بالمواقع' },
];

const STORAGE_KEYS = {
  OPERATIONS: 'eco_ins_operations_v1',
  EMPLOYEES: 'eco_ins_employees_v1',
  FORMS: 'eco_ins_forms_v1',
  REMITTANCES: 'eco_ins_remittances_v1',
  COMPLIANCE: 'eco_ins_compliance_v1',
  WAGE_CONFIG: 'eco_ins_wage_config_v1',
  S1_COORDS: 'eco_ins_s1_coords_v1',
  S6_COORDS: 'eco_ins_s6_coords_v1',
};

const DEFAULT_WAGE_CONFIG: InsuranceWageConfig = {
  minSubWage: 2300,
  maxSubWage: 14500,
  employeeShareRate: 11,
  employerShareRate: 18.75,
};

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`[insuranceStorage] LocalStorage write notice (${key}):`, e);
  }
}

function broadcastUpdate(resource: string, action: string): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('eco-insurance-updated', { detail: { resource, action, timestamp: Date.now() } })
    );
    window.dispatchEvent(new CustomEvent('eco-data-updated'));
  }
}

export function parseInsuranceAuditLog(raw: string | InsuranceAuditDiff[] | undefined): InsuranceAuditDiff[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseEmployeeAttachments(raw: string | EmployeeAttachment[] | undefined): EmployeeAttachment[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Converts a base64 Data URL into a clean Blob URL for instant browser preview/download
 * without hitting data-URI navigation restrictions.
 */
export function createBlobUrlFromDataUrl(dataUrl: string): string {
  if (!dataUrl) return '';
  if (dataUrl.startsWith('blob:') || dataUrl.startsWith('http')) return dataUrl;
  try {
    const parts = dataUrl.split(',');
    if (parts.length < 2) return dataUrl;
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });
    return URL.createObjectURL(blob);
  } catch {
    return dataUrl;
  }
}

/**
 * Normalizes digits from Hindi/Arabic numerals to standard Western numerals
 */
export function normalizeDigits(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '';
  const map: Record<string, string> = {
    '٠': '0',
    '١': '1',
    '٢': '2',
    '٣': '3',
    '٤': '4',
    '٥': '5',
    '٦': '6',
    '٧': '7',
    '٨': '8',
    '٩': '9',
  };
  return String(val)
    .replace(/[٠-٩]/g, (d) => map[d] || d)
    .replace(/\s+/g, '')
    .trim();
}

/**
 * Ported directly from `Insurance/script.js` (`getEmployeeInsuranceStatus`):
 * Evaluates an employee's real-time insurance status based on their linked S1 and S6
 * operations in the Operations Center (`ins_operations`) and fallback employee fields.
 */
export function getEmployeeInsuranceStatus(
  emp: InsuredEmployeeRecord,
  allOperations: InsuranceOperationRecord[]
): EmployeeComputedInsuranceStatus {
  const empNat = normalizeDigits(emp.national_id);
  const empIns = normalizeDigits(emp.insurance_number);
  const empName = (emp.name || '').trim();

  const linkedOperations = allOperations.filter((op) => {
    if (op.employee_id && emp.id && op.employee_id === emp.id) return true;
    const opNum = normalizeDigits(op.national_id || op.insurance_number);
    if (opNum && ((empNat && opNum === empNat) || (empIns && opNum === empIns))) return true;
    const opIns = normalizeDigits(op.insurance_number);
    if (opIns && empIns && opIns === empIns) return true;
    const opNat = normalizeDigits(op.national_id);
    if (opNat && empNat && opNat === empNat) return true;
    if (empName && op.employee_name && op.employee_name.trim() === empName) return true;
    return false;
  });

  // Sort chronological ascending so latest operation wins
  const sortedOps = [...linkedOperations].sort((a, b) => {
    const da = a.incoming_date || a.created_at || '';
    const db = b.incoming_date || b.created_at || '';
    return da.localeCompare(db);
  });

  const s1Ops = sortedOps.filter((op) => op.request_type && op.request_type.includes('س1'));
  const s6Ops = sortedOps.filter((op) => op.request_type && op.request_type.includes('س6'));

  const latestS1 = s1Ops.length > 0 ? s1Ops[s1Ops.length - 1] : null;
  const latestS6 = s6Ops.length > 0 ? s6Ops[s6Ops.length - 1] : null;

  const s1IncomingNumber = latestS1?.incoming_number || emp.s1_incoming_number || '';
  const s6IncomingNumber = latestS6?.incoming_number || '';
  const s6ExitDate = emp.resignation_date || latestS6?.incoming_date || '';
  const s6Reason = emp.resignation_reason || latestS6?.notes || (s6ExitDate ? 'استقالة / انتهاء خدمة' : '');
  const effectiveInsDate = emp.ins_date || latestS1?.incoming_date || emp.sub_start_date || '';

  // 1. Check if exited (resignation_date or completed S6 after S1)
  const completedS6 = s6Ops.filter((op) => op.status === 'مكتمل').pop();
  if (emp.resignation_date || completedS6 || emp.status === 'منتهي س6' || emp.status === 'منتهي (س6)') {
    return {
      label: 'منتهي (س6)',
      type: 'exited',
      colorClass: 'text-slate-600 dark:text-slate-300',
      badgeBgClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/25',
      s1Op: latestS1,
      s6Op: latestS6,
      s1IncomingNumber,
      s6IncomingNumber,
      s6ExitDate,
      s6Reason,
      effectiveInsDate,
      linkedOperations,
    };
  }

  // 2. Check S1 operation statuses
  if (latestS1) {
    if (latestS1.status === 'مكتمل') {
      return {
        label: 'مؤمن عليه (س1)',
        type: 'active',
        colorClass: 'text-emerald-700 dark:text-emerald-300',
        badgeBgClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
        s1Op: latestS1,
        s6Op: latestS6,
        s1IncomingNumber,
        s6IncomingNumber,
        s6ExitDate,
        s6Reason,
        effectiveInsDate,
        linkedOperations,
      };
    }
    if (latestS1.status === 'قيد المراجعة') {
      return {
        label: 'قيد المراجعة',
        type: 'review',
        colorClass: 'text-amber-700 dark:text-amber-300',
        badgeBgClass: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
        s1Op: latestS1,
        s6Op: latestS6,
        s1IncomingNumber,
        s6IncomingNumber,
        s6ExitDate,
        s6Reason,
        effectiveInsDate,
        linkedOperations,
      };
    }
    if (latestS1.status === 'انتظار') {
      return {
        label: 'انتظار الاعتماد',
        type: 'pending',
        colorClass: 'text-amber-600 dark:text-amber-400',
        badgeBgClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25',
        s1Op: latestS1,
        s6Op: latestS6,
        s1IncomingNumber,
        s6IncomingNumber,
        s6ExitDate,
        s6Reason,
        effectiveInsDate,
        linkedOperations,
      };
    }
    if (latestS1.status === 'مرفوض') {
      return {
        label: 'مرفوض تأمينياً',
        type: 'rejected',
        colorClass: 'text-rose-700 dark:text-rose-300',
        badgeBgClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25',
        s1Op: latestS1,
        s6Op: latestS6,
        s1IncomingNumber,
        s6IncomingNumber,
        s6ExitDate,
        s6Reason,
        effectiveInsDate,
        linkedOperations,
      };
    }
  }

  // 3. Fallback to manual status on employee record
  if (emp.status === 'مؤمن عليه س1' || emp.status === 'مؤمن عليه (س1)' || emp.ins_date || emp.s1_incoming_number) {
    return {
      label: 'مؤمن عليه (س1)',
      type: 'active',
      colorClass: 'text-emerald-700 dark:text-emerald-300',
      badgeBgClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
      s1Op: latestS1,
      s6Op: latestS6,
      s1IncomingNumber,
      s6IncomingNumber,
      s6ExitDate,
      s6Reason,
      effectiveInsDate,
      linkedOperations,
    };
  }

  if (emp.status === 'قيد المراجعة' || emp.status === 'قيد التسجيل') {
    return {
      label: 'قيد المراجعة',
      type: 'review',
      colorClass: 'text-amber-700 dark:text-amber-300',
      badgeBgClass: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
      s1Op: latestS1,
      s6Op: latestS6,
      s1IncomingNumber,
      s6IncomingNumber,
      s6ExitDate,
      s6Reason,
      effectiveInsDate,
      linkedOperations,
    };
  }

  return {
    label: emp.status || 'غير مؤمن عليه',
    type: 'uninsured',
    colorClass: 'text-slate-500 dark:text-slate-400',
    badgeBgClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    s1Op: latestS1,
    s6Op: latestS6,
    s1IncomingNumber,
    s6IncomingNumber,
    s6ExitDate,
    s6Reason,
    effectiveInsDate,
    linkedOperations,
  };
}

/**
 * Calculates Egyptian Social Insurance Contributions (Law 148 of 2019):
 * - Clamps subscription wage (`subWage`) within statutory Min & Max caps when calculating legal contribution base.
 * - Employee Share = 11% of effective insurance wage
 * - Employer Share = 18.75% of effective insurance wage
 * - Total Monthly Remittance = 29.75% of effective insurance wage
 */
export function calculateEmployeeContributions(
  rawSubWage: number,
  rawCompWage: number,
  config: InsuranceWageConfig = DEFAULT_WAGE_CONFIG
) {
  const subWage = Number(rawSubWage) || 0;
  const compWage = Number(rawCompWage) || subWage;
  const isBelowMin = subWage > 0 && subWage < config.minSubWage;
  const isAboveMax = subWage > config.maxSubWage;

  const effectiveSubWage =
    subWage <= 0
      ? 0
      : Math.min(Math.max(subWage, config.minSubWage), config.maxSubWage);

  const employeeShare = Number(((effectiveSubWage * config.employeeShareRate) / 100).toFixed(2));
  const employerShare = Number(((effectiveSubWage * config.employerShareRate) / 100).toFixed(2));
  const totalContribution = Number((employeeShare + employerShare).toFixed(2));
  const netAfterInsurance = Number(Math.max(0, compWage - employeeShare).toFixed(2));

  return {
    rawSubWage: subWage,
    effectiveSubWage,
    compWage,
    isBelowMin,
    isAboveMax,
    employeeShare,
    employerShare,
    totalContribution,
    netAfterInsurance,
  };
}

export const insuranceStorage = {
  // ── WAGE CONFIGURATION ───────────────────────────────────────────
  getWageConfig(): InsuranceWageConfig {
    return readLocal<InsuranceWageConfig>(STORAGE_KEYS.WAGE_CONFIG, DEFAULT_WAGE_CONFIG);
  },

  saveWageConfig(config: InsuranceWageConfig): void {
    writeLocal(STORAGE_KEYS.WAGE_CONFIG, config);
    broadcastUpdate('wage_config', 'UPDATE');
  },

  // ── FORM COORDINATES PERSISTENCE ─────────────────────────────────
  getCustomFormCoords(formKey: 's1' | 's6'): Record<string, { top: number; right: number; width: number; height: number }> {
    const key = formKey === 's1' ? STORAGE_KEYS.S1_COORDS : STORAGE_KEYS.S6_COORDS;
    return readLocal(key, {});
  },

  saveCustomFormCoords(
    formKey: 's1' | 's6',
    coords: Record<string, { top: number; right: number; width: number; height: number }>
  ): void {
    const key = formKey === 's1' ? STORAGE_KEYS.S1_COORDS : STORAGE_KEYS.S6_COORDS;
    writeLocal(key, coords);
  },

  resetCustomFormCoords(formKey: 's1' | 's6'): void {
    const key = formKey === 's1' ? STORAGE_KEYS.S1_COORDS : STORAGE_KEYS.S6_COORDS;
    try {
      localStorage.removeItem(key);
    } catch {}
  },

  // ── 1. OPERATIONS CENTER (`ins_operations`) ──────────────────────
  async getOperations(companyId?: string): Promise<InsuranceOperationRecord[]> {
    try {
      const qs = companyId && companyId !== 'all' ? `?companyId=${encodeURIComponent(companyId)}` : '';
      const res = await fetch(`/api/insurance/operations${qs}`);
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows)) {
          if (!companyId || companyId === 'all') {
            writeLocal(STORAGE_KEYS.OPERATIONS, rows);
          }
          return rows;
        }
      }
    } catch (e) {
      console.warn('[insuranceStorage] D1 fetch operations fallback to local cache:', e);
    }
    const cached = readLocal<InsuranceOperationRecord[]>(STORAGE_KEYS.OPERATIONS, []);
    if (companyId && companyId !== 'all') {
      return cached.filter((op) => op.company_id === companyId);
    }
    return cached;
  },

  /**
   * Automatic duplicate detection ported from `Insurance/operations.js`:
   * Marks status as `'مكرر'` if another operation has the same `incoming_number`
   * OR the same (`employee` + `request_type` + `incoming_date`).
   */
  detectDuplicateOperation(
    candidate: Partial<InsuranceOperationRecord>,
    existingOps: InsuranceOperationRecord[],
    ignoreId?: string
  ): { isDuplicate: boolean; reason?: string } {
    const incNum = (candidate.incoming_number || '').trim();
    const empNat = normalizeDigits(candidate.national_id || candidate.insurance_number);
    const empName = (candidate.employee_name || '').trim();
    const reqType = (candidate.request_type || '').trim();

    for (const op of existingOps) {
      if (ignoreId && op.id === ignoreId) continue;

      if (incNum && op.incoming_number && op.incoming_number.trim() === incNum) {
        return { isDuplicate: true, reason: `رقم الوارد (${incNum}) مسجل مسبقاً بالطلب ${op.request_code}` };
      }

      const opNat = normalizeDigits(op.national_id || op.insurance_number);
      const samePerson =
        (empNat && opNat && empNat === opNat) ||
        (empName && op.employee_name && empName === op.employee_name.trim());

      if (samePerson && reqType && op.request_type === reqType && candidate.incoming_date === op.incoming_date) {
        return {
          isDuplicate: true,
          reason: `نفس نوع الطلب (${reqType}) مسجل لنفس الموظف بنفس التاريخ (${op.request_code})`,
        };
      }
    }
    return { isDuplicate: false };
  },

  async saveOperation(
    opInput: Partial<InsuranceOperationRecord>,
    actorName = 'مدير النظام'
  ): Promise<{ record: InsuranceOperationRecord; duplicateCheck: { isDuplicate: boolean; reason?: string } }> {
    const allOps = readLocal<InsuranceOperationRecord[]>(STORAGE_KEYS.OPERATIONS, []);
    const existingIdx = opInput.id ? allOps.findIndex((o) => o.id === opInput.id) : -1;
    const existing = existingIdx >= 0 ? allOps[existingIdx] : null;
    const now = new Date().toISOString();

    const maxSeq = allOps.reduce((max, o) => Math.max(max, Number(o.seq_num) || 0), 0);
    const seqNum = existing ? existing.seq_num : Number(opInput.seq_num) || maxSeq + 1;
    const requestCode =
      existing?.request_code || opInput.request_code || `OP-${String(seqNum).padStart(4, '0')}`;

    const duplicateCheck = this.detectDuplicateOperation(opInput, allOps, existing?.id);
    const finalStatus: OperationStatusType =
      duplicateCheck.isDuplicate && (!opInput.status || opInput.status === 'انتظار')
        ? 'مكرر'
        : (opInput.status as OperationStatusType) || existing?.status || 'انتظار';

    const prevAudit = parseInsuranceAuditLog(existing?.audit_log_json);
    const newAudit: InsuranceAuditDiff[] = [...prevAudit];

    if (!existing) {
      newAudit.unshift({
        timestamp: now,
        userName: actorName,
        action: duplicateCheck.isDuplicate
          ? `إضافة عملية تأمينية (تم رصد تكرار تلقائي: ${duplicateCheck.reason})`
          : 'إضافة عملية تأمينية جديدة',
      });
    } else {
      const fieldsToTrack: Array<{ key: keyof InsuranceOperationRecord; label: string }> = [
        { key: 'status', label: 'حالة الطلب' },
        { key: 'incoming_number', label: 'رقم الوارد' },
        { key: 'request_type', label: 'نوع الطلب' },
        { key: 'employee_name', label: 'اسم الموظف' },
        { key: 'notes', label: 'الملاحظات' },
      ];
      fieldsToTrack.forEach(({ key, label }) => {
        const oldVal = String(existing[key] ?? '');
        const newVal = String((opInput as any)[key] ?? oldVal);
        if (oldVal !== newVal) {
          newAudit.unshift({
            timestamp: now,
            userName: actorName,
            action: `تعديل ${label}`,
            field: label,
            oldValue: oldVal || 'فارغ',
            newValue: newVal || 'فارغ',
          });
        }
      });
    }

    const record: InsuranceOperationRecord = {
      id: existing?.id || opInput.id || `ins_op_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      seq_num: seqNum,
      request_code: requestCode,
      incoming_number: opInput.incoming_number ?? existing?.incoming_number ?? '',
      incoming_date: opInput.incoming_date ?? existing?.incoming_date ?? now.slice(0, 10),
      request_type: opInput.request_type ?? existing?.request_type ?? 'س1',
      status: finalStatus,
      company_id: opInput.company_id ?? existing?.company_id ?? '',
      company_name: opInput.company_name ?? existing?.company_name ?? '',
      employee_id: opInput.employee_id ?? existing?.employee_id ?? '',
      employee_code: opInput.employee_code ?? existing?.employee_code ?? '',
      employee_name: opInput.employee_name ?? existing?.employee_name ?? '',
      national_id: normalizeDigits(opInput.national_id ?? existing?.national_id ?? ''),
      insurance_number: normalizeDigits(opInput.insurance_number ?? existing?.insurance_number ?? ''),
      notes: opInput.notes ?? existing?.notes ?? '',
      attachment_data:
        opInput.attachment_data !== undefined ? opInput.attachment_data : existing?.attachment_data ?? null,
      attachment_name:
        opInput.attachment_name !== undefined ? opInput.attachment_name : existing?.attachment_name ?? null,
      audit_log_json: JSON.stringify(newAudit),
      created_at: existing?.created_at || now,
      updated_at: now,
    };

    const updatedList =
      existingIdx >= 0
        ? allOps.map((item, idx) => (idx === existingIdx ? record : item))
        : [record, ...allOps];

    writeLocal(STORAGE_KEYS.OPERATIONS, updatedList);
    broadcastUpdate('operations', existing ? 'UPDATE' : 'CREATE');

    try {
      await fetch('/api/insurance/operations', {
        method: existing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
    } catch (e) {
      console.warn('[insuranceStorage] Background D1 operation sync notice:', e);
    }

    return { record, duplicateCheck };
  },

  async bulkSaveOperations(
    items: Partial<InsuranceOperationRecord>[],
    actorName = 'مدير النظام'
  ): Promise<{ imported: number; duplicates: number }> {
    const allOps = readLocal<InsuranceOperationRecord[]>(STORAGE_KEYS.OPERATIONS, []);
    let maxSeq = allOps.reduce((max, o) => Math.max(max, Number(o.seq_num) || 0), 0);
    const now = new Date().toISOString();
    let duplicates = 0;

    const prepared: InsuranceOperationRecord[] = [];
    const workingPool = [...allOps];

    for (let i = 0; i < items.length; i++) {
      const raw = items[i];
      maxSeq++;
      const dupCheck = this.detectDuplicateOperation(raw, workingPool);
      if (dupCheck.isDuplicate) duplicates++;

      const status: OperationStatusType = dupCheck.isDuplicate
        ? 'مكرر'
        : ((raw.status as OperationStatusType) || 'انتظار');

      const rec: InsuranceOperationRecord = {
        id: raw.id || `ins_op_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
        seq_num: Number(raw.seq_num) || maxSeq,
        request_code: raw.request_code || `OP-${String(maxSeq).padStart(4, '0')}`,
        incoming_number: raw.incoming_number || '',
        incoming_date: raw.incoming_date || now.slice(0, 10),
        request_type: raw.request_type || 'س1',
        status,
        company_id: raw.company_id || '',
        company_name: raw.company_name || '',
        employee_id: raw.employee_id || '',
        employee_code: raw.employee_code || '',
        employee_name: raw.employee_name || '',
        national_id: normalizeDigits(raw.national_id || ''),
        insurance_number: normalizeDigits(raw.insurance_number || ''),
        notes: raw.notes || (dupCheck.reason ? `[تنبيه تكرار: ${dupCheck.reason}]` : ''),
        attachment_data: raw.attachment_data || null,
        attachment_name: raw.attachment_name || null,
        audit_log_json: JSON.stringify([
          {
            timestamp: now,
            userName: actorName,
            action: 'استيراد جماعي من ملف Excel',
          },
        ]),
        created_at: now,
        updated_at: now,
      };
      prepared.push(rec);
      workingPool.push(rec);
    }

    const merged = [...prepared, ...allOps];
    writeLocal(STORAGE_KEYS.OPERATIONS, merged);
    broadcastUpdate('operations', 'BULK_IMPORT');

    try {
      await fetch('/api/insurance/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: prepared, actorName }),
      });
    } catch (e) {
      console.warn('[insuranceStorage] Bulk D1 operations sync notice:', e);
    }

    return { imported: prepared.length, duplicates };
  },

  async bulkUpdateOperationStatus(
    ids: string[],
    newStatus: OperationStatusType,
    actorName = 'مدير النظام'
  ): Promise<void> {
    const allOps = readLocal<InsuranceOperationRecord[]>(STORAGE_KEYS.OPERATIONS, []);
    const now = new Date().toISOString();
    const idSet = new Set(ids);
    const updatedItems: InsuranceOperationRecord[] = [];

    const nextList = allOps.map((op) => {
      if (!idSet.has(op.id)) return op;
      const audit = parseInsuranceAuditLog(op.audit_log_json);
      audit.unshift({
        timestamp: now,
        userName: actorName,
        action: 'تحديث جماعي لحالة الطلب',
        field: 'حالة الطلب',
        oldValue: op.status,
        newValue: newStatus,
      });
      const updated: InsuranceOperationRecord = {
        ...op,
        status: newStatus,
        audit_log_json: JSON.stringify(audit),
        updated_at: now,
      };
      updatedItems.push(updated);
      return updated;
    });

    writeLocal(STORAGE_KEYS.OPERATIONS, nextList);
    broadcastUpdate('operations', 'BULK_STATUS');

    try {
      if (updatedItems.length > 0) {
        await fetch('/api/insurance/operations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: updatedItems, actorName }),
        });
      }
    } catch (e) {
      console.warn('[insuranceStorage] Bulk status D1 sync notice:', e);
    }
  },

  async deleteOperations(ids: string[]): Promise<void> {
    const idSet = new Set(ids);
    const allOps = readLocal<InsuranceOperationRecord[]>(STORAGE_KEYS.OPERATIONS, []);
    const filtered = allOps.filter((o) => !idSet.has(o.id));
    writeLocal(STORAGE_KEYS.OPERATIONS, filtered);
    broadcastUpdate('operations', 'DELETE');

    try {
      await fetch(`/api/insurance/operations?ids=${encodeURIComponent(ids.join(','))}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('[insuranceStorage] Delete operations D1 notice:', e);
    }
  },

  // ── 2. INSURED EMPLOYEES REGISTRY (`ins_employees`) ──────────────
  async getEmployees(companyId?: string): Promise<InsuredEmployeeRecord[]> {
    try {
      const qs = companyId && companyId !== 'all' ? `?companyId=${encodeURIComponent(companyId)}` : '';
      const res = await fetch(`/api/insurance/employees${qs}`);
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows)) {
          if (!companyId || companyId === 'all') {
            writeLocal(STORAGE_KEYS.EMPLOYEES, rows);
          }
          return rows;
        }
      }
    } catch (e) {
      console.warn('[insuranceStorage] D1 fetch employees fallback to local cache:', e);
    }
    const cached = readLocal<InsuredEmployeeRecord[]>(STORAGE_KEYS.EMPLOYEES, []);
    if (companyId && companyId !== 'all') {
      return cached.filter((emp) => emp.company_id === companyId);
    }
    return cached;
  },

  async saveEmployee(
    empInput: Partial<InsuredEmployeeRecord>,
    actorName = 'مدير النظام'
  ): Promise<InsuredEmployeeRecord> {
    const allEmps = readLocal<InsuredEmployeeRecord[]>(STORAGE_KEYS.EMPLOYEES, []);
    const existingIdx = empInput.id ? allEmps.findIndex((e) => e.id === empInput.id) : -1;
    const existing = existingIdx >= 0 ? allEmps[existingIdx] : null;
    const now = new Date().toISOString();

    const prevAudit = parseInsuranceAuditLog(existing?.audit_log_json);
    const newAudit: InsuranceAuditDiff[] = [...prevAudit];

    if (!existing) {
      newAudit.unshift({
        timestamp: now,
        userName: actorName,
        action: 'تسجيل موظف بالسجل التأميني',
      });
    } else {
      const fieldsToTrack: Array<{ key: keyof InsuredEmployeeRecord; label: string }> = [
        { key: 'name', label: 'الاسم الرباعي' },
        { key: 'national_id', label: 'الرقم القومي' },
        { key: 'insurance_number', label: 'الرقم التأميني' },
        { key: 'sub_wage', label: 'أجر الاشتراك التأميني' },
        { key: 'comp_wage', label: 'الأجر الشامل' },
        { key: 'occupation', label: 'المهنة التأمينية' },
        { key: 'status', label: 'الحالة التأمينية' },
        { key: 'resignation_date', label: 'تاريخ الاستقالة / س6' },
      ];
      fieldsToTrack.forEach(({ key, label }) => {
        const oldVal = String(existing[key] ?? '');
        const newVal = String((empInput as any)[key] ?? oldVal);
        if (oldVal !== newVal) {
          newAudit.unshift({
            timestamp: now,
            userName: actorName,
            action: `تعديل ${label}`,
            field: label,
            oldValue: oldVal || 'فارغ',
            newValue: newVal || 'فارغ',
          });
        }
      });
    }

    const nextCode =
      existing?.code ||
      empInput.code ||
      `INS-${String(allEmps.length + 1).padStart(4, '0')}`;

    const attachments =
      empInput.attachments_json !== undefined
        ? typeof empInput.attachments_json === 'string'
          ? empInput.attachments_json
          : JSON.stringify(empInput.attachments_json)
        : typeof existing?.attachments_json === 'string'
        ? existing.attachments_json
        : JSON.stringify(existing?.attachments_json || []);

    const record: InsuredEmployeeRecord = {
      id: existing?.id || empInput.id || `ins_emp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      code: nextCode,
      name: empInput.name ?? existing?.name ?? '',
      national_id: normalizeDigits(empInput.national_id ?? existing?.national_id ?? ''),
      insurance_number: normalizeDigits(empInput.insurance_number ?? existing?.insurance_number ?? ''),
      company_id: empInput.company_id ?? existing?.company_id ?? '',
      company_name: empInput.company_name ?? existing?.company_name ?? '',
      office_name: empInput.office_name ?? existing?.office_name ?? '',
      mother_name: empInput.mother_name ?? existing?.mother_name ?? '',
      qualification: empInput.qualification ?? existing?.qualification ?? '',
      occupation: empInput.occupation ?? existing?.occupation ?? '',
      occupation_code: empInput.occupation_code ?? existing?.occupation_code ?? '',
      hire_date: empInput.hire_date ?? existing?.hire_date ?? '',
      sub_start_date: empInput.sub_start_date ?? existing?.sub_start_date ?? '',
      ins_date: empInput.ins_date ?? existing?.ins_date ?? '',
      resignation_date: empInput.resignation_date ?? existing?.resignation_date ?? '',
      resignation_reason: empInput.resignation_reason ?? existing?.resignation_reason ?? '',
      duration_type: empInput.duration_type ?? existing?.duration_type ?? 'نمطي',
      sub_wage: Number(empInput.sub_wage ?? existing?.sub_wage ?? 0),
      comp_wage: Number(empInput.comp_wage ?? existing?.comp_wage ?? 0),
      status: empInput.status ?? existing?.status ?? 'مؤمن عليه س1',
      s1_incoming_number: empInput.s1_incoming_number ?? existing?.s1_incoming_number ?? '',
      has_disability: empInput.has_disability ?? existing?.has_disability ?? 'لا',
      disability_date: empInput.disability_date ?? existing?.disability_date ?? '',
      disability_percent: empInput.disability_percent ?? existing?.disability_percent ?? '',
      gov: empInput.gov ?? existing?.gov ?? '',
      center: empInput.center ?? existing?.center ?? '',
      village: empInput.village ?? existing?.village ?? '',
      street: empInput.street ?? existing?.street ?? '',
      building_no: empInput.building_no ?? existing?.building_no ?? '',
      phone: empInput.phone ?? existing?.phone ?? '',
      attachments_json: attachments,
      audit_log_json: JSON.stringify(newAudit),
      created_at: existing?.created_at || now,
      updated_at: now,
    };

    const updatedList =
      existingIdx >= 0
        ? allEmps.map((item, idx) => (idx === existingIdx ? record : item))
        : [record, ...allEmps];

    writeLocal(STORAGE_KEYS.EMPLOYEES, updatedList);
    broadcastUpdate('employees', existing ? 'UPDATE' : 'CREATE');

    try {
      await fetch('/api/insurance/employees', {
        method: existing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
    } catch (e) {
      console.warn('[insuranceStorage] Background D1 employee sync notice:', e);
    }

    return record;
  },

  async bulkSaveEmployees(
    items: Partial<InsuredEmployeeRecord>[],
    actorName = 'مدير النظام'
  ): Promise<{ imported: number; updated: number }> {
    const allEmps = readLocal<InsuredEmployeeRecord[]>(STORAGE_KEYS.EMPLOYEES, []);
    const now = new Date().toISOString();
    let imported = 0;
    let updated = 0;

    const mapByKey = new Map<string, InsuredEmployeeRecord>();
    allEmps.forEach((e) => {
      const key = normalizeDigits(e.national_id) || normalizeDigits(e.insurance_number) || e.id;
      mapByKey.set(key, e);
    });

    const batchPayload: InsuredEmployeeRecord[] = [];

    items.forEach((raw, idx) => {
      const nat = normalizeDigits(raw.national_id);
      const ins = normalizeDigits(raw.insurance_number);
      const lookupKey = nat || ins || raw.id || `new_${idx}`;
      const existing = mapByKey.get(lookupKey);

      if (existing) {
        updated++;
      } else {
        imported++;
      }

      const rec: InsuredEmployeeRecord = {
        id: existing?.id || raw.id || `ins_emp_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
        code: raw.code || existing?.code || `INS-${String(allEmps.length + imported).padStart(4, '0')}`,
        name: raw.name || existing?.name || '',
        national_id: nat || existing?.national_id || '',
        insurance_number: ins || existing?.insurance_number || '',
        company_id: raw.company_id || existing?.company_id || '',
        company_name: raw.company_name || existing?.company_name || '',
        office_name: raw.office_name ?? existing?.office_name ?? '',
        mother_name: raw.mother_name ?? existing?.mother_name ?? '',
        qualification: raw.qualification ?? existing?.qualification ?? '',
        occupation: raw.occupation ?? existing?.occupation ?? '',
        occupation_code: raw.occupation_code ?? existing?.occupation_code ?? '',
        hire_date: raw.hire_date ?? existing?.hire_date ?? '',
        sub_start_date: raw.sub_start_date ?? existing?.sub_start_date ?? '',
        ins_date: raw.ins_date ?? existing?.ins_date ?? '',
        resignation_date: raw.resignation_date ?? existing?.resignation_date ?? '',
        resignation_reason: raw.resignation_reason ?? existing?.resignation_reason ?? '',
        duration_type: raw.duration_type ?? existing?.duration_type ?? 'نمطي',
        sub_wage: Number(raw.sub_wage ?? existing?.sub_wage ?? 0),
        comp_wage: Number(raw.comp_wage ?? existing?.comp_wage ?? 0),
        status: raw.status || existing?.status || 'مؤمن عليه س1',
        s1_incoming_number: raw.s1_incoming_number ?? existing?.s1_incoming_number ?? '',
        has_disability: raw.has_disability ?? existing?.has_disability ?? 'لا',
        disability_date: raw.disability_date ?? existing?.disability_date ?? '',
        disability_percent: raw.disability_percent ?? existing?.disability_percent ?? '',
        gov: raw.gov ?? existing?.gov ?? '',
        center: raw.center ?? existing?.center ?? '',
        village: raw.village ?? existing?.village ?? '',
        street: raw.street ?? existing?.street ?? '',
        building_no: raw.building_no ?? existing?.building_no ?? '',
        phone: raw.phone ?? existing?.phone ?? '',
        attachments_json: existing?.attachments_json || '[]',
        audit_log_json: JSON.stringify([
          ...parseInsuranceAuditLog(existing?.audit_log_json),
          {
            timestamp: now,
            userName: actorName,
            action: existing ? 'تحديث بيانات الموظف عبر المزامنة / الاستيراد' : 'إضافة موظف عبر المزامنة / الاستيراد',
          },
        ]),
        created_at: existing?.created_at || now,
        updated_at: now,
      };

      mapByKey.set(lookupKey, rec);
      batchPayload.push(rec);
    });

    const finalArray = Array.from(mapByKey.values());
    writeLocal(STORAGE_KEYS.EMPLOYEES, finalArray);
    broadcastUpdate('employees', 'BULK_IMPORT');

    try {
      await fetch('/api/insurance/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: batchPayload, actorName }),
      });
    } catch (e) {
      console.warn('[insuranceStorage] Bulk D1 employees sync notice:', e);
    }

    return { imported, updated };
  },

  async deleteEmployees(ids: string[]): Promise<void> {
    const idSet = new Set(ids);
    const allEmps = readLocal<InsuredEmployeeRecord[]>(STORAGE_KEYS.EMPLOYEES, []);
    const filtered = allEmps.filter((e) => !idSet.has(e.id));
    writeLocal(STORAGE_KEYS.EMPLOYEES, filtered);
    broadcastUpdate('employees', 'DELETE');

    try {
      await fetch(`/api/insurance/employees?ids=${encodeURIComponent(ids.join(','))}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('[insuranceStorage] Delete employees D1 notice:', e);
    }
  },

  // ── 3. OFFICIAL FORMS ARCHIVE (`ins_forms`) ──────────────────────
  async getForms(companyId?: string): Promise<OfficialFormRecord[]> {
    try {
      const qs = companyId && companyId !== 'all' ? `?companyId=${encodeURIComponent(companyId)}` : '';
      const res = await fetch(`/api/insurance/forms${qs}`);
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows)) {
          if (!companyId || companyId === 'all') {
            writeLocal(STORAGE_KEYS.FORMS, rows);
          }
          return rows;
        }
      }
    } catch (e) {
      console.warn('[insuranceStorage] D1 fetch forms fallback:', e);
    }
    const cached = readLocal<OfficialFormRecord[]>(STORAGE_KEYS.FORMS, []);
    if (companyId && companyId !== 'all') {
      return cached.filter((f) => f.company_id === companyId);
    }
    return cached;
  },

  async saveForm(
    formInput: Partial<OfficialFormRecord>,
    actorName = 'مدير النظام'
  ): Promise<OfficialFormRecord> {
    const allForms = readLocal<OfficialFormRecord[]>(STORAGE_KEYS.FORMS, []);
    const existingIdx = formInput.id ? allForms.findIndex((f) => f.id === formInput.id) : -1;
    const existing = existingIdx >= 0 ? allForms[existingIdx] : null;
    const now = new Date().toISOString();

    const prevAudit = parseInsuranceAuditLog(existing?.audit_log_json);
    prevAudit.unshift({
      timestamp: now,
      userName: actorName,
      action: existing
        ? `تحديث استمارة ${formInput.form_type || existing.form_type}`
        : `إصدار وحفظ استمارة ${formInput.form_type || 'س1'} رسمية`,
    });

    const record: OfficialFormRecord = {
      id: existing?.id || formInput.id || `ins_frm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      form_type: (formInput.form_type || existing?.form_type || 'س1') as 'س1' | 'س2' | 'س6',
      form_code:
        existing?.form_code ||
        formInput.form_code ||
        `${formInput.form_type || 'S1'}-${String(allForms.length + 1).padStart(4, '0')}`,
      company_id: formInput.company_id ?? existing?.company_id ?? '',
      company_name: formInput.company_name ?? existing?.company_name ?? '',
      employee_id: formInput.employee_id ?? existing?.employee_id ?? '',
      employee_name: formInput.employee_name ?? existing?.employee_name ?? '',
      national_id: normalizeDigits(formInput.national_id ?? existing?.national_id ?? ''),
      insurance_number: normalizeDigits(formInput.insurance_number ?? existing?.insurance_number ?? ''),
      form_date: formInput.form_date ?? existing?.form_date ?? now.slice(0, 10),
      status: formInput.status ?? existing?.status ?? 'معتمد',
      payload_json:
        typeof formInput.payload_json === 'string'
          ? formInput.payload_json
          : JSON.stringify(formInput.payload_json || existing?.payload_json || {}),
      attachment_data:
        formInput.attachment_data !== undefined ? formInput.attachment_data : existing?.attachment_data ?? null,
      attachment_name:
        formInput.attachment_name !== undefined ? formInput.attachment_name : existing?.attachment_name ?? null,
      audit_log_json: JSON.stringify(prevAudit),
      created_at: existing?.created_at || now,
      updated_at: now,
    };

    const nextList =
      existingIdx >= 0
        ? allForms.map((item, idx) => (idx === existingIdx ? record : item))
        : [record, ...allForms];

    writeLocal(STORAGE_KEYS.FORMS, nextList);
    broadcastUpdate('forms', existing ? 'UPDATE' : 'CREATE');

    try {
      await fetch('/api/insurance/forms', {
        method: existing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
    } catch (e) {
      console.warn('[insuranceStorage] D1 save form notice:', e);
    }

    return record;
  },

  async deleteForm(id: string): Promise<void> {
    const allForms = readLocal<OfficialFormRecord[]>(STORAGE_KEYS.FORMS, []);
    writeLocal(
      STORAGE_KEYS.FORMS,
      allForms.filter((f) => f.id !== id)
    );
    broadcastUpdate('forms', 'DELETE');

    try {
      await fetch(`/api/insurance/forms?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch {}
  },

  // ── 4. MONTHLY REMITTANCES (`ins_remittances`) ───────────────────
  async getRemittances(companyId?: string): Promise<InsuranceRemittanceRecord[]> {
    try {
      const qs = companyId && companyId !== 'all' ? `?companyId=${encodeURIComponent(companyId)}` : '';
      const res = await fetch(`/api/insurance/remittances${qs}`);
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows)) {
          if (!companyId || companyId === 'all') {
            writeLocal(STORAGE_KEYS.REMITTANCES, rows);
          }
          return rows;
        }
      }
    } catch (e) {
      console.warn('[insuranceStorage] D1 fetch remittances fallback:', e);
    }
    const cached = readLocal<InsuranceRemittanceRecord[]>(STORAGE_KEYS.REMITTANCES, []);
    if (companyId && companyId !== 'all') {
      return cached.filter((r) => r.company_id === companyId);
    }
    return cached;
  },

  async saveRemittance(
    remInput: Partial<InsuranceRemittanceRecord>,
    actorName = 'مدير النظام'
  ): Promise<InsuranceRemittanceRecord> {
    const allRems = readLocal<InsuranceRemittanceRecord[]>(STORAGE_KEYS.REMITTANCES, []);
    const existingIdx = remInput.id ? allRems.findIndex((r) => r.id === remInput.id) : -1;
    const existing = existingIdx >= 0 ? allRems[existingIdx] : null;
    const now = new Date().toISOString();

    const prevAudit = parseInsuranceAuditLog(existing?.audit_log_json);
    prevAudit.unshift({
      timestamp: now,
      userName: actorName,
      action: existing ? `تحديث حافظة توريد (${remInput.status || existing.status})` : 'إصدار حافظة توريد اشتراكات شهرية',
    });

    const record: InsuranceRemittanceRecord = {
      id: existing?.id || remInput.id || `ins_rem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      batch_code:
        existing?.batch_code ||
        remInput.batch_code ||
        `REM-${String(allRems.length + 1).padStart(4, '0')}`,
      month_year: remInput.month_year ?? existing?.month_year ?? now.slice(0, 7),
      company_id: remInput.company_id ?? existing?.company_id ?? '',
      company_name: remInput.company_name ?? existing?.company_name ?? '',
      employees_count: Number(remInput.employees_count ?? existing?.employees_count ?? 0),
      total_sub_wage: Number(remInput.total_sub_wage ?? existing?.total_sub_wage ?? 0),
      total_comp_wage: Number(remInput.total_comp_wage ?? existing?.total_comp_wage ?? 0),
      employee_share_total: Number(remInput.employee_share_total ?? existing?.employee_share_total ?? 0),
      employer_share_total: Number(remInput.employer_share_total ?? existing?.employer_share_total ?? 0),
      total_due: Number(remInput.total_due ?? existing?.total_due ?? 0),
      receipt_number: remInput.receipt_number ?? existing?.receipt_number ?? '',
      payment_date: remInput.payment_date ?? existing?.payment_date ?? '',
      status: remInput.status ?? existing?.status ?? 'مجدول للدفع',
      notes: remInput.notes ?? existing?.notes ?? '',
      attachment_data:
        remInput.attachment_data !== undefined ? remInput.attachment_data : existing?.attachment_data ?? null,
      attachment_name:
        remInput.attachment_name !== undefined ? remInput.attachment_name : existing?.attachment_name ?? null,
      audit_log_json: JSON.stringify(prevAudit),
      created_at: existing?.created_at || now,
      updated_at: now,
    };

    const nextList =
      existingIdx >= 0
        ? allRems.map((item, idx) => (idx === existingIdx ? record : item))
        : [record, ...allRems];

    writeLocal(STORAGE_KEYS.REMITTANCES, nextList);
    broadcastUpdate('remittances', existing ? 'UPDATE' : 'CREATE');

    try {
      await fetch('/api/insurance/remittances', {
        method: existing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
    } catch (e) {
      console.warn('[insuranceStorage] D1 save remittance notice:', e);
    }

    return record;
  },

  async deleteRemittance(id: string): Promise<void> {
    const allRems = readLocal<InsuranceRemittanceRecord[]>(STORAGE_KEYS.REMITTANCES, []);
    writeLocal(
      STORAGE_KEYS.REMITTANCES,
      allRems.filter((r) => r.id !== id)
    );
    broadcastUpdate('remittances', 'DELETE');

    try {
      await fetch(`/api/insurance/remittances?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch {}
  },

  // ── 5. COMPLIANCE CHECKLISTS (`ins_compliance`) ──────────────────
  async getComplianceChecks(companyId?: string): Promise<InsuranceComplianceRecord[]> {
    try {
      const qs = companyId && companyId !== 'all' ? `?companyId=${encodeURIComponent(companyId)}` : '';
      const res = await fetch(`/api/insurance/compliance${qs}`);
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows)) {
          if (!companyId || companyId === 'all') {
            writeLocal(STORAGE_KEYS.COMPLIANCE, rows);
          }
          return rows;
        }
      }
    } catch (e) {
      console.warn('[insuranceStorage] D1 fetch compliance fallback:', e);
    }
    const cached = readLocal<InsuranceComplianceRecord[]>(STORAGE_KEYS.COMPLIANCE, []);
    if (companyId && companyId !== 'all') {
      return cached.filter((c) => c.company_id === companyId);
    }
    return cached;
  },

  async saveComplianceCheck(
    chkInput: Partial<InsuranceComplianceRecord>,
    actorName = 'مدير النظام'
  ): Promise<InsuranceComplianceRecord> {
    const allChecks = readLocal<InsuranceComplianceRecord[]>(STORAGE_KEYS.COMPLIANCE, []);
    const existingIdx = chkInput.id ? allChecks.findIndex((c) => c.id === chkInput.id) : -1;
    const existing = existingIdx >= 0 ? allChecks[existingIdx] : null;
    const now = new Date().toISOString();

    const prevAudit = parseInsuranceAuditLog(existing?.audit_log_json);
    prevAudit.unshift({
      timestamp: now,
      userName: actorName,
      action: existing ? `تحديث بند فحص وامتثال (${chkInput.status || existing.status})` : 'إضافة بند فحص وامتثال دوري',
    });

    const record: InsuranceComplianceRecord = {
      id: existing?.id || chkInput.id || `ins_cmp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      check_code:
        existing?.check_code ||
        chkInput.check_code ||
        `CMP-${String(allChecks.length + 1).padStart(4, '0')}`,
      title: chkInput.title ?? existing?.title ?? '',
      category: chkInput.category ?? existing?.category ?? 'فحص دوري',
      company_id: chkInput.company_id ?? existing?.company_id ?? '',
      company_name: chkInput.company_name ?? existing?.company_name ?? '',
      inspector_name: chkInput.inspector_name ?? existing?.inspector_name ?? actorName,
      due_date: chkInput.due_date ?? existing?.due_date ?? now.slice(0, 10),
      status: chkInput.status ?? existing?.status ?? 'قيد الفحص',
      score: Number(chkInput.score ?? existing?.score ?? 100),
      findings: chkInput.findings ?? existing?.findings ?? '',
      attachment_data:
        chkInput.attachment_data !== undefined ? chkInput.attachment_data : existing?.attachment_data ?? null,
      attachment_name:
        chkInput.attachment_name !== undefined ? chkInput.attachment_name : existing?.attachment_name ?? null,
      audit_log_json: JSON.stringify(prevAudit),
      created_at: existing?.created_at || now,
      updated_at: now,
    };

    const nextList =
      existingIdx >= 0
        ? allChecks.map((item, idx) => (idx === existingIdx ? record : item))
        : [record, ...allChecks];

    writeLocal(STORAGE_KEYS.COMPLIANCE, nextList);
    broadcastUpdate('compliance', existing ? 'UPDATE' : 'CREATE');

    try {
      await fetch('/api/insurance/compliance', {
        method: existing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
    } catch (e) {
      console.warn('[insuranceStorage] D1 save compliance notice:', e);
    }

    return record;
  },

  async deleteComplianceCheck(id: string): Promise<void> {
    const allChecks = readLocal<InsuranceComplianceRecord[]>(STORAGE_KEYS.COMPLIANCE, []);
    writeLocal(
      STORAGE_KEYS.COMPLIANCE,
      allChecks.filter((c) => c.id !== id)
    );
    broadcastUpdate('compliance', 'DELETE');

    try {
      await fetch(`/api/insurance/compliance?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch {}
  },
};
