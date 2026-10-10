-- ==============================================================================
-- ECO ERP - Cloudflare D1 Core Relational Schema Migration
-- Migration: 0001_core_schema.sql
-- Description: Core Users, RBAC, Real Audit Logs, and R2 Document Vault Ledger
-- ==============================================================================

-- 1. Users Table (Core Identity & RBAC Clearance)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    national_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_id TEXT NOT NULL, -- SUPER_ADMIN, HR_MANAGER, PROJECTS_ENGINEER, LEGAL_COUNSEL, RECEPTION_SECURITY, FINANCE_OFFICER
    department TEXT NOT NULL,
    clearance_level INTEGER DEFAULT 1,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_national_id ON users(national_id);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- 2. Audit Logs Table (Live Corporate Activity Ledger)
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    category TEXT NOT NULL, -- تسجيل دخول, حسابات المستخدمين, تعديل الصلاحيات, إعدادات النظام
    action TEXT NOT NULL,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON audit_logs(category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- 3. Department Documents Table (Cloudflare R2 Storage Metadata Ledger)
CREATE TABLE IF NOT EXISTS department_documents (
    id TEXT PRIMARY KEY,
    module_type TEXT NOT NULL, -- HR, PROJECTS, LEGAL, CTS, INSURANCE
    entity_id TEXT NOT NULL, -- Employee ID, Project ID, Case ID, etc.
    file_name TEXT NOT NULL,
    r2_object_key TEXT NOT NULL UNIQUE,
    file_size_bytes INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    uploaded_by_user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_department_docs_module_entity ON department_documents(module_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_department_docs_uploaded_by ON department_documents(uploaded_by_user_id);
CREATE INDEX IF NOT EXISTS idx_department_docs_created_at ON department_documents(created_at DESC);

-- ==============================================================================
-- Seed Real Root Administrator & Initial System Audit Event
-- National ID: 29001010100000 (14 Digits)
-- Role: SUPER_ADMIN (C-Suite Governance), Level: 4
-- ==============================================================================
INSERT OR REPLACE INTO users (
    id,
    national_id,
    full_name,
    username,
    email,
    password_hash,
    role_id,
    department,
    clearance_level,
    is_active,
    created_at
) VALUES (
    'usr_root_csuite_01',
    '29001010100000',
    'م. أحمد مصطفى',
    'admin',
    'admin@hrsup.com',
    '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', -- SHA-256 for admin123
    'SUPER_ADMIN',
    'الإدارة العليا والاستراتيجية',
    4,
    1,
    CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO audit_logs (
    id,
    user_id,
    user_name,
    category,
    action,
    details,
    created_at
) VALUES (
    'log_init_root_001',
    'usr_root_csuite_01',
    'م. أحمد مصطفى',
    'إعدادات النظام',
    'تهيئة النظام والحساب الإداري الجذري',
    'تثبيت الحساب الإداري الجذري وقاعدة بيانات D1 المركزية وتفعيل صلاحيات الإدارة العليا',
    CURRENT_TIMESTAMP
);
