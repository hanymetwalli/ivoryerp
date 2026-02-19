<?php
require_once __DIR__ . '/controllers/SettingsController.php';

// Mock DB Connection (just testing the controller logic flow if possible, or use real DB)
// Actually better to test the API endpoint via curl or similar, OR instantiate controller
// Since I can't easily mock DB without a framework, I'll use the real DB via the controller
// assuming the environment allows it (it should as it is local).

// Helper to print
function test($name, $result) {
    echo "TEST: $name\n";
    echo "RESULT: " . json_encode($result, JSON_PRETTY_PRINT) . "\n";
    echo "------------------------------------------------\n";
}

// Instantiate Controller
$controller = new SettingsController();

// 1. Test Store (Update/Insert)
$data = [
    'setting_key' => 'monthly_permission_limit_minutes',
    'setting_value' => '150', // Changing from default 120
    'setting_type' => 'number',
    'description' => 'Test limit'
];

echo "--- Testing Store ---\n";
try {
    $storeResult = $controller->store($data);
    test("Store Setting", $storeResult);
} catch (Exception $e) {
    echo "Store Failed: " . $e->getMessage() . "\n";
}

// 2. Test Index (Get All)
echo "--- Testing Index ---\n";
try {
    $indexResult = $controller->index();
    test("List Settings", $indexResult);
    
    // Verify value
    $settings = $indexResult['data'];
    if (isset($settings['monthly_permission_limit_minutes']) && $settings['monthly_permission_limit_minutes'] == 150) {
        echo "SUCCESS: Value was updated to 150.\n";
    } else {
        echo "FAILURE: Value mismatch.\n";
    }

} catch (Exception $e) {
     echo "Index Failed: " . $e->getMessage() . "\n";
}
