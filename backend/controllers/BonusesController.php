<?php
/**
 * Bonuses Controller
 */

require_once __DIR__ . '/BaseController.php';

class BonusesController extends BaseController {
    protected $table = 'bonuses';
    protected $fillable = [
        'id', 'request_number', 'employee_id', 'title', 'amount', 'currency', 
        'date', 'month', 'year', 'reason', 'status',
        'approval_chain', 'current_level_idx', 'current_status_desc'
    ];
    
    // Custom Actions for Approval
    public function customAction($id, $action, $data = null) {
        if ($action === 'approve' || $action === 'reject') {
            require_once __DIR__ . '/../services/ApprovalService.php';
            $currentUser = [
                'id' => $data['approver_id'] ?? 'admin',
                'name' => $data['approver_name'] ?? 'System Admin',
                'role' => 'admin'
            ];
            $service = new ApprovalService($this->db, $currentUser);
            $result = $service->process($this->table, $id, $action, $data['notes'] ?? null);
            
            if ($result['success']) return $this->show($id);
            return ['error' => true, 'message' => $result['error']];
        }
        return parent::customAction($id, $action, $data);
    }
    
    // Auto-fill missing required fields
    public function store($data) {
        if (empty($data['request_number'])) {
            $data['request_number'] = $this->generateRequestNumber('BON');
        }
        
        // Auto-calculate month/year from date if missing
        if (!empty($data['date'])) {
            $ts = strtotime($data['date']);
            if (empty($data['month'])) $data['month'] = date('n', $ts);
            if (empty($data['year'])) $data['year'] = date('Y', $ts);
        } else {
            // Default to today if date missing
            $data['date'] = date('Y-m-d');
            $data['month'] = date('n');
            $data['year'] = date('Y');
        }
        
        // Ensure currency
        if (empty($data['currency'])) $data['currency'] = 'SAR';
        
        return parent::store($data);
    }
    
    private function generateRequestNumber($prefix) {
        $year = date('Y');
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM {$this->table} WHERE YEAR(created_at) = :year");
        $stmt->execute([':year' => $year]);
        $count = $stmt->fetch()['count'] + 1;
        return $prefix . '-' . $year . '-' . str_pad($count, 5, '0', STR_PAD_LEFT);
    }
}
