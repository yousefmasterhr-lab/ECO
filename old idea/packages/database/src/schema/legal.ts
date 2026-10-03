import { sqliteTable, text, real, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './tenancy';

// Legal: Cases & Lawsuits Docket
export const legalCases = sqliteTable('legal_cases', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  companyId: text('company_id').notNull(),
  caseNumber: text('case_number').notNull(),
  courtName: text('court_name').notNull(),
  judicialCircuit: text('judicial_circuit').notNull(),
  year: integer('year').notNull(),
  caseType: text('case_type').notNull(), // 'COMMERCIAL' | 'LABOR' | 'CIVIL' | 'TAX' | 'CRIMINAL'
  capacity: text('capacity').notNull(), // 'PLAINTIFF' (مدعي) | 'DEFENDANT' (مدعى عليه)
  opponentName: text('opponent_name').notNull(),
  opponentLawyer: text('opponent_lawyer'),
  disputedAmount: real('disputed_amount').notNull().default(0),
  claimSummary: text('claim_summary').notNull(),
  currentStage: text('current_stage').notNull().default('FIRST_INSTANCE'), // 'FIRST_INSTANCE' | 'APPEAL' | 'CASSATION' | 'EXECUTION'
  status: text('status').notNull().default('PENDING'), // 'PENDING' | 'WON' | 'LOST' | 'SETTLED'
  clearanceLevel: integer('clearance_level').notNull().default(2), // Strict Legal Clearance (Level 2 to 4)
  leadAttorneyId: text('lead_attorney_id').references(() => users.id),
  driveDossierFolderId: text('drive_dossier_folder_id'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => ({
  companyCaseIdx: index('idx_legal_company_case').on(table.companyId, table.caseNumber)
}));

// Legal: Court Hearings Timeline
export const legalHearings = sqliteTable('legal_hearings', {
  id: text('id').primaryKey(),
  caseId: text('case_id').notNull().references(() => legalCases.id, { onDelete: 'cascade' }),
  hearingDate: text('hearing_date').notNull(), // YYYY-MM-DD
  decisionNotes: text('decision_notes'),
  assignedCounselId: text('assigned_counsel_id').references(() => users.id),
  actionRequired: text('action_required'),
  nextHearingDate: text('next_hearing_date'),
  driveSessionMinuteScanId: text('drive_session_minute_scan_id'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Legal: Corporate Contracts Repository
export const legalContracts = sqliteTable('legal_contracts', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  companyId: text('company_id').notNull(),
  contractRef: text('contract_ref').notNull().unique(),
  title: text('title').notNull(),
  secondPartyName: text('second_party_name').notNull(),
  effectiveDate: text('effective_date').notNull(),
  expirationDate: text('expiration_date').notNull(),
  totalValue: real('total_value').notNull().default(0),
  autoRenew: integer('auto_renew', { mode: 'boolean' }).notNull().default(false),
  status: text('status').notNull().default('ACTIVE'), // 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED'
  clearanceLevel: integer('clearance_level').notNull().default(3),
  driveContractPdfId: text('drive_contract_pdf_id')
});
