<?php
require_once __DIR__ . '/config/database.php';
$db = getDB();
$stmt = $db->query("SHOW TABLES");
while($row = $stmt->fetch(PDO::FETCH_NUM)) {
    echo $row[0] . PHP_EOL;
}
