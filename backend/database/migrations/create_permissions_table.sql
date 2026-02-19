-- إضافة إعداد الحد الأقصى لساعات الاستئذان شهرياً (الافتراضي 4 ساعات = 240 دقيقة)
INSERT INTO system_settings (setting_key, setting_value, description, setting_type)
SELECT 'monthly_permission_limit_minutes', '240', 'Maximum permission duration per month in minutes', 'number'
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE setting_key = 'monthly_permission_limit_minutes');

-- إنشاء جدول طلبات الاستئذان
CREATE TABLE IF NOT EXISTS permission_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    request_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INT NOT NULL COMMENT 'Calculated duration in minutes',
    reason TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    current_stage_role_id VARCHAR(36) DEFAULT NULL COMMENT 'Role ID currently required to approve',
    rejection_reason TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (current_stage_role_id) REFERENCES roles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- إضافة صلاحيات الاستئذان للأدوار (اختياري، يعتمد على جدول الصلاحيات لديك)
-- سنفترض وجود جدول permission_role أو ما شابه، لكن سأكتفي بالجدول الأساسي الآن
