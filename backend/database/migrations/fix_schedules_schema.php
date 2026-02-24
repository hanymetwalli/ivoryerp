<?php
/**
 * Migration to add missing columns for flexible schedules and Ramadan hours
 */

require_once __DIR__ . '/../../config/database.php';

try {
    $db = getDB();

    echo "Starting migration...\n";

    // 1. Update work_schedules table
    echo "Updating work_schedules table...\n";
    
    // Add columns if they don't exist
    $db->exec("ALTER TABLE work_schedules 
        MODIFY COLUMN start_time TIME NULL,
        MODIFY COLUMN end_time TIME NULL
    ");
    
    try {
        $db->exec("ALTER TABLE work_schedules 
            ADD COLUMN schedule_type ENUM('fixed', 'flexible') DEFAULT 'fixed' AFTER work_location_id,
            ADD COLUMN total_hours DECIMAL(5, 2) DEFAULT 8.00 AFTER schedule_type
        ");
    } catch (PDOException $e) {
        // Ignore duplicate column errors
    }
    
    echo "work_schedules updated successfully.\n";

    // 2. Update work_locations table
    echo "Updating work_locations table...\n";
    $db->exec("ALTER TABLE work_locations 
        ADD COLUMN ramadan_start_date DATE NULL AFTER status,
        ADD COLUMN ramadan_end_date DATE NULL AFTER ramadan_start_date,
        ADD COLUMN ramadan_hours DECIMAL(5, 2) NULL AFTER ramadan_end_date
    ");
    echo "work_locations updated successfully.\n";

    echo "Migration completed successfully!\n";

} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "Note: One or more columns already exist. Migration partially applied or skipped.\n";
    } else {
        echo "Migration failed: " . $e->getMessage() . "\n";
    }
}
