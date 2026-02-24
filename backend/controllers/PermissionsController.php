<?php
/**
 * PermissionsController - نظام الاستئذان
 * مسؤول عن إنشاء طلبات الاستئذان والتحقق من الرصيد الشهري
 */

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../services/WorkflowService.php';
require_once __DIR__ . '/../services/ApprovalService.php';

class PermissionsController extends BaseController {
    protected $table = 'permission_requests';
    protected $fillable = [
        'user_id', 
        'employee_id', 
        'request_number',
        'request_date',
        'start_time', 
        'end_time', 
        'duration_minutes', 
        'status', 
        'reason' 
    ];

    /**
     * Override to include employee name
     */
    public function index() {
        $params = getQueryParams();
        
        // Use a subquery to get a unique employee_id per user to avoid duplicates
        $sql = "SELECT pr.*, 
                       COALESCE(pr.employee_id, ur.employee_id) as employee_id,
                       e.full_name as employee_name, e.employee_number,
                       u.full_name as user_name
                FROM permission_requests pr
                LEFT JOIN users u ON pr.user_id = u.id
                LEFT JOIN (
                    SELECT user_id, MAX(employee_id) as employee_id 
                    FROM user_roles 
                    WHERE status = 'active' AND employee_id IS NOT NULL 
                    GROUP BY user_id
                ) ur ON pr.user_id = ur.user_id
                LEFT JOIN employees e ON e.id = COALESCE(pr.employee_id, ur.employee_id)
                WHERE 1=1";
        
        $queryParams = [];
        
        if (!empty($params['status'])) {
            $sql .= " AND pr.status = :status";
            $queryParams[':status'] = $params['status'];
        }
        
        if (!empty($params['employee_id'])) {
            // Check against both the direct ID and the inferred ID
            $sql .= " AND COALESCE(pr.employee_id, ur.employee_id) = :employee_id";
            $queryParams[':employee_id'] = $params['employee_id'];
        }
        
        $sql .= " ORDER BY pr.created_at DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($queryParams);
        $data = $stmt->fetchAll();
        
        // Process rows to decode JSON fields (like approval_chain)
        $data = array_map([$this, 'processRow'], $data);

        return ['data' => $data];
    }

