<?php
require_once __DIR__ . '/config/database.php';
$db = getDB();
$stmt = $db->query("DESCRIBE roles");
while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    print_r($row);
}
