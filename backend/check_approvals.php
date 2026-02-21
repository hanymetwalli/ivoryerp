<?php
require 'backend/config/database.php';
$db = getDB();
$stmt = $db->query('SELECT * FROM approval_requests');
$reqs = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "APPROVAL REQUESTS:\n";
foreach ($reqs as $r) {
    echo "ID: {$r['id']} | TYPE: {$r['model_type']} | MODEL_ID: {$r['model_id']} | STATUS: {$r['status']}\n";
    $stmt2 = $db->prepare('SELECT * FROM approval_steps WHERE approval_request_id = :arid ORDER BY step_order ASC');
    $stmt2->execute([':arid' => $r['id']]);
    $steps = $stmt2->fetchAll(PDO::FETCH_ASSOC);
    foreach ($steps as $s) {
        echo "  - Step {$s['step_order']}: Status={$s['status']} | Approver={$s['approver_user_id']} | Role={$s['role_id']}\n";
    }
}
