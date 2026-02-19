<?php
/**
 * Leaves (Leave Requests) Controller
 */

require_once __DIR__ . '/BaseController.php';

class LeavesController extends BaseController {
    protected $table = 'leave_requests';
    
    protected $fillable = [
        'request_number', 'employee_id', 'leave_type_id',
        'start_date', 'end_date', 'days_count', 'reason', 'document_url',
        'status', 'current_approval_level', 'approval_history', 'requires_finance_approval',
        'approval_chain', 'current_level_idx', 'current_status_desc'
    ];
    
    protected $searchable = ['request_number'];
    protected $defaultSort = 'created_at';
    
    /**
     * Override to include employee and leave type names
     */
    public function index() {
        $params = getQueryParams();
        
        $sql = "SELECT lr.*, e.full_name as employee_name, e.employee_number,
                       lt.name as leave_type_name
                FROM leave_requests lr
                LEFT JOIN employees e ON lr.employee_id = e.id
                LEFT JOIN leave_types lt ON lr.leave_type_id = lt.id
                WHERE 1=1";
        
        $queryParams = [];
        
        if (!empty($params['status'])) {
            $sql .= " AND lr.status = :status";
            $queryParams[':status'] = $params['status'];
        }
        
        if (!empty($params['employee_id'])) {
            $sql .= " AND lr.employee_id = :employee_id";
            $queryParams[':employee_id'] = $params['employee_id'];
        }
        
        $sql .= " ORDER BY lr.created_at DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($queryParams);
        $data = $stmt->fetchAll();
        
        return ['data' => array_map([$this, 'processRow'], $data)];
    }
    
    /**
     * Auto-calculate days and generate request number
     */
    public function store($data) {
        // Generate request number
        if (empty($data['request_number'])) {
            $data['request_number'] = $this->generateRequestNumber('LV');
        }
        
        // Calculate days count
        if (!empty($data['start_date']) && !empty($data['end_date'])) {
            $start = new DateTime($data['start_date']);
            $end = new DateTime($data['end_date']);
            $diff = $start->diff($end);
            $data['days_count'] = $diff->days + 1;
        }
        
        return parent::store($data);
    }
    
    /**
     * Custom actions
     */
    public function customAction($id, $action, $data = null) {
        switch ($action) {
            case 'approve':
                return $this->approve($id, $data);
            case 'reject':
                return $this->reject($id, $data);
            default:
                parent::customAction($id, $action, $data);
        }
    }
    
    private function approve($id, $data) {
        require_once __DIR__ . '/../services/ApprovalService.php';
        
        // Mock User (In real app, fetch from session/auth)
        $currentUser = [
            'id' => $data['approver_id'] ?? 'admin',
            'name' => $data['approver_name'] ?? 'System Admin',
            'role' => 'admin' // Force Admin role for testing
        ];

        $service = new ApprovalService($this->db, $currentUser);
        
        // Check if Admin wants "Force Approve" (skip steps)
        $forceFinal = isset($data['force_final']) && $data['force_final'] == true;
        
        $result = $service->process($this->table, $id, 'approve', $data['notes'] ?? null, $forceFinal);

        if ($result['success']) {
            // Update leave balance ONLY if fully approved
            if ($result['new_status'] === 'approved') {
                $leave = $this->show($id);
                $this->updateLeaveBalance($leave['employee_id'], $leave['leave_type_id'], $leave['days_count']);
            }
            return $this->show($id);
        } else {
            return ['error' => true, 'message' => $result['error']];
        }
    }
    
    private function reject($id, $data) {
        require_once __DIR__ . '/../services/ApprovalService.php';
        
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
    
    private function updateLeaveBalance($employeeId, $leaveTypeId, $daysUsed) {
        $year = date('Y');
        
        // Check if balance exists
        $stmt = $this->db->prepare("
            SELECT id, used_balance, remaining_balance FROM employee_leave_balances 
            WHERE employee_id = :eid AND leave_type_id = :ltid AND year = :year
        ");
        $stmt->execute([':eid' => $employeeId, ':ltid' => $leaveTypeId, ':year' => $year]);
        $balance = $stmt->fetch();
        
        if ($balance) {
            $stmt = $this->db->prepare("
                UPDATE employee_leave_balances 
                SET used_balance = used_balance + :days,
                    remaining_balance = remaining_balance - :days
                WHERE id = :id
            ");
            $stmt->execute([':days' => $daysUsed, ':id' => $balance['id']]);
        } else {
            // Auto-create balance record if not exists
            // First get default balance from leave type
            $stmt = $this->db->prepare("SELECT default_balance FROM leave_types WHERE id = :id");
            $stmt->execute([':id' => $leaveTypeId]);
            $type = $stmt->fetch();
            
            $defaultBalance = $type ? $type['default_balance'] : 0;
            
            $this->db->prepare("
                INSERT INTO employee_leave_balances 
                (id, employee_id, leave_type_id, year, total_balance, used_balance, remaining_balance, created_at)
                VALUES (UUID(), :eid, :ltid, :year, :total, :used, :remaining, NOW())
            ")->execute([
                ':eid' => $employeeId,
                ':ltid' => $leaveTypeId,
                ':year' => $year,
                ':total' => $defaultBalance,
                ':used' => $daysUsed,
                ':remaining' => $defaultBalance - $daysUsed
            ]);
        }
    }
    
    private function generateRequestNumber($prefix) {
        $year = date('Y');
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM {$this->table} WHERE YEAR(created_at) = :year");
        $stmt->execute([':year' => $year]);
        $count = $stmt->fetch()['count'] + 1;
        return $prefix . '-' . $year . '-' . str_pad($count, 5, '0', STR_PAD_LEFT);
    }
}
