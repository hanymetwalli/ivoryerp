<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/controllers/PermissionsController.php';

$userId = '4c0abeda-a41b-4f89-ac90-7e2c9661e4ca';
$employeeId = '1bc8bb7c-ef2c-48ba-84bf-646e1de9f866';

echo "STARTING DEBUG STORE\n";
$permRepo = new PermissionsController();
$requestData = [
    'user_id' => $userId,
    'employee_id' => $employeeId,
    'request_date' => date('Y-m-d'),
    'start_time' => '10:00:00',
    'end_time' => '10:15:00',
    'reason' => 'Debug Test'
];

$result = $permRepo->store($requestData);
echo "\nFINAL RESULT:\n";
print_r($result);
echo "\nDEBUG END\n";
