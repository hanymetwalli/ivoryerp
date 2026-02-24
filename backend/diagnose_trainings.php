<?php
require_once __DIR__ . '/config/database.php';
$db = getDB();

echo "--- trainings table schema ---\n";
try {
    $stmt = $db->query("DESCRIBE trainings");
    $cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($cols as $c) {
        echo "- {$c['Field']} | {$c['Type']}\n";
    }
} catch (Exception $e) {
    echo "Error describing trainings: " . $e->getMessage() . "\n";
}

echo "\n--- employee_trainings table schema ---\n";
try {
    $stmt = $db->query("DESCRIBE employee_trainings");
    $cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($cols as $c) {
        echo "- {$c['Field']} | {$c['Type']}\n";
    }
} catch (Exception $e) {
    echo "Error describing employee_trainings: " . $e->getMessage() . "\n";
}

echo "\n--- workflow_blueprints search for TrainingRequest ---\n";
try {
    $stmt = $db->prepare("SELECT * FROM workflow_blueprints WHERE request_type = 'TrainingRequest'");
    $stmt->execute();
    $blueprints = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if ($blueprints) {
        foreach ($blueprints as $b) {
            echo "- ID: {$b['id']}, Status: {$b['status']}, Description: {$b['description']}\n";
        }
    } else {
        echo "No blueprint found for 'TrainingRequest'\n";
    }
} catch (Exception $e) {
    echo "Error querying blueprints: " . $e->getMessage() . "\n";
}
?>
