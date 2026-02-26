<?php
require 'backend/config/database.php';
$db = getDB();
$stmt = $db->query("DESCRIBE workflow_blueprints");
echo "--- Blueprints ---\n";
foreach($stmt->fetchAll(PDO::FETCH_ASSOC) as $f) echo $f['Field'] . "\n";

$stmt = $db->query("DESCRIBE workflow_blueprint_steps");
echo "\n--- Steps ---\n";
foreach($stmt->fetchAll(PDO::FETCH_ASSOC) as $f) echo $f['Field'] . "\n";
