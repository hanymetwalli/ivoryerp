<?php
require 'backend/config/database.php';
$db = getDB();
$user = $db->query('SELECT id, full_name, email FROM users LIMIT 1')->fetch();
$emp = $db->query('SELECT id, full_name FROM employees LIMIT 1')->fetch();
echo 'USER_ID:' . $user['id'] . "\n";
echo 'EMPLOYEE_ID:' . $emp['id'] . "\n";
echo 'USER_EMAIL:' . $user['email'] . "\n";

// Find manager of this employee
$stmt = $db->prepare("SELECT u.id as user_id, u.full_name FROM employees e JOIN users u ON e.direct_manager_id = u.employee_id WHERE e.id = :eid");
$stmt->execute([':eid' => $emp['id']]);
$manager = $stmt->fetch();
if ($manager) {
    echo 'MANAGER_USER_ID:' . $manager['user_id'] . "\n";
    echo 'MANAGER_NAME:' . $manager['full_name'] . "\n";
} else {
    echo "No direct manager user found for this employee.\n";
}
