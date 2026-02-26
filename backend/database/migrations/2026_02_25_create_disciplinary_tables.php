<?php
/**
 * Migration: Create Disciplinary Tables
 */

require_once __DIR__ . '/../../config/database.php';

function runMigration() {
    $db = getDB();
    
    try {
        echo "Starting Disciplinary Tables Migration...\n";
        
        // Drop existing tables for clean restart
        $db->exec("SET FOREIGN_KEY_CHECKS = 0;");
        $db->exec("DROP TABLE IF EXISTS `employee_violations`;");
        $db->exec("DROP TABLE IF EXISTS `penalty_policies`;");
        $db->exec("DROP TABLE IF EXISTS `violation_types`;");
        $db->exec("SET FOREIGN_KEY_CHECKS = 1;");
        echo "Dropped existing tables.\n";

        // 1. violation_types
        $db->exec("CREATE TABLE IF NOT EXISTS `violation_types` (
            `id` VARCHAR(36) COLLATE utf8mb4_unicode_ci PRIMARY KEY,
            `name` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
            `description` TEXT COLLATE utf8mb4_unicode_ci,
            `letter_template` TEXT COLLATE utf8mb4_unicode_ci,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
        echo "Created violation_types table.\n";
        
        // 2. penalty_policies
        $db->exec("CREATE TABLE IF NOT EXISTS `penalty_policies` (
            `id` VARCHAR(36) COLLATE utf8mb4_unicode_ci PRIMARY KEY,
            `violation_type_id` VARCHAR(36) COLLATE utf8mb4_unicode_ci NOT NULL,
            `occurrence_number` INT NOT NULL,
            `action_type` ENUM('warning', 'deduction_days', 'deduction_amount') NOT NULL,
            `penalty_value` DECIMAL(10, 2) NOT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (`violation_type_id`) REFERENCES `violation_types`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
        echo "Created penalty_policies table.\n";
        
        // 3. employee_violations
        $db->exec("CREATE TABLE IF NOT EXISTS `employee_violations` (
            `id` VARCHAR(36) COLLATE utf8mb4_unicode_ci PRIMARY KEY,
            `employee_id` VARCHAR(36) COLLATE utf8mb4_unicode_ci NOT NULL,
            `violation_type_id` VARCHAR(36) COLLATE utf8mb4_unicode_ci NOT NULL,
            `incident_date` DATE NOT NULL,
            `occurrence_number` INT NOT NULL,
            `applied_action` VARCHAR(50) COLLATE utf8mb4_unicode_ci,
            `applied_value` DECIMAL(10, 2),
            `status` ENUM('pending', 'applied', 'forgiven') DEFAULT 'pending',
            `letter_content` TEXT COLLATE utf8mb4_unicode_ci,
            `notes` TEXT COLLATE utf8mb4_unicode_ci,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE,
            FOREIGN KEY (`violation_type_id`) REFERENCES `violation_types`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
        echo "Created employee_violations table.\n";
        
        echo "Migration completed successfully.\n";
        
    } catch (Exception $e) {
        echo "Migration failed: " . $e->getMessage() . "\n";
    }
}

runMigration();
