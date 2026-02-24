<?php
require_once __DIR__ . '/config/database.php';
$db = getDB();

$tables = ['trainings', 'employee_trainings', 'workflow_blueprints', 'workflow_blueprint_steps'];
foreach ($tables as $table) {
    echo "--- $table ---\n";
    try {
        $stmt = $db->query("DESCRIBE $table");
        while ($row = $stmt->fetch()) {
            echo "{$row['Field']} | {$row['Type']}\n";
        }
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
?>
