<?php
$isLocal = true;
$config = require __DIR__ . '/../config/config.local.php';
$dsn = "mysql:host=" . $config['DB_HOST'] . ";dbname=" . $config['DB_NAME'] . ";charset=" . $config['DB_CHARSET'];
$pdo = new PDO($dsn, $config['DB_USER'], $config['DB_PASS'], [PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);

$stmt = $pdo->query("SELECT id, full_name FROM employees LIMIT 10");
print_r($stmt->fetchAll());
