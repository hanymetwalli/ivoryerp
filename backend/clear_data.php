<?php
require 'backend/config/database.php';
$db = getDB();
$db->exec('DELETE FROM approval_steps');
$db->exec('DELETE FROM approval_requests');
$db->exec('DELETE FROM permission_requests');
echo "All related tables cleared.\n";
