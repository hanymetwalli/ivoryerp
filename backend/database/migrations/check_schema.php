<?php
// Force local environment for CLI execution
$config = require __DIR__ . '/../../config/config.local.php';

try {
    $dsn = "mysql:host=" . $config['DB_HOST'] . ";dbname=" . $config['DB_NAME'] . ";charset=" . $config['DB_CHARSET'];
    $pdo = new PDO($dsn, $config['DB_USER'], $config['DB_PASS']);
    
    $stmt = $pdo->query("DESCRIBE system_settings");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "Columns: " . implode(", ", $columns);
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
