<?php
// Force local environment for CLI execution
$isLocal = true;

// Manually load config.local.php
$config = require __DIR__ . '/../../config/config.local.php';

// Define constants
if (!defined('DB_HOST')) define('DB_HOST', $config['DB_HOST']);
if (!defined('DB_NAME')) define('DB_NAME', $config['DB_NAME']);
if (!defined('DB_USER')) define('DB_USER', $config['DB_USER']);
if (!defined('DB_PASS')) define('DB_PASS', $config['DB_PASS']);
if (!defined('DB_CHARSET')) define('DB_CHARSET', $config['DB_CHARSET']);

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ];
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    
    // Describe employees table
    $stmt = $pdo->query("DESCRIBE employees");
    $columns = $stmt->fetchAll();
    
    echo "Employees Table Schema:\n";
    foreach ($columns as $col) {
        echo $col['Field'] . " | " . $col['Type'] . "\n";
    }

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
