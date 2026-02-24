<?php
/**
 * Evaluations Controller (Performance)
 */

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../services/WorkflowService.php';

class EvaluationsController extends BaseController {
    // Correct table name per database schema
    protected $table = 'performance_evaluations';
    
    // Mapped fields to match DB columns
    protected $fillable = [
        'id', 'evaluation_number', 'employee_id', 'period_start', 'period_end', 
        'template_id', 'overall_score', 'overall_rating', 'status', 'evaluator_id', 
        'approval_chain', 'current_level_idx', 'current_status_desc',
        'kpi_scores', 'strengths', 'areas_for_improvement', 'goals', 'recommendations',
        'signatures', 'development_plan'
    ];
    
    // Auto-generate evaluation number
    public function store($data) {
        if (empty($data['evaluation_number'])) {
            $data['evaluation_number'] = $this->generateRequestNumber('EVAL');
        }
        
        // Map frontend field names to DB names if needed
        if (isset($data['evaluation_period_start'])) $data['period_start'] = $data['evaluation_period_start'];
        if (isset($data['evaluation_period_end'])) $data['period_end'] = $data['evaluation_period_end'];

        // Fix Status
        if (empty($data['status'])) $data['status'] = 'draft';
        if (isset($data['status']) && is_array($data['status'])) {
            $data['status'] = $data['status']['value'] ?? 'draft';
        }
        
        $result = parent::store($data);

        // Only generate flow if explicitly submitting (status != draft) 
        // OR if the user always wants a flow (user didn't specify, but I'll follow PermissionsController which does it on store)
        // User instruction: "in store function call WorkflowService::generateFlow('performance_evaluations', $evaluation_id, 'PerformanceEvaluation')"
        if (isset($result['id']) && (!isset($data['status']) || $data['status'] !== 'draft')) {
            $workflowService = new WorkflowService();
            $workflowService->generateFlow($this->table, $result['id'], 'PerformanceEvaluation');
        }

        return $result;
    }
    
    public function update($id, $data) {
        // Handle explicit submission from draft
        $oldRecord = $this->show($id);
        
        $result = parent::update($id, $data);

        // If status changed from draft to pending, generate workflow
        if ($oldRecord && $oldRecord['status'] === 'draft' && isset($data['status']) && $data['status'] === 'pending') {
            $workflowService = new WorkflowService();
            $workflowService->generateFlow($this->table, $id, 'PerformanceEvaluation');
        }

        return $result;
    }

    /**
     * معالجة الإجراءات المخصصة (اعتماد/رفض/إرجاع)
     */
    public function customAction($id, $action, $data = null) {
        if (in_array($action, ['approve', 'reject', 'returned'])) {
            try {
                // البحث عن الخطوة المعلقة الحالية
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
     * تعزيز البيانات بخطوات الاعتماد
     */
    protected function processRow($row) {
        $row = parent::processRow($row);

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

            $roleMapping = [
                'hr_manager' => 'مدير قسم الموارد البشرية',
                'finance_manager' => 'مدير الحسابات',
                'manager' => 'مدير الشركة',
                'admin' => 'مدير النظام'
            ];

            $row['approval_steps'] = array_map(function($step) use ($roleMapping) {
                $step['id'] = $step['step_id'];
                unset($step['step_id']);
                if (!empty($step['mgr_dept_id']) && $step['mgr_parent_dept_id'] === null) {
                    $step['approver_job_title'] = 'مدير الشركة';
                }

                if (isset($roleMapping[$step['role_name']])) {
                    $step['role_name'] = $roleMapping[$step['role_name']];
                    if (empty($step['approver_job_title'])) {
                        $step['approver_job_title'] = $roleMapping[$step['role_name']];
                    }
                }

                unset($step['mgr_dept_id'], $step['mgr_parent_dept_id']);
                return $step;
            }, $steps);

            // Get global status
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
        $year = date('Y');
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM {$this->table} WHERE YEAR(created_at) = :year");
        $stmt->execute([':year' => $year]);
        $count = $stmt->fetch()['count'] + 1;
        return $prefix . '-' . $year . '-' . str_pad($count, 5, '0', STR_PAD_LEFT);
    }
}
