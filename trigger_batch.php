<?php
require 'backend/config/database.php';
require_once 'backend/controllers/PayrollController.php';

$controller = new PayrollController();
$result = $controller->generateBatch(2, 2026);
echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
