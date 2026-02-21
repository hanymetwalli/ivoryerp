<?php
$config = require __DIR__ . '/../../config/config.local.php';
$dsn = "mysql:host=" . $config['DB_HOST'] . ";dbname=" . $config['DB_NAME'] . ";charset=" . $config['DB_CHARSET'];
$pdo = new PDO($dsn, $config['DB_USER'], $config['DB_PASS'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

$sqlFile = __DIR__ . '/add_approval_columns_to_permissions.sql';
$sql = file_get_contents($sqlFile);

// Split by semicolon via regex to avoid splitting inside JSON or strings if any (basic split for now)
$statements = array_filter(array_map('trim', explode(';', $sql)));

foreach ($statements as $stmt) {
    if (!empty($stmt)) {
        echo "Executing: " . substr($stmt, 0, 50) . "...\n";
        try {
            $pdo->exec($stmt);
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
                echo "Column already exists. Skipping.\n";
            } else {
                echo "Error: " . $e->getMessage() . "\n";
            }
        }
    }
}
echo "Migration completed.\n";
