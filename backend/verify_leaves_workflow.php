<?php
require 'backend/config/database.php';
require 'backend/helpers/audit.php';
require 'backend/services/WorkflowService.php';
require 'backend/controllers/LeavesController.php';

$db = getDB();
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$workflowService = new WorkflowService();
$leavesController = new LeavesController();

function uuid() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

$suffix = mt_rand(10000, 99999);

try {
    $db->beginTransaction();

    // 1. Create Role
    $roleId = uuid();
    $db->prepare("INSERT INTO roles (id, name, permissions) VALUES (?, ?, ?)")
       ->execute([$roleId, "Test Role $suffix", '{}']);

    // 2. Create Admin User
    $adminUserId = uuid();
    $db->prepare("INSERT INTO users (id, email, password, full_name) VALUES (?, ?, ?, ?)")
       ->execute([$adminUserId, "test_admin_$suffix@example.com", 'password', "Admin $suffix"]);

    // 3. Create Employee
    $empId = uuid();
    $db->prepare("INSERT INTO employees (id, full_name, email, department) VALUES (?, ?, ?, ?)")
       ->execute([$empId, "Test Emp $suffix", "test_emp_$suffix@example.com", 'HR']);

    // 4. Create Leave Type
    $ltId = uuid();
    $db->prepare("INSERT INTO leave_types (id, name, default_balance) VALUES (?, ?, ?)")
       ->execute([$ltId, "Test Leave $suffix", 10]);

    // 5. Initial Balance
    $balId = uuid();
    $db->prepare("INSERT INTO employee_leave_balances (id, employee_id, leave_type_id, year, total_balance, used_balance, remaining_balance) VALUES (?, ?, ?, ?, ?, ?, ?)")
       ->execute([$balId, $empId, $ltId, date('Y'), 10, 0, 10]);

    // 6. Setup Blueprint
    // DELETE existing to avoid unique constraint
    $db->prepare("DELETE FROM workflow_blueprint_steps WHERE blueprint_id IN (SELECT id FROM workflow_blueprints WHERE request_type = 'LeaveRequest')")->execute();
    $db->prepare("DELETE FROM workflow_blueprints WHERE request_type = 'LeaveRequest'")->execute();
    
    $blueprintId = uuid();
    $db->prepare("INSERT INTO workflow_blueprints (id, request_type, is_active) VALUES (?, ?, 1)")
       ->execute([$blueprintId, 'LeaveRequest']);
    
    $db->prepare("INSERT INTO workflow_blueprint_steps (id, blueprint_id, step_order, role_id, is_direct_manager, is_dept_manager, show_approver_name) VALUES (?, ?, 1, ?, 0, 0, 1)")
       ->execute([uuid(), $blueprintId, $roleId]);

    echo "Creating leave request...\n";
    $leaveData = [
        'employee_id' => $empId,
        'leave_type_id' => $ltId,
        'start_date' => date('Y-m-d'),
        'end_date' => date('Y-m-d'),
        'reason' => "Test reason $suffix"
    ];
    $result = $leavesController->store($leaveData);
    if (isset($result['error'])) throw new Exception("Store error: " . $result['message']);
    $leaveId = $result['id'];
    
    $db->commit();
    echo "Setup complete. Request ID: $leaveId\n";

    // ACT: Approve
    echo "Approving...\n";
    $approveResult = $leavesController->customAction($leaveId, 'approve', [
        'approver_id' => $adminUserId,
        'notes' => 'Approved by test script'
    ]);

    if (isset($approveResult['error'])) throw new Exception("Approve error: " . $approveResult['message']);
    echo "Status after approval: " . ($approveResult['status'] ?? 'N/A') . "\n";

    // VERIFY
    $stmt = $db->prepare("SELECT status FROM leave_requests WHERE id = ?");
    $stmt->execute([$leaveId]);
    $finalStatus = $stmt->fetchColumn();
    echo "Final Record Status: $finalStatus\n";

} catch (PDOException $e) {
    if ($db->inTransaction()) $db->rollBack();
    echo "PDO ERROR: " . $e->getMessage() . "\n";
    echo "FILE: " . $e->getFile() . " ON LINE " . $e->getLine() . "\n";
    echo "TRACE:\n" . $e->getTraceAsString() . "\n";
} catch (Exception $e) {
    if ($db->inTransaction()) $db->rollBack();
    echo "ERROR: " . $e->getMessage() . "\n";
}
