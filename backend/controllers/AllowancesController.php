<?php
/**
 * Allowances Controller
 */

require_once __DIR__ . '/BaseController.php';

class AllowancesController extends BaseController {
    protected $table = 'allowances';
    
    protected $fillable = [
        'id', 'employee_id', 'type', 'amount', 'currency',
        'start_date', 'end_date', 'is_recurring', 'status', 'reason', 'approved_by'
    ];
    
    public function index() {
        $params = getQueryParams();
        
        $sql = "SELECT a.*, e.full_name as employee_name, e.employee_number
                FROM allowances a
                LEFT JOIN employees e ON a.employee_id = e.id
                WHERE 1=1";
        
        $queryParams = [];
        
        if (!empty($params['employee_id'])) {
            $sql .= " AND a.employee_id = :employee_id";
            $queryParams[':employee_id'] = $params['employee_id'];
        }
        
        if (!empty($params['status'])) {
            $sql .= " AND a.status = :status";
            $queryParams[':status'] = $params['status'];
        }
        
        $sql .= " ORDER BY a.created_at DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($queryParams);
        
        return ['data' => $stmt->fetchAll()];
    }
}
