-- ==============================================================================
-- ECO ERP - Cloudflare D1 System Settings & Dynamic Network Configuration
-- Migration: 0002_system_settings.sql
-- Description: Dynamic SQL Server, Tailscale, PortProxy & Gateway URL persistence
-- ==============================================================================

CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);

-- Seed Initial Default Network Configuration
INSERT OR IGNORE INTO system_settings (key, value) VALUES
    ('sql_server_host', '100.68.121.85'),
    ('sql_server_port', '1433'),
    ('local_portproxy_target', '192.168.1.50:49748'),
    ('gateway_url', 'https://datatest.hrsup.com');
