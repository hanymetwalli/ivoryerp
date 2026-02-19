<?php
require_once __DIR__ . '/backend/config/database.php';

try {
    $db = getDB();
} catch (Exception $e) {
    die("Database connection failed: " . $e->getMessage());
}

$tables = [
    'bonuses' => [
        'status' => "VARCHAR(50) DEFAULT 'pending'",
        'approval_chain' => "JSON DEFAULT NULL",
        'current_level_idx' => "INT DEFAULT 0",
        'current_status_desc' => "VARCHAR(255) DEFAULT NULL",
        'rejection_reason' => "TEXT DEFAULT NULL"
    ],
    'overtime' => [
        'status' => "VARCHAR(50) DEFAULT 'pending'",
        'approval_chain' => "JSON DEFAULT NULL",
        'current_level_idx' => "INT DEFAULT 0",
        'current_status_desc' => "VARCHAR(255) DEFAULT NULL",
        'rejection_reason' => "TEXT DEFAULT NULL"
    ],
    'performance_evaluations' => [
        'status' => "VARCHAR(50) DEFAULT 'pending'",
        'approval_chain' => "JSON DEFAULT NULL",
        'current_level_idx' => "INT DEFAULT 0",
        'current_status_desc' => "VARCHAR(255) DEFAULT NULL",
        'rejection_reason' => "TEXT DEFAULT NULL"
    ],
    'resignations' => [
        'status' => "VARCHAR(50) DEFAULT 'pending'",
        'approval_chain' => "JSON DEFAULT NULL",
        'current_level_idx' => "INT DEFAULT 0",
        'current_status_desc' => "VARCHAR(255) DEFAULT NULL",
        'rejection_reason' => "TEXT DEFAULT NULL"
    ]
];

echo "=== Applying Approval System Schema ===\n";

foreach ($tables as $table => $columns) {
    echo "Processing table: $table...\n";
    
    // Check if table exists
    try {
        $db->query("SELECT 1 FROM $table LIMIT 1");
    } catch (Exception $e) {
        echo "  [SKIP] Table '$table' not found.\n";
        continue;
    }

    foreach ($columns as $col => $def) {
        try {
            // Check if column exists
            $db->query("SELECT $col FROM $table LIMIT 1");
            echo "  [OK] Column '$col' exists.\n";
        } catch (Exception $e) {
            // Add column
            echo "  [ADD] Adding column '$col'...\n";
            try {
                $db->exec("ALTER TABLE $table ADD COLUMN $col $def");
                echo "  [SUCCESS] Added '$col'.\n";
            } catch (Exception $ex) {
                echo "  [ERROR] Failed to add '$col': " . $ex->getMessage() . "\n";
            }
        }
    }
    echo "-----------------------------------\n";
}

echo "\n=== Done ===\n";
