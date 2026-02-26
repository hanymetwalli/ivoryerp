<?php
require_once __DIR__ . '/config/database.php';
$db = getDB();

$perms = [
    'manage_penalty_settings',
    'view_violations',
    'view_department_violations',
    'view_all_violations',
    'create_violation',
    'update_violation',
    'delete_violation'
];

echo "Checking permissions...\n";
foreach ($perms as $p) {
    $stmt = $db->prepare("SELECT id FROM permissions WHERE code = ?");
    $stmt->execute([$p]);
    $id = $stmt->fetchColumn();
    echo "Permission {$p}: " . ($id ? "EXISTS" : "MISSING") . "\n";
}

echo "\nChecking Admin role permissions...\n";
$stmt = $db->prepare("SELECT id FROM roles WHERE code IN ('admin', 'super_admin')");
$stmt->execute();
$roleIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

foreach ($roleIds as $rid) {
    echo "Role ID {$rid}:\n";
    foreach ($perms as $p) {
        $stmt = $db->prepare("SELECT id FROM permissions WHERE code = ?");
        $stmt->execute([$p]);
        $pid = $stmt->fetchColumn();
        
        if ($pid) {
            $stmt = $db->prepare("SELECT 1 FROM role_permissions WHERE role_id = ? AND permission_id = ?");
            $stmt->execute([$rid, $pid]);
            echo "  {$p}: " . ($stmt->fetch() ? "ASSIGNED" : "NOT ASSIGNED") . "\n";
        }
    }
}
