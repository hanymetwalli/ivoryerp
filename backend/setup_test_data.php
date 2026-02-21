<?php
require 'backend/config/database.php';
$db = getDB();

$empId = '1bc8bb7c-ef2c-48ba-84bf-646e1de9f866';
$userId = '4c0abeda-a41b-4f89-ac90-7e2c9661e4ca';

echo "Setting up manager for employee $empId...\n";

// 1. Get current employee department
$stmt = $db->prepare("SELECT department FROM employees WHERE id = :id");
$stmt->execute([':id' => $empId]);
$deptId = $stmt->fetchColumn();

if (!$deptId) {
    // Assign to first department found
    $deptId = $db->query("SELECT id FROM departments LIMIT 1")->fetchColumn();
    if ($deptId) {
        $db->prepare("UPDATE employees SET department = :did WHERE id = :eid")
           ->execute([':did' => $deptId, ':eid' => $empId]);
        echo "Assigned employee to department $deptId\n";
    } else {
        echo "No departments found!\n";
        exit;
    }
}

// 2. Set user as manager of that department
$db->prepare("UPDATE departments SET manager_id = :mid WHERE id = :did")
   ->execute([':mid' => $empId, ':did' => $deptId]); // Set self as manager for simple test
echo "Set employee $empId as manager of department $deptId\n";

echo "Done.\n";