    /**
     * التحقق من رصيد الاستئذان الشهري
     */
    private function validateMonthlyBalance($employeeId, $requestDate, $newDurationMinutes, $excludeRequestId = null) {
        // 1. قراءة الحد الأقصى من جدول system_settings
        $stmt = $this->db->prepare("SELECT `setting_value` FROM `system_settings` WHERE `setting_key` = 'monthly_permission_limit_minutes' LIMIT 1");
        $stmt->execute();
        $setting = $stmt->fetch();
        // الحد الافتراضي 240 دقيقة (4 ساعات)
        $monthlyLimit = ($setting && isset($setting['setting_value']) && (int)$setting['setting_value'] > 0) ? (int)$setting['setting_value'] : 240;

        // 2. حساب الدقائق المستهلكة هذا الشهر للطلبات (Approved or Pending)
        $month = date('Y-m', strtotime($requestDate));
        
        $sql = "SELECT SUM(duration_minutes) as consumed 
                FROM `permission_requests` 
                WHERE `employee_id` = :employee_id 
                AND `status` IN ('approved', 'pending') 
                AND DATE_FORMAT(`request_date`, '%Y-%m') = :month";
        
        $params = [
            ':employee_id' => $employeeId,
            ':month' => $month
        ];

        if ($excludeRequestId) {
            $sql .= " AND `id` != :exclude_id";
            $params[':exclude_id'] = $excludeRequestId;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $consumedRow = $stmt->fetch();
        $consumedMinutes = $consumedRow ? (int)$consumedRow['consumed'] : 0;

        // 3. التحقق من تجاوز الحد
        if (($consumedMinutes + $newDurationMinutes) > $monthlyLimit) {
            $remaining = max(0, $monthlyLimit - $consumedMinutes);
            return [
                'isValid' => false,
                'limit_minutes' => $monthlyLimit,
                'consumed_minutes' => $consumedMinutes,
                'remaining_minutes' => $remaining,
                'requested_minutes' => $newDurationMinutes
            ];
        }

        return ['isValid' => true];
    }

    /**
     * إنشاء طلب استئذان جديد (Overrides BaseController::store)
     */
    public function store($requestData) {
        try {
            $userId = $requestData['user_id'] ?? null;
            $employeeId = $requestData['employee_id'] ?? null;
            $startTime = $requestData['start_time'] ?? null;
            $endTime = $requestData['end_time'] ?? null;

            // 1. التحقق من صحة البيانات الأساسية
            if (!$userId || !$startTime || !$endTime) {
                http_response_code(400);
                return ['error' => true, 'message' => 'بيانات الطلب غير مكتملة (user_id, start_time, end_time مطلوبة)'];
            }

            // 2. حساب مدة الطلب والتحقق من المنطق الزمني
            $baseDate = date('Y-m-d'); 
            
            if (strpos($startTime, '-') !== false || strpos($startTime, '/') !== false) {
                 $start = new DateTime($startTime);
            } else {
                 $start = new DateTime("$baseDate $startTime");
            }

            if (strpos($endTime, '-') !== false || strpos($endTime, '/') !== false) {
                 $end = new DateTime($endTime);
            } else {
                 $end = new DateTime("$baseDate $endTime");
            }

            if ($end <= $start) {
                http_response_code(422);
                return ['error' => true, 'message' => 'وقت النهاية يجب أن يكون بعد وقت البداية'];
            }

            $interval = $start->diff($end);
            $newDuration = ($interval->days * 24 * 60) + ($interval->h * 60) + $interval->i;

            if ($newDuration <= 0) {
                 http_response_code(422);
                 return ['error' => true, 'message' => 'مدة الاستئذان غير صالحة'];
            }

            // 3. التحقق من رصيد الاستئذان الشهري
            $requestDate = date('Y-m-d', $start->getTimestamp());
            $validation = $this->validateMonthlyBalance($employeeId, $requestDate, $newDuration);

            if (!$validation['isValid']) {
                http_response_code(422);
                return [
                    'error' => true, 
                    'message' => "عذراً، هذا الطلب يتجاوز رصيد الاستئذان الشهري المسموح به. (الحد المسموح: {$validation['limit_minutes']} دقيقة، المستهلك: {$validation['consumed_minutes']} دقيقة، المتبقي: {$validation['remaining_minutes']} دقيقة).",
                    'details' => [
                        'limit_minutes' => $validation['limit_minutes'],
                        'consumed_minutes' => $validation['consumed_minutes'],
                        'remaining_minutes' => $validation['remaining_minutes'],
                        'requested_minutes' => $validation['requested_minutes'],
                        'status' => 'limit_exceeded'
                    ]
                ];
            }

            // 4. Request Number Generation
            $year = date('Y');
            $stmt = $this->db->prepare("SELECT MAX(CAST(SUBSTRING_INDEX(request_number, '-', -1) AS UNSIGNED)) as max_count FROM `{$this->table}` WHERE YEAR(created_at) = :year");
            $stmt->execute([':year' => $year]);
            $row = $stmt->fetch();
            $count = ($row && $row['max_count']) ? $row['max_count'] + 1 : 1;
            $requestNumber = 'PR-' . $year . '-' . str_pad($count, 5, '0', STR_PAD_LEFT);

            // 5. Prepare Data for Save
            $dataToStore = [
                'user_id' => $userId,
                'employee_id' => $employeeId,
                'request_number' => $requestNumber,
                'request_date' => $requestDate,
                'start_time' => $start->format('H:i:s'),
                'end_time' => $end->format('H:i:s'),
                'duration_minutes' => $newDuration,
                'reason' => $requestData['reason'] ?? null,
                'status' => 'pending',
            ];

            $storedRequest = parent::store($dataToStore);

            if (isset($storedRequest['error']) && $storedRequest['error']) {
                return $storedRequest;
            }

            // 8. Generate Approval Flow (New Polymorphic System)
            $workflowService = new WorkflowService();
            $workflowService->generateFlow('permission_requests', $storedRequest['id'], 'PermissionRequest');

            return [
                'success' => true,
                'message' => 'تم تقديم طلب الاستئذان بنجاح',
                'data' => $storedRequest
            ];

        } catch (Throwable $e) {
            http_response_code(500);
            return ['error' => true, 'message' => 'حدث خطأ غير متوقع: ' . $e->getMessage()];
        }
    }

    /**
     * تعديل طلب استئذان (Overrides BaseController::update)
     */
    public function update($id, $requestData) {
        try {
            // جلب البيانات القديمة
            $oldRequest = $this->show($id);
            if (isset($oldRequest['error'])) return $oldRequest;

            // فقط الطلبات التي حالتها pending يمكن تعديل وقتها/تاريخها في المعتاد
            // لكن هنا سنطبق التحقق على أي تحديث للمدة أو التاريخ
            $employeeId = $requestData['employee_id'] ?? $oldRequest['employee_id'];
            $startTime = $requestData['start_time'] ?? $oldRequest['start_time'];
            $endTime = $requestData['end_time'] ?? $oldRequest['end_time'];
            $requestDate = $requestData['request_date'] ?? $oldRequest['request_date'];

            // حساب المدة الجديدة إذا تغير الوقت
            $baseDate = $requestDate;
            if (strpos($startTime, ':') !== false && strpos($startTime, '-') === false) {
                $start = new DateTime("$baseDate $startTime");
            } else {
                $start = new DateTime($startTime);
            }

            if (strpos($endTime, ':') !== false && strpos($endTime, '-') === false) {
                $end = new DateTime("$baseDate $endTime");
            } else {
                $end = new DateTime($endTime);
            }

            if ($end <= $start) {
                http_response_code(422);
                return ['error' => true, 'message' => 'وقت النهاية يجب أن يكون بعد وقت البداية'];
            }

            $interval = $start->diff($end);
            $newDuration = ($interval->days * 24 * 60) + ($interval->h * 60) + $interval->i;

            // التحقق من الرصيد
            $validation = $this->validateMonthlyBalance($employeeId, $requestDate, $newDuration, $id);

            if (!$validation['isValid']) {
                http_response_code(422);
                return [
                    'error' => true, 
                    'message' => "عذراً، هذا التعديل يتجاوز رصيد الاستئذان الشهري المسموح به. (الحد المسموح: {$validation['limit_minutes']} دقيقة، المستهلك: {$validation['consumed_minutes']} دقيقة، المتبقي: {$validation['remaining_minutes']} دقيقة).",
                    'details' => [
                        'limit_minutes' => $validation['limit_minutes'],
                        'consumed_minutes' => $validation['consumed_minutes'],
                        'remaining_minutes' => $validation['remaining_minutes'],
                        'requested_minutes' => $newDuration,
                        'status' => 'limit_exceeded'
                    ]
                ];
            }

            // تحديث البيانات
            $requestData['duration_minutes'] = $newDuration;
            $requestData['start_time'] = $start->format('H:i:s');
            $requestData['end_time'] = $end->format('H:i:s');
            $requestData['request_date'] = $start->format('Y-m-d');

            return parent::update($id, $requestData);

        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => true, 'message' => 'حدث خطأ غير متوقع أثناء التعديل: ' . $e->getMessage()];
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
                $this->db->prepare("DELETE FROM approval_steps WHERE approval_request_id = :rid")
                         ->execute([':rid' => $oldRequest['id']]);
                $this->db->prepare("DELETE FROM approval_requests WHERE id = :id")
                         ->execute([':id' => $oldRequest['id']]);
            }

            // 2. Update permission request status back to pending
            $this->db->prepare("UPDATE {$this->table} SET status = 'pending' WHERE id = :id")
                     ->execute([':id' => $id]);

            // 3. Generate new approval flow
            $workflowService = new WorkflowService();
            $workflowService->generateFlow($this->table, $id, 'PermissionRequest');

            $this->db->commit();
            return ['status' => 'success', 'message' => 'تم إعادة تقديم الطلب بنجاح'];
        } catch (Exception $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            http_response_code(500);
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }

    /**
     * Process each row to include dynamic approval steps
     */
    protected function processRow($row) {
        $row = parent::processRow($row);
        
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
            error_log('PermissionsController processRow approval_steps error: ' . $e->getMessage());
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
            error_log('PermissionsController processRow approval_requests error: ' . $e->getMessage());
        }
        
        return $row;
    }
}
