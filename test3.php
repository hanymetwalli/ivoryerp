<?php
require 'backend/config/database.php';
$stmt=getDB()->query('DESCRIBE workflow_blueprint_steps');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
$stmt2=getDB()->query('DESCRIBE approval_steps');
print_r($stmt2->fetchAll(PDO::FETCH_ASSOC));
