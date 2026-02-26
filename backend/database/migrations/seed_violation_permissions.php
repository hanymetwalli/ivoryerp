<?php
/**
 * Seeder: Add Violation Permissions to Roles
 */

require_once __DIR__ . '/../../config/database.php';

function runSeeder() {
    $db = getDB();
    
    try {
        echo "Seeding violation permissions...\n";
        
        $newPermissions = [
            'manage_penalty_settings',
            'view_violations',
            'view_department_violations',
            'view_all_violations',
            'create_violation',
            'update_violation',
            'delete_violation'
        ];
        
        // 1. Update Admin Role (Add all new permissions)
        $stmt = $db->query("SELECT id, permissions FROM roles WHERE name = 'super_admin' OR name = 'admin' LIMIT 1");
        $admin = $stmt->fetch();
        
        if ($admin) {
            $perms = json_decode($admin['permissions'], true) ?: [];
            // If it's {"all": true}, we might not need to add individual ones, but let's be safe
            if (!isset($perms['all'])) {
                foreach ($newPermissions as $p) {
                    if (!in_array($p, $perms)) $perms[] = $p;
                }
                $db->prepare("UPDATE roles SET permissions = :p WHERE id = :id")
                   ->execute([':p' => json_encode($perms), ':id' => $admin['id']]);
                echo "Updated admin role permissions.\n";
            } else {
                echo "Admin role already has 'all' permissions.\n";
            }
        }
        
        // 2. Update Manager Role
        $stmt = $db->query("SELECT id, permissions FROM roles WHERE name = 'department_manager' OR name = 'manager' LIMIT 1");
        $manager = $stmt->fetch();
        if ($manager) {
            $perms = json_decode($manager['permissions'], true) ?: [];
            $managerPerms = ['view_department_violations', 'create_violation', 'view_violations'];
            foreach ($managerPerms as $p) {
                if (!in_array($p, $perms)) $perms[] = $p;
            }
            $db->prepare("UPDATE roles SET permissions = :p WHERE id = :id")
               ->execute([':p' => json_encode($perms), ':id' => $manager['id']]);
            echo "Updated manager role permissions.\n";
        }

        echo "Seeding completed successfully.\n";
        
    } catch (Exception $e) {
        echo "Seeding failed: " . $e->getMessage() . "\n";
    }
}

runSeeder();
