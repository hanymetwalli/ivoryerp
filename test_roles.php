<?php
require 'backend/config/database.php';
$stmt=getDB()->query('DESCRIBE roles');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
