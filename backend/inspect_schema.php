<?php
require 'backend/config/database.php';
$db = getDB();
$stmt = $db->query("DESCRIBE leave_requests");
$cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($cols as $c) {
    echo "{$c['Field']} | {$c['Type']}\n";
}
?>
