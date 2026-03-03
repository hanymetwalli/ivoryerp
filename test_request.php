<?php
require_once __DIR__ . '/backend/config/database.php';

$db = getDB();

$stmt = $db->query("SELECT * FROM approval_requests WHERE model_type = 'EmployeeViolation' ORDER BY created_at DESC LIMIT 1");
$req = $stmt->fetch();
print_r("Request:\n");
print_r($req);

$stmt = $db->prepare("SELECT * FROM approval_steps WHERE approval_request_id = ? ORDER BY step_order ASC");
$stmt->execute([$req['id']]);
$steps = $stmt->fetchAll();
print_r("\nSteps:\n");
print_r($steps);

// Blueprint
$stmt = $db->query("SELECT * FROM workflow_blueprints WHERE request_type = 'EmployeeViolation'");
$blueprint = $stmt->fetch();
print_r("\nBlueprint:\n");
print_r($blueprint);

$stmt = $db->prepare("SELECT * FROM workflow_blueprint_steps WHERE blueprint_id = ? ORDER BY step_order ASC");
$stmt->execute([$blueprint['id']]);
$b_steps = $stmt->fetchAll();
print_r("\nBlueprint Steps:\n");
print_r($b_steps);
