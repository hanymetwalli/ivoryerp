<?php
// Force local environment for CLI execution
$isLocal = true;

// Manually load config.local.php since database.php logic relies on HTTP_HOST
$config = require __DIR__ . '/../../config/config.local.php';

// Define constants manually for this script context
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
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    
    // Read SQL file
    $sqlFile = __DIR__ . '/create_permissions_table.sql';
    if (!file_exists($sqlFile)) {
        die("SQL file not found: $sqlFile");
    }
    
    $sql = file_get_contents($sqlFile);
    
    // Execute SQL
    $pdo->exec($sql);
    
    echo "Migration executed successfully!";
    
} catch (PDOException $e) {
    echo "Error executing migration: " . $e->getMessage();
}
