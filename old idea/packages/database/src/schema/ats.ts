import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './tenancy';

// ATS: Job Openings / Requisitions
export const atsJobs = sqliteTable('ats_jobs', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  companyId: text('company_id').notNull(),
  title: text('title').notNull(),
  department: text('department').notNull(),
  headcountNeeded: integer('headcount_needed').notNull().default(1),
  experienceMinYears: integer('experience_min_years').notNull().default(0),
  salaryRangeMin: real('salary_range_min'),
  salaryRangeMax: real('salary_range_max'),
  status: text('status').notNull().default('ACTIVE'), // 'ACTIVE' | 'ON_HOLD' | 'CLOSED'
  hiringManagerId: text('hiring_manager_id').references(() => users.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

// ATS: Candidates & Applicants
export const atsCandidates = sqliteTable('ats_candidates', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  companyId: text('company_id').notNull(),
  jobId: text('job_id').notNull().references(() => atsJobs.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  stage: text('stage').notNull().default('APPLIED'), // 'APPLIED' | 'SCREENED' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED'
  ratingScore: integer('rating_score').default(0), // 1 - 5 stars
  driveResumeFileId: text('drive_resume_file_id'),
  notes: text('notes'),
  appliedAt: text('applied_at').default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => ({
  jobStageIdx: index('idx_ats_job_stage').on(table.jobId, table.stage)
}));
