<?php
/**
 * ApprovalsController - إدارة الموافقات والاعتمادات
 */

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../services/WorkflowService.php';

class ApprovalsController extends BaseController {
    
    /**
     * جلب الطلبات المعلقة للمستخدم الحالي
     */
    public function index() {
        $params = getQueryParams();
        $userId = $params['user_id'] ?? null;

        if (!$userId) {
            http_response_code(400);
            return ['error' => true, 'message' => 'userId مطلوب'];
        }

        // 1. جلب أدوار المستخدم
        $stmt = $this->db->prepare("SELECT role_id FROM user_roles WHERE user_id = :uid AND status = 'active'");
        $stmt->execute([':uid' => $userId]);
        $userRoles = $stmt->fetchAll(PDO::FETCH_COLUMN);

        // 2. بناء الاستعلام لجلب الخطوات المعلقة
        // يفضل جلب الخطوة الحالية فقط (أصغر step_order غير مكتمل للطلب)
        // لكن للتبسيط ولأن المعتمدين قد يكونوا أدوار، سنجلب كل pending يخص المستخدم أو أدواره
        
        $sql = "SELECT s.*, 
                       r.model_type, r.model_id, r.status as request_status, r.created_at as request_created_at
                FROM approval_steps s
                JOIN approval_requests r ON s.approval_request_id = r.id
                WHERE s.status = 'pending' 
                AND r.status = 'pending'
                AND (s.approver_user_id = ?";
        
        if (!empty($userRoles)) {
            $rolePlaceholders = implode(',', array_fill(0, count($userRoles), '?'));
            $sql .= " OR s.role_id IN ($rolePlaceholders)";
            // سنضيف قيم الأدوار لاحقاً للمتغيرات
        }
        
        $sql .= ")";

        // التحقق من أن هذه الخطوة هي الخطوة الحالية (لا توجد خطوة قبلها لم تكتمل)
        $sql .= " AND s.step_order = (
                    SELECT MIN(step_order) 
                    FROM approval_steps 
                    WHERE approval_request_id = s.approval_request_id 
                    AND status = 'pending'
                  )";

        $stmt = $this->db->prepare($sql);
        
        // ربط المعاملات
        $stmt->bindValue(1, $userId);
        if (!empty($userRoles)) {
            foreach ($userRoles as $i => $roleId) {
                // الفهرس يبدأ من 2 لأن أول معلمة هي userId
                $stmt->bindValue($i + 2, $roleId);
            }
        }
        
        $stmt->execute();
        $steps = $stmt->fetchAll();

        // 3. إثراء البيانات بتفاصيل الموديل الأصلي (مثل بيانات الاستئذان)
        foreach ($steps as &$step) {
            $step['details'] = $this->getModelDetails($step['model_type'], $step['model_id']);
        }

        return ['data' => $steps];
    }

