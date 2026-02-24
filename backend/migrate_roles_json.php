<?php
/**
 * Migration: Update roles.permissions JSON and cleanup legacy entries
 */

require_once __DIR__ . '/config/database.php';

try {
    $db = getDB();
    $db->beginTransaction();

    // 1. Get all roles
    $stmt = $db->query("SELECT id, name, permissions FROM roles");
    $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $legacy = ['approve_leaves', 'approve_contracts', 'approve_resignations', 'approve_overtime', 'approve_permissions', 'approve_training_manager', 'approve_bonus_department_manager'];

    foreach ($roles as $role) {
        $permissions = json_decode($role['permissions'], true) ?: [];
        
        // Remove legacy
        $permissions = array_values(array_filter($permissions, function($p) use ($legacy) {
            return !in_array($p, $legacy);
        }));

        // Add force_approve to admin
        if ($role['name'] === 'admin') {
            if (!in_array('force_approve', $permissions)) {
                $permissions[] = 'force_approve';
            }
        }

        // Update role
        $stmtUpdate = $db->prepare("UPDATE roles SET permissions = :perms WHERE id = :id");
        $stmtUpdate->execute([
            ':perms' => json_encode($permissions, JSON_UNESCAPED_UNICODE),
            ':id' => $role['id']
        ]);
    }

    $db->commit();
    echo "Migration completed: Roles updated.\n";

} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) $db->rollBack();
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
