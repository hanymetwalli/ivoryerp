<?php
/**
 * Request Helper Functions
 */

function getRequestBody() {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    return $data ?? [];
}

function getQueryParams() {
    return $_GET;
}

function getQueryParam($key, $default = null) {
    return $_GET[$key] ?? $default;
}

function generateUUID() {
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)));
}

function getCurrentUserId() {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (strpos($auth, 'Bearer ') === 0) {
        $token = substr($auth, 7);
        try {
            $decoded = base64_decode($token);
            if ($decoded) {
                return explode(':', $decoded)[0];
            }
        } catch (Exception $e) {
            return null;
        }
    }
    return null;
}
