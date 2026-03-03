<?php
require_once __DIR__ . '/backend/config/database.php';
require_once __DIR__ . '/backend/services/WorkflowService.php';

$db = getDB();

// Find Rayan Wael
$stmt = $db->query("SELECT id, full_name, department FROM employees WHERE full_name LIKE '%ريان وائل%'");
$emp = $stmt->fetch();
print_r("Employee: \n");
print_r($emp);

$workflow = new WorkflowService();

$reflection = new ReflectionClass($workflow);
$method = $reflection->getMethod('getDepartmentManagerUserId');
$method->setAccessible(true);
$mgrId = $method->invoke($workflow, $emp['id']);

print_r("\nManager User ID for Employee: \n");
print_r($mgrId);

// Check chain
$methodChain = $reflection->getMethod('getParentDeptManagerChain');
$methodChain->setAccessible(true);
$chain = $methodChain->invoke($workflow, $emp['id'], []);
print_r("\nManager Chain: \n");
print_r($chain);

// SQL test
$sql = "SELECT u.id, u.full_name, mgr.full_name as mgr_name, d.name as dept_name 
        FROM employees e
        LEFT JOIN departments d ON (e.department = d.id OR e.department = d.name)
        LEFT JOIN employees mgr ON d.manager_id = mgr.id
        LEFT JOIN users u ON mgr.email = u.email
        WHERE e.id = ?";
$stmt = $db->prepare($sql);
$stmt->execute([$emp['id']]);
print_r("\nSQL Test: \n");
print_r($stmt->fetchAll());
