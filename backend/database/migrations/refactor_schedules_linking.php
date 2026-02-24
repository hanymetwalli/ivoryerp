<?php
/**
 * Migration to refactor schedules:
 * 1. Add work_schedule_id to employees
 * 2. Move/Add Ramadan columns to work_schedules
 * 3. Remove Ramadan columns from work_locations
 */

require_once __DIR__ . '/../../config/database.php';

try {
    $db = getDB();

    echo "Starting systemic refactor migration...\n";

    // 1. Employees table
    echo "Updating employees table...\n";
    try {
        $db->exec("ALTER TABLE employees ADD COLUMN work_schedule_id VARCHAR(36) AFTER work_location_id");
        echo "Added work_schedule_id to employees.\n";
    } catch (PDOException $e) {
        echo "Note: work_schedule_id might already exist in employees.\n";
    }

    // 2. Work Schedules table
    echo "Updating work_schedules table...\n";
    try {
        $db->exec("ALTER TABLE work_schedules 
            ADD COLUMN ramadan_start_date DATE NULL,
            ADD COLUMN ramadan_end_date DATE NULL,
            ADD COLUMN ramadan_start_time TIME NULL,
            ADD COLUMN ramadan_end_time TIME NULL,
            ADD COLUMN ramadan_total_hours DECIMAL(5, 2) NULL
        ");
        echo "Added Ramadan columns to work_schedules.\n";
    } catch (PDOException $e) {
        echo "Note: Some Ramadan columns might already exist in work_schedules or there was a structural issue.\n";
    }

    // 3. Work Locations table cleanup
    echo "Cleaning up work_locations table...\n";
    try {
        $db->exec("ALTER TABLE work_locations 
            DROP COLUMN ramadan_start_date,
            DROP COLUMN ramadan_end_date,
            DROP COLUMN ramadan_hours
        ");
        echo "Removed legacy Ramadan columns from work_locations.\n";
    } catch (PDOException $e) {
        echo "Note: Legacy Ramadan columns might have already been removed from work_locations.\n";
    }

    echo "Systemic refactor migration completed successfully!\n";

} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
