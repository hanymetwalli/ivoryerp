<?php
/**
 * Test Workflow Engine
 */
$_SERVER['HTTP_HOST'] = 'localhost';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/services/WorkflowService.php';

try {
    $db = getDB();
    $service = new WorkflowService();

    echo "--- Testing Workflow Engine ---\n";

    // 1. Get real data for setup
    $role = $db->query("SELECT id FROM roles WHERE name = 'hr_manager' LIMIT 1")->fetch();
    if (!$role) die("hr_manager role not found. Please run schema.sql first.\n");
    $hrRoleId = $role['id'];

    $user = $db->query("SELECT id FROM users LIMIT 1")->fetch();
    if (!$user) die("No users found.\n");
    $testUserId = $user['id'];

    // 2. Setup Blueprint
    echo "1. Setting up Blueprint for 'TEST_REQUEST'...\n";
    $db->prepare("DELETE FROM workflow_blueprints WHERE request_type = 'TEST_REQUEST'")->execute();
    
    $blueprintId = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x', mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000, mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff));
    
    $db->prepare("INSERT INTO workflow_blueprints (id, request_type, is_active) VALUES (:id, 'TEST_REQUEST', 1)")
       ->execute([':id' => $blueprintId]);

    // Step 1: Direct Manager
    $db->prepare("INSERT INTO workflow_blueprint_steps (id, blueprint_id, step_order, is_direct_manager) VALUES (UUID(), :bid, 1, 1)")
       ->execute([':bid' => $blueprintId]);

    // Step 2: HR Role
    $db->prepare("INSERT INTO workflow_blueprint_steps (id, blueprint_id, step_order, role_id) VALUES (UUID(), :bid, 2, :rid)")
       ->execute([':bid' => $blueprintId, ':rid' => $hrRoleId]);

    echo "Blueprint Setup DONE.\n";

    // 3. Mock a Model Record (e.g., using an existing leave request or training)
    // For testing, we'll use a dummy table if possible, or just use 'trainings'
    $mockModelId = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x', mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000, mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff));
    $db->prepare("INSERT INTO trainings (id, name, status) VALUES (:id, 'Test Training Workflow', 'planned')")
       ->execute([':id' => $mockModelId]);

    echo "2. Generating Flow for Training Request...\n";
    $genResult = $service->generateFlow('trainings', $mockModelId, 'TEST_REQUEST');
    $arId = $genResult['approval_request_id'];
    echo "Flow Generated! approval_request_id: $arId\n";

    // 4. Verify steps were created
    $steps = $db->prepare("SELECT * FROM approval_steps WHERE approval_request_id = :id ORDER BY step_order ASC");
    $steps->execute([':id' => $arId]);
    $allSteps = $steps->fetchAll();
    echo "Steps Created: " . count($allSteps) . "\n";

    // 5. Process First Step (Approve)
    echo "3. Approving Step 1...\n";
    $service->processAction($allSteps[0]['id'], $testUserId, 'approved', 'Looks good from manager side');
    
    // Check request status (should still be pending if more steps exist)
    $reqStatus = $db->prepare("SELECT status FROM approval_requests WHERE id = :id");
    $reqStatus->execute([':id' => $arId]);
    echo "Request Status after Step 1: " . $reqStatus->fetch()['status'] . "\n";

    // 6. Process Last Step (Approve)
    echo "4. Approving Step 2 (Final)...\n";
    $service->processAction($allSteps[1]['id'], $testUserId, 'approved', 'Approved by HR');

    // Final checks
    $reqStatus->execute([':id' => $arId]);
    $finalStatus = $reqStatus->fetch()['status'];
    echo "Request Status after Step 2: " . $finalStatus . "\n";

    // Check if model was updated
    $modelStatus = $db->prepare("SELECT status FROM trainings WHERE id = :id");
    $modelStatus->execute([':id' => $mockModelId]);
    echo "Model (Training) Status: " . $modelStatus->fetch()['status'] . "\n";

    if ($finalStatus === 'approved') {
        echo "\nVERIFICATION SUCCESSFUL!\n";
    } else {
        echo "\nVERIFICATION FAILED!\n";
    }

    // Cleanup
    $db->prepare("DELETE FROM approval_requests WHERE id = :id")->execute([':id' => $arId]);
    $db->prepare("DELETE FROM trainings WHERE id = :id")->execute([':id' => $mockModelId]);
    $db->prepare("DELETE FROM workflow_blueprints WHERE id = :id")->execute([':id' => $blueprintId]);

} catch (Exception $e) {
    echo "EXCEPTION: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n";
}
