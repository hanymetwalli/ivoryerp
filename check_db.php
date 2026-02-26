<?php
require 'backend/config/database.php';
$db = getDB();

echo "--- ROLES ---\n";
$stmt = $db->query('SELECT id, name FROM roles WHERE status = "active"');
foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $role) {
    echo "ID: {$role['id']} | Name: {$role['name']}\n";
}

echo "\n--- BLUEPRINTS ---\n";
$stmt = $db->query('SELECT id, request_type, is_active FROM workflow_blueprints');
echo "\n--- PAYROLL BLUEPRINT STEPS ---\n";
$stmt = $db->query('SELECT * FROM workflow_blueprint_steps WHERE blueprint_id = "f1092790-af38-490b-9f97-3adeaddee5d6" ORDER BY step_order ASC');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
