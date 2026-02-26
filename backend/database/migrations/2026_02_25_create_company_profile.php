<?php
/**
 * Migration: Create and Seed company_profile table
 */

// Force local environment for CLI execution
$isLocal = true;
if (file_exists(__DIR__ . '/../../config/config.local.php')) {
    $config = require __DIR__ . '/../../config/config.local.php';
    if (!defined('DB_HOST')) define('DB_HOST', $config['DB_HOST']);
    if (!defined('DB_NAME')) define('DB_NAME', $config['DB_NAME']);
    if (!defined('DB_USER')) define('DB_USER', $config['DB_USER']);
    if (!defined('DB_PASS')) define('DB_PASS', $config['DB_PASS']);
    if (!defined('DB_CHARSET')) define('DB_CHARSET', $config['DB_CHARSET']);
}

require_once __DIR__ . '/../../config/database.php';

try {
    $db = getDB();
    
    // 1. Create table
    echo "Creating table company_profile...\n";
    $sql = "CREATE TABLE IF NOT EXISTS company_profile (
        id VARCHAR(50) PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        address TEXT,
        phones JSON,
        email VARCHAR(255),
        website VARCHAR(255),
        manager_id VARCHAR(50),
        logo_path VARCHAR(255),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    
    $db->exec($sql);
    echo "Table created successfully.\n";
    
    // 2. Find Manager ID for 'محمود الصالح'
    echo "Searching for manager 'محمود الصالح'...\n";
    $stmt = $db->prepare("SELECT id FROM employees WHERE full_name LIKE ? LIMIT 1");
    $stmt->execute(['%محمود الصالح%']);
    $manager = $stmt->fetch();
    $managerId = $manager ? $manager['id'] : null;
    
    if ($managerId) {
        echo "Found manager with ID: $managerId\n";
    } else {
        echo "Warning: Manager 'محمود الصالح' not found. manager_id will be NULL.\n";
    }
    
    // 3. Seed data
    echo "Seeding default data...\n";
    
    // Clear existing to avoid duplicate on re-run
    $db->exec("DELETE FROM company_profile");
    
    $id = 'comp-001'; // Static ID for the main profile
    $data = [
        'id' => $id,
        'company_name' => 'ايفوري للتدريب والاستشارات',
        'address' => 'الرياض ، المرسلات طريق ابو بكر الصديق',
        'phones' => json_encode(["+966 533 993 220"]),
        'email' => 'info@ivorytraining.com',
        'website' => 'https://ivorytraining.com/',
        'manager_id' => $managerId,
        'logo_path' => '/images/ivory.png'
    ];
    
    $stmt = $db->prepare("INSERT INTO company_profile (id, company_name, address, phones, email, website, manager_id, logo_path) 
                          VALUES (:id, :company_name, :address, :phones, :email, :website, :manager_id, :logo_path)");
    $stmt->execute($data);
    
    echo "Seeding completed successfully.\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
