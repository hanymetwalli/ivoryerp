<?php
/**
 * Workflow Settings Controller - إعدادات مسارات الاعتماد
 */

require_once __DIR__ . '/BaseController.php';

class WorkflowSettingsController extends BaseController {
    protected $table = 'workflow_blueprints';
    
    protected $fillable = ['id', 'request_type', 'is_active'];

    public function index() {
        $blueprints = parent::index();
        
        foreach ($blueprints['data'] as &$blueprint) {
            $stmt = $this->db->prepare("SELECT * FROM workflow_blueprint_steps WHERE blueprint_id = :bid ORDER BY step_order ASC");
            $stmt->execute([':bid' => $blueprint['id']]);
            $steps = $stmt->fetchAll();
            
            foreach ($steps as &$step) {
                if ($step['is_direct_manager']) {
                    $step['approver_type'] = 'manager';
                } elseif (isset($step['is_dept_manager']) && $step['is_dept_manager']) {
                    $step['approver_type'] = 'department_manager';
                } else {
                    $step['approver_type'] = 'role';
                }
            }
            $blueprint['steps'] = $steps;
        }
        
        return $blueprints;
    }

    public function customAction($id, $action, $data = null) {
        switch ($action) {
            case 'save':
                return $this->saveWorkflow($data);
            default:
                return parent::customAction($id, $action, $data);
        }
    }

    private function saveWorkflow($data) {
        $requestType = $data['request_type'] ?? null;
        $steps = $data['steps'] ?? [];

        if (!$requestType) {
            throw new Exception("نوع الطلب مطلوب");
        }

        try {
            $this->db->beginTransaction();

            // 1. Find or create blueprint
            $stmt = $this->db->prepare("SELECT id FROM workflow_blueprints WHERE request_type = :type LIMIT 1");
            $stmt->execute([':type' => $requestType]);
            $blueprint = $stmt->fetch();

            if ($blueprint) {
                $blueprintId = $blueprint['id'];
                // Update active status if provided
                if (isset($data['is_active'])) {
                    $this->db->prepare("UPDATE workflow_blueprints SET is_active = :active WHERE id = :id")
                             ->execute([':active' => $data['is_active'] ? 1 : 0, ':id' => $blueprintId]);
                }
            } else {
                $blueprintId = $this->generateUUID();
                $this->db->prepare("INSERT INTO workflow_blueprints (id, request_type, is_active) VALUES (:id, :type, 1)")
                         ->execute([':id' => $blueprintId, ':type' => $requestType]);
            }

            // 2. Delete old steps
            $this->db->prepare("DELETE FROM workflow_blueprint_steps WHERE blueprint_id = :bid")
                     ->execute([':bid' => $blueprintId]);

            // 3. Insert new steps
            $order = 1;
            foreach ($steps as $step) {
                $this->db->prepare("
                    INSERT INTO workflow_blueprint_steps 
                    (id, blueprint_id, step_order, role_id, is_direct_manager, is_dept_manager, show_approver_name) 
                    VALUES (:id, :bid, :order, :rid, :mgr, :dept_mgr, :show)
                ")->execute([
                    ':id' => $this->generateUUID(),
                    ':bid' => $blueprintId,
                    ':order' => $order++,
                    ':rid' => $step['role_id'] ?? null,
                    ':mgr' => ($step['approver_type'] === 'manager') ? 1 : 0,
                    ':dept_mgr' => ($step['approver_type'] === 'department_manager') ? 1 : 0,
                    ':show' => $step['show_approver_name'] ? 1 : 0
                ]);
            }

            $this->db->commit();
            return ['status' => 'success', 'message' => 'تم حفظ المسار بنجاح'];

        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
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
