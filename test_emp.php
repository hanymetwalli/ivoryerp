<?php
require 'backend/config/database.php';
$stmt=getDB()->query('DESCRIBE employees');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
