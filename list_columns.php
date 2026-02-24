<?php
require_once __DIR__ . '/backend/config/database.php';
try {
    $db = getDB();
    $stmt = $db->query("DESCRIBE employees");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($columns as $column) {
        echo $column['Field'] . " (" . $column['Type'] . ")\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
