<?php
require_once __DIR__ . '/../../config/database.php';

function seedATSPermissions() {
    $db = getDB();
    
    try {
        echo "Seeding ATS permissions...\n";
        
        $atsPermissions = [
            'view_all_jobs',
            'view_department_jobs',
            'create_jobs',
            'edit_jobs',
            'delete_jobs',
            'view_all_applications',
            'view_department_applications',
            'edit_applications',
            'delete_applications',
            'view_all_interviews',
            'view_interviews',
            'create_interviews',
            'edit_interviews',
            'view_evaluation_templates',
            'add_evaluation_template',
            'edit_evaluation_template',
            'delete_evaluation_template'
        ];
        
        // 1. Update Admin & HR Role
        $stmt = $db->query("SELECT id, permissions FROM roles WHERE name IN ('admin', 'super_admin', 'hr_manager', 'hr_admin')");
        $admins = $stmt->fetchAll();
        
        foreach ($admins as $admin) {
            $perms = json_decode($admin['permissions'], true) ?: [];
            foreach ($atsPermissions as $p) {
                if (!in_array($p, $perms)) $perms[] = $p;
            }
            $db->prepare("UPDATE roles SET permissions = :p WHERE id = :id")
               ->execute([':p' => json_encode($perms), ':id' => $admin['id']]);
            echo "Updated hr/admin role permissions: {$admin['id']}.\n";
        }
        
        // 2. Update Manager Role
        $stmt = $db->query("SELECT id, permissions FROM roles WHERE name IN ('department_manager', 'manager')");
        $managers = $stmt->fetchAll();
        
        $managerPerms = [
            'view_department_jobs',
            'view_department_applications',
            'view_interviews',
            'create_interviews',
            'edit_interviews'
        ];
        
        foreach ($managers as $manager) {
            $perms = json_decode($manager['permissions'], true) ?: [];
            foreach ($managerPerms as $p) {
                if (!in_array($p, $perms)) $perms[] = $p;
            }
            $db->prepare("UPDATE roles SET permissions = :p WHERE id = :id")
               ->execute([':p' => json_encode($perms), ':id' => $manager['id']]);
            echo "Updated manager role permissions: {$manager['id']}.\n";
        }

        echo "Seeding completed successfully.\n";
        
    } catch (Exception $e) {
        echo "Seeding failed: " . $e->getMessage() . "\n";
    }
}

seedATSPermissions();
