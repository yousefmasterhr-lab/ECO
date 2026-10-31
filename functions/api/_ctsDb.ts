// Cloudflare Pages Functions - Project Correspondence Management System (CTS / PCMS) Database Schema
import { D1Database } from './_utils';

/**
 * Ensures all required CTS / PCMS tables exist in Cloudflare D1.
 * Atomic batch creation using individual single-statement prepare calls.
 */
export async function ensureCTSSchema(db: D1Database): Promise<void> {
  try {
    await db.batch([
      // 1. cts_projects: Engineering Projects Registry
      db.prepare(`
        CREATE TABLE IF NOT EXISTS cts_projects (
          id TEXT PRIMARY KEY,
          code TEXT NOT NULL,
          name TEXT NOT NULL,
          client_name TEXT NOT NULL,
          consultant_name TEXT,
          contractor_name TEXT,
          project_status TEXT DEFAULT 'Active',
          start_date TEXT,
          end_date TEXT,
          location TEXT,
          total_budget REAL DEFAULT 0,
          currency TEXT DEFAULT 'EGP',
          description TEXT,
          scope_of_work TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),

      // 2. cts_entities: Stakeholders Registry (Consultants, Owners, Contractors, Suppliers)
      db.prepare(`
        CREATE TABLE IF NOT EXISTS cts_entities (
          id TEXT PRIMARY KEY,
          code TEXT NOT NULL,
          name TEXT NOT NULL,
          short_name TEXT,
          role TEXT DEFAULT 'Consultant',
          legal_type TEXT DEFAULT 'Company',
          registration_no TEXT,
          tax_no TEXT,
          contact_person TEXT,
          contact_title TEXT,
          phone TEXT,
          mobile TEXT,
          email TEXT,
          address TEXT,
          website TEXT,
          status TEXT DEFAULT 'Active',
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),

      // 3. cts_correspondences: Core Inbound / Outbound Correspondence Log
      db.prepare(`
        CREATE TABLE IF NOT EXISTS cts_correspondences (
          id TEXT PRIMARY KEY,
          serial_number TEXT NOT NULL,
          external_ref_no TEXT,
          doc_type TEXT NOT NULL,
          classification TEXT NOT NULL,
          is_draft INTEGER DEFAULT 0,
          project_ref TEXT NOT NULL,
          project_name TEXT,
          subject TEXT NOT NULL,
          body_text TEXT,
          sender_entity TEXT NOT NULL,
          receiver_entity TEXT NOT NULL,
          originator_code TEXT DEFAULT 'CON',
          recipient_code TEXT DEFAULT 'CTR',
          priority TEXT DEFAULT 'Normal',
          issue_date TEXT NOT NULL,
          received_date TEXT,
          due_date TEXT,
          status TEXT DEFAULT 'Pending',
          parent_doc_id TEXT,
          parent_serial TEXT,
          created_by_user_id TEXT,
          created_by_name TEXT,
          approved_by_user_id TEXT,
          approved_by_name TEXT,
          approval_date TEXT,
          attachments_json TEXT DEFAULT '[]',
          workflow_history_json TEXT DEFAULT '[]',
          review_remarks TEXT,
          returned_by_name TEXT,
          returned_at TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),

      // 4. cts_audit_logs: Immutable Audit Trail & Activity History
      db.prepare(`
        CREATE TABLE IF NOT EXISTS cts_audit_logs (
          id TEXT PRIMARY KEY,
          correspondence_id TEXT,
          target_doc TEXT,
          action_type TEXT NOT NULL,
          user_id TEXT,
          user_name TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          details TEXT,
          previous_value TEXT,
          new_value TEXT,
          changed_fields_json TEXT,
          details_json TEXT
        )
      `),

      // 5. cts_system_counters: Concurrency Safe Atomic Serial Counters
      db.prepare(`
        CREATE TABLE IF NOT EXISTS cts_system_counters (
          counter_key TEXT PRIMARY KEY,
          project_code TEXT NOT NULL,
          doc_type TEXT NOT NULL,
          year TEXT NOT NULL,
          last_serial INTEGER NOT NULL DEFAULT 0,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),
    ]);

    // Create Indexes for high-speed search and filtering
    await db.batch([
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_cts_corr_project ON cts_correspondences(project_ref)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_cts_corr_doctype ON cts_correspondences(doc_type)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_cts_corr_status ON cts_correspondences(status)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_cts_audit_corr ON cts_audit_logs(correspondence_id)`),
    ]);
  } catch (err) {
    console.warn('[Cloudflare D1 CTS Schema Warning]', err);
  }
}
