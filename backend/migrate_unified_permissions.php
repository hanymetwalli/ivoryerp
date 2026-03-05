<?php
/**
 * Update Permissions Seeder - تحديث الصلاحيات للنظام الموحد الجديد
 */

require_once __DIR__ . '/config/database.php';

try {
    $db = getDb(); // Assuming getDb() is the function in database.php
    
    // 1. Get all roles
    $stmt = $db->query("SELECT * FROM roles");
    $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($roles as $role) {
        $permissions = json_decode($role['permissions'], true) ?: [];
        $data_scopes = json_decode($role['data_scopes'] ?? '{}', true) ?: [];
        $changed = false;

        // --- JOBS ---
        if (in_array('view_all_jobs', $permissions)) {
            $permissions[] = 'view_jobs';
            $data_scopes['view_jobs'] = 'all';
            $changed = true;
        } elseif (in_array('view_department_jobs', $permissions)) {
            $permissions[] = 'view_jobs';
            $data_scopes['view_jobs'] = 'department';
            $changed = true;
        }

        // --- APPLICATIONS ---
        if (in_array('view_all_applications', $permissions)) {
            $permissions[] = 'view_applications';
            $data_scopes['view_applications'] = 'all';
            $changed = true;
        } elseif (in_array('view_department_applications', $permissions)) {
            $permissions[] = 'view_applications';
            $data_scopes['view_applications'] = 'department';
            $changed = true;
        }

        // --- INTERVIEWS ---
        if (in_array('view_all_interviews', $permissions)) {
            $permissions[] = 'view_interviews';
            $data_scopes['view_interviews'] = 'all';
            $changed = true;
        } elseif (in_array('view_department_interviews', $permissions)) {
            $permissions[] = 'view_interviews';
            $data_scopes['view_interviews'] = 'department';
            $changed = true;
        }

        // Cleanup old keys
        $oldKeys = [
            'view_all_jobs', 'view_department_jobs',
            'view_all_applications', 'view_department_applications',
            'view_all_interviews', 'view_department_interviews',
            'view_evaluation_templates', 'add_evaluation_template', 'edit_evaluation_template', 'delete_evaluation_template'
        ];
        
        $newPermissions = array_values(array_unique(array_filter($permissions, function($p) use ($oldKeys) {
            return !in_array($p, $oldKeys);
        })));

        if (count($newPermissions) !== count($permissions)) {
            $permissions = $newPermissions;
            $changed = true;
        }

        // Add manage_recruitment_templates if they had any template permission
        if (in_array('view_evaluation_templates', $permissions) || $role['code'] === 'admin' || $role['code'] === 'hr_manager') {
            if (!in_array('manage_recruitment_templates', $permissions)) {
                $permissions[] = 'manage_recruitment_templates';
                $changed = true;
            }
        }

        if ($changed) {
            $updateStmt = $db->prepare("UPDATE roles SET permissions = :perms, data_scopes = :scopes WHERE id = :id");
            $updateStmt->execute([
                ':perms' => json_encode($permissions),
                ':scopes' => json_encode($data_scopes),
                ':id' => $role['id']
            ]);
            echo "Updated role: " . $role['name'] . " (" . $role['code'] . ")\n";
        }
    }

    echo "Migration completed successfully.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
