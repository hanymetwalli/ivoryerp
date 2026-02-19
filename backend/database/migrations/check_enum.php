<?php
$config = require __DIR__ . '/../../config/config.local.php';
try {
    $dsn = "mysql:host=" . $config['DB_HOST'] . ";dbname=" . $config['DB_NAME'] . ";charset=" . $config['DB_CHARSET'];
    $pdo = new PDO($dsn, $config['DB_USER'], $config['DB_PASS']);
    
    // Get column details to see ENUM values
    $stmt = $pdo->query("SHOW COLUMNS FROM system_settings LIKE 'setting_type'");
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "Type Definition: " . $row['Type'];
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
