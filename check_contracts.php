<?php
require 'backend/config/database.php';
$db = getDB();
echo "Contracts and Employee Status:\n";
$stmt = $db->query("SELECT c.employee_id, e.full_name, c.status as contract_status, e.status as employee_status 
                    FROM contracts c 
                    JOIN employees e ON c.employee_id = e.id");
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($results as $r) {
    echo "- {$r['full_name']} (ID: {$r['employee_id']}): Contract={{$r['contract_status']}}, Employee={{$r['employee_status']}}\n";
}
