import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Executive: Materialized KPI Snapshots across all entities
export const execKpiSnapshots = sqliteTable('exec_kpi_snapshots', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  companyId: text('company_id').notNull(),
  snapshotDate: text('snapshot_date').notNull(),
  activeProjectsCount: integer('active_projects_count').notNull().default(0),
  totalEngineeringContractValue: real('total_engineering_contract_value').notNull().default(0),
  pendingRfiCount: integer('pending_rfi_count').notNull().default(0),
  activeLawsuitsCount: integer('active_lawsuits_count').notNull().default(0),
  litigationDisputeExposure: real('litigation_dispute_exposure').notNull().default(0),
  insuredHeadcount: integer('insured_headcount').notNull().default(0),
  monthlyInsuranceWageLiability: real('monthly_insurance_wage_liability').notNull().default(0),
  openAtsRequisitionsCount: integer('open_ats_requisitions_count').notNull().default(0),
  monthlyCtsVolume: integer('monthly_cts_volume').notNull().default(0),
  criticalExpirationsUnder7Days: integer('critical_expirations_under_7_days').notNull().default(0),
  calculatedAt: text('calculated_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});
