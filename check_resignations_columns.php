<?php
$config = include __DIR__ . '/backend/config/config.local.php';
$pdo = new PDO('mysql:host=' . $config['DB_HOST'] . ';dbname=' . $config['DB_NAME'], $config['DB_USER'], $config['DB_PASS']);
$stmt = $pdo->query('DESCRIBE resignations');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
