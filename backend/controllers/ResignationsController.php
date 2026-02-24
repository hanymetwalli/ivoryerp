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
        if (empty($data['request_number'])) {
            $data['request_number'] = $this->generateRequestNumber('RES');
        }

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

        $result = parent::store($data);

        if (isset($result['id'])) {
            // Generate Approval Flow (New Polymorphic System)
            require_once __DIR__ . '/../services/WorkflowService.php';
            $workflowService = new WorkflowService();
            // Using ResignationRequest as requested
            $workflowService->generateFlow($this->table, $result['id'], 'ResignationRequest');
        }

        return $result;
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
    
    /**
     * معالجة كل صف لإرفاق خطوات الاعتماد الديناميكية
     */
    protected function processRow($row) {
        $row = parent::processRow($row);

        // جلب خطوات الاعتماد بالـ JOIN الذكي المماثل لـ PermissionsController
        try {
            $stmt = $this->db->prepare("
                SELECT s.id as step_id, s.approval_request_id, s.approver_user_id, s.role_id,
                       s.step_order, s.status, s.comments, s.is_name_visible, s.action_date,
                       s.created_at as step_created_at,
                       r.name as role_name, u.full_name as approver_name,
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
                
                // إذا كان هذا معتمد لمدير قسم الجذر (مدير الشركة)
                if (!empty($step['mgr_dept_id']) && $step['mgr_parent_dept_id'] === null) {
                    $step['approver_job_title'] = 'مدير الشركة';
                }

                // تطبيق الترجمة العربية للأدوار
                if (isset($roleMapping[$step['role_name']])) {
                    $step['role_name'] = $roleMapping[$step['role_name']];
                    if (empty($step['approver_job_title'])) {
                        $step['approver_job_title'] = $roleMapping[$step['role_name']];
                    }
                }

                unset($step['mgr_dept_id'], $step['mgr_parent_dept_id']);
                return $step;
            }, $steps);
        } catch (Exception $e) {
            $row['approval_steps'] = [];
        }

        // جلب حالة طلب الاعتماد الإجمالية
        try {
            $stmt = $this->db->prepare("SELECT id, status FROM approval_requests WHERE model_type = :mtype AND model_id = :mid LIMIT 1");
            $stmt->execute([':mtype' => $this->table, ':mid' => $row['id']]);
            $req = $stmt->fetch();
            if ($req) {
                $row['workflow_id'] = $req['id'];
                $row['workflow_status'] = $req['status'];
            }
        } catch (Exception $e) {
            error_log('ResignationsController processRow error: ' . $e->getMessage());
        }

        return $row;
    }

    /**
     * Custom Actions (Approve/Reject/Resubmit)
     */
    public function customAction($id, $action, $data = null) {
        if ($action === 'resubmit') {
            return $this->handleResubmit($id);
        }
        
        if (in_array($action, ['approve', 'reject', 'returned'])) {
            try {
                // Get the current pending step for this record
                $stmt = $this->db->prepare("
                    SELECT s.id FROM approval_steps s
                    JOIN approval_requests r ON s.approval_request_id = r.id
                    WHERE r.model_type = :mtype AND r.model_id = :mid AND s.status = 'pending'
                    ORDER BY s.step_order ASC LIMIT 1
                ");
                $stmt->execute([':mtype' => $this->table, ':mid' => $id]);
                $step = $stmt->fetch();
                
                if (!$step) {
                    throw new Exception("لا توجد خطوة اعتماد معلقة لهذا الطلب");
                }

                require_once __DIR__ . '/../services/WorkflowService.php';
                $workflowService = new WorkflowService();
                
                $workflowAction = ($action === 'approve') ? 'approved' : (($action === 'reject') ? 'rejected' : 'returned');
                
                $approverId = $data['user_id'] ?? $data['approver_id'] ?? null;
                $comments = $data['notes'] ?? $data['comments'] ?? '';
                
                return $workflowService->processAction($step['id'], $approverId, $workflowAction, $comments);
            } catch (Exception $e) {
                return ['error' => true, 'message' => $e->getMessage()];
            }
        }
        
        return parent::customAction($id, $action, $data);
    }

    /**
     * إعادة تقديم طلب مُرجَع: حذف المسار القديم وإنشاء مسار جديد
     */
    private function handleResubmit($id) {
        try {
            $this->db->beginTransaction();

            // 1. حذف مسار الاعتماد القديم
            $stmt = $this->db->prepare("SELECT id FROM approval_requests WHERE model_type = :mtype AND model_id = :mid");
            $stmt->execute([':mtype' => $this->table, ':mid' => $id]);
            $oldRequest = $stmt->fetch();

            if ($oldRequest) {
                $this->db->prepare("DELETE FROM approval_steps WHERE approval_request_id = :rid")
                         ->execute([':rid' => $oldRequest['id']]);
                $this->db->prepare("DELETE FROM approval_requests WHERE id = :id")
                         ->execute([':id' => $oldRequest['id']]);
            }

            // 2. إعادة الحالة إلى pending
            $this->db->prepare("UPDATE {$this->table} SET status = 'pending' WHERE id = :id")
                     ->execute([':id' => $id]);

            // 3. إنشاء مسار اعتماد جديد
            require_once __DIR__ . '/../services/WorkflowService.php';
            $workflowService = new WorkflowService();
            $workflowService->generateFlow($this->table, $id, 'ResignationRequest');

            $this->db->commit();
            return ['status' => 'success', 'message' => 'تم إعادة تقديم الطلب بنجاح'];
        } catch (Exception $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            http_response_code(500);
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }
}
