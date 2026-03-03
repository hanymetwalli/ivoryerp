<?php
require 'backend/config/database.php';
$stmt=getDB()->query('SELECT code, name, description FROM roles');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
