<?php
require 'backend/config/database.php';
$db = getDB();

echo "=== FINAL VERIFICATION ===\n";

// 1. Get latest request
$stmt = $db->query("SELECT * FROM permission_requests ORDER BY created_at DESC LIMIT 1");
$req = $stmt->fetch();
if (!$req) { echo "No requests found!\n"; exit; }

echo "REQUEST ID: {$req['id']}\n";
echo "REQUEST DATE: {$req['request_date']}\n";
echo "STATUS: {$req['status']}\n";

// 2. Get approval request
$stmt = $db->prepare("SELECT * FROM approval_requests WHERE model_id = :id");
$stmt->execute([':id' => $req['id']]);
$ar = $stmt->fetch();
if (!$ar) { echo "No approval request linked!\n"; exit; }

echo "APPROVAL REQ ID: {$ar['id']}\n";
echo "APPROVAL REQ STATUS: {$ar['status']}\n";

// 3. Get steps
$stmt = $db->prepare("SELECT * FROM approval_steps WHERE approval_request_id = :id ORDER BY step_order ASC");
$stmt->execute([':id' => $ar['id']]);
$steps = $stmt->fetchAll();

echo "STEPS:\n";
foreach ($steps as $s) {
    echo "  Step {$s['step_order']}: Status={$s['status']}, Approver={$s['approver_user_id']}, Role={$s['role_id']}, Notes={$s['comments']}\n";
}

echo "=== VERIFICATION END ===\n";
