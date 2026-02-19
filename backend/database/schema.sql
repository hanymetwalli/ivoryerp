-- =====================================================
-- Ivory HR System - Database Schema
-- نظام إدارة الموارد البشرية - هيكل قاعدة البيانات
-- =====================================================

CREATE DATABASE IF NOT EXISTS ivory_hr_2026 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ivory_hr_2026;

-- =====================================================
-- جداول المستخدمين والصلاحيات
-- =====================================================

CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar VARCHAR(500),
    status ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions JSON,
    approval_level INT DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    role_id VARCHAR(36) NOT NULL,
    employee_id VARCHAR(36),
    assigned_by VARCHAR(36),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- =====================================================
-- الهيكل التنظيمي
-- =====================================================

CREATE TABLE departments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    parent_department_id VARCHAR(36),
    manager_id VARCHAR(36),
    description TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_department_id) REFERENCES departments(id) ON DELETE SET NULL
);

CREATE TABLE positions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    department VARCHAR(36),
    level VARCHAR(100),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE work_locations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    address TEXT,
    use_coordinates BOOLEAN DEFAULT TRUE,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    radius_meters INT DEFAULT 100,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE work_schedules (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    work_location_id VARCHAR(36),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    working_days JSON,
    grace_period_minutes INT DEFAULT 15,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (work_location_id) REFERENCES work_locations(id) ON DELETE SET NULL
);

-- =====================================================
-- الجداول المرجعية (Lookup Tables)
-- =====================================================

