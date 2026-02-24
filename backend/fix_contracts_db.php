<?php
require_once __DIR__ . '/config/database.php';
$db = getDB();

echo "Step 1: Fixing contracts table schema...\n";
try {
    $stmt = $db->query("DESCRIBE contracts");
    $cols = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $required = [
        'approval_status' => "VARCHAR(50) DEFAULT 'planned'",
        'approval_chain' => "JSON",
        'current_level_idx' => "INT DEFAULT 0",
        'current_status_desc' => "TEXT",
        'approval_history' => "JSON",
        'request_number' => "VARCHAR(50)"
    ];

    foreach ($required as $col => $definition) {
        if (!in_array($col, $cols)) {
            echo "Adding column '$col' to contracts...\n";
            $db->exec("ALTER TABLE contracts ADD COLUMN $col $definition");
        } else {
            echo "Column '$col' already exists.\n";
        }
    }

    // Ensure request_number index
    try {
        $db->exec("CREATE UNIQUE INDEX idx_contracts_req_num ON contracts(request_number)");
    } catch (Exception $e) {
        echo "Note: Could not create unique index on request_number (might already exist).\n";
    }

} catch (Exception $e) {
    echo "Error fixing contracts schema: " . $e->getMessage() . "\n";
}

echo "\nStep 2: Ensuring ContractRequest workflow blueprint and steps exist...\n";
try {
    // Role IDs (based on previous lookup)
    $managerRoleId = 'ff72942b-09d7-4e42-aab5-03b98039c08a'; // manager
    $hrRoleId = '6c1629cb-02a0-11f1-a178-d481d76a1bbe';      // hr_manager

    // 1. Check/Create Blueprint
    $stmt = $db->prepare("SELECT id FROM workflow_blueprints WHERE request_type = 'ContractRequest'");
    $stmt->execute();
    $blueprint = $stmt->fetch();

    if (!$blueprint) {
        echo "Creating ContractRequest blueprint...\n";
        $blueprintId = bin2hex(random_bytes(16));
        $stmt = $db->prepare("INSERT INTO workflow_blueprints (id, request_type, is_active, created_at) VALUES (?, 'ContractRequest', 1, NOW())");
        $stmt->execute([$blueprintId]);
    } else {
        $blueprintId = $blueprint['id'];
        echo "ContractRequest blueprint exists (ID: $blueprintId). Ensuring it is active...\n";
        $db->exec("UPDATE workflow_blueprints SET is_active = 1 WHERE id = '$blueprintId'");
    }

    // 2. Clear old steps
    $db->prepare("DELETE FROM workflow_blueprint_steps WHERE blueprint_id = ?")->execute([$blueprintId]);

    // 3. Add Steps
    echo "Adding steps to ContractRequest blueprint...\n";
    $stmt = $db->prepare("INSERT INTO workflow_blueprint_steps (id, blueprint_id, step_order, role_id, is_direct_manager, is_dept_manager, show_approver_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())");
    
    // Step 1: Dept Manager
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
