<?php
require_once __DIR__ . '/config/database.php';
$db = getDB();

$permsToAdd = [
    'manage_penalty_settings',
    'view_violations',
    'view_department_violations',
    'view_all_violations',
    'create_violation',
    'update_violation',
    'delete_violation'
];

echo "Updating Admin and HR_Admin roles with new permissions...\n";

// Find roles
$stmt = $db->query("SELECT id, code, permissions FROM roles WHERE code IN ('admin', 'hr_admin', 'super_admin')");
$roles = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($roles as $role) {
    $currentPerms = json_decode($role['permissions'], true) ?: [];
    $updated = false;
    
    foreach ($permsToAdd as $p) {
        if (!in_array($p, $currentPerms)) {
            $currentPerms[] = $p;
            $updated = true;
        }
    }
    
    if ($updated) {
        $stmt = $db->prepare("UPDATE roles SET permissions = ? WHERE id = ?");
        $stmt->execute([json_encode($currentPerms), $role['id']]);
        echo "Updated role: {$role['code']}\n";
    } else {
        echo "Role {$role['code']} already has all permissions.\n";
    }
}

echo "Done.\n";
