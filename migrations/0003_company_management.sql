-- ==============================================================================
-- ECO ERP - Cloudflare D1 Company Management Schema Migration
-- Migration: 0003_company_management.sql
-- Description: Companies, Licenses, Branches & Sites, Departments, Authorized Persons & Audit Logs
-- ==============================================================================

-- 1. Companies Table (Core Entities Master Data)
CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    legal_form TEXT,
    capital REAL DEFAULT 0,
    commercial_register TEXT,
    tax_id TEXT,
    manager_name TEXT,
    address TEXT,
    metadata_json TEXT, -- stores shareholders, paid_capital, total_shares, nominal_share_value, cr_office, established_year, status, etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_cr ON companies(commercial_register);
CREATE INDEX IF NOT EXISTS idx_companies_tax ON companies(tax_id);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at DESC);

-- 2. Company Licenses & Registries Table (Single Source of Truth for Documents)
CREATE TABLE IF NOT EXISTS company_licenses (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    doc_type TEXT NOT NULL,
    doc_number TEXT,
    issuing_authority TEXT,
    issue_date TEXT,
    expiry_date TEXT,
    file_url TEXT,
    status TEXT DEFAULT 'active', -- active, expiring, expired, missing
    metadata_json TEXT, -- stores title_ar, company_name_ar, is_open_ended, days_remaining, notes_ar, attachment, audit_logs
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_company_licenses_comp_id ON company_licenses(company_id);
CREATE INDEX IF NOT EXISTS idx_company_licenses_doc_type ON company_licenses(doc_type);
CREATE INDEX IF NOT EXISTS idx_company_licenses_expiry ON company_licenses(expiry_date);
CREATE INDEX IF NOT EXISTS idx_company_licenses_status ON company_licenses(status);

-- 3. Branches & Sites Table (Locations & Field Presence)
CREATE TABLE IF NOT EXISTS branches_sites (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- فرع رئيسي, فرع إداري, مكتب إقليمي, موقع مشروع, مستودع وورشة
    address TEXT,
    manager_name TEXT,
    cost_center_code TEXT,
    metadata_json TEXT, -- stores code, city_ar, phone, email, status, operating_hours, staff_count, company_name_ar, audit_logs
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_branches_sites_comp_id ON branches_sites(company_id);
CREATE INDEX IF NOT EXISTS idx_branches_sites_type ON branches_sites(type);
CREATE INDEX IF NOT EXISTS idx_branches_sites_cost_center ON branches_sites(cost_center_code);

-- 4. Departments & Organizational Hierarchy Table
CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY,
    company_id TEXT,
    branch_id TEXT,
    parent_id TEXT, -- For hierarchical org-tree (null = root node)
    name TEXT NOT NULL,
    manager_name TEXT,
    cost_center_code TEXT,
    metadata_json TEXT, -- stores code, staff_count, sub_units, responsibilities, company_name_ar, branch_name_ar, audit_logs
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_departments_comp_id ON departments(company_id);
CREATE INDEX IF NOT EXISTS idx_departments_parent_id ON departments(parent_id);
CREATE INDEX IF NOT EXISTS idx_departments_cost_center ON departments(cost_center_code);

-- 5. Authorized Persons & Powers of Attorney Table
CREATE TABLE IF NOT EXISTS authorized_persons (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    poa_number TEXT,
    notary_office TEXT,
    issue_date TEXT,
    expiry_date TEXT,
    powers_json TEXT, -- stores national_id, company_name_ar, is_open_ended, drive_doc_url, banking_limits, contractual_limits, judicial_limits, poa_attachment, audit_logs
    status TEXT DEFAULT 'active', -- active, revoked, expired
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_authorized_persons_comp_id ON authorized_persons(company_id);
CREATE INDEX IF NOT EXISTS idx_authorized_persons_poa ON authorized_persons(poa_number);
CREATE INDEX IF NOT EXISTS idx_authorized_persons_status ON authorized_persons(status);

-- 6. Company Audit Logs Table (Full Traceability & Field Diffs)
CREATE TABLE IF NOT EXISTS company_audit_logs (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL, -- company, license, branch, department, authorized_person
    entity_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL, -- create, update, delete, status_change, revoke
    field_diffs_json TEXT, -- JSON array of { field, fieldLabel, oldValue, newValue }
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_company_audit_logs_entity ON company_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_company_audit_logs_created_at ON company_audit_logs(created_at DESC);
