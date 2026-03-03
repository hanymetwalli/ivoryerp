<?php
/**
 * Migration: Add report_attachment column to overtime table
 */
require_once __DIR__ . '/config/database.php';

try {
    $db = getDB();
    
    // Check if column already exists
    $stmt = $db->prepare("SHOW COLUMNS FROM overtime LIKE 'report_attachment'");
    $stmt->execute();
    
    if ($stmt->fetch()) {
        echo "Column 'report_attachment' already exists.\n";
    } else {
        $db->exec("ALTER TABLE overtime ADD COLUMN report_attachment VARCHAR(255) DEFAULT NULL AFTER report_status");
        echo "SUCCESS: Column 'report_attachment' added to overtime table.\n";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
