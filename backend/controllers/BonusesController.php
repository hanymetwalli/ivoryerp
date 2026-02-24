<?php
/**
 * Bonuses Controller - نظام المكافآت
 * يستخدم WorkflowService لإنشاء مسار الاعتمادات الديناميكي
 */

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../services/WorkflowService.php';

class BonusesController extends BaseController {
    protected $table = 'bonuses';
    protected $fillable = [
        'id', 'request_number', 'employee_id', 'title', 'amount', 'currency',
        'date', 'month', 'year', 'reason', 'status', 'notes'
    ];

    /**
     * إنشاء مكافأة مع توليد مسار الاعتماد
     */
    public function store($data) {
        try {
            // 1. توليد رقم الطلب
            if (empty($data['request_number'])) {
                $data['request_number'] = $this->generateRequestNumber('BON');
            }

            // 2. حساب الشهر والسنة من التاريخ
            if (!empty($data['date'])) {
                $ts = strtotime($data['date']);
                if (empty($data['month'])) $data['month'] = date('n', $ts);
                if (empty($data['year'])) $data['year'] = date('Y', $ts);
            } else {
                $data['date'] = date('Y-m-d');
                $data['month'] = date('n');
                $data['year'] = date('Y');
            }

            // 3. تعيين العملة الافتراضية
            if (empty($data['currency'])) $data['currency'] = 'SAR';

            // 4. تعيين الحالة الأولية
            $data['status'] = 'pending';

            // 5. حفظ الطلب
            $storedRequest = parent::store($data);

            if (isset($storedRequest['error']) && $storedRequest['error']) {
                return $storedRequest;
            }

            // 6. إنشاء مسار الاعتماد عبر WorkflowService
            $workflowService = new WorkflowService();
            $workflowService->generateFlow($this->table, $storedRequest['id'], 'BonusRequest');

            return [
                'success' => true,
                'message' => 'تم تقديم طلب المكافأة بنجاح',
                'data' => $storedRequest
            ];
        } catch (Throwable $e) {
            http_response_code(500);
            return ['error' => true, 'message' => 'حدث خطأ: ' . $e->getMessage()];
        }
    }

    /**
     * Custom Actions - يوجه إجراء resubmit إلى handleResubmit
     */
    public function customAction($id, $action, $data = null) {
        if ($action === 'resubmit') {
            return $this->handleResubmit($id);
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
            $workflowService = new WorkflowService();
            $workflowService->generateFlow($this->table, $id, 'BonusRequest');

            $this->db->commit();
            return ['status' => 'success', 'message' => 'تم إعادة تقديم الطلب بنجاح'];
        } catch (Exception $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            http_response_code(500);
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }

    /**
     * معالجة كل صف لإرفاق خطوات الاعتماد الديناميكية
     */
    protected function processRow($row) {
        $row = parent::processRow($row);

        // جلب خطوات الاعتماد
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
            error_log('BonusesController processRow approval_steps error: ' . $e->getMessage());
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
            error_log('BonusesController processRow approval_requests error: ' . $e->getMessage());
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
