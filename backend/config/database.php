<?php
/**
 * Ivory HR System - Database Configuration
 * نظام إدارة الموارد البشرية - إعدادات قاعدة البيانات
 * 
 * This file automatically selects the correct configuration based on the environment.
 * يقوم هذا الملف باختيار الإعدادات المناسبة تلقائياً بناءً على بيئة التشغيل.
 */

// 1. Determine Environment
$isLocal = false;

// Check by Hostname (Web Request)
if (isset($_SERVER['HTTP_HOST']) && (
    strpos($_SERVER['HTTP_HOST'], 'localhost') !== false || 
    strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false ||
    strpos($_SERVER['HTTP_HOST'], '.test') !== false // Laragon .test domains
)) {
    $isLocal = true;
}

// Check by File Existence (Manual Override)
// Create a file named 'is_local' in this folder to force local mode
if (file_exists(__DIR__ . '/is_local')) {
    $isLocal = true;
}

// 2. Load Configuration
$configFile = $isLocal ? 'config.local.php' : 'config.production.php';
$configPath = __DIR__ . '/' . $configFile;

if (!file_exists($configPath)) {
    // Fallback or Error
    // If local config is missing on localhost, try production or die
    if ($isLocal) {
        // Try production if local missing, but warn
        $configPath = __DIR__ . '/config.production.php';
        if (!file_exists($configPath)) {
            die("Configuration Error: Neither config.local.php nor config.production.php found.");
        }
    } else {
         die("Configuration Error: Production config not found.");
    }
}

$dbConfig = require $configPath;

// 3. Define Constants
if (!defined('DB_HOST')) define('DB_HOST', $dbConfig['DB_HOST']);
if (!defined('DB_NAME')) define('DB_NAME', $dbConfig['DB_NAME']);
if (!defined('DB_USER')) define('DB_USER', $dbConfig['DB_USER']);
if (!defined('DB_PASS')) define('DB_PASS', $dbConfig['DB_PASS']);
if (!defined('DB_CHARSET')) define('DB_CHARSET', $dbConfig['DB_CHARSET']);

// 4. PDO Connection
function getDB() {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            // In production, don't show full error details to user
            $errorMsg = (defined('DB_HOST') && (strpos(DB_HOST, 'localhost') !== false)) 
                        ? $e->getMessage() 
                        : 'Connection Error';
            die(json_encode(['error' => 'Database connection failed: ' . $errorMsg]));
        }
    }
    
    return $pdo;
}
