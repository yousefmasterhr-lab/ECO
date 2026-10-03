import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './tenancy';

// CTS: Inbound & Outbound Correspondence Management
export const ctsCorrespondence = sqliteTable('cts_correspondence', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  companyId: text('company_id').notNull(),
  type: text('type').notNull(), // 'INBOUND' | 'OUTBOUND' | 'INTERNAL'
  serialNumber: text('serial_number').notNull().unique(),
  barcode: text('barcode').notNull(),
  subject: text('subject').notNull(),
  senderEntity: text('sender_entity').notNull(),
  recipientEntity: text('recipient_entity').notNull(),
  deliveryMethod: text('delivery_method').notNull().default('HAND_DELIVERY'),
  urgency: text('urgency').notNull().default('NORMAL'), // 'NORMAL' | 'URGENT' | 'IMMEDIATE'
  confidentiality: text('confidentiality').notNull().default('NORMAL'), // 'NORMAL' | 'SECRET' | 'TOP_SECRET'
  status: text('status').notNull().default('REGISTERED'), // 'REGISTERED' | 'ROUTED' | 'SIGNED_OFF' | 'ARCHIVED'
  currentAssigneeId: text('current_assignee_id').references(() => users.id),
  driveAttachmentId: text('drive_attachment_id'),
  registeredAt: text('registered_at').default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => ({
  companyTypeIdx: index('idx_cts_company_type').on(table.companyId, table.type)
}));

// CTS: Routing History & Sign-off chain
export const ctsRoutingHistory = sqliteTable('cts_routing_history', {
  id: text('id').primaryKey(),
  correspondenceId: text('correspondence_id').notNull().references(() => ctsCorrespondence.id, { onDelete: 'cascade' }),
  fromUserId: text('from_user_id').notNull().references(() => users.id),
  toUserId: text('to_user_id').notNull().references(() => users.id),
  instructions: text('instructions'),
  actionTaken: text('action_taken'),
  status: text('status').notNull().default('PENDING'), // 'PENDING' | 'ACKNOWLEDGED' | 'COMPLETED'
  routedAt: text('routed_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  signedAt: text('signed_at')
});
