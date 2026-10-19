// Cloudflare Pages Functions - Reception & Front Desk Database Schema & Helpers
import { D1Database } from './_utils';

/**
 * Ensures all required Reception & Front Desk tables exist in Cloudflare D1.
 * Uses atomic db.batch with individual single-statement prepare calls.
 */
export async function ensureReceptionSchema(db: D1Database): Promise<void> {
  try {
    await db.batch([
      // 1. rec_visitors (إدارة الزوار والدخول الرقمي)
      db.prepare(`
        CREATE TABLE IF NOT EXISTS rec_visitors (
          id TEXT PRIMARY KEY,
          badge_code TEXT NOT NULL,
          visitor_name TEXT NOT NULL,
          visitor_organization TEXT,
          national_id_or_passport TEXT,
          id_type TEXT DEFAULT 'national_id',
          phone TEXT,
          visitor_category TEXT DEFAULT 'زائر أعمال',
          company_id TEXT NOT NULL,
          branch_id TEXT,
          department_name TEXT,
          host_employee_id TEXT,
          host_employee_name TEXT,
          visit_purpose TEXT,
          vehicle_plate TEXT,
          belongings_notes TEXT,
          check_in_time TEXT,
          check_out_time TEXT,
          visit_date TEXT,
          status TEXT DEFAULT 'inside',
          attachment_data TEXT,
          attachment_name TEXT,
          audit_log_json TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),

      // 2. rec_room_bookings (حجز قاعات الاجتماعات والضيافة)
      db.prepare(`
        CREATE TABLE IF NOT EXISTS rec_room_bookings (
          id TEXT PRIMARY KEY,
          booking_code TEXT NOT NULL,
          room_name TEXT NOT NULL,
          company_id TEXT NOT NULL,
          branch_id TEXT,
          organizer_name TEXT,
          department_name TEXT,
          meeting_title TEXT NOT NULL,
          booking_date TEXT NOT NULL,
          start_time TEXT NOT NULL,
          end_time TEXT NOT NULL,
          attendees_count INTEGER DEFAULT 1,
          hospitality_requests TEXT,
          equipment_needed TEXT,
          status TEXT DEFAULT 'مؤكد',
          notes TEXT,
          audit_log_json TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),

      // 3. rec_parcels (سجل الطرود والشحنات السريعة)
      db.prepare(`
        CREATE TABLE IF NOT EXISTS rec_parcels (
          id TEXT PRIMARY KEY,
          tracking_code TEXT NOT NULL,
          direction TEXT NOT NULL DEFAULT 'وارد',
          courier_company TEXT NOT NULL,
          awb_number TEXT,
          sender_name TEXT NOT NULL,
          recipient_name TEXT NOT NULL,
          company_id TEXT NOT NULL,
          branch_id TEXT,
          department_name TEXT,
          parcel_type TEXT DEFAULT 'مستندات رسمية',
          received_at TEXT,
          delivered_to_recipient_at TEXT,
          status TEXT DEFAULT 'في الاستقبال',
          attachment_data TEXT,
          attachment_name TEXT,
          notes TEXT,
          audit_log_json TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),

      // 4. rec_calls (سجل المكالمات والاستفسارات)
      db.prepare(`
        CREATE TABLE IF NOT EXISTS rec_calls (
          id TEXT PRIMARY KEY,
          caller_name TEXT NOT NULL,
          caller_organization TEXT,
          caller_phone TEXT,
          call_type TEXT NOT NULL DEFAULT 'وارد',
          company_id TEXT NOT NULL,
          branch_id TEXT,
          target_department TEXT,
          target_employee_name TEXT,
          subject TEXT NOT NULL,
          call_summary TEXT,
          priority TEXT DEFAULT 'عادي',
          status TEXT DEFAULT 'بانتظار الرد',
          call_time TEXT,
          audit_log_json TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),

      // 5. rec_contractor_permits (تصاريح المقاولين والفنيين المؤقتة)
      db.prepare(`
        CREATE TABLE IF NOT EXISTS rec_contractor_permits (
          id TEXT PRIMARY KEY,
          permit_code TEXT NOT NULL,
          contractor_company TEXT NOT NULL,
          supervisor_name TEXT NOT NULL,
          supervisor_phone TEXT NOT NULL,
          supervisor_national_id TEXT,
          workers_count INTEGER DEFAULT 1,
          workers_names_json TEXT,
          company_id TEXT NOT NULL,
          branch_id TEXT,
          work_nature TEXT,
          tools_and_equipment TEXT,
          start_date TEXT NOT NULL,
          end_date TEXT NOT NULL,
          daily_hours TEXT,
          safety_approval TEXT DEFAULT 'معتمد',
          status TEXT DEFAULT 'ساري بالمنشأة',
          attachment_data TEXT,
          attachment_name TEXT,
          audit_log_json TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),
    ]);
  } catch (err: any) {
    console.warn('[Cloudflare D1 Reception] Schema ensure notice:', err.message);
  }
}
