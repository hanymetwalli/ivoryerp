<?php
$config = require __DIR__ . '/../../config/config.local.php';
try {
    $dsn = "mysql:host=" . $config['DB_HOST'] . ";dbname=" . $config['DB_NAME'] . ";charset=" . $config['DB_CHARSET'];
    $pdo = new PDO($dsn, $config['DB_USER'], $config['DB_PASS']);
    
    $stmt = $pdo->query("SHOW COLUMNS FROM roles LIKE 'id'");
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "Role ID Definition: " . $row['Type'];
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
