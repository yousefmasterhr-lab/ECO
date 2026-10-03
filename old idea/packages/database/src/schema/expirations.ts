import { sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './tenancy';

// Smart Expiration Registry for automated 60/30/15/7/1 days notifications
export const expirationRegistry = sqliteTable('expiration_registry', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  companyId: text('company_id').notNull(),
  module: text('module').notNull(), // 'LEGAL' | 'ENGINEERING' | 'INSURANCE' | 'CTS' | 'EXECUTIVE'
  entityReferenceId: text('entity_reference_id').notNull(),
  title: text('title').notNull(),
  expiryDate: text('expiry_date').notNull(), // YYYY-MM-DD
  alertLeadDays: text('alert_lead_days').notNull().default('60,30,15,7,1'),
  lastNotifiedAt: text('last_notified_at'),
  status: text('status').notNull().default('ACTIVE'), // 'ACTIVE' | 'RENEWED' | 'LAPSED'
  assignedUserId: text('assigned_user_id').references(() => users.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => ({
  expiryStatusIdx: index('idx_expiry_status').on(table.expiryDate, table.status)
}));
