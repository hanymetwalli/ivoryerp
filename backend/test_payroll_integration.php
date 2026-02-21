<?php
/**
 * Test Payroll Integration
 * Verify that approved permission minutes are deducted from late minutes.
 */
$_SERVER['HTTP_HOST'] = 'localhost';
chdir(__DIR__);
require_once 'helpers/audit.php';
require_once 'helpers/request.php';
require_once 'controllers/PayrollController.php';

try {
    $db = getDB();
    $controller = new PayrollController();

    // 1. Get test employee and user
    $user = $db->query("SELECT id FROM users LIMIT 1")->fetch();
    $emp = $db->query("SELECT id FROM employees LIMIT 1")->fetch();
    if (!$user || !$emp) die("No users or employees found\n");
    $uid = $user['id'];
    $eid = $emp['id'];

    $month = (int)date('n');
    $year = (int)date('Y');
    $monthStart = sprintf('%04d-%02d-01', $year, $month);

    echo "Testing Integration for Employee: $eid, Date: $monthStart\n";

    // 2. Cleanup existing records for this specific test date to avoid duplication/collision
    $db->prepare("DELETE FROM attendance WHERE employee_id = :eid AND date = :dt")->execute([':eid' => $eid, ':dt' => $monthStart]);
    $db->prepare("DELETE FROM permission_requests WHERE employee_id = :eid AND request_date = :dt")->execute([':eid' => $eid, ':dt' => $monthStart]);
    $db->prepare("DELETE FROM payroll WHERE employee_id = :eid AND month = :m AND year = :y")->execute([':eid' => $eid, ':m' => $month, ':y' => $year]);

    // 3. Setup Attendance (100 mins late)
    $db->prepare("INSERT INTO attendance (id, employee_id, date, status, late_minutes) VALUES (UUID(), :eid, :dt, 'present', 100)")
       ->execute([':eid' => $eid, ':dt' => $monthStart]);

    // 4. Setup Permission (40 mins approved)
    $db->prepare("INSERT INTO permission_requests (id, employee_id, request_date, duration_minutes, status, user_id, start_time, end_time, reason) VALUES (UUID(), :eid, :dt, 40, 'approved', :uid, '08:00', '08:40', 'Test')")
       ->execute([':eid' => $eid, ':dt' => $monthStart, ':uid' => $uid]);

    echo "Setup Complete: 100 mins late, 40 mins approved permission.\n";
    
    // 5. Calculate Payroll
    $result = $controller->calculatePayroll(['employee_id' => $eid, 'month' => $month, 'year' => $year]);

    if (isset($result['error']) && $result['error']) {
        echo "Error: " . $result['message'] . "\n";
    } else {
        echo "Payroll Created. Late Minutes in Payroll Record: " . $result['late_minutes'] . "\n";
        
        if ($result['late_minutes'] == 60) {
            echo "VERIFICATION SUCCESSFUL: 100 - 40 = 60\n";
        } else {
            echo "VERIFICATION FAILED: Expected 60, got " . $result['late_minutes'] . "\n";
        }
    }

    // 6. Test Zero Cap (Limit Case)
    echo "\nTesting Zero Cap (Permissions > Delay)...\n";
    $db->prepare("DELETE FROM permission_requests WHERE employee_id = :eid AND request_date = :dt")->execute([':eid' => $eid, ':dt' => $monthStart]);
    $db->prepare("INSERT INTO permission_requests (id, employee_id, request_date, duration_minutes, status, user_id, start_time, end_time, reason) VALUES (UUID(), :eid, :dt, 150, 'approved', :uid, '08:00', '10:30', 'Test')")
       ->execute([':eid' => $eid, ':dt' => $monthStart, ':uid' => $uid]);
    
    // Re-calculate (it deletes draft first)
    $result = $controller->calculatePayroll(['employee_id' => $eid, 'month' => $month, 'year' => $year]);

    if (isset($result['error']) && $result['error']) {
         echo "Error: " . $result['message'] . "\n";
    } else {
         echo "Late Minutes in Payroll Record: " . $result['late_minutes'] . "\n";
         if ($result['late_minutes'] == 0) {
             echo "VERIFICATION SUCCESSFUL: max(0, 100 - 150) = 0\n";
         } else {
             echo "VERIFICATION FAILED: Expected 0, got " . $result['late_minutes'] . "\n";
         }
    }

    // Final Cleanup
    $db->prepare("DELETE FROM attendance WHERE employee_id = :eid AND date = :dt")->execute([':eid' => $eid, ':dt' => $monthStart]);
    $db->prepare("DELETE FROM permission_requests WHERE employee_id = :eid AND request_date = :dt")->execute([':eid' => $eid, ':dt' => $monthStart]);
    if (isset($result['id'])) {
        $db->prepare("DELETE FROM payroll WHERE id = :id")->execute([':id' => $result['id']]);
    }

} catch (Exception $e) {
    echo "EXCEPTION: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n";
}
