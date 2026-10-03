import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Tenants: Corporate Holdings / Group Entities
export const tenants = sqliteTable('tenants', {
  id: text('id').primaryKey(),
  legalName: text('legal_name').notNull(),
  subdomain: text('subdomain').notNull().unique(),
  subscriptionPlan: text('subscription_plan').notNull().default('ENTERPRISE'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Companies: Subsidiaries under a Holding Tenant
export const companies = sqliteTable('companies', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'restrict' }),
  commercialName: text('commercial_name').notNull(),
  taxNumber: text('tax_number').notNull(),
  commercialRegistrationNo: text('commercial_registration_no').notNull(),
  currency: text('currency').notNull().default('EGP'),
  driveRootFolderId: text('drive_root_folder_id'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Users: Centralized across tenant entities
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  preferredLanguage: text('preferred_language').notNull().default('ar'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Company Memberships: Roles & Clearance within each company
export const companyMemberships = sqliteTable('company_memberships', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  companyId: text('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  department: text('department').notNull(), // 'ENGINEERING' | 'CTS' | 'INSURANCE' | 'ATS' | 'LEGAL' | 'EXECUTIVE'
  role: text('role').notNull(), // 'C_SUITE' | 'LEGAL_DIRECTOR' | 'LEGAL_OFFICER' | 'HR_MANAGER' | etc.
  clearanceLevel: integer('clearance_level').notNull().default(1), // 1 to 4
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => ({
  userCompanyIdx: uniqueIndex('uk_user_company_idx').on(table.companyId, table.userId)
}));
