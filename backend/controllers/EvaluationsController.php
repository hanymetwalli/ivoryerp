<?php
/**
 * Evaluations Controller (Performance)
 */

require_once __DIR__ . '/BaseController.php';

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

        // Fix Status Truncation
        // Ensure status is valid and not a full object or description
        if (isset($data['status'])) {
            if (is_array($data['status'])) {
                $data['status'] = $data['status']['value'] ?? 'draft';
            }
            if (strlen($data['status']) > 50) {
                 $data['status'] = substr($data['status'], 0, 50);
            }
        }
        
        return parent::store($data);
    }
    
    public function update($id, $data) {
        // Fix Status Truncation during Update
        if (isset($data['status'])) {
            if (is_array($data['status'])) {
                $data['status'] = $data['status']['value'] ?? 'draft';
            }
            // Ensure we don't accidentally save a description into status
            if (strpos($data['status'], ' ') !== false && strlen($data['status']) > 20) {
                // Suspicious long status with spaces, likely a description
                // Ignore it or map it
            }
            if (strlen($data['status']) > 50) {
                 $data['status'] = substr($data['status'], 0, 50);
            }
        }
        return parent::update($id, $data);
    }

    // Custom Actions for Approval
    public function customAction($id, $action, $data = null) {
        if ($action === 'approve' || $action === 'reject') {
            require_once __DIR__ . '/../services/ApprovalService.php';
            $currentUser = [
                'id' => $data['approver_id'] ?? 'admin',
                'name' => $data['approver_name'] ?? 'System Admin',
                'role' => 'admin'
            ];
            $service = new ApprovalService($this->db, $currentUser);
            $result = $service->process($this->table, $id, $action, $data['notes'] ?? null);
            
            if ($result['success']) return $this->show($id);
            return ['error' => true, 'message' => $result['error']];
        }
        return parent::customAction($id, $action, $data);
    }
    
    private function generateRequestNumber($prefix) {
        $year = date('Y');
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM {$this->table} WHERE YEAR(created_at) = :year");
        $stmt->execute([':year' => $year]);
        $count = $stmt->fetch()['count'] + 1;
        return $prefix . '-' . $year . '-' . str_pad($count, 5, '0', STR_PAD_LEFT);
    }
}
