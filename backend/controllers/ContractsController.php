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
        'status', 'approval_status', 'file_url', 'notes',
        'approval_chain', 'current_level_idx', 'current_status_desc', 'approval_history'
    ];
    
    // Auto-calculate gross salary if missing and handle workflow
    public function store($data) {
        try {
            if (!isset($data['gross_salary'])) {
                $basic = $data['basic_salary'] ?? 0;
                $housing = $data['housing_allowance'] ?? 0;
                $transport = $data['transport_allowance'] ?? 0;
                $other = $data['other_allowances'] ?? 0;
                $data['gross_salary'] = $basic + $housing + $transport + $other;
            }
            
            // Generate Request Number
            if (empty($data['request_number'])) {
                $data['request_number'] = $this->generateRequestNumber('CON');
            }

            // Ensure currency default
            if (empty($data['currency'])) {
                $data['currency'] = 'SAR';
            }

            // Initial status for new contracts is draft
            $data['status'] = 'draft';
            $data['approval_status'] = 'pending';
            
            $storedRecord = parent::store($data);
            
            if (isset($storedRecord['error']) && $storedRecord['error']) {
                return $storedRecord;
            }

            // Generate Workflow Flow
            require_once __DIR__ . '/../services/WorkflowService.php';
            $workflowService = new WorkflowService();
            $workflowService->generateFlow($this->table, $storedRecord['id'], 'ContractRequest');

            return [
                'success' => true,
                'message' => 'تم تقديم العقد بنجاح تحت المراجعة',
                'data' => $storedRecord
            ];
        } catch (Throwable $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            http_response_code(500);
            return ['error' => true, 'message' => 'حدث خطأ: ' . $e->getMessage()];
        }
    }
    
    // Custom Actions for Approval and Resubmit
    public function customAction($id, $action, $data = null) {
        if ($action === 'resubmit') {
            return $this->handleResubmit($id);
        }
        if ($action === 'approve' || $action === 'reject') {
            return ['error' => true, 'message' => 'يرجى استخدام نظام الاعتمادات الجديد'];
        }
        return parent::customAction($id, $action, $data);
    }

    private function handleResubmit($id) {
        try {
            $this->db->beginTransaction();

            // 1. Delete old approval request and steps
            $stmt = $this->db->prepare("SELECT id FROM approval_requests WHERE model_type = :mtype AND model_id = :mid");
            $stmt->execute([':mtype' => $this->table, ':mid' => $id]);
            $oldRef = $stmt->fetch();

            if ($oldRef) {
                $this->db->prepare("DELETE FROM approval_steps WHERE approval_request_id = :rid")
                         ->execute([':rid' => $oldRef['id']]);
                $this->db->prepare("DELETE FROM approval_requests WHERE id = :id")
                         ->execute([':id' => $oldRef['id']]);
            }

            // 2. Reset status
            $this->db->prepare("UPDATE {$this->table} SET approval_status = 'pending' WHERE id = :id")
                     ->execute([':id' => $id]);

            // 3. Generate new flow
            require_once __DIR__ . '/../services/WorkflowService.php';
            $workflowService = new WorkflowService();
            $workflowService->generateFlow($this->table, $id, 'ContractRequest');

            $this->db->commit();
            return ['status' => 'success', 'message' => 'تم إعادة تقديم العقد بنجاح'];
        } catch (Exception $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            http_response_code(500);
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }

    protected function processRow($row) {
        $row = parent::processRow($row);

        try {
            // Join approval steps for the timeline with more details
            $stmt = $this->db->prepare("
                SELECT s.id as step_id, s.step_order, s.status, s.comments, s.action_date,
                       r.name as role_name, u.full_name as approver_name,
                       s.approver_user_id, s.role_id, s.is_name_visible,
                       COALESCE(pos.name, emp.position) as approver_job_title,
                       mgr_dept.id as mgr_dept_id,
                       mgr_dept.parent_department_id as mgr_parent_dept_id
                FROM approval_steps s
                LEFT JOIN roles r ON s.role_id = r.id
                LEFT JOIN users u ON s.approver_user_id = u.id
                LEFT JOIN employees emp ON u.email = emp.email
                LEFT JOIN positions pos ON emp.position = pos.id
                LEFT JOIN departments mgr_dept ON mgr_dept.manager_id = emp.id
                JOIN approval_requests req ON s.approval_request_id = req.id
                WHERE req.model_type = :mtype AND req.model_id = :mid
                ORDER BY s.step_order ASC
            ");
            $stmt->execute([':mtype' => $this->table, ':mid' => $row['id']]);
            $steps = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Mapping for Role Names to Arabic
            $roleMapping = [
                'hr_manager' => 'مدير قسم الموارد البشرية',
                'finance_manager' => 'مدير الحسابات',
                'manager' => 'مدير الشركة',
                'admin' => 'مدير النظام'
            ];

            $row['approval_steps'] = array_map(function($step) use ($roleMapping) {
                $step['id'] = $step['step_id'];
                unset($step['step_id']);

                // If this is a department manager at the root level, it's the Company Manager
                if (!empty($step['mgr_dept_id']) && $step['mgr_parent_dept_id'] === null) {
                    $step['approver_job_title'] = 'مدير الشركة';
                }

                // Apply Arabic mapping for role names if no job title exists or if it's a specific role
                if (isset($roleMapping[$step['role_name']])) {
                    $step['role_name'] = $roleMapping[$step['role_name']];
                    // If no job title yet, use the localized role name as job title
                    if (empty($step['approver_job_title'])) {
                        $step['approver_job_title'] = $roleMapping[$step['role_name']] ?? $step['role_name'];
                    }
                }

                unset($step['mgr_dept_id'], $step['mgr_parent_dept_id']);
                return $step;
            }, $steps);

            // Get request status
            $stmt = $this->db->prepare("SELECT id, status FROM approval_requests WHERE model_type = :mtype AND model_id = :mid LIMIT 1");
            $stmt->execute([':mtype' => $this->table, ':mid' => $row['id']]);
            $req = $stmt->fetch();
            if ($req) {
                $row['workflow_id'] = $req['id'];
                $row['workflow_status'] = $req['status'];
            }
        } catch (Exception $e) {
            $row['approval_steps'] = [];
        }

        return $row;
    }

    private function generateRequestNumber($prefix) {
        try {
            $year = date('Y');
            $stmt = $this->db->prepare("SELECT MAX(CAST(SUBSTRING_INDEX(request_number, '-', -1) AS UNSIGNED)) as max_count FROM `{$this->table}` WHERE YEAR(created_at) = :year");
            $stmt->execute([':year' => $year]);
            $row = $stmt->fetch();
            $count = ($row && $row['max_count']) ? $row['max_count'] + 1 : 1;
            return $prefix . '-' . $year . '-' . str_pad($count, 5, '0', STR_PAD_LEFT);
        } catch (Exception $e) {
            return $prefix . '-' . date('Y') . '-' . rand(10000, 99999);
        }
    }
}
