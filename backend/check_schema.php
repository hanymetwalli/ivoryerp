<?php
require 'backend/config/database.php';
$db = getDB();
$stmt = $db->query('SELECT id, name FROM departments');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
