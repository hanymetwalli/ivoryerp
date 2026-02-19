<?php
/**
 * Overtime Controller
 */

require_once __DIR__ . '/BaseController.php';

class OvertimeController extends BaseController {
    protected $table = 'overtime';
    protected $fillable = [
        'id', 'request_number', 'employee_id', 'date', 'hours', 'reason', 
        'hourly_rate', 'overtime_rate', 'total_amount', 'multiplier', 
        'status', 'amount', 'approval_chain', 'current_level_idx', 'current_status_desc'
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
    
    // Auto-generate request number
    public function store($data) {
        if (empty($data['request_number'])) {
            $data['request_number'] = $this->generateRequestNumber('OT');
        }
        
        // Calculate amount if rates are missing (basic calculation)
        if (empty($data['total_amount']) && !empty($data['hours'])) {
            // Default rate fallback if not provided
            $rate = $data['hourly_rate'] ?? 0;
            $multiplier = $data['overtime_rate'] ?? 1.5;
            $data['total_amount'] = $data['hours'] * $rate * $multiplier;
        }
        
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
