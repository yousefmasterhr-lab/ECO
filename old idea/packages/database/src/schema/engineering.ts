import { sqliteTable, text, real, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './tenancy';

// Engineering: Projects Directory
export const engProjects = sqliteTable('eng_projects', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  companyId: text('company_id').notNull(),
  projectCode: text('project_code').notNull().unique(),
  name: text('name').notNull(),
  clientName: text('client_name').notNull(),
  consultantName: text('consultant_name').notNull(),
  contractValue: real('contract_value').notNull(),
  status: text('status').notNull().default('IN_PROGRESS'), // 'PLANNING' | 'IN_PROGRESS' | 'HANDOVER' | 'CLOSED'
  projectManagerId: text('project_manager_id').references(() => users.id),
  startDate: text('start_date').notNull(),
  plannedEndDate: text('planned_end_date').notNull(),
  driveProjectRootFolderId: text('drive_project_root_folder_id'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Engineering: Submittals (Shop Drawings & Materials)
export const engSubmittals = sqliteTable('eng_submittals', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  companyId: text('company_id').notNull(),
  projectId: text('project_id').notNull().references(() => engProjects.id, { onDelete: 'cascade' }),
  submittalNumber: text('submittal_number').notNull(),
  title: text('title').notNull(),
  type: text('type').notNull(), // 'SHOP_DRAWING' | 'MATERIAL_SAMPLE' | 'METHOD_STATEMENT'
  revision: integer('revision').notNull().default(0),
  status: text('status').notNull().default('PENDING_REVIEW'), // 'PENDING_REVIEW' | 'APPROVED_A' | 'APPROVED_COMMENTS_B' | 'REJECTED_C'
  driveCadFileId: text('drive_cad_file_id'),
  submittedAt: text('submitted_at').default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => ({
  projectSubmittalIdx: index('idx_eng_proj_submittal').on(table.projectId, table.submittalNumber)
}));

// Engineering: RFIs (Request For Information)
export const engRfis = sqliteTable('eng_rfis', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => engProjects.id, { onDelete: 'cascade' }),
  rfiNumber: text('rfi_number').notNull(),
  subject: text('subject').notNull(),
  question: text('question').notNull(),
  consultantAnswer: text('consultant_answer'),
  urgency: text('urgency').notNull().default('MEDIUM'), // 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCKING'
  status: text('status').notNull().default('OPEN'), // 'OPEN' | 'ANSWERED' | 'CLOSED'
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  answeredAt: text('answered_at')
});

// Engineering: Site & Municipal Licenses
export const engLicenses = sqliteTable('eng_licenses', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => engProjects.id, { onDelete: 'cascade' }),
  licenseType: text('license_type').notNull(), // 'BUILDING_PERMIT' | 'CIVIL_DEFENSE' | 'ENVIRONMENTAL' | 'EXCAVATION'
  permitNumber: text('permit_number').notNull(),
  issuingAuthority: text('issuing_authority').notNull(),
  issueDate: text('issue_date').notNull(),
  expiryDate: text('expiry_date').notNull(),
  status: text('status').notNull().default('ACTIVE'), // 'ACTIVE' | 'RENEWAL_IN_PROGRESS' | 'EXPIRED'
  driveScanFileId: text('drive_scan_file_id')
});
