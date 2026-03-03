<?php
/**
 * Fix Resignations Database - Add missing columns
 */

$config = include __DIR__ . '/backend/config/config.local.php';

try {
    $dsn = "mysql:host=" . $config['DB_HOST'] . ";dbname=" . $config['DB_NAME'] . ";charset=utf8mb4";
    $pdo = new PDO($dsn, $config['DB_USER'], $config['DB_PASS'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    echo "Checking 'resignations' table...\n";

    // Check for 'notes' column
    $stmt = $pdo->prepare("SHOW COLUMNS FROM resignations LIKE 'notes'");
    $stmt->execute();
    if (!$stmt->fetch()) {
        echo "Adding 'notes' column...\n";
        $pdo->exec("ALTER TABLE resignations ADD COLUMN notes TEXT NULL AFTER reason");
        echo "Successfully added 'notes' column.\n";
    } else {
        echo "'notes' column already exists.\n";
    }

    // Check for 'attachments' column (just in case)
    $stmt = $pdo->prepare("SHOW COLUMNS FROM resignations LIKE 'attachments'");
    $stmt->execute();
    if (!$stmt->fetch()) {
        echo "Adding 'attachments' column...\n";
        $pdo->exec("ALTER TABLE resignations ADD COLUMN attachments JSON NULL AFTER exit_interview_notes");
        echo "Successfully added 'attachments' column.\n";
    } else {
        echo "'attachments' column already exists.\n";
    }

    echo "Database fix completed successfully.\n";

} catch (PDOException $e) {
    die("Database Error: " . $e->getMessage() . "\n");
}
