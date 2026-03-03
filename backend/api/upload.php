<?php
/**
 * File Upload Handler for Ivory HR
 */

// Error handling
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');
error_reporting(E_ALL);

// CORS Headers
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
} else {
    header("Access-Control-Allow-Origin: *");
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    exit(0);
}

header('Content-Type: application/json; charset=utf-8');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    if (!isset($_FILES['file'])) {
        throw new Exception('No file uploaded');
    }

    $file = $_FILES['file'];
    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('File upload error: ' . $file['error']);
    }

    // Secure file naming
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $newName = uniqid('doc_', true) . '.' . $ext;
    
    $uploadDir = __DIR__ . '/uploads/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $destPath = $uploadDir . $newName;
    if (!move_uploaded_file($file['tmp_name'], $destPath)) {
        throw new Exception('Failed to move uploaded file');
    }

    // Determine public URL
    // We use a relative path for flexibility, or absolute if needed
    $fileUrl = '/backend/api/uploads/' . $newName;

    echo json_encode([
        'success' => true,
        'file_url' => $fileUrl,
        'file_name' => $file['name'],
        'file_size' => $file['size'],
        'file_type' => $file['type']
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
