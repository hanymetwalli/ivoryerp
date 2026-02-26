<?php
/**
 * Migration: Create Payroll Batches Table and link Payroll records
 */

require_once __DIR__ . '/../../config/database.php';

function runMigration() {
    $db = getDB();
    
    try {
        $db->beginTransaction();
        
        echo "Creating payroll_batches table...\n";
        $db->exec("CREATE TABLE IF NOT EXISTS `payroll_batches` (
            `id` CHAR(36) PRIMARY KEY,
            `month` INT NOT NULL,
            `year` INT NOT NULL,
            `total_amount` DECIMAL(15,2) DEFAULT 0.00,
            `status` ENUM('draft', 'pending_approval', 'approved', 'paid') DEFAULT 'draft',
            `workflow_id` CHAR(36) NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        echo "Adding batch_id to payroll table...\n";
        // Check if column exists first
        $stmt = $db->query("SHOW COLUMNS FROM `payroll` LIKE 'batch_id'");
        if (!$stmt->fetch()) {
            $db->exec("ALTER TABLE `payroll` ADD COLUMN `batch_id` CHAR(36) NULL AFTER `id`;");
            $db->exec("ALTER TABLE `payroll` ADD CONSTRAINT `fk_payroll_batch` FOREIGN KEY (`batch_id`) REFERENCES `payroll_batches`(`id`) ON DELETE CASCADE;");
        }

        $db->commit();
        echo "Migration completed successfully.\n";
    } catch (Exception $e) {
        $db->rollBack();
        echo "Migration failed: " . $e->getMessage() . "\n";
        exit(1);
    }
}

runMigration();
