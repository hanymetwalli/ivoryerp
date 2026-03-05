<?php
/**
 * Migration: Create ATS (Applicant Tracking System) Tables - Part 1
 * Tables: job_postings, job_applications
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
    // 1. job_postings - الوظائف المتاحة
    // =========================================================================
    echo "Creating table job_postings...\n";
    $db->exec("CREATE TABLE IF NOT EXISTS job_postings (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL COMMENT 'المسمى الوظيفي',
        department_id VARCHAR(50) DEFAULT NULL COMMENT 'القسم',
        description TEXT COMMENT 'الوصف الوظيفي',
        requirements TEXT COMMENT 'المتطلبات',
        employment_type ENUM('full-time','part-time','contract','remote') DEFAULT 'full-time' COMMENT 'نوع العمل',
        status ENUM('draft','open','closed') DEFAULT 'draft' COMMENT 'الحالة',
        deadline DATE DEFAULT NULL COMMENT 'تاريخ انتهاء التقديم',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_department (department_id),
        INDEX idx_status (status),
        INDEX idx_deadline (deadline)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
    echo "✓ Table job_postings created successfully.\n";

    // =========================================================================
    // 2. job_applications - طلبات التوظيف (المرشحون)
    // =========================================================================
    echo "Creating table job_applications...\n";
    $db->exec("CREATE TABLE IF NOT EXISTS job_applications (
        id VARCHAR(50) PRIMARY KEY,
        job_posting_id VARCHAR(50) NOT NULL COMMENT 'الوظيفة المتقدم لها',
        full_name VARCHAR(255) NOT NULL COMMENT 'الاسم الرباعي',
        date_of_birth DATE DEFAULT NULL COMMENT 'تاريخ الميلاد',
        gender ENUM('male','female') DEFAULT NULL COMMENT 'النوع',
        marital_status ENUM('single','married','divorced','widowed') DEFAULT NULL COMMENT 'الحالة الاجتماعية',
        phones JSON COMMENT 'أرقام الهواتف',
        email VARCHAR(255) DEFAULT NULL COMMENT 'البريد الإلكتروني',
        address TEXT COMMENT 'العنوان',
        current_job VARCHAR(255) DEFAULT NULL COMMENT 'الوظيفة الحالية',
        qualifications JSON COMMENT 'المؤهلات والخبرات',
        bio TEXT COMMENT 'نبذة شخصية',
        cv_path VARCHAR(500) DEFAULT NULL COMMENT 'مسار ملف السيرة الذاتية',
        interview_score DECIMAL(5,2) DEFAULT NULL COMMENT 'درجة المقابلة - تُحسب من بنود التقييم',
        status ENUM('new','screening','interview','offered','hired','rejected') DEFAULT 'new' COMMENT 'حالة الطلب',
        notes TEXT COMMENT 'ملاحظات',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_job_posting (job_posting_id),
        INDEX idx_status (status),
        INDEX idx_interview_score (interview_score),
        INDEX idx_full_name (full_name),
        CONSTRAINT fk_application_job_posting FOREIGN KEY (job_posting_id) REFERENCES job_postings(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
    echo "✓ Table job_applications created successfully.\n";

    echo "\n========================================\n";
    echo "ATS Migration Part 1 completed successfully!\n";
    echo "========================================\n";

} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}
