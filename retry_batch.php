<?php
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/backend/api/error.log');
error_reporting(E_ALL);

require 'backend/config/database.php';
$db = getDB();

$month = 2;
$year = 2026;

echo "Cleaning up batch $month/$year...\n";

// 1. Get batch ID
$stmt = $db->prepare("SELECT id FROM payroll_batches WHERE month = ? AND year = ?");
$stmt->execute([$month, $year]);
$batch = $stmt->fetch();

if ($batch) {
    $batchId = $batch['id'];
    echo "Found batch $batchId. Deleting...\n";
    
    // Delete associated payroll
    $db->prepare("DELETE FROM payroll WHERE batch_id = ?")->execute([$batchId]);
    
    // Delete batch
    $db->prepare("DELETE FROM payroll_batches WHERE id = ?")->execute([$batchId]);
    
    echo "Deleted batch and payroll records.\n";
} else {
    echo "No batch found for $month/$year.\n";
}

require_once 'backend/controllers/PayrollController.php';
$controller = new PayrollController();
echo "Triggering generateBatch($month, $year)...\n";
$result = $controller->generateBatch($month, $year);
echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
