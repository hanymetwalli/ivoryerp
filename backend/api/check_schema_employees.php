<?php
require_once __DIR__ . '/../config/database.php';
$db = getDB();
$stmt = $db->query("DESCRIBE employees");
$res = $stmt->fetchAll(PDO::FETCH_ASSOC);
print_r(array_slice($res, 0, 15));
