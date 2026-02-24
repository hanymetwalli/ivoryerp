<?php
require_once __DIR__ . '/config/database.php';
$db = getDB();

$tables = ['contracts', 'contract_types'];
foreach ($tables as $table) {
    echo "--- $table schema ---\n";
    try {
        $stmt = $db->query("DESCRIBE $table");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "{$row['Field']} | {$row['Type']}\n";
        }
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
    echo "\n";
}
?>
