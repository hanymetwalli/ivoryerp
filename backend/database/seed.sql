-- Seed initial admin user
-- Email: admin@ivory.com
-- Password: admin
INSERT INTO users (id, email, password, full_name, status) VALUES
('admin-uuid-001', 'admin@ivory.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'مدير النظام', 'active');

-- Assign role
INSERT INTO user_roles (id, user_id, role_id, status) VALUES
(UUID(), 'admin-uuid-001', (SELECT id FROM roles WHERE name = 'super_admin' LIMIT 1), 'active');
