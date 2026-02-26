<?php
/**
 * Force Fix Permissions Script
 * Injects violation permissions into the roles table JSON column.
 */

require_once __DIR__ . '/config/database.php';

$db = getDB();

$new_permission_codes = [
    'manage_penalty_settings',
    'view_violations',
    'view_department_violations',
    'view_all_violations',
    'create_violation',
    'update_violation',
    'delete_violation'
];

echo "Starting permission injection into roles table...\n";

// Find admin and super_admin roles
$stmt = $db->prepare("SELECT id, code, permissions FROM roles WHERE code IN ('admin', 'super_admin')");
$stmt->execute();
$admin_roles = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($admin_roles)) {
    echo "Warning: No admin or super_admin roles found.\n";
}

foreach ($admin_roles as $role) {
    echo "Processing role: {$role['code']} (ID: {$role['id']})\n";
    
    $currentPerms = json_decode($role['permissions'] ?? '[]', true) ?: [];
    $originalCount = count($currentPerms);
    
    $updated = false;
    foreach ($new_permission_codes as $code) {
        if (!in_array($code, $currentPerms)) {
            $currentPerms[] = $code;
            $updated = true;
        }
    }
    
    if ($updated) {
        $stmt = $db->prepare("UPDATE roles SET permissions = ? WHERE id = ?");
        $stmt->execute([json_encode($currentPerms), $role['id']]);
        $newCount = count($currentPerms);
        echo "Updated JSON permissions for role {$role['code']}. (Count: $originalCount -> $newCount)\n";
    } else {
        echo "Role {$role['code']} already has all permissions.\n";
    }
}

echo "Done.\n";
