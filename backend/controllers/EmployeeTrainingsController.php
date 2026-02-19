<?php
/**
 * Employee Trainings Controller
 */

require_once __DIR__ . '/BaseController.php';

if (!class_exists('EmployeeTrainingsController')) {
    class EmployeeTrainingsController extends BaseController {
        // Correct table name for employee enrollments
        protected $table = 'employee_trainings';
        
        // Updated fillable fields to include Approval Chain
        protected $fillable = [
            'id', 'request_number', 'employee_id', 'training_id', 
            'start_date', 'end_date', 'approval_status', 'status', 
            'requires_finance_approval', 'notes',
            'approval_chain', 'current_level_idx', 'current_status_desc', 'approval_history'
        ];
        
        // Default Sort field (fix 500 error on sort)
        protected $defaultSort = 'created_at';

        public function store($data) {
            try {
                // Auto-generate Request Number if missing
                if (empty($data['request_number'])) {
                    $data['request_number'] = $this->generateRequestNumber('TRN');
                }
                
                // Default approval status
                if (empty($data['approval_status'])) {
                    $data['approval_status'] = 'pending';
                }

                return parent::store($data);
            } catch (Exception $e) {
                error_log("EmployeeTrainingsController::store Error: " . $e->getMessage());
                return ['error' => true, 'message' => $e->getMessage()];
            }
        }

        // Custom Actions for Approval
        // NOTE: $action comes from URL like /employee-trainings/ID/approve
        public function customAction($id, $action, $data = null) {
            // Debug Log
            error_log("EmployeeTrainingsController::customAction called with ID: $id, Action: $action");

            if ($action === 'approve' || $action === 'reject') {
                require_once __DIR__ . '/../services/ApprovalService.php';
                $currentUser = [
                    'id' => $data['approver_id'] ?? 'admin',
                    'name' => $data['approver_name'] ?? 'System Admin',
                    'role' => 'admin'
                ];
                $service = new ApprovalService($this->db, $currentUser);
                $result = $service->process($this->table, $id, $action, $data['notes'] ?? null);
                
                if ($result['success']) {
                    // Update approval_status explicitly
                    if ($result['new_status']) {
                        $this->update($id, ['approval_status' => $result['new_status']]);
                    }
                    return $this->show($id);
                }
                return ['error' => true, 'message' => $result['error']];
            }
            
            // Allow parent logic OR return explicit error (BaseController returns 405)
            // But we must NOT return 405 for approve/reject.
            // Since we handled approve/reject above, anything else IS invalid for this custom action.
            
            // IMPORTANT: If we call parent::customAction, it might return array OR set headers.
            // Let's avoid parent call unless we implement specific logic.
            return ['error' => true, 'message' => "Action $action not supported for EmployeeTrainings"];
        }

        private function generateRequestNumber($prefix) {
            try {
                $year = date('Y');
                // Ensure table name is safe
                $table = $this->table;
                $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM `$table` WHERE YEAR(created_at) = :year");
                $stmt->execute([':year' => $year]);
                $row = $stmt->fetch();
                $count = ($row['count'] ?? 0) + 1;
                return $prefix . '-' . $year . '-' . str_pad($count, 5, '0', STR_PAD_LEFT);
            } catch (Exception $e) {
                error_log("GenerateRequestNumber Error: " . $e->getMessage());
                // Fallback random number if DB fails
                return $prefix . '-' . date('Y') . '-' . rand(1000, 9999);
            }
        }
    }
}
