<?php
// Force local environment for CLI execution
$isLocal = true;
$config = require __DIR__ . '/../config/config.local.php';

// Define constants
if (!defined('DB_HOST')) define('DB_HOST', $config['DB_HOST']);
if (!defined('DB_NAME')) define('DB_NAME', $config['DB_NAME']);
if (!defined('DB_USER')) define('DB_USER', $config['DB_USER']);
if (!defined('DB_PASS')) define('DB_PASS', $config['DB_PASS']);
if (!defined('DB_CHARSET')) define('DB_CHARSET', $config['DB_CHARSET']);

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    
    // Exact Query from PermissionsController
    $sql = "SELECT pr.id, pr.employee_id as direct_emp_id, 
                   COALESCE(pr.employee_id, ur.employee_id) as final_employee_id,
                   e.full_name as employee_name,
                   u.full_name as user_name
            FROM permission_requests pr
            LEFT JOIN users u ON pr.user_id = u.id
            LEFT JOIN (
                SELECT user_id, MAX(employee_id) as employee_id 
                FROM user_roles 
                WHERE status = 'active' AND employee_id IS NOT NULL 
                GROUP BY user_id
            ) ur ON pr.user_id = ur.user_id
            LEFT JOIN employees e ON e.id = COALESCE(pr.employee_id, ur.employee_id)
            ORDER BY pr.created_at DESC
            LIMIT 5";
            
     $stmt = $pdo->query($sql);
     print_r($stmt->fetchAll());

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
