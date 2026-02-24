<?php
/**
 * Leaves (Leave Requests) Controller
 */

require_once __DIR__ . '/BaseController.php';

class LeavesController extends BaseController {
    protected $table = 'leave_requests';
    
    protected $fillable = [
        'request_number', 'employee_id', 'leave_type_id',
        'start_date', 'end_date', 'days_count', 'reason', 'document_url',
        'status'
    ];
    
    protected $searchable = ['request_number'];
    protected $defaultSort = 'created_at';
    
    /**
     * Override to include employee and leave type names
     */
    public function index() {
        $params = getQueryParams();
        
        $sql = "SELECT lr.*, e.full_name as employee_name, e.employee_number,
                       lt.name as leave_type_name
                FROM leave_requests lr
                LEFT JOIN employees e ON lr.employee_id = e.id
                LEFT JOIN leave_types lt ON lr.leave_type_id = lt.id
                WHERE 1=1";
        
        $queryParams = [];
        
        if (!empty($params['status'])) {
            $sql .= " AND lr.status = :status";
            $queryParams[':status'] = $params['status'];
        }
        
        if (!empty($params['employee_id'])) {
            $sql .= " AND lr.employee_id = :employee_id";
            $queryParams[':employee_id'] = $params['employee_id'];
        }
        
        $sql .= " ORDER BY lr.created_at DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($queryParams);
        $data = $stmt->fetchAll();
        
        return ['data' => array_map([$this, 'processRow'], $data)];
    }

    protected function processRow($row) {
        if (!$row) return null;
        
        // Fetch approval steps for this request (protected with try-catch)
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

            // Re-map step_id to id for frontend compatibility
            $row['approval_steps'] = array_map(function($step) use ($roleMapping) {
                $step['id'] = $step['step_id'];
                unset($step['step_id']);
                // If this approver manages the root department (no parent), label as "مدير الشركة"
                // mgr_dept_id is NOT NULL only when the person IS actually a department manager
                if (!empty($step['mgr_dept_id']) && $step['mgr_parent_dept_id'] === null) {
                    $step['approver_job_title'] = 'مدير الشركة';
                }

                // Apply Arabic mapping for role names
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
            error_log('LeavesController processRow approval_steps error: ' . $e->getMessage());
            $row['approval_steps'] = [];
        }

        // Get overall approval request status
        try {
            $stmt = $this->db->prepare("SELECT id, status FROM approval_requests WHERE model_type = :mtype AND model_id = :mid LIMIT 1");
            $stmt->execute([':mtype' => $this->table, ':mid' => $row['id']]);
            $req = $stmt->fetch();
            if ($req) {
                $row['workflow_id'] = $req['id'];
                $row['workflow_status'] = $req['status'];
            }
        } catch (Exception $e) {
            error_log('LeavesController processRow approval_requests error: ' . $e->getMessage());
        }

        return $row;
    }
    
    /**
     * Auto-calculate days and generate request number
     */
    public function store($data) {
        try {
            // Generate request number
            if (empty($data['request_number'])) {
                $data['request_number'] = $this->generateRequestNumber('LV');
            }
            
            // Calculate days count
            if (!empty($data['start_date']) && !empty($data['end_date'])) {
                $start = new DateTime($data['start_date']);
                $end = new DateTime($data['end_date']);
                $diff = $start->diff($end);
                $data['days_count'] = $diff->days + 1;
            }
            
            $result = parent::store($data);

            if (isset($result['id'])) {
                // Generate Approval Flow (New Polymorphic System)
                require_once __DIR__ . '/../services/WorkflowService.php';
                $workflowService = new WorkflowService();
                $workflowService->generateFlow($this->table, $result['id'], 'LeaveRequest');
            }

            return $result;
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }

    /**
     * Handle custom actions (e.g., resubmit)
     */
    public function customAction($id, $action, $data = null) {
        if ($action === 'resubmit') {
            return $this->handleResubmit($id);
        }
        return parent::customAction($id, $action, $data);
    }

    /**
     * Re-submit a returned request: delete old approval flow and generate new one
     */
    private function handleResubmit($id) {
        try {
            $this->db->beginTransaction();

            // 1. Delete old approval flow
            $stmt = $this->db->prepare("SELECT id FROM approval_requests WHERE model_type = :mtype AND model_id = :mid");
            $stmt->execute([':mtype' => $this->table, ':mid' => $id]);
            $oldRequest = $stmt->fetch();

            if ($oldRequest) {
                // Delete steps first (FK constraint)
                $this->db->prepare("DELETE FROM approval_steps WHERE approval_request_id = :rid")
                         ->execute([':rid' => $oldRequest['id']]);
                // Delete the request
                $this->db->prepare("DELETE FROM approval_requests WHERE id = :id")
                         ->execute([':id' => $oldRequest['id']]);
            }

            // 2. Update leave request status back to pending
            $this->db->prepare("UPDATE {$this->table} SET status = 'pending' WHERE id = :id")
                     ->execute([':id' => $id]);

            // 3. Generate new approval flow
            require_once __DIR__ . '/../services/WorkflowService.php';
            $workflowService = new WorkflowService();
            $workflowService->generateFlow($this->table, $id, 'LeaveRequest');

            $this->db->commit();
            return ['status' => 'success', 'message' => 'تم إعادة تقديم الطلب بنجاح'];
        } catch (Exception $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            http_response_code(500);
            return ['error' => true, 'message' => $e->getMessage()];
        }
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
