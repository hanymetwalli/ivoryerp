<?php
require_once __DIR__ . '/../config/database.php';
$db = getDB();
foreach (['user_roles', 'employees'] as $table) {
    echo "\n--- Table: $table ---\n";
    $stmt = $db->query("DESCRIBE `$table` ");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
}
