<?php
require 'backend/config/database.php';
$db = getDB();
$stmt = $db->query('SELECT * FROM workflow_blueprints');
$blueprints = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "BLUEPRINTS:\n";
foreach ($blueprints as $bp) {
    echo "ID: {$bp['id']} | TYPE: {$bp['request_type']} | ACTIVE: {$bp['is_active']}\n";
    $stmt2 = $db->prepare('SELECT * FROM workflow_blueprint_steps WHERE blueprint_id = :bid ORDER BY step_order ASC');
    $stmt2->execute([':bid' => $bp['id']]);
    $steps = $stmt2->fetchAll(PDO::FETCH_ASSOC);
    foreach ($steps as $s) {
        echo "  - Step {$s['step_order']}: Manager=" . ($s['is_direct_manager'] ? 'Yes' : 'No') . " | Role=" . ($s['role_id'] ?: 'None') . "\n";
    }
}