    /**
     * تنفيذ إجراء (اعتماد/رفض/إرجاع)
     */
    public function customAction($id, $action, $data = null) {
        if ($action === 'process') {
            $data = $data ?: json_decode(file_get_contents('php://input'), true);
            $entityName = $data['entity_name'] ?? null;
            $entityId = $data['entity_id'] ?? null;
            $userId = $data['user_id'] ?? $data['approver_id'] ?? null;
            $stepAction = $data['action'] ?? null;
            $comments = $data['notes'] ?? $data['comments'] ?? '';

            if (!$entityName || !$entityId || !$userId || !$stepAction) {
                http_response_code(400);
                return ['error' => true, 'message' => 'بيانات ناقصة (entity_name, entity_id, approver_id, action مطلوبين)'];
            }

            // Find the pending step for this entity
            $sql = "SELECT s.id 
                    FROM approval_steps s
                    JOIN approval_requests r ON s.approval_request_id = r.id
                    WHERE (r.model_type = :mtype OR r.model_type = :mtype2) 
                    AND r.model_id = :mid AND s.status = 'pending'
                    ORDER BY s.step_order ASC LIMIT 1";
            
            // Map common entity names to model types if different
            $mtype2 = $entityName;
            if ($entityName === 'employee_violations') $mtype2 = 'EmployeeViolation';
            if ($entityName === 'overtime') $mtype2 = 'OvertimeReport';

            $stmt = $this->db->prepare($sql);
            $stmt->execute([':mtype' => $entityName, ':mtype2' => $mtype2, ':mid' => $entityId]);
            $step = $stmt->fetch();

            if (!$step) {
                http_response_code(404);
                return ['error' => true, 'message' => 'لا يوجد خطوة معلقة لهذا الطلب أو تم اعتماده/رفضه بالفعل'];
            }

            try {
                $workflowService = new WorkflowService();
                $result = $workflowService->processAction($step['id'], $userId, $stepAction, $comments);
                return $result;
            } catch (Exception $e) {
                http_response_code(500);
                return ['error' => true, 'message' => $e->getMessage()];
            }
        }

        if ($action !== 'submit') {
            return parent::customAction($id, $action, $data);
        }

        $data = $data ?: json_decode(file_get_contents('php://input'), true);
        $userId = $data['user_id'] ?? null;
        $stepAction = $data['action'] ?? null; // approved, rejected, returned
        $comments = $data['comments'] ?? '';

        if (!$userId || !$stepAction) {
            http_response_code(400);
            return ['error' => true, 'message' => 'بيانات ناقصة (user_id, action مطلوبين)'];
        }

        try {
            $workflowService = new WorkflowService();
            $result = $workflowService->processAction($id, $userId, $stepAction, $comments);
            return $result;
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }

    /**
     * جلب تفاصيل الموديل المرتبط (مثلاً طلب استئذان)
     */
    private function getModelDetails($modelType, $modelId) {
        if ($modelType === 'permission_requests') {
            $sql = "SELECT pr.*, e.full_name as employee_name
                    FROM permission_requests pr
                    LEFT JOIN employees e ON pr.employee_id = e.id
                    WHERE pr.id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $modelId]);
            return $stmt->fetch();
        } elseif ($modelType === 'leave_requests') {
            $sql = "SELECT lr.*, e.full_name as employee_name, lt.name as leave_type_name
                    FROM leave_requests lr
                    LEFT JOIN employees e ON lr.employee_id = e.id
                    LEFT JOIN leave_types lt ON lr.leave_type_id = lt.id
                    WHERE lr.id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $modelId]);
            return $stmt->fetch();
        } elseif ($modelType === 'overtime' || $modelType === 'OvertimeReport') {
            $sql = "SELECT ot.*, ot.date as request_date, e.full_name as employee_name
                    FROM overtime ot
                    LEFT JOIN employees e ON ot.employee_id = e.id
                    WHERE ot.id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $modelId]);
            return $stmt->fetch();
        } elseif ($modelType === 'bonuses') {
            $sql = "SELECT b.*, e.full_name as employee_name
                    FROM bonuses b
                    LEFT JOIN employees e ON b.employee_id = e.id
                    WHERE b.id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $modelId]);
            return $stmt->fetch();
        } elseif ($modelType === 'employee_trainings') {
            $sql = "SELECT et.*, e.full_name as employee_name, t.name as training_name,
                           COALESCE(et.request_date, et.created_at) as request_date
                    FROM employee_trainings et
                    LEFT JOIN employees e ON et.employee_id = e.id
                    LEFT JOIN trainings t ON et.training_id = t.id
                    WHERE et.id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $modelId]);
            return $stmt->fetch();
        } elseif ($modelType === 'EmployeeViolation') {
            $sql = "SELECT ev.*, e.full_name as employee_name, ev.id as request_number
                    FROM employee_violations ev
                    LEFT JOIN employees e ON ev.employee_id = e.id
                    WHERE ev.id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $modelId]);
            return $stmt->fetch();
        } elseif ($modelType === 'contracts') {
            $sql = "SELECT c.*, e.full_name as employee_name, c.created_at as request_date
                    FROM contracts c
                    LEFT JOIN employees e ON c.employee_id = e.id
                    WHERE c.id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $modelId]);
            return $stmt->fetch();
        } elseif ($modelType === 'resignations' || $modelType === 'ResignationRequest') {
            $sql = "SELECT r.*, e.full_name as employee_name, r.resignation_date as request_date
                    FROM resignations r
                    LEFT JOIN employees e ON r.employee_id = e.id
                    WHERE r.id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $modelId]);
            return $stmt->fetch();
        }
        
        // يمكن إضافة أنواع أخرى لاحقاً (رواتب، إلخ)
        try {
            $stmt = $this->db->prepare("SELECT * FROM `$modelType` WHERE id = :id");
            $stmt->execute([':id' => $modelId]);
            return $stmt->fetch();
        } catch (Exception $e) {
            return null;
        }
    }
}
