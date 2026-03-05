<?php
/**
 * Migration: Create ATS Interview & Evaluation Tables - Part 2
 * Tables: interview_templates, interview_template_items, interviews, interview_evaluations
 */

// Force local environment for CLI execution
$isLocal = true;
if (file_exists(__DIR__ . '/../../config/config.local.php')) {
    $config = require __DIR__ . '/../../config/config.local.php';
    if (!defined('DB_HOST')) define('DB_HOST', $config['DB_HOST']);
    if (!defined('DB_NAME')) define('DB_NAME', $config['DB_NAME']);
    if (!defined('DB_USER')) define('DB_USER', $config['DB_USER']);
    if (!defined('DB_PASS')) define('DB_PASS', $config['DB_PASS']);
    if (!defined('DB_CHARSET')) define('DB_CHARSET', $config['DB_CHARSET']);
}

require_once __DIR__ . '/../../config/database.php';

try {
    $db = getDB();

    // =========================================================================
    // 1. interview_templates - قوالب تقييم المقابلات
    // =========================================================================
    echo "Creating table interview_templates...\n";
    $db->exec("CREATE TABLE IF NOT EXISTS interview_templates (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL COMMENT 'اسم القالب',
        description TEXT COMMENT 'وصف القالب',
        total_score DECIMAL(6,2) DEFAULT 0 COMMENT 'إجمالي الدرجات - يُحسب من مجموع البنود',
        status ENUM('active','inactive') DEFAULT 'active' COMMENT 'الحالة',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
    echo "✓ Table interview_templates created successfully.\n";

    // =========================================================================
    // 2. interview_template_items - بنود/معايير التقييم داخل القالب
    // =========================================================================
    echo "Creating table interview_template_items...\n";
    $db->exec("CREATE TABLE IF NOT EXISTS interview_template_items (
        id VARCHAR(50) PRIMARY KEY,
        template_id VARCHAR(50) NOT NULL COMMENT 'رقم القالب',
        criteria_name VARCHAR(255) NOT NULL COMMENT 'اسم البند/المعيار',
        max_score DECIMAL(5,2) NOT NULL DEFAULT 10 COMMENT 'الدرجة القصوى لهذا البند',
        sort_order INT DEFAULT 0 COMMENT 'ترتيب العرض',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_template (template_id),
        CONSTRAINT fk_item_template FOREIGN KEY (template_id) REFERENCES interview_templates(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
    echo "✓ Table interview_template_items created successfully.\n";

    // =========================================================================
    // 3. interviews - المقابلات الفعلية
    // =========================================================================
    echo "Creating table interviews...\n";
    $db->exec("CREATE TABLE IF NOT EXISTS interviews (
        id VARCHAR(50) PRIMARY KEY,
        job_application_id VARCHAR(50) NOT NULL COMMENT 'رقم طلب التوظيف',
        template_id VARCHAR(50) NOT NULL COMMENT 'القالب المستخدم',
        interviewer_id VARCHAR(50) DEFAULT NULL COMMENT 'القائم بالمقابلة (employee)',
        interview_date DATE DEFAULT NULL COMMENT 'تاريخ المقابلة',
        total_score DECIMAL(6,2) DEFAULT 0 COMMENT 'إجمالي الدرجة - يُحسب آلياً',
        notes TEXT COMMENT 'ملاحظات المقابلة',
        status ENUM('scheduled','completed','cancelled') DEFAULT 'scheduled' COMMENT 'حالة المقابلة',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_application (job_application_id),
        INDEX idx_template (template_id),
        INDEX idx_interviewer (interviewer_id),
        INDEX idx_date (interview_date),
        CONSTRAINT fk_interview_application FOREIGN KEY (job_application_id) REFERENCES job_applications(id) ON DELETE CASCADE,
        CONSTRAINT fk_interview_template FOREIGN KEY (template_id) REFERENCES interview_templates(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
    echo "✓ Table interviews created successfully.\n";

    // =========================================================================
    // 4. interview_evaluations - تفاصيل تقييم بنود المقابلة
    // =========================================================================
    echo "Creating table interview_evaluations...\n";
    $db->exec("CREATE TABLE IF NOT EXISTS interview_evaluations (
        id VARCHAR(50) PRIMARY KEY,
        interview_id VARCHAR(50) NOT NULL COMMENT 'رقم المقابلة',
        template_item_id VARCHAR(50) NOT NULL COMMENT 'رقم بند التقييم',
        given_score DECIMAL(5,2) DEFAULT 0 COMMENT 'الدرجة الممنوحة',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_interview (interview_id),
        INDEX idx_item (template_item_id),
        CONSTRAINT fk_eval_interview FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
        CONSTRAINT fk_eval_template_item FOREIGN KEY (template_item_id) REFERENCES interview_template_items(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
    echo "✓ Table interview_evaluations created successfully.\n";

    echo "\n========================================\n";
    echo "ATS Migration Part 2 completed successfully!\n";
    echo "========================================\n";

} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}
