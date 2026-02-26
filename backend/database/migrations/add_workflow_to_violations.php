<?php
/**
 * Migration: Add workflow_id to employee_violations
 */

require_once __DIR__ . '/../../config/database.php';

function runMigration() {
    $db = getDB();
    
    try {
        echo "Adding workflow_id column to employee_violations...\n";
        
        $db->exec("ALTER TABLE `employee_violations` ADD COLUMN `workflow_id` VARCHAR(36) DEFAULT NULL AFTER `id`;");
        
        echo "Migration completed successfully.\n";
        
    } catch (Exception $e) {
        echo "Migration skipped or failed: " . $e->getMessage() . "\n";
    }
}

runMigration();
