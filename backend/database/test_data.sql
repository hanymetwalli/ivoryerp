-- Seed initial data for testing
-- قاعدة بيانات تجريبية لنظام Ivory HR

USE ivory_hr_2026;

-- 1. إدخال مستخدمين (كلمة المرور لجميع المستخدمين هي: password)
-- الهاش هو: $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
INSERT INTO users (id, email, password, full_name, status) VALUES
('u-admin-01', 'admin@ivory.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'هاني متولي (مدير)', 'active'),
('u-emp-01', 'ahmed@ivory.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'أحمد محمد', 'active'),
('u-emp-02', 'sara@ivory.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'سارة علي', 'active');

-- 2. إدخال الأقسام
INSERT INTO departments (id, name, code, status) VALUES
('d-it', 'تقنية المعلومات', 'IT', 'active'),
('d-hr', 'الموارد البشرية', 'HR', 'active'),
('d-fin', 'المالية', 'FIN', 'active');

-- 3. إدخال المناصب
INSERT INTO positions (id, name, code, department, level, status) VALUES
('p-mgr', 'مدير قسم', 'MGR', 'd-it', 'Management', 'active'),
('p-dev', 'مطور برمجيات', 'DEV', 'd-it', 'Senior', 'active'),
('p-spec', 'أخصائي رواتب', 'SPEC', 'd-hr', 'Junior', 'active');

-- 4. إدخال مواقع العمل
INSERT INTO work_locations (id, name, address, latitude, longitude, status) VALUES
('loc-main', 'المقر الرئيسي - القاهرة', 'شارع التسعين، التجمع الخامس', 30.0275, 31.4914, 'active'),
('loc-remote', 'عن بعد', 'Remote Work', 0, 0, 'active');

-- 5. إدخال الموظفين
INSERT INTO employees (id, employee_number, full_name, email, department, position, work_location_id, status, hire_date) VALUES
('e-001', 'EMP001', 'هاني متولي', 'admin@ivory.com', 'd-it', 'p-mgr', 'loc-main', 'active', '2020-01-01'),
('e-002', 'EMP002', 'أحمد محمد', 'ahmed@ivory.com', 'd-it', 'p-dev', 'loc-main', 'active', '2022-03-15'),
('e-003', 'EMP003', 'سارة علي', 'sara@ivory.com', 'd-hr', 'p-spec', 'loc-main', 'active', '2023-06-01');

-- 6. ربط المستخدمين بالأدوار والموظفين
-- نستخدم الـ roles اللي اتعملت في schema.sql
INSERT INTO user_roles (id, user_id, role_id, employee_id, status) VALUES
(UUID(), 'u-admin-01', (SELECT id FROM roles WHERE name = 'super_admin' LIMIT 1), 'e-001', 'active'),
(UUID(), 'u-emp-01', (SELECT id FROM roles WHERE name = 'employee' LIMIT 1), 'e-002', 'active'),
(UUID(), 'u-emp-02', (SELECT id FROM roles WHERE name = 'employee' LIMIT 1), 'e-003', 'active');

-- 7. إدخال عقود تجريبية
INSERT INTO contracts (id, employee_id, contract_number, start_date, gross_salary, basic_salary, housing_allowance, transport_allowance, status, currency) VALUES
('c-001', 'e-001', 'CON-2020-001', '2020-01-01', 15000.00, 10000.00, 3000.00, 2000.00, 'active', 'SAR'),
('c-002', 'e-002', 'CON-2022-001', '2022-03-15', 8000.00, 6000.00, 1000.00, 1000.00, 'active', 'SAR'),
('c-003', 'e-003', 'CON-2023-001', '2023-06-01', 7000.00, 5000.00, 1000.00, 1000.00, 'active', 'SAR');

-- 8. إدخال حضور تجريبي لليوم
INSERT INTO attendance (id, employee_id, date, check_in_time, status) VALUES
(UUID(), 'e-001', CURDATE(), '08:00:00', 'present'),
(UUID(), 'e-002', CURDATE(), '08:15:00', 'present'),
(UUID(), 'e-003', CURDATE(), '07:55:00', 'present');

-- 9. إدخال أنواع البدلات والخصومات
INSERT INTO allowance_types (id, name, code) VALUES (UUID(), 'بدل تميز', 'EXC'), (UUID(), 'بدل سكن إضافي', 'HOU');
INSERT INTO deduction_types (id, name, code) VALUES (UUID(), 'خصم تأخير', 'LATE'), (UUID(), 'سلفة', 'LOAN');

-- 10. إدخال إعدادات التأمينات
INSERT INTO insurance_settings (id, year, employee_percentage, status) VALUES (UUID(), 2026, 10.00, 'active');
