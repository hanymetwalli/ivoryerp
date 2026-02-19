<?php
/**
 * Resignations Controller
 */

require_once __DIR__ . '/BaseController.php';

class ResignationsController extends BaseController {
    protected $table = 'resignations';
    protected $fillable = [
        'id', 'request_number', 'employee_id', 'resignation_date', 'submission_date', 'end_of_service_date', 
        'notice_period_days', 'last_working_day', 'reason', 
        'status', 'handover_notes', 'exit_interview_notes',
        'approval_chain', 'current_level_idx', 'current_status_desc'
    ];
    
    // Auto-generate request number and handle dates
    public function store($data) {
        // DEBUG LOGGING
        error_log("ResignationsController::store INPUT: " . print_r($data, true));

        if (empty($data['request_number'])) {
            $data['request_number'] = $this->generateRequestNumber('RES');
        }

        // Map frontend fields to DB fields if they differ
        // Frontend sends: resignation_date, end_of_service_date
        // DB might expect: submission_date, last_working_day
        
        // Ensure resignation_date (submission_date) is set
        if (empty($data['resignation_date'])) {
            $data['resignation_date'] = date('Y-m-d');
        }
        
        // Ensure end_of_service_date (last_working_day) is set
        if (empty($data['end_of_service_date']) && !empty($data['resignation_date'])) {
            // Default 30 days notice
            $data['end_of_service_date'] = date('Y-m-d', strtotime($data['resignation_date'] . ' + 30 days'));
        }

        // Map for legacy columns if they exist
        if (empty($data['submission_date'])) $data['submission_date'] = $data['resignation_date'];
        if (empty($data['last_working_day'])) $data['last_working_day'] = $data['end_of_service_date'];
        
        // Default status
        if (empty($data['status'])) $data['status'] = 'pending';

        return parent::store($data);
    }

    private function generateRequestNumber($prefix) {
        $year = date('Y');
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM {$this->table} WHERE YEAR(created_at) = :year");
        $stmt->execute([':year' => $year]);
        $count = $stmt->fetch()['count'] + 1;
        return $prefix . '-' . $year . '-' . str_pad($count, 5, '0', STR_PAD_LEFT);
    }
    
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
}
