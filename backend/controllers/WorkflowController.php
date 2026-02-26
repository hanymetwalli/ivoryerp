<?php
/**
 * WorkflowController - إدارة عمليات سير العمل المتقدمة
 */

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../services/WorkflowService.php';

class WorkflowController extends BaseController {

    /**
     * تنفيذ إجراءات مخصصة لسير العمل
     */
    public function customAction($id, $action, $data = null) {
        $data = $data ?: json_decode(file_get_contents('php://input'), true);
        $userId = $data['user_id'] ?? null;

        error_log("📡 WorkflowController::customAction - ID: $id, Action: $action, UserID: $userId");

        if (!$userId) {
            error_log("❌ WorkflowController: Missing user_id");
            http_response_code(400);
            return ['error' => true, 'message' => 'user_id مطلوب'];
        }

        try {
            if ($action === 'get-chain' || $action === 'get_chain') {
                $workflowService = new WorkflowService();
                return $workflowService->getRequestSteps($id);
            }

            // التحقق من صلاحية "الاعتماد النهائي الاستثنائي" للإجراءات التالية
            $hasPerm = $this->hasPermission($userId, 'force_approve');
            error_log("🔑 WorkflowController: Permission 'force_approve' for user $userId: " . ($hasPerm ? 'YES' : 'NO'));
            
            if (!$hasPerm) {
                http_response_code(403);
                return ['error' => true, 'message' => 'ليس لديك صلاحية الاعتماد النهائي الاستثنائي'];
            }

            if ($action === 'force-approve' || $action === 'force_approve') {
                error_log("⚡ WorkflowController: Initiating forceApprove for ID: $id");
                $workflowService = new WorkflowService();
                $result = $workflowService->forceApprove($id, $userId);
                error_log("✅ WorkflowController: forceApprove result: " . json_encode($result));
                return $result;
            }

            error_log("❓ WorkflowController: Unknown action '$action'");
            http_response_code(404);
            return ['error' => true, 'message' => 'Action not found: ' . $action];

        } catch (Exception $e) {
            error_log("💥 WorkflowController Exception: " . $e->getMessage());
            http_response_code(500);
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }

    /**
     * التحقق من امتلاك المستخدم لصلاحية معينة بناءً على أدواره
     */
    private function hasPermission($userId, $permissionName) {
        // Live database query to ensure real-time accuracy
        // We join users, user_roles, and roles. 
        // Note: 'users' table doesn't have a direct 'role' column in this schema, 
        // roles are managed via 'user_roles' joining 'roles'.
        $stmt = $this->db->prepare("
            SELECT r.name, r.permissions 
            FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = :uid AND ur.status = 'active' AND r.status = 'active'
        ");
        $stmt->execute([':uid' => $userId]);
        $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($roles as $role) {
            // 1. Admin/SuperAdmin override
            if ($role['name'] === 'admin' || $role['name'] === 'super_admin') {
                return true;
            }

            // 2. Check JSON permissions
            $permissionsData = $role['permissions'];
            $permissions = [];
            
            if (is_array($permissionsData)) {
                $permissions = $permissionsData;
            } else if (is_string($permissionsData) && !empty($permissionsData)) {
                $permissions = json_decode($permissionsData, true) ?: [];
            }
            
            // Check for wildcard '*' or specific permission
            if (in_array('*', $permissions) || in_array($permissionName, $permissions) || in_array(str_replace('_', '-', $permissionName), $permissions)) {
                return true;
            }
        }

        return false;
    }
}
