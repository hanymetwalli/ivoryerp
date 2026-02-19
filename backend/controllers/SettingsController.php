<?php
/**
 * Settings Controller
 */

require_once __DIR__ . '/BaseController.php';

class SettingsController extends BaseController {
    protected $table = 'system_settings';
    protected $primaryKey = 'setting_key';
    
    protected $fillable = [
        'id', 'setting_key', 'setting_value', 'setting_type', 'description'
    ];
    
    /**
     * Get all settings as key-value pairs
     */
    public function index() {
        $stmt = $this->db->prepare("SELECT * FROM `system_settings` ORDER BY `setting_key` ASC");
        $stmt->execute();
        $rows = $stmt->fetchAll();
        
        $settings = [];
        foreach ($rows as $row) {
            $value = $row['setting_value'];
            
            // Cast to appropriate type
            switch ($row['setting_type']) {
                case 'number':
                    $value = is_numeric($value) ? floatval($value) : $value;
                    break;
                case 'boolean':
                    $value = filter_var($value, FILTER_VALIDATE_BOOLEAN);
                    break;
                case 'json':
                    $value = json_decode($value, true);
                    break;
            }
            
            $settings[$row['setting_key']] = $value;
        }
        
        return ['data' => $settings];
    }
    
    /**
     * Get single setting
     */
    public function show($key) {
        $stmt = $this->db->prepare("SELECT * FROM `system_settings` WHERE `setting_key` = :key");
        $stmt->execute([':key' => $key]);
        $row = $stmt->fetch();
        
        if (!$row) {
            return ['error' => true, 'message' => 'Setting not found'];
        }
        
        return $this->processRow($row);
    }
    
    /**
     * Update or create setting
     */
    public function store($data) {
        $key = $data['setting_key'] ?? null;
        $value = $data['setting_value'] ?? null;
        $type = $data['setting_type'] ?? 'string';
        
        if (!$key) {
            http_response_code(400);
            return ['error' => true, 'message' => 'setting_key is required'];
        }
        
        // Convert arrays to JSON
        if (is_array($value)) {
            $value = json_encode($value, JSON_UNESCAPED_UNICODE);
            $type = 'json';
        }
        
        // Check if exists
        $stmt = $this->db->prepare("SELECT id FROM `system_settings` WHERE `setting_key` = :key");
        $stmt->execute([':key' => $key]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            $stmt = $this->db->prepare("
                UPDATE `system_settings` SET `setting_value` = :value, `setting_type` = :type, `description` = :desc
                WHERE `setting_key` = :key
            ");
        } else {
            $stmt = $this->db->prepare("
                INSERT INTO `system_settings` (id, setting_key, setting_value, setting_type, description)
                VALUES (:id, :key, :value, :type, :desc)
            ");
        }
        
        $params = [
            ':key' => $key,
            ':value' => $value,
            ':type' => $type,
            ':desc' => $data['description'] ?? null
        ];
        
        if (!$existing) {
            $params[':id'] = generateUUID();
        }
        
        $stmt->execute($params);
        return $this->show($key);
    }
    
    /**
     * Custom actions
     */
    public function customAction($id, $action, $data = null) {
        switch ($action) {
            case 'bulk':
                return $this->bulkUpdate($data);
            case 'generate-number':
                return $this->generateNumber($data);
            default:
                jsonError('Action not implemented', 501);
        }
    }
    
    private function bulkUpdate($settings) {
        foreach ($settings as $key => $value) {
            $this->store([
                'setting_key' => $key,
                'setting_value' => $value
            ]);
        }
        return ['success' => true, 'message' => 'Settings updated'];
    }

    private function generateNumber($data) {
        $entityName = $data['entityName'] ?? 'Request';
        $prefix = $data['prefix'] ?? 'REQ';
        $year = date('Y');
        
        $tableMap = [
            'Payroll' => 'payroll',
            'Contract' => 'contracts',
            'LeaveRequest' => 'leave_requests',
            'Overtime' => 'overtime',
            'Bonus' => 'bonuses',
            'Resignation' => 'resignations',
        ];
        
        $table = $tableMap[$entityName] ?? strtolower($entityName);
        
        try {
            $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM `{$table}` WHERE YEAR(created_at) = :year");
            $stmt->execute([':year' => $year]);
            $count = (int)$stmt->fetch()['count'] + 1;
        } catch (Exception $e) {
            $count = 1;
        }
        
        return [
            'success' => true,
            'requestNumber' => $prefix . '-' . $year . '-' . str_pad($count, 5, '0', STR_PAD_LEFT)
        ];
    }
}
