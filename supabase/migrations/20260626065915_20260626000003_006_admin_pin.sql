/*
# Migration 006: Add admin PIN to site_settings
*/

INSERT INTO site_settings (key, value, type, category, description) VALUES
('admin_pin', '123456', 'text', 'security', 'Admin dashboard PIN for authentication')
ON CONFLICT (key) DO NOTHING;
