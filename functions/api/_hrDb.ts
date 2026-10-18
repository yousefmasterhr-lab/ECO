// Cloudflare Pages Functions - Human Resources (HRMS) Database Helpers & Schema Auto-Init
import { D1Database } from './_utils';

/**
 * Ensures all required HR Management tables exist in Cloudflare D1.
 * Uses atomic db.batch with individual single-statement prepare calls.
 */
export async function ensureHrSchema(db: D1Database): Promise<void> {
  try {
    await db.batch([
      // 1. hr_employees
      db.prepare(`
        CREATE TABLE IF NOT EXISTS hr_employees (
          id TEXT PRIMARY KEY,
          code TEXT NOT NULL UNIQUE,
          name_ar TEXT NOT NULL,
          name_en TEXT,
          national_id TEXT NOT NULL,
          insurance_no TEXT,
          phone TEXT NOT NULL,
          work_phone TEXT,
          email TEXT,
          address TEXT,
          blood_type TEXT,
          religion TEXT,
          marital_status TEXT,
          birth_date TEXT,
          company_id TEXT NOT NULL,
          branch_id TEXT,
          department_id TEXT,
          job_title TEXT NOT NULL,
          direct_manager_id TEXT,
          hire_date TEXT NOT NULL,
          status TEXT DEFAULT 'active',
          bank_name TEXT,
          iban TEXT,
          payment_method TEXT DEFAULT 'bank_transfer',
          emergency_contact_name TEXT,
          emergency_contact_phone TEXT,
          emergency_contact_relation TEXT,
          biometric_id TEXT,
          avatar_url TEXT,
          basic_salary REAL DEFAULT 0,
          allowances_total REAL DEFAULT 0,
          deductions_total REAL DEFAULT 0,
          net_salary REAL DEFAULT 0,
          documents_json TEXT,
          custody_json TEXT,
          allowances_json TEXT,
          work_schedule_json TEXT,
          audit_logs_json TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),

      // 2. hr_contracts
      db.prepare(`
        CREATE TABLE IF NOT EXISTS hr_contracts (
          id TEXT PRIMARY KEY,
          employee_id TEXT NOT NULL,
          company_id TEXT NOT NULL,
          contract_type TEXT NOT NULL,
          start_date TEXT NOT NULL,
          end_date TEXT,
          probation_end_date TEXT,
          basic_salary REAL DEFAULT 0,
          variable_salary REAL DEFAULT 0,
          housing_allowance REAL DEFAULT 0,
          transport_allowance REAL DEFAULT 0,
          other_allowances REAL DEFAULT 0,
          insurance_salary REAL DEFAULT 0,
          work_hours_per_day REAL DEFAULT 8,
          work_days_per_week REAL DEFAULT 5,
          annual_leave_entitlement REAL DEFAULT 21,
          file_data TEXT,
          file_name TEXT,
          status TEXT DEFAULT 'valid',
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),

      // 3. hr_attendance
      db.prepare(`
        CREATE TABLE IF NOT EXISTS hr_attendance (
          id TEXT PRIMARY KEY,
          employee_id TEXT NOT NULL,
          company_id TEXT,
          date TEXT NOT NULL,
          check_in TEXT,
          check_out TEXT,
          work_hours REAL DEFAULT 0,
          late_minutes REAL DEFAULT 0,
          overtime_hours REAL DEFAULT 0,
          status TEXT DEFAULT 'حاضر',
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),

      // 4. hr_leaves
      db.prepare(`
        CREATE TABLE IF NOT EXISTS hr_leaves (
          id TEXT PRIMARY KEY,
          employee_id TEXT NOT NULL,
          company_id TEXT,
          leave_type TEXT NOT NULL,
          start_date TEXT NOT NULL,
          end_date TEXT NOT NULL,
          days_count REAL NOT NULL,
          reason TEXT,
          attachment_data TEXT,
          status TEXT DEFAULT 'معتمد',
          approved_by TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),

      // 5. hr_loans
      db.prepare(`
        CREATE TABLE IF NOT EXISTS hr_loans (
          id TEXT PRIMARY KEY,
          employee_id TEXT NOT NULL,
          company_id TEXT,
          loan_type TEXT NOT NULL,
          total_amount REAL NOT NULL,
          monthly_installment REAL NOT NULL,
          paid_amount REAL DEFAULT 0,
          remaining_amount REAL NOT NULL,
          start_month TEXT NOT NULL,
          installments_count INTEGER NOT NULL,
          reason TEXT,
          status TEXT DEFAULT 'نشطة',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),

      // 6. hr_rewards_penalties
      db.prepare(`
        CREATE TABLE IF NOT EXISTS hr_rewards_penalties (
          id TEXT PRIMARY KEY,
          employee_id TEXT NOT NULL,
          company_id TEXT,
          type TEXT NOT NULL,
          category TEXT NOT NULL,
          amount_or_days REAL NOT NULL,
          calculation_mode TEXT DEFAULT 'fixed_amount',
          effective_month TEXT NOT NULL,
          reason TEXT NOT NULL,
          created_by TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),

      // 7. hr_payroll_runs
      db.prepare(`
        CREATE TABLE IF NOT EXISTS hr_payroll_runs (
          id TEXT PRIMARY KEY,
          period_month TEXT NOT NULL,
          company_id TEXT NOT NULL,
          status TEXT DEFAULT 'draft',
          total_basic REAL DEFAULT 0,
          total_allowances REAL DEFAULT 0,
          total_rewards REAL DEFAULT 0,
          total_deductions REAL DEFAULT 0,
          total_insurance REAL DEFAULT 0,
          total_loans REAL DEFAULT 0,
          total_net REAL DEFAULT 0,
          employees_count INTEGER DEFAULT 0,
          items_json TEXT,
          approved_by TEXT,
          approved_at TEXT,
          disbursed_at TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),

      // Indexes
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_hr_emp_comp ON hr_employees(company_id)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_hr_emp_dept ON hr_employees(department_id)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_hr_emp_status ON hr_employees(status)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_hr_contracts_emp ON hr_contracts(employee_id)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_hr_att_emp ON hr_attendance(employee_id)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_hr_leaves_emp ON hr_leaves(employee_id)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_hr_loans_emp ON hr_loans(employee_id)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_hr_rew_pen_emp ON hr_rewards_penalties(employee_id)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_hr_payroll_period ON hr_payroll_runs(period_month, company_id)`)
    ]);
  } catch (err) {
    console.warn('[ensureHrSchema] Schema batch check notice:', err);
  }
}
