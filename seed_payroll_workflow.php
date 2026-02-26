<?php
require 'backend/config/database.php';
require_once 'backend/helpers/request.php'; 

$db = getDB();

// 1. Find Admin Role
$stmt = $db->query("SELECT id FROM roles WHERE name = 'admin' LIMIT 1");
$adminRole = $stmt->fetch();

if (!$adminRole) {
    die("Admin role not found. Please create it first.");
}

$adminRoleId = $adminRole['id'];

try {
    $db->beginTransaction();

    // 2. Create Blueprint
    $blueprintId = generateUUID();
    $stmt = $db->prepare("INSERT INTO workflow_blueprints (id, request_type, is_active) VALUES (?, ?, 1)");
    $stmt->execute([$blueprintId, 'PayrollBatch']);
    
    echo "Created Blueprint: $blueprintId\n";

    // 3. Create Step (Admin Approval)
    $stepId = generateUUID();
    $stmt = $db->prepare("INSERT INTO workflow_blueprint_steps (id, blueprint_id, step_order, role_id, is_direct_manager, is_dept_manager, show_approver_name) VALUES (?, ?, 1, ?, 0, 0, 1)");
    $stmt->execute([$stepId, $blueprintId, $adminRoleId]);

    echo "Created Step: $stepId\n";

    $db->commit();
    echo "Successfully seeded PayrollBatch workflow.\n";

} catch (Exception $e) {
    $db->rollBack();
    echo "Error: " . $e->getMessage() . "\n";
}
