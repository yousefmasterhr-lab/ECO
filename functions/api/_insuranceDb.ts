// Cloudflare Pages Functions - Social Insurance (التأمينات الاجتماعية) Database Schema & Helpers
import { D1Database } from './_utils';

/**
 * Ensures all required Social Insurance tables exist in Cloudflare D1.
 * Strictly uses atomic db.batch with individual single-statement prepare calls
 * (avoiding db.exec with multi-line template strings per MISTAKES.md).
 */
export async function ensureInsuranceSchema(db: D1Database): Promise<void> {
  try {
    await db.batch([
      // 1. ins_operations (مركز العمليات التأمينية)
      db.prepare(`
        CREATE TABLE IF NOT EXISTS ins_operations (
          id TEXT PRIMARY KEY,
          seq_num INTEGER DEFAULT 0,
          request_code TEXT NOT NULL,
          incoming_number TEXT,
          incoming_date TEXT,
          request_type TEXT NOT NULL,
          status TEXT DEFAULT 'انتظار',
          company_id TEXT,
          company_name TEXT,
          employee_id TEXT,
          employee_code TEXT,
          employee_name TEXT,
          national_id TEXT,
          insurance_number TEXT,
          notes TEXT,
          attachment_data TEXT,
          attachment_name TEXT,
          audit_log_json TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),

      // 2. ins_employees (السجل التأميني للعاملين وجداول الموظفين)
      db.prepare(`
        CREATE TABLE IF NOT EXISTS ins_employees (
          id TEXT PRIMARY KEY,
          code TEXT,
          name TEXT NOT NULL,
          national_id TEXT,
          insurance_number TEXT,
          company_id TEXT,
          company_name TEXT,
          office_name TEXT,
          mother_name TEXT,
          qualification TEXT,
          occupation TEXT,
          occupation_code TEXT,
          hire_date TEXT,
          sub_start_date TEXT,
          ins_date TEXT,
          resignation_date TEXT,
          resignation_reason TEXT,
          duration_type TEXT DEFAULT 'نمطي',
          sub_wage REAL DEFAULT 0,
          comp_wage REAL DEFAULT 0,
          status TEXT DEFAULT 'قيد المراجعة',
          s1_incoming_number TEXT,
          has_disability TEXT DEFAULT 'لا',
          disability_date TEXT,
          disability_percent TEXT,
          gov TEXT,
          center TEXT,
          village TEXT,
          street TEXT,
          building_no TEXT,
          phone TEXT,
          attachments_json TEXT,
          audit_log_json TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),

      // 3. ins_forms (مركز الاستمارات الرسمية س1 / س2 / س6)
      db.prepare(`
        CREATE TABLE IF NOT EXISTS ins_forms (
          id TEXT PRIMARY KEY,
          form_type TEXT NOT NULL,
          form_code TEXT NOT NULL,
          company_id TEXT,
          company_name TEXT,
          employee_id TEXT,
          employee_name TEXT,
          national_id TEXT,
          insurance_number TEXT,
          form_date TEXT,
          status TEXT DEFAULT 'معتمد',
          payload_json TEXT,
          attachment_data TEXT,
          attachment_name TEXT,
          audit_log_json TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),

      // 4. ins_remittances (وعاء الأجور والاشتراكات والتوريدات الشهرية)
      db.prepare(`
        CREATE TABLE IF NOT EXISTS ins_remittances (
          id TEXT PRIMARY KEY,
          batch_code TEXT NOT NULL,
          month_year TEXT NOT NULL,
          company_id TEXT,
          company_name TEXT,
          employees_count INTEGER DEFAULT 0,
          total_sub_wage REAL DEFAULT 0,
          total_comp_wage REAL DEFAULT 0,
          employee_share_total REAL DEFAULT 0,
          employer_share_total REAL DEFAULT 0,
          total_due REAL DEFAULT 0,
          receipt_number TEXT,
          payment_date TEXT,
          status TEXT DEFAULT 'مجدول للدفع',
          notes TEXT,
          attachment_data TEXT,
          attachment_name TEXT,
          audit_log_json TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),

      // 5. ins_compliance (لوحة الفحص والامتثال التأميني الدوري)
      db.prepare(`
        CREATE TABLE IF NOT EXISTS ins_compliance (
          id TEXT PRIMARY KEY,
          check_code TEXT NOT NULL,
          title TEXT NOT NULL,
          category TEXT DEFAULT 'فحص دوري',
          company_id TEXT,
          company_name TEXT,
          inspector_name TEXT,
          due_date TEXT,
          status TEXT DEFAULT 'قيد الفحص',
          score INTEGER DEFAULT 100,
          findings TEXT,
          attachment_data TEXT,
          attachment_name TEXT,
          audit_log_json TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),
    ]);
  } catch (err: any) {
    console.warn('[Cloudflare D1 Insurance] Schema ensure notice:', err.message);
  }
}
