<?php
/**
 * Script to grant 'force_approve' permission to the admin role
 */

require_once __DIR__ . '/../config/database.php';

try {
    $db = getDB();
    
    echo "Starting permission seeding for admin role...\n";
    
    // 1. Fetch the admin role
    $stmt = $db->prepare("SELECT id, permissions FROM roles WHERE name = 'admin' OR code = 'admin' LIMIT 1");
    $stmt->execute();
    $adminRole = $stmt->fetch();
    
    if (!$adminRole) {
        die("Error: Admin role not found in the database.\n");
    }
    
    $roleId = $adminRole['id'];
    $currentPermissions = [];
    
    // 2. Decode existing permissions
    if (is_string($adminRole['permissions']) && !empty($adminRole['permissions'])) {
        $currentPermissions = json_decode($adminRole['permissions'], true) ?: [];
    } else if (is_array($adminRole['permissions'])) {
        $currentPermissions = $adminRole['permissions'];
    }
    
    // 3. Add 'force_approve' if not present
    if (!in_array('force_approve', $currentPermissions)) {
        if (in_array('*', $currentPermissions)) {
            echo "Admin already has wildcard permission (*). Adding 'force_approve' anyway for safety.\n";
        }
        $currentPermissions[] = 'force_approve';
        
        // 4. Save back to database
        $updatedPermissions = json_encode($currentPermissions, JSON_UNESCAPED_UNICODE);
        $updateStmt = $db->prepare("UPDATE roles SET permissions = :perms WHERE id = :id");
        $updateResult = $updateStmt->execute([
            ':perms' => $updatedPermissions,
            ':id' => $roleId
        ]);
        
        if ($updateResult) {
            echo "Successfully granted 'force_approve' permission to the admin role.\n";
        } else {
            echo "Error: Failed to update the admin role permissions.\n";
        }
    } else {
        echo "Admin role already has 'force_approve' permission.\n";
    }
    
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}
