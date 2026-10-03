import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './tenancy';

// Unified Document Vault metadata mapping to Google Drive API v3
export const documentVault = sqliteTable('document_vault', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  companyId: text('company_id').notNull(),
  module: text('module').notNull(), // 'LEGAL' | 'CTS' | 'ENGINEERING' | 'INSURANCE' | 'ATS' | 'EXECUTIVE'
  entityId: text('entity_id').notNull(), // Case ID, Transmittal ID, Candidate ID, etc.
  driveFileId: text('drive_file_id').notNull(),
  driveWebViewLink: text('drive_web_view_link').notNull(),
  fileName: text('file_name').notNull(),
  mimeType: text('mime_type').notNull(),
  fileSizeBytes: integer('file_size_bytes').notNull(),
  sha256Checksum: text('sha256_checksum').notNull(),
  uploadedBy: text('uploaded_by').notNull().references(() => users.id),
  clearanceLevel: integer('clearance_level').notNull().default(1),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => ({
  lookupIdx: index('idx_vault_lookup').on(table.tenantId, table.companyId, table.module, table.entityId)
}));
