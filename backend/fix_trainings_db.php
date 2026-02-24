<?php
require_once __DIR__ . '/config/database.php';
$db = getDB();

echo "Step 1: Fixing trainings table schema...\n";
try {
    $stmt = $db->query("DESCRIBE trainings");
    $cols = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $required = [
        'cost' => "DECIMAL(10, 2) DEFAULT 0",
        'duration_hours' => "INT DEFAULT 0",
        'category' => "VARCHAR(100)",
        'provider' => "VARCHAR(255)",
        'status' => "ENUM('active', 'inactive') DEFAULT 'active'"
    ];

    foreach ($required as $col => $definition) {
        if (!in_array($col, $cols)) {
            echo "Adding column '$col' to trainings...\n";
            $db->exec("ALTER TABLE trainings ADD COLUMN $col $definition");
        } else {
            echo "Column '$col' already exists.\n";
        }
    }
} catch (Exception $e) {
    echo "Error fixing trainings schema: " . $e->getMessage() . "\n";
}

echo "\nStep 2: Fixing employee_trainings table schema...\n";
try {
    $stmt = $db->query("DESCRIBE employee_trainings");
    $cols = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (!in_array('approval_status', $cols)) {
        echo "Adding column 'approval_status' to employee_trainings...\n";
        $db->exec("ALTER TABLE employee_trainings ADD COLUMN approval_status VARCHAR(50) DEFAULT 'pending'");
    }
    
    if (!in_array('request_number', $cols)) {
        echo "Adding column 'request_number' to employee_trainings...\n";
        $db->exec("ALTER TABLE employee_trainings ADD COLUMN request_number VARCHAR(50)");
        // Try creating index (may already exist if previous run partially failed)
        try {
            $db->exec("CREATE UNIQUE INDEX idx_et_req_num ON employee_trainings(request_number)");
        } catch (Exception $e) {
            echo "Note: Could not create unique index (might already exist): " . $e->getMessage() . "\n";
        }
    }
} catch (Exception $e) {
    echo "Error fixing employee_trainings schema: " . $e->getMessage() . "\n";
}

echo "\nStep 3: Ensuring TrainingRequest workflow blueprint and steps exist...\n";
try {
    // Role IDs from roles_dump.txt
    $managerRoleId = 'ff72942b-09d7-4e42-aab5-03b98039c08a';
    $hrRoleId = '6c1629cb-02a0-11f1-a178-d481d76a1bbe';

    // 1. Check/Create Blueprint
    $stmt = $db->prepare("SELECT id FROM workflow_blueprints WHERE request_type = 'TrainingRequest'");
    $stmt->execute();
    $blueprint = $stmt->fetch();

    if (!$blueprint) {
        echo "Creating TrainingRequest blueprint...\n";
        $blueprintId = bin2hex(random_bytes(16));
        $stmt = $db->prepare("INSERT INTO workflow_blueprints (id, request_type, is_active, created_at) VALUES (?, 'TrainingRequest', 1, NOW())");
        $stmt->execute([$blueprintId]);
    } else {
        $blueprintId = $blueprint['id'];
        echo "TrainingRequest blueprint exists (ID: $blueprintId). Ensuring it is active...\n";
        $db->exec("UPDATE workflow_blueprints SET is_active = 1 WHERE id = '$blueprintId'");
    }

    // 2. Clear old steps (since previous run partially failed)
    $db->prepare("DELETE FROM workflow_blueprint_steps WHERE blueprint_id = ?")->execute([$blueprintId]);

    // 2. Add Steps
    echo "Adding steps to TrainingRequest blueprint...\n";
    // Step 1: Dept Manager
    $stmt = $db->prepare("INSERT INTO workflow_blueprint_steps (id, blueprint_id, step_order, role_id, is_direct_manager, is_dept_manager, show_approver_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())");
    
    $stmt->execute([
        bin2hex(random_bytes(16)), 
        $blueprintId, 
        1, 
        $managerRoleId, 
        0, 1, 1
    ]);
    
    // Step 2: HR Manager
    $stmt->execute([
        bin2hex(random_bytes(16)), 
        $blueprintId, 
        2, 
        $hrRoleId, 
        0, 0, 1
    ]);
    echo "Steps added successfully.\n";

} catch (Exception $e) {
    echo "Error fixing workflow blueprints: " . $e->getMessage() . "\n";
}

echo "\nDatabase fix completed.\n";
?>
