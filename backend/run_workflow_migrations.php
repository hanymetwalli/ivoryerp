<?php
/**
 * Run Workflow Migrations
 */
$_SERVER['HTTP_HOST'] = 'localhost';
require_once __DIR__ . '/config/database.php';

try {
    $db = getDB();
    
    // Read SQL file
    $sqlFile = __DIR__ . '/database/migrations/2026_02_21_create_workflow_tables.sql';
    if (!file_exists($sqlFile)) {
        die("SQL file not found: $sqlFile\n");
    }
    
    $sql = file_get_contents($sqlFile);
    
    // The getDB() returns a PDO instance. Let's use it.
    echo "Running migrations for workflow engine...\n";
    $db->exec($sql);
    
    echo "Migration executed successfully!\n";
    
} catch (Exception $e) {
    echo "Error executing migration: " . $e->getMessage() . "\n";
}
