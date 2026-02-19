<?php
/**
 * Audit Log Helper
 */

require_once __DIR__ . '/request.php';

function recordAuditLog($action, $entityType, $entityId, $oldValues = null, $newValues = null) {
    if (!$entityType || !$entityId) return; // Ignore logs without entity info
    if ($entityType === 'audit_logs') return;
    
    try {
        $db = getDB();
        $stmt = $db->prepare("
            INSERT INTO `audit_logs` (id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
            VALUES (:id, :user_id, :action, :entity_type, :entity_id, :old_values, :new_values, :ip_address, :user_agent)
        ");
        
        $stmt->execute([
            ':id' => generateUUID(),
            ':user_id' => getCurrentUserId(),
            ':action' => $action,
            ':entity_type' => $entityType,
            ':entity_id' => $entityId,
            ':old_values' => $oldValues ? (is_string($oldValues) ? $oldValues : json_encode($oldValues, JSON_UNESCAPED_UNICODE)) : null,
            ':new_values' => $newValues ? (is_string($newValues) ? $newValues : json_encode($newValues, JSON_UNESCAPED_UNICODE)) : null,
            ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
            ':user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null
        ]);
        return true;
    } catch (Exception $e) {
        error_log("Audit Log Helper Error: " . $e->getMessage());
        return false;
    }
}
