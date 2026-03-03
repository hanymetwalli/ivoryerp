<?php
require_once __DIR__ . '/backend/config/database.php';

$db = getDB();

$stmt = $db->query("SELECT * FROM approval_requests WHERE model_type = 'EmployeeViolation' ORDER BY created_at DESC LIMIT 1");
$req = $stmt->fetch();

$stmt = $db->prepare("SELECT * FROM approval_steps WHERE approval_request_id = ? ORDER BY step_order ASC");
$stmt->execute([$req['id']]);
$steps = $stmt->fetchAll();

$stmt = $db->query("SELECT * FROM workflow_blueprints WHERE request_type = 'EmployeeViolation'");
$blueprint = $stmt->fetch();

$stmt = $db->prepare("SELECT * FROM workflow_blueprint_steps WHERE blueprint_id = ? ORDER BY step_order ASC");
$stmt->execute([$blueprint['id']]);
$b_steps = $stmt->fetchAll();

$out = [
    'req' => $req,
    'steps' => $steps,
    'blueprint' => $blueprint,
    'b_steps' => $b_steps
];

file_put_contents('out.json', json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
