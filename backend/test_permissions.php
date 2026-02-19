<?php
// Simulate Local Environment
$_SERVER['HTTP_HOST'] = 'localhost';

// Adjust path references for CLI
chdir(__DIR__);

require_once 'controllers/PermissionsController.php';

echo "Testing PermissionsController with Valid User...\n";

try {
    $controller = new PermissionsController();
    $db = getDB();

    // 1. Fetch Request Limit Setting
    $stmt = $db->query("SELECT * FROM system_settings WHERE setting_key = 'monthly_permission_limit_minutes'");
    $limitSetting = $stmt->fetch();
    echo "Current System Limit: " . ($limitSetting ? $limitSetting['setting_value'] : 'Not Set (Default 120)') . "\n";

    // 2. Fetch a valid User
    $stmt = $db->query("SELECT id, email FROM users LIMIT 1");
    $user = $stmt->fetch();

    if (!$user) {
        die("Error: No users found in database. Cannot test Foreign Key constraint.\n");
    }
    
    $testUserId = $user['id'];
    echo "Using User ID: " . $testUserId . " (" . $user['email'] . ")\n";

    // Test Case 1: Valid Request
    echo "\n[Test 1] Valid Request (1 hour)...\n";
    $result = $controller->createRequest([
        'user_id' => $testUserId,
        'start_time' => '09:00',
        'end_time' => '10:00',
        'reason' => 'Doctor Appointment'
    ]);
    // print_r($result);
    
    if (isset($result['success']) && $result['success']) {
         echo "SUCCESS: Request Created. ID: " . $result['data']['id'] . "\n";
    } else {
         echo "FAILED: " . print_r($result, true) . "\n";
    }

    // Test Case 2: Exceeding Limit
    // We try to request a very long duration to guarantee failure
    echo "\n[Test 2] Request exceeding limit (50 hours)...\n";
    $result = $controller->createRequest([
        'user_id' => $testUserId, 
        'start_time' => '12:00',
        'end_time' => '14:00', // This is 2 hours.
        // Wait, to test limit we need to exceed it.
        // If limit is 120, and we just engaged 60 (pending).
        // Pending requests usually count?
        // Code says: `status = 'approved'`.
        // So pending requests do NOT count towards consumption.
        // So for this test to fail, we need `newDuration > limit`.
        // If limit is 120. We need > 120.
        // Let's ask for 3 hours (180 mins).
    ]);
    
    // We need to pass data to verify failure, I'll use 30 hours to be safe
    // 30 hours = 30 * 60 = 1800 mins.
    // start 2023-01-01 00:00 to 2023-01-02 06:00
    // But createRequest takes H:i:s time only. It assumes SAME DAY (implied by code logic).
    // Code: $interval = $start->diff($end). 
    // If we pass '00:00' and '23:59', that's 24 hours (1440 mins).
    
    $result = $controller->createRequest([
        'user_id' => $testUserId,
        'start_time' => '00:00',
        'end_time' => '23:00', // 23 hours = 1380 mins > 120
        'reason' => 'Long break'
    ]);

    if (isset($result['error']) && $result['error']) {
        echo "SUCCESS (Expected Error): " . $result['message'] . "\n";
    } else {
        echo "FAILED (Should have been rejected): " . print_r($result, true) . "\n";
    }

     // Test Case 3: Invalid Time
    echo "\n[Test 3] Invalid Time (End before Start)...\n";
    $result = $controller->createRequest([
        'user_id' => $testUserId,
        'start_time' => '10:00',
        'end_time' => '09:00',
        'reason' => 'Time travel'
    ]);

    if (isset($result['error']) && $result['error']) {
        echo "SUCCESS (Expected Error): " . $result['message'] . "\n";
    } else {
        echo "FAILED (Should have been rejected)\n";
    }

} catch (Exception $e) {
    echo "EXCEPTION: " . $e->getMessage() . "\n";
}