CREATE TABLE nationalities (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bank_names (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    swift_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contract_types (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE leave_types (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20),
    default_balance INT DEFAULT 0,
    min_days INT DEFAULT 1,
    is_paid BOOLEAN DEFAULT TRUE,
    requires_document BOOLEAN DEFAULT FALSE,
    max_consecutive_days INT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE allowance_types (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20),
    description TEXT,
    is_taxable BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE deduction_types (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attendance_statuses (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20),
    color VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE training_statuses (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- الموظفين
-- =====================================================

CREATE TABLE employees (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    employee_number VARCHAR(50) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    id_number VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(255) NOT NULL,
    position VARCHAR(36),
    department VARCHAR(36),
    work_location_id VARCHAR(36),
    hire_date DATE,
    status ENUM('active', 'inactive', 'terminated') DEFAULT 'active',
    profile_image VARCHAR(500),
    documents JSON,
    nationality VARCHAR(100),
    gender ENUM('male', 'female'),
    birth_date DATE,
    bank_name VARCHAR(255),
    bank_account VARCHAR(50),
    iban VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (work_location_id) REFERENCES work_locations(id) ON DELETE SET NULL
);

-- =====================================================
-- العقود
-- =====================================================

CREATE TABLE contracts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    request_number VARCHAR(50),
    employee_id VARCHAR(36) NOT NULL,
    contract_number VARCHAR(50),
    contract_type VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    gross_salary DECIMAL(12, 2) NOT NULL,
    currency ENUM('SAR', 'EGP', 'USD') DEFAULT 'SAR',
    basic_salary DECIMAL(12, 2),
    housing_allowance DECIMAL(12, 2) DEFAULT 0,
    transport_allowance DECIMAL(12, 2) DEFAULT 0,
    other_allowances DECIMAL(12, 2) DEFAULT 0,
    status ENUM('pending', 'approved', 'active', 'expired', 'terminated') DEFAULT 'pending',
    current_approval_level VARCHAR(50),
    approval_history JSON,
    requires_finance_approval BOOLEAN DEFAULT TRUE,
    document_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- =====================================================
-- الحضور والانصراف
-- =====================================================

CREATE TABLE attendance (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    employee_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    check_in_time TIME,
    check_in_location JSON,
    check_out_time TIME,
    check_out_location JSON,
    status VARCHAR(50),
    notes TEXT,
    is_late BOOLEAN DEFAULT FALSE,
    late_minutes INT DEFAULT 0,
    working_hours DECIMAL(5, 2) DEFAULT 0,
    overtime_hours DECIMAL(5, 2) DEFAULT 0,
    source ENUM('manual', 'fingerprint_device', 'mobile_app') DEFAULT 'manual',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (employee_id, date)
);

-- =====================================================
-- الإجازات
-- =====================================================

CREATE TABLE leave_requests (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    request_number VARCHAR(50),
    employee_id VARCHAR(36) NOT NULL,
    leave_type_id VARCHAR(36) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INT,
    reason TEXT,
    document_url VARCHAR(500),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    current_approval_level VARCHAR(50),
    approval_history JSON,
    requires_finance_approval BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE RESTRICT
);

CREATE TABLE employee_leave_balances (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    employee_id VARCHAR(36) NOT NULL,
    leave_type_id VARCHAR(36) NOT NULL,
    year INT NOT NULL,
    total_balance INT DEFAULT 0,
    used_balance INT DEFAULT 0,
    remaining_balance INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
    UNIQUE KEY unique_balance (employee_id, leave_type_id, year)
);

-- =====================================================
-- الساعات الإضافية
-- =====================================================

CREATE TABLE overtime (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    request_number VARCHAR(50),
    employee_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    hours DECIMAL(5, 2) NOT NULL,
    hourly_rate DECIMAL(10, 2),
    overtime_rate DECIMAL(5, 2) DEFAULT 1.5,
    total_amount DECIMAL(12, 2),
    notes TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    current_approval_level VARCHAR(50),
    approval_history JSON,
    requires_finance_approval BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- =====================================================
-- العلاوات
-- =====================================================

CREATE TABLE allowances (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    employee_id VARCHAR(36) NOT NULL,
    type VARCHAR(100) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency ENUM('SAR', 'EGP', 'USD') DEFAULT 'SAR',
    start_date DATE NOT NULL,
    end_date DATE,
    is_recurring BOOLEAN DEFAULT TRUE,
    status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
    reason TEXT,
    approved_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- =====================================================
-- الخصومات
-- =====================================================

CREATE TABLE deductions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    employee_id VARCHAR(36) NOT NULL,
    type VARCHAR(100) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency ENUM('SAR', 'EGP', 'USD') DEFAULT 'SAR',
    date DATE,
    month INT,
    year INT,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- =====================================================
-- المكافآت
-- =====================================================

CREATE TABLE bonuses (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    request_number VARCHAR(50),
    employee_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency ENUM('SAR', 'EGP', 'USD') DEFAULT 'SAR',
    date DATE,
    month INT,
    year INT,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    current_approval_level VARCHAR(50),
    approval_history JSON,
    requires_finance_approval BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- =====================================================
-- الرواتب
-- =====================================================

CREATE TABLE payroll (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    payroll_number VARCHAR(50),
    employee_id VARCHAR(36) NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    payroll_date DATE,
    basic_salary DECIMAL(12, 2) DEFAULT 0,
    housing_allowance DECIMAL(12, 2) DEFAULT 0,
    transport_allowance DECIMAL(12, 2) DEFAULT 0,
    other_allowances DECIMAL(12, 2) DEFAULT 0,
    additional_allowances DECIMAL(12, 2) DEFAULT 0,
    bonuses_amount DECIMAL(12, 2) DEFAULT 0,
    overtime_amount DECIMAL(12, 2) DEFAULT 0,
    gross_salary DECIMAL(12, 2) DEFAULT 0,
    insurance_deduction DECIMAL(12, 2) DEFAULT 0,
    late_deduction DECIMAL(12, 2) DEFAULT 0,
    absence_deduction DECIMAL(12, 2) DEFAULT 0,
    other_deductions DECIMAL(12, 2) DEFAULT 0,
    total_deductions DECIMAL(12, 2) DEFAULT 0,
    net_salary DECIMAL(12, 2) DEFAULT 0,
    currency ENUM('SAR', 'EGP', 'USD') DEFAULT 'SAR',
    status ENUM('draft', 'pending_review', 'approved', 'paid') DEFAULT 'draft',
    issue_date DATE,
    working_days INT DEFAULT 0,
    absent_days INT DEFAULT 0,
    late_minutes INT DEFAULT 0,
    overtime_hours DECIMAL(5, 2) DEFAULT 0,
    allowances_breakdown JSON,
    deductions_breakdown JSON,
    bonuses_breakdown JSON,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE KEY unique_payroll (employee_id, month, year)
);

-- =====================================================
-- التأمينات
-- =====================================================

CREATE TABLE insurance_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    location_type VARCHAR(100),
    year INT NOT NULL,
    employee_percentage DECIMAL(5, 2) DEFAULT 0,
    employer_percentage DECIMAL(5, 2) DEFAULT 0,
    max_insurable_salary DECIMAL(12, 2),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- التدريب
-- =====================================================

CREATE TABLE trainings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trainer VARCHAR(255),
    start_date DATE,
    end_date DATE,
    location VARCHAR(255),
    max_participants INT,
    status ENUM('planned', 'ongoing', 'completed', 'cancelled') DEFAULT 'planned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE employee_trainings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    employee_id VARCHAR(36) NOT NULL,
    training_id VARCHAR(36) NOT NULL,
    status ENUM('registered', 'attended', 'completed', 'cancelled') DEFAULT 'registered',
    registration_date DATE,
    completion_date DATE,
    score DECIMAL(5, 2),
    certificate_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (training_id) REFERENCES trainings(id) ON DELETE CASCADE
);

-- =====================================================
-- تقييم الأداء
-- =====================================================

CREATE TABLE evaluation_templates (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    kpis JSON,
    total_weight INT DEFAULT 100,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE template_kpis (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    template_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    weight INT DEFAULT 0,
    max_score INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES evaluation_templates(id) ON DELETE CASCADE
);

CREATE TABLE performance_evaluations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    employee_id VARCHAR(36) NOT NULL,
    evaluator_id VARCHAR(36),
    template_id VARCHAR(36),
    period_start DATE,
    period_end DATE,
    overall_score DECIMAL(5, 2),
    overall_rating VARCHAR(50),
    kpi_scores JSON,
    strengths TEXT,
    areas_for_improvement TEXT,
    goals TEXT,
    status ENUM('draft', 'submitted', 'reviewed', 'approved') DEFAULT 'draft',
    submitted_at TIMESTAMP,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES evaluation_templates(id) ON DELETE SET NULL
);

CREATE TABLE kpi_results (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    evaluation_id VARCHAR(36) NOT NULL,
    kpi_id VARCHAR(36),
    kpi_name VARCHAR(255),
    score DECIMAL(5, 2),
    weight INT,
    weighted_score DECIMAL(5, 2),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evaluation_id) REFERENCES performance_evaluations(id) ON DELETE CASCADE
);

CREATE TABLE competencies (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    level_definitions JSON,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE competency_ratings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    employee_id VARCHAR(36) NOT NULL,
    competency_id VARCHAR(36) NOT NULL,
    rating INT,
    evaluator_id VARCHAR(36),
    evaluation_date DATE,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (competency_id) REFERENCES competencies(id) ON DELETE CASCADE
);

-- =====================================================
-- الاستقالات
-- =====================================================

CREATE TABLE resignations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    request_number VARCHAR(50),
    employee_id VARCHAR(36) NOT NULL,
    resignation_date DATE NOT NULL,
    last_working_day DATE,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected', 'withdrawn') DEFAULT 'pending',
    current_approval_level VARCHAR(50),
    approval_history JSON,
    exit_interview_notes TEXT,
    clearance_status JSON,
    final_settlement DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- =====================================================
-- الوصف الوظيفي
-- =====================================================

CREATE TABLE job_descriptions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    department VARCHAR(36),
    position VARCHAR(36),
    summary TEXT,
    responsibilities JSON,
    requirements JSON,
    qualifications JSON,
    skills JSON,
    experience_years INT,
    education_level VARCHAR(100),
    salary_range_min DECIMAL(12, 2),
    salary_range_max DECIMAL(12, 2),
    status ENUM('draft', 'active', 'archived') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- المهام
-- =====================================================

CREATE TABLE business_tasks (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to VARCHAR(36),
    assigned_by VARCHAR(36),
    due_date DATE,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE SET NULL
);

-- =====================================================
-- سجل التدقيق
-- =====================================================

CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(36),
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- سجل التطوير
-- =====================================================

CREATE TABLE development_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('feature', 'bugfix', 'improvement', 'other') DEFAULT 'feature',
    status ENUM('planned', 'in_progress', 'completed', 'cancelled') DEFAULT 'planned',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    assigned_to VARCHAR(255),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- إعدادات النظام
-- =====================================================

CREATE TABLE system_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- الفهارس للأداء
-- =====================================================

CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_employee_date ON attendance(employee_id, date);
CREATE INDEX idx_contracts_employee ON contracts(employee_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_payroll_employee_period ON payroll(employee_id, year, month);
CREATE INDEX idx_overtime_employee ON overtime(employee_id);
CREATE INDEX idx_bonuses_employee ON bonuses(employee_id);
CREATE INDEX idx_deductions_employee ON deductions(employee_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);

-- =====================================================
-- بيانات أولية
-- =====================================================

-- إدخال الصلاحيات الافتراضية
INSERT INTO roles (id, name, description, permissions, approval_level) VALUES
(UUID(), 'super_admin', 'مدير النظام', '{"all": true}', 99),
(UUID(), 'hr_manager', 'مدير الموارد البشرية', '{"employees": true, "attendance": true, "leaves": true, "payroll": true}', 3),
(UUID(), 'hr_staff', 'موظف موارد بشرية', '{"employees": ["read", "create"], "attendance": true, "leaves": ["read"]}', 1),
(UUID(), 'finance_manager', 'مدير الحسابات', '{"payroll": true, "bonuses": true, "deductions": true}', 3),
(UUID(), 'department_manager', 'مدير قسم', '{"employees": ["read"], "attendance": ["read"], "leaves": ["read", "approve"]}', 2),
(UUID(), 'employee', 'موظف', '{"self": true}', 0);

-- إدخال أنواع الإجازات
INSERT INTO leave_types (id, name, code, default_balance, min_days, is_paid) VALUES
(UUID(), 'إجازة سنوية', 'ANNUAL', 21, 1, TRUE),
(UUID(), 'إجازة مرضية', 'SICK', 30, 1, TRUE),
(UUID(), 'إجازة طارئة', 'EMERGENCY', 5, 1, TRUE),
(UUID(), 'إجازة بدون راتب', 'UNPAID', 30, 1, FALSE),
(UUID(), 'إجازة أمومة', 'MATERNITY', 70, 70, TRUE),
(UUID(), 'إجازة أبوة', 'PATERNITY', 3, 1, TRUE);

-- إدخال حالات الحضور
INSERT INTO attendance_statuses (id, name, code, color) VALUES
(UUID(), 'حاضر', 'present', 'green'),
(UUID(), 'غائب', 'absent', 'red'),
(UUID(), 'إجازة', 'leave', 'blue'),
(UUID(), 'متأخر', 'late', 'orange'),
(UUID(), 'مهمة خارجية', 'business_trip', 'purple');
