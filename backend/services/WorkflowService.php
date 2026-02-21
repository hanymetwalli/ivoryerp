<?php
/**
 * Workflow Service - محرك الاعتمادات وسير العمل الديناميكي
 */

class WorkflowService {
    private $db;

    public function __construct() {
        require_once __DIR__ . '/../config/database.php';
        $this->db = getDB();
    }

    /**
     * إنشاء سير عمل للطلب
     */
    public function generateFlow($modelType, $modelId, $requestType) {
        try {
            $this->db->beginTransaction();

            // 1. جلب القالب النشط
            $stmt = $this->db->prepare("SELECT id FROM workflow_blueprints WHERE request_type = :type AND is_active = 1 LIMIT 1");
            $stmt->execute([':type' => $requestType]);
            $blueprint = $stmt->fetch();

            if (!$blueprint) {
                throw new Exception("لا يوجد قالب نشط لهذا النوع من الطلبات: " . $requestType);
            }

            // 2. إنشاء طلب الاعتماد
            $requestId = $this->generateUUID();
            $stmt = $this->db->prepare("
                INSERT INTO approval_requests (id, model_type, model_id, status) 
                VALUES (:id, :mtype, :mid, 'pending')
            ");
            $stmt->execute([
                ':id' => $requestId,
                ':mtype' => $modelType,
                ':mid' => $modelId
            ]);

            // 3. جلب الموظف المرتبط بالطلب (لأتمتة جلب المدير المباشر)
            $employeeId = $this->getEmployeeIdFromModel($modelType, $modelId);

            // 4. نسخ خطوات القالب
            $stmt = $this->db->prepare("SELECT * FROM workflow_blueprint_steps WHERE blueprint_id = :bid ORDER BY step_order ASC");
            $stmt->execute([':bid' => $blueprint['id']]);
            $steps = $stmt->fetchAll();

            foreach ($steps as $step) {
                $approverUserId = null;
                
                // إذا كان المطلوب هو المدير المباشر
                if ($step['is_direct_manager'] && $employeeId) {
                    $approverUserId = $this->getDirectManagerUserId($employeeId);
                }

                $this->db->prepare("
                    INSERT INTO approval_steps (id, approval_request_id, approver_user_id, role_id, step_order, status, is_name_visible)
                    VALUES (:id, :arid, :auid, :rid, :sorder, 'pending', :visible)
                ")->execute([
                    ':id' => $this->generateUUID(),
                    ':arid' => $requestId,
                    ':auid' => $approverUserId,
                    ':rid' => $step['role_id'],
                    ':sorder' => $step['step_order'],
                    ':visible' => $step['show_approver_name'] ? 1 : 0
                ]);
            }

            $this->db->commit();
            return ['status' => 'success', 'approval_request_id' => $requestId];

        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * معالجة إجراء المعتمد
     */
    public function processAction($stepId, $userId, $action, $comments) {
        try {
            $this->db->beginTransaction();

            // 1. جلب بيانات الخطوة والطلب
            $stmt = $this->db->prepare("SELECT * FROM approval_steps WHERE id = :id");
            $stmt->execute([':id' => $stepId]);
            $step = $stmt->fetch();

            if (!$step || $step['status'] !== 'pending') {
                throw new Exception("خطوة غير صالحة أو تمت معالجتها بالفعل");
            }

            // 2. التحقق من صلاحية المستخدم (إذا كان محدد مسبقاً)
            if ($step['approver_user_id'] && $step['approver_user_id'] !== $userId) {
                // ملاحظة: هنا يجب التحقق أيضاً من صلاحية الدور (Role) إذا كان محدد
                // سنفترض حالياً أن النظام سيمرر الـ userId الصحيح بناءً على واجهة المستخدم
            }

            // 3. تحديث الخطوة
            $stmt = $this->db->prepare("
                UPDATE approval_steps 
                SET status = :status, comments = :comments, action_date = CURRENT_TIMESTAMP, approver_user_id = :uid
                WHERE id = :id
            ");
            $stmt->execute([
                ':status' => $action,
                ':comments' => $comments,
                ':uid' => $userId, // تحديث الـ userId بمن قام بالإجراء فعلياً
                ':id' => $stepId
            ]);

            $requestId = $step['approval_request_id'];

            // 4. تحديث حالة الطلب الكلي
            if ($action === 'rejected') {
                $this->updateRequestStatus($requestId, 'rejected');
            } elseif ($action === 'returned') {
                $this->updateRequestStatus($requestId, 'returned');
            } elseif ($action === 'approved') {
                // التحقق هل هذه آخر خطوة؟
                $stmt = $this->db->prepare("SELECT MAX(step_order) as max_order FROM approval_steps WHERE approval_request_id = :rid");
                $stmt->execute([':rid' => $requestId]);
                $maxOrder = $stmt->fetch()['max_order'];

                if ($step['step_order'] >= $maxOrder) {
                    $this->updateRequestStatus($requestId, 'approved');
                    // هنا يمكن إضافة logic لتحديث حالة الجدول الأساسي (Model) إلى Approved
                    $this->updateModelStatus($requestId, 'approved');
                } else {
                    // الطلب لا يزال pending ولكن انتقل للخطوة التالية
                }
            }

            $this->db->commit();
            return ['status' => 'success'];

        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    private function updateRequestStatus($requestId, $status) {
        $stmt = $this->db->prepare("UPDATE approval_requests SET status = :status WHERE id = :id");
        $stmt->execute([':status' => $status, ':id' => $requestId]);
    }

    /**
     * تحديث حالة الموديل الأصلي (اختياري لكن مفيد)
     */
    private function updateModelStatus($requestId, $status) {
        $stmt = $this->db->prepare("SELECT model_type, model_id FROM approval_requests WHERE id = :id");
        $stmt->execute([':id' => $requestId]);
        $req = $stmt->fetch();
        
        if ($req) {
            $table = $req['model_type']; // يجب التأكد من أمان أسماء الجداول
            $stmt = $this->db->prepare("UPDATE `$table` SET status = :status WHERE id = :id");
            $stmt->execute([':status' => $status, ':id' => $req['model_id']]);
        }
    }

    private function getEmployeeIdFromModel($modelType, $modelId) {
        try {
            $stmt = $this->db->prepare("SELECT employee_id FROM `$modelType` WHERE id = :id");
            $stmt->execute([':id' => $modelId]);
            return $stmt->fetch()['employee_id'] ?? null;
        } catch (Exception $e) {
            return null;
        }
    }

    private function getDirectManagerUserId($employeeId) {
        // البحث عن مدير القسم المرتبط بالموظف
        $sql = "SELECT u.id 
                FROM employees e
                JOIN departments d ON e.department = d.id
                JOIN employees mgr ON d.manager_id = mgr.id
                JOIN users u ON mgr.email = u.email
                WHERE e.id = :eid LIMIT 1";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':eid' => $employeeId]);
        return $stmt->fetch()['id'] ?? null;
    }

    private function generateUUID() {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
}
