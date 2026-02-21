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
    
    // Read SQL file
    $sqlFile = __DIR__ . '/add_employee_id_to_permission_requests.sql';
    if (!file_exists($sqlFile)) {
        die("SQL file not found: $sqlFile");
    }
    
    $sql = file_get_contents($sqlFile);
    
    // Execute SQL
    // Split by ; to run multiple statements?
    // PDO exec might not handle multiple statements in one call depending on driver settings.
    // It's safer to split.
    
    $statements = array_filter(array_map('trim', explode(';', $sql)));

    foreach ($statements as $stmt) {
        if (!empty($stmt)) {
            echo "Executing: " . substr($stmt, 0, 50) . "...\n";
            try {
                $pdo->exec($stmt);
            } catch (PDOException $e) {
                // If column exists, we might get duplicate column error.
                if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
                    echo "Column already exists. Skipping.\n";
                } else {
                    throw $e;
                }
            }
        }
    }
    
    echo "Migration executed successfully!";
    
} catch (PDOException $e) {
    echo "Error executing migration: " . $e->getMessage();
}
