error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/controllers/PermissionsController.php';
require_once __DIR__ . '/controllers/ApprovalsController.php';
require_once __DIR__ . '/controllers/WorkflowSettingsController.php';

$userId = '4c0abeda-a41b-4f89-ac90-7e2c9661e4ca';
$employeeId = '1bc8bb7c-ef2c-48ba-84bf-646e1de9f866';

try {
    echo "--- 1. Ensuring PermissionRequest Blueprint Exists ---\n";
    $wfSettings = new WorkflowSettingsController();
    $wfSettings->customAction(null, 'save', [
        'request_type' => 'PermissionRequest',
        'is_active' => 1,
        'steps' => [
            ['approver_type' => 'manager', 'show_approver_name' => 1],
            ['approver_type' => 'role', 'role_id' => '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 'show_approver_name' => 0] // hr_managers
        ]
    ]);

    echo "--- 2. Creating Permission Request ---\n";
    $permRepo = new PermissionsController();
    $requestData = [
        'user_id' => $userId,
        'employee_id' => $employeeId,
        'start_time' => '09:00:00',
        'end_time' => '09:30:00',
        'reason' => 'Test Reason ' . time()
    ];
    $result = $permRepo->store($requestData);
    
    if (isset($result['error'])) {
        throw new Exception("Store failed: " . json_encode($result));
    }
    
    $requestId = $result['data']['id'];
    echo "Request Created: ID=$requestId Status={$result['data']['status']}\n";

    echo "--- 3. Checking Pending Approvals for User ---\n";
    $_GET['user_id'] = $userId; // Mock query param
    $approvalsRepo = new ApprovalsController();
    $approvals = $approvalsRepo->index();
    
    echo "Pending Approvals Count: " . count($approvals['data']) . "\n";
    
    $foundStep = null;
    foreach ($approvals['data'] as $step) {
        if ($step['model_id'] === $requestId) {
            $foundStep = $step;
            echo "Found pending step for our request: Order={$step['step_order']} ModelType={$step['model_type']}\n";
            echo "Context Employee: " . ($step['details']['employee_name'] ?? 'N/A') . "\n";
            break;
        }
    }

    if ($foundStep) {
        echo "--- 4. Approving Step 1 ---\n";
        $approveResult = $approvalsRepo->customAction($foundStep['id'], 'submit', [
            'user_id' => $userId,
            'action' => 'approved',
            'comments' => 'Approved Step 1 Context'
        ]);
        echo "Approval 1 Result: " . json_encode($approveResult) . "\n";

        echo "--- 5. Checking Request Status after Approval 1 ---\n";
        $stmt = getDB()->prepare("SELECT status FROM permission_requests WHERE id = :id");
        $stmt->execute([':id' => $requestId]);
        $status = $stmt->fetchColumn();
        echo "Current Permission Request Status: $status (Should stay pending if more steps exist)\n";

        echo "--- 6. Checking Approvals again (Should show Step 2 if role matches) ---\n";
        // Step 2 is 'hr_managers'. The user roles should include it.
        // Let's force check if it appears.
        $approvalsV2 = $approvalsRepo->index();
        echo "Pending Approvals Count (v2): " . count($approvalsV2['data']) . "\n";
    } else {
        echo "No pending step found for our request. This might be correct if the current user is not the manager.\n";
    }

    echo "VERIFICATION COMPLETED\n";

} catch (Throwable $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack: " . $e->getTraceAsString() . "\n";
}
