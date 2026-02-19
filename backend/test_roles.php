<?php
// Simulate Local Environment
$_SERVER['HTTP_HOST'] = 'localhost';
chdir(__DIR__);
require_once 'controllers/PermissionsController.php';

try {
    $db = getDB();

    echo "--- ROLES TABLE DUMP ---\n";
    $stmt = $db->query("SELECT id, name FROM roles LIMIT 10");
    $roles = $stmt->fetchAll();
    print_r($roles);
    echo "------------------------\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
