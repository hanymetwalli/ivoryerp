<?php
/**
 * Create EmployeeViolation Blueprint
 */

require_once __DIR__ . '/config/database.php';

$db = getDB();

echo "Checking EmployeeViolation blueprint...\n";

// 1. Check if blueprint exists
$stmt = $db->prepare("SELECT id FROM workflow_blueprints WHERE request_type = 'EmployeeViolation'");
$stmt->execute();
$bpId = $stmt->fetchColumn();

if (!$bpId) {
    echo "Creating blueprint...\n";
    $bpId = 'violation-bp-' . time();
    $stmt = $db->prepare("INSERT INTO workflow_blueprints (id, request_type, is_active) VALUES (?, ?, 1)");
    $stmt->execute([$bpId, 'EmployeeViolation']);
    
    // 2. Add steps
    // Step 1: Dept Manager
    $stmt = $db->prepare("INSERT INTO workflow_blueprint_steps (id, blueprint_id, step_order, is_direct_manager, is_dept_manager) VALUES (?, ?, 1, 0, 1)");
    $stmt->execute(['step1-' . time(), $bpId]);
    
    // Step 2: HR Manager (Find HR role ID first)
    $stmtRole = $db->prepare("SELECT id FROM roles WHERE code = 'hr_manager' LIMIT 1");
    $stmtRole->execute();
    $hrRoleId = $stmtRole->fetchColumn();
    
    // If hr_manager not found, try 'hr'
    if (!$hrRoleId) {
        $stmtRole = $db->prepare("SELECT id FROM roles WHERE code = 'hr' LIMIT 1");
        $stmtRole->execute();
        $hrRoleId = $stmtRole->fetchColumn();
    }

    $stmt = $db->prepare("INSERT INTO workflow_blueprint_steps (id, blueprint_id, step_order, role_id, is_direct_manager, is_dept_manager) VALUES (?, ?, 2, ?, 0, 0)");
    $stmt->execute(['step2-' . time(), $bpId, $hrRoleId]);

    echo "Blueprint created successfully with 2 steps.\n";
} else {
    echo "Blueprint already exists.\n";
}
