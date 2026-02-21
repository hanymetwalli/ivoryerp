-- =====================================================
-- Polymorphic Workflow Engine Tables
-- جداول محرك سير العمل والاعتمادات الديناميكي
-- =====================================================

-- 1. Workflow Blueprints (قوالب سير العمل)
CREATE TABLE IF NOT EXISTS workflow_blueprints (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    request_type VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Workflow Blueprint Steps (خطوات القالب)
CREATE TABLE IF NOT EXISTS workflow_blueprint_steps (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    blueprint_id VARCHAR(36) NOT NULL,
    step_order INT NOT NULL,
    role_id VARCHAR(36) NULL,
    is_direct_manager BOOLEAN DEFAULT FALSE,
    show_approver_name BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (blueprint_id) REFERENCES workflow_blueprints(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);

-- 3. Approval Requests (طلبات الاعتماد الجارية)
CREATE TABLE IF NOT EXISTS approval_requests (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    model_type VARCHAR(100) NOT NULL,
    model_id VARCHAR(36) NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'returned') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_model (model_type, model_id)
);

-- 4. Approval Steps (خطوات الاعتماد الفعلية للطلب)
CREATE TABLE IF NOT EXISTS approval_steps (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    approval_request_id VARCHAR(36) NOT NULL,
    approver_user_id VARCHAR(36) NULL,
    role_id VARCHAR(36) NULL,
    step_order INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'returned') DEFAULT 'pending',
    comments TEXT,
    is_name_visible BOOLEAN DEFAULT TRUE,
    action_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (approval_request_id) REFERENCES approval_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (approver_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);
