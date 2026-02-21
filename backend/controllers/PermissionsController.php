<?php
/**
 * PermissionsController - نظام الاستئذان
 * مسؤول عن إنشاء طلبات الاستئذان والتحقق من الرصيد الشهري
 */

require_once __DIR__ . '/BaseController.php';
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
        'approval_chain',
        'current_level_idx',
        'current_status_desc',
        'rejection_reason',
        'current_stage_role_id',
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

            // 4. تجهيز بيانات الدور (Manager Role ID)
            $roleStmt = $this->db->prepare("SELECT id FROM roles WHERE name = 'manager' LIMIT 1");
            $roleStmt->execute();
            $managerRole = $roleStmt->fetch();
            $managerRoleId = $managerRole ? $managerRole['id'] : null;

            if (!$managerRoleId) {
                 $roleStmt = $this->db->prepare("SELECT id FROM roles WHERE name = 'admin' LIMIT 1");
                 $roleStmt->execute();
                 $adminRole = $roleStmt->fetch();
                 $managerRoleId = $adminRole ? $adminRole['id'] : 1; 
            }

            // 5. Request Number Generation
            $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM `permission_requests` WHERE YEAR(created_at) = YEAR(CURDATE())");
            $stmt->execute();
            $count = $stmt->fetch()['count'] + 1;
            $requestNumber = 'PR-' . date('Y') . '-' . str_pad($count, 5, '0', STR_PAD_LEFT);

            // 6. Generate Approval Chain (Using WorkflowHelper)
            require_once __DIR__ . '/../helpers/workflow.php';
            $wf = new WorkflowHelper($this->db);
            $chain = $wf->getApprovalChain($employeeId, false, 'PermissionRequest');
            
            $initialStatus = 'pending';
            $currentLevelIdx = 0;
            $currentStatusDesc = '';
            
            if (!empty($chain)) {
                $firstStep = $chain[0];
                $approverTitle = $firstStep['level_name'] ?? $firstStep['role_required'];
                $approverName = $firstStep['approver_name'] ?? '';
                $currentStatusDesc = "جارى الاعتماد من: {$approverTitle}" . ($approverName ? " ({$approverName})" : "");
            } else {
                $currentStatusDesc = "في انتظار المراجعة (الإدارة)";
                $chain[] = [
                    'level' => 'admin_fallback',
                    'level_name' => 'الإدارة',
                    'approver_id' => null,
                    'approver_name' => 'مدير النظام',
                    'approval_status' => 'pending'
                ];
            }

            // 7. Prepare Data for Save
            $dataToStore = [
                'user_id' => $userId,
                'employee_id' => $employeeId,
                'request_number' => $requestNumber,
                'request_date' => $requestDate,
                'start_time' => $start->format('H:i:s'),
                'end_time' => $end->format('H:i:s'),
                'duration_minutes' => $newDuration,
                'reason' => $requestData['reason'] ?? null,
                'status' => $initialStatus,
                'approval_chain' => json_encode($chain, JSON_UNESCAPED_UNICODE),
                'current_level_idx' => $currentLevelIdx,
                'current_status_desc' => $currentStatusDesc,
                'current_stage_role_id' => $managerRoleId, 
            ];

            $storedRequest = parent::store($dataToStore);

            if (isset($storedRequest['error']) && $storedRequest['error']) {
                return $storedRequest;
            }

            return [
                'success' => true,
                'message' => 'تم تقديم طلب الاستئذان بنجاح',
                'data' => $storedRequest
            ];

        } catch (Exception $e) {
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
     * Custom Actions (Approve/Reject)
     */
    public function customAction($id, $action, $data = null) {
        $data = $data ?: json_decode(file_get_contents('php://input'), true);
        
        switch ($action) {
            case 'approve':
                return $this->approve($id, $data);
            case 'reject':
                return $this->reject($id, $data);
            default:
                return parent::customAction($id, $action, $data);
        }
    }

    private function approve($id, $data) {
        // Use authenticated user in real scenario
        $currentUser = [
            'id' => $data['approver_id'] ?? 'admin',
            'name' => $data['approver_name'] ?? 'System Admin',
            'role' => 'admin' 
        ];

        $service = new ApprovalService($this->db, $currentUser);
        $forceFinal = isset($data['force_final']) && $data['force_final'] == true;
        
        $result = $service->process($this->table, $id, 'approve', $data['notes'] ?? null, $forceFinal);

        if ($result['success']) {
            return $this->show($id);
        } else {
            return ['error' => true, 'message' => $result['error']];
        }
    }
    
    private function reject($id, $data) {
        $currentUser = [
            'id' => $data['approver_id'] ?? 'admin',
            'name' => $data['approver_name'] ?? 'System Admin',
            'role' => 'admin'
        ];

        $service = new ApprovalService($this->db, $currentUser);
        $result = $service->process($this->table, $id, 'reject', $data['notes'] ?? null);

        if ($result['success']) {
            return $this->show($id);
        } else {
            return ['error' => true, 'message' => $result['error']];
        }
    }
}
