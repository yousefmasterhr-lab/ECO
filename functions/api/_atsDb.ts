// Cloudflare Pages Functions - Talent Acquisition (ATS) & Automation Database Schema
import { D1Database } from './_utils';

/**
 * Ensures all required ATS & Automation tables exist in Cloudflare D1.
 * Atomic batch creation using individual single-statement prepare calls.
 */
export async function ensureATSSchema(db: D1Database): Promise<void> {
  try {
    await db.batch([
      // 1. ats_jobs
      db.prepare(`
        CREATE TABLE IF NOT EXISTS ats_jobs (
          id TEXT PRIMARY KEY,
          code TEXT NOT NULL,
          title TEXT NOT NULL,
          title_en TEXT,
          company_id TEXT NOT NULL,
          company_name TEXT,
          department TEXT NOT NULL,
          location TEXT,
          employment_type TEXT DEFAULT 'full_time',
          experience_level TEXT DEFAULT 'mid',
          min_salary REAL DEFAULT 0,
          max_salary REAL DEFAULT 0,
          currency TEXT DEFAULT 'EGP',
          target_hire_date TEXT,
          headcount INTEGER DEFAULT 1,
          filled_count INTEGER DEFAULT 0,
          status TEXT DEFAULT 'published',
          description TEXT,
          requirements_json TEXT,
          responsibilities_json TEXT,
          recruiter_id TEXT,
          recruiter_name TEXT,
          recruiter_avatar TEXT,
          current_tier INTEGER DEFAULT 1,
          approval_chain_json TEXT,
          published_at TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),

      // 2. ats_candidates
      db.prepare(`
        CREATE TABLE IF NOT EXISTS ats_candidates (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          name_en TEXT,
          email TEXT,
          phone TEXT,
          national_id TEXT,
          location TEXT,
          headline TEXT,
          current_company TEXT,
          current_title TEXT,
          total_years_experience INTEGER DEFAULT 0,
          education TEXT,
          stage TEXT DEFAULT 'applied',
          status TEXT DEFAULT 'active',
          match_score INTEGER DEFAULT 0,
          requisition_id TEXT,
          company_id TEXT NOT NULL,
          tags_json TEXT,
          skills_json TEXT,
          resume_url TEXT,
          resume_name TEXT,
          applied_at TEXT,
          source TEXT DEFAULT 'direct',
          source_details TEXT,
          rejection_reason TEXT,
          expected_salary REAL DEFAULT 0,
          current_salary REAL DEFAULT 0,
          notice_period_days INTEGER DEFAULT 30,
          notes_json TEXT,
          activities_json TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),

      // 3. ats_interviews
      db.prepare(`
        CREATE TABLE IF NOT EXISTS ats_interviews (
          id TEXT PRIMARY KEY,
          requisition_id TEXT NOT NULL,
          requisition_title TEXT,
          candidate_id TEXT NOT NULL,
          candidate_name TEXT NOT NULL,
          candidate_avatar TEXT,
          date TEXT NOT NULL,
          start_time TEXT NOT NULL,
          end_time TEXT,
          type TEXT DEFAULT 'technical',
          format TEXT DEFAULT 'video',
          meeting_link TEXT,
          location TEXT,
          status TEXT DEFAULT 'scheduled',
          interviewers_json TEXT,
          scorecard_id TEXT,
          scorecard_json TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),

      // 4. ats_offers
      db.prepare(`
        CREATE TABLE IF NOT EXISTS ats_offers (
          id TEXT PRIMARY KEY,
          candidate_id TEXT NOT NULL,
          candidate_name TEXT NOT NULL,
          candidate_email TEXT,
          candidate_phone TEXT,
          requisition_id TEXT,
          job_title TEXT NOT NULL,
          department TEXT NOT NULL,
          company_id TEXT NOT NULL,
          company_name TEXT,
          start_date TEXT,
          compensation_json TEXT,
          preboarding_documents_json TEXT,
          candidate_signature_json TEXT,
          status TEXT DEFAULT 'draft',
          is_synced_to_core_hr INTEGER DEFAULT 0,
          core_hr_employee_id TEXT,
          notes TEXT,
          expires_at TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),

      // 5. automation_rules
      db.prepare(`
        CREATE TABLE IF NOT EXISTS automation_rules (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          name_en TEXT,
          description TEXT,
          description_en TEXT,
          module TEXT DEFAULT 'ats',
          trigger TEXT NOT NULL,
          conditions_json TEXT,
          actions_json TEXT,
          is_active INTEGER DEFAULT 1,
          times_executed INTEGER DEFAULT 0,
          last_executed_at TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),

      // 6. automation_logs
      db.prepare(`
        CREATE TABLE IF NOT EXISTS automation_logs (
          id TEXT PRIMARY KEY,
          rule_id TEXT,
          rule_name TEXT NOT NULL,
          trigger TEXT NOT NULL,
          event_title TEXT,
          target_id TEXT,
          target_title TEXT,
          status TEXT DEFAULT 'success',
          details TEXT,
          execution_time_ms INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)
    ]);
  } catch (err) {
    console.warn('[D1 ATS Schema Init Warning]', err);
  }
}

