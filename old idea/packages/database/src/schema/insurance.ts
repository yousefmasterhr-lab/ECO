import { sqliteTable, text, real, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './tenancy';

// Insurance: Insured Employees Register
export const insEmployees = sqliteTable('ins_employees', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  companyId: text('company_id').notNull(),
  nationalId: text('national_id').notNull(),
  insuranceNumber: text('insurance_number').notNull(),
  employeeName: text('employee_name').notNull(),
  jobTitle: text('job_title').notNull(),
  basicWage: real('basic_wage').notNull(),
  variableWage: real('variable_wage').notNull().default(0),
  totalInsuranceWage: real('total_insurance_wage').notNull(),
  hireDate: text('hire_date').notNull(),
  status: text('status').notNull().default('ACTIVE'), // 'ACTIVE' | 'TERMINATED' | 'SUSPENDED'
  companyShare: real('company_share').notNull(),
  employeeShare: real('employee_share').notNull(),
  driveDossierFolderId: text('drive_dossier_folder_id'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => ({
  companyEmployeeIdx: index('idx_ins_comp_nat_id').on(table.companyId, table.nationalId)
}));

// Insurance: Statutory Forms (Form 1: Enrollment, Form 2: Annual Wage Adjustment, Form 6: Termination)
export const insForms = sqliteTable('ins_forms', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  companyId: text('company_id').notNull(),
  employeeId: text('employee_id').notNull().references(() => insEmployees.id, { onDelete: 'cascade' }),
  formType: text('form_type').notNull(), // 'FORM_1' | 'FORM_2' | 'FORM_6'
  submissionDate: text('submission_date').notNull(),
  statutoryOfficeName: text('statutory_office_name').notNull(),
  receiptNumber: text('receipt_number'),
  status: text('status').notNull().default('DRAFT'), // 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  driveScanFileId: text('drive_scan_file_id'),
  createdById: text('created_by_id').notNull().references(() => users.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});
