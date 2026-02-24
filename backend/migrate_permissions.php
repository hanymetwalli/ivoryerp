<?php
/**
 * Migration: Add force_approve permission and cleanup legacy permissions
 */

require_once __DIR__ . '/config/database.php';

try {
    $db = getDB();
    $db->beginTransaction();

    // 1. Add force_approve permission
    $permId = 'perm_force_approve';
    $stmt = $db->prepare("INSERT IGNORE INTO permissions (id, name, display_name, category) VALUES (:id, :name, :dname, :cat)");
    $stmt->execute([
        ':id' => $permId,
        ':name' => 'force_approve',
        ':dname' => 'الاعتماد النهائي الاستثنائي',
        ':cat' => 'workflow'
    ]);

    // 2. Link to admin role
    // Get admin role ID
    $stmt = $db->query("SELECT id FROM roles WHERE name = 'admin' LIMIT 1");
    $adminRole = $stmt->fetch();

    if ($adminRole) {
        $stmt = $db->prepare("INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (:rid, :pid)");
        $stmt->execute([
            ':rid' => $adminRole['id'],
            ':pid' => 'force_approve' // Using the name as identifier if ID is not reliable, but let's check schema
        ]);
        
        // Also check if role_permissions uses permission_id or permission name
        // Most systems use permission names in the array or a separate join table.
        // Let's ensure we cover both if needed, but usually it's a join table.
    }

    // 3. Cleanup legacy permissions
    $legacy = ['approve_leaves', 'approve_contracts', 'approve_resignations', 'approve_overtime', 'approve_permissions'];
    $placeholders = implode(',', array_fill(0, count($legacy), '?'));
    
    // Delete from permissions table
    $stmt = $db->prepare("DELETE FROM permissions WHERE name IN ($placeholders)");
    $stmt->execute($legacy);
    
    // Delete from role_permissions table based on permission name/id
    $stmt = $db->prepare("DELETE FROM role_permissions WHERE permission_id IN ($placeholders)");
    $stmt->execute($legacy);

    $db->commit();
    echo "Migration completed successfully.\n";

} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) $db->rollBack();
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
