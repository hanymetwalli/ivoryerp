<?php
require 'backend/config/database.php';
$db = getDB();
try {
    $res = $db->query('DESCRIBE permissions');
    echo "Permissions Table found:\n";
    print_r($res->fetchAll());
} catch (Exception $e) {
    echo "Permissions Table NOT found: " . $e->getMessage() . "\n";
}

try {
    $res = $db->query('DESCRIBE role_permissions');
    echo "Role Permissions Table found:\n";
    print_r($res->fetchAll());
} catch (Exception $e) {
    echo "Role Permissions Table NOT found: " . $e->getMessage() . "\n";
}
