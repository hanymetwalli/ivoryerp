<?php
/**
 * Trainings Controller
 */

require_once __DIR__ . '/BaseController.php';

class TrainingsController extends BaseController {
    protected $table = 'trainings';
    
    // Updated fillable fields to include Approval Chain
    protected $fillable = [
        'id', 'title', 'description', 'start_date', 'end_date', 'location', 
        'provider', 'cost', 'status', 'approval_chain', 'current_level_idx', 'current_status_desc'
    ];
    
    protected $searchable = ['title', 'provider'];
    
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
