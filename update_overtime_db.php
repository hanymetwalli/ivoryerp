<?php
require_once __DIR__ . '/backend/config/database.php';

try {
    $db = getDB();
    
    // Check if columns exist
    $stmt = $db->query("SHOW COLUMNS FROM `overtime` LIKE 'report_status'");
    if ($stmt->rowCount() == 0) {
        $db->exec("ALTER TABLE `overtime` ADD COLUMN `report_status` ENUM('none', 'pending', 'submitted', 'approved', 'rejected') NOT NULL DEFAULT 'none' AFTER `status`");
        echo "Column report_status added successfully.\n";
    } else {
        echo "Column report_status already exists.\n";
    }
    
    $stmt = $db->query("SHOW COLUMNS FROM `overtime` LIKE 'report_content'");
    if ($stmt->rowCount() == 0) {
        $db->exec("ALTER TABLE `overtime` ADD COLUMN `report_content` TEXT NULL AFTER `report_status`");
        echo "Column report_content added successfully.\n";
    } else {
        echo "Column report_content already exists.\n";
    }
    
} catch (Exception $e) {
    die("Error: " . $e->getMessage());
}
