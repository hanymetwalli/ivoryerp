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

    // 2. Fetch a valid User and Employee
    $stmt = $db->query("SELECT id FROM users LIMIT 1");
    $user = $stmt->fetch();
    $testUserId = $user ? $user['id'] : null;

    $stmt = $db->query("SELECT id FROM employees LIMIT 1");
    $employee = $stmt->fetch();
    $testEmployeeId = $employee ? $employee['id'] : null;

    if (!$testUserId || !$testEmployeeId) {
        die("Error: No users or employees found in database. Cannot test Foreign Key constraint.\n");
    }
    
    echo "Using User ID: " . $testUserId . "\n";
    echo "Using Employee ID: " . $testEmployeeId . "\n";

    // Test Case 1: Valid Request (1 hour)
    echo "\n[Test 1] Valid Request (1 hour)...\n";
    $result = $controller->store([
        'user_id' => $testUserId,
        'employee_id' => $testEmployeeId, // Using real employee ID
        'start_time' => '09:00',
        'end_time' => '10:00',
        'reason' => 'Doctor Appointment'
    ]);
    
    if (isset($result['success']) && $result['success']) {
         echo "SUCCESS: Request Created. ID: " . $result['data']['id'] . "\n";
    } else {
         echo "FAILED: " . print_r($result, true) . "\n";
    }

    // Test Case 2: Another Valid Request (2 hours)
    echo "\n[Test 2] Another Valid Request (2 hours)...\n";
    $result = $controller->store([
        'user_id' => $testUserId,
        'employee_id' => $testEmployeeId,
        'start_time' => '11:00',
        'end_time' => '13:00',
        'reason' => 'Family matter'
    ]);
    
    if (isset($result['success']) && $result['success']) {
         echo "SUCCESS: Request Created (Total now 3 hours / 180 mins). ID: " . $result['data']['id'] . "\n";
    } else {
         echo "FAILED: " . print_r($result, true) . "\n";
    }

    // Test Case 3: Exceeding Limit (Limit 240, consumed 180, requesting 120 -> total 300 > 240)
    echo "\n[Test 3] Request exceeding limit (2 hours more)...\n";
    $result = $controller->store([
        'user_id' => $testUserId,
        'employee_id' => $testEmployeeId,
        'start_time' => '14:00',
        'end_time' => '16:00',
        'reason' => 'Should fail'
    ]);

    if (isset($result['error']) && $result['error']) {
        echo "SUCCESS (Expected Error): " . $result['message'] . "\n";
        echo "Details: " . json_encode($result['details'] ?? [], JSON_UNESCAPED_UNICODE) . "\n";
    } else {
        echo "FAILED (Should have been rejected): " . print_r($result, true) . "\n";
    }

    // cleanup for repeated runs if needed (optional)
    $db->exec("DELETE FROM permission_requests WHERE employee_id = '$testEmployeeId'");

} catch (Exception $e) {
    echo "EXCEPTION: " . $e->getMessage() . "\n";
}
