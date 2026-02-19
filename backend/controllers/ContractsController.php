<?php
/**
 * Contracts Controller
 */

require_once __DIR__ . '/BaseController.php';

class ContractsController extends BaseController {
    protected $table = 'contracts';
    
    // Updated fillable fields to match Database Schema
    // Replaced 'salary' with 'gross_salary' and added missing fields
    protected $fillable = [
        'id', 'request_number', 'employee_id', 'contract_number', 'contract_type',
        'start_date', 'end_date', 'gross_salary', 'currency', 'basic_salary',
        'housing_allowance', 'transport_allowance', 'other_allowances',
        'status', 'file_url', 'notes',
        'approval_chain', 'current_level_idx', 'current_status_desc'
    ];
    
    // Auto-calculate gross salary if missing
    public function store($data) {
        if (!isset($data['gross_salary'])) {
            $basic = $data['basic_salary'] ?? 0;
            $housing = $data['housing_allowance'] ?? 0;
            $transport = $data['transport_allowance'] ?? 0;
            $other = $data['other_allowances'] ?? 0;
            $data['gross_salary'] = $basic + $housing + $transport + $other;
        }
        
        // Ensure currency default
        if (empty($data['currency'])) {
            $data['currency'] = 'SAR';
        }

        return parent::store($data);
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
